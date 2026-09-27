import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
test('Pages workflow validates and builds before publishing dist',async()=>{const y=await readFile(new URL('../.github/workflows/catalog.yml',import.meta.url),'utf8');assert.match(y,/npm test/);assert.match(y,/npm run build/);assert.match(y,/path: dist/);assert.match(y,/deploy-pages/)})
test('PR validation is read-only and skips outbound favicon discovery',async()=>{const y=await readFile(new URL('../.github/workflows/catalog.yml',import.meta.url),'utf8');assert.match(y,/permissions:\n  contents: read/);assert.match(y,/CATALOG_FETCH_ICONS: ['"]?0/);assert.match(y,/deploy:\n[\s\S]*permissions:\n      pages: write\n      id-token: write/)})
