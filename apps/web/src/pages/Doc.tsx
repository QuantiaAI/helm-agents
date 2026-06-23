import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DEFAULT_LOCALE } from "@/locale";
import { apiGetText } from "@/api/client";
import { Markdown, slugify } from "@/components/markdown";
import { BRAND } from "@/lib/brand";
import { NotFound } from "./NotFound";

interface TocItem {
  level: number;
  text: string;
  slug: string;
}

// Build a Table of Contents from the doc's h2/h3 headings.
function toc(md: string): TocItem[] {
  const out: TocItem[] = [];
  for (const m of md.matchAll(/^(#{2,3})\s+(.+)$/gm)) {
    const levelStr = m[1];
    const text = m[2]?.trim();
    if (!levelStr || !text) continue;
    out.push({ level: levelStr.length, text, slug: slugify(text) });
  }
  return out;
}

export function Doc() {
  const params = useParams();
  const locale = params.locale ?? DEFAULT_LOCALE;
  const slug = params["*"] ?? "";
  const [content, setContent] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    let alive = true;
    setState("loading");
    // Encode each path segment (preserving the `/` separators) so doc paths
    // with spaces or reserved chars resolve correctly.
    const encoded = slug.split("/").map(encodeURIComponent).join("/");
    apiGetText(`/docs/${encoded}`)
      .then((md) => {
        if (!alive) return;
        if (md === null) setState("missing");
        else {
          setContent(md);
          setState("ok");
        }
      })
      .catch(() => alive && setState("missing"));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state === "missing") return <NotFound />;

  const items = content ? toc(content) : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        to={`/${locale}`}
        className="font-mono text-xs text-helm-muted hover:text-helm-accent hover:underline"
      >
        ← {BRAND.name}
      </Link>
      <div className="mt-5 grid items-start gap-8 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:sticky lg:top-[78px] lg:block">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-helm-faint">
            Docs
          </div>
          {items.length > 0 && (
            <nav className="flex flex-col gap-0.5 border-l border-zinc-800">
              {items.map((it) => (
                <a
                  key={it.slug}
                  href={`#${it.slug}`}
                  className={`-ml-px border-l border-transparent py-1 text-[13px] text-helm-muted transition-colors hover:border-helm-accent hover:text-helm-accent ${
                    it.level === 3 ? "pl-5" : "pl-3"
                  }`}
                >
                  {it.text}
                </a>
              ))}
            </nav>
          )}
        </aside>

        <article className="rounded-md border border-zinc-800 bg-helm-panel/40 p-6">
          {state === "loading" ? (
            <p className="text-helm-faint">Loading…</p>
          ) : (
            <Markdown withIds>{content ?? ""}</Markdown>
          )}
        </article>
      </div>
    </div>
  );
}
