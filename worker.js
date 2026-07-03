export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const key = url.pathname.slice('/api/'.length);
      if (!key) {
        return new Response(JSON.stringify({ error: 'Missing key' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'GET') {
        try {
          const value = await env.DEAL_DESK_KV.get(key);
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

      if (request.method === 'POST') {
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
          await env.DEAL_DESK_KV.put(key, body.value);
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

      return new Response('Method not allowed', { status: 405, headers: { 'Allow': 'GET, POST' } });
    }

    // Everything else: serve the static site (index.html, etc.)
    return env.ASSETS.fetch(request);
  }
};
