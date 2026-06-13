import React, { useState, useMemo } from 'react';
import {
  BrainCircuit, Youtube, Loader2, ListPlus, Search, X,
  Target, FolderKanban, CheckSquare, CalendarDays, Flag,
  Flame, Library, BookOpen, LayoutGrid
} from 'lucide-react';
import { NODE_REGISTRY } from '../../nodes/registry/nodeTypes';
import { NodeDefinition } from '../../nodes/registry/types';
import { NodeCategory } from '../../types';

interface SidebarProps {
  onAddNodes: (nodes: any[]) => void;
  onAddEdges: (edges: any[]) => void;
}

type TabId = NodeCategory | 'all';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const TABS: TabConfig[] = [
  { id: 'all',       label: 'All',       icon: <LayoutGrid className="w-4 h-4" />,    color: '#64748b' },
  { id: 'goal',      label: 'Goal',      icon: <Target className="w-4 h-4" />,         color: '#f59e0b' },
  { id: 'project',   label: 'Project',   icon: <FolderKanban className="w-4 h-4" />,   color: '#6366f1' },
  { id: 'task',      label: 'Task',      icon: <CheckSquare className="w-4 h-4" />,    color: '#22c55e' },
  { id: 'event',     label: 'Event',     icon: <CalendarDays className="w-4 h-4" />,   color: '#0ea5e9' },
  { id: 'milestone', label: 'Milestone', icon: <Flag className="w-4 h-4" />,           color: '#ef4444' },
  { id: 'habit',     label: 'Habit',     icon: <Flame className="w-4 h-4" />,          color: '#f97316' },
  { id: 'resource',  label: 'Resource',  icon: <Library className="w-4 h-4" />,        color: '#8b5cf6' },
  { id: 'note',      label: 'Note',      icon: <BookOpen className="w-4 h-4" />,       color: '#ff6d5a' },
];

const CATEGORY_LABELS: Record<NodeCategory, string> = {
  goal: 'Goal', project: 'Project', task: 'Task', event: 'Event',
  milestone: 'Milestone', habit: 'Habit', resource: 'Resource', note: 'Note',
};

// ── Node Card ─────────────────────────────────────────────────────────────────
function NodeCard({ node, onDragStart }: {
  node: NodeDefinition;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  key?: React.Key;
}) {
  return (
    <div
      className="group flex items-center space-x-2.5 px-3 py-2.5 rounded-xl cursor-grab select-none border transition-all duration-150 bg-[#1a1b23] border-[#2a2b36] hover:scale-[1.02] active:scale-95 hover:shadow-lg"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = node.color + '80')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
      onDragStart={(e) => onDragStart(e, node.id)}
      draggable
      title={node.id}
    >
      <span className="text-base shrink-0 leading-none">{node.icon}</span>
      <span className="text-xs font-medium text-gray-300 leading-tight">{node.label}</span>
      <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: node.color }} />
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({ onAddNodes, onAddEdges }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [search, setSearch] = useState('');
  const [brainDump, setBrainDump] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loadingType, setLoadingType] = useState<'brain' | 'youtube' | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeId: string) => {
    event.dataTransfer.setData('application/reactflow', nodeId);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Filter nodes by tab + search
  const filteredNodes = useMemo(() => {
    const q = search.toLowerCase().trim();
    return NODE_REGISTRY.filter((n) => {
      const matchesTab = activeTab === 'all' || n.category === activeTab;
      const matchesSearch = !q || n.label.toLowerCase().includes(q) || n.id.includes(q) || n.category.includes(q);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  // For "All" tab or search: group by category
  const grouped = useMemo(() => {
    if (activeTab !== 'all' && !search) return null;
    const map = new Map<NodeCategory, NodeDefinition[]>();
    for (const node of filteredNodes) {
      if (!map.has(node.category)) map.set(node.category, []);
      map.get(node.category)!.push(node);
    }
    return map;
  }, [activeTab, filteredNodes, search]);

  const activeTabConfig = TABS.find((t) => t.id === activeTab)!;

  const handleBrainDump = async () => {
    if (!brainDump.trim()) return;
    try {
      setLoadingType('brain');
      const res = await fetch('/api/brain-dump', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: brainDump }) });
      if (!res.ok) throw new Error('Response failed');
      const data = await res.json();
      onAddNodes(data.nodes);
      setBrainDump('');
    } catch (e) { console.error(e); alert('Failed to process brain dump'); }
    finally { setLoadingType(null); }
  };

  const handleYoutubeExtract = async () => {
    if (!youtubeUrl.trim()) return;
    try {
      setLoadingType('youtube');
      const res = await fetch('/api/youtube-extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: youtubeUrl }) });
      if (!res.ok) throw new Error('Response failed');
      const data = await res.json();
      const nodes = data.nodes;
      const edges = nodes.slice(0, -1).map((n: any, i: number) => ({ id: `edge-${n.id}-${nodes[i + 1].id}`, source: n.id, target: nodes[i + 1].id, animated: true }));
      onAddNodes(nodes);
      if (edges.length > 0) onAddEdges(edges);
      setYoutubeUrl('');
    } catch (e) { console.error(e); alert('Failed to extract youtube actions'); }
    finally { setLoadingType(null); }
  };

  return (
    <div className="w-72 h-full flex flex-col bg-[#13141c] border-r border-[#1e2030] shrink-0 shadow-2xl z-10 overflow-hidden">
      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="px-4 py-3.5 flex items-center space-x-2.5 border-b border-[#1e2030] shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6d5a, #f59e0b)' }}>
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-white leading-tight tracking-tight">Visual Second Brain</h1>
          <p className="text-[10px] text-gray-500">LifeOS Canvas</p>
        </div>
      </div>

      {/* ── Search ────────────────────────────────────────── */}
      <div className="px-3 py-2.5 border-b border-[#1e2030] shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value) setActiveTab('all'); }}
            placeholder='Search nodes...'
            className="w-full bg-[#1a1b23] border border-[#2a2b36] rounded-lg pl-8 pr-8 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Rail ─────────────────────────────────────── */}
      <div className="flex overflow-x-auto gap-1 px-2 py-2 border-b border-[#1e2030] shrink-0" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id && !search;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(''); }}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 whitespace-nowrap shrink-0"
              style={isActive
                ? { backgroundColor: tab.color + '25', color: tab.color, borderWidth: 1, borderStyle: 'solid', borderColor: tab.color + '50' }
                : { color: '#6b7280' }}
              title={tab.label}
            >
              <span style={isActive ? { color: tab.color } : { color: '#4b5563' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Node Grid ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2b36 transparent' }}>
        
        {search && (
          <div className="text-[10px] text-gray-500 px-1">
            {filteredNodes.length} result{filteredNodes.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </div>
        )}

        {filteredNodes.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs">No nodes found</div>
        )}

        {/* Grouped display (All tab or search) */}
        {grouped && grouped.size > 0 && (
          Array.from(grouped.entries()).map(([category, nodes]) => {
            const tabCfg = TABS.find((t) => t.id === category);
            return (
              <div key={category}>
                <div className="flex items-center space-x-1.5 mb-1.5 px-1">
                  <span style={{ color: tabCfg?.color }} className="opacity-70">{tabCfg?.icon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: (tabCfg?.color || '#888') + 'aa' }}>
                    {CATEGORY_LABELS[category]}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: (tabCfg?.color || '#888') + '20' }} />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {nodes.map((node) => <NodeCard key={node.id} node={node} onDragStart={handleDragStart} />)}
                </div>
              </div>
            );
          })
        )}

        {/* Single category display */}
        {!grouped && filteredNodes.length > 0 && (
          <div>
            <div className="flex items-center space-x-1.5 mb-2 px-1">
              <span style={{ color: activeTabConfig.color }}>{activeTabConfig.icon}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: activeTabConfig.color + 'aa' }}>
                {activeTabConfig.label} Nodes
              </span>
              <span className="text-[10px] text-gray-600 ml-1">({filteredNodes.length})</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {filteredNodes.map((node) => <NodeCard key={node.id} node={node} onDragStart={handleDragStart} />)}
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-600 text-center pt-1 pb-2">Drag nodes to the canvas</p>
      </div>

      {/* ── AI Assistants ────────────────────────────────── */}
      <div className="border-t border-[#1e2030] px-3 py-3 space-y-3 bg-[#0f1016] shrink-0">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">AI Assistants</p>

        {/* Brain Dump */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <ListPlus className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-gray-400">Smart Brain-Dump</span>
          </div>
          <textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            className="w-full min-h-[60px] p-2 text-xs border border-[#1e2030] rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none resize-none bg-[#1a1b23] text-gray-300 placeholder-gray-600 font-sans"
            placeholder="Dump unstructured thoughts..."
          />
          <button
            onClick={handleBrainDump}
            disabled={loadingType !== null || !brainDump.trim()}
            className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loadingType === 'brain' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Extract to Matrix'}
          </button>
        </div>

        {/* YouTube */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-medium text-gray-400">YouTube Actions</span>
          </div>
          <input
            type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full p-2 text-xs border border-[#1e2030] rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:outline-none bg-[#1a1b23] text-gray-300 placeholder-gray-600"
            placeholder="YouTube URL or topic..." />
          <button
            onClick={handleYoutubeExtract}
            disabled={loadingType !== null || !youtubeUrl.trim()}
            className="w-full py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loadingType === 'youtube' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Extract Roadmap'}
          </button>
        </div>
      </div>
    </div>
  );
}
