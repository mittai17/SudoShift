import React, { useState } from 'react';
import { BrainCircuit, Youtube, Loader2, ListPlus, StickyNote, GitGraph } from 'lucide-react';

interface SidebarProps {
  onAddNodes: (nodes: any[]) => void;
  onAddEdges: (edges: any[]) => void;
}

export default function Sidebar({ onAddNodes, onAddEdges }: SidebarProps) {
  const [brainDump, setBrainDump] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loadingType, setLoadingType] = useState<'brain' | 'youtube' | null>(null);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleBrainDump = async () => {
    if (!brainDump.trim()) return;
    try {
      setLoadingType('brain');
      const res = await fetch('/api/brain-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: brainDump }),
      });
      if (!res.ok) throw new Error('Response failed');
      const data = await res.json();
      onAddNodes(data.nodes);
      setBrainDump('');
    } catch (e) {
      console.error(e);
      alert("Failed to process brain dump");
    } finally {
      setLoadingType(null);
    }
  };

  const handleYoutubeExtract = async () => {
    if (!youtubeUrl.trim()) return;
    try {
      setLoadingType('youtube');
      const res = await fetch('/api/youtube-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      if (!res.ok) throw new Error('Response failed');
      const data = await res.json();
      
      const nodes = data.nodes;
      const edges = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
          id: `edge-${nodes[i].id}-${nodes[i+1].id}`,
          source: nodes[i].id,
          target: nodes[i+1].id,
          animated: true,
        });
      }

      onAddNodes(nodes);
      if (edges.length > 0) onAddEdges(edges);
      
      setYoutubeUrl('');
    } catch (e) {
      console.error(e);
      alert("Failed to extract youtube action");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-[#fafafa] flex flex-col pt-4 px-4 overflow-y-auto shrink-0 shadow-sm z-10">
      <div className="mb-6 flex space-x-2 items-center">
        <div className="p-2 bg-[#ff6d5a] text-white rounded-lg">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <h1 className="font-bold text-lg text-gray-800 tracking-tight">Visual Second Brain</h1>
      </div>

      <div className="space-y-4">
        
        {/* Node Library Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-3">Nodes</h2>
          <div className="grid grid-cols-2 gap-2">
            <div
              className="flex items-center space-x-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg cursor-grab hover:border-[#ff6d5a] hover:bg-white transition-all"
              onDragStart={(event) => onDragStart(event, 'noteNodeType')}
              draggable
            >
              <StickyNote className="w-4 h-4 text-[#ff6d5a]" />
              <span className="text-xs font-medium text-gray-700">Note</span>
            </div>
            
            <div
              className="flex items-center space-x-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg cursor-grab hover:border-[#8b5cf6] hover:bg-white transition-all"
              onDragStart={(event) => onDragStart(event, 'mermaidNodeType')}
              draggable
            >
              <GitGraph className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs font-medium text-gray-700">Mermaid</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Drag items to the canvas</p>
        </div>

        {/* AI Operations Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">AI Assistants</h2>
          
          {/* Brain Dump Item */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-1">
              <ListPlus className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-sm text-gray-800">Smart Brain-Dump</h3>
            </div>
            <textarea
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              className="w-full min-h-[80px] p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none resize-y bg-gray-50 font-sans placeholder-gray-400 transition-colors"
              placeholder="Dump unstructured thoughts here..."
            />
            <button
              onClick={handleBrainDump}
              disabled={loadingType !== null || !brainDump.trim()}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {loadingType === 'brain' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Extract to Eisenhower Matrix'
              )}
            </button>
          </div>

          <div className="h-px bg-gray-100 my-4" />

          {/* YouTube Extractor Item */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-1 text-blue-900">
              <Youtube className="w-4 h-4 text-red-500" />
              <h3 className="font-medium text-sm text-gray-800">YouTube Actions</h3>
            </div>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
              placeholder="Enter YouTube URL or Topic..."
            />
            <button
              onClick={handleYoutubeExtract}
              disabled={loadingType !== null || !youtubeUrl.trim()}
              className="w-full py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {loadingType === 'youtube' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Extract Roadmap'
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
