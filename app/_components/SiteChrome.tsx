import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/de/" aria-label="Select Your Sauna Startseite">
        <span className="brand-mark" aria-hidden="true">SYS</span>
        <span>Select Your Sauna</span>
      </Link>
      <nav className="nav" aria-label="Hauptnavigation">
        <Link href="/de/#finder">Sauna-Finder</Link>
        <Link href="/de/produkte/">Produkte</Link>
        <Link href="/de/planung/">Planung</Link>
        <Link href="/de/saunatechnik/230-v-sauna/">230 V verstehen</Link>
      </nav>
      <Link className="header-cta" href="/de/#finder">Passenden Typ finden</Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <Link className="brand brand-footer" href="/de/">
        <span className="brand-mark">SYS</span><span>Select Your Sauna</span>
      </Link>
      <p>Eine unabhängige Planungs- und Kaufplattform für private Saunen.</p>
      <div className="footer-links">
        <Link href="/de/ueber-uns/">Über uns &amp; Methodik</Link>
        <Link href="/de/rechtliches/#impressum">Impressum</Link>
        <Link href="/de/rechtliches/#datenschutz">Datenschutz</Link>
        <Link href="/de/transparenz/affiliate/">Affiliate</Link>
      </div>
      <p className="footer-note">Betreiber: SeitenHafen361 · Inhaber Schayan Yousefian</p>
    </footer>
  );
}
