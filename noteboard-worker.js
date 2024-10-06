addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    const url = new URL(request.url);
  
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  
    // Handle OPTIONS request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }
  
    // Retrieve banned IPs from KV storage
    const bannedIPs = JSON.parse(await NOTES.get("banned-ips") || "[]");
  
    // Get the IP address from the request
    const ipAddress = request.headers.get("CF-Connecting-IP");
  
    // Handle banning an IP
    if (request.method === "POST" && url.pathname === "/ban-ip") {
      const body = await request.json();
      if (!bannedIPs.includes(body.ip)) {
        bannedIPs.push(body.ip);
        await NOTES.put("banned-ips", JSON.stringify(bannedIPs));
      }
      return new Response("IP banned", { headers: corsHeaders });
    }
  
    // Handle unbanning an IP
    if (request.method === "POST" && url.pathname === "/unban-ip") {
      const body = await request.json();
      const index = bannedIPs.indexOf(body.ip);
      if (index !== -1) {
        bannedIPs.splice(index, 1);
        await NOTES.put("banned-ips", JSON.stringify(bannedIPs));
      }
      return new Response("IP unbanned", { headers: corsHeaders });
    }
  
    // Handle deleting a note
    if (request.method === "POST" && url.pathname === "/delete-note") {
      const body = await request.json();
      const notes = JSON.parse((await NOTES.get("all-notes")) || "[]");
      const updatedNotes = notes.filter(note => note.id !== body.id);
      await NOTES.put("all-notes", JSON.stringify(updatedNotes));
      return new Response("Note deleted", { headers: corsHeaders });
    }
  
    // Handle GET request to fetch notes
    if (request.method === "GET") {
      const notes = await NOTES.get("all-notes");
      const response = {
        notes: JSON.parse(notes || "[]"),
        bannedIPs: bannedIPs,
      };
      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  
    // Handle POST request to add a note
    if (request.method === "POST" && url.pathname === "/") {
      if (bannedIPs.includes(ipAddress)) {
        return new Response("You are banned from posting notes.", {
          status: 403,
          headers: corsHeaders,
        });
      }
  
      const body = await request.json();
  
      // Validate that the note text is not empty
      if (!body.text || body.text.trim() === "") {
        return new Response("Invalid note content", { status: 400, headers: corsHeaders });
      }
  
      const notes = JSON.parse((await NOTES.get("all-notes")) || "[]");
  
      // Add the new note with IP and timestamp
      const newNote = { id: Date.now(), text: body.text, timestamp: body.timestamp, ip: ipAddress };
      notes.push(newNote);
      await NOTES.put("all-notes", JSON.stringify(notes));
  
      return new Response(JSON.stringify(newNote), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }
  