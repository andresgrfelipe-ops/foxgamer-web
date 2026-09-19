const photoDialog=document.querySelector('#photo-dialog');
if(photoDialog && typeof photoDialog.showModal==='function'){
 let photoTrigger;
 const image=photoDialog.querySelector('#photo-dialog-image');
 const title=photoDialog.querySelector('#photo-dialog-title');
 document.querySelectorAll('[data-gallery-image]').forEach(link=>{
  link.addEventListener('click',event=>{
   event.preventDefault();photoTrigger=link;
   image.src=link.href;image.alt=link.querySelector('img').alt;
   title.textContent=link.closest('figure').querySelector('h3').textContent;
   photoDialog.showModal();
  });
 });
 photoDialog.querySelector('.dialog-close').addEventListener('click',()=>photoDialog.close());
 photoDialog.addEventListener('click',event=>{
  if(event.target===photoDialog){
   const rect=photoDialog.getBoundingClientRect();
   if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)photoDialog.close();
  }
 });
 photoDialog.addEventListener('close',()=>photoTrigger?.focus());
}
