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
      processedCode += `\n\nfunction App() { return <div style={{padding: '24px', fontFamily: 'sans-serif'}}><div style={{marginBottom: '16px', fontSize: '11px', color: '#ff6b00', textTransform: 'uppercase', tracking: '0.1em'}}>Rendering Live Sandbox: <b>${compName}</b></div><${compName} /></div>; }`;
    } else {
      processedCode += `\n\nfunction App() { return <div style={{padding: '24px', fontFamily: 'sans-serif', color: '#f87171'}}>No React functional components were automatically detected in this file. Please write a functional component (e.g. <code>function App() { ... }</code>) to preview it in this Real Sandbox!</div>; }`;
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
</style></head>
<body>
<div id="root"><div class="__loading"><span class="__dot"></span><span class="__dot"></span><span class="__dot"></span></div></div>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script>(function(){
  function showError(msg){var el=document.createElement('div');el.className='__err';el.textContent=String(msg);var r=document.getElementById('root');r.innerHTML='';r.appendChild(el);}
  window.addEventListener('error',function(ev){showError(ev.message);});
  function boot(){
    try{
      if(typeof React==='undefined'||typeof ReactDOM==='undefined'||typeof Babel==='undefined'){setTimeout(boot,60);return;}
      var src=decodeURIComponent(escape(atob('${encoded}')));
      var out=Babel.transform(src,{presets:[['react',{runtime:'classic'}]]}).code;
      var fn=new Function('React','ReactDOM',out+'\\n;return typeof App!=="undefined"?App:null;');
      var App=fn(React,ReactDOM);
      if(!App){throw new Error('No <App /> component found. Define: function App() { ... }');}
      var rootEl=document.getElementById('root');rootEl.innerHTML='';
      var root=ReactDOM.createRoot(rootEl);root.render(React.createElement(App));
    }catch(e){showError((e&&e.message)?e.message:e);}
  }
  if(document.readyState==='complete')boot();else window.addEventListener('load',boot);
})();</script>
</body></html>`;
}
