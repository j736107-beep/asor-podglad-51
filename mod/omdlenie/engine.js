/* Silnik reguł „Omdlenie SOR” v2 – odpowiedzi TAK/NIE (brak odpowiedzi = brak danych).
   Czysta funkcja, bez sieci i bez zapisu danych. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SyncopeEngine = factory();
})(this, function () {
  'use strict';
  var RANK = { green: 0, yellow: 1, red: 2 };
  var CSRS = 'CSRS CMAJ 2016', ESC6 = 'ESC 2018 Tab. 6';
  function fmt(n) { return (n > 0 ? '+' : '') + n; }

  function index(rules) {
    var m = {};
    rules.groups.forEach(function (g) { g.items.forEach(function (it) { m[it.code] = Object.assign({ step: g.id, stepTitle: g.title }, it); }); });
    return m;
  }

  // efektywna odpowiedź: 'yes' | 'no' | undefined
  function valueOf(items, a, code) {
    var it = items[code];
    if (it && it.req === 'ecg' && a['G-L1'] === 'yes') return 'no';
    if (it && it.req === 'arr' && a['G-L1'] === 'yes') return 'no';
    return a[code];
  }

  function requiredMissing(rules, input) {
    var items = index(rules), a = input.answers || {}, miss = [];
    var anyGM = Object.keys(items).some(function (c) { return /^G-M/.test(c) && valueOf(items, a, c) === 'yes'; });
    rules.groups.forEach(function (g) {
      g.items.forEach(function (it) {
        var need = it.req === 'always' || (it.req === 'ecg' && a['G-L1'] === 'no') || (it.req === 'arr' && anyGM);
        if (need && valueOf(items, a, it.code) === undefined) miss.push({ code: it.code, label: it.label, step: g.id, stepTitle: g.title });
      });
      if (g.id === 'L') {
        if (!input.troponin) miss.push({ code: 'C-4', label: 'Troponina: podwyższona / prawidłowa / nieoznaczona', step: 'L', stepTitle: g.title, field: 'troponin' });
        if (!input.dx) miss.push({ code: 'C-8/9', label: 'Rozpoznanie na SOR (wazowagalne / kardiogenne / inne)', step: 'L', stepTitle: g.title, field: 'dx' });
      }
    });
    return miss;
  }

  function csrsScore(rules, input) {
    var items = index(rules), a = input.answers || {}, score = 0, parts = [];
    Object.keys(items).forEach(function (c) {
      var it = items[c];
      if (it.type === 'csrs' && valueOf(items, a, c) === 'yes') { score += it.pts; parts.push({ code: c, label: it.label, pts: it.pts }); }
    });
    if (input.troponin === 'pos') { score += rules.troponin.pts; parts.push({ code: 'C-4', label: rules.troponin.label, pts: rules.troponin.pts }); }
    var dx = input.dx && rules.diagnosis[input.dx];
    if (dx && dx.pts) { score += dx.pts; parts.push({ code: dx.code, label: 'Rozpoznanie na SOR: ' + dx.label, pts: dx.pts }); }
    // dolna granica przy brakujących elementach ujemnych (C-1: −1, rozpoznanie: −2)
    var low = score - (valueOf(items, a, 'C-1') === undefined ? 1 : 0) - (input.dx ? 0 : 2);
    var clamp = function (x) { return Math.max(-3, Math.min(11, x)); };
    score = clamp(score); low = clamp(low);
    var row = rules.csrsTable[String(score)];
    var complete = valueOf(items, a, 'C-1') !== undefined && valueOf(items, a, 'C-2') !== undefined && valueOf(items, a, 'C-3') !== undefined &&
      ['C-5', 'C-6', 'C-7'].every(function (c) { return valueOf(items, a, c) !== undefined; }) && !!input.troponin && !!input.dx;
    return { score: score, lowerBound: low, risk: row[0], category: row[1], parts: parts, complete: complete, troponinMissing: input.troponin === 'na' };
  }

  function evaluate(rules, input, settings) {
    var s = Object.assign({}, rules.defaults, settings || {});
    var items = index(rules), a = input.answers || {};
    var v = function (c) { return valueOf(items, a, c); };
    var yes = function (c) { return v(c) === 'yes'; };
    var codes = Object.keys(items);
    var yesOf = function (t) { return codes.filter(function (c) { return items[c].type === t && yes(c); }); };
    var R = function (c, rule) { var it = items[c] || {}; return { code: c, label: it.label || c, src: it.src || '', rule: rule, step: it.step }; };
    var csrs = csrsScore(rules, input), missing = requiredMissing(rules, input);
    var warnings = [], decisive = [];
    if (csrs.troponinMissing) warnings.push('Troponina nieoznaczona — przyjęto 0 pkt w CSRS (jak w publikacji CSRS).');
    if (yes('X-PRE')) warnings.push('Stan przedomdleniowy — CSRS poza populacją walidacyjną; cechy ESC stosowane jak przy omdleniu.');
    if (yes('X-OLD')) warnings.push('Starszy wiek (≥' + s.P10_ageThreshold + ' lat) — czynnik ryzyka krótkoterminowego (ACC/AHA/HRS 2017).');
    var out = function (color, rule) { return { color: color, rule: rule, decisive: decisive, missing: missing, csrs: csrs, warnings: warnings, settings: s, oosPossible: color === 'red' && rule !== 'K0' && s.P1_splitRed && !yesOf('mod').length }; };

    // Kwalifikacja: brak wyniku „poza algorytmem” – wykluczenia dają CZERWONE
    var rules_ = [];
    if (v('K-1T') === 'no') warnings.push('Zgłoszenie >24 h od zdarzenia — poza populacją walidacyjną CSRS; ocena wg cech ESC.');
    if (v('K-1') === 'no') { decisive.push({ code: 'K-1', label: 'Wiek <16 lat — pediatria, poza zakresem narzędzia; konsultacja pediatryczna', src: CSRS + ' (kryteria włączenia)', rule: 'K0', step: 'K' }); rules_.push('K0'); }
    yesOf('excl').forEach(function (c) { decisive.push(Object.assign(R(c, 'K0'), { label: items[c].label + ' — nie jest to typowe omdlenie / wymaga diagnostyki szpitalnej' })); if (rules_.indexOf('K0') < 0) rules_.push('K0'); });

    // CZERWONE – każde kryterium TAK wystarcza, nawet przy brakach danych
    var majors = yesOf('major');
    if (majors.length) { majors.forEach(function (c) { decisive.push(R(c, 'R1')); }); rules_.push('R1'); }
    var minorEv = yesOf('minorEvent'), minorEcg = yesOf('minorEcg');
    var shd = yes('W-H1') || yes('C-2'), ecgAbn = v('G-L1') === 'no';
    if (minorEv.length && (shd || ecgAbn)) {
      minorEv.forEach(function (c) { decisive.push(R(c, 'R2')); });
      decisive.push(shd ? R(yes('W-H1') ? 'W-H1' : 'C-2', 'R2') : { code: 'G-L1', label: 'EKG nieprawidłowe', src: ESC6 + ' (mała + warunek)', rule: 'R2', step: 'G' });
      rules_.push('R2');
    }
    if (minorEcg.length && yes('X-ARR')) {
      minorEcg.forEach(function (c) { decisive.push(R(c, 'R2')); }); decisive.push(R('X-ARR', 'R2'));
      if (rules_.indexOf('R2') < 0) rules_.push('R2');
    }
    if (s.P2_csrsRed && csrs.lowerBound >= 4) {
      decisive.push({ code: 'CSRS', label: 'CSRS ' + fmt(csrs.score) + (csrs.complete ? '' : ' (min. ' + fmt(csrs.lowerBound) + ' mimo braków)') + ' — ' + csrs.category + ', ryzyko SAE 30 dni ' + csrs.risk + '%', src: CSRS, rule: 'R3', step: 'L' });
      rules_.push('R3');
    }
    ['L-HB', 'L-BNP'].forEach(function (c) { if (yes(c) && s[items[c].setting] === 'red') { decisive.push(R(c, 'LAB')); rules_.push('LAB'); } });
    if (rules_.length) return out('red', rules_[0]);

    // ŻÓŁTE = brak danych
    if (missing.length) return out('yellow', 'MISSING');

    // komplet danych: ZIELONE albo ryzyko pośrednie → CZERWONE
    var block = [];
    var lows = codes.filter(function (c) { return /^E-L/.test(c) && yes(c); });
    if (s.P9_requireLow && !lows.length) block.push({ code: 'E-L', label: 'Brak cechy niskiego ryzyka zdarzenia (E-L1…E-L7)', src: 'ESC 2018 Ryc. 6 (P9)', step: 'E' });
    minorEv.concat(minorEcg).forEach(function (c) { block.push(Object.assign(R(c), { label: items[c].label + ' — cecha mała bez spełnionego warunku' })); });
    if (v('G-L1') !== 'yes') block.push({ code: 'G-L1', label: 'EKG nieprawidłowe', src: ESC6, step: 'G' });
    if (v('B-L1') !== 'yes') block.push({ code: 'B-L1', label: 'Badanie przedmiotowe nieprawidłowe', src: ESC6, step: 'B' });
    if (csrs.score > s.P3_csrsGreenMax) block.push({ code: 'CSRS', label: 'CSRS ' + fmt(csrs.score) + ' — ryzyko ' + csrs.category + ' (' + csrs.risk + '%)', src: CSRS + ' (P3)', step: 'L' });
    yesOf('mod').forEach(function (c) { block.push(R(c)); });
    ['L-HB', 'L-BNP'].forEach(function (c) { if (yes(c) && s[items[c].setting] === 'yellow') block.push(Object.assign(R(c), { src: items[c].src + ' (' + items[c].setting.slice(0, 2) + ')' })); });
    if (csrs.troponinMissing && s.P6_tropMissing === 'yellow') block.push({ code: 'C-4', label: 'Troponina nieoznaczona (ustawienie P6)', src: CSRS, step: 'L' });
    if (yes('X-PRE') && s.P7_presyncope === 'yellow') block.push(Object.assign(R('X-PRE'), { src: 'ustawienie P7' }));
    if (yes('X-OLD') && s.P10_ageEffect === 'yellow') block.push(Object.assign(R('X-OLD'), { src: 'ustawienie P10' }));
    if (block.length) { block.forEach(function (b) { b.rule = 'R5'; decisive.push(b); }); return out('red', 'R5'); }
    lows.forEach(function (c) { decisive.push(R(c, 'R4')); });
    decisive.push({ code: 'CSRS', label: 'CSRS ' + fmt(csrs.score) + ' — ryzyko ' + csrs.category + ' (' + csrs.risk + '%)', src: CSRS, rule: 'R4', step: 'L' });
    return out('green', 'R4');
  }

  function override(result, newColor, why) {
    if (result.color === 'yellow') return { ok: false, error: 'Najpierw uzupełnij dane — brak koloru do zmiany.' };
    if (newColor !== 'red' && newColor !== 'green') return { ok: false, error: 'Nieznany kolor' };
    if (RANK[newColor] < RANK[result.color] && !why) return { ok: false, error: 'Zmiana na DOM wymaga wyboru uzasadnienia.' };
    return { ok: true, color: newColor, original: result.color, reason: why || 'podniesienie przez lekarza' };
  }

  return { evaluate: evaluate, csrsScore: csrsScore, requiredMissing: requiredMissing, valueOf: valueOf, override: override, fmt: fmt, index: index };
});
