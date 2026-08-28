import type { MetadataRoute } from "next";
import { isIndexingEnabled, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isIndexingEnabled
      ? [
          { userAgent: "*", allow: "/" },
          { userAgent: "OAI-SearchBot", allow: "/" },
        ]
      : { userAgent: "*", disallow: "/" },
    sitemap: isIndexingEnabled ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
