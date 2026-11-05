// MUNSCH Flow – Perplexity-Anbindung für den Cloudflare-Worker
// Endpunkt im Worker: POST /api/ask  (nur für angemeldete Nutzer)
//
// Einrichtung (einmalig, im Cloudflare-Dashboard unter Worker > Einstellungen > Variablen):
//   PPLX_KEY    Secret, API-Schlüssel von https://www.perplexity.ai/settings/api   (Pflicht)
//   PPLX_MODEL  optional, Standard "sonar" (alternativ "sonar-pro")
//   PPLX_URL    optional, Standard "https://api.perplexity.ai/v1/sonar"
//
// Ohne PPLX_KEY antwortet der Endpunkt mit 501, die Seite bleibt dann beim lokalen Jarvis.

const RATE = new Map(); // pro Isolate: Name -> [Zeitstempel]
const MAX_PER_MIN = 6;

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function limited(name) {
  const now = Date.now();
  const a = (RATE.get(name) || []).filter((t) => now - t < 60000);
  if (a.length >= MAX_PER_MIN) { RATE.set(name, a); return true; }
  a.push(now); RATE.set(name, a);
  return false;
}

// who = Name des angemeldeten Nutzers (aus der bestehenden Token-Prüfung), sonst null
export async function handleAsk(request, env, who) {
  if (request.method !== 'POST') return json({ error: 'POST erwartet' }, 405);
  if (!who) return json({ error: 'nicht angemeldet' }, 401);
  if (!env.PPLX_KEY) return json({ error: 'Perplexity nicht eingerichtet' }, 501);
  if (limited(who)) return json({ error: 'Zu viele Anfragen, kurz warten' }, 429);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'ungültiges JSON' }, 400); }

  // Nachrichten säubern: nur system/user/assistant, Länge begrenzen, abwechselnde Rollen erzwingen
  const raw = Array.isArray(body && body.messages) ? body.messages : [];
  const sys = raw.find((m) => m && m.role === 'system');
  const msgs = [];
  for (const m of raw) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') continue;
    const c = m.content.slice(0, 2000);
    if (msgs.length && msgs[msgs.length - 1].role === m.role) msgs[msgs.length - 1].content = c;
    else msgs.push({ role: m.role, content: c });
  }
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return json({ error: 'keine Frage' }, 400);
  const messages = (sys && typeof sys.content === 'string' ? [{ role: 'system', content: sys.content.slice(0, 8000) }] : [])
    .concat(msgs.slice(-8));

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch(env.PPLX_URL || 'https://api.perplexity.ai/v1/sonar', {
      method: 'POST',
      signal: ctl.signal,
      headers: { authorization: 'Bearer ' + env.PPLX_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: env.PPLX_MODEL || 'sonar',
        messages,
        max_tokens: 600,
        temperature: 0.2,
        web_search_options: { search_context_size: 'low' },
      }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      console.log('perplexity', r.status, t.slice(0, 300));
      return json({ error: 'Perplexity-Fehler ' + r.status }, 502);
    }
    const j = await r.json();
    const text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
    const src = (j.citations || (j.search_results || []).map((x) => x && x.url) || [])
      .filter((u) => typeof u === 'string' && /^https?:\/\//.test(u))
      .slice(0, 6);
    return json({ text: String(text).trim(), src });
  } catch (e) {
    return json({ error: ctl.signal.aborted ? 'Zeitüberschreitung' : 'Netzwerkfehler' }, 504);
  } finally {
    clearTimeout(timer);
  }
}
