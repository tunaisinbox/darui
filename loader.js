/* loader.js — かわいいローディング(ロゴ + リング)/ 初回 + ページ遷移
   <head> 内で同期読み込みしてください: <script src="loader.js"></script> */
(function () {
  var LOGO = window.PL_LOGO || "https://files.catbox.moe/lzbie4.png";
  var CIRC = 2 * Math.PI * 70; // リングの円周

  var seen = false;
  try { seen = sessionStorage.getItem("pl_seen") === "1"; } catch (e) {}

  // ---------- CSS ----------
  var css = [
    "html.pl-lock,html.pl-lock body{overflow:hidden!important}",
    "#pl{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;",
    "background:linear-gradient(160deg,#fff0f7 0%,#eef3ff 100%);clip-path:circle(150% at 50% 50%);cursor:default;",
    "font-family:'Hiragino Maru Gothic ProN','Arial Rounded MT Bold','Yu Gothic UI','Hiragino Kaku Gothic ProN',sans-serif}",
    "#pl::before{content:'';position:absolute;inset:-30px;background-image:radial-gradient(rgba(255,255,255,.85) 3px,transparent 3px);background-size:30px 30px;animation:plDots 8s linear infinite}",
    "@keyframes plDots{to{transform:translate(30px,30px)}}",
    "#pl.hidden{display:none}",
    "#pl.out{clip-path:circle(0% at 50% 50%);transition:clip-path .75s cubic-bezier(.65,0,.35,1);pointer-events:none}",
    "#pl.leaving{animation:plCover .5s cubic-bezier(.65,0,.35,1) forwards}",
    "@keyframes plCover{from{clip-path:circle(0% at 50% 50%)}to{clip-path:circle(150% at 50% 50%)}}",
    "#pl .pl-center{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;transition:opacity .3s}",
    "#pl.out .pl-center{opacity:0}",

    /* ふわふわ飛ぶ飾り */
    "#pl .pl-fl{position:absolute;bottom:0;z-index:1;pointer-events:none;opacity:0;animation:plFloat linear infinite}",
    "@keyframes plFloat{0%{transform:translateY(0) rotate(0);opacity:0}10%{opacity:.85}90%{opacity:.85}100%{transform:translateY(-110vh) rotate(360deg);opacity:0}}",

    /* ロゴ + リング */
    "#pl .pl-wrap{position:relative;width:170px;height:170px;display:grid;place-items:center}",
    "#pl .pl-ring{position:absolute;inset:5px}",
    "#pl .pl-ring svg{width:100%;height:100%;transform:rotate(-90deg);overflow:visible}",
    "#pl.leaving .pl-ring{animation:plSpin 1s linear infinite}",
    "@keyframes plSpin{to{transform:rotate(360deg)}}",
    "#pl .pl-track{fill:none;stroke:rgba(255,173,207,.25);stroke-width:7}",
    "#pl .pl-bar{fill:none;stroke:url(#plg);stroke-width:7;stroke-linecap:round;filter:drop-shadow(0 0 5px rgba(255,150,190,.6))}",
    "#pl .pl-orbit{position:absolute;inset:0;animation:plSpin 5s linear infinite}",
    "#pl .pl-orbit i{position:absolute;font-style:normal;font-size:16px;line-height:1;animation:plTwinkle 1.4s ease-in-out infinite}",
    "#pl .pl-orbit i:nth-child(1){top:-6px;left:50%;margin-left:-8px;color:#ff9fc6}",
    "#pl .pl-orbit i:nth-child(2){bottom:14px;right:6px;color:#8fb6f5;animation-delay:.4s}",
    "#pl .pl-orbit i:nth-child(3){bottom:14px;left:6px;color:#ffc98a;animation-delay:.8s}",
    "@keyframes plTwinkle{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.6);opacity:.6}}",
    "#pl .pl-bob{animation:plBob 1.3s ease-in-out infinite;transform-origin:50% 100%}",
    "@keyframes plBob{0%,100%{transform:translateY(0) scale(1.04,.96)}50%{transform:translateY(-7px) scale(.97,1.03)}}",
    "#pl .pl-logo{display:block;width:104px;height:104px;border-radius:50%;object-fit:cover;border:4px solid #fff;",
    "box-shadow:0 8px 22px rgba(255,150,190,.4);transform:scale(0);opacity:0;",
    "animation:plPop .6s cubic-bezier(.175,.885,.32,1.4) .1s forwards;-webkit-user-drag:none;background:#fff}",
    "#pl.short .pl-logo{animation-duration:.3s;animation-delay:0s}",
    "@keyframes plPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:1}}",

    /* テキスト */
    "#pl .pl-label{margin-top:24px;font-size:19px;font-weight:700;letter-spacing:.08em;color:#ff8fb8;display:flex}",
    "#pl .pl-label span{display:inline-block;animation:plWave 1.2s ease-in-out infinite}",
    "@keyframes plWave{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}",
    "#pl .pl-pct{margin-top:6px;font-size:14px;font-weight:700;letter-spacing:.1em;color:#86aaf0;font-variant-numeric:tabular-nums}",
    "#pl.leaving .pl-pct{display:none}",

    /* ページ移動の黒フェード */
    "#plf{position:fixed;inset:0;z-index:2147483600;background:#000;opacity:0;pointer-events:none;transition:opacity .4s ease}",
    "#plf.on{opacity:1;pointer-events:auto}"
  ].join("");
  var style = document.createElement("style");
  style.textContent = css;
  document.documentElement.appendChild(style);

  // ---------- DOM ----------
  var el = document.createElement("div");
  el.id = "pl";
  el.className = seen ? "short" : "";
  el.innerHTML =
    '<div class="pl-center">' +
      '<div class="pl-wrap">' +
        '<div class="pl-ring"><svg viewBox="0 0 160 160">' +
          '<defs><linearGradient id="plg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9fc6"/><stop offset="1" stop-color="#8fb6f5"/></linearGradient></defs>' +
          '<circle class="pl-track" cx="80" cy="80" r="70"/>' +
          '<circle class="pl-bar" cx="80" cy="80" r="70" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/>' +
        '</svg></div>' +
        '<div class="pl-orbit"><i>♥</i><i>★</i><i>✦</i></div>' +
        '<div class="pl-bob"><img class="pl-logo" alt="" draggable="false"></div>' +
      '</div>' +
      '<div class="pl-label"></div>' +
      '<div class="pl-pct">0%</div>' +
    '</div>';

  var logo = el.querySelector(".pl-logo");

  // 「Loading...」を1文字ずつ跳ねさせる
  var label = el.querySelector(".pl-label");
  "Loading...".split("").forEach(function (ch, i) {
    var s = document.createElement("span");
    s.textContent = ch;
    s.style.animationDelay = (i * 0.08) + "s";
    label.appendChild(s);
  });

  // ふわふわ飾り
  var chars = ["♥", "★", "✦", "♡", "✿", "♪"];
  var colors = ["#ffb3d1", "#b9d4ff", "#ffd9a8", "#d4c2ff", "#bff0d4"];
  for (var i = 0; i < 12; i++) {
    var f = document.createElement("span");
    f.className = "pl-fl";
    f.textContent = chars[i % chars.length];
    f.style.left = (4 + Math.random() * 92) + "%";
    f.style.fontSize = (14 + Math.random() * 18) + "px";
    f.style.color = colors[i % colors.length];
    f.style.animationDuration = (5 + Math.random() * 5) + "s";
    f.style.animationDelay = (-Math.random() * 8) + "s";
    el.insertBefore(f, el.firstChild);
  }

  document.documentElement.appendChild(el);
  document.documentElement.classList.add("pl-lock");

  // 黒フェード(ページ移動で暗くなり、次のページでは暗い状態から明るくなる)
  var plf = document.createElement("div");
  plf.id = "plf";
  var cameFromFade = false;
  try {
    var ts = Number(sessionStorage.getItem("pl_fade"));
    sessionStorage.removeItem("pl_fade");
    cameFromFade = ts > 0 && (Date.now() - ts) < 10000;
  } catch (e) {}
  if (cameFromFade) {
    plf.style.transition = "none";
    plf.className = "on";
  }
  document.documentElement.appendChild(plf);
  if (cameFromFade) {
    setTimeout(function () {
      plf.style.transition = "";
      plf.className = "";
    }, 60);
  }

  var bar = el.querySelector(".pl-bar");
  var pct = el.querySelector(".pl-pct");

  // ---------- 準備完了の判定 ----------
  // window の load(動画や遅い画像まで待つ)には頼らず、
  // 「HTMLの解析完了 + ロゴ表示」だけを待つ。最長でも MAX_WAIT で必ず進む。
  var domOk = false, logoOk = false, forced = false;
  function isReady() { return forced || (domOk && logoOk); }

  if (document.readyState !== "loading") domOk = true;
  else document.addEventListener("DOMContentLoaded", function () { domOk = true; });

  function logoDone() { logoOk = true; }
  logo.onload = logoDone;
  logo.onerror = logoDone;
  logo.src = LOGO;
  if (logo.complete) logoOk = true;

  var MAX_WAIT = seen ? 2000 : 3400; // 初回は最大でも約4秒(+仕上げの動き)で終わる
  setTimeout(function () { forced = true; }, MAX_WAIT);

  // ---------- 進行 ----------
  // 時間ベースでなめらかに動かす(フレームレートに依存しない)
  var p = 0, done = false, leaving = false;
  var t0 = performance.now();
  var last = t0;
  var minMs = seen ? 600 : 1600;       // 最低これだけは見せる
  var creep = seen ? 500 : 1500;       // 待っている間のゆっくり進む速さ

  function draw() {
    bar.style.strokeDashoffset = CIRC * (1 - p / 100);
    pct.textContent = Math.round(p) + "%";
  }

  function frame(now) {
    if (done || leaving) return;
    var t = Math.max(0, now - t0);
    var dt = Math.min(Math.max(0, now - last), 100);
    last = now;
    var target, tau;
    if (isReady() && t >= minMs) {
      target = 100; tau = 140;                              // 準備できたら一気に、でもなめらかに
    } else {
      target = 96 * (1 - Math.exp(-t / creep)); tau = 220;  // 待機中はじわじわ
    }
    p += (target - p) * (1 - Math.exp(-dt / tau));
    if (target === 100 && p > 99.5) p = 100;
    draw();
    if (p >= 100) return finish();
    requestAnimationFrame(frame);
  }

  // ロードが終わったら、画面が黒くフェード → 黒が消えてページが現れる
  // (window.PL_END = "circle" にすると、前の円で閉じる演出に戻せます)
  function finish() {
    done = true;
    try { sessionStorage.setItem("pl_seen", "1"); } catch (e) {}
    function complete() {
      el.classList.add("hidden");
      document.documentElement.classList.remove("pl-lock");
      window.__plDone = true;
      window.dispatchEvent(new Event("pl:done"));
    }
    if (window.PL_END === "circle") {
      el.classList.add("out");
      setTimeout(complete, 800);
      return;
    }
    plf.classList.add("on");
    setTimeout(function () {
      complete();
      plf.classList.remove("on");
    }, 440);
  }

  requestAnimationFrame(frame);

  // ---------- ページ遷移 ----------
  // window.PL_LEAVE = "pastel" にすると、前のパステルの幕に戻せます(既定は黒フェード)
  function leave(url) {
    if (leaving) return;
    leaving = true;
    if ((window.PL_LEAVE || "black") === "black") {
      try { sessionStorage.setItem("pl_fade", String(Date.now())); } catch (e) {}
      plf.classList.add("on");
      setTimeout(function () { location.href = url; }, 420);
      return;
    }
    document.documentElement.classList.add("pl-lock");
    bar.style.strokeDasharray = (CIRC * 0.25) + " " + CIRC;
    bar.style.strokeDashoffset = 0;
    el.className = "leaving";
    setTimeout(function () { location.href = url; }, 600);
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;
    if (a.hasAttribute("data-no-transition")) return;
    var u;
    try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (["http:", "https:", "file:"].indexOf(u.protocol) < 0) return;
    // 同じページ内のハッシュ移動は対象外
    if (u.origin === location.origin && u.pathname === location.pathname && u.search === location.search && u.hash) return;
    e.preventDefault();
    leave(u.href);
  }, true);

  // 戻るボタン(bfcache)で戻った時にカバーが残らないように
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      leaving = false;
      plf.className = "";
      el.className = "hidden";
      document.documentElement.classList.remove("pl-lock");
    }
  });

  window.PageLoader = { go: leave };
})();
