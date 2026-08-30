import { isLaunchReadyForIndexing } from "@/lib/launch";
import publication from "@/data/site-publication.json";

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const productionUrl = publication.production_url.replace(/\/$/, "");
const isMainCiBuild = process.env.GITHUB_REF_NAME === "main"
  || (process.env.WORKERS_CI === "1" && process.env.WORKERS_CI_BRANCH === "main");
if (isMainCiBuild && configuredUrl && configuredUrl !== productionUrl) {
  throw new Error(`Main builds must use ${productionUrl}; received ${configuredUrl}`);
}
const indexingOverride = process.env.SITE_INDEXABLE;
const indexingRequested = indexingOverride === undefined
  ? publication.indexing_enabled
  : indexingOverride === "true";
const isWorkersPreview = process.env.WORKERS_CI === "1"
  && process.env.WORKERS_CI_BRANCH !== "main";

export const siteUrl = isMainCiBuild ? productionUrl : (configuredUrl ?? productionUrl);
export const isIndexingEnabled = indexingRequested
  && !isWorkersPreview
  && isLaunchReadyForIndexing;
