import React, { useState, useEffect, useRef } from 'react';
import { Network, Play, Download, Maximize2, AlertCircle, Palette, ZoomIn, ZoomOut, Check } from 'lucide-react';
import mermaid from 'mermaid';
import { createNoteNode } from '../shared/BaseNoteNode';

const NoteMermaidBody = ({ task, updateTask }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const code = task.code || 'graph TD\\n  A-->B;';
  const theme = task.theme || 'dark';
  const [error, setError] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme });
    const renderDiagram = async () => {
      try {
        setError('');
        const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, code);
        setSvgContent(svg);
      } catch (err: any) {
        setError(err.message || 'Invalid syntax');
        setSvgContent('');
      }
    };
    const timeout = setTimeout(renderDiagram, 500);
    return () => clearTimeout(timeout);
  }, [code, theme]);

  return (
    <div className="space-y-3">
      {/* Editor & Controls */}
      <div className="flex items-center justify-between bg-[#13141c] border border-[#2a2b36] rounded-t-lg p-1.5 focus-within:border-violet-500 transition-colors text-[10px]">
         <div className="flex items-center">
            <Palette className="w-3.5 h-3.5 text-gray-400 mx-1" />
            <select 
               className="bg-transparent text-gray-300 font-medium focus:outline-none cursor-pointer"
               value={theme} onChange={(e) => updateTask({ theme: e.target.value })}
            >
               {['dark', 'default', 'forest', 'neutral', 'base'].map(l => <option key={l}>{l}</option>)}
            </select>
         </div>
         <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Export PNG"><Download className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Fullscreen"><Maximize2 className="w-3.5 h-3.5" /></button>
         </div>
      </div>

      <div className="relative border border-[#2a2b36] border-t-0 rounded-b-xl overflow-hidden bg-[#0d0e15] shadow-inner mb-3">
         <textarea 
            className={`w-full text-xs text-gray-300 font-mono bg-transparent border-none p-3 focus:outline-none resize-none min-h-[80px] custom-scrollbar ${error ? 'text-red-400' : ''}`} 
            spellCheck="false" value={code} onChange={(e) => updateTask({ code: e.target.value })} 
         />
         {error && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-500/20 text-red-400 text-[10px] p-1.5 flex items-start border-t border-red-500/30">
               <AlertCircle className="w-3 h-3 mr-1 mt-0.5 shrink-0" /> <span className="line-clamp-2">{error}</span>
            </div>
         )}
      </div>

      {/* Live Preview Area */}
      <div className="relative bg-[#1a1b23] border-2 border-[#2a2b36] rounded-xl overflow-hidden min-h-[150px] group flex flex-col">
         {/* Zoom Controls */}
         <div className="absolute top-2 left-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Zoom In"><ZoomIn className="w-3.5 h-3.5" /></button>
            <button className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>
         </div>
         
         <div className="flex-1 overflow-auto custom-scrollbar flex items-center justify-center p-4 min-h-[150px]">
            {svgContent ? (
               <div dangerouslySetInnerHTML={{ __html: svgContent }} className="max-w-full [&_svg]:max-w-full [&_svg]:h-auto" />
            ) : !error ? (
               <span className="text-gray-500 text-xs">Rendering...</span>
            ) : null}
         </div>
      </div>

      {/* Diagram Tools */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
         <button className="flex items-center justify-center bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded-lg py-2 transition-colors font-bold shadow-sm">
            Generate Diagram
         </button>
         <button className="flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg py-2 transition-colors font-bold shadow-sm">
            Improve Layout
         </button>
      </div>
    </div>
  );
};

export default createNoteNode({
  label: 'Note Mermaid',
  accentColor: '#8b5cf6',
  icon: <Network className="w-4 h-4 text-white" />,
  width: 'w-[450px]'
}, NoteMermaidBody);
