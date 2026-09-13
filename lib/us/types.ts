export type UsFact<T> =
  | { status: "documented"; value: T; evidence_ids: string[] }
  | { status: "unknown"; reason: string }
  | { status: "not-applicable"; reason: string }
  | { status: "conflict"; evidence_ids: string[]; note: string };

export type UsPublicationStatus = "candidate" | "draft" | "reviewed" | "published" | "retired";
export type UsProductType = "sauna-cabin" | "sauna-kit" | "sauna-tent" | "sauna-blanket" | "heater" | "accessory";
export type UsHeatType = "traditional" | "infrared" | "hybrid" | "not-applicable";
export type UsEnergySource = "electric" | "wood" | "other";
export type UsPlacement = "indoor" | "outdoor";

export interface UsMeasurement {
  value: number;
  unit: "in" | "ft" | "mm" | "cm";
}

export interface UsDimensions {
  width: UsMeasurement;
  depth: UsMeasurement;
  height: UsMeasurement;
}

export interface UsSource {
  id: string;
  type:
    | "manufacturer-page"
    | "manual"
    | "spec-sheet"
    | "retailer-page"
    | "affiliate-feed"
    | "program-terms"
    | "account-approval"
    | "certification-record"
    | "other";
  url: string;
  title: string;
  publisher: string;
  market: "US" | "global";
  checked_at: string;
  document_revision?: string;
  locator?: string;
  notes?: string;
}

export interface UsFieldEvidence {
  id: string;
  entity_id: string;
  field_path: string;
  source_id: string;
  raw_value?: string;
  interpretation_note?: string;
}

export interface UsMarketProduct {
  id: string;
  market: "US";
  slug: string;
  brand_name: string;
  model: string;
  product_type: UsFact<UsProductType>;
  heat_type: UsFact<UsHeatType>;
  energy_sources: UsFact<UsEnergySource[]>;
  placements: UsFact<UsPlacement[]>;
  form: UsFact<string>;
  configuration_ids: string[];
  source_ids: string[];
  publication_status: UsPublicationStatus;
  spec_checked_at?: string;
  content_updated_at?: string;
  next_review_at?: string;
  change_reason: string;
}

export interface UsComponent {
  id: string;
  component_type: "cabin" | "heater" | "infrared-system" | "controls" | "lighting" | "stones" | "wiring" | "chimney" | "other";
  name: string;
  inclusion: "included" | "excluded" | "unknown";
  evidence_ids: string[];
}

export interface UsElectricalRequirement {
  component: "heater" | "infrared-system" | "controls-lighting" | "other";
  voltage_v: UsFact<number>;
  frequency_hz: UsFact<number>;
  phase: UsFact<1 | 3>;
  rated_power_w: UsFact<number>;
  rated_current_a: UsFact<number>;
  required_circuit_a: UsFact<number>;
  specified_breaker_a: UsFact<number>;
  connection: UsFact<"plug-in" | "hardwired">;
  plug_type: UsFact<string>;
  dedicated_circuit: UsFact<boolean>;
}

export interface UsElectricalSupplyOption {
  id: string;
  requirements: UsElectricalRequirement[];
  evidence_ids: string[];
}

export interface UsProductConfiguration {
  id: string;
  market: "US";
  product_id: string;
  label: string;
  manufacturer_sku: UsFact<string>;
  capacity: {
    seated: UsFact<number>;
    reclining: UsFact<number>;
  };
  dimensions: {
    exterior: UsFact<UsDimensions>;
    interior: UsFact<UsDimensions>;
    shipping: UsFact<UsDimensions>;
    minimum_clearances: UsFact<Record<string, UsMeasurement>>;
  };
  net_weight: UsFact<{ value: number; unit: "lb" | "kg" }>;
  shipping_weight: UsFact<{ value: number; unit: "lb" | "kg" }>;
  materials: UsFact<string[]>;
  components: UsComponent[];
  electrical_supply_options: UsElectricalSupplyOption[];
  certification_ids: string[];
  warranty_ids: string[];
  source_ids: string[];
  publication_status: UsPublicationStatus;
}

export interface UsCertification {
  id: string;
  market: "US";
  configuration_id: string;
  label: string;
  standard?: string;
  listing_id?: string;
  scope: "complete-product" | "heater" | "control" | "component";
  source_ids: string[];
}

export interface UsWarranty {
  id: string;
  market: "US";
  configuration_id: string;
  provider: string;
  summary: string;
  source_ids: string[];
}

export interface UsMerchant {
  id: string;
  market: "US";
  name: string;
  kind: "manufacturer" | "retailer" | "marketplace";
  allowed_hosts: string[];
  status: "candidate" | "active" | "inactive" | "retired";
}

export interface UsAffiliateProgram {
  id: string;
  market: "US";
  merchant_id: string;
  network: "Awin" | "direct" | "other";
  advertiser_id?: string;
  relationship_status: "needs-account-check" | "pending" | "approved" | "declined" | "suspended";
  allowed_promotion_types: string[];
  tracking_hosts: string[];
  deeplink_capable: "yes" | "no" | "unknown";
  feed_capable: "yes" | "no" | "unknown";
  terms_checked_at?: string;
  source_ids: string[];
}

export interface UsMoney {
  amount_minor: number;
  currency: "USD";
}

export interface UsOffer {
  id: string;
  market: "US";
  market_product_id: string;
  configuration_id: string;
  merchant_id: string;
  program_id?: string;
  external_product_id?: string;
  destination_url: string;
  affiliate_url?: string;
  offer_type: "fixed-price" | "from-price" | "quote-only";
  price?: UsMoney;
  price_scope: "sauna-kit" | "configured-sauna-package" | "accessory-only";
  included_component_ids: string[];
  excluded_required_components: string[];
  completeness: "documented" | "incomplete" | "unknown";
  condition: "new" | "used" | "refurbished" | "unknown";
  availability: "in-stock" | "out-of-stock" | "preorder" | "made-to-order" | "discontinued" | "unknown";
  tax_treatment: "included" | "excluded" | "calculated-by-merchant" | "unknown";
  shipping_summary?: string;
  delivery_region_ids: string[];
  shipping_evidence_ids: string[];
  delivery_mode?: "parcel" | "curbside-freight" | "white-glove" | "unknown";
  last_successfully_checked_at: string;
  last_attempted_at?: string;
  verification_method: "manual" | "awin-feed" | "merchant-api";
  promotion_status: "inactive" | "eligible" | "blocked";
}

export interface UsOfferMapping {
  id: string;
  market: "US";
  merchant_id: string;
  external_product_id: string;
  configuration_id: string;
  matching_method: "exact-sku" | "exact-mpn" | "manual";
  reviewer_role: "research" | "technical-review";
  reviewed_at: string;
  status: "candidate" | "approved" | "rejected";
  note?: string;
}
