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
    var u = (tr.pdir || "img/sotay1/parts/") + f[1] + "-p" + p + ".jpg";
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
    var box = b.closest(".ls-box"), tr = box && trk(box.dataset.lstr), au = box && box.querySelector(".ls-audio"); if (!tr || !au || !tr.segs) return;
    var sg = tr.segs[+b.dataset.lsseg], end = b.dataset.lsend != null ? +b.dataset.lsend : sg.end;
    box.querySelectorAll(".ls-seg.on").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
    var go = function () { au.currentTime = sg.t; stopAt.set(au, end); au.play().catch(function () {}); };
    if (!au.src) trackURL(tr).then(function (u) { au.src = u; go(); }); else go();
  });
  document.addEventListener("timeupdate", function (e) {
    var au = e.target, end = au.classList && au.classList.contains("ls-audio") && stopAt.get(au);
    if (end && au.currentTime >= end - 0.3) { au.pause(); stopAt.delete(au); }
  }, true);
  function pageImg(tr) {
    if (tr && tr.strip) return '<a class="ls-page" href="' + esc(tr.strip) + '" target="_blank" rel="noopener"><img src="' + esc(tr.strip) + '" alt="Trang ' + tr.page + ' trong sách" style="aspect-ratio:600/848;object-fit:cover;object-position:0 ' + tr.sy + '%"></a>';
    return tr && tr.img ? '<a class="ls-page" href="' + esc(tr.img) + '" target="_blank" rel="noopener"><img src="' + esc(tr.img) + '" alt="Trang ' + (tr.page || "") + ' trong sách"></a>' : ""; }
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

  // File nghe HSK 2, 3, 4 (giáo trình HSK 3.0 bản 2026 và Sổ tay HSK 2, 3), đóng gói sẵn trong audio/, cùng kiểu thẻ với Sổ tay HSK 1
  var XSEG = {"st2":{"1":[0,75.2,96.9,113.3,132.7,170.6,204.4,236.3,270.6,321.3,376.7,423.1,478.6],"2":[0,74.4,97.5,113.7,131.1,169.2,203.8,231.7,265.3,317.0,367.6,416.7,490.8],"3":[0,75.3,101.8,123.3,144.9,183.1,218.1,249.2,284.0,337.3,392.9,434.8,492.6],"4":[0,75.1,98.5,121.1,146.9,185.2,223.0,261.3,289.9,341.4,393.1,445.4,512.3],"5":[0,75.0,98.5,117.4,139.8,179.1,212.3,244.8,277.5,330.3,381.9,431.1,494.5],"6":[0,74.7,96.7,114.3,134.1,171.7,210.8,240.0,277.3,328.5,381.7,429.1,488.9],"7":[0,73.3,95.4,111.8,130.5,168.3,200.2,226.6,260.6,311.7,363.4,411.1,470.9],"8":[0,75.7,99.9,119.5,140.8,178.7,216.1,249.8,284.9,336.4,387.7,439.6,508.0],"9":[0,74.6,97.5,119.2,139.0,176.9,215.1,248.3,277.3,328.1,384.4,436.9,506.7],"10":[0,73.9,99.0,121.3,140.0,177.9,212.4,237.3,264.8,315.8,360.9,407.0,460.7],"11":[0,75.4,100.2,121.4,146.0,183.8,220.0,248.7,284.2,335.3,381.4,424.5,483.3],"12":[0,75.5,99.9,123.1,143.0,180.6,216.4,257.8,290.4,341.6,393.9,446.0,508.9],"13":[0,75.5,98.9,125.7,149.3,186.9,222.4,255.7,287.0,337.8,401.6,446.4,518.8],"14":[0,76.3,99.4,120.2,144.5,182.3,216.2,246.5,274.8,325.7,375.4,427.4,491.4],"15":[0,75.9,100.9,120.0,144.0,182.0,219.0,253.4,283.4,334.3,386.8,440.6,492.6],"mock":[0,101.5,123.4,139.5,154.7,172.7,191.0,228.0,260.3,289.8,316.8,346.5,374.3,408.7,438.1,468.5,499.7,528.4,578.2,632.0,675.7,724.7,771.3,820.1,885.8,933.4,984.6,1051.8]},"st3":{"1":[0,84.7,117.0,138.4,171.1,224.8,275.1,317.3,366.9,418.0,462.2,510.1,570.0],"2":[0,78.0,107.6,133.3,164.4,218.7,271.3,324.0,384.2,434.8,481.3,519.3,577.8],"3":[0,77.8,105.4,131.7,155.8,209.9,257.6,305.7,369.4,420.3,466.8,511.9,570.8],"4":[0,78.4,111.1,144.1,177.6,231.8,282.9,331.8,392.1,442.9,485.2,522.1,572.9],"5":[0,77.3,104.3,130.5,157.5,211.7,266.4,313.0,385.9,436.6,482.6,524.5,580.2],"6":[0,78.0,108.1,131.2,159.6,213.8,263.3,306.4,386.4,437.1,491.7,550.9,614.0],"7":[0,78.5,125.7,154.4,180.9,235.0,287.3,339.8,397.4,448.3,491.9,541.6,595.1],"8":[0,77.4,106.5,130.2,154.6,208.7,256.4,299.4,372.0,423.1,475.0,516.0,572.6],"9":[0,77.1,103.8,124.2,149.8,203.9,262.2,308.6,372.4,423.2,473.6,519.3,568.6],"10":[0,78.0,108.4,134.9,160.1,214.2,276.5,331.0,388.0,438.9,485.7,530.3,588.0],"11":[0,78.3,104.6,125.8,156.2,210.3,261.7,308.1,370.9,422.0,474.7,524.9,587.8],"12":[0,79.2,112.4,138.5,178.2,232.4,290.7,349.8,407.5,458.5,511.5,555.9,612.2],"13":[0,78.6,108.3,134.9,161.8,216.0,267.5,309.8,368.9,420.0,471.9,527.0,578.0],"14":[0,78.5,105.0,125.9,157.9,212.1,269.2,322.0,388.7,439.7,492.0,541.4,591.6],"15":[0,78.0,107.5,134.9,165.5,219.6,271.7,319.6,370.7,421.7,483.8,541.5,596.7],"16":[0,78.6,114.8,145.0,171.1,225.2,281.7,336.9,413.1,464.2,517.9,565.5,613.1],"17":[0,78.9,107.0,130.3,151.8,206.0,254.6,303.6,361.4,412.6,464.5,512.6,566.9],"18":[0,77.8,106.0,131.7,157.9,212.1,264.8,312.4,372.2,423.1,470.4,520.2,586.3],"mock":[0,105.1,133.2,162.5,189.4,217.0,241.0,281.7,305.6,337.6,360.5,386.0,440.0,494.9,549.6,593.0,643.1,683.3,736.6,801.7,855.4,925.5,987.6,1038.1,1083.1,1139.4,1186.0,1231.6,1282.0,1334.5,1382.7,1433.8,1483.0]}};
  // Giáo trình: mỗi bài gộp 1 file audio (mốc t từng đoạn) và 1 ảnh dải các trang (i = vị trí trang trong dải, p = trang PDF; trang sách = p - off)
  var XTB = {"gt2":{"1":{"n":5,"i":[0,0,1,2,3,3,4,4],"p":[18,18,19,20,21,21,23,23],"t":[0,27.48,37.3,60.1,65.66,96.62,108.9,126.66,141.52]},"2":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[27,27,28,29,30,31,32,32],"t":[0,19.8,39.99,68.52,86.86,114.03,120.95,136.75,141.16]},"3":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[36,36,37,38,39,40,41,41],"t":[0,17.5,26.07,47.65,55.25,84.27,101.17,117.52,128.0]},"4":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[46,46,47,48,49,50,51,51],"t":[0,18.1,31.21,60.78,75.75,98.11,113.03,132.62,135.86]},"5":{"n":4,"i":[0,0,1,1,2,2,3,3],"p":[54,54,56,56,58,58,59,59],"t":[0,24.87,51.75,91.09,105.41,139.24,144.57,161.97,167.69]},"6":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[63,63,64,65,66,67,68,68],"t":[0,26.49,40.94,73.49,80.02,111.26,123.77,155.38,160.76]},"7":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[73,73,74,75,76,77,78,78],"t":[0,23.98,36.7,57.44,70.21,89.75,98.19,117.83,124.88]},"8":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[81,81,82,83,84,85,86,86],"t":[0,18.65,34.09,66.72,76.31,114.71,125.03,144.62,155.1]},"9":{"n":5,"i":[0,0,1,1,2,3,4,4],"p":[90,90,92,92,93,94,96,96],"t":[0,33.88,52.58,81.97,89.94,108.93,113.95,136.83,139.99]},"10":{"n":6,"i":[0,0,1,1,2,3,4,5],"p":[101,101,103,103,104,105,106,107],"t":[0,30.96,44.88,73.01,87.33,117.37,122.49,148.93,152.38]},"11":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[110,110,111,112,113,114,115,115],"t":[0,29.62,40.88,79.57,84.69,121.44,134.55,158.48,162.24]},"12":{"n":6,"i":[0,0,1,1,2,3,4,5],"p":[119,119,121,121,122,123,124,125],"t":[0,32.37,40.89,76.39,82.5,119.72,128.99,153.99,161.96]},"13":{"n":7,"i":[0,0,1,2,3,4,5,6],"p":[129,129,130,131,132,133,134,135],"t":[0,39.84,50.99,89.91,101.9,140.69,150.09,172.45,177.83]},"14":{"n":7,"i":[0,0,1,2,3,4,5,6],"p":[138,138,139,140,141,142,143,144],"t":[0,22.73,27.82,74.37,86.1,123.04,132.03,158.52,167.51]},"15":{"n":7,"i":[0,0,1,2,3,4,5,6],"p":[147,147,148,149,150,151,152,153],"t":[0,29.96,33.8,80.82,99.03,133.67,142.63,169.38,175.86]}},"gt3":{"1":{"n":7,"i":[0,0,1,2,3,4,5,6],"p":[14,14,15,16,17,18,19,20],"t":[0,34.4,51.3,82.28,106.13,140.43,156.55,194.87,208.82]},"2":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[23,23,24,25,26,27,28,28],"t":[0,30.85,47.8,85.26,110.55,141.01,155.01,198.11,209.08]},"3":{"n":6,"i":[0,0,1,2,3,3,4,5],"p":[32,32,33,34,35,35,36,37],"t":[0,34.38,62.49,93.47,110.14,141.51,157.29,187.75,195.56]},"4":{"n":5,"i":[0,0,1,2,3,3,4,4],"p":[42,42,43,44,45,45,47,47],"t":[0,33.85,55.66,92.41,111.74,148.78,166.23,196.48,205.28]},"5":{"n":6,"i":[0,0,1,2,3,3,4,5],"p":[51,51,52,53,54,54,55,56],"t":[0,28.66,47.52,86.68,103.69,143.92,154.68,186.29,209.38]},"6":{"n":6,"i":[0,0,1,2,3,3,4,5],"p":[60,60,61,62,63,63,64,65],"t":[0,33.33,43.44,78.94,101.12,135.52,158.98,207.72,225.69]},"7":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[70,70,71,72,73,74,75,75],"t":[0,34.35,46.5,77.06,95.63,127.0,149.96,186.61,199.78]},"8":{"n":6,"i":[0,1,1,2,3,3,4,5],"p":[80,81,81,82,83,83,84,85],"t":[0,33.28,54.8,89.93,105.58,151.19,172.69,205.73,222.32]},"9":{"n":6,"i":[0,0,1,2,3,4,4,5],"p":[89,89,90,91,92,93,93,94],"t":[0,31.71,60.44,97.09,105.5,139.8,158.66,194.26,214.58]},"10":{"n":5,"i":[0,0,1,2,3,4,4,4],"p":[99,99,100,101,102,103,103,103],"t":[0,39.52,62.09,106.52,130.27,172.8,186.64,230.29,242.1]},"11":{"n":6,"i":[0,0,1,2,3,3,4,5],"p":[108,108,109,110,111,111,112,113],"t":[0,34.82,59.64,95.24,111.54,151.04,166.3,208.23,225.37]},"12":{"n":6,"i":[0,0,1,2,3,3,4,5],"p":[117,117,118,119,120,120,121,122],"t":[0,38.56,52.82,85.5,110.6,152.29,160.41,204.14,221.43]},"13":{"n":7,"i":[0,0,1,2,3,4,5,6],"p":[128,128,129,130,131,132,133,134],"t":[0,42.89,62.72,102.22,113.66,151.98,167.73,214.33,236.98]},"14":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[137,137,138,139,140,141,142,142],"t":[0,32.65,50.15,97.95,109.08,140.01,160.99,197.98,218.64]},"15":{"n":6,"i":[0,0,1,2,3,4,5,5],"p":[146,146,147,148,149,150,151,151],"t":[0,43.96,65.64,108.77,131.84,179.51,189.88,235.8,246.14]},"16":{"n":6,"i":[0,1,2,2,3,4,5,5],"p":[157,158,159,159,160,161,162,162],"t":[0,46.79,79.44,130.72,150.49,192.26,206.34,252.03,258.19]},"17":{"n":6,"i":[0,0,1,2,3,4,4,5],"p":[167,167,168,169,170,171,171,172],"t":[0,49.76,70.0,118.54,133.56,171.25,188.57,231.44,247.43]},"18":{"n":7,"i":[0,0,1,2,3,4,5,6],"p":[176,176,177,178,179,180,181,182],"t":[0,37.96,58.99,99.69,119.05,154.55,170.9,206.77,223.85]}},"gt4":{"1":{"n":7,"i":[0,0,1,2,3,4,5,6],"p":[12,12,13,14,15,16,17,18],"t":[0,29.13,50.52,88.95,121.71,158.7,192.06,243.73,270.77]},"2":{"n":6,"i":[0,0,1,1,2,3,4,5],"p":[23,23,25,25,26,27,28,29],"t":[0,33.65,55.96,106.95,126.36,177.93,205.25,268.6,303.32]},"3":{"n":4,"i":[0,0,1,1,2,2,3,3],"p":[34,34,36,36,38,38,40,40],"t":[0,43.47,63.95,107.23,143.44,194.2,219.12,267.11,304.07]},"4":{"n":6,"i":[0,0,1,1,2,3,4,5],"p":[46,46,48,48,49,50,51,52],"t":[0,36.81,59.25,93.76,115.96,160.19,188.74,231.95,264.11]},"5":{"n":6,"i":[0,1,2,3,4,4,5,5],"p":[58,59,60,61,62,62,64,64],"t":[0,38.87,71.78,127.53,146.76,195.69,234.85,277.61,311.49]},"6":{"n":6,"i":[0,0,1,1,2,3,4,5],"p":[70,70,72,72,73,74,75,76],"t":[0,46.55,65.54,106.97,132.88,189.2,225.07,274.91,294.03]},"7":{"n":6,"i":[0,0,1,1,2,3,4,5],"p":[82,82,84,84,85,86,87,88],"t":[0,37.04,70.56,108.57,132.08,183.65,208.49,253.37,276.62]},"8":{"n":6,"i":[0,0,1,1,2,3,4,5],"p":[94,94,96,96,97,98,99,100],"t":[0,33.15,62.22,113.45,138.08,198.71,222.3,274.86,305.27]},"9":{"n":5,"i":[0,0,1,1,2,3,4,4],"p":[106,106,108,108,109,110,112,112],"t":[0,48.74,75.86,120.9,143.89,204.36,235.32,290.12,317.71]},"10":{"n":7,"i":[0,0,1,2,3,4,5,6],"p":[118,118,120,121,122,123,124,125],"t":[0,40.28,71.68,127.76,150.49,218.54,242.47,308.04,340.88]}}};
  var XLAY = [[1, 0], [1, 1], [1, 2], [1, 3], [2, 0], [2, 4], [2, 5], [2, 6], [3, 0], [3, 7], [3, 8], [3, 9], [3, 10]];
  function xmock(groups) { var o = []; groups.forEach(function (g, i) { o.push([i + 1, 0]); for (var q = g[0]; q <= g[1]; q++) o.push([i + 1, q]); }); return o; }
  var XBOOKS = [
    { id: "st2", lv: "HSK 2", name: "Sổ tay HSK 2", kind: "st", dir: "sotay2", n: 15, pg: function (n) { return 10 * n - 7; }, mpg: 152, mlay: xmock([[1, 5], [6, 15], [16, 25]]) },
    { id: "gt2", lv: "HSK 2", name: "Giáo trình HSK 2", kind: "gt", dir: "gt2", off: 16 },
    { id: "st3", lv: "HSK 3", name: "Sổ tay HSK 3", kind: "st", dir: "sotay3", n: 18, pg: function (n) { return [9, 18, 27, 36, 45, 55, 64, 73, 83, 92, 101, 110, 119, 128, 137, 146, 155, 164][n - 1] - 5; }, mpg: 168, mlay: xmock([[1, 10], [11, 20], [21, 30]]) },
    { id: "gt3", lv: "HSK 3", name: "Giáo trình HSK 3", kind: "gt", dir: "gt3", off: 12 },
    { id: "gt4", lv: "HSK 4", name: "Giáo trình HSK 4A", kind: "gt", dir: "gt4", off: 10 }
  ];
  var XT = {};
  function xsegs(t, lay) { if (!t || t.length !== lay.length) return null; return t.map(function (x, i) { return { p: lay[i][0], q: lay[i][1], t: x, end: t[i + 1] || 0 }; }); }
  XBOOKS.forEach(function (B) {
    B.rows = [];
    if (B.kind === "st") {
      for (var n = 1; n <= B.n; n++) {
        var f = "L" + (n < 10 ? "0" : "") + n + "-moni", k = B.id + "-" + n;
        XT[k] = { track: k, bai: n, loai: "moni", lb: LOAI.moni[1], name: B.name + " Bài " + n + ", 模拟测练", src: "audio/" + B.dir + "/" + f + ".mp3", img: "img/" + B.dir + "/" + f + ".jpg", pdir: "img/" + B.dir + "/parts/", page: B.pg(n), segs: xsegs(XSEG[B.id][n], XLAY) };
        B.rows.push({ bai: n, keys: [k] });
      }
      var mk = B.id + "-thi";
      XT[mk] = { track: mk, bai: 0, loai: "thi", lb: "Đề thi thử", name: "模拟试卷 Đề thi thử " + B.lv + ", phần nghe", src: "audio/" + B.dir + "/mock-test.mp3", img: "img/" + B.dir + "/mock-test.jpg", pdir: "img/" + B.dir + "/parts/", page: B.mpg, segs: xsegs(XSEG[B.id].mock, B.mlay) };
      B.rows.push({ bai: 0, keys: [mk] });
    } else {
      var m = XTB[B.id];
      Object.keys(m).map(Number).sort(function (x, y) { return x - y; }).forEach(function (n) {
        var g = m[n], f = "L" + (n < 10 ? "0" : "") + n;
        var ks = g.p.map(function (p, i) {
          var c = n + "-" + (i + 1), k = B.id + "-" + c;
          XT[k] = { track: k, bai: n, code: c, lb: "Giáo trình", name: B.name + " " + c, src: "audio/" + B.dir + "/" + f + ".mp3", strip: "img/" + B.dir + "/" + f + ".jpg", sy: g.n > 1 ? Math.round(g.i[i] / (g.n - 1) * 10000) / 100 : 0, t0: g.t[i], t1: g.t[i + 1], page: p - B.off };
          return k;
        });
        B.rows.push({ bai: n, keys: ks });
      });
    }
  });
  function trk(k) { return tracks[k] || XT[k]; }
  function xchip(k) {
    var t = XT[k];
    var im = t.strip ? '<img src="' + esc(t.strip) + '" alt="" loading="lazy" style="object-position:0 ' + t.sy + '%">' : '<img src="' + esc(t.img) + '" alt="" loading="lazy">';
    return '<button class="ls-tcard" data-lstrack="' + esc(k) + '">' + im + '<span><b>' + esc(t.code || "") + "</b> " + esc(t.lb) + '<small>trang ' + t.page + "</small></span></button>";
  }
  function bookHTML(qn, q) {
    if (q && !qn) return "";
    var cur = XBOOKS.filter(function (b) { return b.id === S.nghe.book; })[0] || XBOOKS[0];
    var tabs = '<div class="ls-parts">' + XBOOKS.map(function (b) { return '<button class="ls-part' + (b === cur ? " on" : "") + '" data-lsbook="' + b.id + '">' + esc(b.name) + "</button>"; }).join("") + "</div>";
    var rows = cur.rows.filter(function (r) { return qn ? r.bai === qn || r.bai === 0 : true; });
    return '<div class="ls-bai" style="margin-top:22px"><div class="ls-baihead"><b>File nghe HSK 2, 3, 4</b></div>' + tabs + '<div class="ls-tracks">' + rows.map(function (r) {
      return '<div class="ls-trow"><span class="ls-tbai">' + (r.bai ? "Bài " + r.bai : "Đề thi thử") + '</span><div class="row">' + r.keys.map(xchip).join("") + "</div></div>";
    }).join("") + "</div></div>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lsbook]");
    if (b) { S.nghe.book = b.dataset.lsbook; A.save(); draw(); }
  });
  function listHTML() {
    if (!ready) return '<div class="empty">Đang tải danh sách...</div>';
    var q = S.nghe.q || "", rows = sorted().filter(function (it) { return match(it, q); }), qn = /^\d+$/.test(q) ? +q : 0;
    var head = trackBlock(qn, q) + bookHTML(qn, q);
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
    try {
      p.src = await trackURL(tr);
      if (tr.t0 != null) { var t0 = tr.t0, t1 = tr.t1; stopAt.set(p, t1); var seek = function () { p.currentTime = t0; }; if (p.readyState >= 1) seek(); else p.addEventListener("loadedmetadata", seek, { once: true }); }
      p.play().catch(function () {});
    }
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
    var tr = trk(b.dataset.lstrack), box = b.closest(".ls-trow") || b.closest(".ls-bai"); if (!tr || !box) return;
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
