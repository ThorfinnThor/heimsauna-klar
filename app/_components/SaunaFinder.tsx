"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { findProductsForFinder, formatPrice, formatVoltage, type FinderFilters, type FinderRelaxation, type Product } from "@/lib/products";

type Archetype = {
  id: string;
  label: string;
  title: string;
  summary: string;
  space: string;
  power: string;
  idealFor: string;
  status: string;
};

type FinderAnswers = FinderFilters;

const initialAnswers: FinderAnswers = {
  place: "indoor",
  people: "2",
  footprint: "compact",
  power: "unknown",
  budget: "mid",
  heat: "open",
};

export function SaunaFinder({ archetypes, products }: { archetypes: Archetype[]; products: Product[] }) {
  const [answers, setAnswers] = useState(initialAnswers);

  const recommendation = useMemo(() => {
    if (answers.place === "mobile") return archetypes.find((item) => item.id === "portable");
    if (answers.place === "outdoor") return archetypes.find((item) => item.id === "outdoor-small");
    if (answers.heat === "infrared" || (answers.heat === "open" && answers.budget === "lean")) return archetypes.find((item) => item.id === "infrared-compact");
    return archetypes.find((item) => item.id === "indoor-230v");
  }, [answers, archetypes]);

  const finderResult = useMemo(() => findProductsForFinder(products, answers), [answers, products]);

  const update = <K extends keyof FinderAnswers>(key: K, value: FinderAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const applyRelaxation = (relaxation: FinderRelaxation) => {
    setAnswers((current) => ({ ...current, [relaxation.key]: relaxation.value } as FinderAnswers));
  };

  return (
    <div className="finder-card">
      <div className="finder-questions">
        <FinderQuestion
          number="01"
          legend="Wo soll die Sauna stehen?"
          name="place"
          value={answers.place}
          options={[["indoor", "Innenraum"], ["outdoor", "Garten"], ["mobile", "Flexibel"]]}
          onChange={(value) => update("place", value as FinderAnswers["place"])}
        />
        <FinderQuestion
          number="02"
          legend="Für wie viele Personen soll sie reichen?"
          name="people"
          value={answers.people}
          options={[["1", "1 Person"], ["2", "2 Personen"], ["4", "4 Personen"], ["flex", "Noch offen"]]}
          onChange={(value) => update("people", value as FinderAnswers["people"])}
        />
        <FinderQuestion
          number="03"
          legend="Wie groß darf die reine Produktfläche sein?"
          name="footprint"
          value={answers.footprint}
          options={[["compact", "Bis 3 m²"], ["standard", "Bis 6 m²"], ["open", "Noch offen"]]}
          onChange={(value) => update("footprint", value as FinderAnswers["footprint"])}
        />
        <FinderQuestion
          number="04"
          legend="Welcher Anschluss ist vorhanden?"
          name="power"
          value={answers.power}
          options={[["230", "230 V"], ["400", "400 V"], ["unknown", "Unbekannt"]]}
          onChange={(value) => update("power", value as FinderAnswers["power"])}
        />
        <FinderQuestion
          number="05"
          legend="Wie ist der Budgetrahmen?"
          name="budget"
          value={answers.budget}
          options={[["lean", "Bis 2.500 €"], ["mid", "Bis 6.000 €"], ["open", "Offen"]]}
          onChange={(value) => update("budget", value as FinderAnswers["budget"])}
        />
        <FinderQuestion
          number="06"
          legend="Welche Wärmeart bevorzugst du?"
          name="heat"
          value={answers.heat}
          options={[["traditional", "Klassische Sauna"], ["infrared", "Infrarot"], ["open", "Egal"]]}
          onChange={(value) => update("heat", value as FinderAnswers["heat"])}
        />
      </div>

      <div className="finder-result" aria-live="polite" aria-atomic="false">
        <p className="result-kicker">Datenbasierte Vorauswahl</p>
        <h3>{recommendation?.title}</h3>
        <p>{recommendation?.summary}</p>
        <div className="result-facts">
          <span><small>Harte Treffer</small>{finderResult.matches.length}</span>
          <span><small>Geprüfte Basis</small>{products.length} Datensätze</span>
        </div>
        <p className="result-caveat">
          {answers.power === "unknown"
            ? "Der Anschluss ist bewusst kein Filter. Die Produktfläche enthält noch keine Montage- und Wandabstände."
            : "Alle Treffer erfüllen den ausgewählten Anschluss laut Datensatz. Die Produktfläche enthält noch keine Montage- und Wandabstände."}
        </p>
        {finderResult.featuredMatches.length > 0 ? (
          <div className="finder-matches">
            <p>{Math.min(4, finderResult.matches.length)} von {finderResult.matches.length} passenden Datensätzen</p>
            {finderResult.featuredMatches.map(({ product, reasons }) => (
              <Link href={`/de/produkte/${product.product_id}/`} key={product.product_id}>
                <span>
                  <strong>{product.brand} {product.model}</strong>
                  <small>{formatVoltage(product.power.voltage)} · {formatPrice(product)}</small>
                  <span className="finder-match-reasons">{reasons.join(" · ")}</span>
                </span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
            <Link className="finder-catalog-link" href="/de/produkte/">Gesamten Katalog öffnen <span aria-hidden="true">↗</span></Link>
          </div>
        ) : (
          <div className="finder-empty">
            <strong>Keine harte Übereinstimmung</strong>
            <p>Für diese Kombination ist noch kein verifizierter Datensatz im Katalog. Das ist eine Datenlücke, keine Aussage zur Marktverfügbarkeit.</p>
            {finderResult.relaxations.length > 0 ? (
              <div className="finder-relaxations" aria-label="Einzelne Filter öffnen">
                {finderResult.relaxations.map((relaxation) => (
                  <button type="button" onClick={() => applyRelaxation(relaxation)} key={relaxation.key}>
                    {relaxation.label} · {relaxation.matchCount} Treffer
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function FinderQuestion({ number, legend, name, value, options, onChange }: {
  number: string;
  legend: string;
  name: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend><span>{number}</span>{legend}</legend>
      <div className="segmented-control">
        {options.map(([optionValue, label]) => (
          <label key={optionValue}>
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
