import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,writeFile,mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {buildCatalog,normalizeUrl} from '../scripts/catalog.mjs'
const schemaPath=new URL('../schemas/app.schema.json',import.meta.url)
async function fixture(entries){const root=await mkdtemp(join(tmpdir(),'catalog-'));const apps=join(root,'apps');await mkdir(apps);for(const [name,body] of Object.entries(entries))await writeFile(join(apps,name),body);return apps}
const base=`schemaVersion: 1\nid: sample\nname: Sample\ndescription: Sample app\nurl: https://example.com/\ncategory: tools\n`
test('normalizes fragments and trailing root slash',()=>assert.equal(normalizeUrl('https://example.com/#x'),'https://example.com/'))
test('builds initial YouTube Music entry and resolves declared favicon',async()=>{const manifest=await buildCatalog({appsDir:new URL('../apps',import.meta.url),schemaPath,generatedAt:'2026-09-27T00:00:00.000Z',fetchImpl:async()=>({ok:true,text:async()=>'<link rel="icon" href="https://cdn.example/icon.png">',url:'https://jacob7179.github.io/YouTube-Music-Player-Web/'})});assert.equal(manifest.apps[0].id,'youtube-music-player');assert.equal(manifest.apps[0].icon,'https://cdn.example/icon.png')})
test('favicon discovery failure falls back without failing build',async()=>{const apps=await fixture({'sample.yaml':base});const m=await buildCatalog({appsDir:apps,schemaPath,fetchImpl:async()=>{throw Error('offline')},generatedAt:'x'});assert.equal(m.apps[0].icon,'https://example.com/favicon.ico')})
test('rejects duplicate normalized URLs',async()=>{const apps=await fixture({'a.yaml':base.replace('id: sample','id: a'),'b.yaml':base.replace('id: sample','id: b').replace('https://example.com/','https://example.com/#x')});await assert.rejects(()=>buildCatalog({appsDir:apps,schemaPath,fetchImpl:null}),/Duplicate app URL/)})
test('rejects filename mismatch, unsafe URL, unknown fields and duplicate YAML keys',async()=>{for(const [file,body,match] of [['wrong.yaml',base,/Filename/],['sample.yaml',base.replace('https://example.com/','http://example.com/'),/HTTPS/],['sample.yaml',base+'wat: true\n',/schema/],['sample.yaml',base+'name: Again\n',/YAML/]]){const apps=await fixture({[file]:body});await assert.rejects(()=>buildCatalog({appsDir:apps,schemaPath,fetchImpl:null}),match)}})
