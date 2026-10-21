const reduced=matchMedia('(prefers-reduced-motion: reduce)');
for(const grid of document.querySelectorAll('.mode-grid')){
 const tabs=[...document.querySelectorAll('.mode-tabs [role=tab]')],panels=[...grid.children];
 const select=tab=>{for(const item of tabs){const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active;}};
 grid.classList.add('enhanced');select(tabs.find(tab=>tab.getAttribute('aria-selected')==='true')||tabs[0]);
 for(const tab of tabs){tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let i=tabs.indexOf(tab);if(e.key==='ArrowRight')i=(i+1)%tabs.length;else if(e.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();select(tabs[i]);tabs[i].focus();});}
}
for(const link of document.querySelectorAll('[data-language]'))link.addEventListener('click',()=>{try{localStorage.setItem('onethu.site.language',link.lang);}catch{}});
for(const video of document.querySelectorAll('video[data-demo]')){
 const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&!reduced.matches){video.play().catch(()=>{});}else video.pause();},{threshold:.2});observer.observe(video);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
 reduced.addEventListener('change',()=>{if(reduced.matches)video.pause();});
}
const studio=document.querySelector('[data-studio]');
if(studio&&!reduced.matches){const watcher=new IntersectionObserver(async([entry])=>{if(!entry.isIntersecting)return;watcher.disconnect();try{const module=await import('./studio.js');await module.mountStudio(studio);}catch{studio.classList.remove('is-ready');}},{rootMargin:'200px'});watcher.observe(studio);}
const market=document.querySelector('#market-grid');
if(market){
 const en=document.documentElement.lang==='en',status=document.querySelector('#market-status'),input=document.querySelector('#market-search'),filters=document.querySelector('#market-filters');
 const label=(zh,english)=>en?english:zh;
 const load=async()=>{
  for(const url of ['https://api.github.com/repos/smartThise/OneTHU-Market/contents/registry.json','https://raw.githubusercontent.com/smartThise/OneTHU-Market/main/registry.json'])try{const response=await fetch(url,{headers:{Accept:'application/vnd.github.raw'},signal:AbortSignal.timeout(10000)});if(response.ok)return await response.json();}catch{}
  throw new Error('Registry unavailable');
 };
 load().then(registry=>{
  const items=(Array.isArray(registry)?registry:registry.plugins||registry.list||[]).map(p=>{const repo=String(p.repo||p.repository||'').replace(/^https?:\/\/github\.com\//,'').replace(/\.git$/,'');const category=String(p.category||p.kind||((p.tags||[]).includes('主题')||/theme/i.test(p.id+repo)?'theme':/plugin-hello/i.test(repo)?'official':'community'));return {name:String(p.name||p.title||repo),description:String(p.description||p.desc||''),author:String(p.author||repo.split('/')[0]||''),version:String(p.version||''),category,url:/^[\w.-]+\/[\w.-]+$/.test(repo)?'https://github.com/'+repo:'https://github.com/smartThise/OneTHU-Market'};});
  let category='all';const categories=['all',...new Set(items.map(p=>p.category))];const labels={all:label('全部','All'),theme:label('主题','Themes'),official:label('官方示例','Official examples'),community:label('社区','Community'),plugin:label('插件','Plugins'),tool:label('工具','Tools')};
  function render(){const query=input.value.trim().toLowerCase(),visible=items.filter(p=>(category==='all'||p.category===category)&&`${p.name} ${p.description} ${p.author}`.toLowerCase().includes(query));market.replaceChildren();status.textContent=visible.length?`${visible.length} ${label('个插件','plugins')}`:label('没有匹配的插件。','No matching plugins.');for(const p of visible){const card=document.createElement('article');card.className='card';const title=document.createElement('h3'),a=document.createElement('a');a.href=p.url;a.textContent=p.name+' ↗';title.append(a);const description=document.createElement('p');description.textContent=p.description||label('暂无描述','No description');const meta=document.createElement('small');meta.textContent=[p.author,p.version?'v'+p.version:'',labels[p.category]||p.category].filter(Boolean).join(' · ');card.append(title,description,meta);market.append(card);}}
  for(const cat of categories){const b=document.createElement('button');b.type='button';b.textContent=labels[cat]||cat;b.setAttribute('aria-pressed',String(cat==='all'));b.addEventListener('click',()=>{category=cat;for(const item of filters.children)item.setAttribute('aria-pressed',String(item===b));render();});filters.append(b);}input.addEventListener('input',render);render();
 }).catch(()=>{status.textContent=label('插件目录暂时无法加载（网络或 GitHub 限额），请使用上方注册表入口。','The registry is unavailable (network or GitHub quota). Use the registry link above.');});
}
