/* Tab "Nghe giáo trình": lưu link YouTube audio của giáo trình theo từng bài.
   Dữ liệu chung nằm trong db của artifact (collection "audio"), máy nào mở cũng thấy.
   Không có db (mở file trên máy) thì lưu tạm trong trình duyệt. */
(function () {
  var A = window.HSK_APP, S = A.S, esc = A.esc;
  var $ = function (s) { return document.querySelector(s); };
  var LS = "hsk30-nghe-v1";
  // File nghe Sổ tay học và luyện tập New HSK 1 (新HSK教程1 学练手册), đóng gói sẵn trong audio/sotay1
  var LOAI = { yuyin: ["语音", "Ngữ âm"], tingdu: ["听读练", "Nghe đọc"], moni: ["模拟测练", "Kiểm tra mô phỏng"] };
  var SOTAY = { 1: "yuyin tingdu", 2: "yuyin tingdu", 3: "yuyin tingdu", 4: "yuyin tingdu moni", 5: "yuyin tingdu moni", 6: "yuyin tingdu moni" };
  for (var n = 7; n <= 15; n++) SOTAY[n] = "yuyin moni";
  // Mã đoạn và trang theo PDF sách: 语音 = N-1, 听读练 = N-2, 模拟测练 = N-3 (bài 4-6) hoặc N-2 (bài 7-15)
  var PAGE = { 1: [1, 4], 2: [5, 8], 3: [9, 12], 4: [13, 15, 16], 5: [22, 23, 25], 6: [31, 32, 33] };
  [39, 48, 57, 66, 75, 84, 93, 102, 111].forEach(function (p, i) { PAGE[i + 7] = [p, null, p + 3]; });
  // Mốc bắt đầu từng câu trong file 模拟测练 / đề thi thử (tách theo khoảng lặng dài sau mỗi câu)
  var SEGT = {"L04-moni": [0, 37.5, 61.2, 78.0, 96.2, 135.1, 166.9, 190.4, 236.1, 275.8, 307.4, 347.6, 405.2, 449.3], "L05-moni": [0, 35.8, 49.9, 59.4, 69.6, 107.6, 137.2, 161.6, 207.4, 244.0, 275.1, 305.3, 363.9, 405.0], "L06-moni": [0, 36.4, 60.3, 79.0, 97.2, 134.7, 166.3, 189.7, 234.3, 291.5, 322.3, 354.1, 409.7, 461.1], "L07-moni": [0, 35.6, 60.5, 79.3, 96.5, 136.3, 167.9, 191.9, 237.3, 281.4, 311.2, 341.6, 398.5, 442.0], "L08-moni": [0, 35.8, 58.3, 77.4, 95.6, 133.6, 163.3, 190.3, 234.9, 269.9, 304.4, 338.2, 392.9, 441.9], "L09-moni": [0, 34.5, 57.5, 76.0, 93.9, 131.4, 161.6, 187.5, 230.5, 266.4, 299.7, 334.9, 388.4, 439.4], "L10-moni": [0, 36.6, 61.3, 79.8, 97.1, 134.5, 165.0, 191.0, 236.4, 274.3, 307.6, 340.1, 395.9, 443.5], "L11-moni": [0, 35.7, 59.1, 76.3, 93.7, 132.9, 167.2, 194.3, 238.2, 283.7, 319.3, 348.3, 403.1, 449.4], "L12-moni": [0, 35.1, 58.1, 76.3, 93.6, 131.1, 162.1, 185.1, 229.4, 270.9, 300.9, 337.4, 393.4, 446.4], "L13-moni": [0, 35.1, 59.1, 76.2, 93.6, 132.3, 162.9, 187.9, 230.7, 272.9, 303.7, 337.0, 392.7, 439.5], "L14-moni": [0, 34.4, 57.9, 75.0, 93.0, 130.0, 162.4, 187.3, 231.6, 274.9, 310.3, 344.9, 400.9, 445.6], "L15-moni": [0, 34.8, 57.7, 75.2, 93.0, 130.8, 165.2, 193.1, 236.2, 281.2, 321.1, 356.8, 412.5, 461.6], "mock-test": [0.7, 117.0, 141.6, 159.1, 176.6, 194.9, 214.2, 253.3, 283.4, 308.5, 333.2, 357.4, 384.4, 429.8, 467.6, 501.4, 531.9, 569.4, 598.1, 657.0, 709.0, 747.7, 787.6, 822.2]};
  var LAYOUT = [[1, 0], [1, 1], [1, 2], [1, 3], [2, 0], [2, 4], [2, 5], [3, 0], [3, 6], [3, 7], [3, 8], [4, 0], [4, 9], [4, 10]];
  var MOCK = []; [1, 2, 3, 4].forEach(function (p) { MOCK.push([p, 0]); for (var q = 1; q <= 5; q++) MOCK.push([p, (p - 1) * 5 + q]); });
  function segList(f) {
    var t = SEGT[f], lay = f === "mock-test" ? MOCK : LAYOUT; if (!t || t.length !== lay.length) return null;
    return t.map(function (x, i) { return { p: lay[i][0], q: lay[i][1], t: x, end: t[i + 1] || 0 }; });
  }
  function builtins() {
    var o = {};
    Object.keys(SOTAY).forEach(function (b) {
      SOTAY[b].split(" ").forEach(function (k) {
        var has = SOTAY[b].indexOf("tingdu") >= 0, num = k === "yuyin" ? 1 : k === "tingdu" ? 2 : has ? 3 : 2;
        var t = b + "-" + num, f = "L" + (b < 10 ? "0" : "") + b + "-" + k, pg = PAGE[b][k === "yuyin" ? 0 : k === "tingdu" ? 1 : 2];
        o[t] = { track: t, bai: +b, loai: k, name: LOAI[k][0] + " " + LOAI[k][1], src: "audio/sotay1/" + f + ".mp3", img: "img/sotay1/" + f + ".jpg", page: pg, segs: segList(f) };
      });
    });
    o["thi-1"] = { track: "thi-1", bai: 0, loai: "thi", name: "模拟试卷 Đề thi thử HSK1, phần nghe", src: "audio/sotay1/mock-test.mp3", img: "img/sotay1/mock-test.jpg", page: 121, segs: segList("mock-test") };
    return o;
  }
  var items = [], tracks = builtins(), assets = null, db = null, photoOut = "", photoBusy = false, canWrite = true, ready = false, unsub = null, note = "";
  if (!S.nghe) S.nghe = { q: "", bai: "" };

  function local() { try { return JSON.parse(localStorage.getItem(LS) || "[]"); } catch (e) { return []; } }
  function saveLocal() { try { localStorage.setItem(LS, JSON.stringify(items)); } catch (e) {} }

  // Nhận link YouTube, trả về {id, list, t} hoặc null
  function parseYT(raw) {
    var u; try { u = new URL(String(raw).trim()); } catch (e) { return null; }
    var h = u.hostname.replace(/^(www|m|music)\./, ""), id = "", list = u.searchParams.get("list") || "";
    if (h === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (h === "youtube.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
      else { var m = u.pathname.match(/^\/(shorts|live|embed)\/([\w-]+)/); if (m) id = m[2]; }
    } else return null;
    if (!id && !list) return null;
    return { id: id, list: list, t: secs(u.searchParams.get("t") || u.searchParams.get("start") || "") };
  }
  // "95", "1:35", "1m35s" -> giây
  function secs(s) {
    s = String(s || "").trim(); if (!s) return 0;
    if (/^\d+$/.test(s)) return +s;
    if (/^\d+(:\d{1,2}){1,2}$/.test(s)) return s.split(":").reduce(function (a, x) { return a * 60 + +x; }, 0);
    var m = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/); return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
  }
  function clock(t) { var m = Math.floor(t / 60), s = t % 60; return m + ":" + (s < 10 ? "0" : "") + s; }
  function openURL(it) {
    if (!it.id && it.list && it.idx) return "https://www.youtube.com/watch?list=" + it.list + "&index=" + it.idx + (it.t ? "&t=" + it.t + "s" : "");
    var base = it.id ? "https://www.youtube.com/watch?v=" + it.id + (it.list ? "&list=" + it.list : "") : "https://www.youtube.com/playlist?list=" + it.list;
    return base + (it.id && it.t ? "&t=" + it.t + "s" : "");
  }
  // Video thứ N trong playlist (offset lưu trên link playlist, mặc định video 1 = Bài 1)
  function atURL(it, bai) { return "https://www.youtube.com/watch?list=" + it.list + "&index=" + (bai + (+it.offset || 0)); }
  function atRow(it, bai) {
    return '<div class="ls-item"><a class="ls-open" href="' + esc(atURL(it, bai)) + '" target="_blank" rel="noopener"><span class="ls-play" aria-hidden="true">&#9654;</span><span><b>Video Bài ' + bai + "</b> trong playlist " + esc(it.muc || "") + "</span></a></div>";
  }
  function searchURL(bai) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent("giáo trình chuẩn HSK 3.0 bài " + bai + " nghe"); }

  function sorted() {
    return items.slice().sort(function (a, b) { return (a.bai - b.bai) || String(a.muc).localeCompare(String(b.muc), "vi", { numeric: true }) || (a.t - b.t); });
  }
  function match(it, q) {
    if (!q) return true; q = q.toLowerCase();
    if (/^\d+$/.test(q)) return !it.bai || String(it.bai) === q || String(it.muc).indexOf(q) === 0;
    return (it.title + " " + it.muc + " bài " + it.bai).toLowerCase().indexOf(q) >= 0;
  }

  function chip(k) {
    var t = tracks[k], lb = t.loai && LOAI[t.loai] ? LOAI[t.loai][1] : t.loai === "thi" ? "Đề thi thử" : k;
    return '<button class="ls-tcard" data-lstrack="' + esc(k) + '">' + (t.img ? '<img src="' + esc(t.img) + '" alt="" loading="lazy">' : "") + "<span><b>" + esc(/^\d+-\d+$/.test(k) ? k : "") + "</b> " + esc(lb) + (t.page ? '<small>trang ' + t.page + "</small>" : "") + "</span></button>";
  }
  function partImg(tr, p) {
    var f = tr.src && tr.src.match(/([^/]+)\.mp3$/); if (!f) return "";
    var u = "img/sotay1/parts/" + f[1] + "-p" + p + ".jpg";
    return '<a class="ls-page ls-pimg" href="' + u + '" target="_blank" rel="noopener"><img src="' + u + '" alt="Part ' + ROMAN[p] + ' trong sách" loading="lazy"></a>';
  }
  var ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];
  function playerBox(tr, id) {
    var sg = "";
    if (tr.segs) {
      var parts = [];
      tr.segs.forEach(function (x, i) { if (!parts.length || parts[parts.length - 1].p !== x.p) parts.push({ p: x.p, items: [] }); parts[parts.length - 1].items.push(i); });
      sg = '<div class="ls-parts">' + parts.map(function (P) { return '<button class="ls-part" data-lspart="' + P.p + '">Part ' + ROMAN[P.p] + "</button>"; }).join("") + "</div>" +
        parts.map(function (P) {
          var last = tr.segs[P.items[P.items.length - 1]];
          return '<div class="ls-segs" data-lsp="' + P.p + '" hidden><button class="ls-seg all" data-lsseg="' + P.items[0] + '" data-lsend="' + last.end + '">Nghe cả Part ' + ROMAN[P.p] + "</button>" + P.items.map(function (i) {
            var x = tr.segs[i], first = tr.segs[P.items[1]] ? tr.segs[P.items[1]].q : x.p;
            return '<button class="ls-seg' + (x.q ? "" : " ex") + '" data-lsseg="' + i + '" title="' + (x.q ? "Câu " + x.q : "Part " + ROMAN[x.p] + ": hướng dẫn và ví dụ") + '">' + first + "." + x.q + (x.q ? "" : " Ví dụ") + "</button>";
          }).join("") + partImg(tr, P.p) + "</div>";
        }).join("");
    }
    return '<div class="ls-box" data-lstr="' + esc(tr.track) + '"><audio class="ls-audio"' + (id ? ' id="' + id + '"' : "") + ' controls preload="auto"></audio>' + sg + '<div class="ls-full">' + pageImg(tr) + "</div></div>";
  }
  var stopAt = new WeakMap();
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lspart]"); if (!b) return;
    var box = b.closest(".ls-box"), p = b.dataset.lspart, open = !b.classList.contains("on");
    box.querySelectorAll(".ls-part").forEach(function (x) { x.classList.toggle("on", open && x === b); });
    box.querySelectorAll(".ls-segs[data-lsp]").forEach(function (x) { x.hidden = !(open && x.dataset.lsp === p); });
    var full = box.querySelector(".ls-full"); if (full) full.hidden = open;
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lsseg]"); if (!b) return;
    var box = b.closest(".ls-box"), tr = box && tracks[box.dataset.lstr], au = box && box.querySelector(".ls-audio"); if (!tr || !au || !tr.segs) return;
    var sg = tr.segs[+b.dataset.lsseg], end = b.dataset.lsend != null ? +b.dataset.lsend : sg.end;
    box.querySelectorAll(".ls-seg.on").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
    var go = function () { au.currentTime = sg.t; stopAt.set(au, end); au.play().catch(function () {}); };
    if (!au.src) trackURL(tr).then(function (u) { au.src = u; go(); }); else go();
  });
  document.addEventListener("timeupdate", function (e) {
    var au = e.target, end = au.classList && au.classList.contains("ls-audio") && stopAt.get(au);
    if (end && au.currentTime >= end - 0.3) { au.pause(); stopAt.delete(au); }
  }, true);
  function pageImg(tr) { return tr && tr.img ? '<a class="ls-page" href="' + esc(tr.img) + '" target="_blank" rel="noopener"><img src="' + esc(tr.img) + '" alt="Trang ' + (tr.page || "") + ' trong sách"></a>' : ""; }
  function trackBlock(qn, q) {
    var by = {};
    Object.keys(tracks).forEach(function (k) { var b = tracks[k].bai; (by[b] = by[b] || []).push(k); });
    var bais = Object.keys(by).map(Number).filter(function (b) { return qn ? b === qn || b === 0 : !q; }).sort(function (a, b) { return a - b; });
    if (!bais.length) return "";
    return '<div class="ls-bai"><div class="ls-baihead"><b>File nghe Sổ tay New HSK 1</b></div><div class="ls-tracks">' + bais.map(function (b) {
      var ks = by[b].sort(function (x, y) { return String(x).localeCompare(String(y), "vi", { numeric: true }); });
      return '<div class="ls-trow"><span class="ls-tbai">' + (b ? "Bài " + b : "Đề thi thử") + '</span><div class="row">' + ks.map(chip).join("") + "</div></div>";
    }).join("") + "</div></div>";
  }
  function listHTML() {
    if (!ready) return '<div class="empty">Đang tải danh sách...</div>';
    var q = S.nghe.q || "", rows = sorted().filter(function (it) { return match(it, q); }), qn = /^\d+$/.test(q) ? +q : 0;
    var head = trackBlock(qn, q);
    return head || '<div class="empty">Không thấy bài phù hợp.</div>';
  }

  function view() {
    return '<div><h1 style="font-size:26px">Nghe giáo trình</h1><p class="lead">Chụp trang sách là phát đúng đoạn nghe, hoặc chọn bài bên dưới.</p></div>' +
      '<div class="panel ls-photo" id="lsPhoto"><div class="ls-phead"><b>Tìm bằng ảnh</b><span class="lead" style="margin:0">Chụp trang sách có phần nghe, app tự nhận bài và phát đúng đoạn nghe.</span></div>' +
        '<div class="row"><label class="btn primary" for="lsImg">Chụp hoặc chọn ảnh</label><input id="lsImg" type="file" accept="image/*" hidden></div>' +
        '<div id="lsPhotoOut">' + photoOut + "</div></div>" +
      '<div class="ls-search"><input id="lsQ" type="search" placeholder="Gõ số bài hoặc tên, vd: 5" value="' + esc(S.nghe.q || "") + '" aria-label="Tìm bài"></div>' +
      '<div id="lsOut">' + listHTML() + "</div>";
  }
  function draw() { var o = $("#lsOut"); if (o) o.innerHTML = listHTML(); }
  function msg(t) { note = t; var m = $("#lsMsg"); if (m) m.textContent = t; }

  async function add() {
    var bai = parseInt($("#lsBai").value, 10), yt = parseYT($("#lsUrl").value);
    if (!bai) return msg("Nhập số bài.");
    if (!yt) return msg("Link chưa đúng, cần link youtube.com hoặc youtu.be.");
    var t = secs($("#lsT").value) || yt.t;
    var it = { bai: bai, muc: $("#lsMuc").value.trim().slice(0, 40), title: $("#lsTitle").value.trim().slice(0, 120), id: yt.id, list: yt.list, t: t, at: Date.now() };
    S.nghe.bai = bai; A.save();
    var err = await saveItem(it); if (err) return msg(err);
    $("#lsUrl").value = ""; $("#lsTitle").value = ""; $("#lsT").value = "";
    var mu = $("#lsMuc"); if (mu.value && /^\d+-\d+$/.test(mu.value)) { var p = mu.value.split("-"); mu.value = p[0] + "-" + (+p[1] + 1); }
    msg("Đã lưu vào Bài " + bai + "."); draw();
  }
  async function saveItem(it) {
    if (db) {
      try { var ref = await db.collection("audio").add(it); if (!items.some(function (x) { return x.key === ref.id; })) { it.key = ref.id; items.push(it); } }
      catch (e) { return e && e.code === "quota_exceeded" ? "Kho đầy, xoá bớt link cũ rồi lưu lại." : e && (e.code === "invalid_argument") ? "Bạn chỉ có quyền xem, không lưu được." : "Chưa lưu được, thử lại."; }
    } else { it.key = "l" + it.at; items.push(it); saveLocal(); }
    return "";
  }
  async function del(key) {
    if (!confirm("Xoá link này?")) return;
    if (db) { try { await db.doc("audio/" + key).delete(); } catch (e) { return msg("Chưa xoá được, thử lại."); } }
    items = items.filter(function (x) { return x.key !== key; }); if (!db) saveLocal(); draw();
  }

  function setPhoto(h) { photoOut = h; var o = $("#lsPhotoOut"); if (o) o.innerHTML = h; }
  function linkRow(it) {
    return '<div class="ls-item"><a class="ls-open" href="' + esc(openURL(it)) + '" target="_blank" rel="noopener"><span class="ls-play" aria-hidden="true">&#9654;</span><span><b>' + esc(it.muc || "Audio") + "</b> " + esc(it.title || "") + "</span></a></div>";
  }
  async function photoFind(file) {
    if (photoBusy || !file) return;
    var sample = window.claude && await window.claude.use("sample");
    var caps = sample && await sample.limits().catch(function () { return null; });
    if (!sample || !caps || !caps.images) return setPhoto('<p class="ls-msg">Chức năng đọc ảnh không chạy ở đây. Gửi ảnh cho Claude trong thread để được tìm link.</p>');
    photoBusy = true; setPhoto('<p class="ls-msg">Đang đọc ảnh...</p>');
    try {
      var r = await sample.json("Ảnh là một trang sách học tiếng Trung (giáo trình hoặc sách bài tập HSK1 bản 3.0, bản tiếng Việt). Đọc trang và trả về JSON {\"bai\": số bài (lấy từ chữ 'Bài N' ở đầu trang hoặc mã audio), \"track\": mã audio cạnh biểu tượng loa dạng \"5-3\" hoặc \"\" nếu không có, \"tieude\": tên bài bằng chữ Hán nếu thấy, \"phan\": tên phần trên trang bằng tiếng Việt (vd Phần nghe, Phần 1, câu 1-3), \"sach\": \"giáo trình\" hoặc \"sách bài tập\" hoặc \"\", \"loai\": phần có audio trên trang, một trong \"yuyin\" (语音 ngữ âm), \"tingdu\" (听读练 nghe đọc), \"moni\" (模拟测练 luyện tập và kiểm tra mô phỏng), \"thi\" (模拟试卷 đề thi thử cả cuốn), hoặc \"\"}. Không đoán: không chắc thì để null hoặc \"\".", { images: file });
      var bai = parseInt(r && r.bai, 10) || 0, track = String(r && r.track || "").trim();
      if (!bai && /^\d+-\d+$/.test(track)) bai = +track.split("-")[0];
      if (!bai) { setPhoto('<p class="ls-msg">Chưa đọc ra số bài trong ảnh. Chụp rõ góc có chữ "Bài" hoặc mã audio (vd 5-3) rồi thử lại.</p>'); return; }
      var h = '<p class="ls-found">Ảnh là <b>Bài ' + bai + "</b>" + (r.tieude ? " " + esc(r.tieude) : "") + (track ? ', audio <b>' + esc(track) + "</b>" : "") + (r.phan ? ", " + esc(r.phan) : "") + (r.sach ? " (" + esc(r.sach) + ")" : "") + ".</p>";
      var loai = String(r && r.loai || "");
      var tr = (track && tracks[track]) || null;
      if (loai === "thi") tr = tracks["thi-1"];
      else if (LOAI[loai] && (!tr || (tr.loai && tr.loai !== loai))) { var hit = Object.keys(tracks).filter(function (k) { return tracks[k].bai === bai && tracks[k].loai === loai; })[0]; if (hit) tr = tracks[hit]; }
      if (!tr && track) { var tn = +track.split("-")[1]; var bt = Object.keys(tracks).filter(function (k) { return tracks[k].bai === bai && tracks[k].src; }); if (tn === 3 || bt.length === 2 && tn === 2) tr = tracks[bai + "-3"] || null; }
      if (tr) h += '<p class="ls-sub">Phát ' + esc(tr.name || tr.track) + (tr.bai ? " (Bài " + tr.bai : " (cả cuốn") + ')</p>' + playerBox(tr, "lsPlayer");
      if (!tr) h += '<p class="ls-msg">Chưa tìm thấy file nghe cho trang này. Chọn bài ở danh sách bên dưới.</p>';
      setPhoto(h);
      if (tr) playTrack(tr);
      var q = $("#lsQ"); if (q) { q.value = String(bai); S.nghe.q = String(bai); A.save(); draw(); }
    } catch (e) {
      var c = e && e.code;
      setPhoto('<p class="ls-msg">' + (c === "not_granted" ? "Bạn chưa cho phép gửi ảnh cho Claude." : c === "rate_limited" ? "Đang bận, thử lại sau ít phút." : c === "image_rejected" ? "Ảnh không đọc được, thử ảnh JPG hoặc PNG khác." : "Chưa đọc được ảnh, thử lại hoặc gửi ảnh cho Claude trong thread.") + "</p>");
    } finally { photoBusy = false; var inp = $("#lsImg"); if (inp) inp.value = ""; }
  }
  document.addEventListener("change", function (e) { if (e.target.id === "lsImg" && e.target.files && e.target.files[0]) photoFind(e.target.files[0]); });

  // File nghe lưu dạng base64 (kho asset không nhận mp3), giải mã lại khi phát
  var audioCache = {};
  function trackOf(name) {
    var base = String(name).split("/").pop().replace(/\.[^.]+$/, ""), m = base.match(/(\d{1,2})\s*[-_.]\s*(\d{1,2})(?!.*\d)/);
    return m ? (+m[1]) + "-" + (+m[2]) : "";
  }
  function b64(buf) {
    var u = new Uint8Array(buf), out = [], CH = 0x8000;
    for (var i = 0; i < u.length; i += CH) out.push(String.fromCharCode.apply(null, u.subarray(i, i + CH)));
    return btoa(out.join(""));
  }
  async function trackURL(tr) {
    if (tr.src) return tr.src;
    if (audioCache[tr.asset]) return audioCache[tr.asset];
    var txt = await (await fetch("/_blob/" + tr.asset)).text(), bin = atob(txt.trim()), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return (audioCache[tr.asset] = URL.createObjectURL(new Blob([u], { type: "audio/mpeg" })));
  }
  async function playTrack(tr, el) {
    var p = el || $("#lsPlayer"); if (!p) return;
    try { p.src = await trackURL(tr); p.play().catch(function () {}); }
    catch (e) { p.insertAdjacentHTML("afterend", '<p class="ls-msg">Chưa phát được đoạn này, thử lại.</p>'); }
  }
  function loadZip(cb) {
    if (window.JSZip) return cb();
    var sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    sc.onload = function () { cb(); }; sc.onerror = function () { cb(new Error("zip")); }; document.head.appendChild(sc);
  }
  var upBusy = false;
  async function uploadAudio(files) {
    if (upBusy || !assets || !db) return; upBusy = true;
    var m = function (t) { var e = $("#lsAudMsg"); if (e) e.textContent = t; };
    try {
      var list = [];
      for (var f of files) {
        if (/\.zip$/i.test(f.name)) {
          m("Đang mở file zip...");
          var err = await new Promise(function (r) { loadZip(r); }); if (err) { m("Không mở được file zip, hãy giải nén rồi chọn các file .mp3."); return; }
          var zip = await window.JSZip.loadAsync(f);
          zip.forEach(function (path, ent) { if (!ent.dir && /\.mp3$/i.test(path) && !/__MACOSX/.test(path)) list.push({ name: path, get: function () { return ent.async("arraybuffer"); } }); });
        } else if (/\.mp3$/i.test(f.name) || f.type === "audio/mpeg") list.push({ name: f.name, get: function () { return f.arrayBuffer(); } });
      }
      list = list.filter(function (x) { return trackOf(x.name); });
      if (!list.length) { m("Không thấy file nào có mã đoạn (vd 06-3.mp3)."); return; }
      var done = 0, skip = 0;
      for (var x of list) {
        var t = trackOf(x.name);
        if (tracks[t]) { skip++; continue; }
        m("Đang tải " + (done + skip + 1) + "/" + list.length + " (" + t + ")...");
        var up = await assets.upload(new Blob([b64(await x.get())], { type: "text/plain" }), { type: "text/plain" });
        var doc = { track: t, bai: +t.split("-")[0], asset: up.id, name: String(x.name).split("/").pop().slice(0, 80), at: Date.now() };
        await db.doc("tracks/t" + t).set(doc); tracks[t] = doc; done++;
      }
      m("Xong: thêm " + done + " đoạn" + (skip ? ", bỏ qua " + skip + " đoạn đã có" : "") + ".");
    } catch (e) {
      var c = e && e.code;
      m(c === "quota_or_state" ? "Kho file đầy." : c === "too_large" ? "Có file quá lớn (trên 20 MB)." : c === "rate_limited" ? "Tải nhanh quá, đợi một lúc rồi chọn lại, các đoạn đã tải vẫn giữ." : "Tải bị dừng giữa chừng, chọn lại file để tải tiếp.");
    } finally { upBusy = false; var i = $("#lsAud"); if (i) i.value = ""; var c2 = $("#lsTrackCount"); if (c2) c2.textContent = Object.keys(tracks).length; }
  }
  document.addEventListener("change", function (e) { if (e.target.id === "lsAud" && e.target.files && e.target.files.length) uploadAudio(Array.prototype.slice.call(e.target.files)); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lstrack]"); if (!b) return;
    var tr = tracks[b.dataset.lstrack], box = b.closest(".ls-trow") || b.closest(".ls-bai"); if (!tr || !box) return;
    document.querySelectorAll(".ls-trow .ls-box").forEach(function (a) { var au = a.querySelector("audio"); if (au) au.pause(); a.remove(); });
    box.querySelectorAll(".ls-box").forEach(function (a) { a.remove(); });
    box.insertAdjacentHTML("beforeend", playerBox(tr)); playTrack(tr, box.querySelector(".ls-box .ls-audio"));
  });

  async function init() {
    var cl = window.claude, d = cl ? await cl.use("db") : null;
    if (!d) { items = local(); ready = true; draw(); if (!cl) return; note = "Đang lưu trong trình duyệt này."; return refreshForm(); }
    db = d;
    var user = await cl.use("user");
    if (user && typeof user.canEdit === "function") { try { var ok = await user.canEdit(); if (ok === false) { canWrite = false; refreshForm(); } } catch (e) {} }
    assets = await cl.use("assets");
    db.collection("tracks").onSnapshot(function (snap) {
      var o = builtins(); snap.docs.forEach(function (d) { var x = d.data(); if (x && x.track) o[x.track] = x; }); tracks = o;
      var c = $("#lsTrackCount"); if (c) c.textContent = Object.keys(tracks).length; draw();
    }, function () {});
    if (assets && canWrite) refreshForm();
    unsub = db.collection("audio").onSnapshot(function (snap) {
      items = snap.docs.map(function (d) { var x = Object.assign({}, d.data()); x.key = d.id; return x; });
      ready = true; draw();
    }, function () { items = local(); db = null; ready = true; draw(); });
  }
  function refreshForm() { if (S.tab === "nghe") A.go("nghe"); }

  document.addEventListener("submit", function (e) {
    if (e.target.id === "lsForm") { e.preventDefault(); add(); }
    if (e.target.classList && e.target.classList.contains("ls-mark")) { e.preventDefault(); mark(e.target); }
  });
  async function mark(f) {
    var t = secs(f.t.value), d = f.dataset;
    if (!t) { f.t.focus(); return; }
    var it = { bai: +d.bai, muc: d.track, title: "đoạn nghe trong video Bài " + d.bai, id: "", list: d.list, idx: +d.idx, t: t, at: Date.now() };
    var err = await saveItem(it);
    f.outerHTML = '<p class="ls-sub">' + (err || "Đã lưu mốc " + esc(d.track) + " lúc " + clock(t) + ".") + "</p>" + (err ? "" : linkRow(it));
    photoOut = $("#lsPhotoOut") ? $("#lsPhotoOut").innerHTML : photoOut; draw();
  }
  document.addEventListener("input", function (e) { if (e.target.id === "lsQ") { S.nghe.q = e.target.value.trim(); A.save(); draw(); } });
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-lsdel]"); if (b) del(b.dataset.lsdel); });

  window.HSK_LISTEN = { view: view, parseYT: parseYT, secs: secs, builtins: builtins, ROMAN: ROMAN };
  init();
  if (S.tab === "nghe") A.go("nghe");
})();
