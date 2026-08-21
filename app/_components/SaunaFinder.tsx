"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { formatPrice, rankProducts } from "@/lib/products";

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

type FinderAnswers = {
  place: "indoor" | "outdoor" | "mobile";
  power: "230" | "400" | "unknown";
  budget: "lean" | "mid" | "open";
};

const initialAnswers: FinderAnswers = {
  place: "indoor",
  power: "230",
  budget: "mid",
};

export function SaunaFinder({ archetypes, products }: { archetypes: Archetype[]; products: Product[] }) {
  const [answers, setAnswers] = useState(initialAnswers);

  const recommendation = useMemo(() => {
    if (answers.place === "mobile") return archetypes.find((item) => item.id === "portable");
    if (answers.place === "outdoor") return archetypes.find((item) => item.id === "outdoor-small");
    if (answers.budget === "lean") return archetypes.find((item) => item.id === "infrared-compact");
    return archetypes.find((item) => item.id === "indoor-230v");
  }, [answers, archetypes]);

  const matchingProducts = useMemo(() => rankProducts(products, answers), [answers, products]);

  const update = <K extends keyof FinderAnswers>(key: K, value: FinderAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
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
          legend="Welcher Anschluss ist vorhanden?"
          name="power"
          value={answers.power}
          options={[["230", "230 V"], ["400", "400 V"], ["unknown", "Unbekannt"]]}
          onChange={(value) => update("power", value as FinderAnswers["power"])}
        />
        <FinderQuestion
          number="03"
          legend="Wie ist der Budgetrahmen?"
          name="budget"
          value={answers.budget}
          options={[["lean", "Bis 2.500 €"], ["mid", "Bis 6.000 €"], ["open", "Offen"]]}
          onChange={(value) => update("budget", value as FinderAnswers["budget"])}
        />
      </div>

      <div className="finder-result" aria-live="polite">
        <p className="result-kicker">Deine sinnvolle Startrichtung</p>
        <h3>{recommendation?.title}</h3>
        <p>{recommendation?.summary}</p>
        <div className="result-facts">
          <span><small>Typischer Platz</small>{recommendation?.space}</span>
          <span><small>Anschluss</small>{recommendation?.power}</span>
        </div>
        <p className="result-caveat">
          {answers.power === "unknown"
            ? "Den vorhandenen Anschluss vor der Produktauswahl fachlich klären."
            : "Im nächsten Schritt werden echte, quellengeprüfte Modelle aus dem Produktkatalog gefiltert."}
        </p>
        {matchingProducts.length > 0 ? (
          <div className="finder-matches">
            <p>Aktuell passend im Katalog</p>
            {matchingProducts.slice(0, 2).map((product) => (
              <Link href={`/de/produkte/${product.product_id}/`} key={product.product_id}>
                <span><strong>{product.brand} {product.model}</strong><small>{product.dimensions_cm.width} × {product.dimensions_cm.depth} × {product.dimensions_cm.height} cm · {formatPrice(product)}</small></span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="finder-empty">Für diese Kombination ist noch kein verifizierter Datensatz im Katalog. Das ist eine Datenlücke, keine Kaufempfehlung.</p>
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
