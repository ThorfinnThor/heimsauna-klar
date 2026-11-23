"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import {
  runUsFinder,
  type UsFinderConfiguration,
  type UsFinderFact,
  type UsFinderMatchResult,
  type UsFinderProduct,
} from "@/lib/us/finder";
import {
  buildUsFinderQuery,
  normalizeUsFinderUrlState,
  serializeUsFinderUrlState,
  type UsFinderUrlState,
} from "@/lib/us/finder-query";
import { usFinderReasonLabel } from "@/lib/us/finder-copy";
import type { UsOffer } from "@/lib/us/types";

const finderChangeEvent = "selectyoursauna:us-finder-change";

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(finderChangeEvent, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(finderChangeEvent, callback);
  };
}

function getLocationSearch() {
  return window.location.search;
}

function getServerSearch() {
  return "";
}

function documentedValue<T>(fact: UsFinderFact<T>): T | null {
  return fact.status === "documented" ? fact.value : null;
}

function dimensionsLabel(configuration: UsFinderConfiguration) {
  const dimensions = documentedValue(configuration.dimensions.exterior);
  if (!dimensions) return "size not stated";
  return [dimensions.width, dimensions.depth, dimensions.height]
    .map((measurement) => `${measurement.value} ${measurement.unit}`)
    .join(" × ");
}

function electricalLabel(configuration: UsFinderConfiguration) {
  const voltages = [...new Set(configuration.electrical_supply_options.flatMap((option) =>
    option.requirements.flatMap((requirement) => {
      const voltage = documentedValue(requirement.voltage_v);
      return voltage === null ? [] : [voltage];
    })))]
    .sort((left, right) => left - right);
  return voltages.length > 0 ? voltages.map((voltage) => `${voltage} V`).join(" or ") : "voltage not stated";
}

function selectionLabels(state: UsFinderUrlState) {
  const labels: string[] = [];
  if (state.productType !== "any") labels.push(state.productType.replace("sauna-", "").replace("-", " "));
  if (state.heatType !== "any") labels.push(state.heatType);
  if (state.placement !== "any") labels.push(state.placement);
  if (state.seatedPeople !== null) labels.push(`${state.seatedPeople}+ seats`);
  if (state.widthInches !== null && state.depthInches !== null && state.heightInches !== null) {
    labels.push(`${state.widthInches} × ${state.depthInches} × ${state.heightInches} in max`);
  }
  if (state.power !== "any") labels.push(state.power === "wood-fired" ? "wood-fired" : `${state.power.replace("-", " + ")} V available`);
  if (state.maximumCircuitAmps !== null) labels.push(`${state.maximumCircuitAmps} A circuit at most`);
  if (state.connection !== "any") labels.push(state.connection);
  if (state.budgetDollars !== null) {
    labels.push(`${state.budgetStrength === "hard" ? "maximum" : "preferred"} $${state.budgetDollars.toLocaleString("en-US")} · ${state.budgetScope.replaceAll("-", " ")}`);
  }
  return labels.length > 0 ? labels : ["No limits set"];
}

function FinderResultCard({
  result,
  product,
  configuration,
}: {
  result: UsFinderMatchResult;
  product: UsFinderProduct;
  configuration: UsFinderConfiguration;
}) {
  const seated = documentedValue(configuration.capacity.seated);
  const reviewReasons = result.unknownCriteria.map((code) => usFinderReasonLabel(code, "unknown"));
  const exclusionReasons = result.exclusionReasons.map((code) => usFinderReasonLabel(code, "mismatch"));
  const preferenceNotes = [
    ...result.unknownPreferences.map((code) => usFinderReasonLabel(code, "unknown")),
    ...result.unmetPreferences.map((code) => usFinderReasonLabel(code, "mismatch")),
  ];
  return (
    <li>
      <div>
        <h3><Link href={`/us/saunas/${product.slug}/`}>{product.brand_name} {product.model}</Link></h3>
        <p>{[seated === null ? null : `${seated} seats`, dimensionsLabel(configuration), electricalLabel(configuration)].filter(Boolean).join(" · ")}</p>
        {reviewReasons.map((reason) => <p key={reason}>{reason}</p>)}
        {exclusionReasons.map((reason) => <p className="note" key={reason}>{reason}</p>)}
        {preferenceNotes.map((reason) => <p key={reason}>{reason}</p>)}
      </div>
      {result.comparablePriceAmountMinor !== undefined ? <div className="buy"><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(result.comparablePriceAmountMinor / 100)}</strong></div> : null}
    </li>
  );
}

function ResultGroup({ id, title, description, results, products, configurations }: {
  id: string;
  title: string;
  description: string;
  results: UsFinderMatchResult[];
  products: Map<string, UsFinderProduct>;
  configurations: Map<string, UsFinderConfiguration>;
}) {
  if (results.length === 0) return null;
  return (
    <section aria-labelledby={`finder-${id}`}>
      <h2 id={`finder-${id}`}>{title} ({results.length})</h2>
      <p className="text">{description}</p>
      <ul className="plist us-results">
        {results.map((result) => {
          const product = products.get(result.productId);
          const configuration = configurations.get(result.configurationId);
          return product && configuration ? (
            <FinderResultCard configuration={configuration} product={product} result={result} key={result.configurationId} />
          ) : null;
        })}
      </ul>
    </section>
  );
}

function formSearchParams(form: HTMLFormElement) {
  const params = new URLSearchParams();
  for (const [name, value] of new FormData(form)) {
    if (typeof value === "string" && value.trim()) params.set(name, value.trim());
  }
  return params;
}

export function UsSaunaFinder({
  products,
  configurations,
  offers,
  asOf,
}: {
  products: UsFinderProduct[];
  configurations: UsFinderConfiguration[];
  offers: UsOffer[];
  asOf: string;
}) {
  const locationSearch = useSyncExternalStore(subscribeToLocation, getLocationSearch, getServerSearch);
  const state = normalizeUsFinderUrlState(new URLSearchParams(locationSearch));
  const query = buildUsFinderQuery(state);
  const results = useMemo(
    () => state.submitted ? runUsFinder({ products, configurations, offers, query, asOf }) : [],
    [asOf, configurations, offers, products, query, state.submitted],
  );
  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const configurationById = useMemo(() => new Map(configurations.map((configuration) => [configuration.id, configuration])), [configurations]);
  const known = results.filter((result) => result.status === "meets-known-criteria");
  const review = results.filter((result) => result.status === "needs-verification");
  const excluded = results.filter((result) => result.status === "excluded");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = formSearchParams(form);
    const dimensionValues = [raw.get("width"), raw.get("depth"), raw.get("height")];
    const completedDimensions = dimensionValues.filter(Boolean).length;
    const widthInput = form.elements.namedItem("width") as HTMLInputElement | null;
    widthInput?.setCustomValidity(completedDimensions > 0 && completedDimensions < 3 ? "Enter width, depth and height together, or leave all three blank." : "");
    if (!form.reportValidity()) return;

    const nextState = normalizeUsFinderUrlState(raw);
    const params = serializeUsFinderUrlState({ ...nextState, submitted: true });
    window.history.pushState(null, "", `${window.location.pathname}?${params.toString()}#finder-results`);
    window.dispatchEvent(new Event(finderChangeEvent));
    window.requestAnimationFrame(() => document.getElementById("finder-results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function reset() {
    window.history.pushState(null, "", window.location.pathname);
    window.dispatchEvent(new Event(finderChangeEvent));
  }

  if (products.length === 0) return <p aria-live="polite">There are no saunas to search yet.</p>;

  return (
    <>
      <form className="finder us-finder" key={locationSearch} onSubmit={submit}>
        <fieldset>
          <legend>The sauna</legend>
          <div className="fields">
            <label>Type<select name="type" defaultValue={state.productType}>
              <option value="any">Any</option><option value="sauna-cabin">Cabin</option><option value="sauna-kit">Kit</option><option value="sauna-tent">Tent</option>
            </select></label>
            <label>Heat<select name="heat" defaultValue={state.heatType}>
              <option value="any">Any</option><option value="traditional">Traditional</option><option value="infrared">Infrared</option><option value="hybrid">Both</option>
            </select></label>
            <label>Indoor or outdoor<select name="placement" defaultValue={state.placement}>
              <option value="any">Either</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option>
            </select></label>
            <label>Seats, at least<input name="people" type="number" inputMode="numeric" min="1" max="8" step="1" defaultValue={state.seatedPeople ?? ""} /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Your space, in inches</legend>
          <div className="fields">
            <label>Width<input name="width" type="number" inputMode="decimal" min="24" max="240" step="0.1" defaultValue={state.widthInches ?? ""} /></label>
            <label>Depth<input name="depth" type="number" inputMode="decimal" min="24" max="240" step="0.1" defaultValue={state.depthInches ?? ""} /></label>
            <label>Height<input name="height" type="number" inputMode="decimal" min="48" max="180" step="0.1" defaultValue={state.heightInches ?? ""} /></label>
          </div>
          <label className="check"><input name="rotate" type="checkbox" value="1" defaultChecked={state.allowRotation} /><span>The sauna can be turned sideways</span></label>
          <p className="hint">Fill in all three or leave them blank.</p>
        </fieldset>

        <fieldset>
          <legend>Power</legend>
          <div className="fields">
            <label>Supply<select name="power" defaultValue={state.power}>
              <option value="any">Any</option><option value="120">120 V</option><option value="240">240 V</option><option value="120-240">120 V or 240 V</option><option value="wood-fired">Wood-fired</option>
            </select></label>
            <label>Circuit up to, amps<input name="circuit" type="number" inputMode="numeric" min="10" max="100" step="1" defaultValue={state.maximumCircuitAmps ?? ""} /></label>
            <label>Connection<select name="connection" defaultValue={state.connection}>
              <option value="any">Any</option><option value="plug-in">Plug-in</option><option value="hardwired">Hardwired</option>
            </select></label>
          </div>
          <p className="hint">Have an electrician confirm the circuit before you order.</p>
        </fieldset>

        <fieldset>
          <legend>Budget</legend>
          <div className="fields">
            <label>Dollars<input name="budget" type="number" inputMode="numeric" min="100" max="100000" step="1" defaultValue={state.budgetDollars ?? ""} /></label>
            <label>Should cover<select name="scope" defaultValue={state.budgetScope}>
              <option value="configured-sauna-package">Sauna with heater</option><option value="sauna-kit">Sauna kit</option>
            </select></label>
            <label>This is<select name="budgetMode" defaultValue={state.budgetStrength}>
              <option value="hard">my limit</option><option value="preference">a rough idea</option>
            </select></label>
          </div>
        </fieldset>

        <div className="actions">
          <button className="btn" type="submit">Show saunas</button>
          {state.submitted ? <button className="linklike" type="button" onClick={reset}>Start over</button> : null}
        </div>
      </form>

      {state.submitted ? (
        <section id="finder-results" aria-live="polite">
          <h2>{known.length} {known.length === 1 ? "sauna fits" : "saunas fit"}, {review.length} might</h2>
          <ul className="chips" aria-label="Your limits">{selectionLabels(state).map((label) => <li key={label}>{label}</li>)}</ul>
          {known.length === 0 ? <p>Nothing clearly fits everything you entered. Some models below might, but the manufacturer leaves something out.</p> : null}
          <ResultGroup id="known" title="Fits" description="Everything you asked for is covered by the manufacturer's specs." results={known} products={productById} configurations={configurationById} />
          <ResultGroup id="review" title="Might fit" description="Nothing speaks against these, but at least one spec is missing. Ask the seller." results={review} products={productById} configurations={configurationById} />
          {excluded.length > 0 ? (
            <details className="more">
              <summary>Show {excluded.length} that don&apos;t fit, and why</summary>
              <ResultGroup id="excluded" title="Doesn't fit" description="Each one shows what rules it out." results={excluded} products={productById} configurations={configurationById} />
            </details>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
