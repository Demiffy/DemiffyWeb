// place-worker.js

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  const allowedOrigins = ['https://demiffy.com', 'http://localhost:5173'];
  const origin = request.headers.get('Origin');

  const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  } else {
    if (origin) {
      return new Response('Forbidden: CORS policy', { status: 403, headers: corsHeaders });
    }
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let placingDisabled = (await GRID.get('placingDisabled')) === 'true';

  const protectedRoutes = ['/clear-grid', '/toggle-placing'];
  if (protectedRoutes.includes(url.pathname)) {
    try {
      const body = await request.json();
      const { password } = body;

      const adminPassword = ADMIN_PASSWORD;

      if (password !== adminPassword) {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized: Invalid password' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle /admin-login
  if (request.method === 'POST' && url.pathname === '/admin-login') {
    try {
      const body = await request.json();
      const { password } = body;

      const adminPassword = ADMIN_PASSWORD;

      if (password === adminPassword) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ success: false, message: 'Invalid password' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle /grid
  if (request.method === 'GET' && url.pathname === '/grid') {
    let grid = await GRID.get('grid');
    if (!grid) {
      grid = Array.from({ length: 50 }, () => Array(50).fill('#FFFFFF'));
    } else {
      grid = JSON.parse(grid);
    }
    return new Response(JSON.stringify(grid), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Handle /placing-disabled
  if (request.method === 'GET' && url.pathname === '/placing-disabled') {
    let status = await GRID.get('placingDisabled');
    if (!status) {
      status = 'false';
    }
    return new Response(JSON.stringify({ placingDisabled: status === 'true' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Handle /place
  if (request.method === 'POST' && url.pathname === '/place') {
    const body = await request.json();

    if (placingDisabled) {
      return new Response('Placing is disabled', {
        status: 403,
        headers: corsHeaders,
      });
    }

    let grid = await GRID.get('grid');
    if (!grid) {
      grid = Array.from({ length: 50 }, () => Array(50).fill('#FFFFFF'));
    } else {
      grid = JSON.parse(grid);
    }

    const { x, y, color } = body;

    if (x < 0 || x >= 50 || y < 0 || y >= 50) {
      return new Response('Invalid coordinates', {
        status: 400,
        headers: corsHeaders,
      });
    }

    grid[x][y] = color;

    await GRID.put('grid', JSON.stringify(grid));

    return new Response(JSON.stringify(grid), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Handle /clear-grid
  if (request.method === 'POST' && url.pathname === '/clear-grid') {
    let grid = Array.from({ length: 50 }, () => Array(50).fill('#FFFFFF'));
    await GRID.put('grid', JSON.stringify(grid));

    return new Response(JSON.stringify({ success: true, message: 'Grid cleared' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Handle /toggle-placing
  if (request.method === 'POST' && url.pathname === '/toggle-placing') {
    let status = await GRID.get('placingDisabled');
    if (!status) {
      status = 'false';
    }
    let newStatus = status === 'true' ? 'false' : 'true';
    await GRID.put('placingDisabled', newStatus);

    return new Response(JSON.stringify({ success: true, placingDisabled: newStatus === 'true' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', {
    status: 405,
    headers: corsHeaders,
  });
}
