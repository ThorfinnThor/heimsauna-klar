import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanningGuidePage } from "@/app/_components/PlanningGuidePage";
import { createPageMetadata } from "@/lib/metadata";
import { getPlanningGuide, planningGuides } from "@/lib/planning-guides";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return planningGuides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getPlanningGuide(slug);
  if (!guide) return {};
  return createPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/de/planung/${guide.slug}/`,
    type: "article",
  });
}

export default async function PlanningGuideRoute({ params }: Props) {
  const { slug } = await params;
  const guide = getPlanningGuide(slug);
  if (!guide) notFound();
  return <PlanningGuidePage guide={guide} />;
}
