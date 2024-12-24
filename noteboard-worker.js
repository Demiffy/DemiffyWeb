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

  let parsedBody = null;

  if (request.method === 'POST') {
    try {
      parsedBody = await request.clone().json();
    } catch (err) {
    }
  }

  // Retrieve banned IPs from KV storage
  let bannedIPs;
  try {
    bannedIPs = JSON.parse((await NOTES.get('banned-ips')) || '[]');
  } catch (e) {
    bannedIPs = [];
  }

  const ipAddress = request.headers.get('CF-Connecting-IP');

  const postingDisabled = (await NOTES.get('posting-disabled')) === 'true';

  const sendJSON = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
      status: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  };

  // Handle Admin Login
  if (request.method === 'POST' && url.pathname === '/admin-login') {
    if (!parsedBody || !parsedBody.password) {
      return sendJSON({ success: false, message: 'Password is required' }, 400);
    }

    const { password } = parsedBody;

    const adminPassword = ADMIN_PASSWORD;

    if (password === adminPassword) {
      return sendJSON({ success: true }, 200);
    } else {
      return sendJSON({ success: false, message: 'Invalid password' }, 401);
    }
  }

  const protectedRoutes = ['/ban-ip', '/unban-ip', '/delete-note', '/toggle-posting', '/clear-notes'];
  if (protectedRoutes.includes(url.pathname)) {
    if (!parsedBody || !parsedBody.password) {
      return sendJSON({ success: false, message: 'Password is required' }, 400);
    }

    const { password } = parsedBody;
    const adminPassword = ADMIN_PASSWORD;

    if (password !== adminPassword) {
      return sendJSON({ success: false, message: 'Unauthorized: Invalid password' }, 401);
    }
  }

  // Handle banning an IP
  if (request.method === 'POST' && url.pathname === '/ban-ip') {
    if (!parsedBody || !parsedBody.ip) {
      return sendJSON({ success: false, message: 'Invalid or missing "ip" field' }, 400);
    }

    const { ip } = parsedBody;

    if (typeof ip !== 'string') {
      return sendJSON({ success: false, message: '"ip" must be a string' }, 400);
    }

    if (!bannedIPs.includes(ip)) {
      bannedIPs.push(ip);
      await NOTES.put('banned-ips', JSON.stringify(bannedIPs));
    }

    return sendJSON({ success: true, message: 'IP banned successfully' }, 200);
  }

  // Handle unbanning an IP
  if (request.method === 'POST' && url.pathname === '/unban-ip') {
    if (!parsedBody || !parsedBody.ip) {
      return sendJSON({ success: false, message: 'Invalid or missing "ip" field' }, 400);
    }

    const { ip } = parsedBody;

    if (typeof ip !== 'string') {
      return sendJSON({ success: false, message: '"ip" must be a string' }, 400);
    }

    const index = bannedIPs.indexOf(ip);
    if (index !== -1) {
      bannedIPs.splice(index, 1);
      await NOTES.put('banned-ips', JSON.stringify(bannedIPs));
    }

    return sendJSON({ success: true, message: 'IP unbanned successfully' }, 200);
  }

  // Handle deleting a note
  if (request.method === 'POST' && url.pathname === '/delete-note') {
    if (!parsedBody || !parsedBody.id) {
      return sendJSON({ success: false, message: 'Missing "id" field' }, 400);
    }

    const { id } = parsedBody;

    if (typeof id !== 'number') {
      return sendJSON({ success: false, message: '"id" must be a number' }, 400);
    }

    const notes = JSON.parse((await NOTES.get('all-notes')) || '[]');
    const updatedNotes = notes.filter((note) => note.id !== id);

    await NOTES.put('all-notes', JSON.stringify(updatedNotes));

    return sendJSON({ success: true, message: 'Note deleted successfully' }, 200);
  }

  // Handle toggling posting status
  if (request.method === 'POST' && url.pathname === '/toggle-posting') {
    try {
      const currentStatus = (await NOTES.get('posting-disabled')) === 'true';
      await NOTES.put('posting-disabled', (!currentStatus).toString());
      return sendJSON({ success: true, postingDisabled: !currentStatus }, 200);
    } catch (err) {
      return sendJSON({ success: false, message: 'Failed to toggle posting status' }, 500);
    }
  }

  // Handle clearing all notes
  if (request.method === 'POST' && url.pathname === '/clear-notes') {
    try {
      await NOTES.put('all-notes', JSON.stringify([]));
      return sendJSON({ success: true, message: 'All notes cleared' }, 200);
    } catch (err) {
      return sendJSON({ success: false, message: 'Failed to clear notes' }, 500);
    }
  }

  // Handle GET request to fetch notes
  if (request.method === 'GET') {
    try {
      const notes = JSON.parse((await NOTES.get('all-notes')) || '[]');
      const response = {
        notes: notes,
        bannedIPs: bannedIPs,
        postingDisabled: postingDisabled,
      };
      return sendJSON(response, 200);
    } catch (err) {
      return sendJSON({ success: false, message: 'Failed to fetch notes' }, 500);
    }
  }

  // Handle POST request to add a note
  if (request.method === 'POST' && url.pathname === '/') {
    if (postingDisabled) {
      return sendJSON({ success: false, message: 'Posting is currently disabled.' }, 403);
    }

    if (bannedIPs.includes(ipAddress)) {
      return sendJSON({ success: false, message: 'You are banned from posting notes.' }, 403);
    }

    if (!parsedBody || !parsedBody.text || typeof parsedBody.text !== 'string') {
      return sendJSON({ success: false, message: 'Invalid or missing "text" field' }, 400);
    }

    const { text, timestamp } = parsedBody;

    if (text.trim() === '') {
      return sendJSON({ success: false, message: 'Note content cannot be empty' }, 400);
    }

    try {
      const notes = JSON.parse((await NOTES.get('all-notes')) || '[]');

      const newNote = {
        id: Date.now(),
        text: text,
        timestamp: timestamp,
        ip: ipAddress,
      };
      notes.push(newNote);
      await NOTES.put('all-notes', JSON.stringify(notes));

      return sendJSON({ success: true, note: newNote }, 200);
    } catch (err) {
      return sendJSON({ success: false, message: 'Failed to add note' }, 500);
    }
  }

  return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}