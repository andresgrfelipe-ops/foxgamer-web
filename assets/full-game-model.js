(function(root){
 const normalize=value=>String(value).replace(/Δ/g,'Delta').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const key=g=>g.platform+'|'+normalize(g.title);
 function mergeEntries(storeEntries,directory){const known=new Set(storeEntries.map(key));return [...storeEntries,...directory.filter(g=>!known.has(key(g))).map(g=>({...g,variants:(g.offers||[]).filter(o=>o.title===g.title&&o.platform===g.platform&&o.currency==='COP'&&Number.isSafeInteger(o.price)&&o.price>0&&['Nuevo','Usado'].includes(o.condition)&&o.format==='Físico'),reference:true}))];}
 function selectEntries(entries,{query='',platform='',condition='',verified=false,sort='featured'}={}){
  const words=normalize(query.replace(/\bgta\b/gi,'Grand Theft Auto').replace(/\bcod\b/gi,'Call of Duty')).split(' ').filter(Boolean),matches=[];
  for(const g of entries){
   if(platform&&g.platform!==platform)continue;if(!words.every(w=>normalize(g.title+' '+g.platform).includes(w)))continue;
   const variant=condition?g.variants.find(v=>v.condition===condition):(g.variants.find(v=>v.condition==='Nuevo')||g.variants[0]);
   if((condition||verified)&&!variant)continue;matches.push({...g,variant});
  }
  return matches.sort((a,b)=>{
   if(sort==='name')return a.title.localeCompare(b.title,'es')||a.platform.localeCompare(b.platform);
   if(sort==='price-asc'||sort==='price-desc'){if(!a.variant||!b.variant)return Number(!a.variant)-Number(!b.variant);return (a.variant.price-b.variant.price)*(sort==='price-desc'?-1:1)||a.title.localeCompare(b.title,'es');}
   return Number(!a.variant)-Number(!b.variant)||Number(!!a.reference)-Number(!!b.reference)||Number(!a.cover)-Number(!b.cover)||(a.rank??9999)-(b.rank??9999)||a.title.localeCompare(b.title,'es')||a.platform.localeCompare(b.platform);
  });
 }
 function validCover(g){const c=g.cover;if(!c||c.title!==g.title||c.platform!==g.platform)return false;if(/^\/assets\/photos\/[a-z0-9-]+\.(jpg|png|webp)$/.test(c.image))return c.kind==='reference-cover';if(c.kind!=='catalog-reference-cover'||!/^[a-f0-9]{64}$/.test(c.sha256||''))return false;try{const u=new URL(c.image);if(u.protocol!=='https:')return false;const paths={'PS2':'Sony - PlayStation 2','PS3':'Sony - PlayStation 3','PS4':'Sony - PlayStation 4','Xbox 360':'Microsoft - Xbox 360'};if(c.provider==='libretro')return u.hostname==='thumbnails.libretro.com'&&decodeURIComponent(u.pathname)==='/'+paths[g.platform]+'/Named_Boxarts/'+c.sourceId;if(c.provider==='gametdb')return g.platform==='PS3'&&u.hostname==='art.gametdb.com'&&new RegExp('^/ps3/cover/(US|EN|JA)/'+c.sourceId+'\\.jpg$').test(u.pathname);if(c.provider==='x360db')return g.platform==='Xbox 360'&&(/^[A-F0-9]{8}$/.test(c.sourceId))&&((u.hostname==='raw.githubusercontent.com'&&u.pathname==='/xenia-manager/x360db/main/titles/'+c.sourceId+'/artwork/boxart.jpg')||(u.hostname==='download.xbox.com'&&u.pathname.toLowerCase().includes(c.sourceId.toLowerCase())&&u.pathname.endsWith('/boxartlg.jpg')));if(c.provider==='gamer4ever')return ['PS4','PS5'].includes(g.platform)&&u.hostname==='cdn.shopify.com'&&u.pathname.startsWith('/s/files/1/0222/9685/4608/');return false;}catch{return false;}}
 root.FoxGameDirectory={normalize,mergeEntries,selectEntries,validCover};
})(globalThis);
