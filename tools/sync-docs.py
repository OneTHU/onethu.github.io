#!/usr/bin/env python3
"""Assemble bilingual docs; resolve each link against its original file, not a global ../ regex."""
import os,re,shutil,sys
from pathlib import Path
from urllib.parse import urlsplit,unquote,quote
ROOT=Path(__file__).resolve().parents[1];DEST=ROOT/'docs-src'
REPO=os.environ.get('ONETHU_REPO_URL','https://github.com/smartThise/OneTHU');REF=os.environ.get('ONETHU_REF','dev3')
def skipped(path):return any(p.startswith('._') or p in {'.DS_Store','.git','.github','node_modules'} for p in path.parts)
def copy_tree(source,missing=False,all_files=False):
 # Publish every document, but only its linked artifacts and approved current captures.
 # Raw unreferenced test dumps, temporary captures and extraction catalogs stay in Git.
 paths=[p for p in source.rglob('*') if p.is_file() and not skipped(p.relative_to(source))]
 required={p.resolve() for p in paths if p.suffix=='.md'}
 for path in paths:
  if path.suffix!='.md':continue
  text=path.read_text()
  for value in re.findall(r'(?<=\]\()([^\s)]+)|(?:src|href)=["\']([^"\']+)',text):
   raw=next((v for v in value if v),'');url=urlsplit(raw.strip('<>'))
   if url.scheme or url.netloc or not url.path:continue
   target=(path.parent/unquote(url.path)).resolve()
   if target.is_relative_to(source):required.add(target)
 for path in paths:
  rel=path.relative_to(source)
  if not all_files and path.resolve() not in required and not rel.as_posix().startswith('assets/0.11/') and rel.as_posix() not in {'api-surface.json','contributors.json'}:continue
  target=DEST/rel
  if missing and target.exists():continue
  target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)

def public_url(path,fragment=''):
 rel=path.as_posix();rel='overview.md' if rel=='README.md' else rel
 if rel.endswith('.md'):rel=rel[:-3];rel=rel.removesuffix('/index').removesuffix('/README');rel=rel+'/'
 return 'https://onethu.github.io/docs/'+quote(rel,safe='/')+('#'+fragment if fragment else '')
def rewrite(text,relative):
 def destination(raw):
  angle=raw.startswith('<') and raw.endswith('>');value=raw[1:-1] if angle else raw
  url=urlsplit(value)
  if url.scheme or url.netloc or value.startswith(('/','#')):return raw
  normalized=Path(os.path.normpath(str(relative.parent/unquote(url.path))));parts=normalized.parts
  if parts and parts[0]=='..':
   target=Path(os.path.normpath(str(Path('docs')/normalized)))
   return REPO+'/blob/'+quote(REF,safe='')+'/'+quote(target.as_posix(),safe='/')+('#'+url.fragment if url.fragment else '')
  if parts and parts[0]=='en' and relative.parts[0]!='en':return public_url(normalized,url.fragment)
  if relative.parts[0]=='en':
   if not parts or parts[0]!='en':return public_url(normalized,url.fragment)
   return os.path.relpath(normalized,relative.parent)+('#'+url.fragment if url.fragment else '')
  if normalized.as_posix()=='README.md':return os.path.relpath('overview.md',relative.parent.as_posix())+('#'+url.fragment if url.fragment else '')
  return raw
 # Work on Markdown destinations and HTML image/source links. Keep link text and optional titles intact.
 text=re.sub(r'(?<=\]\()(<[^>]+>|[^\s)]+)',lambda m:destination(m.group()),text)
 text=re.sub(r'((?:src|href)=["\'])([^"\']+)(["\'])',lambda m:m[1]+destination(m[2])+m[3],text)
 return text
sources=[Path(p).resolve() for p in sys.argv[1:]]
if not sources or not sources[0].is_dir():raise SystemExit('Usage: sync-docs.py <main docs> [fallback docs]')
if DEST.exists():shutil.rmtree(DEST)
DEST.mkdir()
for index,source in enumerate(sources):
 if source.is_dir():copy_tree(source,missing=index>0)
copy_tree(ROOT/'docs-site',all_files=True)
for path in list(DEST.rglob('*.md')):
 rel=path.relative_to(DEST)
 if not skipped(rel):path.write_text(rewrite(path.read_text(),rel))
if (DEST/'README.md').exists():(DEST/'README.md').rename(DEST/'overview.md')
# English build has its own docs_dir; share only the theme assets, not another copy of large captures.
shutil.copytree(DEST/'assets',DEST/'en/assets',dirs_exist_ok=True,ignore=shutil.ignore_patterns('0.11','._*'))
(DEST/'en/license.md').write_text('# License and acknowledgments\n\n[中文](https://onethu.github.io/docs/license/) · English\n\nOneTHU is unofficial. Project-owned code uses MIT with non-commercial and no-attack restrictions. Third-party components have their own terms, including THU Info authorization and LearnX exceptions. Read the [full license]('+REPO+'/blob/'+REF+'/LICENSE) and [third-party terms]('+REPO+'/blob/'+REF+'/LICENSES/THIRD-PARTY.md) before use or redistribution.\n')
print('Assembled',sum(1 for p in DEST.rglob('*.md') if not skipped(p.relative_to(DEST))),'bilingual documentation pages')
