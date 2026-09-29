# Sayfaları, products.js, sitemap, robots, CNAME, README ve mapping.csv dosyalarını üretir.
import json,os,csv
BASE="https://yusufsecilmiscarpet.com/"
def seq(pre,n,fmt="{p} ({i}).jpeg"):return [fmt.format(p=pre,i=i) for i in range(1,n+1)]
# id, ad, kaynak klasör, yeni önek, kaynak dosyalar, filtreler, ana kategori
PR=[
("1000-reeds","1000 Reeds","100reeds","1000reeds",seq("1000reeds",3),["modern"],"modern"),
("1500-reeds","1500 Reeds","1500reeds","1500reeds",["1500reeds.jpeg"]+["1500reeds%d.jpeg"%i for i in range(1,16)],["modern"],"modern"),
("flosh-polyester-modern","Flosh Polyester Modern","floshpolyester","floshpolyestermodern",seq("floshpolyestermodern",15),["modern","polyester"],"modern"),
("kaymaz-taban","Kaymaz Taban","kaymaztaban","kaymaztaban",seq("kaymaztaban",15),["kaymaz"],"kaymaz"),
("polyester-klasik","Polyester Klasik","polyesterklasik","polyesterklasik",seq("polysterklasik",9),["klasik","polyester"],"klasik"),
("sisal-jut","Sisal Jüt","sisal","sisal",seq("sisal",21),["sisal"],"sisal"),
("tafting","Tafting","Tafting","tafting",seq("tafting",6),["tafting","modern"],"tafting"),
("bukle-iskandinav","Bukle İskandinav","İskandinav","bukleiskandinav",seq("bukleiskandinav",15),["iskandinav","modern"],"iskandinav"),
("spot-sisal","Spot Sisal","spotsisal","spotsisal",seq("spotsisal",11),["spot","sisal"],"spot"),
("son-il-kilim","Son İl Kilim","sonilkilim","sonilkilim",
 ["WhatsApp Image 2026-08-06 at 23.01.23.jpeg"]+["WhatsApp Image 2026-08-06 at 23.01.23 (%d).jpeg"%i for i in range(1,6)]+["WhatsApp Image 2026-08-06 at 23.01.24.jpeg","WhatsApp Image 2026-08-06 at 23.01.24 (1).jpeg"],[],"kilim"),
]
VIDEO=("sonilkilim","WhatsApp Video 2026-08-06 at 23.01.23.mp4","son-il-kilim","sonilkilim.mp4")
# Bilinen 3 ürünün açıklaması (tr/en/ar). Diğer ürünler için boş bırakılır;
# boş olan bir açıklama js/products.js içinde "desc" alanına yazılarak eklenir.
KDESC={
"sisal-jut":{"tr":"Doğal Görünümlü, Dayanıklı ve Yoğun Dokuma Sisal Serisi","en":"Natural-look, durable, densely woven sisal series","ar":"سلسلة سيزال بمظهر طبيعي ومتينة ونسيج كثيف"},
"tafting":{"tr":"Özel Modern Tafting Koleksiyonu","en":"Special modern tufted collection","ar":"مجموعة تافتينغ عصرية خاصة"},
"bukle-iskandinav":{"tr":"Minimalist ve Modern İskandinav Tasarımları","en":"Minimalist and modern Scandinavian designs","ar":"تصاميم سكندنافية عصرية وبسيطة"},
}
prods=[];rows=[];jp=0
for id,name,sf,pre,files,f,cat in PR:
    imgs=[]
    for i,s in enumerate(files,1):
        n="images/products/%s/%s-%d.jpeg"%(id,pre,i);imgs.append(n);rows.append((sf+"/"+s,n));jp+=1
    d=KDESC.get(id,{"tr":"","en":"","ar":""})
    p=dict(id=id,name=name,cat=cat,f=f,images=imgs,desc=d,specifications={})
    if id==VIDEO[2]:
        p["video"]="images/products/%s/%s"%(id,VIDEO[3]);rows.append((VIDEO[0]+"/"+VIDEO[1],p["video"]))
    prods.append(p)
assert jp==119 and len(rows)==120
cfg=dict(whatsapp="905XXXXXXXXX",phone="",email="",instagram="",facebook="",address="")
open("js/products.js","w",encoding="utf-8").write("// WhatsApp numarası ve iletişim bilgileri burada değiştirilir (whatsapp: ülke kodlu, + işaretsiz).\n// Yeni ürünler products dizisine eklenebilir.\nwindow.YSC={config:%s,\nproducts:%s};\n"%(json.dumps(cfg,indent:=1,ensure_ascii=False) if False else json.dumps(cfg,ensure_ascii=False),json.dumps(prods,ensure_ascii=False,indent=1)))
with open("tools/mapping.csv","w",encoding="utf-8",newline="") as fh:
    w=csv.writer(fh);w.writerow(["kaynak","yeni"]);w.writerows(rows)
def page(path,title,dsc,body,extra="",img="images/hero/hero.jpeg",ld=None,root=None,h1=True):
    if root is None:root="../"*path.count("/")
    url=BASE+path.replace("index.html","")
    j=''.join('<script type="application/ld+json">%s</script>'%json.dumps(x,ensure_ascii=False) for x in (ld or []))
    return f'''<!DOCTYPE html>
<html lang="tr" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{dsc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{dsc}">
<meta property="og:image" content="{BASE}{img}">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{root}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="{root}css/style.css">
{j}</head>
<body>
<div id="site-header"></div>
{body}
<div id="site-footer"></div>
<script src="{root}js/translations.js"></script>
<script src="{root}js/products.js"></script>
<script src="{root}js/main.js" data-root="{root}"></script>
</body>
</html>
'''
def ph(k,pk):return f'<section class="page-h"><div class="wrap"><h1 data-i18n="{k}"></h1><p data-i18n="{pk}"></p></div></section>'
WA='<a class="btn wa" data-wa target="_blank" rel="noopener" data-i18n="%s"></a>'
org={"@context":"https://schema.org","@type":"Organization","name":"Yusuf Seçilmiş Carpet","url":BASE}
site={"@context":"https://schema.org","@type":"WebSite","name":"Yusuf Seçilmiş Carpet","url":BASE}
home=f'''<main>
<section class="hero"><img src="images/products/1500-reeds/1500reeds-1.jpeg" alt="1500 Reeds toptan halı modeli" fetchpriority="high" width="1600" height="900"><div class="wrap"><h1 data-i18n="hero_title"></h1><p data-i18n="hero_sub"></p><div class="row"><a class="btn" href="products.html" data-i18n="cta_products"></a><a class="btn ghost" data-wa target="_blank" rel="noopener" data-i18n="cta_info"></a></div></div></section>
<section class="sec"><div class="wrap"><h2 data-i18n="intro_h"></h2><p class="lead" data-i18n="intro_p"></p></div></section>
<section class="sec alt"><div class="wrap"><h2 data-i18n="feat_h"></h2><div class="grid" id="featured" data-ids="1000-reeds,1500-reeds,flosh-polyester-modern,sisal-jut,tafting,bukle-iskandinav"></div><p><a class="btn ghost" href="products.html" data-i18n="all_products"></a></p></div></section>
<section class="sec"><div class="wrap"><h2 data-i18n="cat_h"></h2><div class="row" id="cats"></div></div></section>
<section class="sec alt"><div class="wrap split"><div><h2 data-i18n="spot_h"></h2><p class="lead" data-i18n="spot_p"></p><a class="btn" href="spot.html" data-i18n="spot_btn"></a></div><div><h2 data-i18n="whole_h"></h2><p class="lead" data-i18n="whole_p"></p><a class="btn" href="wholesale.html" data-i18n="more"></a></div></div></section>
<section class="sec"><div class="wrap"><h2 data-i18n="exp_h"></h2><p class="lead" data-i18n="exp_p"></p><a class="btn" href="export.html" data-i18n="more"></a></div></section>
<section class="sec band"><div class="wrap"><h2 data-i18n="wa_h"></h2><p class="lead" data-i18n="wa_p"></p>{WA%"wa_info"}</div></section>
</main>'''
listp=lambda k,ik,ck:f'<main>{ph(k[0],k[1])}<section class="sec"><div class="wrap"><ul class="list lead" data-list="{ik}"></ul><p>{WA%ck}</p></div></section></main>'
prodp=f'''<main>{ph("prod_h","prod_p")}<section class="sec"><div class="wrap"><label class="sr" for="q" hidden>Ara</label><input class="search" id="q" type="search" data-i18n-ph="search" placeholder="Ürün ara..."><div class="filters" id="filters" role="group"></div><div class="grid" id="grid"></div></div></section></main>'''
spotp=f'''<main>{ph("spotp_h","spotp_p")}<section class="sec"><div class="wrap"><div class="grid" id="grid" data-filter="spot"></div></div></section></main>'''
def fld(n,l,tp="text"):return f'<label>{{}}<span data-i18n="{l}"></span><input name="{n}" type="{tp}"></label>'.replace("{}","")
cont=f'''<main>{ph("ct_h","form_note")}<section class="sec"><div class="wrap split"><form class="form" id="cform">{fld("name","f_name")}{fld("company","f_company")}{fld("phone","f_phone","tel")}{fld("email","f_email","email")}<label><span data-i18n="f_msg"></span><textarea name="msg" rows="5"></textarea></label><button class="btn wa" type="submit" data-i18n="send"></button></form><div id="cinfo" class="ft-info"></div></div></section></main>'''
aboutp=f'<main>{ph("ab_h","intro_p")}<section class="sec"><div class="wrap"><p class="lead" data-i18n="ab_p"></p><a class="btn" href="products.html" data-i18n="cta_products"></a></div></section></main>'
T=" | Yusuf Seçilmiş Carpet"
out={
"index.html":page("index.html","Toptan Halı Tedarik Çözümleri"+T,"Yusuf Seçilmiş Carpet: toptan halı satışı, halı tedarikçisi, spot halı ve ihracat için B2B halı kataloğu.",home,ld=[org,site]),
"products.html":page("products.html","Toptan Halı Modelleri ve Ürünler"+T,"Toptan halı modelleri: 1000 Reeds, 1500 Reeds, polyester halı, sisal, tafting halı ve İskandinav serileri.",prodp),
"spot.html":page("spot.html","Spot & Outlet Halılar"+T,"Spot halı ürünleri: Spot Sisal ve outlet halı seçenekleri.",spotp),
"wholesale.html":page("wholesale.html","Toptan Halı Satışı"+T,"Toptan halı satışı: mağazalara ve ticari müşterilere yönelik halı tedariği, toplu sipariş ve teklif alma.",listp(("wh_h","wh_p"),"wh_items","wh_cta")),
"export.html":page("export.html","Global Tedarik & İhracat"+T,"Wholesale carpets and carpet supplier: toptan halı ihracatı için ürün kataloğu ve teklif alma.",listp(("ex_h","ex_p"),"ex_items","ex_cta")),
"about.html":page("about.html","Hakkımızda"+T,"Yusuf Seçilmiş Carpet, toptan halı ve ticari halı tedarik ihtiyaçlarına yönelik ürün seçenekleri sunan bir halı firmasıdır.",aboutp),
"contact.html":page("contact.html","İletişim"+T,"Toptan halı için Yusuf Seçilmiş Carpet ile iletişime geçin. WhatsApp üzerinden bilgi alın.",cont),
}
DESC={"sisal-jut":"Doğal Görünümlü, Dayanıklı ve Yoğun Dokuma Sisal Serisi","tafting":"Özel Modern Tafting Koleksiyonu","bukle-iskandinav":"Minimalist ve Modern İskandinav Tasarımları"}
for p in prods:
    d=DESC.get(p["id"],"%s toptan halı ürün grubu."%p["name"]);path="products/%s/index.html"%p["id"]
    ld=[{"@context":"https://schema.org","@type":"Product","name":p["name"],"description":d,"image":[BASE+i for i in p["images"][:3]],"brand":{"@type":"Brand","name":"Yusuf Seçilmiş Carpet"}},
        {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Ana Sayfa","item":BASE},{"@type":"ListItem","position":2,"name":"Ürünler","item":BASE+"products.html"},{"@type":"ListItem","position":3,"name":p["name"],"item":BASE+"products/%s/"%p["id"]}]}]
    body=f'<main><div class="wrap"><nav class="crumb" id="crumb" aria-label="Breadcrumb"><a href="../../index.html">Ana Sayfa</a> &rsaquo; <a href="../../products.html">Ürünler</a> &rsaquo; {p["name"]}</nav><div class="detail" id="detail" data-product="{p["id"]}"><h1>{p["name"]}</h1></div></div></main>'
    out[path]=page(path,p["name"]+" Toptan Halı"+T,d+" Toptan fiyat ve bilgi için iletişime geçin.",body,img=p["images"][0],ld=ld)
out["404.html"]=page("404.html","404"+T,"Sayfa bulunamadı.",'<main class="err"><h1>404</h1><p data-i18n="e404"></p><a class="btn" href="/index.html" data-i18n="home"></a></main>',root="/")
for k,v in out.items():
    os.makedirs(os.path.dirname(k) or ".",exist_ok=True);open(k,"w",encoding="utf-8").write(v)
    os.makedirs("images/products/"+k.split("/")[1],exist_ok=True) if k.startswith("products/") else None
open("sitemap.xml","w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+"".join("<url><loc>%s</loc></url>\n"%(BASE+k.replace("index.html","")) for k in out if k!="404.html")+"</urlset>\n")
open("robots.txt","w").write("User-agent: *\nAllow: /\nSitemap: %ssitemap.xml\n"%BASE)
open("CNAME","w").write("yusufsecilmiscarpet.com\n")
open("favicon.svg","w").write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#363231"/><text x="32" y="45" font-family="Georgia,serif" font-size="38" text-anchor="middle" fill="#f0f0ea">Y</text></svg>\n')
open("tools/rename_images.py","w",encoding="utf-8").write('''# Kullanım: python tools/rename_images.py <kaynak_kök_klasör>
# Kaynak klasörü (100reeds/, 1500reeds/, ... içeren klasör) mapping.csv'ye göre images/products/ altına kopyalar.
import csv,os,shutil,sys
src=sys.argv[1];root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));miss=0
for r in csv.DictReader(open(os.path.join(root,"tools","mapping.csv"),encoding="utf-8")):
    a=os.path.join(src,r["kaynak"]);b=os.path.join(root,r["yeni"])
    if os.path.exists(a):
        os.makedirs(os.path.dirname(b),exist_ok=True);shutil.copy2(a,b)
    else:miss+=1;print("Bulunamadı:",a)
print("Tamam. Eksik dosya:",miss)
''')
open("README.md","w",encoding="utf-8").write('''# Yusuf Seçilmiş Carpet - B2B Toptan Halı Sitesi

Statik site (HTML/CSS/JS). Sunucu, veritabanı veya derleme gerekmez.

## 1. Projeyi açma ve 2. Local çalıştırma
Klasörde terminal açın: `python -m http.server 8000` ve tarayıcıda `http://localhost:8000` adresine gidin.

## Görselleri yerleştirme
Görseller pakette yoktur. Orijinal klasörlerinizin bulunduğu dizini verin:
`python tools/rename_images.py "C:/yol/kaynak-klasor"`
Betik, `tools/mapping.csv` eşleşmesine göre 119 JPEG + 1 MP4 dosyayı `images/products/<urun>/` altına güvenli adlarla kopyalar. Hero görseli olarak 1500 Reeds ilk görseli kullanılır.

## 3. Ürün ekleme / 4. silme / 5. görsel değiştirme
`js/products.js` içindeki `products` dizisini düzenleyin:
`{ id:"yeni-urun", name:"Ürün Adı", cat:"modern", f:["modern"], images:["images/products/yeni-urun/1.jpeg"], specifications:{} }`
Silmek için ilgili bloğu kaldırın. Görsel değiştirmek için dosyayı aynı adla üzerine yazın. Yeni ürünün detay sayfası için `tools/build.py` içindeki `PR` listesine ekleyip `python tools/build.py` çalıştırın. Ürün açıklamaları `js/translations.js` içinde `d_<id>` anahtarıyla yazılır.

## 6-9. WhatsApp, telefon, e-posta, sosyal medya
`js/products.js` en üstündeki `config` alanı: `whatsapp` (ör. 905321234567, + olmadan), `phone`, `email`, `instagram`, `facebook`, `address`. Boş alanlar sitede görünmez.

## 10. Dil sistemi
Tüm metinler `js/translations.js` içindedir (tr, en, ar). Arapçada sayfa otomatik RTL olur. Meta etiketleri (title/description) yalnızca Türkçedir.

## 11-12. GitHub Pages ve domain
Depoya yükleyin, Settings > Pages'ten ana dalı seçin. `CNAME` dosyası `yusufsecilmiscarpet.com` içerir; DNS'te alan adını GitHub Pages'e yönlendirin. Tüm yollar göreceli, 404 sayfası ise kök alan adı (`/`) varsayar.

## 13. SEO
Sayfa başlıkları ve açıklamaları `tools/build.py` içinde; değiştirip `python tools/build.py` çalıştırın. `sitemap.xml` ve `robots.txt` üretilir. Fiyat, puan, stok gibi doğrulanmamış veri kullanılmaz.
''')
print("ok",len(out),"pages",jp,"jpeg",len(rows),"media")
