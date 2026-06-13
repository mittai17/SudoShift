import React from 'react';
import { CheckSquare, Plus, ArrowUp, ArrowDown, User, Layers } from 'lucide-react';
import { createTaskNode } from '../shared/BaseTaskNode';

interface ChecklistItem { id: string; text: string; done: boolean; date?: string; assignee?: string; priority?: string; }

const TaskChecklistBody = ({ task, updateTask }: any) => {
  const items: ChecklistItem[] = task.items || [];
  const progress = items.length ? Math.round((items.filter(i => i.done).length / items.length) * 100) : 0;
  const isAutoCompleted = items.length > 0 && progress === 100;

  const updateItems = (newItems: ChecklistItem[]) => {
    const newProgress = newItems.length ? Math.round((newItems.filter(i => i.done).length / newItems.length) * 100) : 0;
    updateTask({ items: newItems, progress: newProgress });
  };

  const addItem = () => updateItems([...items, { id: Date.now().toString(), text: '', done: false, priority: 'Medium' }]);
  const updateItem = (id: string, updates: Partial<ChecklistItem>) => updateItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  const removeItem = (id: string) => updateItems(items.filter(i => i.id !== id));
  const bulkComplete = () => updateItems(items.map(i => ({ ...i, done: true })));

  const moveItem = (index: number, direction: number) => {
    if (index + direction < 0 || index + direction >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[index + direction]] = [newItems[index + direction], newItems[index]];
    updateItems(newItems);
  };

  return (
    <div className="space-y-3">
      {/* Templates Dropdown & Bulk Actions */}
      <div className="flex items-center justify-between text-xs mb-1">
        <select className="bg-[#2a2b36]/50 border border-[#2a2b36] rounded px-2 py-1 text-gray-400 focus:outline-none">
          <option>Apply Template...</option>
          <option>Code Review Checklist</option>
          <option>Deployment Steps</option>
          <option>QA Testing</option>
        </select>
        <button onClick={bulkComplete} className="text-emerald-500 hover:underline">Bulk Complete</button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-[#13141c] rounded-full overflow-hidden border border-[#2a2b36]">
        <div className={`h-full transition-all ${isAutoCompleted ? 'bg-teal-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 font-mono">
        <span>{items.filter(i => i.done).length}/{items.length} Completed</span>
        <span>{progress}%</span>
      </div>

      {/* Items List */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item, index) => (
          <div key={item.id} className={`flex flex-col gap-1.5 bg-[#2a2b36]/30 p-2 rounded-xl border ${item.done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#2a2b36] hover:border-[#3f3f46]'}`}>
            <div className="flex items-center gap-2">
              <button onClick={() => updateItem(item.id, { done: !item.done })} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-500'}`}>
                {item.done && <CheckSquare className="w-3 h-3" />}
              </button>
              <input 
                className={`flex-1 bg-transparent text-sm focus:outline-none ${item.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}
                value={item.text} onChange={(e) => updateItem(item.id, { text: e.target.value })} placeholder="Item description..."
              />
              <div className="flex flex-col gap-0.5">
                 <button onClick={() => moveItem(index, -1)} className="text-gray-500 hover:text-white"><ArrowUp className="w-3 h-3" /></button>
                 <button onClick={() => moveItem(index, 1)} className="text-gray-500 hover:text-white"><ArrowDown className="w-3 h-3" /></button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400 px-1">&times;</button>
            </div>
            
            {/* Item Meta */}
            <div className="flex items-center gap-1.5 pl-6">
              <input 
                type="date" className="text-[10px] bg-[#13141c] text-gray-400 border border-[#2a2b36] rounded px-1 py-0.5 focus:outline-none focus:border-emerald-500 w-24"
                value={item.date || ''} onChange={(e) => updateItem(item.id, { date: e.target.value })} 
              />
              <div className="flex items-center text-[10px] bg-[#13141c] text-gray-400 border border-[#2a2b36] rounded px-1 py-0.5 w-20">
                <User className="w-3 h-3 mr-1 text-emerald-500" />
                <input 
                  type="text" placeholder="@user" className="bg-transparent focus:outline-none w-full"
                  value={item.assignee || ''} onChange={(e) => updateItem(item.id, { assignee: e.target.value })} 
                />
              </div>
              <select 
                className="text-[10px] bg-[#13141c] border border-[#2a2b36] rounded px-1 py-0.5 text-gray-400 focus:outline-none"
                value={item.priority || 'Medium'} onChange={(e) => updateItem(item.id, { priority: e.target.value })}
              >
                <option value="Low">Low</option><option value="Medium">Med</option><option value="High">High</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={addItem} className="flex items-center text-xs text-emerald-500 hover:text-emerald-400 py-1">
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
      </button>

      {isAutoCompleted && (
        <div className="text-[10px] text-center text-teal-400 bg-teal-500/10 py-1 rounded border border-teal-500/20 font-bold tracking-wide flex items-center justify-center">
          <Layers className="w-3 h-3 mr-1" /> SYNCED WITH PARENT TASK
        </div>
      )}
    </div>
  );
};

export default createTaskNode({
  label: 'Task Checklist',
  accentColor: '#10b981',
  icon: <CheckSquare className="w-4 h-4 text-white" />,
  width: 'w-[360px]'
}, TaskChecklistBody);
