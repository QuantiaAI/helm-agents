import { useState, useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  SUPPORTED_PLATFORMS,
  PLATFORM_DISPLAY,
  FALLBACK_LINKS,
  FALLBACK_INVITE_CODES,
  INVITE_LINKS_URL,
  REBATE_INFO_URL,
  filterSupported,
  resolveLinks,
  type InviteLinkEntry,
  type ResolvedLinks,
  type SupportedPlatform,
} from "@/lib/tokenized-stocks";

/** 模块级缓存：每个浏览器会话只 fetch 一次。fetch 失败 resolve 为 [] → 走 FALLBACK。 */
let linksPromise: Promise<InviteLinkEntry[]> | null = null;
function loadInviteLinks(): Promise<InviteLinkEntry[]> {
  if (!linksPromise) {
    linksPromise = fetch(INVITE_LINKS_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((raw) => filterSupported(raw))
      .catch(() => []);
  }
  return linksPromise;
}

type LinksByPlatform = Record<SupportedPlatform, ResolvedLinks>;

function useInviteLinks(): { loading: boolean; links: LinksByPlatform } {
  const [entries, setEntries] = useState<InviteLinkEntry[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadInviteLinks().then((e) => {
      if (alive) setEntries(e);
    });
    return () => {
      alive = false;
    };
  }, []);

  function buildLinks(): LinksByPlatform {
    const out = {} as LinksByPlatform;
    for (const p of SUPPORTED_PLATFORMS) {
      const entry = entries?.find((e) => e.platform === p);
      out[p] = entry
        ? resolveLinks(entry)
        : { primary: FALLBACK_LINKS[p], mirrors: [], inviteCode: FALLBACK_INVITE_CODES[p] };
    }
    return out;
  }

  return { loading: entries === null, links: buildLinks() };
}

const EXTERNAL = { target: "_blank" as const, rel: "noopener noreferrer nofollow" };

/** Copy `value` to the clipboard; resolves false where the Clipboard API is
 *  unavailable (older browsers / headless test envs). */
async function copyText(value: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

/** A copy-to-clipboard row: a label + value + copy icon, with "Copied ✓" feedback. */
function CopyRow({
  label,
  value,
  copied,
  onCopy,
  dashed,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  dashed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="mt-2 flex w-full items-center justify-between gap-2 rounded border bg-helm-panel px-3 py-2 text-left transition-colors hover:border-helm-accent"
      style={dashed ? { borderColor: "rgba(45,226,230,0.4)", borderStyle: "dashed" } : undefined}
    >
      <span className="min-w-0">
        <span className="block font-mono text-[10px] text-helm-faint">{label}</span>
        <span
          className="block truncate font-mono text-[12px]"
          style={{ color: dashed ? "#2DE2E6" : "#8B98A9" }}
        >
          {value}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        {copied ? (
          <span className="text-[10px] text-helm-success">✓</span>
        ) : (
          <CopyIcon className="text-helm-faint" />
        )}
      </span>
    </button>
  );
}

function ExchangeCard({
  platform,
  links,
}: {
  platform: SupportedPlatform;
  links: ResolvedLinks;
}) {
  const { t } = useTranslation("tokenized");
  const display = PLATFORM_DISPLAY[platform];
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  async function onCopyCode() {
    if (await copyText(links.inviteCode)) {
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1500);
    }
  }
  async function onCopyLink() {
    if (await copyText(links.primary)) {
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1500);
    }
  }

  return (
    <div className="flex flex-col rounded-md border border-helm-accent/15 bg-helm-base p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-helm-text">{display.name}</span>
        <span className="font-mono text-[10px] text-helm-faint">{display.domain}</span>
      </div>

      <CopyRow
        label={t("codeLabel")}
        value={links.inviteCode}
        copied={codeCopied}
        onCopy={onCopyCode}
        dashed
      />
      <CopyRow
        label={t("linkLabel")}
        value={links.primary}
        copied={linkCopied}
        onCopy={onCopyLink}
      />

      <a
        href={links.primary}
        {...EXTERNAL}
        className="mt-3 block rounded bg-helm-accent px-3 py-2.5 text-center font-bold text-helm-base transition-colors hover:bg-helm-accentHover"
      >
        {t("primaryAction")}
      </a>

      {links.mirrors.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer font-mono text-[11px] text-helm-muted hover:text-helm-accent">
            ▸ {t("mirrorsToggle")}
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {links.mirrors.map((m, i) => (
              <a
                key={m}
                href={m}
                {...EXTERNAL}
                className="rounded border border-zinc-700 bg-helm-panel px-2.5 py-1 font-mono text-[11px] text-helm-muted transition-colors hover:border-helm-accent hover:text-helm-accent"
              >
                {t("mirrorLabel", { n: i + 1 })}
              </a>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/** Rebate-critical caveats, rendered as a design-style 提示 callout (cyan left rule). */
function RebateNotes() {
  const { t } = useTranslation("tokenized");
  return (
    <div className="mt-4 rounded-r-md border-l-2 border-helm-accent/60 bg-helm-accent/5 px-3.5 py-2.5 text-[12px] leading-relaxed text-helm-body">
      <div>⚠️ {t("appNote")}</div>
      <div className="mt-1">👨‍👩‍👧 {t("idNote")}</div>
    </div>
  );
}

function SponsoredFooter() {
  const { t } = useTranslation("tokenized");
  return (
    <div className="mt-3 border-t border-white/6 pt-3">
      <a
        href={REBATE_INFO_URL}
        {...EXTERNAL}
        className="font-mono text-[11px] text-helm-accent hover:underline"
      >
        {t("sponsoredBy")}
      </a>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11.5px] leading-relaxed text-helm-faint">
        <span className="max-w-3xl">{t("disclaimer")}</span>
        <a
          href={REBATE_INFO_URL}
          {...EXTERNAL}
          className="shrink-0 text-helm-accent hover:underline"
        >
          {t("learnMore")}
        </a>
      </div>
    </div>
  );
}

function Cards({ links }: { links: LinksByPlatform }) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      {SUPPORTED_PLATFORMS.map((p) => (
        <ExchangeCard key={p} platform={p} links={links[p]} />
      ))}
    </div>
  );
}

function ModuleShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-md border border-helm-accent/25 p-6"
      style={{ backgroundImage: "linear-gradient(180deg,#10202A,#0E1620)" }}
    >
      {children}
    </div>
  );
}

export function TokenizedStockCTA({
  variant,
  ticker,
}: {
  variant: "home" | "detail";
  ticker?: string;
}) {
  const { t } = useTranslation("tokenized");
  const { loading, links } = useInviteLinks();
  const tk = ticker ?? "";

  if (variant === "detail") {
    return (
      <ModuleShell>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-helm-accent">
          {t("homeEyebrow")} ·{" "}
          <span className="text-helm-muted">{t("detailTitle", { ticker: tk })}</span>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-helm-muted">
          {t("detailDesc", { ticker: tk })}
        </p>
        {loading ? (
          <p className="mt-5 text-sm text-helm-faint">{t("loading")}</p>
        ) : (
          <Cards links={links} />
        )}
        <RebateNotes />
        <SponsoredFooter />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell>
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-helm-accent">
        {t("homeEyebrow")}
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-helm-text sm:text-3xl">
        {t("homeTitle")}
        <span className="text-helm-accent">{t("homeTitleAccent")}</span>
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-helm-muted">{t("homeDesc")}</p>
      {loading ? (
        <p className="mt-5 text-sm text-helm-faint">{t("loading")}</p>
      ) : (
        <Cards links={links} />
      )}
      <RebateNotes />
      <SponsoredFooter />
    </ModuleShell>
  );
}

export default TokenizedStockCTA;
