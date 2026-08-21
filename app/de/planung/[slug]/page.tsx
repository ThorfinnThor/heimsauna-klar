import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanningGuidePage } from "@/app/_components/PlanningGuidePage";
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
  return { title: guide.title, description: guide.description, alternates: { canonical: `/de/planung/${guide.slug}/` } };
}

export default async function PlanningGuideRoute({ params }: Props) {
  const { slug } = await params;
  const guide = getPlanningGuide(slug);
  if (!guide) notFound();
  return <PlanningGuidePage guide={guide} />;
}
