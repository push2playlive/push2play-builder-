import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const chatRouter = Router();

// Securely access the Gemini key from process.env (not exposed to client)
let chatAi: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    chatAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build-chat-api",
        },
      },
    });
  }
} catch (err) {
  console.error("Failed to initialize Gemini client in Chat API module:", err);
}

// In-memory data storage for real-time room chats and stream feeds
interface ChatMessage {
  id: string;
  roomId: string;
  author: string;
  text: string;
  timestamp: string;
  role: "user" | "creator" | "system" | "bot";
  badge?: string;
  gift?: {
    name: string;
    icon: string;
    coins: number;
  };
}

const chatMessages: Record<string, ChatMessage[]> = {
  "vid-1": [
    { id: "m-1", roomId: "vid-1", author: "Caleb Vance", text: "Prophetic dating alignments are fascinating. Is there any correlation with solar eclipses?", timestamp: "12:04 PM", role: "user" },
    { id: "m-2", roomId: "vid-1", author: "Serene_Spirit", text: "Welcome everyone! Keep it peaceful in the live feed.", timestamp: "12:05 PM", role: "creator", badge: "Host" },
    { id: "m-3", roomId: "vid-1", author: "Aries_Star", text: "Watching this from Wellington! Clear sound quality.", timestamp: "12:06 PM", role: "user" }
  ],
  "vid-2": [
    { id: "m-4", roomId: "vid-2", author: "WalksWorld", text: "The city lights are amazing, what filter is that?", timestamp: "04:15 PM", role: "user" },
    { id: "m-5", roomId: "vid-2", author: "TokyoDrifter", text: "Reminds me of central Shibuya. Clean framing!", timestamp: "04:17 PM", role: "user" }
  ],
  "vid-3": [
    { id: "m-6", roomId: "vid-3", author: "TacticalPro", text: "Flagged or not, the engineering stats on these are pure history.", timestamp: "09:30 AM", role: "user" },
    { id: "m-7", roomId: "vid-3", author: "System Moderation", text: "This channel is currently under investigation review.", timestamp: "09:32 AM", role: "system" }
  ]
};

// Retrieve available channels/rooms
chatRouter.get("/rooms", (req: Request, res: Response) => {
  res.json({
    status: "success",
    rooms: Object.keys(chatMessages).map(roomId => ({
      roomId,
      messageCount: chatMessages[roomId].length,
      isLive: roomId !== "vid-3"
    }))
  });
});

// Retrieve message logs for a specific room
chatRouter.get("/messages/:roomId", (req: Request, res: Response) => {
  const { roomId } = req.params;
  const messages = chatMessages[roomId] || [];
  res.json({
    status: "success",
    roomId,
    messages
  });
});

// Post a new message to a stream chat room, with simulated AI interactive replies
chatRouter.post("/messages/:roomId", async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { author, text, role, badge } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing required message text parameter." });
  }

  const roomMsgs = chatMessages[roomId] || [];
  
  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    roomId,
    author: author || "Anonymous Curator",
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    role: role || "user",
    badge
  };

  roomMsgs.push(newMessage);
  chatMessages[roomId] = roomMsgs;

  // Let's trigger a realistic automated AI reply or response from the stream owner/participants to make the live chat incredibly engaging
  let botReply: ChatMessage | null = null;
  if (text.toLowerCase().includes("hello") || text.toLowerCase().includes("hi") || text.toLowerCase().includes("anyone")) {
    botReply = {
      id: `msg-bot-${Date.now()}`,
      roomId,
      author: "PushPlay Assistant Bot",
      text: `Hello ${author || "Viewer"}! Welcome to the secure live stream node. Check our stats inside the Mod Dashboard if you have Admin access keys.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      role: "bot",
      badge: "AI Mod"
    };
  } else if (chatAi) {
    try {
      // Use Gemini to produce an intelligent context-aware stream comment reply
      const model = "gemini-2.5-flash";
      const prompt = `You are a live viewer on a video platform chat stream.
Room ID: ${roomId}
User "${author || "Anonymous"}" says: "${text}"
Write a short, casual live chat message (under 15 words) replying to this comment or reacting to the stream. Do not use emojis, and don't prefix with anything.`;

      const response = await chatAi.models.generateContent({
        model,
        contents: prompt
      });

      const replyText = response.text?.trim() || "";
      if (replyText) {
        botReply = {
          id: `msg-ai-${Date.now()}`,
          roomId,
          author: "Gemini AI Viewer",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          role: "bot",
          badge: "Gemini VIP"
        };
      }
    } catch (e) {
      console.warn("Gemini automated chat reply warning:", e);
    }
  }

  if (botReply) {
    roomMsgs.push(botReply);
    chatMessages[roomId] = roomMsgs;
  }

  res.json({
    status: "success",
    message: newMessage,
    reply: botReply
  });
});

// Trigger a gift dispatch simulation on a stream channel
chatRouter.post("/gift", (req: Request, res: Response) => {
  const { roomId, sender, giftName, coins } = req.body;

  if (!roomId || !giftName || !coins) {
    return res.status(400).json({ error: "Missing gift parameter details." });
  }

  const roomMsgs = chatMessages[roomId] || [];
  
  const giftMessage: ChatMessage = {
    id: `gift-${Date.now()}`,
    roomId,
    author: sender || "Generous Supporter",
    text: `sent a ${giftName}!`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    role: "system",
    gift: {
      name: giftName,
      icon: giftName === "Crown" ? "👑" : giftName === "Gem" ? "💎" : giftName === "Fire" ? "🔥" : "🎁",
      coins: Number(coins)
    }
  };

  roomMsgs.push(giftMessage);
  chatMessages[roomId] = roomMsgs;

  res.json({
    status: "success",
    giftMessage
  });
});
