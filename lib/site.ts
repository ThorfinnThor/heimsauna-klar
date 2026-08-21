const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const siteUrl = configuredUrl ?? "http://localhost:3000";
export const isIndexingEnabled = Boolean(configuredUrl) && process.env.SITE_INDEXABLE === "true";
