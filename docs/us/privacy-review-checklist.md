# US privacy and data-flow review checklist

Technical inventory date: 2026-09-14

The evidence base is `docs/us/data-flow-inventory.json`. It describes repository-visible behavior, not a legal conclusion or an account-dashboard audit.

## Confirmed from code

- The Cloudflare Worker serves only static assets. There is no application server, user database, account system, checkout or form endpoint.
- The browser contains no analytics SDK, advertising pixel, cookie write, local storage, session storage, browser `fetch`, `XMLHttpRequest`, `sendBeacon` or third-party iframe.
- Catalog and Finder selections are calculated locally and stored in the visible URL. A later request for that URL can include those parameters in Cloudflare request handling or logs.
- Affiliate links are ordinary marked outbound links. Awin is not embedded and receives no request from the page before a user opens such a link.
- Contact is a `mailto:` action. Message processing occurs in the sender and recipient email systems, not in a website form.
- GitHub Actions receives the Awin feed URL as a secret, downloads feeds on the runner and commits sanitized reports or reviewed catalog changes. The implemented reports set `secret_included` to false.

## Operator checks before US privacy publication

1. Record whether Cloudflare Web Analytics is enabled in the account even though no analytics script appears in the repository.
2. Record enabled Cloudflare security, bot, request-log and log-retention products.
3. Confirm Cloudflare contractual entity, DPA and relevant international-transfer terms for the deployed zone.
4. Record GitHub Actions log retention and who can dispatch feed workflows or read repository settings.
5. Confirm the actual mailbox destination behind `info@selectyoursauna.com`, the Email Routing configuration, provider and deletion routine.
6. For each approved US affiliate program, record the network terms, cookie/attribution behavior, reports available to the publisher and retention or export settings.
7. Decide whether outbound affiliate attribution needs consent or another user-facing control in the intended jurisdictions. This repository audit does not make that legal decision.

## Change triggers

Repeat this inventory before adding analytics, a consent manager, a contact form, accounts, personalization, server-side redirects, granular click references, embedded media, hosted preview authentication or a new deployment provider. The proposed controls remain disabled until the related provider, data fields, purpose, retention and public text are approved.
