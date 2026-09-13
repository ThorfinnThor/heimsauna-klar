import Link from "next/link";
import Image from "next/image";
import { getEnabledMarkets, marketPath, type MarketCode } from "@/lib/markets";

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
    items: [{ href: "/us/", label: "US home" }],
    cta: { href: "/us/", label: "Explore US saunas" },
  },
} satisfies Record<MarketCode, {
  homeLabel: string;
  navigationLabel: string;
  items: Array<{ href: string; label: string }>;
  cta: { href: string; label: string };
}>;

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
  return (
    <header className="site-header">
      <Link className="brand" href={marketPath(market)} aria-label={copy.homeLabel}>
        <Image className="brand-icon" src="/brand/sauna-192.png" width={34} height={34} alt="" unoptimized />
        <span>Select Your Sauna</span>
      </Link>
      <nav className="nav" aria-label={copy.navigationLabel}>
        {copy.items.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
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
  return (
    <footer>
      <Link className="brand brand-footer" href={marketPath(market)}>
        <Image className="brand-icon" src="/brand/sauna-192.png" width={34} height={34} alt="" unoptimized /><span>Select Your Sauna</span>
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
        ) : null}
      </div>
      <p className="footer-note">{isGerman ? "Betreiber" : "Operated by"}: SeitenHafen361 · Schayan Yousefian</p>
    </footer>
  );
}
