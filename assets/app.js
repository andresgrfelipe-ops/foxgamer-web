document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav-links');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
const form=document.querySelector('.filters');
if(form){
 const search=document.querySelector('#search'),category=document.querySelector('#category'),condition=document.querySelector('#condition'),sort=document.querySelector('#sort');
 const grid=document.querySelector('#product-grid'),items=[...grid.querySelectorAll('[data-product]')];
 const empty=document.querySelector('#empty-state'),count=document.querySelector('#result-count');
 const defaultCategory=category.value;
 const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
 function apply(){
  const query=normalize(search.value);
  const sorted=[...items].sort((a,b)=>{
   if(sort.value==='name')return a.dataset.name.localeCompare(b.dataset.name,'es');
   if(sort.value.startsWith('price-')){
    if(a.dataset.price===''&&b.dataset.price==='')return 0;
    if(a.dataset.price==='')return 1;
    if(b.dataset.price==='')return -1;
    return (Number(a.dataset.price)-Number(b.dataset.price))*(sort.value==='price-desc'?-1:1);
   }
   return items.indexOf(a)-items.indexOf(b);
  });
  let visible=0;
  sorted.forEach(item=>{
   item.hidden=!(normalize(item.dataset.name).includes(query)&&(!category.value||category.value===item.dataset.category)&&(!condition.value||condition.value===item.dataset.condition));
   if(!item.hidden)visible++;
   grid.append(item);
  });
  count.textContent=visible+' '+(visible===1?'producto':'productos');
  empty.hidden=visible>0;
  const params=new URLSearchParams();
  if(search.value)params.set('q',search.value);
  if(category.value&&category.value!==defaultCategory)params.set('categoria',category.value);
  if(condition.value)params.set('condicion',condition.value);
  if(sort.value!=='featured')params.set('orden',sort.value);
  const url=location.pathname+(params.size?'?'+params:'')+location.hash;
  history.replaceState(null,'',url);
 }
 function restore(){
  const params=new URLSearchParams(location.search);
  search.value=(params.get('q')||'').slice(0,100);
  for(const [el,key,fallback] of [[category,'categoria',defaultCategory],[condition,'condicion',''],[sort,'orden','featured']]){
   const value=params.get(key)||fallback;
   el.value=[...el.options].some(o=>o.value===value)?value:fallback;
  }
  apply();
 }
 form.addEventListener('submit',event=>{event.preventDefault();apply();});
 search.addEventListener('input',apply);
 [category,condition,sort].forEach(el=>el.addEventListener('change',()=>{
  // A category page contains only its own products. Navigate before switching categories.
  if(el===category&&defaultCategory&&category.value!==defaultCategory){
   const params=new URLSearchParams();
   if(search.value)params.set('q',search.value);
   if(condition.value)params.set('condicion',condition.value);
   if(sort.value!=='featured')params.set('orden',sort.value);
   location.href=(category.value?'/categorias/'+category.value+'/':'/')+(params.size?'?'+params:'')+'#productos';
  }else apply();
 }));
 document.querySelector('#reset-filters').addEventListener('click',()=>{form.reset();search.value='';category.value=defaultCategory;condition.value='';sort.value='featured';apply();search.focus();});
 window.addEventListener('popstate',restore);
 restore();
}
