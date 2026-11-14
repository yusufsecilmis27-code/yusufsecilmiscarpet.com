/* Yusuf Seçilmiş Carpet — menü, filtreler, galeri, WhatsApp formu. Bağımlılık yok. */
(function () {
  'use strict';

  // Mobil menü
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Katalog filtreleri: grup içinde "veya", gruplar arasında "ve"
  var form = document.querySelector('[data-filters]');
  if (form) {
    var groups = form.querySelector('[data-filter-groups]');
    if (groups && window.matchMedia('(min-width: 861px)').matches) groups.open = true;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.results .card'));
    var count = document.querySelector('[data-count]');
    var none = document.querySelector('[data-none]');
    var checked = function (name) {
      return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; });
    };
    var apply = function () {
      var cat = checked('cat'), mat = checked('material'), col = checked('color');
      var q = (form.elements.q && form.elements.q.value || '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var colors = (c.dataset.colors || '').split(' ');
        var ok = (!cat.length || cat.indexOf(c.dataset.cat) > -1) &&
          (!mat.length || mat.indexOf(c.dataset.material) > -1) &&
          (!col.length || col.some(function (x) { return colors.indexOf(x) > -1; })) &&
          (!q || (c.dataset.text || '').indexOf(q) > -1);
        c.hidden = !ok;
        if (ok) shown++;
      });
      if (count) count.textContent = count.dataset.tpl.replace('{n}', shown);
      if (none) none.hidden = shown > 0;
    };
    form.addEventListener('change', apply);
    form.addEventListener('input', apply);
    form.addEventListener('reset', function () { setTimeout(apply, 0); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  // Ürün galerisi
  var main = document.querySelector('[data-main]');
  if (main) {
    document.querySelectorAll('[data-thumb]').forEach(function (b) {
      b.addEventListener('click', function () {
        main.src = b.dataset.thumb;
        var cap = document.querySelector('[data-cap]');
        if (cap && b.dataset.capText) { cap.textContent = b.dataset.capText; main.alt = b.dataset.capText; }
        document.querySelectorAll('[data-thumb]').forEach(function (x) { x.removeAttribute('aria-current'); });
        b.setAttribute('aria-current', 'true');
      });
    });
  }

  // Teklif ve iletişim formu: bilgileri WhatsApp mesajına çevirir
  document.querySelectorAll('[data-wa-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [f.dataset.intro || ''];
      f.querySelectorAll('[data-label]').forEach(function (el) {
        var v = (el.value || '').trim();
        if (v) lines.push(el.dataset.label + ': ' + v);
      });
      window.open('https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  });
})();
