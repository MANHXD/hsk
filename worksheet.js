/* Phiếu tập viết ô mễ / ô điền khổ A4. Nạp sau app.js, dùng window.HSK_APP. */
(function () {
  "use strict";
  var A = window.HSK_APP;
  if (!A) return;
  var S = A.S, esc = A.esc;
  var $ = function (s) { return document.querySelector(s); };
  var HAN = /[㐀-鿿]/;
  var SAMPLE = "Tôi 30 tuổi rồi, còn bạn? | 我三十岁了，你呢？\nBố bạn năm nay bao nhiêu tuổi? | 你爸爸今年多大了？\nCon trai tôi năm nay 8 tuổi. | 我儿子今年八岁。\nTôi có 2 quyển sách tiếng Trung. | 我有两本中文书。";
  var SAMPLE_CH = "儿子孩子女";
  var SAMPLE_TV = "好\n你\n大\n家\n大家\n您\n们\n你们\n学生\n老师";
  var DEF = { mode: "cau", text: SAMPLE, chars: SAMPLE_CH, grid: "mi", cell: 13, rows: 3, trace: "none", showPy: false, answers: true, by: "MANHXD", chRows: 2, chTrace: 0, chOrder: true, chNote: true, cols: 10, chCols: 10, tvText: SAMPLE_TV, tvTitle: "TỪ VỰNG", tvSub: "", tvPre: "vi", tvRowH: 15, tvBg: "oli", tvMi: true, tvOrder: "keep", tvSeed: 1, tvAns: true, tvFill: true };
  var CELL = 16; // cỡ ô chuẩn (mm), cố định; đổi số ô chỉ đổi độ dài lưới
  function opt() { var o = S.sheet || (S.sheet = {}); Object.keys(DEF).forEach(function (k) { if (o[k] === undefined) o[k] = DEF[k]; }); return o; }

  // Mỗi dòng: "Câu tiếng Việt | 中文 | pinyin" (phần 2, 3 không bắt buộc)
  function parse(text) {
    return String(text || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var p = l.split("|").map(function (x) { return x.trim(); });
      var vi = p[0], hz = p[1] || "", py = p[2] || "";
      if (!hz && HAN.test(vi) && !/[a-zà-ỹ]/i.test(vi.replace(/[㐀-鿿]/g, ""))) { hz = vi; }
      if (hz && !py && A.pinyinOf) py = A.pinyinOf(hz);
      return { vi: vi.replace(/^\d+[.)]\s*/, ""), hz: hz, py: py };
    });
  }

  // Lưới ô vẽ bằng SVG, đơn vị mm để in đúng kích thước
  function gridSVG(cols, rows, c, kind, trace) {
    var w = cols * c, h = rows * c, s = [];
    var thin = 'stroke="#9a9a9a" stroke-width="0.18" stroke-dasharray="1 0.8"';
    for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) {
      var x = k * c, y = r * c, m = c / 2;
      s.push('<line x1="' + (x + m) + '" y1="' + y + '" x2="' + (x + m) + '" y2="' + (y + c) + '" ' + thin + "/>");
      s.push('<line x1="' + x + '" y1="' + (y + m) + '" x2="' + (x + c) + '" y2="' + (y + m) + '" ' + thin + "/>");
      if (kind === "mi") {
        s.push('<line x1="' + x + '" y1="' + y + '" x2="' + (x + c) + '" y2="' + (y + c) + '" ' + thin + "/>");
        s.push('<line x1="' + (x + c) + '" y1="' + y + '" x2="' + x + '" y2="' + (y + c) + '" ' + thin + "/>");
      }
    }
    for (var i = 1; i < cols; i++) s.push('<line x1="' + i * c + '" y1="0" x2="' + i * c + '" y2="' + h + '" stroke="#555" stroke-width="0.25"/>');
    for (var j = 1; j < rows; j++) s.push('<line x1="0" y1="' + j * c + '" x2="' + w + '" y2="' + j * c + '" stroke="#555" stroke-width="0.25"/>');
    s.push('<rect x="0.15" y="0.15" width="' + (w - 0.3) + '" height="' + (h - 0.3) + '" fill="none" stroke="#333" stroke-width="0.35"/>');
    (trace || []).forEach(function (t) {
      var sd = window.HZ_STROKES && window.HZ_STROKES[t.ch];
      if (sd) { s.push(charPaths(sd, t.k * c, t.r * c, c, t.dark ? "#333" : "#cfcfcf")); return; }
      s.push('<text x="' + (t.k * c + c / 2) + '" y="' + (t.r * c + c * 0.8) + '" font-size="' + (c * 0.78) + '" text-anchor="middle" fill="#c4c4c4" font-family="Noto Serif SC, KaiTi, STKaiti, SimSun, serif">' + esc(t.ch) + "</text>");
    });
    return '<svg class="ws-grid" viewBox="0 0 ' + w + " " + h + '" style="width:' + w + "mm;height:" + h + 'mm" xmlns="http://www.w3.org/2000/svg">' + s.join("") + "</svg>";
  }

  // Chữ vẽ bằng nét thật (dữ liệu Make Me a Hanzi, hệ toạ độ 1024, trục y ngược)
  function charPaths(sd, x, y, c, color, upto, only) {
    var k = c / 1024 * 0.9, off = c * 0.05, n = upto == null ? sd.strokes.length : upto;
    return '<g transform="translate(' + (x + off) + "," + (y + off + 900 * k) + ") scale(" + k + "," + -k + ')">' +
      sd.strokes.map(function (d, i) { if (only && i >= n) return ""; return '<path d="' + d + '" fill="' + (i < n ? (i === n - 1 && upto != null && !only ? "#b03a2e" : color) : "#d2d2d2") + '"/>'; }).join("") + "</g>";
  }
  function head(o) { return '<div class="ws-head"><span class="ws-hz">姓名:</span><span class="ws-by">' + "by: MANHXD" + '</span><span class="ws-hz ws-date">年<i></i>月<i></i>日</span></div>'; }
  function charList(o) { var seen = {}; return (A.hanChars ? A.hanChars(o.chars || "") : []).filter(function (c) { return seen[c] ? false : (seen[c] = 1); }); } /* chữ trùng chỉ in 1 khối */
  // Khối luyện một chữ theo mẫu vở: cột trái chữ to + bộ thủ + cấu trúc, bên phải pinyin, số nét, thứ tự nét, các dòng ô
  function charBlock(ch, o) {
    var L = 26, c = CELL, cols = Math.min(+o.chCols || 10, Math.floor((186 - L) / CELL)), W = L + cols * c, top = 13, rows = Math.max(1, Math.min(4, +o.chRows || 2)), H = top + rows * c;
    var sd = window.HZ_STROKES && window.HZ_STROKES[ch], cv = (window.HZ_CHARVI || {})[ch], info = cv ? { py: cv[0], hv: cv[1], vi: cv[2] } : (A.charInfo && A.charInfo(ch)) || {}, bigH = rows === 1 ? H : H - c, s = [];
    var thin = 'stroke="#9a9a9a" stroke-width="0.18" stroke-dasharray="1 0.8"', line = function (x1, y1, x2, y2, w) { s.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#444" stroke-width="' + (w || 0.25) + '"/>'); };
    function guide(x, y, w, h) {
      s.push('<line x1="' + (x + w / 2) + '" y1="' + y + '" x2="' + (x + w / 2) + '" y2="' + (y + h) + '" ' + thin + "/>", '<line x1="' + x + '" y1="' + (y + h / 2) + '" x2="' + (x + w) + '" y2="' + (y + h / 2) + '" ' + thin + "/>");
      if (o.grid === "mi") s.push('<line x1="' + x + '" y1="' + y + '" x2="' + (x + w) + '" y2="' + (y + h) + '" ' + thin + "/>", '<line x1="' + (x + w) + '" y1="' + y + '" x2="' + x + '" y2="' + (y + h) + '" ' + thin + "/>");
    }
    // chữ to: ô luôn vuông L x L nằm giữa cột trái để đường kẻ không méo khi để 3-4 dòng (MANHXD chọn kiểu này 2026-10-21)
    var sq = Math.min(L, bigH), by = (bigH - sq) / 2;
    guide(0, by, L, sq);
    if (sd) s.push(charPaths(sd, (L - sq) / 2, by, sq, "#111"));
    else s.push('<text x="' + L / 2 + '" y="' + (by + sq * 0.8) + '" font-size="' + sq * 0.75 + '" text-anchor="middle" font-family="Noto Serif SC, serif">' + esc(ch) + "</text>");
    if (by > 3) { line(0, by, L, by, 0.2); line(0, by + sq, L, by + sq, 0.2); }
    if (rows > 1) line(0, bigH, L, bigH);
    // ô nghĩa: để trống dòng chấm cho học sinh tự điền nghĩa (MANHXD 2026-10-21: nghĩa tự sinh hay sai)
    var mTop = bigH, mH = H - mTop, nDot = rows === 1 ? 0 : mH >= 14 ? 2 : 1; /* 1 dòng: không có ô nghĩa */
    for (var di = 0; di < nDot; di++) { var dy = mTop + mH * (di + 1) / (nDot + 1) + 1.2; s.push('<line x1="2.5" y1="' + dy + '" x2="' + (L - 2.5) + '" y2="' + dy + '" stroke="#777" stroke-width="0.3" stroke-dasharray="0.3 1.1" stroke-linecap="round"/>'); }
    // dòng đầu: pinyin, số nét, thứ tự nét
    var x = L + 2.5, py = (info.py || "").replace(/ /g, "");
    s.push('<text x="' + x + '" y="7.6" font-size="3.6" fill="#222" font-family="Be Vietnam Pro, sans-serif">' + esc(py) + "</text>");
    x += Math.max(8, py.length * 2.1 + 3);
    if (sd) {
      s.push('<text x="' + x + '" y="7.6" font-size="3.3" fill="#222" font-family="Noto Serif SC, serif">' + sd.strokes.length + "画</text>"); x += 9;
      // thứ tự nét: chữ mờ làm nền, nét đã viết màu đen, nét đang viết màu đỏ, số thứ tự bên dưới
      var room = W - 1.5 - x, step = Math.min(11, room / sd.strokes.length), g = Math.min(9.6, step - 0.4);
      sd.strokes.forEach(function (_, i) {
        var gx = x + i * step + (step - g) / 2;
        s.push(charPaths(sd, gx, 0.6, g, "#1a1a1a", i + 1));
        s.push('<text x="' + (gx + g / 2) + '" y="' + (top - 0.7) + '" font-size="1.9" fill="#888" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif">' + (i + 1) + "</text>");
      });
    }
    // lưới ô
    line(L, top, W, top);
    for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) guide(L + k * c, top + r * c, c, c);
    for (r = 1; r < rows; r++) line(L, top + r * c, W, top + r * c);
    for (k = 1; k < cols; k++) line(L + k * c, top, L + k * c, H);
    var nt = +o.chTrace, lim = nt < 0 ? cols : Math.min(cols, nt);
    if (sd) for (k = 0; k < lim; k++) s.push(charPaths(sd, L + k * c, top, c, "#cfcfcf"));
    line(L, 0, L, H, 0.3);
    s.push('<rect x="0.15" y="0.15" width="' + (W - 0.3) + '" height="' + (H - 0.3) + '" fill="none" stroke="#333" stroke-width="0.35"/>');
    return '<div class="ws-item ws-citem"><svg class="ws-grid" viewBox="0 0 ' + W + " " + H + '" style="width:' + W + "mm;height:" + H + 'mm" xmlns="http://www.w3.org/2000/svg">' + s.join("") + "</svg></div>";
  }
  function wrap(t, n) {
    var out = [], cur = "";
    String(t || "").split(/\s+/).filter(Boolean).forEach(function (w) { if (cur && (cur + " " + w).length > n) { out.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; });
    if (cur) out.push(cur); return out;
  }
  function charSheetHTML(o) {
    var body = charList(o).map(function (ch) { return charBlock(ch, o); }).join("");
    // khối hẹp (2 khối vừa 186mm) thì xếp 2 cột cho đỡ tốn giấy (MANHXD 2026-10-24)
    var W = 26 + Math.min(+o.chCols || 10, Math.floor((186 - 26) / CELL)) * CELL;
    if (2 * W + 3 <= 186) body = '<div class="ws-two" style="grid-template-columns:' + W + "mm " + W + 'mm">' + body + "</div>";
    return '<div class="ws-page">' + head(o) + body + "</div>";
  }

  /* ---------- Phiếu luyện ghi nhớ từ vựng (MANHXD 2026-10-26) ----------
     Mỗi dòng: "中文" hoặc "中文 | nghĩa" hoặc "nghĩa | 中文".
     Nghĩa và pinyin tự lấy từ kho từ vựng khi bỏ trống. */
  var TV_COLS = [["hz", "Tiếng Trung"], ["py", "Phiên âm"], ["vi", "Nghĩa"]];
  var TV_W = { no: 9, hz: 55, py: 50, vi: 70 }; // tổng 184mm, chừa viền cho khổ 186mm
  function tvParse(text) {
    return String(text || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var p = l.split("|").map(function (x) { return x.trim(); }), hz = "", rest = [];
      p.forEach(function (x) { if (!hz && HAN.test(x) && !/[a-zà-ỹ]/i.test(x.replace(/[㐀-鿿]/g, ""))) hz = x; else rest.push(x); });
      var v = hz && A.lookup ? A.lookup(hz) : null;
      var vi = rest[0] || (v && !v.pos || v && v.pos.indexOf("tiếng Anh") < 0 ? (v && v.vi) || "" : "");
      return { hz: hz, vi: vi.replace(/^\d+[.)]\s*/, ""), am: rest[1] || "", py: hz ? ((v && v.syl) || (A.pinyinOf ? A.pinyinOf(hz) : "")) : "" };
    });
  }
  function seeded(arr, seed) {
    var a = arr.slice(), x = (seed * 9301 + 49297) % 233280 || 1;
    for (var i = a.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; var j = Math.floor(x / 233280 * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function miBoxes(n, size, kind) {
    var s = [], w = n * size, m = size / 2, thin = 'stroke="#b9c3cc" stroke-width="0.18" stroke-dasharray="0.9 0.7"';
    for (var k = 0; k < n; k++) {
      var x = k * size;
      s.push('<line x1="' + (x + m) + '" y1="0" x2="' + (x + m) + '" y2="' + size + '" ' + thin + '/><line x1="' + x + '" y1="' + m + '" x2="' + (x + size) + '" y2="' + m + '" ' + thin + "/>");
      if (kind === "mi") s.push('<line x1="' + x + '" y1="0" x2="' + (x + size) + '" y2="' + size + '" ' + thin + '/><line x1="' + (x + size) + '" y1="0" x2="' + x + '" y2="' + size + '" ' + thin + "/>");
      s.push('<rect x="' + (x + 0.1) + '" y="0.1" width="' + (size - 0.2) + '" height="' + (size - 0.2) + '" fill="none" stroke="#6f8596" stroke-width="0.25"/>');
    }
    return '<svg class="ws-tvmi" viewBox="0 0 ' + w + " " + size + '" style="width:' + w + "mm;height:" + size + 'mm" xmlns="http://www.w3.org/2000/svg">' + s.join("") + "</svg>";
  }
  function tvCell(k, it, o, show, rowH) {
    var txt = show ? (k === "hz" ? it.hz : k === "py" ? it.py : k === "am" ? it.am : it.vi) : "";
    if (k === "hz" && !show && o.tvMi) { var size = Math.min(rowH - 3, 12), n = Math.max(1, Math.min(Math.floor((TV_W.hz - 3) / size), Array.from(it.hz || "").length || 2)); return '<td class="ws-tv-hz">' + miBoxes(n, size, o.grid) + "</td>"; }
    return '<td class="ws-tv-' + k + '">' + (txt ? '<span class="' + (k === "hz" ? "ws-hz " : "") + 'ws-tvtxt">' + esc(txt) + "</span>" : "") + "</td>";
  }
  function tvTable(rows, o, pre, start) {
    var rowH = +o.tvRowH || 15;
    var pc = function (mm) { return (mm / 184 * 100).toFixed(2) + "%"; }; // phần trăm để bảng luôn vừa khổ, không tràn lề
    var cg = '<colgroup><col style="width:' + pc(TV_W.no) + '">' + TV_COLS.map(function (c) { return '<col style="width:' + pc(TV_W[c[0]]) + '">'; }).join("") + "</colgroup>";
    var th = "<thead><tr><th>#</th>" + TV_COLS.map(function (c) { return "<th>" + c[1] + "</th>"; }).join("") + "</tr></thead>";
    var tb = rows.map(function (it, i) {
      return '<tr style="height:' + rowH + 'mm"><td class="ws-tv-no">' + (it ? start + i + 1 : "") + "</td>" + TV_COLS.map(function (c) { return it ? tvCell(c[0], it, o, pre[c[0]], rowH) : '<td class="ws-tv-' + c[0] + '"></td>'; }).join("") + "</tr>";
    }).join("");
    return '<table class="ws-tv ws-tv-' + (o.tvBg || "oli") + '">' + cg + th + "<tbody>" + tb + "</tbody></table>";
  }
  function tvTitle(o, cont, key) {
    return '<div class="ws-tvtitle"><span class="ws-tvseal ws-hz">孟</span><div><b>' + esc(o.tvTitle || "TỪ VỰNG") + (key ? " - ĐÁP ÁN" : "") + "</b>" + (o.tvSub ? "<small>" + esc(o.tvSub) + "</small>" : "") + "</div>" + (cont ? '<span class="ws-tvpg">tiếp theo</span>' : "") + "</div>";
  }
  function tvSheetHTML(o) {
    var items = tvParse(o.tvText);
    if (o.tvOrder === "shuffle") items = seeded(items, +o.tvSeed || 1);
    var pre = {}; String(o.tvPre || "vi").split(",").forEach(function (k) { if (k) pre[k] = 1; });
    var rowH = +o.tvRowH || 15, per = Math.max(4, Math.floor((277 - 40) / rowH)), pages = [], out = "";
    for (var i = 0; i < Math.max(1, items.length); i += per) pages.push(items.slice(i, i + per));
    pages.forEach(function (pg, n) {
      var rows = pg.slice(); if (o.tvFill || !items.length) while (rows.length < per) rows.push(null);
      out += '<div class="ws-page ws-tvpage">' + head(o) + tvTitle(o, n > 0) + tvTable(rows, o, pre, n * per) + '<div class="ws-tvfoot">HỌC TIẾNG TRUNG CÙNG MANHXD<span>by: MANHXD</span></div></div>';
    });
    if (o.tvAns && items.some(function (it) { return it.hz; })) {
      var all = { hz: 1, py: 1, vi: 1 }, ko = Object.assign({}, o, { tvMi: false, tvRowH: 11, tvBg: "none" }), per2 = Math.floor((277 - 40) / 11);
      for (var j = 0; j < items.length; j += per2) out += '<div class="ws-page ws-tvpage ws-tvkey">' + head(o) + tvTitle(o, j > 0, true) + tvTable(items.slice(j, j + per2), ko, all, j) + '<div class="ws-tvfoot">HỌC TIẾNG TRUNG CÙNG MANHXD<span>by: MANHXD</span></div></div>';
    }
    return out;
  }
  function sheetHTML(o) {
    if (o.mode === "chu") return charSheetHTML(o);
    if (o.mode === "tv") return tvSheetHTML(o);
    var items = parse(o.text), c = CELL, cols = Math.min(+o.cols || 10, Math.floor(186 / CELL)), rows = Math.max(1, Math.min(8, +o.rows || 3));
    var body = items.map(function (it, n) {
      var chars = Array.from(it.hz).filter(function (ch) { return !/\s/.test(ch); }), tr = [];
      if (o.trace !== "none" && chars.length) {
        if (o.trace === "row") chars.slice(0, cols).forEach(function (ch, k) { tr.push({ r: 0, k: k, ch: ch }); });
        else if (o.trace === "all") chars.slice(0, cols * rows).forEach(function (ch, k) { tr.push({ r: Math.floor(k / cols), k: k % cols, ch: ch }); });
      }
      return '<div class="ws-item" style="width:' + cols * c + 'mm"><div class="ws-q">' + (n + 1) + ". " + esc(it.vi) + "</div>" +
        '<div class="ws-py">' + (cols <= 2 ? "" : "<span>pinyin</span>") + '<div class="ws-pyline">' + (o.showPy && it.py ? '<em>' + esc(it.py) + "</em>" : "") + "</div></div>" +
        gridSVG(cols, rows, c, o.grid, tr) + "</div>";
    }).join("");
    var ans = o.answers && items.some(function (it) { return it.hz; }) ? '<div class="ws-ans"><div class="ws-anstitle">Đáp án</div>' + items.map(function (it, n) {
      return "<div><b>" + (n + 1) + ".</b> " + esc(it.vi) + '<div class="ws-hz ws-ansz">' + esc(it.hz || "...") + '</div><div class="ws-anspy">' + esc(it.py || "") + "</div></div>";
    }).join("") + "</div>" : "";
    // 5 ô trở xuống: xếp 2 câu cạnh nhau, 2 ô: xếp 5 cột cho kín khổ A4
    var ncol = cols <= 2 ? 5 : cols <= 5 ? 2 : 1;
    if (ncol > 2) body = body.replace(/class="ws-q"/g, 'class="ws-q" style="min-height:12.9mm"'); /* câu dài xuống 2 dòng vẫn thẳng hàng ô */
    if (ncol > 1) body = '<div class="ws-two" style="grid-template-columns:' + Array(ncol + 1).join(cols * c + "mm ").trim() + '">' + body + "</div>";
    return '<div class="ws-page' + "" + '">' + head(o) + body + "</div>" + ans;
  }

  function view() {
    var o = opt();
    function sel(id, val, list) { return '<select id="' + id + '">' + list.map(function (x) { return '<option value="' + x[0] + '"' + (String(val) === String(x[0]) ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select>"; }
    var cau = o.mode !== "chu" && o.mode !== "tv", chu = o.mode === "chu", tv = o.mode === "tv";
    var pre = {}; String(o.tvPre || "vi").split(",").forEach(function (k) { if (k) pre[k] = 1; });
    return '<div><h1 style="font-size:26px">Phiếu tập viết</h1><p class="lead">Phiếu in khổ A4, ô mễ chuẩn 16 x 16 mm, đổi số ô chỉ làm lưới dài hoặc ngắn lại. Bấm "Tải file / In" để lưu file rồi in.</p></div>' +
      '<div class="panel ws-form"><div class="seg" role="tablist"><button data-wsmode="cau" aria-selected="' + cau + '">Theo câu</button><button data-wsmode="chu" aria-selected="' + chu + '">Theo chữ</button><button data-wsmode="tv" aria-selected="' + tv + '">Từ vựng</button></div>' +
      '<div' + (cau ? "" : " hidden") + '><p class="lead" style="margin:0 0 8px">Mỗi dòng một câu: <b>câu tiếng Việt | chữ Hán</b>. Phần chữ Hán không bắt buộc, có thì làm chữ mẫu và đáp án.</p><textarea id="wsText" rows="6" spellcheck="false" aria-label="Danh sách câu">' + esc(o.text) + "</textarea></div>" +
      '<div' + (chu ? "" : " hidden") + '><p class="lead" style="margin:0 0 8px">Gõ hoặc dán các chữ Hán cần luyện (dán cả câu cũng được, chữ trùng sẽ tự bỏ). Mỗi chữ một khối: chữ mẫu to, bộ thủ, cấu trúc, pinyin, số nét, thứ tự nét và các dòng ô để viết.</p><textarea id="wsChars" rows="3" spellcheck="false" aria-label="Danh sách chữ">' + esc(o.chars) + "</textarea></div>" +
      '<div' + (tv ? "" : " hidden") + ' class="ws-tvform"><p class="lead" style="margin:0 0 8px">Mỗi dòng một từ: <b>中文</b> hoặc <b>中文 | nghĩa</b>. Bỏ trống nghĩa thì app tự lấy từ kho từ vựng.</p>' +
        '<div class="row" style="margin-bottom:8px"><label>Lấy từ bài <select id="wsTvSrc"><option value="">Chọn bài...</option>' + (A.lessonOptions ? A.lessonOptions("", true) : "") + '</select></label></div>' +
        '<textarea id="wsTvText" rows="6" spellcheck="false" aria-label="Danh sách từ vựng">' + esc(o.tvText) + "</textarea>" +
        '<div class="row" style="margin-top:10px"><label>Tiêu đề <input id="wsTvTitle" class="ws-in" value="' + esc(o.tvTitle) + '"></label><label>Dòng phụ <input id="wsTvSub" class="ws-in" placeholder="vd: Bài 5, 今天我休息" value="' + esc(o.tvSub) + '"></label></div>' +
        '<div class="row" style="margin-top:10px"><span class="ws-lbl">In sẵn cột:</span>' + TV_COLS.map(function (c) { return '<label class="toggle"><input type="checkbox" class="wsTvPre" value="' + c[0] + '"' + (pre[c[0]] ? " checked" : "") + "> " + c[1] + "</label>"; }).join("") + "</div>" +
        '<div class="row" style="margin-top:10px">' +
          "<label>Chiều cao dòng " + sel("wsTvRowH", o.tvRowH, [[12, "Thấp 12 mm"], [15, "Vừa 15 mm"], [18, "Cao 18 mm"]]) + "</label>" +
          "<label>Nền " + sel("wsTvBg", o.tvBg, [["oli", "Ô li như vở"], ["line", "Kẻ dòng"], ["none", "Trơn"]]) + "</label>" +
          "<label>Thứ tự " + sel("wsTvOrder", o.tvOrder, [["keep", "Giữ nguyên"], ["shuffle", "Xáo trộn"]]) + "</label>" +
          '<button class="btn small" id="wsTvShuf"' + (o.tvOrder === "shuffle" ? "" : " hidden") + ">Xáo lại</button>" +
        "</div>" +
        '<div class="row" style="margin-top:10px"><label class="toggle"><input type="checkbox" id="wsTvMi"' + (o.tvMi ? " checked" : "") + '> Kẻ ô mễ ở cột Tiếng Trung</label><label class="toggle"><input type="checkbox" id="wsTvFill"' + (o.tvFill ? " checked" : "") + '> Thêm dòng trống cho kín trang</label><label class="toggle"><input type="checkbox" id="wsTvAns"' + (o.tvAns ? " checked" : "") + "> Trang đáp án</label></div></div>" +
      '<div class="row">' +
        "<label>Kiểu ô " + sel("wsGrid", o.grid, [["mi", "Ô mễ 米"], ["tian", "Ô điền 田"]]) + "</label>" +
        "<label" + (cau ? "" : " hidden") + ">Số ô ngang " + sel("wsCols", o.cols, [2, 4, 5, 6, 7, 8, 9, 10, 11].map(function (n) { return [n, n + " ô"]; })) + "</label>" +
        "<label" + (chu ? "" : " hidden") + ">Số ô ngang " + sel("wsChCols", o.chCols, [4, 5, 6, 7, 8, 9, 10].map(function (n) { return [n, n + " ô"]; })) + "</label>" +
        '<input type="hidden" id="wsCell" value="' + o.cell + '">' +
        '<span class="row" style="display:contents"' + (cau ? "" : " hidden") + ">" +
        "<label" + (cau ? "" : " hidden") + ">Số dòng mỗi câu " + sel("wsRows", o.rows, [[1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"], [6, "6"]]) + "</label>" +
        "<label" + (cau ? "" : " hidden") + ">Chữ mẫu mờ " + sel("wsTrace", o.trace, [["none", "Không"], ["row", "Dòng đầu"], ["all", "Kín cả lưới"]]) + "</label></span>" +
        "<label" + (chu ? "" : " hidden") + ">Số dòng mỗi chữ " + sel("wsChRows", o.chRows, [[1, "1"], [2, "2"], [3, "3"], [4, "4"]]) + "</label>" +
        "<label" + (chu ? "" : " hidden") + ">Ô tô mờ " + sel("wsChTrace", o.chTrace, [[0, "Không"], [1, "1 ô"], [3, "3 ô"], [5, "5 ô"], [-1, "Cả dòng đầu"]]) + "</label>" +
      "</div><div class=\"row\">" +
        '<label class="toggle"' + (cau ? "" : " hidden") + '><input type="checkbox" id="wsPy"' + (o.showPy ? " checked" : "") + "> Ghi sẵn pinyin</label>" +
        '<label class="toggle"' + (cau ? "" : " hidden") + '><input type="checkbox" id="wsAns"' + (o.answers ? " checked" : "") + "> Trang đáp án</label>" +
        '<button class="btn" id="wsTrans"' + (cau ? "" : " hidden") + '>Dịch sang tiếng Trung</button><button class="btn primary" id="wsPrint">Tải file / In</button><button class="btn" id="wsSample">Câu mẫu</button>' +
      "</div><p class=\"ws-msg\" id=\"wsMsg\" hidden></p></div>" +
      '<div class="ws-preview"><div id="wsOut"></div></div>';
  }

  function read() {
    var o = opt();
    o.text = $("#wsText").value; o.chars = $("#wsChars").value; o.chRows = +$("#wsChRows").value; o.chTrace = +$("#wsChTrace").value; o.grid = $("#wsGrid").value; o.cell = +$("#wsCell").value; o.cols = +$("#wsCols").value; o.chCols = +$("#wsChCols").value; o.rows = +$("#wsRows").value;
    o.trace = $("#wsTrace").value; o.showPy = $("#wsPy").checked; o.answers = $("#wsAns").checked; o.by = "MANHXD";
    if ($("#wsTvText")) {
      o.tvText = $("#wsTvText").value; o.tvTitle = $("#wsTvTitle").value; o.tvSub = $("#wsTvSub").value; o.tvRowH = +$("#wsTvRowH").value; o.tvBg = $("#wsTvBg").value; o.tvOrder = $("#wsTvOrder").value;
      o.tvMi = $("#wsTvMi").checked; o.tvFill = $("#wsTvFill").checked; o.tvAns = $("#wsTvAns").checked;
      o.tvPre = Array.prototype.map.call(document.querySelectorAll(".wsTvPre:checked"), function (x) { return x.value; }).join(",");
      var sh = $("#wsTvShuf"); if (sh) sh.hidden = o.tvOrder !== "shuffle";
    }
    A.save(); return o;
  }
  var cvState = 0, cvWait = [];
  function loadCharVi(cb) {
    if (cvState === 2) return cb(); cvWait.push(cb); if (cvState) return; cvState = 1;
    var sc = document.createElement("script"); sc.src = "data/chars-vi.js";
    sc.onload = sc.onerror = function () { cvState = 2; cvWait.splice(0).forEach(function (f) { f(); }); };
    document.head.appendChild(sc);
  }
  function refresh() {
    if (!$("#wsOut")) return; var o = read();
    if (o.mode === "chu" && A.loadStrokes) { var cs = charList(o); return loadCharVi(function () { A.loadStrokes(cs, function () { if ($("#wsOut")) $("#wsOut").innerHTML = sheetHTML(o); }); }); }
    if (o.mode === "tv" && A.loadDict) A.loadDict();
    $("#wsOut").innerHTML = sheetHTML(o);
    if (o.mode === "tv") { var nv = tvParse(o.tvText).filter(function (it) { return it.hz && !it.vi; }).length; return msg(nv ? nv + " từ chưa tìm thấy nghĩa tiếng Việt, gõ thêm theo dạng: 中文 | nghĩa" : ""); }
    var miss = parse(o.text).filter(function (it) { return !it.hz; }).length;
    msg(miss ? miss + " câu chưa có chữ Hán nên chưa có pinyin, chữ mẫu và trang đáp án. Bấm \"Dịch sang tiếng Trung\" hoặc gõ theo dạng: Câu tiếng Việt | 中文" : "");
  }
  function msg(t) { var m = $("#wsMsg"); if (m) { m.textContent = t; m.hidden = !t; } }

  // Dịch các câu chỉ có tiếng Việt sang tiếng Trung bằng Claude (cần cấp quyền trong khung xem)
  var busy = false;
  async function translate() {
    if (busy) return; var o = read(), items = parse(o.text), need = items.filter(function (it) { return !it.hz; });
    if (!need.length) return msg("Các câu đã có chữ Hán.");
    var sample = window.claude && await window.claude.use("sample");
    if (!sample) return msg("Chức năng dịch không chạy được ở đây. Gửi câu cho Claude trong thread để được dịch.");
    busy = true; msg("Đang dịch " + need.length + " câu...");
    try {
      var out = await sample.json("Dịch từng câu tiếng Việt sau sang tiếng Trung giản thể, tự nhiên, đúng trình độ HSK 1-3, kèm pinyin có dấu thanh. Trả về JSON là mảng, mỗi phần tử {\"hz\":\"...\",\"py\":\"...\"}, đúng thứ tự, không giải thích.\n" + need.map(function (it, i) { return (i + 1) + ". " + it.vi; }).join("\n"), { modelTier: "quick" });
      if (!Array.isArray(out)) throw { code: "invalid_json" };
      var k = 0;
      $("#wsText").value = items.map(function (it) {
        if (!it.hz) { var r = out[k++] || {}; it.hz = String(r.hz || ""); it.py = String(r.py || ""); }
        return it.vi + (it.hz ? " | " + it.hz + (it.py ? " | " + it.py : "") : "");
      }).join("\n");
      refresh();
      if (!$("#wsMsg").textContent) msg("Đã dịch xong. Bản dịch do AI tạo, bạn xem lại trước khi in.");
    } catch (e) {
      msg(e && e.code === "not_granted" ? "Bạn chưa cho phép dịch bằng Claude." : e && e.code === "rate_limited" ? "Đang bận, thử lại sau ít phút." : "Dịch chưa được, thử lại hoặc gửi câu cho Claude trong thread.");
    } finally { busy = false; }
  }
  function sheetCSS() {
    var out = [];
    Array.prototype.forEach.call(document.styleSheets, function (sh) {
      var rules; try { rules = sh.cssRules; } catch (e) { return; }
      Array.prototype.forEach.call(rules || [], function (r) { if (r.selectorText && /\.ws-/.test(r.selectorText)) out.push(r.cssText); });
    });
    return out.join("\n");
  }
  function standalone(o, body) {
    return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Phiếu tập viết - by MANHXD</title>' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700&family=Noto+Serif+SC:wght@500;700&display=swap">' +
      '<style>:root{--font-hz:"Noto Serif SC","Songti SC","SimSun","Noto Sans SC","PingFang SC",serif}' +
      'body{margin:0;background:#eee}.tip{font:14px sans-serif;text-align:center;padding:10px}' + sheetCSS() +
      '@page{size:A4;margin:10mm 0}@media print{body{background:#fff}.tip{display:none}.ws-page,.ws-ans{margin:0;box-shadow:none;min-height:0;padding-top:0;padding-bottom:0}}</style></head><body>' +
      '<div class="tip">Bấm Ctrl+P (trên điện thoại: Chia sẻ, In), chọn "Lưu dưới dạng PDF", khổ A4, lề Không.</div>' + body +
      '<script>window.onload=function(){setTimeout(function(){window.print()},600)}<\/script></body></html>';
  }
  function prep(o, cb) {
    (o.mode === "chu" && A.loadStrokes ? function (f) { loadCharVi(function () { A.loadStrokes(charList(o), f); }); } : function (f) { f(); })(cb);
  }
  function printNative(o) {
    var root = document.getElementById("printRoot");
    if (!root) { root = document.createElement("div"); root.id = "printRoot"; document.body.appendChild(root); }
    root.innerHTML = sheetHTML(o);
    document.body.classList.add("printing-ws");
    setTimeout(function () { try { window.print(); } catch (e) {} }, 50);
  }
  var saving = false;
  function printSheet() {
    if (saving) return; var o = read();
    prep(o, async function () {
      var dl = window.claude ? await window.claude.use("downloads") : null;
      if (!dl) return printNative(o);
      saving = true;
      try {
        var name = (o.mode === "tv" ? "phieu-tu-vung" : "phieu-tap-viet-" + (o.mode === "chu" ? "theo-chu" : "theo-cau")) + "-MANHXD.html";
        await dl.save({ filename: name, data: standalone(o, sheetHTML(o)) });
        msg("Đã tải " + name + ". Mở file, máy sẽ hiện hộp in: chọn \"Lưu dưới dạng PDF\" hoặc in thẳng ra giấy A4.");
      } catch (e) {
        var c = e && e.code;
        msg(c === "declined" ? "Bạn đã bấm không tải. Bấm lại nút khi cần." : c === "rate_limited" ? "Đang có hộp xác nhận mở, xử lý hộp đó trước." : "Khung xem này không cho tải file. Gửi câu cho Claude trong thread để nhận PDF.");
      } finally { saving = false; }
    });
  }
  window.addEventListener("afterprint", function () { document.body.classList.remove("printing-ws"); });

  document.addEventListener("input", function (e) { if (e.target.closest && e.target.closest(".ws-form")) refresh(); });
  document.addEventListener("change", function (e) {
    if (e.target.id === "wsTvSrc" && e.target.value) {
      var src = e.target.value, ws = (A.VOCAB || []).filter(function (v) { return A.inSrc(v, src); });
      $("#wsTvText").value = ws.map(function (v) { return v.hz + " | " + v.vi; }).join("\n");
      var opt0 = e.target.options[e.target.selectedIndex]; if (!$("#wsTvSub").value && opt0) $("#wsTvSub").value = opt0.textContent;
      e.target.value = "";
    }
    if (e.target.closest && e.target.closest(".ws-form")) refresh();
  });
  document.addEventListener("click", function (e) {
    if (e.target.id === "wsPrint") printSheet();
    if (e.target.id === "wsTrans") translate();
    if (e.target.id === "wsSample") { if (opt().mode === "chu") $("#wsChars").value = SAMPLE_CH; else if (opt().mode === "tv") $("#wsTvText").value = SAMPLE_TV; else $("#wsText").value = SAMPLE; refresh(); }
    if (e.target.id === "wsTvShuf") { opt().tvSeed = (+opt().tvSeed || 1) + 1; A.save(); refresh(); }
    var m = e.target.closest && e.target.closest("[data-wsmode]");
    if (m) { read(); opt().mode = m.dataset.wsmode; A.save(); A.go("phieuviet"); }
  });

  window.HSK_SHEET = { view: view, refresh: refresh, sheetHTML: sheetHTML, charList: charList };
  if (S.tab === "phieuviet") A.go("phieuviet");
})();
