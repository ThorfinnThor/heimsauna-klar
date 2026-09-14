# Protected US pilot preview

The US pilot is reviewed as an offline static build. It is not a public preview URL and it does not alter the checked-in publication controls.

Run:

```sh
npm run us:preview:test
```

The runner validates the source bundle against `docs/us/launch-snapshot.json` and `docs/us/preview-manifest.json`, sets the research-preview environment only for its child processes, generates the static export and checks the 24 declared US pages before deletion. It verifies that all ten real candidate products reach the catalog, Finder payload and their exact product pages with configuration, source and rights-register data. It also checks the contact, methodology, affiliate-disclosure and privacy drafts through the same static preview path. All pages must remain `noindex, follow`, must carry a research-preview notice and must not contain undeclared routes, synthetic test markers, affiliate labels or public Product schema.

Cleanup runs even when a preview assertion fails. Because `data/us/publication.json` keeps `routes_enabled` false, the output gate removes `out/us` before the command exits and confirms that no US link remains in the deployable DE output or discovery files.

The affiliate-link path is covered separately with isolated fixtures. The current real US pilot has zero offers, no approved US program relationship and no live US affiliate destination. The protected preview therefore checks the truthful zero-offer state and must not be interpreted as a live affiliate test.
