import Link from "next/link";
import home from "@/content/de/home.json";
import archetypes from "@/data/sauna-archetypes.json";
import { formatPrice, products } from "@/lib/products";
import { SaunaFinder } from "./SaunaFinder";
import { SiteFooter, SiteHeader } from "./SiteChrome";

const Arrow = () => <span aria-hidden="true">↗</span>;

export function HomePage() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Unabhängig planen · technisch passend kaufen</p>
          <h1 id="hero-title">
            Nicht irgendeine Sauna.
            <span>Die, die bei dir wirklich passt.</span>
          </h1>
          <p className="hero-lede">{home.hero.lede}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#finder">
              Sauna-Typ ermitteln <Arrow />
            </a>
            <a className="text-link" href="#vergleich">Typen vergleichen <span aria-hidden="true">↓</span></a>
          </div>
          <ul className="constraint-list" aria-label="Zentrale Auswahlkriterien">
            {home.constraints.map((item, index) => (
              <li key={item.title}>
                <span>0{index + 1}</span>
                <div><strong>{item.title}</strong><small>{item.copy}</small></div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="hero-visual" aria-label="Planungsbeispiel für eine kompakte Sauna">
          <div className="visual-kicker"><span /> Planungsansicht · 1,8 m²</div>
          <div className="room-plan">
            <div className="dimension dimension-top">150 cm</div>
            <div className="dimension dimension-side">120 cm</div>
            <div className="sauna-shape">
              <div className="sauna-glow" />
              <div className="sauna-door" />
              <div className="sauna-bench" />
            </div>
            <div className="plan-note note-power"><span>230 V</span> normale Steckdose*</div>
            <div className="plan-note note-capacity"><span>1–2</span> Personen</div>
          </div>
          <p className="visual-footnote">* Je nach Modell und Herstellervorgabe. Netzspannungsarbeiten gehören in Fachhände.</p>
        </aside>
      </section>

      <section className="catalog-preview" aria-labelledby="catalog-title">
        <div className="catalog-preview-head">
          <div>
            <p className="eyebrow">Erste verifizierte Datensätze</p>
            <h2 id="catalog-title">Produkte, ohne erfundene Rangliste.</h2>
          </div>
          <Link className="text-link" href="/de/produkte/">Zum Produktkatalog <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="product-preview-grid">
          {products.map((product) => (
            <article className="product-preview-card" key={product.product_id}>
              <div className="product-preview-top">
                <span>{product.sauna.type}</span>
                <span>{product.power.voltage} V</span>
              </div>
              <p>{product.brand}</p>
              <h3>{product.model}</h3>
              <div className="product-preview-specs">
                <span><small>Maße B × T × H</small>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm</span>
                <span><small>Personen</small>{product.people.max}</span>
              </div>
              <div className="product-preview-bottom">
                <strong>{formatPrice(product)}</strong>
                <a href={`/de/produkte/${product.product_id}/`} aria-label={`${product.brand} ${product.model} ansehen`}>Details ↗</a>
              </div>
            </article>
          ))}
        </div>
        <p className="catalog-note">Preise zuletzt am 21.08.2026 geprüft. Noch keine Affiliate-Links und keine eigenen Produkttests.</p>
      </section>

      <section className="finder-section" id="finder" aria-labelledby="finder-title">
        <div className="section-heading">
          <p className="eyebrow">Sauna-Finder · erster Prototyp</p>
          <h2 id="finder-title">Drei Angaben. Eine klare Richtung.</h2>
          <p>Noch ohne Verkaufsranglisten: Der erste Schritt grenzt den technisch sinnvollen Sauna-Typ ein.</p>
        </div>
        <SaunaFinder archetypes={archetypes} products={products} />
      </section>

      <section className="comparison-section" id="vergleich" aria-labelledby="comparison-title">
        <div className="comparison-intro">
          <p className="eyebrow">Schnellvergleich</p>
          <h2 id="comparison-title">Vier Wege zur Heimsauna.</h2>
          <p>Die entscheidenden Unterschiede liegen oft vor dem Produktvergleich: Einbauort, Anschluss und Platz setzen den Rahmen.</p>
        </div>
        <div className="type-grid">
          {archetypes.map((item, index) => (
            <article className="type-card" key={item.id}>
              <div className="type-number">0{index + 1}</div>
              <p className="type-label">{item.label}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <dl>
                <div><dt>Platz</dt><dd>{item.space}</dd></div>
                <div><dt>Strom</dt><dd>{item.power}</dd></div>
                <div><dt>Ideal für</dt><dd>{item.idealFor}</dd></div>
              </dl>
              <span className="type-status">{item.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="principles" id="prinzipien" aria-labelledby="principles-title">
        <div>
          <p className="eyebrow eyebrow-light">Unser redaktioneller Standard</p>
          <h2 id="principles-title">Klarheit vor Kaufdruck.</h2>
        </div>
        <ol>
          {home.principles.map((item, index) => (
            <li key={item.title}>
              <span>0{index + 1}</span>
              <div><h3>{item.title}</h3><p>{item.copy}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter />
    </main>
  );
}
