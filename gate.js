/* gate.js — アクセス時のセキュリティチェック(reCAPTCHA v2 チェックボックス)
   ローディングの途中で止まり、ローディングと同じデザインで「ロボット認証が必要です」と表示します。
   config.js の SITE_CONFIG.recaptcha を使います。
     siteKey    : サイトキー(公開してOK)
     verifyUrl  : サーバー確認用URL(recaptcha-worker.js のURL)。空だと確認はブラウザ側だけ
     ttlMinutes : 一度通過してから、再確認までの時間(分)
   ※ シークレットキーは絶対にこのファイルや config.js に書かないでください。 */
(function () {
  var KEY = "rc_pass";
  var root = document.documentElement;

  function cfgOf() {
    try { return (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.recaptcha) || null; } catch (e) { return null; }
  }
  function passed(ttl) {
    try {
      var t = Number(localStorage.getItem(KEY));
      return t > 0 && (Date.now() - t) < ttl * 60000;
    } catch (e) { return false; }
  }
  function mark() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }

  var css = [
    /* カーソルを非表示にするサイト全体の設定より優先して、通常のカーソルを出す */
    "html.gate-wait,html.gate-wait *,html.gate-lock,html.gate-lock *{cursor:auto!important}",
    "html.gate-wait button,html.gate-lock button{cursor:pointer!important}",
    "html.gate-wait #custom-cursor,html.gate-lock #custom-cursor{display:none!important}",

    /* ポップアップ(ローディングと同じパステル) */
    ".pl-gate{position:fixed;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:16px;",
    "background:rgba(255,235,246,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);",
    "font-family:'Hiragino Maru Gothic ProN','Arial Rounded MT Bold','Yu Gothic UI','Hiragino Kaku Gothic ProN',sans-serif;",
    "opacity:0;transition:opacity .4s ease;pointer-events:none}",
    ".pl-gate.on{opacity:1;pointer-events:auto}",
    ".gt-card{width:100%;max-width:352px;padding:22px 18px 18px;text-align:center;background:#fff;border:3px solid #ffc2dc;",
    "border-radius:26px;box-shadow:0 12px 36px rgba(255,130,180,.35);transform:scale(.6) translateY(24px);opacity:0;",
    "transition:transform .55s cubic-bezier(.175,.885,.32,1.4),opacity .3s ease}",
    ".pl-gate.on .gt-card{transform:none;opacity:1}",
    ".gt-title{font-size:17px;font-weight:700;letter-spacing:.06em;color:#ff8fb8}",
    ".gt-title i{font-style:normal;display:inline-block;animation:gtBob 1.6s ease-in-out infinite}",
    "@keyframes gtBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}",
    ".gt-sub{margin:6px 0 14px;font-size:12px;line-height:1.7;color:#86aaf0}",
    ".gt-box{display:flex;justify-content:center;min-height:78px}",
    ".gt-msg{margin-top:10px;min-height:1.2em;font-size:12px;line-height:1.6;color:#ff6f9c}",
    ".gt-msg.info{color:#86aaf0}",
    ".gt-btn{margin-top:8px;padding:8px 18px;border:0;border-radius:99px;font-weight:700;color:#fff;",
    "background:linear-gradient(90deg,#ffb3d1,#b9d4ff)}",
    ".gt-box>*{flex-shrink:0}",
    "@media (max-width:350px){.gt-box{transform:scale(.85);transform-origin:center top}.gt-card{padding:20px 10px 14px}}",

    /* ローディングが使えないときの予備(単独で出す) */
    "html.gate-lock,html.gate-lock body{overflow:hidden!important}",
    "#gate{z-index:1999999500;background:linear-gradient(160deg,#fff0f7,#eef3ff)}"
  ].join("");

  function addStyle() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
  }

  // 認証パネルの中身(タイトル・説明・ウィジェット・メッセージ)
  function panelHTML() {
    return '<div class="gt-card">' +
             '<div class="gt-title"><i>♥</i> ロボット認証が必要です <i>♥</i></div>' +
             '<div class="gt-sub">ロボットではないことを確認させてね</div>' +
             '<div class="gt-box"></div>' +
             '<div class="gt-msg"></div>' +
           '</div>';
  }

  // reCAPTCHA を読み込んで panel の中に表示し、通過したら onPass を呼ぶ
  function mountWidget(cfg, panel, onPass) {
    var box = panel.querySelector(".gt-box");
    var msg = panel.querySelector(".gt-msg");
    var widgetId = null;
    function say(t, info) { msg.textContent = t || ""; msg.className = "gt-msg" + (info ? " info" : ""); }
    function retry(t) { say(t); try { if (widgetId !== null) grecaptcha.reset(widgetId); } catch (e) {} }

    function onToken(token) {
      if (!cfg.verifyUrl) return onPass(); // サーバー確認なし(ブラウザ側のみ)
      say("確認しています…", true);
      fetch(cfg.verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token })
      })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.success) onPass(); else retry("確認に失敗したよ。もう一度チェックしてね。"); })
        .catch(function () { retry("確認サーバーにつながらなかったよ。少し待ってもう一度お試しください。"); });
    }

    window.__gateRcLoaded = function () {
      say("");
      try {
        widgetId = grecaptcha.render(box, {
          sitekey: cfg.siteKey,
          theme: "light",
          callback: onToken,
          "expired-callback": function () { say("有効期限が切れたよ。もう一度チェックしてね。"); },
          "error-callback": function () { say(""); }
        });
      } catch (e) { say("セキュリティチェックを表示できませんでした。"); }
    };

    say("読み込み中…", true);
    var s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?onload=__gateRcLoaded&render=explicit&hl=ja";
    s.async = true;
    s.onerror = function () {
      say("セキュリティチェックを読み込めませんでした。通信状況や拡張機能(広告ブロック等)を確認してね。");
      if (!panel.querySelector(".gt-btn")) {
        var b = document.createElement("button");
        b.className = "gt-btn";
        b.textContent = "再読み込み";
        b.addEventListener("click", function () { location.reload(); });
        panel.querySelector(".gt-card").appendChild(b);
      }
    };
    document.head.appendChild(s);
  }

  // ローディングの途中で止めて、ポップアップで認証を出す
  function buildInLoader(cfg, PL) {
    PL.hold(70);
    root.classList.add("gate-wait");

    var panel = document.createElement("div");
    panel.className = "pl-gate";
    panel.innerHTML = panelHTML();
    PL.root().appendChild(panel);

    // ローディングが半分くらい進んだところで、ポンッと出す
    var timer = setInterval(function () {
      if (PL.progress() >= 40) { panel.classList.add("on"); clearInterval(timer); }
    }, 80);

    mountWidget(cfg, panel, function () {
      clearInterval(timer);
      mark();
      window.__gatePassed = true;
      panel.classList.remove("on");                  // ポップアップが縮んで消える
      root.classList.remove("gate-wait");
      PL.release();                                  // 残りのローディングを再開
      setTimeout(function () { panel.remove(); }, 700);
      window.dispatchEvent(new Event("gate:pass"));
    });
  }

  // ローディングが無い場合の予備
  function buildStandalone(cfg) {
    var el = document.createElement("div");
    el.id = "gate";
    el.className = "pl-gate";
    el.innerHTML = panelHTML();
    document.body.appendChild(el);
    root.classList.add("gate-lock");
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("on"); }); });
    mountWidget(cfg, el, function () {
      mark();
      window.__gatePassed = true;
      el.classList.remove("on");
      root.classList.remove("gate-lock");
      setTimeout(function () { el.remove(); }, 700);
      window.dispatchEvent(new Event("gate:pass"));
    });
  }

  // スマホなどで、reCAPTCHAの画像選択の画面が画面外にはみ出さないよう、
  // 画面の中央に固定して、必要なら縮小して収める(吹き出しの矢印は隠す)
  function watchChallenge() {
    function fit() {
      var frames = document.querySelectorAll('iframe[src*="recaptcha/api2/bframe"],iframe[src*="recaptcha/enterprise/bframe"]');
      if (!frames.length) return;
      Array.prototype.forEach.call(frames, function (f) {
        var box = f.parentElement, outer = box && box.parentElement;
        if (!box || !outer) return;
        var vw = window.innerWidth, vh = window.innerHeight;
        var w = box.offsetWidth || 400, h = box.offsetHeight || 580;
        var s = Math.min(1, (vw - 16) / w, (vh - 16) / h);
        var want = "translate(-50%, -50%) scale(" + s.toFixed(3) + ")";
        var st = box.style;
        if (st.getPropertyValue("position") !== "fixed" || st.transform !== want ||
            st.getPropertyValue("left") !== "50%" || st.getPropertyValue("top") !== "50%") {
          st.setProperty("position", "fixed", "important");
          st.setProperty("left", "50%", "important");
          st.setProperty("top", "50%", "important");
          st.setProperty("right", "auto", "important");
          st.setProperty("bottom", "auto", "important");
          st.setProperty("margin", "0", "important");
          st.setProperty("transform", want, "important");
          st.setProperty("transform-origin", "center center", "important");
        }
        Array.prototype.forEach.call(outer.children, function (c) {
          if (c === box) return;
          var cs = getComputedStyle(c);
          if (cs.position === "fixed" && c.offsetWidth >= vw * 0.9) return; // 背景の薄い幕は残す
          if (c.style.getPropertyValue("display") !== "none") c.style.setProperty("display", "none", "important");
        });
      });
    }
    new MutationObserver(fit).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
  }

  function init() {
    var cfg = cfgOf();
    if (!cfg || !cfg.siteKey) return;
    if (passed(cfg.ttlMinutes || 60)) { window.__gatePassed = true; return; }
    addStyle();
    watchChallenge();
    var PL = window.PageLoader;
    if (PL && PL.hold && PL.root && PL.root() && document.getElementById("pl") && !document.getElementById("pl").classList.contains("hidden")) {
      buildInLoader(cfg, PL);
    } else {
      buildStandalone(cfg);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
