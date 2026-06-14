import React, { useState } from 'react';
import { Code2, Maximize2, Copy, Play, Check, AlignLeft, Search, History, Bug, Wand2, FileText } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';

const NoteCodeBody = ({ task, updateTask }: any) => {
  const [copied, setCopied] = useState(false);
  const language = task.language || 'typescript';
  const code = task.code || '// Write some code here...\\n';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between bg-[#13141c] border border-[#2a2b36] rounded-lg p-1.5 focus-within:border-violet-500 transition-colors text-xs">
         <select 
            className="bg-transparent text-violet-400 font-medium focus:outline-none ml-1 cursor-pointer"
            value={language} onChange={(e) => updateTask({ language: e.target.value })}
         >
            {['typescript', 'javascript', 'python', 'java', 'cpp', 'rust', 'go', 'html', 'css', 'json', 'sql'].map(l => <option key={l}>{l}</option>)}
         </select>
         <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Format Code"><AlignLeft className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Search"><Search className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Version History"><History className="w-3.5 h-3.5" /></button>
            <button onClick={handleCopy} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Copy Code">
               {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Fullscreen"><Maximize2 className="w-3.5 h-3.5" /></button>
         </div>
      </div>

      {/* Editor Area (Mock Syntax Highlighting) */}
      <div className="relative border border-[#2a2b36] rounded-xl overflow-hidden bg-[#0d0e15] shadow-inner group flex">
         {/* Line Numbers */}
         <div className="bg-[#1a1b23] border-r border-[#2a2b36] text-[10px] text-gray-600 px-2 py-3 text-right select-none font-mono min-w-[32px]">
            {code.split('\\n').map((_, i) => <div key={i}>{i + 1}</div>)}
         </div>
         {/* Textarea */}
         <textarea 
            className="w-full text-xs text-gray-300 font-mono bg-transparent border-none p-3 focus:outline-none resize-none min-h-[120px] max-h-[300px] whitespace-pre custom-scrollbar" 
            spellCheck="false" value={code} onChange={(e) => updateTask({ code: e.target.value })} 
         />
         <button className="absolute bottom-2 right-2 p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg backdrop-blur-sm transition-colors border border-emerald-500/20 opacity-0 group-hover:opacity-100" title="Run Code">
            <Play className="w-4 h-4 fill-current" />
         </button>
      </div>

      {/* Code Tools */}
      <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-2 space-y-2">
         <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest px-1 flex items-center">Code Assistants</div>
         <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1.5 transition-colors">
               Explain Code
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1.5 transition-colors">
               <Wand2 className="w-3 h-3 mr-1 text-emerald-400" /> Refactor
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1.5 transition-colors">
               <Bug className="w-3 h-3 mr-1 text-red-400" /> Find Bugs
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1.5 transition-colors">
               <FileText className="w-3 h-3 mr-1 text-yellow-400" /> Gen Docs
            </button>
         </div>
      </div>
    </div>
  );
};

export default createNoteNode({
  label: 'Note Code',
  accentColor: '#8b5cf6',
  icon: <Code2 className="w-4 h-4 text-white" />,
  width: 'w-[420px]'
}, NoteCodeBody);
