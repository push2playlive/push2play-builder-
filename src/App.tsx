/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  Search,
  Plus,
  Bell,
  User,
  Home,
  Film,
  Music,
  List,
  Clock,
  Heart,
  History,
  Wallet,
  Store,
  ShieldAlert,
  Award,
  Trash2,
  CheckCircle,
  Send,
  Upload,
  Video,
  X,
  FileCode,
  Folder,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Sliders,
  MessageSquare,
  Settings,
  Terminal,
  Save,
  Undo,
  Redo,
  Copy,
  ExternalLink,
  Maximize2,
  CornerDownRight,
  Sparkles,
  Laptop,
  Phone,
  Flame,
  Check,
  AlertCircle,
  FileJson,
  Moon,
  Zap,
  Lock,
  Coins,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  Database,
  Cpu,
  Globe,
  Key,
  Activity,
  LogIn,
  LogOut
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { DEFAULT_VIRTUAL_FILES } from "./virtualFiles";
import { buildPreviewSrcDoc } from "./lib/preview";
import SettingsModal from "./components/SettingsModal";
import { routeAIRequest } from "./lib/proxy";
import { listModels } from "./lib/ollama";
export interface VirtualVideo {
  id: string;
  title: string;
  duration: string;
  author: string;
  views: number;
  uploadedAt: string;
  thumbnail: string;
  category: string;
  description: string;
  likes: number;
  reports?: number;
  isReported?: boolean;
  investigationStatus?: "Submitted" | "Under Review" | "Action Taken" | "Closed";
}

export interface VirtualComment {
  id: string;
  videoId: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface VirtualCreator {
  name: string;
  avatar: string;
  subscribers: string;
  isLive: boolean;
}

export default function App() {
  // --- Workspace State ---
  const [virtualFiles, setVirtualFiles] = useState<Record<string, string>>(() => {
    // Try to load from localStorage first for persistence
    const saved = localStorage.getItem("pp_studio_virtual_files");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let hasUpdates = false;
        // Merge missing default virtual files so new additions are always available
        for (const key of Object.keys(DEFAULT_VIRTUAL_FILES)) {
          if (parsed[key] === undefined) {
            parsed[key] = DEFAULT_VIRTUAL_FILES[key];
            hasUpdates = true;
          }
        }
        if (hasUpdates) {
          localStorage.setItem("pp_studio_virtual_files", JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing saved virtual files", e);
      }
    }
    return DEFAULT_VIRTUAL_FILES;
  });
  
  const [activeFile, setActiveFile] = useState<string>("src/data.ts");
  const [openTabs, setOpenTabs] = useState<string[]>([
    "metadata.json",
    "src/data.ts",
    "src/components/Navigation.tsx"
  ]);
  const [editorContent, setEditorContent] = useState<string>("");
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, boolean>>({});
  
  // --- AI Chat Assistant State ---
  const [chatInput, setChatInput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [modelName, setModelName] = useState("gemini-2.5-flash");
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  useEffect(() => {
    const fetchOllama = async () => {
      try {
        const list = await listModels();
        if (list && list.length > 0) {
          setOllamaModels(list.map(m => m.name));
        }
      } catch (err) {
        console.warn("Could not load local Ollama models:", err);
      }
    };
    fetchOllama();
  }, []);
  const [actionHistory, setActionHistory] = useState<string[]>([
    "Initialized PushPlay Studio workspace",
    "Compiled successfully"
  ]);
  const [latestStatus, setLatestStatus] = useState("Build Successful. Ready for preview.");
  
  const [chatHistory, setChatHistory] = useState<Array<{
    sender: "user" | "ai" | "system";
    text: string;
    timestamp: string;
    actionHistory?: string[];
    status?: string;
  }>>([
    {
      sender: "ai",
      text: "### Welcome to PushPlay Studio AI! 🎬\n\nI am your advanced server-side Gemini coding assistant. I can help you design, test, and write high-fidelity features for the **PushPlay Live** streaming platform in your virtual workspace.\n\n**Here are a few things you can ask me to do:**\n* *\"Add a Search Filter to the top of the video grid\"*\n* *\"Style the header with an amber color and custom branding\"*\n* *\"Add an interactive creator staking feature inside the Wallet tab\"*\n* *\"Build a step-by-step investigation stepper for flagged videos\"*\n\nGo ahead and type your prompt below, or edit the workspace files directly!",
      timestamp: "Just now"
    }
  ]);

  // --- Live Preview Settings ---
  const [activePreviewTab, setActivePreviewTab] = useState<"preview" | "sandbox" | "code">("preview");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // --- Dynamic App Simulator State (Parsed from files) ---
  const [appConfig, setAppConfig] = useState({
    name: "PushPlay Live",
    theme: "dark",
    accentColor: "#f59e0b",
    tokenCount: 2500,
    features: {
      comments: true,
      upload: true,
      reports: true,
      creatorEconomy: true
    },
    adminConfig: {
      ollamaCapable: true,
      ollamaApiEndpoint: "http://localhost:11434",
      ollamaModel: "llama3",
      agentApiUrl: "https://api.pushplay.live/agent",
      agentUri: "pp://agent-uri-handler",
      supabaseUrl: "https://your-supabase-project.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  });

  const [adminSubTab, setAdminSubTab] = useState<"moderation" | "integrations" | "health">("moderation");

  // --- Simulated Authentication State ---
  const [isSimLoggedIn, setIsSimLoggedIn] = useState<boolean>(true);
  const [simUserEmail, setSimUserEmail] = useState<string>("nexusos@commandnexus.net");
  const [simUserRole, setSimUserRole] = useState<"admin" | "member">("admin");
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // --- API Health Diagnostics States ---
  const [agentHealthStatus, setAgentHealthStatus] = useState<"idle" | "checking" | "connected" | "failed" | "timeout">("idle");
  const [agentLatency, setAgentLatency] = useState<number | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [supabaseHealthStatus, setSupabaseHealthStatus] = useState<"idle" | "checking" | "connected" | "failed" | "timeout">("idle");
  const [supabaseLatency, setSupabaseLatency] = useState<number | null>(null);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<string | null>(null);
  const [isDiagnosticPressed, setIsDiagnosticPressed] = useState<boolean>(false);

  const runApiHealthDiagnostics = async () => {
    setAgentHealthStatus("checking");
    setSupabaseHealthStatus("checking");
    setAgentLatency(null);
    setSupabaseLatency(null);
    setAgentError(null);
    setSupabaseError(null);

    const targetAgentUrl = appConfig.adminConfig?.agentApiUrl || "https://api.pushplay.live/agent";
    const targetSupabaseUrl = appConfig.adminConfig?.supabaseUrl || "https://your-supabase-project.supabase.co";

    const pingUrl = async (url: string) => {
      const startTime = performance.now();
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 4000);
        
        await fetch(url, {
          method: "GET",
          mode: "no-cors",
          signal: controller.signal
        });
        clearTimeout(id);
        const duration = Math.round(performance.now() - startTime);
        return { status: "connected" as const, latency: duration, error: null };
      } catch (err: any) {
        const duration = Math.round(performance.now() - startTime);
        if (err.name === "AbortError" || err.message?.includes("aborted")) {
          return { status: "timeout" as const, latency: duration, error: "Connection Timed Out (4s)" };
        }
        return { status: "failed" as const, latency: duration, error: err.message || "Network Error" };
      }
    };

    const [agentRes, supabaseRes] = await Promise.all([
      pingUrl(targetAgentUrl),
      pingUrl(targetSupabaseUrl)
    ]);

    setAgentHealthStatus(agentRes.status);
    setAgentLatency(agentRes.latency);
    setAgentError(agentRes.error);

    setSupabaseHealthStatus(supabaseRes.status);
    setSupabaseLatency(supabaseRes.latency);
    setSupabaseError(supabaseRes.error);

    setLastCheckedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  };

  useEffect(() => {
    if (adminSubTab === "health") {
      runApiHealthDiagnostics();
    }
  }, [adminSubTab]);

  // --- Local states for Integrations & API Form ---
  const [localOllamaCapable, setLocalOllamaCapable] = useState(true);
  const [localOllamaApi, setLocalOllamaApi] = useState("");
  const [localOllamaModel, setLocalOllamaModel] = useState("");
  const [localAgentApi, setLocalAgentApi] = useState("");
  const [localAgentUri, setLocalAgentUri] = useState("");
  const [localSupabaseUrl, setLocalSupabaseUrl] = useState("");
  const [localSupabaseKey, setLocalSupabaseKey] = useState("");

  const [videos, setVideos] = useState<VirtualVideo[]>([]);
  const [comments, setComments] = useState<VirtualComment[]>([]);
  const [creators, setCreators] = useState<VirtualCreator[]>([]);
  const [buildError, setBuildError] = useState<string | null>(null);

  // --- Simulated Live App UI Navigation ---
  const [simActiveTab, setSimActiveTab] = useState("home");
  const [selectedVideo, setSelectedVideo] = useState<VirtualVideo | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingVideoId, setReportingVideoId] = useState<string | null>(null);
  const [simCategory, setSimCategory] = useState("All");

  // --- Staking Simulated state ---
  const [stakedAmount, setStakedAmount] = useState(500);
  const [isStakingPending, setIsStakingPending] = useState(false);

  // --- Memoized Trend Chart Data ---
  const trendsData = useMemo(() => {
    const totalCurrentViews = videos.reduce((acc, v) => acc + v.views, 0);
    const totalCurrentLikes = videos.reduce((acc, v) => acc + v.likes, 0);
    return [
      { name: "Mon", Views: Math.round(totalCurrentViews * 0.62), Likes: Math.round(totalCurrentLikes * 0.58) },
      { name: "Tue", Views: Math.round(totalCurrentViews * 0.70), Likes: Math.round(totalCurrentLikes * 0.68) },
      { name: "Wed", Views: Math.round(totalCurrentViews * 0.81), Likes: Math.round(totalCurrentLikes * 0.75) },
      { name: "Thu", Views: Math.round(totalCurrentViews * 0.89), Likes: Math.round(totalCurrentLikes * 0.85) },
      { name: "Fri", Views: Math.round(totalCurrentViews * 0.94), Likes: Math.round(totalCurrentLikes * 0.92) },
      { name: "Sat", Views: Math.round(totalCurrentViews * 0.98), Likes: Math.round(totalCurrentLikes * 0.97) },
      { name: "Sun", Views: totalCurrentViews, Likes: totalCurrentLikes },
    ];
  }, [videos]);

  const videoComparisonData = useMemo(() => {
    return videos.map(v => ({
      title: v.title.length > 10 ? v.title.slice(0, 10) + "..." : v.title,
      Views: v.views,
      Likes: v.likes
    }));
  }, [videos]);

  // Sync integration local form states on config hydration
  useEffect(() => {
    if (appConfig.adminConfig) {
      setLocalOllamaCapable(appConfig.adminConfig.ollamaCapable !== false);
      setLocalOllamaApi(appConfig.adminConfig.ollamaApiEndpoint || "");
      setLocalOllamaModel(appConfig.adminConfig.ollamaModel || "");
      setLocalAgentApi(appConfig.adminConfig.agentApiUrl || "");
      setLocalAgentUri(appConfig.adminConfig.agentUri || "");
      setLocalSupabaseUrl(appConfig.adminConfig.supabaseUrl || "");
      setLocalSupabaseKey(appConfig.adminConfig.supabaseAnonKey || "");
    }
  }, [appConfig.adminConfig]);

  // Ref for chat auto-scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync editor on active file change
  useEffect(() => {
    if (virtualFiles[activeFile] !== undefined) {
      setEditorContent(virtualFiles[activeFile]);
    }
  }, [activeFile, virtualFiles]);

  // Handle auto scroll for chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Auto-build and parse application files on startup & on manual/AI saves
  useEffect(() => {
    rebuildVirtualAppState();
  }, [virtualFiles, refreshKey]);

  // Parse `metadata.json` and `src/data.ts` to hydrate the live simulation
  const rebuildVirtualAppState = () => {
    try {
      setBuildError(null);

      // 1. Parse metadata.json
      const metadataContent = virtualFiles["metadata.json"] || "{}";
      let parsedMetadata;
      try {
        parsedMetadata = JSON.parse(metadataContent);
      } catch (e: any) {
        throw new Error(`[metadata.json Error]: Invalid JSON format. ${e.message}`);
      }

      setAppConfig({
        name: parsedMetadata.name || "PushPlay Live",
        theme: parsedMetadata.theme || "dark",
        accentColor: parsedMetadata.accentColor || "#f59e0b",
        tokenCount: Number(parsedMetadata.tokenCount) || 2500,
        features: {
          comments: parsedMetadata.features?.comments !== false,
          upload: parsedMetadata.features?.upload !== false,
          reports: parsedMetadata.features?.reports !== false,
          creatorEconomy: parsedMetadata.features?.creatorEconomy !== false,
        },
        adminConfig: {
          ollamaCapable: parsedMetadata.adminConfig?.ollamaCapable !== false,
          ollamaApiEndpoint: parsedMetadata.adminConfig?.ollamaApiEndpoint || "http://localhost:11434",
          ollamaModel: parsedMetadata.adminConfig?.ollamaModel || "llama3",
          agentApiUrl: parsedMetadata.adminConfig?.agentApiUrl || "https://api.pushplay.live/agent",
          agentUri: parsedMetadata.adminConfig?.agentUri || "pp://agent-uri-handler",
          supabaseUrl: parsedMetadata.adminConfig?.supabaseUrl || "https://your-supabase-project.supabase.co",
          supabaseAnonKey: parsedMetadata.adminConfig?.supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      });

      // 2. Parse src/data.ts safely
      const dataContent = virtualFiles["src/data.ts"] || "";
      if (!dataContent.trim()) {
        throw new Error("[src/data.ts Error]: File is empty. Please define initial data.");
      }

      // Strip TS declarations and safely eval lists
      const cleanJs = dataContent
        .replace(/import\s+[^;]+;/g, "")
        .replace(/:\s*Video\[\]/g, "")
        .replace(/:\s*Comment\[\]/g, "")
        .replace(/:\s*Creator\[\]/g, "");

      try {
        const scopeFunc = new Function(`${cleanJs}; return { initialVideos, initialComments, creators };`);
        const result = scopeFunc();
        
        setVideos(result.initialVideos || []);
        setComments(result.initialComments || []);
        setCreators(result.creators || []);
      } catch (e: any) {
        throw new Error(`[src/data.ts Compilation Error]: Safe-eval failed. ${e.message}`);
      }

    } catch (err: any) {
      setBuildError(err.message || "Unknown compilation error in virtual workspace.");
    }
  };

  // Safe save changes handler
  const handleSaveFile = () => {
    const updatedFiles = {
      ...virtualFiles,
      [activeFile]: editorContent
    };
    setVirtualFiles(updatedFiles);
    localStorage.setItem("pp_studio_virtual_files", JSON.stringify(updatedFiles));
    
    // Clear unsaved mark
    setUnsavedChanges(prev => ({ ...prev, [activeFile]: false }));
    
    // Push compiler success
    setActionHistory(prev => ["Compiled successfully", ...prev]);
    setLatestStatus(`Built ${activeFile} successfully.`);
    setRefreshKey(prev => prev + 1);
  };

  // Safe file open handler
  const handleOpenFile = (path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path]);
    }
    setActiveFile(path);
  };

  // Close tabs
  const handleCloseTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const filtered = openTabs.filter(t => t !== path);
    setOpenTabs(filtered);
    if (activeFile === path && filtered.length > 0) {
      setActiveFile(filtered[filtered.length - 1]);
    }
  };

  // AI Assistant Proxy Trigger
  const handleSendPrompt = async () => {
    if (!chatInput.trim()) return;
    const promptToSend = chatInput;
    setChatInput("");

    // Append user message
    setChatHistory(prev => [
      ...prev,
      {
        sender: "user",
        text: promptToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsCompiling(true);

    try {
      const data = await routeAIRequest({
        prompt: promptToSend,
        files: virtualFiles,
        systemInstructions: "You are a virtual engineering workspace and code architect for PushPlay Live.",
        modelName: modelName
      });

      if (data.error) {
        throw new Error(data.error);
      }

      // Merge file changes returned by the proxy
      if (data.fileChanges && Array.isArray(data.fileChanges)) {
        const updatedFiles = { ...virtualFiles };
        data.fileChanges.forEach((change: { path: string; content: string }) => {
          updatedFiles[change.path] = change.content;
          // Trigger tab opening if closed
          if (!openTabs.includes(change.path)) {
            setOpenTabs(prev => [...prev, change.path]);
          }
          // Highlight last modified file
          setActiveFile(change.path);
        });
        setVirtualFiles(updatedFiles);
        localStorage.setItem("pp_studio_virtual_files", JSON.stringify(updatedFiles));
      }

      // Update action histories and status
      if (data.actionHistory) {
        setActionHistory(prev => [...data.actionHistory, ...prev]);
      }
      if (data.updatedStatus) {
        setLatestStatus(data.updatedStatus);
      }

      // Append AI response
      setChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          text: data.chatResponse || "Successfully built your changes!",
          actionHistory: data.actionHistory,
          status: data.updatedStatus,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // Refresh simulator
      setRefreshKey(prev => prev + 1);

    } catch (error: any) {
      console.error("AI Error:", error);
      setChatHistory(prev => [
        ...prev,
        {
          sender: "system",
          text: `🚨 **Compilation Exception**:\n\n${error.message || "An unexpected network or model error occurred. Please verify your connection or configurations in Settings."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsCompiling(false);
    }
  };

  // --- Dynamic Simulator Helpers ---
  const handleAddLiveComment = (text: string) => {
    if (!selectedVideo) return;
    const newComment: VirtualComment = {
      id: `c-dyn-${Date.now()}`,
      videoId: selectedVideo.id,
      author: "PushPlay Curator",
      text,
      timestamp: "Just now",
      likes: 0
    };

    const updatedComments = [newComment, ...comments];
    
    // Convert current list back to typescript syntax in src/data.ts
    updateVirtualDataFile(videos, updatedComments, creators);
  };

  const handleReportVideo = (videoId: string) => {
    const updatedVideos = videos.map(v => {
      if (v.id === videoId) {
        return {
          ...v,
          reports: (v.reports || 0) + 1,
          isReported: true,
          investigationStatus: v.investigationStatus || "Submitted"
        };
      }
      return v;
    });

    updateVirtualDataFile(updatedVideos, comments, creators);
    setReportingVideoId(videoId);
    setShowReportModal(true);
  };

  const handleDismissReport = (videoId: string) => {
    const updatedVideos = videos.map(v => {
      if (v.id === videoId) {
        return {
          ...v,
          reports: 0,
          isReported: false
        };
      }
      return v;
    });
    updateVirtualDataFile(updatedVideos, comments, creators);
  };

  const handleRemoveVideo = (videoId: string) => {
    const updatedVideos = videos.filter(v => v.id !== videoId);
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null);
    }
    updateVirtualDataFile(updatedVideos, comments, creators);
  };

  const handlePublishLiveStream = (newVid: Omit<VirtualVideo, "id" | "views" | "likes" | "reports" | "uploadedAt">) => {
    const videoObj: VirtualVideo = {
      ...newVid,
      id: `vid-dyn-${Date.now()}`,
      views: 120,
      likes: 12,
      reports: 0,
      isReported: false,
      uploadedAt: "Just now"
    };

    const updatedVideos = [...videos, videoObj];
    updateVirtualDataFile(updatedVideos, comments, creators);
    setShowUploadModal(false);
  };

  const updateVirtualDataFile = (
    vList: VirtualVideo[], 
    cList: VirtualComment[], 
    crList: VirtualCreator[]
  ) => {
    const stringifiedVideos = JSON.stringify(vList, null, 2);
    const stringifiedComments = JSON.stringify(cList, null, 2);
    const stringifiedCreators = JSON.stringify(crList, null, 2);

    const newCode = `import { Video, Comment, Creator } from "./types";

export const initialVideos: Video[] = ${stringifiedVideos};

export const initialComments: Comment[] = ${stringifiedComments};

export const creators: Creator[] = ${stringifiedCreators};
`;

    const updatedFiles = {
      ...virtualFiles,
      "src/data.ts": newCode
    };

    setVirtualFiles(updatedFiles);
    localStorage.setItem("pp_studio_virtual_files", JSON.stringify(updatedFiles));
    
    // Flash updated key to trigger hydration
    setRefreshKey(prev => prev + 1);
  };

  const handleExportPerformanceCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "WEEKLY PERFORMANCE TRENDS\n";
    csvContent += "Day,Views,Likes\n";
    trendsData.forEach(row => {
      csvContent += `${row.name},${row.Views},${row.Likes}\n`;
    });
    
    csvContent += "\n\n";
    
    csvContent += "VIDEO PERFORMANCE BREAKOUTS\n";
    csvContent += "Video Title,Author/Creator,Category,Views,Likes,Duration,Uploaded At\n";
    videos.forEach(vid => {
      const escapedTitle = `"${vid.title.replace(/"/g, '""')}"`;
      const escapedAuthor = `"${vid.author.replace(/"/g, '""')}"`;
      const escapedCategory = `"${vid.category.replace(/"/g, '""')}"`;
      csvContent += `${escapedTitle},${escapedAuthor},${escapedCategory},${vid.views},${vid.likes},${vid.duration},${vid.uploadedAt}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pushplay_trends_performance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setActionHistory(prev => ["Exported Performance CSV summary report", ...prev]);
    setLatestStatus("Trends CSV report generated.");
  };

  const updateVirtualMetadataFile = (newAdminConfig: typeof appConfig.adminConfig) => {
    const metadataContent = virtualFiles["metadata.json"] || "{}";
    let parsedMetadata: any = {};
    try {
      parsedMetadata = JSON.parse(metadataContent);
    } catch (e) {
      parsedMetadata = {};
    }

    const updatedMetadata = {
      ...parsedMetadata,
      adminConfig: newAdminConfig
    };

    const updatedFiles = {
      ...virtualFiles,
      "metadata.json": JSON.stringify(updatedMetadata, null, 2)
    };

    setVirtualFiles(updatedFiles);
    localStorage.setItem("pp_studio_virtual_files", JSON.stringify(updatedFiles));
    
    setActionHistory(prev => ["Updated Admin integration configurations in metadata.json", ...prev]);
    setLatestStatus("Admin integration parameters updated.");
    setRefreshKey(prev => prev + 1);
  };

  // Filter video cards based on category + search
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = simCategory === "All" || v.category === simCategory;
      return matchesSearch && matchesCategory;
    });
  }, [videos, searchQuery, simCategory]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0A0A] text-[#E0E0E0] overflow-hidden select-none" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      
      {/* 1. TOP HEADER BAR */}
      <header className="h-14 border-b border-[#222222] bg-[#111111] flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center font-bold text-black text-sm">B</div>
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-wider text-white uppercase flex items-center gap-1.5">
                PUSHPLAY STUDIO AI
                <span className="rounded bg-amber-500 text-[8px] font-extrabold uppercase px-1 text-black py-0.5">PRO</span>
              </span>
              <span className="text-[9px] tracking-widest text-zinc-500 font-bold uppercase">BUILDER WORKSPACE v1.5</span>
            </div>
          </div>
          <div className="h-5 w-px bg-[#222222]"></div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Project: <span className="text-amber-500 hover:underline cursor-pointer">PushPlay_Live_Workspace</span>
          </div>
        </div>

        {/* Sync Status Badge in header */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-bold tracking-wider">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-zinc-400">SERVER-SIDE GEMINI API CONNECTED</span>
          </div>
          <div className="h-4 w-px bg-[#222222]"></div>
          <div className="text-zinc-500 flex items-center gap-1">
            <span>DATABASE:</span>
            <span className="text-zinc-300">VIRTUAL FIRESTORE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-white border border-[#222222] rounded hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-amber-500" />
            <span>Workspace Settings</span>
          </button>

          <button 
            onClick={() => {
              setVirtualFiles(DEFAULT_VIRTUAL_FILES);
              localStorage.removeItem("pp_studio_virtual_files");
              setRefreshKey(p => p + 1);
              alert("Workspace reset to initial templates!");
            }}
            className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-white border border-[#222222] rounded hover:bg-[#1A1A1A] transition-colors"
          >
            Reset Template
          </button>
          
          <button 
            onClick={() => alert("Simulating app export to high-performance package...")}
            className="px-3.5 py-1.5 text-[10px] font-bold text-white bg-[#222222] hover:bg-[#333333] border border-[#333333] rounded transition-colors"
          >
            Export ZIP
          </button>

          <button 
            onClick={() => alert("Simulating production build deployment to Cloud Run...")}
            className="px-4 py-1.5 text-[10px] font-bold bg-[#F2F2F2] hover:bg-white text-black rounded transition-colors uppercase tracking-wider"
          >
            Deploy
          </button>

          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center border border-[#444444] text-[10px] font-bold text-black uppercase">
            JD
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- LEFT SIDEBAR: GEMINI ASSISTANT PANEL --- */}
        <aside className="w-[320px] flex-shrink-0 border-r border-[#222222] bg-[#111111] flex flex-col z-10">
          
          {/* Gemini Header */}
          <div className="p-4 border-b border-[#222222] flex items-center justify-between bg-[#141416]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Gemini Workspace</span>
            </div>
            
            {/* Model Selector */}
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="bg-[#1c1c1e] text-[10px] font-extrabold text-zinc-300 border border-[#333333] rounded px-2 py-1 focus:outline-none cursor-pointer"
            >
              <optgroup label="Gemini Cloud">
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Stable)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Thinking)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Thinking)</option>
              </optgroup>
              <optgroup label="Local Ollama">
                <option value="ollama">Ollama Default</option>
                {ollamaModels.map(name => (
                  <option key={name} value={`ollama:${name}`}>{name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* System Instructions Collapse */}
          <div className="border-b border-[#222222]">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="w-full flex items-center justify-between p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:bg-[#18181b] transition-colors"
            >
              <span>System instructions</span>
              {showSystemPrompt ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {showSystemPrompt && (
              <div className="p-3 bg-[#0c0c0e] border-t border-[#222222]">
                <textarea
                  readOnly
                  value="You are an advanced virtual workspace AI specialized in building the 'PushPlay Live' streaming platform. You update workspace files (types.ts, data.ts, metadata.json) directly based on instructions."
                  className="w-full h-16 bg-[#141416] border border-[#222222] rounded p-2 text-[10px] text-zinc-500 resize-none focus:outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Chat Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#222222]">
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex flex-col ${chat.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[90%] p-3 rounded-lg text-xs font-light leading-relaxed ${
                    chat.sender === "user"
                      ? "bg-amber-500 text-black font-semibold rounded-br-none"
                      : chat.sender === "system"
                      ? "bg-red-950/40 border border-red-900/40 text-red-300 rounded-bl-none"
                      : "bg-[#161618] border border-[#222222] text-zinc-200 rounded-bl-none"
                  }`}
                >
                  {/* Markdown text parsing simple rules */}
                  <div className="space-y-1.5 whitespace-pre-wrap">
                    {chat.text.split("\n").map((line, lIdx) => {
                      if (line.startsWith("### ")) {
                        return <h3 key={lIdx} className="font-bold text-white text-xs pt-1 uppercase">{line.slice(4)}</h3>;
                      }
                      if (line.startsWith("* ")) {
                        return (
                          <div key={lIdx} className="flex gap-1 pl-2">
                            <span>•</span>
                            <span>{line.slice(2)}</span>
                          </div>
                        );
                      }
                      return <p key={lIdx}>{line}</p>;
                    })}
                  </div>

                  {/* Return of custom virtual execution steps if present */}
                  {chat.actionHistory && chat.actionHistory.length > 0 && (
                    <div className="mt-3 bg-[#111111] border border-[#222222] rounded p-2.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#222222] pb-1.5 mb-1.5">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        <span>Action history</span>
                      </div>
                      <div className="space-y-1 text-[10px]">
                        {chat.actionHistory.map((act, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-1 text-zinc-400">
                            <CornerDownRight className="h-3 w-3 text-zinc-600 flex-shrink-0" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-zinc-600 mt-1 font-bold">{chat.timestamp}</span>
              </div>
            ))}

            {isCompiling && (
              <div className="flex flex-col items-start">
                <div className="bg-[#161618] border border-[#222222] p-3 rounded-lg text-xs text-zinc-400 space-y-2 flex items-center gap-3">
                  <div className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 items-center justify-center text-black font-extrabold text-[10px]">AI</span>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-300">Gemini is rewriting code...</p>
                    <p className="text-[10px] text-zinc-500">Injecting files & executing compile check...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-[#222222] bg-[#141416]/50">
            <button 
              onClick={() => setChatInput("Style the header with an amber color and custom logo")}
              className="text-[9px] font-bold bg-[#1d1d20] hover:bg-[#2c2c30] text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              + Styling theme
            </button>
            <button 
              onClick={() => setChatInput("Add a high-fidelity comment staking reward feature")}
              className="text-[9px] font-bold bg-[#1d1d20] hover:bg-[#2c2c30] text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              + Staking reward
            </button>
            <button 
              onClick={() => setChatInput("Modify the metadata config to set token count to 50000")}
              className="text-[9px] font-bold bg-[#1d1d20] hover:bg-[#2c2c30] text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              + Edit Tokens
            </button>
          </div>

          {/* Gemini Input Area */}
          <div className="p-3 border-t border-[#222222] bg-[#111111]">
            <div className="relative bg-[#141416] border border-[#222222] focus-within:border-amber-500/50 rounded-xl p-2.5 flex flex-col gap-2 transition-all">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder="Make changes, add new features, ask for anything..."
                rows={2}
                className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none font-medium leading-relaxed"
              />
              <div className="flex items-center justify-between border-t border-[#222222]/50 pt-2">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <button className="p-1 hover:text-zinc-300 transition-colors" title="Speech input (simulated)">
                    <span className="text-xs">🎤</span>
                  </button>
                  <button className="p-1 hover:text-zinc-300 transition-colors" title="Attach assets (simulated)">
                    <span className="text-xs">📎</span>
                  </button>
                </div>
                
                <button
                  onClick={handleSendPrompt}
                  disabled={!chatInput.trim() || isCompiling}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-all disabled:bg-zinc-800 disabled:text-zinc-600"
                >
                  <Send className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* --- MIDDLE PANEL: FILE TREE EXPLORER + CODE EDITOR --- */}
        <main className="flex-1 flex overflow-hidden bg-[#0A0A0A]">
          
          {/* File Tree Sub-sidebar (Collapsible) */}
          <div className="w-[200px] border-r border-[#222222] bg-[#111111] flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-[#222222] flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Workspace Files</span>
              <span className="text-[8px] bg-[#222222] px-1.5 py-0.5 rounded text-zinc-400">9 FILES</span>
            </div>
            
            {/* Tree Nodes */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {/* metadata.json node */}
              <button
                onClick={() => handleOpenFile("metadata.json")}
                className={`w-full flex items-center justify-between p-2 rounded text-xs transition-colors ${
                  activeFile === "metadata.json" ? "bg-[#222222] text-amber-500 font-bold" : "text-zinc-400 hover:bg-[#18181b]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileJson className="h-3.5 w-3.5 text-orange-400" />
                  <span className="truncate">metadata.json</span>
                </div>
                {unsavedChanges["metadata.json"] && <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
              </button>

              {/* src Folder Node */}
              <div>
                <div className="flex items-center gap-1 p-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <Folder className="h-3.5 w-3.5 text-zinc-600" />
                  <span>src</span>
                </div>

                <div className="pl-4 space-y-1">
                  {/* types.ts */}
                  <button
                    onClick={() => handleOpenFile("src/types.ts")}
                    className={`w-full flex items-center justify-between p-1.5 rounded text-xs transition-colors ${
                      activeFile === "src/types.ts" ? "bg-[#222222] text-amber-500 font-bold" : "text-zinc-400 hover:bg-[#18181b]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="h-3.5 w-3.5 text-blue-400" />
                      <span className="truncate">types.ts</span>
                    </div>
                    {unsavedChanges["src/types.ts"] && <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
                  </button>

                  {/* data.ts */}
                  <button
                    onClick={() => handleOpenFile("src/data.ts")}
                    className={`w-full flex items-center justify-between p-1.5 rounded text-xs transition-colors ${
                      activeFile === "src/data.ts" ? "bg-[#222222] text-amber-500 font-bold" : "text-zinc-400 hover:bg-[#18181b]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="truncate">data.ts</span>
                    </div>
                    {unsavedChanges["src/data.ts"] && <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
                  </button>

                  {/* components/ subfolder */}
                  <div>
                    <div className="flex items-center gap-1 p-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                      <Folder className="h-3 w-3 text-zinc-700" />
                      <span>components</span>
                    </div>
                    
                    <div className="pl-3 space-y-1">
                      {[
                        { name: "Header.tsx", path: "src/components/Header.tsx" },
                        { name: "Navigation.tsx", path: "src/components/Navigation.tsx" },
                        { name: "VideoPlayer.tsx", path: "src/components/VideoPlayer.tsx" },
                        { name: "CommentsSection.tsx", path: "src/components/CommentsSection.tsx" },
                        { name: "UploadModal.tsx", path: "src/components/UploadModal.tsx" },
                        { name: "AdminDashboard.tsx", path: "src/components/AdminDashboard.tsx" }
                      ].map((item) => (
                        <button
                          key={item.path}
                          onClick={() => handleOpenFile(item.path)}
                          className={`w-full flex items-center justify-between p-1.5 rounded text-xs transition-colors ${
                            activeFile === item.path ? "bg-[#222222] text-amber-500 font-bold" : "text-zinc-400 hover:bg-[#18181b]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <FileCode className="h-3 w-3 text-indigo-400" />
                            <span className="truncate text-[11px]">{item.name}</span>
                          </div>
                          {unsavedChanges[item.path] && <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            {/* Quick terminal indicator inside left explorer */}
            <div className="p-3 border-t border-[#222222] bg-[#0d0d0e]">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5">
                <span>Console Log</span>
                <span className="text-emerald-500 animate-pulse">● IDE LIVE</span>
              </div>
              <div className="bg-black p-2 rounded border border-[#222222] font-mono text-[9px] text-zinc-400 h-16 overflow-y-auto space-y-1">
                <p className="text-zinc-600">[info] Initializing V8 engine</p>
                <p className="text-emerald-500">[success] Hot module mapping active</p>
                <p className="text-amber-500">[warning] API key hidden securely</p>
              </div>
            </div>
          </div>

          {/* Code Editor Body */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
            
            {/* Tabs Row */}
            <div className="h-10 border-b border-[#222222] bg-[#111111] flex items-center justify-between overflow-x-auto flex-shrink-0">
              <div className="flex items-center h-full">
                {openTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFile(tab)}
                    className={`h-full px-4 flex items-center gap-2 border-r border-[#222222] text-xs transition-colors ${
                      activeFile === tab ? "bg-[#0A0A0A] text-white border-t-2 border-amber-500 font-bold" : "bg-[#141416] text-zinc-500 hover:bg-[#1c1c1e]"
                    }`}
                  >
                    <span>{tab.split("/").pop()}</span>
                    {unsavedChanges[tab] && <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
                    <X
                      className="h-3 w-3 hover:text-white text-zinc-600 transition-colors"
                      onClick={(e) => handleCloseTab(e, tab)}
                    />
                  </button>
                ))}
              </div>
              
              <div className="px-3 flex items-center gap-2">
                {/* Save button with status */}
                <button
                  onClick={handleSaveFile}
                  className="flex items-center gap-1.5 bg-[#1C1C1E] hover:bg-[#2C2C30] border border-[#333] hover:border-zinc-500 text-zinc-300 hover:text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all uppercase tracking-wider"
                  title="Apply modified file code into the live preview renderer"
                >
                  <Save className="h-3 w-3 text-amber-500" />
                  <span>Save & Build</span>
                </button>
              </div>
            </div>

            {/* Sub Editor Info */}
            <div className="h-8 bg-[#141416] border-b border-[#222222] flex items-center justify-between px-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>ACTIVE NODE: <span className="text-zinc-300 font-mono font-normal">{activeFile}</span></span>
              <div className="flex items-center gap-2 text-zinc-500">
                <span>Tab size: 2 spaces</span>
                <span>•</span>
                <span>Language: TypeScript</span>
              </div>
            </div>

            {/* Main Interactive Gutter + Textarea */}
            <div className="flex-1 flex overflow-hidden relative font-mono">
              {/* Dynamic Line Numbers */}
              <div className="w-12 bg-[#0E0E10] border-r border-[#222222] py-4 text-right pr-3 select-none text-[11px] text-zinc-600 leading-relaxed font-mono">
                {Array.from({ length: editorContent.split("\n").length || 1 }).map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>

              {/* Raw Textarea Editor */}
              <textarea
                value={editorContent}
                onChange={(e) => {
                  setEditorContent(e.target.value);
                  setUnsavedChanges(prev => ({ ...prev, [activeFile]: true }));
                }}
                className="flex-1 p-4 bg-[#0A0A0A] text-[#E0E0E0] text-[11px] leading-relaxed font-mono focus:outline-none resize-none overflow-y-auto"
                spellCheck={false}
                placeholder="// Enter code here..."
              />
            </div>
          </div>
        </main>

        {/* --- RIGHT PANEL: LIVE PREVIEW CONTAINER --- */}
        <aside className="w-[480px] flex-shrink-0 border-l border-[#222222] bg-[#111111] flex flex-col overflow-hidden z-10">
          
          {/* Header Controls */}
          <div className="p-3 border-b border-[#222222] bg-[#141416] flex items-center justify-between flex-shrink-0">
            <div className="flex bg-[#1E1E22] border border-[#333333] rounded p-0.5">
              <button
                onClick={() => setActivePreviewTab("preview")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ${
                  activePreviewTab === "preview" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Live Preview
              </button>
              <button
                onClick={() => setActivePreviewTab("sandbox")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ${
                  activePreviewTab === "sandbox" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Real Sandbox
              </button>
              <button
                onClick={() => setActivePreviewTab("code")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ${
                  activePreviewTab === "code" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Output Code
              </button>
            </div>

            {/* Layout simulation devices switcher */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1 rounded hover:bg-[#222222] ${previewDevice === "desktop" ? "text-amber-500 bg-[#222222]" : "text-zinc-500"}`}
                title="Simulate Desktop View"
              >
                <Laptop className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1 rounded hover:bg-[#222222] ${previewDevice === "mobile" ? "text-amber-500 bg-[#222222]" : "text-zinc-500"}`}
                title="Simulate Mobile Frame View"
              >
                <Phone className="h-3.5 w-3.5" />
              </button>
              
              <div className="h-4 w-px bg-[#222222] mx-1"></div>

              <button
                onClick={() => setRefreshKey(p => p + 1)}
                className="p-1 rounded hover:bg-[#222222] text-zinc-500 hover:text-white transition-colors"
                title="Refresh Simulated Live App Container"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Virtual Browser Mock URL Bar */}
          <div className="px-4 py-2 bg-[#0c0c0e] border-b border-[#222222] flex items-center gap-2 flex-shrink-0">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            
            <div className="flex-1 bg-[#141416] border border-[#222222] rounded px-3 py-1 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
              <span className="truncate">https://{appConfig.name.toLowerCase().replace(/\s+/g, "-")}.studio.app/{selectedVideo ? `watch?v=${selectedVideo.id}` : simActiveTab}</span>
              <ExternalLink className="h-3 w-3 text-zinc-600" />
            </div>
          </div>

          {/* Preview Viewport */}
          <div className="flex-1 bg-[#0A0A0A] p-4 flex items-center justify-center overflow-auto relative">
            
            {/* BUILD ERROR DIALOG OVERLAY */}
            {buildError ? (
              <div className="w-full max-w-sm rounded-xl border border-red-900 bg-red-950/20 p-6 shadow-2xl relative animate-pulse font-mono">
                <div className="flex items-center gap-2 text-red-500 mb-3">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Workspace Compilation Failed</span>
                </div>
                <div className="bg-black/40 p-4 rounded border border-red-900/30 text-[10px] text-red-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {buildError}
                </div>
                <p className="text-[10px] text-zinc-500 mt-4 leading-normal">
                  Please fix the syntax issue reported in the file editor above, or type in the Gemini chat *'Fix the compilation error'* to have the AI correct it for you.
                </p>
                <button
                  onClick={() => {
                    setChatInput("Fix the compilation error in " + activeFile);
                  }}
                  className="mt-4 w-full bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 py-2 rounded text-xs font-bold transition-colors"
                >
                  Prompt AI to Fix Error
                </button>
              </div>
            ) : activePreviewTab === "code" ? (
              /* JSON CODE DIALOG VIEW */
              <div className="w-full h-full p-4 font-mono text-[11px] text-zinc-400 bg-[#0d0d0f] rounded-lg border border-[#222222] overflow-y-auto select-text space-y-4">
                <div className="flex justify-between items-center border-b border-[#222222] pb-2 text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                  <span>Compiled Metadata Payload</span>
                  <span className="text-emerald-500">State Synced OK</span>
                </div>
                <pre>{JSON.stringify(appConfig, null, 2)}</pre>
                
                <div className="flex justify-between items-center border-b border-[#222222] pb-2 text-zinc-500 font-bold uppercase text-[9px] tracking-wider pt-4">
                  <span>Hydrated Active Node Streams ({videos.length})</span>
                </div>
                <pre>{JSON.stringify(videos, null, 2)}</pre>
              </div>
            ) : activePreviewTab === "sandbox" ? (
              /* REAL SANDBOX IFRAME VIEW */
              <div className="w-full h-full bg-[#0a0a0a] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-2 bg-[#141416] border-b border-zinc-800 text-[10px] font-mono flex items-center justify-between text-zinc-400 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-zinc-300">Live In-Browser Sandbox</span>
                    <span className="text-[9px] text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">{activeFile}</span>
                  </div>
                  <div className="text-[9px] text-zinc-500">React 18 + Babel Standalone</div>
                </div>
                <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden">
                  <iframe
                    id="sandbox-iframe"
                    title="Sandbox Preview"
                    className="w-full h-full border-none bg-[#0a0a0a]"
                    sandbox="allow-scripts"
                    srcDoc={buildPreviewSrcDoc(editorContent)}
                  />
                </div>
              </div>
            ) : (
              /* --- HIGH FIDELITY SIMULATED APP RUNNING INSIDE PREVIEW CONTAINER --- */
              <div 
                className={`bg-[#0c0c0e] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col text-gray-200 transition-all duration-300 ${
                  previewDevice === "mobile" 
                    ? "w-[320px] h-[580px] text-[10px]" 
                    : "w-full h-full text-xs"
                }`}
              >
                
                {/* Simulated Header */}
                <header className="flex items-center justify-between border-b border-gray-800 bg-[#0c0c0e] px-4 py-3 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="flex h-7 w-7 items-center justify-center rounded-lg font-black text-black text-xs"
                      style={{ backgroundColor: appConfig.accentColor }}
                    >
                      PP
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold tracking-wider text-white uppercase text-[11px] leading-tight truncate max-w-[80px]">{appConfig.name}</span>
                        <span 
                          className="rounded px-0.5 py-px text-[7px] font-black uppercase text-black leading-none"
                          style={{ backgroundColor: appConfig.accentColor }}
                        >
                          LIVE
                        </span>
                      </div>
                      <span className="text-[7px] tracking-widest text-gray-500 uppercase block font-bold leading-none">Curated Art & Cinema</span>
                    </div>
                  </div>

                  {/* Search Bar in Mock Header */}
                  <div className="relative flex-1 mx-2 max-w-[140px]">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                      <Search className="h-3 w-3 text-gray-500" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search live..."
                      className="w-full rounded-full border border-gray-800 bg-[#141416] py-1 pl-7 pr-2 text-[9px] font-medium text-gray-300 placeholder-gray-500 focus:outline-none"
                    />
                  </div>

                  {/* Actions right mock header */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                    {isSimLoggedIn ? (
                      <>
                        {appConfig.features.upload && simUserRole === "admin" && (
                          <button 
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center space-x-1 rounded-full border border-gray-800 bg-[#141416] px-2.5 py-1 text-[9px] font-bold text-white hover:bg-gray-800 animate-fade-in"
                          >
                            <Plus className="h-2.5 w-2.5" />
                            <span className="hidden sm:inline">Create</span>
                          </button>
                        )}

                        {/* Tokens count */}
                        <div className="flex items-center space-x-1 rounded-full border border-amber-900/30 bg-amber-950/10 px-2 py-1 text-[9px] font-bold text-amber-500 animate-fade-in">
                          <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" style={{ backgroundColor: appConfig.accentColor }}></span>
                          <span>{appConfig.tokenCount.toLocaleString()} PPL</span>
                        </div>

                        {/* User Identity Avatar Dropdown Button */}
                        <div className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/50 pl-1.5 pr-2 py-0.5 rounded-full select-none animate-fade-in">
                          <div 
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] text-black cursor-pointer shadow-sm relative ${
                              simUserRole === "admin" ? "bg-amber-500" : "bg-blue-400"
                            }`}
                            onClick={() => setShowLoginModal(true)}
                            title="Logged in. Click to switch account."
                            style={{
                              backgroundColor: simUserRole === "admin" ? appConfig.accentColor : undefined
                            }}
                          >
                            <span>{simUserEmail.slice(0, 2).toUpperCase()}</span>
                            {/* Glowing Active Ring */}
                            <span className="absolute -inset-0.5 rounded-full border border-emerald-500/80 animate-ping opacity-30"></span>
                          </div>
                          <div className="flex flex-col text-[7px] leading-tight max-w-[65px]">
                            <span className="font-extrabold text-white truncate uppercase">{simUserRole}</span>
                            <span className="text-zinc-500 truncate" title={simUserEmail}>{simUserEmail.split("@")[0]}</span>
                          </div>
                          {/* Logout Button */}
                          <button
                            onClick={() => {
                              setIsSimLoggedIn(false);
                              setSimUserRole("member");
                              setLatestStatus("Logged out of simulation session");
                              alert("Signed out successfully from simulation.");
                            }}
                            className="text-zinc-500 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                            title="Sign Out"
                          >
                            <LogOut className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button 
                        onClick={() => setShowLoginModal(true)}
                        className="flex items-center space-x-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase text-amber-400 hover:bg-amber-500 hover:text-black transition-all cursor-pointer animate-fade-in"
                        style={{
                          borderColor: `${appConfig.accentColor}44`,
                          color: appConfig.accentColor
                        }}
                      >
                        <LogIn className="h-2.5 w-2.5" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </div>
                </header>

                {/* Sub layout frame body */}
                <div className="flex flex-1 overflow-hidden relative">
                  
                  {/* Left Mock Nav panel */}
                  <aside className="w-[120px] flex-shrink-0 border-r border-gray-800 bg-[#0c0c0e] p-2 flex flex-col justify-between overflow-y-auto">
                    <div className="space-y-4">
                      <nav className="space-y-1">
                        {[
                          { id: "home", label: "Home", icon: Home },
                          { id: "shorts", label: "Shorts", icon: Film },
                          { id: "music", label: "Music", icon: Music },
                          { id: "trends", label: "Trends", icon: TrendingUp },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isActive = simActiveTab === item.id && !selectedVideo;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSimActiveTab(item.id);
                                setSelectedVideo(null);
                              }}
                              className="flex w-full items-center space-x-2 rounded px-2 py-1.5 text-[9px] font-semibold transition-colors"
                              style={{
                                backgroundColor: isActive ? "#18181b" : "transparent",
                                color: isActive ? appConfig.accentColor : "#a1a1aa"
                              }}
                            >
                              <Icon className="h-3 w-3" style={{ color: isActive ? appConfig.accentColor : "#71717a" }} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </nav>

                      {/* Playlists */}
                      <div className="space-y-1">
                        <span className="text-[7px] font-extrabold uppercase tracking-widest text-gray-500 pl-2">Playlists</span>
                        {[
                          { id: "playlists", label: "Playlists", icon: List },
                          { id: "watch-later", label: "Watch Later", icon: Clock },
                          { id: "liked", label: "Liked Videos", icon: Heart },
                          { id: "history", label: "History", icon: History },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isActive = simActiveTab === item.id && !selectedVideo;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSimActiveTab(item.id);
                                setSelectedVideo(null);
                              }}
                              className="flex w-full items-center space-x-2 rounded px-2 py-1 text-[9px] font-semibold transition-colors"
                              style={{
                                backgroundColor: isActive ? "#18181b" : "transparent",
                                color: isActive ? appConfig.accentColor : "#a1a1aa"
                              }}
                            >
                              <Icon className="h-3 w-3" style={{ color: isActive ? appConfig.accentColor : "#71717a" }} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Creator Economy section */}
                      {appConfig.features.creatorEconomy && (
                        <div className="space-y-1 border-t border-gray-800/60 pt-2">
                          <span className="text-[7px] font-extrabold uppercase tracking-widest text-gray-500 pl-2">Staking Hub</span>
                          {[
                            { id: "wallet", label: "Wallet & Staking", icon: Wallet },
                            { id: "store", label: "Store", icon: Store },
                            { id: "creator-studio", label: "Studio", icon: Award },
                          ].map((item) => {
                            const Icon = item.icon;
                            const isActive = simActiveTab === item.id && !selectedVideo;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setSimActiveTab(item.id);
                                  setSelectedVideo(null);
                                }}
                                className="flex w-full items-center space-x-2 rounded px-2 py-1 text-[9px] font-semibold transition-colors"
                                style={{
                                  backgroundColor: isActive ? "#18181b" : "transparent",
                                  color: isActive ? appConfig.accentColor : "#a1a1aa"
                                }}
                              >
                                <Icon className="h-3 w-3" style={{ color: isActive ? appConfig.accentColor : "#71717a" }} />
                                <span className="truncate">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Admin Mod dashboard */}
                      {appConfig.features.reports && (
                        <div className="space-y-1 border-t border-gray-800/60 pt-2 animate-fade-in">
                          {isSimLoggedIn && simUserRole === "admin" ? (
                            <button
                              onClick={() => {
                                setSimActiveTab("admin");
                                setSelectedVideo(null);
                              }}
                              className="flex w-full items-center space-x-2 rounded px-2 py-1 text-[9px] font-semibold text-red-400 hover:bg-[#1a0e0f]/50 transition-colors cursor-pointer"
                              style={{
                                backgroundColor: simActiveTab === "admin" && !selectedVideo ? "#1e1112" : "transparent"
                              }}
                            >
                              <ShieldAlert className="h-3 w-3 text-red-500 animate-pulse" />
                              <span className="truncate">Mod Dashboard</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setShowLoginModal(true);
                                alert("Authentication Required: Compliance Mod Dashboard requires Secure Administrator Credentials.");
                              }}
                              className="flex w-full items-center space-x-2 rounded px-2 py-1 text-[9px] font-bold text-zinc-500 hover:bg-zinc-900/50 transition-colors cursor-pointer"
                            >
                              <Lock className="h-3 w-3 text-zinc-600" />
                              <span className="truncate text-zinc-500">Mod Dashboard 🔒</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Left Subscriptions Badge */}
                    <div className="rounded bg-[#141416] p-1.5 border border-gray-800 flex items-center justify-between text-[7px] uppercase mt-4">
                      <div className="truncate">
                        <span className="block text-gray-500 font-bold">STREAMS</span>
                        <span className="text-white font-bold block truncate">PushPlay Live</span>
                      </div>
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    </div>
                  </aside>

                  {/* Main Simulated Panel viewport content */}
                  <main className="flex-1 bg-[#0c0c0e] overflow-y-auto p-3">
                    
                    {/* VIDEO PLAYER SCREEN */}
                    {selectedVideo ? (
                      <div className="space-y-3 animate-fade-in text-[10px]">
                        
                        {/* Player viewport mock */}
                        <div className="relative aspect-video w-full rounded-lg bg-black border border-gray-800 overflow-hidden flex flex-col items-center justify-center">
                          <img src={selectedVideo.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                          
                          {/* Animated stream particle/lines to make it look "hot" & cinematic */}
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded text-[7px] uppercase font-bold text-white tracking-widest">
                            <span className="h-1 w-1 bg-white rounded-full animate-ping"></span>
                            <span>Simulated Cinema Feed</span>
                          </div>
                          
                          <div className="z-10 text-center space-y-2">
                            <Play className="h-8 w-8 text-black bg-amber-500 p-2 rounded-full mx-auto shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{ backgroundColor: appConfig.accentColor }} />
                            <p className="text-[9px] text-zinc-400 tracking-wider">Tap play to stream audio/video telemetry</p>
                          </div>
                        </div>

                        {/* Title, actions, metrics */}
                        <div className="space-y-1">
                          <h2 className="font-bold text-white text-xs">{selectedVideo.title}</h2>
                          
                          <div className="flex justify-between items-center text-[8px] text-zinc-500 border-b border-gray-800 pb-2">
                            <span>{selectedVideo.views.toLocaleString()} VIEWS • {selectedVideo.uploadedAt}</span>
                            
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setVideos(prev => prev.map(v => v.id === selectedVideo.id ? { ...v, likes: v.likes + 1 } : v));
                                  setSelectedVideo(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
                                }}
                                className="flex items-center gap-1 hover:text-white"
                              >
                                <Heart className="h-2.5 w-2.5 text-amber-500" fill="currentColor" />
                                <span>{selectedVideo.likes.toLocaleString()}</span>
                              </button>
                              
                              <button 
                                onClick={() => handleReportVideo(selectedVideo.id)}
                                className="flex items-center gap-1 hover:text-red-400 text-zinc-500 font-bold uppercase"
                              >
                                <ShieldAlert className="h-2.5 w-2.5 text-red-500" />
                                <span>Report</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[9px] text-zinc-400 font-light pb-2 border-b border-gray-800/50 leading-relaxed">
                          {selectedVideo.description}
                        </p>

                        {/* Comment section simulator inside Player */}
                        {appConfig.features.comments && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-[8px] font-extrabold uppercase tracking-widest text-zinc-500">
                              <MessageSquare className="h-3 w-3 text-amber-500" style={{ color: appConfig.accentColor }} />
                              <span>Live comments ({comments.filter(c => c.videoId === selectedVideo.id).length})</span>
                            </div>

                            {/* Feed comments scrolling container */}
                            <div className="max-h-24 overflow-y-auto space-y-2 pr-1">
                              {comments.filter(c => c.videoId === selectedVideo.id).map(c => (
                                <div key={c.id} className="bg-[#141416] p-2 rounded border border-gray-800 flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-full bg-zinc-800 text-[8px] flex items-center justify-center font-bold text-zinc-400 flex-shrink-0">
                                    {c.author.slice(0,2)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center text-[7px] text-zinc-500 font-bold mb-0.5">
                                      <span>{c.author}</span>
                                      <span>{c.timestamp}</span>
                                    </div>
                                    <p className="text-[8px] text-zinc-300 leading-normal font-light">{c.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* New comment form */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const commentText = fd.get("cmt")?.toString();
                                if (commentText) {
                                  handleAddLiveComment(commentText);
                                  e.currentTarget.reset();
                                }
                              }}
                              className="flex gap-1"
                            >
                              <input
                                name="cmt"
                                placeholder="Write a stream response..."
                                className="flex-1 bg-[#141416] border border-gray-800 rounded px-2 py-1 text-[8px] text-white focus:outline-none focus:border-amber-500"
                              />
                              <button 
                                type="submit" 
                                className="bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded text-[8px] font-bold"
                                style={{ backgroundColor: appConfig.accentColor }}
                              >
                                Send
                              </button>
                            </form>
                          </div>
                        )}

                        <button 
                          onClick={() => setSelectedVideo(null)} 
                          className="w-full bg-[#1c1c1e] text-zinc-400 hover:text-white py-1.5 rounded text-[8px] font-bold tracking-wider uppercase border border-gray-800"
                        >
                          ← Back to feed
                        </button>

                      </div>
                    ) : simActiveTab === "home" ? (
                      /* HOME LIVE STREAM FEED VIEW */
                      <div className="space-y-4">
                        
                        {/* Feed banner */}
                        <div className="relative rounded-xl bg-gradient-to-r from-amber-950/20 to-zinc-950 p-4 border border-amber-900/10">
                          <div className="flex items-center gap-1.5 text-amber-500 font-bold uppercase text-[8px] tracking-widest mb-1.5">
                            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            <span>Featured stream feed</span>
                          </div>
                          <h2 className="text-sm font-black tracking-tight text-white leading-tight">PUSHPLAY LIVE DISPATCH</h2>
                          <p className="text-[8px] text-zinc-500 mt-1">Staking systems active. Watch, comment and report nodes directly inside your IDE.</p>
                        </div>

                        {/* Interactive Categories list */}
                        <div className="flex gap-1 overflow-x-auto pb-1">
                          {["All", "Testimonies", "Mixes", "Music", "Kickboxing"].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSimCategory(cat)}
                              className={`px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wider rounded-full transition-colors ${
                                simCategory === cat 
                                  ? "bg-amber-500 text-black" 
                                  : "bg-[#141416] hover:bg-[#1C1C1E] text-zinc-400 border border-gray-800"
                              }`}
                              style={{
                                backgroundColor: simCategory === cat ? appConfig.accentColor : undefined
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Videos Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {filteredVideos.map(video => (
                            <div 
                              key={video.id}
                              onClick={() => setSelectedVideo(video)}
                              className="group cursor-pointer rounded-lg bg-[#111113] border border-gray-800 overflow-hidden hover:border-zinc-700 transition-all"
                            >
                              {/* Thumbnail frame */}
                              <div className="relative aspect-video bg-zinc-950">
                                <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-75" />
                                <span className="absolute bottom-1 right-1 bg-black/85 text-[7px] font-bold px-1 py-0.5 rounded text-white leading-none">
                                  {video.duration}
                                </span>
                                {video.isReported && (
                                  <span className="absolute top-1 left-1 bg-red-600/90 text-white font-extrabold text-[6px] uppercase px-1 rounded border border-red-500 animate-pulse">
                                    Flagged Node
                                  </span>
                                )}
                              </div>
                              
                              {/* Metadata body */}
                              <div className="p-2 space-y-1">
                                <h3 className="font-bold text-[9px] text-zinc-200 line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                                  {video.title}
                                </h3>
                                <div className="flex justify-between items-center text-[7px] text-zinc-500">
                                  <span>{video.author}</span>
                                  <span>{video.views > 1000 ? `${(video.views/1000).toFixed(1)}K` : video.views} views</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    ) : simActiveTab === "admin" ? (
                      /* MODERATOR & INTEGRATIONS DASHBOARD SCREEN */
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-[#111113] p-2 rounded-lg border border-gray-800">
                          <div className="flex gap-1.5 bg-zinc-950 p-1 rounded border border-zinc-800/80">
                            <button
                              onClick={() => setAdminSubTab("moderation")}
                              className={`px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                                adminSubTab === "moderation" 
                                  ? "bg-red-950 text-red-400 border border-red-900/50" 
                                  : "text-zinc-400 hover:text-white border border-transparent"
                              }`}
                            >
                              Mod Investigation
                            </button>
                            <button
                              onClick={() => setAdminSubTab("integrations")}
                              className={`px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                                adminSubTab === "integrations" 
                                  ? "bg-amber-950 text-amber-400 border border-amber-900/50" 
                                  : "text-zinc-400 hover:text-white border border-transparent"
                              }`}
                            >
                              Integrations & APIs
                            </button>
                            <button
                              onClick={() => setAdminSubTab("health")}
                              className={`px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                                adminSubTab === "health" 
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" 
                                  : "text-zinc-400 hover:text-white border border-transparent"
                              }`}
                            >
                              API Health Check
                            </button>
                          </div>
                          <span 
                            className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase border ${
                              adminSubTab === "moderation" 
                                ? "bg-red-950/20 text-red-500 border-red-900/30" 
                                : adminSubTab === "integrations"
                                  ? "bg-amber-950/20 text-amber-500 border-amber-900/30"
                                  : "bg-emerald-950/20 text-emerald-500 border-emerald-900/30"
                            }`}
                          >
                            {adminSubTab === "moderation" ? "Secured Console" : adminSubTab === "integrations" ? "API Linkage" : "Diagnostics"}
                          </span>
                        </div>

                        {adminSubTab === "moderation" ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Flagged Streams queue</h3>
                                <p className="text-[7px] text-zinc-500 uppercase mt-0.5">Flagged nodes pending telemetry evaluation</p>
                              </div>
                              <span className="bg-red-950/40 text-red-500 border border-red-900/30 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">
                                {videos.filter(v => v.isReported || (v.reports && v.reports > 0)).length} FLAGS
                              </span>
                            </div>

                            {/* Flagged elements */}
                            <div className="space-y-2">
                              {videos.filter(v => v.isReported || (v.reports && v.reports > 0)).length === 0 ? (
                                <div className="bg-[#111113] p-6 text-center border border-gray-800 rounded-lg space-y-2">
                                  <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto" />
                                  <p className="text-[10px] text-zinc-300 font-bold">No flags awaiting investigation!</p>
                                  <p className="text-[8px] text-zinc-500 leading-normal">Awesome! All virtual streams comply with community policies.</p>
                                </div>
                              ) : (
                                videos.filter(v => v.isReported || (v.reports && v.reports > 0)).map(video => {
                                  const currentStatus = video.investigationStatus || "Submitted";
                                  const stages = ["Submitted", "Under Review", "Action Taken", "Closed"];
                                  const currentIndex = stages.indexOf(currentStatus);
                                  
                                  return (
                                    <div key={video.id} className="bg-[#141416] border border-gray-800 rounded-lg p-3 space-y-3">
                                      {/* Video metadata row */}
                                      <div className="flex gap-2 items-start">
                                        <img src={video.thumbnail} alt="" className="w-16 aspect-video object-cover rounded border border-gray-800 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="bg-red-950/40 text-red-500 border border-red-950 text-[7px] px-1.5 rounded font-bold uppercase inline-block">
                                              Flagged ({video.reports || 1} Reports)
                                            </span>
                                            <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 text-[6px] px-1 rounded font-bold uppercase">
                                              Stage: {currentStatus}
                                            </span>
                                          </div>
                                          <h3 className="text-[9px] font-bold text-white truncate mt-1">{video.title}</h3>
                                          <p className="text-[7px] text-zinc-500">Producer: {video.author}</p>
                                        </div>
                                      </div>

                                      {/* Stepper block */}
                                      <div className="border-t border-gray-800/60 pt-2.5 pb-1 space-y-2">
                                        <div className="flex justify-between items-center text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold">
                                          <span>Investigation Status Stepper</span>
                                          <span className="text-zinc-600">Click node to change stage</span>
                                        </div>
                                        
                                        <div className="relative flex justify-between items-center px-1">
                                          {/* Connecting Line Background */}
                                          <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-zinc-800 -translate-y-1/2 z-0"></div>
                                          
                                          {/* Active Highlight Line */}
                                          <div 
                                            className="absolute top-1/2 left-2 h-[1px] transition-all duration-300 -translate-y-1/2 z-0"
                                            style={{ 
                                              backgroundColor: appConfig.accentColor,
                                              width: `${(currentIndex / (stages.length - 1)) * 90}%`
                                            }}
                                          ></div>
                                          
                                          {stages.map((stage, idx) => {
                                            const isActive = currentStatus === stage;
                                            const isCompleted = idx < currentIndex;
                                            
                                            return (
                                              <button
                                                key={stage}
                                                onClick={() => {
                                                  const updatedVideos = videos.map(v => {
                                                    if (v.id === video.id) {
                                                      return {
                                                        ...v,
                                                        investigationStatus: stage as any
                                                      };
                                                    }
                                                    return v;
                                                  });
                                                  updateVirtualDataFile(updatedVideos, comments, creators);
                                                }}
                                                className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                                                title={`Change status to ${stage}`}
                                              >
                                                <div 
                                                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[7px] font-bold transition-all duration-250 ${
                                                    isActive 
                                                      ? "bg-zinc-950 text-white shadow ring-1 animate-pulse" 
                                                      : isCompleted 
                                                        ? "bg-amber-500 text-black font-extrabold" 
                                                        : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                                                  }`}
                                                  style={{
                                                    borderColor: isActive ? appConfig.accentColor : undefined,
                                                    boxShadow: isActive ? `0 0 8px ${appConfig.accentColor}33` : undefined,
                                                    backgroundColor: isCompleted ? appConfig.accentColor : undefined,
                                                    color: isCompleted ? "#000" : undefined,
                                                    "--tw-ring-color": isActive ? appConfig.accentColor : "transparent"
                                                  }}
                                                >
                                                  {isCompleted ? "✓" : idx + 1}
                                                </div>
                                                <span 
                                                  className={`text-[6px] font-bold uppercase mt-1 tracking-wider ${
                                                    isActive ? "text-white" : "text-zinc-600"
                                                  }`}
                                                  style={{ color: isActive ? appConfig.accentColor : undefined }}
                                                >
                                                  {stage.split(" ")[0]}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Action buttons */}
                                      <div className="flex gap-2 border-t border-gray-800/60 pt-2">
                                        <button
                                          onClick={() => handleDismissReport(video.id)}
                                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1 rounded text-[8px] font-bold uppercase transition-colors cursor-pointer"
                                        >
                                          Dismiss Flag
                                        </button>
                                        <button
                                          onClick={() => handleRemoveVideo(video.id)}
                                          className="flex-1 bg-red-950/40 hover:bg-red-950 text-red-400 py-1 rounded text-[8px] font-bold uppercase border border-red-900/50 transition-colors cursor-pointer"
                                        >
                                          Remove Node
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        ) : adminSubTab === "integrations" ? (
                          <div className="space-y-4 animate-fade-in">
                            <div className="bg-[#111113] p-2.5 rounded-lg border border-gray-800 space-y-1">
                              <h3 className="text-[10px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                                <span>Platform Integration Hub</span>
                              </h3>
                              <p className="text-[7px] text-zinc-500 uppercase">Define environment hooks and cloud database parameters. Changes write directly to metadata.json.</p>
                            </div>

                            {/* Section 1: Ollama */}
                            <div className="bg-[#111113] p-2.5 rounded-lg border border-gray-800 space-y-2.5">
                              <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                                <h4 className="text-[9px] font-extrabold text-zinc-200 uppercase flex items-center gap-1.5">
                                  <Cpu className="h-3 w-3 text-cyan-400" />
                                  <span>Ollama AI Local Node</span>
                                </h4>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={localOllamaCapable} 
                                    onChange={(e) => setLocalOllamaCapable(e.target.checked)}
                                    className="sr-only peer" 
                                  />
                                  <div className="w-7 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-white peer-checked:after:border-cyan-500"></div>
                                  <span className="ml-1.5 text-[7px] font-black uppercase text-zinc-400">
                                    {localOllamaCapable ? "Active" : "Off"}
                                  </span>
                                </label>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Local API Endpoint</span>
                                  <input 
                                    type="text" 
                                    value={localOllamaApi} 
                                    onChange={(e) => setLocalOllamaApi(e.target.value)}
                                    placeholder="http://localhost:11434" 
                                    disabled={!localOllamaCapable}
                                    className="w-full bg-[#141416] disabled:opacity-40 border border-gray-800 rounded px-1.5 py-1 text-[8px] font-mono text-white focus:outline-none focus:border-zinc-700" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Default Model Name</span>
                                  <input 
                                    type="text" 
                                    value={localOllamaModel} 
                                    onChange={(e) => setLocalOllamaModel(e.target.value)}
                                    placeholder="llama3" 
                                    disabled={!localOllamaCapable}
                                    className="w-full bg-[#141416] disabled:opacity-40 border border-gray-800 rounded px-1.5 py-1 text-[8px] font-mono text-white focus:outline-none focus:border-zinc-700" 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Section 2: Agent API & URI */}
                            <div className="bg-[#111113] p-2.5 rounded-lg border border-gray-800 space-y-2.5">
                              <h4 className="text-[9px] font-extrabold text-zinc-200 uppercase flex items-center gap-1.5 border-b border-gray-800 pb-1.5">
                                <Globe className="h-3 w-3 text-purple-400" />
                                <span>Agent API Gateway & URI Entry Points</span>
                              </h4>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Agent API URL</span>
                                  <input 
                                    type="text" 
                                    value={localAgentApi} 
                                    onChange={(e) => setLocalAgentApi(e.target.value)}
                                    placeholder="https://api.pushplay.live/agent" 
                                    className="w-full bg-[#141416] border border-gray-800 rounded px-1.5 py-1 text-[8px] font-mono text-white focus:outline-none focus:border-zinc-700" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Custom Protocol URI</span>
                                  <input 
                                    type="text" 
                                    value={localAgentUri} 
                                    onChange={(e) => setLocalAgentUri(e.target.value)}
                                    placeholder="pp://agent-uri-handler" 
                                    className="w-full bg-[#141416] border border-gray-800 rounded px-1.5 py-1 text-[8px] font-mono text-white focus:outline-none focus:border-zinc-700" 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Section 3: Supabase */}
                            <div className="bg-[#111113] p-2.5 rounded-lg border border-gray-800 space-y-2.5">
                              <h4 className="text-[9px] font-extrabold text-zinc-200 uppercase flex items-center gap-1.5 border-b border-gray-800 pb-1.5">
                                <Database className="h-3 w-3 text-emerald-400" />
                                <span>Supabase Relational Backend Link</span>
                              </h4>

                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Supabase Service URL</span>
                                  <input 
                                    type="text" 
                                    value={localSupabaseUrl} 
                                    onChange={(e) => setLocalSupabaseUrl(e.target.value)}
                                    placeholder="https://your-project.supabase.co" 
                                    className="w-full bg-[#141416] border border-gray-800 rounded px-1.5 py-1 text-[8px] font-mono text-white focus:outline-none focus:border-zinc-700" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Supabase Anon Public Key</span>
                                  <div className="relative">
                                    <input 
                                      type="password" 
                                      value={localSupabaseKey} 
                                      onChange={(e) => setLocalSupabaseKey(e.target.value)}
                                      placeholder="eyJhbGciOiJIUzI1Ni..." 
                                      className="w-full bg-[#141416] border border-gray-800 rounded px-1.5 pr-8 py-1 text-[8px] font-mono text-white focus:outline-none focus:border-zinc-700" 
                                    />
                                    <Key className="absolute right-2 top-2 h-2.5 w-2.5 text-zinc-600" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Save Button */}
                            <button
                              onClick={() => {
                                updateVirtualMetadataFile({
                                  ollamaCapable: localOllamaCapable,
                                  ollamaApiEndpoint: localOllamaApi,
                                  ollamaModel: localOllamaModel,
                                  agentApiUrl: localAgentApi,
                                  agentUri: localAgentUri,
                                  supabaseUrl: localSupabaseUrl,
                                  supabaseAnonKey: localSupabaseKey
                                });
                                alert("Successfully saved integration telemetry configuration to metadata.json!");
                              }}
                              className="w-full bg-amber-500 text-black py-2 rounded text-[8px] font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors cursor-pointer text-center"
                              style={{ backgroundColor: appConfig.accentColor }}
                            >
                              Save & Deploy Integration Settings
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 animate-fade-in text-[10px]">
                            {/* Summary Card */}
                            <div className="bg-[#111113] p-3 rounded-lg border border-gray-800 flex justify-between items-center gap-4">
                              <div className="space-y-1">
                                <h3 className="text-[10px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                                  <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                                  <span>Diagnostic Control Center</span>
                                </h3>
                                <p className="text-[7px] text-zinc-500 uppercase">
                                  {lastCheckedTime ? `Last evaluated at: ${lastCheckedTime}` : "No diagnostic run initiated yet"}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-[7.5px] font-black uppercase text-zinc-500 tracking-wider text-right hidden sm:inline-block">
                                  {agentHealthStatus === "checking" ? "Evaluating Stream Channels..." : "Tap Tactile Core to Run"}
                                </span>
                                
                                {/* Tactile Push Button Widget with 2 concentric outer circles/rings */}
                                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 select-none group">
                                  {/* Outer Circle 1 (Tactile Bezel Border) */}
                                  <div 
                                    className={`absolute inset-0 rounded-full bg-gradient-to-b from-zinc-700 via-zinc-850 to-zinc-950 border border-zinc-650/40 transition-all duration-300 ${
                                      isDiagnosticPressed 
                                        ? "scale-90 shadow-[0_0_15px_rgba(52,211,153,0.5)] border-emerald-500/30" 
                                        : "shadow-[0_2px_8px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-105"
                                    }`}
                                  ></div>
                                  
                                  {/* Outer Circle 2 (Inner Ring Channel Slot) */}
                                  <div 
                                    className={`absolute inset-1.5 rounded-full bg-black border border-zinc-900/80 flex items-center justify-center transition-all duration-300 ${
                                      isDiagnosticPressed 
                                        ? "scale-90 shadow-[inset_0_2px_8px_rgba(52,211,153,0.7),0_0_8px_rgba(52,211,153,0.3)] border-emerald-500/20" 
                                        : "shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
                                    }`}
                                  ></div>

                                  {/* Core Clickable Push Button */}
                                  <button
                                    onClick={runApiHealthDiagnostics}
                                    onMouseDown={() => setIsDiagnosticPressed(true)}
                                    onMouseUp={() => setIsDiagnosticPressed(false)}
                                    onMouseLeave={() => setIsDiagnosticPressed(false)}
                                    onTouchStart={() => setIsDiagnosticPressed(true)}
                                    onTouchEnd={() => setIsDiagnosticPressed(false)}
                                    disabled={agentHealthStatus === "checking" || supabaseHealthStatus === "checking"}
                                    className={`absolute inset-2.5 rounded-full transition-all duration-300 ease-out cursor-pointer flex items-center justify-center active:scale-90 active:translate-y-0.5 ${
                                      agentHealthStatus === "checking"
                                        ? "bg-amber-500 text-black scale-[0.85] translate-y-[2px]"
                                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:scale-105"
                                    }`}
                                    title="Run Diagnostics"
                                    style={{
                                      boxShadow: agentHealthStatus === "checking"
                                        ? "inset 0 3px 6px rgba(0,0,0,0.85), 0 0 12px rgba(245,158,11,0.5)"
                                        : "0 3px 6px rgba(0,0,0,0.55), inset 0 1px 2px rgba(255,255,255,0.3)"
                                    }}
                                  >
                                    <RefreshCw className={`h-3 w-3 ${agentHealthStatus === "checking" ? "animate-spin" : ""}`} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Node Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              
                              {/* Node 1: Agent API */}
                              <div className="bg-[#111113] p-3 rounded-lg border border-gray-800 flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                                    <h4 className="text-[9px] font-extrabold text-zinc-200 uppercase flex items-center gap-1.5">
                                      <Globe className="h-3.5 w-3.5 text-purple-400" />
                                      <span>Agent Gateway API</span>
                                    </h4>
                                    <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase border transition-all ${
                                      agentHealthStatus === "connected"
                                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                                        : agentHealthStatus === "checking"
                                          ? "bg-zinc-900 text-zinc-400 border-zinc-800 animate-pulse"
                                          : agentHealthStatus === "timeout"
                                            ? "bg-amber-950/40 text-amber-500 border-amber-900/30"
                                            : agentHealthStatus === "failed"
                                              ? "bg-red-950/40 text-red-500 border-red-900/30"
                                              : "bg-zinc-950 text-zinc-600 border-zinc-800"
                                    }`}>
                                      {agentHealthStatus === "idle" ? "READY" : agentHealthStatus.toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Configured URL</span>
                                    <div className="bg-[#141416] border border-gray-800/80 rounded px-2 py-1 flex items-center justify-between gap-1">
                                      <span className="font-mono text-[7.5px] text-zinc-300 truncate select-all">
                                        {appConfig.adminConfig?.agentApiUrl || "https://api.pushplay.live/agent"}
                                      </span>
                                      <button 
                                        onClick={() => {
                                          navigator.clipboard.writeText(appConfig.adminConfig?.agentApiUrl || "https://api.pushplay.live/agent");
                                          alert("Copied Agent URL to clipboard!");
                                        }}
                                        className="text-zinc-600 hover:text-white transition-colors cursor-pointer"
                                        title="Copy URL"
                                      >
                                        <Copy className="h-2.5 w-2.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Diagnostics feedback */}
                                  <div className="bg-[#141416]/50 p-2 rounded border border-gray-800/50 space-y-1">
                                    <div className="flex justify-between items-center text-[7px] text-zinc-500 uppercase">
                                      <span>Latency Roundtrip</span>
                                      <span className="font-mono font-bold text-zinc-400">
                                        {agentLatency !== null ? `${agentLatency} ms` : "--"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[7px] text-zinc-500 uppercase">
                                      <span>Diagnostics Status</span>
                                      <span className="font-mono font-bold text-zinc-400">
                                        {agentError ? "Failed / Blocked" : agentHealthStatus === "connected" ? "Stable (Opaque Mode)" : "Unresolved"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-[7px] text-zinc-500 leading-normal bg-zinc-950/40 p-1.5 rounded border border-zinc-900">
                                  <span className="font-extrabold text-zinc-400 uppercase block mb-0.5 text-[6.5px]">Gateway Advisory:</span>
                                  This verifies direct TCP connectivity and DNS resolution. Since client pings run inside your browser, local network routers or local firewalls may affect this result.
                                </div>
                              </div>

                              {/* Node 2: Supabase */}
                              <div className="bg-[#111113] p-3 rounded-lg border border-gray-800 flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                                    <h4 className="text-[9px] font-extrabold text-zinc-200 uppercase flex items-center gap-1.5">
                                      <Database className="h-3 w-3 text-emerald-400" />
                                      <span>Supabase Relational Cloud</span>
                                    </h4>
                                    <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase border transition-all ${
                                      supabaseHealthStatus === "connected"
                                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                                        : supabaseHealthStatus === "checking"
                                          ? "bg-zinc-900 text-zinc-400 border-zinc-800 animate-pulse"
                                          : supabaseHealthStatus === "timeout"
                                            ? "bg-amber-950/40 text-amber-500 border-amber-900/30"
                                            : supabaseHealthStatus === "failed"
                                              ? "bg-red-950/40 text-red-500 border-red-900/30"
                                              : "bg-zinc-950 text-zinc-600 border-zinc-800"
                                    }`}>
                                      {supabaseHealthStatus === "idle" ? "READY" : supabaseHealthStatus.toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Configured URL</span>
                                    <div className="bg-[#141416] border border-gray-800/80 rounded px-2 py-1 flex items-center justify-between gap-1">
                                      <span className="font-mono text-[7.5px] text-zinc-300 truncate select-all">
                                        {appConfig.adminConfig?.supabaseUrl || "https://your-supabase-project.supabase.co"}
                                      </span>
                                      <button 
                                        onClick={() => {
                                          navigator.clipboard.writeText(appConfig.adminConfig?.supabaseUrl || "https://your-supabase-project.supabase.co");
                                          alert("Copied Supabase URL to clipboard!");
                                        }}
                                        className="text-zinc-600 hover:text-white transition-colors cursor-pointer"
                                        title="Copy URL"
                                      >
                                        <Copy className="h-2.5 w-2.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Diagnostics feedback */}
                                  <div className="bg-[#141416]/50 p-2 rounded border border-gray-800/50 space-y-1">
                                    <div className="flex justify-between items-center text-[7px] text-zinc-500 uppercase">
                                      <span>Latency Roundtrip</span>
                                      <span className="font-mono font-bold text-zinc-400">
                                        {supabaseLatency !== null ? `${supabaseLatency} ms` : "--"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[7px] text-zinc-500 uppercase">
                                      <span>Diagnostics Status</span>
                                      <span className="font-mono font-bold text-zinc-400">
                                        {supabaseError ? "Failed / Blocked" : supabaseHealthStatus === "connected" ? "Stable (Opaque Mode)" : "Unresolved"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-[7px] text-zinc-500 leading-normal bg-zinc-950/40 p-1.5 rounded border border-zinc-900">
                                  <span className="font-extrabold text-zinc-400 uppercase block mb-0.5 text-[6.5px]">Database Advisory:</span>
                                  This validates direct network reachability to the Supabase REST service layer. If you receive "Failed" due to placeholder hostnames, configure a real URL in the Integrations tab first.
                                </div>
                              </div>

                            </div>

                            {/* Troubleshooting Info Panel */}
                            <div className="bg-[#111113] p-3 rounded-lg border border-gray-800 space-y-2">
                              <h4 className="text-[9px] font-extrabold text-zinc-200 uppercase flex items-center gap-1.5 border-b border-gray-800 pb-1.5">
                                <Sliders className="h-3 w-3 text-amber-500" style={{ color: appConfig.accentColor }} />
                                <span>Network Diagnostic Troubleshooting Advisory</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[7.5px] text-zinc-400 leading-relaxed">
                                <div className="space-y-1 bg-[#141416] p-2 rounded border border-gray-800/50">
                                  <span className="font-bold text-white uppercase block">1. What does 'Connected' mean?</span>
                                  <span>It means a TCP connection handshake succeeded. Because we use "opaque no-cors" pings, the browser is able to successfully target the URL and measure latency, even if the server does not expose cross-origin headers to allow direct data reading.</span>
                                </div>
                                <div className="space-y-1 bg-[#141416] p-2 rounded border border-gray-800/50">
                                  <span className="font-bold text-white uppercase block">2. Why 'Network Error' or 'Failed'?</span>
                                  <span>This usually happens if the domain does not exist, if the endpoint is offline, or if standard DNS resolution fails. Make sure the URLs are formatted correctly with `https://` (or `http://` for local testing) and that target hosts are actively online.</span>
                                </div>
                                <div className="space-y-1 bg-[#141416] p-2 rounded border border-gray-800/50">
                                  <span className="font-bold text-white uppercase block">3. Local localhost / CORS Tips</span>
                                  <span>If you are pointing to a local dev server (e.g., localhost), ensure that server is running locally on your machine. Browsers will let you check localhost endpoints seamlessly as long as the server process is alive!</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : simActiveTab === "wallet" ? (
                      /* SIMULATED CRYPTO WALLET & STAKING VIEW */
                      <div className="space-y-4 text-[10px]">
                        <div className="flex justify-between items-center bg-zinc-900/40 p-3 rounded-lg border border-gray-800">
                          <div>
                            <span className="text-[7px] text-zinc-500 font-bold uppercase block">WALLET BALANCE</span>
                            <span className="text-sm font-black text-white">{appConfig.tokenCount.toLocaleString()} PPL</span>
                          </div>
                          <Coins className="h-5 w-5 text-amber-500" style={{ color: appConfig.accentColor }} />
                        </div>

                        {/* Interactive staking feature */}
                        <div className="bg-[#111113] p-3 rounded-lg border border-gray-800 space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-bold text-white text-xs uppercase tracking-wider">CREATOR STAKING</h3>
                              <p className="text-[8px] text-zinc-500 leading-none">Stake PPL tokens to receive platform APY yields</p>
                            </div>
                            <span className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-500 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                              Active APY: 14.5%
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[9px] text-zinc-400 border-b border-gray-800/60 pb-2">
                            <span>CURRENTLY STAKED:</span>
                            <span className="font-bold text-white">{stakedAmount} PPL</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (appConfig.tokenCount >= 200) {
                                  setIsStakingPending(true);
                                  setTimeout(() => {
                                    setStakedAmount(stakedAmount + 200);
                                    setAppConfig(prev => ({ ...prev, tokenCount: prev.tokenCount - 200 }));
                                    setIsStakingPending(false);
                                  }, 800);
                                } else {
                                  alert("Insufficient PPL tokens to stake!");
                                }
                              }}
                              disabled={isStakingPending}
                              className="flex-1 bg-amber-500 text-black py-1.5 rounded font-bold uppercase text-[8px] transition-all hover:scale-[1.01]"
                              style={{ backgroundColor: appConfig.accentColor }}
                            >
                              {isStakingPending ? "Staking Nodes..." : "Stake 200 PPL"}
                            </button>
                            <button
                              onClick={() => {
                                if (stakedAmount >= 200) {
                                  setStakedAmount(stakedAmount - 200);
                                  setAppConfig(prev => ({ ...prev, tokenCount: prev.tokenCount + 200 }));
                                } else {
                                  alert("No staked balance remaining!");
                                }
                              }}
                              className="flex-1 bg-[#1c1c1e] text-zinc-300 py-1.5 rounded font-bold uppercase text-[8px] border border-gray-800 transition-colors hover:bg-zinc-800"
                            >
                              Unstake 200
                            </button>
                          </div>
                        </div>

                        {/* Recent ledger records */}
                        <div className="space-y-1.5">
                          <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest block pl-1">Recent platform rewards</span>
                          <div className="space-y-1">
                            {[
                              { label: "Prophetic stream staking rewards", val: "+45 PPL", date: "Today", isAdd: true },
                              { label: "Wellington Central stream view payout", val: "+112 PPL", date: "Yesterday", isAdd: true },
                              { label: "Staked to Creator Pool node", val: "-200 PPL", date: "2 days ago", isAdd: false }
                            ].map((led, lIdx) => (
                              <div key={lIdx} className="bg-[#141416]/50 p-2 rounded flex justify-between items-center border border-gray-800/40 text-[8px]">
                                <div>
                                  <span className="font-bold text-zinc-300 block">{led.label}</span>
                                  <span className="text-zinc-600 block">{led.date}</span>
                                </div>
                                <span className={led.isAdd ? "text-emerald-500 font-bold" : "text-red-400 font-bold"}>{led.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : simActiveTab === "store" ? (
                      /* SIMULATED ONLINE STORE VIEW */
                      <div className="space-y-4 text-[10px]">
                        <div>
                          <h2 className="text-xs font-black text-white uppercase tracking-wider">CREATOR MARKETPLACE</h2>
                          <p className="text-[7px] text-zinc-500 uppercase mt-0.5">Redeem platform tokens for premium cinema passes</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: "Prophetic Watch VIP Pass", cost: "1,500 PPL", desc: "Unlock exclusive unedited live commentary videos", icon: "🎟️" },
                            { name: "Wellington Dusk LUT Pack", cost: "800 PPL", desc: "Cinematic color filter pack for camera outputs", icon: "🎨" },
                            { name: "Creator Studio Badge", cost: "500 PPL", desc: "Showcases verified profile icon next to streams", icon: "⭐" },
                            { name: "Double View Reward Booster", cost: "1,200 PPL", desc: "Boost staking payouts on your video cards for 24h", icon: "🚀" }
                          ].map((item, iIdx) => (
                            <div key={iIdx} className="bg-[#111113] p-2.5 rounded-lg border border-gray-800 space-y-1.5 flex flex-col justify-between">
                              <div className="space-y-1">
                                <span className="text-xl">{item.icon}</span>
                                <h3 className="font-bold text-[9px] text-white leading-tight">{item.name}</h3>
                                <p className="text-[8px] text-zinc-500 leading-normal">{item.desc}</p>
                              </div>
                              <button
                                onClick={() => {
                                  const amt = Number(item.cost.replace(/[^0-9]/g, ""));
                                  if (appConfig.tokenCount >= amt) {
                                    setAppConfig(prev => ({ ...prev, tokenCount: prev.tokenCount - amt }));
                                    alert(`Successfully unlocked ${item.name}! Applied profile active nodes.`);
                                  } else {
                                    alert("Insufficient PPL tokens in wallet!");
                                  }
                                }}
                                className="w-full bg-[#1c1c1e] hover:bg-amber-500 hover:text-black py-1 rounded text-[8px] font-bold uppercase transition-colors flex justify-between px-2 text-zinc-400 border border-gray-800 hover:border-amber-500"
                              >
                                <span>Buy Item</span>
                                <span>{item.cost}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : simActiveTab === "trends" ? (
                      /* SIMULATED TRENDS AND ANALYTICS SECTION */
                      <div className="space-y-4 text-[10px] animate-fade-in">
                        <div className="flex justify-between items-center bg-[#111113] p-2.5 rounded-lg border border-gray-800">
                          <div>
                            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                              <TrendingUp className="h-3.5 w-3.5 text-amber-500" style={{ color: appConfig.accentColor }} />
                              <span>Platform Growth Trends</span>
                            </h2>
                            <p className="text-[7px] text-zinc-500 uppercase mt-0.5">Real-time view growth and telemetry logs</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handleExportPerformanceCSV}
                              className="flex items-center gap-1 text-[7px] px-2 py-1 rounded font-black uppercase border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                              style={{ 
                                borderColor: `${appConfig.accentColor}44`,
                                color: appConfig.accentColor
                              }}
                              title="Export current trends, views, and likes data as a CSV report"
                            >
                              <FileSpreadsheet className="h-2.5 w-2.5" />
                              <span>Export CSV</span>
                            </button>
                            <span 
                              className="text-[7px] px-1.5 py-1 rounded font-black uppercase border border-zinc-800 bg-[#161618] text-zinc-400"
                            >
                              Live Analytics
                            </span>
                          </div>
                        </div>

                        {/* Stat Grid */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <div className="bg-[#111113] p-1.5 rounded border border-gray-800 flex flex-col justify-center">
                            <span className="text-[6px] text-zinc-500 font-bold uppercase block leading-none">TOTAL VIEWS</span>
                            <span className="text-[10px] font-black text-white mt-1 leading-none">
                              {videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-[#111113] p-1.5 rounded border border-gray-800 flex flex-col justify-center">
                            <span className="text-[6px] text-zinc-500 font-bold uppercase block leading-none">TOTAL LIKES</span>
                            <span className="text-[10px] font-black text-white mt-1 leading-none">
                              {videos.reduce((sum, v) => sum + v.likes, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-[#111113] p-1.5 rounded border border-gray-800 flex flex-col justify-center">
                            <span className="text-[6px] text-zinc-500 font-bold uppercase block leading-none">ACTIVE CHANNELS</span>
                            <span className="text-[10px] font-black text-white mt-1 leading-none">
                              {creators.length}
                            </span>
                          </div>
                          <div className="bg-[#111113] p-1.5 rounded border border-gray-800 flex flex-col justify-center">
                            <span className="text-[6px] text-zinc-500 font-bold uppercase block leading-none">STAKING APY</span>
                            <span className="text-[10px] font-black text-emerald-500 mt-1 leading-none">14.5%</span>
                          </div>
                        </div>

                        {/* Main Chart Card - Views Growth over Time */}
                        <div className="bg-[#111113] p-2.5 rounded-lg border border-gray-800 space-y-1.5">
                          <div className="flex justify-between items-center text-[7px] font-bold uppercase">
                            <span className="text-zinc-300">Views & Engagement Timeline (Weekly)</span>
                            <span className="text-zinc-500">Telemetry Area Map</span>
                          </div>
                          <div className="w-full h-28">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={trendsData} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={appConfig.accentColor} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={appConfig.accentColor} stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1e" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" fontSize={6} tickLine={false} />
                                <YAxis stroke="#52525b" fontSize={6} tickLine={false} />
                                <RechartsTooltip 
                                  contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#222222", fontSize: "7px" }} 
                                  labelStyle={{ fontWeight: "bold", color: "#f4f4f5" }}
                                />
                                <Area type="monotone" dataKey="Views" stroke={appConfig.accentColor} fillOpacity={1} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="Likes" stroke="#10b981" fillOpacity={1} fill="url(#colorLikes)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Comparative Breakouts */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#111113] p-2 rounded-lg border border-gray-800 space-y-1.5">
                            <span className="text-[7px] font-bold uppercase text-zinc-300 block">Relative Viewer Index</span>
                            <div className="w-full h-24">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={videoComparisonData} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1e" vertical={false} />
                                  <XAxis dataKey="title" stroke="#52525b" fontSize={5} tickLine={false} />
                                  <YAxis stroke="#52525b" fontSize={5} tickLine={false} />
                                  <RechartsTooltip 
                                    contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#222222", fontSize: "6px" }} 
                                  />
                                  <Bar dataKey="Views" fill={appConfig.accentColor} radius={[1, 1, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="bg-[#111113] p-2.5 rounded-lg border border-gray-800 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[7px] font-bold uppercase text-zinc-300 block">Performance Log</span>
                              <div className="space-y-1 max-h-20 overflow-y-auto pr-0.5">
                                {videos.slice(0, 4).map((vid, idx) => {
                                  const maxVal = Math.max(...videos.map(v => v.views), 1);
                                  const percent = Math.round((vid.views / maxVal) * 100);
                                  return (
                                    <div key={vid.id} className="space-y-0.5">
                                      <div className="flex justify-between items-center text-[6px] text-zinc-400">
                                        <span className="truncate max-w-[70px] font-semibold">{vid.title}</span>
                                        <span>{vid.views > 1000 ? `${(vid.views/1000).toFixed(1)}K` : vid.views}</span>
                                      </div>
                                      <div className="h-0.5 bg-zinc-950 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full rounded-full transition-all duration-500" 
                                          style={{ 
                                            width: `${percent}%`, 
                                            backgroundColor: idx % 2 === 0 ? appConfig.accentColor : "#10b981" 
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* DEFAULT TAB VIEW PLACEHOLDER */
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-[#111113] border border-gray-800 rounded-lg h-48 space-y-2">
                        <Moon className="h-6 w-6 text-zinc-600" />
                        <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">{simActiveTab} Stream Active</p>
                        <p className="text-[8px] text-zinc-500 leading-normal max-w-xs">No entries flagged under this playlist segment. Add content nodes in metadata.json features config.</p>
                      </div>
                    )}

                  </main>
                </div>

                {/* Simulated App Footer/Live status indicators */}
                <footer className="h-6 bg-[#0c0c0e] border-t border-gray-800/80 px-4 flex items-center justify-between text-[7px] text-gray-500 font-bold uppercase tracking-widest flex-shrink-0">
                  <span>● Live synchronization active</span>
                  <span>FPS: 60.0</span>
                </footer>

              </div>
            )}

          </div>

          {/* SIMULATED UPLOAD MODAL DIALOG OVERLAY */}
          {showUploadModal && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-[10px]">
              <div className="w-full max-w-xs bg-[#0c0c0e] border border-gray-800 rounded-lg overflow-hidden flex flex-col">
                <div className="bg-[#141416] p-2.5 border-b border-gray-800 flex justify-between items-center">
                  <span className="font-extrabold uppercase tracking-widest text-white">Upload live stream</span>
                  <button onClick={() => setShowUploadModal(false)} className="text-zinc-500 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Upload Form simulator */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const titleVal = fd.get("title")?.toString() || "Untitled Stream";
                    const authorVal = fd.get("author")?.toString() || "PushPlay Curator";
                    const durationVal = fd.get("dur")?.toString() || "15:00";
                    const categoryVal = fd.get("cat")?.toString() || "Testimonies";
                    const descVal = fd.get("desc")?.toString() || "Simulated stream description log.";

                    handlePublishLiveStream({
                      title: titleVal,
                      author: authorVal,
                      duration: durationVal,
                      category: categoryVal,
                      description: descVal,
                      thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80"
                    });
                  }}
                  className="p-3 space-y-2"
                >
                  <div className="space-y-1">
                    <label className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold">Stream Title</label>
                    <input name="title" required placeholder="Prophetic alert..." className="w-full bg-[#141416] border border-gray-800 rounded p-1 text-[8px] text-white" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold">Creator Author Name</label>
                    <input name="author" required placeholder="A Word of Wisdom" className="w-full bg-[#141416] border border-gray-800 rounded p-1 text-[8px] text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold">Category</label>
                      <select name="cat" className="w-full bg-[#141416] border border-gray-800 rounded p-1 text-[8px] text-white">
                        <option value="Testimonies">Testimonies</option>
                        <option value="Mixes">Mixes</option>
                        <option value="Music">Music</option>
                        <option value="Kickboxing">Kickboxing</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold">Duration</label>
                      <input name="dur" placeholder="28:05" className="w-full bg-[#141416] border border-gray-800 rounded p-1 text-[8px] text-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold">Curator Description</label>
                    <textarea name="desc" placeholder="A comprehensive log check..." rows={2} className="w-full bg-[#141416] border border-gray-800 rounded p-1 text-[8px] text-white" />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-1.5 rounded text-[8px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: appConfig.accentColor }}
                  >
                    Publish live stream
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SIMULATED LOGIN MODAL DIALOG OVERLAY */}
          {showLoginModal && (
            <div id="login-modal" className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 text-[10px] animate-fade-in font-sans">
              <div className="w-full max-w-xs bg-[#0c0c0e] border border-zinc-850 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                {/* Modal Header */}
                <div className="bg-[#141416] p-3 border-b border-zinc-800/80 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-white">
                    <LogIn className="h-3.5 w-3.5 text-amber-500 animate-pulse" style={{ color: appConfig.accentColor }} />
                    <span className="font-extrabold uppercase tracking-widest text-[9px]">Secure Access Terminal</span>
                  </div>
                  <button 
                    onClick={() => setShowLoginModal(false)} 
                    className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 space-y-3.5">
                  <div className="text-center space-y-1">
                    <h3 className="text-white font-black uppercase text-[10px] tracking-wider">Authentication Gateway</h3>
                    <p className="text-[7px] text-zinc-500 uppercase">SIGN IN TO ACCESS CORE LEDGER & COMPLIANCE</p>
                  </div>

                  {/* Auth Presets Helper Badges */}
                  <div className="bg-[#111113] p-2 rounded border border-gray-800/70 space-y-1.5 text-left">
                    <span className="text-[6.5px] font-bold uppercase text-zinc-500 tracking-wider block">Credential Hotkeys (Click to Autofill)</span>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const emailInput = document.getElementById("login-email") as HTMLInputElement;
                          const pwdInput = document.getElementById("login-password") as HTMLInputElement;
                          if (emailInput && pwdInput) {
                            emailInput.value = "nexusos@commandnexus.net";
                            pwdInput.value = "admin1234567";
                          }
                        }}
                        className="w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-1 rounded text-[7px] flex justify-between items-center text-zinc-300 cursor-pointer"
                      >
                        <span className="font-bold flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-[#f59e0b]" style={{ backgroundColor: appConfig.accentColor }}></span>
                          nexusos@commandnexus.net (Admin)
                        </span>
                        <span className="text-zinc-600 font-mono text-[6.5px]">admin1234567</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const emailInput = document.getElementById("login-email") as HTMLInputElement;
                          const pwdInput = document.getElementById("login-password") as HTMLInputElement;
                          if (emailInput && pwdInput) {
                            emailInput.value = "member@commandnexus.net";
                            pwdInput.value = "admin1234567";
                          }
                        }}
                        className="w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-1 rounded text-[7px] flex justify-between items-center text-zinc-300 cursor-pointer"
                      >
                        <span className="font-bold flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-blue-500"></span>
                          member@commandnexus.net (Member)
                        </span>
                        <span className="text-zinc-600 font-mono text-[6.5px]">admin1234567</span>
                      </button>
                    </div>
                  </div>

                  {/* Login Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const email = formData.get("email") as string;
                      const pwd = formData.get("password") as string;

                      if (pwd !== "admin1234567") {
                        alert("Access Denied: Invalid secure authentication token password. Please use 'admin1234567'.");
                        return;
                      }

                      setIsSimLoggedIn(true);
                      setSimUserEmail(email);
                      if (email === "nexusos@commandnexus.net") {
                        setSimUserRole("admin");
                        setLatestStatus("Logged in securely as platform Administrator");
                        alert("Access granted: Secure Admin Session Initialized.");
                      } else {
                        setSimUserRole("member");
                        setLatestStatus(`Logged in securely as Member (${email})`);
                        alert(`Access granted: Member session established for ${email}.`);
                      }
                      setShowLoginModal(false);
                    }}
                    className="space-y-3 text-left"
                  >
                    <div className="space-y-1">
                      <label className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Network Identity (Email)</label>
                      <input 
                        id="login-email"
                        name="email" 
                        type="email"
                        required 
                        placeholder="identity@endpoint.net" 
                        defaultValue="nexusos@commandnexus.net"
                        className="w-full bg-[#141416] border border-gray-800 rounded p-1 text-[8px] text-white focus:outline-none focus:border-amber-500" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[7px] uppercase tracking-wider text-zinc-500 font-extrabold block">Secure Access Key (Password)</label>
                      <input 
                        id="login-password"
                        name="password" 
                        type="password"
                        required 
                        placeholder="•••••••••••••" 
                        defaultValue="admin1234567"
                        className="w-full bg-[#141416] border border-gray-800 rounded p-1 text-[8px] text-white focus:outline-none focus:border-amber-500" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black py-1.5 rounded text-[8.5px] font-extrabold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: appConfig.accentColor }}
                    >
                      <ShieldAlert className="h-3 w-3 text-black" />
                      <span>Authenticate Session</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATED REPORT MODAL DIALOG OVERLAY */}
          {showReportModal && reportingVideoId && (() => {
            const reportedVid = videos.find(v => v.id === reportingVideoId);
            if (!reportedVid) return null;
            
            const currentStatus = reportedVid.investigationStatus || "Submitted";
            const stages = ["Submitted", "Under Review", "Action Taken", "Closed"];
            const currentIndex = stages.indexOf(currentStatus);
            
            return (
              <div id="report-modal" className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-[10px] animate-fade-in font-sans">
                <div className="w-full max-w-sm bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                  {/* Modal Header */}
                  <div className="bg-[#141416] p-3 border-b border-zinc-800/80 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-white">
                      <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" />
                      <span className="font-extrabold uppercase tracking-widest text-xs">Compliance Investigation</span>
                    </div>
                    <button 
                      onClick={() => {
                        setShowReportModal(false);
                        setReportingVideoId(null);
                      }} 
                      className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Modal Body */}
                  <div className="p-4 space-y-4">
                    {/* Video Summary Card */}
                    <div className="bg-[#141416]/60 p-2.5 rounded-lg border border-gray-800/80 flex gap-3">
                      <img 
                        src={reportedVid.thumbnail} 
                        alt="" 
                        className="w-16 aspect-video object-cover rounded border border-gray-800/80 flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <span className="bg-red-950/30 text-red-500 border border-red-900/40 text-[7px] px-1.5 rounded font-bold uppercase inline-block mb-1">
                          Flagged Node ({reportedVid.reports || 1} Reports)
                        </span>
                        <h4 className="text-[9px] font-bold text-white truncate">{reportedVid.title}</h4>
                        <p className="text-[7px] text-zinc-500">Producer: {reportedVid.author}</p>
                      </div>
                    </div>
                    
                    {/* Stepper Container */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-zinc-400">
                        <span>Investigation Progress Timeline</span>
                        <span className="text-zinc-600">Click a stage to simulate</span>
                      </div>
                      
                      {/* Horizontal Stepper Row */}
                      <div className="relative flex justify-between items-center px-1 py-2">
                        {/* Connecting Line Background */}
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-zinc-850 -translate-y-1/2 z-0"></div>
                        
                        {/* Active Progress Connecting Line */}
                        <div 
                          className="absolute top-1/2 left-4 h-0.5 transition-all duration-300 -translate-y-1/2 z-0"
                          style={{ 
                            backgroundColor: appConfig.accentColor,
                            width: `${(currentIndex / (stages.length - 1)) * 90}%`
                          }}
                        ></div>
                        
                        {/* Steps */}
                        {stages.map((stage, idx) => {
                          const isActive = currentStatus === stage;
                          const isCompleted = idx < currentIndex;
                          
                          return (
                            <button
                              key={stage}
                              onClick={() => {
                                // Dynamically update the stage of the report!
                                const updatedVideos = videos.map(v => {
                                  if (v.id === reportedVid.id) {
                                    return {
                                      ...v,
                                      investigationStatus: stage as any
                                    };
                                  }
                                  return v;
                                });
                                updateVirtualDataFile(updatedVideos, comments, creators);
                              }}
                              className="relative z-10 flex flex-col items-center focus:outline-none group cursor-pointer"
                            >
                              {/* Step circle with gradient borders */}
                              <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 text-[9px] font-bold ${
                                  isActive 
                                    ? "bg-zinc-950 text-white shadow-lg ring-2 animate-pulse" 
                                    : isCompleted 
                                      ? "bg-amber-500 text-black font-black" 
                                      : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                                }`}
                                style={{
                                  borderColor: isActive ? appConfig.accentColor : undefined,
                                  boxShadow: isActive ? `0 0 12px ${appConfig.accentColor}33` : undefined,
                                  backgroundColor: isCompleted ? appConfig.accentColor : undefined,
                                  color: isCompleted ? "#000" : undefined,
                                  "--tw-ring-color": isActive ? appConfig.accentColor : "transparent"
                                }}
                              >
                                {isCompleted ? (
                                  <Check className="h-3 w-3 stroke-[3]" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              
                              {/* Step Label */}
                              <span 
                                className={`text-[7px] font-black uppercase mt-1.5 transition-colors tracking-wider ${
                                  isActive 
                                    ? "text-white" 
                                    : isCompleted 
                                      ? "text-zinc-300" 
                                      : "text-zinc-600"
                                }`}
                                style={{
                                  color: isActive ? appConfig.accentColor : undefined
                                }}
                              >
                                {stage.split(" ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Current Stage Description Block */}
                    <div className="bg-[#111113] p-3 rounded-lg border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" style={{ backgroundColor: appConfig.accentColor }}></span>
                        <span className="text-[9px] font-extrabold uppercase text-white tracking-wider">
                          Stage {currentIndex + 1}: {currentStatus}
                        </span>
                      </div>
                      <p className="text-[8px] text-zinc-400 font-light leading-relaxed">
                        {currentStatus === "Submitted" && "The stream has been flagged by the community. System analytics and automated logs are queued for ingestion. Awaiting live reviewer assignation."}
                        {currentStatus === "Under Review" && "Reviewer assigned. Stream playback feed, metadata, and user report comments are undergoing compliance check. Staking yields on this node are temporarily locked."}
                        {currentStatus === "Action Taken" && "Compliance audit concluded. The system applied recommended action: stream flagged state confirmed, telemetry logged, warning notification broadcasted to creator."}
                        {currentStatus === "Closed" && "Investigation complete. Case closed. All resolution flags logged in the platform ledger. Staking nodes updated."}
                      </p>
                    </div>
                    
                    {/* Compliance Action Row */}
                    <div className="flex gap-2 border-t border-zinc-850 pt-3">
                      <button
                        onClick={() => {
                          handleDismissReport(reportedVid.id);
                          setShowReportModal(false);
                          setReportingVideoId(null);
                        }}
                        className="flex-1 bg-[#141416] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 py-1.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer text-center"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => {
                          handleRemoveVideo(reportedVid.id);
                          setShowReportModal(false);
                          setReportingVideoId(null);
                        }}
                        className="flex-1 bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/45 py-1.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer text-center"
                      >
                        Remove Node
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </aside>

      </div>

      {/* 3. BOTTOM FOOTER STATUS BAR */}
      <footer className="h-8 border-t border-[#222222] bg-[#111111] flex items-center justify-between px-4 flex-shrink-0 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <span className="text-emerald-500 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            ● ONLINE
          </span>
          <span>Workspace: LocalStorage Persisted</span>
          <span>FPS: 60.0</span>
          <span>Status: <span className="text-zinc-300 font-normal normal-case">{latestStatus}</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span>Zoom</span>
            <span className="text-zinc-300 font-normal">100%</span>
          </div>
          <span className="cursor-pointer hover:text-white" onClick={() => alert("IDE Console clean. Live mapping in sync.")}>Console</span>
          <span className="cursor-pointer hover:text-white" onClick={() => alert("Welcome to PushPlay Studio! Request features from Gemini or type code inside components.")}>Help</span>
        </div>
      </footer>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
