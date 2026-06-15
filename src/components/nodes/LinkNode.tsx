import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Link2 } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

export default function LinkNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(task.id, e.target.value);
    }
  };

  return (
    <NodeWrapper>
      <div className="flex flex-col w-64 rounded-xl shadow-md bg-[#13141c] border border-[#2a2b36]  transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      
      <div className="bg-[#3b82f6] rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white">
        <Link2 className="w-4 h-4 opacity-80" />
        <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate">
          Link
        </h3>
      </div>
      
      <div className="p-3 bg-[#13141c]">
        <input
          type="url"
          className="w-full text-sm text-blue-600 bg-transparent focus:outline-none placeholder-gray-300 border-b border-dashed border-[#3f3f46] pb-1"
          placeholder="https://example.com"
          defaultValue={task.description || ''}
          onChange={handleChange}
        />
        {(task.description && task.description.startsWith('http')) && (
          <a href={task.description} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 mt-2 hover:text-blue-500 block truncate">
            Open Link &rarr;
          </a>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#3b82f6] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
