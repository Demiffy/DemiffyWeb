addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
  });
  
  const GRID_SIZE = 50;
  let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#FFFFFF'));
  
  async function handleRequest(request) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
  
    // /grid
    if (request.method === 'GET' && url.pathname === '/grid') {
      return new Response(JSON.stringify(grid), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  
    // /place
    if (request.method === 'POST' && url.pathname === '/place') {
      const { x, y, color } = await request.json();
      if (grid[x] && grid[x][y]) {
        grid[x][y] = color;
      }
  
      return new Response(JSON.stringify(grid), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }
  