import Link from "next/link";
import { Breadcrumbs, InlineLinks } from "@/app/_components/Blocks";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { createPageMetadata } from "@/lib/metadata";
import { getPlanningGuide, planningGroups } from "@/lib/planning-guides";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const title = "Sauna planen: Ratgeber";
const description = "Ratgeber für die Sauna zu Hause: Platz, Strom, Lüftung, Fundament und Kosten. Kurz erklärt, mit Quellen und passenden Modellen.";
const path = "/de/planung/";

export const metadata = createPageMetadata({ title, description, path });

export default function PlanningHubPage() {
  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title, description, path })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Ratgeber", path }])} />
      <SiteHeader />
      <div className="wrap page">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Ratgeber" }]} />
        <h1>Ratgeber</h1>
        <p className="text">Vor allem Platz und Strom solltest du klären, bevor du bestellst. Hier steht, was du messen und fragen musst.</p>
        {planningGroups.map((group) => (
          <section id={group.id} key={group.id}>
            <h2>{group.title}</h2>
            <ul className="articles">
              {group.guide_slugs.flatMap((slug) => {
                const guide = getPlanningGuide(slug);
                return guide ? [<li key={slug}><Link href={`/de/planung/${slug}/`}>{guide.title}</Link><p>{guide.description}</p></li>] : [];
              })}
            </ul>
            <InlineLinks lead="Passende Listen:" links={group.collection_links} />
          </section>
        ))}
      </div>
      <SiteFooter />
    </main>
  );
}
