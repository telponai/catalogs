import {mkdir,writeFile} from 'node:fs/promises'
import {buildCatalog} from './catalog.mjs'
const root=new URL('../',import.meta.url)
const fetchImpl=process.env.CATALOG_FETCH_ICONS==='0'?null:globalThis.fetch
const manifest=await buildCatalog({appsDir:new URL('apps/',root),schemaPath:new URL('schemas/app.schema.json',root),fetchImpl})
await mkdir(new URL('dist/',root),{recursive:true})
await writeFile(new URL('dist/catalog.json',root),JSON.stringify(manifest,null,2)+'\n')
console.log(`Built ${manifest.apps.length} catalog app(s).`)
