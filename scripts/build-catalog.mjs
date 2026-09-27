import {mkdir,writeFile} from 'node:fs/promises'
import {buildCatalog} from './catalog.mjs'
const root=new URL('../',import.meta.url)
const manifest=await buildCatalog({appsDir:new URL('apps/',root),schemaPath:new URL('schemas/app.schema.json',root)})
await mkdir(new URL('dist/',root),{recursive:true})
await writeFile(new URL('dist/catalog.json',root),JSON.stringify(manifest,null,2)+'\n')
console.log(`Built ${manifest.apps.length} catalog app(s).`)
