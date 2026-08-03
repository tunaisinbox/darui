// script.js

let currentLang = 'ja';
let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let cursorTargetPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let activeInput = null;

// カーソルの素早く滑らかな移動ループ (Lerp補間)
function startCursorAnimation() {
  const cursor = document.getElementById("custom-cursor");
  if (!cursor) return;

  function render() {
    if (activeInput) {
      const rect = activeInput.getBoundingClientRect();
      const lockedY = rect.top + rect.height / 2;
      const snappedX = calculateNearestCharGapX(activeInput, mousePos.x, true);
      cursorTargetPos.x = snappedX;
      cursorTargetPos.y = lockedY;
    }

    mousePos.x += (cursorTargetPos.x - mousePos.x) * 0.25;
    mousePos.y += (cursorTargetPos.y - mousePos.y) * 0.25;

    cursor.style.left = `${mousePos.x}px`;
    cursor.style.top = `${mousePos.y}px`;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// カスタムカーソルとテキストボックス入力補助
function setupCustomCursor() {
  const isPC = window.matchMedia("(pointer: fine)").matches;
  if (!isPC) return;

  document.body.classList.add("is-pc");
  const cursor = document.getElementById("custom-cursor");

  startCursorAnimation();

  document.addEventListener("mousemove", (e) => {
    if (cursor.classList.contains("is-loading")) return;

    if (activeInput) {
      const rect = activeInput.getBoundingClientRect();
      const isInsideX = e.clientX >= rect.left && e.clientX <= rect.right;
      const isInsideY = e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (isInsideX && isInsideY) {
        cursor.classList.add("is-ibeam");
        return;
      } else {
        activeInput.blur();
        activeInput = null;
        cursor.classList.remove("is-ibeam");
      }
    }

    cursor.classList.remove("is-ibeam");
    cursorTargetPos.x = e.clientX;
    cursorTargetPos.y = e.clientY;
  });
}

// テキストボックス内の文字の隙間（X座標）をスナップ計算
function calculateNearestCharGapX(inputElem, currentMouseX, preferRight = false) {
  const val = inputElem.value;
  const rect = inputElem.getBoundingClientRect();

  if (!val) {
    return rect.left + rect.width / 2;
  }

  const style = window.getComputedStyle(inputElem);
  const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = font;

  const totalWidth = ctx.measureText(val).width;
  const startX = rect.left + (rect.width - totalWidth) / 2;

  let gapPositions = [startX];
  let accumulatedWidth = 0;

  for (let i = 0; i < val.length; i++) {
    const charWidth = ctx.measureText(val[i]).width;
    accumulatedWidth += charWidth;
    gapPositions.push(startX + accumulatedWidth);
  }

  if (preferRight) {
    const rightIndex = val.length;
    inputElem.setSelectionRange(rightIndex, rightIndex);
    return gapPositions[rightIndex];
  }

  let closestIndex = 0;
  let minDiff = Infinity;

  for (let i = 0; i < gapPositions.length; i++) {
    const diff = Math.abs(currentMouseX - gapPositions[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }

  inputElem.setSelectionRange(closestIndex, closestIndex);
  return gapPositions[closestIndex];
}

// カスタム入力イベント設定
function attachCustomInputEvents(inputElem) {
  const cursor = document.getElementById("custom-cursor");

  inputElem.addEventListener("focus", () => {
    activeInput = inputElem;
    cursor.classList.add("is-ibeam");

    const rect = inputElem.getBoundingClientRect();
    const lockedY = rect.top + rect.height / 2;
    const snappedX = calculateNearestCharGapX(inputElem, mousePos.x, true);

    cursorTargetPos.x = snappedX;
    cursorTargetPos.y = lockedY;
  });

  inputElem.addEventListener("blur", () => {
    if (activeInput === inputElem) {
      activeInput = null;
    }
    cursor.classList.remove("is-ibeam");
  });

  inputElem.addEventListener("input", () => {
    const rect = inputElem.getBoundingClientRect();
    const snappedX = calculateNearestCharGapX(inputElem, mousePos.x, true);
    const lockedY = rect.top + rect.height / 2;

    cursorTargetPos.x = snappedX;
    cursorTargetPos.y = lockedY;
  });

  inputElem.addEventListener("mousedown", (e) => {
    e.preventDefault();
    inputElem.focus();
  });
}

// トースト通知
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// SVGコード生成
function generateCodeSvg(codeText) {
  const width = Math.max(codeText.length * 11, 100);
  return `
    <svg width="${width}" height="24" viewBox="0 0 ${width} 24" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="18" fill="currentColor" font-family="monospace" font-size="16" font-weight="bold" letter-spacing="2">
        ${codeText}
      </text>
    </svg>
  `;
}

// スライドショー制御
const SlideManager = {
  timers: {},
  init(gameIndex, images) {
    if (!images || images.length === 0) return;
    this.startAutoSlide(gameIndex, images.length);
  },
  changeSlide(gameIndex, direction, totalCount) {
    const images = document.querySelectorAll(`.slide-img-${gameIndex}`);
    if (images.length === 0) return;

    let currentIndex = 0;
    images.forEach((img, idx) => {
      if (img.classList.contains("active")) currentIndex = idx;
      img.classList.remove("active");
    });

    let nextIndex = (currentIndex + direction + totalCount) % totalCount;
    images[nextIndex].classList.add("active");
    this.restartAutoSlide(gameIndex, totalCount);
  },
  startAutoSlide(gameIndex, totalCount) {
    if (totalCount <= 1) return;
    this.timers[gameIndex] = setInterval(() => {
      this.changeSlide(gameIndex, 1, totalCount);
    }, 3500);
  },
  restartAutoSlide(gameIndex, totalCount) {
    if (this.timers[gameIndex]) clearInterval(this.timers[gameIndex]);
    this.startAutoSlide(gameIndex, totalCount);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setupCustomCursor();

  const customCursor = document.getElementById("custom-cursor");
  const friendListElement = document.getElementById("friend-list");
  const searchInput = document.getElementById("search-input");
  const modal = document.getElementById("password-modal");
  const passwordInput = document.getElementById("modal-password-input");
  const homeLink = document.getElementById("home-link");
  const langToggleBtn = document.getElementById("lang-toggle-btn");
  const langBtnText = document.getElementById("lang-btn-text");

  let currentTargetIndex = null;

  attachCustomInputEvents(searchInput);
  attachCustomInputEvents(passwordInput);

  homeLink.href = Config.homeUrl;

  // ローディング中はカーソル非表示
  customCursor.classList.add("is-loading");

  // --- 初回ローディング処理 ---
  const firstLoadingScreen = document.getElementById("first-loading-screen");
  const whiteCover = document.getElementById("white-cover");
  const appLogoImg = document.getElementById("app-logo-img");
  const logoBox = document.getElementById("logo-box");
  const firstBarTrack = document.getElementById("first-bar-track");
  const firstBarFill = document.getElementById("first-bar-fill");

  appLogoImg.src = Config.appLogo;

  // 1. 真っ黒の背景でロゴがピョコッと拡大出現
  setTimeout(() => {
    logoBox.classList.add("pop-in");
  }, 200);

  // 2. 画面端からロゴに向かって白く全体を塗りつぶす
  setTimeout(() => {
    whiteCover.classList.add("shrink-in");
  }, 600);

  // 3. 白背景の上でプログレスバーが「にゅーっ」と1.5秒伸びる
  setTimeout(() => {
    firstBarTrack.classList.add("show");
    setTimeout(() => {
      firstBarFill.style.width = "100%";
    }, 50);
  }, 1100);

  // 4. ロード完了：追加の黒を挟まず、白カバーが外側へ消えて透過（フェードアウト）
  setTimeout(() => {
    firstLoadingScreen.classList.add("smooth-fade-out");

    setTimeout(() => {
      firstLoadingScreen.style.display = "none";
      customCursor.classList.remove("is-loading"); // カーソル再表示

      // 5. 吸い付くようなカードの配置アニメーション
      animateCardsIntoPlace();
    }, 800);
  }, 2700);


  // --- 検索Enter時のローディング演出 ---
  const searchLoadingScreen = document.getElementById("search-loading-screen");
  const searchIconAnim = document.getElementById("search-icon-anim");
  const searchBarTrack = document.getElementById("search-bar-track");
  const searchBarFill = document.getElementById("search-bar-fill");

  function triggerSearchLoading(filterText) {
    customCursor.classList.add("is-loading");
    searchLoadingScreen.classList.add("is-active");
    searchIconAnim.classList.add("pop-in");
    searchBarTrack.classList.remove("expand");
    searchBarFill.style.width = "0%";

    setTimeout(() => {
      searchIconAnim.style.display = "none";
      searchBarTrack.classList.add("expand");

      setTimeout(() => {
        searchBarFill.style.width = "100%";
      }, 100);
    }, 600);

    setTimeout(() => {
      renderList(filterText);
      animateCardsIntoPlace();

      searchLoadingScreen.classList.remove("is-active");
      customCursor.classList.remove("is-loading");
      
      setTimeout(() => {
        searchIconAnim.style.display = "block";
        searchIconAnim.classList.remove("pop-in");
        searchBarTrack.classList.remove("expand");
        searchBarFill.style.width = "0%";
      }, 400);
    }, 2200);
  }

  // 検索入力エリアで Enterキーを押した時に演出
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchInput.blur();
      triggerSearchLoading(searchInput.value);
    }
  });

  // カード配置アニメーションの発動
  function animateCardsIntoPlace() {
    const cards = document.querySelectorAll(".friend-item");
    cards.forEach((card, idx) => {
      card.classList.remove("place-anim");
      void card.offsetWidth; // リフロー強制
      setTimeout(() => {
        card.classList.add("place-anim");
      }, idx * 100);
    });
  }

  // UI言語更新
  function updateStaticUI() {
    const dict = Config.i18n[currentLang];
    document.getElementById("home-link").innerText = dict.homeBtn;
    document.getElementById("header-title").innerText = dict.title;
    searchInput.placeholder = dict.searchPlaceholder;
    document.getElementById("modal-title").innerText = dict.modalTitle;
    document.getElementById("modal-desc").innerText = dict.modalDesc;
    passwordInput.placeholder = dict.modalPassPlaceholder;
    document.getElementById("modal-cancel-btn").innerText = dict.modalCancel;
    document.getElementById("modal-submit-btn").innerText = dict.modalSubmit;
    langBtnText.innerText = currentLang === 'ja' ? 'English' : '日本語';
  }

  // フレンドリスト描画
  function renderList(filterText = "") {
    friendListElement.innerHTML = "";
    const dict = Config.i18n[currentLang];
    const query = filterText.toLowerCase();

    const filteredGames = Config.games.map((game, originalIndex) => ({ ...game, originalIndex })).filter(game => {
      const gameName = (game.name[currentLang] || game.name.ja || "").toLowerCase();
      const tags = game.tags[currentLang] || game.tags.ja || [];
      const matchName = gameName.includes(query);
      const matchTags = tags.some(tag => tag.toLowerCase().includes(query));
      return matchName || matchTags;
    });

    filteredGames.forEach((game) => {
      const li = document.createElement("li");
      li.className = "friend-item";

      const gameName = game.name[currentLang] || game.name.ja;
      const tags = game.tags[currentLang] || game.tags.ja || [];

      const playerIconHtml = game.playerIconOn ? `<img src="${game.playerIcon}" class="player-icon" alt="Player">` : "";
      const tagsHtml = tags.map(t => `<span class="tag-badge">#${t}</span>`).join("");

      const images = game.partyImages || [];
      const slidesHtml = images.map((imgUrl, imgIdx) => `
        <img src="${imgUrl}" class="slide-img slide-img-${game.originalIndex} ${imgIdx === 0 ? 'active' : ''}" alt="Thumbnail ${imgIdx + 1}">
      `).join("");

      const showArrow = images.length > 1;
      const arrowHtml = showArrow ? `
        <button class="slide-arrow prev" id="arrow-prev-${game.originalIndex}">‹</button>
        <button class="slide-arrow next" id="arrow-next-${game.originalIndex}">›</button>
      ` : "";

      const blurClass = game.isPrivate ? "is-blurred" : "";
      const copyButtonClass = game.isPrivate ? "action-btn btn-copy" : "action-btn btn-copy show";

      li.innerHTML = `
        <div class="item-primary">
          <div class="profile-zone">
            <img src="${game.gameIcon}" class="game-icon" alt="${gameName}">
            ${playerIconHtml}
            <div class="names-meta">
              <h2>${gameName}</h2>
              <div class="tag-group">${tagsHtml}</div>
            </div>
          </div>
        </div>

        <div class="tab-trigger-zone">
          <button class="btn-tab-toggle" id="btn-tab-${game.originalIndex}">
            ${dict.detailBtn} <span class="arrow">▼</span>
          </button>
        </div>

        <div class="detail-panel" id="panel-${game.originalIndex}">
          <div class="slideshow-container">
            ${slidesHtml}
            ${arrowHtml}
          </div>
          
          <div class="code-zone">
            <div class="svg-code-wrapper ${blurClass}" id="svg-wrapper-${game.originalIndex}">
              ${generateCodeSvg(game.code)}
              <span class="private-overlay-text">${dict.privateText}</span>
            </div>
            <div>
              ${game.isPrivate ? `<button class="action-btn btn-reveal" id="btn-reveal-${game.originalIndex}">${dict.revealBtnShow}</button>` : ""}
              <button class="${copyButtonClass}" id="btn-copy-${game.originalIndex}">${dict.copyBtn}</button>
            </div>
          </div>
        </div>
      `;
      friendListElement.appendChild(li);

      if (showArrow) {
        document.getElementById(`arrow-prev-${game.originalIndex}`).addEventListener("click", (e) => {
          e.stopPropagation();
          SlideManager.changeSlide(game.originalIndex, -1, images.length);
        });
        document.getElementById(`arrow-next-${game.originalIndex}`).addEventListener("click", (e) => {
          e.stopPropagation();
          SlideManager.changeSlide(game.originalIndex, 1, images.length);
        });
      }

      SlideManager.init(game.originalIndex, images);

      if (game.isPrivate) {
        document.getElementById(`btn-reveal-${game.originalIndex}`).addEventListener("click", () => {
          triggerReveal(game.originalIndex);
        });
      }

      document.getElementById(`btn-copy-${game.originalIndex}`).addEventListener("click", () => {
        executeCopy(game.code, game.isPrivate, game.originalIndex);
      });

      document.getElementById(`btn-tab-${game.originalIndex}`).addEventListener("click", () => {
        toggleTab(game.originalIndex);
      });
    });
  }

  // 言語切替
  langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === 'ja' ? 'en' : 'ja';
    updateStaticUI();
    renderList(searchInput.value);
    animateCardsIntoPlace();
  });

  // 表示・非表示の切り替え
  function triggerReveal(index) {
    const wrapper = document.getElementById(`svg-wrapper-${index}`);
    const revealBtn = document.getElementById(`btn-reveal-${index}`);
    const copyBtn = document.getElementById(`btn-copy-${index}`);
    const dict = Config.i18n[currentLang];

    if (!wrapper.classList.contains("is-blurred")) {
      wrapper.classList.add("is-blurred");
      revealBtn.innerText = dict.revealBtnShow;
      revealBtn.classList.remove("active");
      copyBtn.classList.remove("show");
      return;
    }

    currentTargetIndex = index;
    passwordInput.value = "";
    modal.classList.add("is-active");

    setTimeout(() => {
      passwordInput.focus();
    }, 100);
  }

  // パスワード認証
  function validatePassword() {
    const dict = Config.i18n[currentLang];
    if (passwordInput.value === Config.password) {
      const wrapper = document.getElementById(`svg-wrapper-${currentTargetIndex}`);
      const revealBtn = document.getElementById(`btn-reveal-${currentTargetIndex}`);
      const copyBtn = document.getElementById(`btn-copy-${currentTargetIndex}`);

      wrapper.classList.remove("is-blurred");
      revealBtn.innerText = dict.revealBtnHide;
      revealBtn.classList.add("active");
      copyBtn.classList.add("show");

      modal.classList.remove("is-active");
      showToast(dict.toastAuthSuccess);
    } else {
      showToast(dict.toastAuthError);
      passwordInput.value = "";
      passwordInput.focus();
    }
  }

  // コピー処理
  function executeCopy(code, isPrivate, index) {
    const dict = Config.i18n[currentLang];
    if (isPrivate) {
      const wrapper = document.getElementById(`svg-wrapper-${index}`);
      if (wrapper.classList.contains("is-blurred")) {
        showToast(dict.toastCopyLocked);
        return;
      }
    }

    navigator.clipboard.writeText(code).then(() => {
      showToast(dict.toastCopySuccess);
    }).catch(() => {
      showToast(dict.toastCopyError);
    });
  }

  function toggleTab(index) {
    const panel = document.getElementById(`panel-${index}`);
    const btn = document.getElementById(`btn-tab-${index}`);
    panel.classList.toggle("is-open");
    btn.classList.toggle("is-active");
  }

  document.getElementById("modal-cancel-btn").addEventListener("click", () => {
    modal.classList.remove("is-active");
  });
  document.getElementById("modal-submit-btn").addEventListener("click", validatePassword);
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") validatePassword();
  });

  // 画面保護
  document.addEventListener("contextmenu", (e) => e.preventDefault(), false);
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      return false;
    }
  }, false);

  updateStaticUI();
  renderList();
});