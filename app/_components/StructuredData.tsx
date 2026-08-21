import type { JsonLd } from "@/lib/structured-data";

export function StructuredData({ data }: { data: JsonLd }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
