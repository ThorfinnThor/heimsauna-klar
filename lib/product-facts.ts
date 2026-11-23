import { formatCapacity, formatVoltage, getLowestOffer, type Product } from "@/lib/products";

const euros = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

export function shortPrice(value: number) {
  return euros.format(value).replace(/,00(?=\s)/, "");
}

export function listPrice(product: Product) {
  const offer = getLowestOffer(product);
  if (!offer) return null;
  return `${product.commercial.price_status === "from" ? "ab " : ""}${shortPrice(offer.price)}`;
}

export function dimensions(product: Product) {
  const { width, depth, height } = product.dimensions_cm;
  return `${[width, depth, height].map((value) => value.toLocaleString("de-DE")).join(" × ")} cm`;
}

export function factLine(product: Product) {
  const parts = [dimensions(product), formatCapacity(product)];
  if (product.power.voltage === "wood") parts.push("Holzofen");
  else if (product.power.voltage !== "none") parts.push(formatVoltage(product.power.voltage));
  if (product.power.kw !== null) parts.push(`${product.power.kw.toLocaleString("de-DE", { maximumFractionDigits: 2 })} kW`);
  return parts.join(" · ");
}

// Catalog notes that describe our own bookkeeping instead of the sauna are not shown.
const houseNotes = /belegt|dokumentier|erfasst|ausgewiesen|geprüft|prüfen|Praxiserfahrung|eigene Nutzung|Artikelnummer|Herstellerseite|Händlerseite|Herstellerangaben|Hersteller- und|Zusage|Vergleiche|Projekte|Haushalte|Standorte|Ungeklärt|geklärt|klären|Datenlage|Kaufentscheidung|Planung|Nutzungsweisen|fachlich planen|Anleitung|getrennt|geführt|Quelle|Nutzer|Datensatz|Produktfläche|Raumprofil|nachvollziehbar|belastbare Aussage|bleibt als|Konfiguration|Katalog|Variante|offen$|eingeplant werden|einzuplanen|fachgerecht|planbar|^(Innen|Außen)aufstellung$|hinzu$|gleichzusetzen|konfigurier|ist separat|separat zu/i;

export function plainPoints(items: string[], limit = 4) {
  return items
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter((item) => item.length > 0 && item.length <= 90 && !houseNotes.test(item))
    .slice(0, limit);
}

const heaterNotIncluded = /ohne (fest zugeordneten )?(sauna)?ofen|ofen separat|ofen nicht enthalten|ohne saunaofen/i;

// What you need to know about heater and supply, in one or two sentences.
export function powerText(product: Product) {
  const { voltage, kw, plug_type: plug, electrician_required: electrician, notes } = product.power;
  const power = kw === null ? "" : `${kw.toLocaleString("de-DE", { maximumFractionDigits: 2 })} kW`;
  if (voltage === "wood") return "Geheizt wird mit Holz, ein Stromanschluss ist dafür nicht nötig. Frag vor dem Kauf den Schornsteinfeger, was er an deinem Standort verlangt.";
  if (voltage === "none") {
    if (/optional|ohne/i.test(product.sauna.heater_type) || [notes, ...product.editorial.pros, ...product.editorial.cons].some((text) => heaterNotIncluded.test(text))) {
      return "Der Ofen kostet extra. Welchen Anschluss du brauchst, hängt davon ab, welchen du dazu nimmst.";
    }
    if (power) return `Die Leistung liegt bei ${power}. Den Anschluss nennt der Hersteller nicht, frag also vor der Bestellung nach.`;
    return "Zum Stromanschluss steht bei Hersteller und Händler nichts Eindeutiges. Frag vor der Bestellung nach.";
  }
  const supply = power ? `${power} an ${voltage} Volt` : `Anschluss an ${voltage} Volt`;
  if (voltage === 400) return `${supply}. Das schließt ein Elektriker an.`;
  if (plug && /steckdose|stecker/i.test(plug)) return `${supply}, laut Hersteller reicht eine normale Steckdose.${electrician ? " Lass den Stromkreis trotzdem von einem Elektriker prüfen." : ""}`;
  if (electrician) return `${supply}. Lass den Stromkreis vorher von einem Elektriker prüfen.`;
  return `${supply}. Ob ein Stecker reicht oder fest angeschlossen werden muss, steht in der Anleitung.`;
}

export function knownText(value: string) {
  return /nicht (ausgewiesen|angegeben|genannt)|unbekannt/i.test(value) ? null : value;
}
