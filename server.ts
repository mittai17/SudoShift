import express from "express";
import "dotenv/config";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { YoutubeTranscript } from 'youtube-transcript';
import { randomUUID } from "crypto";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient as createRedisClient } from "redis";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" }
  });
  const PORT = 3000;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const baseSupabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

  if (process.env.REDIS_URL) {
    try {
      const pubClient = createRedisClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log("Socket.IO Redis adapter enabled.");
    } catch (error) {
      console.warn("Redis adapter unavailable; continuing with single-process collaboration.", error);
    }
  }

  app.use(express.json());

  // Socket.io real-time collaboration Logic
  // Using a simple in-memory store for canvases
  const canvases = new Map<string, {
    nodes: any[],
    edges: any[],
    versions: any[],
    members: Record<string, { role: 'owner' | 'editor' | 'viewer', user: any, isOnline: boolean, socketId?: string }>
  }>();

  // Also store chat messages per canvas
  const canvasChats = new Map<string, any[]>();

  // Track cursor positions
  const canvasCursors = new Map<string, Map<string, any>>();
  const saveTimers = new Map<string, NodeJS.Timeout>();

  const createUserSupabase = (accessToken: string) => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  };

  const persistCanvasState = (canvasId: string, supabase: any) => {
    if (!supabase || canvasId === 'default') return;
    const canvas = canvases.get(canvasId);
    if (!canvas) return;

    const existing = saveTimers.get(canvasId);
    if (existing) clearTimeout(existing);

    saveTimers.set(canvasId, setTimeout(async () => {
      const { error } = await supabase
        .from('canvases')
        .update({
          nodes: canvas.nodes,
          edges: canvas.edges,
          versions: canvas.versions,
        })
        .eq('id', canvasId);

      if (error) {
        console.warn(`Failed to persist canvas ${canvasId}:`, error.message);
      }
      saveTimers.delete(canvasId);
    }, 600));
  };

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || !baseSupabase) {
      return next(new Error("Authentication required"));
    }

    const { data, error } = await baseSupabase.auth.getUser(token);
    if (error || !data.user) {
      return next(new Error("Invalid session"));
    }

    socket.data.authUser = data.user;
    socket.data.accessToken = token;
    socket.data.supabase = createUserSupabase(token);
    next();
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a canvas room
    socket.on("join_canvas", async ({ canvasId, user }) => {
      socket.join(canvasId);
      socket.data.canvasId = canvasId;
      const authUser = socket.data.authUser;
      const safeUser = {
        id: authUser.id,
        email: authUser.email,
        name: user?.name || authUser.user_metadata?.full_name || authUser.email || 'User',
        color: user?.color || '#6366f1',
      };
      socket.data.user = safeUser;

      if (!canvases.has(canvasId)) {
        let dbCanvas: any = null;
        if (socket.data.supabase && canvasId !== 'default') {
          let result = await socket.data.supabase
            .from('canvases')
            .select('nodes, edges, versions')
            .eq('id', canvasId)
            .maybeSingle();

          if (!result.data) {
            await socket.data.supabase
              .from('canvas_members')
              .insert({ canvas_id: canvasId, user_id: safeUser.id, role: 'editor' });

            result = await socket.data.supabase
              .from('canvases')
              .select('nodes, edges, versions')
              .eq('id', canvasId)
              .maybeSingle();
          }

          if (result.error) {
            console.warn(`Unable to load canvas ${canvasId} from Supabase:`, result.error.message);
          }
          dbCanvas = result.data;
        }

        canvases.set(canvasId, {
          nodes: dbCanvas?.nodes || [],
          edges: dbCanvas?.edges || [],
          versions: dbCanvas?.versions || [],
          members: {},
        });
      }
      if (!canvasChats.has(canvasId)) {
        if (socket.data.supabase && canvasId !== 'default') {
          const { data, error } = await socket.data.supabase
            .from('canvas_messages')
            .select('id, text, user_snapshot, created_at')
            .eq('canvas_id', canvasId)
            .order('created_at', { ascending: true })
            .limit(100);

          if (error) {
            console.warn(`Unable to load chat for ${canvasId}:`, error.message);
            canvasChats.set(canvasId, []);
          } else {
            canvasChats.set(canvasId, (data || []).map((msg: any) => ({
              id: msg.id,
              text: msg.text,
              user: msg.user_snapshot,
              timestamp: msg.created_at,
            })));
          }
        } else {
          canvasChats.set(canvasId, []);
        }
      }
      if (!canvasCursors.has(canvasId)) {
        canvasCursors.set(canvasId, new Map());
      }

      const canvas = canvases.get(canvasId)!;

      // Determine if a user is joining for the first time
      if (!canvas.members[safeUser.id]) {
        // First member is automatically the owner
        const isFirst = Object.keys(canvas.members).length === 0;
        let role: 'owner' | 'editor' | 'viewer' = isFirst ? 'owner' : 'editor';
        if (socket.data.supabase && canvasId !== 'default') {
          const { data } = await socket.data.supabase
            .from('canvas_members')
            .select('role')
            .eq('canvas_id', canvasId)
            .eq('user_id', safeUser.id)
            .maybeSingle();
          role = data?.role || role;
        }

        canvas.members[safeUser.id] = {
          role: isFirst ? 'owner' : 'editor',
          user: safeUser,
          isOnline: true,
          socketId: socket.id
        };
        canvas.members[safeUser.id].role = role;
      } else {
        canvas.members[safeUser.id].isOnline = true;
        canvas.members[safeUser.id].socketId = socket.id;
        // Update user properties in case they changed
        canvas.members[safeUser.id].user = safeUser;
      }

      const cursorsMap = canvasCursors.get(canvasId)!;
      cursorsMap.set(socket.id, { user: safeUser, position: { x: 0, y: 0 } });

      // Send current state
      socket.emit("init_canvas", canvas);
      socket.emit("init_chat", canvasChats.get(canvasId));
      socket.emit("versions_updated", canvas.versions);

      // Broadcast updated members and cursors
      io.to(canvasId).emit("members_updated", Object.values(canvas.members));
      io.to(canvasId).emit("cursors_update", Array.from(cursorsMap.entries()).map(([id, data]) => ({ id, ...data })));
    });

    socket.on("update_member_role", async ({ userId, role }) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && canvases.has(canvasId)) {
        const canvas = canvases.get(canvasId)!;
        // Check if requester is owner
        const requesterId = socket.data.user.id;
        if (canvas.members[requesterId]?.role === 'owner') {
          if (canvas.members[userId]) {
            // Ensure we don't remove the last owner unless it's handled, but for simplicity:
            if (userId !== requesterId) {
              if (socket.data.supabase && canvasId !== 'default') {
                const { error } = await socket.data.supabase
                  .from('canvas_members')
                  .update({ role })
                  .eq('canvas_id', canvasId)
                  .eq('user_id', userId);
                if (error) {
                  console.warn(`Failed to update role for ${userId}:`, error.message);
                  return;
                }
              }
              canvas.members[userId].role = role;
              io.to(canvasId).emit("members_updated", Object.values(canvas.members));
            }
          }
        }
      }
    });

    socket.on("kick_member", async (userId) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && canvases.has(canvasId)) {
        const canvas = canvases.get(canvasId)!;
        const requesterId = socket.data.user.id;
        if (canvas.members[requesterId]?.role === 'owner') {
          if (canvas.members[userId] && userId !== requesterId) {
            const targetSocketId = canvas.members[userId].socketId;
            if (socket.data.supabase && canvasId !== 'default') {
              const { error } = await socket.data.supabase
                .from('canvas_members')
                .delete()
                .eq('canvas_id', canvasId)
                .eq('user_id', userId);
              if (error) {
                console.warn(`Failed to remove member ${userId}:`, error.message);
                return;
              }
            }
            delete canvas.members[userId];
            if (targetSocketId) {
              const targetSocket = io.sockets.sockets.get(targetSocketId);
              if (targetSocket) {
                targetSocket.emit("kicked");
                targetSocket.leave(canvasId);
              }
            }
            io.to(canvasId).emit("members_updated", Object.values(canvas.members));

            // Also clean up cursor
            const cursorsMap = canvasCursors.get(canvasId);
            if (cursorsMap && targetSocketId) {
              cursorsMap.delete(targetSocketId);
              io.to(canvasId).emit("cursors_update", Array.from(cursorsMap.entries()).map(([id, data]) => ({ id, ...data })));
            }
          }
        }
      }
    });

    socket.on("cursor_move", ({ x, y }) => {
      const canvasId = socket.data.canvasId;
      if (canvasId) {
        const cursorsMap = canvasCursors.get(canvasId);
        if (cursorsMap && cursorsMap.has(socket.id)) {
          cursorsMap.get(socket.id)!.position = { x, y };
          // Throttle broadcast slightly in a real app, but here simple broadcast
          socket.to(canvasId).emit("cursor_moved", { id: socket.id, position: { x, y } });
        }
      }
    });

    socket.on("update_nodes", (nodes) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && canvases.has(canvasId)) {
        const canvas = canvases.get(canvasId)!;
        const role = canvas.members[socket.data.user.id]?.role;
        if (role === 'viewer') return;
        canvases.get(canvasId)!.nodes = nodes;
        persistCanvasState(canvasId, socket.data.supabase);
        socket.to(canvasId).emit("nodes_updated", nodes);
      }
    });

    socket.on("update_edges", (edges) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && canvases.has(canvasId)) {
        const canvas = canvases.get(canvasId)!;
        const role = canvas.members[socket.data.user.id]?.role;
        if (role === 'viewer') return;
        canvases.get(canvasId)!.edges = edges;
        persistCanvasState(canvasId, socket.data.supabase);
        socket.to(canvasId).emit("edges_updated", edges);
      }
    });

    socket.on("save_version", (versionName) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && canvases.has(canvasId)) {
        const canvas = canvases.get(canvasId)!;
        const newVersion = {
          id: randomUUID(),
          timestamp: new Date().toISOString(),
          author: socket.data.user,
          name: versionName || `Version ${canvas.versions.length + 1}`,
          nodes: JSON.parse(JSON.stringify(canvas.nodes)),
          edges: JSON.parse(JSON.stringify(canvas.edges))
        };
        canvas.versions = [newVersion, ...canvas.versions];
        persistCanvasState(canvasId, socket.data.supabase);
        io.to(canvasId).emit("versions_updated", canvas.versions);
      }
    });

    socket.on("restore_version", (versionId) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && canvases.has(canvasId)) {
        const canvas = canvases.get(canvasId)!;
        const version = canvas.versions.find((v: any) => v.id === versionId);
        if (version) {
          canvas.nodes = JSON.parse(JSON.stringify(version.nodes));
          canvas.edges = JSON.parse(JSON.stringify(version.edges));
          io.to(canvasId).emit("nodes_updated", canvas.nodes);
          io.to(canvasId).emit("edges_updated", canvas.edges);
          // Add a restore marker
          const newVersion = {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            author: socket.data.user,
            name: `Restored to ${version.name}`,
            nodes: JSON.parse(JSON.stringify(canvas.nodes)),
            edges: JSON.parse(JSON.stringify(canvas.edges))
          };
          canvas.versions = [newVersion, ...canvas.versions];
          persistCanvasState(canvasId, socket.data.supabase);
          io.to(canvasId).emit("versions_updated", canvas.versions);
        }
      }
    });

    socket.on("send_message", async (message) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && canvasChats.has(canvasId)) {
        const msgObj = {
          id: randomUUID(),
          user: socket.data.user,
          text: message,
          timestamp: new Date().toISOString()
        };
        if (socket.data.supabase && canvasId !== 'default') {
          const { error } = await socket.data.supabase.from('canvas_messages').insert({
            id: msgObj.id,
            canvas_id: canvasId,
            user_id: socket.data.user.id,
            user_snapshot: socket.data.user,
            text: message,
            created_at: msgObj.timestamp,
          });
          if (error) {
            console.warn(`Failed to save chat message for ${canvasId}:`, error.message);
          }
        }
        canvasChats.get(canvasId)!.push(msgObj);
        io.to(canvasId).emit("new_message", msgObj);
      }
    });

    socket.on("disconnect", () => {
      const canvasId = socket.data.canvasId;
      if (canvasId) {
        const cursorsMap = canvasCursors.get(canvasId);
        if (cursorsMap) {
          cursorsMap.delete(socket.id);
          io.to(canvasId).emit("cursors_update", Array.from(cursorsMap.entries()).map(([id, data]) => ({ id, ...data })));
        }

        const canvas = canvases.get(canvasId);
        if (canvas && socket.data.user?.id) {
          const member = canvas.members[socket.data.user.id];
          if (member && member.socketId === socket.id) {
            member.isOnline = false;
            io.to(canvasId).emit("members_updated", Object.values(canvas.members));
          }
        }
      }
      console.log("Client disconnected:", socket.id);
    });
  });

  // Helper parser for Gemini responses
  const parseJsonFromMarkdown = (text: string) => {
    let clean = text.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(clean);
  };

  const getAIClient = (req: express.Request) => {
    const headerKey = req.headers['x-gemini-key'] as string;
    const apiKey = headerKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("No Gemini API key provided. Please set one in settings.");
    }
    return new GoogleGenAI({ apiKey });
  };

  app.post("/api/transcriptapi", async (req, res) => {
    try {
      const { url, apiKey } = req.body;
      if (!url || !apiKey) {
        return res.status(400).json({ error: "YouTube URL and API Key are required" });
      }

      let transcriptText = "";
      try {
        const urlToFetch = new URL("https://transcriptapi.com/api/v2/youtube/transcript");
        urlToFetch.searchParams.set("video_url", url);
        
        const response = await fetch(urlToFetch.toString(), {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`
          }
        });
        
        if (response.ok) {
           const jsonResponse = await response.json();
           if (jsonResponse.transcript && Array.isArray(jsonResponse.transcript)) {
             transcriptText = jsonResponse.transcript.map((t: any) => t.text).join(' ');
           } else {
             transcriptText = jsonResponse.transcript || JSON.stringify(jsonResponse);
           }
        } else {
           const errorBody = await response.text();
           throw new Error(`Transcript API failed (Status: ${response.status}): ${errorBody}`);
        }
      } catch (err: any) {
        console.warn("External Transcript API failed, using internal fallback. ", err);
        // Fallback to internal extractor if transcriptapi fails
        try {
          const transcript = await YoutubeTranscript.fetchTranscript(url);
          transcriptText = transcript.map(t => t.text).join(' ');
        } catch (fallbackErr: any) {
             throw new Error(`API failed: ${err.message}. Fallback also failed: ${fallbackErr.message}`);
        }
      }

      res.json({ transcript: transcriptText });
    } catch (e: any) {
      console.warn("Transcript API Error:", e);
      res.status(500).json({ error: "Failed to transcribe video using Pro API. " + (e.message || "") });
    }
  });

  app.post("/api/youtube-transcribe", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "YouTube URL is required" });
      }

      const transcript = await YoutubeTranscript.fetchTranscript(url);
      const fullText = transcript.map(t => t.text).join(' ');

      res.json({ transcript: fullText });
    } catch (e: any) {
      let msg = "Failed to transcribe video.";
      if (e.message?.includes("Transcript is disabled") || e.message?.includes("Impossible to retrieve")) {
          msg = "Free scraper failed: Transcript is disabled or URL invalid. Please use the YouTube Pro node instead.";
          console.warn("YouTube Transcribe expected failure:", msg);
      } else {
          console.error("YouTube Transcribe Error:", e);
      }
      res.status(500).json({ error: msg });
    }
  });

  app.post("/api/ai-action", async (req, res) => {
    try {
      const ai = getAIClient(req);
      const { action, text, context } = req.body;
      
      let prompt = '';
      if (action === 'improve') {
        prompt = `You are an AI editor. Please rewrite and improve the following text to make it more professional, clear, and concise. Only provide the improved text.\n\nText:\n"${text}"`;
      } else if (action === 'summarize') {
        prompt = `You are an AI summarizing assistant. Summarize the following text clearly in bullet points or a short paragraph. Only provide the summary.\n\nText:\n"${text}"`;
      } else if (action === 'subtasks') {
        prompt = `You are an AI task planner. Break down the following task into 3-5 subtasks as a JSON array of strings. Do not include any other text.\n\nTask:\n"${text}"`;
      } else if (action === 'extract_action_items') {
        prompt = `You are an AI assistant. Extract 3-5 clear action items from the following transcript or text. Format them as a simple bulleted list.\n\nText:\n"${text}"`;
      } else if (action === 'ask') {
        prompt = `You are an AI assistant answering a question based on the provided text. Keep it concise.\n\nContext:\n"${context}"\n\nQuestion:\n"${text}"`;
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const resultText = response.text;
      if (!resultText) throw new Error("No response from AI");

      if (action === 'subtasks') {
        const parsed = parseJsonFromMarkdown(resultText);
        res.json({ result: Array.isArray(parsed) ? parsed : [] });
      } else {
        res.json({ result: resultText.trim() });
      }
    } catch (e: any) {
      console.error("AI Action Error:", e);
      res.status(500).json({ error: e.message || "Failed to process AI action." });
    }
  });

  app.post("/api/auto-tag", async (req, res) => {
    try {
      const ai = getAIClient(req);
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const prompt = `
        You are an AI that tags content for better searchability.
        Analyze the following text and provide a JSON array of 1 to 4 relevant short tags (strings). Do not provide any other text.
        Tags should be short and descriptive, max 2 words each.
        
        Text:
        "${text}"
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const resultText = response.text;
      if (!resultText) throw new Error("No response from AI");

      const parsed = parseJsonFromMarkdown(resultText);
      const tags = Array.isArray(parsed) ? parsed : [];

      res.json({ tags });
    } catch (e: any) {
      console.error("Auto Tagging Error:", e);
      res.status(500).json({ error: "Failed to generate tags." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
