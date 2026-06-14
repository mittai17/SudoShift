import React, { useState } from 'react';
import { Code2, Copy, Maximize2, Minimize2, Check, PlayCircle, History, FileCode } from 'lucide-react';
import { createTaskNode } from '../shared/BaseTaskNode';

const TaskCodeBody = ({ task, updateTask }: any) => {
  const code = task.code || '';
  const language = task.language || 'typescript';
  const isExpanded = task.isExpanded || false;
  const execStatus = task.execStatus || 'Idle'; // Idle, Running, Success, Error
  const version = task.version || 1;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const LANGUAGES = ['typescript', 'javascript', 'python', 'rust', 'go', 'json', 'html', 'css', 'sql'];

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#13141c] border border-[#2a2b36] rounded-t-lg p-1.5 border-b-0">
        <div className="flex items-center space-x-2">
          <select 
            className="bg-[#2a2b36] border border-[#3f3f46] text-gray-300 text-[10px] rounded px-2 py-1 focus:outline-none focus:border-emerald-500 font-mono"
            value={language} onChange={(e) => updateTask({ language: e.target.value })}
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className={`flex items-center text-[10px] px-2 py-0.5 rounded-full border 
            ${execStatus === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
              execStatus === 'Error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
              execStatus === 'Running' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse' : 
              'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}
          >
            {execStatus}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button onClick={() => alert('Format code...')} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400 hover:text-white transition-colors" title="Format Code">
             <FileCode className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleCopy} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400 hover:text-white transition-colors" title="Copy Code">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => updateTask({ isExpanded: !isExpanded })} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400 hover:text-white transition-colors">
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className={`relative border border-[#2a2b36] rounded-b-lg overflow-hidden ${isExpanded ? 'h-96' : 'h-48'} transition-all`}>
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#13141c] border-r border-[#2a2b36]" />
        <textarea
          className="w-full h-full bg-[#1a1b23] text-gray-300 font-mono text-[11px] p-4 pl-10 focus:outline-none resize-none leading-relaxed"
          value={code} onChange={(e) => updateTask({ code: e.target.value, version: version + 1 })}
          placeholder={`// Write your ${language} code here...`}
          spellCheck={false}
        />
      </div>

      {/* Footer Tools */}
      <div className="flex items-center justify-between text-[10px] pt-1">
         <div className="flex items-center text-gray-500">
            <History className="w-3 h-3 mr-1" /> v{version}
         </div>
         <div className="flex items-center space-x-1.5">
           <button className="flex items-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2 py-1 rounded transition-colors font-medium">
             Explain
           </button>
           <button className="flex items-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-1 rounded transition-colors font-medium">
             Refactor
           </button>
           <button className="flex items-center bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded transition-colors font-medium">
             Find Bugs
           </button>
           <button className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded transition-colors font-bold shadow-lg shadow-emerald-500/20"
             onClick={() => updateTask({ execStatus: 'Running' })}
           >
             <PlayCircle className="w-3 h-3 mr-1" /> Run
           </button>
         </div>
      </div>
    </div>
  );
};

export default createTaskNode({
  label: 'Task Code',
  accentColor: '#10b981',
  icon: <Code2 className="w-4 h-4 text-white" />,
  width: 'w-[480px]'
}, TaskCodeBody);
