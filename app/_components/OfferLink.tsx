import { getOfferDisclosure, getOfferLink, type AffiliatePlacement } from "@/lib/affiliate";
import type { Product } from "@/lib/products";

type Offer = Product["commercial"]["offers"][number];

// Affiliate and other shop links look the same; only affiliate links carry the label.
export function OfferLink({ product, offer, placement, children }: {
  product: Product;
  offer: Offer;
  placement: AffiliatePlacement;
  children: React.ReactNode;
}) {
  const link = getOfferLink(product.product_id, offer, placement);
  const disclosure = getOfferDisclosure(offer);
  return (
    <>
      <a
        className="btn"
        href={link.href}
        rel={link.affiliate ? "sponsored nofollow noreferrer" : "nofollow noreferrer"}
        target="_blank"
        data-offer-merchant={offer.merchant}
        data-offer-product={product.product_id}
        data-offer-affiliate={link.affiliate ? "true" : "false"}
        data-offer-placement={placement}
      >
        {children}
      </a>
      {disclosure ? <small>{disclosure}</small> : null}
    </>
  );
}
