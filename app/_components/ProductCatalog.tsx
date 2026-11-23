"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { FinderFilters, Product } from "@/lib/products";
import { findProductsForFinder, getLowestOffer, matchesProductPlace } from "@/lib/products";
import { ProductRow } from "./ProductRows";

type CategoryFilter = "all" | "sauna" | "infrared";
type PlaceFilter = "all" | "indoor" | "outdoor" | "mobile";
type PowerFilter = "all" | "230" | "400" | "wood" | "not-stated";
type CapacityFilter = "all" | "1" | "2" | "3-plus";
const pageSize = 60;

type SortOption = "name" | "price" | "footprint" | "capacity";

const finderValues = {
  place: ["indoor", "outdoor", "mobile", "open"],
  people: ["1", "2", "4", "flex"],
  footprint: ["compact", "standard", "open"],
  power: ["230", "400", "wood", "unknown"],
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
  const labels = [
    filters.place === "indoor" ? "drinnen" : filters.place === "outdoor" ? "im Garten" : filters.place === "mobile" ? "Zelt oder mobil" : "",
    filters.people === "flex" ? "" : `${filters.people} ${filters.people === "1" ? "Person" : "Personen"}`,
    filters.footprint === "compact" ? "bis 3 m²" : filters.footprint === "standard" ? "bis 6 m²" : "",
    filters.power === "unknown" ? "" : filters.power === "wood" ? "Holzofen" : `${filters.power} Volt`,
    filters.budget === "lean" ? "bis 2.500 €" : filters.budget === "mid" ? "bis 6.000 €" : "",
    filters.heat === "traditional" ? "Sauna mit Ofen" : filters.heat === "infrared" ? "Infrarot" : "",
  ].filter(Boolean);
  return labels.length > 0 ? labels : ["alles egal"];
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
  const [sort, setSort] = useState<SortOption>("price");
  const [showAll, setShowAll] = useState(false);
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
        const matchesPlace = place === "all" || matchesProductPlace(product, place);
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

  const finderDifferenceByProduct = useMemo(() => new Map(
    finderResult?.alternativeMatches.map((match) => [match.product.product_id, match.differences]) ?? [],
  ), [finderResult]);

  const hasActiveFilters = finderFilters !== null || query !== "" || category !== "all" || place !== "all" || power !== "all" || capacity !== "all" || sort !== "price";

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setPlace("all");
    setPower("all");
    setCapacity("all");
    setSort("price");
    window.history.replaceState(null, "", "/de/produkte/#catalog-results");
    window.dispatchEvent(new Event("catalog-location-change"));
  };

  const applyFinderRelaxation = (key: keyof FinderFilters, value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("finder", "1");
    params.set(key, value);
    window.history.pushState(null, "", `/de/produkte/?${params.toString()}#catalog-results`);
    window.dispatchEvent(new Event("catalog-location-change"));
  };

  const shown = showAll ? visibleProducts : visibleProducts.slice(0, pageSize);

  return (
    <section id="catalog-results" aria-label="Saunen">
      {finderFilters && finderResult ? (
        <div>
          <h2>{finderResult.matches.length > 0 ? `${finderResult.matches.length} Saunen passen` : "Genau passend haben wir nichts"}</h2>
          <ul className="chips" aria-label="Deine Auswahl">{finderSelectionLabels(finderFilters).map((label) => <li key={label}>{label}</li>)}</ul>
          {finderResult.matches.length === 0 ? <p>Diese {finderResult.alternativeMatches.length} Modelle kommen am nächsten. Bei jedem steht, was abweicht.</p> : null}
          {finderResult.relaxations.length > 0 ? (
            <p className="actions">
              {finderResult.relaxations.map((relaxation) => (
                <button className="btn btn-plain" key={relaxation.key} type="button" onClick={() => applyFinderRelaxation(relaxation.key, relaxation.value)}>
                  {relaxation.label}: {relaxation.matchCount} Modelle
                </button>
              ))}
            </p>
          ) : null}
          <p className="actions"><Link href="/de/#finder">Auswahl ändern</Link><button className="linklike" type="button" onClick={resetFilters}>Alle Saunen zeigen</button></p>
        </div>
      ) : null}

      <div className="filters">
        <div className="fields fields-5">
          <label>Suche
            <input type="search" placeholder="Marke oder Modell" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label>Art
            <select value={category} onChange={(event) => setCategory(event.target.value as CategoryFilter)}>
              <option value="all">alle</option><option value="sauna">Sauna</option><option value="infrared">Infrarot</option>
            </select>
          </label>
          <label>Ort
            <select value={place} onChange={(event) => setPlace(event.target.value as PlaceFilter)}>
              <option value="all">alle</option><option value="indoor">drinnen</option><option value="outdoor">Garten</option><option value="mobile">mobil</option>
            </select>
          </label>
          <label>Strom
            <select value={power} onChange={(event) => setPower(event.target.value as PowerFilter)}>
              <option value="all">alle</option><option value="230">230 Volt</option><option value="400">400 Volt</option><option value="wood">Holzofen</option><option value="not-stated">nicht angegeben</option>
            </select>
          </label>
          <label>Personen
            <select value={capacity} onChange={(event) => setCapacity(event.target.value as CapacityFilter)}>
              <option value="all">alle</option><option value="1">1</option><option value="2">2</option><option value="3-plus">3 und mehr</option>
            </select>
          </label>
          <label>Sortieren
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
              <option value="price">Preis</option><option value="footprint">Größe</option><option value="capacity">Personen</option><option value="name">Name</option>
            </select>
          </label>
        </div>
      </div>

      <div className="result-count">
        <p aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? "Modell" : "Modelle"}</p>
        {hasActiveFilters ? <button className="linklike" type="button" onClick={resetFilters}>Filter zurücksetzen</button> : null}
      </div>

      {visibleProducts.length > 0 ? (
        <>
          <ul className="plist">{shown.map((product) => {
            const differences = finderDifferenceByProduct.get(product.product_id);
            return <ProductRow product={product} note={differences?.length ? `Weicht ab: ${differences.join(", ")}` : undefined} key={product.product_id} />;
          })}</ul>
          {shown.length < visibleProducts.length ? <p><button className="btn btn-plain" type="button" onClick={() => setShowAll(true)}>Alle {visibleProducts.length} Modelle zeigen</button></p> : null}
        </>
      ) : <p>Dazu haben wir nichts gefunden. Nimm einen Filter heraus, dann klappt es meistens.</p>}
    </section>
  );
}
