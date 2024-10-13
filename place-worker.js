// place-worker.js

const COLOR_PALETTE = [
  '#6D001A', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#FFF8B8',
  '#00A368', '#00CC78', '#7EED56', '#00756F', '#009EAA', '#00CCC0',
  '#2450A4', '#3690EA', '#51E9F4', '#493AC1', '#6A5CFF', '#94B3FF',
  '#811E9F', '#B44AC0', '#E4ABFF', '#DE107F', '#FF3881', '#FF99AA',
  '#6D482F', '#9C6926', '#FFB470', '#000000', '#515252', '#898D90',
  '#D4D7D9', '#FFFFFF' // Index 31 is white
];

const GRID_SIZE = 50;

// Utility functions
const colorToIndex = (color) => {
  const index = COLOR_PALETTE.indexOf(color.toUpperCase());
  return index !== -1 ? index : null; // Return null if color not in palette
};

const indexToColor = (index) => {
  return COLOR_PALETTE[index] || null;
};

const parseGridString = (gridStr) => {
  const pixels = gridStr.split('/');
  const gridMap = new Map();
  pixels.forEach(pixel => {
    if (pixel) {
      const [coords, color] = pixel.split(':');
      const [x, y] = coords.split(';').map(Number);
      if (!isNaN(x) && !isNaN(y)) {
        const colorIndex = parseInt(color, 10);
        if (!isNaN(colorIndex)) {
          gridMap.set(`${x},${y}`, colorIndex);
        } else {
          gridMap.set(`${x},${y}`, color.toUpperCase()); // Store hex if not in palette
        }
      }
    }
  });
  return gridMap;
};

const serializeGridMap = (gridMap) => {
  let gridStr = '';
  gridMap.forEach((color, key) => {
    const [x, y] = key.split(',');
    if (typeof color === 'number') {
      gridStr += `${x};${y}:${color}/`;
    } else {
      gridStr += `${x};${y}:${color}/`;
    }
  });
  return gridStr;
};

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

  // Handle /grid - initial full grid
  if (request.method === 'GET' && url.pathname === '/grid') {
    const gridStr = await GRID.get('grid') || '';
    const lastUpdate = await GRID.get('lastUpdate') || '0';

    return new Response(JSON.stringify({ grid: gridStr, lastUpdate }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Handle /get-changes
  if (request.method === 'GET' && url.pathname === '/get-changes') {
    const since = parseInt(url.searchParams.get('since') || '0', 10);

    // Get changes
    const changesStr = await GRID.get('changes') || '';
    const changesList = changesStr ? changesStr.split('/') : [];

    // Filter changes since 'since' timestamp
    const newChanges = changesList.filter(change => {
      if (change) {
        const [coords, color] = change.split(':');
        // Assuming the color entry includes timestamp
        // For simplicity, let's include timestamp in the color part separated by a comma
        // Example: "10;15:5,1697051234567"
        const [colorPart, timestampStr] = color.split(',');
        const timestamp = parseInt(timestampStr, 10);
        return timestamp > since;
      }
      return false;
    });

    return new Response(JSON.stringify({ changes: newChanges }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Handle /place
  if (request.method === 'POST' && url.pathname === '/place') {
    if (placingDisabled) {
      return new Response(JSON.stringify({ success: false, message: 'Placing is disabled' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();
      const { x, y, color } = body;

      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid coordinates' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if color is white; if so, remove the pixel from storage
      if (color.toUpperCase() === '#FFFFFF') {
        // Remove pixel if it exists
        let gridStr = await GRID.get('grid') || '';
        const gridMap = parseGridString(gridStr);
        gridMap.delete(`${x},${y}`);
        const newGridStr = serializeGridMap(gridMap);
        await GRID.put('grid', newGridStr);

        // Record change as removal (set to white)
        const timestamp = Date.now();
        let changesStr = await GRID.get('changes') || '';
        let changesList = changesStr ? changesStr.split('/') : [];

        changesList.push(`${x};${y}:white,${timestamp}`);

        // Keep only last 10 changes
        if (changesList.length > 10) {
          changesList = changesList.slice(-10);
        }

        const updatedChangesStr = changesList.join('/');
        await GRID.put('changes', updatedChangesStr);
        await GRID.put('lastUpdate', timestamp.toString());

        return new Response(JSON.stringify({ success: true, x, y, color: 'white', timestamp }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Check if color is in palette
      const colorIndex = colorToIndex(color);
      let finalColor = colorIndex !== null ? colorIndex : color.toUpperCase();

      // Get current grid
      let gridStr = await GRID.get('grid') || '';
      const gridMap = parseGridString(gridStr);
      const key = `${x},${y}`;
      const existingColor = gridMap.get(key);

      if (existingColor === finalColor) {
        // No change needed
        return new Response(JSON.stringify({ success: true, message: 'No change', timestamp: Date.now() }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (finalColor === 'white') {
        gridMap.delete(key);
      } else {
        gridMap.set(key, finalColor);
      }

      const newGridStr = serializeGridMap(gridMap);
      await GRID.put('grid', newGridStr);

      // Record change
      const timestamp = Date.now();
      let changesStr = await GRID.get('changes') || '';
      let changesList = changesStr ? changesStr.split('/') : [];

      if (typeof finalColor === 'number') {
        changesList.push(`${x};${y}:${finalColor},${timestamp}`);
      } else {
        changesList.push(`${x};${y}:${finalColor},${timestamp}`);
      }

      // Keep only last 10 changes
      if (changesList.length > 10) {
        changesList = changesList.slice(-10);
      }

      const updatedChangesStr = changesList.join('/');
      await GRID.put('changes', updatedChangesStr);
      await GRID.put('lastUpdate', timestamp.toString());

      return new Response(JSON.stringify({ success: true, x, y, color: finalColor, timestamp }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle /clear-grid
  if (request.method === 'POST' && url.pathname === '/clear-grid') {
    // Clear grid by removing all entries (since white is default)
    await GRID.put('grid', '');
    await GRID.put('changes', '');
    await GRID.put('lastUpdate', Date.now().toString());

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
