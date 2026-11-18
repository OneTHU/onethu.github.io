// Live-refresh the Contributors table on /docs/contributors/ and /docs/en/contributors/.
(() => {
  const script = document.currentScript;
  const run = async () => {
    const cleanPath = location.pathname.replace(/index\.html$/, '');
    if (!/\/docs\/(?:en\/)?contributors\/?$/.test(cleanPath)) return;
    const en = cleanPath.includes('/docs/en/');
    const tbody = document.querySelector('.md-content table tbody');
    if (!tbody) return;

    const repoUrl = 'https://github.com/smartThise/OneTHU';
    const cacheKey = 'onethu.contributors.github.v1';
    const ttlMs = 300000;

    let report = null;
    for (const candidate of [new URL('contributors.json', script?.src || location.href).href, '/assets/contributors.json']) {
      try {
        const res = await fetch(candidate, {cache: 'no-store', signal: AbortSignal.timeout(8000)});
        if (res.ok) {
          report = await res.json();
          break;
        }
      } catch {}
    }

    let live = null;
    try {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const cached = JSON.parse(raw);
          if (Date.now() - cached.ts < ttlMs) live = cached.data;
        }
      } catch {}
      if (!live) {
        const [cRes, bRes] = await Promise.all([
          fetch('https://api.github.com/repos/smartThise/OneTHU/contributors?per_page=100', {headers: {Accept: 'application/vnd.github+json'}, signal: AbortSignal.timeout(8000)}),
          fetch('https://api.github.com/repos/smartThise/OneTHU/branches?per_page=20', {headers: {Accept: 'application/vnd.github+json'}, signal: AbortSignal.timeout(8000)}),
        ]);
        if (cRes.ok) {
          live = {contributors: await cRes.json(), branches: bRes.ok ? await bRes.json() : []};
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ts: Date.now(), data: live})); } catch {}
        }
      }
    } catch {}

    if (!report && !live) return;
    const list = (report?.contributors || []).map(p => ({...p}));
    const byKey = new Map();
    for (const p of list) {
      if (p.github) byKey.set('gh:' + p.github.split('/').pop().toLowerCase(), p);
      byKey.set('name:' + String(p.name).toLowerCase(), p);
    }
    if (live && Array.isArray(live.contributors)) {
      for (const gh of live.contributors) {
        if (!gh || !gh.login || gh.type === 'Bot') continue;
        const key = 'gh:' + String(gh.login).toLowerCase();
        const existing = byKey.get(key) || byKey.get('name:' + String(gh.login).toLowerCase());
        if (existing) {
          existing.github = existing.github || gh.html_url || ('https://github.com/' + gh.login);
          if (Number.isFinite(gh.contributions) && gh.contributions > existing.commits) existing.commits = gh.contributions;
        } else {
          const entry = {name: String(gh.login), github: gh.html_url || ('https://github.com/' + gh.login), commits: Number(gh.contributions) || 1, codeAdded: 0, codeDeleted: 0, major: false};
          list.push(entry);
          byKey.set(key, entry);
        }
      }
    }
    list.sort((a, b) => (b.codeAdded - a.codeAdded) || (b.commits - a.commits) || String(a.name).localeCompare(String(b.name), 'en', {sensitivity: 'base'}));

    if (list.length) {
      const rows = list.map(p => {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        if (p.github) {
          const a = document.createElement('a');
          a.href = p.github;
          a.textContent = p.name;
          tdName.append(a);
        } else {
          tdName.textContent = p.name;
        }
        const tdLines = document.createElement('td');
        tdLines.style.textAlign = 'right';
        tdLines.textContent = Number(p.codeAdded || 0).toLocaleString('en-US');
        const tdCommits = document.createElement('td');
        tdCommits.style.textAlign = 'right';
        tdCommits.textContent = String(Number(p.commits || 0));
        const tdRole = document.createElement('td');
        tdRole.textContent = p.major ? (en ? 'Major contributor' : '主要贡献者') : '—';
        tr.append(tdName, tdLines, tdCommits, tdRole);
        return tr;
      });
      tbody.replaceChildren(...rows);
    }

    let ref = report?.ref || '';
    let stamp = report?.generatedAt || '';
    if (live && Array.isArray(live.branches) && live.branches.length) {
      const preferred = ['web', 'dev3', 'main'].map(n => live.branches.find(b => b.name === n)).find(Boolean) || live.branches[0];
      if (preferred?.commit?.sha) {
        ref = preferred.commit.sha;
        stamp = new Date().toISOString();
      }
    }
    for (const p of document.querySelectorAll('.md-content p')) {
      const txt = p.textContent || '';
      if (/^(Source commit|统计提交)\s*:/.test(txt) && ref) {
        p.replaceChildren();
        p.append((en ? 'Source commit: ' : '统计提交: '));
        const code = document.createElement('code');
        const a = document.createElement('a');
        a.href = `${repoUrl}/commit/${ref}`;
        a.textContent = ref;
        code.append(a);
        p.append(code);
        if (stamp) {
          p.append(document.createElement('br'), (en ? 'Updated: ' : '更新时间: ') + stamp);
        }
      }
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
