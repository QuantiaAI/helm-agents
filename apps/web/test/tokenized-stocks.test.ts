import { describe, it, expect } from "vitest";
import {
  INVITE_LINKS_URL,
  REBATE_INFO_URL,
  SUPPORTED_PLATFORMS,
  PLATFORM_DISPLAY,
  FALLBACK_LINKS,
  FALLBACK_INVITE_CODES,
  filterSupported,
  resolveLinks,
} from "../src/lib/tokenized-stocks";

describe("tokenized-stocks constants", () => {
  it("points at the live invite-links JSON and rebate info", () => {
    expect(INVITE_LINKS_URL).toBe("https://fangeiwo.net/invite_links.json");
    expect(REBATE_INFO_URL).toBe("https://rebateto.me/how_to_referral");
  });
  it("supports exactly binance / okx / gateio in that order", () => {
    expect([...SUPPORTED_PLATFORMS]).toEqual(["binance", "okx", "gateio"]);
  });
  it("carries brand names and official domains for the 3 exchanges", () => {
    expect(PLATFORM_DISPLAY.binance).toEqual({ name: "Binance", domain: "binance.com" });
    expect(PLATFORM_DISPLAY.okx).toEqual({ name: "OKX", domain: "okx.com" });
    expect(PLATFORM_DISPLAY.gateio).toEqual({ name: "Gate", domain: "gate.io" });
  });
  it("falls back to the exact official referral URLs", () => {
    expect(FALLBACK_LINKS.binance).toBe("https://www.binance.com/join?ref=FANWO20");
    expect(FALLBACK_LINKS.okx).toBe("https://www.okx.com/join/FANGEIWO");
    expect(FALLBACK_LINKS.gateio).toBe("https://www.gate.io/share/FANGEIWO");
  });
  it("uses the correct per-platform invite codes (Binance FANWO20, others FANGEIWO)", () => {
    expect(FALLBACK_INVITE_CODES.binance).toBe("FANWO20");
    expect(FALLBACK_INVITE_CODES.okx).toBe("FANGEIWO");
    expect(FALLBACK_INVITE_CODES.gateio).toBe("FANGEIWO");
    // Each fallback link embeds its platform's invite code.
    for (const p of SUPPORTED_PLATFORMS) {
      expect(FALLBACK_LINKS[p]).toContain(FALLBACK_INVITE_CODES[p]);
    }
  });
});

const SAMPLE = [
  { platform: "kucoin", invite_code: "fangeiwo", invite_link: "x", inner_invite_link: "x", inner_invite_link_backup: null, international_invite_link: "https://www.kucoin.com/r/af/fangeiwo" },
  { platform: "binance", invite_code: "fangeiwo", invite_link: "https://www.bsmkweb.cc/join?ref=fangeiwo", inner_invite_link: "https://www.bsmkweb.cc/join?ref=fangeiwo", inner_invite_link_backup: null, international_invite_link: "https://www.binance.com/join?ref=fangeiwo" },
  { platform: "okx", invite_code: "fangeiwo", invite_link: "https://www.promooboost.com/join/fangeiwo", inner_invite_link: "https://www.promooboost.com/join/fangeiwo", inner_invite_link_backup: "https://www.gghyxui.com/join/fangeiwo", international_invite_link: "https://www.okx.com/join/fangeiwo" },
  { platform: "gateio", invite_code: "fangeiwo", invite_link: "https://www.gatenode.garden/share/fangeiwo", inner_invite_link: "https://www.gatenode.garden/share/fangeiwo", inner_invite_link_backup: null, international_invite_link: "https://www.gate.io/share/fangeiwo" },
  { platform: "bitget", invite_code: "fanwo168", invite_link: "x", inner_invite_link: "x", inner_invite_link_backup: null, international_invite_link: "https://partner.bitget.com/bg/3sd59c2g" },
];

describe("filterSupported", () => {
  it("keeps only binance/okx/gateio in SUPPORTED order", () => {
    expect(filterSupported(SAMPLE).map((e) => e.platform)).toEqual(["binance", "okx", "gateio"]);
  });
  it("emits SUPPORTED order regardless of input order", () => {
    const reordered = [SAMPLE[4], SAMPLE[3], SAMPLE[2], SAMPLE[1], SAMPLE[0]];
    expect(filterSupported(reordered).map((e) => e.platform)).toEqual(["binance", "okx", "gateio"]);
  });
  it("returns [] for non-array input", () => {
    for (const bad of [null, undefined, {}, "nope", 0]) {
      expect(filterSupported(bad)).toEqual([]);
    }
  });
  it("drops entries missing a non-empty international_invite_link", () => {
    const broken = [
      { platform: "binance", invite_code: "fangeiwo", invite_link: "x", inner_invite_link: "x", inner_invite_link_backup: null, international_invite_link: "" },
      { platform: "okx", invite_code: "fangeiwo", invite_link: "x", inner_invite_link: "x", inner_invite_link_backup: null, international_invite_link: "https://www.okx.com/join/fangeiwo" },
    ];
    expect(filterSupported(broken).map((e) => e.platform)).toEqual(["okx"]);
  });
  it("ignores unsupported platforms", () => {
    const platforms = filterSupported(SAMPLE).map((e) => e.platform);
    expect(platforms).not.toContain("kucoin");
    expect(platforms).not.toContain("bitget");
  });
});

describe("resolveLinks", () => {
  const entry = (over: Partial<{ invite_link: string; inner_invite_link_backup: string | null; international_invite_link: string; invite_code: string }>) => ({
    platform: "x",
    invite_code: over.invite_code ?? "fangeiwo",
    invite_link: over.invite_link ?? "x",
    inner_invite_link: over.invite_link ?? "x",
    inner_invite_link_backup: over.inner_invite_link_backup ?? null,
    international_invite_link: over.international_invite_link ?? "https://official/x",
  });

  it("uses international_invite_link as primary", () => {
    expect(resolveLinks(entry({ international_invite_link: "https://www.binance.com/join?ref=fangeiwo" })).primary)
      .toBe("https://www.binance.com/join?ref=fangeiwo");
  });
  it("collects invite_link + backup as mirrors, deduped, minus primary", () => {
    const r = resolveLinks(entry({ invite_link: "https://a.com/join", inner_invite_link_backup: "https://b.com/join", international_invite_link: "https://official/x" }));
    expect(r.mirrors).toEqual(["https://a.com/join", "https://b.com/join"]);
  });
  it("drops null backup", () => {
    expect(resolveLinks(entry({ invite_link: "https://a.com/join", inner_invite_link_backup: null })).mirrors).toEqual(["https://a.com/join"]);
  });
  it("yields no mirror when invite_link equals primary", () => {
    expect(resolveLinks(entry({ invite_link: "https://official/x", inner_invite_link_backup: null })).mirrors).toEqual([]);
  });
  it("dedupes identical invite_link and backup", () => {
    expect(resolveLinks(entry({ invite_link: "https://same.com/join", inner_invite_link_backup: "https://same.com/join" })).mirrors).toEqual(["https://same.com/join"]);
  });
  it("passes invite_code through", () => {
    expect(resolveLinks(entry({ invite_code: "fangeiwo" })).inviteCode).toBe("fangeiwo");
  });
});
