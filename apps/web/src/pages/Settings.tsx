import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { pickModelId } from "@/lib/settings-ui";
import {
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABEL_KEY,
} from "@/lib/vendor-categories";
import { apiGet, apiPut } from "@/api/client";
import type {
  ConfigResponse,
  KeysResponse,
  KeysUpdateResponse,
  MaskedKey,
  ModelsForProviderResponse,
  Settings as SettingsT,
} from "@helm-agents/contracts";

const CUSTOM_PROVIDERS = new Set(["openai_compatible", "anthropic_compatible"]);
function isCustom(provider?: string): boolean {
  return !!provider && CUSTOM_PROVIDERS.has(provider);
}

// Shared form control styling (design system: mono, dark, cyan focus).
const inputCls =
  "w-full rounded border border-zinc-700 bg-helm-base px-3 py-2.5 font-mono text-sm text-helm-text outline-none transition-colors focus:border-helm-accent";

type Tab = "model" | "key" | "data" | "adv";

export function Settings() {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [keys, setKeys] = useState<MaskedKey[]>([]);
  const [keyDraft, setKeyDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<SettingsT>({});
  const [iface, setIface] = useState<"openai" | "anthropic">("openai");
  const [customOnly, setCustomOnly] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("model");
  // 防竞态：快速切换 provider 时，丢弃后到的旧请求结果。
  const modelsReq = useRef(0);

  async function loadModels(provider: string) {
    const seq = ++modelsReq.current;
    const [deep, quick] = await Promise.all([
      apiGet<ModelsForProviderResponse>(`/models?provider=${provider}&mode=deep`),
      apiGet<ModelsForProviderResponse>(`/models?provider=${provider}&mode=quick`),
    ]);
    if (seq !== modelsReq.current) return; // 已有更新的请求发出，本次结果作废
    const deepModels = deep.models ?? [];
    const quickModels = quick.models ?? [];
    setConfig((c) => (c ? { ...c, deepModels, quickModels } : c));
    setCustomOnly(isCustom(provider) || !!deep.customOnly || deepModels.length === 0);
    setSaving((s) => ({
      ...s,
      deepThinkLlm: pickModelId(s.deepThinkLlm, deepModels),
      quickThinkLlm: pickModelId(s.quickThinkLlm, quickModels),
    }));
  }

  async function load() {
    const json = await apiGet<ConfigResponse>("/config");
    setConfig(json);
    const provider = json.settings.llmProvider ?? json.defaults.llmProvider;
    const entry = json.providers.find((p) => p.name === provider);
    setIface(entry?.interface ?? "openai");
    setCustomOnly(isCustom(provider) || json.deepModels.length === 0);
    setSaving({
      ...json.settings,
      deepThinkLlm: pickModelId(json.settings.deepThinkLlm, json.deepModels),
      quickThinkLlm: pickModelId(json.settings.quickThinkLlm, json.quickModels),
    });
    const kres = await apiGet<KeysResponse>("/keys");
    setKeys(kres.keys);
  }

  useEffect(() => {
    void load();
  }, []);

  function onIface(next: "openai" | "anthropic") {
    setIface(next);
    const first = config?.providers.find((p) => p.interface === next)?.name;
    if (first) void onProvider(first);
  }

  async function onProvider(provider: string) {
    setSaving((s) => ({
      ...s,
      llmProvider: provider,
      deepThinkLlm: undefined,
      quickThinkLlm: undefined,
      backendUrl: isCustom(provider) ? s.backendUrl : undefined,
    }));
    await loadModels(provider);
  }

  async function saveSettings() {
    if (isCustom(s.llmProvider) && !s.backendUrl) {
      setMsg(t("baseUrlRequired"));
      return;
    }
    const body: SettingsT = customOnly
      ? saving
      : {
          ...saving,
          deepThinkLlm: pickModelId(saving.deepThinkLlm, config?.deepModels ?? []),
          quickThinkLlm: pickModelId(saving.quickThinkLlm, config?.quickModels ?? []),
        };
    setSaving(body);
    try {
      await apiPut("/config", body);
      setMsg(t("saved"));
    } catch {
      setMsg(t("saveFailed"));
    }
  }

  async function saveKey(env: string) {
    const value = keyDraft[env] ?? "";
    try {
      const r = await apiPut<KeysUpdateResponse>("/keys", { env, value });
      setKeys(r.keys);
      setKeyDraft((d) => ({ ...d, [env]: "" }));
      setMsg(t("saved"));
    } catch {
      /* surfaced via no state change */
    }
  }

  if (!config)
    return (
      <div className="mx-auto max-w-6xl px-6 py-12 text-helm-faint">
        {tCommon("loading")}
      </div>
    );

  const s = { ...config.defaults, ...saving } as SettingsT &
    ConfigResponse["defaults"];
  const providersForIface = config.providers.filter((p) => p.interface === iface);
  const tokenRow = keys.find((k) => k.provider === s.llmProvider);

  function providerLabel(name: string): string {
    return isCustom(name) ? t("custom") : name;
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "model", label: t("tabModel"), icon: <GridIcon /> },
    { key: "key", label: t("tabKey"), icon: <KeyIcon /> },
    { key: "data", label: t("tabData"), icon: <DbIcon /> },
    { key: "adv", label: t("tabAdv"), icon: <SlidersIcon /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold text-helm-text">{t("title")}</h1>
      <p className="mt-1 text-[13px] text-helm-muted">{t("subtitle")}</p>

      {msg && (
        <p className="mt-4 rounded border border-helm-success/40 bg-helm-success/10 p-3 text-sm text-helm-success">
          {msg}
        </p>
      )}

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[220px_1fr]">
        {/* sidebar */}
        <aside className="flex gap-1.5 overflow-x-auto lg:sticky lg:top-[78px] lg:flex-col">
          {tabs.map((it) => {
            const activeTab = it.key === tab;
            return (
              <button
                key={it.key}
                onClick={() => setTab(it.key)}
                className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded px-3 py-2.5 text-left text-[13.5px] transition-colors lg:w-full ${
                  activeTab
                    ? "border border-helm-accent/30 bg-helm-accent/10 text-helm-accent"
                    : "border border-transparent text-helm-muted hover:text-helm-text"
                }`}
              >
                <span className={activeTab ? "text-helm-accent" : "text-helm-faint"}>
                  {it.icon}
                </span>
                {it.label}
              </button>
            );
          })}
        </aside>

        {/* panes */}
        <div className="space-y-5">
          {tab === "model" && (
            <Pane>
              <p className="-mt-1 mb-4 text-[12.5px] text-helm-muted">{t("modelHint")}</p>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("interfaceType")}>
                    <select
                      value={iface}
                      onChange={(e) => onIface(e.target.value as "openai" | "anthropic")}
                      className={inputCls}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                    </select>
                  </Field>
                  <Field label={t("provider")}>
                    <select
                      value={s.llmProvider}
                      onChange={(e) => onProvider(e.target.value)}
                      className={inputCls}
                    >
                      {providersForIface.map((p) => (
                        <option key={p.name} value={p.name}>
                          {providerLabel(p.name)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {isCustom(s.llmProvider) && (
                  <Field label={t("baseUrl")}>
                    <input
                      value={s.backendUrl ?? ""}
                      onChange={(e) =>
                        setSaving((p) => ({ ...p, backendUrl: e.target.value }))
                      }
                      placeholder="https://my-gateway/v1"
                      className={inputCls}
                    />
                  </Field>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("deepModel")}>
                    {customOnly ? (
                      <input
                        value={saving.deepThinkLlm ?? ""}
                        onChange={(e) =>
                          setSaving((p) => ({ ...p, deepThinkLlm: e.target.value }))
                        }
                        placeholder={t("customModel")}
                        className={inputCls}
                      />
                    ) : (
                      <select
                        value={saving.deepThinkLlm ?? ""}
                        onChange={(e) =>
                          setSaving((p) => ({ ...p, deepThinkLlm: e.target.value }))
                        }
                        className={inputCls}
                      >
                        {config.deepModels.map((m) => (
                          <option key={m.modelId} value={m.modelId}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field label={t("quickModel")}>
                    {customOnly ? (
                      <input
                        value={saving.quickThinkLlm ?? ""}
                        onChange={(e) =>
                          setSaving((p) => ({ ...p, quickThinkLlm: e.target.value }))
                        }
                        placeholder={t("customModel")}
                        className={inputCls}
                      />
                    ) : (
                      <select
                        value={saving.quickThinkLlm ?? ""}
                        onChange={(e) =>
                          setSaving((p) => ({ ...p, quickThinkLlm: e.target.value }))
                        }
                        className={inputCls}
                      >
                        {config.quickModels.map((m) => (
                          <option key={m.modelId} value={m.modelId}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                </div>
              </div>
              <SaveBar>
                <button
                  onClick={saveSettings}
                  className="rounded bg-helm-accent px-5 py-2.5 font-bold text-helm-base transition-colors hover:bg-helm-accentHover"
                >
                  {t("saveModel")}
                </button>
              </SaveBar>
            </Pane>
          )}

          {tab === "key" && (
            <Pane>
              <div className="mb-4 flex items-start gap-2.5 rounded border border-helm-accent/20 bg-helm-accent/5 p-3.5">
                <LockIcon />
                <p className="text-[12.5px] leading-relaxed text-helm-body">
                  {t("keySecurity")}
                </p>
              </div>
              {tokenRow ? (
                <Field label={t("apiToken")}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        tokenRow.set ? "bg-helm-success" : "bg-zinc-600"
                      }`}
                    />
                    <input
                      type="password"
                      value={keyDraft[tokenRow.env] ?? ""}
                      onChange={(e) =>
                        setKeyDraft((d) => ({ ...d, [tokenRow.env]: e.target.value }))
                      }
                      placeholder={tokenRow.set ? "••••" : ""}
                      className={`${inputCls} flex-1 py-2`}
                    />
                    <button
                      onClick={() => saveKey(tokenRow.env)}
                      className="shrink-0 rounded border border-zinc-700 px-3 py-2 text-sm text-helm-text transition-colors hover:border-helm-accent hover:text-helm-accent"
                    >
                      {tCommon("save")}
                    </button>
                  </div>
                </Field>
              ) : (
                <p className="text-sm text-helm-faint">{t("languageNote")}</p>
              )}
            </Pane>
          )}

          {tab === "data" && (
            <Pane>
              <p className="-mt-1 mb-4 text-[12.5px] text-helm-muted">{t("vendorsHint")}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {VENDOR_CATEGORIES.map((cat) => (
                  <Field key={cat} label={t(VENDOR_CATEGORY_LABEL_KEY[cat] ?? cat)}>
                    <input
                      value={s.dataVendors[cat] ?? ""}
                      onChange={(e) =>
                        setSaving((p) => ({
                          ...p,
                          dataVendors: {
                            ...(p.dataVendors ?? config.defaults.dataVendors),
                            [cat]: e.target.value,
                          },
                        }))
                      }
                      className={inputCls}
                      placeholder="e.g. yfinance,alpha_vantage"
                    />
                  </Field>
                ))}
              </div>
              <SaveBar>
                <button
                  onClick={saveSettings}
                  className="rounded bg-helm-accent px-5 py-2.5 font-bold text-helm-base transition-colors hover:bg-helm-accentHover"
                >
                  {t("saveVendors")}
                </button>
              </SaveBar>
            </Pane>
          )}

          {tab === "adv" && (
            <Pane>
              <div className="space-y-5">
                <Stepper
                  label={t("maxDebate")}
                  hint={t("advDebateHint")}
                  min={1}
                  max={5}
                  value={s.maxDebateRounds}
                  onChange={(v) => setSaving((p) => ({ ...p, maxDebateRounds: v }))}
                />
                <Stepper
                  label={t("maxRisk")}
                  hint={t("advRiskHint")}
                  min={1}
                  max={5}
                  value={s.maxRiskDiscussRounds}
                  onChange={(v) => setSaving((p) => ({ ...p, maxRiskDiscussRounds: v }))}
                />
              </div>
              <SaveBar>
                <button
                  onClick={saveSettings}
                  className="rounded bg-helm-accent px-5 py-2.5 font-bold text-helm-base transition-colors hover:bg-helm-accentHover"
                >
                  {t("saveModel")}
                </button>
              </SaveBar>
            </Pane>
          )}
        </div>
      </div>
    </div>
  );
}

function Pane({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-zinc-800 bg-helm-panel p-5">{children}</section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SaveBar({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex items-center gap-3">{children}</div>;
}

function Stepper({
  label,
  hint,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-helm-text">{label}</div>
        <div className="mt-0.5 text-xs text-helm-faint">{hint}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          className="h-9 w-9 rounded border border-zinc-700 bg-helm-base text-lg text-helm-text transition-colors hover:border-helm-accent"
        >
          −
        </button>
        <span className="w-6 text-center font-mono text-xl font-semibold text-helm-text">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          className="h-9 w-9 rounded border border-zinc-700 bg-helm-base text-lg text-helm-text transition-colors hover:border-helm-accent"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* tab / hint icons (24px, currentColor) */
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12 20 3M18 5l2 2M16 7l1.5 1.5" />
    </svg>
  );
}
function DbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </svg>
  );
}
function SlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2DE2E6"
      strokeWidth="2"
      className="mt-0.5 shrink-0"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
