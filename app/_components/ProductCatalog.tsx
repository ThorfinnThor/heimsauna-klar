"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { FinderFilters, Product } from "@/lib/products";
import { findProductsForFinder, formatPower, formatPrice, formatVoltage, getLowestOffer } from "@/lib/products";

type CategoryFilter = "all" | "sauna" | "infrared";
type PlaceFilter = "all" | "indoor" | "outdoor" | "mobile";
type PowerFilter = "all" | "230" | "400" | "wood" | "not-stated";
type CapacityFilter = "all" | "1" | "2" | "3-plus";
type SortOption = "name" | "price" | "footprint" | "capacity";

const finderValues = {
  place: ["indoor", "outdoor", "mobile"],
  people: ["1", "2", "4", "flex"],
  footprint: ["compact", "standard", "open"],
  power: ["230", "400", "unknown"],
  budget: ["lean", "mid", "open"],
  heat: ["traditional", "infrared", "open"],
} as const;

function readFinderFilters(search: string): FinderFilters | null {
  const params = new URLSearchParams(search);
  if (params.get("finder") !== "1") return null;

  const values: Partial<Record<keyof FinderFilters, string>> = {};
  for (const key of Object.keys(finderValues) as Array<keyof FinderFilters>) {
    const value = params.get(key);
    if (!value || !(finderValues[key] as readonly string[]).includes(value)) return null;
    values[key] = value;
  }
  return values as FinderFilters;
}

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("catalog-location-change", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("catalog-location-change", callback);
  };
}

function getLocationSearch() {
  return window.location.search;
}

function getServerLocationSearch() {
  return "";
}

function finderSelectionLabels(filters: FinderFilters) {
  return [
    filters.place === "indoor" ? "Innenraum" : filters.place === "outdoor" ? "Garten" : "Flexibel",
    filters.people === "flex" ? "Personenzahl offen" : `${filters.people} ${filters.people === "1" ? "Person" : "Personen"}`,
    filters.footprint === "compact" ? "bis 3 m²" : filters.footprint === "standard" ? "bis 6 m²" : "Fläche offen",
    filters.power === "unknown" ? "Anschluss unbekannt" : `${filters.power} V`,
    filters.budget === "lean" ? "bis 2.500 €" : filters.budget === "mid" ? "bis 6.000 €" : "Budget offen",
    filters.heat === "traditional" ? "Klassische Sauna" : filters.heat === "infrared" ? "Infrarot" : "Wärmeart offen",
  ];
}

function matchesCapacity(product: Product, capacity: CapacityFilter) {
  if (capacity === "all") return true;
  if (capacity === "3-plus") return product.people.max >= 3;
  return product.people.max === Number(capacity);
}

export function ProductCatalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [place, setPlace] = useState<PlaceFilter>("all");
  const [power, setPower] = useState<PowerFilter>("all");
  const [capacity, setCapacity] = useState<CapacityFilter>("all");
  const [sort, setSort] = useState<SortOption>("name");
  const locationSearch = useSyncExternalStore(subscribeToLocation, getLocationSearch, getServerLocationSearch);
  const finderFilters = useMemo(() => readFinderFilters(locationSearch), [locationSearch]);

  const finderResult = useMemo(
    () => finderFilters ? findProductsForFinder(products, finderFilters) : null,
    [finderFilters, products],
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("de-DE");

    const finderProducts = finderResult
      ? (finderResult.matches.length > 0 ? finderResult.matches : finderResult.alternativeMatches).map((match) => match.product)
      : products;

    return finderProducts
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
        const matchesPlace = place === "all"
          || (place === "mobile" ? product.category === "portable" || product.category === "tent" : product.sauna.indoor_outdoor === place);
        const matchesPower = power === "all"
          || (power === "not-stated" ? product.power.voltage === "none" : product.power.voltage === (power === "wood" ? "wood" : Number(power)));

        return matchesQuery && matchesCategory && matchesPlace && matchesPower && matchesCapacity(product, capacity);
      })
      .sort((a, b) => {
        if (sort === "price") {
          return (getLowestOffer(a)?.price ?? Number.POSITIVE_INFINITY)
            - (getLowestOffer(b)?.price ?? Number.POSITIVE_INFINITY);
        }
        if (sort === "footprint") {
          return (a.dimensions_cm.width * a.dimensions_cm.depth)
            - (b.dimensions_cm.width * b.dimensions_cm.depth);
        }
        if (sort === "capacity") return b.people.max - a.people.max;

        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "de");
      });
  }, [capacity, category, finderResult, place, power, products, query, sort]);

  const familyCounts = useMemo(() => products.reduce((counts, product) => {
    if (!product.family) return counts;
    counts.set(product.family.id, (counts.get(product.family.id) ?? 0) + 1);
    return counts;
  }, new Map<string, number>()), [products]);

  const finderDifferenceByProduct = useMemo(() => new Map(
    finderResult?.alternativeMatches.map((match) => [match.product.product_id, match.differences]) ?? [],
  ), [finderResult]);

  const saunaProducts = visibleProducts.filter((product) => product.category !== "infrared");
  const infraredProducts = visibleProducts.filter((product) => product.category === "infrared");
  const hasActiveFilters = finderFilters !== null || query !== "" || category !== "all" || place !== "all" || power !== "all" || capacity !== "all" || sort !== "name";

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setPlace("all");
    setPower("all");
    setCapacity("all");
    setSort("name");
    window.history.replaceState(null, "", "/de/produkte/#catalog-results");
    window.dispatchEvent(new Event("catalog-location-change"));
  };

  return (
    <section className="catalog-list page-shell" id="catalog-results" aria-label="Verifizierte Produkte">
      {finderFilters && finderResult ? (
        <div className="catalog-finder-summary">
          <div>
            <p className="result-kicker">Sauna-Finder</p>
            <h2>{finderResult.matches.length > 0 ? `${finderResult.matches.length} Treffer` : "Keine genaue Übereinstimmung"}</h2>
            <p>
              {finderResult.matches.length > 0
                ? "Diese Produkte entsprechen den ausgewählten Angaben im aktuellen Katalog. Montageabstände und örtliche Anschlussbedingungen müssen zusätzlich geprüft werden."
                : `${finderResult.alternativeMatches.length} nächstliegende Datensätze werden mit ihren Abweichungen angezeigt. So bleibt sichtbar, welches Kriterium für eine passende Auswahl geändert werden müsste.`}
            </p>
          </div>
          <div className="catalog-finder-selection" aria-label="Gewählte Kriterien">
            {finderSelectionLabels(finderFilters).map((label) => <span key={label}>{label}</span>)}
          </div>
          <div className="catalog-finder-actions">
            <Link href="/de/#finder">Auswahl ändern</Link>
            <button type="button" onClick={resetFilters}>Alle Produkte anzeigen</button>
          </div>
        </div>
      ) : null}
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
          <label htmlFor="catalog-place">Aufstellort</label>
          <select
            id="catalog-place"
            value={place}
            onChange={(event) => setPlace(event.target.value as PlaceFilter)}
          >
            <option value="all">Innen &amp; außen</option>
            <option value="indoor">Innenraum</option>
            <option value="outdoor">Garten / außen</option>
            <option value="mobile">Mobil / Zelt</option>
          </select>
        </div>
        <div className="catalog-control">
          <label htmlFor="catalog-power">Anschluss</label>
          <select
            id="catalog-power"
            value={power}
            onChange={(event) => setPower(event.target.value as PowerFilter)}
          >
            <option value="all">Alle Anschlussstände</option>
            <option value="230">230 V ausgewiesen</option>
            <option value="400">400 V ausgewiesen</option>
            <option value="wood">Holzofen</option>
            <option value="not-stated">Nicht ausgewiesen</option>
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
          <ProductGroup id="sauna-bio" title="Sauna & Bio" products={saunaProducts} offset={0} familyCounts={familyCounts} finderDifferenceByProduct={finderDifferenceByProduct} />
          <ProductGroup id="infrarotkabinen" title="Infrarotkabinen" products={infraredProducts} offset={saunaProducts.length} familyCounts={familyCounts} finderDifferenceByProduct={finderDifferenceByProduct} />
        </>
      ) : (
        <div className="catalog-empty">
          <h2>Keine passenden Datensätze</h2>
          <p>Ändere die Filter oder setze sie zurück, um weitere Produkte anzuzeigen.</p>
          <button type="button" onClick={resetFilters}>Alle Produkte anzeigen</button>
        </div>
      )}
    </section>
  );
}

function ProductGroup({ id, title, products, offset, familyCounts, finderDifferenceByProduct }: {
  id: string;
  title: string;
  products: Product[];
  offset: number;
  familyCounts: Map<string, number>;
  finderDifferenceByProduct: Map<string, string[]>;
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
            {finderDifferenceByProduct.get(product.product_id)?.length ? (
              <p className="catalog-finder-difference">
                <strong>Abweichung zur Auswahl:</strong> {finderDifferenceByProduct.get(product.product_id)?.join(" · ")}
              </p>
            ) : null}
          </div>
          <dl>
            <div><dt>Maße</dt><dd>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm</dd></div>
            <div><dt>Strom</dt><dd>{formatVoltage(product.power.voltage)}{product.power.kw ? ` · ${formatPower(product.power.kw)}` : ""}</dd></div>
            <div><dt>Kapazität</dt><dd>bis {product.people.max} {product.people.max === 1 ? "Person" : "Personen"}</dd></div>
            <div><dt>Preisstatus</dt><dd>{formatPrice(product)}</dd></div>
          </dl>
          <Link className="catalog-row-link" href={`/de/produkte/${product.product_id}/`}>Datensatz ansehen <span aria-hidden="true">↗</span></Link>
        </article>
      ))}
    </section>
  );
}
