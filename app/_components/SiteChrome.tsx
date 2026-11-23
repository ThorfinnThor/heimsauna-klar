import Link from "next/link";
import { CookieSettingsButton } from "@/app/_analytics/CookieSettingsButton";
import { getEnabledMarkets, marketPath, type MarketCode } from "@/lib/markets";
import { getUsEditorialPages, getUsTrustPage, isUsResearchPreview } from "@/lib/us/content";

const headerCopy = {
  DE: {
    homeLabel: "Select Your Sauna Startseite",
    navigationLabel: "Hauptnavigation",
    items: [
      { href: "/de/produkte/", label: "Alle Saunen" },
      { href: "/de/vergleiche/", label: "Vergleiche" },
      { href: "/de/planung/", label: "Ratgeber" },
      { href: "/de/ueber-uns/", label: "Über uns" },
    ],
  },
  US: {
    homeLabel: "Select Your Sauna home",
    navigationLabel: "Primary navigation",
    items: [
      { href: "/us/saunas/", label: "Saunas" },
      { href: "/us/guides/", label: "Guides" },
      { href: "/us/sauna-finder/", label: "Finder" },
    ],
  },
} satisfies Record<MarketCode, {
  homeLabel: string;
  navigationLabel: string;
  items: Array<{ href: string; label: string }>;
}>;

function getUsNavigationItems() {
  const includeNonPublic = isUsResearchPreview();
  const items = [...headerCopy.US.items];
  for (const entry of [
    { type: "comparison" as const, href: "/us/compare/", label: "Compare" },
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
      <div className="wrap">
        <Link className="brand" href={marketPath(market)} aria-label={copy.homeLabel}>
          <span className="brand-icon" aria-hidden="true" />
          <span>Select Your Sauna</span>
        </Link>
        <nav className="nav" aria-label={copy.navigationLabel}>
          {items.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
        <MarketSwitcher currentMarket={market} />
      </div>
    </header>
  );
}

export function SiteFooter({ market = "DE" }: { market?: MarketCode }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        {market === "DE" ? <GermanFooter /> : <UsFooter />}
        <p className="footer-note">{market === "DE" ? "Betreiber" : "Operated by"}: SeitenHafen361, Schayan Yousefian</p>
      </div>
    </footer>
  );
}

function GermanFooter() {
  return (
    <div className="footer-cols">
      <p>Select Your Sauna vergleicht Saunen und Infrarotkabinen für zu Hause. Wir verkaufen selbst nichts. Kaufst du über einen Link mit dem Zusatz „Affiliate-Link“, bekommen wir vom Shop eine Provision. Für dich ändert sich der Preis nicht.</p>
      <ul>
        <li><Link href="/de/produkte/">Alle Saunen</Link></li>
        <li><Link href="/de/vergleiche/">Vergleiche</Link></li>
        <li><Link href="/de/planung/">Ratgeber</Link></li>
        <li><Link href="/de/saunatechnik/230-v-sauna/">230-Volt-Saunen erklärt</Link></li>
      </ul>
      <ul>
        <li><Link href="/de/ueber-uns/">Über uns</Link></li>
        <li><Link href="/de/transparenz/affiliate/">Affiliate-Links</Link></li>
        <li><Link href="/de/rechtliches/#impressum">Impressum</Link></li>
        <li><Link href="/de/rechtliches/#datenschutz">Datenschutz</Link></li>
        <li><CookieSettingsButton label="Cookie-Einstellungen" /></li>
      </ul>
    </div>
  );
}

function UsFooter() {
  const includeNonPublic = isUsResearchPreview();
  const trustLinks = [
    { slug: "methodology" as const, href: "/us/methodology/", label: "How we compare" },
    { slug: "affiliate-disclosure" as const, href: "/us/affiliate-disclosure/", label: "Affiliate disclosure" },
    { slug: "privacy" as const, href: "/us/privacy/", label: "Privacy" },
    { slug: "contact" as const, href: "/us/contact/", label: "Contact" },
  ].filter((item) => getUsTrustPage(item.slug, { includeNonPublic }));
  return (
    <div className="footer-cols">
      <p>Select Your Sauna compares home saunas. We don&apos;t sell them. Links marked &ldquo;Affiliate link&rdquo; may earn us a commission at no extra cost to you.</p>
      <ul>
        <li><Link href="/us/saunas/">All saunas</Link></li>
        <li><Link href="/us/sauna-finder/">Sauna finder</Link></li>
        <li><Link href="/us/guides/">Guides</Link></li>
      </ul>
      <ul>{trustLinks.map((item) => <li key={item.slug}><Link href={item.href}>{item.label}</Link></li>)}</ul>
    </div>
  );
}
