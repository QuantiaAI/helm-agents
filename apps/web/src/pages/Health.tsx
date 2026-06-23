import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGet, apiUrl } from "@/api/client";
import type { HealthResponse, KeysResponse, MaskedKey } from "@helm-agents/contracts";

function fmtTime(d: Date): string {
  return d.toLocaleTimeString();
}

export function Health() {
  const { t } = useTranslation("health");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [keys, setKeys] = useState<MaskedKey[] | null | "anon">(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  useEffect(() => {
    apiGet<HealthResponse>("/health")
      .then((d) => {
        setHealth(d);
        setCheckedAt(new Date());
      })
      .catch(() => setHealth(null));
    // /keys is authenticated — hide the providers section when not signed in.
    apiGet<KeysResponse>("/keys")
      .then((r) => setKeys(r.keys))
      .catch(() => setKeys("anon"));
  }, []);

  const overallOk = health?.ok ?? false;
  const overallColor = overallOk ? "#00D68F" : "#E0B43C";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-helm-text">{t("title")}</h1>
      <p className="mt-1 text-[13px] text-helm-muted">{t("subtitle")}</p>

      <div
        className="mt-5 flex items-center gap-2 text-[13px]"
        style={{ color: overallColor }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: overallColor, boxShadow: `0 0 8px ${overallColor}` }}
        />
        {health
          ? overallOk
            ? t("ok")
            : t("fail")
          : "—"}
        {checkedAt && (
          <span className="ml-2 font-mono text-[11px] text-helm-faint">
            {t("lastChecked")} {fmtTime(checkedAt)}
          </span>
        )}
        <a
          href={apiUrl("/health")}
          className="ml-auto font-mono text-[11px] text-helm-accent underline"
        >
          /api/health
        </a>
      </div>

      {/* System self-checks */}
      <section className="mt-6">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-helm-faint">
          {t("system")}
        </div>
        <div className="overflow-hidden rounded-md border border-zinc-800 bg-helm-panel">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 text-left">
              <tr className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
                <th className="px-4 py-3 font-medium">{t("colService")}</th>
                <th className="px-4 py-3 font-medium">{t("colStatus")}</th>
                <th className="px-4 py-3 font-medium">{t("colLatency")}</th>
              </tr>
            </thead>
            <tbody>
              {(health?.checks ?? []).map((c) => {
                const color = c.ok ? "#00D68F" : "#F0496E";
                return (
                  <tr key={c.key} className="border-t border-zinc-800/60">
                    <td className="px-4 py-3 text-helm-text">
                      {c.label}
                      {!c.ok && c.detail && (
                        <span className="ml-2 font-mono text-[11px] text-helm-faint">
                          {c.detail}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[12.5px]"
                        style={{ color }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: color }}
                        />
                        {c.ok ? t("ok") : t("fail")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-helm-muted">
                      {c.latencyMs} ms
                    </td>
                  </tr>
                );
              })}
              {!health && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-helm-faint">
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Model providers (per-user API-key status) */}
      <section className="mt-6">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-helm-faint">
          {t("providers")}
        </div>
        {keys === "anon" || keys === null ? (
          <div className="rounded-md border border-dashed border-zinc-800 p-4 text-sm text-helm-faint">
            {t("providersSignIn")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-zinc-800 bg-helm-panel">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 text-left">
                <tr className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
                  <th className="px-4 py-3 font-medium">{t("colService")}</th>
                  <th className="px-4 py-3 font-medium">{t("colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => {
                  const color = k.set ? "#00D68F" : "#5A6678";
                  return (
                    <tr key={k.env} className="border-t border-zinc-800/60">
                      <td className="px-4 py-3">
                        <span className="text-helm-text">{k.provider}</span>
                        <span className="ml-2 font-mono text-[11px] text-helm-faint">
                          {k.env}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-[12.5px]"
                          style={{ color }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: color }}
                          />
                          {k.set ? t("configured") : t("notConfigured")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
