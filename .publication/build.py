from pathlib import Path
import json,shutil,hashlib
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--sources',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
ROOT=Path(__file__).resolve().parent;SOURCES=args.sources;OUTPUT=args.output
CHUNK=20*1024*1024
SEPARATE_PUBLISHES={'alancast','autokitch','highline','nakit'}
NOVOKITCH_ROUTES={'autokitch','digital-twin','film-studyo','montaj','pin-film'}
def copy_source(repo,destination):
 source=SOURCES/repo
 for item in source.rglob('*'):
  if not item.is_file():continue
  rel=item.relative_to(source);posix=rel.as_posix()
  if any(x.startswith('.') for x in rel.parts) or item.name=='CNAME':continue
  if repo=='kk-archive' and rel.parts[0].casefold() in SEPARATE_PUBLISHES | NOVOKITCH_ROUTES:continue
  target=destination/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(item,target)


def compile_cloudflare(site):
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
 (site/'_headers').write_text('/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n','utf8')
 return videos


if OUTPUT.exists():raise RuntimeError('Output directory already exists')
OUTPUT.mkdir(parents=True)
copy_source('kk-archive',OUTPUT)
for dependency in ['alancast','highline','nakit']:
 copy_source(dependency,OUTPUT/dependency)
compile_cloudflare(OUTPUT)
files=[x for x in OUTPUT.rglob('*') if x.is_file()]
assert all(x.stat().st_size<=25*1024*1024 for x in files)
assert not any(x.name.startswith('.') for x in files)
assert not any((OUTPUT / route).exists() for route in NOVOKITCH_ROUTES)
print('Compiled public website:',len(files),'files; NOVOKITCH publication excluded.')
