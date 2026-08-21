import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
import { StructuredData } from "@/app/_components/StructuredData";
import { formatGermanDate } from "@/lib/products";
import { getLaunchStats, launchBlockers, launchReadiness } from "@/lib/launch";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/structured-data";

const description = "Öffentlicher Status der technischen, redaktionellen und rechtlichen Freigaben für Heimsauna Klar.";

const statusLabels = {
  ready: "Bereit",
  blocked: "Offen",
  planned: "Später",
} as const;

export const metadata: Metadata = {
  title: "Launch-Status und Indexierungsfreigabe",
  description,
  alternates: { canonical: "/de/transparenz/launch/" },
};

export default function LaunchStatusPage() {
  const stats = getLaunchStats();
  const path = "/de/transparenz/launch/";

  return (
    <main>
      <StructuredData data={collectionPageJsonLd({ title: launchReadiness.title, description, path })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: "Start", path: "/de/" },
        { name: "Transparenz", path: "/de/rechtliches/" },
        { name: "Launch-Status", path },
      ])} />
      <SiteHeader />
      <article>
        <header className="page-hero page-shell">
          <nav className="breadcrumbs" aria-label="Brotkrümelnavigation"><Link href="/de/">Start</Link><span>/</span><Link href="/de/rechtliches/">Transparenz</Link><span>/</span><span>Launch-Status</span></nav>
          <p className="eyebrow">{launchReadiness.market} · geprüft {formatGermanDate(launchReadiness.updated_at)}</p>
          <h1>{launchReadiness.title}<span>{launchReadiness.accent}</span></h1>
          <p>{launchReadiness.description}</p>
          <div className="catalog-metrics" aria-label="Aktueller Launch-Status">
            <span><strong>{stats.readyGateCount}/{stats.requiredGateCount}</strong> Pflicht-Gates bereit</span>
            <span><strong>{stats.blockerCount}</strong> offene Indexierungs-Gates</span>
            <span><strong>noindex</strong> aktueller Suchmaschinenstatus</span>
          </div>
        </header>

        <section className="planning-hub page-shell" aria-labelledby="launch-gates-title">
          <div className="collection-index-head"><div><p className="eyebrow">Maschinenlesbare Freigabe</p><h2 id="launch-gates-title">Jedes Gate hat einen eindeutigen Status.</h2></div><p>Nur Pflicht-Gates mit dem Status „Bereit“ erlauben später die Indexierung. Ein geplanter Affiliate-Start ist davon bewusst getrennt.</p></div>
          <div className="planning-hub-grid">
            {launchReadiness.gates.map((gate, index) => (
              <article className="affiliate-principle launch-gate-card" data-status={gate.status} key={gate.id}>
                <small>{String(index + 1).padStart(2, "0")} · {gate.required_for_indexing ? "Index-Pflicht" : "Optional"}</small>
                <p className="launch-status-badge">{statusLabels[gate.status]}</p>
                <h3>{gate.title}</h3>
                <span>{gate.detail}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="collection-method page-shell" aria-labelledby="launch-blockers-title">
          <div><p className="eyebrow">Aktuelle Sperre</p><h2 id="launch-blockers-title">Diese Angaben brauchen wir noch.</h2></div>
          <div>
            <ul>{launchBlockers.map((gate) => <li key={gate.id}><strong>{gate.title}</strong> · {gate.detail}</li>)}</ul>
            <p>Selbst wenn in Vercel versehentlich <code>SITE_INDEXABLE=true</code> gesetzt wird, bricht der Datencheck mit diesen offenen Gates ab.</p>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
