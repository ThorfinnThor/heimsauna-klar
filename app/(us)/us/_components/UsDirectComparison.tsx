"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  readUsDirectComparisonSelection,
  serializeUsDirectComparisonSelection,
  US_DIRECT_COMPARISON_MAXIMUM,
  US_DIRECT_COMPARISON_MINIMUM,
  type UsDirectComparisonOption,
} from "@/lib/us/direct-comparison";

const comparisonChangeEvent = "selectyoursauna:us-direct-comparison-change";

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(comparisonChangeEvent, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(comparisonChangeEvent, callback);
  };
}

function getLocationSearch() {
  return window.location.search;
}

function getServerSearch() {
  return "";
}

function SelectionForm({ options, initialSelection }: { options: UsDirectComparisonOption[]; initialSelection: string[] }) {
  const [draftSelection, setDraftSelection] = useState(initialSelection);
  const selectionIsFull = draftSelection.length >= US_DIRECT_COMPARISON_MAXIMUM;

  function toggle(configurationId: string, checked: boolean) {
    setDraftSelection((current) => checked
      ? [...current, configurationId].slice(0, US_DIRECT_COMPARISON_MAXIMUM)
      : current.filter((id) => id !== configurationId));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draftSelection.length < US_DIRECT_COMPARISON_MINIMUM) return;
    const params = serializeUsDirectComparisonSelection(draftSelection);
    window.history.pushState(null, "", `${window.location.pathname}?${params.toString()}#model-comparison`);
    window.dispatchEvent(new Event(comparisonChangeEvent));
    window.requestAnimationFrame(() => document.getElementById("model-comparison")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function clear() {
    setDraftSelection([]);
    window.history.pushState(null, "", window.location.pathname);
    window.dispatchEvent(new Event(comparisonChangeEvent));
  }

  return (
    <form className="us-direct-comparison-form" onSubmit={submit}>
      <fieldset aria-describedby="direct-comparison-help direct-comparison-count">
        <legend>Choose configurations</legend>
        <p id="direct-comparison-help">Select at least two and no more than four. Every choice names the exact configuration used in the table.</p>
        <p id="direct-comparison-count" className="us-direct-comparison-count" aria-live="polite">
          <strong>{draftSelection.length}</strong> of {US_DIRECT_COMPARISON_MAXIMUM} selected
        </p>
        <div className="us-direct-comparison-options">
          {options.map((option) => {
            const checked = draftSelection.includes(option.configurationId);
            return (
              <label
                aria-label={`Compare ${option.brand} ${option.model}, ${option.configurationLabel}`}
                htmlFor={`compare-${option.configurationId}`}
                key={option.configurationId}
              >
                <input
                  id={`compare-${option.configurationId}`}
                  type="checkbox"
                  name="model"
                  value={option.configurationId}
                  checked={checked}
                  disabled={!checked && selectionIsFull}
                  onChange={(event) => toggle(option.configurationId, event.currentTarget.checked)}
                />
                <span>
                  <strong>{option.brand} {option.model}</strong>
                  <small>{option.configurationLabel}</small>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="us-direct-comparison-actions">
        <button className="button" type="submit" disabled={draftSelection.length < US_DIRECT_COMPARISON_MINIMUM}>Compare selected models</button>
        <button className="us-direct-comparison-clear" type="button" onClick={clear}>Clear selection</button>
      </div>
    </form>
  );
}

const comparisonRows: { label: string; key: keyof Pick<UsDirectComparisonOption, "configurationLabel" | "heatType" | "placement" | "seatedCapacity" | "exteriorDimensions" | "electrical" | "requiredCircuit" | "connection" | "materials"> }[] = [
  { label: "Configuration", key: "configurationLabel" },
  { label: "Heat type", key: "heatType" },
  { label: "Placement", key: "placement" },
  { label: "Capacity", key: "seatedCapacity" },
  { label: "Exterior W × D × H", key: "exteriorDimensions" },
  { label: "Electrical", key: "electrical" },
  { label: "Required circuit", key: "requiredCircuit" },
  { label: "Connection", key: "connection" },
  { label: "Materials", key: "materials" },
];

export function UsDirectComparison({ options }: { options: UsDirectComparisonOption[] }) {
  const locationSearch = useSyncExternalStore(subscribeToLocation, getLocationSearch, getServerSearch);
  const optionIds = useMemo(() => options.map((option) => option.configurationId), [options]);
  const selectedIds = readUsDirectComparisonSelection(new URLSearchParams(locationSearch), optionIds);
  const optionById = useMemo(() => new Map(options.map((option) => [option.configurationId, option])), [options]);
  const selected = selectedIds.flatMap((id) => {
    const option = optionById.get(id);
    return option ? [option] : [];
  });

  if (options.length === 0) {
    return (
      <section className="us-catalog-empty" aria-live="polite">
        <h2>The model comparison is not public yet.</h2>
        <p>It will use only reviewed US configurations when the catalog is approved for publication.</p>
      </section>
    );
  }

  return (
    <>
      <SelectionForm key={locationSearch} options={options} initialSelection={selectedIds} />
      <section className="us-direct-comparison-results" id="model-comparison" aria-labelledby="model-comparison-title" aria-live="polite">
        <header>
          <p className="eyebrow">Configuration-level facts</p>
          <h2 id="model-comparison-title">{selected.length >= US_DIRECT_COMPARISON_MINIMUM ? `${selected.length} models side by side` : "Your comparison table"}</h2>
          <p>{selected.length >= US_DIRECT_COMPARISON_MINIMUM
            ? "The table preserves unknown values instead of filling gaps or treating different configurations as one product."
            : "Choose two to four configurations above. The resulting URL can be bookmarked or shared."}</p>
        </header>
        {selected.length >= US_DIRECT_COMPARISON_MINIMUM ? (
          <div className="us-comparison-table-wrap us-direct-comparison-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Fact</th>
                  {selected.map((option) => (
                    <th scope="col" key={option.configurationId}>
                      <Link href={`/us/saunas/${option.slug}/`}>{option.brand}<br />{option.model}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    {selected.map((option) => <td key={option.configurationId}>{option[row.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="us-direct-comparison-empty">No table is shown until at least two configurations are selected.</p>}
      </section>
    </>
  );
}
