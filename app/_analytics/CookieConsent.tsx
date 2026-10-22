"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  OPEN_SETTINGS_EVENT,
  disableAnalytics,
  enableAnalytics,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "./consent";

export type CookieConsentCopy = {
  title: string;
  text: string;
  privacy_link_label: string;
  accept_label: string;
  reject_label: string;
  status_granted: string;
  status_denied: string;
};

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// "pending" on the server so the static HTML never contains the banner or a stale choice.
function useConsent(): ConsentChoice | null | "pending" {
  return useSyncExternalStore(subscribe, readConsent, () => "pending");
}

export function CookieConsent({ copy }: { copy: CookieConsentCopy }) {
  const consent = useConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (consent === "granted") enableAnalytics();
    else if (consent === "denied") disableAnalytics();
  }, [consent]);

  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  useEffect(() => {
    if (settingsOpen) titleRef.current?.focus();
  }, [settingsOpen]);

  if (consent === "pending" || (consent !== null && !settingsOpen)) return null;

  const decide = (choice: ConsentChoice) => {
    writeConsent(choice);
    setSettingsOpen(false);
  };

  return (
    <section className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title">
      <div className="cookie-consent-copy">
        <h2 id="cookie-consent-title" ref={titleRef} tabIndex={-1}>{copy.title}</h2>
        <p>
          {copy.text}{" "}
          <Link className="cookie-consent-link" href="/de/rechtliches/#google-analytics">{copy.privacy_link_label}</Link>
        </p>
        {consent !== null && <p className="cookie-consent-status">{consent === "granted" ? copy.status_granted : copy.status_denied}</p>}
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-consent-button" onClick={() => decide("denied")}>{copy.reject_label}</button>
        <button type="button" className="cookie-consent-button" onClick={() => decide("granted")}>{copy.accept_label}</button>
      </div>
    </section>
  );
}
