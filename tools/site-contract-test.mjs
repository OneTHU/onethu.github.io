import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
let count=0;
for(const language of ['', 'en/'])for(const page of ['index','download','market','developers','community']){
 const file=resolve(root,language+page+'.html'),html=readFileSync(file,'utf8');
 assert.match(html,language?/<html lang="en">/:/<html lang="zh-CN">/);assert.match(html,/data-language/);assert.match(html,/<span class="word"><i>O<\/i><i>n<\/i><i>e<\/i><\/span>/);assert.match(html,/<span class="u">T<\/span><span class="u">H<\/span><span class="u">U<\/span>/);assert.doesNotMatch(html,/familiar graphite interface|熟悉的石墨界面/);assert.match(html,/developers\.html/);
 for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(?:https?:|#|mailto:)/.test(url))continue;
  const path=resolve(dirname(file),url.split('#')[0]);
  if(path===resolve(root,'docs')||path.startsWith(resolve(root,'docs')+'/'))continue;
  assert.ok(existsSync(path),`${language+page}: missing ${url}`);count++;
 }
 if(page==='developers'){assert.match(html,/contributors/);assert.match(html,/10,000/);assert.match(html,/smartThise/);assert.match(html,/xiao-dreamr/);}
 if(page==='index'){assert.match(html,/home-landscape.webp/);assert.match(html,/vault-drag.mp4/);assert.match(html,/OneTHU Harness/);}
 assert.doesNotMatch(html,/assets\/shots\//,'Old preview references must be gone');
}
const report=JSON.parse(readFileSync(resolve(root,'assets/contributors.json'),'utf8'));
assert.ok(report.contributors.length>=10);for(const p of report.contributors){assert.equal(p.major,p.codeAdded>10000);assert.ok(!('email' in p));}
const assetManifest=JSON.parse(readFileSync(resolve(root,'assets/preview/manifest.json'),'utf8'));assert.match(assetManifest.data,/fictional/);
console.log(`✓ 10 bilingual pages, ${count} local references, contributor threshold and fictional assets`);
