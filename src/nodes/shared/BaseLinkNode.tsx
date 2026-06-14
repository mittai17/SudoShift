import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { ExternalLink } from 'lucide-react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface LinkConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

export function createLinkNode(config: LinkConfig) {
  const LinkComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [url, setUrl] = useState(task.description || '');
    const [title, setTitle] = useState(task.title || config.label);

    const save = (updates: Partial<TaskData>) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), ...updates } } } : n
      ));
    };

    return (
      <NodeWrapper data={data} selected={selected} defaultColor={config.accentColor}>
        <div className="flex flex-col w-64 rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <span className="opacity-80">{config.icon}</span>
            <h3 className="font-semibold text-sm">{config.label}</h3>
          </div>
          <div className="p-3 space-y-2">
            <input value={title} onChange={(e) => { setTitle(e.target.value); save({ title: e.target.value }); }}
              className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
              placeholder="Link title..." />
            <input value={url} onChange={(e) => { setUrl(e.target.value); save({ description: e.target.value }); }}
              className="w-full text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
              placeholder="https://..." />
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-700 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /><span>Open link</span>
              </a>
            )}
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  LinkComponent.displayName = `LinkNode_${config.label.replace(/\s/g, '')}`;
  return LinkComponent;
}
