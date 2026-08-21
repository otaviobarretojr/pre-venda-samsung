const base=(process.env.PRODUCTION_URL||'').replace(/\/$/,'');
const expected=process.env.EXPECTED_VERSION||'7.4.1';
if(!base)throw new Error('PRODUCTION_URL ausente');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function getJson(path){const r=await fetch(`${base}/${path}?verify=${Date.now()}`,{headers:{'cache-control':'no-cache'}});if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);return r.json()}
let last;
for(let attempt=1;attempt<=12;attempt++){
 try{
  const [v,h,index]=await Promise.all([getJson('version.json'),getJson('health.json'),fetch(`${base}/?verify=${Date.now()}`,{headers:{'cache-control':'no-cache'}})]);
  if(!index.ok)throw new Error(`index HTTP ${index.status}`);
  if(v.version!==expected||v.channel!=='stable'||v.published!==true)throw new Error(`version divergente: ${JSON.stringify(v)}`);
  if(h.version!==expected)throw new Error(`health divergente: ${h.version}`);
  console.log(JSON.stringify({ok:true,url:base,version:v.version,attempt}));process.exit(0);
 }catch(e){last=e;console.log(`tentativa ${attempt}/12: ${e.message}`);await sleep(5000)}
}
throw last||new Error('Falha de verificação de produção');
