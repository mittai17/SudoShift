import React from 'react';
import { Video, Clock, FileText, CheckSquare, Download } from 'lucide-react';
import { createEventNode } from '../shared/BaseEventNode';

const extractYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
};

const EventVideoBody = ({ task, updateTask }: any) => {
  const videoId = extractYoutubeId(task.url || '');
  const title = task.extractedTitle || 'Extracted Video Title';
  const duration = task.duration || '45:00';

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <input 
        type="text" placeholder="YouTube URL..." 
        className="w-full text-xs bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus:outline-none focus:border-amber-500 text-gray-300"
        value={task.url || ''} onChange={(e) => updateTask({ url: e.target.value })} 
      />

      {/* Video Preview & Meta */}
      {videoId ? (
        <div className="space-y-2">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#2a2b36]">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}`} 
              className="w-full h-full" allowFullScreen title="Video Preview"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center">
              <Clock className="w-3 h-3 mr-1" /> {duration}
            </div>
          </div>
          <p className="text-sm font-medium text-gray-200 line-clamp-1">{title}</p>
        </div>
      ) : (
        <div className="aspect-video bg-[#2a2b36]/30 border border-[#2a2b36] border-dashed rounded-xl flex items-center justify-center text-xs text-gray-500">
          Paste a YouTube URL above
        </div>
      )}

      {/* Video Tools */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button className="flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg p-1.5 transition-colors">
          Summary
        </button>
        <button className="flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg p-1.5 transition-colors">
          <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Action Items
        </button>
        <button className="flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg p-1.5 transition-colors">
          <FileText className="w-3.5 h-3.5 mr-1.5" /> Extract Notes
        </button>
        <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 border border-[#3f3f46] rounded-lg p-1.5 transition-colors">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Transcript
        </button>
      </div>
    </div>
  );
};

export default createEventNode({
  label: 'Event Meeting Video',
  accentColor: '#f59e0b',
  icon: <Video className="w-4 h-4 text-white" />
}, EventVideoBody);
