import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = resolve(root, '.pages/docs');
const chapters = ['architecture/', ...['prototype-and-data', 'sdk-and-api', 'cli-and-agents', 'gateway', 'onegui'].map(p => `architecture/${p}/`), 'api-reference/'];
const routes = JSON.parse(readFileSync(resolve(root, 'docs-src/assets/language-routes.json'), 'utf8'));
for (const lang of ['', 'en/']) {
  for (const chapter of chapters) {
    const html = readFileSync(resolve(pages, lang, chapter, 'index.html'), 'utf8');
    assert.ok(routes.includes(chapter), `Missing language route: ${chapter}`);
    const pageURL = `https://onethu.github.io/docs/${lang}${chapter}`;
    const gatewayURL = `https://onethu.github.io/docs/${lang}architecture/gateway/`;
    assert.ok([...html.matchAll(/href="([^"]+)"/g)].some(([, href]) => new URL(href, pageURL).href === gatewayURL), `Architecture navigation missing: ${pageURL}`);
    if (html.includes('<pre class="mermaid"')) {
      assert.match(html, /src="[^"]*assets\/mermaid\.min\.js"/);
      assert.ok(html.indexOf('assets/mermaid.min.js') < html.indexOf('assets/javascripts/bundle.'), 'Diagram runtime must precede Material');
    }
  }
  assert.ok(existsSync(resolve(pages, lang, 'assets/mermaid-LICENSE.txt')));
}
const script = readFileSync(resolve(root, 'docs-site/assets/language.js'), 'utf8');
for (const source of ['', 'en/']) {
  for (const chapter of [...chapters, 'reviews/historical-record/']) {
    const links = ['', 'en/'].map(lang => ({href: `https://onethu.github.io/docs/${lang}`}));
    await runInNewContext(script, {
      URL, Set,
      location: {pathname: `/docs/${source}${chapter}`, href: `https://onethu.github.io/docs/${source}${chapter}`, hash: '#section'},
      document: {currentScript: {src: 'https://onethu.github.io/docs/assets/language.js'}, querySelectorAll: () => links},
      fetch: async () => ({ok: true, json: async () => routes}),
    });
    links.forEach((link, i) => {
      const suffix = routes.includes(chapter) ? chapter + '#section' : '';
      assert.equal(link.href, `https://onethu.github.io/docs/${i ? 'en/' : ''}${suffix}`);
    });
  }
}
const api = JSON.parse(readFileSync(resolve(root, 'docs-src/api-surface.json'), 'utf8'));
for (const lang of ['', 'en/']) {
  const html = readFileSync(resolve(root, lang, 'developers.html'), 'utf8');
  assert.ok(html.includes(String(api.namespaces)) && html.includes(String(api.methods)), 'Developer page API counts differ from the source');
}
console.log('✓ 14 architecture/API pages, local diagrams, bilingual chapter routes and developer API counts');
