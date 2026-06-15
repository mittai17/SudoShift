import React, { useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitGraph } from 'lucide-react';
import { NodeData } from '../../types';
import mermaid from 'mermaid';
import NodeWrapper from './NodeWrapper';

export default function MermaidNode({ data, id }: { data: NodeData, id: string }) {
  const { task, onChange } = data;
  const [svgStr, setSvgStr] = useState('');
  const [error, setError] = useState('');

  const renderMermaid = async (code: string) => {
    if (!code.trim()) {
      setSvgStr('');
      setError('');
      return;
    }
    
    // Safety against empty/invalid IDs
    const safeId = `mermaid-${id.replace(/[^a-zA-Z0-9]/g, '')}`;
    
    try {
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      const { svg } = await mermaid.render(safeId, code);
      setSvgStr(svg);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Syntax Error');
    }
  };

  useEffect(() => {
    renderMermaid(task.description || '');
  }, [task.description]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(task.id, e.target.value);
    }
  };

  // N8N style nodes: dark purple for Diagram nodes
  return (
    <NodeWrapper>
      <div className="flex flex-col w-96 rounded-xl shadow-md bg-[#13141c] border border-[#2a2b36]  transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      
      <div className="bg-[#8b5cf6] rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white">
        <GitGraph className="w-4 h-4 opacity-80" />
        <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate">
          Mermaid Diagram
        </h3>
      </div>
      
      {/* Code Editor Area */}
      <div className="p-3 bg-[#1a1b23] border-b border-gray-100">
        <textarea
          className="w-full text-xs font-mono text-gray-300 bg-transparent resize-none focus:outline-none placeholder-gray-400 min-h-[80px]"
          placeholder="graph TD
  A-->B;"
          defaultValue={task.description || ''}
          onChange={handleChange}
        />
      </div>
      
      {/* Preview Area */}
      <div className="p-3 bg-[#13141c] min-h-[100px] flex items-center justify-center overflow-auto pointer-events-none custom-mermaid-container">
        {error ? (
          <p className="text-[10px] text-red-500 font-mono break-all leading-tight">{error}</p>
        ) : svgStr ? (
          <div dangerouslySetInnerHTML={{ __html: svgStr }} className="max-w-full" />
        ) : (
          <p className="text-xs text-gray-400">Write valid mermaid syntax above</p>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#8b5cf6] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
