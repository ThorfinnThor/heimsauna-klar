import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import affiliate from "@/content/de/affiliate.json";
import { affiliatePrograms, getAffiliateStats, getMerchantOfferCounts, merchants } from "@/lib/affiliate";
import { formatGermanDate } from "@/lib/products";
import { createPageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const description = "Aktueller Affiliate-Status, Händlerabdeckung, Kennzeichnungsregeln und geprüfte Partnerprogramm-Kandidaten von Select Your Sauna.";

export const metadata = createPageMetadata({
  title: "Affiliate-Transparenz: Status, Regeln und Partnerprogramme",
  description,
  path: "/de/transparenz/affiliate/",
});

export default function AffiliateTransparencyPage() {
  const stats = getAffiliateStats();
  const merchantCounts = getMerchantOfferCounts();
  const path = "/de/transparenz/affiliate/";

  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: affiliate.title, description, path })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Transparenz", path: "/de/rechtliches/" },
        { name: "Affiliate", path },
      ])} />
      <SiteHeader />
      <article>
        <header className="page-hero page-shell">
          <nav className="breadcrumbs" aria-label="Brotkrümelnavigation"><Link href="/de/">Start</Link><span>/</span><Link href="/de/rechtliches/">Transparenz</Link><span>/</span><span>Affiliate</span></nav>
          <p className="eyebrow">Transparenz · geprüft {formatGermanDate(affiliate.updated_at)}</p>
          <h1>{affiliate.title}<span>{affiliate.accent}</span></h1>
          <p>{affiliate.description}</p>
          <div className="catalog-metrics" aria-label="Aktueller Affiliate-Status">
            <span><strong>{stats.affiliateOfferCount}</strong> aktive Affiliate-Links</span>
            <span><strong>{stats.offerCount}</strong> dokumentierte Angebote</span>
            <span><strong>{stats.candidateProgramCount}</strong> geprüfte Kandidaten</span>
          </div>
        </header>

        <section className="planning-hub page-shell" aria-labelledby="affiliate-principles-title">
          <div className="collection-index-head"><div><p className="eyebrow">Feste Regeln</p><h2 id="affiliate-principles-title">Regeln für vergütete Händlerlinks</h2></div><p>Diese Regeln gelten für jeden Händler und jedes Netzwerk.</p></div>
          <div className="planning-hub-grid">
            {affiliate.principles.map((principle, index) => <article className="affiliate-principle" key={principle.title}><small>0{index + 1}</small><h3>{principle.title}</h3><span>{principle.copy}</span></article>)}
          </div>
        </section>

        <section className="collection-method page-shell" aria-labelledby="merchant-register-title">
          <div><p className="eyebrow">Händlerregister</p><h2 id="merchant-register-title">Zugelassene Händler und Domains</h2></div>
          <div>
            <ul>{merchantCounts.map(({ merchant, count }) => <li key={merchant.id}><strong>{merchant.name}</strong> · {merchant.kind === "manufacturer" ? "Hersteller/Direktanbieter" : "Affiliate-Advertiser"} · {count} Angebote · {merchant.allowed_hosts.join(", ")} · Affiliate-Status: {merchant.affiliate.status === "active" ? "aktiv" : "inaktiv"}</li>)}</ul>
            <p>Ein abweichender Händlername oder eine nicht registrierte Domain lässt den Datencheck fehlschlagen.</p>
          </div>
        </section>

        <section className="planning-hub page-shell" aria-labelledby="program-candidates-title">
          <div className="collection-index-head"><div><p className="eyebrow">Deutschland · noch nicht beantragt</p><h2 id="program-candidates-title">Programme für die Bewerbung</h2></div><p>Konditionen sind Momentaufnahmen mit Prüfdatum. Ein Programm wird erst nach Annahme und Produktabgleich aktiviert.</p></div>
          <div className="planning-hub-grid">
            {affiliatePrograms.map((program) => (
              <article className="affiliate-principle" key={program.id}>
                <small>{program.network} · Programm {program.program_id} · {program.status === "candidate" ? "Kandidat" : program.status}</small>
                <h3>{program.name}</h3>
                <span>{program.focus}</span>
                <dl className="affiliate-program-facts"><div><dt>Provision</dt><dd>{program.commission_snapshot}</dd></div><div><dt>Cookie</dt><dd>{program.cookie_days} Tage</dd></div></dl>
                <p><strong>Advertiser-Abdeckung:</strong> {program.advertiser_merchant_ids.length > 0
                  ? program.advertiser_merchant_ids.map((merchantId) => merchants.find((merchant) => merchant.id === merchantId)?.name ?? merchantId).join(", ")
                  : "Noch keinem Katalog-Händler zugeordnet"}</p>
                <a href={program.url} target="_blank" rel="noreferrer">Bewerbungsseite öffnen · geprüft {formatGermanDate(program.checked_at)} ↗</a>
              </article>
            ))}
          </div>
        </section>

        <section className="guide-checks page-shell" aria-labelledby="affiliate-gates-title">
          <div><p className="eyebrow">Aktivierungssperren</p><h2 id="affiliate-gates-title">Voraussetzungen vor der Aktivierung</h2></div>
          <ol>{affiliate.launch_gates.map((gate, index) => <li key={gate}><span>0{index + 1}</span><div><p>{gate}</p></div></li>)}</ol>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
