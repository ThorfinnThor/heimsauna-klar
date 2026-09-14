type ReviewStatus = "candidate" | "draft" | "reviewed" | "published" | "retired";

export type CatalogReviewPolicy = {
  cycles: Array<{ id: string; cadence_days: number | null; trigger?: string; owner: string; verifier: string }>;
};

export type CatalogReviewReport = {
  asOf: string;
  summary: {
    products: number;
    candidatesAwaitingReview: number;
    sourceStale: number;
    reviewsDue: number;
    reviewSchedulesMissing: number;
    approvedPrograms: number;
    rightsReady: number;
    publicationProtected: boolean;
  };
  products: Array<{
    id: string;
    status: ReviewStatus;
    latestSourceDate: string | null;
    sourceAgeDays: number | null;
    reviewState: "candidate-awaiting-review" | "scheduled" | "due" | "stale-source" | "schedule-missing" | "retired";
    issues: string[];
  }>;
  blockers: string[];
};

function parseDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function daysBetween(asOf: string, date: string) {
  const end = parseDate(asOf);
  const start = parseDate(date);
  if (!end || !start) return null;
  return Math.floor((end.valueOf() - start.valueOf()) / 86_400_000);
}

function latestDate(values: string[]) {
  return values.sort((left, right) => right.localeCompare(left))[0] ?? null;
}

export function reviewUsCatalog({
  asOf,
  products,
  sources,
  programs,
  rights,
  publication,
  policy,
}: {
  asOf: string;
  products: Array<{ id: string; publication_status: ReviewStatus; source_ids: string[]; spec_checked_at?: string; next_review_at?: string }>;
  sources: Array<{ id: string; checked_at: string }>;
  programs: Array<{ relationship_status: string }>;
  rights: Array<{ rights_status: string }>;
  publication: { routes_enabled: boolean; indexing_enabled: boolean; affiliate_links_enabled: boolean; feed_sync_enabled: boolean };
  policy: CatalogReviewPolicy;
}): CatalogReviewReport {
  if (!parseDate(asOf)) throw new Error(`Invalid review date: ${asOf}`);
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const technicalCycle = policy.cycles.find((cycle) => cycle.id === "technical-source-facts");
  if (!technicalCycle || technicalCycle.cadence_days === null) throw new Error("Technical source review cadence is missing");
  const technicalCadenceDays = technicalCycle.cadence_days;

  const productReports = products.map((product) => {
    const issues: string[] = [];
    const sourceDates = product.source_ids.flatMap((sourceId) => {
      const source = sourceById.get(sourceId);
      if (!source) {
        issues.push(`missing source ${sourceId}`);
        return [];
      }
      return [source.checked_at];
    });
    const latestSourceDate = latestDate(sourceDates);
    const sourceAgeDays = latestSourceDate ? daysBetween(asOf, latestSourceDate) : null;
    if (sourceAgeDays !== null && sourceAgeDays > technicalCadenceDays) issues.push("technical source review is stale");

    let reviewState: CatalogReviewReport["products"][number]["reviewState"];
    if (product.publication_status === "retired") {
      reviewState = "retired";
    } else if (product.publication_status === "candidate" || product.publication_status === "draft") {
      reviewState = "candidate-awaiting-review";
      issues.push("candidate or draft is not a public release");
    } else if (!product.next_review_at) {
      reviewState = "schedule-missing";
      issues.push("next_review_at is required after technical review");
    } else if (product.next_review_at <= asOf) {
      reviewState = "due";
      issues.push("scheduled review is due");
    } else {
      reviewState = "scheduled";
    }
    if (sourceAgeDays !== null && sourceAgeDays > technicalCadenceDays && reviewState !== "retired") reviewState = "stale-source";

    return { id: product.id, status: product.publication_status, latestSourceDate, sourceAgeDays, reviewState, issues };
  });

  const approvedPrograms = programs.filter((program) => program.relationship_status === "approved").length;
  const rightsReady = rights.filter((asset) => asset.rights_status === "approved").length;
  const publicationProtected = !publication.routes_enabled || !publication.indexing_enabled || !publication.affiliate_links_enabled || !publication.feed_sync_enabled;
  const blockers = productReports.flatMap((product) => product.issues
    .filter((issue) => issue.includes("missing source") || issue.includes("stale") || issue.includes("due") || issue.includes("schedule") || issue.includes("next_review_at"))
    .map((issue) => `${product.id}: ${issue}`));
  if (approvedPrograms === 0) blockers.push("No US affiliate program has documented publisher approval.");
  if (rightsReady === 0) blockers.push("No US product image or feed-rights asset is approved.");
  if (publicationProtected) blockers.push("US publication switches remain protected.");

  return {
    asOf,
    summary: {
      products: products.length,
      candidatesAwaitingReview: productReports.filter((product) => product.reviewState === "candidate-awaiting-review").length,
      sourceStale: productReports.filter((product) => product.reviewState === "stale-source").length,
      reviewsDue: productReports.filter((product) => product.reviewState === "due").length,
      reviewSchedulesMissing: productReports.filter((product) => product.reviewState === "schedule-missing").length,
      approvedPrograms,
      rightsReady,
      publicationProtected,
    },
    products: productReports,
    blockers,
  };
}
