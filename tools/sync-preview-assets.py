#!/usr/bin/env python3
"""Publish only approved fictional captures; verify provenance before re-encoding."""
import hashlib,json,pathlib,subprocess,sys,shutil
root=pathlib.Path(__file__).resolve().parents[1]
source=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '../OneTHU/docs/assets/0.11').resolve()
manifest=json.loads((source/'manifest.json').read_text())
assert manifest.get('passed') and manifest.get('naturalCleanup') and manifest.get('externalRequestsSent')==0, 'Capture acceptance and network isolation must pass'
video_manifest=json.loads((source/'manifest-vault-drag.json').read_text())
assert video_manifest.get('passed'), 'Drag recording acceptance must pass'
entries=manifest['entries']
assert len(entries)>=16 and len({p['file'] for p in entries})==len(entries)
for entry in entries:
 assert pathlib.Path(entry['file']).name==entry['file'] and entry['file'].endswith('.png')
 assert hashlib.sha256((source/entry['file']).read_bytes()).hexdigest()==entry['sha256'],entry['file']+' provenance mismatch'
video_hash=next(f['sha256'] for f in video_manifest['files'] if f['file']=='vault-drag.mp4')
assert hashlib.sha256((source/'vault-drag.mp4').read_bytes()).hexdigest()==video_hash
# Never pick up an arbitrary PNG dropped into the folder; use manifest entries only.
dest=root/'assets/preview';dest.mkdir(exist_ok=True);files=[]
for entry in sorted(entries,key=lambda p:p['file']):
 path=source/entry['file'];target=dest/(path.stem+'.webp')
 subprocess.run(['cwebp','-quiet','-q','85',str(path),'-o',str(target)],check=True)
 files.append({'file':target.name,'source':path.name,'sourceSha256':entry['sha256'],'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
shutil.copyfile(source/'vault-drag.mp4',dest/'vault-drag.mp4');files.append({'file':'vault-drag.mp4','sha256':video_hash})
approved={f['file'] for f in files}
for path in dest.glob('*.webp'):
 if path.name not in approved:path.unlink()
(dest/'manifest.json').write_text(json.dumps({'version':'0.11.0','data':'fictional only; isolated browser contexts; no school account','files':files},ensure_ascii=False,indent=2)+'\n')
print('Published',len(files),'approved fictional preview assets')
