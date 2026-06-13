import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Image as ImageIcon } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

export default function ImageNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;
  const [url, setUrl] = useState(task.description || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (onChange) {
      onChange(task.id, e.target.value);
    }
  };

  return (
    <NodeWrapper>
      <div className="flex flex-col w-64 rounded-xl shadow-md bg-white border border-gray-200  transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      
      <div className="bg-[#f59e0b] rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white">
        <ImageIcon className="w-4 h-4 opacity-80" />
        <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate">
          Image
        </h3>
      </div>
      
      <div className="p-3 bg-white flex flex-col space-y-2">
        <input 
          type="text"
          placeholder="Paste image URL here..."
          className="w-full text-xs p-1.5 border border-gray-200 rounded focus:outline-none focus:border-[#f59e0b]"
          value={url}
          onChange={handleChange}
        />
        {url && (
          <div className="w-full h-32 bg-gray-100 rounded border border-gray-200  mt-2 flex items-center justify-center relative">
            <img 
              src={url} 
              alt="Node contents" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  (e.currentTarget.nextSibling as HTMLDivElement).style.display = 'block';
                }
              }}
              onLoad={(e) => {
                 (e.currentTarget as HTMLImageElement).style.display = 'block';
                 if (e.currentTarget.nextSibling) {
                  (e.currentTarget.nextSibling as HTMLDivElement).style.display = 'none';
                 }
              }}
            />
            <div className="text-[10px] text-gray-400 hidden absolute text-center px-2">Image failed to load</div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#f59e0b] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
