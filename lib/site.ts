import { isLaunchReadyForIndexing } from "@/lib/launch";
import publication from "@/data/site-publication.json";

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const indexingOverride = process.env.SITE_INDEXABLE;
const indexingRequested = indexingOverride === undefined
  ? publication.indexing_enabled
  : indexingOverride === "true";
const isWorkersPreview = process.env.WORKERS_CI === "1"
  && process.env.WORKERS_CI_BRANCH !== "main";

export const siteUrl = configuredUrl ?? publication.production_url.replace(/\/$/, "");
export const isIndexingEnabled = indexingRequested
  && !isWorkersPreview
  && isLaunchReadyForIndexing;
