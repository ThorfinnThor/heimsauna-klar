import Link from "next/link";
import { Breadcrumbs } from "@/app/_components/Blocks";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import guide from "@/content/de/guides/230-v-sauna.json";
import { createPageMetadata } from "@/lib/metadata";
import { formatGermanDate, products } from "@/lib/products";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

const path = "/de/saunatechnik/230-v-sauna/";

export const metadata = createPageMetadata({ title: guide.title, description: guide.description, path, type: "article" });

export default function PlugInSaunaPage() {
  const count = products.filter((product) => product.power.voltage === 230).length;
  return (
    <main>
      <StructuredData data={articleJsonLd({ title: guide.title, description: guide.description, path, updatedAt: guide.updated_at, sources: guide.sources.map((source) => source.url) })} />
      <StructuredData data={breadcrumbJsonLd([{ name: "Start", path: "/de/" }, { name: "Ratgeber", path: "/de/planung/" }, { name: guide.title, path }])} />
      <SiteHeader />
      <article className="wrap page">
        <Breadcrumbs items={[{ label: "Start", href: "/de/" }, { label: "Ratgeber", href: "/de/planung/" }, { label: guide.title }]} />
        <h1>{guide.title}</h1>
        <p className="updated">Aktualisiert am {formatGermanDate(guide.updated_at)}</p>
        <div className="text">
          {guide.intro.map((paragraph) => <p className="lead" key={paragraph}>{paragraph}</p>)}
          <p><Link className="btn" href="/de/vergleiche/230-v-sauna/">{count} Saunen für 230 Volt ansehen</Link></p>
        </div>
        {guide.sections.map((section) => (
          <section className="text" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <section className="text">
          <h2>Im Vergleich mit 400 Volt</h2>
          <div className="table-wrap"><table>
            <thead><tr><th scope="col"></th><th scope="col">230 Volt</th><th scope="col">400 Volt</th></tr></thead>
            <tbody>{guide.comparison.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.v230}</td><td>{row.v400}</td></tr>)}</tbody>
          </table></div>
          <p>Mehr dazu: <Link href="/de/planung/230-v-vs-400-v-sauna/">230 V oder 400 V für die Sauna?</Link>, <Link href="/de/planung/saunagroesse-3-6-kw/">Wie groß darf eine Sauna mit 3,6 kW sein?</Link>, <Link href="/de/planung/temperatur-3-6-kw-sauna/">Wie heiß wird sie?</Link></p>
        </section>
        <section className="text sources">
          <h2>Quellen</h2>
          <ul>{guide.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
