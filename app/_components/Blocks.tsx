import Link from "next/link";
import type { ChecklistBlock, ContentLink, TextBlock } from "@/lib/content-blocks";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="breadcrumbs" aria-label="Brotkrümelnavigation">
      {items.map((item, index) => (
        <span key={item.label}>{index > 0 ? "› " : ""}{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>
      ))}
    </nav>
  );
}

export function InlineLinks({ lead, links }: { lead?: string; links?: ContentLink[] }) {
  if (!links || links.length === 0) return null;
  return (
    <p>
      {lead ? `${lead} ` : ""}
      {links.map((link, index) => (
        <span key={link.href}>{index > 0 ? ", " : ""}<Link href={link.href}>{link.label}</Link></span>
      ))}
    </p>
  );
}

export function LinkList({ links }: { links: ContentLink[] }) {
  return <ul className="linklist">{links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>;
}

export function TextSection({ block, fill = (text) => text }: { block: TextBlock; fill?: (text: string) => string }) {
  return (
    <section className="text" data-page-module="text">
      <h2>{block.heading}</h2>
      {block.paragraphs.map((paragraph) => <p data-editorial-copy="true" key={paragraph}>{fill(paragraph)}</p>)}
      {block.points ? <ul>{block.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}
      <InlineLinks lead={block.links_lead} links={block.links} />
    </section>
  );
}

export function Checklist({ block }: { block: ChecklistBlock }) {
  return (
    <section className="text" data-page-module="checklist">
      <h2>{block.heading}</h2>
      <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}
