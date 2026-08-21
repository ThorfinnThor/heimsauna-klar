import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/de/" aria-label="Heimsauna Klar Startseite">
        <span className="brand-mark" aria-hidden="true">HK</span>
        <span>Heimsauna Klar</span>
        <span className="brand-tag">Arbeitstitel</span>
      </a>
      <nav className="nav" aria-label="Hauptnavigation">
        <a href="/de/#finder">Sauna-Finder</a>
        <Link href="/de/produkte/">Produkte</Link>
        <Link href="/de/saunatechnik/230-v-sauna/">230 V verstehen</Link>
      </nav>
      <a className="header-cta" href="/de/#finder">Passenden Typ finden</a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <a className="brand brand-footer" href="/de/">
        <span className="brand-mark">HK</span><span>Heimsauna Klar</span>
      </a>
      <p>Eine unabhängige Planungs- und Kaufplattform für private Saunen.</p>
      <div className="footer-links">
        <Link href="/de/rechtliches/#impressum">Impressum</Link>
        <Link href="/de/rechtliches/#datenschutz">Datenschutz</Link>
        <Link href="/de/rechtliches/#affiliate">Transparenz</Link>
      </div>
      <p className="footer-note">Prototyp · Produktdaten und Markenname werden vor Veröffentlichung geprüft.</p>
    </footer>
  );
}
