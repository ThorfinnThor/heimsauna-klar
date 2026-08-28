import { collections } from "@/lib/collections";
import { planningGuides } from "@/lib/planning-guides";
import { getCatalogStats, products } from "@/lib/products";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

function pageUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function GET() {
  const stats = getCatalogStats(products);
  const planningLinks = planningGuides
    .map((guide) => `- [${guide.title}](${pageUrl(`/de/planung/${guide.slug}/`)}): ${guide.summary}`)
    .join("\n");
  const collectionLinks = collections
    .map((collection) => `- [${collection.title}](${pageUrl(`/de/${collection.section}/${collection.slug}/`)}): ${collection.description}`)
    .join("\n");

  const content = `# Select Your Sauna

> Deutschsprachige Planungs- und Vergleichsplattform für private Saunen im deutschen Markt.

- Kanonische Website: ${siteUrl}/
- Sprache: Deutsch (de-DE)
- Markt: Deutschland
- Betreiber: SeitenHafen361, Inhaber Schayan Yousefian
- Kontakt: info@selectyoursauna.com
- Datenstand des Produktkatalogs: ${stats.latestUpdate ?? "nicht verfügbar"}

## Inhalt und Datenumfang

Der Katalog enthält ${stats.total} verifizierte Produktdatensätze: ${stats.categoryCounts.indoor} Indoor-Saunen, ${stats.categoryCounts.outdoor} Outdoor-Saunen, ${stats.categoryCounts.infrared} Infrarotkabinen und ${stats.categoryCounts.mobile} mobile Saunen. Die Datensätze enthalten insgesamt ${stats.sourceCount} dokumentierte Quellenverweise.

Technische Angaben, redaktionelle Einordnung und Händlerangebote werden getrennt geführt. Eigene Produktnutzung, Montage oder Labortests werden nur genannt, wenn sie tatsächlich dokumentiert sind. Affiliate-Links sind am Link gekennzeichnet und beeinflussen weder Aufnahme noch Sortierung.

## Zentrale Seiten

- [Startseite und Sauna-Finder](${pageUrl("/de/")})
- [Vollständiger Produktkatalog](${pageUrl("/de/produkte/")})
- [Planungsratgeber](${pageUrl("/de/planung/")})
- [230-V-Sauna technisch einordnen](${pageUrl("/de/saunatechnik/230-v-sauna/")})
- [230-V-Produkte vergleichen](${pageUrl("/de/vergleiche/230-v-sauna/")})
- [Redaktion und Methodik](${pageUrl("/de/ueber-uns/")})
- [Affiliate-Transparenz](${pageUrl("/de/transparenz/affiliate/")})
- [Impressum und Datenschutz](${pageUrl("/de/rechtliches/")})
- [XML-Sitemap](${pageUrl("/sitemap.xml")})

## Planungsratgeber

${planningLinks}

## Gefilterte Produktvergleiche

${collectionLinks}

## Quellenhinweis

Die maßgeblichen Belege stehen auf den jeweiligen Ratgeber- und Produktseiten mit URL und Prüfdatum. Bei Elektroinstallation, Fundament, Statik, Brandschutz und örtlichen Bauvorgaben haben Herstellerunterlagen und die Prüfung durch zuständige Fachleute Vorrang.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
