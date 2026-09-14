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
  if (!dimensions) return "Exterior size not documented";
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
  return voltages.length > 0 ? voltages.map((voltage) => `${voltage} V`).join(" or ") : "Electrical supply not documented";
}

function selectionLabels(state: UsFinderUrlState) {
  const labels: string[] = [];
  if (state.productType !== "any") labels.push(state.productType.replace("sauna-", "").replace("-", " "));
  if (state.heatType !== "any") labels.push(state.heatType);
  if (state.placement !== "any") labels.push(state.placement);
  if (state.seatedPeople !== null) labels.push(`${state.seatedPeople}+ seated`);
  if (state.widthInches !== null && state.depthInches !== null && state.heightInches !== null) {
    labels.push(`${state.widthInches} × ${state.depthInches} × ${state.heightInches} in maximum`);
  }
  if (state.power !== "any") labels.push(state.power === "wood-fired" ? "wood-fired" : `${state.power.replace("-", " + ")} V available`);
  if (state.maximumCircuitAmps !== null) labels.push(`${state.maximumCircuitAmps} A maximum circuit`);
  if (state.connection !== "any") labels.push(state.connection);
  if (state.budgetDollars !== null) {
    labels.push(`${state.budgetStrength === "hard" ? "maximum" : "preferred"} $${state.budgetDollars.toLocaleString("en-US")} · ${state.budgetScope.replaceAll("-", " ")}`);
  }
  return labels.length > 0 ? labels : ["No optional criteria selected"];
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
    <article className="us-finder-result-card">
      <div>
        <p className="eyebrow">{product.brand_name}</p>
        <h3>{product.model}</h3>
      </div>
      <dl>
        <div><dt>Capacity</dt><dd>{seated === null ? "Not documented" : `${seated} seated`}</dd></div>
        <div><dt>Exterior W × D × H</dt><dd>{dimensionsLabel(configuration)}</dd></div>
        <div><dt>Electrical</dt><dd>{electricalLabel(configuration)}</dd></div>
        {result.comparablePriceAmountMinor !== undefined ? (
          <div><dt>Comparable price</dt><dd>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(result.comparablePriceAmountMinor / 100)}</dd></div>
        ) : null}
      </dl>
      {reviewReasons.length > 0 ? (
        <div className="us-finder-reasons us-finder-reasons-open">
          <strong>Check before deciding</strong>
          <ul>{reviewReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
      ) : null}
      {exclusionReasons.length > 0 ? (
        <div className="us-finder-reasons">
          <strong>Why it does not match</strong>
          <ul>{exclusionReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
      ) : null}
      {preferenceNotes.length > 0 ? (
        <div className="us-finder-reasons us-finder-reasons-preference">
          <strong>Preference not confirmed</strong>
          <ul>{preferenceNotes.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
      ) : null}
      <Link href={`/us/saunas/${product.slug}/`}>View configuration <span aria-hidden="true">↗</span></Link>
    </article>
  );
}

function ResultGroup({
  title,
  description,
  results,
  products,
  configurations,
}: {
  title: string;
  description: string;
  results: UsFinderMatchResult[];
  products: Map<string, UsFinderProduct>;
  configurations: Map<string, UsFinderConfiguration>;
}) {
  if (results.length === 0) return null;
  return (
    <section className="us-finder-result-group" aria-labelledby={`finder-${results[0].status}`}>
      <header>
        <p className="eyebrow">{results.length} {results.length === 1 ? "configuration" : "configurations"}</p>
        <h2 id={`finder-${results[0].status}`}>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="us-finder-result-grid">
        {results.map((result) => {
          const product = products.get(result.productId);
          const configuration = configurations.get(result.configurationId);
          return product && configuration ? (
            <FinderResultCard configuration={configuration} product={product} result={result} key={result.configurationId} />
          ) : null;
        })}
      </div>
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

  if (products.length === 0) {
    return (
      <section className="us-catalog-empty" aria-live="polite">
        <h2>The US finder is not public yet.</h2>
        <p>It will use only reviewed US configurations when the catalog is approved for publication.</p>
      </section>
    );
  }

  return (
    <>
      <form className="us-finder-form" key={locationSearch} onSubmit={submit}>
        <div className="us-finder-form-intro">
          <p className="eyebrow">Your requirements</p>
          <h2>Enter the limits that matter in your room.</h2>
          <p>Leave a field open if it is not a requirement. The finder does not loosen a submitted limit when no product meets it.</p>
        </div>

        <fieldset>
          <legend><span>01</span> Product and heat</legend>
          <div className="us-finder-fields us-finder-fields-two">
            <label><span>Product type</span><select name="type" defaultValue={state.productType}>
              <option value="any">Any cabin, kit or tent</option><option value="sauna-cabin">Sauna cabin</option><option value="sauna-kit">Sauna kit</option><option value="sauna-tent">Sauna tent</option>
            </select></label>
            <label><span>Heat type</span><select name="heat" defaultValue={state.heatType}>
              <option value="any">Any documented heat type</option><option value="traditional">Traditional</option><option value="infrared">Infrared</option><option value="hybrid">Hybrid</option>
            </select></label>
          </div>
        </fieldset>

        <fieldset>
          <legend><span>02</span> Placement and capacity</legend>
          <div className="us-finder-fields us-finder-fields-two">
            <label><span>Placement</span><select name="placement" defaultValue={state.placement}>
              <option value="any">Indoor or outdoor</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option>
            </select></label>
            <label><span>Minimum seated capacity</span><input name="people" type="number" inputMode="numeric" min="1" max="8" step="1" defaultValue={state.seatedPeople ?? ""} placeholder="For example, 2" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend><span>03</span> Maximum available space</legend>
          <p className="us-finder-field-note">Use finished room dimensions in inches. All three measurements are required when space is included.</p>
          <div className="us-finder-fields us-finder-fields-three">
            <label><span>Width, in</span><input name="width" type="number" inputMode="decimal" min="24" max="240" step="0.1" defaultValue={state.widthInches ?? ""} /></label>
            <label><span>Depth, in</span><input name="depth" type="number" inputMode="decimal" min="24" max="240" step="0.1" defaultValue={state.depthInches ?? ""} /></label>
            <label><span>Height, in</span><input name="height" type="number" inputMode="decimal" min="48" max="180" step="0.1" defaultValue={state.heightInches ?? ""} /></label>
          </div>
          <label className="us-finder-checkbox"><input name="rotate" type="checkbox" value="1" defaultChecked={state.allowRotation} /><span>Allow width and depth to be rotated</span></label>
        </fieldset>

        <fieldset>
          <legend><span>04</span> Available power</legend>
          <div className="us-finder-fields us-finder-fields-three">
            <label><span>Energy or voltage</span><select name="power" defaultValue={state.power}>
              <option value="any">Not a filter</option><option value="120">120 V</option><option value="240">240 V</option><option value="120-240">Both 120 V and 240 V</option><option value="wood-fired">Wood-fired</option>
            </select></label>
            <label><span>Maximum required circuit, A</span><input name="circuit" type="number" inputMode="numeric" min="10" max="100" step="1" defaultValue={state.maximumCircuitAmps ?? ""} placeholder="Optional" /></label>
            <label><span>Connection</span><select name="connection" defaultValue={state.connection}>
              <option value="any">Not specified</option><option value="plug-in">Plug-in</option><option value="hardwired">Hardwired</option>
            </select></label>
          </div>
          <p className="us-finder-field-note">Circuit and connection are applied only with an electric voltage. A voltage match is not electrical approval. Confirm the product manual, circuit, receptacle and local requirements with a qualified professional.</p>
        </fieldset>

        <fieldset>
          <legend><span>05</span> Budget</legend>
          <div className="us-finder-fields us-finder-fields-three">
            <label><span>Budget, USD</span><input name="budget" type="number" inputMode="numeric" min="100" max="100000" step="1" defaultValue={state.budgetDollars ?? ""} placeholder="Optional" /></label>
            <label><span>Price must cover</span><select name="scope" defaultValue={state.budgetScope}>
              <option value="configured-sauna-package">Configured sauna package</option><option value="sauna-kit">Sauna kit</option>
            </select></label>
            <label><span>Budget role</span><select name="budgetMode" defaultValue={state.budgetStrength}>
              <option value="hard">Hard maximum</option><option value="preference">Sorting preference</option>
            </select></label>
          </div>
          <p className="us-finder-field-note">Price scope and budget role are applied only when a dollar amount is entered.</p>
        </fieldset>

        <div className="us-finder-submit">
          <button className="button button-primary" type="submit">Find matching configurations</button>
          {state.submitted ? <button className="us-finder-reset" type="button" onClick={reset}>Clear this search</button> : null}
        </div>
      </form>

      {state.submitted ? (
        <section className="us-finder-results" id="finder-results" aria-live="polite">
          <header className="us-finder-results-summary">
            <div>
              <p className="eyebrow">Finder results</p>
              <h2>{known.length} known {known.length === 1 ? "match" : "matches"}, {review.length} to verify</h2>
              <p>Results are classified from the submitted limits. No capacity, space, electrical or budget requirement has been relaxed.</p>
            </div>
            <div className="us-finder-selection" aria-label="Submitted criteria">
              {selectionLabels(state).map((label) => <span key={label}>{label}</span>)}
            </div>
          </header>
          {known.length === 0 ? (
            <div className="us-finder-zero-known">
              <strong>No configuration meets every submitted criterion with documented data.</strong>
              <p>Products that may fit but still have a relevant data gap appear under “Needs verification.” Documented conflicts remain excluded below.</p>
            </div>
          ) : null}
          <ResultGroup
            title="Meets the known criteria"
            description="Every hard criterion entered is supported by the documented configuration. Installation and code compliance still require project-specific review."
            results={known}
            products={productById}
            configurations={configurationById}
          />
          <ResultGroup
            title="Needs verification"
            description="The documented facts do not conflict with your limits, but at least one required value is missing or unresolved."
            results={review}
            products={productById}
            configurations={configurationById}
          />
          {excluded.length > 0 ? (
            <details className="us-finder-excluded">
              <summary>{excluded.length} excluded {excluded.length === 1 ? "configuration" : "configurations"}</summary>
              <p>These configurations conflict with at least one hard requirement. The conflicting requirement is shown on each card.</p>
              <div className="us-finder-result-grid">
                {excluded.map((result) => {
                  const product = productById.get(result.productId);
                  const configuration = configurationById.get(result.configurationId);
                  return product && configuration ? <FinderResultCard configuration={configuration} product={product} result={result} key={result.configurationId} /> : null;
                })}
              </div>
            </details>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
