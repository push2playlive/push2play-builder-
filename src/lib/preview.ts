// Builds the srcDoc for the sandboxed preview iframe.
// Compiles JSX in-browser using Babel standalone (classic React runtime).

export function buildPreviewSrcDoc(code: string): string {
  // Pre-process code to guarantee we have an App component if none is explicitly declared
  let processedCode = code;
  
  // Strip import statements that would crash the classic React environment or Babel Standalone
  processedCode = processedCode
    .replace(/import\s+React\b[^;]*;/g, "")
    .replace(/import\s+{[^}]*}\s+from\s+['"]react['"];?/g, "")
    .replace(/import\s+[^;]+from\s+['"][^'"]+['"];?/g, ""); // strip other imports safely
  
  if (!code.includes("function App") && !code.includes("const App") && !code.includes("class App")) {
    // Try to find any functional component export in the file
    const match = code.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/) 
      || code.match(/function\s+([A-Za-z0-9_]+)/)
      || code.match(/const\s+([A-Za-z0-9_]+)\s*=\s*\(/);
    
    if (match && match[1]) {
      const compName = match[1];
      processedCode += `\n\nfunction App() { return <div className="p-6 bg-[#0a0a0a] min-h-screen text-white font-sans"><div className="mb-4 text-[10px] text-amber-500 uppercase tracking-widest font-bold">Rendering Live Sandbox: <b>${compName}</b></div><${compName} /></div>; }`;
    } else {
      processedCode += `\n\nfunction App() { return <div className="p-6 bg-[#0a0a0a] min-h-screen text-red-400 font-sans">No React functional components were automatically detected in this file. Please write a functional component (e.g. <code>function App() { ... }</code>) to preview it in this Real Sandbox!</div>; }`;
    }
  }

  const encoded = btoa(unescape(encodeURIComponent(processedCode)));
  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  html,body{margin:0;padding:0;background:#0a0a0a;color:#fff;font-family:Inter,system-ui,sans-serif}
  #root{min-height:100vh}
  .__err{padding:20px;color:#ffb4a2;background:#1a0a0a;border-left:3px solid #ff4d4d;font-family:ui-monospace,Menlo,monospace;font-size:13px;white-space:pre-wrap;margin:16px;border-radius:8px}
  .__loading{display:flex;align-items:center;justify-content:center;height:100vh;color:#888;letter-spacing:3px;font-size:11px;text-transform:uppercase}
  .__dot{width:6px;height:6px;border-radius:99px;background:#ff6b00;margin:0 4px;animation:pulse 1.2s infinite}
  .__dot:nth-child(2){animation-delay:.15s}.__dot:nth-child(3){animation-delay:.3s}
  @keyframes pulse{0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:scale(1.2)}}
</style>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'orange-brand': '#f97316',
          'orange-brand2': '#ea580c',
          'canvas-panel': '#101012',
          'canvas-bg': '#09090b',
        }
      }
    }
  }
</script>
</head>
<body>
<div id="root"><div class="__loading"><span class="__dot"></span><span class="__dot"></span><span class="__dot"></span></div></div>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script>(function(){
  function showError(msg, filename, lineno, colno, stack){
    var el=document.createElement('div');
    el.className='__err';
    el.textContent=String(msg);
    var r=document.getElementById('root');
    r.innerHTML='';
    r.appendChild(el);
    window.parent.postMessage({
      type: 'iframe-error',
      message: String(msg),
      filename: filename || '',
      lineno: lineno || 0,
      colno: colno || 0,
      stack: stack || ''
    }, '*');
  }
  
  window.addEventListener('error',function(ev){
    showError(ev.message, ev.filename, ev.lineno, ev.colno, ev.error ? ev.error.stack : '');
  });

  window.addEventListener('unhandledrejection', function(ev) {
    var msg = ev.reason ? (ev.reason.message || String(ev.reason)) : 'Unhandled promise rejection';
    showError(msg, '', 0, 0, ev.reason ? ev.reason.stack : '');
  });
  
  // Set up globals, mocks, and Lucide icons
  const iconPaths = {
    Search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    Plus: "M12 5v14M5 12h14",
    Bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
    User: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
    Home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    Compass: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-7a3 3 0 100-6 3 3 0 000 6z",
    Film: "M23 7l-7 5 7 5V7zM2 5h14a2 2 0 012 2v10a2 2 0 01-2 2H2a2 2 0 01-2-2V7a2 2 0 012-2z",
    Music: "M9 18V5l12-2v13M9 10l12-2M9 21a3 3 0 110-6 3 3 0 010 6zm12-3a3 3 0 110-6 3 3 0 010 6z",
    TrendingUp: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
    List: "M4 6h16M4 12h16M4 18h16",
    Clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    Heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
    History: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    Wallet: "M20 12V8H6a2 2 0 012-2h12M4 6h16M4 10h16M4 14h16M4 18h16",
    Store: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
    ShieldAlert: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm0-14v4m0 4h.01",
    Shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    Award: "M12 15a7 7 0 100-14 7 7 0 000 14zm0 0v6M12 21l-3-3M12 21l3-3",
    FileSpreadsheet: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h8",
    Play: "M5 3l14 9-14 9V3z",
    Share2: "M18 5a3 3 0 11-6 0 3 3 0 016 0zm-6 7a3 3 0 11-6 0 3 3 0 016 0zm6 7a3 3 0 11-6 0 3 3 0 016 0z",
    MessageSquare: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    Flame: "M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z",
    X: "M18 6L6 18M6 6l12 12",
    Upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
    Trash2: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
    CheckCircle: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
    Bot: "M12 2a2 2 0 012 2v1h4a2 2 0 012 2v10a2 2 0 01-2 2h-4v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1H4a2 2 0 01-2-2V7a2 2 0 012-2h4V4a2 2 0 012-2h2z",
    Sparkles: "M12 3v2M12 19v2M5 12H3M21 12h-2M18.36 5.64l-1.42 1.42M7.05 16.95l-1.42 1.42M18.36 18.36l-1.42-1.42M7.05 7.05L5.64 5.64",
    Square: "M4 4h16v16H4z",
    Send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
  };

  const createIcon = (path) => (props) => {
    const size = (props && (props.size || props.width)) || 16;
    const className = (props && props.className) || "";
    return React.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: (props && props.strokeWidth) || 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        width: size,
        height: size,
        className: className,
        style: props && props.style
      },
      React.createElement("path", { d: path })
    );
  };

  Object.keys(iconPaths).forEach((name) => {
    window[name] = createIcon(iconPaths[name]);
  });
  window.UserIcon = window.User;
  window.VideoIcon = window.Film;

  // Custom local store hooks & functions
  window.useStore = function() {
    const [messages, setMessages] = React.useState([
      { id: "1", role: "assistant", content: "Hello! I am your local Ollama coding assistant. Ask me to generate some code for PushPlay Live!", ts: Date.now() }
    ]);
    const [code, setCode] = React.useState("");

    const appendMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const updateLastAssistant = (content) => {
      setMessages((prev) => {
        const copy = [...prev];
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].role === "assistant") {
            copy[i].content = content;
            break;
          }
        }
        return copy;
      });
    };

    const clearMessages = () => setMessages([]);

    return {
      messages,
      appendMessage,
      updateLastAssistant,
      clearMessages,
      code,
      setCode
    };
  };

  window.listModels = async function() {
    return [
      { name: "qwen2.5-coder", details: { parameter_size: "7B" } },
      { name: "deepseek-coder", details: { parameter_size: "6.7B" } }
    ];
  };

  window.generateCode = async function({ prompt, model, signal, onToken }) {
    const tokens = ["// Generated code for ", prompt, "\\n", "export default function App() {\\n  return <div className='p-4 text-emerald-400 font-mono'>Custom Generated Component</div>;\\n}"];
    let text = "";
    for (const token of tokens) {
      if (signal && signal.aborted) throw new Error("AbortError");
      text += token;
      if (onToken) onToken(token);
      await new Promise((r) => setTimeout(r, 80));
    }
    return text;
  };

  function boot(){
    try{
      if(typeof React==='undefined'||typeof ReactDOM==='undefined'||typeof Babel==='undefined'){setTimeout(boot,60);return;}
      var src=decodeURIComponent(escape(atob('${encoded}')));
      var out=Babel.transform(src,{presets:[['react',{runtime:'classic'}],['typescript',{allExtensions:true,isTSX:true}]]}).code;
      var fn=new Function('React','ReactDOM',out+'\\n;return typeof App!=="undefined"?App:null;');
      var App=fn(React,ReactDOM);
      if(!App){throw new Error('No <App /> component found. Define: function App() { ... }');}

      // React Error Boundary wrapper
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }
        static getDerivedStateFromError(error) {
          return { hasError: true, error: error };
        }
        componentDidCatch(error, errorInfo) {
          window.parent.postMessage({
            type: 'iframe-runtime-error',
            message: error.message || String(error),
            stack: error.stack || '',
            componentStack: errorInfo.componentStack || ''
          }, '*');
        }
        render() {
          if (this.state.hasError) {
            return React.createElement(
              'div',
              { className: '__err', style: { padding: '20px', color: '#ffb4a2', background: '#1a0a0a', borderLeft: '3px solid #ff4d4d', borderRadius: '8px' } },
              React.createElement('h3', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'ErrorBoundary Intercepted Render Exception:'),
              React.createElement('pre', { style: { whiteSpace: 'pre-wrap', fontSize: '11px', fontFamily: 'monospace' } }, this.state.error ? this.state.error.stack : 'Unknown error')
            );
          }
          return this.props.children;
        }
      }

      var rootEl=document.getElementById('root');rootEl.innerHTML='';
      var root=ReactDOM.createRoot(rootEl);
      root.render(React.createElement(ErrorBoundary, null, React.createElement(App)));
      window.parent.postMessage({ type: 'iframe-success' }, '*');
    }catch(e){
      showError((e&&e.message)?e.message:e, '', 0, 0, e.stack);
    }
  }
  if(document.readyState==='complete')boot();else window.addEventListener('load',boot);
})();</script>
</body></html>`;
}
