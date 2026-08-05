const SITE_CONFIG = {
  // 基本プロフィール
  name: "tuna",
  iconUrl: "https://p16-common-sign.tiktokcdn.com/tos-alisg-avt-0068/e4c56b4f5fecbb0cafdee93bec905331~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=342f84c3&x-expires=1785952800&x-signature=Lf88aQgCK%2BkwiRR8gB5BFugubMI%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2",
  bio: "このつなというバカな人物は真面目に何かをやることができません。",
  birthday: "01/21",
  oshi: "天馬司",

  // 背景動画
  bgVideoUrl: "https://files.catbox.moe/oxyo4y.mov",

  // 好きなもの（指定7種 + 10種生成）
  likes: [
    "ゲーム", "寝ること", "音楽鑑賞", "猫", "犬", "焼きそばパン", "甘いもの","果物系ジュース",
    "アニメ", "YouTube", "お昼寝", "布団", "スマホ", "フライドポテト","コカコーラ","ペプs((殴"
  ],

  // 嫌いなもの（指定13種 + 15種生成）
  dislikes: [
    "虫", "早起き", "暑すぎる日", "パクチー", "いか", "たこ", "きのこ", "魚", "たけのこ", "豆腐", "納豆", "豆乳", "わさび", "激辛",
    "寒すぎる日", "人混み", "勉強", "運動", "宿題", "晴れてる日", "説教", "静電気", "注射", "ゴーヤ", "セロリ","パセリ","青汁", "生ピーマン", "レバー", "炭酸の抜けたコーラ"
  ],

  // SNSアカウント（カード表示用）
  sns: [
    { 
      name: "YouTube", 
      handle: "@tunaisinbox", 
      url: "https://www.youtube.com/@tunaisinbox",
      svgIcon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
    },
    { 
      name: "TikTok", 
      handle: "@kspinkatama", 
      url: "https://www.tiktok.com/@kspinkatama",
      svgIcon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.56-1.28 2.55.02.94.51 1.84 1.3 2.35.88.58 2.03.62 2.95.12.92-.48 1.52-1.45 1.55-2.5.03-4.8.01-9.6.02-14.4z"/></svg>`
    }
  ],

  // アクションボタン
  actionButtons: [
    { 
      label: "寄付 (乞食)", 
      url: "https://tunaisinbox.f5.si/donate", 
      class: "btn-donate",
      svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`
    },
     { 
          label: "フレンドコード一覧", 
          url: "https://tunaisinbox.f5.si/friend/",
          svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 12h4"/><path d="M16 10v4"/></svg>`
        },
    { 
      label: "サポート", 
      url: "https://tunaisinbox.f5.si/support", 
      class: "btn-support",
      svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
    }
  ],

  // カテゴリー分けされたハンバーガーメニュー
  menuSections: [
    {
      title: "メイン",
      links: [
        { 
          label: "ホーム", 
          url: "https://tunaisinbox.f5.si",
          svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
        },
        { 
          label: "プロフィール", 
          url: "#profile",
          svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
        },
        { 
          label: "好きなもの / 嫌いなもの", 
          url: "#likes-dislikes",
          svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        },
        { 
          label: "フレンドコード一覧", 
          url: "https://tunaisinbox.f5.si/friend/",
          svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 12h4"/><path d="M16 10v4"/></svg>`
        },
        { 
          label: "寄付ページ", 
          url: "https://tunaisinbox.f5.si/donate",
          svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`
        },
        { 
          label: "サポート", 
          url: "https://tunaisinbox.f5.si/support",
          svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
        }
      ]
    },
    {
      title: "SNS",
      links: [
        { 
          label: "YouTube", 
          url: "https://www.youtube.com/@tunaisinbox",
          svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
        },
        { 
          label: "TikTok", 
          url: "https://www.tiktok.com/@kspinkatama",
          svgIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.56-1.28 2.55.02.94.51 1.84 1.3 2.35.88.58 2.03.62 2.95.12.92-.48 1.52-1.45 1.55-2.5.03-4.8.01-9.6.02-14.4z"/></svg>`
        }
      ]
    }
  ]
};
