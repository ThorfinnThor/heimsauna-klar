import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import legal from "@/content/de/legal.json";
import { formatGermanDate } from "@/lib/products";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Impressum und Datenschutz",
  description: "Impressum, Datenschutzerklärung und Affiliate-Transparenz von Select Your Sauna und SeitenHafen361.",
  path: "/de/rechtliches/",
});

export default function LegalPage() {
  return (
    <main>
      <SiteHeader />
      <article className="legal-page page-shell">
        <nav className="breadcrumbs" aria-label="Brotkrümelnavigation"><Link href="/de/">Start</Link><span>/</span><span>Rechtliches</span></nav>
        <p className="eyebrow">Rechtliches · Stand {formatGermanDate(legal.updated_at)}</p>
        <h1>Impressum<span>und Datenschutz.</span></h1>
        <p className="legal-intro">{legal.notice}</p>

        <section className="legal-block" id="impressum" aria-labelledby="impressum-title">
          <p className="eyebrow">01</p>
          <div>
            <h2 id="impressum-title">{legal.impressum.title}</h2>
            <p>{legal.impressum.intro}</p>
            <ul>{legal.impressum.fields.map((field) => <li key={field}>{field}</li>)}</ul>
            {legal.impressum.email
              ? <p>E-Mail: <a className="text-link" href={`mailto:${legal.impressum.email}`}>{legal.impressum.email}</a></p>
              : <p><strong>Kontakt-E-Mail:</strong> wird ergänzt.</p>}
          </div>
        </section>

        <section className="legal-block" id="datenschutz" aria-labelledby="privacy-title">
          <p className="eyebrow">02</p>
          <div><h2 id="privacy-title">{legal.privacy.title}</h2><p>{legal.privacy.intro}</p>{legal.privacy.sections.map((section) => <div className="legal-subsection" key={section.title}><h3>{section.title}</h3><p>{section.copy}</p></div>)}</div>
        </section>

        <section className="legal-block" id="affiliate" aria-labelledby="affiliate-title">
          <p className="eyebrow">03</p>
          <div><h2 id="affiliate-title">{legal.affiliate.title}</h2><p>{legal.affiliate.intro}</p><p><Link className="text-link" href="/de/transparenz/affiliate/">Aktuellen Affiliate-Status und Programmprüfung öffnen ↗</Link></p>{legal.affiliate.sections.map((section) => <div className="legal-subsection" key={section.title}><h3>{section.title}</h3><p>{section.copy}</p></div>)}</div>
        </section>

        <section className="legal-block" id="rechtsquellen" aria-labelledby="legal-references-title">
          <p className="eyebrow">04</p>
          <div><h2 id="legal-references-title">Rechtsquellen</h2><p>Diese offiziellen Quellen bilden die Grundlage der Angaben. Sie ersetzen keine individuelle Rechtsberatung.</p><ul>{legal.references.map((reference) => <li key={reference.url}><a className="text-link" href={reference.url} target="_blank" rel="noreferrer">{reference.title} · geprüft {formatGermanDate(reference.checked_at)} ↗</a></li>)}</ul></div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
