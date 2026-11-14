#!/usr/bin/env node
/* Yusuf Seçilmiş Carpet — statik site üretici.
   Bağımlılık yok: `node build.js` çalıştırınca dist/ klasörüne saf HTML/CSS/JS yazar. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const readJson = (f) => {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { throw new Error(`JSON okunamadı: ${f}\n${e.message}`); }
};
const listJson = (dir) => {
  const d = path.join(ROOT, dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter((f) => f.endsWith('.json')).sort().map((f) => readJson(path.join(dir, f)));
};

const site = readJson('data/site.json');
const cats = readJson('data/categories.json');
const LANGS = site.languages;
const T = {};
for (const l of LANGS) T[l] = readJson(`data/i18n/${l}.json`);
const products = listJson('data/products');
products.sort((a, b) => (b.priority || 0) - (a.priority || 0));
const posts = {};
for (const l of LANGS) posts[l] = listJson(`data/blog/${l}`).sort((a, b) => (a.date < b.date ? 1 : -1));

/* ---------- doğrulama ---------- */
const catById = Object.fromEntries(cats.map((c) => [c.id, c]));
const seen = new Set();
for (const p of products) {
  if (!p.code) throw new Error('Ürün kodu (code) eksik bir ürün dosyası var.');
  const k = p.code.toLowerCase();
  if (seen.has(k)) throw new Error(`Ürün kodu iki kez kullanılmış: ${p.code}`);
  seen.add(k);
  if (!catById[p.category]) throw new Error(`${p.code}: bilinmeyen kategori "${p.category}". data/categories.json içindeki id değerlerinden biri olmalı.`);
  for (const c of p.colors || []) if (!site.colors[c]) throw new Error(`${p.code}: bilinmeyen renk "${c}". data/site.json > colors listesine bakın.`);
  for (const img of p.images || []) {
    if (!fs.existsSync(path.join(ROOT, 'src/images/products', p.code.toLowerCase(), img))) throw new Error(`${p.code}: fotoğraf bulunamadı: src/images/products/${p.code.toLowerCase()}/${img}`);
  }
}

/* ---------- yardımcılar ---------- */
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pick = (o, l) => (o == null ? '' : typeof o === 'string' ? o : (o[l] || o.en || o.tr || ''));
const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (v[k] ?? m));
const seg = (o, l) => o[l] || o.en;
const R = site.routes;
const url = {
  home: (l) => `/${l}/`,
  products: (l) => `/${l}/${seg(R.products, l)}/`,
  cat: (c, l) => `${url.products(l)}${seg(c.slug, l)}/`,
  product: (p, l) => `${url.cat(catById[p.category], l)}${p.code.toLowerCase()}/`,
  wholesale: (l) => `/${l}/${seg(R.wholesale, l)}/`,
  sourcing: (l) => `/${l}/${seg(R.sourcing, l)}/`,
  contact: (l) => `/${l}/${seg(R.contact, l)}/`,
  blog: (l) => `/${l}/blog/`,
  post: (p, l) => `/${l}/blog/${p.slug}/`,
};
const abs = (u) => site.baseUrl + u;
const alts = (fn) => Object.fromEntries(LANGS.map((l) => [l, fn(l)]));
const wa = (msg) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;
const addressLine = `${site.address.street}, ${site.address.postalCode} ${site.address.district}/${site.address.city}`;
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.name + ' ' + addressLine)}`;
const imgUrl = (p, f) => `/images/products/${p.code.toLowerCase()}/${f}`;
const sitemap = [];

function write(urlPath, html) {
  const file = path.join(OUT, urlPath, urlPath.endsWith('/') ? 'index.html' : '');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name === '.gitkeep') continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

/* ---------- şema (JSON-LD) ---------- */
const orgSchema = () => ({
  '@context': 'https://schema.org', '@type': ['Organization', 'LocalBusiness'], '@id': abs('/#org'),
  name: site.name, url: abs('/'), logo: abs('/images/logo.png'), image: abs('/images/og.jpg'),
  telephone: site.phone, email: site.email,
  address: { '@type': 'PostalAddress', streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.district, addressRegion: site.address.city, addressCountry: site.address.country },
  sameAs: [site.instagram],
});
const crumbSchema = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, u], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(u) })),
});

/* ---------- ortak parçalar ---------- */
function layout(l, o) {
  const t = T[l];
  const f = site.fonts[l] || site.fonts.default;
  const canonical = abs(o.alts[l]);
  const hasBlog = posts[l].length > 0;
  const hreflang = o.single
    ? ''
    : LANGS.map((x) => `<link rel="alternate" hreflang="${x}" href="${abs(o.alts[x])}">`).join('\n') +
      `\n<link rel="alternate" hreflang="x-default" href="${abs(o.xdefault || o.alts[site.defaultLang])}">`;
  if (!o.noindex) sitemap.push({ loc: canonical, alts: o.single ? null : o.alts, xdefault: o.xdefault });
  const nav = [
    ['products', url.products(l)], ['wholesale', url.wholesale(l)], ['sourcing', url.sourcing(l)],
    ...(hasBlog ? [['blog', url.blog(l)]] : []), ['contact', url.contact(l)],
  ].map(([k, u]) => `<a href="${u}"${o.active === k ? ' aria-current="page"' : ''}>${esc(t.nav[k])}</a>`).join('');
  const langNav = LANGS.map((x) => `<a href="${o.single ? url.home(x) : o.alts[x]}" lang="${x}" hreflang="${x}"${x === l ? ' aria-current="true"' : ''}>${esc(T[x].langName)}</a>`).join('');
  const schemas = (o.schema || []).map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');
  const waGeneral = wa(t.wa.general);
  return `<!doctype html>
<html lang="${l}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
${o.noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow">'}
<link rel="canonical" href="${canonical}">
${hreflang}
<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs(o.ogImage || '/images/og.jpg')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#141310">
<link rel="icon" href="/images/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${f.href}">
<style>:root{--head:${f.head};--body:${f.body}}</style>
<link rel="stylesheet" href="/css/style.css">
${schemas}
</head>
<body>
<a class="skip" href="#main">${esc(t.nav.home)} ↓</a>
<div class="topbar"><div class="wrap topbar-in">
<span>${esc(t.topbar)}</span>
<nav aria-label="${esc(t.nav.lang)}" class="langs">${langNav}</nav>
</div></div>
<header class="site-header"><div class="wrap header-in">
<a class="logo" href="${url.home(l)}" aria-label="${esc(site.name)}"><img src="/images/logo.webp" alt="${esc(site.name)}" width="640" height="193"></a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="${esc(t.nav.menu)}"><svg aria-hidden="true" width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M0 1h20M0 7h20M0 13h20"/></svg></button>
<nav id="nav" class="nav" aria-label="${esc(t.nav.menu)}">${nav}</nav>
<a class="btn btn-wa header-cta" href="${waGeneral}" rel="noopener">${esc(t.cta.wa)}</a>
</div></header>
<main id="main">
${o.body}
</main>
<footer class="site-footer"><div class="wrap footer-in">
<div class="footer-col"><img src="/images/logo.webp" alt="${esc(site.name)}" width="200" height="60" loading="lazy"><p>${esc(t.footer.tagline)}</p></div>
<div class="footer-col"><strong>${esc(t.footer.products)}</strong>${site.featured.slice(0, 4).map((id) => `<a href="${url.cat(catById[id], l)}">${esc(pick(catById[id].name, l))}</a>`).join('')}<a href="${url.products(l)}">${esc(t.cta.allCats)}</a></div>
<div class="footer-col"><strong>${esc(t.footer.company)}</strong><a href="${url.wholesale(l)}">${esc(t.nav.wholesale)}</a><a href="${url.sourcing(l)}">${esc(t.nav.sourcing)}</a>${hasBlog ? `<a href="${url.blog(l)}">${esc(t.nav.blog)}</a>` : ''}<a href="${url.contact(l)}">${esc(t.nav.contact)}</a></div>
<div class="footer-col"><strong>${esc(t.nav.contact)}</strong><span>${esc(addressLine)}</span><a href="tel:${site.phone}" dir="ltr">${site.phoneDisplay}</a><a href="mailto:${site.email}">${site.email}</a><a href="${site.instagram}" rel="noopener">Instagram ${esc(site.instagramHandle)}</a><span>Facebook: ${esc(site.facebookName)}</span></div>
</div></footer>
<div class="mobilebar"><a class="btn btn-outline" href="tel:${site.phone}">${esc(t.cta.call)}</a><a class="btn btn-wa" href="${waGeneral}" rel="noopener">${esc(t.cta.wa)}</a></div>
<script src="/js/main.js" defer></script>
</body>
</html>
`;
}

const crumbs = (items) => `<nav class="crumbs" aria-label="breadcrumb">${items.map(([n, u], i) => (i < items.length - 1 ? `<a href="${u}">${esc(n)}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(n)}</span>`)).join('')}</nav>`;
const ph = (cls, label) => `<div class="ph ${cls}" role="img" aria-label="${esc(label)}"></div>`;

function productCard(p, l, showCat) {
  const t = T[l];
  const c = catById[p.category];
  const name = pick(p.name, l);
  const img = (p.images || [])[0];
  const media = img ? `<img src="${imgUrl(p, img)}" alt="${esc(name)} – ${esc(pick(c.name, l))}" loading="lazy">` : ph(c.pattern, name);
  const meta = [p.material ? t.materials[p.material] || p.material : '', showCat ? pick(c.name, l) : ''].filter(Boolean).join(' · ');
  return `<article class="card" data-cat="${c.id}" data-material="${esc(p.material || '')}" data-colors="${esc((p.colors || []).join(' '))}" data-text="${esc((p.code + ' ' + name).toLowerCase())}">
<a class="card-img" href="${url.product(p, l)}">${media}${p.badge ? `<span class="badge badge-card">${esc(pick(p.badge, l))}</span>` : ''}</a>
<div class="card-head"><a class="card-name" href="${url.product(p, l)}">${esc(name)}</a><span class="muted small">${esc(t.product.code)}: ${esc(p.code)}</span></div>
<div class="muted small">${esc(meta)}</div>
<a class="btn btn-wa-outline" href="${wa(fill(t.wa.product, { code: p.code, name }))}" rel="noopener">${esc(t.cta.wa)}</a>
</article>`;
}

function filterPanel(list, l, showCat) {
  const t = T[l];
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const group = (key, legend, items) => (items.length < 1 ? '' : `<fieldset><legend>${esc(legend)}</legend>${items.map(([v, label, sw]) => `<label><input type="checkbox" name="${key}" value="${esc(v)}">${sw ? `<span class="sw" style="background:${sw}" aria-hidden="true"></span>` : ''}${esc(label)}</label>`).join('')}</fieldset>`);
  const catItems = showCat ? cats.filter((c) => list.some((p) => p.category === c.id)).map((c) => [c.id, pick(c.name, l)]) : [];
  const matItems = uniq(list.map((p) => p.material)).map((m) => [m, t.materials[m] || m]);
  const colItems = uniq(list.flatMap((p) => p.colors || [])).map((c) => [c, t.colorNames[c] || c, site.colors[c]]);
  return `<form class="filters" data-filters aria-label="${esc(t.filter.title)}">
<label class="search"><span class="sr">${esc(t.filter.search)}</span><input type="search" name="q" placeholder="${esc(t.filter.search)}"></label>
<details class="filter-groups" data-filter-groups><summary>${esc(t.filter.title)}</summary>
${group('cat', t.filter.category, catItems)}${group('material', t.filter.material, matItems)}${group('color', t.filter.color, colItems)}
<button type="reset" class="btn btn-outline btn-sm">${esc(t.filter.reset)}</button></details>
<div class="helpbox"><strong>${esc(t.filter.helpTitle)}</strong><span>${esc(t.filter.helpText)}</span><a class="btn btn-wa btn-sm" href="${wa(t.wa.general)}" rel="noopener">${esc(t.cta.wa)}</a></div>
</form>`;
}

function catalog(list, l, showCat) {
  const t = T[l];
  if (!list.length) return `<div class="empty"><p>${esc(t.filter.empty)}</p><a class="btn btn-wa" href="${wa(t.wa.general)}" rel="noopener">${esc(t.cta.wa)}</a></div>`;
  return `<div class="layout">${filterPanel(list, l, showCat)}
<div class="results"><p class="muted small" data-count data-tpl="${esc(t.filter.count)}">${esc(fill(t.filter.count, { n: list.length }))}</p>
<div class="cards">${list.map((p) => productCard(p, l, showCat)).join('\n')}</div>
<p class="empty" data-none hidden>${esc(t.filter.none)}</p></div></div>`;
}

const catChips = (l, activeId) => `<nav class="chips" aria-label="${esc(T[l].filter.category)}"><a href="${url.products(l)}"${!activeId ? ' aria-current="page"' : ''}>${esc(T[l].products.allProducts)}</a>${cats.map((c) => `<a href="${url.cat(c, l)}"${c.id === activeId ? ' aria-current="page"' : ''}>${esc(pick(c.name, l))}</a>`).join('')}</nav>`;

const quoteForm = (l, title, note) => {
  const t = T[l];
  return `<form class="form" data-wa-form data-intro="${esc(t.wa.form)}" data-wa="${site.whatsapp}">
<h2>${esc(title)}</h2>
<label>${esc(t.contact.name)}<input type="text" name="name" data-label="${esc(t.contact.name)}" required></label>
<label>${esc(t.contact.country)}<input type="text" name="country" data-label="${esc(t.contact.country)}"></label>
<label>${esc(t.contact.reach)}<input type="text" name="reach" data-label="${esc(t.contact.reach)}"></label>
<label>${esc(t.contact.group)}<select name="group" data-label="${esc(t.contact.group)}"><option value=""></option>${cats.map((c) => `<option>${esc(pick(c.name, l))}</option>`).join('')}</select></label>
<label>${esc(t.contact.message)}<textarea name="message" rows="4" data-label="${esc(t.contact.message)}"></textarea></label>
<button type="submit" class="btn btn-dark">${esc(t.cta.send)}</button>
<p class="muted small">${esc(note || t.wholesale.formNote)}</p>
</form>`;
};
const whoCards = (l, linked) => `<div class="grid g4">${T[l].who.items.map(([a, b]) => (linked ? `<a class="box" href="${url.wholesale(l)}"><h3>${esc(a)}</h3><p>${esc(b)}</p><span class="more">${esc(T[l].cta.details)} →</span></a>` : `<div class="box box-line"><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`)).join('')}</div>`;

/* ---------- sayfalar ---------- */
function pageHome(l) {
  const t = T[l];
  const hero = site.heroImage ? `<img class="hero-img" src="/${site.heroImage}" alt="${esc(t.home.h1)}">` : `<div class="hero-art">${ph('p1 tall', pick(catById.polyester.name, l))}<div class="hero-art-col">${ph('p2', pick(catById.shaggy.name, l))}${ph('p6', pick(catById.mosque.name, l))}</div></div>`;
  const body = `<section class="wrap hero"><div class="hero-text">
<p class="eyebrow">${esc(t.home.eyebrow)}</p><h1>${esc(t.home.h1)}</h1><p class="lead">${esc(t.home.lead)}</p>
<div class="btns"><a class="btn btn-wa btn-lg" href="${wa(t.wa.general)}" rel="noopener">${esc(t.cta.wa)}</a><a class="btn btn-outline btn-lg" href="${url.products(l)}">${esc(t.cta.browse)}</a></div>
<ul class="trust">${t.home.trust.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>${hero}</section>
${(() => { const hp = products.filter((p) => p.home); return hp.length ? `<section class="band-white"><div class="wrap sec"><div class="sec-head"><div><p class="eyebrow">${esc(t.home.newEyebrow)}</p><h2>${esc(t.home.newTitle)}</h2></div><a class="link" href="${url.products(l)}">${esc(t.cta.allCats)}</a></div><div class="cards">${hp.map((p) => productCard(p, l, true)).join('')}</div></div></section>` : ''; })()}
<section class="wrap sec"><div class="sec-head"><div><p class="eyebrow">${esc(t.home.catsEyebrow)}</p><h2>${esc(t.home.catsTitle)}</h2></div><a class="link" href="${url.products(l)}">${esc(t.cta.allCats)}</a></div>
<div class="grid g3">${site.featured.map((id) => { const c = catById[id]; return `<a class="tile" href="${url.cat(c, l)}">${c.image ? `<img src="/${c.image}" alt="${esc(pick(c.name, l))}" loading="lazy">` : ph(c.pattern, pick(c.name, l))}<span class="tile-name">${esc(pick(c.name, l))}</span></a>`; }).join('')}</div></section>
<section class="wrap sec"><h2 class="narrow">${esc(t.why.title)}</h2><div class="grid g4">${t.why.items.map(([a, b]) => `<div class="feature"><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join('')}</div></section>
<section class="band-cream"><div class="wrap sec"><div><p class="eyebrow">${esc(t.who.eyebrow)}</p><h2>${esc(t.who.title)}</h2></div>${whoCards(l, true)}</div></section>
<section class="wrap sec"><h2>${esc(t.steps.title)}</h2><ol class="grid g4 steps">${t.steps.items.map(([a, b], i) => `<li><span class="num">${i + 1}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></li>`).join('')}</ol></section>
${ctaBand(l)}`;
  write(url.home(l), layout(l, { title: t.home.metaTitle, desc: t.home.metaDesc, alts: alts(url.home), xdefault: '/', body, schema: [orgSchema()] }));
}
const ctaBand = (l) => `<section class="band-dark"><div class="wrap band-in"><div><h2>${esc(T[l].band.title)}</h2><p>${esc(T[l].band.text)}</p></div><a class="btn btn-wa btn-lg" href="${wa(T[l].wa.general)}" rel="noopener">WhatsApp: <span dir="ltr">${site.phoneDisplay}</span></a></div></section>`;

function pageProducts(l) {
  const t = T[l];
  const body = `<section class="wrap page-head">${crumbs([[t.nav.home, url.home(l)], [t.nav.products, url.products(l)]])}<h1>${esc(t.products.h1)}</h1><p class="lead">${esc(t.products.lead)}</p>${catChips(l, null)}</section>
<section class="wrap sec-tight">${catalog(products, l, true)}</section>${ctaBand(l)}`;
  write(url.products(l), layout(l, { title: t.products.metaTitle, desc: t.products.metaDesc, alts: alts(url.products), active: 'products', body, schema: [crumbSchema([[t.nav.home, url.home(l)], [t.nav.products, url.products(l)]])] }));
}

function pageCategory(c, l) {
  const t = T[l];
  const name = pick(c.name, l);
  const list = products.filter((p) => p.category === c.id);
  const trail = [[t.nav.home, url.home(l)], [t.nav.products, url.products(l)], [name, url.cat(c, l)]];
  const intro = pick(c.intro, l) && c.intro[l] ? c.intro[l] : fill(t.cat.lead, { name });
  const body = `<section class="wrap page-head">${crumbs(trail)}<h1>${esc(fill(t.cat.h1, { name }))}</h1><p class="lead">${esc(intro)}</p>${catChips(l, c.id)}</section>
<section class="wrap sec-tight">${catalog(list, l, false)}</section>${ctaBand(l)}`;
  write(url.cat(c, l), layout(l, { title: fill(t.cat.metaTitle, { name }), desc: fill(t.cat.metaDesc, { name }), alts: alts((x) => url.cat(c, x)), active: 'products', body, schema: [crumbSchema(trail)] }));
}

function pageProduct(p, l) {
  const t = T[l];
  const c = catById[p.category];
  const name = pick(p.name, l);
  const catName = pick(c.name, l);
  const trail = [[t.nav.home, url.home(l)], [t.nav.products, url.products(l)], [catName, url.cat(c, l)], [name, url.product(p, l)]];
  const imgs = p.images || [];
  const gallery = imgs.length
    ? `<div class="gallery${p.contain ? ' contain' : ''}${p.wide ? ' wide' : ''}${p.labels ? ' labeled' : ''}"><img class="gallery-main" data-main src="${imgUrl(p, imgs[0])}" alt="${esc(name)} – ${esc(p.labels ? pick(p.labels[0], l) : catName)}">${p.labels ? `<p class="gallery-cap" data-cap>${esc(pick(p.labels[0], l))}</p>` : ''}${imgs.length > 1 ? `<div class="thumbs">${imgs.map((f, i) => { const cap = p.labels ? pick(p.labels[i], l) : ''; return `<button type="button" data-thumb="${imgUrl(p, f)}" data-cap-text="${esc(cap)}" aria-label="${esc(cap || t.product.photo + ' ' + (i + 1))}"${i === 0 ? ' aria-current="true"' : ''}><img src="${imgUrl(p, f)}" alt="" loading="lazy">${cap ? `<span>${esc(cap)}</span>` : ''}</button>`; }).join('')}</div>` : ''}</div>`
    : `<div class="gallery">${ph(c.pattern + ' gallery-main', name)}</div>`;
  const vids = (p.videos || []).length ? `<div class="videos"><h2 class="label">${esc(t.product.videos)}</h2><div class="video-grid">${p.videos.map((v) => `<video controls playsinline preload="none" poster="${imgUrl(p, v.poster)}"><source src="${imgUrl(p, v.file)}" type="video/mp4"></video>`).join('')}</div></div>` : '';
  const rows = [
    [t.product.material, p.material ? t.materials[p.material] || p.material : ''],
    [t.product.reeds, p.reeds ? String(p.reeds) : ''],
    [t.product.pile, p.pile_mm ? `${p.pile_mm} mm` : ''],
    [t.product.weight, pick(p.weight_text, l) || (p.weight_gsm ? `${p.weight_gsm} g/m²` : '')],
    [t.product.backing, pick(p.backing, l)],
    [t.product.packing, pick(p.packing, l)],
    [t.product.origin, t.product.originValue],
  ].filter((r) => r[1]);
  const msg = fill(t.wa.product, { code: p.code, name });
  const related = products.filter((x) => x.category === p.category && x.code !== p.code).slice(0, 4);
  const desc = pick(p.desc, l);
  const body = `<section class="wrap page-head">${crumbs(trail)}</section>
<section class="wrap product"><div class="media">${gallery}${vids}</div><div class="product-info">
<p class="eyebrow">${esc(catName)} · ${esc(t.product.code)}: ${esc(p.code)}</p><h1>${esc(name)}</h1>${p.badge ? `<p class="badge badge-lg">${esc(pick(p.badge, l))}</p>` : ''}${desc ? `<p class="lead">${esc(desc)}</p>` : ''}
${(p.colors || []).length ? `<div><h2 class="label">${esc(t.product.colors)}</h2><ul class="swatches">${p.colors.map((x) => `<li><span class="sw sw-lg" style="background:${site.colors[x]}" aria-hidden="true"></span>${esc(t.colorNames[x] || x)}</li>`).join('')}</ul></div>` : ''}
${(p.sizes || []).length ? `<div><h2 class="label">${esc(t.product.sizes)}</h2><ul class="sizes">${p.sizes.map((x) => `<li>${esc(pick(x, l))}</li>`).join('')}</ul></div>` : ''}
<table class="specs"><caption>${esc(t.product.specs)}</caption><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</tbody></table>
<div class="wabox"><strong>${esc(t.product.waTitle)}</strong><p class="wamsg">${esc(msg)}</p><span class="muted small">${esc(t.product.waNote)}</span><a class="btn btn-wa btn-lg" href="${wa(msg)}" rel="noopener">${esc(t.cta.wa)}</a><a class="btn btn-outline" href="${url.contact(l)}">${esc(t.cta.quote)}</a></div>
</div></section>
<section class="band-cream"><div class="wrap perks">${t.product.perks.map(([a, b]) => `<div><strong>${esc(a)}</strong><span>${esc(b)}</span></div>`).join('')}</div></section>
${related.length ? `<section class="wrap sec"><h2>${esc(t.product.related)}</h2><div class="cards">${related.map((x) => productCard(x, l, false)).join('')}</div></section>` : ''}`;
  const schema = [crumbSchema(trail), {
    '@context': 'https://schema.org', '@type': 'Product', name, sku: p.code, category: catName,
    description: desc || fill(t.cat.metaDesc, { name: catName }),
    brand: { '@type': 'Brand', name: site.name },
    ...(imgs.length ? { image: imgs.map((f) => abs(imgUrl(p, f))) } : {}),
    ...(p.material ? { material: t.materials[p.material] || p.material } : {}),
  }];
  write(url.product(p, l), layout(l, {
    title: fill(t.product.metaTitle, { name, code: p.code, cat: catName }), desc: desc || fill(t.cat.metaDesc, { name: catName }),
    alts: alts((x) => url.product(p, x)), active: 'products', body, schema, noindex: !!p.example, ogType: 'product',
    ogImage: imgs.length ? imgUrl(p, imgs[0]) : null,
  }));
}

function pageWholesale(l) {
  const t = T[l], w = t.wholesale;
  const body = `<section class="wrap hero hero-sm"><div class="hero-text"><p class="eyebrow">${esc(w.eyebrow)}</p><h1>${esc(w.h1)}</h1><p class="lead">${esc(w.lead)}</p>
<div class="btns"><a class="btn btn-wa btn-lg" href="${wa(t.wa.general)}" rel="noopener">${esc(t.cta.wa)}</a><a class="btn btn-outline btn-lg" href="#quote">${esc(t.cta.quote)}</a></div></div>${ph('p3 tall', w.eyebrow)}</section>
<section class="band-white"><div class="wrap sec"><h2>${esc(w.whoTitle)}</h2>${whoCards(l, false)}</div></section>
<section class="wrap sec"><div><h2>${esc(w.deliveryTitle)}</h2><p class="lead">${esc(w.deliveryNote)}</p></div><div class="grid g3">${w.delivery.map(([k, a, b]) => `<div class="box box-cream"><p class="eyebrow">${esc(k)}</p><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join('')}</div></section>
<section class="band-dark"><div class="wrap sec-tight"><h2>${esc(w.regionsTitle)}</h2><ul class="regions">${w.regions.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></section>
<section class="wrap sec two" id="quote"><div class="faq"><h2>${esc(w.faqTitle)}</h2>${w.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>${quoteForm(l, w.formTitle)}</section>`;
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: w.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  write(url.wholesale(l), layout(l, { title: w.metaTitle, desc: w.metaDesc, alts: alts(url.wholesale), active: 'wholesale', body, schema: [faqSchema] }));
}

function pageSourcing(l) {
  const t = T[l], s = t.sourcing;
  const body = `<section class="wrap page-head"><p class="eyebrow">${esc(s.eyebrow)}</p><h1>${esc(s.h1)}</h1><p class="lead">${esc(s.lead)}</p></section>
<section class="wrap sec-tight"><div class="grid g3">${s.sections.map(([a, b]) => `<div class="feature"><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join('')}</div></section>
<section class="band-cream"><div class="wrap sec"><h2>${esc(t.steps.title)}</h2><ol class="grid g4 steps">${t.steps.items.map(([a, b], i) => `<li><span class="num">${i + 1}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></li>`).join('')}</ol></div></section>${ctaBand(l)}`;
  write(url.sourcing(l), layout(l, { title: s.metaTitle, desc: s.metaDesc, alts: alts(url.sourcing), active: 'sourcing', body, schema: [orgSchema()] }));
}

function pageContact(l) {
  const t = T[l], c = t.contact;
  const body = `<section class="wrap page-head"><p class="eyebrow">${esc(c.eyebrow)}</p><h1>${esc(c.h1)}</h1><p class="lead">${esc(c.lead)}</p></section>
<section class="wrap sec-tight two"><div class="contact-col">
<a class="wa-big" href="${wa(t.wa.general)}" rel="noopener"><span><span class="wa-big-label">${esc(c.waLabel)}</span><span class="wa-big-num" dir="ltr">${site.phoneDisplay}</span></span><span aria-hidden="true">→</span></a>
<dl class="dl"><dt>${esc(c.phone)}</dt><dd><a href="tel:${site.phone}" dir="ltr">${site.phoneDisplay}</a></dd><dt>${esc(c.email)}</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd><dt>${esc(c.address)}</dt><dd>${esc(addressLine)}, Türkiye<br><a class="link" href="${mapsUrl}" rel="noopener">${esc(t.cta.directions)} →</a></dd><dt>Instagram</dt><dd><a href="${site.instagram}" rel="noopener">${esc(site.instagramHandle)}</a></dd><dt>Facebook</dt><dd>${esc(site.facebookName)}</dd></dl>
</div>${quoteForm(l, c.formTitle)}</section>`;
  write(url.contact(l), layout(l, { title: c.metaTitle, desc: c.metaDesc, alts: alts(url.contact), active: 'contact', body, schema: [orgSchema()] }));
}

function pagesBlog(l) {
  const t = T[l];
  if (!posts[l].length) return;
  const list = `<section class="wrap page-head"><h1>${esc(t.blog.title)}</h1><p class="lead">${esc(t.blog.lead)}</p></section>
<section class="wrap sec-tight"><div class="grid g3">${posts[l].map((p) => `<a class="box box-line" href="${url.post(p, l)}"><span class="muted small">${esc(p.date)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><span class="more">${esc(t.blog.read)} →</span></a>`).join('')}</div></section>`;
  write(url.blog(l), layout(l, { title: `${t.blog.title} | ${site.name}`, desc: t.blog.lead, alts: { [l]: url.blog(l) }, single: true, active: 'blog', body: list }));
  for (const p of posts[l]) {
    const body = `<article class="wrap post">${crumbs([[t.nav.home, url.home(l)], [t.blog.title, url.blog(l)], [p.title, url.post(p, l)]])}<h1>${esc(p.title)}</h1><p class="muted small">${esc(p.date)}</p><div class="prose">${p.html}</div></article>${ctaBand(l)}`;
    const schema = [{ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date, inLanguage: l, author: { '@type': 'Organization', name: site.name }, publisher: { '@id': abs('/#org') } }];
    write(url.post(p, l), layout(l, { title: `${p.title} | ${site.name}`, desc: p.description, alts: { [l]: url.post(p, l) }, single: true, active: 'blog', body, schema, ogType: 'article' }));
  }
}

function pageRoot() {
  const links = LANGS.map((l) => `<a class="btn btn-outline btn-lg" href="${url.home(l)}" lang="${l}" hreflang="${l}">${esc(T[l].langName)}</a>`).join('');
  const hre = LANGS.map((x) => `<link rel="alternate" hreflang="${x}" href="${abs(url.home(x))}">`).join('\n');
  const f = site.fonts.default;
  sitemap.push({ loc: abs('/'), alts: alts(url.home), xdefault: '/' });
  fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.name)} – Wholesale Turkish Carpets | Toptan Halı</title>
<meta name="description" content="${esc(T.en.home.metaDesc)}">
<link rel="canonical" href="${abs('/')}">
${hre}
<link rel="alternate" hreflang="x-default" href="${abs('/')}">
<meta property="og:title" content="${esc(site.name)}"><meta property="og:image" content="${abs('/images/og.jpg')}"><meta property="og:url" content="${abs('/')}">
<link rel="icon" href="/images/favicon.png">
<link rel="stylesheet" href="${f.href}"><style>:root{--head:${f.head};--body:${f.body}}</style>
<link rel="stylesheet" href="/css/style.css">
<script type="application/ld+json">${JSON.stringify(orgSchema())}</script>
</head>
<body class="chooser">
<main><img src="/images/logo.webp" alt="${esc(site.name)}" width="640" height="193">
<h1>${esc(T.en.home.h1)}</h1>
<nav class="chooser-links" aria-label="Language">${links}</nav></main>
</body>
</html>
`);
}

function extras() {
  for (const [file, target] of Object.entries(site.redirects || {})) {
    fs.writeFileSync(path.join(OUT, file), `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(site.name)}</title><link rel="canonical" href="${abs(target)}"><meta http-equiv="refresh" content="0; url=${target}"><meta name="robots" content="noindex"></head><body><a href="${target}">${abs(target)}</a></body></html>`);
  }
  fs.writeFileSync(path.join(OUT, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404 – ${esc(site.name)}</title><meta name="robots" content="noindex"><link rel="stylesheet" href="/css/style.css"></head><body class="chooser"><main><img src="/images/logo.webp" alt="${esc(site.name)}" width="640" height="193"><h1>404</h1><nav class="chooser-links">${LANGS.map((l) => `<a class="btn btn-outline" href="${url.home(l)}">${esc(T[l].langName)}</a>`).join('')}</nav></main></body></html>`);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
  const today = new Date().toISOString().slice(0, 10);
  const xml = sitemap.map((e) => `<url><loc>${e.loc}</loc><lastmod>${today}</lastmod>${e.alts ? LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(e.alts[l])}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(e.xdefault || e.alts[site.defaultLang])}"/>` : ''}</url>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${xml}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, 'CNAME'), site.baseUrl.replace(/^https?:\/\//, '') + '\n');
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
}

/* ---------- çalıştır ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir(path.join(ROOT, 'src/css'), path.join(OUT, 'css'));
copyDir(path.join(ROOT, 'src/js'), path.join(OUT, 'js'));
copyDir(path.join(ROOT, 'src/images'), path.join(OUT, 'images'));
pageRoot();
for (const l of LANGS) {
  pageHome(l); pageProducts(l);
  for (const c of cats) pageCategory(c, l);
  for (const p of products) pageProduct(p, l);
  pageWholesale(l); pageSourcing(l); pageContact(l); pagesBlog(l);
}
extras();
console.log(`Tamam: ${sitemap.length} sayfa sitemap'te, ${products.length} ürün, ${LANGS.length} dil → dist/`);
