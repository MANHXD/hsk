/* Trò chơi luyện từ. Nạp sau app.js, dùng các hàm app.js để lộ ra qua window.HSK_APP. */
(function () {
  "use strict";
  var A = window.HSK_APP;
  if (!A) return;
  var S = A.S, esc = A.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var hasTTS = "speechSynthesis" in window;

  /* ---------------- Tiện ích ---------------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  // Pinyin về dạng chữ thường không dấu, bỏ số thanh, ü/v thành u.
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/v/g, "u").replace(/[^a-z]/g, ""); }
  function plain(v) { return norm(v.syl || v.py); }
  function shortVi(s) { var t = String(s || "").replace(/\([^)]*\)/g, "").split(/[,;]/)[0].trim(); return t || String(s || ""); }
  var viKey = function (v) { return shortVi(v.vi).toLowerCase(); };
  function bag(list) { var b = []; return function () { if (!b.length) b = shuffle(list); return b.pop(); }; }
  function hzSay(hz, style) { return '<span class="hz say" data-speak="' + esc(hz) + '"' + (style ? ' style="' + style + '"' : "") + ">" + esc(hz) + "</span>"; }
  function wordLine(v) { return hzSay(v.hz) + " " + A.pyColored(v.py, v.syl) + " <span>" + esc(v.vi) + "</span>"; }
  function mmss(sec) { sec = Math.floor(sec); return Math.floor(sec / 60) + ":" + ("0" + sec % 60).slice(-2); }
  function fitHz(hz) { var n = Array.from(hz).length; return n <= 2 ? 34 : n === 3 ? 27 : 21; }
  var ICON_PLAY = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M2 5h3l4-3v12l-4-3H2z"/><path d="M11 4.5a4.5 4.5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  /* ---------------- Nguồn từ ---------------- */
  function validSrc() {
    var s = S.gameSrc || "all", ok = s === "all" || s === "learned" ||
      (s.indexOf("lv:") === 0 ? A.DATA.lessons.some(function (l) { return l.level === +s.slice(3); }) : A.DATA.lessons.some(function (l) { return l.id === s; }));
    if (!ok) S.gameSrc = "all";
    return S.gameSrc || "all";
  }
  function pool() {
    var s = validSrc(), seen = {}, out = [];
    A.VOCAB.forEach(function (v) {
      if (seen[v.hz] || !plain(v)) return;
      if (s === "learned" ? !S.learned[v.hz] : s !== "all" && !A.inSrc(v, s)) return;
      seen[v.hz] = 1; out.push(v);
    });
    return out;
  }
  function srcLessons() {
    var s = validSrc();
    if (s === "all" || s === "learned") return A.DATA.lessons;
    return A.DATA.lessons.filter(function (l) { return s.indexOf("lv:") === 0 ? l.level === +s.slice(3) : l.id === s; });
  }
  var POOL = [];
  // n phương án nhiễu khác từ w cả chữ Hán lẫn khóa so sánh.
  function others(w, n, key) {
    var base = POOL.length > n ? POOL : A.VOCAB, used = {}, out = [];
    used["k" + key(w)] = 1; used["h" + w.hz] = 1;
    shuffle(base).some(function (v) {
      var k = "k" + key(v);
      if (used[k] || used["h" + v.hz]) return false;
      used[k] = 1; used["h" + v.hz] = 1; out.push(v);
      return out.length >= n;
    });
    return out;
  }
  // Lấy tối đa n từ không trùng chữ Hán và không trùng nghĩa ngắn.
  function distinct(n) {
    var used = {}, out = [];
    shuffle(POOL).some(function (v) { var k = viKey(v); if (used[k]) return false; used[k] = 1; out.push(v); return out.length >= n; });
    return out;
  }

  /* ---------------- Vòng lặp và bộ hẹn giờ ---------------- */
  var G = { tok: 0, raf: 0, timers: [], cur: null, id: null };
  function stop() {
    G.tok++;
    if (G.raf) cancelAnimationFrame(G.raf);
    G.raf = 0;
    G.timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    G.timers = []; G.cur = null;
  }
  function later(ms, fn) { var tok = G.tok; G.timers.push(setTimeout(function () { if (tok === G.tok) fn(); }, ms)); }
  function every(ms, fn) { var tok = G.tok, t = setInterval(function () { if (tok === G.tok) fn(); else clearInterval(t); }, ms); G.timers.push(t); }
  function loop(fn) {
    var tok = G.tok, last = 0;
    G.raf = requestAnimationFrame(function f(now) {
      if (tok !== G.tok) return;
      var dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 0;
      last = now;
      if (fn(dt) === false) { G.raf = 0; return; }
      G.raf = requestAnimationFrame(f);
    });
  }

  /* ---------------- Khung trò chơi ---------------- */
  function frame(body) {
    var g = GAME[G.id];
    $("#gArea").innerHTML = '<div class="panel gbox"><div class="ghead"><h2>' + esc(g.name) + '</h2><div class="gstats" id="gStats"></div><button class="btn small" data-gx="exit">Thoát</button></div>' + body + "</div>";
    toArea();
  }
  // Đưa khung trò chơi lên ngay dưới thanh tab cố định.
  function toArea() {
    var area = $("#gArea"), top = $(".top");
    if (!area) return;
    var y = area.getBoundingClientRect().top + window.scrollY - (top ? top.offsetHeight : 0) - 12;
    if (Math.abs(window.scrollY - y) > 4) window.scrollTo(0, Math.max(0, y));
  }
  function stats(html) { var el = $("#gStats"); if (el) el.innerHTML = html; }
  function lives(n, max) {
    var s = '<span class="lives" role="img" aria-label="Còn ' + n + ' mạng">';
    for (var i = 0; i < max; i++) s += "<i" + (i >= n ? ' class="off"' : "") + "></i>";
    return s + "</span>";
  }
  function pts(n) { return '<span class="gpts">Điểm <b>' + n + "</b></span>"; }
  function msg(html, cls) { var el = $("#gMsg"); if (el) { el.className = "gmsg" + (cls ? " " + cls : ""); el.innerHTML = html; } }
  function review(list, title, bad) {
    var seen = {}, ws = list.filter(function (w) { if (seen[w.hz]) return false; seen[w.hz] = 1; return true; });
    if (!ws.length) return "";
    return '<div class="eyebrow" style="margin-top:8px">' + esc(title) + '</div><ul class="review">' + ws.slice(0, 12).map(function (w) {
      return "<li" + (bad ? ' class="bad"' : "") + ">" + hzSay(w.hz, "font-size:22px") + A.pyColored(w.py, w.syl) + "<span>" + esc(w.vi) + "</span></li>";
    }).join("") + "</ul>";
  }
  function finish(score, detail) {
    var id = G.id, g = GAME[id];
    stop();
    score = Math.max(0, Math.round(score));
    S.gameBest = S.gameBest || {};
    var prev = S.gameBest[id] || 0, rec = score > prev;
    if (rec) S.gameBest[id] = score;
    S.points += score;
    A.save(); A.renderStats();
    $("#gArea").innerHTML = '<div class="panel result"><div class="eyebrow">' + esc(g.name) + '</div><div class="score">' + score + "</div>" +
      '<div>Nhận <b style="color:var(--gold)">+' + score + " điểm</b>. " + (rec ? '<span class="chip ok">Kỷ lục mới</span>' : "Kỷ lục: <b>" + prev + "</b>") + "</div>" +
      (detail || "") +
      '<div class="row" style="justify-content:center"><button class="btn primary" data-gx="again">Chơi lại</button><button class="btn" data-gx="exit">Chọn trò khác</button></div></div>';
    var b = $("[data-gx=again]"); if (b) b.focus({ preventScroll: true });
  }

  /* ---------------- 1. Mưa từ vựng ---------------- */
  function rain() {
    frame('<div class="gsetup"><p class="lead" style="margin:0">Từ rơi xuống, gõ pinyin không dấu để bắn hạ (có thể thêm số thanh, ví dụ ni3). Để lọt 3 từ là thua, càng về sau từ rơi càng nhanh.</p>' +
      '<div class="row"><button class="btn primary" data-gx="mode" data-gv="hz">Nhìn chữ Hán</button><button class="btn" data-gx="mode" data-gv="vi">Nhìn nghĩa tiếng Việt (khó)</button></div></div>');
    G.cur = { act: function (k, v) { if (k === "mode") rainRun(v); } };
    var b = $("[data-gx=mode]"); if (b) b.focus({ preventScroll: true });
  }
  function rainRun(mode) {
    frame('<div class="gstage" id="rStage"><div class="ground" id="rGround"></div></div>' +
      '<input class="ginput" id="gIn" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="Gõ pinyin rồi Enter" aria-label="Gõ pinyin">' +
      '<div class="gmsg" id="gMsg" aria-live="polite"></div>');
    var stage = $("#rStage"), inp = $("#gIn"), next = bag(POOL), drops = [];
    var st = { score: 0, lives: 3, t: 0, spawn: 0, hit: 0, missed: [], got: [], over: false };
    function upd() { stats(pts(st.score) + "<span>Trúng <b>" + st.hit + "</b></span>" + lives(st.lives, 3)); }
    function spawn() {
      var on = {}; drops.forEach(function (d) { on[d.v.hz] = 1; });
      var v = next(), tries = 0;
      while (on[v.hz] && tries++ < 8) v = next();
      if (on[v.hz]) return;
      var x = 50;
      for (var k = 0; k < 8; k++) {
        x = rand(20, 80);
        if (!drops.some(function (d) { return d.y < 70 && Math.abs(d.x - x) < 22; })) break;
      }
      var el = document.createElement("div");
      el.className = "drop " + (mode === "vi" ? "vi" : "hz");
      el.textContent = mode === "vi" ? shortVi(v.vi) : v.hz;
      el.style.left = x + "%";
      stage.appendChild(el);
      var d = { v: v, el: el, x: x, key: plain(v), h: el.offsetHeight };
      d.y = -d.h;
      el.style.transform = "translate(-50%," + d.y + "px)";
      drops.push(d);
    }
    function remove(el, ms) { later(ms, function () { el.remove(); }); }
    function shoot(raw) {
      var k = norm(raw), best = -1;
      if (!k || st.over) return false;
      drops.forEach(function (d, i) { if (d.key === k && (best < 0 || d.y > drops[best].y)) best = i; });
      if (best < 0) return false;
      var d = drops.splice(best, 1)[0], H = stage.clientHeight;
      st.hit++; st.score += 10 + Math.min(10, Math.floor(st.t / 20) * 2); st.got.push(d.v);
      var beam = document.createElement("i");
      beam.className = "beam"; beam.style.left = d.x + "%"; beam.style.height = Math.max(0, H - 10 - d.y - d.h) + "px";
      stage.appendChild(beam); remove(beam, 320);
      d.el.classList.add("hit"); remove(d.el, 360);
      A.speak(d.v.hz, 1);
      msg(wordLine(d.v), "ok"); upd();
      return true;
    }
    function lose(d) {
      st.lives--; st.missed.push(d.v);
      d.el.classList.add("miss"); remove(d.el, 500);
      var g = $("#rGround"); g.classList.add("hit"); later(300, function () { g.classList.remove("hit"); });
      msg("Lọt mất: " + wordLine(d.v), "bad"); upd();
    }
    upd();
    loop(function (dt) {
      st.t += dt; st.spawn -= dt;
      var H = stage.clientHeight - 10, speed = Math.min(120, 28 + st.t * 1.1) * (mode === "vi" ? 0.8 : 1);
      if (st.spawn <= 0 && drops.length < 6) { spawn(); st.spawn = Math.max(1.0, 2.8 - st.t * 0.025); }
      for (var i = drops.length - 1; i >= 0; i--) {
        var d = drops[i];
        d.y += speed * dt;
        d.el.style.transform = "translate(-50%," + d.y.toFixed(1) + "px)";
        if (d.y + d.h >= H) { drops.splice(i, 1); lose(d); }
      }
      if (st.lives <= 0) {
        st.over = true; inp.disabled = true;
        later(700, function () { finish(st.score, "<div>Bắn trúng " + st.hit + " từ trong " + mmss(st.t) + ".</div>" + review(st.missed, "Từ bị lọt", true) + review(st.got, "Từ đã bắn trúng")); });
        return false;
      }
    });
    G.cur = {
      input: function (el) { if (shoot(el.value)) el.value = ""; },
      key: function (e) {
        if (e.key !== "Enter" || e.target.id !== "gIn") return false;
        if (e.target.value.trim() && !shoot(e.target.value)) { e.target.classList.remove("bad"); void e.target.offsetWidth; e.target.classList.add("bad"); }
        e.target.value = "";
        return true;
      }
    };
    inp.focus({ preventScroll: true });
  }

  /* ---------------- 2. Ong chính tả ---------------- */
  function bee() {
    var next = bag(POOL), list = [], i;
    for (i = 0; i < 10; i++) list.push(next());
    var st = { i: 0, score: 0, right: 0, hint: 0, done: false, wrong: [], good: [] };
    frame('<div class="gprompt"><span class="ask">Nghe từ được đọc rồi gõ lại pinyin. Không cần dấu thanh, thêm số thanh (ni3hao3) để được thưởng.</span></div>' +
      '<div class="row" style="justify-content:center"><button class="btn primary" data-gx="say">' + ICON_PLAY + ' Nghe</button><button class="btn" data-gx="slow">Nghe chậm</button><button class="btn" data-gx="hint">Gợi ý</button></div>' +
      '<div class="gprompt" id="beeHint" aria-live="polite"></div>' +
      '<div class="gline"><input class="ginput" id="gIn" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="Gõ pinyin" aria-label="Gõ pinyin"><button class="btn primary" data-gx="check" id="beeBtn">Kiểm tra</button></div>' +
      '<div class="gmsg" id="gMsg" aria-live="polite"></div>');
    function w() { return list[st.i]; }
    function upd() { stats("<span>Câu <b>" + (st.i + 1) + "/10</b></span>" + pts(st.score) + "<span>Đúng <b>" + st.right + "</b></span>"); }
    function showHint() {
      var v = w(), h = "";
      if (st.hint >= 1) h += '<span class="vi">' + esc(v.vi) + "</span>";
      if (st.hint >= 2) h += '<span class="ask">' + v.syl.split(" ").length + " âm tiết, chữ Hán: </span>" + hzSay(v.hz, "font-size:40px");
      $("#beeHint").innerHTML = h;
    }
    function round() {
      st.hint = hasTTS ? 0 : 1; st.done = false;
      upd(); showHint();
      msg(hasTTS ? "" : "Thiết bị này chưa có giọng đọc, hãy dựa vào nghĩa gợi ý.", "");
      var inp = $("#gIn"); inp.value = ""; inp.disabled = false; inp.focus({ preventScroll: true });
      $("#beeBtn").textContent = "Kiểm tra";
      later(250, function () { A.speak(w().hz, 0.8); });
    }
    function check() {
      if (st.done) { st.i++; if (st.i < list.length) round(); else end(); return; }
      var inp = $("#gIn"), val = inp.value, v = w();
      if (!norm(val)) { inp.focus(); return; }
      st.done = true; inp.disabled = true;
      var ok = norm(val) === plain(v), digits = val.replace(/[^1-5]/g, ""), tones = v.syl.split(" ").map(function (s) { return A.parseSyl(s).tone; }).join("");
      var toneOk = ok && digits.length > 0 && digits === tones;
      if (ok) {
        var gain = Math.max(2, 10 - st.hint * 3) + (toneOk ? 2 : 0);
        st.score += gain; st.right++; st.good.push(v);
        msg("Chính xác! +" + gain + (toneOk ? " (đúng cả thanh điệu)" : "") + "<br>" + wordLine(v), "ok");
      } else { st.wrong.push(v); msg("Chưa đúng. Đáp án: " + wordLine(v), "bad"); }
      A.speak(v.hz, 0.85);
      upd();
      var b = $("#beeBtn"); b.textContent = st.i + 1 < list.length ? "Câu tiếp" : "Xem kết quả"; b.focus({ preventScroll: true });
    }
    function end() { finish(st.score, "<div>Đúng " + st.right + "/10 từ.</div>" + review(st.wrong, "Từ cần ôn lại", true)); }
    G.cur = {
      act: function (k) {
        if (k === "say") A.speak(w().hz, 0.8);
        else if (k === "slow") A.speak(w().hz, 0.45);
        else if (k === "hint" && !st.done && st.hint < 2) { st.hint++; showHint(); }
        else if (k === "check") check();
      },
      key: function (e) { if (e.key === "Enter" && (e.target.id === "gIn" || (st.done && e.target.id !== "beeBtn" && !e.target.closest("button")))) { check(); return true; } return false; }
    };
    round();
  }

  /* ---------------- 3. Nối từ ---------------- */
  function match() {
    var boards = 3, b = 0, per, st = { mistakes: 0, pairs: 0, t0: Date.now(), sel: {}, words: [], left: 0, lock: false };
    function upd() { stats("<span>Bảng <b>" + (b + 1) + "/" + boards + "</b></span><span>Thời gian <b>" + mmss((Date.now() - st.t0) / 1000) + "</b></span><span>Sai <b>" + st.mistakes + "</b></span>"); }
    function board() {
      st.words = distinct(6); per = st.words.length; st.left = per; st.sel = {};
      var L = shuffle(st.words.map(function (v, i) { return i; })), R = shuffle(L);
      frame('<p class="ghelp" style="margin:0">Chạm một chữ Hán rồi chạm nghĩa của nó (hoặc ngược lại). Nối hết để sang bảng tiếp.</p>' +
        '<div class="mboard"><div class="mcol">' + L.map(function (i) { return '<button class="mtile" data-gv="h:' + i + '"><span class="hz" style="font-size:' + Math.min(26, fitHz(st.words[i].hz)) + 'px">' + esc(st.words[i].hz) + "</span></button>"; }).join("") +
        '</div><div class="mcol">' + R.map(function (i) { return '<button class="mtile" data-gv="m:' + i + '">' + esc(shortVi(st.words[i].vi)) + "</button>"; }).join("") + "</div></div>" +
        '<div class="gmsg" id="gMsg" aria-live="polite"></div>');
      upd();
    }
    function tile(side, i) { return $('[data-gv="' + side + ":" + i + '"]'); }
    G.cur = {
      act: function (k, val) {
        if (!val || st.lock) return;
        var side = val[0], i = +val.slice(2), el = tile(side, i);
        if (!el || el.classList.contains("done")) return;
        if (st.sel[side] === i) { el.classList.remove("sel"); delete st.sel[side]; return; }
        if (st.sel[side] != null) tile(side, st.sel[side]).classList.remove("sel");
        st.sel[side] = i; el.classList.add("sel");
        if (st.sel.h == null || st.sel.m == null) return;
        var h = tile("h", st.sel.h), m = tile("m", st.sel.m);
        if (st.sel.h === st.sel.m) {
          var v = st.words[i];
          h.classList.add("done"); m.classList.add("done"); h.disabled = m.disabled = true;
          A.speak(v.hz, 1); msg(wordLine(v), "ok");
          st.pairs++; st.left--; st.sel = {};
          if (!st.left) {
            st.lock = true;
            later(450, function () { st.lock = false; b++; if (b < boards) board(); else end(); });
          }
        } else {
          st.mistakes++; st.lock = true;
          h.classList.add("bad"); m.classList.add("bad");
          msg("Chưa khớp, thử lại.", "bad");
          later(450, function () { h.classList.remove("bad", "sel"); m.classList.remove("bad", "sel"); st.sel = {}; st.lock = false; });
        }
        upd();
      }
    };
    function end() {
      var sec = (Date.now() - st.t0) / 1000;
      finish(st.pairs * 6 + Math.max(0, 90 - Math.floor(sec)) / 2 - st.mistakes * 3,
        "<div>Nối " + st.pairs + " cặp trong " + mmss(sec) + ", sai " + st.mistakes + " lần.</div>");
    }
    board();
    every(500, upd);
  }

  /* ---------------- 4. Thiên thạch trắc nghiệm ---------------- */
  function meteor() {
    frame('<div class="gstage short" id="mStage"><div class="ground" id="mGround"></div></div>' +
      '<div class="opts" id="mOpts"></div><div class="gmsg" id="gMsg" aria-live="polite"></div><p class="ghelp" style="margin:0">Chọn nghĩa đúng trước khi thiên thạch chạm đất. Có thể bấm phím 1 đến 4.</p>');
    var stage = $("#mStage"), next = bag(POOL), cur = null;
    var st = { score: 0, lives: 3, streak: 0, best: 0, n: 0, right: 0, missed: [] };
    function upd() { stats(pts(st.score) + "<span>Chuỗi <b>" + st.streak + "</b></span>" + lives(st.lives, 3)); }
    function round() {
      var w = next(), opts = shuffle([w].concat(others(w, 3, viKey)));
      var el = document.createElement("div");
      el.className = "meteor";
      el.innerHTML = '<span class="hz" style="font-size:' + fitHz(w.hz) + 'px">' + esc(w.hz) + "</span>";
      el.style.left = rand(28, 72) + "%";
      stage.appendChild(el);
      cur = { w: w, el: el, y: -el.offsetHeight, h: el.offsetHeight, dur: Math.max(3.2, 8 - st.n * 0.25), locked: false, opts: opts };
      el.style.transform = "translate(-50%," + cur.y + "px)";
      st.n++;
      $("#mOpts").innerHTML = opts.map(function (o, i) { return '<button class="opt" data-gv="' + i + '"><span class="k">' + (i + 1) + "</span>" + esc(shortVi(o.vi)) + "</button>"; }).join("");
      msg("", "");
    }
    function answer(i) {
      if (!cur || cur.locked) return;
      cur.locked = true;
      var w = cur.w, ok = i != null && cur.opts[i] === w;
      document.querySelectorAll("#mOpts .opt").forEach(function (b, j) {
        b.disabled = true;
        if (cur.opts[j] === w) b.classList.add("right"); else if (j === i) b.classList.add("wrong");
      });
      if (ok) {
        var gain = 10 + Math.min(st.streak, 10) * 2;
        st.score += gain; st.streak++; st.right++; st.best = Math.max(st.best, st.streak);
        cur.el.classList.add("boom");
        msg("Phá hủy! +" + gain + " " + wordLine(w), "ok");
      } else {
        st.lives--; st.streak = 0; st.missed.push(w);
        cur.el.classList.add("crash");
        if (i == null) { var g = $("#mGround"); g.classList.add("hit"); later(400, function () { g.classList.remove("hit"); }); }
        msg((i == null ? "Thiên thạch rơi rồi. " : "Chưa đúng. ") + wordLine(w), "bad");
      }
      A.speak(w.hz, 1);
      upd();
      var el = cur.el;
      later(ok ? 900 : 1500, function () {
        el.remove();
        if (st.lives <= 0) finish(st.score, "<div>Đúng " + st.right + " câu, chuỗi dài nhất " + st.best + ".</div>" + review(st.missed, "Từ cần ôn lại", true));
        else round();
      });
    }
    upd(); round();
    loop(function (dt) {
      if (!cur || cur.locked) return;
      var H = stage.clientHeight - 10;
      cur.y += (H + cur.h) / cur.dur * dt;
      cur.el.style.transform = "translate(-50%," + cur.y.toFixed(1) + "px)";
      if (cur.y + cur.h >= H) answer(null);
    });
    G.cur = {
      act: function (k, v) { if (v != null) answer(+v); },
      key: function (e) { if (/^[1-4]$/.test(e.key) && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) { answer(+e.key - 1); return true; } return false; }
    };
  }

  /* ---------------- 5. Bắn bong bóng ---------------- */
  function bubbles() {
    frame('<div class="gprompt"><span class="ask">Bấm vào bong bóng có chữ Hán mang nghĩa</span><span class="vi" id="bVi"></span></div>' +
      '<div class="gstage tall" id="bStage"></div><div class="gmsg" id="gMsg" aria-live="polite"></div>' +
      '<p class="ghelp" style="margin:0">Bấm phím số in trên bong bóng để chọn bằng bàn phím. Chọn sai hoặc để bong bóng đúng bay mất sẽ mất một mạng.</p>');
    var stage = $("#bStage"), next = bag(POOL), bs = [], w = null;
    var st = { score: 0, lives: 3, round: 0, right: 0, missed: [], locked: true };
    function upd() { stats(pts(st.score) + "<span>Đúng <b>" + st.right + "</b></span>" + lives(st.lives, 3)); }
    function round() {
      stage.innerHTML = ""; bs = [];
      w = next();
      var list = shuffle([w].concat(others(w, 3, viKey))), H = stage.clientHeight, n = list.length;
      $("#bVi").textContent = shortVi(w.vi);
      list.forEach(function (v, i) {
        var el = document.createElement("button");
        el.className = "bubble"; el.dataset.gv = i;
        el.innerHTML = '<span class="hz" style="font-size:' + Math.min(28, fitHz(v.hz) - 4) + 'px">' + esc(v.hz) + '</span><span class="k">' + (i + 1) + "</span>";
        el.setAttribute("aria-label", "Bong bóng " + (i + 1) + ": " + v.hz);
        stage.appendChild(el);
        bs.push({ v: v, el: el, lane: (i + 0.5) / n * 100, y: H - 30 + rand(0, 70), sp: rand(0.85, 1.2) * (34 + Math.min(st.round * 2.5, 46)), ph: rand(0, 6.28), sz: el.offsetWidth, dead: false });
      });
      st.round++; st.locked = false;
      place(0);
    }
    function place(dt) {
      bs.forEach(function (b) {
        if (b.dead) return;
        b.y -= b.sp * dt; b.ph += dt * 2;
        b.el.style.left = b.lane + "%";
        b.el.style.transform = "translate(" + (-b.sz / 2 + Math.sin(b.ph) * 8).toFixed(1) + "px," + b.y.toFixed(1) + "px)";
      });
    }
    function endRound(delay) {
      st.locked = true;
      later(delay, function () { if (st.lives <= 0) finish(st.score, "<div>Bắn đúng " + st.right + " bong bóng.</div>" + review(st.missed, "Từ cần ôn lại", true)); else round(); });
    }
    function choose(i) {
      var b = bs[i];
      if (st.locked || !b || b.dead) return;
      b.dead = true;
      if (b.v === w) {
        var gain = 10 + Math.min(st.round, 10);
        st.score += gain; st.right++;
        b.el.classList.add("pop");
        A.speak(w.hz, 1);
        msg("Trúng! +" + gain + " " + wordLine(w), "ok");
        endRound(650);
      } else {
        st.lives--;
        b.el.classList.add("wrong");
        msg("Không phải: " + wordLine(b.v), "bad");
        if (st.lives <= 0) { st.missed.push(w); endRound(900); }
      }
      upd();
    }
    upd(); round();
    loop(function (dt) {
      if (st.locked) return;
      place(dt);
      var t = bs.find(function (b) { return b.v === w; });
      if (t && !t.dead && t.y < -t.sz) {
        t.dead = true; st.lives--; st.missed.push(w);
        msg("Bong bóng đúng đã bay mất: " + wordLine(w), "bad");
        upd(); endRound(1200);
      }
    });
    G.cur = {
      act: function (k, v) { if (v != null) choose(+v); },
      key: function (e) { if (/^[1-4]$/.test(e.key) && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) { choose(+e.key - 1); return true; } return false; }
    };
  }

  /* ---------------- 6. Xây cầu ---------------- */
  var KEYS = null;
  function vocabKeys() {
    if (KEYS) return KEYS;
    KEYS = {};
    A.VOCAB.forEach(function (v) { if (/^[㐀-鿿]{2,6}$/.test(v.hz)) KEYS[v.hz] = 1; });
    return KEYS;
  }
  // Tách câu thành từ: khớp dài nhất theo từ vựng bài học, không có thì từng chữ, bỏ dấu câu.
  function segment(hz) {
    var K = vocabKeys(), cs = Array.from(hz), out = [], i = 0;
    while (i < cs.length) {
      if (/[㐀-鿿]/.test(cs[i])) {
        var len = 1;
        for (var L = Math.min(6, cs.length - i); L > 1; L--) if (K[cs.slice(i, i + L).join("")]) { len = L; break; }
        out.push(cs.slice(i, i + len).join("")); i += len;
      } else if (/[A-Za-z0-9]/.test(cs[i])) {
        var j = i; while (j < cs.length && /[A-Za-z0-9]/.test(cs[j])) j++;
        out.push(cs.slice(i, j).join("")); i = j;
      } else i++;
    }
    return out;
  }
  function sentences() {
    var seen = {}, out = [];
    function add(x) {
      if (!x || !x.hz || seen[x.hz] || /→/.test(x.py || "")) return;
      var seq = segment(x.hz);
      if (seq.length < 3 || seq.length > 9) return;
      seen[x.hz] = 1; out.push({ hz: x.hz, py: x.py, vi: x.vi, seq: seq });
    }
    srcLessons().forEach(function (l) {
      l.vocab.forEach(function (v) { add(v.ex); });
      l.dialogues.forEach(function (d) { d.lines.forEach(add); });
    });
    if (validSrc() === "learned") {
      var mine = out.filter(function (s) { return s.seq.some(function (c) { return S.learned[c]; }); });
      if (mine.length >= 3) out = mine;
    }
    return out;
  }
  function bridge() {
    var list = shuffle(sentences()).slice(0, 6), r = 0, cur;
    var st = { score: 0, perfect: 0 };
    function upd() { stats("<span>Câu <b>" + (r + 1) + "/" + list.length + "</b></span>" + pts(st.score)); }
    function round() {
      var s = list[r], chips = s.seq.map(function (c, i) { return { t: c, i: i }; }), sh = shuffle(chips), tries = 0;
      while (sh.length > 1 && tries++ < 6 && sh.every(function (c, i) { return c.t === s.seq[i]; })) sh = shuffle(chips);
      cur = { s: s, pos: 0, mistakes: 0, hints: 0, done: false, chips: sh };
      frame('<div class="gprompt"><span class="ask">Xếp các từ thành câu tiếng Trung có nghĩa</span><span class="vi">' + esc(s.vi) + "</span></div>" +
        '<div class="bridge" id="brg"><span class="walker" aria-hidden="true"></span><div class="cliff l"></div><div class="deck">' +
        s.seq.map(function (c, i) { return '<span class="plank" id="pl' + i + '" style="min-width:' + (Array.from(c).length * 22 + 18) + 'px">' + esc(c) + "</span>"; }).join("") +
        '</div><div class="cliff r"></div></div>' +
        '<div class="wchips">' + sh.map(function (c, i) { return '<button class="wchip hz" data-gv="' + i + '">' + esc(c.t) + "</button>"; }).join("") + "</div>" +
        '<div class="gmsg" id="gMsg" aria-live="polite"></div>' +
        '<div class="row" style="justify-content:center"><button class="btn" data-gx="listen">' + ICON_PLAY + ' Nghe câu</button><button class="btn" data-gx="hint">Gợi ý từ tiếp theo</button><button class="btn primary" data-gx="next" id="brNext" hidden>Câu tiếp</button></div>');
      upd();
      var f = $(".wchip"); if (f) f.focus({ preventScroll: true });
    }
    function chip(i) {
      if (cur.done) return;
      var c = cur.chips[i], el = $('.wchip[data-gv="' + i + '"]');
      if (!c || !el || el.disabled) return;
      if (c.t === cur.s.seq[cur.pos]) {
        el.disabled = true; el.classList.remove("bad", "tip");
        var p = $("#pl" + cur.pos); p.classList.add("on");
        cur.pos++;
        if (cur.pos === cur.s.seq.length) done();
        else { var nx = document.querySelector(".wchip:not(:disabled)"); if (nx && document.activeElement === el) nx.focus({ preventScroll: true }); }
      } else {
        cur.mistakes++;
        el.classList.remove("bad"); void el.offsetWidth; el.classList.add("bad");
        msg("Chưa đúng vị trí, thử từ khác.", "bad");
      }
    }
    function done() {
      cur.done = true;
      var gain = Math.max(2, 12 - cur.mistakes * 3 - cur.hints * 3);
      if (!cur.mistakes && !cur.hints) st.perfect++;
      st.score += gain;
      $("#brg").classList.add("done");
      msg("Cầu đã nối! +" + gain + '<br><span class="hz say" data-speak="' + esc(cur.s.hz) + '" style="font-size:22px">' + esc(cur.s.hz) + "</span><br>" + A.toneSpans(cur.s.py), "ok");
      A.speak(cur.s.hz, 0.85);
      upd();
      var b = $("#brNext"); b.hidden = false; b.textContent = r + 1 < list.length ? "Câu tiếp" : "Xem kết quả"; b.focus({ preventScroll: true });
    }
    G.cur = {
      act: function (k, v) {
        if (k === "listen") A.speak(cur.s.hz, 0.8);
        else if (k === "hint" && !cur.done) {
          cur.hints++;
          var want = cur.s.seq[cur.pos], el = Array.prototype.find.call(document.querySelectorAll(".wchip:not(:disabled)"), function (b) { return cur.chips[+b.dataset.gv].t === want; });
          if (el) { el.classList.remove("tip"); void el.offsetWidth; el.classList.add("tip"); el.focus({ preventScroll: true }); }
        } else if (k === "next" && cur.done) { r++; if (r < list.length) round(); else finish(st.score, "<div>Nối xong " + list.length + " cây cầu, " + st.perfect + " cây không sai bước nào.</div>"); }
        else if (v != null && !k) chip(+v);
      }
    };
    round();
  }

  /* ---------------- 7. Lật thẻ ghép cặp ---------------- */
  function memory() {
    var words = distinct(6), cards = [];
    words.forEach(function (v, i) { cards.push({ i: i, t: "h" }, { i: i, t: "m" }); });
    cards = shuffle(cards);
    var st = { open: [], done: 0, moves: 0, t0: Date.now(), lock: false };
    function upd() { stats("<span>Lượt <b>" + st.moves + "</b></span><span>Cặp <b>" + st.done + "/" + words.length + "</b></span><span>Thời gian <b>" + mmss((Date.now() - st.t0) / 1000) + "</b></span>"); }
    frame('<p class="ghelp" style="margin:0">Lật hai thẻ một lượt. Thẻ chữ Hán khớp với thẻ nghĩa thì giữ lại, không khớp thì úp xuống.</p>' +
      '<div class="mem">' + cards.map(function (c, k) {
        var v = words[c.i];
        return '<button class="mcard" data-gv="' + k + '" aria-label="Thẻ ' + (k + 1) + '"><span class="in"><span class="b" aria-hidden="true">?</span><span class="f' + (c.t === "h" ? " fh" : "") + '">' +
          (c.t === "h" ? '<span class="hz" style="font-size:' + Math.min(30, fitHz(v.hz) - 2) + 'px">' + esc(v.hz) + "</span>" : esc(shortVi(v.vi))) + "</span></span></button>";
      }).join("") + '</div><div class="gmsg" id="gMsg" aria-live="polite"></div>');
    function el(k) { return $('.mcard[data-gv="' + k + '"]'); }
    function flip(k) {
      var c = cards[k], e = el(k);
      if (st.lock || !c || c.done || st.open.indexOf(k) > -1) return;
      e.classList.add("open"); e.setAttribute("aria-label", c.t === "h" ? words[c.i].hz : shortVi(words[c.i].vi));
      if (c.t === "h") A.speak(words[c.i].hz, 1);
      st.open.push(k);
      if (st.open.length < 2) return;
      st.moves++;
      var a = cards[st.open[0]], b = cards[st.open[1]], ka = st.open[0], kb = st.open[1];
      if (a.i === b.i) {
        a.done = b.done = true; st.done++; st.open = [];
        el(ka).classList.add("done"); el(kb).classList.add("done");
        msg(wordLine(words[a.i]), "ok");
        if (st.done === words.length) {
          st.lock = true;
          later(700, function () {
            var sec = (Date.now() - st.t0) / 1000;
            finish(Math.max(10, 100 - Math.max(0, st.moves - words.length) * 5 - Math.floor(sec / 4)), "<div>Hoàn thành trong " + st.moves + " lượt, " + mmss(sec) + ".</div>" + review(words, "Các từ vừa ghép"));
          });
        }
      } else {
        st.lock = true;
        later(850, function () {
          [ka, kb].forEach(function (x) { var e2 = el(x); e2.classList.remove("open"); e2.setAttribute("aria-label", "Thẻ " + (x + 1)); });
          st.open = []; st.lock = false;
        });
      }
      upd();
    }
    G.cur = { act: function (k, v) { if (v != null) flip(+v); } };
    upd();
    every(500, upd);
  }

  /* ---------------- 8. Đoán từ ---------------- */
  function wordle() {
    var ok = function (v) { var n = plain(v).length; return n >= 3 && n <= 8; };
    var cand = POOL.filter(ok);
    if (!cand.length) cand = A.VOCAB.filter(ok);
    var w = pick(cand), ans = plain(w), n = ans.length, rows = [], cur = "", over = false, ks = {};
    var ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"], RANK = { a: 1, p: 2, c: 3 };
    frame('<div class="gprompt"><span class="ask">Đoán pinyin không dấu của từ, ' + n + " chữ cái, 6 lượt</span>" + hzSay(w.hz, "font-size:48px") + '<span class="vi" style="font-size:18px">' + esc(w.vi) + "</span></div>" +
      '<div class="wgrid" id="wGrid" style="--n:' + n + '"></div><div class="gmsg" id="gMsg" aria-live="polite"></div>' +
      '<div class="kb" id="wKb"></div>' +
      '<p class="ghelp" style="margin:0;text-align:center">Xanh: đúng chữ đúng chỗ. Vàng: có chữ này nhưng sai chỗ. Chữ ü gõ là u hoặc v.</p>');
    function draw() {
      var h = "";
      for (var r = 0; r < 6; r++) {
        h += '<div class="wrow">';
        for (var c = 0; c < n; c++) {
          var ch = "", cls = "";
          if (r < rows.length) { ch = rows[r].g[c]; cls = " " + rows[r].res[c]; }
          else if (r === rows.length && c < cur.length) { ch = cur[c]; cls = " f"; }
          h += '<span class="wcell' + cls + '">' + ch + "</span>";
        }
        h += "</div>";
      }
      $("#wGrid").innerHTML = h;
      $("#wKb").innerHTML = ROWS.map(function (row, i) {
        return '<div class="kbr">' + (i === 2 ? '<button class="key wide" data-gv="enter">Đoán</button>' : "") +
          row.split("").map(function (k) { return '<button class="key' + (ks[k] ? " " + ks[k] : "") + '" data-gv="k' + k + '">' + k + "</button>"; }).join("") +
          (i === 2 ? '<button class="key wide" data-gv="back" aria-label="Xóa">Xóa</button>' : "") + "</div>";
      }).join("");
      stats("<span>Lượt <b>" + Math.min(6, rows.length + (over ? 0 : 1)) + "/6</b></span>");
    }
    function type(k) { if (over) return; if (k === "v") k = "u"; if (cur.length < n) { cur += k; draw(); } }
    function back() { if (over) return; cur = cur.slice(0, -1); draw(); }
    function enter() {
      if (over) return;
      if (cur.length < n) { msg("Cần đủ " + n + " chữ cái.", "bad"); return; }
      var res = [], left = {}, i;
      for (i = 0; i < n; i++) { if (cur[i] === ans[i]) res[i] = "c"; else left[ans[i]] = (left[ans[i]] || 0) + 1; }
      for (i = 0; i < n; i++) if (!res[i]) { if (left[cur[i]]) { res[i] = "p"; left[cur[i]]--; } else res[i] = "a"; }
      for (i = 0; i < n; i++) if (!ks[cur[i]] || RANK[res[i]] > RANK[ks[cur[i]]]) ks[cur[i]] = res[i];
      rows.push({ g: cur, res: res });
      var win = cur === ans; cur = "";
      if (win || rows.length >= 6) over = true;
      draw();
      if (win) {
        msg("Đúng rồi! " + wordLine(w), "ok"); A.speak(w.hz, 0.85);
        var score = (7 - rows.length) * 10 + 10;
        later(1500, function () { finish(score, "<div>Đoán đúng sau " + rows.length + " lượt.</div>" + review([w], "Từ vừa đoán")); });
      } else if (over) {
        msg("Hết lượt. Đáp án: " + wordLine(w), "bad"); A.speak(w.hz, 0.85);
        later(2200, function () { finish(0, "<div>Chưa đoán ra lần này.</div>" + review([w], "Đáp án", true)); });
      } else msg("", "");
    }
    G.cur = {
      act: function (k, v) { if (!v) return; if (v === "enter") enter(); else if (v === "back") back(); else if (v[0] === "k") type(v.slice(1)); },
      key: function (e) {
        if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return false;
        if (/^[a-z]$/i.test(e.key)) { type(e.key.toLowerCase()); return true; }
        if (e.key === "Backspace") { back(); return true; }
        if (e.key === "Enter" && !(e.target.closest && e.target.closest("#gArea button:not(.key)"))) { enter(); return true; }
        return false;
      }
    };
    draw();
  }

  /* ---------------- Danh sách trò chơi ---------------- */
  var GAMES = [
    { id: "rain", name: "Mưa từ vựng", desc: "Từ rơi xuống, gõ pinyin thật nhanh để bắn hạ trước khi chạm đất.", need: 1, run: rain,
      icon: '<path d="M6 3v6M12 5v8M18 3v5"/><path d="M3 20h18"/><path d="M12 16v2"/>' },
    { id: "bee", name: "Ong chính tả", desc: "Nghe đọc một từ rồi gõ lại pinyin, 10 lượt mỗi ván.", need: 1, run: bee,
      icon: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a8.5 8.5 0 0 1 0 13"/>' },
    { id: "match", name: "Nối từ", desc: "Chạm chữ Hán rồi chạm nghĩa tương ứng để xóa sạch bảng.", need: 3, run: match,
      icon: '<rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="14" width="7" height="6" rx="1.5"/><path d="M10 7h4a3 3 0 0 1 3 3v4"/>' },
    { id: "meteor", name: "Thiên thạch trắc nghiệm", desc: "Chọn đúng nghĩa trước khi thiên thạch rơi xuống, giữ chuỗi đúng.", need: 1, run: meteor,
      icon: '<circle cx="15" cy="15" r="5"/><path d="M11.5 11.5L4 4M9 15L4.5 10.5M15 9l-4.5-4.5"/><path d="M3 21h18"/>' },
    { id: "bubbles", name: "Bắn bong bóng", desc: "Bấm vào bong bóng mang chữ Hán đúng nghĩa trước khi nó bay mất.", need: 1, run: bubbles,
      icon: '<circle cx="8" cy="14" r="5"/><circle cx="17" cy="7.5" r="3.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M6 12a2.5 2.5 0 0 1 2-1.5"/>' },
    { id: "bridge", name: "Xây cầu", desc: "Ghép từ thành câu đúng, mỗi từ đúng lát thêm một tấm ván.", need: 0, run: bridge,
      icon: '<path d="M2 16h20M4 16v4M20 16v4"/><path d="M2 16c4-7 16-7 20 0"/><path d="M8 11.5V16M12 10.3V16M16 11.5V16"/>' },
    { id: "memory", name: "Lật thẻ ghép cặp", desc: "Lật thẻ, nhớ vị trí và ghép chữ Hán với nghĩa của nó.", need: 3, run: memory,
      icon: '<rect x="3" y="5" width="8" height="13" rx="1.5"/><rect x="13" y="5" width="8" height="13" rx="1.5"/><path d="M7 10v3M15.5 11.5h3"/>' },
    { id: "wordle", name: "Đoán từ", desc: "Đoán pinyin của từ trong 6 lượt, màu ô cho biết chữ nào đúng.", need: 1, run: wordle,
      icon: '<rect x="3" y="4" width="5" height="5" rx="1"/><rect x="9.5" y="4" width="5" height="5" rx="1"/><rect x="16" y="4" width="5" height="5" rx="1"/><rect x="3" y="11" width="5" height="5" rx="1"/><rect x="9.5" y="11" width="5" height="5" rx="1"/><path d="M16 13.5h5M3 20h18"/>' }
  ];
  var GAME = {};
  GAMES.forEach(function (g) { GAME[g.id] = g; });

  function card(g) {
    var best = (S.gameBest || {})[g.id];
    return '<article class="gcard"><span class="gic"><svg viewBox="0 0 24 24" aria-hidden="true">' + g.icon + "</svg></span><h3>" + esc(g.name) + "</h3><p>" + esc(g.desc) + "</p>" +
      '<div class="gfoot"><span class="gbest">' + (best ? "Kỷ lục <b>" + best + "</b>" : "Chưa chơi") + '</span><button class="btn primary small" data-game="' + g.id + '">Chơi ngay</button></div></article>';
  }
  function countText() {
    var n = pool().length;
    return n + " từ" + (validSrc() === "learned" && !n ? ", hãy đánh dấu từ đã thuộc trước" : "");
  }
  function view() {
    var s = validSrc();
    return '<div><h1 style="font-size:26px">Trò chơi luyện từ</h1><p class="lead">Ôn từ vựng và mẫu câu qua 8 trò chơi ngắn, chơi được bằng bàn phím lẫn cảm ứng. Mỗi ván kết thúc được cộng điểm, kỷ lục của từng trò được lưu lại.</p></div>' +
      '<div class="panel gsrc" id="gSrcP"><label for="gSrc">Nguồn từ</label><select id="gSrc"><option value="all"' + (s === "all" ? " selected" : "") + ">Tất cả bài học</option>" +
      A.lessonOptions(s, true) + '<option value="learned"' + (s === "learned" ? " selected" : "") + ">Từ đã thuộc</option></select>" +
      '<span class="chip jade" id="gCount">' + esc(countText()) + "</span></div>" +
      '<div id="gNote"></div><div class="ggrid" id="gHub">' + GAMES.map(card).join("") + '</div><div id="gArea" hidden></div>';
  }
  function start(id) {
    var g = GAME[id];
    if (!g || !$("#gArea")) return;
    stop();
    POOL = pool();
    var note = $("#gNote");
    if (note) note.innerHTML = "";
    var short = g.id === "bridge" ? (sentences().length ? "" : "Nguồn này chưa có câu ví dụ đủ dài để xây cầu. Hãy chọn nguồn khác.")
      : POOL.length < g.need ? "Nguồn từ này mới có " + POOL.length + " từ, trò " + g.name + " cần ít nhất " + g.need + " từ. Hãy chọn nguồn khác hoặc đánh dấu thêm từ đã thuộc." : "";
    if (short) { if (note) note.innerHTML = '<div class="empty">' + esc(short) + "</div>"; return; }
    G.id = id;
    $("#gHub").hidden = true; $("#gSrcP").hidden = true;
    var area = $("#gArea"); area.hidden = false;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    g.run();
  }

  /* ---------------- Sự kiện ---------------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-game],[data-gx],[data-gv]");
    if (!el || !el.closest("#view")) return;
    if (el.dataset.game) return start(el.dataset.game);
    var k = el.dataset.gx;
    if (k === "exit") return A.go("trochoi");
    if (k === "again") return start(G.id);
    if (G.cur && G.cur.act) G.cur.act(k || null, el.dataset.gv != null ? el.dataset.gv : null, el);
  });
  document.addEventListener("keydown", function (e) {
    if (!G.cur || !G.cur.key || e.ctrlKey || e.metaKey || e.altKey || !$("#gArea")) return;
    if (!$("#drawer").hidden) return;
    if (G.cur.key(e)) e.preventDefault();
  });
  document.addEventListener("input", function (e) { if (G.cur && G.cur.input && e.target.id === "gIn") G.cur.input(e.target); });
  document.addEventListener("change", function (e) {
    if (e.target.id !== "gSrc") return;
    S.gameSrc = e.target.value; A.save();
    var c = $("#gCount"); if (c) c.textContent = countText();
    var note = $("#gNote"); if (note) note.innerHTML = "";
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden && hasTTS) speechSynthesis.cancel(); });

  window.HSK_GAMES = { view: view, stop: stop, start: start, norm: norm, segment: segment };
  if (S.tab === "trochoi") A.go("trochoi");
})();
