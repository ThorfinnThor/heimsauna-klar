import usPublication from "../data/us/publication.json" with { type: "json" };

export type MarketCode = "DE" | "US";

export type MarketConfig = {
  code: MarketCode;
  locale: "de-DE" | "en-US";
  openGraphLocale: "de_DE" | "en_US";
  currency: "EUR" | "USD";
  pathPrefix: "/de" | "/us";
  measurementSystem: "metric" | "imperial";
  displayVoltageChoices: number[];
  enabled: boolean;
};

const usRoutesRestrictedByEnvironment = process.env.US_ROUTES_ENABLED === "false";

export const markets: Record<MarketCode, MarketConfig> = {
  DE: {
    code: "DE",
    locale: "de-DE",
    openGraphLocale: "de_DE",
    currency: "EUR",
    pathPrefix: "/de",
    measurementSystem: "metric",
    displayVoltageChoices: [230, 400],
    enabled: true,
  },
  US: {
    code: "US",
    locale: "en-US",
    openGraphLocale: "en_US",
    currency: "USD",
    pathPrefix: "/us",
    measurementSystem: "imperial",
    displayVoltageChoices: [120, 240],
    enabled: usPublication.routes_enabled && !usRoutesRestrictedByEnvironment,
  },
};

export function getMarketConfig(code: MarketCode): MarketConfig {
  return markets[code];
}

export function getEnabledMarkets(): MarketConfig[] {
  return Object.values(markets).filter((market) => market.enabled);
}

export function marketPath(code: MarketCode, suffix = "/"): string {
  const normalizedSuffix = suffix === "/" ? "" : `/${suffix.replace(/^\/+|\/+$/g, "")}`;
  return `${markets[code].pathPrefix}${normalizedSuffix}/`;
}

export function formatMarketMoney(code: MarketCode, amountMinor: number): string {
  const market = markets[code];
  return new Intl.NumberFormat(market.locale, {
    style: "currency",
    currency: market.currency,
  }).format(amountMinor / 100);
}
