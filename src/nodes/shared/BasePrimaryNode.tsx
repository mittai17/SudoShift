import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Calendar, Clock } from 'lucide-react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

export interface PrimaryNodeConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
  fields?: Array<{ key: string; label: string; type: 'text' | 'date' | 'select' | 'textarea'; options?: string[] }>;
}

export function createPrimaryNode(config: PrimaryNodeConfig) {
  const PrimaryComponent = ({ data }: { data: any }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();

    const updateTask = (updates: Partial<TaskData>) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), ...updates } } } : n
      ));
    };

    const extraFields = config.fields || [];

    return (
      <NodeWrapper>
        <div className="flex flex-col w-72 rounded-xl shadow-md bg-white border-2 hover:shadow-xl transition-shadow" style={{ borderColor: config.accentColor + '40' }}>
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
          {/* Header */}
          <div className="rounded-t-xl px-4 py-3 text-white" style={{ background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}cc)` }}>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{config.icon}</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-70">{config.label}</p>
                <input
                  className="font-bold text-sm bg-transparent focus:outline-none placeholder-white/50 w-full"
                  placeholder={`${config.label} title...`}
                  defaultValue={task.title || ''}
                  onChange={(e) => updateTask({ title: e.target.value })}
                />
              </div>
            </div>
          </div>
          {/* Body */}
          <div className="p-3 space-y-2.5">
            <textarea
              className="w-full text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none resize-none min-h-[60px]"
              placeholder="Description..."
              defaultValue={task.description || ''}
              onChange={(e) => updateTask({ description: e.target.value })}
            />
            <div className="flex items-center space-x-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <input type="date" className="flex-1 bg-transparent focus:outline-none text-gray-600"
                defaultValue={task.deadline?.split('T')[0] || ''}
                onChange={(e) => updateTask({ deadline: e.target.value || null })} />
            </div>
            {extraFields.map((field) => (
              <div key={field.key} className="space-y-0.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">{field.label}</label>
                {field.type === 'select' ? (
                  <select className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none text-gray-700">
                    {field.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-1.5 focus:outline-none resize-none min-h-[40px] text-gray-700" />
                ) : (
                  <input type={field.type} className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none text-gray-700" />
                )}
              </div>
            ))}
          </div>
          {/* Progress bar strip */}
          <div className="h-1 rounded-b-xl opacity-30" style={{ backgroundColor: config.accentColor }} />
          <Handle type="source" position={Position.Right} className="w-4 h-4 border-2 border-white -mr-2 z-10" style={{ backgroundColor: config.accentColor }} />
        </div>
      </NodeWrapper>
    );
  };
  PrimaryComponent.displayName = `PrimaryNode_${config.label.replace(/\s/g, '')}`;
  return PrimaryComponent;
}
