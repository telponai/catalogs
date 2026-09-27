# Contributing

Add or change catalog entries only through `apps/*.yaml`; do not hand-edit `dist/catalog.json`.

Every app URL must use HTTPS. IDs and categories use lowercase kebab-case. Unknown fields, duplicate IDs, duplicate normalized URLs, filename/ID mismatches, duplicate YAML keys, and non-HTTPS URLs are rejected by CI.

Optional fields are `icon`, `source`, `tags`, `author`, `official`, `thirdParty`, and `disclaimer`. Keep descriptions and disclaimers plain text because TelponAI treats all registry metadata as untrusted input.

If a listing is an unofficial/community client for another service or brand, set `thirdParty: true`, `official: false`, include a factual affiliation disclaimer, and provide the upstream `source` when available. CI rejects third-party entries that claim `official: true` or omit the disclaimer.
