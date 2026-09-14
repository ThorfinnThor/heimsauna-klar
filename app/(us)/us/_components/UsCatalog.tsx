"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import {
  filterUsCatalogItems,
  normalizeUsCatalogFilters,
  type UsCatalogFilters,
  type UsCatalogItem,
} from "@/lib/us/catalog-filter";

function filtersFromParams(params: { get(name: string): string | null }): UsCatalogFilters {
  return normalizeUsCatalogFilters({
    query: params.get("q") ?? "",
    placement: params.get("placement") ?? "all",
    capacity: params.get("capacity") ?? "all",
    voltage: params.get("voltage") ?? "all",
    brand: params.get("brand") ?? "all",
  });
}

function displayValue(value: string | number | null, suffix = "") {
  return value === null ? "Not documented" : `${value}${suffix}`;
}

const filterChangeEvent = "selectyoursauna:us-catalog-filter";

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(filterChangeEvent, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(filterChangeEvent, callback);
  };
}

function getLocationSearch() {
  return window.location.search;
}

function getServerSearch() {
  return "";
}

export function UsCatalog({ items }: { items: UsCatalogItem[] }) {
  const locationSearch = useSyncExternalStore(subscribeToLocation, getLocationSearch, getServerSearch);
  const filters = filtersFromParams(new URLSearchParams(locationSearch));

  const brands = useMemo(() => [...new Set(items.map((item) => item.brand))].sort(), [items]);
  const results = filterUsCatalogItems(items, filters);
  const hasActiveFilters = Boolean(filters.query) || [filters.placement, filters.capacity, filters.voltage, filters.brand]
    .some((value) => value !== "all");

  function update<K extends keyof UsCatalogFilters>(key: K, value: UsCatalogFilters[K]) {
    const next = normalizeUsCatalogFilters({ ...filters, [key]: value });
    const params = new URLSearchParams();
    if (next.query) params.set("q", next.query);
    for (const name of ["placement", "capacity", "voltage", "brand"] as const) {
      if (next[name] !== "all") params.set(name, next[name]);
    }
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    window.dispatchEvent(new Event(filterChangeEvent));
  }

  if (items.length === 0) {
    return (
      <section className="us-catalog-empty" aria-live="polite">
        <h2>The US catalog is not public yet.</h2>
        <p>Only products that complete source, configuration, editorial and publication review will appear here.</p>
      </section>
    );
  }

  return (
    <>
      <form className="us-catalog-filters" onSubmit={(event) => event.preventDefault()}>
        <label className="us-catalog-search">
          <span>Search by brand or model</span>
          <input value={filters.query} onChange={(event) => update("query", event.target.value)} type="search" />
        </label>
        <label>
          <span>Placement</span>
          <select value={filters.placement} onChange={(event) => update("placement", event.target.value as UsCatalogFilters["placement"])}>
            <option value="all">All</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option>
          </select>
        </label>
        <label>
          <span>Seated capacity</span>
          <select value={filters.capacity} onChange={(event) => update("capacity", event.target.value as UsCatalogFilters["capacity"])}>
            <option value="all">All</option><option value="1">1 person</option><option value="2">2 people</option><option value="4-plus">4 or more</option>
          </select>
        </label>
        <label>
          <span>Voltage</span>
          <select value={filters.voltage} onChange={(event) => update("voltage", event.target.value as UsCatalogFilters["voltage"])}>
            <option value="all">All</option><option value="120">120 V</option><option value="240">240 V</option>
          </select>
        </label>
        <label>
          <span>Brand</span>
          <select value={filters.brand} onChange={(event) => update("brand", event.target.value)}>
            <option value="all">All</option>{brands.map((brand) => <option value={brand} key={brand}>{brand}</option>)}
          </select>
        </label>
      </form>

      <div className="us-catalog-summary" aria-live="polite">
        <span><strong>{results.length}</strong> {results.length === 1 ? "product" : "products"}</span>
        {hasActiveFilters ? <button type="button" onClick={() => {
          window.history.replaceState(null, "", window.location.pathname);
          window.dispatchEvent(new Event(filterChangeEvent));
        }}>Clear filters</button> : null}
      </div>
      <div className="us-catalog-grid">
        {results.map((item) => (
          <article className="us-catalog-card" key={item.id}>
            <p className="eyebrow">{item.brand}</p>
            <h2>{item.model}</h2>
            <p>{item.form ?? "Product form not documented"}</p>
            <dl>
              <div><dt>Placement</dt><dd>{item.placements?.join(", ") ?? "Not documented"}</dd></div>
              <div><dt>Capacity</dt><dd>{displayValue(item.seatedCapacity, item.seatedCapacity === 1 ? " person" : " people")}</dd></div>
              <div><dt>Electrical</dt><dd>{item.voltages?.map((value) => `${value} V`).join(" or ") ?? "Not documented"}</dd></div>
              <div><dt>Exterior W × D × H</dt><dd>{item.exteriorDimensions ?? "Not documented"}</dd></div>
            </dl>
            <Link href={`/us/saunas/${item.slug}/`}>View details <span aria-hidden="true">↗</span></Link>
          </article>
        ))}
      </div>
      {results.length === 0 ? <div className="us-catalog-no-results"><h2>No reviewed products match these filters.</h2><p>Clear one or more filters to broaden the list. Products with undocumented values are not treated as matches for a selected technical filter.</p></div> : null}
    </>
  );
}
