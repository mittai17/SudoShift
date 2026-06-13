import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Paperclip, Upload } from 'lucide-react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface AttachmentConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
  accept?: string;
  placeholder?: string;
}

export function createAttachmentNode(config: AttachmentConfig) {
  const AttachmentComponent = ({ data }: { data: any }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [fileName, setFileName] = useState(task.title || '');
    const [notes, setNotes] = useState(task.description || '');

    const save = (updates: Partial<TaskData>) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), ...updates } } } : n
      ));
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      save({ title: file.name });
    };

    return (
      <NodeWrapper>
        <div className="flex flex-col w-64 rounded-xl shadow-md bg-white border border-gray-200 hover:shadow-lg transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white" style={{ backgroundColor: config.accentColor }}>
            <span className="opacity-80">{config.icon}</span>
            <h3 className="font-semibold text-sm">{config.label}</h3>
          </div>
          <div className="p-3 space-y-2">
            <label className="flex items-center space-x-2 p-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <Upload className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500 truncate">{fileName || (config.placeholder || 'Upload file...')}</span>
              <input type="file" accept={config.accept || '*'} onChange={handleFile} className="hidden" />
            </label>
            {fileName && (
              <div className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                <Paperclip className="w-3 h-3" /><span className="truncate">{fileName}</span>
              </div>
            )}
            <textarea value={notes} onChange={(e) => { setNotes(e.target.value); save({ description: e.target.value }); }}
              className="w-full text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none resize-none min-h-[50px]"
              placeholder="Notes about this attachment..." />
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border-2 border-white -mr-2 z-10" style={{ backgroundColor: config.accentColor }} />
        </div>
      </NodeWrapper>
    );
  };
  AttachmentComponent.displayName = `AttachmentNode_${config.label.replace(/\s/g, '')}`;
  return AttachmentComponent;
}
