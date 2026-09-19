(function(root){
 const normalize=value=>String(value).replace(/Δ/g,'Delta').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const key=g=>g.platform+'|'+normalize(g.title);
 function mergeEntries(storeEntries,directory){const known=new Set(storeEntries.map(key));return [...storeEntries,...directory.filter(g=>!known.has(key(g))).map(g=>({...g,variants:[],reference:true}))];}
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
   return Number(!a.variant)-Number(!b.variant)||Number(!a.cover)-Number(!b.cover)||(a.rank??9999)-(b.rank??9999)||a.title.localeCompare(b.title,'es')||a.platform.localeCompare(b.platform);
  });
 }
 root.FoxGameDirectory={normalize,mergeEntries,selectEntries};
})(globalThis);
