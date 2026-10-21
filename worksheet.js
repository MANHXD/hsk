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
  var DEF = { mode: "cau", text: SAMPLE, chars: SAMPLE_CH, grid: "mi", cell: 13, rows: 3, trace: "none", showPy: false, answers: true, by: "MANHXD", chRows: 2, chTrace: 0, chOrder: true, chNote: true, cols: 10, chCols: 10 };
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
    var L = 26, c = CELL, cols = Math.min(+o.chCols || 10, Math.floor((186 - L) / CELL)), W = L + cols * c, top = 13, rows = Math.max(2, Math.min(4, +o.chRows || 2)), H = top + rows * c;
    var sd = window.HZ_STROKES && window.HZ_STROKES[ch], cv = (window.HZ_CHARVI || {})[ch], info = cv ? { py: cv[0], hv: cv[1], vi: cv[2] } : (A.charInfo && A.charInfo(ch)) || {}, bigH = H - c, s = [];
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
    line(0, bigH, L, bigH);
    // ô nghĩa: nghĩa tiếng Việt, tự xuống dòng
    var lines = [], vi = String(info.vi || "").split(/[;]/)[0].trim();
    wrap(vi, 14).slice(0, 4).forEach(function (t) { lines.push(t); });
    var mTop = bigH, mH = H - mTop;
    var y0 = mTop + mH / 2 - (lines.length - 1) * 1.9 + 1.1;
    lines.forEach(function (t, i) { s.push('<text x="' + L / 2 + '" y="' + (y0 + i * 3.8) + '" font-size="3.1" fill="#222" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif">' + esc(t) + "</text>"); });
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
    return '<div class="ws-page">' + head(o) + charList(o).map(function (ch) { return charBlock(ch, o); }).join("") + "</div>";
  }
  function sheetHTML(o) {
    if (o.mode === "chu") return charSheetHTML(o);
    var items = parse(o.text), c = CELL, cols = Math.min(+o.cols || 10, Math.floor(186 / CELL)), rows = Math.max(1, Math.min(8, +o.rows || 3));
    var body = items.map(function (it, n) {
      var chars = Array.from(it.hz).filter(function (ch) { return !/\s/.test(ch); }), tr = [];
      if (o.trace !== "none" && chars.length) {
        if (o.trace === "row") chars.slice(0, cols).forEach(function (ch, k) { tr.push({ r: 0, k: k, ch: ch }); });
        else if (o.trace === "all") chars.slice(0, cols * rows).forEach(function (ch, k) { tr.push({ r: Math.floor(k / cols), k: k % cols, ch: ch }); });
      }
      return '<div class="ws-item" style="width:' + cols * c + 'mm"><div class="ws-q">' + (n + 1) + ". " + esc(it.vi) + "</div>" +
        '<div class="ws-py"><span>pinyin</span><div class="ws-pyline">' + (o.showPy && it.py ? '<em>' + esc(it.py) + "</em>" : "") + "</div></div>" +
        gridSVG(cols, rows, c, o.grid, tr) + "</div>";
    }).join("");
    var ans = o.answers && items.some(function (it) { return it.hz; }) ? '<div class="ws-ans"><div class="ws-anstitle">Đáp án</div>' + items.map(function (it, n) {
      return "<div><b>" + (n + 1) + ".</b> " + esc(it.vi) + '<div class="ws-hz ws-ansz">' + esc(it.hz || "...") + '</div><div class="ws-anspy">' + esc(it.py || "") + "</div></div>";
    }).join("") + "</div>" : "";
    // 5 ô trở xuống: xếp 2 câu cạnh nhau cho cân trang
    var two = cols <= 5;
    if (two) body = '<div class="ws-two" style="grid-template-columns:' + cols * c + "mm " + cols * c + 'mm">' + body + "</div>";
    return '<div class="ws-page' + "" + '">' + head(o) + body + "</div>" + ans;
  }

  function view() {
    var o = opt();
    function sel(id, val, list) { return '<select id="' + id + '">' + list.map(function (x) { return '<option value="' + x[0] + '"' + (String(val) === String(x[0]) ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select>"; }
    var cau = o.mode !== "chu";
    return '<div><h1 style="font-size:26px">Phiếu tập viết</h1><p class="lead">Phiếu in khổ A4, ô mễ chuẩn 16 x 16 mm, đổi số ô chỉ làm lưới dài hoặc ngắn lại. Bấm "Tải file / In" để lưu file rồi in.</p></div>' +
      '<div class="panel ws-form"><div class="seg" role="tablist"><button data-wsmode="cau" aria-selected="' + cau + '">Theo câu</button><button data-wsmode="chu" aria-selected="' + !cau + '">Theo chữ</button></div>' +
      '<div' + (cau ? "" : " hidden") + '><p class="lead" style="margin:0 0 8px">Mỗi dòng một câu: <b>câu tiếng Việt | chữ Hán</b>. Phần chữ Hán không bắt buộc, có thì làm chữ mẫu và đáp án.</p><textarea id="wsText" rows="6" spellcheck="false" aria-label="Danh sách câu">' + esc(o.text) + "</textarea></div>" +
      '<div' + (cau ? " hidden" : "") + '><p class="lead" style="margin:0 0 8px">Gõ hoặc dán các chữ Hán cần luyện (dán cả câu cũng được, chữ trùng sẽ tự bỏ). Mỗi chữ một khối: chữ mẫu to, bộ thủ, cấu trúc, pinyin, số nét, thứ tự nét và các dòng ô để viết.</p><textarea id="wsChars" rows="3" spellcheck="false" aria-label="Danh sách chữ">' + esc(o.chars) + "</textarea></div>" +
      '<div class="row">' +
        "<label>Kiểu ô " + sel("wsGrid", o.grid, [["mi", "Ô mễ 米"], ["tian", "Ô điền 田"]]) + "</label>" +
        "<label" + (cau ? "" : " hidden") + ">Số ô ngang " + sel("wsCols", o.cols, [4, 5, 6, 7, 8, 9, 10, 11].map(function (n) { return [n, n + " ô"]; })) + "</label>" +
        "<label" + (cau ? " hidden" : "") + ">Số ô ngang " + sel("wsChCols", o.chCols, [4, 5, 6, 7, 8, 9, 10].map(function (n) { return [n, n + " ô"]; })) + "</label>" +
        '<input type="hidden" id="wsCell" value="' + o.cell + '">' +
        '<span class="row" style="display:contents"' + (cau ? "" : " hidden") + ">" +
        "<label" + (cau ? "" : " hidden") + ">Số dòng mỗi câu " + sel("wsRows", o.rows, [[1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"], [6, "6"]]) + "</label>" +
        "<label" + (cau ? "" : " hidden") + ">Chữ mẫu mờ " + sel("wsTrace", o.trace, [["none", "Không"], ["row", "Dòng đầu"], ["all", "Kín cả lưới"]]) + "</label></span>" +
        "<label" + (cau ? " hidden" : "") + ">Số dòng mỗi chữ " + sel("wsChRows", o.chRows, [[2, "2"], [3, "3"], [4, "4"]]) + "</label>" +
        "<label" + (cau ? " hidden" : "") + ">Ô tô mờ " + sel("wsChTrace", o.chTrace, [[0, "Không"], [1, "1 ô"], [3, "3 ô"], [5, "5 ô"], [-1, "Cả dòng đầu"]]) + "</label>" +
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
    $("#wsOut").innerHTML = sheetHTML(o);
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
        var name = "phieu-tap-viet-" + (o.mode === "chu" ? "theo-chu" : "theo-cau") + "-MANHXD.html";
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
  document.addEventListener("change", function (e) { if (e.target.closest && e.target.closest(".ws-form")) refresh(); });
  document.addEventListener("click", function (e) {
    if (e.target.id === "wsPrint") printSheet();
    if (e.target.id === "wsTrans") translate();
    if (e.target.id === "wsSample") { if (opt().mode === "chu") $("#wsChars").value = SAMPLE_CH; else $("#wsText").value = SAMPLE; refresh(); }
    var m = e.target.closest && e.target.closest("[data-wsmode]");
    if (m) { read(); opt().mode = m.dataset.wsmode; A.save(); A.go("phieuviet"); }
  });

  window.HSK_SHEET = { view: view, refresh: refresh, sheetHTML: sheetHTML, charList: charList };
  if (S.tab === "phieuviet") A.go("phieuviet");
})();
