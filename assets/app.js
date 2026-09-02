const KEY="ysc_b2b_data_v1";
const defaults={settings:{phone:"+90 544 545 29 67",email:"yusufsecilmiscarpet@gmail.com",whatsapp:"905445452967",logo:"images/logo/logo.png"},collections:[
{id:1,name:"1000 Reeds",desc:"Yumuşak dokulu modern seri",image:"images/hero/placeholder.svg",visible:true},
{id:2,name:"1500 Reeds",desc:"Premium yoğunlukta modern seri",image:"images/hero/placeholder.svg",visible:true},
{id:3,name:"Flosh Polyester Modern",desc:"Modern polyester koleksiyon",image:"images/hero/placeholder.svg",visible:true},
{id:4,name:"Bukle İskandinav",desc:"İskandinav çizgiler ve doğal tonlar",image:"images/hero/placeholder.svg",visible:true},
{id:5,name:"Kaymaz Taban",desc:"Pratik ve dayanıklı modeller",image:"images/hero/placeholder.svg",visible:true},
{id:6,name:"Polyester Klasik",desc:"Klasik desen ve dokular",image:"images/hero/placeholder.svg",visible:true},
{id:7,name:"Sisal Jüt",desc:"Doğal görünümlü özel seri",image:"images/hero/placeholder.svg",visible:true},
{id:8,name:"Tafting",desc:"Proje ve özel ölçü uygulamaları",image:"images/hero/placeholder.svg",visible:true}],products:[]};
function data(){let x=localStorage.getItem(KEY);if(!x){localStorage.setItem(KEY,JSON.stringify(defaults));return structuredClone(defaults)}return JSON.parse(x)}
function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
function waLink(msg="Merhaba, toptan halı hakkında bilgi almak istiyorum."){return "https://wa.me/"+data().settings.whatsapp+"?text="+encodeURIComponent(msg)}
document.querySelectorAll("#navwa").forEach(e=>e.href=waLink());
function img(src){return src||"images/hero/placeholder.svg"}
function card(p){return `<article class="card"><img src="${img(p.image)}"><div class="cardbody"><small>${p.code||"YSC"}</small><h3>${p.name}</h3><p>${p.size||"Toptan satış"}</p><strong>${p.stock>0?"Stokta":"Tükendi"}</strong><a class="offer" href="${waLink("Merhaba, "+p.name+" ürünü için teklif almak istiyorum.")}">Teklif Al →</a></div></article>`}
function colCard(c){return `<a class="card collection" href="products.html?collection=${c.id}"><img src="${img(c.image)}"><div class="cardbody"><h3>${c.name}</h3><p>${c.desc||""}</p><span>İncele →</span></div></a>`}
function renderHome(){let d=data();document.getElementById("collections").innerHTML=d.collections.filter(x=>x.visible).map(colCard).join("");document.getElementById("featured").innerHTML=d.products.filter(x=>x.visible&&x.featured).slice(0,8).map(card).join("")||'<div class="empty">Admin panelinden öne çıkan ürün ekleyebilirsin.</div>';document.getElementById("herowa").href=waLink()}
function renderCollections(){let d=data();document.getElementById("collections").innerHTML=d.collections.filter(x=>x.visible).map(colCard).join("")}
function renderProducts(){let d=data(), qs=new URLSearchParams(location.search), cid=qs.get("collection");let f=document.getElementById("filter");f.innerHTML='<option value="">Tüm koleksiyonlar</option>'+d.collections.map(c=>`<option value="${c.id}" ${cid==c.id?"selected":""}>${c.name}</option>`).join("");let render=()=>{let q=document.getElementById("search").value.toLowerCase(),c=f.value;document.getElementById("products").innerHTML=d.products.filter(p=>p.visible&&(!c||p.collectionId==c)&&(!q||p.name.toLowerCase().includes(q)||String(p.code).toLowerCase().includes(q))).map(card).join("")||'<div class="empty">Ürün bulunamadı.</div>'};document.getElementById("search").oninput=render;f.onchange=render;render()}
function renderSpots(){let d=data();document.getElementById("spots").innerHTML=d.products.filter(p=>p.visible&&p.type==="spot").map(card).join("")||'<div class="empty">Şu anda spot ürün bulunmuyor.</div>'}
function renderContact(){let s=data().settings;document.getElementById("phone").textContent=s.phone;document.getElementById("email").textContent=s.email;document.getElementById("contactwa").href=waLink() }