import React, { useState } from 'react';
import { Map, Sparkles, Target, Settings2, CheckSquare, Flag, Network, Zap, Clock, BrainCircuit } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const RoadmapMakerBody = ({ task, updateTask }: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const topic = task.topic || '';
  const roadmapType = task.roadmapType || 'Learning';
  const difficulty = task.difficulty || 'Intermediate';
  const timeframe = task.timeframe || '30 Days';

  // Toggle options
  const genMilestones = task.genMilestones !== false;
  const genTasks = task.genTasks !== false;
  const genHabits = task.genHabits || false;
  const autoConnect = task.autoConnect !== false;

  const handleGenerate = () => {
    if (!topic) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Target Topic Input */}
      <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
         <div className="flex items-center text-[10px] text-cyan-500 font-bold uppercase tracking-wider mb-1">
            <Target className="w-3 h-3 mr-1" /> Goal / Topic
         </div>
         <input 
            type="text" placeholder="e.g., Become a Full Stack Developer..." 
            className="w-full text-xs font-medium bg-transparent focus:outline-none text-gray-200"
            value={topic} onChange={(e) => updateTask({ topic: e.target.value })} 
         />
      </div>

      {/* Generation Settings */}
      <div className="grid grid-cols-2 gap-2 text-xs">
         <select 
            className="bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-cyan-500"
            value={roadmapType} onChange={(e) => updateTask({ roadmapType: e.target.value })}
         >
            {['Learning', 'Career', 'Skill Tree', 'Project'].map(t => <option key={t}>{t}</option>)}
         </select>
         <select 
            className="bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-cyan-500"
            value={timeframe} onChange={(e) => updateTask({ timeframe: e.target.value })}
         >
            {['14 Days', '30 Days', '60 Days', '90 Days', '6 Months', 'Custom'].map(t => <option key={t}>{t}</option>)}
         </select>
         <select 
            className="bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-cyan-500 col-span-2"
            value={difficulty} onChange={(e) => updateTask({ difficulty: e.target.value })}
         >
            {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(t => <option key={t}>{t}</option>)}
         </select>
      </div>

      {/* Node Generation Toggles */}
      <div className="bg-[#2a2b36]/30 border border-[#2a2b36] rounded-xl p-2.5">
         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-2">
            <Settings2 className="w-3 h-3 mr-1" /> Output Options
         </div>
         <div className="grid grid-cols-2 gap-y-2 text-[10px] text-gray-300">
            <label className="flex items-center hover:text-white cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-cyan-500" checked={genMilestones} onChange={(e) => updateTask({ genMilestones: e.target.checked })} />
               <Flag className="w-3 h-3 mr-1 text-red-400" /> Milestones
            </label>
            <label className="flex items-center hover:text-white cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-cyan-500" checked={genTasks} onChange={(e) => updateTask({ genTasks: e.target.checked })} />
               <CheckSquare className="w-3 h-3 mr-1 text-blue-400" /> Tasks
            </label>
            <label className="flex items-center hover:text-white cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-cyan-500" checked={genHabits} onChange={(e) => updateTask({ genHabits: e.target.checked })} />
               <Zap className="w-3 h-3 mr-1 text-orange-400" /> Habits
            </label>
            <label className="flex items-center hover:text-white cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-cyan-500" checked={autoConnect} onChange={(e) => updateTask({ autoConnect: e.target.checked })} />
               <Network className="w-3 h-3 mr-1 text-emerald-400" /> Auto-Connect
            </label>
         </div>
      </div>

      {/* Primary Actions */}
      <button 
         onClick={handleGenerate} disabled={isGenerating || !topic}
         className="w-full flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg py-2.5 transition-colors font-bold disabled:opacity-50 text-xs shadow-lg shadow-cyan-500/20"
      >
         {isGenerating ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Generating Roadmap...</> : <><Map className="w-4 h-4 mr-2" /> Generate Roadmap</>}
      </button>

      <button className="w-full flex items-center justify-center bg-[#13141c] hover:bg-[#1a1b23] text-gray-300 border border-[#2a2b36] rounded-lg py-1.5 transition-colors text-[10px]">
         <BrainCircuit className="w-3 h-3 mr-1" /> Get AI Path Suggestions First
      </button>
    </div>
  );
};

export default createResourceNode({
  label: 'Roadmap Maker',
  accentColor: '#06b6d4',
  icon: <Map className="w-4 h-4 text-white" />
}, RoadmapMakerBody);
