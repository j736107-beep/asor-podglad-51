// 5.1 – moduł „Lekowrażliwość EUCAST”: matryca EUCAST 2026 (KORLD) na Lekify (wartości graniczne).
// Nie jest kopią plakatu Alfa Medica (+/−). Brak lokalnych komórek klinicznych — tylko link do publicznego źródła.
(function (root) {
  'use strict';
  if (!root.SKM || !root.SKM.list) return;
  var URL = 'https://lekify.pl/lekowrazliwosc';
  function render(el) {
    el.innerHTML =
      '<div class="box" style="max-width:720px">' +
      '<h2 style="margin-top:0">🧫 Lekowrażliwość EUCAST</h2>' +
      '<p class="lead">Interaktywna matryca <b>EUCAST 2026 (KORLD)</b> — czy dla pary drobnoustrój–lek jest wartość graniczna (ma zastosowanie / brak / warunkowe).</p>' +
      '<div class="notice">To <b>nie</b> jest kopia plakatu klinicznego +/− (Alfa Medica). Źródło: Lekify / KORLD. Otwiera się w <b>nowej karcie</b> — Asystent SOR zostaje otwarty. Narzędzie zewnętrzne, pomocnicze, niecertyfikowane.</div>' +
      '<div class="row" style="gap:10px;flex-wrap:wrap;margin-top:14px">' +
      '<button type="button" class="primary-action" id="eucOpen">Otwórz matrycę na Lekify (nowa karta) →</button>' +
      '</div>' +
      '<p class="mut" style="margin-top:12px"><a href="' + URL + '" target="_blank" rel="noopener noreferrer">' + URL + '</a></p>' +
      '</div>';
    el.querySelector('#eucOpen').onclick = function () {
      window.open(URL, '_blank', 'noopener,noreferrer');
    };
  }
  var mod = {
    id: 'eucast',
    icon: '🧫',
    name: 'Lekowrażliwość EUCAST',
    render: render
  };
  if (typeof root.SKM.insertAfter === 'function') root.SKM.insertAfter('leki', mod);
  else {
    var L = root.SKM.list,
      i = L.findIndex(function (m) {
        return m.id === 'leki';
      });
    if (i < 0) L.push(mod);
    else L.splice(i + 1, 0, mod);
  }
})(typeof window !== 'undefined' ? window : this);
