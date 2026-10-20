from pathlib import Path
import json,shutil,hashlib,re
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--sources',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
ROOT=Path(__file__).resolve().parent;SOURCES=args.sources;OUTPUT=args.output
CHUNK=20*1024*1024
PRIVATE=('._local/','_local/','arastirma/','uretim/','supplier-review/','otonom/hat/','otonom/hat3d/','otonom/birlesik/','otonom/kaset3d/','otonom/elektrik/','otonom/onizleme-9eki/')
DENIED={'.glb','.gltf','.stp','.step','.stl','.obj','.mtl','.iges','.igs','.sldprt','.sldasm','.fcstd','.blend','.fbx','.dae','.3dm','.dxf','.dwg','.bin','.zip','.scl','.st','.awl','.lad','.fbd','.zap','.ap17','.ap18','.ap19','.db','.sqlite','.sqlite3'}
def copy_source(repo,destination):
 source=SOURCES/repo
 for item in source.rglob('*'):
  if not item.is_file():continue
  rel=item.relative_to(source);posix=rel.as_posix()
  if any(x.startswith('.') for x in rel.parts) or item.name=='CNAME':continue
  if repo=='kk-archive' and rel.parts[0] in {'alancast','autokitch','highline','nakit'}:continue
  if repo=='autokitch' and (posix.startswith(PRIVATE) or item.suffix.lower()in DENIED or '.glb.'in item.name.lower()):continue
  target=destination/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(item,target)
 if repo=='autokitch':
  for name in PRIVATE:
   if not name.startswith('otonom/'):continue
   target=destination/name/'index.html';target.parent.mkdir(parents=True,exist_ok=True)
   target.write_text('<html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/digital-twin/"></head><body><a href="/digital-twin/">AUTOKITCH Digital Twin</a></body></html>','utf8')
def compile_cloudflare(site):
 for suffix in ['', 'e-taslak/']:
  file=site/'digital-twin'/suffix/'index.html'
  text=file.read_text('utf8')
  old="const registry='https://api.github.com/repos/kursatkemalkul/kk-archive/contents/digital-twin/"+suffix+"live.json';"
  assert old in text
  text=text.replace(old,"const registry='/digital-twin/"+suffix+"live.json';")
  text=text.replace("registry+'?ref=main&v='","registry+'?v='")
  olddecode="const j=await r.json();record=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(j.content),c=>c.charCodeAt(0))));"
  assert olddecode in text;text=text.replace(olddecode,'record=await r.json();')
  file.write_text(text,'utf8')
 videos={}
 for file in list(site.rglob('*')):
  if not file.is_file() or file.stat().st_size<=25*1024*1024:continue
  assert file.suffix=='.mp4','Unexpected oversized file: '+str(file)
  sha=hashlib.sha256(file.read_bytes()).hexdigest();parts=[];size=file.stat().st_size
  with file.open('rb')as source:
   i=0
   while chunk:=source.read(CHUNK):
    rel=Path('_media_parts')/sha/(str(i)+'.part');target=site/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(chunk);parts.append('/'+rel.as_posix());i+=1
  videos['/'+file.relative_to(site).as_posix()]={'size':size,'sha256':sha,'chunkSize':CHUNK,'parts':parts}
  file.unlink()
 worker=(ROOT/'video-worker.template.js').read_text('utf8').replace('__VIDEO_MANIFEST__',json.dumps(videos,separators=(',',':')))
 (site/'_worker.js').write_text(worker,'utf8')
 (site/'_routes.json').write_text(json.dumps({'version':1,'include':list(videos),'exclude':[]}),'utf8')
 (site/'_headers').write_text('/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/digital-twin/live.json\n  Cache-Control: no-store\n/digital-twin/e-taslak/live.json\n  Cache-Control: no-store\n','utf8')
 return videos


if OUTPUT.exists():raise RuntimeError('Output directory already exists')
OUTPUT.mkdir(parents=True)
copy_source('kk-archive',OUTPUT)
for dependency in ['alancast','autokitch','highline','nakit']:
 copy_source(dependency,OUTPUT/dependency)
compile_cloudflare(OUTPUT)
files=[x for x in OUTPUT.rglob('*') if x.is_file()]
assert all(x.stat().st_size<=25*1024*1024 for x in files)
assert not any(x.name.startswith('.') for x in files)
print('Compiled public website:',len(files),'files; private engineering files excluded.')
