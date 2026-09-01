import affiliateContent from "@/content/de/affiliate.json";
import merchantData from "@/data/merchants.json";
import { getProductOfferUrl, products, type Product } from "@/lib/products";

export type Merchant = {
  id: string;
  name: string;
  kind: "manufacturer" | "retailer";
  allowed_hosts: string[];
  affiliate: { status: "inactive" | "active"; program_id: string | null };
  candidate_program_ids: string[];
};

export type AffiliateProgram = {
  id: string;
  name: string;
  network: string;
  program_id: string;
  status: "candidate" | "applied" | "approved" | "rejected";
  focus: string;
  commission_snapshot: string;
  cookie_days: number | null;
  direct_linking: boolean;
  tracking_hosts: string[];
  advertiser_merchant_ids: string[];
  url: string;
  checked_at: string;
};

export const merchants = merchantData as Merchant[];
export const affiliatePrograms = affiliateContent.programs as AffiliateProgram[];

export type AffiliatePlacement = "product-detail" | "catalog" | "finder" | "comparison";

const SAFE_TRACKING_REF = /^[a-z0-9][a-z0-9_-]{0,49}$/i;

export function getMerchant(name: string) {
  return merchants.find((merchant) => merchant.name === name);
}

export function getMerchantOfferCounts() {
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const offer of product.commercial.offers) {
      counts.set(offer.merchant, (counts.get(offer.merchant) ?? 0) + 1);
    }
  }
  return merchants.map((merchant) => ({ merchant, count: counts.get(merchant.name) ?? 0 }));
}

export function getAffiliateStats() {
  const offers = products.flatMap((product) => product.commercial.offers);
  return {
    offerCount: offers.length,
    affiliateOfferCount: offers.filter((offer) => getActiveAffiliateProgram(offer) !== null).length,
    merchantCount: merchants.length,
    candidateProgramCount: affiliatePrograms.filter((program) => program.status === "candidate").length,
    approvedProgramCount: affiliatePrograms.filter((program) => program.status === "approved").length,
  };
}

export function getOfferDisclosure(offer: Product["commercial"]["offers"][number]) {
  return getActiveAffiliateProgram(offer) ? "Affiliate-Link" : null;
}

export function getOfferLink(
  productId: string,
  offer: Product["commercial"]["offers"][number],
  placement: AffiliatePlacement = "product-detail",
) {
  const program = getActiveAffiliateProgram(offer);
  if (!program || !offer.affiliate_url) {
    const product = products.find((candidate) => candidate.product_id === productId);
    return {
      href: product ? getProductOfferUrl(product, offer.url) : offer.url,
      affiliate: false,
    } as const;
  }

  return {
    href: addNetworkTrackingRefs(offer.affiliate_url, program.network, productId, placement),
    affiliate: true,
  } as const;
}

function getActiveAffiliateProgram(offer: Product["commercial"]["offers"][number]) {
  if (!offer.affiliate || !offer.affiliate_url || !offer.affiliate_program_id) return null;
  const merchant = getMerchant(offer.merchant);
  if (merchant?.affiliate.status !== "active" || merchant.affiliate.program_id !== offer.affiliate_program_id) return null;
  const program = affiliatePrograms.find((candidate) => candidate.id === offer.affiliate_program_id);
  return program?.status === "approved" ? program : null;
}

function addNetworkTrackingRefs(
  href: string,
  network: string,
  productId: string,
  placement: AffiliatePlacement,
) {
  try {
    const url = new URL(href);
    if (url.protocol !== "https:") return href;
    const productRef = shortProductRef(productId);
    const placementRef = safeTrackingRef(placement);
    const normalizedNetwork = network.toLowerCase();

    if (normalizedNetwork === "awin") {
      url.searchParams.set("clickref", "sauna");
      url.searchParams.set("clickref2", placementRef);
      url.searchParams.set("clickref3", productRef);
    } else if (normalizedNetwork === "adcell") {
      url.searchParams.set("subId", `${placementRef}|${productRef}`);
    }

    return url.toString();
  } catch {
    return href;
  }
}

function safeTrackingRef(value: string) {
  return SAFE_TRACKING_REF.test(value) ? value : "product-detail";
}

function shortProductRef(productId: string) {
  return productId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(-24) || "product";
}
