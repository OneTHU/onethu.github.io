/* ============================================================
   OneTHU 站点交互
   ① 首屏线条跳动动效（canvas：水平流线 + 正弦叠加 + 指针扰动，DPR 感知、离屏暂停、
      prefers-reduced-motion 时只画静态一帧）
   ② 插件市场：拉 OneTHU-Market 的 registry.json（GitHub contents API 优先、raw 兜底），
      补齐各仓库 star 数（sessionStorage 缓存 10 分钟），按分类/搜索过滤
   ③ 滚动显现、平台识别、复制按钮
   ============================================================ */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MARKET_REPO = 'smartThise/OneTHU-Market';
const REGISTRY_PATHS = ['registry.json'];

/* ── ① 线条跳动 ── */
function lineField(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, raf = 0, running = false;
  let pointer = { x: -1e4, y: -1e4, active: false };
  const LINES = 26;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* 一条线：基线 + 三组正弦（不同频率/相位/速度）+ 指针处的局部隆起 */
  function drawLine(i, t) {
    const p = i / (LINES - 1);
    const y0 = 24 + p * (h - 48);
    const amp = 5 + 12 * (1 - Math.abs(p - 0.45) * 1.4);
    const blue = i % 7 === 3;
    ctx.beginPath();
    ctx.lineWidth = blue ? 1.5 : 1;
    ctx.strokeStyle = blue ? 'rgba(65,118,230,.42)' : 'rgba(15,17,21,.10)';
    const step = 12;
    for (let x = -step; x <= w + step; x += step) {
      const k = x / Math.max(1, w);
      let y = y0
        + Math.sin(k * 6.2 + t * 1.1 + p * 2.4) * amp
        + Math.sin(k * 13.7 - t * 0.7 + p * 4.1) * amp * 0.34
        + Math.sin(k * 27.1 + t * 1.9) * amp * 0.12;
      if (pointer.active) {
        const dx = x - pointer.x, dy = y - pointer.y;
        const d2 = dx * dx + dy * dy;
        y += Math.exp(-d2 / 12000) * 22 * Math.sign(pointer.y - y || 1) * -1;
      }
      if (x <= -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /* 稀疏方块：几何语言的点缀，随行高与时间缓慢明灭 */
  function drawSquares(t) {
    for (let i = 0; i < 14; i++) {
      const seed = i * 137.5;
      const x = ((seed * 7.3) % 100) / 100 * w;
      const y = ((seed * 3.1) % 100) / 100 * h;
      const s = 4 + ((i * 5) % 3) * 3;
      const a = 0.05 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.9 + i));
      ctx.fillStyle = i % 5 === 0 ? `rgba(65,118,230,${a + 0.12})` : `rgba(15,17,21,${a})`;
      ctx.fillRect(Math.round(x), Math.round(y), s, s);
    }
  }

  function frame(now) {
    if (!running) return;
    const t = now / 1000;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < LINES; i++) drawLine(i, t);
    drawSquares(t);
    raf = requestAnimationFrame(frame);
  }

  function start() { if (running || REDUCED) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function staticFrame() { ctx.clearRect(0, 0, w, h); for (let i = 0; i < LINES; i++) drawLine(i, 0.6); drawSquares(1.2); }

  resize();
  if (REDUCED) staticFrame(); else start();
  addEventListener('resize', () => { resize(); if (REDUCED) staticFrame(); });
  addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: e.clientY < rect.bottom + 120 && e.clientY > rect.top - 120 };
  });
  addEventListener('pointerleave', () => { pointer.active = false; });
  /* 离屏暂停：省电，也避免多标签页时抢帧 */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { entry.isIntersecting ? start() : stop(); }, { threshold: 0 }).observe(canvas);
  }
}

/* ── ② 插件市场 ── */
const starCache = {
  get(key) {
    try {
      const raw = JSON.parse(sessionStorage.getItem('onethu.stars') || '{}');
      const hit = raw[key];
      if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.n;
    } catch {}
    return null;
  },
  set(key, n) {
    try {
      const raw = JSON.parse(sessionStorage.getItem('onethu.stars') || '{}');
      raw[key] = { n, at: Date.now() };
      sessionStorage.setItem('onethu.stars', JSON.stringify(raw));
    } catch {}
  },
};

async function fetchRegistry() {
  for (const path of REGISTRY_PATHS) {
    // GitHub contents API：无 CDN 缓存，改完即见
    try {
      const api = `https://api.github.com/repos/${MARKET_REPO}/contents/${path}`;
      const res = await fetch(api, { headers: { Accept: 'application/vnd.github.raw' } });
      if (res.ok) return JSON.parse(await res.text());
    } catch {}
    // raw 兜底（Fastly 缓存，最多滞后几分钟）
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${MARKET_REPO}/main/${path}`);
      if (res.ok) return JSON.parse(await res.text());
    } catch {}
  }
  return null;
}

/** 分类：与应用内市场口径一致——主题插件单列，官方示例单列，其余归社区 */
function categorize(p) {
  const tags = Array.isArray(p.tags) ? p.tags : [];
  const repo = String(p.repo || '');
  const id = String(p.id || '');
  if (p.category || p.kind) return String(p.category || p.kind);
  if (tags.includes('主题') || /theme/i.test(id + repo)) return 'theme';
  if (tags.includes('示例') || tags.includes('模板') || /plugin-hello/i.test(repo)) return 'official';
  return 'community';
}

function normalize(registry) {
  const list = Array.isArray(registry) ? registry : (registry && (registry.plugins || registry.list)) || [];
  return list.map((p) => {
    const repo = String(p.repo || p.repository || '').replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    return {
      id: String(p.id || repo || p.name || ''),
      name: String(p.name || p.title || repo || '未命名插件'),
      author: String(p.author || (repo.split('/')[0] ?? '')),
      desc: String(p.description || p.desc || ''),
      version: String(p.version || ''),
      category: categorize(p),
      repo,
      url: repo ? `https://github.com/${repo}` : String(p.url || ''),
      tags: Array.isArray(p.tags) ? p.tags.slice(0, 4) : [],
    };
  }).filter((p) => p.name);
}

async function stars(repo) {
  if (!repo) return null;
  const cached = starCache.get(repo);
  if (cached != null) return cached;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`);
    if (!res.ok) return null;
    const n = (await res.json()).stargazers_count;
    starCache.set(repo, n);
    return n;
  } catch {
    return null;
  }
}

/* 并发受限地补 star（GitHub 匿名限额 60/h/ip） */
async function fillStars(cards, items) {
  const queue = items.slice(0, 30);
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const item = queue.shift();
      const n = await stars(item.repo);
      const el = cards.get(item.id);
      if (el) el.textContent = n == null ? '' : `★ ${n}`;
    }
  });
  await Promise.all(workers);
}

function marketCard(p) {
  const a = document.createElement('a');
  a.className = 'market-card reveal';
  a.href = p.url || '#';
  a.target = '_blank';
  a.rel = 'noopener';
  a.innerHTML = `
    <div class="head">
      <span class="name"></span>
      <span class="stars mono" title="GitHub stars"></span>
    </div>
    <div class="meta"></div>
    <div class="desc"></div>
    <div class="foot">
      <span class="repo mono"></span>
      <span class="chip chip-accent">前往仓库 →</span>
    </div>`;
  a.querySelector('.name').textContent = p.name;
  a.querySelector('.meta').textContent = [p.author, p.version ? 'v' + p.version : '', p.category].filter(Boolean).join(' · ');
  a.querySelector('.desc').textContent = p.desc || '（无描述）';
  a.querySelector('.repo').textContent = p.repo || p.url;
  if (p.tags.length) {
    const row = document.createElement('div');
    row.className = 'tag-row';
    row.innerHTML = p.tags.map((t) => `<span class="tag"></span>`).join('');
    row.querySelectorAll('.tag').forEach((el, i) => { el.textContent = p.tags[i]; });
    a.querySelector('.foot').before(row);
  }
  return a;
}

async function initMarket() {
  const grid = document.getElementById('market-grid');
  if (!grid) return;
  const tabs = [...document.querySelectorAll('#market-tabs .tab')];
  const search = document.getElementById('market-search');
  const empty = document.getElementById('market-empty');

  grid.innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton-card"></div>').join('');
  const registry = await fetchRegistry();
  if (!registry) {
    grid.innerHTML = '';
    if (empty) {
      empty.hidden = false;
      empty.innerHTML = `市场名单读取失败（网络或 API 限额）。可直接前往 <a href="https://github.com/${MARKET_REPO}" target="_blank" rel="noopener">${MARKET_REPO}</a> 查看。`;
    }
    return;
  }
  const items = normalize(registry);
  if (!items.length) { grid.innerHTML = ''; if (empty) empty.hidden = false; return; }

  // 分类页签：全部 + 名单里出现的分类（官方/主题/工具…）
  const cats = [...new Set(items.map((p) => p.category).filter(Boolean))];
  const label = { plugin: '插件', theme: '主题', official: '官方示例', community: '社区', tool: '工具', harness: 'Harness' };
  tabs.slice(1).forEach((t) => t.remove());
  cats.forEach((c) => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.setAttribute('role', 'tab');
    b.dataset.cat = c;
    b.textContent = label[c] || c;
    document.getElementById('market-tabs').appendChild(b);
  });

  function render(cat, q) {
    const needle = q.trim().toLowerCase();
    const list = items.filter((p) => (cat === 'all' || p.category === cat)
      && (!needle || `${p.name} ${p.desc} ${p.repo} ${p.author}`.toLowerCase().includes(needle)));
    grid.innerHTML = '';
    empty.hidden = list.length > 0;
    const cardMap = new Map();
    for (const p of list) {
      const card = marketCard(p);
      grid.appendChild(card);
      cardMap.set(p.id, card.querySelector('.stars'));
    }
    observeReveals(grid);
    void fillStars(cardMap, list);
  }

  let cat = 'all';
  const onFilter = () => render(cat, search ? search.value : '');
  // 页签建好之后再统一绑定（原来把初始的「全部」绑了两次）
  document.querySelectorAll('#market-tabs .tab').forEach((t) => {
    t.addEventListener('click', () => {
      cat = t.dataset.cat || 'all';
      document.querySelectorAll('#market-tabs .tab').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      onFilter();
    });
  });
  if (search) search.addEventListener('input', onFilter);
  render('all', '');
}

/* ── ③ 滚动显现 / 平台识别 / 复制 ── */
let revealObserver = null;
function observeReveals(root = document) {
  const nodes = root.querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window)) { nodes.forEach((n) => n.classList.add('in')); return; }
  revealObserver ??= new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  nodes.forEach((n) => revealObserver.observe(n));
}

function detectPlatform() {
  const ua = navigator.userAgent;
  const os = /Android/i.test(ua) ? 'android' : /Mac/i.test(ua) ? 'macos' : /Win/i.test(ua) ? 'windows' : '';
  document.querySelectorAll(`.dl a[data-os="${os}"]`).forEach((el) => el.classList.add('is-current'));
  document.querySelectorAll('[data-os-name]').forEach((el) => { el.textContent = os === 'android' ? 'Android 版' : os === 'macos' ? 'macOS 版' : os === 'windows' ? 'Windows 版' : '最新版本'; });
}

async function copyButtons() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        const old = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(() => { btn.textContent = old; }, 1400);
      } catch {}
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('lines');
  if (canvas) lineField(canvas);
  observeReveals();
  detectPlatform();
  void copyButtons();
  void initMarket();
});
