import React from 'react';
import { Video, Clock, FileText, CheckSquare, Download, Layers } from 'lucide-react';
import { createTaskNode } from '../shared/BaseTaskNode';

const extractYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
};

const TaskVideoBody = ({ task, updateTask }: any) => {
  const videoId = extractYoutubeId(task.url || '');
  const title = task.extractedTitle || 'Extracted Video Title';
  const duration = task.duration || '45:00';
  const watchProgress = task.watchProgress || 0;

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <input 
        type="text" placeholder="YouTube URL..." 
        className="w-full text-xs bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus:outline-none focus:border-emerald-500 text-gray-300"
        value={task.url || ''} onChange={(e) => updateTask({ url: e.target.value })} 
      />

      {/* Video Preview & Meta */}
      {videoId ? (
        <div className="space-y-2">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#2a2b36] bg-black">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}`} 
              className="w-full h-full" allowFullScreen title="Video Preview"
            />
            <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center">
              <Clock className="w-3 h-3 mr-1 text-emerald-400" /> {duration}
            </div>
            {/* Watch Progress Bar mock */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
              <div className="h-full bg-emerald-500" style={{ width: `${watchProgress}%` }} />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-200 line-clamp-1">{title}</p>
            <span className="text-[10px] text-gray-500 font-mono">{watchProgress}% Watched</span>
          </div>
          <input 
            type="range" min="0" max="100" className="w-full accent-emerald-500 h-1"
            value={watchProgress} onChange={(e) => updateTask({ watchProgress: parseInt(e.target.value) })} 
          />
        </div>
      ) : (
        <div className="aspect-video bg-[#2a2b36]/30 border border-[#2a2b36] border-dashed rounded-xl flex items-center justify-center text-xs text-gray-500">
          Paste a YouTube URL above
        </div>
      )}

      {/* Video Tools */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <button className="flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg py-1.5 transition-colors font-medium">
          Summary
        </button>
        <button className="flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg py-1.5 transition-colors font-medium">
          <CheckSquare className="w-3 h-3 mr-1" /> Generate Steps
        </button>
        <button className="flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg py-1.5 transition-colors font-medium">
          <FileText className="w-3 h-3 mr-1" /> Extract Notes
        </button>
        <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 border border-[#3f3f46] rounded-lg py-1.5 transition-colors">
          <Download className="w-3 h-3 mr-1" /> Save Transcript
        </button>
      </div>
    </div>
  );
};

export default createTaskNode({
  label: 'Task Video',
  accentColor: '#10b981',
  icon: <Video className="w-4 h-4 text-white" />
}, TaskVideoBody);
