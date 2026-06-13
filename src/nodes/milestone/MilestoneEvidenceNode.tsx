import React from 'react';
import { Paperclip, Plus, CheckCircle, XCircle, Clock, Link2, FileImage, Sparkles, Upload } from 'lucide-react';
import { createMilestoneNode } from '../shared/BaseMilestoneNode';

interface EvidenceItem { id: string; title: string; type: string; status: string; date: string; url: string; }

const MilestoneEvidenceBody = ({ task, updateTask }: any) => {
  const items: EvidenceItem[] = task.evidenceItems || [];
  
  const updateItems = (newItems: EvidenceItem[]) => updateTask({ evidenceItems: newItems });

  const addItem = () => updateItems([...items, { id: Date.now().toString(), title: '', type: 'Screenshot', status: 'Pending', date: new Date().toISOString().split('T')[0], url: '' }]);
  const updateItem = (id: string, updates: Partial<EvidenceItem>) => updateItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  const removeItem = (id: string) => updateItems(items.filter(i => i.id !== id));

  return (
    <div className="space-y-3">
      {/* Items List */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1.5 bg-[#2a2b36]/30 p-2.5 rounded-xl border border-[#2a2b36] hover:border-[#3f3f46] transition-colors relative group">
            <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
            
            <div className="flex items-center gap-2 pr-6">
              <FileImage className="w-4 h-4 text-rose-400 shrink-0" />
              <input 
                className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none placeholder-gray-600 font-medium border-b border-transparent focus:border-rose-500/50 pb-0.5"
                value={item.title} onChange={(e) => updateItem(item.id, { title: e.target.value })} placeholder="Evidence description..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-1">
              <select 
                className="text-[10px] bg-[#13141c] border border-[#2a2b36] rounded px-1.5 py-1 text-gray-300 focus:outline-none focus:border-rose-500"
                value={item.type} onChange={(e) => updateItem(item.id, { type: e.target.value })}
              >
                {['Screenshot', 'Certificate', 'Report', 'URL', 'GitHub Repository', 'Document'].map(t => <option key={t}>{t}</option>)}
              </select>

              <select 
                className={`text-[10px] border rounded px-1.5 py-1 focus:outline-none font-medium
                  ${item.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                    item.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                    'bg-[#13141c] text-gray-400 border-[#2a2b36]'}`}
                value={item.status} onChange={(e) => updateItem(item.id, { status: e.target.value })}
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Verified">✅ Verified</option>
                <option value="Rejected">❌ Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center text-[10px] text-gray-400 bg-[#13141c] border border-[#2a2b36] rounded px-1.5 py-1 w-24 shrink-0">
                <Clock className="w-3 h-3 mr-1 text-rose-400" />
                <input 
                  type="date" className="bg-transparent focus:outline-none w-full"
                  value={item.date} onChange={(e) => updateItem(item.id, { date: e.target.value })} 
                />
              </div>
              <div className="flex-1 flex items-center text-[10px] bg-[#13141c] border border-[#2a2b36] rounded px-1.5 py-1 text-gray-300">
                 <Link2 className="w-3 h-3 text-blue-400 mr-1 shrink-0" />
                 <input 
                   type="text" placeholder="Source URL..." className="bg-transparent focus:outline-none w-full"
                   value={item.url} onChange={(e) => updateItem(item.id, { url: e.target.value })} 
                 />
              </div>
            </div>
            
            <div className="flex gap-2 mt-1">
              <button className="flex-1 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] py-1 rounded transition-colors border border-blue-500/20">
                Preview Evidence
              </button>
              <button className="flex-1 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] py-1 rounded transition-colors border border-rose-500/20">
                <Sparkles className="w-3 h-3 mr-1" /> AI Summary
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button onClick={addItem} className="flex-1 flex items-center justify-center text-xs bg-[#2a2b36]/50 hover:bg-[#2a2b36] text-rose-400 py-1.5 rounded-lg border border-[#2a2b36] transition-colors">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Evidence Link
        </button>
        <button className="flex-1 flex items-center justify-center text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-1.5 rounded-lg border border-rose-500/20 transition-colors">
          <Upload className="w-3.5 h-3.5 mr-1" /> Upload File
        </button>
      </div>
    </div>
  );
};

export default createMilestoneNode({
  label: 'Milestone Evidence',
  accentColor: '#f43f5e',
  icon: <CheckCircle className="w-4 h-4 text-white" />,
  width: 'w-[380px]'
}, MilestoneEvidenceBody);
