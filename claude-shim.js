/* Bản web riêng: thay window.claude (db, user) của claude.ai bằng Firebase Auth (Google) + Firestore. by: MANHXD
   Các file app (homework.js, listen.js, worksheet.js) giữ nguyên, chỉ gọi window.claude.use(...) như cũ. */
(function () {
  var cfg = window.HSK_FIREBASE || {}, ready = !!(window.firebase && cfg.apiKey && cfg.projectId);
  var teachers = (window.HSK_TEACHERS || []).map(function (s) { return String(s).toLowerCase(); });
  var auth = null, fs = null, first;
  if (ready) {
    firebase.initializeApp(cfg);
    auth = firebase.auth(); fs = firebase.firestore();
    auth.languageCode = "vi";
    first = new Promise(function (res) {
      var seen = false;
      auth.onAuthStateChanged(function (u) {
        bar(u);
        if (!seen) { seen = true; res(u); } else location.reload(); /* app đọc người dùng 1 lần lúc mở, đổi tài khoản thì tải lại */
      });
    });
    auth.getRedirectResult().catch(function (e) { note("Chưa đăng nhập được: " + (e && e.code || "lỗi")); });
  } else first = Promise.resolve(null);

  function isTeacher(u) { return !!(u && u.emailVerified && teachers.indexOf(String(u.email || "").toLowerCase()) >= 0); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function note(t) { var n = document.getElementById("gNote"); if (n) n.textContent = t; }

  function signIn() {
    var p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: "select_account" });
    auth.signInWithPopup(p).catch(function (e) {
      var c = e && e.code;
      if (c === "auth/popup-blocked" || c === "auth/operation-not-supported-in-this-environment") return auth.signInWithRedirect(p);
      if (c !== "auth/popup-closed-by-user" && c !== "auth/cancelled-popup-request") note("Chưa đăng nhập được: " + (c || "lỗi"));
    });
  }
  function bar(u) {
    var host = document.querySelector(".top .wrap"); if (!host) return;
    var el = document.getElementById("gAuth");
    if (!el) { el = document.createElement("div"); el.id = "gAuth"; el.className = "g-auth"; host.appendChild(el); }
    el.innerHTML = u
      ? (u.photoURL ? '<img src="' + esc(u.photoURL) + '" alt="" referrerpolicy="no-referrer">' : "") +
        '<span class="g-name">' + esc(u.displayName || u.email) + (isTeacher(u) ? " · Giáo viên" : "") + '</span><button class="btn small" data-gout>Đăng xuất</button><small id="gNote"></small>'
      : '<button class="btn small primary" data-gin>Đăng nhập Google</button><small id="gNote"></small>';
  }
  document.addEventListener("click", function (e) {
    if (!auth || !e.target.closest) return;
    if (e.target.closest("[data-gin]")) signIn();
    if (e.target.closest("[data-gout]")) auth.signOut();
  });
  if (ready && document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { bar(auth.currentUser); });

  var dl = { save: function (o) { /* tải file như trình duyệt thường */
    var a = document.createElement("a"), url = URL.createObjectURL(new Blob([o.data], { type: "text/html;charset=utf-8" }));
    a.href = url; a.download = o.filename || "file.html"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000); return Promise.resolve();
  } };

  window.claude = { use: async function (name) {
    if (name === "downloads") return null; /* web thường: in thẳng bằng hộp in của trình duyệt (printNative) */
    if (!ready) return null;
    var u = await first;
    if (name === "db") return fs; /* Firestore compat: collection().onSnapshot/add, doc().get/set/delete giống API cũ */
    if (name === "user") return u ? {
      id: function () { return Promise.resolve(u.uid); },
      name: function () { return Promise.resolve(u.displayName || ""); },
      email: function () { return Promise.resolve(u.email || ""); },
      canEdit: function () { return Promise.resolve(isTeacher(u)); }
    } : null;
    return null; /* sample (AI), assets: chưa có trên bản web */
  } };
})();
