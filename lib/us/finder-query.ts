import type { UsFinderQuery, UsFinderStrength } from "./finder.ts";

export type UsFinderUrlState = {
  submitted: boolean;
  productType: "any" | "sauna-cabin" | "sauna-kit" | "sauna-tent";
  heatType: "any" | "traditional" | "infrared" | "hybrid";
  placement: "any" | "indoor" | "outdoor";
  seatedPeople: number | null;
  widthInches: number | null;
  depthInches: number | null;
  heightInches: number | null;
  allowRotation: boolean;
  power: "any" | "120" | "240" | "120-240" | "wood-fired";
  maximumCircuitAmps: number | null;
  connection: "any" | "plug-in" | "hardwired";
  budgetDollars: number | null;
  budgetScope: "sauna-kit" | "configured-sauna-package";
  budgetStrength: UsFinderStrength;
};

const defaults: UsFinderUrlState = {
  submitted: false,
  productType: "any",
  heatType: "any",
  placement: "any",
  seatedPeople: null,
  widthInches: null,
  depthInches: null,
  heightInches: null,
  allowRotation: false,
  power: "any",
  maximumCircuitAmps: null,
  connection: "any",
  budgetDollars: null,
  budgetScope: "configured-sauna-package",
  budgetStrength: "hard",
};

function enumValue<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? value as T : fallback;
}

function boundedNumber(value: string | null, minimum: number, maximum: number, integer = false): number | null {
  if (!value || !/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum || (integer && !Number.isInteger(parsed))) return null;
  return parsed;
}

export function normalizeUsFinderUrlState(params: { get(name: string): string | null }): UsFinderUrlState {
  const widthInches = boundedNumber(params.get("width"), 24, 240);
  const depthInches = boundedNumber(params.get("depth"), 24, 240);
  const heightInches = boundedNumber(params.get("height"), 48, 180);
  const hasCompleteSpace = widthInches !== null && depthInches !== null && heightInches !== null;
  const power = enumValue(params.get("power"), ["any", "120", "240", "120-240", "wood-fired"] as const, defaults.power);

  return {
    submitted: params.get("run") === "1",
    productType: enumValue(params.get("type"), ["any", "sauna-cabin", "sauna-kit", "sauna-tent"] as const, defaults.productType),
    heatType: enumValue(params.get("heat"), ["any", "traditional", "infrared", "hybrid"] as const, defaults.heatType),
    placement: enumValue(params.get("placement"), ["any", "indoor", "outdoor"] as const, defaults.placement),
    seatedPeople: boundedNumber(params.get("people"), 1, 8, true),
    widthInches: hasCompleteSpace ? widthInches : null,
    depthInches: hasCompleteSpace ? depthInches : null,
    heightInches: hasCompleteSpace ? heightInches : null,
    allowRotation: hasCompleteSpace && params.get("rotate") === "1",
    power,
    maximumCircuitAmps: power === "any" || power === "wood-fired"
      ? null
      : boundedNumber(params.get("circuit"), 10, 100, true),
    connection: power === "any" || power === "wood-fired"
      ? "any"
      : enumValue(params.get("connection"), ["any", "plug-in", "hardwired"] as const, defaults.connection),
    budgetDollars: boundedNumber(params.get("budget"), 100, 100_000, true),
    budgetScope: enumValue(params.get("scope"), ["sauna-kit", "configured-sauna-package"] as const, defaults.budgetScope),
    budgetStrength: enumValue(params.get("budgetMode"), ["hard", "preference"] as const, defaults.budgetStrength),
  };
}

export function serializeUsFinderUrlState(state: UsFinderUrlState): URLSearchParams {
  const params = new URLSearchParams({ run: "1" });
  if (state.productType !== "any") params.set("type", state.productType);
  if (state.heatType !== "any") params.set("heat", state.heatType);
  if (state.placement !== "any") params.set("placement", state.placement);
  if (state.seatedPeople !== null) params.set("people", String(state.seatedPeople));
  if (state.widthInches !== null && state.depthInches !== null && state.heightInches !== null) {
    params.set("width", String(state.widthInches));
    params.set("depth", String(state.depthInches));
    params.set("height", String(state.heightInches));
    if (state.allowRotation) params.set("rotate", "1");
  }
  if (state.power !== "any") {
    params.set("power", state.power);
    if (state.power !== "wood-fired") {
      if (state.maximumCircuitAmps !== null) params.set("circuit", String(state.maximumCircuitAmps));
      if (state.connection !== "any") params.set("connection", state.connection);
    }
  }
  if (state.budgetDollars !== null) {
    params.set("budget", String(state.budgetDollars));
    params.set("scope", state.budgetScope);
    params.set("budgetMode", state.budgetStrength);
  }
  return params;
}

export function buildUsFinderQuery(state: UsFinderUrlState): UsFinderQuery {
  const query: UsFinderQuery = {};
  if (state.productType !== "any") query.productType = { value: state.productType, strength: "hard" };
  if (state.heatType !== "any") query.heatType = { value: state.heatType, strength: "hard" };
  if (state.placement !== "any") query.placement = { value: state.placement, strength: "hard" };
  if (state.seatedPeople !== null) query.seatedPeople = { value: state.seatedPeople, strength: "hard" };
  if (state.widthInches !== null && state.depthInches !== null && state.heightInches !== null) {
    query.maximumExteriorInches = {
      value: {
        width: state.widthInches,
        depth: state.depthInches,
        height: state.heightInches,
        allowRotation: state.allowRotation,
      },
      strength: "hard",
    };
  }
  if (state.power === "wood-fired") {
    query.electrical = { value: { mode: "wood-fired" }, strength: "hard" };
  } else if (state.power !== "any") {
    const voltages = state.power === "120-240" ? [120, 240] : [Number(state.power)];
    query.electrical = {
      value: {
        mode: "electric",
        supplies: voltages.map((voltageV) => ({
          voltageV,
          ...(state.maximumCircuitAmps === null ? {} : { maxRequiredCircuitA: state.maximumCircuitAmps }),
          ...(state.connection === "any" ? {} : { connection: state.connection }),
        })),
      },
      strength: "hard",
    };
  }
  if (state.budgetDollars !== null) {
    query.budget = {
      value: { maxAmountMinor: state.budgetDollars * 100, requiredPriceScope: state.budgetScope },
      strength: state.budgetStrength,
    };
  }
  return query;
}
