
window.addEventListener('load',()=>document.querySelector('.loader')?.classList.add('hide'));
const menu=document.querySelector('.menu'); const nav=document.querySelector('.nav'); if(menu) menu.addEventListener('click',()=>nav.classList.toggle('open'));
const main=document.querySelector('[data-main-image]'); const thumbs=[...document.querySelectorAll('[data-thumb]')];
let idx=0; const gallery=thumbs.map(t=>t.dataset.src);
function setImage(i){if(!main||!gallery.length)return;idx=(i+gallery.length)%gallery.length;main.src=gallery[idx];thumbs.forEach((t,n)=>t.classList.toggle('active',n===idx));}
thumbs.forEach((t,i)=>t.addEventListener('click',()=>setImage(i)));
const lb=document.querySelector('.lightbox'); if(lb){const img=lb.querySelector('img'); document.querySelector('.main-image')?.addEventListener('click',()=>{img.src=gallery[idx];lb.classList.add('open')}); lb.querySelector('.lb-close')?.addEventListener('click',()=>lb.classList.remove('open')); lb.querySelector('.lb-prev')?.addEventListener('click',()=>{setImage(idx-1);img.src=gallery[idx]}); lb.querySelector('.lb-next')?.addEventListener('click',()=>{setImage(idx+1);img.src=gallery[idx]}); document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')lb.classList.remove('open');if(e.key==='ArrowLeft'){setImage(idx-1);img.src=gallery[idx]}if(e.key==='ArrowRight'){setImage(idx+1);img.src=gallery[idx]}})}
