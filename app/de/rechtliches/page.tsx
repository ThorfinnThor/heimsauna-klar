import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import legal from "@/content/de/legal.json";

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
        <p className="eyebrow">Vor Veröffentlichung ausfüllen</p>
        <h1>Rechtliches,<span>ohne Platzhalter zu verstecken.</span></h1>
        <p className="legal-intro">{legal.notice}</p>

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
          <div><h2 id="affiliate-title">{legal.affiliate.title}</h2><p>{legal.affiliate.intro}</p>{legal.affiliate.sections.map((section) => <div className="legal-subsection" key={section.title}><h3>{section.title}</h3><p>{section.copy}</p></div>)}</div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
