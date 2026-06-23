/**
 * Data-vendor categories exposed on the Settings page. Each category id maps to
 * an i18n key under the `settings` message namespace, so the labels render
 * localized instead of as raw snake_case ids.
 */
export const VENDOR_CATEGORIES = [
  "core_stock_apis",
  "technical_indicators",
  "fundamental_data",
  "news_data",
  "macro_data",
  "prediction_markets",
  "social_data",
] as const;

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

/** Category id → `settings`-namespace i18n key for its human label. */
export const VENDOR_CATEGORY_LABEL_KEY: Record<VendorCategory, string> = {
  core_stock_apis: "catCoreStockApis",
  technical_indicators: "catTechnicalIndicators",
  fundamental_data: "catFundamentalData",
  news_data: "catNewsData",
  macro_data: "catMacroData",
  prediction_markets: "catPredictionMarkets",
  social_data: "catSocialData",
};
