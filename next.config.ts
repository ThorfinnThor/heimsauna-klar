import type { NextConfig } from "next";

const offerPolicyAsOf = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_OFFER_POLICY_AS_OF: offerPolicyAsOf,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
