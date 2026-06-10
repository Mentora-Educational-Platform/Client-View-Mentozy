import { useState, useRef, useEffect } from 'react';
import { create } from 'zustand';
import Editor from '@monaco-editor/react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { 
  Play, Plus, Trash2, X, Terminal, Maximize2, Minimize2, 
  Folder, ChevronDown, ChevronRight, FileCode, CheckCircle, 
  Settings, User, Search, GitBranch, Save, FilePlus, Eye,
  Activity, EyeOff, Laptop, Sun, Moon, Sparkles, RefreshCw,
  ChevronLeft, RotateCw
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// 1. State Management (Zustand Store)
// ==========================================

interface WorkspaceFile {
  name: string;
  content: string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

interface TestCase {
  input: any[];
  expected: any;
}

interface TaskInfo {
  id: string;
  title: string;
  functionName: string;
  testCases: TestCase[];
}

const generatePreviewDOM = (files: Record<string, WorkspaceFile>, activeFileId: string | null): string => {
  if (!activeFileId) return "";
  const activeFile = files[activeFileId];
  if (!activeFile) return "";

  // If HTML file, return directly with CSS/JS injected
  if (activeFileId.endsWith('.html')) {
    let htmlContent = activeFile.content;

    // Inject CSS
    Object.keys(files).forEach(name => {
      if (name.endsWith('.css')) {
        const cssCode = files[name].content;
        const linkRegex = new RegExp(`<link[^>]*href=["']${name}["'][^>]*>`, 'g');
        if (linkRegex.test(htmlContent)) {
          htmlContent = htmlContent.replace(linkRegex, `<style>${cssCode}</style>`);
        } else {
          htmlContent = htmlContent.replace('</head>', `<style>${cssCode}</style></head>`);
        }
      }
    });

    // Inject JS
    Object.keys(files).forEach(name => {
      if (name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.ts') || name.endsWith('.tsx')) {
        let jsCode = files[name].content;
        jsCode = jsCode.replace(/\bexport\s+(const|let|var|function|class|default)\b/g, '$1');
        jsCode = jsCode.replace(/import\s+[\s\S]*?\s+from\s+['"].*?['"];?/g, '');

        const scriptRegex = new RegExp(`<script[^>]*src=["']${name}["'][^>]*></script>`, 'g');
        if (scriptRegex.test(htmlContent)) {
          htmlContent = htmlContent.replace(scriptRegex, `<script>${jsCode}</script>`);
        } else {
          htmlContent = htmlContent.replace('</body>', `<script>${jsCode}</script></body>`);
        }
      }
    });

    return htmlContent;
  }

  // Otherwise construct a React boilerplate
  const hasIndexHtml = files['index.html'];
  let baseHtml = "";

  if (hasIndexHtml) {
    baseHtml = hasIndexHtml.content;
  } else {
    baseHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NexLab Preview Sandbox</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      background-color: #121212;
      color: #ffffff;
      font-family: sans-serif;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
  }

  // Inject CSS
  Object.keys(files).forEach(name => {
    if (name.endsWith('.css')) {
      const cssCode = files[name].content;
      baseHtml = baseHtml.replace('</head>', `<style>${cssCode}</style></head>`);
    }
  });

  // Collect JS/TS/JSX/TSX code
  let jsContent = "";
  Object.keys(files).forEach(name => {
    if (name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.ts') || name.endsWith('.tsx')) {
      let code = files[name].content;
      code = code.replace(/\bexport\s+(const|let|var|function|class|default)\b/g, '$1');
      code = code.replace(/import\s+[\s\S]*?\s+from\s+['"].*?['"];?/g, '');
      jsContent += `\n/* File: ${name} */\n` + code;
    }
  });

  const activeBaseName = activeFileId.replace(/\.[^/.]+$/, "");
  const activeComponentName = activeBaseName.charAt(0).toUpperCase() + activeBaseName.slice(1);

  const bootstrapCode = `
try {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    let ComponentToMount = null;
    if (typeof ${activeComponentName} !== 'undefined') {
      ComponentToMount = ${activeComponentName};
    } else if (typeof App !== 'undefined') {
      ComponentToMount = App;
    } else {
      const matches = \`${jsContent}\`.match(/\\bfunction\\s+([A-Z][a-zA-Z0-9_]*)\\b/);
      if (matches && matches[1] && typeof window[matches[1]] !== 'undefined') {
        ComponentToMount = window[matches[1]];
      }
    }
    
    if (ComponentToMount) {
      root.render(React.createElement(ComponentToMount));
    } else {
      rootEl.innerHTML = '<div style="padding: 20px; color: #ff9f1c; font-family: sans-serif;">No mountable React component found. Write function ' + ${JSON.stringify(activeComponentName)} + '() or App()</div>';
    }
  }
} catch (e) {
  console.error("Mount Error:", e);
}
`;

  const scriptTag = `<script type="text/babel">
${jsContent}
${bootstrapCode}
</script>`;

  baseHtml = baseHtml.replace('</body>', `${scriptTag}</body>`);
  return baseHtml;
};

interface IdeState {
  files: Record<string, WorkspaceFile>;
  activeFileId: string | null;
  showSidebar: boolean;
  showTerminal: boolean;
  terminalHistory: TerminalLine[];
  editorInstance: any | null;
  currentTask: TaskInfo | null;
  previewContent: string;
  createFile: (filename: string, content?: string) => void;
  deleteFile: (filename: string) => void;
  setActiveFile: (filename: string) => void;
  updateFileContent: (filename: string, content: string) => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  setTerminalHistory: (history: TerminalLine[] | ((prev: TerminalLine[]) => TerminalLine[])) => void;
  clearTerminalHistory: () => void;
  setEditorInstance: (editor: any) => void;
  executeCode: () => void;
  verifyTask: () => void;
  rebuildPreview: () => void;
  resetWorkspace: () => void;
}

const DEFAULT_WORKSPACE_DATA = {
  files: {
    'index.html': {
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NexLab Workspace</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background: #0d0d0d;
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: #181818;
      border: 1px solid #ff9f1c30;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      text-align: center;
      max-width: 400px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1 class="text-xl font-bold text-[#ff9f1c] mb-2">NexLab IDE Live</h1>
    <p class="text-gray-400 text-sm">Welcome to your persistent workspace. Edit code in the files, view the live preview, or run files in the terminal!</p>
  </div>
</body>
</html>`
    },
    'test.js': {
      name: 'test.js',
      content: `// NexLab Workspace Sandbox Script
// Write JavaScript code here and run it via the ▶ RUN button

function greet(name) {
  console.log("Hello, " + name + "!");
  console.log("Welcome to NexLab IDE Workspace Sync.");
}

greet("Developer");`
    }
  },
  activeFileId: 'index.html',
  showSidebar: true,
  showTerminal: true,
  terminalHistory: [
    { type: 'output', text: 'NexLab IDE Terminal v2.1.0 - Integrated Sandbox Shell' },
    { type: 'output', text: 'Type "help" to see available commands.' },
    { type: 'output', text: 'System synced with Mentozy Dev Engine.' }
  ]
};

const getInitialState = () => {
  const saved = localStorage.getItem('nexlab_workspace_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          files: (parsed.files && typeof parsed.files === 'object' && !Array.isArray(parsed.files)) ? parsed.files : DEFAULT_WORKSPACE_DATA.files,
          activeFileId: parsed.activeFileId !== undefined ? parsed.activeFileId : DEFAULT_WORKSPACE_DATA.activeFileId,
          showSidebar: parsed.showSidebar !== undefined ? parsed.showSidebar : DEFAULT_WORKSPACE_DATA.showSidebar,
          showTerminal: parsed.showTerminal !== undefined ? parsed.showTerminal : DEFAULT_WORKSPACE_DATA.showTerminal,
          terminalHistory: Array.isArray(parsed.terminalHistory) ? parsed.terminalHistory : DEFAULT_WORKSPACE_DATA.terminalHistory
        };
      }
    } catch (e) {
      console.error('Failed to parse saved workspace state', e);
    }
  }
  return DEFAULT_WORKSPACE_DATA;
};

export const useIdeStore = create<IdeState>((set, get) => {
  const initialState = getInitialState();

  return {
    files: initialState.files,
    activeFileId: initialState.activeFileId,
    showSidebar: initialState.showSidebar,
    showTerminal: initialState.showTerminal,
    terminalHistory: initialState.terminalHistory,
    editorInstance: null,
    currentTask: {
      id: "task_01",
      title: "Calculate Absolute Value",
      functionName: "getAbsolute",
      testCases: [
        { input: [-5], expected: 5 },
        { input: [10], expected: 10 },
        { input: [0], expected: 0 }
      ]
    },
    previewContent: "",

    createFile: (filename: string, content: string = "") => set((state) => {
      if (state.files[filename]) {
        toast.error('File already exists in workspace!');
        return {};
      }
      
      toast.success(`Created ${filename} successfully`);
      const updatedFiles = {
        ...state.files,
        [filename]: { name: filename, content }
      };
      const preview = generatePreviewDOM(updatedFiles, filename);
      return {
        files: updatedFiles,
        activeFileId: filename,
        previewContent: preview
      };
    }),
    deleteFile: (filename: string) => set((state) => {
      const updatedFiles = { ...state.files };
      delete updatedFiles[filename];
      
      let nextActive = state.activeFileId;
      if (state.activeFileId === filename) {
        const keys = Object.keys(updatedFiles);
        nextActive = keys.length > 0 ? keys[keys.length - 1] : null;
      }
      
      toast.success(`Deleted ${filename}`);
      const preview = generatePreviewDOM(updatedFiles, nextActive);
      return {
        files: updatedFiles,
        activeFileId: nextActive,
        previewContent: preview
      };
    }),
    setActiveFile: (filename: string) => set((state) => {
      const preview = generatePreviewDOM(state.files, filename);
      return { activeFileId: filename, previewContent: preview };
    }),
    updateFileContent: (filename: string, content: string) => set((state) => {
      if (!state.files[filename]) return {};
      const updatedFiles = {
        ...state.files,
        [filename]: { ...state.files[filename], content }
      };
      return {
        files: updatedFiles
      };
    }),
    toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
    toggleTerminal: () => set((state) => ({ showTerminal: !state.showTerminal })),
    setTerminalHistory: (update) => set((state) => {
      const newHistory = typeof update === 'function' ? update(state.terminalHistory) : update;
      return { terminalHistory: newHistory };
    }),
    clearTerminalHistory: () => set({ terminalHistory: [] }),
    setEditorInstance: (editor) => set({ editorInstance: editor }),
    executeCode: () => {
      const { activeFileId, files, setTerminalHistory } = get();
      if (!activeFileId) {
        setTerminalHistory(prev => [
          ...prev,
          { type: 'error', text: 'Execution error: Please select a valid JavaScript or HTML file.' }
        ]);
        return;
      }

      const currentFile = files[activeFileId];
      if (!currentFile) return;

      const isHTML = activeFileId.endsWith('.html');
      const isJS = activeFileId.endsWith('.js') || activeFileId.endsWith('.jsx');

      if (isHTML) {
        setTerminalHistory(prev => [
          ...prev,
          { type: 'input', text: `preview ${activeFileId}` },
          { type: 'output', text: '✨ NexLab Live Preview updated successfully.' }
        ]);
        toast.success(`${activeFileId} preview updated successfully`);
        // Rebuild preview
        set({ previewContent: generatePreviewDOM(get().files, activeFileId) });
        return;
      }

      if (!isJS) {
        setTerminalHistory(prev => [
          ...prev,
          { type: 'error', text: 'Execution error: Please select a valid JavaScript file.' }
        ]);
        return;
      }

      const originalLog = console.log;

      // Hijack browser's console.log
      console.log = (...args) => {
        const formatted = args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return '[Circular Object]';
            }
          }
          return String(arg);
        }).join(' ');

        setTerminalHistory(prev => [
          ...prev,
          { type: 'output', text: formatted }
        ]);
        originalLog(...args); // Keep native console logs active
      };

      setTerminalHistory(prev => [...prev, { type: 'output', text: `Executing ${activeFileId}...` }]);

      try {
        let codeToRun = currentFile.content;
        
        // Strip ES6 export keywords so code runs cleanly inside new Function constructor
        codeToRun = codeToRun.replace(/\bexport\s+(const|let|var|function|class|default)\b/g, '$1');
        
        // Strip import statements since we mock them or run locally in sandbox
        codeToRun = codeToRun.replace(/import\s+[\s\S]*?\s+from\s+['"].*?['"];?/g, '');

        // Auto-invoke main function if it exists but is not explicitly called
        const funcMatch = codeToRun.match(/\bfunction\s+([a-zA-Z0-9_]+)\b/);
        if (funcMatch && funcMatch[1]) {
          const funcName = funcMatch[1];
          if (!codeToRun.includes(`${funcName}(`)) {
            codeToRun += `\n\n${funcName}();`;
          }
        }

        // Execute code
        const runFn = new Function(codeToRun);
        runFn();

        toast.success(`${activeFileId} ran successfully`);
        // Rebuild preview
        set({ previewContent: generatePreviewDOM(get().files, activeFileId) });
      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setTerminalHistory(prev => [
          ...prev,
          { type: 'error', text: `Execution error: ${errorMsg}` }
        ]);
        toast.error(`Execution failed for ${activeFileId}`);
      } finally {
        // Clean up browser console override
        console.log = originalLog;
      }
    },
    verifyTask: () => {
      const { activeFileId, files, currentTask, setTerminalHistory } = get();
      if (!currentTask) {
        toast.error("No task active to verify");
        return;
      }

      if (!activeFileId) {
        setTerminalHistory(prev => [
          ...prev,
          { type: 'error', text: 'Validation error: Please select a valid JavaScript file.' }
        ]);
        return;
      }

      const currentFile = files[activeFileId];
      if (!currentFile) return;

      const isJS = activeFileId.endsWith('.js') || activeFileId.endsWith('.jsx');
      if (!isJS) {
        setTerminalHistory(prev => [
          ...prev,
          { type: 'error', text: 'Validation error: Please select a valid JavaScript file.' }
        ]);
        return;
      }

      setTerminalHistory(prev => [
        ...prev,
        { type: 'output', text: `Verifying task: "${currentTask.title}"...` }
      ]);

      const originalLog = console.log;
      // Temporarily hijack console.log in case student logs things during test runs
      console.log = (...args) => {
        const formatted = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
        setTerminalHistory(prev => [...prev, { type: 'output', text: formatted }]);
        originalLog(...args);
      };

      try {
        let studentCode = currentFile.content;

        // Strip ES6 export/import keywords
        studentCode = studentCode.replace(/\bexport\s+(const|let|var|function|class|default)\b/g, '$1');
        studentCode = studentCode.replace(/import\s+[\s\S]*?\s+from\s+['"].*?['"];?/g, '');

        // Define clean window results placeholder
        (window as any).__nexlab_last_test_results = null;

        // Create the testing script
        const validationScript = `
(function() {
  const testCases = ${JSON.stringify(currentTask.testCases)};
  const targetFnName = ${JSON.stringify(currentTask.functionName)};
  const results = [];
  try {
    let fn;
    // Try evaluating in local scope
    if (typeof eval !== 'undefined') {
      try {
        fn = eval(targetFnName);
      } catch (e) {}
    }
    
    // Fallbacks
    if (typeof fn !== 'function') {
      if (typeof window !== 'undefined' && typeof window[targetFnName] === 'function') {
        fn = window[targetFnName];
      } else if (typeof globalThis !== 'undefined' && typeof globalThis[targetFnName] === 'function') {
        fn = globalThis[targetFnName];
      }
    }

    if (typeof fn !== 'function') {
      throw new Error("Function '" + targetFnName + "' is not defined in scope. Please declare it, e.g. function " + targetFnName + "(...) { ... }");
    }

    for (const tc of testCases) {
      const actual = fn.apply(null, tc.input);
      const passed = JSON.stringify(actual) === JSON.stringify(tc.expected);
      results.push({ passed, input: tc.input, expected: tc.expected, actual });
    }
  } catch (err) {
    results.push({ error: err.message });
  }
  window.__nexlab_last_test_results = results;
})();
        `;

        const combinedCode = studentCode + "\n\n" + validationScript;

        // Safe evaluation
        const runFn = new Function(combinedCode);
        runFn();

        const results = (window as any).__nexlab_last_test_results;
        if (!results || !Array.isArray(results)) {
          throw new Error("Task verification failed to record test results.");
        }

        // Process results
        let allPassed = true;
        const outputLines: TerminalLine[] = [];

        for (const res of results) {
          if (res.error) {
            allPassed = false;
            outputLines.push({ type: 'error', text: `Test Error: ${res.error}` });
            break;
          }

          if (res.passed) {
            outputLines.push({ 
              type: 'output', 
              text: `✅ Test Case Pass: Expected ${JSON.stringify(res.expected)}, Got ${JSON.stringify(res.actual)}` 
            });
          } else {
            allPassed = false;
            outputLines.push({ 
              type: 'error', 
              text: `❌ Test Case Fail: Expected ${JSON.stringify(res.expected)}, Got ${JSON.stringify(res.actual)}` 
            });
          }
        }

        if (allPassed && results.length > 0) {
          outputLines.push({ 
            type: 'output', 
            text: `\n==================================================\n[SUCCESS] Task Completed! Operator status unlocked. 🎉\n==================================================\n` 
          });
          toast.success("Task verification passed! Excellent job.");
        } else {
          toast.error("Task verification failed. Please correct your code.");
        }

        setTerminalHistory(prev => [...prev, ...outputLines]);
        // Rebuild preview
        set({ previewContent: generatePreviewDOM(get().files, activeFileId) });

      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setTerminalHistory(prev => [
          ...prev,
          { type: 'error', text: `Execution error: ${errorMsg}` }
        ]);
        toast.error(`Verification failed`);
      } finally {
        console.log = originalLog;
        delete (window as any).__nexlab_last_test_results;
      }
    },
    rebuildPreview: () => set((state) => ({
      previewContent: generatePreviewDOM(state.files, state.activeFileId)
    })),
    resetWorkspace: () => {
      localStorage.removeItem('nexlab_workspace_state');
      set({
        files: DEFAULT_WORKSPACE_DATA.files,
        activeFileId: DEFAULT_WORKSPACE_DATA.activeFileId,
        showSidebar: DEFAULT_WORKSPACE_DATA.showSidebar,
        showTerminal: DEFAULT_WORKSPACE_DATA.showTerminal,
        terminalHistory: DEFAULT_WORKSPACE_DATA.terminalHistory,
        previewContent: generatePreviewDOM(DEFAULT_WORKSPACE_DATA.files, DEFAULT_WORKSPACE_DATA.activeFileId)
      });
      toast.success('Workspace reset to pristine boilerplate successfully');
    }
  };
});

// Auto-sync Zustand store to localStorage
useIdeStore.subscribe((state) => {
  try {
    localStorage.setItem('nexlab_workspace_state', JSON.stringify({
      files: state.files,
      activeFileId: state.activeFileId,
      terminalHistory: state.terminalHistory,
      showSidebar: state.showSidebar,
      showTerminal: state.showTerminal
    }));
  } catch (e) {
    console.error('Failed to sync to localStorage', e);
  }
});

// ==========================================
// 2. The Splash Screen Component (WorkspaceWelcomeScreen)
// ==========================================

export function WorkspaceWelcomeScreen() {
  const { createFile, currentTask } = useIdeStore();

  const handleCreateNewFile = () => {
    const filename = prompt('Enter new filename (e.g. index.js, App.tsx, styles.css):');
    if (filename && filename.trim()) {
      let formattedName = filename.trim();
      if (!formattedName.includes('.')) {
        formattedName += '.tsx';
      }
      createFile(formattedName);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#121212] select-none min-h-[450px]">
      {currentTask && (
        <div className="mb-6 p-5 bg-black/40 border border-[#06d6a0]/30 rounded-2xl text-left max-w-sm font-sans">
          <div className="text-[10px] font-bold text-[#06d6a0] uppercase tracking-wider mb-1 font-sans">Active Assignment</div>
          <div className="text-base font-bold text-white mb-2 font-sans">{currentTask.title}</div>
          <div className="text-xs text-gray-400 leading-relaxed font-sans">
            Write a JavaScript function named <code className="text-[#ff9f1c] font-mono font-bold bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-gray-800">{currentTask.functionName}</code> that returns the absolute value of the input. Press the green <strong className="text-[#06d6a0]">✔️ Verify Task</strong> button to test your code.
          </div>
        </div>
      )}
      <div className="w-16 h-16 rounded-full bg-[#ff9f1c]/10 border border-[#ff9f1c]/30 flex items-center justify-center text-[#ff9f1c] mb-6 animate-pulse">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">NexLab IDE Sandbox</h2>
      <p className="text-sm text-gray-400 max-w-sm mb-8 font-sans">
        Welcome to Mentozy's interactive code playground. Create or select files to start coding.
      </p>
      
      <div className="flex flex-col gap-3 max-w-xs w-full text-left bg-black/40 p-5 rounded-2xl border border-gray-800 text-xs font-mono text-gray-300 font-sans">
        <div className="font-bold text-[#ff9f1c] uppercase tracking-wider text-[10px] mb-2 font-sans">Keyboard Shortcuts</div>
        <div className="flex justify-between border-b border-gray-800/60 pb-1.5">
          <span>New File</span>
          <span className="text-gray-550">Explorer Panel</span>
        </div>
        <div className="flex justify-between border-b border-gray-800/60 py-1.5">
          <span>Save draft</span>
          <span className="text-gray-550">Ctrl + S</span>
        </div>
        <div className="flex justify-between border-b border-gray-800/60 py-1.5">
          <span>Run script</span>
          <span className="text-gray-550">Ctrl + Enter</span>
        </div>
        <div className="flex justify-between pt-1.5">
          <span>Toggle View</span>
          <span className="text-gray-550">Top Right Control</span>
        </div>
      </div>
      
      <button 
        onClick={handleCreateNewFile}
        className="mt-8 px-6 py-3 bg-[#ff9f1c] hover:bg-[#ff9f1c]/90 text-black font-extrabold uppercase rounded-xl shadow-[0_4px_14px_rgba(255,159,28,0.3)] transition-all duration-200 text-xs flex items-center gap-2 active:scale-95 cursor-pointer font-sans"
      >
        <Plus className="w-4 h-4 text-black stroke-[3px]" />
        CREATE NEW FILE
      </button>
    </div>
  );
}

// ==========================================
// 3. The Sidebar Explorer Component (SidebarExplorer)
// ==========================================

export function SidebarExplorer({ onNewFileClick }: { onNewFileClick: () => void }) {
  const { files, activeFileId, setActiveFile, deleteFile } = useIdeStore();

  const fileKeys = Object.keys(files);

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="p-3 font-bold uppercase tracking-wider text-gray-400 text-[10px] border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a]">
        <span>Explorer</span>
        <button 
          onClick={onNewFileClick}
          className="p-1 hover:bg-[#2a2a2a] text-gray-300 rounded transition-colors"
          title="New File"
        >
          <FilePlus className="w-4 h-4 text-[#ff9f1c]" />
        </button>
      </div>

      <div className="p-2.5 font-semibold text-gray-500 uppercase text-[9px] tracking-widest bg-[#151515]">
        WORKSPACE
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 font-mono">
        {fileKeys.length === 0 ? (
          <div className="text-xs italic text-gray-600 p-2 text-center">
            No files in workspace
          </div>
        ) : (
          fileKeys.map(filename => {
            const isActive = filename === activeFileId;
            return (
              <div 
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={`group flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                  isActive 
                    ? 'bg-[#2a2a2a] text-[#ff9f1c] font-bold border border-[#ff9f1c]/10' 
                    : 'text-gray-405 hover:bg-[#1a1a1a] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#ff9f1c]' : 'text-blue-400'}`} />
                  <span className="truncate">{filename}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${filename}?`)) {
                      deleteFile(filename);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-0.5 rounded transition-opacity duration-150"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Language Detection Helper
const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    default:
      return 'plaintext';
  }
};

export function NexLabMonacoEditor() {
  const { files, activeFileId, updateFileContent, setEditorInstance } = useIdeStore();
  
  if (!activeFileId) return null;
  const currentFile = files[activeFileId];
  if (!currentFile) return null;

  const language = getLanguageFromExtension(activeFileId);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#121212] overflow-hidden">
      {/* Editor top menu settings */}
      <div className="h-8 bg-[#181818] border-b border-gray-800 flex justify-between items-center px-4 select-none shrink-0 text-xs text-gray-400">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-gray-550">src</span>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-gray-200 font-semibold">{currentFile.name}</span>
        </div>
        <div className="text-gray-550 text-[10px] uppercase font-mono">
          {language} Mode
        </div>
      </div>

      <div className="flex-1 w-full h-full relative">
        <Editor
          theme="vs-dark"
          language={language}
          path={activeFileId}
          value={currentFile.content}
          onChange={(value) => updateFileContent(activeFileId, value || "")}
          onMount={(editor) => setEditorInstance(editor)}
          options={{
            minimap: { enabled: true },
            fontSize: 13,
            lineHeight: 20,
            automaticLayout: true,
            tabSize: 2,
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
}

// ==========================================
export function NexLabPreview() {
  const { previewContent, rebuildPreview } = useIdeStore();
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = () => {
    setIsReloading(true);
    rebuildPreview();
    setTimeout(() => {
      setIsReloading(false);
      toast.success("Preview reloaded");
    }, 600);
  };

  useEffect(() => {
    if (!previewContent) {
      rebuildPreview();
    }
  }, []);

  return (
    <div className="flex-1 h-full flex flex-col bg-[#121212] border-l border-gray-800 overflow-hidden select-none">
      {/* Mock Browser Header Bar */}
      <div className="h-8 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-3 select-none shrink-0 text-xs text-gray-400">
        <div className="flex items-center gap-1.5 shrink-0">
          <button className="p-1 hover:bg-[#252525] rounded transition-colors text-gray-500 cursor-not-allowed" title="Back" disabled>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-[#252525] rounded transition-colors text-gray-500 cursor-not-allowed" title="Forward" disabled>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleReload}
            className="p-1 hover:bg-[#252525] hover:text-white rounded transition-colors text-gray-400 cursor-pointer" 
            title="Reload Sandbox"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 mx-4 max-w-md bg-black/60 border border-gray-800 px-3 py-0.5 rounded-md text-[10px] text-gray-400 font-mono truncate flex items-center gap-1.5 select-text justify-center">
          <span className="text-emerald-500 font-bold">https://</span>
          <span>localhost:3000/sandbox</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 shrink-0 text-[10px] uppercase font-mono text-emerald-500">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          Live
        </div>
      </div>

      {/* Preview Body */}
      <div className="flex-1 w-full bg-white relative">
        {previewContent ? (
          <iframe 
            srcDoc={previewContent} 
            sandbox="allow-scripts" 
            className="w-full h-full border-none bg-white" 
            title="NexLab Visual Preview"
          />
        ) : (
          <div className="absolute inset-0 bg-[#121212] flex items-center justify-center text-xs text-gray-500">
            Compiling and rendering sandbox...
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. Main Layout Toggle (MainEditorArea)
// ==========================================

export function MainEditorArea() {
  const activeFileId = useIdeStore(state => state.activeFileId);

  if (activeFileId === null) {
    return <WorkspaceWelcomeScreen />;
  }

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full">
      <NexLabMonacoEditor />
      <NexLabPreview />
    </div>
  );
}

// ==========================================
// 6. NexLab Interactive Terminal
// ==========================================

export function NexLabTerminal() {
  const { 
    files, 
    activeFileId, 
    terminalHistory: history, 
    setTerminalHistory: setHistory, 
    executeCode,
    verifyTask,
    createFile,
    deleteFile
  } = useIdeStore();
  const [inputValue, setInputValue] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const nextHistory = [...history, { type: 'input', text: trimmed }];

    const args = trimmed.split(/\s+/);
    const command = args[0].toLowerCase();

    let outputLines: TerminalLine[] = [];

    switch (command) {
      case 'help':
        outputLines = [
          { type: 'output', text: 'Available commands:' },
          { type: 'output', text: '  help            - List commands' },
          { type: 'output', text: '  ls              - List workspace files' },
          { type: 'output', text: '  cat <file>      - Read file contents' },
          { type: 'output', text: '  touch <file>    - Create a new file' },
          { type: 'output', text: '  rm <file>       - Remove a file' },
          { type: 'output', text: '  clear-workspace - Reset workspace to default boilerplate' },
          { type: 'output', text: '  clear           - Reset terminal logs' }
        ];
        break;
      case 'clear-workspace':
        useIdeStore.getState().resetWorkspace();
        outputLines = [
          { type: 'output', text: 'Workspace reset to pristine boilerplate successfully.' }
        ];
        break;
      case 'clear':
        useIdeStore.getState().clearTerminalHistory();
        setInputValue('');
        return;
      case 'ls':
        const fileNames = Object.keys(files);
        if (fileNames.length === 0) {
          outputLines = [{ type: 'output', text: 'Workspace is empty.' }];
        } else {
          outputLines = [{ type: 'output', text: fileNames.join('   ') }];
        }
        break;
      case 'cat':
        if (!args[1]) {
          outputLines = [{ type: 'error', text: 'Usage: cat <filename>' }];
        } else {
          const file = files[args[1]];
          if (file) {
            outputLines = file.content.split('\n').map(line => ({ type: 'output', text: line }));
          } else {
            outputLines = [{ type: 'error', text: `cat: ${args[1]}: No such file or directory` }];
          }
        }
        break;
      case 'touch':
        if (!args[1]) {
          outputLines = [{ type: 'error', text: 'touch: missing file operand' }];
        } else {
          const filename = args[1].trim();
          if (files[filename]) {
            outputLines = [{ type: 'error', text: `touch: cannot create '${filename}': File already exists` }];
          } else {
            createFile(filename);
            outputLines = [{ type: 'output', text: `Created file '${filename}' successfully.` }];
          }
        }
        break;
      case 'rm':
        if (!args[1]) {
          outputLines = [{ type: 'error', text: 'rm: missing operand' }];
        } else {
          const filename = args[1].trim();
          if (!files[filename]) {
            outputLines = [{ type: 'error', text: `rm: cannot remove '${filename}': No such file or directory` }];
          } else {
            deleteFile(filename);
            outputLines = [{ type: 'output', text: `Removed file '${filename}' successfully.` }];
          }
        }
        break;
      default:
        outputLines = [{ type: 'error', text: `Command not found: ${trimmed}` }];
    }

    setHistory([...nextHistory, ...outputLines]);
    setInputValue('');
  };

  const handleSave = () => {
    if (!activeFileId) return;
    toast.success(`Saved local workspace changes to ${activeFileId}`);
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className="h-44 flex flex-col shrink-0 border-t border-gray-800 bg-[#141414] select-none"
      onClick={focusInput}
    >
      {/* Header */}
      <div className="h-8 flex justify-between items-center px-4 bg-[#1a1a1a] border-b border-gray-800 select-none shrink-0">
        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
          <span className="text-white border-b-2 border-[#ff9f1c] pb-0.5 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#ff9f1c]" />
            Terminal
          </span>
          <span className="cursor-pointer hover:text-white">Output</span>
          <span className="cursor-pointer hover:text-white">Problems</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              executeCode();
            }}
            className="px-3.5 py-1 bg-[#ff9f1c] hover:bg-[#ff9f1c]/90 text-black text-[10px] font-extrabold uppercase rounded-lg flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 fill-current text-black" />
            Run
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              verifyTask();
            }}
            className="px-3.5 py-1 bg-[#06d6a0] hover:bg-[#06d6a0]/90 text-black text-[10px] font-extrabold uppercase rounded-lg flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            ✔️ Verify Task
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="px-3.5 py-1 bg-[#2a2a2a] hover:bg-[#353535] text-white text-[10px] font-extrabold uppercase rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer border border-gray-700"
          >
            <Save className="w-2.5 h-2.5 text-gray-300" />
            Save
          </button>
        </div>
      </div>
      
      {/* Shell Log / prompt */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] flex flex-col bg-[#121212] text-gray-300 cursor-text">
        <div className="space-y-1 text-left select-text">
          {history.map((line, i) => (
            <div key={i} className={
              line.type === 'input' ? 'text-[#ff9f1c] font-bold' : 
              line.type === 'error' ? 'text-red-500 font-semibold' : 'text-gray-300'
            }>
              {line.type === 'input' && <span className="text-[#ff9f1c] font-bold">nexlab@sandbox:~$ </span>}
              {line.text}
            </div>
          ))}
          <div ref={terminalBottomRef} />
        </div>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(inputValue);
          }} 
          className="flex items-center mt-1 text-left shrink-0"
        >
          <span className="text-[#ff9f1c] font-bold shrink-0">nexlab@sandbox:~$ &nbsp;</span>
          <input 
            ref={inputRef}
            type="text" 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none font-mono border-none p-0 text-[11px] caret-white"
            placeholder='Try "help", "ls", "clear"'
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}

// ==========================================
// NexLab IDE Main Page Orchestrator
// ==========================================

export function OrgIdePage() {
  const { 
    files, 
    activeFileId, 
    setActiveFile, 
    createFile,
    showSidebar, 
    showTerminal, 
    toggleSidebar, 
    toggleTerminal, 
    executeCode, 
    verifyTask,
    clearTerminalHistory, 
    setTerminalHistory,
    editorInstance
  } = useIdeStore();

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeActivity, setActiveActivity] = useState<string>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(prev => (prev === menuName ? null : menuName));
  };

  const handleMenuMouseEnter = (menuName: string) => {
    if (activeMenu !== null) {
      setActiveMenu(menuName);
    }
  };

  const closeMenus = () => {
    setActiveMenu(null);
  };

  const menuData = [
    {
      name: 'File',
      items: [
        {
          label: 'New File...',
          shortcut: 'Ctrl+N',
          action: () => {
            let filename = prompt('Enter new filename (e.g. index.js, App.tsx, styles.css):');
            if (filename && filename.trim()) {
              let formattedName = filename.trim();
              if (!formattedName.includes('.')) {
                formattedName += '.tsx';
              }
              createFile(formattedName);
            }
          }
        },
        {
          label: 'Save File',
          shortcut: 'Ctrl+S',
          action: () => {
            if (activeFileId) {
              toast.success(`Saved local workspace changes to ${activeFileId}`);
            } else {
              toast.error('No active file to save');
            }
          }
        },
        {
          label: 'Reset Workspace',
          action: () => {
            if (confirm('Are you sure you want to reset your workspace to default boilerplate? All custom files will be lost.')) {
              useIdeStore.getState().resetWorkspace();
            }
          }
        }
      ]
    },
    {
      name: 'Edit',
      items: [
        {
          label: 'Undo',
          shortcut: 'Ctrl+Z',
          action: () => {
            if (editorInstance) {
              editorInstance.focus();
              editorInstance.trigger('keyboard', 'undo', null);
            } else {
              toast.error('Editor is not active');
            }
          }
        },
        {
          label: 'Redo',
          shortcut: 'Ctrl+Y',
          action: () => {
            if (editorInstance) {
              editorInstance.focus();
              editorInstance.trigger('keyboard', 'redo', null);
            } else {
              toast.error('Editor is not active');
            }
          }
        },
        {
          label: 'Cut',
          shortcut: 'Ctrl+X',
          action: () => {
            if (editorInstance) {
              editorInstance.focus();
              editorInstance.trigger('keyboard', 'editor.action.clipboardCutAction', null);
            } else {
              toast.error('Editor is not active');
            }
          }
        },
        {
          label: 'Copy',
          shortcut: 'Ctrl+C',
          action: () => {
            if (editorInstance) {
              editorInstance.focus();
              editorInstance.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
            } else {
              toast.error('Editor is not active');
            }
          }
        }
      ]
    },
    {
      name: 'Selection',
      items: [
        {
          label: 'Select All',
          shortcut: 'Ctrl+A',
          action: () => {
            if (editorInstance) {
              editorInstance.focus();
              editorInstance.trigger('keyboard', 'editor.action.selectAll', null);
            } else {
              toast.error('Editor is not active');
            }
          }
        }
      ]
    },
    {
      name: 'View',
      items: [
        {
          label: 'Toggle Sidebar',
          shortcut: 'Ctrl+B',
          action: () => toggleSidebar()
        },
        {
          label: 'Toggle Terminal',
          shortcut: 'Ctrl+`',
          action: () => toggleTerminal()
        }
      ]
    },
    {
      name: 'Go',
      items: [
        {
          label: 'Go to File...',
          shortcut: 'Ctrl+P',
          action: () => toast.info('Use Explorer sidebar to select files')
        },
        {
          label: 'Go to Line...',
          shortcut: 'Ctrl+G',
          action: () => {
            if (editorInstance) {
              editorInstance.focus();
              editorInstance.trigger('keyboard', 'editor.action.gotoLine', null);
            } else {
              toast.error('Editor is not active');
            }
          }
        }
      ]
    },
    {
      name: 'Run',
      items: [
        {
          label: 'Run Script',
          shortcut: 'Ctrl+Enter',
          action: () => executeCode()
        },
        {
          label: 'Verify Task',
          shortcut: 'Ctrl+Shift+Enter',
          action: () => verifyTask()
        }
      ]
    },
    {
      name: 'Terminal',
      items: [
        {
          label: 'Clear Logs',
          shortcut: 'Ctrl+K',
          action: () => clearTerminalHistory()
        }
      ]
    },
    {
      name: 'Help',
      items: [
        {
          label: 'Interactive Help',
          action: () => {
            setTerminalHistory(prev => [
              ...prev,
              { type: 'output', text: '--- NEXLAB IDE DOCUMENTATION ---' },
              { type: 'output', text: 'To run JS/JSX files, open a valid .js/.jsx file and press ▶ RUN.' },
              { type: 'output', text: 'To clear logs, type "clear" or select Terminal > Clear Logs.' },
              { type: 'output', text: 'For file system navigation, use "ls" and "cat <file>".' },
              { type: 'output', text: '---------------------------------' }
            ]);
            toast.success('Help documentation printed to terminal');
          }
        }
      ]
    }
  ];

  const activeFile = activeFileId ? files[activeFileId] : null;

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    let formattedName = newFileName.trim();
    if (!formattedName.includes('.')) {
      formattedName += '.tsx';
    }
    useIdeStore.getState().createFile(formattedName);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const filteredFiles = Object.keys(files).filter(name => 
    name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    files[name].content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const workspaceIDE = (
    <div className="h-full flex flex-col overflow-hidden relative font-sans bg-[#121212] text-gray-200">
      
      {/* Top Header */}
      <div className="h-9 bg-[#1a1a1a] border-b border-gray-800 flex justify-between items-center px-4 select-none text-xs shrink-0 relative">
        {/* Invisible menu closing backdrop */}
        {activeMenu !== null && (
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={closeMenus}
          />
        )}
        
        <div className="flex items-center gap-3 z-50">
          <div className="flex items-center gap-2 font-bold text-[#ff9f1c]">
            <div className="w-3.5 h-3.5 bg-[#ff9f1c] rounded-md flex items-center justify-center text-black font-extrabold text-[10px]">N</div>
            <span>NexLab IDE</span>
          </div>
          
          {/* Interactive Menu Dropdowns */}
          <div className="flex items-center gap-1 text-gray-400">
            {menuData.map(menu => {
              const isOpen = activeMenu === menu.name;
              return (
                <div key={menu.name} className="relative">
                  <button
                    onClick={() => handleMenuClick(menu.name)}
                    onMouseEnter={() => handleMenuMouseEnter(menu.name)}
                    className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                      isOpen 
                        ? 'bg-[#252525] text-white font-bold' 
                        : 'text-gray-400 hover:bg-[#252525] hover:text-white'
                    }`}
                  >
                    {menu.name}
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 mt-1 w-56 rounded-lg bg-[#181818] border border-gray-800 shadow-[0_8px_24px_rgba(0,0,0,0.8)] py-1.5 z-50">
                      {menu.items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            item.action();
                            closeMenus();
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#ff9f1c] hover:text-black transition-colors flex justify-between items-center group cursor-pointer"
                        >
                          <span className="font-sans font-medium">{item.label}</span>
                          {item.shortcut && (
                            <span className="text-[10px] text-gray-500 font-mono group-hover:text-black/75">
                              {item.shortcut}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="opacity-80 font-medium truncate text-[11px] font-mono text-gray-400">
          NexLab IDE Sandbox {activeFile ? `• ${activeFile.name}` : ''}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-1 hover:bg-[#252525] rounded text-gray-300 transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#ff9f1c]" /> : <Maximize2 className="w-4 h-4 text-[#ff9f1c]" />}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side Activity Bar */}
        <div className="w-12 bg-[#181818] flex flex-col justify-between items-center py-3 shrink-0 border-r border-gray-800">
          <div className="flex flex-col gap-5 text-gray-400 w-full items-center">
            <button 
              onClick={() => setActiveActivity(activeActivity === 'explorer' ? '' : 'explorer')}
              className={`p-2 w-full flex justify-center hover:text-white border-l-2 ${activeActivity === 'explorer' ? 'border-[#ff9f1c] text-[#ff9f1c]' : 'border-transparent text-gray-400'}`}
              title="File Explorer"
            >
              <Folder className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveActivity(activeActivity === 'search' ? '' : 'search')}
              className={`p-2 w-full flex justify-center hover:text-white border-l-2 ${activeActivity === 'search' ? 'border-[#ff9f1c] text-[#ff9f1c]' : 'border-transparent text-gray-400'}`}
              title="Search Contents"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col gap-4 items-center">
            <span className="p-2 text-gray-500 hover:text-white cursor-pointer"><User className="w-5 h-5" /></span>
          </div>
        </div>

        {/* Sidebar panels */}
        {activeActivity && showSidebar && (
          <div className="w-60 border-r border-gray-800 bg-[#161616] flex flex-col shrink-0 text-left">
            
            {/* Explorer Panel */}
            {activeActivity === 'explorer' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <SidebarExplorer onNewFileClick={() => setIsCreatingFile(true)} />
                
                {/* Inline New File Input Form */}
                {isCreatingFile && (
                  <form onSubmit={handleCreateFileSubmit} className="px-3 py-2 bg-[#121212] border-t border-gray-800 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-[#ff9f1c] flex-shrink-0" />
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="filename.tsx"
                      value={newFileName}
                      onChange={e => setNewFileName(e.target.value)}
                      onBlur={() => setIsCreatingFile(false)}
                      className="w-full bg-[#252525] text-white border border-gray-700 rounded px-2 py-1 outline-none text-[11px] font-mono"
                    />
                  </form>
                )}
              </div>
            )}

            {/* Search Panel */}
            {activeActivity === 'search' && (
              <div className="p-3 space-y-4 text-xs">
                <div className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">Workspace Search</div>
                <input 
                  type="text"
                  placeholder="Keyword..."
                  className="w-full bg-[#252525] text-white border border-gray-800 px-2.5 py-1.5 outline-none rounded text-xs"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                
                {searchQuery && (
                  <div className="space-y-2 overflow-y-auto max-h-[400px]">
                    {filteredFiles.length === 0 ? (
                      <div className="text-gray-500 italic p-1">No results found</div>
                    ) : (
                      filteredFiles.map(name => (
                        <div 
                          key={name}
                          onClick={() => setActiveFile(name)}
                          className="p-2 bg-[#121212] hover:bg-[#1c1c1c] border border-gray-800 rounded cursor-pointer transition-all"
                        >
                          <div className="font-bold text-[#ff9f1c] truncate mb-1">{name}</div>
                          <div className="text-[10px] text-gray-500 line-clamp-2 font-mono">{files[name].content}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Coding Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#121212]">
          {/* Tab Navigation */}
          {Object.keys(files).length > 0 && activeFile && (
            <div className="h-9 bg-[#1a1a1a] border-b border-gray-850 flex items-center select-none overflow-x-auto shrink-0 scrollbar-none">
              {Object.keys(files).map(name => (
                <div 
                  key={name}
                  onClick={() => setActiveFile(name)}
                  className={`h-full px-4 flex items-center gap-2 border-r border-gray-850 cursor-pointer text-xs transition-colors shrink-0 ${
                    name === activeFileId 
                      ? 'bg-[#121212] text-[#ff9f1c] border-t-2 border-t-[#ff9f1c]' 
                      : 'bg-[#181818] text-gray-500 hover:bg-[#1d1d1d] hover:text-gray-300'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#ff9f1c]" />
                  <span>{name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const keys = Object.keys(files);
                      if (activeFileId === name) {
                        const remaining = keys.filter(k => k !== name);
                        if (remaining.length > 0) {
                          setActiveFile(remaining[remaining.length - 1]);
                        } else {
                          useIdeStore.setState({ activeFileId: null });
                        }
                      }
                    }}
                    className="p-0.5 rounded hover:bg-[#2a2a2a] text-gray-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Layout Area */}
          <MainEditorArea />

          {/* Terminal Console */}
          {showTerminal && <NexLabTerminal />}

          {/* Status Bar */}
          <div className="h-5 text-[10px] font-semibold bg-[#ff9f1c] text-black flex justify-between items-center px-3 select-none shrink-0 font-sans">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 px-1 bg-black text-[#ff9f1c] rounded-sm font-bold"><GitBranch className="w-3 h-3 text-[#ff9f1c]" /> main*</span>
              <span className="flex items-center gap-1 text-black font-sans">
                <RefreshCw className="w-3 h-3 animate-spin duration-[3s]" />
                Synced with NexLab Cloud
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-black">
              <span>Spaces: 2</span>
              <span>UTF-8</span>
              <span>{activeFile ? activeFile.name.split('.').pop()?.toUpperCase() : 'Plain Text'}</span>
              <span className="bg-black text-[#ff9f1c] px-2 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                <Activity className="w-3 h-3 animate-pulse text-[#ff9f1c]" /> NexLab Engine
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );

  return (
    <>
      {isFullscreen ? (
        <div className="fixed inset-0 z-50 bg-[#121212]">
          {workspaceIDE}
        </div>
      ) : (
        <DashboardLayout>
          <div className="max-w-7xl mx-auto pb-10">
            <div className="bg-[#121212] border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden h-[680px]">
              {workspaceIDE}
            </div>
          </div>
        </DashboardLayout>
      )}
    </>
  );
}

export default OrgIdePage;
