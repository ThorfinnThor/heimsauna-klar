import Link from "next/link";
import type { ContentLink } from "@/lib/planning-guides";

// Renders editorial cross-links from the content JSON as a readable sentence:
// "<lead> A, B und C."
export function InlineLinkList({ lead, links, className }: { lead?: string; links?: ContentLink[]; className?: string }) {
  if (!links || links.length === 0) return null;
  return (
    <p className={className ?? "inline-link-list"}>
      {lead ? `${lead} ` : null}
      {links.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? (index === links.length - 1 ? " und " : ", ") : null}
          <Link href={link.href}>{link.label}</Link>
        </span>
      ))}
      .
    </p>
  );
}

export function LinkChips({ links, label, ariaLabel }: { links?: ContentLink[]; label: string; ariaLabel?: string }) {
  if (!links || links.length === 0) return null;
  return (
    <nav className="link-chips" aria-label={ariaLabel ?? label}>
      <p className="eyebrow">{label}</p>
      <ul>{links.map((link) => <li key={link.href}><Link href={link.href}>{link.label} <span aria-hidden="true">↗</span></Link></li>)}</ul>
    </nav>
  );
}
