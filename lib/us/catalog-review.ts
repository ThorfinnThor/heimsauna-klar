type ReviewStatus = "candidate" | "draft" | "reviewed" | "published" | "retired";
type ReviewState =
  | "candidate-awaiting-review"
  | "scheduled"
  | "due"
  | "stale-source"
  | "source-missing"
  | "schedule-missing"
  | "schedule-invalid"
  | "retired";

export type CatalogReviewPolicy = {
  cycles: Array<{ id: string; cadence_days: number | null; trigger?: string; owner: string; verifier: string }>;
};

export type CatalogReviewReport = {
  asOf: string;
  summary: {
    products: number;
    candidatesAwaitingReview: number;
    sourceStale: number;
    sourceReferencesMissing: number;
    reviewsDue: number;
    reviewSchedulesMissing: number;
    reviewSchedulesInvalid: number;
    approvedPrograms: number;
    rightsReady: number;
    publicationProtected: boolean;
  };
  products: Array<{
    id: string;
    status: ReviewStatus;
    latestSourceDate: string | null;
    oldestSourceDate: string | null;
    oldestSourceAgeDays: number | null;
    staleSourceIds: string[];
    reviewState: ReviewState;
    issues: string[];
    blockingIssues: string[];
  }>;
  blockers: string[];
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) return null;
  return parsed;
}

function daysBetween(asOf: string, date: string) {
  const end = parseDate(asOf);
  const start = parseDate(date);
  if (!end || !start) return null;
  return Math.floor((end.valueOf() - start.valueOf()) / 86_400_000);
}

function latestDate(values: string[]) {
  return [...values].sort((left, right) => right.localeCompare(left))[0] ?? null;
}

function oldestDate(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right))[0] ?? null;
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
    const blockingIssues: string[] = [];
    const addIssue = (message: string, blocking = false) => {
      issues.push(message);
      if (blocking) blockingIssues.push(message);
    };
    const sourceChecks = product.source_ids.flatMap((sourceId) => {
      const source = sourceById.get(sourceId);
      if (!source) {
        addIssue(`missing source ${sourceId}`, true);
        return [];
      }
      const ageDays = daysBetween(asOf, source.checked_at);
      if (ageDays === null) {
        addIssue(`source ${sourceId} has an invalid checked_at date`, true);
        return [];
      }
      if (ageDays < 0) addIssue(`source ${sourceId} has a checked_at date in the future`, true);
      return [{ id: sourceId, date: source.checked_at, ageDays }];
    });
    if (product.source_ids.length === 0) addIssue("no product source is assigned", true);

    const sourceDates = sourceChecks.map((source) => source.date);
    const latestSourceDate = latestDate(sourceDates);
    const oldestSourceDate = oldestDate(sourceDates);
    const oldestSourceAgeDays = oldestSourceDate ? daysBetween(asOf, oldestSourceDate) : null;
    const staleSourceIds = sourceChecks
      .filter((source) => source.ageDays > technicalCadenceDays)
      .map((source) => source.id);
    if (staleSourceIds.length > 0) addIssue(`technical source review is stale for ${staleSourceIds.join(", ")}`, true);

    let reviewState: ReviewState;
    if (product.publication_status === "retired") {
      reviewState = "retired";
    } else if (product.source_ids.length === 0 || sourceChecks.length !== product.source_ids.length) {
      reviewState = "source-missing";
    } else if (staleSourceIds.length > 0) {
      reviewState = "stale-source";
    } else if (product.publication_status === "candidate" || product.publication_status === "draft") {
      reviewState = "candidate-awaiting-review";
      addIssue("candidate or draft is not a public release");
    } else if (!product.spec_checked_at || !product.next_review_at) {
      reviewState = "schedule-missing";
      if (!product.spec_checked_at) addIssue("spec_checked_at is required after technical review", true);
      if (!product.next_review_at) addIssue("next_review_at is required after technical review", true);
    } else {
      const reviewAgeDays = daysBetween(asOf, product.spec_checked_at);
      const scheduledIntervalDays = daysBetween(product.next_review_at, product.spec_checked_at);
      if (reviewAgeDays === null || scheduledIntervalDays === null) {
        reviewState = "schedule-invalid";
        addIssue("technical review schedule contains an invalid date", true);
      } else if (reviewAgeDays < 0) {
        reviewState = "schedule-invalid";
        addIssue("spec_checked_at cannot be in the future", true);
      } else if (scheduledIntervalDays <= 0 || scheduledIntervalDays > technicalCadenceDays) {
        reviewState = "schedule-invalid";
        addIssue(`next_review_at must be within ${technicalCadenceDays} days after spec_checked_at`, true);
      } else if (product.next_review_at <= asOf || reviewAgeDays > technicalCadenceDays) {
        reviewState = "due";
        addIssue("scheduled review is due", true);
      } else {
        reviewState = "scheduled";
      }
    }

    return {
      id: product.id,
      status: product.publication_status,
      latestSourceDate,
      oldestSourceDate,
      oldestSourceAgeDays,
      staleSourceIds,
      reviewState,
      issues,
      blockingIssues,
    };
  });

  const approvedPrograms = programs.filter((program) => program.relationship_status === "approved").length;
  const rightsReady = rights.filter((asset) => asset.rights_status === "approved").length;
  const publicationProtected = !publication.routes_enabled || !publication.indexing_enabled || !publication.affiliate_links_enabled || !publication.feed_sync_enabled;
  const candidatesAwaitingReview = productReports.filter((product) => product.reviewState === "candidate-awaiting-review").length;
  const blockers = productReports.flatMap((product) => product.blockingIssues
    .map((issue) => `${product.id}: ${issue}`));
  if (candidatesAwaitingReview > 0) blockers.push(`${candidatesAwaitingReview} candidate or draft products still require their first technical review.`);
  if (approvedPrograms === 0) blockers.push("US affiliate output is blocked because no program has documented publisher approval.");
  if (rightsReady === 0) blockers.push("US product-image and feed-asset use is blocked because no rights record is approved.");
  if (publicationProtected) blockers.push("US publication switches remain protected.");

  return {
    asOf,
    summary: {
      products: products.length,
      candidatesAwaitingReview,
      sourceStale: productReports.filter((product) => product.staleSourceIds.length > 0).length,
      sourceReferencesMissing: productReports.filter((product) => product.reviewState === "source-missing").length,
      reviewsDue: productReports.filter((product) => product.reviewState === "due").length,
      reviewSchedulesMissing: productReports.filter((product) => product.reviewState === "schedule-missing").length,
      reviewSchedulesInvalid: productReports.filter((product) => product.reviewState === "schedule-invalid").length,
      approvedPrograms,
      rightsReady,
      publicationProtected,
    },
    products: productReports,
    blockers,
  };
}
