import Link from "next/link";
import { Breadcrumbs } from "@/app/_components/Blocks";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import legal from "@/content/de/legal.json";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Impressum und Datenschutz",
  description: "Impressum, Datenschutzerklärung und Hinweise zu Affiliate-Links von Select Your Sauna.",
  path: "/de/rechtliches/",
});

export default function LegalPage() {
  return (
    <main>
      <SiteHeader />
      <article className="wrap page legal">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Impressum und Datenschutz" }]} />
        <h1>Impressum und Datenschutz</h1>
        <div className="text">
          <section id="impressum">
            <h2>{legal.impressum.title}</h2>
            <p>{legal.impressum.intro}</p>
            <p>{legal.impressum.fields.map((field) => <span key={field}>{field}<br /></span>)}</p>
            <p>E-Mail: <a href={`mailto:${legal.impressum.email}`}>{legal.impressum.email}</a></p>
          </section>

          <section id="datenschutz">
            <h2>{legal.privacy.title}</h2>
            <p>{legal.privacy.intro}</p>
            {legal.privacy.sections.map((section) => <div id={"id" in section ? section.id : undefined} key={section.title}><h3>{section.title}</h3><p>{section.copy}</p></div>)}
          </section>

          <section id="affiliate">
            <h2>{legal.affiliate.title}</h2>
            <p>{legal.affiliate.intro}</p>
            {legal.affiliate.sections.map((section) => <div key={section.title}><h3>{section.title}</h3><p>{section.copy}</p></div>)}
            <p><Link href="/de/transparenz/affiliate/">Welche Shops uns eine Provision zahlen</Link></p>
          </section>

          <section id="rechtsquellen">
            <h2>Gesetze und Quellen</h2>
            <ul>{legal.references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></li>)}</ul>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
