import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { chatRouter } from "./chatRouter";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Register Stream/Live Chat API router
app.use("/api/chat", chatRouter);

// Initialize Google Gemini API securely
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not set. AI chat will run in mock fallback mode.");
  }
} catch (error) {
  console.error("Error initializing Gemini client:", error);
}

// REST API for Gemini Chat and Code Editing in the Virtual Workspace
app.post("/api/builder/chat", async (req, res) => {
  const { prompt, files, systemInstructions, modelName } = req.body;

  if (!prompt || !files) {
    return res.status(400).json({ error: "Missing prompt or files parameter." });
  }

  const selectedModel = modelName || "gemini-2.5-flash";

  // If no API key is available, use a fallback mock assistant
  if (!ai) {
    return res.json({
      chatResponse: "### Fallback Mock Assistant\n\nIt looks like `GEMINI_API_KEY` is not set in your Secrets. Please add your key to enable the real Gemini model.\n\nI have mock-completed your request: *" + prompt + "*. I've updated the homepage to reflect your changes!",
      fileChanges: [
        {
          path: "src/App.tsx",
          content: files["src/App.tsx"] ? files["src/App.tsx"].replace(
            "● PUSHPLAY LIVE FEED",
            "● PUSHPLAY LIVE FEED (" + prompt.slice(0, 30) + "...)"
          ) : ""
        }
      ],
      actionHistory: ["Edited 1 file (src/App.tsx)", "Mock Built Successfully"],
      updatedStatus: "Updated App.tsx with mock changes."
    });
  }

  try {
    const formattedFiles = Object.entries(files)
      .map(([filepath, content]) => `--- File: ${filepath} ---\n${content}`)
      .join("\n\n");

    const systemPrompt = `
You are an advanced, autonomous AI coding agent operating inside a professional app builder workspace named "PushPlay Studio AI".
The user is building/modifying a high-fidelity multimedia video streaming application named "PushPlay Live" (the app in their virtual workspace).

Here is the current state of the virtual workspace files:
${formattedFiles}

Your task:
1. Carefully analyze the user's instructions: "${prompt}".
2. Modify or write the React/TypeScript/JSON code in the virtual workspace files to fulfill the request. You should only modify files that are relevant to the user's request.
3. Keep the styling clean and in a dark theme, matching the screenshot's aesthetics (use Arial/Inter sans-serif fonts, golden amber highlights #f59e0b, deep grays).
4. Do NOT output markdown code blocks in your main thoughts. Instead, modify the files directly in the "fileChanges" array.
5. In your "chatResponse" field, provide a professional, friendly, and concise explanation (using Markdown format) of what changes you made. Do not use flowery or self-praising words like "stellar" or "gorgeous".
6. Specify the concrete files changed in "fileChanges". You must return the FULL updated content of any file you choose to modify.
7. Return an "actionHistory" list of accomplishments (e.g. ["Edited 1 file (src/components/UploadModal.tsx)", "Built"]).
8. Provide a short "updatedStatus" summary.

Instructions constraint:
${systemInstructions || "You are a helpful coding assistant specialized in React and CSS."}

You must respond strictly in JSON matching this schema:
{
  "chatResponse": "Markdown text describing changes",
  "fileChanges": [
    {
      "path": "path/to/file.tsx",
      "content": "Full code content of the modified file"
    }
  ],
  "actionHistory": ["Edited 1 file", "Built"],
  "updatedStatus": "Status overview text"
}
`;

    let response;
    try {
      console.log(`Attempting generateContent using model: ${selectedModel}`);
      response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chatResponse: {
                type: Type.STRING,
                description: "Markdown text describing what you updated and answering the user's questions.",
              },
              fileChanges: {
                type: Type.ARRAY,
                description: "Array of files that you modified. Provide the complete and updated contents of each file.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING, description: "The virtual file path (e.g., src/App.tsx)." },
                    content: { type: Type.STRING, description: "The complete updated content for this file." },
                  },
                  required: ["path", "content"],
                },
              },
              actionHistory: {
                type: Type.ARRAY,
                description: "A list of action steps you took (e.g. ['Edited 1 file', 'Built']).",
                items: { type: Type.STRING },
              },
              updatedStatus: {
                type: Type.STRING,
                description: "A short, one-sentence status update of the application.",
              },
            },
            required: ["chatResponse", "fileChanges", "actionHistory", "updatedStatus"],
          },
        },
      });
    } catch (modelError: any) {
      if (selectedModel !== "gemini-2.5-flash") {
        console.warn(`Model ${selectedModel} failed (${modelError.message || modelError}). Falling back to stable gemini-2.5-flash...`);
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                chatResponse: {
                  type: Type.STRING,
                  description: "Markdown text describing what you updated and answering the user's questions.",
                },
                fileChanges: {
                  type: Type.ARRAY,
                  description: "Array of files that you modified. Provide the complete and updated contents of each file.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      path: { type: Type.STRING, description: "The virtual file path (e.g., src/App.tsx)." },
                      content: { type: Type.STRING, description: "The complete updated content for this file." },
                    },
                    required: ["path", "content"],
                  },
                },
                actionHistory: {
                  type: Type.ARRAY,
                  description: "A list of action steps you took (e.g. ['Edited 1 file', 'Built']).",
                  items: { type: Type.STRING },
                },
                updatedStatus: {
                  type: Type.STRING,
                  description: "A short, one-sentence status update of the application.",
                },
              },
              required: ["chatResponse", "fileChanges", "actionHistory", "updatedStatus"],
            },
          },
        });
      } else {
        throw modelError;
      }
    }

    const resultText = response.text;
    res.json(JSON.parse(resultText || "{}"));
  } catch (error: any) {
    console.error("Gemini compilation error:", error);
    res.status(500).json({ error: error.message || "Failed to process request with Gemini." });
  }
});

// Configure Vite or Serve Static Files
async function startServer() {
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
