import express from "express";
import "dotenv/config";
import path from "path";
import fs from "fs";
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
  const PORT = process.env.PORT || 3000;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const baseSupabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

  let redisClient: any = null;
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createRedisClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log("Socket.IO Redis adapter enabled.");
      redisClient = pubClient;
    } catch (error) {
      console.warn("Redis adapter unavailable; continuing with single-process collaboration.", error);
    }
  }

  app.use(express.json());

  // Stateless Collaboration Logic (Redis with local in-memory fallback)
  const localCanvases = new Map<string, { nodes: any[], edges: any[], versions: any[] }>();
  const localChats = new Map<string, any[]>();
  const saveTimers = new Map<string, NodeJS.Timeout>();

  async function loadOrCreateCanvas(canvasId: string, supabase: any, safeUser: any): Promise<{ nodes: any[], edges: any[], versions: any[] }> {
    if (redisClient) {
      try {
        const cached = await redisClient.get(`canvas:state:${canvasId}`);
        if (cached) return JSON.parse(cached);
      } catch (err) {
        console.warn(`Redis get failed for canvas ${canvasId}:`, err);
      }
    } else {
      const cached = localCanvases.get(canvasId);
      if (cached) return cached;
    }

    let dbCanvas: any = null;
    if (supabase && canvasId !== 'default') {
      let result = await supabase
        .from('canvases')
        .select('nodes, edges, versions')
        .eq('id', canvasId)
        .maybeSingle();

      if (!result.data) {
        // Not a member yet or canvas doesn't exist. Try to join.
        await supabase
          .from('canvas_members')
          .insert({ canvas_id: canvasId, user_id: safeUser.id, role: 'editor' });

        // Try reading it again now that membership is established
        result = await supabase
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

    const state = {
      nodes: dbCanvas?.nodes || [],
      edges: dbCanvas?.edges || [],
      versions: dbCanvas?.versions || [],
    };

    // Cache the state
    if (redisClient) {
      try {
        await redisClient.setEx(`canvas:state:${canvasId}`, 86400, JSON.stringify(state));
      } catch (err) {
        console.warn(`Redis set failed for canvas ${canvasId}:`, err);
      }
    } else {
      localCanvases.set(canvasId, state);
    }

    return state;
  }

  async function getCanvasState(canvasId: string, supabase: any): Promise<{ nodes: any[], edges: any[], versions: any[] }> {
    if (redisClient) {
      try {
        const cached = await redisClient.get(`canvas:state:${canvasId}`);
        if (cached) return JSON.parse(cached);
      } catch (err) {
        console.warn(`Redis get failed for canvas ${canvasId}:`, err);
      }
    } else {
      const cached = localCanvases.get(canvasId);
      if (cached) return cached;
    }

    // Fall back to loading
    return loadOrCreateCanvas(canvasId, supabase, { id: null });
  }

  async function setCanvasState(canvasId: string, updates: { nodes?: any[], edges?: any[], versions?: any[] }, supabase: any) {
    const state = await getCanvasState(canvasId, supabase);
    if (updates.nodes !== undefined) state.nodes = updates.nodes;
    if (updates.edges !== undefined) state.edges = updates.edges;
    if (updates.versions !== undefined) state.versions = updates.versions;

    if (redisClient) {
      try {
        await redisClient.setEx(`canvas:state:${canvasId}`, 86400, JSON.stringify(state));
      } catch (err) {
        console.warn(`Redis set failed for canvas ${canvasId}:`, err);
      }
    } else {
      localCanvases.set(canvasId, state);
    }

    if (!supabase || canvasId === 'default') return;

    const existing = saveTimers.get(canvasId);
    if (existing) clearTimeout(existing);

    saveTimers.set(canvasId, setTimeout(async () => {
      const latestState = await getCanvasState(canvasId, supabase);
      const { error } = await supabase
        .from('canvases')
        .update({
          nodes: latestState.nodes,
          edges: latestState.edges,
          versions: latestState.versions,
        })
        .eq('id', canvasId);

      if (error) {
        console.warn(`Failed to persist canvas ${canvasId} to Supabase:`, error.message);
      }
      saveTimers.delete(canvasId);
    }, 600));
  }

  async function getCanvasChat(canvasId: string, supabase: any): Promise<any[]> {
    if (canvasId === 'default') {
      if (redisClient) {
        try {
          const cached = await redisClient.get(`canvas:chat:default`);
          if (cached) return JSON.parse(cached);
        } catch (err) {
          console.warn("Redis get default chat failed:", err);
        }
      } else {
        return localChats.get('default') || [];
      }
      return [];
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('canvas_messages')
        .select('id, text, user_snapshot, created_at, recipient_id')
        .eq('canvas_id', canvasId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.warn(`Unable to load chat for ${canvasId}:`, error.message);
        return [];
      }
      return (data || []).map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        user: msg.user_snapshot,
        timestamp: msg.created_at,
        recipientId: msg.recipient_id,
      }));
    }
    return [];
  }

  async function addCanvasChatMessage(canvasId: string, msgObj: any, supabase: any) {
    if (canvasId === 'default') {
      const messages = await getCanvasChat('default', null);
      messages.push(msgObj);
      if (messages.length > 100) messages.shift();

      if (redisClient) {
        try {
          await redisClient.setEx(`canvas:chat:default`, 86400, JSON.stringify(messages));
        } catch (err) {
          console.warn("Redis set default chat failed:", err);
        }
      } else {
        localChats.set('default', messages);
      }
      return;
    }

    if (supabase) {
      const { error } = await supabase.from('canvas_messages').insert({
        id: msgObj.id,
        canvas_id: canvasId,
        user_id: msgObj.user.id,
        user_snapshot: msgObj.user,
        text: msgObj.text,
        created_at: msgObj.timestamp,
        recipient_id: msgObj.recipientId || null,
      });
      if (error) {
        console.warn(`Failed to save chat message for ${canvasId}:`, error.message);
      }
    }
  }

  const COLORS = ['#ef4444', '#f97316', '#84cc16', '#0ea5e9', '#8b5cf6', '#d946ef'];
  const colorForUser = (id: string) => COLORS[id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % COLORS.length];

  async function getActiveMembers(canvasId: string, supabase: any, socketIdToExclude?: string): Promise<any[]> {
    const sockets = await io.in(canvasId).fetchSockets();
    const activeMap = new Map<string, any>();
    for (const s of sockets) {
      if (s.id !== socketIdToExclude && s.data.user) {
        activeMap.set(s.data.user.id, {
          socketId: s.id,
          cursor: s.data.cursor || { x: 0, y: 0 }
        });
      }
    }

    if (canvasId === 'default' || !supabase) {
      const members: any[] = [];
      for (const s of sockets) {
        if (s.id !== socketIdToExclude && s.data.user) {
          members.push({
            user: s.data.user,
            role: s.data.role || 'owner',
            isOnline: true,
            socketId: s.id
          });
        }
      }
      return members;
    }

    try {
      const { data, error } = await supabase.rpc('get_canvas_members', { check_canvas_id: canvasId });
      if (error) {
        console.warn(`Failed to fetch canvas members via RPC for ${canvasId}:`, error.message);
        return [];
      }

      const allMembers = (data || []).map((m: any) => {
        const active = activeMap.get(m.user_id);
        return {
          user: {
            id: m.user_id,
            email: m.email,
            name: m.name,
            color: colorForUser(m.user_id)
          },
          role: m.role,
          isOnline: active !== undefined,
          socketId: active ? active.socketId : undefined
        };
      });

      return allMembers;
    } catch (err) {
      console.error(`Error in getActiveMembers for ${canvasId}:`, err);
      return [];
    }
  }

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

      // 1. Fetch canvas state
      const canvasState = await loadOrCreateCanvas(canvasId, socket.data.supabase, safeUser);

      // 2. Fetch/Determine role
      let role: 'owner' | 'editor' | 'viewer' = 'editor';
      if (socket.data.supabase && canvasId !== 'default') {
        const { data } = await socket.data.supabase
          .from('canvas_members')
          .select('role')
          .eq('canvas_id', canvasId)
          .eq('user_id', safeUser.id)
          .maybeSingle();
        if (data) {
          role = data.role;
        } else {
          const { data: canvasData } = await socket.data.supabase
            .from('canvases')
            .select('owner_id')
            .eq('id', canvasId)
            .maybeSingle();
          if (canvasData && canvasData.owner_id === safeUser.id) {
            role = 'owner';
          }
        }
      } else if (canvasId === 'default') {
        role = 'owner';
      }
      socket.data.role = role;

      // Initialize cursor position on this socket
      socket.data.cursor = { x: 0, y: 0 };

      // 3. Emit initial state to this socket
      socket.emit("init_canvas", canvasState);

      const messages = await getCanvasChat(canvasId, socket.data.supabase);
      socket.emit("init_chat", messages);
      socket.emit("versions_updated", canvasState.versions);

      // 4. Fetch all active members in the room and broadcast
      const members = await getActiveMembers(canvasId, socket.data.supabase);
      io.to(canvasId).emit("members_updated", members);

      // 5. Fetch all cursors in the room and emit to this socket, and broadcast cursor change
      const sockets = await io.in(canvasId).fetchSockets();
      const cursors = sockets
        .map(s => ({
          id: s.id,
          user: s.data.user,
          position: s.data.cursor || { x: 0, y: 0 }
        }))
        .filter(c => c.user !== undefined);

      io.to(canvasId).emit("cursors_update", cursors);
    });

    socket.on("add_member", async ({ email, role }) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && socket.data.role === 'owner') {
        if (socket.data.supabase && canvasId !== 'default') {
          // 1. Look up user by email
          const { data: userData, error: userError } = await socket.data.supabase.rpc('get_user_by_email', { email_to_find: email });
          if (userError || !userData) {
            socket.emit("add_member_error", "User not found with this email.");
            return;
          }

          // 2. Insert into canvas_members
          const { error: insertError } = await socket.data.supabase
            .from('canvas_members')
            .insert({ canvas_id: canvasId, user_id: userData.id, role });
          
          if (insertError) {
            console.warn("Failed to add canvas member:", insertError.message);
            socket.emit("add_member_error", "User is already a member of this canvas.");
            return;
          }

          // 3. Broadcast updated members list
          const members = await getActiveMembers(canvasId, socket.data.supabase);
          io.to(canvasId).emit("members_updated", members);
          
          socket.emit("add_member_success");
        }
      }
    });

    socket.on("update_member_role", async ({ userId, role }) => {
      const canvasId = socket.data.canvasId;
      if (canvasId) {
        const requesterId = socket.data.user?.id;
        const requesterRole = socket.data.role;

        if (requesterRole === 'owner') {
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

            // Update role on any active sockets for this user
            const targetSockets = await io.in(canvasId).fetchSockets();
            for (const s of targetSockets) {
              if (s.data.user?.id === userId) {
                s.data.role = role;
              }
            }

            const members = await getActiveMembers(canvasId, socket.data.supabase);
            io.to(canvasId).emit("members_updated", members);
          }
        }
      }
    });

    socket.on("kick_member", async (userId) => {
      const canvasId = socket.data.canvasId;
      if (canvasId) {
        const requesterId = socket.data.user?.id;
        const requesterRole = socket.data.role;

        if (requesterRole === 'owner' && userId !== requesterId) {
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

          // Disconnect all sockets belonging to the kicked user in this room
          const targetSockets = await io.in(canvasId).fetchSockets();
          for (const s of targetSockets) {
            if (s.data.user?.id === userId) {
              s.emit("kicked");
              s.leave(canvasId);
              s.disconnect(true);
            }
          }

          // Broadcast updated member list and cursor list
          const members = await getActiveMembers(canvasId, socket.data.supabase);
          io.to(canvasId).emit("members_updated", members);

          const sockets = await io.in(canvasId).fetchSockets();
          const cursors = sockets
            .map(s => ({
              id: s.id,
              user: s.data.user,
              position: s.data.cursor || { x: 0, y: 0 }
            }))
            .filter(c => c.user !== undefined);
          io.to(canvasId).emit("cursors_update", cursors);
        }
      }
    });

    socket.on("cursor_move", ({ x, y }) => {
      const canvasId = socket.data.canvasId;
      if (canvasId) {
        socket.data.cursor = { x, y };
        socket.to(canvasId).emit("cursor_moved", { id: socket.id, position: { x, y } });
      }
    });

    socket.on("update_nodes", async (nodes) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && socket.data.role !== 'viewer') {
        await setCanvasState(canvasId, { nodes }, socket.data.supabase);
        socket.to(canvasId).emit("nodes_updated", nodes);
      }
    });

    socket.on("update_edges", async (edges) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && socket.data.role !== 'viewer') {
        await setCanvasState(canvasId, { edges }, socket.data.supabase);
        socket.to(canvasId).emit("edges_updated", edges);
      }
    });

    socket.on("save_version", async (versionName) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && socket.data.role !== 'viewer') {
        const state = await getCanvasState(canvasId, socket.data.supabase);
        const newVersion = {
          id: randomUUID(),
          timestamp: new Date().toISOString(),
          author: socket.data.user,
          name: versionName || `Version ${state.versions.length + 1}`,
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges))
        };
        const updatedVersions = [newVersion, ...state.versions];
        await setCanvasState(canvasId, { versions: updatedVersions }, socket.data.supabase);
        io.to(canvasId).emit("versions_updated", updatedVersions);
      }
    });

    socket.on("restore_version", async (versionId) => {
      const canvasId = socket.data.canvasId;
      if (canvasId && socket.data.role !== 'viewer') {
        const state = await getCanvasState(canvasId, socket.data.supabase);
        const version = state.versions.find((v: any) => v.id === versionId);
        if (version) {
          const restoredNodes = JSON.parse(JSON.stringify(version.nodes));
          const restoredEdges = JSON.parse(JSON.stringify(version.edges));
          
          // Create restore version marker
          const newVersion = {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            author: socket.data.user,
            name: `Restored to ${version.name}`,
            nodes: restoredNodes,
            edges: restoredEdges
          };
          const updatedVersions = [newVersion, ...state.versions];
          
          await setCanvasState(canvasId, {
            nodes: restoredNodes,
            edges: restoredEdges,
            versions: updatedVersions
          }, socket.data.supabase);

          io.to(canvasId).emit("nodes_updated", restoredNodes);
          io.to(canvasId).emit("edges_updated", restoredEdges);
          io.to(canvasId).emit("versions_updated", updatedVersions);
        }
      }
    });

    socket.on("send_message", async (data) => {
      const canvasId = socket.data.canvasId;
      if (canvasId) {
        const isObject = typeof data === 'object' && data !== null;
        const text = isObject ? data.text : data;
        const recipientId = isObject ? data.recipientId : null;

        const msgObj = {
          id: randomUUID(),
          user: socket.data.user,
          text,
          timestamp: new Date().toISOString(),
          recipientId
        };
        await addCanvasChatMessage(canvasId, msgObj, socket.data.supabase);
        
        if (recipientId) {
          // Private DM: send only to sender and recipient active connections
          const targetSockets = await io.in(canvasId).fetchSockets();
          for (const s of targetSockets) {
            if (s.data.user?.id === recipientId || s.data.user?.id === socket.data.user?.id) {
              s.emit("new_message", msgObj);
            }
          }
        } else {
          // Public message: broadcast to the whole room
          io.to(canvasId).emit("new_message", msgObj);
        }
      }
    });

    socket.on("disconnect", async () => {
      const canvasId = socket.data.canvasId;
      console.log("Client disconnected:", socket.id);
      
      if (canvasId) {
        // 1. Broadcast updated members (excluding this socket)
        const members = await getActiveMembers(canvasId, socket.data.supabase, socket.id);
        io.to(canvasId).emit("members_updated", members);

        // 2. Broadcast updated cursors (excluding this socket)
        const activeSockets = await io.in(canvasId).fetchSockets();
        const cursors = activeSockets
          .filter(s => s.id !== socket.id && s.data.user !== undefined)
          .map(s => ({
            id: s.id,
            user: s.data.user,
            position: s.data.cursor || { x: 0, y: 0 }
          }));
        io.to(canvasId).emit("cursors_update", cursors);
      }
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

  app.post("/api/action", async (req, res) => {
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
      if (!resultText) throw new Error("No response from the model");

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
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      try {
        const indexPath = path.join(distPath, "index.html");
        let html = fs.readFileSync(indexPath, "utf-8");
        
        // Inject runtime environment variables into window.ENV
        const envScript = `
          <script>
            window.ENV = {
              VITE_SUPABASE_URL: "${process.env.VITE_SUPABASE_URL || ''}",
              VITE_SUPABASE_ANON_KEY: "${process.env.VITE_SUPABASE_ANON_KEY || ''}"
            };
          </script>
        `;
        html = html.replace("</head>", `${envScript}</head>`);
        res.send(html);
      } catch (err) {
        console.error("Error reading index.html for injection:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
