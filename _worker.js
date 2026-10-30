const VIDEOS = {"/video/aion-ssr-interior.mp4":{"size":45847075,"sha256":"dba46e0f954a10a8d340e475812443ee284cc9db5e53b53caadf4d01a6cee2e0","chunkSize":20971520,"parts":["/_media_parts/dba46e0f954a10a8d340e475812443ee284cc9db5e53b53caadf4d01a6cee2e0/0.part","/_media_parts/dba46e0f954a10a8d340e475812443ee284cc9db5e53b53caadf4d01a6cee2e0/1.part","/_media_parts/dba46e0f954a10a8d340e475812443ee284cc9db5e53b53caadf4d01a6cee2e0/2.part"]},"/video/gove.mp4":{"size":47820530,"sha256":"0eeb5ce7ccfb9f0613efc2a494828fc13e96f2f41ec87a4b50ee022ce1878af1","chunkSize":20971520,"parts":["/_media_parts/0eeb5ce7ccfb9f0613efc2a494828fc13e96f2f41ec87a4b50ee022ce1878af1/0.part","/_media_parts/0eeb5ce7ccfb9f0613efc2a494828fc13e96f2f41ec87a4b50ee022ce1878af1/1.part","/_media_parts/0eeb5ce7ccfb9f0613efc2a494828fc13e96f2f41ec87a4b50ee022ce1878af1/2.part"]},"/video/airjet.mp4":{"size":36001529,"sha256":"42054dcaec4c3cf0338bbef7b3a1ff3e9ce05ff1a1a477464e369813a901d3b8","chunkSize":20971520,"parts":["/_media_parts/42054dcaec4c3cf0338bbef7b3a1ff3e9ce05ff1a1a477464e369813a901d3b8/0.part","/_media_parts/42054dcaec4c3cf0338bbef7b3a1ff3e9ce05ff1a1a477464e369813a901d3b8/1.part"]}};

function selectRange(header, size) {
 if (!header) return {start:0,end:size-1,partial:false};
 const match=/^bytes=(\d*)-(\d*)$/.exec(header);
 if(!match||(!match[1]&&!match[2]))return null;
 let start,end;
 if(!match[1]){const count=Number(match[2]);if(!Number.isSafeInteger(count)||count<=0)return null;start=Math.max(0,size-count);end=size-1;}
 else{start=Number(match[1]);end=match[2]?Number(match[2]):size-1;}
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)return null;
 return {start,end:Math.min(end,size-1),partial:true};
}

export default {
 async fetch(request,env) {
  const url=new URL(request.url),video=VIDEOS[url.pathname];
  if(!video)return env.ASSETS.fetch(request);
  if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
  const etag='"'+video.sha256+'"';
  if(request.headers.get('If-None-Match')===etag)return new Response(null,{status:304,headers:{ETag:etag}});
  const range=request.headers.get('Range');
  const wanted=selectRange(request.headers.has('If-Range')&&request.headers.get('If-Range')!==etag?null:range,video.size);
  if(!wanted)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+video.size}});
  const headers=new Headers({'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':String(wanted.end-wanted.start+1),'Cache-Control':'public, max-age=86400','ETag':etag,'X-Content-Type-Options':'nosniff'});
  if(wanted.partial)headers.set('Content-Range',`bytes ${wanted.start}-${wanted.end}/${video.size}`);
  if(request.method==='HEAD')return new Response(null,{status:wanted.partial?206:200,headers});
  const first=Math.floor(wanted.start/video.chunkSize),last=Math.floor(wanted.end/video.chunkSize);
  let part=first,reader=null,skip=0,remaining=0;
  const stream=new ReadableStream({
   async pull(controller){
    try{while(true){
     if(!reader){
      if(part>last){controller.close();return;}
      const start=part===first?wanted.start-part*video.chunkSize:0;
      const end=part===last?wanted.end-part*video.chunkSize:Math.min(video.chunkSize,video.size-part*video.chunkSize)-1;
      const assetUrl=new URL(video.parts[part],url.origin);
      const asset=await env.ASSETS.fetch(new Request(assetUrl,{headers:{Range:`bytes=${start}-${end}`}}));
      if(!asset.ok||!asset.body)throw Error('Media segment unavailable');
      skip=asset.status===206?0:start;remaining=end-start+1;reader=asset.body.getReader();
     }
     const {done,value}=await reader.read();
     if(done){if(remaining)throw Error('Media segment truncated');reader=null;part++;continue;}
     let bytes=value;
     if(skip){const count=Math.min(skip,bytes.length);skip-=count;bytes=bytes.subarray(count);}
     if(!bytes.length)continue;
     bytes=bytes.subarray(0,Math.min(bytes.length,remaining));remaining-=bytes.length;
     if(!remaining){await reader.cancel();reader=null;part++;}
     controller.enqueue(bytes);return;
    }}catch(error){if(reader)await reader.cancel().catch(()=>{});controller.error(error);}
   },
   async cancel(){if(reader)await reader.cancel();}
  });
  return new Response(stream,{status:wanted.partial?206:200,headers});
 }
};
