import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/de/" aria-label="Select Your Sauna Startseite">
        <Image className="brand-icon" src="/brand/sauna-192.png" width={34} height={34} alt="" unoptimized />
        <span>Select Your Sauna</span>
      </Link>
      <nav className="nav" aria-label="Hauptnavigation">
        <Link href="/de/#finder">Sauna-Finder</Link>
        <Link href="/de/produkte/">Produkte</Link>
        <Link href="/de/vergleiche/">Vergleiche</Link>
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
        <Image className="brand-icon" src="/brand/sauna-192.png" width={34} height={34} alt="" unoptimized /><span>Select Your Sauna</span>
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
