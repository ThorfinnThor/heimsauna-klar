import presentationData from "@/content/de/page-presentations.json";

export type EditorialInsight = {
  kicker: string;
  title: string;
  copy: string[];
  points: string[];
};

export type CollectionModule = "insight" | "editorial" | "method" | "results" | "checks";
export type CollectionPresentation = {
  hero: "editorial" | "compact" | "index" | "split";
  results: "table" | "cards" | "ledger";
  method: "split" | "panel" | "steps";
  flow: CollectionModule[];
  insight: EditorialInsight;
};

export type PlanningModule = "insight" | "sections" | "snapshot" | "checks" | "sources";
export type PlanningPresentation = {
  hero: "summary" | "split" | "briefing" | "question" | "compact";
  sections: "staggered" | "technical" | "timeline" | "cards" | "ledger" | "alternating";
  insight_style: "callout" | "matrix" | "brief";
  flow: PlanningModule[];
  insight: EditorialInsight;
};

type PagePresentations = {
  schema_version: number;
  updated_at: string;
  collections: Record<string, CollectionPresentation>;
  planning_guides: Record<string, PlanningPresentation>;
};

const presentations = presentationData as PagePresentations;

export function getCollectionPresentation(id: string) {
  const presentation = presentations.collections[id];
  if (!presentation) throw new Error(`Missing collection presentation: ${id}`);
  return presentation;
}

export function getPlanningPresentation(slug: string) {
  const presentation = presentations.planning_guides[slug];
  if (!presentation) throw new Error(`Missing planning presentation: ${slug}`);
  return presentation;
}

export function getCollectionProfile(presentation: CollectionPresentation) {
  return [presentation.hero, presentation.results, presentation.method, presentation.flow.join("-")].join("|");
}

export function getPlanningProfile(presentation: PlanningPresentation) {
  return [presentation.hero, presentation.sections, presentation.insight_style, presentation.flow.join("-")].join("|");
}
