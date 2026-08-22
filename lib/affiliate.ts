import affiliateContent from "@/content/de/affiliate.json";
import merchantData from "@/data/merchants.json";
import { products, type Product } from "@/lib/products";

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
  cookie_days: number;
  direct_linking: boolean;
  advertiser_merchant_ids: string[];
  url: string;
  checked_at: string;
};

export const merchants = merchantData as Merchant[];
export const affiliatePrograms = affiliateContent.programs as AffiliateProgram[];

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
    affiliateOfferCount: offers.filter((offer) => offer.affiliate).length,
    merchantCount: merchants.length,
    candidateProgramCount: affiliatePrograms.filter((program) => program.status === "candidate").length,
  };
}

export function getOfferDisclosure(offer: Product["commercial"]["offers"][number]) {
  return offer.affiliate ? "Affiliate-Link" : "Kein Affiliate-Link";
}
