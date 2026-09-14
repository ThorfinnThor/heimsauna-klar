import type { UsHeatType, UsPlacement, UsProductType, UsPublicationStatus } from "./types.ts";

export type UsEditorialPageType = "comparison" | "brand" | "guide";
export type UsEditorialModule = "selection" | "catalog" | "sections" | "sources" | "related";
export type UsEditorialLayout = "matrix" | "profile" | "briefing";

export interface UsEditorialSection {
  id: string;
  heading: string;
  paragraphs: string[];
  points?: string[];
}

export interface UsComparisonSelection {
  product_ids?: string[];
  product_types?: UsProductType[];
  heat_types?: UsHeatType[];
  placements?: UsPlacement[];
  brands?: string[];
  minimum_seated_capacity?: number;
  voltages_v?: number[];
}

interface UsEditorialPageBase {
  id: string;
  page_type: UsEditorialPageType;
  slug: string;
  publication_status: UsPublicationStatus;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  introduction: string[];
  sections: UsEditorialSection[];
  source_ids: string[];
  related_paths: string[];
  presentation_id: string;
}

export interface UsComparisonPage extends UsEditorialPageBase {
  page_type: "comparison";
  selection: UsComparisonSelection;
}

export interface UsBrandPage extends UsEditorialPageBase {
  page_type: "brand";
  brand_name: string;
}

export interface UsGuidePage extends UsEditorialPageBase {
  page_type: "guide";
  linked_product_ids?: string[];
}

export type UsEditorialPage = UsComparisonPage | UsBrandPage | UsGuidePage;

export interface UsHomePage {
  eyebrow: string;
  title: string;
  description: string;
  heading: string;
  introduction: string[];
  sections: UsEditorialSection[];
  source_ids: string[];
  related_paths: string[];
}

export interface UsPagePresentation {
  id: string;
  page_type: UsEditorialPageType;
  layout: UsEditorialLayout;
  module_order: UsEditorialModule[];
}

export interface UsTrustPage {
  id: string;
  slug: "contact" | "about" | "methodology" | "affiliate-disclosure" | "privacy";
  publication_status: UsPublicationStatus;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  introduction: string[];
  sections: UsEditorialSection[];
  contact_email?: string;
}
