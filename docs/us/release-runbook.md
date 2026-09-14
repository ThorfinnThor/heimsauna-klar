# SelectYourSauna release and rollback runbook

**Runbook version:** 1.0  
**Reviewed:** 14 September 2026  
**Ticket:** S-23  
**Worker:** `heimsauna-klar`  
**Production domain:** `https://selectyoursauna.com`  
**Protected US snapshot:** `us-protected-preview-2026-09-14-l10`  
**Technical signoff commit:** `29974af`

This repository produces a static Next.js export in `out/`. Cloudflare Workers Static Assets publishes that directory through the `heimsauna-klar` Worker. There is no application Worker entry point, runtime database or OpenNext bundle.

The current US snapshot is a protected preview, not a release candidate. All four flags in `data/us/publication.json` are `false`, so the normal production build removes `/us/` before deployment.

## Responsibilities

| Decision or action | Owner |
| --- | --- |
| Product evidence, claims, rights and editorial recommendation | Luna role |
| Build, tests, snapshot integrity, release and rollback execution | Sol role |
| Awin/program terms, legal text and production authorization | Schayan Yousefian as operator |
| Cloudflare/GitHub account access and recovery | Operator |

No role may infer O-02, O-03 or O-04 from a successful build. Enabling a US switch is a separate reviewed change.

## Release record

Create one record for every production release. Do not leave any identifier as “latest”.

```text
release_date_utc:
git_commit:
github_ci_run:
us_snapshot_id:
us_scope:
cloudflare_previous_deployment_id:
cloudflare_previous_version_id:
cloudflare_new_deployment_id:
cloudflare_new_version_id:
operator_approval_reference:
smoke_test_result:
rollback_result_if_used:
```

Cloudflare version IDs must be copied from **Workers & Pages → heimsauna-klar → Deployments** or obtained with `npx --yes wrangler@4.129.0 deployments list --name heimsauna-klar`. Record the previous stable version before publishing. A Git commit does not replace a Cloudflare version ID.

## Preflight

Run from the repository root on the exact commit to be released:

```sh
git status --short
git rev-parse HEAD
npm ci
npm run lint
npm run awin:test
npm run offer:test
npm run us:ci
npm run build
npm run cloudflare:dry-run
```

The release stops if any command fails, if the working tree contains unreviewed release files, or if the GitHub CI run for the same commit is not green.

For the current protected US state, the expected output is:

- 516 DE products and 210 active DE affiliate offers;
- 23 protected US preview pages during `us:ci`;
- zero US offers and all US preview pages `noindex, follow`;
- 568 deployable HTML files after the production output gate;
- no `/us/` directory, sitemap entry or public US link in the final `out/` directory;
- Wrangler reads the static `out/` directory, reports no bindings and exits from `--dry-run` without upload.

If the release intentionally opens US routes, a new snapshot and manifest must replace the protected snapshot. L-15, S-22 and O-04 must refer to that new snapshot. A release must never open routes by an environment override while the checked-in publication state still says `false`.

## Deployment

The preferred production path is the connected Cloudflare Build on `main`:

1. Record the current Cloudflare deployment and version IDs.
2. Confirm the exact release commit and green GitHub CI run.
3. Merge or push only the approved commit to `main`.
4. Cloudflare runs `npm run build`, then `npm run cloudflare:upload`.
5. Record the new Cloudflare deployment and version IDs shown by the build or dashboard.
6. Run the immediate smoke test in S-24.

`npm run deploy:cloudflare` is the authorized manual fallback. It rebuilds before calling the pinned upload command. Do not run it while the connected `main` deployment is already in progress, and do not use it without O-04.

## Immediate smoke test

Check the deployed version, not only a local build:

```text
https://selectyoursauna.com/de/
https://selectyoursauna.com/de/produkte/
https://selectyoursauna.com/de/vergleiche/
https://selectyoursauna.com/de/planung/
https://selectyoursauna.com/robots.txt
https://selectyoursauna.com/sitemap.xml
```

Verify a homepage navigation path, one indexable product, one noindex product, one comparison, one planning guide and one active DE affiliate destination. Confirm HTTPS, canonical host, German language, expected robots state, one H1, visible content, working navigation and no horizontal overflow on desktop and mobile.

When a US launch is explicitly approved, add `/us/`, `/us/saunas/`, `/us/sauna-finder/`, every released US template type, the US trust pages and one approved US offer to the same smoke test. Confirm the exact release snapshot, language, canonical, robots state, sitemap membership and disclosure before accepting the release.

## Rollback

Use rollback when the live release has a broken route, missing assets, incorrect index state, unsafe affiliate destination, material content/data mismatch or a regression in the DE site.

### Fast service restoration

1. Identify the previously recorded stable Cloudflare version ID.
2. In **Workers & Pages → heimsauna-klar → Deployments**, choose that exact version and select **Rollback**. The CLI equivalent is `npx --yes wrangler@4.129.0 rollback <VERSION_ID> --name heimsauna-klar --message "Rollback <release-id>: <reason>"`.
3. Verify the production domain using the immediate smoke test.
4. Record the newly created rollback deployment ID and the incident reason.

A Cloudflare rollback immediately makes the selected version active. It does not change the Git repository.

### Restore the source of truth

After service is stable, create a normal Git revert for the faulty release commit, review the diff, run the complete preflight and push the revert through the normal `main` workflow. Do not use a destructive reset.

```sh
git revert <FAULTY_RELEASE_COMMIT>
npm run us:de-baseline:check
npm run build
git push origin main
```

If only an unsafe US affiliate target is involved, set `affiliate_links_enabled` to `false` in `data/us/publication.json`, rebuild and deploy the reviewed emergency commit. If any US content boundary is uncertain, set `routes_enabled` and `indexing_enabled` to `false` as well. The output gate will remove the complete US surface.

## Rehearsal performed

On 14 September 2026 the protected release path was rehearsed without uploading:

- full build and all repository gates passed;
- Wrangler 4.129.0 read 3,517 files from `out/`;
- no runtime bindings were found;
- `wrangler deploy --dry-run` exited without deployment;
- the US output gate removed `/us/` from the deployable export;
- the current Cloudflare deployment list could not be read from this host because the local VPN/proxy certificate chain was rejected, so no remote version ID was invented.

The next authorized release must therefore capture both previous and new Cloudflare IDs from the dashboard or a working authenticated Wrangler environment.
