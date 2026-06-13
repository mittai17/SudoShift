import React, { useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Target, FolderKanban, CheckSquare, CalendarDays, Flag, Flame, Library, BookOpen } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { NODE_REGISTRY } from '../../nodes/registry/nodeTypes';
import { NodeCategory } from '../../types';

interface QuickConnectMenuProps {
  sourceId: string;
  sourceX: number;
  sourceY: number;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<NodeCategory, React.ReactNode> = {
  goal: <Target className="w-3.5 h-3.5" />,
  project: <FolderKanban className="w-3.5 h-3.5" />,
  task: <CheckSquare className="w-3.5 h-3.5" />,
  event: <CalendarDays className="w-3.5 h-3.5" />,
  milestone: <Flag className="w-3.5 h-3.5" />,
  habit: <Flame className="w-3.5 h-3.5" />,
  resource: <Library className="w-3.5 h-3.5" />,
  note: <BookOpen className="w-3.5 h-3.5" />,
};

const CATEGORY_PRIMARY_NODES: Record<NodeCategory, string> = {
  goal: 'goal-node',
  project: 'project-node',
  task: 'task-node',
  event: 'event-node',
  milestone: 'milestone-node',
  habit: 'habit-node',
  resource: 'resource-node',
  note: 'note-node',
};

export function QuickConnectMenu({ sourceId, sourceX, sourceY, onClose }: QuickConnectMenuProps) {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleCreateAndConnect = (category: NodeCategory) => {
    const type = CATEGORY_PRIMARY_NODES[category];
    const registryEntry = NODE_REGISTRY.find((n) => n.id === type);
    if (!registryEntry) return;

    // Find the rightmost node to avoid overlaps (smart placement)
    const existingNodes = getNodes();
    const sourceNode = existingNodes.find(n => n.id === sourceId);
    
    // Position 350px to the right of the source node
    const newPosition = {
      x: sourceNode ? sourceNode.position.x + 350 : sourceX + 350,
      y: sourceNode ? sourceNode.position.y : sourceY,
    };

    const newNodeId = uuidv4();
    
    // Create Node
    const newNode = {
      id: newNodeId,
      type,
      position: newPosition,
      data: { 
        task: { 
          id: uuidv4(), 
          ...registryEntry.defaultData 
        } 
      },
    };

    // Create Edge
    const newEdge = {
      id: `e-${sourceId}-${newNodeId}`,
      source: sourceId,
      target: newNodeId,
      animated: true,
      type: 'default',
    };

    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat(newEdge));
    onClose();
  };

  return (
    <div 
      ref={menuRef} 
      className="absolute z-50 p-2 bg-[#13141c] border border-[#2a2b36] rounded-xl shadow-2xl w-40 flex flex-col space-y-1 nodrag cursor-default"
      // Position offset from the + handle
      style={{ top: '-40px', left: '24px' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-2 py-1 mb-1">
        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Connect To</span>
      </div>
      {(Object.entries(CATEGORY_ICONS) as [NodeCategory, React.ReactNode][]).map(([category, icon]) => (
        <button
          key={category}
          onClick={() => handleCreateAndConnect(category)}
          className="flex items-center space-x-2.5 px-2 py-1.5 rounded-lg hover:bg-[#1a1b23] hover:text-white transition-colors text-gray-300 w-full text-left"
        >
          {icon}
          <span className="text-xs font-medium capitalize">{category}</span>
        </button>
      ))}
    </div>
  );
}
