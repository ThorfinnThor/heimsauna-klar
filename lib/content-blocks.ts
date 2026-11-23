// Page bodies are versioned JSON: an ordered list of blocks per page. The order is
// chosen per page in content/de/*.json, the components only render it.
export type ContentLink = { href: string; label: string };

export type TextBlock = {
  type: "text";
  heading: string;
  paragraphs: string[];
  points?: string[];
  links_lead?: string;
  links?: ContentLink[];
};

export type LinksBlock = { type: "links"; links: ContentLink[] };
export type ChecklistBlock = { type: "checklist"; heading: string; items: string[] };
