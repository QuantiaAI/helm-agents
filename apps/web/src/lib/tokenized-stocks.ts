/**
 * 代币化股票交易所引导的链接解析（纯函数，server/client 通用，无 DOM）。
 * 所有外部行为逻辑集中于此，便于黑盒测试。组件层只做 fetch + 渲染。
 */
export const INVITE_LINKS_URL = "https://fangeiwo.net/invite_links.json";
export const REBATE_INFO_URL = "https://rebateto.me/how_to_referral";

export const SUPPORTED_PLATFORMS = ["binance", "okx", "gateio"] as const;
export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

/** 品牌名 + 官方域名（专有名词，不进翻译目录）。 */
export const PLATFORM_DISPLAY: Record<SupportedPlatform, { name: string; domain: string }> = {
  binance: { name: "Binance", domain: "binance.com" },
  okx: { name: "OKX", domain: "okx.com" },
  gateio: { name: "Gate", domain: "gate.io" },
};

/** fetch 失败时的硬编码兜底：仅官方主链接。币安邀请码为 FANWO20，其余为 FANGEIWO。 */
export const FALLBACK_LINKS: Record<SupportedPlatform, string> = {
  binance: "https://www.binance.com/join?ref=FANWO20",
  okx: "https://www.okx.com/join/FANGEIWO",
  gateio: "https://www.gate.io/share/FANGEIWO",
};

/** fetch 失败时各平台的兜底邀请码（与 FALLBACK_LINKS 对应）。 */
export const FALLBACK_INVITE_CODES: Record<SupportedPlatform, string> = {
  binance: "FANWO20",
  okx: "FANGEIWO",
  gateio: "FANGEIWO",
};

export interface InviteLinkEntry {
  platform: string;
  invite_code: string;
  invite_link: string;
  inner_invite_link: string;
  inner_invite_link_backup: string | null;
  international_invite_link: string;
  android_download_link?: string;
}

export interface ResolvedLinks {
  primary: string;
  mirrors: string[];
  inviteCode: string;
}

const SUPPORTED_SET: ReadonlySet<string> = new Set(SUPPORTED_PLATFORMS);

/**
 * 从原始 JSON（unknown）筛选受支持交易所，按 SUPPORTED_PLATFORMS 顺序输出。
 * 非数组 / 缺 international_invite_link / 非受支持 platform 一律丢弃；首条出现者优先。
 */
export function filterSupported(raw: unknown): InviteLinkEntry[] {
  if (!Array.isArray(raw)) return [];
  const byPlatform = new Map<string, InviteLinkEntry>();
  for (const e of raw) {
    if (!e || typeof e !== "object") continue;
    const entry = e as InviteLinkEntry;
    if (
      typeof entry.platform === "string" &&
      SUPPORTED_SET.has(entry.platform) &&
      typeof entry.international_invite_link === "string" &&
      entry.international_invite_link.length > 0 &&
      !byPlatform.has(entry.platform)
    ) {
      byPlatform.set(entry.platform, entry);
    }
  }
  return SUPPORTED_PLATFORMS
    .filter((p) => byPlatform.has(p))
    .map((p) => byPlatform.get(p) as InviteLinkEntry);
}

/**
 * 解析单条：primary 为国际官方链接；mirrors 为 [invite_link, inner_invite_link_backup]
 * 去重、去空、去 primary 后的结果（即大陆可访问的镜像）。
 */
export function resolveLinks(entry: InviteLinkEntry): ResolvedLinks {
  const primary = entry.international_invite_link;
  const mirrors: string[] = [];
  for (const c of [entry.invite_link, entry.inner_invite_link_backup]) {
    if (typeof c === "string" && c.length > 0 && c !== primary && !mirrors.includes(c)) {
      mirrors.push(c);
    }
  }
  return { primary, mirrors, inviteCode: entry.invite_code };
}
