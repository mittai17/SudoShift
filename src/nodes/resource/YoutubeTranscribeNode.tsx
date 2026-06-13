import React, { useState } from 'react';
import { Youtube, FileText, Download, Sparkles, Languages, Users, Clock, AlignLeft, CheckSquare, Map } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const YoutubeTranscribeBody = ({ task, updateTask }: any) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const url = task.url || '';
  const language = task.language || 'English';
  const hasSpeakerDetection = task.hasSpeakerDetection || false;
  const hasTimestamps = task.hasTimestamps || true;

  const handleTranscribe = () => {
    if (!url) return;
    setIsTranscribing(true);
    setTimeout(() => {
      setIsTranscribing(false);
      updateTask({ 
         transcript: "[00:00] Speaker 1: Welcome to this tutorial...\\n[00:05] Speaker 2: Let's get started right away." 
      });
    }, 2000);
  };

  return (
    <div className="space-y-3">
      {/* URL Input & Transcribe Button */}
      <div className="flex items-center gap-2">
         <div className="flex-1 flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
            <Youtube className="w-4 h-4 text-red-500 shrink-0 mr-2" />
            <input 
               type="text" placeholder="YouTube URL..." 
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
               value={url} onChange={(e) => updateTask({ url: e.target.value })} 
            />
         </div>
         <button 
            onClick={handleTranscribe} disabled={isTranscribing || !url}
            className="p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-bold disabled:opacity-50 text-xs"
         >
            {isTranscribing ? 'Extracting...' : 'Extract'}
         </button>
      </div>

      {/* Settings Options */}
      <div className="grid grid-cols-2 gap-2">
         <div className="flex items-center bg-[#2a2b36]/30 border border-[#2a2b36] rounded-md px-2 py-1.5 text-xs text-gray-300">
            <Languages className="w-3.5 h-3.5 text-blue-400 mr-2 shrink-0" />
            <select className="bg-transparent focus:outline-none w-full" value={language} onChange={(e) => updateTask({ language: e.target.value })}>
               {['English', 'Spanish', 'French', 'German', 'Auto-detect'].map(l => <option key={l}>{l}</option>)}
            </select>
         </div>
         <div className="flex flex-col gap-1 justify-center px-1">
            <label className="flex items-center text-[10px] text-gray-400 hover:text-gray-300 cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-cyan-500" checked={hasSpeakerDetection} onChange={(e) => updateTask({ hasSpeakerDetection: e.target.checked })} />
               <Users className="w-3 h-3 mr-1" /> Speaker Detection
            </label>
            <label className="flex items-center text-[10px] text-gray-400 hover:text-gray-300 cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-cyan-500" checked={hasTimestamps} onChange={(e) => updateTask({ hasTimestamps: e.target.checked })} />
               <Clock className="w-3 h-3 mr-1" /> Timestamps
            </label>
         </div>
      </div>

      {/* Transcript Area */}
      <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors">
         <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center justify-between">
            <div className="flex items-center"><FileText className="w-3 h-3 mr-1" /> Transcript</div>
            <button className="hover:text-white" title="Export Transcript"><Download className="w-3 h-3" /></button>
         </div>
         <textarea
            className="w-full text-[10px] text-gray-300 font-mono bg-transparent border-none p-3 focus:outline-none resize-none min-h-[100px] custom-scrollbar"
            placeholder="Transcript will appear here..." value={task.transcript || ''} readOnly
         />
      </div>

      {/* AI Post-Processing Tools */}
      <div className="bg-[#2a2b36]/20 border border-[#2a2b36] rounded-xl p-2 space-y-2">
         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center justify-between">
            <div className="flex items-center"><Sparkles className="w-3 h-3 mr-1 text-cyan-400" /> AI Processing</div>
            <button className="hover:text-white text-gray-500" title="Export Notes"><Download className="w-3 h-3" /></button>
         </div>
         <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button className="flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <AlignLeft className="w-3 h-3 mr-1" /> AI Summary
            </button>
            <button className="flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <CheckSquare className="w-3 h-3 mr-1" /> Action Items
            </button>
            <button className="flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <Map className="w-3 h-3 mr-1" /> Generate Roadmap
            </button>
            <button className="flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <FileText className="w-3 h-3 mr-1" /> Generate Notes
            </button>
         </div>
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'YouTube Transcribe',
  accentColor: '#06b6d4',
  icon: <FileText className="w-4 h-4 text-white" />
}, YoutubeTranscribeBody);
