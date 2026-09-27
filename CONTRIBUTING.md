# Contributing

Add or change catalog entries only through `apps/*.yaml`; do not hand-edit `dist/catalog.json`.

Every app URL must use HTTPS. IDs and categories use lowercase kebab-case. Unknown fields, duplicate IDs, duplicate normalized URLs, filename/ID mismatches, duplicate YAML keys, and non-HTTPS URLs are rejected by CI.

Optional fields are `icon`, `source`, `tags`, and `author`. Keep descriptions plain text because TelponAI treats all registry metadata as untrusted input.
