# TelponAI Catalogs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a YAML-driven TelponAI web-app catalog and make TelponAI load, browse, open, and locally save those catalog apps without redeploying for catalog-only changes.

**Architecture:** `telponai/catalogs` owns one YAML file per app, validates it in CI, resolves a best-effort favicon, and publishes `dist/catalog.json` on GitHub Pages. The TelponAI website defensively validates and caches that JSON, renders a Catalogs view from the existing Apps area, and reuses the existing HTTPS iframe viewer and local `addApp` path.

**Tech Stack:** Node.js ESM, `yaml`, `ajv`, `parse5`, Node test runner, GitHub Actions/Pages, React/Vite/Vitest/Testing Library/Playwright.

**Spec:** `docs/superpowers/specs/2026-09-27-catalogs-registry-design.md`

## Global Constraints
- YAML is the hand-edited source of truth; one file per app under `apps/`.
- V1 schema requires `schemaVersion`, `id`, `name`, `description`, `url`, `category`; optional `icon`, `source`, `tags`, `author`.
- All launch/source/absolute icon URLs are HTTPS-only.
- Catalog metadata is untrusted; TelponAI revalidates before launch/persistence and never renders registry HTML.
- Catalog changes must not require a TelponAI redeploy.
- Existing iframe sandbox/allow permissions remain unchanged.
- User files/local Apps/preferences are never uploaded by Catalogs.

## Review Focus
- Duplicate normalized URLs must fail registry validation even when URL spelling differs only by fragment/trailing normalization.
- Remote icon discovery failure must not fail the catalog build; it must fall back deterministically.
- A malformed/unknown-version remote manifest must never replace the last known-good cache.
- A catalog item with an unsafe URL must be refused client-side even if registry CI somehow missed it.
- `Add to Apps` must use existing local persistence and must not silently create duplicate catalog cache state.

---

### Task 1: Registry contract and builder
**Files:** create `package.json`, `apps/youtube-music-player.yaml`, `schemas/app.schema.json`, `scripts/catalog.mjs`, `test/catalog.test.mjs`.
**Interfaces:** produce `buildCatalog({appsDir, schemaPath, fetchImpl, generatedAt}) -> manifest` and `validateEntry(...)`; output `dist/catalog.json`.
- [ ] Write tests for the initial app, duplicate IDs/normalized URLs, filename mismatch, unknown fields, unsafe URLs, duplicate YAML keys, deterministic sorting, and favicon fallback.
- [ ] Run `npm test` and verify RED because builder does not exist.
- [ ] Implement schema parsing/validation, safe YAML loading, URL normalization, best-effort favicon discovery, and JSON generation.
- [ ] Run `npm test` and verify GREEN.
- [ ] Build `dist/catalog.json` and verify it contains `youtube-music-player`.
- [ ] Commit registry implementation.

### Task 2: Registry publishing and contribution docs
**Files:** create `.github/workflows/catalog.yml`, `README.md`, `CONTRIBUTING.md`.
**Interfaces:** Pages artifact root is `dist/`; stable URL is `https://telponai.github.io/catalogs/catalog.json`.
- [ ] Add a test/static assertion that workflow runs validation before deploy and uploads `dist`.
- [ ] Verify test RED before workflow exists.
- [ ] Add least-privilege GitHub Pages workflow and concise contribution docs.
- [ ] Run registry tests/build and verify GREEN.
- [ ] Commit publishing/docs.

### Task 3: TelponAI catalog data/cache module
**Files:** create `website/src/catalog.js`, `website/src/catalog.test.js` in isolated TelponAI worktree.
**Interfaces:** produce `CATALOG_URL`, `validateCatalogManifest(value)`, `readCatalogCache(storage)`, `writeCatalogCache(storage, manifest)`, `fetchCatalog(fetchImpl)`, `faviconFallback(url)`.
- [ ] Write failing tests for valid/invalid manifest versions, HTTPS validation, cache preservation, malformed JSON, and fallback icon generation.
- [ ] Run focused Vitest and verify RED.
- [ ] Implement minimal defensive validation/cache/fetch helpers using existing `validAppUrl`.
- [ ] Run focused test and full `npm test` GREEN.
- [ ] Commit catalog data layer.

### Task 4: Catalogs React experience
**Files:** create `website/src/Catalogs.jsx`; modify `website/src/Apps.jsx`, `website/src/App.test.jsx`, `website/src/styles.css`.
**Interfaces:** `Catalogs({store,act,busy,onBack,onOpen})`; `Apps` continues to own the existing iframe viewer and passes catalog selections into it.
- [ ] Extend component tests first: Browse Catalogs entry, cached/remote YouTube Music card, search/category filter, Open, Add to Apps, icon fallback, first-use offline state.
- [ ] Run tests and verify RED.
- [ ] Implement stale-while-revalidate Catalogs view and wire it into Apps without changing iframe permissions.
- [ ] Add responsive Catalogs styles consistent with existing TelponAI shell.
- [ ] Run focused and full unit tests GREEN.
- [ ] Commit UI integration.

### Task 5: Browser verification and build
**Files:** modify `website/tests/browser.e2e.mjs` only if needed for catalog route coverage.
**Interfaces:** browser must show `YouTube Music Player`, open it through existing iframe path, and allow adding it to local Apps.
- [ ] Add/extend E2E assertion first and verify it fails before final integration.
- [ ] Make only the minimal integration adjustment required.
- [ ] Run `npm test`, `npm run build`, and relevant browser E2E; all must pass.
- [ ] Inspect both repo diffs for accidental unrelated changes and security regressions.
- [ ] Commit final verification changes.
