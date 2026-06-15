import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Youtube } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

// Helper to extract YouTube video ID
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function VideoNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;
  const [url, setUrl] = useState(task.description || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (onChange) {
      onChange(task.id, e.target.value);
    }
  };

  const videoId = getYoutubeId(url);

  return (
    <NodeWrapper>
      <div className="flex flex-col w-80 rounded-xl shadow-md bg-[#13141c] border border-[#2a2b36]  transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      
      <div className="bg-[#ef4444] rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white">
        <Youtube className="w-4 h-4 opacity-80" />
        <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate">
          Video Player
        </h3>
      </div>
      
      <div className="p-3 bg-[#13141c] flex flex-col space-y-2 nodrag">
        <input 
          type="text"
          placeholder="Paste YouTube URL..."
          className="w-full text-xs p-1.5 border border-[#2a2b36] rounded focus:outline-none focus:border-[#ef4444]"
          value={url}
          onChange={handleChange}
        />
        {videoId ? (
          <div className="w-full aspect-video bg-gray-100 rounded border border-[#2a2b36]  mt-2 relative">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        ) : url ? (
          <div className="text-xs text-red-500 mt-1">Invalid YouTube URL</div>
        ) : null}
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#ef4444] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
