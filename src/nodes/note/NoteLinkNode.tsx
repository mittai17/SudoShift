import React from 'react';
import { Link as LinkIcon, ExternalLink, Bookmark, Clock, AlignLeft, ShieldCheck, History } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';

const NoteLinkBody = ({ task, updateTask }: any) => {
  const url = task.url || '';
  const linkType = task.linkType || 'Article';
  const isBookmarked = task.isBookmarked || false;
  
  const isValidUrl = url.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
  
  // Mock fetched metadata
  const title = isValidUrl && url ? task.title || 'The Future of AI Agents in 2026' : '';
  const description = isValidUrl && url ? task.description || 'An exploration into how autonomous agents are reshaping software development.' : '';
  const readTime = isValidUrl && url ? task.readTime || '5 min read' : '';

  const handleOpen = () => {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* Header: Type & Bookmark */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-violet-400 font-medium focus:outline-none focus:border-violet-500 flex-1"
          value={linkType} onChange={(e) => updateTask({ linkType: e.target.value })}
        >
          {['Article', 'Documentation', 'Reference', 'Research', 'Bookmark'].map(t => <option key={t}>{t}</option>)}
        </select>
        <button 
           onClick={() => updateTask({ isBookmarked: !isBookmarked })}
           className={`p-1.5 rounded-md border transition-colors ${isBookmarked ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-[#2a2b36] text-gray-400 border-[#3f3f46] hover:bg-[#3f3f46]'}`}
           title="Bookmark Link"
        >
           <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* URL Input & Open Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-violet-500 transition-colors">
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
          className="p-2.5 bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 rounded-lg transition-colors disabled:opacity-50"
          onClick={handleOpen} disabled={!isValidUrl || !url} title="One Click Open"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-Fetched Link Preview */}
      {isValidUrl && url && (
         <div className="bg-[#2a2b36]/20 border border-[#2a2b36] rounded-xl p-3 space-y-2">
            <h4 className="text-sm font-bold text-gray-200 line-clamp-2 leading-tight">{title}</h4>
            <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
            <div className="flex items-center justify-between text-[10px] font-bold">
               <div className="flex items-center text-violet-500/80">
                  <Clock className="w-3 h-3 mr-1" /> {readTime}
               </div>
               <div className="flex items-center text-emerald-500/80">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Health OK
               </div>
            </div>
         </div>
      )}

      {/* Notes Section */}
      <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-violet-500 transition-colors">
         <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center justify-between">
            <div className="flex items-center"><AlignLeft className="w-3 h-3 mr-1" /> Notes</div>
            <div className="flex items-center text-gray-500 font-normal normal-case tracking-normal">
               <History className="w-3 h-3 mr-1" /> Last Opened: 2h ago
            </div>
         </div>
         <textarea
            className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px] custom-scrollbar"
            placeholder="Why is this link important?..." value={task.notes || ''} onChange={(e) => updateTask({ notes: e.target.value })}
         />
      </div>
    </div>
  );
};

export default createNoteNode({
  label: 'Note Link',
  accentColor: '#8b5cf6',
  icon: <LinkIcon className="w-4 h-4 text-white" />
}, NoteLinkBody);
