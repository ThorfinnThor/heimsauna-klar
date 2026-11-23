"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

const questions: Array<{ name: string; label: string; initial: string; options: Array<[string, string]> }> = [
  { name: "place", label: "Wo soll sie stehen?", initial: "open", options: [["open", "egal"], ["indoor", "drinnen"], ["outdoor", "im Garten"], ["mobile", "Zelt oder mobil"]] },
  { name: "people", label: "Für wie viele?", initial: "flex", options: [["flex", "egal"], ["1", "1 Person"], ["2", "2 Personen"], ["4", "4 Personen"]] },
  { name: "footprint", label: "Wie groß darf sie sein?", initial: "open", options: [["open", "egal"], ["compact", "bis 3 m²"], ["standard", "bis 6 m²"]] },
  { name: "power", label: "Womit heizen?", initial: "unknown", options: [["unknown", "weiß noch nicht"], ["230", "Strom, 230 Volt"], ["400", "Strom, 400 Volt"], ["wood", "Holzofen"]] },
  { name: "budget", label: "Was darf sie kosten?", initial: "open", options: [["open", "egal"], ["lean", "bis 2.500 €"], ["mid", "bis 6.000 €"]] },
  { name: "heat", label: "Sauna oder Infrarot?", initial: "open", options: [["open", "egal"], ["traditional", "Sauna mit Ofen"], ["infrared", "Infrarot"]] },
];

export function SaunaFinder() {
  const router = useRouter();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({ finder: "1" });
    for (const [name, value] of new FormData(event.currentTarget)) params.set(name, String(value));
    router.push(`/de/produkte/?${params.toString()}#catalog-results`);
  };

  return (
    <form className="finder" onSubmit={submit}>
      <div className="fields">
        {questions.map((question) => (
          <label key={question.name}>
            {question.label}
            <select name={question.name} defaultValue={question.initial}>
              {question.options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        ))}
      </div>
      <button className="btn" type="submit">Passende Saunen zeigen</button>
    </form>
  );
}
