import { getUsConfigurationsForProduct, getUsPublicProducts, getUsResearchProducts } from "./catalog.ts";
import type { UsCatalogItem } from "./catalog-filter.ts";
import type { UsFact, UsMarketProduct, UsProductConfiguration } from "./types.ts";

function documentedValue<T>(fact: UsFact<T> | undefined): T | null {
  return fact?.status === "documented" ? fact.value : null;
}

function formatMeasurement(value: { value: number; unit: string }) {
  return `${value.value} ${value.unit}`;
}

function catalogConfiguration(product: UsMarketProduct): UsProductConfiguration | undefined {
  const configurations = getUsConfigurationsForProduct(product.id);
  return configurations.find((entry) => entry.publication_status === "published")
    ?? configurations.find((entry) => entry.publication_status === "reviewed")
    ?? configurations[0];
}

function buildCatalogItem(product: UsMarketProduct): UsCatalogItem {
  const configuration = catalogConfiguration(product);
  const exterior = documentedValue(configuration?.dimensions.exterior);
  const voltageValues = configuration?.electrical_supply_options.flatMap((option) =>
    option.requirements.flatMap((requirement) => {
      const voltage = documentedValue(requirement.voltage_v);
      return voltage === null ? [] : [voltage];
    })) ?? [];
  const voltages = [...new Set(voltageValues)].sort((left, right) => left - right);

  return {
    id: product.id,
    slug: product.slug,
    brand: product.brand_name,
    model: product.model,
    form: documentedValue(product.form),
    heatType: documentedValue(product.heat_type),
    placements: documentedValue(product.placements),
    seatedCapacity: documentedValue(configuration?.capacity.seated),
    voltages: voltages.length > 0 ? voltages : null,
    exteriorDimensions: exterior
      ? `${formatMeasurement(exterior.width)} × ${formatMeasurement(exterior.depth)} × ${formatMeasurement(exterior.height)}`
      : null,
  };
}

export function buildUsCatalogItems(products: UsMarketProduct[]): UsCatalogItem[] {
  return products.map(buildCatalogItem).sort((left, right) =>
    left.brand.localeCompare(right.brand, "en-US") || left.model.localeCompare(right.model, "en-US"));
}

export function getUsPublicCatalogItems(): UsCatalogItem[] {
  return buildUsCatalogItems(getUsPublicProducts());
}

export function getUsResearchCatalogItems(): UsCatalogItem[] {
  return buildUsCatalogItems(getUsResearchProducts());
}
