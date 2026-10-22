"use client";

import { OPEN_SETTINGS_EVENT } from "./events";

// Kept apart from consent.ts so the shared footer never pulls the GA loader into other bundles.
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="footer-link-button" onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}>
      {label}
    </button>
  );
}
