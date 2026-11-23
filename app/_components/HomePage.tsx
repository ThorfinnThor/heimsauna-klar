import Link from "next/link";
import home from "@/content/de/home.json";
import { getPlanningGuide } from "@/lib/planning-guides";
import { getCatalogStats, products } from "@/lib/products";
import { ProductRow } from "./ProductRows";
import { SaunaFinder } from "./SaunaFinder";
import { SiteFooter, SiteHeader } from "./SiteChrome";

const featured = home.featured_product_ids.flatMap((id) => products.find((product) => product.product_id === id) ?? []);
const guides = home.guide_slugs.flatMap((slug) => getPlanningGuide(slug) ?? []);

export function HomePage() {
  const stats = getCatalogStats(products);
  return (
    <main>
      <SiteHeader />
      <div className="wrap page">
        <div className="home-top">
          <div>
            <h1>Welche Sauna passt zu dir nach Hause?</h1>
            {home.intro.map((paragraph) => <p className="lead" key={paragraph}>{paragraph.replace("{total}", String(stats.total))}</p>)}
            <p><Link href="/de/produkte/">Alle {stats.total} Saunen ansehen</Link></p>
          </div>
          <div id="finder"><SaunaFinder /></div>
        </div>

        <h2>Direkt zur passenden Liste</h2>
        <div className="cols">
          {home.entry_points.groups.map((group) => (
            <section key={group.title}>
              <h3>{group.title}</h3>
              <ul>{group.links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
            </section>
          ))}
        </div>

        <h2>Ein paar Modelle zum Einstieg</h2>
        <p className="text">{home.featured_intro}</p>
        <ul className="plist">{featured.map((product) => <ProductRow product={product} key={product.product_id} />)}</ul>

        <div className="two">
          <section>
            <h2>Sauna oder Infrarot?</h2>
            {home.types.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p><Link href="/de/vergleiche/finnische-sauna/">Finnische Saunen</Link>, <Link href="/de/indoor-sauna/infrarotkabine/">Infrarotkabinen</Link>, <Link href="/de/vergleiche/bio-sauna/">Bio-Saunen</Link></p>
          </section>
          <section>
            <h2>Gut zu wissen vor dem Kauf</h2>
            <ul>{guides.map((guide) => <li key={guide.slug}><Link href={`/de/planung/${guide.slug}/`}>{guide.title}</Link></li>)}</ul>
            <p><Link href="/de/planung/">Alle Ratgeber</Link></p>
          </section>
        </div>

        <section className="text">
          <h2>Woher die Angaben kommen</h2>
          {home.sources.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p><Link href="/de/ueber-uns/">Mehr über uns</Link></p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
