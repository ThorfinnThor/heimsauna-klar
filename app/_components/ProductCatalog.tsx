"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";

type CategoryFilter = "all" | "sauna" | "infrared";
type CapacityFilter = "all" | "1" | "2" | "3-plus";
type SortOption = "name" | "price" | "footprint" | "capacity";

const priceFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

function formatPrice(product: Product) {
  const offer = product.commercial.offers[0];
  if (!offer) return "Preis nicht verfügbar";

  const value = priceFormatter.format(offer.price);
  return product.commercial.price_status === "from" ? `ab ${value}` : value;
}

function matchesCapacity(product: Product, capacity: CapacityFilter) {
  if (capacity === "all") return true;
  if (capacity === "3-plus") return product.people.max >= 3;
  return product.people.max === Number(capacity);
}

export function ProductCatalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [capacity, setCapacity] = useState<CapacityFilter>("all");
  const [sort, setSort] = useState<SortOption>("name");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("de-DE");

    return products
      .filter((product) => {
        const matchesQuery = !normalizedQuery || [
          product.brand,
          product.model,
          product.sauna.type,
          product.family?.name ?? "",
          product.family?.variant ?? "",
        ]
          .some((value) => value.toLocaleLowerCase("de-DE").includes(normalizedQuery));
        const matchesCategory = category === "all"
          || (category === "infrared" ? product.category === "infrared" : product.category !== "infrared");

        return matchesQuery && matchesCategory && matchesCapacity(product, capacity);
      })
      .sort((a, b) => {
        if (sort === "price") {
          return (a.commercial.offers[0]?.price ?? Number.POSITIVE_INFINITY)
            - (b.commercial.offers[0]?.price ?? Number.POSITIVE_INFINITY);
        }
        if (sort === "footprint") {
          return (a.dimensions_cm.width * a.dimensions_cm.depth)
            - (b.dimensions_cm.width * b.dimensions_cm.depth);
        }
        if (sort === "capacity") return b.people.max - a.people.max;

        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "de");
      });
  }, [capacity, category, products, query, sort]);

  const familyCounts = useMemo(() => products.reduce((counts, product) => {
    if (!product.family) return counts;
    counts.set(product.family.id, (counts.get(product.family.id) ?? 0) + 1);
    return counts;
  }, new Map<string, number>()), [products]);

  const saunaProducts = visibleProducts.filter((product) => product.category !== "infrared");
  const infraredProducts = visibleProducts.filter((product) => product.category === "infrared");
  const hasActiveFilters = query !== "" || category !== "all" || capacity !== "all" || sort !== "name";

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setCapacity("all");
    setSort("name");
  };

  return (
    <section className="catalog-list page-shell" aria-label="Verifizierte Produkte">
      <div className="catalog-controls">
        <div className="catalog-control catalog-search">
          <label htmlFor="catalog-query">Suchbegriff</label>
          <input
            id="catalog-query"
            type="search"
            placeholder="Hersteller, Modell oder Typ"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="catalog-control">
          <label htmlFor="catalog-category">Bereich</label>
          <select
            id="catalog-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as CategoryFilter)}
          >
            <option value="all">Alle Bereiche</option>
            <option value="sauna">Sauna &amp; Bio</option>
            <option value="infrared">Infrarot</option>
          </select>
        </div>
        <div className="catalog-control">
          <label htmlFor="catalog-capacity">Kapazität</label>
          <select
            id="catalog-capacity"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value as CapacityFilter)}
          >
            <option value="all">Alle Größen</option>
            <option value="1">1 Person</option>
            <option value="2">2 Personen</option>
            <option value="3-plus">3+ Personen</option>
          </select>
        </div>
        <div className="catalog-control">
          <label htmlFor="catalog-sort">Sortierung</label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
          >
            <option value="name">Hersteller &amp; Modell</option>
            <option value="price">Preis aufsteigend</option>
            <option value="footprint">Stellfläche aufsteigend</option>
            <option value="capacity">Kapazität absteigend</option>
          </select>
        </div>
      </div>

      <div className="catalog-results-summary">
        <p aria-live="polite"><strong>{visibleProducts.length}</strong> von {products.length} Datensätzen</p>
        {hasActiveFilters && <button type="button" onClick={resetFilters}>Filter zurücksetzen</button>}
      </div>

      {visibleProducts.length > 0 ? (
        <>
          <ProductGroup id="sauna-bio" title="Sauna & Bio" products={saunaProducts} offset={0} familyCounts={familyCounts} />
          <ProductGroup id="infrarotkabinen" title="Infrarotkabinen" products={infraredProducts} offset={saunaProducts.length} familyCounts={familyCounts} />
        </>
      ) : (
        <div className="catalog-empty">
          <h2>Keine passenden Datensätze</h2>
          <p>Ändere die Filter oder setze sie zurück. Das Ergebnis ist keine Aussage zur Marktverfügbarkeit.</p>
          <button type="button" onClick={resetFilters}>Alle Produkte anzeigen</button>
        </div>
      )}
    </section>
  );
}

function ProductGroup({ id, title, products, offset, familyCounts }: {
  id: string;
  title: string;
  products: Product[];
  offset: number;
  familyCounts: Map<string, number>;
}) {
  if (products.length === 0) return null;

  return (
    <section className="catalog-group" aria-labelledby={`group-${id}`}>
      <div className="catalog-group-head">
        <h2 id={`group-${id}`}>{title}</h2>
        <span>{products.length} {products.length === 1 ? "Datensatz" : "Datensätze"}</span>
      </div>
      {products.map((product, index) => (
        <article className="catalog-row" key={product.product_id}>
          <span className="catalog-index">{String(offset + index + 1).padStart(2, "0")}</span>
          <div>
            <p className="type-label">{product.brand} · {product.sauna.type}</p>
            <h3>{product.model}</h3>
            {product.family && (
              <p className="catalog-family-note">
                Produktreihe {product.family.name} · Ausführung {product.family.variant} · {familyCounts.get(product.family.id)} Varianten
              </p>
            )}
            <p>{product.editorial.disclosure}</p>
          </div>
          <dl>
            <div><dt>Maße</dt><dd>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm</dd></div>
            <div><dt>Strom</dt><dd>{product.power.voltage} V{product.power.kw ? ` · ${product.power.kw} kW` : ""}</dd></div>
            <div><dt>Kapazität</dt><dd>bis {product.people.max} {product.people.max === 1 ? "Person" : "Personen"}</dd></div>
            <div><dt>Preisstatus</dt><dd>{formatPrice(product)}</dd></div>
          </dl>
          <Link className="catalog-row-link" href={`/de/produkte/${product.product_id}/`}>Datensatz ansehen <span aria-hidden="true">↗</span></Link>
        </article>
      ))}
    </section>
  );
}
