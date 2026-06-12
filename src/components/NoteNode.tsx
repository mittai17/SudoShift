import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlignLeft } from 'lucide-react';
import { NodeData } from '../types';

export default function NoteNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(task.id, e.target.value);
    }
  };

  return (
    <div className="flex flex-col w-64 rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400 border-2 border-white -ml-0.5" />
      
      {/* N8N Style Header */}
      <div className="bg-[#ff6d5a] px-3 py-2 flex items-center space-x-2 text-white">
        <AlignLeft className="w-4 h-4 opacity-80" />
        <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate">
          Note
        </h3>
      </div>
      
      {/* Body containing an editable textarea */}
      <div className="p-3 bg-white">
        <textarea
          className="w-full text-sm text-gray-700 bg-transparent resize-none focus:outline-none placeholder-gray-300 min-h-[60px]"
          placeholder="Type your note here..."
          defaultValue={task.description || ''}
          onChange={handleChange}
        />
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#ff6d5a] border-2 border-white -mr-0.5" />
    </div>
  );
}
