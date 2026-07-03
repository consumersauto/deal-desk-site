// Cloudflare Pages Function.
// Handles GET/POST /api/{key} against a KV namespace bound as DEAL_DESK_KV.
// Used by deal_desk.html's storageGet/storageSet helpers for shared,
// staff-wide persistence of inventory and fee settings once this is hosted
// outside Claude (where window.storage isn't available).

export async function onRequestGet({ params, env }) {
  try {
    const value = await env.DEAL_DESK_KV.get(params.key);
    return new Response(JSON.stringify({ value }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'KV read failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost({ params, env, request }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (typeof body.value !== 'string') {
    return new Response(JSON.stringify({ error: '"value" must be a string' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    await env.DEAL_DESK_KV.put(params.key, body.value);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'KV write failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
