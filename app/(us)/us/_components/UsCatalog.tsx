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

  if (items.length === 0) return <p aria-live="polite">There are no saunas to show yet.</p>;

  return (
    <>
      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <div className="fields fields-5">
          <label>Search
            <input value={filters.query} onChange={(event) => update("query", event.target.value)} type="search" placeholder="Brand or model" />
          </label>
          <label>Indoor or outdoor
            <select value={filters.placement} onChange={(event) => update("placement", event.target.value as UsCatalogFilters["placement"])}>
              <option value="all">Any</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option>
            </select>
          </label>
          <label>Seats
            <select value={filters.capacity} onChange={(event) => update("capacity", event.target.value as UsCatalogFilters["capacity"])}>
              <option value="all">Any</option><option value="1">1</option><option value="2">2</option><option value="4-plus">4 or more</option>
            </select>
          </label>
          <label>Voltage
            <select value={filters.voltage} onChange={(event) => update("voltage", event.target.value as UsCatalogFilters["voltage"])}>
              <option value="all">Any</option><option value="120">120 V</option><option value="240">240 V</option>
            </select>
          </label>
          <label>Brand
            <select value={filters.brand} onChange={(event) => update("brand", event.target.value)}>
              <option value="all">Any</option>{brands.map((brand) => <option value={brand} key={brand}>{brand}</option>)}
            </select>
          </label>
        </div>
      </form>

      <div className="result-count" aria-live="polite">
        <p>{results.length} {results.length === 1 ? "sauna" : "saunas"}</p>
        {hasActiveFilters ? <button className="linklike" type="button" onClick={() => {
          window.history.replaceState(null, "", window.location.pathname);
          window.dispatchEvent(new Event(filterChangeEvent));
        }}>Clear filters</button> : null}
      </div>
      <UsSaunaRows items={results} />
      {results.length === 0 ? <p>Nothing matches all of these. Try clearing one filter. If a maker doesn&apos;t state a value, the model won&apos;t show up under that filter.</p> : null}
    </>
  );
}

export function UsSaunaRows({ items }: { items: UsCatalogItem[] }) {
  return (
    <ul className="plist us-results">
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <h3><Link href={`/us/saunas/${item.slug}/`}>{item.brand} {item.model}</Link></h3>
            <p>{[
              [item.heatType, item.placements?.join(" or ")].filter(Boolean).join(", "),
              item.seatedCapacity === null ? "" : `${item.seatedCapacity} ${item.seatedCapacity === 1 ? "seat" : "seats"}`,
              item.exteriorDimensions?.replace(/ in(?= ×)/g, "") ?? "",
              item.voltages?.map((value) => `${value} V`).join(" or ") ?? "",
            ].filter(Boolean).join(" · ")}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
