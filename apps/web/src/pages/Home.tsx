import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, LOCALES } from "@/locale";
import { TokenizedStockCTA } from "@/components/TokenizedStockCTA";
import { SectionLabel } from "@/components/SectionLabel";

const PHASE_KEYS = [
  ["p1Name", "p1Agents", "p1Desc"],
  ["p2Name", "p2Agents", "p2Desc"],
  ["p3Name", "p3Agents", "p3Desc"],
  ["p4Name", "p4Agents", "p4Desc"],
  ["p5Name", "p5Agents", "p5Desc"],
] as const;

// Value-prop icon set (design system §LANDING): observe / cost / act.
const VP_ICONS = [
  // eye — observable
  <svg key="vp1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>,
  // dollar — cost-controlled
  <svg key="vp2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>,
  // bolt — actionable
  <svg key="vp3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>,
];

const STATS = [
  { value: "20+", key: "statProviders" as const },
  { value: String(LOCALES.length), key: "statLanguages" as const },
  { value: "100%", key: "statObservable" as const },
];

const VP_KEYS = [
  ["vp1Title", "vp1Desc"],
  ["vp2Title", "vp2Desc"],
  ["vp3Title", "vp3Desc"],
] as const;

export function Home() {
  const { t } = useTranslation("home");
  const { locale = DEFAULT_LOCALE } = useParams();

  return (
    <div>
      {/* HERO */}
      <section
        className="relative overflow-hidden px-6 py-20"
        style={{
          backgroundImage:
            "radial-gradient(1000px 480px at 78% -8%, rgba(45,226,230,0.10), transparent 62%)",
        }}
      >
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-helm-accent/30 bg-helm-accent/10 px-3.5 py-1.5 font-mono text-xs tracking-wide text-helm-accent">
            <span
              className="h-[7px] w-[7px] rounded-full bg-helm-accent"
              style={{ boxShadow: "0 0 8px #2DE2E6" }}
            />
            {t("badge")}
          </span>
          <h1
            data-hero
            className="mt-6 max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl"
          >
            {t("title")} <span className="text-helm-accent">{t("titleAccent")}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-helm-muted">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              to={`/${locale}/analyze`}
              className="inline-flex items-center gap-2 rounded bg-helm-accent px-6 py-3.5 font-sans font-bold text-helm-base transition-colors hover:bg-helm-accentHover"
            >
              {t("cta")}
            </Link>
            <Link
              to={`/${locale}/docs/superpowers/specs/2026-06-17-tradingagents-web-design.md`}
              className="inline-flex items-center rounded border border-zinc-700 px-6 py-3.5 font-sans text-[15px] text-helm-text transition-colors hover:border-helm-accent hover:text-helm-accent"
            >
              {t("spec")}
            </Link>
          </div>
          <dl className="mt-10 flex flex-wrap gap-7 font-mono">
            {STATS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-7">
                {i > 0 && <span className="h-7 w-px bg-zinc-800" aria-hidden="true" />}
                <div>
                  <dt className="text-2xl font-semibold text-helm-text">{s.value}</dt>
                  <dd className="mt-0.5 font-sans text-xs text-helm-faint">
                    {t(s.key)}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        {/* VALUE PROPS */}
        <section className="pb-6 pt-2">
          <div className="grid gap-4 sm:grid-cols-3">
            {VP_KEYS.map(([titleK, descK], i) => (
              <div
                key={titleK}
                className="rounded-md border border-zinc-800 bg-helm-panel p-6"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-helm-accent/15 text-helm-accent">
                  {VP_ICONS[i]}
                </div>
                <div className="mt-4 text-[17px] font-bold text-helm-text">
                  {t(titleK)}
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-helm-muted">
                  {t(descK)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5-STAGE FLOW */}
        <section className="py-10">
          <SectionLabel className="mb-6">{t("pipeline")}</SectionLabel>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {PHASE_KEYS.map(([nameK, agentsK, descK], i) => {
              const last = i === PHASE_KEYS.length - 1;
              return (
                <li
                  key={nameK}
                  className={`rounded-md p-5 ${
                    last
                      ? "border border-helm-accent/40 bg-helm-panel"
                      : "border border-zinc-800 bg-helm-panel"
                  }`}
                >
                  <span className="sr-only">{t("phase", { n: i + 1 })}</span>
                  <div className="font-mono text-xs text-helm-accent">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-2 text-[15px] font-semibold text-helm-text">
                    {t(nameK)}
                  </div>
                  <div className="mt-1.5 font-mono text-[11px] text-helm-accent/90">
                    {t(agentsK)}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-helm-faint">
                    {t(descK)}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <TokenizedStockCTA variant="home" />
      </div>
    </div>
  );
}
