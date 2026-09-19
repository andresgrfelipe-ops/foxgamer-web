(() => {
 const root=document.querySelector('.games-directory');if(!root)return;
 const form=document.querySelector('#games-search'),input=document.querySelector('#game-title'),platform=document.querySelector('#game-platform'),results=document.querySelector('#games-results'),count=document.querySelector('#games-count'),pagination=document.querySelector('#games-pagination'),prev=document.querySelector('#games-prev'),next=document.querySelector('#games-next'),pageLabel=document.querySelector('#games-page');
 const normalize=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 let entries=[],page=0,timer;const pageSize=24;
 function render(focus=false){
  const raw=input.value.trim();const query=normalize(raw.replace(/\bgta\b/gi,'Grand Theft Auto').replace(/\bcod\b/gi,'Call of Duty'));
  const terms=query.split(' ').filter(Boolean),matches=entries.filter(g=>(!platform.value||g.platform===platform.value)&&terms.every(t=>g.search.includes(t)));
  const pages=Math.max(1,Math.ceil(matches.length/pageSize));page=Math.min(page,pages-1);
  results.replaceChildren();
  for(const g of matches.slice(page*pageSize,(page+1)*pageSize)){
   const article=document.createElement('article');article.className='game-entry';const tag=document.createElement('span');tag.className='game-platform';tag.textContent=g.platform;const title=document.createElement('h3');title.textContent=g.title;
   const link=document.createElement('a');link.className='text-link';link.textContent='Consultar disponibilidad';link.target='_blank';link.rel='noopener noreferrer';link.href='https://wa.me/'+root.dataset.whatsapp+'?text='+encodeURIComponent('Hola FOX GAMER, quiero consultar '+g.title+' para '+g.platform+'. Confírmame formato, edición, región, precio y disponibilidad.');link.setAttribute('aria-label','Consultar '+g.title+' para '+g.platform+' por WhatsApp (abre otra pestaña)');article.append(tag,title,link);results.append(article);
  }
  count.textContent=matches.length?(page*pageSize+1)+'–'+Math.min((page+1)*pageSize,matches.length)+' de '+matches.length.toLocaleString('es-CO')+' títulos · consulta disponibilidad':'No encontramos ese título. Puedes consultarlo por WhatsApp.';
  pagination.hidden=matches.length<=pageSize;prev.disabled=page===0;next.disabled=page>=pages-1;pageLabel.textContent='Página '+(page+1)+' de '+pages;
  if(focus){count.tabIndex=-1;count.focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:'smooth'});}
 }
 form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(timer);page=0;render();});
 input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{page=0;render();},180);});
 platform.addEventListener('change',()=>{page=0;render();});
 form.addEventListener('reset',()=>{clearTimeout(timer);input.value='';platform.value='';page=0;render();});
 prev.addEventListener('click',()=>{page--;render(true);});next.addEventListener('click',()=>{page++;render(true);});
 fetch('/data/game-directory.json').then(r=>{if(!r.ok)throw Error('Unavailable');return r.json();}).then(data=>{
  entries=data.games.map(g=>({...g,search:normalize(g.title)}));
  const sources=document.querySelector('#games-sources');for(const source of data.sources){const a=document.createElement('a');a.textContent=source.platform+' · '+decodeURIComponent(source.url.split('/').pop()).replaceAll('_',' ');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';sources.append(a);}render();
 }).catch(()=>{count.textContent='El directorio no pudo cargar. Recarga la página o consulta tu juego por WhatsApp.';});
})();
