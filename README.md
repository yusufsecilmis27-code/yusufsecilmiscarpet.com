# Yusuf Seçilmiş Carpet - B2B Toptan Halı Sitesi

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
