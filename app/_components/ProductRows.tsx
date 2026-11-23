import Link from "next/link";
import { dimensions, factLine, listPrice } from "@/lib/product-facts";
import { getLowestOffer, type Product } from "@/lib/products";
import { OfferLink } from "./OfferLink";

// Footprint to scale. The outer square is 3 × 3 m, larger models get a 6 × 6 m square.
export function FootprintIcon({ product }: { product: Product }) {
  const { width, depth } = product.dimensions_cm;
  const side = Math.max(width, depth) > 300 ? 600 : 300;
  const w = (Math.min(width, side) / side) * 54;
  const d = (Math.min(depth, side) / side) * 54;
  return (
    <svg className="plan" viewBox="0 0 56 56" aria-hidden="true">
      <rect className="room" x="1" y="1" width="54" height="54" />
      <rect className="cabin" x={1} y={55 - d} width={w} height={d} />
    </svg>
  );
}

export function ProductRow({ product, note }: { product: Product; note?: string }) {
  const offer = getLowestOffer(product);
  return (
    <li>
      <FootprintIcon product={product} />
      <div>
        <h3><Link href={`/de/produkte/${product.product_id}/`}>{product.brand} {product.model}</Link></h3>
        <p>{product.sauna.type}, {factLine(product)}</p>
        {note ? <p className="note">{note}</p> : null}
      </div>
      <div className="buy">
        {offer ? (
          <>
            <strong>{listPrice(product)}</strong>
            <OfferLink product={product} offer={offer} placement="catalog">Zu {offer.merchant}</OfferLink>
          </>
        ) : <small>kein aktueller Preis</small>}
      </div>
    </li>
  );
}

const firstRows = 25;

export function ProductRows({ products }: { products: Product[] }) {
  const head = products.length > firstRows + 5 ? products.slice(0, firstRows) : products;
  const rest = products.slice(head.length);
  return (
    <>
      <ul className="plist">{head.map((product) => <ProductRow product={product} key={product.product_id} />)}</ul>
      {rest.length > 0 ? (
        <details className="more">
          <summary>Weitere {rest.length} Modelle anzeigen</summary>
          <ul className="plist">{rest.map((product) => <ProductRow product={product} key={product.product_id} />)}</ul>
        </details>
      ) : null}
    </>
  );
}

export function ProductPicks({ picks }: { picks: Array<{ label: string; product: Product }> }) {
  return (
    <ul className="picks">
      {picks.map(({ label, product }) => {
        const offer = getLowestOffer(product);
        return (
          <li key={product.product_id}>
            <p className="label">{label}</p>
            <h3><Link href={`/de/produkte/${product.product_id}/`}>{product.brand} {product.model}</Link></h3>
            <p>{dimensions(product)}</p>
            <p className="price">{listPrice(product) ?? "kein aktueller Preis"}</p>
            {offer ? <OfferLink product={product} offer={offer} placement="comparison">Preis bei {offer.merchant}</OfferLink> : null}
          </li>
        );
      })}
    </ul>
  );
}
