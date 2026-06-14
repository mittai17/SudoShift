import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Maximize2, Type, Download, PenTool, Link2, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';

const NoteImageBody = ({ task, updateTask }: any) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const images: string[] = task.images || [];
  const currentIdx = task.currentIdx || 0;
  const caption = task.caption || '';
  const ocrText = task.ocrText || '';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => updateTask({ images: [...images, e.target?.result as string], currentIdx: images.length });
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); updateTask({ currentIdx: (currentIdx + 1) % images.length }); }
  const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); updateTask({ currentIdx: (currentIdx - 1 + images.length) % images.length }); }

  return (
    <div className="space-y-3">
      {/* Image Preview / Upload Area */}
      <div className={`relative rounded-xl border-2 border-dashed ${images.length > 0 ? 'border-transparent bg-black' : 'border-[#2a2b36] hover:border-violet-500 bg-[#2a2b36]/30 cursor-pointer'} overflow-hidden transition-all group ${isZoomed ? 'fixed inset-4 z-50 rounded-none border-0' : 'aspect-video'}`}>
        {images.length === 0 ? (
           <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
              <Upload className="w-8 h-8 text-gray-500 mb-2 group-hover:text-violet-500 transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-violet-400">Upload multiple images</span>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
           </label>
        ) : (
           <>
              <img src={images[currentIdx]} alt="Note" className="w-full h-full object-contain" />
              
              {/* Gallery Controls */}
              {images.length > 1 && (
                 <>
                    <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
                       <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
                       <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-[10px] rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100">
                       <LayoutGrid className="w-3 h-3 mr-1" /> {currentIdx + 1} / {images.length}
                    </div>
                 </>
              )}

              {/* Action Toolbar */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => setIsZoomed(!isZoomed)} className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Toggle Fullscreen">
                    <Maximize2 className="w-4 h-4" />
                 </button>
                 <button className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Copy Image Link">
                    <Link2 className="w-4 h-4" />
                 </button>
                 <button className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Download Image">
                    <Download className="w-4 h-4" />
                 </button>
                 <button className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Annotate Image">
                    <PenTool className="w-4 h-4" />
                 </button>
                 <label className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors cursor-pointer" title="Add another image">
                    <Upload className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </label>
              </div>
           </>
        )}
      </div>

      {/* Caption Field */}
      <input 
        type="text" placeholder="Add a gallery caption..." 
        className="w-full text-xs font-medium bg-transparent border-b border-[#2a2b36] pb-1 focus:outline-none focus:border-violet-500 text-gray-200"
        value={caption} onChange={(e) => updateTask({ caption: e.target.value })} 
      />

      {/* Image Tools */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
         <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded-lg py-1.5 transition-colors">
            <Type className="w-3 h-3 mr-1 text-violet-400" /> Extract Text
         </button>
         <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded-lg py-1.5 transition-colors">
            Describe
         </button>
         <button className="flex items-center justify-center bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded-lg py-1.5 transition-colors font-bold">
            Gen Notes
         </button>
      </div>

      {/* Extracted Text Area */}
      {ocrText && (
         <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 space-y-1">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
               <Type className="w-3 h-3 mr-1" /> OCR Text
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
               {ocrText}
            </p>
         </div>
      )}
    </div>
  );
};

export default createNoteNode({
  label: 'Note Image',
  accentColor: '#8b5cf6',
  icon: <ImageIcon className="w-4 h-4 text-white" />
}, NoteImageBody);
