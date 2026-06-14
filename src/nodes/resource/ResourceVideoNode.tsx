import React from 'react';
import { Video, Clock, FileText, CheckSquare, Download, Youtube, FileOutput, Lightbulb, ListTodo } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const extractYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
};

const ResourceVideoBody = ({ task, updateTask }: any) => {
  const videoId = extractYoutubeId(task.url || '');
  const title = task.extractedTitle || 'Extracted Video Title';
  const channel = task.channelName || 'YouTube Channel';
  const duration = task.duration || '45:00';
  const watchProgress = task.watchProgress || 0;

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div className="flex items-center gap-2 bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
         <Youtube className="w-4 h-4 text-red-500 shrink-0" />
         <input 
            type="text" placeholder="YouTube URL..." 
            className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
            value={task.url || ''} onChange={(e) => updateTask({ url: e.target.value })} 
         />
      </div>

      {/* Video Preview & Meta */}
      {videoId ? (
        <div className="space-y-2">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#2a2b36] bg-black shadow-lg">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}`} 
              className="w-full h-full" allowFullScreen title="Video Preview"
            />
            <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center shadow">
              <Clock className="w-3 h-3 mr-1 text-cyan-400" /> {duration}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20">
              <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${watchProgress}%` }} />
            </div>
          </div>
          
          <div className="flex flex-col">
            <p className="text-sm font-bold text-gray-200 line-clamp-1">{title}</p>
            <div className="flex items-center justify-between mt-1">
               <span className="text-[10px] text-gray-400 font-medium">{channel}</span>
               <span className="text-[10px] text-cyan-500 font-bold">{watchProgress}% Watched</span>
            </div>
          </div>
          <input 
            type="range" min="0" max="100" className="w-full accent-cyan-500 h-1"
            value={watchProgress} onChange={(e) => updateTask({ watchProgress: parseInt(e.target.value) })} 
          />
        </div>
      ) : (
        <div className="aspect-video bg-[#2a2b36]/30 border border-[#2a2b36] border-dashed rounded-xl flex items-center justify-center text-xs text-gray-500">
          Paste a YouTube URL above
        </div>
      )}

      {/* Video Tools */}
      <div className="bg-[#2a2b36]/20 border border-[#2a2b36] rounded-xl p-2 space-y-2">
         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center">Video Tools</div>
         <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button className="flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <FileOutput className="w-3 h-3 mr-1" /> Summary
            </button>
            <button className="flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <Lightbulb className="w-3 h-3 mr-1" /> Key Takeaways
            </button>
            <button className="flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <CheckSquare className="w-3 h-3 mr-1" /> Action Items
            </button>
            <button className="flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <FileText className="w-3 h-3 mr-1" /> Extract Notes
            </button>
         </div>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
         <button className="flex items-center justify-center bg-[#13141c] hover:bg-[#1a1b23] text-gray-300 border border-[#2a2b36] rounded-lg py-1.5 transition-colors">
            <ListTodo className="w-3 h-3 mr-1" /> Generate Tasks
         </button>
         <button className="flex items-center justify-center bg-[#13141c] hover:bg-[#1a1b23] text-gray-300 border border-[#2a2b36] rounded-lg py-1.5 transition-colors">
            <Download className="w-3 h-3 mr-1" /> Save Transcript
         </button>
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'Resource Video',
  accentColor: '#06b6d4',
  icon: <Video className="w-4 h-4 text-white" />
}, ResourceVideoBody);
