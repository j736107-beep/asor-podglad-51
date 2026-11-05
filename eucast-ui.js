// 5.1 pw31 – EUCAST: wyłącznie link do Lekify (matryca online). To NIE jest lokalna matryca breakpointów offline.
(function (root) {
  'use strict';
  if (!root.SKM || !root.SKM.list) return;
  var URL = 'https://lekify.pl/lekowrazliwosc';
  function render(el) {
    el.innerHTML =
      '<div class="box" style="max-width:760px">' +
      '<h2 style="margin-top:0">🧫 EUCAST (Lekify – link)</h2>' +
      '<div class="notice" style="border-color:#C62828;background:#FCEBEA"><b>To nie lokalna matryca breakpointów.</b> W Asystencie SOR <b>nie ma</b> offline tabeli EUCAST. Poniżej jest tylko link do matrycy <b>EUCAST 2026 (KORLD)</b> na Lekify – <b>wymaga sieci</b>. Nie kopiujemy plakatu klinicznego +/− (Alfa Medica).</div>' +
      '<p class="lead">Interaktywna matryca zewnętrzna: czy dla pary drobnoustrój–lek jest wartość graniczna (ma zastosowanie / brak / warunkowe). Narzędzie pomocnicze, niecertyfikowane. <span class="dw">DO DECYZJI LEKARZA</span>.</p>' +
      '<div class="row" style="gap:10px;flex-wrap:wrap;margin-top:14px">' +
      '<button type="button" class="primary-action" id="eucOpen">Otwórz Lekify (nowa karta, wymaga sieci) →</button>' +
      '</div>' +
      '<p class="mut" style="margin-top:12px"><a href="' + URL + '" target="_blank" rel="noopener noreferrer">' + URL + '</a></p>' +
      '<p class="mut">Offline: ten ekran działa, ale matryca na Lekify – nie. Decyzje terapeutyczne wyłącznie na podstawie lokalnej mikrobiologii / ChPL / konsultacji.</p>' +
      '</div>';
    el.querySelector('#eucOpen').onclick = function () {
      window.open(URL, '_blank', 'noopener,noreferrer');
    };
  }
  var mod = {
    id: 'eucast',
    icon: '🧫',
    name: 'EUCAST (Lekify – link)',
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
