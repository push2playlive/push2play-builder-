import { getSettings } from "./settings";
import { supabaseEnabled } from "./supabase";
import { createClient } from "@supabase/supabase-js";

export interface ProxyRequest {
  prompt: string;
  files: Record<string, string>;
  systemInstructions?: string;
  modelName: string;
}

export interface ProxyResponse {
  chatResponse: string;
  fileChanges?: { path: string; content: string }[];
  actionHistory?: string[];
  updatedStatus?: string;
  error?: string;
}

/**
 * Main AI Request Router
 * Routes requests to Gemini (server-side) or Ollama (local-client),
 * and optionally logs execution metrics & actions to Supabase.
 */
export async function routeAIRequest(req: ProxyRequest): Promise<ProxyResponse> {
  const settings = getSettings();
  const activeModel = req.modelName;

  let response: ProxyResponse;

  try {
    // 1. Route based on active model selection
    if (activeModel === "ollama" || activeModel.startsWith("ollama:")) {
      response = await routeToOllama(req);
    } else {
      response = await routeToGemini(req);
    }

    // 2. Log to Supabase if configured & enabled
    await logTransactionToSupabase(req, response);

    return response;
  } catch (err: any) {
    console.error("Proxy layer execution failed:", err);
    return {
      chatResponse: `🚨 **Proxy Layer Exception**:\n\n${err.message || "An error occurred while routing the prompt."}`,
      fileChanges: [],
      actionHistory: ["Proxy Error Raised"],
      updatedStatus: "Failed to route or compile AI changes."
    };
  }
}

/**
 * Route to local Ollama API
 */
async function routeToOllama(req: ProxyRequest): Promise<ProxyResponse> {
  const settings = getSettings();
  const ollamaUrl = settings.ollamaUrl || "http://localhost:11434";
  const usedModel = settings.ollamaModel || "qwen2.5-coder";

  const formattedFiles = Object.entries(req.files)
    .map(([filepath, content]) => `--- File: ${filepath} ---\n${content}`)
    .join("\n\n");

  const systemPrompt = `
You are an advanced, autonomous AI coding agent operating inside a professional app builder workspace named "PushPlay Studio AI".
The user is building/modifying a high-fidelity multimedia video streaming application named "PushPlay Live" (the app in their virtual workspace).

Here is the current state of the virtual workspace files:
${formattedFiles}

Your task:
1. Carefully analyze the user's instructions: "${req.prompt}".
2. Modify or write the React/TypeScript/JSON code in the virtual workspace files to fulfill the request. You should only modify files that are relevant to the user's request.
3. Keep the styling clean and in a dark theme, matching the screenshot's aesthetics (use Arial/Inter sans-serif fonts, golden amber highlights #f59e0b, deep grays).
4. Do NOT output markdown code blocks in your main thoughts. Instead, modify the files directly in the "fileChanges" array.
5. In your "chatResponse" field, provide a professional, friendly, and concise explanation (using Markdown format) of what changes you made. Do not use flowery or self-praising words like "stellar" or "gorgeous".
6. Specify the concrete files changed in "fileChanges". You must return the FULL updated content of any file you choose to modify.
7. Return an "actionHistory" list of accomplishments (e.g. ["Edited 1 file (src/components/UploadModal.tsx)", "Built"]).
8. Provide a short "updatedStatus" summary.

You must respond strictly in valid JSON matching this schema:
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

  const res = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: usedModel,
      prompt: systemPrompt,
      stream: false,
      options: {
        temperature: 0.2
      },
      format: "json"
    })
  });

  if (!res.ok) {
    throw new Error(`Ollama responded with status code ${res.status}`);
  }

  const data = await res.json();
  const textResponse = data.response || "";

  try {
    const parsed = JSON.parse(textResponse);
    return {
      chatResponse: parsed.chatResponse || "Processed successfully by Ollama.",
      fileChanges: parsed.fileChanges || [],
      actionHistory: parsed.actionHistory || ["Ollama Execution Completed"],
      updatedStatus: parsed.updatedStatus || "Ollama compiled changes."
    };
  } catch (err) {
    console.warn("Failed to parse Ollama output as JSON. Output:", textResponse);
    return {
      chatResponse: textResponse || "No response received from local Ollama.",
      fileChanges: [],
      actionHistory: ["Raw Ollama output parsed"],
      updatedStatus: "Raw text fallback returned by local Ollama."
    };
  }
}

/**
 * Route to Server-side Gemini Workspace Endpoint
 */
async function routeToGemini(req: ProxyRequest): Promise<ProxyResponse> {
  const response = await fetch("/api/builder/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: req.prompt,
      files: req.files,
      systemInstructions: req.systemInstructions || "You are a virtual engineering workspace and code architect for PushPlay Live.",
      modelName: req.modelName
    })
  });

  if (!response.ok) {
    let errorMessage = `Failed to contact the server-side Gemini workspace endpoint (Status: ${response.status}).`;
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMessage = data.error;
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return {
    chatResponse: data.chatResponse,
    fileChanges: data.fileChanges,
    actionHistory: data.actionHistory,
    updatedStatus: data.updatedStatus
  };
}

/**
 * Log Execution Transaction to Supabase
 */
async function logTransactionToSupabase(req: ProxyRequest, resp: ProxyResponse): Promise<void> {
  const settings = getSettings();
  const url = settings.supabaseUrl;
  const key = settings.supabaseAnonKey;

  if (!url || !key) return;

  try {
    const client = createClient(url, key);
    // Attempt logging to standard system/build tables if schemas support it
    await client.from("ai_logs").insert({
      prompt: req.prompt,
      model_name: req.modelName,
      chat_response: resp.chatResponse,
      file_changes: resp.fileChanges,
      status: resp.updatedStatus,
      created_at: new Date().toISOString()
    }).select().limit(1);
  } catch (err) {
    // Graceful fallback logger
    console.debug("Supabase proxy logging bypassed (non-existent table or layout diff):", err);
  }
}
