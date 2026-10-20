// Cloudflare Worker: reCAPTCHA v2 のサーバー側確認(シークレットキーはここでだけ使う)
// 設定:
//   Secret  RECAPTCHA_SECRET   : reCAPTCHAのシークレットキー(ダッシュボードの Secret に入れる。ファイルに直書きしない)
//   変数    ALLOWED_ORIGIN     : (任意) 例 https://tunaisinbox.f5.si  … 呼び出し元を限定
//   変数    ALLOWED_HOSTNAME   : (任意) 例 tunaisinbox.f5.si          … チェックしたサイトの名前を照合
// デプロイ後のURLを config.js の recaptcha.verifyUrl に入れる。

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }
      });

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return json({ success: false, error: "method not allowed" }, 405);

    let body;
    try { body = await req.json(); } catch (e) { return json({ success: false, error: "bad json" }, 400); }
    const token = body && typeof body.token === "string" ? body.token : "";
    if (!token) return json({ success: false, error: "no token" }, 400);

    const form = new URLSearchParams({ secret: env.RECAPTCHA_SECRET, response: token });
    const ip = req.headers.get("CF-Connecting-IP");
    if (ip) form.set("remoteip", ip);

    let result;
    try {
      const r = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", body: form });
      result = await r.json();
    } catch (e) {
      return json({ success: false, error: "verify failed" }, 502);
    }

    let ok = !!result.success;
    if (ok && env.ALLOWED_HOSTNAME && result.hostname !== env.ALLOWED_HOSTNAME) ok = false;
    return json({ success: ok });
  }
};
