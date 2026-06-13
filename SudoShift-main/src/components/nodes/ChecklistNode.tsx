import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckSquare, Plus, X } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export default function ChecklistNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;

  const [items, setItems] = useState<ChecklistItem[]>(() => {
    try {
      if (task.description) {
        const parsed = JSON.parse(task.description);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch(e) {}
    return [
      { id: '1', text: 'First item', checked: false },
      { id: '2', text: 'Second item', checked: false },
    ];
  });

  const saveAndSet = (newItems: ChecklistItem[]) => {
    setItems(newItems);
    if (onChange) {
      onChange(task.id, JSON.stringify(newItems));
    }
  };

  const addItem = () => {
    const newItem = { id: Math.random().toString(36).substr(2, 9), text: '', checked: false };
    saveAndSet([...items, newItem]);
  };

  const removeItem = (id: string) => {
    saveAndSet(items.filter(item => item.id !== id));
  };

  const toggleItem = (id: string) => {
    saveAndSet(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const updateItemText = (id: string, text: string) => {
    saveAndSet(items.map(item => item.id === id ? { ...item, text } : item));
  };

  return (
    <NodeWrapper>
      <div className="flex flex-col rounded-xl shadow-md bg-white border border-gray-200  transition-shadow hover:shadow-lg w-64">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      
      <div className="bg-[#ec4899] rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white">
        <CheckSquare className="w-4 h-4 opacity-80" />
        <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate">
          Checklist
        </h3>
      </div>
      
      <div className="p-3 bg-white nodrag cursor-default">
        <div className="flex flex-col space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center space-x-2 group relative">
              <input 
                type="checkbox" 
                checked={item.checked} 
                onChange={() => toggleItem(item.id)}
                className="w-4 h-4 text-[#ec4899] rounded border-gray-300 focus:ring-[#ec4899]"
              />
              <input 
                type="text" 
                value={item.text}
                onChange={(e) => updateItemText(item.id, e.target.value)}
                placeholder="List item..."
                className={`flex-1 w-full text-sm outline-none ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
              />
              <button 
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button 
          onClick={addItem}
          className="mt-3 flex items-center text-xs text-gray-500 hover:text-[#ec4899] transition-colors"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Item
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#ec4899] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
