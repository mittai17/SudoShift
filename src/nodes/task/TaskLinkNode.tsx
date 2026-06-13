import React from 'react';
import { Link as LinkIcon, ExternalLink, Activity, Clock } from 'lucide-react';
import { createTaskNode } from '../shared/BaseTaskNode';

const TaskLinkBody = ({ task, updateTask }: any) => {
  const url = task.url || '';
  const title = task.title || '';
  const linkType = task.linkType || 'Documentation';
  const lastVisited = task.lastVisited || new Date().toISOString();
  
  const isValidUrl = url.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
  const healthStatus = url ? (isValidUrl ? 'Healthy' : 'Broken') : 'Empty';

  const handleOpen = () => {
    updateTask({ lastVisited: new Date().toISOString() });
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* Type Badge */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-emerald-400 font-medium focus:outline-none focus:border-emerald-500 w-full"
          value={linkType} onChange={(e) => updateTask({ linkType: e.target.value })}
        >
          {['Documentation', 'GitHub', 'API', 'Design', 'Resource'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* URL Input & Open Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-emerald-500 transition-colors">
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
          className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors disabled:opacity-50"
          onClick={handleOpen} disabled={!isValidUrl || !url} title="Open Link"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Notes */}
      <div className="space-y-2 bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
         <input 
            type="text" placeholder="Link Title..." 
            className="w-full text-xs font-medium bg-transparent border-b border-[#2a2b36] pb-1 focus:outline-none focus:border-emerald-500 text-gray-200"
            value={title} onChange={(e) => updateTask({ title: e.target.value })} 
          />
         <textarea
            className="w-full text-xs text-gray-400 bg-transparent border-none p-0 focus:outline-none resize-none h-12"
            placeholder="Notes about this link..." value={task.notes || ''} onChange={(e) => updateTask({ notes: e.target.value })}
          />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px]">
         <div className={`flex items-center px-2 py-1 rounded border ${healthStatus === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : healthStatus === 'Broken' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-500/10 text-gray-400 border-[#2a2b36]'}`}>
           <Activity className="w-3 h-3 mr-1" /> Health: {healthStatus}
         </div>
         <div className="flex items-center text-gray-500">
           <Clock className="w-3 h-3 mr-1" /> Visited: {new Date(lastVisited).toLocaleDateString()}
         </div>
      </div>
    </div>
  );
};

export default createTaskNode({
  label: 'Task Link',
  accentColor: '#10b981',
  icon: <LinkIcon className="w-4 h-4 text-white" />
}, TaskLinkBody);
