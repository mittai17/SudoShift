import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code2 } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

export default function CodeNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;
  const [code, setCode] = useState(task.description || '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    if (onChange) {
      onChange(task.id, e.target.value);
    }
  };

  // Adjust height automatically
  const onTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <NodeWrapper>
      <div className="flex flex-col w-80 rounded-xl shadow-md bg-[#1e1e1e] border border-gray-700  transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-gray-800 -ml-2 z-10" />
      
      <div className="bg-[#2d2d2d] rounded-t-xl px-3 py-2 flex items-center space-x-2 text-gray-200 border-b border-gray-700">
        <Code2 className="w-4 h-4 opacity-80" />
        <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate">
          Code Snippet
        </h3>
      </div>
      
      <div className="p-2 bg-[#1e1e1e] nodrag cursor-text">
        <textarea
          value={code}
          onChange={handleChange}
          onInput={onTextareaInput}
          placeholder="// write some code..."
          className="w-full min-h-[80px] bg-transparent text-sm text-[#d4d4d4] font-mono outline-none resize-none  placeholder-gray-600"
          spellCheck={false}
        />
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-gray-400 border-2 border-gray-800 -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
