(function () {
  "use strict";
  var DATA = window.HSK_DATA || { levels: [], lessons: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------------- Lưu trữ ---------------- */
  var KEY = "hsk30-tung-buoc-v1";
  var S = { learned: {}, done: {}, best: {}, points: 0, history: [], tab: "lotrinh", lesson: (DATA.lessons[0] || {}).id, hidePy: false, coverVi: false };
  try { var raw = localStorage.getItem(KEY); if (raw) Object.assign(S, JSON.parse(raw)); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} renderStats(); }

  /* ---------------- Từ điển ---------------- */
  var VOCAB = [], DICT = {};
  DATA.lessons.forEach(function (l) {
    l.vocab.forEach(function (v) { v.lesson = l.id; v.level = l.level; VOCAB.push(v); if (!DICT[v.hz]) DICT[v.hz] = v; });
  });
  var lessonById = function (id) { return DATA.lessons.find(function (l) { return l.id === id; }); };

  /* ---------------- Pinyin ---------------- */
  var TM = { "ā": ["a", 1], "á": ["a", 2], "ǎ": ["a", 3], "à": ["a", 4], "ē": ["e", 1], "é": ["e", 2], "ě": ["e", 3], "è": ["e", 4],
    "ī": ["i", 1], "í": ["i", 2], "ǐ": ["i", 3], "ì": ["i", 4], "ō": ["o", 1], "ó": ["o", 2], "ǒ": ["o", 3], "ò": ["o", 4],
    "ū": ["u", 1], "ú": ["u", 2], "ǔ": ["u", 3], "ù": ["u", 4], "ǖ": ["ü", 1], "ǘ": ["ü", 2], "ǚ": ["ü", 3], "ǜ": ["ü", 4] };
  function parseSyl(s) {
    var tone = 5, base = "";
    s.toLowerCase().replace(/[^a-züĀ-ǜà-ü]/g, "").split("").forEach(function (c) {
      if (TM[c]) { base += TM[c][0]; tone = TM[c][1]; } else base += c;
    });
    return { base: base, tone: tone };
  }
  var INITS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s"];
  function splitSyl(base) {
    var ini = "", fin = base;
    for (var i = 0; i < INITS.length; i++) if (base.indexOf(INITS[i]) === 0) { ini = INITS[i]; fin = base.slice(ini.length); break; }
    if (!ini && base[0] === "y") {
      var r = base.slice(1);
      if (r[0] === "u") fin = "ü" + r.slice(1); else if (r[0] === "i") fin = r; else fin = "i" + r;
    } else if (!ini && base[0] === "w") {
      var w = base.slice(1); fin = w[0] === "u" ? w : "u" + w;
    }
    if ("jqx".indexOf(ini) > -1 && ini && fin[0] === "u") fin = "ü" + fin.slice(1);
    if (fin === "iu") fin = "iou"; else if (fin === "ui") fin = "uei"; else if (fin === "un" && "jqx".indexOf(ini) < 0) fin = "uen";
    return { ini: ini, fin: fin };
  }
  function toneSpans(py) {
    return esc(py).replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, function (c) { return '<span class="tone' + TM[c][1] + '">' + c + "</span>"; });
  }
  function pyColored(py, syl) {
    if (!syl) return toneSpans(py);
    var out = "", pos = 0, low = py.toLowerCase();
    syl.split(" ").forEach(function (s) {
      var i = low.indexOf(s.toLowerCase(), pos);
      if (i < 0) return;
      out += esc(py.slice(pos, i)) + '<span class="tone' + parseSyl(s).tone + '">' + esc(py.slice(i, i + s.length)) + "</span>";
      pos = i + s.length;
    });
    return out + esc(py.slice(pos));
  }

  /* ---------------- Giọng đọc ---------------- */
  var hasTTS = "speechSynthesis" in window, zhVoice = null, voicesChecked = false;
  function loadVoices() {
    if (!hasTTS) return;
    var vs = speechSynthesis.getVoices();
    if (vs.length) voicesChecked = true;
    // Ưu tiên giọng AI tự nhiên: Edge "Xiaoxiao Online (Natural)", Chrome "Google 普通话", Apple bản Premium/Enhanced
    var score = function (v) {
      var n = v.name || "", sc = /zh[-_]CN/i.test(v.lang) ? 100 : /^zh|cmn/i.test(v.lang) && !/HK|TW|yue/i.test(v.lang) ? 50 : 0;
      if (!sc) return 0;
      if (/Natural|Neural|Online/i.test(n)) sc += 40; if (/Xiaoxiao|Xiaoyi|Yunxi/i.test(n)) sc += 10;
      if (/Google/i.test(n)) sc += 30; if (/Premium|Enhanced/i.test(n)) sc += 25; if (/Tingting|Ting-Ting|Lili/i.test(n)) sc += 5;
      return sc;
    };
    zhVoice = vs.filter(score).sort(function (a, b) { return score(b) - score(a); })[0] || null;
  }
  if (hasTTS) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  var playingEl = null;
  function speak(text, rate, el) {
    if (!hasTTS || !text) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text.replace(/[→]/g, " "));
    u.lang = "zh-CN"; if (zhVoice) u.voice = zhVoice; u.rate = rate || 0.85;
    if (playingEl) playingEl.classList.remove("playing");
    playingEl = el || null;
    if (el) el.classList.add("playing");
    u.onend = u.onerror = function () { if (el) el.classList.remove("playing"); };
    speechSynthesis.speak(u);
  }
  var ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5h3l4-3v12l-4-3H2z"/><path d="M11 4.5a4.5 4.5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  function playBtn(text, label) { return '<button class="iconbtn" data-speak="' + esc(text) + '" aria-label="' + esc(label || "Nghe") + '">' + ICON_PLAY + "</button>"; }

  /* ---------------- Khẩu hình: dữ liệu ---------------- */
  var REST = [58, 128, 76, 120, 100, 114, 128, 112, 156, 118, 180, 140];
  var ST = {
    rest: { p: REST, gap: 2, round: 0, jaw: .15 },
    bilabial: { p: REST, gap: 0, round: .1, jaw: .1, hit: [38, 113] },
    labiodental: { p: REST, gap: 0, round: 0, jaw: .1, bite: 1, hit: [50, 111] },
    alveolar: { p: [59, 98, 72, 104, 98, 110, 128, 112, 156, 118, 180, 140], gap: 3, round: 0, jaw: .2, hit: [60, 96] },
    velar: { p: [58, 130, 80, 124, 108, 114, 140, 94, 166, 86, 184, 128], gap: 4, round: 0, jaw: .3, hit: [166, 84] },
    palatal: { p: [56, 126, 72, 108, 96, 86, 124, 80, 156, 102, 180, 140], gap: 2, round: 0, jaw: .15, hit: [108, 78] },
    retroflex: { p: [84, 86, 80, 102, 102, 116, 130, 114, 158, 118, 182, 140], gap: 3, round: .1, jaw: .2, hit: [84, 83] },
    dental: { p: [56, 108, 68, 112, 98, 114, 128, 113, 156, 118, 180, 140], gap: 3, round: 0, jaw: .15, hit: [56, 105] },
    A: { p: [62, 140, 82, 140, 108, 138, 136, 132, 162, 130, 184, 148], gap: 16, round: 0, jaw: 1 },
    I: { p: [58, 128, 72, 106, 96, 88, 124, 84, 154, 104, 180, 140], gap: 4, round: 0, jaw: .2 },
    U: { p: [60, 134, 82, 130, 112, 118, 140, 98, 164, 94, 184, 130], gap: 4, round: 1, jaw: .25 },
    V: { p: [58, 128, 72, 106, 96, 88, 124, 84, 154, 104, 180, 140], gap: 3, round: 1, jaw: .2 },
    E: { p: [60, 134, 82, 130, 110, 120, 138, 106, 162, 104, 183, 136], gap: 8, round: 0, jaw: .5 },
    EF: { p: [58, 132, 74, 118, 98, 104, 126, 102, 156, 112, 181, 140], gap: 9, round: 0, jaw: .45 },
    O: { p: [60, 134, 82, 130, 110, 120, 138, 106, 162, 104, 183, 136], gap: 7, round: .75, jaw: .45 },
    ER: { p: [82, 96, 78, 108, 102, 118, 130, 116, 158, 118, 182, 140], gap: 8, round: .2, jaw: .4 },
    APICAL: { p: [57, 112, 70, 114, 98, 115, 128, 113, 156, 118, 180, 140], gap: 4, round: 0, jaw: .2 },
    RETRO_I: { p: [84, 90, 80, 104, 102, 116, 130, 114, 158, 118, 182, 140], gap: 4, round: .1, jaw: .2 }
  };
  var INI = {
    b: { st: "bilabial", asp: 0, nasal: 0, voiced: 0, name: "âm hai môi, không bật hơi", tip: "Hai môi khép kín rồi bật ra nhẹ, không phả hơi, không rung dây thanh. Nghe nằm giữa “b” và “p” tiếng Việt." },
    p: { st: "bilabial", asp: 1, nasal: 0, voiced: 0, name: "âm hai môi, bật hơi", tip: "Khép môi như b nhưng bật mạnh một luồng hơi. Để tờ giấy trước miệng, giấy phải rung." },
    m: { st: "bilabial", asp: 0, nasal: 1, voiced: 1, name: "âm hai môi, âm mũi", tip: "Môi khép, hơi đi ra đường mũi, dây thanh rung. Giống “m” tiếng Việt." },
    f: { st: "labiodental", asp: 0, nasal: 0, voiced: 0, name: "âm môi răng", tip: "Răng trên chạm nhẹ môi dưới, hơi cọ xát đi ra. Giống “ph” tiếng Việt." },
    d: { st: "alveolar", asp: 0, nasal: 0, voiced: 0, name: "âm đầu lưỡi, không bật hơi", tip: "Đầu lưỡi chạm lợi trên rồi bật ra nhẹ. Gần “t” tiếng Việt." },
    t: { st: "alveolar", asp: 1, nasal: 0, voiced: 0, name: "âm đầu lưỡi, bật hơi", tip: "Đặt lưỡi như d, bật mạnh hơi ra. Gần “th” tiếng Việt." },
    n: { st: "alveolar", asp: 0, nasal: 1, voiced: 1, name: "âm đầu lưỡi, âm mũi", tip: "Đầu lưỡi chạm lợi trên, hơi ra đường mũi. Giống “n” tiếng Việt." },
    l: { st: "alveolar", asp: 0, nasal: 0, voiced: 1, name: "âm đầu lưỡi, âm biên", tip: "Đầu lưỡi chạm lợi trên, hơi thoát ra hai bên lưỡi. Giống “l” tiếng Việt." },
    g: { st: "velar", asp: 0, nasal: 0, voiced: 0, name: "âm cuống lưỡi, không bật hơi", tip: "Cuống lưỡi áp vào ngạc mềm rồi bật ra nhẹ. Gần “c/k” tiếng Việt." },
    k: { st: "velar", asp: 1, nasal: 0, voiced: 0, name: "âm cuống lưỡi, bật hơi", tip: "Đặt lưỡi như g, bật mạnh hơi. Đây là âm tắc, không đọc thành “kh” tiếng Việt." },
    h: { st: "velar", asp: 0, nasal: 0, voiced: 0, name: "âm cuống lưỡi, xát", tip: "Cuống lưỡi nâng gần ngạc mềm, hơi cọ xát đi ra. Gần “kh” tiếng Việt." },
    j: { st: "palatal", asp: 0, nasal: 0, voiced: 0, name: "âm mặt lưỡi, không bật hơi", tip: "Đầu lưỡi tì sau răng dưới, mặt lưỡi áp ngạc cứng. Gần “ch” tiếng Việt nhưng môi kéo dẹt." },
    q: { st: "palatal", asp: 1, nasal: 0, voiced: 0, name: "âm mặt lưỡi, bật hơi", tip: "Đặt lưỡi như j, bật mạnh hơi. Môi dẹt, đừng chụm." },
    x: { st: "palatal", asp: 0, nasal: 0, voiced: 0, name: "âm mặt lưỡi, xát", tip: "Mặt lưỡi nâng sát ngạc cứng, hơi xát qua khe hẹp. Gần “x” tiếng Việt nhưng lưỡi nâng cao hơn." },
    zh: { st: "retroflex", asp: 0, nasal: 0, voiced: 0, name: "âm uốn lưỡi, không bật hơi", tip: "Uốn đầu lưỡi lên chạm phía sau lợi trên, bật ra nhẹ. Gần “tr” tiếng Việt." },
    ch: { st: "retroflex", asp: 1, nasal: 0, voiced: 0, name: "âm uốn lưỡi, bật hơi", tip: "Đặt lưỡi như zh, bật mạnh hơi ra." },
    sh: { st: "retroflex", asp: 0, nasal: 0, voiced: 0, name: "âm uốn lưỡi, xát", tip: "Uốn lưỡi gần sau lợi trên, hơi cọ xát. Gần “s” uốn lưỡi tiếng Việt." },
    r: { st: "retroflex", asp: 0, nasal: 0, voiced: 1, name: "âm uốn lưỡi, xát hữu thanh", tip: "Uốn lưỡi như sh nhưng rung dây thanh. Không rung đầu lưỡi như “r” tiếng Việt." },
    z: { st: "dental", asp: 0, nasal: 0, voiced: 0, name: "âm đầu lưỡi trước, không bật hơi", tip: "Đầu lưỡi thẳng chạm sau răng trên, bật ra kèm tiếng xát nhẹ, như “tz” trong “pizza”." },
    c: { st: "dental", asp: 1, nasal: 0, voiced: 0, name: "âm đầu lưỡi trước, bật hơi", tip: "Đặt lưỡi như z, bật mạnh hơi, nghe như “ts”." },
    s: { st: "dental", asp: 0, nasal: 0, voiced: 0, name: "âm đầu lưỡi trước, xát", tip: "Đầu lưỡi gần sau răng trên, hơi xát qua. Giống “x” tiếng Việt." }
  };
  var VOW = {
    A: { name: "a", tip: "Há miệng to, lưỡi hạ thấp. Giống “a” tiếng Việt." },
    O: { name: "o", tip: "Môi tròn, lưỡi lùi về sau. Gần “ô”, mở đầu hơi có “u” (bo nghe như “buô”)." },
    E: { name: "e", tip: "Môi dẹt, lưỡi lùi. Bắt đầu gần “ơ” rồi trượt nhẹ sang “ưa”." },
    EF: { name: "ê", tip: "Lưỡi ở giữa phía trước, miệng hơi mở. Gần “ê” tiếng Việt." },
    I: { name: "i", tip: "Môi kéo dẹt sang hai bên, mặt lưỡi nâng cao. Giống “i” tiếng Việt." },
    U: { name: "u", tip: "Môi chụm tròn, cuống lưỡi nâng cao. Giống “u” tiếng Việt." },
    V: { name: "ü", tip: "Lưỡi đặt như “i”, môi chụm như “u”. Tiếng Việt không có âm này." },
    ER: { name: "er", tip: "Đọc “ơ” rồi cong đầu lưỡi lên." },
    APICAL: { name: "-i (sau z c s)", tip: "Giữ lưỡi ở vị trí z/c/s, kéo dài hơi thành tiếng gần “ư”." },
    RETRO_I: { name: "-i (sau zh ch sh r)", tip: "Giữ lưỡi uốn như zh/ch/sh, kéo dài thành tiếng gần “ư” uốn lưỡi." }
  };
  function stepsFor(sylStr) {
    var p = parseSyl(sylStr), sp = splitSyl(p.base), steps = [];
    if (sp.ini) {
      var I = INI[sp.ini];
      steps.push({ st: I.st, air: I.nasal ? "nose" : "mouth", asp: I.asp, voiced: I.voiced, title: "Thanh mẫu " + sp.ini, sub: I.name, tip: I.tip });
    }
    var fin = sp.fin, end = "";
    if (/ng$/.test(fin)) { end = "ng"; fin = fin.slice(0, -2); } else if (/n$/.test(fin) && fin !== "n") { end = "n"; fin = fin.slice(0, -1); }
    var keys = [];
    if (fin === "er") keys = ["ER"];
    else if (fin === "i" && "zcs".indexOf(sp.ini) > -1 && sp.ini.length === 1) keys = ["APICAL"];
    else if (fin === "i" && ["zh", "ch", "sh", "r"].indexOf(sp.ini) > -1) keys = ["RETRO_I"];
    else {
      for (var i = 0; i < fin.length; i++) {
        var c = fin[i], prev = fin[i - 1];
        if (c === "a") keys.push((prev === "i" || prev === "ü") && end === "n" ? "EF" : "A");
        else if (c === "o") keys.push(end === "ng" ? "U" : "O");
        else if (c === "e") keys.push(prev === "i" || prev === "ü" || fin[i + 1] === "i" ? "EF" : "E");
        else if (c === "i") keys.push("I");
        else if (c === "u") keys.push("U");
        else if (c === "ü" || c === "v") keys.push("V");
      }
    }
    keys.forEach(function (k) { steps.push({ st: k, air: "mouth", voiced: 1, title: "Vận mẫu: " + VOW[k].name, sub: "", tip: VOW[k].tip }); });
    if (end === "n") steps.push({ st: "alveolar", air: "nose", voiced: 1, title: "Âm cuối -n", sub: "", tip: "Kết thúc bằng đầu lưỡi chạm lợi trên, hơi ra mũi, như “n” cuối tiếng Việt." });
    if (end === "ng") steps.push({ st: "velar", air: "nose", voiced: 1, title: "Âm cuối -ng", sub: "", tip: "Kết thúc bằng cuống lưỡi áp ngạc mềm, hơi ra mũi, như “ng” cuối tiếng Việt." });
    return { steps: steps, tone: p.tone, ini: sp.ini, fin: sp.fin };
  }

  /* ---------------- Khẩu hình: vẽ ---------------- */
  function artSVG() {
    return '<svg class="art" viewBox="0 0 240 220" role="img" aria-label="Mặt cắt khoang miệng">' +
      '<path class="flesh" d="M76,0 C58,8 46,26 42,44 L22,66 Q16,74 26,78 L40,86 Q46,92 54,94 L240,94 L240,0 Z"/>' +
      '<path class="flesh" d="M196,90 L240,90 L240,220 L198,220 Z"/>' +
      '<path class="cavity" d="M28,76 C40,66 60,62 80,66 C100,62 130,58 150,62 C168,66 182,76 190,92 L197,92 C197,72 186,54 160,46 C120,38 70,44 40,58 L32,68 Z"/>' +
      '<path class="cavity" d="M54,98 C62,88 72,84 86,82 C110,74 135,72 150,76 C165,80 175,88 182,100 Q185,108 183,114 Q189,106 190,96 L197,92 L198,220 L176,220 L56,140 Z"/>' +
      '<text class="lbl" x="92" y="56">Khoang mũi</text><text class="lbl" x="100" y="90">Ngạc cứng</text><text class="lbl" x="150" y="96" text-anchor="end">Ngạc mềm</text><text class="lbl" x="62" y="92">Lợi</text>' +
      '<g id="jaw"><path class="flesh" d="M30,124 C36,121 46,120 56,120 L60,150 C84,176 124,192 176,202 L178,220 L40,220 C34,192 30,160 30,124 Z"/>' +
      '<path class="tooth" d="M47,119 Q51,116 55,119 L56,134 L47,134 Z"/></g>' +
      '<path class="tongue" id="tongue"/>' +
      '<path class="tooth" d="M46,96 L56,96 L55,112 Q51,114 47,112 Z"/>' +
      '<path id="ulip" fill="var(--lip)" stroke="var(--flesh-edge)" stroke-width="1.2"/>' +
      '<path id="llip" fill="var(--lip)" stroke="var(--flesh-edge)" stroke-width="1.2"/>' +
      '<path class="air" id="airMouth" d="M188,212 L190,150 Q186,120 160,104 Q120,96 80,106 Q60,110 28,113"/>' +
      '<path class="air" id="airNose" d="M188,212 L192,120 L192,96 Q186,74 150,60 Q100,52 60,62 Q40,68 20,76"/>' +
      '<g id="puffs"><circle class="puff" cx="24" cy="113" r="4"/><circle class="puff" cx="20" cy="109" r="3" style="animation-delay:.3s"/></g>' +
      '<path class="voice" id="voice" d="M180,208 l4,-4 l4,4 l4,-4 l4,4"/>' +
      '<circle class="hit" id="hit" r="6" cx="-20" cy="-20"/>' +
      '<text class="lbl" x="200" y="216">Dây thanh</text>' +
      "</svg>";
  }
  function lipsSVG() {
    return '<svg class="art" viewBox="0 0 120 80" role="img" aria-label="Khẩu hình môi nhìn chính diện">' +
      '<defs><clipPath id="mclip"><ellipse id="mclipE" cx="60" cy="40" rx="20" ry="2"/></clipPath></defs>' +
      '<ellipse id="lipO" cx="60" cy="40" rx="34" ry="14" fill="var(--lip)" stroke="var(--flesh-edge)" stroke-width="1.2"/>' +
      '<ellipse id="lipI" cx="60" cy="40" rx="26" ry="2" fill="var(--mouth)"/>' +
      '<g clip-path="url(#mclip)"><rect id="teethU" x="40" y="20" width="40" height="6" fill="var(--tooth)"/><ellipse id="tongueF" cx="60" cy="60" rx="16" ry="8" fill="var(--tongue)"/></g>' +
      "</svg>";
  }
  function toneSVG() {
    var y = function (l) { return 94 - (l - 1) * 20; }, g = "";
    for (var l = 1; l <= 5; l++) g += '<line x1="22" x2="152" y1="' + y(l) + '" y2="' + y(l) + '"/><text x="8" y="' + (y(l) + 3) + '">' + l + "</text>";
    return '<svg class="tonechart" viewBox="0 0 160 104" role="img" aria-label="Đường thanh điệu"><g class="grid">' + g + '</g><path class="curve" id="toneCurve"/></svg>';
  }
  var TONE_D = {
    1: "M30,14 L148,14", 2: "M30,54 C80,50 120,30 148,14", 3: "M30,74 C55,90 75,96 92,92 C115,86 135,50 148,34", 4: "M30,14 C70,30 110,64 148,94", 5: "M76,54 L96,54"
  };
  var TONE_NAME = { 1: "Thanh 1 (ngang, cao 55)", 2: "Thanh 2 (lên, 35)", 3: "Thanh 3 (xuống rồi lên, 214)", 4: "Thanh 4 (xuống mạnh, 51)", 5: "Thanh nhẹ (ngắn, nhẹ)" };

  function cr(pts) {
    var P = []; for (var i = 0; i < pts.length; i += 2) P.push([pts[i], pts[i + 1]]);
    var d = "M" + P[0][0].toFixed(1) + "," + P[0][1].toFixed(1);
    for (var j = 0; j < P.length - 1; j++) {
      var p0 = P[j - 1] || P[j], p1 = P[j], p2 = P[j + 1], p3 = P[j + 2] || p2;
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + "," + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + "," + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    return d;
  }
  var cur = { p: REST.slice(), gap: 2, round: 0, jaw: .15, bite: 0 };
  function drawArt(s) {
    var tg = $("#tongue"); if (!tg) return;
    var p = s.p, jy = s.jaw * 14;
    tg.setAttribute("d", cr(p) + " L" + (p[10] + 2) + "," + (p[11] + 44 + jy * .4) + " L176," + (212) + " L90," + (186 + jy * .6) + " L" + (p[0] + 4) + "," + (p[1] + 16) + " Z");
    $("#jaw").setAttribute("transform", "translate(0," + jy.toFixed(1) + ")");
    var r = s.round, ub = 113 - s.gap / 2, lb = 113 + s.gap / 2, bx = s.bite * 7;
    if (s.bite) lb = 113 - 3 * s.bite + (1 - s.bite) * lb;
    $("#ulip").setAttribute("d", "M48,90 C42,90 " + (34 - 4 * r) + ",95 " + (30 - 7 * r) + "," + (ub - 4) + " Q" + (34 - 6 * r) + "," + ub + " 47," + ub + " Z");
    $("#llip").setAttribute("d", "M" + (47 + bx) + "," + lb + " Q" + (34 - 6 * r + bx) + "," + lb + " " + (30 - 7 * r + bx) + "," + (lb + 5) + " C" + (32 - 4 * r + bx) + "," + (lb + 13) + " 40," + (lb + 15 + jy * .3) + " 48," + (lb + 15 + jy * .3) + " Z");
    var orx = 34 - 12 * r, irx = 27 - 14 * r, iry = Math.max(.8, s.gap * .95);
    $("#lipO").setAttribute("rx", orx); $("#lipO").setAttribute("ry", 10 + iry * .9);
    $("#lipI").setAttribute("rx", irx); $("#lipI").setAttribute("ry", iry);
    $("#mclipE").setAttribute("rx", irx); $("#mclipE").setAttribute("ry", iry);
    $("#teethU").setAttribute("y", 40 - iry); $("#teethU").setAttribute("height", Math.min(5, iry * .5));
    $("#tongueF").setAttribute("cy", 40 + iry + 4 - Math.min(6, iry * .4));
  }
  var animToken = 0;
  function tweenTo(target, ms) {
    var from = JSON.parse(JSON.stringify(cur)), t0 = performance.now(), tok = animToken;
    var to = { p: target.p, gap: target.gap, round: target.round, jaw: target.jaw, bite: target.bite || 0 };
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    return new Promise(function (res) {
      (function frame(now) {
        if (tok !== animToken) return res(false);
        var k = reduce ? 1 : Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        cur = { p: from.p.map(function (v, i) { return v + (to.p[i] - v) * e; }), gap: from.gap + (to.gap - from.gap) * e,
          round: from.round + (to.round - from.round) * e, jaw: from.jaw + (to.jaw - from.jaw) * e, bite: from.bite + (to.bite - from.bite) * e };
        drawArt(cur);
        if (k < 1) requestAnimationFrame(frame); else res(true);
      })(t0);
    });
  }
  function wait(ms) { var tok = animToken; return new Promise(function (r) { setTimeout(function () { r(tok === animToken); }, ms); }); }
  function setFx(step) {
    var on = function (id, v) { var el = $(id); if (el) el.classList.toggle("on", !!v); };
    on("#airMouth", step && step.air === "mouth"); on("#airNose", step && step.air === "nose");
    on("#voice", step && step.voiced);
    document.querySelectorAll("#puffs .puff").forEach(function (c) { c.classList.toggle("on", !!(step && step.asp)); });
    var h = $("#hit"), st = step && ST[step.st];
    if (h) { if (st && st.hit) { h.setAttribute("cx", st.hit[0]); h.setAttribute("cy", st.hit[1]); h.classList.add("on"); } else h.classList.remove("on"); }
  }
  async function playSteps(steps) {
    animToken++;
    var tok = animToken, lis = document.querySelectorAll("#steps li");
    setFx(null);
    await tweenTo(ST.rest, 220);
    for (var i = 0; i < steps.length; i++) {
      if (tok !== animToken) return;
      lis.forEach(function (li, j) { li.classList.toggle("now", j === i); });
      setFx(null);
      if (!(await tweenTo(ST[steps[i].st], 420))) return;
      setFx(steps[i]);
      if (!(await wait(steps.length > 3 ? 900 : 1150))) return;
    }
  }

  /* ---------------- Ngăn kéo phát âm ---------------- */
  var drawerItem = null, drawerSyl = 0;
  function openDrawer(item) {
    drawerItem = item; drawerSyl = 0;
    var d = $("#drawer"), hasPron = !!item.syl, sy = hasPron ? item.syl.split(" ") : [], chars = Array.from(item.hz || "").filter(function (c) { return /[㐀-鿿]/.test(c); });
    var sandhi = [];
    sy.forEach(function (s, i) { if (i < sy.length - 1 && parseSyl(s).tone === 3 && parseSyl(sy[i + 1]).tone === 3) sandhi.push(s); });
    var isVocab = !!DICT[item.hz] && !item.board;
    d.innerHTML =
      '<button class="btn small close" data-close>Đóng</button>' +
      '<div class="d-head">' +
        (item.board ? '<div class="big py" style="font-size:56px;line-height:1;font-weight:700">' + esc(item.board) + "</div>" : '<div class="hz say" data-speak="' + esc(item.hz) + '">' + esc(item.hz) + "</div>") +
        '<div><div class="py">' + pyColored(item.py, item.syl) + "</div>" +
        '<div class="meta">' + (item.board ? 'Ví dụ: <span class="hz say" data-speak="' + esc(item.hz) + '" style="font-size:20px">' + esc(item.hz) + "</span> " + esc(item.py) : esc([item.hv ? "Hán Việt: " + item.hv : "", item.pos].filter(Boolean).join(" · "))) + "</div>" +
        (item.vi ? '<div style="font-weight:600">' + esc(item.vi) + "</div>" : "") + "</div></div>" +
      '<div class="row"><button class="btn primary" data-act="say">' + ICON_PLAY.replace("<svg", '<svg width="14" height="14" fill="currentColor"') + " Nghe</button>" +
        '<button class="btn" data-act="slow">Nghe chậm</button><button class="btn" data-act="replay">Xem lại khẩu hình</button>' +
        (isVocab ? '<button class="mark' + (S.learned[item.hz] ? " on" : "") + '" data-learn="' + esc(item.hz) + '">' + (S.learned[item.hz] ? "Đã thuộc" : "Đánh dấu đã thuộc") + "</button>" : "") + "</div>" +
      '<div class="seg" role="tablist">' + (hasPron ? '<button data-dtab="pron" aria-selected="true">Phát âm</button>' : "") + '<button data-dtab="write" aria-selected="' + !hasPron + '">Cách viết</button></div>' +
      '<div id="dPron" class="dpanel"' + (hasPron ? "" : " hidden") + ">" +
      (sy.length > 1 ? '<div><div class="eyebrow" style="margin-bottom:6px">Chọn âm tiết</div><div class="syls">' + sy.map(function (s, i) {
        return '<button class="syl" data-syl="' + i + '" aria-pressed="' + (i === 0) + '"><span class="tone' + parseSyl(s).tone + '">' + esc(s) + "</span>" + (chars[i] ? ' <span class="hz">' + esc(chars[i]) + "</span>" : "") + "</button>";
      }).join("") + "</div></div>" : "") +
      '<div class="stage"><figure>' + artSVG() + "<figcaption>Mặt cắt: lưỡi, môi, luồng hơi</figcaption></figure>" +
        '<div class="side-col"><figure>' + lipsSVG() + "<figcaption>Khẩu hình môi</figcaption></figure>" +
        '<figure>' + toneSVG() + '<figcaption id="toneName"></figcaption></figure></div></div>' +
      '<ol class="steps" id="steps"></ol>' +
      '<div class="legend"><span style="color:var(--air)">Luồng hơi</span><span style="color:var(--jade)">Điểm tiếp xúc / dây thanh rung</span></div>' +
      (sandhi.length ? '<div class="notice">Biến điệu: hai thanh 3 liền nhau, âm <b>' + esc(sandhi.join(", ")) + "</b> đọc thành thanh 2.</div>" : "") + "</div>" +
      '<div id="dWrite" class="dpanel"' + (hasPron ? " hidden" : "") + ">" + writePanel(chars) + "</div>" +
      (item.ex ? '<div><div class="eyebrow">Câu ví dụ</div><span class="ex say" data-speak="' + esc(item.ex.hz) + '"><span class="hz">' + esc(item.ex.hz) + "</span>" + toneSpans(item.ex.py) + "<small>" + esc(item.ex.vi) + "</small></span></div>" : "") +
      (!hasTTS ? '<div class="notice warn">Trình duyệt này không hỗ trợ đọc giọng nói. Hãy mở bằng Chrome, Edge hoặc Safari.</div>'
        : (voicesChecked && !zhVoice ? '<div class="notice warn">Thiết bị chưa có giọng đọc tiếng Trung. Trên Windows: Cài đặt, Thời gian và ngôn ngữ, Giọng nói, thêm Chinese (Simplified). Trên điện thoại: cài gói giọng nói tiếng Trung trong phần Chuyển văn bản thành giọng nói.</div>' : ""));
    d.hidden = false; $("#scrim").hidden = false;
    cur = { p: REST.slice(), gap: 2, round: 0, jaw: .15, bite: 0 }; drawArt(cur);
    writer = null; wChars = chars;
    if (hasPron) showSyl(0, true);
    if (!hasPron || S.dtab === "write") setDTab("write");
    speak(item.hz, 0.8);
    d.querySelector("[data-close]").focus({ preventScroll: true });
  }
  function showSyl(i, noSpeak) {
    drawerSyl = i;
    var sy = drawerItem.syl.split(" ")[i], info = stepsFor(sy);
    document.querySelectorAll(".syl").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.syl === i)); });
    $("#steps").innerHTML = info.steps.map(function (s) { return "<li><b>" + esc(s.title) + (s.sub ? " · " + esc(s.sub) : "") + "</b><span>" + esc(s.tip) + "</span></li>"; }).join("");
    var tc = $("#toneCurve"); tc.setAttribute("d", TONE_D[info.tone]); tc.setAttribute("stroke", "var(--t" + info.tone + ")");
    $("#toneName").textContent = TONE_NAME[info.tone];
    if (!noSpeak) {
      var chars = Array.from(drawerItem.hz || "").filter(function (c) { return /[㐀-鿿]/.test(c); });
      speak(chars[i] || drawerItem.hz, 0.7);
    }
    playSteps(info.steps);
  }
  /* ---------------- Cách viết (Hanzi Writer) ---------------- */
  var writer = null, wChars = [], wIdx = 0, wStep = 0;
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function miziSVG() {
    return '<svg class="mizi-grid" viewBox="0 0 100 100" aria-hidden="true"><rect x="1" y="1" width="98" height="98" fill="none" stroke-width="1.2"/>' +
      '<line x1="50" y1="1" x2="50" y2="99"/><line x1="1" y1="50" x2="99" y2="50"/><line x1="1" y1="1" x2="99" y2="99"/><line x1="99" y1="1" x2="1" y2="99"/></svg>';
  }
  function writePanel(chars) {
    if (!chars.length) return '<div class="notice">Không có chữ Hán để hướng dẫn viết.</div>';
    return (chars.length > 1 ? '<div class="syls">' + chars.map(function (c, i) { return '<button class="syl" data-wc="' + i + '" aria-pressed="' + (i === 0) + '"><span class="hz">' + esc(c) + "</span></button>"; }).join("") + "</div>" : "") +
      '<div class="wbox"><div class="mizi">' + miziSVG() + '<div id="hzw"></div></div>' +
      '<div class="wside"><div id="wInfo" class="eyebrow">Đang tải dữ liệu nét...</div>' +
      '<div class="row"><button class="btn primary" data-w="anim">Xem cách viết</button><button class="btn" data-w="step">Từng nét</button><button class="btn" data-w="quiz">Luyện viết</button></div>' +
      '<div id="wMsg" class="notice" aria-live="polite">Bấm “Luyện viết” rồi dùng chuột hoặc ngón tay viết lên ô. Sai 2 lần sẽ có gợi ý nét.</div></div></div>' +
      '<details class="rules"><summary>Quy tắc bút thuận</summary><ul>' +
      "<li>Ngang trước, sổ sau: 十</li><li>Phẩy trước, mác sau: 八</li><li>Trên trước, dưới sau: 三</li><li>Trái trước, phải sau: 你</li>" +
      "<li>Ngoài trước, trong sau: 月</li><li>Vào nhà trước, đóng cửa sau: 回</li><li>Giữa trước, hai bên sau: 小</li></ul></details>";
  }
  var chunkDone = {};
  function loadScript(src, cb) { var sc = document.createElement("script"); sc.src = src; sc.onload = function () { cb(true); }; sc.onerror = function () { cb(false); }; document.head.appendChild(sc); }
  function loadStrokes(chars, cb) {
    window.HZ_STROKES = window.HZ_STROKES || {};
    var need = {}; chars.forEach(function (c) { var b = c.codePointAt(0) % 64; if (!window.HZ_STROKES[c] && !chunkDone[b]) need[b] = 1; });
    var ks = Object.keys(need), left = ks.length, ok = true; if (!left) return cb(true);
    ks.forEach(function (b) { loadScript("data/strokes/" + ("0" + b).slice(-2) + ".js", function (r) { if (r) chunkDone[b] = 1; else ok = false; if (!--left) cb(ok); }); });
  }
  function setDTab(t) {
    S.dtab = t; save();
    document.querySelectorAll("[data-dtab]").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.dtab === t)); });
    var pr = $("#dPron"), wr = $("#dWrite"); if (!wr) return;
    if (pr) pr.hidden = t !== "pron"; wr.hidden = t !== "write";
    if (t === "write") { if (!wChars.length) return; loadStrokes(wChars, function (ok) { if (!ok) { $("#wInfo").textContent = "Không tải được dữ liệu nét chữ."; return; } showWriteChar(wIdx = 0, true); }); }
    else if (drawerItem && drawerItem.syl) showSyl(drawerSyl, true);
  }
  function showWriteChar(i, autoplay) {
    var c = wChars[i], data = window.HZ_STROKES && window.HZ_STROKES[c];
    wIdx = i; wStep = 0;
    document.querySelectorAll("[data-wc]").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.wc === i)); });
    if (!data) { $("#wInfo").textContent = "Chưa có dữ liệu nét cho chữ " + c; $("#hzw").innerHTML = ""; writer = null; return; }
    $("#wInfo").textContent = "Chữ " + c + " · " + data.strokes.length + " nét" + (data.radStrokes && data.radStrokes.length ? " · phần màu xanh là bộ thủ" : "");
    $("#wMsg").textContent = "Bấm “Luyện viết” rồi dùng chuột hoặc ngón tay viết lên ô. Sai 2 lần sẽ có gợi ý nét.";
    var opts = { width: 220, height: 220, padding: 14, showOutline: true, showCharacter: false,
      strokeColor: tok("--ink"), radicalColor: tok("--jade"), outlineColor: tok("--line"), highlightColor: tok("--air"), drawingColor: tok("--t1"),
      strokeAnimationSpeed: 1, delayBetweenStrokes: 280, charDataLoader: function (ch, ok, err) { var d = window.HZ_STROKES[ch]; d ? ok(d) : err("missing"); } };
    if (!writer) { $("#hzw").innerHTML = ""; writer = HanziWriter.create("hzw", c, opts); }
    else { writer.cancelQuiz(); writer.setCharacter(c); writer.hideCharacter(); }
    if (autoplay) writer.animateCharacter();
  }
  function writeAct(a) {
    if (!writer) return;
    var data = window.HZ_STROKES[wChars[wIdx]], n = data.strokes.length;
    writer.cancelQuiz();
    if (a === "anim") { wStep = 0; writer.hideCharacter(); writer.animateCharacter(); speak(wChars[wIdx], 0.8); }
    else if (a === "step") {
      if (wStep === 0 || wStep >= n) { writer.hideCharacter(); wStep = 0; }
      writer.animateStroke(wStep); wStep++;
      $("#wMsg").textContent = "Nét " + wStep + "/" + n + (wStep >= n ? ". Bấm “Từng nét” để làm lại." : ". Bấm “Từng nét” để xem nét tiếp theo.");
    } else if (a === "quiz") {
      wStep = 0; writer.hideCharacter();
      $("#wMsg").textContent = "Viết nét 1/" + n + " lên ô.";
      writer.quiz({ showHintAfterMisses: 2, highlightOnComplete: true,
        onCorrectStroke: function (d) { $("#wMsg").textContent = d.strokesRemaining ? "Đúng. Viết nét " + (d.strokeNum + 2) + "/" + n + "." : "Đúng."; },
        onMistake: function (d) { $("#wMsg").textContent = "Chưa đúng nét " + (d.strokeNum + 1) + ". Thử lại" + (d.mistakesOnStroke >= 2 ? ", nét gợi ý đang nhấp nháy." : "."); },
        onComplete: function (d) { $("#wMsg").textContent = "Hoàn thành chữ " + d.character + ", sai " + d.totalMistakes + " lần." + (d.totalMistakes === 0 ? " Rất tốt!" : ""); speak(d.character, 0.8); } });
    }
  }

  function closeDrawer() { animToken++; if (writer) { try { writer.cancelQuiz(); } catch (e) {} } writer = null; $("#drawer").hidden = true; $("#scrim").hidden = true; if (hasTTS) speechSynthesis.cancel(); }

  /* ---------------- Bảng phát âm ---------------- */
  var BOARD = {
    tones: [["mā", "妈", "mẹ"], ["má", "麻", "cây gai"], ["mǎ", "马", "ngựa"], ["mà", "骂", "mắng"], ["ma", "吗", "trợ từ hỏi"]],
    initials: [
      ["Hai môi, môi răng", [["b", "八", "bā"], ["p", "怕", "pà"], ["m", "妈", "mā"], ["f", "发", "fā"]]],
      ["Đầu lưỡi giữa", [["d", "大", "dà"], ["t", "他", "tā"], ["n", "拿", "ná"], ["l", "拉", "lā"]]],
      ["Cuống lưỡi", [["g", "哥", "gē"], ["k", "渴", "kě"], ["h", "喝", "hē"]]],
      ["Mặt lưỡi", [["j", "鸡", "jī"], ["q", "七", "qī"], ["x", "西", "xī"]]],
      ["Uốn lưỡi", [["zh", "知", "zhī"], ["ch", "吃", "chī"], ["sh", "诗", "shī"], ["r", "日", "rì"]]],
      ["Đầu lưỡi trước", [["z", "资", "zī"], ["c", "次", "cì"], ["s", "四", "sì"]]]
    ],
    finals: [
      ["Vận mẫu đơn", [["a", "啊", "ā"], ["o", "喔", "ō"], ["e", "饿", "è"], ["i", "衣", "yī"], ["u", "屋", "wū"], ["ü", "鱼", "yú"], ["er", "二", "èr"]]],
      ["Vận mẫu kép", [["ai", "爱", "ài"], ["ei", "飞", "fēi"], ["ao", "好", "hǎo"], ["ou", "口", "kǒu"], ["ia", "家", "jiā"], ["ie", "谢", "xiè"], ["iao", "小", "xiǎo"], ["iu", "六", "liù"], ["ua", "花", "huā"], ["uo", "我", "wǒ"], ["uai", "快", "kuài"], ["ui", "对", "duì"], ["üe", "学", "xué"]]],
      ["Vận mẫu mũi", [["an", "安", "ān"], ["en", "门", "mén"], ["ang", "忙", "máng"], ["eng", "冷", "lěng"], ["ong", "红", "hóng"], ["ian", "天", "tiān"], ["in", "新", "xīn"], ["iang", "想", "xiǎng"], ["ing", "听", "tīng"], ["iong", "熊", "xióng"], ["uan", "晚", "wǎn"], ["un", "春", "chūn"], ["uang", "黄", "huáng"], ["üan", "远", "yuǎn"], ["ün", "云", "yún"]]]
    ]
  };
  var BOARD_INDEX = {};
  BOARD.initials.concat(BOARD.finals).forEach(function (g) { g[1].forEach(function (t) { BOARD_INDEX[t[0]] = t; }); });
  function openBoard(key) {
    var t = BOARD_INDEX[key]; if (!t) return;
    openDrawer({ board: key, hz: t[1], py: t[2], syl: t[2] });
  }

  /* ---------------- Header & tabs ---------------- */
  function renderStats() {
    var learned = Object.keys(S.learned).filter(function (k) { return S.learned[k]; }).length;
    var done = Object.keys(S.done).filter(function (k) { return S.done[k]; }).length;
    $("#stats").innerHTML = '<span class="pts">Điểm <b>' + S.points + "</b></span><span>Đã thuộc <b>" + learned + "</b> từ</span><span>Hoàn thành <b>" + done + "/" + DATA.lessons.length + "</b> bài</span>";
  }
  var TABS = ["lotrinh", "tracuu", "baihoc", "baigiang", "tuvung", "phatam", "kiemtra", "trochoi", "phieuviet", "nghe", "btvn"];
  function go(tab) {
    if (tab === "kiemtra") { S.btvn = S.btvn || {}; S.btvn.sub = "kt"; S.btvn.cur = ""; tab = "btvn"; }
    if (TABS.indexOf(tab) < 0) tab = "lotrinh";
    stopQuiz();
    if (window.HSK_GAMES) window.HSK_GAMES.stop();
    S.tab = tab; save();
    document.querySelectorAll(".tab").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.tab === tab)); });
    var v = $("#view");
    v.innerHTML = '<section role="tabpanel" aria-labelledby="tab-' + tab + '">' + ({ lotrinh: vRoadmap, tracuu: vSearch, baihoc: vLesson, baigiang: vLecture, tuvung: vVocab, phatam: vPron, kiemtra: vQuizSetup, trochoi: vGames, phieuviet: vSheet, nghe: vListen, btvn: vHomework })[tab]() + "</section>";
    try { history.replaceState(null, "", "#" + tab); } catch (e) {}
    window.scrollTo(0, 0);
  }

  function vSheet() { return window.HSK_SHEET ? window.HSK_SHEET.view() : '<div class="empty">Đang tải...</div>'; }
  function vListen() { return window.HSK_LISTEN ? window.HSK_LISTEN.view() : '<div class="empty">Đang tải...</div>'; }
  function vHomework() { return window.HSK_HW ? window.HSK_HW.view() : '<div class="empty">Đang tải...</div>'; }
  function vGames() { return window.HSK_GAMES ? window.HSK_GAMES.view() : '<div class="empty">Đang tải trò chơi...</div>'; }

  /* ---------------- Lộ trình ---------------- */
  function vRoadmap() {
    var bands = [["Sơ cấp", "初等", "HSK 1 đến 3. Xây nền phát âm, chữ Hán thông dụng và mẫu câu giao tiếp hằng ngày."],
      ["Trung cấp", "中等", "HSK 4 đến 6. Mở rộng vốn từ, đọc hiểu đoạn dài, diễn đạt ý kiến mạch lạc."]];
    var html = '<div><div class="eyebrow">Giáo trình HSK 3.0 (Tiêu chuẩn trình độ Hán ngữ quốc tế 2021)</div><h1 style="font-size:28px;margin-top:4px">Lộ trình từ sơ cấp đến trung cấp</h1>' +
      '<p class="lead">Mỗi cấp có số âm tiết, chữ Hán và từ vựng cần nắm (số liệu tích lũy). Bài học được thêm sau từng buổi học, tiến độ của bạn tự lưu trên trình duyệt.</p></div><div class="bands">';
    bands.forEach(function (b) {
      html += '<div class="band"><h2><span class="hz">' + b[1] + "</span>" + b[0] + '</h2><p class="lead" style="margin-top:2px">' + b[2] + '</p><div class="levels">';
      DATA.levels.filter(function (l) { return l.band === b[0]; }).forEach(function (L) {
        var ls = DATA.lessons.filter(function (x) { return x.level === L.id; });
        var lv = VOCAB.filter(function (v) { return v.level === L.id; });
        var learned = lv.filter(function (v) { return S.learned[v.hz]; }).length;
        var prevWords = (DATA.levels.find(function (x) { return x.id === L.id - 1; }) || { words: 0 }).words;
        var target = L.words - prevWords;
        html += '<article class="level' + (ls.length ? " current" : "") + '"><h3>HSK ' + L.id + (ls.length ? '<span class="chip jade">' + ls.length + " bài</span>" : '<span class="chip">Sắp mở</span>') + "</h3>" +
          '<div class="figs"><div><b>' + L.syllables + "</b><span>âm tiết</span></div><div><b>" + L.chars.toLocaleString("vi-VN") + "</b><span>chữ Hán</span></div><div><b>" + L.words.toLocaleString("vi-VN") + "</b><span>từ vựng</span></div></div>" +
          "<p>" + esc(L.goal) + "</p>" +
          '<div><div class="row" style="justify-content:space-between;font-size:13px;color:var(--muted)"><span>Từ mới của cấp này</span><span style="font-variant-numeric:tabular-nums">' + learned + " / " + target + '</span></div><div class="bar"><i style="width:' + Math.min(100, learned / target * 100).toFixed(1) + '%"></i></div></div>' +
          '<ul class="lesson-list">' + ls.map(function (x) {
            return '<li><button data-lesson="' + x.id + '"><span class="dot' + (S.done[x.id] ? " done" : "") + '"></span><span class="no">Bài ' + x.no + '</span><span class="t"><span class="hz">' + esc(x.title) + "</span> " + esc(x.titleVi) + "</span>" + "" + "</button></li>";
          }).join("") + (L.id === 1 ? "<li><div>Bài theo giáo trình trên lớp sẽ bổ sung dần</div></li>" : "") + "</ul></article>";
      });
      html += "</div></div>";
    });
    return html + "</div>";
  }

  /* ---------------- Bài học ---------------- */
  function lessonOptions(sel, withLevels) {
    return DATA.levels.map(function (L) {
      var ls = DATA.lessons.filter(function (x) { return x.level === L.id; });
      if (!ls.length) return "";
      return '<optgroup label="HSK ' + L.id + '">' + (withLevels ? '<option value="lv:' + L.id + '"' + (sel === "lv:" + L.id ? " selected" : "") + ">Cả HSK " + L.id + " (" + ls.length + " bài)</option>" : "") +
        ls.map(function (x) { return '<option value="' + x.id + '"' + (x.id === sel ? " selected" : "") + ">HSK " + x.level + " · Bài " + x.no + ": " + esc(x.title) + " " + esc(x.titleVi) + "</option>"; }).join("") + "</optgroup>";
    }).join("");
  }
  function inSrc(v, src) { return src.indexOf("lv:") === 0 ? v.level === +src.slice(3) : v.lesson === src; }
  var LINK_KEYS = Object.keys(DICT).sort(function (a, b) { return b.length - a.length; });
  function linkLine(hz) {
    var out = "", i = 0;
    while (i < hz.length) {
      var m = null;
      for (var k = 0; k < LINK_KEYS.length; k++) if (hz.substr(i, LINK_KEYS[k].length) === LINK_KEYS[k]) { m = LINK_KEYS[k]; break; }
      if (m) { out += '<span class="word linked say" data-open="' + esc(m) + '">' + esc(m) + "</span>"; i += m.length; }
      else { var c = hz[i]; out += /[㐀-鿿]/.test(c) ? '<span class="word say" data-speak="' + c + '">' + c + "</span>" : esc(c); i++; }
    }
    return out;
  }
  function vLesson() {
    var L = lessonById(S.lesson) || DATA.lessons[0];
    if (!L) return '<div class="empty">Chưa có bài học nào.</div>';
    var opts = lessonOptions(L.id, false);
    var html = '<div class="row" style="justify-content:space-between"><select id="lessonSel" aria-label="Chọn bài">' + opts + "</select>" +
      '<label class="toggle"><input type="checkbox" id="hidePy"' + (S.hidePy ? " checked" : "") + "> Ẩn pinyin để tự đọc</label></div>";
    html += '<div class="lesson-head"><div class="big hz say" data-speak="' + esc(L.title) + '">' + esc(L.title) + "</div><div>" +
      '<div class="eyebrow">HSK ' + L.level + " · Bài " + L.no + (L.sample ? " · Bài tự soạn theo chủ đề HSK" : "") + "</div>" +
      "<h1>" + esc(L.titleVi) + ' <span class="py" style="font-size:18px;color:var(--muted)">' + toneSpans(L.titlePy) + "</span></h1>" +
      '<ul class="goals">' + L.goals.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + "</ul></div></div>";
    html += '<div><div class="sec-title"><h2>Từ mới (' + L.vocab.length + ' từ)</h2><span style="font-size:13px;color:var(--muted)">Bấm vào thẻ để nghe và xem khẩu hình</span></div><div class="cards">' +
      L.vocab.map(function (v) {
        return '<button class="card" data-open="' + esc(v.hz) + '">' + (S.learned[v.hz] ? '<span class="chip ok learned">Đã thuộc</span>' : "") +
          '<span class="hz">' + esc(v.hz) + '</span><span class="py">' + pyColored(v.py, v.syl) + '</span><span class="hv">' + esc(v.hv) + '</span><span class="vi">' + esc(v.vi) + "</span></button>";
      }).join("") + "</div></div>";
    html += '<div><div class="sec-title"><h2>Hội thoại</h2><span style="font-size:13px;color:var(--muted)">Chữ gạch chân là từ mới, bấm để xem phát âm</span></div><div class="dialogue">' +
      L.dialogues.map(function (d) {
        return '<div class="panel"><h3 style="font-size:15px;margin-bottom:4px">' + esc(d.title) + "</h3>" + d.lines.map(function (ln) {
          return '<div class="dl"><div class="who">' + esc(ln.who) + '</div><div><div class="line-hz hz">' + linkLine(ln.hz) + '</div><div class="line-py">' + toneSpans(ln.py) + '</div><div class="line-vi">' + esc(ln.vi) + "</div></div>" + playBtn(ln.hz, "Nghe câu") + "</div>";
        }).join("") + "</div>";
      }).join("") + "</div></div>";
    html += '<div><div class="sec-title"><h2>Ngữ pháp và lưu ý</h2></div><div class="grammar">' + L.grammar.map(function (g) {
      return '<div class="panel"><h3>' + esc(g.title) + "</h3><p>" + esc(g.body) + "</p>" + g.examples.map(function (e) {
        return '<span class="ex say" data-speak="' + esc(e.hz) + '"><span class="hz">' + esc(e.hz) + "</span>" + toneSpans(e.py) + "<small>" + esc(e.vi) + "</small></span>";
      }).join("") + "</div>";
    }).join("") + "</div></div>";
    if (L.pronFocus && L.pronFocus.length) html += '<div><div class="sec-title"><h2>Luyện phát âm trọng tâm</h2></div><div class="focus">' + L.pronFocus.map(function (k) { return '<button data-board="' + esc(k) + '">' + esc(k) + "</button>"; }).join("") + "</div></div>";
    html += '<div class="panel row" style="justify-content:space-between"><div><b>' + (S.done[L.id] ? "Bạn đã hoàn thành bài này" : "Học xong bài này?") + '</b><div style="font-size:14px;color:var(--muted)">Đạt từ 80% trong bài kiểm tra sẽ tự đánh dấu hoàn thành.' + (S.best[L.id] != null ? " Điểm cao nhất: " + S.best[L.id] + "%." : "") + "</div></div>" +
      '<div class="row"><button class="btn" data-done="' + L.id + '">' + (S.done[L.id] ? "Bỏ đánh dấu" : "Đánh dấu hoàn thành") + '</button><button class="btn primary" data-quiz="' + L.id + '">Làm bài kiểm tra</button></div></div>';
    return html;
  }

  /* ---------------- Bài giảng trên lớp ---------------- */
  var LECTS = DATA.lectures || [];
  if (!S.lectNotes) S.lectNotes = {};
  if (!S.lectDone) S.lectDone = {};
  function fmtDate(d) { var p = String(d || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : esc(d); }
  function vLecture() {
    var head = '<div><h1 style="font-size:26px">Bài giảng trên lớp</h1><p class="lead">Tổng hợp từ ảnh ghi chép sau mỗi buổi học. Mọi chữ Hán đều bấm nghe được, nút Nghe mở hình động khẩu hình.</p></div>';
    if (!LECTS.length) return head + '<div class="panel" style="display:grid;gap:14px"><b>Chưa có buổi giảng nào</b><p style="margin:0;color:var(--muted)">Sau mỗi buổi, gửi ảnh ghi chép trên lớp. Nội dung sẽ được sắp xếp thành:</p><ul class="plan"><li><b>Ghi chú của giáo viên</b><span>Ý chính, quy tắc, mẹo nhớ</span></li><li><b>Bảng âm và ví dụ</b><span>Bấm để nghe và xem khẩu hình</span></li><li><b>Ảnh gốc</b><span>Đối chiếu lại khi ôn</span></li><li><b>Ghi chú riêng của bạn</b><span>Lưu ngay trên trình duyệt</span></li></ul></div>';
    var cur = LECTS.find(function (l) { return l.id === S.lect; }) || LECTS[LECTS.length - 1];
    var list = '<ul class="lect-list">' + LECTS.slice().reverse().map(function (l) {
      return '<li><button data-lect="' + esc(l.id) + '" aria-current="' + (l.id === cur.id) + '"><span class="d"><span>Buổi ' + l.no + " · " + fmtDate(l.date) + "</span>" + (S.lectDone[l.id] ? '<span class="chip ok">Đã ôn</span>' : "") + "</span><span>" + esc(l.title) + "</span></button></li>";
    }).join("") + "</ul>";
    var body = '<div class="lect-body"><div><div class="eyebrow">Buổi ' + cur.no + " · " + fmtDate(cur.date) + (cur.lesson && lessonById(cur.lesson) ? ' · <button class="btn small" data-lesson="' + cur.lesson + '">Xem bài liên quan</button>' : "") + '</div><h2 style="font-size:22px;margin-top:4px">' + esc(cur.title) + "</h2>" + (cur.summary ? '<p class="lead">' + esc(cur.summary) + "</p>" : "") + "</div>";
    cur.blocks.forEach(function (b) { body += renderBlock(b); });
    if (cur.homework && cur.homework.length) body += '<div class="panel"><h3>Bài tập về nhà</h3><ol style="margin:0;padding-left:20px">' + cur.homework.map(function (h) { return '<li class="hzline">' + linkLine(h) + "</li>"; }).join("") + "</ol></div>";
    body += '<div class="panel"><h3>Ghi chú của bạn</h3><textarea id="lectNote" data-id="' + esc(cur.id) + '" placeholder="Viết lại điều bạn muốn nhớ từ buổi này">' + esc(S.lectNotes[cur.id] || "") + "</textarea></div>";
    body += '<div class="row"><button class="btn' + (S.lectDone[cur.id] ? "" : " primary") + '" data-lectdone="' + esc(cur.id) + '">' + (S.lectDone[cur.id] ? "Bỏ đánh dấu đã ôn" : "Đánh dấu đã ôn buổi này") + "</button></div></div>";
    return head + '<div class="lect">' + list + body + "</div>";
  }
  function renderBlock(b) {
    if (b.type === "text") return '<div class="panel">' + (b.title ? "<h3>" + esc(b.title) + "</h3>" : "") + '<p class="hzline">' + linkLine(b.body) + "</p></div>";
    if (b.type === "tip") return '<div class="tip hzline">' + linkLine(b.body).replace(/\n/g, "<br>") + "</div>";
    if (b.type === "image") return '<figure><img src="' + esc(b.src) + '" alt="' + esc(b.caption || "Ảnh ghi chép") + '" loading="lazy"><figcaption>' + esc(b.caption || "") + "</figcaption></figure>";
    if (b.type === "examples") return '<div class="panel">' + (b.title ? "<h3>" + esc(b.title) + "</h3>" : "") + b.items.map(function (e) {
      return '<span class="ex say" data-speak="' + esc(e.hz) + '"><span class="hz">' + esc(e.hz) + "</span>" + toneSpans(e.py) + "<small>" + esc(e.vi) + "</small></span>";
    }).join("") + "</div>";
    if (b.type === "table" || b.type === "sounds") {
      var snd = b.type === "sounds";
      return '<div>' + (b.title ? '<h3 style="font-size:16px;margin-bottom:8px">' + esc(b.title) + "</h3>" : "") + '<div class="table-wrap"><table><thead><tr>' + b.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + (snd ? "<th>Ví dụ</th><th>Nghe</th>" : "") + "</tr></thead><tbody>" +
        b.rows.map(function (r) {
          var cells = snd ? r.cells : r;
          return "<tr>" + cells.map(function (c, i) { return "<td" + (i === 0 ? ' style="font-weight:700;font-size:16px"' : "") + ' class="hzline">' + linkLine(c) + "</td>"; }).join("") +
            (snd ? '<td><span class="hz say" data-speak="' + esc(r.hz) + '" style="font-size:22px">' + esc(r.hz) + "</span> " + toneSpans(r.py) + '</td><td><button class="btn small" data-sy="' + esc(r.py) + '" data-hz="' + esc(r.hz) + '" data-label="' + esc(r.cells[0].split(" ")[0]) + '">Nghe và xem khẩu hình</button></td>' : "") + "</tr>";
        }).join("") + "</tbody></table></div></div>";
    }
    return "";
  }

  /* ---------------- Tra cứu ---------------- */
  function hanChars(s) { return Array.from(s || "").filter(function (c) { return /[\u3400-\u9fff]/.test(c); }); }
  function fold(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d"); }
  var CHARS = {}, SIDX = [], seenHz = {};
  VOCAB.forEach(function (v) {
    var cs = hanChars(v.hz), sy = v.syl.split(" "), hv = (v.hv || "").split(" ");
    if (!seenHz[v.hz]) { seenHz[v.hz] = 1; SIDX.push({ v: v, fpy: fold(v.py).replace(/[\s']/g, ""), fhv: fold(v.hv), fvi: fold(v.vi), vi: v.vi.toLowerCase() }); }
    if (cs.length !== sy.length) return;
    cs.forEach(function (c, i) {
      var e = CHARS[c] || (CHARS[c] = { c: c, py: [], hv: [], words: [] });
      var t = parseSyl(sy[i]).tone;
      if (e.py.indexOf(sy[i]) < 0 && (t !== 5 || !e.py.length)) e.py.push(sy[i]);
      if (hv.length === cs.length && hv[i] && e.hv.indexOf(hv[i]) < 0) e.hv.push(hv[i]);
      if (e.words.indexOf(v.hz) < 0) e.words.push(v.hz);
    });
  });
  var PHR = [], seenP = {};
  function addPhr(hz, py, vi) { if (!hz || seenP[hz] || hanChars(hz).length < 2) return; seenP[hz] = 1; PHR.push({ hz: hz, py: py, vi: vi, fpy: fold(py).replace(/[^a-z]/g, ""), fvi: fold(vi), vi2: (vi || "").toLowerCase() }); }
  DATA.lessons.forEach(function (l) {
    l.vocab.forEach(function (v) { if (v.ex) addPhr(v.ex.hz, v.ex.py, v.ex.vi); });
    l.dialogues.forEach(function (d) { d.lines.forEach(function (x) { addPhr(x.hz, x.py, x.vi); }); });
    l.grammar.forEach(function (g) { g.examples.forEach(function (x) { if (x.py.indexOf("→") < 0) addPhr(x.hz, x.py, x.vi); }); });
  });
  Object.keys(CHARS).forEach(function (c) { var e = CHARS[c]; if (e.py.length > 1) e.py = e.py.filter(function (p) { return parseSyl(p).tone !== 5; }); });
  var EXT = {}, extState = 0;
  function lookup(hz) { return DICT[hz] || EXT[hz]; }
  function addCharFrom(hz, syl, hvs) {
    var cs = hanChars(hz), sy = syl.split(" "), hv = (hvs || "").split(" ");
    if (cs.length !== sy.length) return;
    cs.forEach(function (c, i) {
      var e = CHARS[c] || (CHARS[c] = { c: c, py: [], hv: [], words: [] });
      if (cs.length === 1 || !e.py.length) { if (e.py.indexOf(sy[i]) < 0 && (parseSyl(sy[i]).tone !== 5 || !e.py.length)) e.py.push(sy[i]); }
      if (hv.length === cs.length && hv[i] && !e.hv.length) e.hv.push(hv[i]);
      if (e.words.length < 30 && e.words.indexOf(hz) < 0) e.words.push(hz);
    });
  }
  function loadDict() {
    if (extState) return; extState = 1;
    loadScript("data/hsk-all.js", function (ok) {
      if (!ok || !window.HSK_ALL) { extState = 0; return; }
      window.HSK_ALL.forEach(function (r) {
        var hz = r[0], y = r[1], syl = y.split(" ").map(function (x) { return x.replace(/([^e])r$/, "$1"); }).join(" ");
        if (DICT[hz] || EXT[hz]) return;
        var vn = !!r[5], v = EXT[hz] = { hz: hz, py: y.replace(/ /g, ""), syl: syl, hv: r[4] || "", vi: vn ? r[5] : r[3], pos: hskLabel(r[2]) + (vn ? "" : " · nghĩa tiếng Anh"), ext: true, hsk: r[2] };
        SIDX.push({ v: v, ext: 1, en: !vn, fpy: fold(v.py).replace(/[\s']/g, ""), fhv: fold(v.hv), fvi: fold(v.vi), vi: v.vi.toLowerCase() });
        addCharFrom(hz, syl, v.hv);
      });
      extState = 2;
      if ($("#q")) runSearch();
      if ($("#wsOut") && window.HSK_SHEET) window.HSK_SHEET.refresh();
    });
  }
  // Pinyin cho một câu chữ Hán: tách từ theo kho, ghép pinyin từng từ
  function pinyinOf(hz) {
    var out = [], buf = "";
    Array.from(hz).forEach(function (ch) { if (/[\u3400-\u9fff]/.test(ch)) buf += ch; else { if (buf) { out.push(segPy(buf)); buf = ""; } if (!out.length) return; if (/[，,]/.test(ch)) out[out.length - 1] += ","; else if (/[。.]/.test(ch)) out[out.length - 1] += "."; else if (/[？?]/.test(ch)) out[out.length - 1] += "?"; else if (/[！!]/.test(ch)) out[out.length - 1] += "!"; } });
    if (buf) out.push(segPy(buf));
    var t = out.join(" ").trim(); return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function segPy(buf) {
    return segment(buf).map(function (w) { var v = lookup(w); if (v && v.syl) return v.py || v.syl.replace(/ /g, ""); return hanChars(w).map(function (c) { return CHARS[c] && CHARS[c].py[0] || c; }).join(""); }).join(" ");
  }
  function hskLabel(n) { return n >= 7 ? "HSK 7-9" : "HSK " + n; }
  function charItem(c) {
    var e = CHARS[c], v = lookup(c);
    if (v) return v;
    return { hz: c, py: e ? e.py[0] : "", syl: e ? e.py[0] : "", hv: e ? e.hv.join(", ") : "", vi: e ? "Có trong: " + e.words.slice(0, 6).join("、") : "", pos: "" };
  }
  function addRecent(hz) { S.recent = [hz].concat((S.recent || []).filter(function (x) { return x !== hz; })).slice(0, 12); save(); }
  function search(q) {
    q = q.trim(); if (!q) return { words: [], chars: [], phr: [] };
    var hq = hanChars(q).join(""), words = [], chars = [], phr = [];
    var fq0 = fold(q), fp0 = fq0.replace(/[^a-z]/g, "").replace(/v/g, "u"), lq0 = q.toLowerCase();
    PHR.forEach(function (e) {
      if (phr.length >= 12) return;
      if (hq ? e.hz.indexOf(hq) > -1 : ((fp0.length >= 4 && e.fpy.indexOf(fp0) > -1) || (lq0.length >= 2 && e.vi2.indexOf(lq0) > -1) || (fq0.length >= 3 && e.fvi.indexOf(fq0) > -1))) phr.push(e);
    });
    if (hq) {
      SIDX.forEach(function (e) { var hz = e.v.hz, sc = hz === hq ? 100 : hz.indexOf(hq) === 0 ? 80 : hz.indexOf(hq) > -1 ? 60 : 0; if (sc) words.push([sc - (e.ext ? 5 : 0), e.v]); });
      Array.from(new Set(hanChars(hq))).forEach(function (c) { chars.push(c); });
    } else {
      var fq = fold(q), fp = fq.replace(/[\s'0-9]/g, "").replace(/v/g, "u"), lq = q.toLowerCase();
      SIDX.forEach(function (e) {
        var sc = 0;
        if (fp && e.fpy === fp) sc = 90; else if (fp.length >= 2 && e.fpy.indexOf(fp) === 0) sc = 70;
        if (e.fhv === fq) sc = Math.max(sc, 85); else if (fq.length >= 2 && (" " + e.fhv).indexOf(" " + fq) > -1) sc = Math.max(sc, 55);
        if (e.en) { if (lq.length >= 3 && (" " + e.vi.replace(/[^a-z]+/g, " ") + " ").indexOf(" " + lq + " ") > -1) sc = Math.max(sc, 50); }
        else if (e.vi.indexOf(lq) > -1) sc = Math.max(sc, (", " + e.vi + ",").indexOf(", " + lq + ",") > -1 || e.vi === lq ? 88 : 65);
        else if (fq.length >= 2 && e.fvi.indexOf(fq) > -1) sc = Math.max(sc, 45);
        if (sc) words.push([sc - (e.ext ? 5 : 0), e.v]);
      });
      if (fp) Object.keys(CHARS).forEach(function (c) { var e = CHARS[c]; if (e.py.some(function (p) { return fold(p) === fp; }) || e.hv.some(function (h) { return fold(h) === fq; })) chars.push(c); });
    }
    words.sort(function (a, b) { return b[0] - a[0] || a[1].hz.length - b[1].hz.length; });
    return { words: words.slice(0, 60).map(function (w) { return w[1]; }), chars: chars.slice(0, 24), phr: phr };
  }
  function splitTerms(q) {
    var parts = q.split(/[,，;；、\n\/|+]+/).map(function (x) { return x.trim(); }).filter(Boolean);
    if (parts.length === 1 && hanChars(q).length && /\s/.test(q.trim())) parts = q.trim().split(/\s+/);
    return parts;
  }
  function segment(hz) {
    var cs = hanChars(hz), out = [], i = 0;
    while (i < cs.length) {
      var n = Math.min(4, cs.length - i), w = null;
      for (; n > 1; n--) { var t = cs.slice(i, i + n).join(""); if (lookup(t)) { w = t; break; } }
      w = w || cs[i]; out.push(w); i += hanChars(w).length;
    }
    return out;
  }
  function bestHit(term) {
    var r = search(term), th = hanChars(term).join("");
    if (th && lookup(th)) return { k: hanChars(th).length > 1 ? "w" : "c", hz: th };
    if (th.length > 1) return { k: "s", hz: th };
    if (r.words.length) return { k: "w", hz: r.words[0].hz };
    if (r.chars.length) return { k: "c", hz: r.chars[0] };
    if (hanChars(term).length > 1 && hanChars(term).join("") === term.replace(/\s/g, "")) return { k: "s", hz: term };
    return null;
  }
  function multiRow(term, hit) {
    if (!hit) return '<li><div class="res miss"><span class="hz">?</span><span class="rmid"><span class="hv">' + esc(term) + '</span><span class="vi">Chưa có trong kho từ của các bài học</span></span></div></li>';
    if (hit.k === "s") { var cs = hanChars(hit.hz); return '<li><div class="phr"><div class="hz">' + linkLine(hit.hz) + '</div><div class="py">' + toneSpans(cs.map(function (c) { return CHARS[c] && CHARS[c].py[0] || ""; }).join(" ")) + '</div><div class="vi">Ghép từ ' + cs.join(" + ") + ", bấm từng chữ để xem</div></div>" + playBtn(hit.hz) + "</li>"; }
    var v = hit.k === "w" ? lookup(hit.hz) : charItem(hit.hz), L = v.lesson ? lessonById(v.lesson) : null;
    return '<li><button class="res" data-' + (hit.k === "w" ? "open" : "char") + '="' + esc(hit.hz) + '"><span class="hz">' + esc(hit.hz) + '</span><span class="rmid">' + (term === hit.hz ? "" : '<span class="qterm">' + esc(term) + "</span>") + ' <span class="py">' + (v.syl ? pyColored(v.py, v.syl) : "") + '</span> <span class="hv">' + esc(v.hv) + '</span><span class="vi">' + esc(v.vi) + "</span></span>" + resChip(v, L) + "</button>" + playBtn(hit.hz) + "</li>";
  }
  function multiBlock(title, terms) {
    var hits = terms.map(bestHit), found = hits.filter(Boolean).map(function (h) { return h.hz; });
    return '<div class="sgroup"><div class="eyebrow">' + title + " (" + found.length + "/" + terms.length + ' tìm thấy)</div>' +
      (found.length > 1 ? '<div class="row" style="margin-bottom:8px">' + '<button class="btn small" data-speak="' + esc(found.join("，")) + '">' + ICON_PLAY.replace("<svg", '<svg width="12" height="12" fill="currentColor"') + " Nghe tất cả</button>" + "</div>" : "") +
      '<ul class="reslist">' + terms.map(function (t, i) { return multiRow(t, hits[i]); }).join("") + "</ul></div>";
  }
  function resChip(v, L) { return L ? '<span class="chip">HSK ' + L.level + " · B" + L.no + "</span>" : v.ext ? '<span class="chip ext">' + hskLabel(v.hsk) + "</span>" : ""; }
  function vSearch() {
    return '<div><h1 style="font-size:26px">Tra cứu</h1><p class="lead">Gõ chữ Hán, pinyin (có hoặc không dấu), âm Hán Việt hoặc nghĩa tiếng Việt. Bấm vào kết quả để nghe, xem khẩu hình và cách viết từng nét. Tra nhiều từ cùng lúc: ngăn cách bằng dấu phẩy (ví dụ: mua, ăn, uống) hoặc dán cả câu tiếng Trung để tự tách từ. Phím tắt: bấm <kbd>/</kbd> để tìm nhanh.</p></div>' +
      '<div class="searchbox"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 13l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<input id="q" type="search" autocomplete="off" spellcheck="false" placeholder="Ví dụ: 你好 hoặc mua, ăn, uống" value="' + esc(S.lastQ || "") + '" aria-label="Tìm từ"></div>' +
      '<div id="sres" aria-live="polite"></div>';
  }
  function runSearch() {
    var qi = $("#q"), box = $("#sres"); if (!qi || !box) return;
    var q = qi.value; S.lastQ = q; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    if (!q.trim()) {
      var rec = (S.recent || []);
      box.innerHTML = (rec.length ? '<div class="sgroup"><div class="eyebrow">Vừa tra</div><div class="chips">' + rec.map(function (h) { return '<button class="qchip hz" data-' + (lookup(h) && hanChars(h).length > 1 ? "open" : "char") + '="' + esc(h) + '">' + esc(h) + "</button>"; }).join("") + "</div></div>" : "") +
        '<div class="sgroup"><div class="eyebrow">Thử tìm</div><div class="chips">' + ["你好", "xiexie", "mua, ăn, uống", "我想买水果", "cảm ơn", "直播", "zhongguo", "học"].map(function (x) { return '<button class="qchip" data-q="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div></div>" +
        '<p class="lead">Kho tra cứu gồm ' + SIDX.length + " từ và " + Object.keys(CHARS).length + " chữ Hán" + (extState === 2 ? ": từ trong bài và toàn bộ từ vựng HSK 3.0. HSK 1-4 có nghĩa tiếng Việt và Hán Việt, HSK 5 đến 7-9 tạm dùng nghĩa tiếng Anh." : ". Đang tải thêm toàn bộ từ vựng HSK 3.0...") + "</p>";
      return;
    }
    var terms = splitTerms(q);
    if (terms.length > 1) { box.innerHTML = multiBlock("Tra nhiều từ", terms); return; }
    var r = search(q), html = "", hz0 = hanChars(q).join("");
    if (hz0.length > 1 && !lookup(hz0)) { var seg = segment(hz0); if (seg.length > 1) html += multiBlock("Tách từ trong câu", seg); }
    if (r.chars.length) html += '<div class="sgroup"><div class="eyebrow">Chữ Hán (' + r.chars.length + ')</div><div class="charcards">' + r.chars.map(function (c) {
      var e = CHARS[c] || { py: [], hv: [], words: [] };
      return '<button class="charcard" data-char="' + esc(c) + '"><span class="hz">' + esc(c) + '</span><span class="py">' + e.py.map(function (p) { return '<span class="tone' + parseSyl(p).tone + '">' + esc(p) + "</span>"; }).join(", ") + '</span><span class="hv">' + esc(e.hv.join(", ")) + '</span><span class="cnt">' + (e.words.length ? e.words.length + " từ" : "") + "</span></button>";
    }).join("") + "</div></div>";
    if (r.words.length || !html) html += '<div class="sgroup"><div class="eyebrow">Từ vựng (' + r.words.length + ")</div>" + (r.words.length || !r.phr.length ? "" : "") + (r.words.length ? '<ul class="reslist">' + r.words.map(function (v) {
      var L = lessonById(v.lesson);
      return '<li><button class="res" data-open="' + esc(v.hz) + '"><span class="hz">' + esc(v.hz) + '</span><span class="rmid"><span class="py">' + pyColored(v.py, v.syl) + '</span> <span class="hv">' + esc(v.hv) + "</span><span class=\"vi\">" + esc(v.vi) + '</span></span>' + resChip(v, L) + "</button>" + playBtn(v.hz) + "</li>";
    }).join("") + "</ul>" : '<div class="empty">' + (r.phr.length ? "Không có từ đơn khớp, xem các câu mẫu bên dưới." : "Không tìm thấy từ nào. Thử gõ không dấu, hoặc gõ một chữ Hán.") + "</div>") + "</div>";
    if (r.phr.length) html += '<div class="sgroup"><div class="eyebrow">Câu mẫu (' + r.phr.length + ')</div><ul class="reslist">' + r.phr.map(function (e) {
      return '<li><div class="phr"><div class="hz">' + linkLine(e.hz) + '</div><div class="py">' + toneSpans(e.py) + '</div><div class="vi">' + esc(e.vi) + "</div></div>" + playBtn(e.hz, "Nghe câu") + "</li>";
    }).join("") + "</ul></div>";
    box.innerHTML = html;
  }

  /* ---------------- Từ vựng ---------------- */
  var vf = { lesson: "all", status: "all", q: "" };
  function vVocab() {
    var opts = '<option value="all">Tất cả bài</option>' + lessonOptions(vf.lesson, true);
    return '<div><h1 style="font-size:26px">Bảng từ vựng</h1><p class="lead">Bấm chữ Hán để xem cách đặt lưỡi và khẩu hình. Bật “Che nghĩa” để tự kiểm tra, rê chuột hoặc chạm vào ô để xem lại.</p></div>' +
      '<div class="row"><select id="vfLesson" aria-label="Lọc theo bài">' + opts + '</select>' +
      '<select id="vfStatus" aria-label="Lọc theo trạng thái"><option value="all">Tất cả</option><option value="todo"' + (vf.status === "todo" ? " selected" : "") + '>Chưa thuộc</option><option value="done"' + (vf.status === "done" ? " selected" : "") + ">Đã thuộc</option></select>" +
      '<input type="search" id="vfQ" placeholder="Tìm chữ Hán, pinyin, nghĩa" value="' + esc(vf.q) + '">' +
      '<label class="toggle"><input type="checkbox" id="coverVi"' + (S.coverVi ? " checked" : "") + "> Che nghĩa</label></div>" +
      '<div class="table-wrap"><table><thead><tr><th>#</th><th>Chữ Hán</th><th>Pinyin</th><th>Hán Việt</th><th>Nghĩa</th><th>Từ loại</th><th>Nghe</th><th>Trạng thái</th></tr></thead><tbody id="vbody"></tbody></table></div>';
  }
  function fillVocab() {
    var q = vf.q.trim().toLowerCase();
    var rows = VOCAB.filter(function (v) {
      if (vf.lesson !== "all" && !inSrc(v, vf.lesson)) return false;
      if (vf.status === "done" && !S.learned[v.hz]) return false;
      if (vf.status === "todo" && S.learned[v.hz]) return false;
      if (q) { var plain = parseSyl(v.py).base; return (v.hz + " " + v.py + " " + plain + " " + v.vi + " " + v.hv).toLowerCase().indexOf(q) > -1; }
      return true;
    });
    $("#vbody").innerHTML = rows.length ? rows.map(function (v, i) {
      return '<tr><td class="n">' + (i + 1) + '</td><td><span class="hz say" data-open="' + esc(v.hz) + '">' + esc(v.hz) + '</span></td><td class="py">' + pyColored(v.py, v.syl) + "</td><td>" + esc(v.hv) + '</td><td class="vi-cell"><span tabindex="0">' + esc(v.vi) + "</span></td><td>" + esc(v.pos) + "</td><td>" + playBtn(v.hz) + '</td><td><button class="mark' + (S.learned[v.hz] ? " on" : "") + '" data-learn="' + esc(v.hz) + '">' + (S.learned[v.hz] ? "Đã thuộc" : "Chưa thuộc") + "</button></td></tr>";
    }).join("") : '<tr><td colspan="8" class="empty">Không có từ nào khớp bộ lọc.</td></tr>';
  }

  /* ---------------- Phát âm ---------------- */
  function vPron() {
    var tile = function (t) { return '<button class="ptile" data-board="' + esc(t[0]) + '"><b>' + esc(t[0]) + '</b><span><span class="hz">' + t[1] + "</span> " + toneSpans(t[2]) + "</span></button>"; };
    var html = '<div><h1 style="font-size:26px">Bảng phát âm pinyin</h1><p class="lead">Bấm từng ô để nghe chữ ví dụ và xem hình động: vị trí lưỡi, khẩu hình môi, luồng hơi ra miệng hay mũi, có bật hơi hay không.</p></div>';
    html += '<div class="panel"><div class="sec-title"><h2>Thanh điệu</h2>' + playBtn("妈麻马骂吗", "Nghe cả 5 thanh") + '</div><div class="tones">' + BOARD.tones.map(function (t, i) {
      var tn = i + 1;
      return '<button class="ptile say" data-speak="' + t[1] + '"><b class="tone' + tn + '">' + t[0] + '</b><span class="hz" style="font-size:24px">' + t[1] + "</span><span>" + esc(TONE_NAME[tn]) + "</span><span>" + esc(t[2]) + "</span></button>";
    }).join("") + "</div></div>";
    html += '<div class="panel"><h2 style="font-size:18px">Thanh mẫu (phụ âm đầu)</h2>' + BOARD.initials.map(function (g) { return '<div class="group-label">' + esc(g[0]) + '</div><div class="pgrid">' + g[1].map(tile).join("") + "</div>"; }).join("") + "</div>";
    html += '<div class="panel"><h2 style="font-size:18px">Vận mẫu (vần)</h2>' + BOARD.finals.map(function (g) { return '<div class="group-label">' + esc(g[0]) + '</div><div class="pgrid">' + g[1].map(tile).join("") + "</div>"; }).join("") + "</div>";
    return html;
  }

  /* ---------------- Kiểm tra ---------------- */
  var Q = null, qTimer = null;
  function vQuizSetup(preset) {
    var opts = lessonOptions(preset || S.lesson, true) +
      '<option value="all">Tất cả từ vựng đã có</option><option value="learned">Chỉ những từ đã đánh dấu thuộc</option>';
    var hist = S.history.slice(-8).reverse();
    return '<div><h1 style="font-size:26px">Bài kiểm tra trắc nghiệm</h1><p class="lead">Mỗi câu có đồng hồ đếm ngược. Trả lời nhanh được cộng điểm thưởng. Có thể bấm phím 1 đến 4 để chọn đáp án.</p></div>' +
      '<div class="panel quiz-setup"><div class="row"><label>Nội dung <select id="qLesson">' + opts + "</select></label>" +
      '<label>Số câu <select id="qCount"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label>' +
      '<label>Thời gian mỗi câu <select id="qTime"><option value="10">10 giây</option><option value="15" selected>15 giây</option><option value="25">25 giây</option></select></label></div>' +
      '<div class="row"><button class="btn primary" id="qStart">Bắt đầu làm bài</button><span style="font-size:13px;color:var(--muted)">Dạng câu hỏi: nhìn chữ chọn nghĩa, nhìn nghĩa chọn chữ, nghe chọn chữ, pinyin chọn chữ, nhận biết thanh điệu.</span></div></div>' +
      '<div id="quizArea"></div>' +
      (hist.length ? '<div><h2 style="font-size:18px;margin-bottom:8px">Lịch sử gần đây</h2><div class="table-wrap"><table class="history" style="min-width:0"><thead><tr><th>Thời gian</th><th>Nội dung</th><th>Đúng</th><th>Điểm</th></tr></thead><tbody>' +
        hist.map(function (h) { return "<tr><td>" + esc(h.date) + "</td><td>" + esc(h.label) + '</td><td style="font-variant-numeric:tabular-nums">' + h.right + "/" + h.total + '</td><td style="font-variant-numeric:tabular-nums">+' + h.pts + "</td></tr>"; }).join("") + "</tbody></table></div></div>" : "");
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function startQuiz() {
    var src = $("#qLesson").value, n = +$("#qCount").value, per = +$("#qTime").value, pool;
    if (src === "all") pool = VOCAB.slice(); else if (src === "learned") pool = VOCAB.filter(function (v) { return S.learned[v.hz]; }); else pool = VOCAB.filter(function (v) { return inSrc(v, src); });
    if (pool.length < 4) { $("#quizArea").innerHTML = '<div class="empty">Cần ít nhất 4 từ để tạo bài kiểm tra. Hãy đánh dấu thêm từ đã thuộc hoặc chọn bài khác.</div>'; return; }
    var label = src === "all" ? "Tất cả từ vựng" : src === "learned" ? "Từ đã thuộc" : (src.indexOf("lv:") === 0 ? "Cả HSK " + src.slice(3) : (function (l) { return "HSK " + l.level + " · Bài " + l.no; })(lessonById(src)));
    var types = ["hz2vi", "vi2hz", "audio", "py2hz", "tone"], qs = [], bag = [];
    for (var i = 0; i < n; i++) {
      if (!bag.length) bag = shuffle(pool);
      var w = bag.pop(), type = types[i % types.length];
      var others = shuffle((pool.length >= 4 ? pool : VOCAB).filter(function (v) { return v.hz !== w.hz && v.py !== w.py && v.vi !== w.vi; })).slice(0, 3);
      if (type === "tone") {
        var s0 = w.syl.split(" ")[0], tn = parseSyl(s0).tone;
        qs.push({ type: type, w: w, syl0: s0, answer: String(tn), opts: ["1", "2", "3", "4", "5"].filter(function (x) { return x !== String(tn); }).sort(function () { return Math.random() - .5; }).slice(0, 3).concat(String(tn)).sort() });
      } else qs.push({ type: type, w: w, answer: w.hz, opts: shuffle([w].concat(others)).map(function (v) { return v.hz; }) });
    }
    Q = { qs: qs, i: 0, right: 0, pts: 0, per: per, src: src, label: label, wrong: [], locked: false };
    $(".quiz-setup").hidden = true;
    showQ();
  }
  var TONE_OPT = { 1: "Thanh 1  ˉ", 2: "Thanh 2  ˊ", 3: "Thanh 3  ˇ", 4: "Thanh 4  ˋ", 5: "Thanh nhẹ" };
  function showQ() {
    var q = Q.qs[Q.i], w = q.w, area = $("#quizArea"), prompt = "";
    if (q.type === "hz2vi") prompt = '<span class="ask">Chữ này nghĩa là gì?</span><span class="hz say" data-speak="' + esc(w.hz) + '">' + esc(w.hz) + "</span>";
    else if (q.type === "vi2hz") prompt = '<span class="ask">Chọn chữ Hán đúng với nghĩa</span><span class="vi">' + esc(w.vi) + "</span>";
    else if (q.type === "audio") prompt = '<span class="ask">Nghe và chọn chữ đúng</span><button class="btn primary" data-speak="' + esc(w.hz) + '">' + ICON_PLAY.replace("<svg", '<svg width="14" height="14" fill="currentColor"') + " Nghe lại</button>";
    else if (q.type === "py2hz") prompt = '<span class="ask">Pinyin nào ứng với chữ nào?</span><span class="vi py">' + pyColored(w.py, w.syl).replace(/class="tone\d"/g, "") + "</span>";
    else prompt = '<span class="ask">Âm tiết <b>' + esc(parseSyl(q.syl0).base) + "</b> trong chữ dưới đây mang thanh mấy?</span>" + '<span class="hz say" data-speak="' + esc(w.hz) + '">' + esc(w.hz) + "</span>";
    var optLabel = function (o) {
      if (q.type === "tone") return esc(TONE_OPT[o]);
      if (q.type === "hz2vi") return esc(DICT[o].vi);
      return '<span class="hz">' + esc(o) + "</span>";
    };
    area.innerHTML = '<div class="panel quiz-box"><div class="qtop"><span class="count">Câu ' + (Q.i + 1) + "/" + Q.qs.length + '</span><div class="timer" id="timer"><div class="bar"><i id="tbar" style="width:100%"></i></div><span id="tsec">' + Q.per + 's</span></div><span>Đúng <b>' + Q.right + '</b></span><span class="pts" style="color:var(--gold)">+' + Q.pts + "</span></div>" +
      '<div class="qprompt">' + prompt + '</div><div class="opts">' + q.opts.map(function (o, i) { return '<button class="opt" data-opt="' + esc(o) + '"><span class="k">' + (i + 1) + "</span>" + optLabel(o) + "</button>"; }).join("") + "</div>" +
      '<div class="feedback" id="fb" aria-live="polite"></div></div>';
    Q.locked = false;
    if (q.type === "audio") setTimeout(function () { speak(w.hz, 0.8); }, 150);
    var t0 = Date.now(); clearInterval(qTimer);
    qTimer = setInterval(function () {
      var left = Math.max(0, Q.per - (Date.now() - t0) / 1000);
      Q.left = left;
      var b = $("#tbar"); if (!b) return clearInterval(qTimer);
      b.style.width = (left / Q.per * 100) + "%"; $("#tsec").textContent = Math.ceil(left) + "s";
      $("#timer").classList.toggle("low", left < 4);
      if (left <= 0) { clearInterval(qTimer); answer(null); }
    }, 100);
  }
  function answer(val) {
    if (!Q || Q.locked) return;
    Q.locked = true; clearInterval(qTimer);
    var q = Q.qs[Q.i], ok = val === q.answer, fb = $("#fb");
    document.querySelectorAll(".opt").forEach(function (b) {
      b.disabled = true;
      if (b.dataset.opt === q.answer) b.classList.add("right"); else if (b.dataset.opt === val) b.classList.add("wrong");
    });
    if (ok) { var gain = 10 + Math.round((Q.left || 0) / Q.per * 5); Q.right++; Q.pts += gain; fb.className = "feedback ok"; fb.textContent = "Chính xác! +" + gain + " điểm"; }
    else { Q.wrong.push(q.w); fb.className = "feedback bad"; fb.innerHTML = (val === null ? "Hết giờ. " : "Chưa đúng. ") + 'Đáp án: <span class="hz">' + esc(q.w.hz) + "</span> " + pyColored(q.w.py, q.w.syl) + " (" + esc(q.w.vi) + ")"; }
    speak(q.w.hz, 0.85);
    fb.insertAdjacentHTML("beforeend", ' <button class="btn small" id="qNext" style="margin-left:8px">' + (Q.i + 1 < Q.qs.length ? "Câu tiếp" : "Xem kết quả") + "</button>");
    $("#qNext").focus({ preventScroll: true });
  }
  function nextQ() { if (!Q) return; Q.i++; if (Q.i < Q.qs.length) showQ(); else finishQuiz(); }
  function finishQuiz() {
    var pct = Math.round(Q.right / Q.qs.length * 100);
    S.points += Q.pts;
    var d = new Date();
    S.history.push({ date: d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), label: Q.label, right: Q.right, total: Q.qs.length, pts: Q.pts });
    if (S.history.length > 50) S.history = S.history.slice(-50);
    var lessonMsg = "";
    if (lessonById(Q.src)) {
      S.best[Q.src] = Math.max(S.best[Q.src] || 0, pct);
      if (pct >= 80 && !S.done[Q.src]) { S.done[Q.src] = true; lessonMsg = "Bài học đã được đánh dấu hoàn thành."; }
    }
    save();
    var seen = {}, wrong = Q.wrong.filter(function (w) { if (seen[w.hz]) return false; seen[w.hz] = 1; return true; });
    $("#quizArea").innerHTML = '<div class="panel result"><div class="eyebrow">' + esc(Q.label) + '</div><div class="score">' + pct + '%</div><div>Đúng ' + Q.right + "/" + Q.qs.length + ' câu, nhận <b style="color:var(--gold)">+' + Q.pts + " điểm</b></div>" +
      (lessonMsg ? '<span class="chip ok">' + lessonMsg + "</span>" : pct < 80 && lessonById(Q.src) ? '<span class="chip">Cần đạt 80% để hoàn thành bài</span>' : "") +
      (wrong.length ? '<div class="eyebrow" style="margin-top:8px">Từ cần ôn lại</div><ul class="review">' + wrong.map(function (w) { return '<li class="bad"><span class="hz say" data-open="' + esc(w.hz) + '" style="font-size:22px">' + esc(w.hz) + "</span>" + pyColored(w.py, w.syl) + "<span>" + esc(w.vi) + "</span></li>"; }).join("") + "</ul>" : "") +
      '<div class="row" style="justify-content:center"><button class="btn primary" id="qAgain">Làm lại</button><button class="btn" data-goto="tuvung">Ôn bảng từ vựng</button></div></div>';
    var src = Q.src; Q = null;
    $("#qAgain").onclick = function () { go("kiemtra"); $("#qLesson").value = src; startQuiz(); };
  }
  function stopQuiz() { clearInterval(qTimer); Q = null; }

  /* ---------------- Sự kiện ---------------- */
  document.addEventListener("click", function (e) {
    var t = e.target, el;
    if ((el = t.closest(".tab"))) return go(el.dataset.tab);
    if ((el = t.closest("[data-close]")) || t.id === "scrim") return closeDrawer();
    if ((el = t.closest("[data-learn]"))) {
      var hz = el.dataset.learn; S.learned[hz] = !S.learned[hz]; save();
      el.classList.toggle("on", !!S.learned[hz]);
      el.textContent = S.learned[hz] ? "Đã thuộc" : (el.closest("#drawer") ? "Đánh dấu đã thuộc" : "Chưa thuộc");
      if (S.tab === "baihoc" && el.closest("#drawer")) { var y = window.scrollY; $("#view").firstChild.innerHTML = vLesson(); window.scrollTo(0, y); }
      if (S.tab === "tuvung" && vf.status !== "all") fillVocab();
      return;
    }
    if ((el = t.closest("[data-open]"))) { if (el.closest("#sres")) addRecent(el.dataset.open); var it = lookup(el.dataset.open); return it && openDrawer(it); }
    if ((el = t.closest("[data-board]"))) return openBoard(el.dataset.board);
    if ((el = t.closest("[data-sy]"))) return openDrawer({ board: el.dataset.label, hz: el.dataset.hz, py: el.dataset.sy, syl: el.dataset.sy });
    if ((el = t.closest("[data-lect]"))) { S.lect = el.dataset.lect; return go("baigiang"); }
    if ((el = t.closest("[data-lectdone]"))) { var lid = el.dataset.lectdone; S.lectDone[lid] = !S.lectDone[lid]; save(); var yy = window.scrollY; go("baigiang"); window.scrollTo(0, yy); return; }
    if ((el = t.closest("[data-speak]"))) return speak(el.dataset.speak, 0.85, el.classList.contains("say") ? el : null);
    if ((el = t.closest("[data-syl]"))) return showSyl(+el.dataset.syl);
    if ((el = t.closest("[data-dtab]"))) return setDTab(el.dataset.dtab);
    if ((el = t.closest("[data-wc]"))) { speak(wChars[+el.dataset.wc], 0.8); return showWriteChar(+el.dataset.wc, true); }
    if ((el = t.closest("[data-w]"))) return writeAct(el.dataset.w);
    if ((el = t.closest("[data-char]"))) { addRecent(el.dataset.char); return openDrawer(charItem(el.dataset.char)); }
    if ((el = t.closest("[data-q]"))) { var qi = $("#q"); if (qi) { qi.value = el.dataset.q; runSearch(); qi.focus(); } return; }
    if ((el = t.closest("[data-act]"))) {
      var a = el.dataset.act;
      if (a === "say") speak(drawerItem.hz, 0.8); else if (a === "slow") speak(drawerItem.hz, 0.45); else if (drawerItem.syl) showSyl(drawerSyl);
      return;
    }
    if ((el = t.closest("[data-lesson]"))) { S.lesson = el.dataset.lesson; return go("baihoc"); }
    if ((el = t.closest("[data-done]"))) { S.done[el.dataset.done] = !S.done[el.dataset.done]; save(); return go("baihoc"); }
    if ((el = t.closest("[data-quiz]"))) { S.lesson = el.dataset.quiz; go("kiemtra"); return; }
    if ((el = t.closest("[data-goto]"))) return go(el.dataset.goto);
    if (t.id === "qStart") return startQuiz();
    if ((el = t.closest("[data-opt]"))) return answer(el.dataset.opt);
    if (t.id === "qNext") return nextQ();
  });
  $("#scrim").addEventListener("click", closeDrawer);
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.id === "lessonSel") { S.lesson = t.value; go("baihoc"); }
    else if (t.id === "hidePy") { S.hidePy = t.checked; document.body.classList.toggle("hide-py", S.hidePy); save(); }
    else if (t.id === "coverVi") { S.coverVi = t.checked; document.body.classList.toggle("cover-vi", S.coverVi); save(); }
    else if (t.id === "vfLesson") { vf.lesson = t.value; fillVocab(); }
    else if (t.id === "vfStatus") { vf.status = t.value; fillVocab(); }
  });
  document.addEventListener("input", function (e) {
    if (e.target.id === "vfQ") { vf.q = e.target.value; fillVocab(); }
    if (e.target.id === "q") runSearch();
    if (e.target.id === "lectNote") { S.lectNotes[e.target.dataset.id] = e.target.value; save(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#drawer").hidden) return closeDrawer();
    if (e.key === "/" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) && $("#drawer").hidden) { e.preventDefault(); go("tracuu"); }
    if (e.key === "Enter" && e.target.id === "q") { var first = document.querySelector("#sres [data-open], #sres [data-char]"); if (first) first.click(); }
    if (Q && /^[1-5]$/.test(e.key) && !/INPUT|SELECT/.test(document.activeElement.tagName)) {
      var b = document.querySelectorAll(".opt")[+e.key - 1]; if (b && !b.disabled) answer(b.dataset.opt);
    }
  });

  var origGo = go;
  go = function (tab) { origGo(tab); if (tab === "tuvung") fillVocab(); if (tab === "phieuviet") { loadDict(); if (window.HSK_SHEET) window.HSK_SHEET.refresh(); } if (tab === "tracuu") { loadDict(); runSearch(); var qi = $("#q"); if (qi) qi.focus({ preventScroll: true }); } };

  // API cho games.js (nạp sau app.js)
  window.HSK_APP = { S: S, save: save, VOCAB: VOCAB, DATA: DATA, speak: speak, esc: esc, toneSpans: toneSpans, pyColored: pyColored, parseSyl: parseSyl,
    lessonOptions: lessonOptions, inSrc: inSrc, renderStats: renderStats, playBtn: playBtn, go: function (t) { go(t); }, quizView: function () { return vQuizSetup(); }, pinyinOf: pinyinOf, charInfo: function (c) { return charItem(c); }, loadStrokes: loadStrokes, hanChars: hanChars };

  document.body.classList.toggle("hide-py", !!S.hidePy);
  document.body.classList.toggle("cover-vi", !!S.coverVi);
  renderStats();
  var h = (location.hash || "").slice(1);
  go(TABS.indexOf(h) > -1 ? h : S.tab);
})();
