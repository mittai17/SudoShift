import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface VideoConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

const getYouTubeId = (url: string) => {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([^&?/]+)/);
  return m ? m[1] : null;
};

export function createVideoNode(config: VideoConfig) {
  const VideoComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [url, setUrl] = useState(task.description || '');

    const save = (val: string) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: val } } } : n
      ));
    };

    const ytId = getYouTubeId(url);

    return (
      <NodeWrapper data={data} selected={selected} defaultColor={config.accentColor} resizable={true} minWidth={288} minHeight={200}>
        <div className="flex flex-col w-full h-full min-w-72 min-h-[200px] rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white shrink-0" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <span className="opacity-80">{config.icon}</span>
            <h3 className="font-semibold text-sm">{config.label}</h3>
          </div>
          <div className="p-3 space-y-2 flex-1 flex flex-col min-h-0 bg-gray-50 rounded-b-xl overflow-hidden">
            <input value={url} onChange={(e) => { setUrl(e.target.value); save(e.target.value); }}
              className="w-full text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-400 shrink-0"
              placeholder="YouTube URL..." />
            {ytId ? (
              <div className="rounded-lg overflow-hidden flex-1 min-h-0 bg-black">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen title="video" />
              </div>
            ) : (
              <div className="rounded-lg bg-gray-100 flex-1 min-h-0 flex items-center justify-center text-xs text-gray-400">
                Paste a YouTube URL above
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  VideoComponent.displayName = `VideoNode_${config.label.replace(/\s/g, '')}`;
  return VideoComponent;
}
