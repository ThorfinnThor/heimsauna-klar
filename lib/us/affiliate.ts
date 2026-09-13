import affiliateContentDocument from "../../content/us/affiliate.json" with { type: "json" };
import configurationsDocument from "../../data/us/configurations.json" with { type: "json" };
import merchantsDocument from "../../data/us/merchants.json" with { type: "json" };
import offersDocument from "../../data/us/offers.json" with { type: "json" };
import productsDocument from "../../data/us/products.json" with { type: "json" };
import programsDocument from "../../data/us/programs.json" with { type: "json" };
import publicationDocument from "../../data/us/publication.json" with { type: "json" };

import type {
  UsAffiliateProgram,
  UsMarketProduct,
  UsMerchant,
  UsOffer,
  UsProductConfiguration,
} from "./types.ts";

export type UsAffiliatePlacement = "product-detail" | "catalog" | "finder" | "comparison";

export type UsAffiliateBlockReason =
  | "publication-disabled"
  | "emergency-disabled"
  | "disclosure-not-approved"
  | "product-not-published"
  | "configuration-not-published"
  | "offer-not-eligible"
  | "merchant-not-active"
  | "program-not-approved"
  | "program-merchant-mismatch"
  | "promotion-not-allowed"
  | "destination-not-allowed"
  | "affiliate-url-missing"
  | "tracking-host-not-allowed"
  | "awin-tracking-invalid";

export type UsAffiliateLinkResolution =
  | {
      eligible: true;
      href: string;
      rel: "sponsored nofollow noopener noreferrer";
      target: "_blank";
      prefetch: false;
    }
  | {
      eligible: false;
      href: null;
      reason: UsAffiliateBlockReason;
    };

type ResolveUsAffiliateLinkInput = {
  offer: UsOffer;
  merchant?: UsMerchant;
  program?: UsAffiliateProgram;
  placement: UsAffiliatePlacement;
  publicationEnabled: boolean;
  emergencyDisabled: boolean;
  disclosureApproved: boolean;
  productPublished: boolean;
  configurationPublished: boolean;
};

export type UsAffiliateOffer = {
  offer: UsOffer;
  merchant: UsMerchant;
  link: Extract<UsAffiliateLinkResolution, { eligible: true }>;
};

const products = productsDocument.products as UsMarketProduct[];
const configurations = configurationsDocument.configurations as UsProductConfiguration[];
const merchants = merchantsDocument.merchants as UsMerchant[];
const programs = programsDocument.programs as UsAffiliateProgram[];
const offers = offersDocument.offers as UsOffer[];

const placementPermissions: Record<UsAffiliatePlacement, string[]> = {
  "product-detail": ["content", "content-site", "product-detail", "product-comparison", "seo"],
  catalog: ["content", "content-site", "catalog", "product-comparison", "seo"],
  finder: ["content", "content-site", "finder", "product-comparison", "seo"],
  comparison: ["content", "content-site", "comparison", "product-comparison", "seo"],
};

function normalizedHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function hostAllowed(hostname: string, allowedHosts: string[]) {
  const candidate = normalizedHost(hostname);
  return allowedHosts.some((entry) => {
    const allowed = normalizedHost(entry);
    return candidate === allowed || candidate.endsWith(`.${allowed}`);
  });
}

function parseHttpsUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function promotionAllowed(program: UsAffiliateProgram, placement: UsAffiliatePlacement) {
  const permissions = new Set(program.allowed_promotion_types.map((value) => value.trim().toLowerCase()));
  return placementPermissions[placement].some((permission) => permissions.has(permission));
}

function awinTrackingMatches(url: URL, program: UsAffiliateProgram) {
  if (program.network !== "Awin") return true;
  const advertiserId = url.searchParams.get("awinmid") ?? url.searchParams.get("m");
  const publisherId = url.searchParams.get("awinaffid") ?? url.searchParams.get("a");
  return Boolean(program.advertiser_id && advertiserId === program.advertiser_id && publisherId);
}

export function resolveUsAffiliateLink(input: ResolveUsAffiliateLinkInput): UsAffiliateLinkResolution {
  const { offer, merchant, program } = input;
  if (!input.publicationEnabled) return { eligible: false, href: null, reason: "publication-disabled" };
  if (input.emergencyDisabled) return { eligible: false, href: null, reason: "emergency-disabled" };
  if (!input.disclosureApproved) return { eligible: false, href: null, reason: "disclosure-not-approved" };
  if (!input.productPublished) return { eligible: false, href: null, reason: "product-not-published" };
  if (!input.configurationPublished) return { eligible: false, href: null, reason: "configuration-not-published" };
  if (offer.promotion_status !== "eligible") return { eligible: false, href: null, reason: "offer-not-eligible" };
  if (!merchant || merchant.status !== "active") return { eligible: false, href: null, reason: "merchant-not-active" };
  if (!program || program.relationship_status !== "approved") return { eligible: false, href: null, reason: "program-not-approved" };
  if (program.merchant_id !== merchant.id || offer.merchant_id !== merchant.id || offer.program_id !== program.id) {
    return { eligible: false, href: null, reason: "program-merchant-mismatch" };
  }
  if (!promotionAllowed(program, input.placement)) return { eligible: false, href: null, reason: "promotion-not-allowed" };

  const destinationUrl = parseHttpsUrl(offer.destination_url);
  if (!destinationUrl || !hostAllowed(destinationUrl.hostname, merchant.allowed_hosts)) {
    return { eligible: false, href: null, reason: "destination-not-allowed" };
  }

  const affiliateUrl = parseHttpsUrl(offer.affiliate_url);
  if (!affiliateUrl) return { eligible: false, href: null, reason: "affiliate-url-missing" };
  if (!hostAllowed(affiliateUrl.hostname, program.tracking_hosts)) {
    return { eligible: false, href: null, reason: "tracking-host-not-allowed" };
  }
  if (!awinTrackingMatches(affiliateUrl, program)) {
    return { eligible: false, href: null, reason: "awin-tracking-invalid" };
  }

  return {
    eligible: true,
    href: affiliateUrl.toString(),
    rel: "sponsored nofollow noopener noreferrer",
    target: "_blank",
    prefetch: false,
  };
}

export function getUsAffiliateOffersForConfiguration(
  configurationId: string,
  placement: UsAffiliatePlacement = "product-detail",
): UsAffiliateOffer[] {
  const configuration = configurations.find((entry) => entry.id === configurationId);
  const product = configuration ? products.find((entry) => entry.id === configuration.product_id) : undefined;
  const publicationEnabled = publicationDocument.routes_enabled && publicationDocument.affiliate_links_enabled;
  const emergencyDisabled = ["1", "true"].includes((process.env.US_AFFILIATE_LINKS_DISABLED ?? "").toLowerCase());
  const disclosureApproved = affiliateContentDocument.status === "published"
    && affiliateContentDocument.disclosure.trim().length > 0;

  return offers.flatMap((offer) => {
    if (offer.configuration_id !== configurationId) return [];
    const merchant = merchants.find((entry) => entry.id === offer.merchant_id);
    const program = programs.find((entry) => entry.id === offer.program_id);
    const link = resolveUsAffiliateLink({
      offer,
      merchant,
      program,
      placement,
      publicationEnabled,
      emergencyDisabled,
      disclosureApproved,
      productPublished: product?.publication_status === "published",
      configurationPublished: configuration?.publication_status === "published",
    });
    return link.eligible && merchant ? [{ offer, merchant, link }] : [];
  });
}

