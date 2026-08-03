// config.js
const Config = {
  homeUrl: "https://tunaisinbox.f5.si", // ホームに戻るURL
  password: "wonderhoy",        // 閲覧用パスワード
  appLogo: "https://files.catbox.moe/lzbie4.png", // 初回ローディング画面のロゴ画像
  
  // UIテキストの辞書データ
  i18n: {
    ja: {
      homeBtn: "ホームへ戻る",
      title: "Friend Codes",
      searchPlaceholder: "ゲーム名やタグで検索 (Enterで検索)...",
      detailBtn: "詳細を見る",
      revealBtnShow: "表示する",
      revealBtnHide: "非公開にする",
      copyBtn: "コピー",
      privateText: "非公開です",
      modalTitle: "パスワード認証",
      modalDesc: "非公開コードを表示するにはパスワードを入力してください。",
      modalPassPlaceholder: "パスワード",
      modalCancel: "キャンセル",
      modalSubmit: "確認",
      toastAuthSuccess: "認証に成功しました",
      toastAuthError: "パスワードが違います",
      toastCopySuccess: "フレンドコードをコピーしました！",
      toastCopyError: "コピーに失敗しました",
      toastCopyLocked: "非公開コードは表示後のみコピーできます"
    },
    en: {
      homeBtn: "Back to Home",
      title: "Friend Codes",
      searchPlaceholder: "Search by title/tag (Press Enter)...",
      detailBtn: "View Details",
      revealBtnShow: "Show Code",
      revealBtnHide: "Hide Code",
      copyBtn: "Copy",
      privateText: "PRIVATE",
      modalTitle: "Password Verification",
      modalDesc: "Please enter the password to unlock private code.",
      modalPassPlaceholder: "Password",
      modalCancel: "Cancel",
      modalSubmit: "Submit",
      toastAuthSuccess: "Authentication successful",
      toastAuthError: "Incorrect password",
      toastCopySuccess: "Friend code copied to clipboard!",
      toastCopyError: "Failed to copy code",
      toastCopyLocked: "Please show the code before copying"
    }
  },

  // ゲームデータ
  games: [
    {
      name: {
        ja: "プロジェクトセカイ",
        en: "Hatsune Miku Colorful Stage!"
      },
      gameIcon: "https://files.catbox.moe/aen8g7.jpg",
      playerIconOn: true,
      playerIcon: "https://files.catbox.moe/wuc0yu.jpg",
      code: "699741836551254017",
      isPrivate: true,
      tags: {
        ja: ["音ゲー", "プロセカ", "ボカロ","カラステ"],
        en: ["Rhythmgame", "pjsekai", "Vocaloid","Colorful Stage","hatsune miku"]
      },
      partyImages: [
        "https://files.catbox.moe/tvkghq.webp",
        "https://files.catbox.moe/ezcmwp.jpg",
        "https://files.catbox.moe/nw6ewn.jpg",
        "https://files.catbox.moe/a9hdh8.jpg"
      ]
    },
    {
      name: {
        ja: "Roblox",
        en: "Roblox"
      },
      gameIcon: "https://files.catbox.moe/3knz0w.webp",
      playerIconOn: true,
      playerIcon: "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-FE4B899138B2D4D02EB9E9968A121131-Png/150/150/AvatarHeadshot/Webp/noFilter",
      code: "raikyun_officiaI",
      isPrivate: false,
      tags: {
        ja: ["サードパーティー", "ロブロックス"],
        en: ["Third-Party", "block"]
      },
      partyImages: [
        "https://tr.rbxcdn.com/30DAY-Avatar-FE4B899138B2D4D02EB9E9968A121131-Png/720/720/Avatar/Webp/noFilter"
      ]
    },
     {
      name: {
        ja: "Roblox sub-account",
        en: "Roblox sub-account"
      },
      gameIcon: "https://files.catbox.moe/3knz0w.webp",
      playerIconOn: true,
      playerIcon: "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-598A9ECB332C6CF45E82EBF995CAC87D-Png/150/150/AvatarHeadshot/Webp/noFilter",
      code: "raikyun_official",
      isPrivate: false,
      tags: {
        ja: ["サードパーティー", "ロブロックス"],
        en: ["Third-Party", "block"]
      },
      partyImages: [
        "https://tr.rbxcdn.com/30DAY-Avatar-598A9ECB332C6CF45E82EBF995CAC87D-Png/720/720/Avatar/Webp/noFilter"
      ]
    }
     
  ]
};