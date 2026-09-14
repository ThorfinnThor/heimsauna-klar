import Link from "next/link";
import { getEnabledMarkets, marketPath, type MarketCode } from "@/lib/markets";
import { getUsEditorialPages, getUsTrustPage, isUsResearchPreview } from "@/lib/us/content";

const headerCopy = {
  DE: {
    homeLabel: "Select Your Sauna Startseite",
    navigationLabel: "Hauptnavigation",
    items: [
      { href: "/de/#finder", label: "Sauna-Finder" },
      { href: "/de/produkte/", label: "Produkte" },
      { href: "/de/vergleiche/", label: "Vergleiche" },
      { href: "/de/planung/", label: "Planung" },
      { href: "/de/saunatechnik/230-v-sauna/", label: "230 V verstehen" },
    ],
    cta: { href: "/de/#finder", label: "Passenden Typ finden" },
  },
  US: {
    homeLabel: "Select Your Sauna home",
    navigationLabel: "Primary navigation",
    items: [
      { href: "/us/saunas/", label: "Saunas" },
      { href: "/us/sauna-finder/", label: "Sauna Finder" },
    ],
    cta: { href: "/us/sauna-finder/", label: "Find a configuration" },
  },
} satisfies Record<MarketCode, {
  homeLabel: string;
  navigationLabel: string;
  items: Array<{ href: string; label: string }>;
  cta: { href: string; label: string };
}>;

function getUsNavigationItems() {
  const includeNonPublic = isUsResearchPreview();
  const items = [...headerCopy.US.items];
  for (const entry of [
    { type: "comparison" as const, href: "/us/compare/", label: "Compare" },
    { type: "guide" as const, href: "/us/guides/", label: "Guides" },
    { type: "brand" as const, href: "/us/brands/", label: "Brands" },
  ]) {
    if (getUsEditorialPages(entry.type, { includeNonPublic }).length > 0) items.push({ href: entry.href, label: entry.label });
  }
  return items;
}

function MarketSwitcher({ currentMarket }: { currentMarket: MarketCode }) {
  const enabledMarkets = getEnabledMarkets();
  if (enabledMarkets.length < 2) return null;

  return (
    <nav className="market-switcher" aria-label="Market selection">
      {enabledMarkets.map((market) => (
        <Link
          aria-current={market.code === currentMarket ? "page" : undefined}
          href={marketPath(market.code)}
          key={market.code}
          hrefLang={market.locale}
        >
          {market.code}
        </Link>
      ))}
    </nav>
  );
}

export function SiteHeader({ market = "DE" }: { market?: MarketCode }) {
  const copy = headerCopy[market];
  const items = market === "US" ? getUsNavigationItems() : copy.items;
  return (
    <header className="site-header">
      <Link className="brand" href={marketPath(market)} aria-label={copy.homeLabel}>
        <span className="brand-icon" aria-hidden="true" />
        <span>Select Your Sauna</span>
      </Link>
      <nav className="nav" aria-label={copy.navigationLabel}>
        {items.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
      </nav>
      <div className="header-actions">
        <MarketSwitcher currentMarket={market} />
        <Link className="header-cta" href={copy.cta.href}>{copy.cta.label}</Link>
      </div>
    </header>
  );
}

export function SiteFooter({ market = "DE" }: { market?: MarketCode }) {
  const isGerman = market === "DE";
  const includeNonPublicUsPages = !isGerman && isUsResearchPreview();
  const usTrustLinks = isGerman ? [] : [
    { slug: "methodology" as const, href: "/us/methodology/", label: "Methodology" },
    { slug: "affiliate-disclosure" as const, href: "/us/affiliate-disclosure/", label: "Affiliate disclosure" },
    { slug: "privacy" as const, href: "/us/privacy/", label: "Privacy" },
    { slug: "contact" as const, href: "/us/contact/", label: "Contact" },
  ].filter((item) => getUsTrustPage(item.slug, { includeNonPublic: includeNonPublicUsPages }));
  return (
    <footer>
      <Link className="brand brand-footer" href={marketPath(market)}>
        <span className="brand-icon" aria-hidden="true" /><span>Select Your Sauna</span>
      </Link>
      <p>{isGerman ? "Eine unabhängige Planungs- und Kaufplattform für private Saunen." : "Independent planning and product research for home saunas."}</p>
      <div className="footer-links">
        {isGerman ? (
          <>
            <Link href="/de/ueber-uns/">Über uns &amp; Methodik</Link>
            <Link href="/de/rechtliches/#impressum">Impressum</Link>
            <Link href="/de/rechtliches/#datenschutz">Datenschutz</Link>
            <Link href="/de/transparenz/affiliate/">Affiliate</Link>
          </>
        ) : usTrustLinks.map((item) => <Link href={item.href} key={item.slug}>{item.label}</Link>)}
      </div>
      <p className="footer-note">{isGerman ? "Betreiber" : "Operated by"}: SeitenHafen361 · Schayan Yousefian</p>
    </footer>
  );
}
