import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import legal from "@/content/de/legal.json";
import { formatGermanDate } from "@/lib/products";

export const metadata: Metadata = {
  title: "Rechtliches und Transparenz",
  description: "Vorab-Entwurf für Impressum, Datenschutz sowie Affiliate- und Werbetransparenz.",
  alternates: { canonical: "/de/rechtliches/" },
  robots: { index: false, follow: false },
};

export default function LegalPage() {
  return (
    <main>
      <SiteHeader />
      <article className="legal-page page-shell">
        <nav className="breadcrumbs" aria-label="Brotkrümelnavigation"><Link href="/de/">Start</Link><span>/</span><span>Rechtliches</span></nav>
        <p className="eyebrow">Arbeitsstand · geprüft {formatGermanDate(legal.updated_at)}</p>
        <h1>Rechtliches,<span>ohne Platzhalter zu verstecken.</span></h1>
        <p className="legal-intro">{legal.notice} <Link className="text-link" href="/de/transparenz/launch/">Launch- und Indexierungsstatus öffnen ↗</Link></p>

        <section className="legal-block" id="impressum" aria-labelledby="impressum-title">
          <p className="eyebrow">01</p>
          <div><h2 id="impressum-title">{legal.impressum.title}</h2><p>{legal.impressum.intro}</p><ul>{legal.impressum.fields.map((field) => <li key={field}>{field}</li>)}</ul></div>
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
          <div><h2 id="legal-references-title">Rechtsquellen</h2><p>Diese offiziellen Quellen strukturieren den Entwurf. Sie ersetzen keine individuelle Rechtsberatung.</p><ul>{legal.references.map((reference) => <li key={reference.url}><a className="text-link" href={reference.url} target="_blank" rel="noreferrer">{reference.title} · geprüft {formatGermanDate(reference.checked_at)} ↗</a></li>)}</ul></div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
