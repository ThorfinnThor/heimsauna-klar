// Google Analytics 4 behind an opt-in. This module is used by the German
// layouts only; US routes stay tracking-free (docs/us/data-flow-inventory.json).

export const GA_MEASUREMENT_ID = "G-BCT08FM2YW";
export const GA_SCRIPT_URL = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
export const CONSENT_STORAGE_KEY = "sys-cookie-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_CHANGE_EVENT = "sys:consent-change";
export { OPEN_SETTINGS_EVENT } from "./events";

export type ConsentChoice = "granted" | "denied";

type StoredConsent = { version: number; analytics: ConsentChoice; decided_at: string };

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
} & Record<string, unknown>;

export function readConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredConsent>;
    if (stored.version !== CONSENT_VERSION) return null;
    return stored.analytics === "granted" || stored.analytics === "denied" ? stored.analytics : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice) {
  const stored: StoredConsent = { version: CONSENT_VERSION, analytics: choice, decided_at: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage can be blocked; the choice then applies to this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: choice }));
}

function gtagWindow() {
  return window as unknown as GtagWindow;
}

// Defines the dataLayer queue with Consent Mode v2 defaults. No network request happens here.
function ensureGtagQueue() {
  const w = gtagWindow();
  if (w.gtag) return w.gtag;
  w.dataLayer = w.dataLayer ?? [];
  w.gtag = function gtag() {
    // gtag.js expects the Arguments object, not an array.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  return w.gtag;
}

export function enableAnalytics() {
  const w = gtagWindow();
  const gtag = ensureGtagQueue();
  w[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  gtag("consent", "update", { analytics_storage: "granted" });
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
  if (document.querySelector(`script[src="${GA_SCRIPT_URL}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = GA_SCRIPT_URL;
  document.head.appendChild(script);
}

export function disableAnalytics() {
  const w = gtagWindow();
  w[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  if (w.gtag) w.gtag("consent", "update", { analytics_storage: "denied" });
  deleteGaCookies();
}

function deleteGaCookies() {
  const names = document.cookie
    .split(";")
    .map((entry) => entry.split("=")[0]?.trim() ?? "")
    .filter((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name === "_gat");
  const hostParts = window.location.hostname.split(".");
  const domains = [""];
  for (let index = 0; index < hostParts.length - 1; index += 1) domains.push(`; domain=.${hostParts.slice(index).join(".")}`);
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}
