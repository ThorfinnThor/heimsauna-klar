import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCollectionPage } from "@/app/_components/ProductCollectionPage";
import { collections, getCollection } from "@/lib/collections";
import { createPageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ section: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map(({ section, slug }) => ({ section, slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, slug } = await params;
  const collection = getCollection(section, slug);
  if (!collection) return {};
  return createPageMetadata({
    title: collection.title,
    description: collection.description,
    path: `/de/${collection.section}/${collection.slug}/`,
  });
}

export default async function CollectionRoute({ params }: Props) {
  const { section, slug } = await params;
  const collection = getCollection(section, slug);
  if (!collection) notFound();
  return <ProductCollectionPage collection={collection} />;
}
