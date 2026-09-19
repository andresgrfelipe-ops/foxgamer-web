(() => {
 const root=document.querySelector('.game-gallery');if(!root)return;
 const get=id=>document.getElementById(id),form=get('gallery-search'),query=get('gallery-query'),platform=get('gallery-platform'),condition=get('gallery-condition'),sort=get('gallery-sort'),grid=get('gallery-grid'),count=get('gallery-count'),more=get('gallery-more');
 const cards=Array.from(grid.querySelectorAll('[data-game-card]'));let limit=12;
 const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 function render(){
  const terms=norm(query.value.replace(/\bgta\b/gi,'Grand Theft Auto').replace(/\bcod\b/gi,'Call of Duty')).split(' ').filter(Boolean);
  const candidates=cards.filter(c=>(!condition.value||c.dataset.condition===condition.value)&&(!platform.value||c.dataset.platform===platform.value)&&terms.every(t=>norm(c.dataset.name).includes(t)));
  const seen=new Set();const matches=candidates.filter(c=>{if(seen.has(c.dataset.name))return false;seen.add(c.dataset.name);return true;});
  matches.sort((a,b)=>sort.value==='price-asc'?Number(a.dataset.price)-Number(b.dataset.price):sort.value==='price-desc'?Number(b.dataset.price)-Number(a.dataset.price):sort.value==='name'?a.dataset.name.localeCompare(b.dataset.name,'es'):Number(a.dataset.rank)-Number(b.dataset.rank));
  cards.forEach(c=>{c.hidden=true;});matches.forEach((c,i)=>{grid.append(c);c.hidden=i>=limit;});
  count.textContent=matches.length+(matches.length===1?' juego · ':' juegos · ')+(condition.value||'Todas las condiciones')+(platform.value?' · '+platform.value:'');more.hidden=matches.length<=limit;get('gallery-empty').hidden=matches.length>0;
 }
 function update(){limit=12;render();}
 function reset(){query.value='';platform.value='';condition.value='';sort.value='featured';update();}
 form.addEventListener('submit',e=>{e.preventDefault();update();});query.addEventListener('input',update);[platform,condition,sort].forEach(el=>el.addEventListener('change',update));get('gallery-reset').addEventListener('click',reset);get('gallery-empty-reset').addEventListener('click',reset);more.addEventListener('click',()=>{limit+=12;render();});render();
})();
