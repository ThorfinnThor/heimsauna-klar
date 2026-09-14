# US operator and legal readiness review

**Review date:** 14 September 2026  
**Task:** O-03 / S-18 preparation  
**Scope:** technical readiness of the protected US trust-page draft

## Current result

The four US trust-page drafts are technically integrated and describe the behavior currently visible in the repository. They remain drafts. No legal conclusion, consent decision or production approval is inferred from the integration.

The site currently has no account area, checkout, contact form, analytics SDK, advertising pixel, cookie write, local/session storage, browser-side request to an analytics endpoint or embedded third-party frame. Finder selections stay in the visible URL. Contact uses `mailto:` and therefore depends on the sender's and recipient's mail systems.

## Operator decisions still required

| Area | Evidence needed from operator | Current status |
| --- | --- | --- |
| Cloudflare delivery | Web Analytics state, security/request-log products, retention, contractual entity and DPA/transfer terms | open |
| GitHub Actions | Log retention, workflow dispatch permissions and repository access roles | open |
| Mailbox | Confirmation that `info@selectyoursauna.com` receives a test message, provider and retention/deletion routine | open |
| Public legal text | Approval of operator details, contact procedure, privacy wording and applicable audience/jurisdiction | open |
| Consent/opt-out | Operator/legal decision whether outbound attribution or future services require a user-facing control | open |
| Awin | Advertiser terms and attribution details when affiliate links are activated | deferred by decision; not needed for current zero-offer preview |

## Safe state

Until these decisions are recorded, keep `content/us/legal.json` and `content/us/affiliate.json` in `draft` status and keep `routes_enabled`, `indexing_enabled`, `affiliate_links_enabled` and `feed_sync_enabled` set to `false`. The output gate therefore removes the US section from the public build.

Changing draft text to `published` or enabling a publication switch would be a release decision, not a documentation cleanup. It requires the operator decision, the corresponding evidence and a new Sol technical review.

## Next handoff

The operator can complete the open rows without waiting for Awin. After the legal/operator decision is recorded, Sol can recheck S‑18 and the protected preview. Awin evidence can then be added later before any affiliate offer is activated.
