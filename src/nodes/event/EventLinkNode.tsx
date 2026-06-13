import React from 'react';
import { Link as LinkIcon, ExternalLink, Activity, Link2 } from 'lucide-react';
import { createEventNode } from '../shared/BaseEventNode';

const EventLinkBody = ({ task, updateTask }: any) => {
  const url = task.url || '';
  const title = task.title || '';
  const linkType = task.linkType || 'Reference';
  const linkedEvent = task.linkedEvent || '';
  
  const isValidUrl = url.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
  
  // Fake health check logic for UI purposes
  const healthStatus = url ? (isValidUrl ? 'Healthy' : 'Broken') : 'Empty';

  return (
    <div className="space-y-3">
      {/* Type & Linked Event */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1 text-gray-300 focus:outline-none focus:border-amber-500 w-1/2"
          value={linkType} onChange={(e) => updateTask({ linkType: e.target.value })}
        >
          {['Meeting', 'Documentation', 'Registration', 'Drive', 'Reference'].map(t => <option key={t}>{t}</option>)}
        </select>
        <div className="flex items-center text-xs bg-[#2a2b36]/50 rounded-md px-2 py-1 border border-[#2a2b36] w-1/2">
          <Link2 className="w-3 h-3 text-blue-400 mr-1 shrink-0" />
          <input 
            type="text" placeholder="Linked Event..." 
            className="w-full bg-transparent focus:outline-none text-gray-300"
            value={linkedEvent} onChange={(e) => updateTask({ linkedEvent: e.target.value })} 
          />
        </div>
      </div>

      {/* URL Input & Open Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-amber-500 transition-colors">
          {isValidUrl && url ? (
            <img src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`} alt="favicon" className="w-4 h-4 mr-2 rounded-sm" />
          ) : (
            <LinkIcon className="w-4 h-4 text-gray-500 mr-2" />
          )}
          <input 
            type="text" placeholder="https://..." 
            className="w-full bg-transparent focus:outline-none text-sm text-gray-300"
            value={url} onChange={(e) => updateTask({ url: e.target.value })} 
          />
        </div>
        <button 
          className="p-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors disabled:opacity-50"
          onClick={() => window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')}
          disabled={!isValidUrl || !url}
          title="Open Link"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Notes */}
      <div className="space-y-2 bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
         <input 
            type="text" placeholder="Link Title..." 
            className="w-full text-xs font-medium bg-transparent border-b border-[#2a2b36] pb-1 focus:outline-none focus:border-amber-500 text-gray-200"
            value={title} onChange={(e) => updateTask({ title: e.target.value })} 
          />
         <textarea
            className="w-full text-xs text-gray-400 bg-transparent border-none p-0 focus:outline-none resize-none h-12"
            placeholder="Notes about this link..."
            value={task.notes || ''}
            onChange={(e) => updateTask({ notes: e.target.value })}
          />
      </div>

      {/* Health Check Footer */}
      <div className="flex items-center justify-between text-[10px]">
         <div className={`flex items-center px-2 py-1 rounded ${healthStatus === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' : healthStatus === 'Broken' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'}`}>
           <Activity className="w-3 h-3 mr-1" /> Health: {healthStatus}
         </div>
      </div>
    </div>
  );
};

export default createEventNode({
  label: 'Event Link',
  accentColor: '#f59e0b',
  icon: <LinkIcon className="w-4 h-4 text-white" />
}, EventLinkBody);
