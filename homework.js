/* Bài tập về nhà: phần 模拟测练 (nghe) của Sổ tay New HSK 1, học sinh chọn đáp án và nộp bài. by: MANHXD */
(function () {
  "use strict";
  var A = window.HSK_APP, S = A.S, esc = A.esc, L = window.HSK_LISTEN;
  var $ = function (s) { return document.querySelector(s); };
  var LS = "hsk30-btvn-v1";
  var ROMAN = L.ROMAN, ALL = L.builtins();
  var LIST = Object.keys(ALL).filter(function (k) { return ALL[k].segs; }).sort(function (a, b) { return (ALL[a].bai || 99) - (ALL[b].bai || 99); });
  var keys = Object.assign({}, window.HSK_KEYS || {}), db = null, user = null, uid = "", teacher = false, results = null, editKey = false, saveMsg = "";
  var st = load();
  if (!S.btvn) S.btvn = {};

  function load() { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch (e) { return {}; } }
  function store() { try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {} }
  function fileOf(tr) { return tr.src.match(/([^/]+)\.mp3$/)[1]; }
  function title(tr) { return tr.bai ? "Bài " + tr.bai : "Đề thi thử"; }
  function opts(tr, p) { return p === 3 ? (tr.bai ? "ABCD" : "ABCDEF") : "ABC"; }
  function questions(tr) {
    var out = [];
    tr.segs.forEach(function (x, i) { if (x.q) out.push({ q: x.q, p: x.p, i: i }); });
    return out;
  }
  function rec(f) { return st[f] || (st[f] = { a: {} }); }
  function keyOf(f) { return keys[f] || {}; }
  function grade(tr) {
    var f = fileOf(tr), k = keyOf(f), a = rec(f).a, qs = questions(tr), n = 0, ok = 0;
    qs.forEach(function (x) { if (k[x.q]) { n++; if (a[x.q] === k[x.q]) ok++; } });
    return { ok: ok, n: n, total: qs.length };
  }

  function card(k) {
    var tr = ALL[k], f = fileOf(tr), r = st[f], g = r && r.done ? grade(tr) : null, kn = Object.keys(keyOf(f)).length;
    var stt = g ? (g.n ? "Đã nộp, " + g.ok + "/" + g.n + " câu đúng" : "Đã nộp") : r && Object.keys(r.a).length ? "Đang làm " + Object.keys(r.a).length + "/" + questions(tr).length : "Chưa làm";
    return '<button class="hw-card" data-hwopen="' + esc(k) + '"><img src="' + esc(tr.img) + '" alt="" loading="lazy"><span><b>' + title(tr) + "</b><small>" + questions(tr).length + " câu, trang " + tr.page + "</small><small class=\"hw-st" + (g ? " done" : "") + '">' + stt + "</small>" +
      (teacher ? '<small class="hw-kn">' + (kn ? "Đáp án " + kn + "/" + questions(tr).length : "Chưa nhập đáp án") + "</small>" : "") + "</span></button>";
  }

  function listView() {
    return '<div><h1 style="font-size:26px">Bài tập về nhà</h1><p class="lead">Phần nghe 模拟测练 trong Sổ tay New HSK 1. Chọn bài, nghe từng câu rồi bấm chọn đáp án, xong bấm Nộp bài.</p></div>' +
      '<div class="panel hw-name"><label>Tên học sinh<input id="hwName" placeholder="vd: Nguyễn Văn A" value="' + esc(st.name || "") + '" autocomplete="name"></label>' + (window.HSK_WEB && !uid ? '<p class="ls-msg">Bấm "Đăng nhập Google" ở góc trên để bài nộp được gửi thẳng cho giáo viên.</p>' : "") + "</div>" +
      '<div class="hw-grid">' + LIST.map(card).join("") + "</div>" +
      (teacher ? resultsView() : "");
  }

  function qRow(tr, x) {
    var f = fileOf(tr), r = rec(f), k = keyOf(f), done = r.done && !editKey, pick = editKey ? k[x.q] : r.a[x.q];
    var mark = done && k[x.q] ? (r.a[x.q] === k[x.q] ? '<span class="hw-res ok">Đúng</span>' : '<span class="hw-res bad">Sai, đáp án ' + k[x.q] + "</span>") : done ? '<span class="hw-res">Chờ chấm</span>' : "";
    return '<div class="hw-q"><button class="ls-seg" data-lsseg="' + x.i + '" title="Nghe câu ' + x.q + '">Nghe</button><b class="hw-num">Câu ' + x.q + "</b>" +
      '<span class="hw-opts">' + opts(tr, x.p).split("").map(function (o) {
        var cls = "hw-opt" + (pick === o ? " on" : "") + (done && k[x.q] === o ? " right" : "");
        return '<button class="' + cls + '" data-hwq="' + x.q + '" data-hwo="' + o + '"' + (done ? " disabled" : "") + ">" + o + "</button>";
      }).join("") + "</span>" + mark + "</div>";
  }

  function workView(k) {
    var tr = ALL[k], f = fileOf(tr), r = rec(f), qs = questions(tr), parts = {};
    qs.forEach(function (x) { (parts[x.p] = parts[x.p] || []).push(x); });
    var head = '<div class="row"><button class="btn small" data-hwback>Danh sách bài</button></div>' +
      '<div><h1 style="font-size:26px">' + title(tr) + ", " + tr.name + '</h1><p class="lead">Mỗi câu bấm <b>Nghe</b> rồi chọn đáp án. Câu ví dụ đã có sẵn đáp án trong sách.</p></div>';
    if (teacher) head += '<div class="row hw-tools"><button class="btn small' + (editKey ? " primary" : "") + '" data-hwkey>' + (editKey ? "Xong nhập đáp án" : "Nhập đáp án (giáo viên)") + '</button><span class="ls-msg">' + esc(saveMsg) + "</span></div>";
    var body = Object.keys(parts).map(function (p) {
      p = +p; var segs = tr.segs, ex = segs.filter(function (x) { return x.p === p && !x.q; })[0], exI = segs.indexOf(ex);
      var last = parts[p][parts[p].length - 1];
      return '<div class="panel hw-part"><div class="hw-phead"><b>Part ' + ROMAN[p] + "</b><span>Câu " + parts[p][0].q + (parts[p].length > 1 ? " đến " + last.q : "") + "</span></div>" +
        '<a class="ls-page" href="img/sotay1/parts/' + f + "-p" + p + '.jpg" target="_blank" rel="noopener"><img src="img/sotay1/parts/' + f + "-p" + p + '.jpg" alt="Part ' + ROMAN[p] + ' trong sách" loading="lazy"></a>' +
        '<div class="row"><button class="ls-seg ex" data-lsseg="' + exI + '">Nghe ví dụ</button><button class="ls-seg all" data-lsseg="' + exI + '" data-lsend="' + segs[last.i].end + '">Nghe cả Part ' + ROMAN[p] + "</button></div>" +
        parts[p].map(function (x) { return qRow(tr, x); }).join("") + "</div>";
    }).join("");
    var g = grade(tr), foot;
    if (editKey) foot = '<p class="ls-msg">Đang nhập đáp án: bấm chữ đúng của từng câu, tự lưu. Học sinh sẽ được chấm theo đáp án này.</p>';
    else if (r.done) {
      foot = '<div class="hw-score">' + (g.n ? "Đúng <b>" + g.ok + "/" + g.n + "</b> câu" + (g.n < g.total ? " (" + (g.total - g.n) + " câu chưa có đáp án)" : "") : "Đã nộp bài. Giáo viên chưa nhập đáp án nên chưa chấm được.") + "</div>" +
        '<p class="lead" style="margin:0">Gửi kết quả cho giáo viên: bấm Sao chép rồi dán vào Zalo hoặc Messenger.</p>' +
        '<textarea class="hw-text" id="hwText" readonly rows="4">' + esc(resultText(tr)) + "</textarea>" +
        '<div class="row"><button class="btn primary" data-hwcopy>Sao chép kết quả</button><button class="btn" data-hwredo>Làm lại</button><span class="ls-msg" id="hwMsg">' + esc(saveMsg) + "</span></div>";
    } else {
      var n = Object.keys(r.a).length;
      foot = '<div class="row"><button class="btn primary" data-hwsubmit>Nộp bài</button><span class="ls-msg">Đã chọn ' + n + "/" + qs.length + " câu</span></div>";
    }
    return head + '<div class="ls-box hw-box" data-lstr="' + esc(k) + '"><audio class="ls-audio" controls preload="auto" src="' + esc(tr.src) + '"></audio>' + body + "</div>" + '<div class="panel hw-foot">' + foot + "</div>";
  }

  function resultText(tr) {
    var f = fileOf(tr), r = rec(f), k = keyOf(f), g = grade(tr);
    return "BTVN " + title(tr) + " (Sổ tay New HSK 1, 模拟测练)\nHọc sinh: " + (st.name || "(chưa ghi tên)") + "\n" +
      (g.n ? "Kết quả: " + g.ok + "/" + g.n + " câu đúng\n" : "") +
      questions(tr).map(function (x) { var a = r.a[x.q] || "-"; return x.q + ". " + a + (k[x.q] ? (a === k[x.q] ? " (đúng)" : " (sai, " + k[x.q] + ")") : ""); }).join("; ") + "\nby: MANHXD";
  }

  function resultsView() {
    if (!db) return "";
    if (!results) return '<div class="panel"><b>Kết quả học sinh</b><p class="ls-msg">Đang tải...</p></div>';
    var rows = [];
    results.forEach(function (d) { Object.keys(d.subs || {}).forEach(function (f) { var s = d.subs[f]; rows.push({ name: d.name || "(không tên)", f: f, s: s }); }); });
    rows.sort(function (a, b) { return (b.s.at || 0) - (a.s.at || 0); });
    return '<div class="panel"><b>Kết quả học sinh</b>' + (rows.length ? '<table class="hw-table"><thead><tr><th>Học sinh</th><th>Bài</th><th>Điểm</th><th>Đáp án đã chọn</th><th>Nộp lúc</th></tr></thead><tbody>' + rows.map(function (x) {
      var tr = ALL[Object.keys(ALL).filter(function (k) { return ALL[k].src && fileOf(ALL[k]) === x.f; })[0]];
      var a = x.s.a || {}, k = keyOf(x.f), qs = tr ? questions(tr) : [], n = 0, ok = 0;
      Object.keys(k).forEach(function (q) { n++; if (a[q] === k[q]) ok++; });
      var g = n ? "<b>" + ok + "/" + n + "</b> câu đúng" : "Đã làm " + Object.keys(a).length + "/" + qs.length + ' câu<br><small class="hw-wait">Chờ nhập đáp án để chấm</small>';
      var ans = qs.map(function (q) { var v = a[q.q] || "-", c = k[q.q] ? (v === k[q.q] ? "ok" : "bad") : ""; return '<span class="hw-a ' + c + '">' + q.q + "." + esc(v) + "</span>"; }).join(" ");
      return "<tr><td>" + esc(x.name) + "</td><td>" + (tr ? title(tr) : esc(x.f)) + "</td><td>" + g + '</td><td class="hw-ans">' + ans + "</td><td>" + (x.s.at ? new Date(x.s.at).toLocaleString("vi-VN") : "") + "</td></tr>";
    }).join("") + "</tbody></table>" : '<p class="ls-msg">Chưa có học sinh nào nộp qua app. Học sinh không đăng nhập sẽ gửi kết quả qua Zalo bằng nút Sao chép.</p>') + "</div>";
  }

  function subnav() {
    var sub = S.btvn.sub === "kt" ? "kt" : "nghe";
    return '<div class="hw-sub" role="tablist"><button role="tab" data-hwsub="nghe" aria-selected="' + (sub === "nghe") + '">Bài nghe Sổ tay</button><button role="tab" data-hwsub="kt" aria-selected="' + (sub === "kt") + '">Kiểm tra từ vựng</button></div>';
  }
  function view() {
    if (S.btvn.sub === "kt") return subnav() + A.quizView();
    var k = S.btvn.cur; return k && ALL[k] ? workView(k) : subnav() + listView();
  }
  function redraw() { if (S.tab === "btvn") { var y = window.scrollY; A.go("btvn"); window.scrollTo(0, y); } }

  async function submit(tr) {
    var f = fileOf(tr), r = rec(f);
    if (!st.name) { var nm = prompt("Nhập tên của bạn để giáo viên biết bài của ai:"); if (nm) st.name = nm.trim(); }
    r.done = true; r.at = Date.now(); store(); saveMsg = ""; redraw();
    if (!db || !uid) return;
    try {
      var ref = db.doc("homework/" + uid), snap = await ref.get(), cur = snap.exists ? snap.data() : {};
      var subs = Object.assign({}, cur.subs || {}); subs[f] = { a: r.a, at: r.at };
      await ref.set({ name: st.name || "", subs: subs, at: r.at });
      saveMsg = "Đã gửi bài cho giáo viên.";
    } catch (e) { saveMsg = ""; }
    var m = $("#hwMsg"); if (m) m.textContent = saveMsg;
  }

  async function setKey(tr, q, o) {
    var f = fileOf(tr), k = Object.assign({}, keyOf(f));
    if (k[q] === o) delete k[q]; else k[q] = o;
    keys[f] = k; redraw();
    if (!db) return;
    try { await db.doc("keys/" + f).set({ k: k, at: Date.now() }); saveMsg = "Đã lưu đáp án."; } catch (e) { saveMsg = "Chưa lưu được đáp án."; }
    var m = document.querySelector(".hw-tools .ls-msg"); if (m) m.textContent = saveMsg;
  }

  document.addEventListener("click", function (e) {
    var sb = e.target.closest && e.target.closest("[data-hwsub]");
    if (sb) { S.btvn.sub = sb.dataset.hwsub; S.btvn.cur = ""; A.save(); A.go("btvn"); return; }
    var t = e.target.closest && e.target.closest("[data-hwopen],[data-hwback],[data-hwq],[data-hwsubmit],[data-hwredo],[data-hwcopy],[data-hwkey]");
    if (!t) return;
    var k = S.btvn.cur, tr = k && ALL[k];
    if (t.dataset.hwopen) { S.btvn.cur = t.dataset.hwopen; editKey = false; saveMsg = ""; A.save(); A.go("btvn"); return; }
    if (t.hasAttribute("data-hwback")) { S.btvn.cur = ""; editKey = false; A.save(); A.go("btvn"); return; }
    if (!tr) return;
    if (t.dataset.hwq) {
      if (editKey) return setKey(tr, t.dataset.hwq, t.dataset.hwo);
      var r = rec(fileOf(tr)); if (r.done) return;
      r.a[t.dataset.hwq] = t.dataset.hwo; store(); redraw(); return;
    }
    if (t.hasAttribute("data-hwsubmit")) {
      var n = Object.keys(rec(fileOf(tr)).a).length, all = questions(tr).length;
      if (n < all && !confirm("Còn " + (all - n) + " câu chưa chọn. Vẫn nộp bài?")) return;
      return submit(tr);
    }
    if (t.hasAttribute("data-hwredo")) { if (confirm("Xoá đáp án đã chọn để làm lại?")) { st[fileOf(tr)] = { a: {} }; store(); redraw(); } return; }
    if (t.hasAttribute("data-hwkey")) { editKey = !editKey; saveMsg = ""; redraw(); return; }
    if (t.hasAttribute("data-hwcopy")) {
      var ta = $("#hwText"), m = $("#hwMsg"), txt = ta ? ta.value : "";
      var ok = function () { if (m) m.textContent = "Đã sao chép."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, function () { ta.select(); try { document.execCommand("copy"); ok(); } catch (x) {} });
      else { ta.select(); try { document.execCommand("copy"); ok(); } catch (x) {} }
    }
  });
  document.addEventListener("input", function (e) { if (e.target.id === "hwName") { st.name = e.target.value.trim(); store(); } });

  async function init() {
    var cl = window.claude; if (!cl) return;
    var d = await cl.use("db"); user = await cl.use("user");
    if (user) {
      try { teacher = (await user.canEdit()) === true; } catch (e) {}
      try { uid = (await user.id()) || ""; } catch (e) {}
      if (!st.name && typeof user.name === "function") { try { st.name = (await user.name()) || ""; if (st.name) store(); } catch (e) {} }
    }
    if (!d) { if (teacher) redraw(); return; }
    db = d;
    db.collection("keys").onSnapshot(function (snap) {
      var o = Object.assign({}, window.HSK_KEYS || {}); snap.docs.forEach(function (x) { var v = x.data(); if (v && v.k) o[x.id] = v.k; }); keys = o;
      if (S.tab === "btvn" && !document.activeElement.closest(".hw-name")) redraw();
    }, function () {});
    if (teacher) db.collection("homework").onSnapshot(function (snap) { results = snap.docs.map(function (x) { return x.data(); }); if (S.tab === "btvn" && !S.btvn.cur) redraw(); }, function () { results = []; });
    else if (S.tab === "btvn") redraw();
  }

  window.HSK_HW = { view: view };
  if (S.tab === "btvn") A.go("btvn");
  init();
})();
