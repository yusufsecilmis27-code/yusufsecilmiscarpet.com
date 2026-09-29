(function(){
"use strict";
var S=document.currentScript,ROOT=S.dataset.root||"",D=window.YSC,C=D.config,P=D.products,TT=window.YSC_T;
var FK=["all","modern","klasik","polyester","sisal","tafting","iskandinav","kaymaz","spot"];
var lang="tr";try{lang=localStorage.getItem("ysc_lang")||"tr"}catch(e){}
if(!TT[lang])lang="tr";
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
function t(k){var v=TT[lang][k];return v!==undefined?v:(TT.tr[k]||"")}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
// WhatsApp numarası ve tüm iletişim bilgileri js/products.js içindeki YSC.config'ten yönetilir.
function wa(name){var m=name?t("wa_msg").replace("{p}",name):t("wa_gen");return"https://wa.me/"+C.whatsapp+"?text="+encodeURIComponent(m)}
function catLabel(p){return p.cat==="kilim"?t("kilim"):t("fl")[FK.indexOf(p.cat)]}
// Ürün açıklaması: önce ürünün kendi desc alanı (seçili dil), yoksa Türkçesi, o da yoksa genel metin.
function desc(p){var d=p.desc||{};return(d[lang]&&d[lang].trim())||(d.tr&&d.tr.trim())||t("gen_desc")}
function img(p,i,extra){return'<img src="'+ROOT+p.images[i]+'" alt="'+esc(p.name+" - "+t("gen_desc").replace(/\.$/,""))+'" width="800" height="600" loading="lazy" decoding="async" '+(extra||"")+'>'}
function card(p){var u=ROOT+"products/"+p.id+"/index.html";
return'<article class="card"><a class="im" data-name="'+esc(p.name)+'" href="'+u+'" tabindex="-1" aria-hidden="true">'+img(p,0)+'</a><div class="bd"><span class="cat">'+esc(catLabel(p))+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(desc(p))+'</p><div class="row"><a class="btn sm" href="'+u+'">'+t("view")+'</a><a class="btn sm wa" href="'+wa(p.name)+'" target="_blank" rel="noopener">'+t("info")+'</a></div></div></article>'}
var pages=["index.html","products.html","spot.html","wholesale.html","export.html","about.html","contact.html"];
function cur(){var f=location.pathname.split("/").filter(Boolean).pop()||"index.html";if(/\/products\/[^/]+\/?$/.test(location.pathname))f="products.html";return f}
var WAI='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11 19.900L3 29l6.300-2A13 13 0 1 0 16 3zm7.500 18.200c-.3.900-1.800 1.700-2.500 1.800-.6.100-1.500.100-2.400-.2-.6-.2-1.300-.4-2.200-.8-3.900-1.700-6.400-5.600-6.600-5.800-.2-.3-1.600-2.100-1.600-4s1-2.800 1.300-3.200c.3-.4.700-.5.900-.5h.7c.2 0 .5-.1.800.6l1 2.400c.1.200.1.400 0 .6l-.4.700-.5.600c-.2.200-.4.400-.2.800.2.400 1 1.600 2.100 2.600 1.400 1.200 2.600 1.600 3 1.800.4.200.6.100.8-.1l1.100-1.300c.3-.4.500-.3.900-.2l2.300 1.100c.4.200.6.300.7.500.1.200.1.900-.2 1.800z"/></svg>';
function chrome(){
var hd=$("#site-header"),ft=$("#site-footer"),c=cur();
if(hd)hd.outerHTML='<header class="hd"><div class="wrap"><a class="logo" href="'+ROOT+'index.html">YUSUF SEÇİLMİŞ<small>CARPET</small></a><nav class="nav" aria-label="Menu">'+pages.map(function(p,i){return'<a href="'+ROOT+p+'" data-nav="'+i+'"'+(p===c?' aria-current="page"':"")+'></a>'}).join("")+'</nav><div class="tools"><div class="lang" role="group" aria-label="Language">'+["tr","en","ar"].map(function(l){return'<button type="button" data-lang="'+l+'">'+l.toUpperCase()+'</button>'}).join("")+'</div><a class="btn sm wa" data-wa target="_blank" rel="noopener">'+t("wa")+'</a><button class="burger" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Menu"><span></span></button></div></div><div class="mnav" id="mnav">'+pages.map(function(p,i){return'<a href="'+ROOT+p+'" data-nav="'+i+'"></a>'}).join("")+'<a class="btn wa" data-wa target="_blank" rel="noopener"></a></div></header>';
if(ft)ft.outerHTML='<footer class="ft"><div class="wrap"><div class="cols"><div><a class="logo" href="'+ROOT+'index.html">YUSUF SEÇİLMİŞ<small>CARPET</small></a><p data-i18n="footer_p"></p></div><nav aria-label="Footer">'+pages.map(function(p,i){return'<a href="'+ROOT+p+'" data-nav="'+i+'"></a>'}).join("")+'</nav><div id="fcontact"></div></div><p class="cp" id="rights"></p></div></footer><a class="fab" data-wa target="_blank" rel="noopener" aria-label="WhatsApp">'+WAI+'</a>'}
function contactLinks(){var o=[];
if(C.phone)o.push('<a href="tel:'+esc(C.phone)+'">'+esc(C.phone)+'</a>');
if(C.email)o.push('<a href="mailto:'+esc(C.email)+'">'+esc(C.email)+'</a>');
if(C.address)o.push('<span>'+esc(C.address)+'</span>');
if(C.instagram)o.push('<a href="'+esc(C.instagram)+'" target="_blank" rel="noopener">Instagram</a>');
if(C.facebook)o.push('<a href="'+esc(C.facebook)+'" target="_blank" rel="noopener">Facebook</a>');
return o.join("")}
function chips(sel,onClick){var w=$(sel);if(!w)return;}
// ---- sayfa bölümleri ----
var state={f:"all",q:""};
function renderGrid(){var g=$("#grid");if(!g)return;var fixed=g.dataset.filter;
var f=fixed||state.f,q=state.q.toLowerCase();
var list=P.filter(function(p){return(f==="all"||p.f.indexOf(f)>-1)&&(!q||(p.name+" "+catLabel(p)+" "+desc(p)).toLowerCase().indexOf(q)>-1)});
g.innerHTML=list.length?list.map(card).join(""):'<p>'+t("none")+'</p>'}
function renderFilters(){var w=$("#filters");if(!w)return;
w.innerHTML=FK.map(function(k,i){return'<button type="button" data-f="'+k+'" aria-pressed="'+(state.f===k)+'">'+t("fl")[i]+'</button>'}).join("")}
function renderFeatured(){var g=$("#featured");if(g)g.innerHTML=g.dataset.ids.split(",").map(function(id){return P.filter(function(p){return p.id===id})[0]}).filter(Boolean).map(card).join("")}
function renderCats(){var w=$("#cats");if(w)w.innerHTML=FK.slice(1).map(function(k,i){return'<a class="btn ghost sm" href="'+ROOT+'products.html?f='+k+'">'+t("fl")[i+1]+'</a>'}).join(" ")}
var cur_i=0,pr=null;
function renderDetail(){var w=$("#detail");if(!w)return;pr=P.filter(function(p){return p.id===w.dataset.product})[0];if(!pr)return;
var v=pr.video?'<video class="vid" controls playsinline preload="metadata" src="'+ROOT+pr.video+'"></video>':"";
w.innerHTML='<div><button class="main-img" type="button" id="mainbtn" aria-label="Zoom">'+img(pr,cur_i,'fetchpriority="high"').replace('loading="lazy"','')+'</button><div class="thumbs">'+pr.images.map(function(s,i){return'<button type="button" data-i="'+i+'" aria-label="'+(i+1)+'"'+(i===cur_i?' aria-current="true"':"")+'>'+img(pr,i)+'</button>'}).join("")+'</div>'+v+'</div><div><span class="cat">'+t("d_cat")+': '+esc(catLabel(pr))+'</span><h1>'+esc(pr.name)+'</h1><p class="lead">'+esc(desc(pr))+'</p><div class="row"><a class="btn wa" href="'+wa(pr.name)+'" target="_blank" rel="noopener">'+t("price")+'</a><a class="btn ghost" href="'+ROOT+'products.html">'+t("back")+'</a></div></div>';
var cb=$("#crumb");if(cb)cb.innerHTML='<a href="'+ROOT+'index.html">'+t("nav")[0]+'</a> &rsaquo; <a href="'+ROOT+'products.html">'+t("nav")[1]+'</a> &rsaquo; '+esc(pr.name)}
function renderLists(){$$("[data-list]").forEach(function(u){u.innerHTML=(t(u.dataset.list)||[]).map(function(x){return"<li>"+x+"</li>"}).join("")})}
// ---- lightbox (ESC, oklar, swipe, zoom) ----
var lb=document.createElement("div");lb.className="lb";lb.setAttribute("role","dialog");lb.setAttribute("aria-modal","true");
lb.innerHTML='<button class="x" type="button" aria-label="Close">&times;</button><button class="p" type="button" aria-label="Prev">&#8249;</button><img alt=""><button class="n" type="button" aria-label="Next">&#8250;</button>';
document.body.appendChild(lb);var lbi=$("img",lb),last=null;
function show(i){cur_i=(i+pr.images.length)%pr.images.length;lbi.src=ROOT+pr.images[cur_i];lbi.alt=pr.name;lbi.classList.remove("z")}
function open(){last=document.activeElement;lb.classList.add("open");show(cur_i);$(".x",lb).focus()}
function close(){lb.classList.remove("open");renderDetail();if(last)last.focus()}
var tx=0;lb.addEventListener("touchstart",function(e){tx=e.touches[0].clientX},{passive:true});
lb.addEventListener("touchend",function(e){var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)show(cur_i+(d<0?1:-1))});
lb.addEventListener("click",function(e){var c=e.target;if(c===lbi)lbi.classList.toggle("z");else if(c.classList.contains("x")||c===lb)close();else if(c.classList.contains("p"))show(cur_i-1);else if(c.classList.contains("n"))show(cur_i+1)});
// ---- dil ----
function apply(){var d=document.documentElement;d.lang=lang;d.dir=lang==="ar"?"rtl":"ltr";
$$("[data-i18n]").forEach(function(e){e.textContent=t(e.dataset.i18n)});
$$("[data-i18n-ph]").forEach(function(e){e.placeholder=t(e.dataset.i18nPh)});
$$("[data-nav]").forEach(function(e){e.textContent=t("nav")[e.dataset.nav]});
$$("[data-wa]").forEach(function(e){e.href=wa(pr?pr.name:"");e.title=t("wa_tip");if(e.classList.contains("btn"))e.textContent=t("wa")});
$$("[data-lang]").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.lang===lang)});
var r=$("#rights");if(r)r.textContent=t("rights").replace("{y}",new Date().getFullYear());
var fc=$("#fcontact");if(fc)fc.innerHTML=contactLinks();
var ci=$("#cinfo");if(ci)ci.innerHTML=contactLinks();
renderLists();renderFilters();renderGrid();renderFeatured();renderCats();renderDetail();$$("[data-wa]").forEach(function(e){e.href=wa(pr?pr.name:"")})}
// ---- olaylar ----
document.addEventListener("click",function(e){var el=e.target.closest("button,a");
var m=$(".mnav");if(m&&m.classList.contains("open")&&!e.target.closest(".hd")){m.classList.remove("open");$(".burger").setAttribute("aria-expanded","false")}
if(!el)return;
if(el.dataset.lang){lang=el.dataset.lang;try{localStorage.setItem("ysc_lang",lang)}catch(x){}apply()}
else if(el.dataset.f){state.f=el.dataset.f;renderFilters();renderGrid()}
else if(el.classList.contains("burger")){var o=m.classList.toggle("open");el.setAttribute("aria-expanded",o)}
else if(el.id==="mainbtn")open();
else if(el.dataset.i&&el.closest(".thumbs")){cur_i=+el.dataset.i;renderDetail()}});
document.addEventListener("input",function(e){if(e.target.id==="q"){state.q=e.target.value;renderGrid()}});
document.addEventListener("keydown",function(e){
if(lb.classList.contains("open")){if(e.key==="Escape")close();else if(e.key==="ArrowLeft")show(cur_i+(lang==="ar"?1:-1));else if(e.key==="ArrowRight")show(cur_i+(lang==="ar"?-1:1))}
else if(e.key==="Escape"){var m=$(".mnav.open");if(m){m.classList.remove("open");$(".burger").setAttribute("aria-expanded","false")}}});
document.addEventListener("error",function(e){if(e.target.tagName==="IMG")e.target.classList.add("missing")},true);
document.addEventListener("submit",function(e){var f=e.target;if(f.id!=="cform")return;e.preventDefault();
var v=function(n){return f.elements[n].value.trim()};
var m=t("f_name")+": "+v("name")+"\n"+t("f_company")+": "+v("company")+"\n"+t("f_phone")+": "+v("phone")+"\n"+t("f_email")+": "+v("email")+"\n"+v("msg");
window.open("https://wa.me/"+C.whatsapp+"?text="+encodeURIComponent(m),"_blank","noopener")});
// ?f= parametresi (kategori bağlantıları)
try{var qf=new URLSearchParams(location.search).get("f");if(qf&&FK.indexOf(qf)>-1)state.f=qf}catch(x){}
chrome();apply();
})();
