// Cloudflare Worker: 一言の即時更新用(任意)
// 必要な設定:
//   KV namespace を作り、変数名 HITOKOTO でこのWorkerにバインド
//   Secret ADMIN_PASSWORD に管理パスワードを設定
//   (任意) 変数 ALLOWED_ORIGIN に https://tunaisinbox.f5.si を設定
// デプロイ後のURLを config.js の hitokoto.api に入れる。

const EMPTY = { text: "", updatedAt: null, history: [] };

function clean(body) {
  const text = typeof body.text === "string" ? body.text.slice(0, 120) : "";
  const updatedAt = typeof body.updatedAt === "string" ? body.updatedAt.slice(0, 40) : null;
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter(h => h && typeof h.text === "string")
    .slice(0, 10)
    .map(h => ({ text: h.text.slice(0, 120), at: typeof h.at === "string" ? h.at.slice(0, 40) : null }));
  return { text, updatedAt, history };
}

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }
      });

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    if (req.method === "GET") {
      const v = await env.HITOKOTO.get("data");
      return new Response(v || JSON.stringify(EMPTY), {
        headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    }

    if (req.method === "POST") {
      if (req.headers.get("Authorization") !== "Bearer " + env.ADMIN_PASSWORD) {
        return json({ error: "unauthorized" }, 401);
      }
      let body;
      try { body = await req.json(); } catch (e) { return json({ error: "bad json" }, 400); }
      await env.HITOKOTO.put("data", JSON.stringify(clean(body)));
      return json({ ok: true });
    }

    return json({ error: "method not allowed" }, 405);
  }
};
