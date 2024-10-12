addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  // /grid
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

  // /place
  if (request.method === 'POST' && url.pathname === '/place') {
    const body = await request.json();

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

  return new Response('Method Not Allowed', {
    status: 405,
    headers: corsHeaders,
  });
}
