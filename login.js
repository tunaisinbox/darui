/* login.js — tunaアカウントのログインボタン(画面の右上)
   index.html の config.js の下に、次の1行を足すだけで動きます:
     <script>document.write('<script src="login.js?v=' + Date.now() + '"><\/script>');</script>
   ・未ログイン  : 「ログイン」ボタン
   ・ログイン後  : アイコン + 名前 → 押すと「マイページ」「ログアウト」のメニュー */
(function () {
  var CLIENT_ID = "client_id: tuna_b38ce56b02e68aa355c0";  // この形のまま(先頭の "client_id: " も含めて登録されているID)
  var REDIRECT  = "https://tunaisinbox.f5.si/";          // 登録したものと同じ
  var SDK_URL   = "https://account.tunaisinbox.workers.dev/sdk.js";
  var ME_URL    = "https://account.tunaisinbox.workers.dev/me";
  var SCOPE     = "profile";
  var CACHE_KEY = "tuna_user";

  // ---------- CSS(ハンバーガーボタンと同じガラス風 + 淡いグラデ) ----------
  var css = [
    "#tl{position:fixed;top:20px;right:20px;z-index:1000;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN','Hiragino Sans',Meiryo,sans-serif;",
    "opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .5s ease,transform .5s cubic-bezier(.2,.8,.2,1)}",
    "#tl.show{opacity:1;transform:none;pointer-events:auto}",

    /* ボタン本体 */
    "#tl .tl-btn{position:relative;display:flex;align-items:center;gap:9px;height:48px;padding:0 20px 0 14px;border-radius:14px;",
    "color:#fff;font-size:.95rem;font-weight:700;letter-spacing:.08em;white-space:nowrap;",
    "background:rgba(255,255,255,.15);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
    "border:1px solid rgba(255,255,255,.22);overflow:hidden;isolation:isolate;",
    "transition:transform .25s cubic-bezier(.2,.8,.2,1),background .25s,box-shadow .25s,border-color .25s}",
    /* ホバーで広がるグラデ */
    "#tl .tl-btn::before{content:'';position:absolute;inset:0;z-index:-1;opacity:0;",
    "background:linear-gradient(120deg,rgba(195,217,240,.55),rgba(255,179,209,.5),rgba(185,212,255,.55));background-size:200% 100%;",
    "transition:opacity .3s;animation:tlFlow 4s linear infinite}",
    "@keyframes tlFlow{to{background-position:200% 0}}",
    /* 光がスッと走る */
    "#tl .tl-btn::after{content:'';position:absolute;top:0;bottom:0;left:-60%;width:40%;z-index:-1;",
    "background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);transition:left .6s ease}",
    "#tl .tl-btn:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.55);box-shadow:0 8px 22px rgba(120,160,230,.35),0 0 14px rgba(226,236,247,.35)}",
    "#tl .tl-btn:hover::before{opacity:1}",
    "#tl .tl-btn:hover::after{left:130%}",
    "#tl .tl-btn:active{transform:translateY(0) scale(.96)}",
    "#tl .tl-btn:focus-visible{outline:2px solid #c3d9f0;outline-offset:3px}",

    /* アイコン */
    "#tl .tl-ico{width:22px;height:22px;flex:none;transition:transform .35s cubic-bezier(.175,.885,.32,1.4)}",
    "#tl .tl-btn:hover .tl-ico{transform:translateX(3px) scale(1.1)}",

    /* 処理中 */
    "#tl .tl-btn.busy{pointer-events:none;opacity:.85}",
    "#tl .tl-btn.busy .tl-ico{animation:tlSpin .8s linear infinite}",
    "@keyframes tlSpin{to{transform:rotate(360deg)}}",
    "#tl .tl-btn:disabled{opacity:.5}",

    /* ログイン後: アバター */
    "#tl .tl-btn.user{padding:0 16px 0 7px}",
    "#tl .tl-av{width:34px;height:34px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:.95rem;font-weight:800;color:#2b3350;",
    "background:linear-gradient(135deg,#ffc2dc,#b9d4ff);box-shadow:0 2px 8px rgba(0,0,0,.25)}",
    "#tl .tl-name{max-width:120px;overflow:hidden;text-overflow:ellipsis;letter-spacing:.04em}",
    "#tl .tl-caret{width:14px;height:14px;flex:none;opacity:.8;transition:transform .3s}",
    "#tl.open .tl-caret{transform:rotate(180deg)}",

    /* ドロップダウン */
    "#tl .tl-menu{position:absolute;top:58px;right:0;min-width:190px;padding:8px;border-radius:16px;",
    "background:rgba(20,20,32,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);",
    "border:1px solid rgba(255,255,255,.18);box-shadow:0 14px 34px rgba(0,0,0,.45);",
    "opacity:0;transform:translateY(-6px) scale(.96);transform-origin:top right;pointer-events:none;",
    "transition:opacity .2s ease,transform .3s cubic-bezier(.175,.885,.32,1.3)}",
    "#tl.open .tl-menu{opacity:1;transform:none;pointer-events:auto}",
    "#tl .tl-id{padding:8px 12px 10px;margin-bottom:6px;font-size:.72rem;color:#8a8a9e;border-bottom:1px solid rgba(255,255,255,.1);letter-spacing:.04em}",
    "#tl .tl-item{display:flex;align-items:center;gap:10px;width:100%;padding:11px 12px;border:0;border-radius:10px;background:none;",
    "color:#fff;font:inherit;font-size:.9rem;text-align:left;text-decoration:none;transition:background .2s,transform .2s}",
    "#tl .tl-item:hover{background:rgba(255,255,255,.12);transform:translateX(3px)}",
    "#tl .tl-item svg{width:18px;height:18px;flex:none}",
    "#tl .tl-item.out{color:#ff8fa3}",

    /* スマホ: 名前は隠してアイコンだけに */
    "@media (max-width:520px){#tl{top:16px;right:16px}#tl .tl-name{display:none}#tl .tl-btn.user{padding:0 12px 0 7px}}",
    "@media (prefers-reduced-motion:reduce){#tl *,#tl *::before,#tl *::after{animation:none!important;transition-duration:.01s!important}}"
  ].join("");
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  // ---------- アイコン ----------
  var I_LOGIN = '<svg class="tl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>';
  var I_USER  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  var I_OUT   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
  var I_CARET = '<svg class="tl-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

  // ---------- 土台 ----------
  var box = document.createElement("div");
  box.id = "tl";
  document.body.appendChild(box);

  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  // ローディング(+ロボット認証)が終わってから、ふわっと出す
  function reveal() { requestAnimationFrame(function () { box.classList.add("show"); }); }
  if (window.__plDone) reveal(); else window.addEventListener("pl:done", reveal);

  // ---------- SDK ----------
  var sdkReady = null;
  function loadSdk() {
    if (sdkReady) return sdkReady;
    sdkReady = new Promise(function (resolve, reject) {
      if (window.TunaAuth) return resolve();
      var s = document.createElement("script");
      s.src = SDK_URL;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("sdk")); };
      document.head.appendChild(s);
    }).then(function () {
      TunaAuth.init({ clientId: CLIENT_ID, redirectUri: REDIRECT });
    });
    return sdkReady;
  }

  function cached() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch (e) { return null; } }
  function saveUser(u) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ tunaid: u.tunaid, name: u.name })); } catch (e) {} }
  function clearUser() { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} }

  // ---------- 表示 ----------
  function renderLoggedOut() {
    box.classList.remove("open");
    box.innerHTML = '<button class="tl-btn" id="tlLogin" type="button">' + I_LOGIN + '<span>ログイン</span></button>';
    var btn = box.querySelector("#tlLogin");
    btn.addEventListener("click", function () {
      btn.classList.add("busy");
      loadSdk().then(function () {
        TunaAuth.login(SCOPE);                    // ここでログイン画面へ移動します
      }).catch(function () {
        btn.classList.remove("busy");
        btn.disabled = true;
        btn.querySelector("span").textContent = "つながりません";
        setTimeout(function () { btn.disabled = false; btn.querySelector("span").textContent = "ログイン"; }, 2500);
      });
    });
  }

  function renderLoggedIn(user) {
    var name = user.name || user.tunaid || "ユーザー";
    var initial = Array.from(name)[0] || "T";
    box.innerHTML =
      '<button class="tl-btn user" id="tlUser" type="button" aria-haspopup="true" aria-expanded="false">' +
        '<span class="tl-av">' + esc(initial) + '</span>' +
        '<span class="tl-name">' + esc(name) + ' さん</span>' + I_CARET +
      '</button>' +
      '<div class="tl-menu" role="menu">' +
        '<div class="tl-id">@' + esc(user.tunaid || "") + '</div>' +
        '<a class="tl-item" role="menuitem" href="' + ME_URL + '" data-no-transition>' + I_USER + 'マイページ</a>' +
        '<button class="tl-item out" role="menuitem" id="tlLogout" type="button">' + I_OUT + 'ログアウト</button>' +
      '</div>';

    var toggle = box.querySelector("#tlUser");
    function setOpen(v) { box.classList.toggle("open", v); toggle.setAttribute("aria-expanded", v ? "true" : "false"); }
    toggle.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!box.classList.contains("open")); });
    document.addEventListener("click", function (e) { if (!box.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

    box.querySelector("#tlLogout").addEventListener("click", function () {
      clearUser();
      loadSdk().then(function () {
        if (window.TunaAuth && typeof TunaAuth.logout === "function") return TunaAuth.logout();
      }).catch(function () {}).then(function () {
        renderLoggedOut();
      });
    });
  }

  // ---------- 起動 ----------
  var hasReturn = /[?&#](code|state)=/.test(location.search + location.hash); // ログインから戻ってきた直後か
  var c = cached();
  if (c) renderLoggedIn(c); else renderLoggedOut();

  if (hasReturn || !c) {
    // 戻ってきた直後は必ず finish() で受け取る(普段の訪問でSDKを読み込まないよう、戻りがない時は何もしない)
    if (hasReturn) {
      loadSdk().then(function () { return TunaAuth.finish(); }).then(function (user) {
        if (user) { saveUser(user); renderLoggedIn(user); }
      }).catch(function () {});
    }
  }
})();
