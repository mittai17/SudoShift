import React, { useRef } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Upload } from 'lucide-react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface ImageConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

export function createImageNode(config: ImageConfig) {
  const ImageComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const fileRef = useRef<HTMLInputElement>(null);

    const src = task.description || '';

    const save = (val: string) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: val } } } : n
      ));
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => save(ev.target?.result as string);
      reader.readAsDataURL(file);
    };

    return (
      <NodeWrapper data={data} selected={selected} resizable={true} minWidth={256} minHeight={200}>
        <div className="flex flex-col w-full h-full min-w-64 min-h-[200px] rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 shrink-0 flex items-center space-x-2 text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <span className="opacity-80">{config.icon}</span>
            <h3 className="font-semibold text-sm">{config.label}</h3>
          </div>
          <div className="p-3 flex-1 flex flex-col items-center justify-center overflow-hidden min-h-0 bg-gray-50 rounded-b-xl">
            {src ? (
              <img src={src} alt="node" className="w-full h-auto max-h-full rounded-lg object-contain cursor-pointer" onClick={() => fileRef.current?.click()} />
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full h-full min-h-[128px] border border-gray-200 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center space-y-2 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors">
                <Upload className="w-6 h-6 shrink-0" />
                <span className="text-xs shrink-0">Click to upload image</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  ImageComponent.displayName = `ImageNode_${config.label.replace(/\s/g, '')}`;
  return ImageComponent;
}
