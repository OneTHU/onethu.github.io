#!/usr/bin/env python3
"""Check assembled static HTML resources, pages and local fragments without external requests."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else '.pages').resolve()
class Page(HTMLParser):
 def __init__(self,text):super().__init__();self.links=[];self.ids=set();self.feed(text)
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if attrs.get('id'):self.ids.add(attrs['id'])
  if tag=='a' and attrs.get('name'):self.ids.add(attrs['name'])
  for name in ('href','src','poster'):
   if name in attrs:self.links.append((tag,name,attrs[name]))
pages={p:Page(p.read_text()) for p in root.rglob('*.html') if not p.name.startswith('._')};failures=[];checked=0
for file,page in pages.items():
 for tag,attr,value in page.links:
  parsed=urlsplit(value)
  if parsed.scheme and not (parsed.scheme in {'http','https'} and parsed.netloc=='onethu.github.io'):continue
  if parsed.netloc and parsed.netloc!='onethu.github.io':continue
  path=unquote(parsed.path)
  if not path:target=file
  elif path.startswith('/'):target=root/path.lstrip('/')
  else:target=file.parent/path
  target=target.resolve()
  if target.is_dir():target=target/'index.html'
  if not target.exists():failures.append({'page':str(file.relative_to(root)),'link':value,'reason':'missing target'});continue
  if parsed.fragment and target in pages and unquote(parsed.fragment) not in pages[target].ids:failures.append({'page':str(file.relative_to(root)),'link':value,'reason':'missing fragment'})
  checked+=1
print(json.dumps({'pages':len(pages),'checked':checked,'failures':failures},ensure_ascii=False,indent=2))
raise SystemExit(bool(failures))
