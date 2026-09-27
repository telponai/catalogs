# TelponAI Catalogs

Public metadata registry for web apps shown by TelponAI Catalogs.

Apps are authored as one YAML file per app under `apps/`. CI validates the registry and publishes a compiled `catalog.json` for TelponAI clients. The registry stores metadata and links only; app content stays on its original HTTPS origin. Third-party listings are not represented as TelponAI-owned or officially endorsed unless their metadata explicitly says otherwise.

## Add an app

Copy an existing file under `apps/`, choose a permanent lowercase kebab-case `id`, and make the filename exactly `<id>.yaml`. Required fields are `schemaVersion`, `id`, `name`, `description`, `url`, and `category`.

If `icon` is omitted, the build tries to discover the site's favicon and falls back to `/favicon.ico` without failing the catalog build.

For unofficial or community apps that use another service or brand, set `thirdParty: true`, `official: false`, and include a short factual `disclaimer`. `source` should point to the upstream project when available.

Run `npm ci && npm test && npm run build` before opening a pull request.
