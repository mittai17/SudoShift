import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { randomUUID } from "crypto";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  // API 1: Smart Brain Dump - Unstructured text to Eisenhower Matrix
  app.post("/api/brain-dump", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const prompt = `
        You are a highly analytical productivity engine. 
        Given the unstructured brain dump below, break it down into actionable tasks.
        Assign an Eisenhower matrix category to each. Estimate a deadline if implied (use ISO 8601 format, relative to today), or return null for the deadline.
        Ensure output is exclusively valid JSON array matching this format:
        [
          {
            "title": "Task name",
            "description": "Brief context",
            "matrix": "DO" | "DECIDE" | "DELEGATE" | "DELETE",
            "deadline": "YYYY-MM-DD" | null,
            "estimatedMinutes": 30
          }
        ]
        
        Brain Dump:
        "${text}"
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const resultText = response.text;
      if (!resultText) throw new Error("No response from AI");
      
      const parsed = parseJsonFromMarkdown(resultText);

      // Mutate parsed to include unique IDs
      const nodes = parsed.map((item: any) => ({
        id: randomUUID(),
        ...item
      }));

      res.json({ nodes });
    } catch (e: any) {
      console.error("Brain Dump Error:", e);
      res.status(500).json({ error: "Failed to process brain dump." });
    }
  });

  // API 2: YouTube Action Extractor - Unstructured URL/Topic into mapped action steps
  app.post("/api/youtube-extract", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Context/URL is required" });
      }

      const prompt = `
        You are extracting a step-by-step actionable roadmap based on the provided video title, topic, or URL.
        Construct 3-5 sequential actionable steps to accomplish the core concept.
        Return output as EXCLUSIVELY valid JSON array:
        [
          {
            "title": "Action title",
            "description": "Brief context",
            "matrix": "DO" | "DECIDE",
            "deadline": null,
            "estimatedMinutes": 60
          }
        ]

        Video/Content Context:
        "${url}"
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const resultText = response.text;
      if (!resultText) throw new Error("No response from AI");
      
      const parsed = parseJsonFromMarkdown(resultText);
      
      const nodes = parsed.map((item: any) => ({
        id: randomUUID(),
        ...item
      }));

      res.json({ nodes });
    } catch (e: any) {
      console.error("YouTube Extract Error:", e);
      res.status(500).json({ error: "Failed to process youtube extraction." });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
