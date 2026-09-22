/* ============================================================
   OneTHU 站点交互
   ① 首屏/页头几何背景（canvas：方框 + 圆 + 斜线交叉的格网，叠贯穿长线与一条蓝色弧；
      指针视差、DPR≤2、离屏暂停，prefers-reduced-motion 时只画静态一帧）
   ② 插件市场：拉 OneTHU-Market 的 registry.json（GitHub contents API 优先、raw 兜底），
      补齐各仓库 star 数（sessionStorage 缓存 10 分钟），按分类/搜索过滤
   ③ 滚动显现、平台识别、复制按钮
   ============================================================ */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MARKET_REPO = 'smartThise/OneTHU-Market';
const REGISTRY_PATHS = ['registry.json'];

/* ── ① 几何交织背景 ──
   一张缓慢转动的格网：每格随机是「方框 / 圆 / 斜线交叉」，再叠几条贯穿画面的长线。
   交点处提亮、指针附近的单元被推开（视差），整体只走发丝线 + 少量品牌蓝。 */
function latticeField(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, raf = 0, running = false, t0 = 0;
  let px = -1e4, py = -1e4, pointerActive = false;
  const CELL = 104;          // 格距（px，CSS 单位）
  let cols = 0, rows = 0, cells = [];

  /* 每格一个固定「造型」，用确定性伪随机（同一次加载里稳定，不闪） */
  function buildCells() {
    cols = Math.ceil(w / CELL) + 2;
    rows = Math.ceil(h / CELL) + 2;
    cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const n = (r * 73856093) ^ (c * 19349663);
        const kind = ((n >>> 3) % 5);              // 0-1 方框 / 2 圆 / 3 斜线 / 4 空
        const spin = (((n >>> 7) % 100) / 100) * 0.6 - 0.3;
        const accent = ((n >>> 11) % 7) === 0;     // 少量蓝色单元
        cells.push({ r, c, kind, spin, accent, seed: ((n >>> 5) % 1000) / 1000 });
      }
    }
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildCells();
  }

  const INK = 'rgba(15,17,21,';
  const BLUE = 'rgba(65,118,230,';

  function unit(cell, t) {
    const cx = (cell.c - 0.5) * CELL;
    const cy = (cell.r - 0.5) * CELL;
    /* 视差：指针附近单元被推开一点，营造“交织在动”的手感 */
    let dx = 0, dy = 0;
    if (pointerActive) {
      const ox = cx - px, oy = cy - py;
      const d2 = ox * ox + oy * oy;
      const push = Math.exp(-d2 / (CELL * CELL * 3.2)) * 14;
      const len = Math.sqrt(d2) || 1;
      dx = (ox / len) * push; dy = (oy / len) * push;
    }
    return { x: cx + dx, y: cy + dy };
  }

  function draw(now) {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    for (const cell of cells) {
      if (cell.kind === 4) continue;
      const { x, y } = unit(cell, t);
      const half = CELL * 0.34;
      const breathe = 1 + 0.06 * Math.sin(t * 0.5 + cell.seed * 6.28);
      const col = cell.accent ? BLUE : INK;
      const alpha = cell.accent ? 0.46 : 0.17 + 0.05 * Math.sin(t * 0.4 + cell.seed * 9);
      ctx.strokeStyle = col + alpha.toFixed(3) + ')';

      if (cell.kind <= 1) {
        /* 方框：缓慢自转 */
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(cell.spin * 0.35 + Math.sin(t * 0.22 + cell.seed * 6.28) * 0.05);
        const s = half * breathe;
        ctx.strokeRect(-s, -s, s * 2, s * 2);
        if (cell.kind === 0 && cell.accent) {
          ctx.fillStyle = BLUE + '0.10)';
          ctx.fillRect(-s, -s, s * 2, s * 2);
        }
        ctx.restore();
      } else if (cell.kind === 2) {
        /* 圆：半径呼吸 + 直径线，与相邻方框形成交织感 */
        ctx.beginPath();
        ctx.arc(x, y, half * breathe * 0.92, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - half * 1.5, y); ctx.lineTo(x + half * 1.5, y);
        ctx.strokeStyle = col + (alpha * 0.75).toFixed(3) + ')';
        ctx.stroke();
      } else {
        /* 斜线交叉（X） */
        ctx.beginPath();
        ctx.moveTo(x - half, y - half); ctx.lineTo(x + half, y + half);
        ctx.moveTo(x + half, y - half); ctx.lineTo(x - half, y + half);
        ctx.stroke();
      }
    }

    /* 贯穿画面的长线：与格网交叉，交点提亮 */
    const lines = [
      { y: h * 0.22, slope: 0.12, a: 0.16 },
      { y: h * 0.52, slope: -0.18, a: 0.13 },
      { y: h * 0.80, slope: 0.08, a: 0.16 },
    ];
    for (const [i, ln] of lines.entries()) {
      const shift = Math.sin(t * 0.18 + i) * 16;
      ctx.strokeStyle = INK + ln.a + ')';
      ctx.beginPath();
      ctx.moveTo(-40, ln.y + shift + ln.slope * -40);
      ctx.lineTo(w + 40, ln.y + shift + ln.slope * (w + 40));
      ctx.stroke();
    }
    /* 一个缓慢移动的蓝色圆弧：唯一的“活物” */
    const ax = w * (0.5 + 0.34 * Math.sin(t * 0.09));
    const ay = h * (0.5 + 0.22 * Math.cos(t * 0.12));
    ctx.strokeStyle = BLUE + '0.40)';
    ctx.beginPath();
    ctx.arc(ax, ay, 86, t * 0.3, t * 0.3 + Math.PI * 1.25);
    ctx.stroke();
  }

  function frame(now) { if (!running) return; draw(now); raf = requestAnimationFrame(frame); }
  function start() { if (running || REDUCED) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  if (REDUCED) draw(t0 = performance.now()); else start();
  addEventListener('resize', () => { resize(); if (REDUCED) draw(performance.now()); });
  addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const inside = e.clientY > rect.top - 160 && e.clientY < rect.bottom + 160;
    pointerActive = inside;
    px = e.clientX - rect.left; py = e.clientY - rect.top;
  });
  addEventListener('pointerleave', () => { pointerActive = false; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop(); }, { threshold: 0 }).observe(canvas);
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

/* ── ④ 界面横滑轨道：scroll-snap + 鼠标拖拽 + 箭头 / 进度条 / 计数 ── */
function initShotRail() {
  const rail = document.getElementById('shots-rail');
  if (!rail) return;
  const bar = document.getElementById('rail-bar');
  const count = document.getElementById('rail-count');
  const prev = document.getElementById('rail-prev');
  const next = document.getElementById('rail-next');
  const n = rail.children.length;

  function sync() {
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const x = Math.min(Math.max(0, rail.scrollLeft), max);
    if (bar) {
      bar.style.width = (rail.clientWidth / rail.scrollWidth * 100) + '%';
      bar.style.marginLeft = (x / rail.scrollWidth * 100) + '%';
    }
    if (count) {
      const gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 16;
      const step = rail.children[0].offsetWidth + gap;
      const i = Math.round(x / step) + 1;
      count.textContent = String(Math.min(n, Math.max(1, i))).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    }
    if (prev) prev.disabled = x <= 2;
    if (next) next.disabled = x >= max - 2;
  }
  function page(dir) {
    rail.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: REDUCED ? 'auto' : 'smooth' });
  }
  prev?.addEventListener('click', () => page(-1));
  next?.addEventListener('click', () => page(1));
  rail.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); page(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); page(-1); }
  });
  let raf = 0;
  rail.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
  addEventListener('resize', sync);

  /* 鼠标按住拖拽（触摸板 / 触屏走原生滚动） */
  let down = null, moved = 0;
  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = { x: e.clientX, left: rail.scrollLeft };
    moved = 0;
    rail.classList.add('dragging');
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    moved = Math.max(moved, Math.abs(dx));
    rail.scrollLeft = down.left - dx;
  });
  addEventListener('pointerup', () => { down = null; rail.classList.remove('dragging'); });
  rail.addEventListener('click', (e) => {
    if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  sync();
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bg');
  if (canvas) latticeField(canvas);
  observeReveals();
  detectPlatform();
  void copyButtons();
  void initMarket();
  initShotRail();
});
