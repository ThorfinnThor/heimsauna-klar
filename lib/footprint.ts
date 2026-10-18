import { products, type Product } from "@/lib/products";

// Footprint by seating capacity, computed from the verified catalogue at build
// time so the planning guide never states stale numbers. Footprint is the
// manufacturer's exterior width × depth, without the clearances a model's
// installation manual adds.

export type FootprintRow = {
  capacity: string;
  count: number;
  smallest: { product: Product; squareMetres: number };
  medianSquareMetres: number;
  largestSquareMetres: number;
  medianHeightCm: number;
  maxHeightCm: number;
};

export type FootprintGroup = { id: "indoor" | "outdoor"; label: string; rows: FootprintRow[] };

const CAPACITIES = [1, 2, 3, 4, 5, 6] as const;

function squareMetres(product: Product) {
  return (product.dimensions_cm.width * product.dimensions_cm.depth) / 10_000;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function rowsFor(selection: Product[]): FootprintRow[] {
  const rows: FootprintRow[] = [];
  for (const capacity of CAPACITIES) {
    const members = selection.filter((product) => (capacity === 6 ? product.people.max >= 6 : product.people.max === capacity));
    if (members.length < 3) continue;
    const smallest = members.reduce((best, product) => (squareMetres(product) < squareMetres(best) ? product : best));
    const heights = members.map((product) => product.dimensions_cm.height).filter((height) => height > 0);
    rows.push({
      capacity: capacity === 6 ? "6 und mehr" : String(capacity),
      count: members.length,
      smallest: { product: smallest, squareMetres: squareMetres(smallest) },
      medianSquareMetres: median(members.map(squareMetres)),
      largestSquareMetres: Math.max(...members.map(squareMetres)),
      medianHeightCm: median(heights),
      maxHeightCm: Math.max(...heights),
    });
  }
  return rows;
}

export function getFootprintGroups(): FootprintGroup[] {
  const measured = products.filter((product) => product.dimensions_cm?.width > 0 && product.dimensions_cm?.depth > 0);
  return [
    { id: "indoor", label: "Innensauna und Infrarotkabine", rows: rowsFor(measured.filter((product) => product.category === "indoor" || product.category === "infrared")) },
    { id: "outdoor", label: "Gartensauna und Saunahaus", rows: rowsFor(measured.filter((product) => product.category === "outdoor")) },
  ];
}

export function formatSquareMetres(value: number) {
  return `${value.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m²`;
}
