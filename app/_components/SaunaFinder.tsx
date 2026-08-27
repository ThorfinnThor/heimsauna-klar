"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { FinderFilters } from "@/lib/products";

type FinderAnswers = FinderFilters;

const initialAnswers: FinderAnswers = {
  place: "indoor",
  people: "2",
  footprint: "compact",
  power: "unknown",
  budget: "mid",
  heat: "open",
};

export function SaunaFinder() {
  const router = useRouter();
  const [answers, setAnswers] = useState(initialAnswers);

  const update = <K extends keyof FinderAnswers>(key: K, value: FinderAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({ finder: "1", ...answers });
    router.push(`/de/produkte/?${params.toString()}#catalog-results`);
  };

  return (
    <form className="finder-card finder-form" onSubmit={submit}>
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
          legend="Welche Energieversorgung ist möglich?"
          name="power"
          value={answers.power}
          options={[["230", "230 V"], ["400", "400 V"], ["wood", "Holzofen"], ["unknown", "Noch offen"]]}
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
        <div className="finder-submit-row">
          <p>Die Ergebnisse öffnen im Produktkatalog. Dort kannst du die Auswahl weiter eingrenzen.</p>
          <button className="button button-primary" type="submit">Suchen <span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </form>
  );
}

function FinderQuestion({ number, legend, name, value, options, onChange }: {
  number: string;
  legend: string;
  name: string;
  value: string;
  options: Array<[string, string]>;
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
