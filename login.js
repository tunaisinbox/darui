/* login.js — tunaアカウントのログインボタン(画面の右上)【テンプレート】

   ■ 使い方(3ステップ)
     1. 管理画面(/admin)でクライアントを作り、client_id を控える
     2. このファイルの「設定」を書き換えて、サイトに置く
     3. ページの </body> の直前に、次の1行を入れる
          <script src="login.js"></script>

   ■ 動き
     ・未ログイン  : 「ログイン」ボタン
     ・ログイン後  : アイコン + 名前(+バッジ) → 押すと「マイページ」「設定」「ログアウト」
     ・ログインのたびに、tunaアカウントの画面で「許可する」を押します(ロボット認証つき)
     ・tunaアカウント側で連携を解除したり、ほかのサイトでログアウトしたりすると、
       このサイトも自動でログアウトになります(CHECK_MS ごとに確認します)

   ■ 改造するには
     ・見た目 → 下の css の部分(色・大きさ)と、設定の POS_TOP / POS_RIGHT(位置)
     ・メニュー → renderLoggedIn の中の .tl-menu
     ・ログイン / ログアウトを自分のコードで知りたいとき:
         window.addEventListener("tuna:login",  function (e) { console.log(e.detail); });   // e.detail に tunaid / name / picture / badge
         window.addEventListener("tuna:logout", function () { console.log("logout"); });
*/
(function () {
  /* ===== 設定(ここだけ書き換えればOK) ===== */
  var CLIENT_ID = "tuna_45ef8fe4bf8f91b91db3";          // 管理画面で作ったもの
  var REDIRECT  = "https://tunaisinbox.f5.si/";           // 管理画面に登録したURLと、まったく同じもの
  var ACCOUNT   = "https://account.tunaisinbox.workers.dev";                    // tunaアカウントのURL(そのままでOK)
  var SCOPE     = "profile email";                  // 名前・アイコン + メールアドレス(メールが不要なら "profile")
  var LABEL     = "ログイン";                       // ボタンの文字
  var POS_TOP   = 20;                               // 画面の上からの距離(px)
  var POS_RIGHT = 20;                               // 画面の右からの距離(px)
  var CHECK_MS  = 30000;                            // ログイン状態を確かめる間隔(ミリ秒)
  var AUTO      = false;                            // 公式サービス(管理画面で「公式」をオン)なら true: tunaアカウントにログイン済みの人は、ボタンなしで自動ログイン
  /* ======================================== */

  var CACHE_KEY = "tuna_user", PKCE_KEY = "tuna_oauth";

  var css = [
    "#tl{position:fixed;top:" + POS_TOP + "px;right:" + POS_RIGHT + "px;z-index:1000;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN','Hiragino Sans',Meiryo,sans-serif;",
    "opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .5s ease,transform .5s cubic-bezier(.2,.8,.2,1)}",
    "#tl.show{opacity:1;transform:none;pointer-events:auto}",
    "#tl .tl-btn{position:relative;display:flex;align-items:center;justify-content:center;gap:9px;height:48px;min-width:48px;padding:0 20px 0 14px;border-radius:14px;",
    "color:#fff;font:inherit;font-size:.95rem;font-weight:700;letter-spacing:.08em;white-space:nowrap;cursor:pointer;",
    "background:rgba(24,26,40,.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
    "border:1px solid rgba(255,255,255,.28);box-shadow:0 4px 16px rgba(0,0,0,.3);overflow:hidden;isolation:isolate;",
    "transition:transform .25s cubic-bezier(.2,.8,.2,1),background .25s,box-shadow .25s,border-color .25s}",
    "#tl .tl-btn::before{content:'';position:absolute;inset:0;z-index:-1;opacity:0;",
    "background:linear-gradient(120deg,rgba(195,217,240,.55),rgba(255,179,209,.5),rgba(185,212,255,.55));background-size:200% 100%;",
    "transition:opacity .3s;animation:tlFlow 4s linear infinite}",
    "@keyframes tlFlow{to{background-position:200% 0}}",
    "#tl .tl-btn::after{content:'';position:absolute;top:0;bottom:0;left:-60%;width:40%;z-index:-1;",
    "background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);transition:left .6s ease}",
    "#tl .tl-btn:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.55);box-shadow:0 8px 22px rgba(120,160,230,.35),0 0 14px rgba(226,236,247,.35)}",
    "#tl .tl-btn:hover::before{opacity:1}",
    "#tl .tl-btn:hover::after{left:130%}",
    "#tl .tl-btn:active{transform:translateY(0) scale(.96)}",
    "#tl .tl-btn:focus-visible{outline:2px solid #c3d9f0;outline-offset:3px}",
    "#tl .tl-ico{width:22px;height:22px;flex:none;max-width:22px;transition:transform .35s cubic-bezier(.175,.885,.32,1.4),max-width .35s ease,opacity .25s,margin .35s ease}",
    "#tl .tl-btn:hover .tl-ico{transform:translateX(3px) scale(1.1)}",
    /* 押したあとの演出 */
    "#tl .tl-btn.busy{pointer-events:none;border-color:rgba(195,217,240,.7);background:rgba(40,44,66,.92);box-shadow:0 0 0 0 rgba(195,217,240,.55);animation:tlPulse 1.2s ease-out infinite}",
    "@keyframes tlPulse{to{box-shadow:0 0 0 14px rgba(195,217,240,0)}}",
    "#tl .tl-btn.busy::before{opacity:1}",
    "#tl .tl-btn.busy .tl-ico{max-width:0;opacity:0;margin-right:-9px;transform:translateX(14px) scale(.4)}",
    "#tl .tl-dots{display:none;gap:3px;margin-left:-4px}",
    "#tl .tl-btn.busy .tl-dots{display:inline-flex}",
    "#tl .tl-dots i{width:4px;height:4px;border-radius:50%;background:#fff;animation:tlDot 1s ease-in-out infinite}",
    "#tl .tl-dots i:nth-child(2){animation-delay:.15s}#tl .tl-dots i:nth-child(3){animation-delay:.3s}",
    "@keyframes tlDot{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}",
    "#tl .tl-bar{position:absolute;left:0;right:0;bottom:0;height:3px;opacity:0;transition:opacity .2s;overflow:hidden}",
    "#tl .tl-bar::before{content:'';position:absolute;top:0;bottom:0;left:-40%;width:40%;border-radius:3px;background:linear-gradient(90deg,transparent,#ffc2dc,#b9d4ff,transparent)}",
    "#tl .tl-btn.busy .tl-bar{opacity:1}",
    "#tl .tl-btn.busy .tl-bar::before{animation:tlBar 1s ease-in-out infinite}",
    "@keyframes tlBar{to{left:100%}}",
    "#tl .tl-btn.fail{animation:tlShake .4s ease;border-color:rgba(255,111,140,.8)}",
    "@keyframes tlShake{20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}",
    /* ログイン後 */
    "#tl .tl-btn.user{padding:0 16px 0 7px}",
    "#tl .tl-av{width:34px;height:34px;border-radius:50%;flex:none;object-fit:cover;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25)}",
    "#tl .tl-name{max-width:120px;overflow:hidden;text-overflow:ellipsis;letter-spacing:.04em}",
    "#tl .tl-bd{width:17px;height:17px;flex:none;margin-left:-3px}",
    "#tl .tl-caret{width:14px;height:14px;flex:none;opacity:.8;transition:transform .3s}",
    "#tl.open .tl-caret{transform:rotate(180deg)}",
    "#tl .tl-menu{position:absolute;top:58px;right:0;min-width:200px;padding:8px;border-radius:16px;",
    "background:rgba(20,20,32,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);",
    "border:1px solid rgba(255,255,255,.18);box-shadow:0 14px 34px rgba(0,0,0,.45);",
    "opacity:0;transform:translateY(-6px) scale(.96);transform-origin:top right;pointer-events:none;",
    "transition:opacity .2s ease,transform .3s cubic-bezier(.175,.885,.32,1.3)}",
    "#tl.open .tl-menu{opacity:1;transform:none;pointer-events:auto}",
    "#tl .tl-id{display:flex;align-items:center;gap:4px;padding:8px 12px 10px;margin-bottom:6px;font-size:.72rem;color:#8a8a9e;border-bottom:1px solid rgba(255,255,255,.1);letter-spacing:.04em}",
    "#tl .tl-item{display:flex;align-items:center;gap:10px;width:100%;padding:11px 12px;border:0;border-radius:10px;background:none;cursor:pointer;",
    "color:#fff;font:inherit;font-size:.9rem;text-align:left;text-decoration:none;transition:background .2s,transform .2s}",
    "#tl .tl-item:hover{background:rgba(255,255,255,.12);transform:translateX(3px)}",
    "#tl .tl-item svg{width:18px;height:18px;flex:none}",
    "#tl .tl-item.out{color:#ff8fa3}",
    "@media (max-width:520px){#tl{top:16px;right:16px}#tl .tl-name{display:none}#tl .tl-btn.user{padding:0 12px 0 7px}}",
    "@media (prefers-reduced-motion:reduce){#tl *,#tl *::before,#tl *::after{animation:none!important;transition-duration:.01s!important}}"
  ].join("");

  var I_LOGIN = '<svg class="tl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>';
  var I_USER  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  var I_SET   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
  var I_OUT   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
  var I_CARET = '<svg class="tl-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  var SEAL = "M12 2l2.4 2.1 3.2-.2 1.1 3 2.7 1.8-.9 3.1.9 3.1-2.7 1.8-1.1 3-3.2-.2L12 22l-2.4-2.1-3.2.2-1.1-3-2.7-1.8.9-3.1-.9-3.1 2.7-1.8 1.1-3 3.2.2z";
  function badge(b) {
    if (b !== "blue" && b !== "gold") return "";
    return '<svg class="tl-bd" viewBox="0 0 24 24" role="img" aria-label="' + (b === "gold" ? "公式アカウント" : "認証済みアカウント") + '"><path d="' + SEAL + '" fill="' + (b === "gold" ? "#e6a817" : "#1d9bf0") + '"/><path d="M7.8 12.3l3 3 5.6-6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function b64(buf) { var x = "", a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) x += String.fromCharCode(a[i]); return btoa(x).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function rnd(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return b64(a); }
  function emit(n, d) { try { window.dispatchEvent(new CustomEvent(n, { detail: d })); } catch (e) {} }
  function strip() { try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {} }
  function clearUser() { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} }
  function saveUser(u) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(u)); } catch (e) {} }
  function cached() {
    try { var u = JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); if (u && u.token && u.exp > Date.now()) return u; } catch (e) {}
    clearUser(); return null;
  }

  function start() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    var box = document.createElement("div");
    box.id = "tl";
    document.body.appendChild(box);
    function reveal() { requestAnimationFrame(function () { box.classList.add("show"); }); }
    if (!window.PageLoader || window.__plDone) reveal(); else window.addEventListener("pl:done", reveal);   // ローディングが終わってから、ふわっと表示

    /* ---------- 表示 ---------- */
    function btnHtml(label) {
      return '<button class="tl-btn" id="tlLogin" type="button">' + I_LOGIN + '<span class="tl-label">' + esc(label) + '</span>' +
        '<span class="tl-dots"><i></i><i></i><i></i></span><i class="tl-bar"></i></button>';
    }
    function renderBusy() {
      box.classList.remove("open");
      box.innerHTML = btnHtml("接続中");
      box.querySelector("#tlLogin").classList.add("busy");
    }
    function renderLoggedOut() {
      box.classList.remove("open");
      box.innerHTML = btnHtml(LABEL);
      var btn = box.querySelector("#tlLogin"), label = btn.querySelector(".tl-label");
      function fail() {
        btn.classList.remove("busy"); btn.classList.add("fail"); label.textContent = "つながりません";
        setTimeout(function () { btn.classList.remove("fail"); label.textContent = LABEL; }, 2500);
      }
      btn.addEventListener("click", function () {
        btn.classList.remove("fail"); btn.classList.add("busy"); label.textContent = "接続中";
        try { localStorage.removeItem("tuna_noauto"); } catch (e) {}
        go(false, fail);
      });
    }
    // tunaアカウントの画面へ移動します。silent=true のときは、画面を出さずに(公式サービスだけ)ログインします
    function go(silent, fail) {
      var v = rnd(48), s = rnd(16);
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)).then(function (d) {
        try { sessionStorage.setItem(PKCE_KEY, JSON.stringify({ v: v, s: s })); } catch (e) {}
        var q = { response_type: "code", client_id: CLIENT_ID, redirect_uri: REDIRECT, scope: SCOPE, state: s, code_challenge: b64(d), code_challenge_method: "S256" };
        if (silent) q.prompt = "none";
        location.href = ACCOUNT + "/oauth/authorize?" + new URLSearchParams(q);
      }).catch(function () { if (fail) fail(); });
    }
    function autoLogin() {
      if (!AUTO || cached()) return;
      try {
        if (sessionStorage.getItem("tuna_auto") || localStorage.getItem("tuna_noauto")) return;   // 1回だけ試す / ログアウトした直後は試さない
        sessionStorage.setItem("tuna_auto", "1");
      } catch (e) { return; }
      go(true, null);
    }
    function renderLoggedIn(user) {
      var name = user.name || user.tunaid || "ユーザー";
      var pic = user.picture && user.picture.indexOf(ACCOUNT + "/") === 0 ? user.picture : ACCOUNT + "/default-icon.png";
      box.innerHTML =
        '<button class="tl-btn user" id="tlUser" type="button" aria-haspopup="true" aria-expanded="false">' +
          '<img class="tl-av" alt="" src="' + esc(pic) + '">' +
          '<span class="tl-name">' + esc(name) + ' さん</span>' + badge(user.badge) + I_CARET +
        '</button>' +
        '<div class="tl-menu" role="menu">' +
          '<div class="tl-id">@' + esc(user.tunaid || "") + badge(user.badge) + '</div>' +
          '<a class="tl-item" role="menuitem" href="' + ACCOUNT + '/me" data-no-transition>' + I_USER + 'マイページ</a>' +
          '<a class="tl-item" role="menuitem" href="' + ACCOUNT + '/settings" data-no-transition>' + I_SET + 'アカウント設定</a>' +
          '<button class="tl-item out" role="menuitem" id="tlLogout" type="button">' + I_OUT + 'ログアウト</button>' +
        '</div>';
      var toggle = box.querySelector("#tlUser");
      function setOpen(v) { box.classList.toggle("open", v); toggle.setAttribute("aria-expanded", v ? "true" : "false"); }
      toggle.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!box.classList.contains("open")); });
      document.addEventListener("click", function (e) { if (!box.contains(e.target)) setOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
      box.querySelector("#tlLogout").addEventListener("click", function () {
        clearUser(); emit("tuna:logout");
        try { localStorage.setItem("tuna_noauto", "1"); } catch (e) {}
        // tunaアカウント側へ知らせます(管理画面で「連動ログアウト」を許可したサイトなら、全サイトからログアウトされます)
        location.href = ACCOUNT + "/oauth/logout?" + new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: REDIRECT, state: rnd(8) });
      });
    }

    /* ---------- ログインから戻ったとき ---------- */
    function finish() {
      var q = new URLSearchParams(location.search);
      if (q.get("logout") === "1") { clearUser(); strip(); return Promise.resolve(false); }
      var code = q.get("code"), s = q.get("state");
      if (!code && !q.get("error")) return Promise.resolve(false);
      var sv = null;
      try { sv = JSON.parse(sessionStorage.getItem(PKCE_KEY) || "null"); } catch (e) {}
      if (!sv || sv.s !== s) return Promise.resolve(false);
      try { sessionStorage.removeItem(PKCE_KEY); } catch (e) {}
      strip();
      if (!code) return Promise.resolve(false);            // 「キャンセル」されたとき
      renderBusy();
      var tk = null;
      return fetch(ACCOUNT + "/oauth/token", {
        method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "authorization_code", code: code, redirect_uri: REDIRECT, client_id: CLIENT_ID, code_verifier: sv.v })
      }).then(function (r) { return r.json(); }).then(function (t) {
        if (!t.access_token) throw 0;
        tk = t.access_token;
        return fetch(ACCOUNT + "/oauth/userinfo", { headers: { authorization: "Bearer " + tk } });
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j.sub) throw 0;
        var u = { tunaid: j.sub, name: j.name, picture: j.picture || null, badge: j.badge || null, email: j.email || null, token: tk, exp: Date.now() + 3500 * 1000 };
        saveUser(u); emit("tuna:login", u); return true;
      }).catch(function () { return false; });
    }

    /* ---------- ログイン状態の確認(連携の解除・連動ログアウトを反映) ---------- */
    function validate() {
      var u = cached();
      if (!u) return;
      fetch(ACCOUNT + "/oauth/userinfo", { headers: { authorization: "Bearer " + u.token } }).then(function (r) {
        if (r.status === 401) { clearUser(); renderLoggedOut(); emit("tuna:logout"); return; }
        return r.json().then(function (j) {
          if (j && j.sub && (j.name !== u.name || (j.picture || null) !== u.picture || (j.badge || null) !== u.badge)) {
            u.name = j.name; u.picture = j.picture || null; u.badge = j.badge || null;
            saveUser(u); renderLoggedIn(u);
          }
        });
      }).catch(function () { /* 通信できないときは、そのまま */ });
    }

    /* ---------- 起動 ---------- */
    var c = cached();
    if (c) { renderLoggedIn(c); emit("tuna:login", c); } else renderLoggedOut();
    finish().then(function (done) {
      var u = cached();
      if (done && u) renderLoggedIn(u); else if (!u) renderLoggedOut();
      if (!u) autoLogin();
    });
    validate();
    setInterval(validate, CHECK_MS);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) validate(); });
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
