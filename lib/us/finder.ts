import type {
  UsElectricalRequirement,
  UsFact,
  UsMarketProduct,
  UsMeasurement,
  UsOffer,
  UsProductConfiguration,
} from "./types.ts";
import { classifyUsOfferPrice } from "./offer-policy.ts";

export type UsFinderStrength = "hard" | "preference";
export type UsFinderCriterion<T> = { value: T; strength: UsFinderStrength };

export type UsFinderElectricalSupply = {
  voltageV: number;
  maxRequiredCircuitA?: number;
  connection?: "plug-in" | "hardwired";
};

export type UsFinderSpaceLimit = {
  width: number;
  depth: number;
  height: number;
  allowRotation: boolean;
};

export type UsFinderQuery = {
  productType?: UsFinderCriterion<"sauna-cabin" | "sauna-kit" | "sauna-tent">;
  heatType?: UsFinderCriterion<"traditional" | "infrared" | "hybrid">;
  placement?: UsFinderCriterion<"indoor" | "outdoor">;
  seatedPeople?: UsFinderCriterion<number>;
  maximumExteriorInches?: UsFinderCriterion<UsFinderSpaceLimit>;
  electrical?: UsFinderCriterion<
    | { mode: "electric"; supplies: UsFinderElectricalSupply[] }
    | { mode: "wood-fired" }
  >;
  budget?: UsFinderCriterion<{
    maxAmountMinor: number;
    requiredPriceScope: "sauna-kit" | "configured-sauna-package";
  }>;
};

export type UsFinderMatchStatus = "meets-known-criteria" | "needs-verification" | "excluded";

export type UsFinderMatchResult = {
  productId: string;
  configurationId: string;
  offerId?: string;
  selectedSupplyOptionId?: string;
  status: UsFinderMatchStatus;
  matchedCriteria: string[];
  unknownCriteria: string[];
  exclusionReasons: string[];
  matchedPreferences: string[];
  unknownPreferences: string[];
  unmetPreferences: string[];
  costScope: string;
  comparablePriceAmountMinor?: number;
  dataGapCount: number;
};

export type UsFinderInput = {
  products: UsMarketProduct[];
  configurations: UsProductConfiguration[];
  offers: UsOffer[];
  query: UsFinderQuery;
  asOf: string;
};

type MutableResult = Omit<UsFinderMatchResult, "status">;
type Evaluation = "match" | "unknown" | "mismatch";

const supportedFinderProductTypes = new Set(["sauna-cabin", "sauna-kit", "sauna-tent"]);
const statusPriority: Record<UsFinderMatchStatus, number> = {
  "meets-known-criteria": 0,
  "needs-verification": 1,
  excluded: 2,
};

function addUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function recordEvaluation(result: MutableResult, evaluation: Evaluation, strength: UsFinderStrength, code: string) {
  if (strength === "hard") {
    if (evaluation === "match") addUnique(result.matchedCriteria, code);
    else if (evaluation === "unknown") addUnique(result.unknownCriteria, code);
    else addUnique(result.exclusionReasons, code);
    return;
  }
  if (evaluation === "match") addUnique(result.matchedPreferences, code);
  else if (evaluation === "unknown") addUnique(result.unknownPreferences, code);
  else addUnique(result.unmetPreferences, code);
}

function factEvaluation<T>(fact: UsFact<T>, predicate: (value: T) => boolean): Evaluation {
  if (fact.status === "documented") return predicate(fact.value) ? "match" : "mismatch";
  if (fact.status === "not-applicable") return "mismatch";
  return "unknown";
}

function measurementInches(measurement: UsMeasurement) {
  if (measurement.unit === "in") return measurement.value;
  if (measurement.unit === "ft") return measurement.value * 12;
  if (measurement.unit === "cm") return measurement.value / 2.54;
  return measurement.value / 25.4;
}

function fitsEnvelope(
  width: number,
  depth: number,
  height: number,
  limit: UsFinderSpaceLimit,
) {
  const conversionTolerance = 1e-9;
  const fits = (actual: number, maximum: number) => actual <= maximum + conversionTolerance;
  const direct = fits(width, limit.width) && fits(depth, limit.depth) && fits(height, limit.height);
  const rotated = limit.allowRotation && fits(depth, limit.width) && fits(width, limit.depth) && fits(height, limit.height);
  return direct || rotated;
}

function clearanceInches(clearances: Record<string, UsMeasurement>, names: string[]) {
  const entry = Object.entries(clearances).find(([name]) => names.includes(name.toLowerCase()));
  return entry ? measurementInches(entry[1]) : 0;
}

function evaluateSpace(
  configuration: UsProductConfiguration,
  criterion: NonNullable<UsFinderQuery["maximumExteriorInches"]>,
  result: MutableResult,
) {
  const exterior = configuration.dimensions.exterior;
  if (exterior.status !== "documented") {
    recordEvaluation(result, "unknown", criterion.strength, "space:exterior-dimensions");
    return;
  }
  const cabinetWidth = measurementInches(exterior.value.width);
  const cabinetDepth = measurementInches(exterior.value.depth);
  const cabinetHeight = measurementInches(exterior.value.height);
  if (!fitsEnvelope(cabinetWidth, cabinetDepth, cabinetHeight, criterion.value)) {
    recordEvaluation(result, "mismatch", criterion.strength, "space:cabinet-exceeds-limit");
    return;
  }

  const clearances = configuration.dimensions.minimum_clearances;
  if (clearances.status !== "documented") {
    if (criterion.strength === "hard") addUnique(result.matchedCriteria, "space:cabinet-fits");
    else addUnique(result.matchedPreferences, "space:cabinet-fits");
    recordEvaluation(result, "unknown", criterion.strength, "space:installation-clearances");
    return;
  }

  const requiredWidth = cabinetWidth
    + clearanceInches(clearances.value, ["left", "left-side"])
    + clearanceInches(clearances.value, ["right", "right-side"]);
  const requiredDepth = cabinetDepth
    + clearanceInches(clearances.value, ["front"])
    + clearanceInches(clearances.value, ["back", "rear"]);
  const requiredHeight = cabinetHeight
    + clearanceInches(clearances.value, ["top", "ceiling"])
    + clearanceInches(clearances.value, ["bottom", "floor"]);
  recordEvaluation(
    result,
    fitsEnvelope(requiredWidth, requiredDepth, requiredHeight, criterion.value) ? "match" : "mismatch",
    criterion.strength,
    "space:required-envelope",
  );
}

function requirementSupplyEvaluation(
  requirement: UsElectricalRequirement,
  supplies: UsFinderElectricalSupply[],
): Evaluation {
  if (requirement.voltage_v.status !== "documented") return "unknown";
  const requiredVoltage = requirement.voltage_v.value;
  const candidates = supplies.filter((supply) => supply.voltageV === requiredVoltage);
  if (candidates.length === 0) return "mismatch";

  const candidateResults = candidates.map<Evaluation>((supply) => {
    if (supply.maxRequiredCircuitA !== undefined) {
      if (requirement.required_circuit_a.status !== "documented") return "unknown";
      if (requirement.required_circuit_a.value > supply.maxRequiredCircuitA) return "mismatch";
    }
    if (supply.connection !== undefined) {
      if (requirement.connection.status !== "documented") return "unknown";
      if (requirement.connection.value !== supply.connection) return "mismatch";
    }
    return "match";
  });
  if (candidateResults.includes("match")) return "match";
  return candidateResults.includes("unknown") ? "unknown" : "mismatch";
}

function evaluateElectrical(
  product: UsMarketProduct,
  configuration: UsProductConfiguration,
  criterion: NonNullable<UsFinderQuery["electrical"]>,
  result: MutableResult,
) {
  if (criterion.value.mode === "wood-fired") {
    recordEvaluation(
      result,
      factEvaluation(product.energy_sources, (sources) => sources.includes("wood")),
      criterion.strength,
      "electrical:wood-fired",
    );
    return;
  }

  if (product.energy_sources.status === "documented" && !product.energy_sources.value.includes("electric")) {
    recordEvaluation(result, "mismatch", criterion.strength, "electrical:electric-supply");
    return;
  }
  if (configuration.electrical_supply_options.length === 0) {
    recordEvaluation(result, "unknown", criterion.strength, "electrical:supply-option");
    return;
  }

  const optionResults = configuration.electrical_supply_options.map((option) => {
    if (option.requirements.length === 0) return { optionId: option.id, evaluation: "unknown" as const };
    const requirementResults = option.requirements.map((requirement) =>
      requirementSupplyEvaluation(requirement, criterion.value.mode === "electric" ? criterion.value.supplies : []));
    if (requirementResults.includes("mismatch")) return { optionId: option.id, evaluation: "mismatch" as const };
    if (requirementResults.includes("unknown")) return { optionId: option.id, evaluation: "unknown" as const };
    return { optionId: option.id, evaluation: "match" as const };
  });
  const matchingOption = optionResults.find((option) => option.evaluation === "match");
  if (matchingOption) {
    result.selectedSupplyOptionId = matchingOption.optionId;
    recordEvaluation(result, "match", criterion.strength, `electrical:supply-option:${matchingOption.optionId}`);
  } else if (optionResults.some((option) => option.evaluation === "unknown")) {
    recordEvaluation(result, "unknown", criterion.strength, "electrical:supply-option");
  } else {
    recordEvaluation(result, "mismatch", criterion.strength, "electrical:supply-option");
  }
}

function evaluateBudget(
  configurationOffers: UsOffer[],
  criterion: NonNullable<UsFinderQuery["budget"]>,
  result: MutableResult,
  asOf: string,
) {
  const requiredScope = criterion.value.requiredPriceScope;
  result.costScope = requiredScope;
  const scopedOffers = configurationOffers.filter((offer) => offer.price_scope === requiredScope);
  const comparableOffers = scopedOffers.filter((offer) => {
    return classifyUsOfferPrice(offer, asOf).priceVisible;
  });

  if (comparableOffers.length === 0) {
    recordEvaluation(result, "unknown", criterion.strength, `budget:${requiredScope}:comparable-price`);
    return;
  }
  const selected = [...comparableOffers].sort((left, right) =>
    (left.price?.amount_minor ?? Number.POSITIVE_INFINITY) - (right.price?.amount_minor ?? Number.POSITIVE_INFINITY)
    || left.id.localeCompare(right.id, "en-US"))[0];
  result.offerId = selected.id;
  result.comparablePriceAmountMinor = selected.price?.amount_minor;
  recordEvaluation(
    result,
    selected.price && selected.price.amount_minor <= criterion.value.maxAmountMinor ? "match" : "mismatch",
    criterion.strength,
    `budget:${requiredScope}`,
  );
}

function coreDataGapCount(product: UsMarketProduct, configuration: UsProductConfiguration) {
  const facts: UsFact<unknown>[] = [
    product.product_type,
    product.heat_type,
    product.energy_sources,
    product.placements,
    configuration.capacity.seated,
    configuration.dimensions.exterior,
  ];
  return facts.filter((fact) => fact.status !== "documented").length;
}

function evaluateConfiguration(
  product: UsMarketProduct,
  configuration: UsProductConfiguration,
  offers: UsOffer[],
  query: UsFinderQuery,
  asOf: string,
): UsFinderMatchResult {
  const result: MutableResult = {
    productId: product.id,
    configurationId: configuration.id,
    matchedCriteria: [],
    unknownCriteria: [],
    exclusionReasons: [],
    matchedPreferences: [],
    unknownPreferences: [],
    unmetPreferences: [],
    costScope: "not-evaluated",
    dataGapCount: coreDataGapCount(product, configuration),
  };

  recordEvaluation(
    result,
    factEvaluation(product.product_type, (value) => supportedFinderProductTypes.has(value)),
    "hard",
    "product-type:finder-supported",
  );
  if (query.productType) {
    const criterion = query.productType;
    recordEvaluation(result, factEvaluation(product.product_type, (value) => value === criterion.value), criterion.strength, `product-type:${criterion.value}`);
  }
  if (query.heatType) {
    const criterion = query.heatType;
    recordEvaluation(result, factEvaluation(product.heat_type, (value) => value === criterion.value), criterion.strength, `heat-type:${criterion.value}`);
  }
  if (query.placement) {
    const criterion = query.placement;
    recordEvaluation(result, factEvaluation(product.placements, (value) => value.includes(criterion.value)), criterion.strength, `placement:${criterion.value}`);
  }
  if (query.seatedPeople) recordEvaluation(result, factEvaluation(configuration.capacity.seated, (value) => value >= query.seatedPeople!.value), query.seatedPeople.strength, `capacity:at-least-${query.seatedPeople.value}`);
  if (query.maximumExteriorInches) evaluateSpace(configuration, query.maximumExteriorInches, result);
  if (query.electrical) evaluateElectrical(product, configuration, query.electrical, result);
  if (query.budget) evaluateBudget(offers.filter((offer) => offer.configuration_id === configuration.id), query.budget, result, asOf);
  const status: UsFinderMatchStatus = result.exclusionReasons.length > 0
    ? "excluded"
    : result.unknownCriteria.length > 0
      ? "needs-verification"
      : "meets-known-criteria";
  return { ...result, status };
}

export function runUsFinder({ products, configurations, offers, query, asOf }: UsFinderInput): UsFinderMatchResult[] {
  const productById = new Map(products.map((product) => [product.id, product]));
  return configurations
    .flatMap((configuration) => {
      const product = productById.get(configuration.product_id);
      return product ? [evaluateConfiguration(product, configuration, offers, query, asOf)] : [];
    })
    .sort((left, right) => {
      const statusDifference = statusPriority[left.status] - statusPriority[right.status];
      if (statusDifference !== 0) return statusDifference;
      const preferenceDifference = right.matchedPreferences.length - left.matchedPreferences.length;
      if (preferenceDifference !== 0) return preferenceDifference;
      const preferenceGapDifference = (left.unmetPreferences.length + left.unknownPreferences.length)
        - (right.unmetPreferences.length + right.unknownPreferences.length);
      if (preferenceGapDifference !== 0) return preferenceGapDifference;
      if (left.unknownCriteria.length !== right.unknownCriteria.length) return left.unknownCriteria.length - right.unknownCriteria.length;
      if (left.dataGapCount !== right.dataGapCount) return left.dataGapCount - right.dataGapCount;
      const priceDifference = (left.comparablePriceAmountMinor ?? Number.POSITIVE_INFINITY)
        - (right.comparablePriceAmountMinor ?? Number.POSITIVE_INFINITY);
      if (priceDifference !== 0) return priceDifference;
      return left.productId.localeCompare(right.productId, "en-US") || left.configurationId.localeCompare(right.configurationId, "en-US");
    });
}
