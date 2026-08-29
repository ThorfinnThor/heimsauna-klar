import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { getPlanningGuide, planningGroups } from "@/lib/planning-guides";
import { createPageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

export const metadata = createPageMetadata({
  title: "Sauna planen mit Platz, Lüftung, Boden und Kosten",
  description: "Planungshilfen zu Platz, Lüftung, Untergrund, Technik und Kosten mit Quellen und produktspezifischen Prüfpunkten.",
  path: "/de/planung/",
});

export default function PlanningHubPage() {
  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: "Sauna planen", description: metadata.description as string, path: "/de/planung/" })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Planung", path: "/de/planung/" }])} />
      <SiteHeader />
      <section className="page-hero page-shell">
        <nav className="breadcrumbs" aria-label="Brotkrümelnavigation"><Link href="/de/">Start</Link><span>/</span><span>Planung</span></nav>
        <p className="eyebrow">Sauna planen · vor dem Produktvergleich</p>
        <h1>Sauna planen<span>Raum, Anschluss und Budget belastbar prüfen.</span></h1>
        <p>Die Themen sind nach Standort, Aufbau, Technik und Budget geordnet. Jeder Ratgeber beantwortet eine eigene Planungsfrage mit Herstellerunterlagen und nachvollziehbaren Grenzen.</p>
        <nav className="planning-phase-nav" aria-label="Planungsphasen">
          {planningGroups.map((group) => <Link href={`#${group.id}`} key={group.id}>{group.number} {group.eyebrow}</Link>)}
        </nav>
      </section>
      <section className="planning-hub page-shell" aria-labelledby="planning-hub-title">
        <div className="collection-index-head"><div><p className="eyebrow">Themen nach Planungsfrage</p><h2 id="planning-hub-title">Der passende Einstieg hängt vom bereits bekannten Standort ab.</h2></div><p>Jede Seite nennt Quellen, Prüfdatum und die Grenzen pauschaler Regeln. Wer den Aufstellraum schon festgelegt hat, kann direkt bei Aufbau oder Technik einsteigen.</p></div>
        {planningGroups.map((group) => {
          const guides = group.guide_slugs.flatMap((slug) => {
            const guide = getPlanningGuide(slug);
            return guide ? [guide] : [];
          });

          return (
            <section className="planning-phase" id={group.id} key={group.id} aria-labelledby={`${group.id}-title`}>
              <div className="planning-phase-head">
                <span>{group.number}</span>
                <div><p className="eyebrow">{group.eyebrow}</p><h3 id={`${group.id}-title`}>{group.title}</h3><p>{group.description}</p></div>
              </div>
              <div className="planning-hub-grid">{guides.map((guide, index) => <Link href={`/de/planung/${guide.slug}/`} key={guide.slug}><small>{group.number}.{index + 1} · aktualisiert {guide.updated_at.split("-").reverse().join(".")}</small><strong>{guide.title}</strong><span>{guide.description} ↗</span></Link>)}</div>
            </section>
          );
        })}
      </section>
      <SiteFooter />
    </main>
  );
}
