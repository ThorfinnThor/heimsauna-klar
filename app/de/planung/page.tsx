import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { planningGuides } from "@/lib/planning-guides";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Sauna planen: Platz, Lüftung, Boden und Kosten",
  description: "Die wichtigsten Planungsschritte vor dem Saunakauf – quellenbasiert, produktspezifisch und ohne pauschale Versprechen.",
  alternates: { canonical: "/de/planung/" },
};

export default function PlanningHubPage() {
  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: "Sauna planen", description: metadata.description as string, path: "/de/planung/" })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Planung", path: "/de/planung/" }])} />
      <SiteHeader />
      <section className="page-hero page-shell">
        <nav className="breadcrumbs" aria-label="Brotkrümelnavigation"><Link href="/de/">Start</Link><span>/</span><span>Planung</span></nav>
        <p className="eyebrow">Sauna planen · vor dem Produktvergleich</p>
        <h1>Erst den Raum klären.<span>Dann das Modell.</span></h1>
        <p>Vier Planungsblöcke übersetzen Herstelleranleitungen und aktuelle Produktdaten in prüfbare Entscheidungen für dein Zuhause.</p>
      </section>
      <section className="planning-hub page-shell" aria-labelledby="planning-hub-title">
        <div className="collection-index-head"><div><p className="eyebrow">Planungszentrale</p><h2 id="planning-hub-title">Die vier Fragen vor dem Kauf.</h2></div><p>Jede Seite nennt ihre Quellen, ihr Prüfdatum und die Grenzen pauschaler Regeln.</p></div>
        <div className="planning-hub-grid">{planningGuides.map((guide, index) => <Link href={`/de/planung/${guide.slug}/`} key={guide.slug}><small>0{index + 1} · aktualisiert {guide.updated_at.split("-").reverse().join(".")}</small><strong>{guide.title}</strong><span>{guide.description} ↗</span></Link>)}</div>
      </section>
      <SiteFooter />
    </main>
  );
}
