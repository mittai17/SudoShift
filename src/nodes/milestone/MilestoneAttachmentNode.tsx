import React from 'react';
import { Paperclip, Upload, Download, FileText, FileImage, FileVideo, FileArchive, Link2, File, Clock, FolderOpen, History } from 'lucide-react';
import { createMilestoneNode } from '../shared/BaseMilestoneNode';

interface Attachment { id: string; name: string; type: string; size: string; date: string; category: string; version: number; description: string; }

const MilestoneAttachmentBody = ({ task, updateTask }: any) => {
  const attachments: Attachment[] = task.attachments || [];
  const linkedMilestone = task.linkedMilestone || '';

  const updateAttachments = (newAtts: Attachment[]) => updateTask({ attachments: newAtts });

  const addAttachment = () => {
    updateAttachments([...attachments, {
      id: Date.now().toString(), name: 'New_File.pdf', type: 'PDF', size: '1.2 MB', date: new Date().toISOString().split('T')[0], category: 'Design', version: 1, description: ''
    }]);
  };
  
  const updateAttachment = (id: string, updates: Partial<Attachment>) => updateAttachments(attachments.map(a => a.id === id ? { ...a, ...updates } : a));
  const removeAttachment = (id: string) => updateAttachments(attachments.filter(a => a.id !== id));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4 text-red-400" />;
      case 'Image': return <FileImage className="w-4 h-4 text-blue-400" />;
      case 'Video': return <FileVideo className="w-4 h-4 text-purple-400" />;
      case 'ZIP': return <FileArchive className="w-4 h-4 text-yellow-400" />;
      case 'Link': return <Link2 className="w-4 h-4 text-emerald-400" />;
      default: return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Linked Milestone */}
      <div className="flex items-center space-x-2 text-xs bg-[#2a2b36]/50 rounded-md px-2 py-1.5 border border-[#2a2b36]">
        <Link2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <input 
          type="text" placeholder="Linked Milestone..." className="w-full bg-transparent focus:outline-none text-gray-300"
          value={linkedMilestone} onChange={(e) => updateTask({ linkedMilestone: e.target.value })} 
        />
      </div>

      {/* Attachments List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {attachments.map((att) => (
          <div key={att.id} className="flex flex-col gap-2 bg-[#13141c] p-3 rounded-xl border border-[#2a2b36] hover:border-rose-500/50 transition-colors group relative">
            <button onClick={() => removeAttachment(att.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
            
            <div className="flex items-center gap-2 pr-6">
              {getTypeIcon(att.type)}
              <input 
                className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none placeholder-gray-600 font-medium"
                value={att.name} onChange={(e) => updateAttachment(att.id, { name: e.target.value })} placeholder="Filename..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-1">
              <select className="text-[10px] bg-[#2a2b36] border border-[#3f3f46] rounded px-1.5 py-1 text-gray-300 focus:outline-none" value={att.type} onChange={(e) => updateAttachment(att.id, { type: e.target.value })}>
                {['PDF', 'Image', 'Video', 'Document', 'ZIP', 'Link'].map(t => <option key={t}>{t}</option>)}
              </select>
              <div className="flex items-center text-[10px] bg-[#2a2b36] border border-[#3f3f46] rounded px-1.5 py-1 text-gray-300">
                <FolderOpen className="w-3 h-3 mr-1 text-rose-400 shrink-0" />
                <input type="text" placeholder="Category..." className="bg-transparent focus:outline-none w-full" value={att.category} onChange={(e) => updateAttachment(att.id, { category: e.target.value })} />
              </div>
            </div>

            <textarea 
               className="w-full text-xs text-gray-400 bg-transparent border border-transparent focus:border-[#2a2b36] rounded p-1 focus:outline-none resize-none h-8"
               placeholder="Attachment description..." value={att.description} onChange={(e) => updateAttachment(att.id, { description: e.target.value })}
            />

            <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#1a1b23] px-1.5 py-0.5 rounded border border-[#2a2b36]">{att.size}</span>
                <span className="flex items-center bg-[#1a1b23] px-1.5 py-0.5 rounded border border-[#2a2b36]"><Clock className="w-3 h-3 mr-1" />{att.date}</span>
                <span className="flex items-center bg-[#1a1b23] px-1.5 py-0.5 rounded border border-[#2a2b36]"><History className="w-3 h-3 mr-1" />v{att.version}</span>
              </div>
              <button className="flex items-center text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded transition-colors font-medium">
                 <Download className="w-3 h-3 mr-1" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={addAttachment} className="w-full flex items-center justify-center text-xs bg-[#2a2b36]/50 hover:bg-[#2a2b36] text-rose-400 py-2 rounded-xl border border-[#2a2b36] hover:border-rose-500/30 transition-all font-medium">
        <Upload className="w-3.5 h-3.5 mr-1" /> Upload Attachment
      </button>

      <div className="text-[10px] text-center text-gray-500 pt-1">
        {attachments.length} {attachments.length === 1 ? 'Attachment' : 'Attachments'}
      </div>
    </div>
  );
};

export default createMilestoneNode({
  label: 'Milestone Attachment',
  accentColor: '#f43f5e',
  icon: <Paperclip className="w-4 h-4 text-white" />,
  width: 'w-[400px]'
}, MilestoneAttachmentBody);
