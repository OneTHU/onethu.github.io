// Preserve the full chapter only when a translated counterpart was assembled.
(async () => {
  const script = document.currentScript;
  const parts = location.pathname.replace(/^\/docs\//, '').replace(/^en\//, '');
  const page = parts.replace(/index\.html$/, '');
  let routes;
  try {
    const response = await fetch(new URL('language-routes.json', script.src));
    if (!response.ok) throw new Error('Language routes unavailable');
    routes = new Set(await response.json());
  } catch {
    return; // Keep the server-rendered language index links usable.
  }
  for (const link of document.querySelectorAll('.md-select__link')) {
    const url = new URL(link.href, location.href);
    if (!url.pathname.startsWith('/docs/')) continue;
    const english = url.pathname.startsWith('/docs/en/');
    url.pathname = '/docs/' + (english ? 'en/' : '') + (routes.has(page) ? page : '');
    url.hash = routes.has(page) ? location.hash : '';
    link.href = url.href;
  }
})();
