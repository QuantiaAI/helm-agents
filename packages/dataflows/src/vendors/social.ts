/**
 * Social-sentiment vendor combining Reddit (RSS) + StockTwits (JSON), both
 * keyless. Ports the sentiment analyst's social-data gathering
 * (dataflows/reddit.py + stocktwits.py), aggregated into one report.
 */
import { normalizeSymbol } from "@helm-agents/shared";
import type { VendorFn, VendorImpl } from "../router.js";

const UA = "tradingagents-web/0.1 (+https://github.com/TauricResearch/TradingAgents)";
const REDDIT_SUBS = ["wallstreetbets", "stocks", "investing"];

function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Minimal RSS <item> extractor (no dependency on an XML parser). */
function parseRssItems(xml: string, limit: number): string[] {
  const items: string[] = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null && items.length < limit) {
    const block = m[1] ?? "";
    const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const clean = title ? unescapeHtml(title[1]!.trim()).replace(/\s+/g, " ") : "(untitled)";
    items.push(`- ${clean}`);
  }
  return items;
}

async function fetchReddit(
  ticker: string,
  fetchImpl: typeof fetch,
  limit: number,
): Promise<string[]> {
  const q = encodeURIComponent(`$${ticker} ${ticker}`);
  const out: string[] = [];
  for (const sub of REDDIT_SUBS) {
    if (out.length >= limit) break;
    try {
      const url = `https://www.reddit.com/r/${sub}/search.rss?q=${q}&restrict_sr=1&sort=relevance&limit=${Math.ceil(limit / REDDIT_SUBS.length)}`;
      const res = await fetchImpl(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const xml = await res.text();
      out.push(...parseRssItems(xml, limit - out.length));
    } catch {
      /* degrade per-sub */
    }
  }
  return out;
}

interface StockTwitsResponse {
  messages?: Array<{
    body?: string;
    sentiment?: { bearish?: boolean; bullish?: boolean } | null;
    user?: { username?: string };
  }>;
}

async function fetchStocktwits(
  ticker: string,
  fetchImpl: typeof fetch,
  limit: number,
): Promise<string[]> {
  const sym = normalizeSymbol(ticker);
  try {
    const url = `https://api.stocktwits.com/api/2/streams/symbol/${encodeURIComponent(sym)}.json?limit=${limit}`;
    const res = await fetchImpl(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return [];
    const json = (await res.json()) as StockTwitsResponse;
    return (json.messages ?? []).slice(0, limit).map((msg) => {
      const tag = msg.sentiment?.bullish ? "🟢" : msg.sentiment?.bearish ? "🔴" : "⚪";
      const who = msg.user?.username ?? "anon";
      return `- ${tag} @${who}: ${(msg.body ?? "").replace(/\s+/g, " ").trim()}`;
    });
  } catch {
    return [];
  }
}

export function createSocialVendor(
  fetchImpl: typeof fetch = globalThis.fetch,
): VendorImpl {
  const getSocialSentiment: VendorFn = async (ticker: string) => {
    const sym = String(ticker);
    const [reddit, stocktwits] = await Promise.all([
      fetchReddit(sym, fetchImpl, 6),
      fetchStocktwits(sym, fetchImpl, 12),
    ]);
    const parts: string[] = [`## Social sentiment for ${normalizeSymbol(sym)}`];
    parts.push("### Reddit");
    parts.push(reddit.length ? reddit.join("\n") : "_(no recent Reddit posts)_");
    parts.push("\n### StockTwits");
    parts.push(stocktwits.length ? stocktwits.join("\n") : "_(no recent StockTwits messages)_");
    return parts.join("\n");
  };

  return { name: "social", methods: { getSocialSentiment } };
}
