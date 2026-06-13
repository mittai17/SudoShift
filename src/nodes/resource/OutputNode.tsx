import React, { useState } from 'react';
import { Monitor, Code2, FileText, AlignLeft, Download, Copy, Search, Filter, Sparkles, Wand2, Check } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const OutputBody = ({ task, updateTask }: any) => {
  const [copied, setCopied] = useState(false);
  const viewMode = task.viewMode || 'Markdown'; // JSON, Markdown, Rich Text
  const outputData = task.outputData || 'No input connected.\\nConnect a node to view its output.';

  const handleCopy = () => {
    navigator.clipboard.writeText(outputData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between text-xs mb-2 bg-[#2a2b36]/30 p-1.5 rounded-lg border border-[#2a2b36]">
        <div className="flex bg-[#13141c] rounded-md p-0.5 border border-[#2a2b36]">
           {['JSON', 'Markdown', 'Rich Text'].map(m => (
              <button 
                key={m} onClick={() => updateTask({ viewMode: m })}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${viewMode === m ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                 {m === 'JSON' ? <Code2 className="w-3 h-3 inline mr-1" /> : m === 'Markdown' ? <FileText className="w-3 h-3 inline mr-1" /> : <AlignLeft className="w-3 h-3 inline mr-1" />}
                 {m}
              </button>
           ))}
        </div>
        <div className="flex gap-1.5">
          <button className="p-1 hover:bg-[#2a2b36] text-gray-400 rounded transition-colors" title="Filter"><Filter className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-[#2a2b36] text-gray-400 rounded transition-colors" title="Search"><Search className="w-3.5 h-3.5" /></button>
          <button onClick={handleCopy} className="p-1 hover:bg-[#2a2b36] text-gray-400 rounded transition-colors" title="Copy Output">
             {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button className="p-1 hover:bg-[#2a2b36] text-gray-400 rounded transition-colors" title="Export Output"><Download className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Output Display Area */}
      <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg p-3 min-h-[150px] max-h-[300px] overflow-y-auto custom-scrollbar">
         {viewMode === 'JSON' ? (
            <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap">{JSON.stringify({ output: outputData }, null, 2)}</pre>
         ) : viewMode === 'Markdown' ? (
            <div className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{outputData}</div>
         ) : (
            <div className="text-xs text-gray-200 leading-relaxed">{outputData}</div>
         )}
      </div>

      {/* AI Tools */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
         <button className="flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 rounded-lg py-1.5 transition-colors font-medium">
            <Sparkles className="w-3 h-3 mr-1" /> AI Explain Output
         </button>
         <button className="flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg py-1.5 transition-colors font-medium">
            <Wand2 className="w-3 h-3 mr-1" /> AI Improve Output
         </button>
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'Output Viewer',
  accentColor: '#06b6d4',
  icon: <Monitor className="w-4 h-4 text-white" />,
  width: 'w-[400px]'
}, OutputBody);
