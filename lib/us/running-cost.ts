import electricityDocument from "../../data/us/electricity-prices.json" with { type: "json" };

import type { UsProductConfiguration } from "./types.ts";

export interface UsElectricityPrices {
  schema_version: number;
  market: "US";
  source_id: string;
  period: string;
  period_label: string;
  sector: "residential";
  unit: "cents_per_kwh";
  us_average: number;
  states: Record<string, number>;
}

export const usElectricityPrices = electricityDocument as UsElectricityPrices;

/**
 * Highest documented electrical load of a configuration in watts: the sum of
 * every requirement of one supply option, taking the largest option. Returns
 * null when no requirement documents its rated power, so a missing value is
 * never treated as zero.
 */
export function ratedPowerW(configuration: UsProductConfiguration): number | null {
  let best: number | null = null;
  for (const option of configuration.electrical_supply_options) {
    const documented = option.requirements
      .map((requirement) => requirement.rated_power_w)
      .filter((fact) => fact.status === "documented")
      .map((fact) => (fact as { value: number }).value);
    if (documented.length === 0) continue;
    const total = documented.reduce((sum, watts) => sum + watts, 0);
    if (best === null || total > best) best = total;
  }
  return best;
}

/** Cost in US dollars of one hour at full rated power. */
export function costPerHourUsd(watts: number, centsPerKwh: number): number {
  return (watts / 1000) * (centsPerKwh / 100);
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function statePricesSorted(prices: UsElectricityPrices = usElectricityPrices) {
  return Object.entries(prices.states)
    .map(([state, cents]) => ({ state, cents }))
    .sort((left, right) => left.cents - right.cents || left.state.localeCompare(right.state, "en-US"));
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
