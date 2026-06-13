import React, { useState } from 'react';
import { Columns, Maximize2, ExternalLink, Network, LayoutTemplate, Search, Download, Upload, Layers } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const CanvasBody = ({ task, updateTask }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const childNodeCount = task.childNodeCount || 0;
  const parentCanvas = task.parentCanvas || 'Root Canvas';

  const handleOpenNewView = () => {
     // Mock opening the canvas in a full view
     console.log('Opening nested canvas in new view');
  };

  return (
    <div className="space-y-3">
      {/* Canvas Breadcrumbs & Stats */}
      <div className="flex items-center justify-between bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 text-[10px]">
         <div className="flex items-center text-gray-400 font-medium">
            <span className="hover:text-cyan-400 cursor-pointer">{parentCanvas}</span>
            <span className="mx-1">/</span>
            <span className="text-gray-200">{task.title || 'Nested Canvas'}</span>
         </div>
         <div className="flex items-center text-cyan-500 font-bold">
            <Network className="w-3 h-3 mr-1" /> {childNodeCount} Nodes
         </div>
      </div>

      {/* Expandable Preview Area */}
      <div 
         className={`relative bg-[#0d0e15] border-2 border-[#2a2b36] rounded-xl overflow-hidden group transition-all duration-300
         ${isExpanded ? 'h-64' : 'h-32 hover:border-cyan-500/50 cursor-pointer'}`}
         onClick={() => !isExpanded && setIsExpanded(true)}
      >
         {/* Mock Grid Background */}
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2a2b36 1px, transparent 0)', backgroundSize: '16px 16px' }} />
         
         {!isExpanded ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
               <Layers className="w-8 h-8 mb-2 opacity-50 group-hover:text-cyan-500 group-hover:opacity-100 transition-all" />
               <span className="text-[10px] font-medium group-hover:text-cyan-400">Click to expand preview</span>
            </div>
         ) : (
            <div className="absolute inset-0 p-4">
               {/* Mock nested nodes */}
               <div className="w-20 h-10 bg-[#1a1b23] border border-[#2a2b36] rounded absolute top-4 left-4" />
               <div className="w-24 h-12 bg-[#1a1b23] border border-[#2a2b36] rounded absolute top-10 left-32" />
               <div className="w-16 h-16 bg-[#1a1b23] border border-[#2a2b36] rounded-full absolute bottom-4 right-4" />
               
               <button 
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors"
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
               >
                  <Maximize2 className="w-3.5 h-3.5" />
               </button>
            </div>
         )}
      </div>

      {/* Canvas Actions */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
         <button onClick={handleOpenNewView} className="col-span-2 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg py-2 transition-colors font-bold">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open In New View
         </button>
         
         <div className="col-span-2 flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-1.5 focus-within:border-cyan-500 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-500 ml-1 mr-2" />
            <input type="text" placeholder="Search inside canvas..." className="w-full bg-transparent focus:outline-none text-gray-300" />
         </div>

         <button className="flex items-center justify-center bg-[#13141c] hover:bg-[#1a1b23] text-gray-300 border border-[#2a2b36] rounded-lg py-1.5 transition-colors">
            <Download className="w-3 h-3 mr-1" /> Export Canvas
         </button>
         <button className="flex items-center justify-center bg-[#13141c] hover:bg-[#1a1b23] text-gray-300 border border-[#2a2b36] rounded-lg py-1.5 transition-colors">
            <Upload className="w-3 h-3 mr-1" /> Import Canvas
         </button>
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'Nested Canvas',
  accentColor: '#06b6d4',
  icon: <Columns className="w-4 h-4 text-white" />,
  width: 'w-[360px]'
}, CanvasBody);
