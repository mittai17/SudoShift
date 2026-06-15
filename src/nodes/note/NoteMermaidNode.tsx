import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network, Download, Maximize2, Minimize2, AlertCircle, Palette, ZoomIn, ZoomOut, Wand2 } from 'lucide-react';
import mermaid from 'mermaid';
import { createNoteNode } from '../shared/BaseNoteNode';

let mermaidCounter = 0;
const nextMermaidId = () => `mermaid-el-${++mermaidCounter}`;

const DIAGRAM_TEMPLATES: Record<string, string> = {
  flowchart: `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Process]
  B -->|No| D[Alternative]
  C --> E[End]
  D --> E`,
  sequence: `sequenceDiagram
  participant U as User
  participant S as Server
  participant DB as Database
  U->>S: Request
  S->>DB: Query
  DB-->>S: Result
  S-->>U: Response`,
  classDiagram: `classDiagram
  class Animal {
    +String name
    +makeSound()
  }
  class Dog {
    +fetch()
  }
  Animal <|-- Dog`,
  erDiagram: `erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ ITEM : contains
  USER {
    int id
    string name
  }`,
  gantt: `gantt
  title Project Plan
  dateFormat YYYY-MM-DD
  section Phase 1
  Research :a1, 2024-01-01, 7d
  Design   :a2, after a1, 5d
  section Phase 2
  Build    :b1, after a2, 10d
  Test     :b2, after b1, 4d`,
  pie: `pie title Browser Usage
  "Chrome" : 62
  "Firefox" : 15
  "Safari" : 12
  "Edge" : 7
  "Other" : 4`,
};

const NoteMermaidBody = ({ task, updateTask }: any) => {
  const DEFAULT_CODE = `flowchart TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Done]\n  B -->|No| D[Retry]\n  D --> A`;

  const code: string = task.code || DEFAULT_CODE;
  const theme: string = task.theme || 'dark';
  const [error, setError] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const renderIdRef = useRef<string>(nextMermaidId());

  const renderDiagram = useCallback(async (src: string, th: string) => {
    // Remove any stale mermaid element from a previous render
    const stale = document.getElementById(renderIdRef.current);
    if (stale) stale.remove();

    const id = nextMermaidId();
    renderIdRef.current = id;

    try {
      mermaid.initialize({ startOnLoad: false, theme: th as any, securityLevel: 'loose' });
      setError('');
      const { svg } = await mermaid.render(id, src);
      setSvgContent(svg);
    } catch (err: any) {
      // mermaid sometimes throws with HTML; strip tags for readable message
      const msg = (err.message || 'Invalid syntax').replace(/<[^>]*>/g, '').trim();
      setError(msg || 'Invalid syntax');
      setSvgContent('');
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => renderDiagram(code, theme), 400);
    return () => clearTimeout(timeout);
  }, [code, theme, renderDiagram]);

  const exportPNG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const insertTemplate = () => {
    const types = Object.keys(DIAGRAM_TEMPLATES);
    // Pick based on current code hint or cycle
    const current = types.find(t => code.trimStart().startsWith(t === 'flowchart' ? 'flow' : t)) || types[0];
    const idx = (types.indexOf(current) + 1) % types.length;
    updateTask({ code: DIAGRAM_TEMPLATES[types[idx]] });
  };

  const previewClass = fullscreen
    ? 'fixed inset-0 z-50 bg-[#0d0e15] flex flex-col'
    : 'relative bg-[#1a1b23] border-2 border-[#2a2b36] rounded-xl overflow-hidden min-h-[160px] group flex flex-col';

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#13141c] border border-[#2a2b36] rounded-t-lg p-1.5 focus-within:border-violet-500 transition-colors text-[10px]">
        <div className="flex items-center">
          <Palette className="w-3.5 h-3.5 text-gray-400 mx-1" />
          <select
            className="bg-transparent text-gray-300 font-medium focus:outline-none cursor-pointer"
            value={theme}
            onChange={(e) => updateTask({ theme: e.target.value })}
          >
            {['dark', 'default', 'forest', 'neutral', 'base'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={exportPNG} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Export SVG"><Download className="w-3.5 h-3.5" /></button>
          <button onClick={() => setFullscreen(f => !f)} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Fullscreen">
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative border border-[#2a2b36] border-t-0 rounded-b-xl overflow-hidden bg-[#0d0e15] shadow-inner mb-3">
        <textarea
          className={`w-full text-xs font-mono bg-transparent border-none p-3 focus:outline-none resize-none min-h-[90px] custom-scrollbar ${error ? 'text-red-400' : 'text-gray-300'}`}
          spellCheck={false}
          value={code}
          onChange={(e) => updateTask({ code: e.target.value })}
          placeholder="Enter Mermaid diagram code..."
        />
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500/20 text-red-400 text-[10px] p-1.5 flex items-start border-t border-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{error}</span>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className={previewClass}>
        {fullscreen && (
          <div className="flex items-center justify-between p-2 border-b border-[#2a2b36]">
            <span className="text-xs text-gray-400">Mermaid Preview</span>
            <button onClick={() => setFullscreen(false)} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400"><Minimize2 className="w-4 h-4" /></button>
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute top-2 left-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Zoom In"><ZoomIn className="w-3.5 h-3.5" /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>
          {zoom !== 1 && <button onClick={() => setZoom(1)} className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm text-[9px] transition-colors">Reset</button>}
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar flex items-center justify-center p-4 min-h-[160px]">
          {svgContent ? (
            <div
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
              className="[&_svg]:max-w-full [&_svg]:h-auto"
            />
          ) : !error ? (
            <span className="text-gray-500 text-xs animate-pulse">Rendering…</span>
          ) : (
            <span className="text-red-400 text-xs">Fix syntax above to preview</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <button
          onClick={insertTemplate}
          className="flex items-center justify-center gap-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded-lg py-2 transition-colors font-bold shadow-sm"
        >
          <Wand2 className="w-3 h-3" /> Next Template
        </button>
        <button
          onClick={() => updateTask({ code: DEFAULT_CODE })}
          className="flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg py-2 transition-colors font-bold shadow-sm"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default createNoteNode({
  label: 'Note Mermaid',
  accentColor: '#8b5cf6',
  icon: <Network className="w-4 h-4 text-white" />,
  width: 'w-[480px]'
}, NoteMermaidBody);
