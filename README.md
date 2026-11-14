# Yusuf Seçilmiş Carpet — web sitesi

Saf HTML/CSS/JS üreten, bağımlılığı olmayan statik site. Veriler JSON dosyalarında durur;
`node build.js` komutu 6 dilde (tr, en, ar, ru, fr, ka) tüm sayfaları `dist/` klasörüne yazar.

## Çalıştırma

    node build.js                 # dist/ klasörünü üretir (Node 18+)
    node serve.js                 # derler ve http://localhost:8080 adresinde açar

Windows: `baslat.bat` dosyasına çift tıklayın. `dist/index.html` dosyasını çift tıklayarak
açmayın; adresler kökten başladığı için stil ve bağlantılar çalışmaz.

## Yayın (GitHub Pages)

1. Bu klasörün içeriğini deponuzun `main` dalına gönderin.
2. GitHub > Settings > Pages > Source: **GitHub Actions** seçin.
3. Her push'ta `.github/workflows/deploy.yml` siteyi derleyip yayınlar.

Alan adı `data/site.json > baseUrl` değerinden alınır ve `CNAME` dosyası otomatik yazılır.
Şu an `https://yusufsecilmiscarpet.com` (www'siz). www'li kullanıyorsanız orayı değiştirin.

## Ürün ekleme

1. `data/products/` içine `<kod>.json` dosyası ekleyin (örnek: `ornek-001.json`).
2. Fotoğrafları `src/images/products/<kod-küçük-harf>/` klasörüne koyun ve dosya adlarını
   `images` listesine yazın. İlk fotoğraf kapak olur.
3. Push edin. Ürün sayfaları, filtreler, sitemap ve hreflang kendiliğinden güncellenir.

Alanlar:

| Alan | Açıklama |
| --- | --- |
| `code` | Ürün kodu. Adreste ve WhatsApp mesajında kullanılır, benzersiz olmalı. |
| `category` | `data/categories.json` içindeki `id` değerlerinden biri. |
| `material` | acrylic, pp, polyester, cotton, sisal, mixed (çevirileri `data/i18n/*.json > materials`). |
| `colors` | red, green, blue, beige, brown, grey, cream, black, multi (`data/site.json > colors`). |
| `sizes` | Serbest metin listesi, örn. `"160x230 cm"`. |
| `pile_mm`, `weight_gsm` | Sayı. Boş bırakılırsa satır gösterilmez. |
| `name`, `desc`, `backing`, `packing` | Dil bazında metin: `{"tr": "...", "en": "..."}`. Eksik dilde İngilizce, o da yoksa Türkçe gösterilir. |
| `images` | Fotoğraf dosya adları. |
| `example` | `true` ise sayfa Google'a kapalıdır (noindex) ve sitemap'e girmez. Gerçek ürünlerde yazmayın. |

`ornek-001/002/003` örnek ürünlerdir; gerçek ürünler gelince silin.

## Diğer içerikler

- **Metinler:** `data/i18n/<dil>.json`. Tüm sayfa metinleri, başlıklar ve meta açıklamaları burada.
- **Kategoriler:** `data/categories.json`. Bir kategoriye o dile özel giriş metni vermek için
  `"intro": {"tr": "...", "en": "..."}` ekleyin; yoksa genel şablon kullanılır. Kategoriye
  fotoğraf vermek için `"image": "images/kategori/cami.jpg"` ekleyin.
- **Ana sayfa fotoğrafı:** `data/site.json > heroImage` (örn. `"images/hero.jpg"`, dosya `src/images/` altında).
- **Blog:** `data/blog/<dil>/<slug>.json` →
  `{"slug": "...", "title": "...", "date": "2026-12-01", "description": "...", "html": "<p>...</p>"}`.
  Bir dilde yazı varsa o dilin menüsünde Blog görünür.
- **Eski adresler:** `data/site.json > redirects`.

## Bilinen eksikler

- Fotoğraflar olduğu gibi kopyalanır; WebP'ye çevirme ve küçültme adımı henüz yok. Yüklemeden
  önce uzun kenarı ~1600 px olacak şekilde küçültün.
- Arapça, Rusça, Fransızca ve Gürcüce metinleri anadili konuşan biri gözden geçirmeli.
