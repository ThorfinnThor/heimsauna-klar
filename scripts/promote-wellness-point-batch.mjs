import { readFile, writeFile } from "node:fs/promises";

const paths = {
  drafts: new URL("../data/awin-wellness-point-product-drafts-17.json", import.meta.url),
  review: new URL("../data/awin-wellness-point-sol-review-17.json", import.meta.url),
  products: new URL("../data/products.json", import.meta.url),
  overrides: new URL("../data/product-editorial-overrides.json", import.meta.url),
  readiness: new URL("../data/launch-readiness.json", import.meta.url),
  powerEvidence: new URL("../data/power-evidence.json", import.meta.url),
};

const [drafts, review, products, overrides, readiness, powerEvidence] = await Promise.all(
  Object.values(paths).map(async (path) => JSON.parse(await readFile(path, "utf8"))),
);

const acceptedIds = new Set(review.accepted_product_ids);
if (review.review_model !== "sol" || acceptedIds.size !== 17 || review.held_product_ids.length !== 0) {
  throw new Error("Wellness Point promotion requires a complete Sol acceptance of all 17 products");
}

const editorialOverrides = {
  "wellness-point-dampfdusche-alaska-infrarot-90": {
    intro: "Die Dampfdusche Alaska verbindet auf 90 × 90 cm einen Dampfgenerator mit Infrarotstrahlern. Sie ist für eine Person ausgelegt und benötigt mit 215 cm mehr Höhe als viele reine Infrarotkabinen.",
    detail: "Auf der Produktseite stehen 3 kW für den Dampfgenerator und 1,8 kW für die Infrarottechnik. Eine gemeinsame Anschlussleistung wird nicht genannt. Diese offene Angabe gehört vor der Bestellung mit dem Händler und dem ausführenden Elektrofachbetrieb geklärt."
  },
  "wellness-point-dampfdusche-arizona-infrarot-145": {
    intro: "Arizona nutzt eine 145 cm breite, aber nur 90 cm tiefe Grundfläche. Die Kabine kombiniert Dampf und Infrarot für bis zu zwei Personen und kann dadurch in einen länglichen Aufstellbereich passen.",
    detail: "Der 3-kW-Dampfgenerator und die Infrarotstrahler mit zusammen 1,8 kW sind einzeln dokumentiert. Die Produktangabe enthält keine daraus abgeleitete Gesamtlast. Für die Planung sind außerdem die Kabinenhöhe von 215 cm und der notwendige Wartungszugang maßgeblich."
  },
  "wellness-point-dampfdusche-california-infrarot-145": {
    intro: "California gehört zur 145 × 90 cm großen Klasse der kombinierten Dampf- und Infrarotkabinen. Der Platz ist laut Anbieter für höchstens zwei Personen vorgesehen.",
    detail: "Die Außenmaße entsprechen Arizona, die Modellbezeichnung allein belegt jedoch keine technische Gleichheit. Im Katalog stehen deshalb nur die direkt ausgewiesenen Werte. Dazu zählen der 3-kW-Dampfgenerator, 1,8 kW Infrarotleistung und 215 cm Höhe."
  },
  "wellness-point-dampfdusche-colorado-infrarot-100": {
    intro: "Colorado benötigt mit 100 × 90 cm wenig Bodenfläche und ist als Einzelkabine beschrieben. Dampf und Infrarot sind in einem 215 cm hohen Gehäuse kombiniert.",
    detail: "Für die beiden Heizarten nennt Wellness-Point getrennte Leistungswerte von 3 kW und 1,8 kW. Ohne ausgewiesene Gesamtlast lässt sich daraus keine fertige Elektroplanung ableiten. Auch die Anschlüsse für Wasser und Ablauf müssen zum vorgesehenen Raum passen."
  },
  "wellness-point-dampfdusche-florida-infrarot-145": {
    intro: "Florida bietet zwei Personen eine 145 × 90 cm große kombinierte Dampf- und Infrarotkabine. Die geringe Tiefe kann bei schmalen Raumzuschnitten helfen, während die Breite von 145 cm vollständig frei bleiben muss.",
    detail: "Dampfgenerator und Infrarotstrahler werden mit 3 kW beziehungsweise 1,8 kW beschrieben. Eine belastbare Gesamtanschlussleistung fehlt. Vor dem Einbau sind daher Elektroanschluss, Wasserführung, Raumhöhe und die vom Anbieter verlangten Abstände gemeinsam zu prüfen."
  },
  "wellness-point-dampfdusche-kansas-infrarot-100": {
    intro: "Kansas ist eine quadratische Einpersonen-Kabine mit 100 cm Seitenlänge. Sie vereint Dampfbetrieb und Infrarotwärme und erreicht außen eine Höhe von 215 cm.",
    detail: "Der quadratische Grundriss unterscheidet Kansas von den 90 cm tiefen Rechteckmodellen. Technisch sind ein 3-kW-Dampfgenerator und 1,8 kW Infrarotleistung genannt. Die konkrete Absicherung und Steckerlösung sind in der Quelle nicht festgelegt."
  },
  "wellness-point-dampfdusche-virginia-infrarot-100": {
    intro: "Virginia nimmt ebenfalls 100 × 100 cm ein und richtet sich an eine Person. Für den Vergleich mit Kansas sollten Außenmaße, Ausstattung, Türanschlag und Installationsführung gemeinsam kontrolliert werden.",
    detail: "Die technische Beschreibung führt 3 kW Dampfleistung und 1,8 kW für die Infrarotstrahler auf. Eine einzelne Gesamtleistung wird nicht ausgewiesen. Der 230-V-Hinweis ersetzt deshalb keine Prüfung der vollständigen Anschlussbedingungen."
  },
  "wellness-point-finnische-sauna-alaska-i": {
    intro: "Alaska I ist eine 150 × 150 cm große Innensauna für bis zu drei Personen. Zum beschriebenen Set gehört ein Harvia-Ofen mit 4,5 kW.",
    detail: "Die Produktseite nennt 230 V und 380 V nebeneinander, ohne die konkrete Setausführung eindeutig zu trennen. Im Finder bleibt die Spannung daher offen. Vor dem Kauf muss feststehen, welche Ofenvariante geliefert wird und welcher Anschluss dafür erforderlich ist."
  },
  "wellness-point-finnische-sauna-alaska-ii": {
    intro: "Alaska II erweitert die Reihe auf 175 × 200 cm und vier Personen. Der zugehörige Harvia-Ofen ist mit 6 kW angegeben.",
    detail: "Als Anschluss nennt die Quelle 380 V. Dieser historische Nennwert wird im Katalog nicht automatisch als 400 V behandelt. Ein Elektrofachbetrieb muss die aktuelle Geräteausführung, Absicherung und Zuleitung anhand der gelieferten Unterlagen festlegen."
  },
  "wellness-point-finnische-sauna-alaska-iii": {
    intro: "Alaska III ist mit 208 × 200 cm das größte der drei geprüften Alaska-Modelle. Die Kabine bietet laut Produktseite bis zu fünf Personen Platz und enthält einen 8-kW-Harvia-Ofen.",
    detail: "Die Anschlussangabe lautet 380 V und bleibt deshalb in unserem 230/400-V-Filter neutral. Neben der Elektroplanung verdienen auch Transportweg und Montagefläche Aufmerksamkeit, weil die Kabine mehr als zwei Meter breit ist."
  },
  "wellness-point-infrarotkabine-goteborg": {
    intro: "Göteborg ist eine 150 × 150 cm große Infrarotkabine für zwei Personen. Neun Strahler ergeben laut Produktangabe 2,725 kW und werden über 230 V versorgt.",
    detail: "Der quadratische Grundriss benötigt mehr Stellfläche als die schmaleren Oslo- und Stockholm-Modelle. Die Wärme kommt ausschließlich von Infrarotstrahlern, ein Saunaofen für Aufgüsse gehört nicht zur beschriebenen Ausstattung."
  },
  "wellness-point-infrarotkabine-helsinki-beta": {
    intro: "Helsinki Beta ist ausdrücklich für die Außenaufstellung vorgesehen. Auf 153 × 125 cm bietet sie bis zu vier Personen Platz und arbeitet mit sieben Vollspektrumstrahlern sowie einem Karbonstrahler.",
    detail: "Die Produktseite weist 2,425 kW und 230 V für eine Standardsteckdose aus. Für die Gartenplanung sind zusätzlich ein geeigneter Untergrund, Witterungsschutz und die 210 cm hohe Kabine zu berücksichtigen. Der Anbieter empfiehlt nach der Montage eine Dachpappe."
  },
  "wellness-point-infrarotkabine-oslo-alpha": {
    intro: "Oslo Alpha bringt zwei Sitzplätze auf 120 × 105 cm unter. Drei Vollspektrum- und drei Karbonstrahler erreichen zusammen 1,89 kW bei 230 V.",
    detail: "Die Kabine ist mit 190 cm niedriger und deutlich schmaler als Göteborg. Wellness-Point nennt eine Standardsteckdose. Ob Steckdose, Stromkreis und Aufstellort die Herstellerbedingungen erfüllen, muss dennoch am vorgesehenen Platz geprüft werden."
  },
  "wellness-point-infrarotkabine-stockholm-alpha": {
    intro: "Stockholm Alpha misst 90 × 90 × 190 cm und ist für eine Person ausgelegt. Zwei Vollspektrum- und drei Karbonstrahler liefern zusammen 1,425 kW.",
    detail: "Das Modell gehört zu den kleinsten Infrarotkabinen dieses Anbieters und wird mit 230 V für eine Standardsteckdose beschrieben. Die kompakte Grundfläche bedeutet reine Sitznutzung; eine Liegefläche oder ein Saunaofen sind nicht Teil der dokumentierten Ausführung."
  },
  "wellness-point-infrarotsauna-alpha-i": {
    intro: "Alpha I kombiniert in einer 125 × 110 cm großen Kabine fünf Infrarot-Flächenstrahler mit einem 3-kW-Saunaofen. Die Kapazität ist mit zwei Personen angegeben.",
    detail: "Für die Infrarotstrahler stehen zusammen 1,82 kW in der Produktbeschreibung. Die Quelle nennt jedoch keine eindeutige Netzspannung und keine gemeinsame Anschlussleistung beider Heizsysteme. Der elektrische Aufbau muss daher anhand der aktuellen Anschlussunterlagen geplant werden."
  },
  "wellness-point-infrarotsauna-alpha-ii": {
    intro: "Alpha II bietet bis zu vier Personen Platz und verbindet 3,1 kW Infrarotleistung mit einem 4,5-kW-Saunaofen. Das Außenmaß beträgt 120 × 160 × 200 cm.",
    detail: "Die beiden Heizsysteme sind einzeln beschrieben, aber weder Netzspannung noch Gesamtanschlusswert sind eindeutig ausgewiesen. Für die Installation ist deshalb die Anschlussvorgabe der tatsächlich gelieferten Steuerung und Geräte maßgeblich; die rechnerische Summe genügt dafür nicht."
  },
  "wellness-point-infrarotsauna-alpha-iii": {
    intro: "Alpha III ist für bis zu sechs Personen vorgesehen. Auf 160 × 210 cm kombiniert sie 14 Infrarotstrahler mit 4,55 kW und einen Saunaofen mit 6 kW.",
    detail: "Die Größe und die zwei getrennt ausgewiesenen Wärmesysteme machen dieses Modell planungsintensiver als Alpha I und II. Da die Produktseite keine eindeutige Spannung oder Gesamtanschlussleistung nennt, bleiben beide Werte im Finder offen und müssen vor Ort fachlich bestimmt werden."
  }
};

if (Object.keys(editorialOverrides).length !== acceptedIds.size) {
  throw new Error("Every accepted Wellness Point product needs individual editorial copy");
}

const draftById = new Map(drafts.products.map((product) => [product.product_id, product]));
for (const productId of acceptedIds) {
  const draft = draftById.get(productId);
  if (!draft) throw new Error(`Missing accepted draft ${productId}`);
  if (!editorialOverrides[productId]) throw new Error(`Missing editorial override ${productId}`);

  draft.status = "verified";
  for (const source of draft.sources) {
    source.type = "manufacturer";
    source.title = source.title.replace("Produktseite", "eigene technische Produktseite");
  }
}

const goteborg = draftById.get("wellness-point-infrarotkabine-goteborg");
goteborg.power = {
  voltage: 230,
  kw: 2.725,
  plug_type: "Standardsteckdose laut Produktseite",
  electrician_required: false,
  notes: "Die Produktseite nennt 2.725 W und 230 V für eine handelsübliche EU-Steckdose; die örtlichen Anschlussbedingungen bleiben zu prüfen."
};
goteborg.editorial.ideal_for = [
  "Zwei Personen mit 150 × 150 cm freier Stellfläche",
  "Innenräume mit quadratischem Grundriss",
  "Planungen mit dokumentiertem 230-V-Anschluss"
];

const helsinki = draftById.get("wellness-point-infrarotkabine-helsinki-beta");
helsinki.category = "outdoor";
helsinki.sauna.indoor_outdoor = "outdoor";
helsinki.sauna.wood_type = "kanadisches Hemlockholz laut Produktseite";
helsinki.power = {
  voltage: 230,
  kw: 2.425,
  plug_type: "Standardsteckdose laut Produktseite",
  electrician_required: false,
  notes: "Die aktuelle Produktseite nennt 2.425 W und 230 V für eine Standardsteckdose. Die Kabine ist ausdrücklich für den Außenbereich beschrieben."
};
helsinki.editorial.pros = [
  "Outdoor-Ausführung mit 153 × 125 cm Grundfläche",
  "2,425 kW und 230 V sind auf der Produktseite ausgewiesen",
  "Bis zu vier Personen laut Anbieterangabe"
];
helsinki.editorial.cons = [
  "Untergrund und zusätzlicher Dachschutz gehören zur Außenplanung",
  "Die Sitzaufteilung ist nicht mit Einzelmaßen dokumentiert",
  "210 cm Kabinenhöhe plus Montagefreiraum müssen verfügbar sein"
];
helsinki.editorial.ideal_for = [
  "Garten oder Terrasse mit vorbereiteter Stromversorgung",
  "Gruppen bis vier Personen mit Interesse an Infrarotwärme",
  "Außenstandorte mit planbarem Witterungsschutz"
];
helsinki.editorial.not_for = [
  "Ungeschützte Aufstellung ohne geeigneten Untergrund",
  "Innenräume mit weniger als 210 cm Höhe"
];

const copyReplacements = new Map([
  ["wellness-point-dampfdusche-california-infrarot-145", ["Bis zu zwei Personen laut Produktbeschreibung", "Vergleiche der 145 × 90 cm großen Kombikabinen", "Dampf- und Infrarotnutzung auf schmaler Stellfläche", "Geplante Aufstellung im Innenraum"]],
  ["wellness-point-dampfdusche-colorado-infrarot-100", ["Innenräume mit maximal 100 cm verfügbarer Breite", "Alleinnutzung in einer kombinierten Dampf- und Infrarotkabine", "Rechteckige Stellflächen mit 90 cm Tiefe"]],
  ["wellness-point-dampfdusche-virginia-infrarot-100", ["Alleinnutzung auf quadratischer Grundfläche", "Kompakte Aufstellung im Bad oder privaten Wellnessraum", "Direkter Vergleich mit Kansas bei gleicher Außenfläche"]]
]);
for (const [productId, replacement] of copyReplacements) {
  draftById.get(productId).editorial.ideal_for = replacement;
}

draftById.get("wellness-point-dampfdusche-alaska-infrarot-90").editorial.ideal_for[0] = "Nutzung durch eine einzelne Person";
draftById.get("wellness-point-dampfdusche-alaska-infrarot-90").editorial.not_for[1] = "Gemeinsame Nutzung mit weiteren Personen";
draftById.get("wellness-point-dampfdusche-arizona-infrarot-145").editorial.cons[1] = "Dampf- und Infrarotleistung werden nur getrennt ausgewiesen";
draftById.get("wellness-point-dampfdusche-california-infrarot-145").editorial.pros[2] = "Kapazität bis zwei Personen dokumentiert";
draftById.get("wellness-point-dampfdusche-colorado-infrarot-100").editorial.cons[0] = "Ein gemeinsamer Anschlusswert fehlt";
draftById.get("wellness-point-dampfdusche-colorado-infrarot-100").editorial.not_for[0] = "Kabinen für zwei oder mehr Personen";
draftById.get("wellness-point-dampfdusche-kansas-infrarot-100").editorial.ideal_for[1] = "Alleinnutzung in einer quadratischen Kabine";
draftById.get("wellness-point-dampfdusche-kansas-infrarot-100").editorial.not_for[0] = "Nutzung mit Begleitperson";
draftById.get("wellness-point-infrarotkabine-goteborg").editorial.pros[2] = "Für zwei Nutzer beschrieben";
draftById.get("wellness-point-infrarotkabine-stockholm-alpha").editorial.ideal_for[1] = "Solo-Nutzung auf 90 × 90 cm";
draftById.get("wellness-point-infrarotkabine-stockholm-alpha").editorial.not_for[0] = "Zwei oder mehr Nutzer gleichzeitig";

const existingById = new Map(products.map((product) => [product.product_id, product]));
let added = 0;
for (const productId of acceptedIds) {
  if (existingById.has(productId)) throw new Error(`Product ${productId} is already public`);
  products.push(structuredClone(draftById.get(productId)));
  overrides.entries[productId] = editorialOverrides[productId];
  added += 1;
}

drafts.publication_status = "published-after-sol-review";
drafts.sol_review = "data/awin-wellness-point-sol-review-17.json";
drafts.policy = "Die 17 veröffentlichten Datensätze beruhen auf erreichbaren, produktspezifischen Wellness-Point-Seiten und dem authentifizierten Awin-Feed. Nicht eindeutig ausgewiesene Anschlusswerte bleiben neutral; eigene Nutzung oder Montage wird nicht behauptet.";
drafts.products = [...draftById.values()];
overrides.updated_at = review.reviewed_at;
readiness.updated_at = review.reviewed_at;

const catalogQualityGate = readiness.gates.find((gate) => gate.id === "catalog_quality");
if (!catalogQualityGate) throw new Error("Launch readiness lacks catalog_quality");
catalogQualityGate.detail = `${products.filter((product) => product.status === "verified").length} eindeutige Produktdatensätze werden bei jedem Build gegen Quellen-, Preis-, Händler- und Schemakriterien geprüft.`;

const voltageNeutralProducts = products.filter((product) => product.power.voltage === "none");
powerEvidence.updated_at = review.reviewed_at;
powerEvidence.snapshot = {
  products: products.length,
  explicit_voltage: {
    "120": products.filter((product) => product.power.voltage === 120).length,
    "230": products.filter((product) => product.power.voltage === 230).length,
    "400": products.filter((product) => product.power.voltage === 400).length
  },
  voltage_not_assigned: voltageNeutralProducts.length,
  no_oven_or_unconfigured: voltageNeutralProducts.filter((product) => product.power.kw === null).length,
  electric_heater_voltage_unstated: voltageNeutralProducts.filter((product) => product.power.kw !== null).length
};

await Promise.all([
  writeJson(paths.drafts, drafts),
  writeJson(paths.products, products),
  writeJson(paths.overrides, overrides),
  writeJson(paths.readiness, readiness),
  writeJson(paths.powerEvidence, powerEvidence)
]);

console.log(`Wellness Point promotion complete: ${added} products added and ${added} individual editorial overrides written.`);

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
