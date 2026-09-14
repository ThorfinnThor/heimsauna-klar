import type { UsFact, UsMarketProduct, UsProductConfiguration } from "./types.ts";

export const US_DIRECT_COMPARISON_MINIMUM = 2;
export const US_DIRECT_COMPARISON_MAXIMUM = 4;

export type UsDirectComparisonOption = {
  configurationId: string;
  productId: string;
  slug: string;
  brand: string;
  model: string;
  configurationLabel: string;
  heatType: string;
  placement: string;
  seatedCapacity: string;
  exteriorDimensions: string;
  electrical: string;
  requiredCircuit: string;
  connection: string;
  materials: string;
};

function documentedValue<T>(fact: UsFact<T>): T | null {
  return fact.status === "documented" ? fact.value : null;
}

function listLabel(values: string[] | null, formatter: (value: string) => string = (value) => value) {
  return values && values.length > 0 ? values.map(formatter).join(", ") : "Not documented";
}

function dimensionsLabel(configuration: UsProductConfiguration) {
  const dimensions = documentedValue(configuration.dimensions.exterior);
  if (!dimensions) return "Not documented";
  return [dimensions.width, dimensions.depth, dimensions.height]
    .map((measurement) => `${measurement.value} ${measurement.unit}`)
    .join(" × ");
}

function electricalValues<T extends string | number>(
  configuration: UsProductConfiguration,
  select: (requirement: UsProductConfiguration["electrical_supply_options"][number]["requirements"][number]) => UsFact<T>,
) {
  return [...new Set(configuration.electrical_supply_options.flatMap((option) =>
    option.requirements.flatMap((requirement) => {
      const value = documentedValue(select(requirement));
      return value === null ? [] : [value];
    })))]
    .sort((left, right) => String(left).localeCompare(String(right), "en", { numeric: true }));
}

function electricalLabel(configuration: UsProductConfiguration) {
  const voltages = electricalValues(configuration, (requirement) => requirement.voltage_v);
  const powers = electricalValues(configuration, (requirement) => requirement.rated_power_w);
  if (voltages.length === 0 && powers.length === 0) return "Not documented";
  return [
    voltages.length > 0 ? voltages.map((value) => `${value} V`).join(" or ") : null,
    powers.length > 0 ? powers.map((value) => `${Number(value).toLocaleString("en-US")} W`).join(" or ") : null,
  ].filter(Boolean).join(" · ");
}

function connectionLabel(configuration: UsProductConfiguration) {
  const connections = electricalValues(configuration, (requirement) => requirement.connection);
  const plugs = electricalValues(configuration, (requirement) => requirement.plug_type);
  if (connections.length === 0 && plugs.length === 0) return "Not documented";
  return [...connections, ...plugs].join(" · ");
}

export function buildUsDirectComparisonOptions(
  products: UsMarketProduct[],
  configurations: UsProductConfiguration[],
): UsDirectComparisonOption[] {
  const productsById = new Map(products
    .filter((product) => product.market === "US")
    .map((product) => [product.id, product]));

  return configurations.flatMap((configuration) => {
    if (configuration.market !== "US") return [];
    const product = productsById.get(configuration.product_id);
    if (!product || !product.configuration_ids.includes(configuration.id)) return [];

    const capacity = documentedValue(configuration.capacity.seated);
    const heatType = documentedValue(product.heat_type);
    const placements = documentedValue(product.placements);
    const materials = documentedValue(configuration.materials);
    const circuits = electricalValues(configuration, (requirement) => requirement.required_circuit_a);

    return [{
      configurationId: configuration.id,
      productId: product.id,
      slug: product.slug,
      brand: product.brand_name,
      model: product.model,
      configurationLabel: configuration.label,
      heatType: heatType ? heatType.replaceAll("-", " ") : "Not documented",
      placement: listLabel(placements, (value) => value.replaceAll("-", " ")),
      seatedCapacity: capacity === null ? "Not documented" : `${capacity} seated`,
      exteriorDimensions: dimensionsLabel(configuration),
      electrical: electricalLabel(configuration),
      requiredCircuit: circuits.length > 0 ? circuits.map((value) => `${value} A`).join(" or ") : "Not documented",
      connection: connectionLabel(configuration),
      materials: listLabel(materials),
    }];
  }).sort((left, right) =>
    `${left.brand}\u0000${left.model}\u0000${left.configurationLabel}`
      .localeCompare(`${right.brand}\u0000${right.model}\u0000${right.configurationLabel}`, "en", { numeric: true }));
}

export function normalizeUsDirectComparisonSelection(
  values: string[],
  availableConfigurationIds: Iterable<string>,
): string[] {
  const available = new Set(availableConfigurationIds);
  const selected: string[] = [];
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized || !available.has(normalized) || selected.includes(normalized)) continue;
    selected.push(normalized);
    if (selected.length === US_DIRECT_COMPARISON_MAXIMUM) break;
  }
  return selected;
}

export function readUsDirectComparisonSelection(
  params: { getAll(name: string): string[] },
  availableConfigurationIds: Iterable<string>,
) {
  return normalizeUsDirectComparisonSelection(params.getAll("model"), availableConfigurationIds);
}

export function serializeUsDirectComparisonSelection(configurationIds: string[]) {
  const params = new URLSearchParams();
  for (const configurationId of configurationIds.slice(0, US_DIRECT_COMPARISON_MAXIMUM)) {
    params.append("model", configurationId);
  }
  return params;
}
