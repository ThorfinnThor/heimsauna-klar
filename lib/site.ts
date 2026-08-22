import { isLaunchReadyForIndexing } from "@/lib/launch";

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const productionFallbackUrl = "https://heimsauna-klar.shuu9599.workers.dev";

export const siteUrl = configuredUrl ?? productionFallbackUrl;
export const isIndexingEnabled = Boolean(configuredUrl)
  && process.env.SITE_INDEXABLE === "true"
  && isLaunchReadyForIndexing;
