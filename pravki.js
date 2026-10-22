// Варианты цвета кнопками (приём №14 из копилки): три палитры каркаса ателье, выбор – параметром ?pal= в адресе.
// Подключается ДО Vibe.mount: движок читает цвета секций (data-v-drift) один раз при запуске.
(function () {
  var P = {
    a: { name: 'Лён', c: '#ebe5d8', s: '#f6f2ea', i: '#1c2130', is: '#5a5e6a', a: '#24336e', ai: '#f3efe6', sh: '60 52 38', d1: '#ebe5d8', d2: '#f1ece2' },
    b: { name: 'Ночь', c: '#171b28', s: '#202536', i: '#efe9dc', is: '#adb0bc', a: '#d8c6a2', ai: '#1b1710', sh: '0 0 0', d1: '#171b28', d2: '#1c2030' },
    v: { name: 'Сургуч', c: '#efece5', s: '#faf8f3', i: '#24262b', is: '#5f6167', a: '#9a3128', ai: '#fbf3ee', sh: '50 40 35', d1: '#efece5', d2: '#f4f2ec' }
  };
  var page = document.querySelector('.v-page');
  if (!page) return;
  var base = page.getAttribute('data-pal') || 'a';
  var m = /[?&]pal=([abv])/.exec(location.search);
  var cur = m ? m[1] : base;

  if (cur !== base) {
    var p = P[cur], st = page.style, B = P[base];
    st.setProperty('--v-canvas', p.c); st.setProperty('--v-surface', p.s);
    st.setProperty('--v-ink', p.i); st.setProperty('--v-ink-soft', p.is);
    st.setProperty('--v-accent', p.a); st.setProperty('--v-accent-ink', p.ai);
    st.setProperty('--pal-accent', p.a); st.setProperty('--pal-accent-ink', p.ai);
    st.setProperty('--v-shadow-color', p.sh);
    // Тёмная палитра «Ночь»: кнопка на фото – льняная, штамп на светлой бумаге – тёмный (template.md)
    st.setProperty('--hero-accent', cur === 'b' ? p.a : '#ece4d2');
    st.setProperty('--hero-accent-ink', cur === 'b' ? p.ai : '#1c2130');
    st.setProperty('--stamp', cur === 'b' ? '#24336e' : p.a);
    document.documentElement.style.background = p.c;
    page.querySelectorAll('[data-v-drift]').forEach(function (el) {
      var v = el.getAttribute('data-v-drift');
      el.setAttribute('data-v-drift', v === B.d1 ? p.d1 : p.d2);
    });
  }

  // В автоматической съёмке (скриншоты, ролик) панель не показываем – она только для живого владельца
  if (!(navigator.webdriver || location.hostname === '127.0.0.1')) (function () {
    var box = document.createElement('div');
    box.className = 'demo-pal'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Варианты цвета сайта');
    box.appendChild(document.createTextNode('Цвет'));
    Object.keys(P).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-pressed', String(k === cur)); b.title = 'Вариант «' + P[k].name + '»';
      b.style.setProperty('--sw', P[k].a); b.style.setProperty('--bg', P[k].c);
      b.innerHTML = '<i aria-hidden="true"></i><span>' + P[k].name + '</span>';
      b.addEventListener('click', function () {
        if (k === cur) return;
        var q = location.search.replace(/[?&]pal=[abv]/, '').replace(/^&/, '?');
        q = k === base ? q : (q ? q + '&' : '?') + 'pal=' + k;
        history.replaceState(null, '', location.pathname + q + location.hash);
        location.reload();
      });
      box.appendChild(b);
    });
    page.appendChild(box);

    // На телефоне панель видна только в начале и в конце страницы, чтобы не закрывать текст
    function place() {
      var e = document.documentElement, y = window.scrollY, end = e.scrollHeight - innerHeight - 400;
      box.classList.toggle('is-away', y > innerHeight * 0.6 && y < end);
    }
    window.addEventListener('scroll', place, { passive: true }); place();
  })();

  // Тире не переносится в начало строки, короткий предлог не висит в конце: движок делит кинетические заголовки
  // по словам (и превращает &nbsp; в пробел), причём не сразу, а когда заголовок появляется.
  // Ждём разбора и склеиваем «слово –» и «в Омске» в неразрывные группы.
  var SHORT = /^(в|во|к|ко|с|со|у|о|об|и|а|но|по|за|на|до|от|из|без|для|не)$/i;
  function glue(el) {
    var ks = el.querySelectorAll('.v-k');
    if (!ks.length) return false;
    function unit(k) { while (k.parentNode !== el) k = k.parentNode; return k; }
    function join(a, b) {
      a = unit(a); b = unit(b);
      if (a === b) return;
      var w = a;
      if (!a.__glue) { w = document.createElement('span'); w.style.whiteSpace = 'nowrap'; w.__glue = 1; el.insertBefore(w, a); w.appendChild(a); }
      while (w.nextSibling && w.nextSibling !== b) w.appendChild(w.nextSibling);
      w.appendChild(b); // идём слева направо, поэтому b ещё не склеен
    }
    [].forEach.call(ks, function (k, i) {
      var t = k.textContent.trim();
      if (i > 0 && t === '–') join(ks[i - 1], k);
      else if (i < ks.length - 1 && SHORT.test(t)) join(k, ks[i + 1]);
    });
    if (el.__vk && el.__vk.regroup) el.__vk.regroup();
    return true;
  }
  var pending = [].slice.call(document.querySelectorAll('[data-v-kinetic]'));
  (function tick() {
    pending = pending.filter(function (el) { return !glue(el); });
    if (pending.length) requestAnimationFrame(tick);
  })();
})();
