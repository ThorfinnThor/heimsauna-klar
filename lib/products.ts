import productData from "@/data/products.json";

export type Product = {
  product_id: string;
  brand: string;
  model: string;
  category: "indoor" | "outdoor" | "infrared" | "portable" | "tent";
  status: "draft" | "verified" | "archived";
  dimensions_cm: { width: number; depth: number; height: number };
  people: { min: number; max: number; seats: number; lying_places: number };
  power: {
    voltage: number | "wood" | "none";
    kw: number | null;
    plug_type: string | null;
    electrician_required: boolean;
    notes: string;
  };
  sauna: {
    type: string;
    indoor_outdoor: "indoor" | "outdoor";
    heater_type: string;
    max_temp_c: number | null;
    heat_up_time_min: number | null;
    wood_type: string;
  };
  commercial: {
    currency: string;
    price_status: "from" | "current" | "unavailable";
    offers: Array<{
      merchant: string;
      price: number;
      availability: string;
      url: string;
      affiliate: boolean;
      last_checked: string;
    }>;
  };
  editorial: {
    pros: string[];
    cons: string[];
    ideal_for: string[];
    not_for: string[];
    test_status: "not_tested" | "hands_on" | "lab_tested";
    editorial_score: number | null;
    disclosure: string;
  };
  sources: Array<{ type: string; title: string; url: string; checked_at: string }>;
  updated_at: string;
};

export const products = (productData as Product[]).filter((product) => product.status === "verified");

export type FinderFilters = {
  place: "indoor" | "outdoor" | "mobile";
  power: "230" | "400" | "unknown";
  budget: "lean" | "mid" | "open";
};

export function getProduct(productId: string) {
  return products.find((product) => product.product_id === productId);
}

export function formatPrice(product: Product) {
  const offer = product.commercial.offers[0];
  if (!offer) return "Preis nicht verfügbar";
  const value = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: product.commercial.currency,
    maximumFractionDigits: 2,
  }).format(offer.price);
  return product.commercial.price_status === "from" ? `ab ${value}` : value;
}

export function formatGermanDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function getLatestOfferCheck(productList: Product[]) {
  return productList
    .flatMap((product) => product.commercial.offers.map((offer) => offer.last_checked))
    .sort((a, b) => b.localeCompare(a))[0] ?? null;
}

export function rankProducts(productList: Product[], filters: FinderFilters) {
  return productList
    .map((product) => {
      const offer = product.commercial.offers[0];
      const price = offer?.price ?? Number.POSITIVE_INFINITY;
      const placeFit = filters.place === "mobile"
        ? (product.category === "portable" || product.category === "tent" ? 4 : 0)
        : product.sauna.indoor_outdoor === filters.place ? 4 : 0;
      const powerFit = filters.power === "unknown" || product.power.voltage === Number(filters.power) ? 3 : 0;
      const budgetFit = filters.budget === "open"
        ? 2
        : filters.budget === "lean" && price <= 2500
          ? 2
          : filters.budget === "mid" && price <= 6000
            ? 2
            : 0;
      return { product, score: placeFit + powerFit + budgetFit };
    })
    .filter(({ score }) => score >= 6)
    .sort((a, b) => b.score - a.score || a.product.model.localeCompare(b.product.model, "de"))
    .map(({ product }) => product);
}
