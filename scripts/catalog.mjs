import {readdir,readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import YAML from 'yaml'
import Ajv2020 from 'ajv/dist/2020.js'
import {parse} from 'parse5'
export function normalizeUrl(value){const u=new URL(value);if(u.protocol!=='https:')throw Error('URLs must use HTTPS.');u.hash='';return u.href}
function findIcon(node){if(node?.tagName==='link'){const attrs=Object.fromEntries((node.attrs||[]).map(a=>[a.name,a.value]));if((attrs.rel||'').toLowerCase().split(/\s+/).includes('icon')&&attrs.href)return attrs.href}for(const child of node?.childNodes||[]){const hit=findIcon(child);if(hit)return hit}return null}
async function resolveIcon(app,fetchImpl){if(app.icon)return normalizeUrl(app.icon);const fallback=new URL('/favicon.ico',app.url).href;if(!fetchImpl)return fallback;try{const res=await fetchImpl(app.url,{redirect:'follow'});if(!res.ok)return fallback;const href=findIcon(parse(await res.text()));return href?normalizeUrl(new URL(href,res.url||app.url).href):fallback}catch{return fallback}}
export async function buildCatalog({appsDir,schemaPath,fetchImpl=globalThis.fetch,generatedAt=new Date().toISOString()}){
 const schema=JSON.parse(await readFile(schemaPath,'utf8')),ajv=new Ajv2020({allErrors:true,strict:false}),validate=ajv.compile(schema)
 const dir=appsDir instanceof URL?fileURLToPath(appsDir):appsDir
 const files=(await readdir(dir)).filter(x=>x.endsWith('.yaml')).sort(),apps=[],ids=new Set(),urls=new Set()
 for(const file of files){let app;try{const doc=YAML.parseDocument(await readFile(join(dir,file),'utf8'),{uniqueKeys:true,maxAliasCount:0});if(doc.errors.length)throw doc.errors[0];app=doc.toJS({maxAliasCount:0})}catch(e){throw Error(`Invalid YAML in ${file}: ${e.message}`)}
  for(const key of ['url','source','icon'])if(app?.[key]!==undefined)app[key]=normalizeUrl(app[key])
  if(!validate(app))throw Error(`Invalid schema in ${file}: ${ajv.errorsText(validate.errors)}`)
  if(`${app.id}.yaml`!==file)throw Error(`Filename must match id: ${file}`)
  if(ids.has(app.id))throw Error(`Duplicate app id: ${app.id}`);if(urls.has(app.url))throw Error(`Duplicate app URL: ${app.url}`);ids.add(app.id);urls.add(app.url)
  app.icon=await resolveIcon(app,fetchImpl);apps.push(app)
 }
 return {schemaVersion:1,generatedAt,apps:apps.sort((a,b)=>a.id.localeCompare(b.id))}
}
