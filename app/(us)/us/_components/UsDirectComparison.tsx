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

function versionLabel(option: UsDirectComparisonOption) {
  return option.configurationLabel
    .replace(option.model, "")
    .replace(/(documented )?(base |standard )?configuration/i, "")
    .replace(/^[\s,–-]+|[\s,–-]+$/g, "");
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
    <form className="finder us-compare" onSubmit={submit}>
      <fieldset aria-describedby="direct-comparison-count">
        <legend>Pick two to four saunas</legend>
        <p id="direct-comparison-count" className="hint" aria-live="polite">
          <strong>{draftSelection.length}</strong> of {US_DIRECT_COMPARISON_MAXIMUM} selected
        </p>
        <div className="options">
          {options.map((option) => {
            const checked = draftSelection.includes(option.configurationId);
            return (
              <label
                aria-label={`Compare ${[`${option.brand} ${option.model}`, versionLabel(option)].filter(Boolean).join(", ")}`}
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
                  {versionLabel(option) ? <small>{versionLabel(option)}</small> : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="actions">
        <button className="btn" type="submit" disabled={draftSelection.length < US_DIRECT_COMPARISON_MINIMUM}>Compare</button>
        <button className="linklike" type="button" onClick={clear}>Clear</button>
      </div>
    </form>
  );
}

const comparisonRows: { label: string; key: keyof Pick<UsDirectComparisonOption, "configurationLabel" | "heatType" | "placement" | "seatedCapacity" | "exteriorDimensions" | "electrical" | "requiredCircuit" | "connection" | "materials"> }[] = [
  { label: "Version", key: "configurationLabel" },
  { label: "Heat", key: "heatType" },
  { label: "Where", key: "placement" },
  { label: "Seats", key: "seatedCapacity" },
  { label: "Outside size (W × D × H)", key: "exteriorDimensions" },
  { label: "Power", key: "electrical" },
  { label: "Circuit", key: "requiredCircuit" },
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

  if (options.length === 0) return <p aria-live="polite">There are no saunas to compare yet.</p>;
  const ready = selected.length >= US_DIRECT_COMPARISON_MINIMUM;

  return (
    <>
      <SelectionForm key={locationSearch} options={options} initialSelection={selectedIds} />
      <section id="model-comparison" aria-labelledby="model-comparison-title" aria-live="polite">
        <h2 id="model-comparison-title">Side by side</h2>
        {ready ? (
          <>
            <p>You can bookmark or share this page with your selection.</p>
            <div className="table-wrap"><table>
              <thead>
                <tr>
                  <th scope="col"><span className="visually-hidden">Spec</span></th>
                  {selected.map((option) => <th scope="col" key={option.configurationId}><Link href={`/us/saunas/${option.slug}/`}>{option.brand} {option.model}</Link></th>)}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    {selected.map((option) => <td key={option.configurationId}>{row.key === "configurationLabel" ? versionLabel(option) || "standard" : option[row.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table></div>
          </>
        ) : <p>Choose at least two saunas above.</p>}
      </section>
    </>
  );
}
