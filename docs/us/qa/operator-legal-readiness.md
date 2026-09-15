# US operator and legal readiness review

**Review date:** 15 September 2026
**Task:** O-03 / S-18 preparation  
**Scope:** technical readiness of the protected US trust-page draft

## Current result

The four US trust pages are technically integrated, operator-approved and describe the behavior currently visible in the repository. Cloudflare Web Analytics is confirmed active for the production domain. No affiliate output or feed synchronization is enabled.

The site currently has no account area, checkout, contact form, analytics SDK, advertising pixel, cookie write, local/session storage, browser-side request to an analytics endpoint or embedded third-party frame. Finder selections stay in the visible URL. Contact uses `mailto:` and therefore depends on the sender's and recipient's mail systems.

## Operator decisions still required

| Area | Evidence needed from operator | Current status |
| --- | --- | --- |
| Cloudflare delivery | Web Analytics is active; provider-side request-log, retention, contractual entity and DPA/transfer details remain account-controlled | recorded |
| GitHub Actions | Log retention, workflow dispatch permissions and repository access roles | open |
| Mailbox | `info@selectyoursauna.com` confirmed correct by operator | recorded |
| Public legal text | Operator details, contact procedure, privacy wording and applicable audience/jurisdiction approved by operator | recorded |
| Consent/opt-out | No US affiliate output is enabled; future attribution controls remain a separate gate | deferred |
| Awin | Advertiser terms and attribution details when affiliate links are activated | deferred by decision; not needed for current zero-offer preview |

## Safe state

The operator-approved legal pages are published for the reviewed US release. `routes_enabled` and `indexing_enabled` are enabled for the first-wave pages only. `affiliate_links_enabled` and `feed_sync_enabled` remain `false` until a separate Awin review is complete.

Changing draft text to `published` or enabling a publication switch would be a release decision, not a documentation cleanup. It requires the operator decision, the corresponding evidence and a new Sol technical review.

## Next handoff

The remaining account checks do not block this editorial indexing release. Awin evidence must still be added before any US affiliate offer is activated.
