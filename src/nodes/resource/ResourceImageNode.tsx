import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Maximize2, Type, Download, PenTool, Focus } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const ResourceImageBody = ({ task, updateTask }: any) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const imageUrl = task.imageUrl || '';
  const caption = task.caption || '';
  const ocrText = task.ocrText || '';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => updateTask({ imageUrl: e.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Image Preview / Upload Area */}
      <div className={`relative rounded-xl border-2 border-dashed ${imageUrl ? 'border-transparent bg-black' : 'border-[#2a2b36] hover:border-cyan-500 bg-[#2a2b36]/30 cursor-pointer'} overflow-hidden transition-all group ${isZoomed ? 'fixed inset-4 z-50 rounded-none border-0' : 'aspect-video'}`}>
        {!imageUrl ? (
           <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
              <Upload className="w-8 h-8 text-gray-500 mb-2 group-hover:text-cyan-500 transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-cyan-400">Click to upload image</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
           </label>
        ) : (
           <>
              <img src={imageUrl} alt="Resource" className="w-full h-full object-contain" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => setIsZoomed(!isZoomed)} className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Toggle Zoom">
                    <Maximize2 className="w-4 h-4" />
                 </button>
                 <button className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                 </button>
                 <button className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Annotate (Mock)">
                    <PenTool className="w-4 h-4" />
                 </button>
                 <label className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors cursor-pointer" title="Replace Image">
                    <Upload className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </label>
              </div>
           </>
        )}
      </div>

      {/* Caption Field */}
      <input 
        type="text" placeholder="Add a caption..." 
        className="w-full text-xs font-medium bg-transparent border-b border-[#2a2b36] pb-1 focus:outline-none focus:border-cyan-500 text-gray-200"
        value={caption} onChange={(e) => updateTask({ caption: e.target.value })} 
      />

      {/* Image Tools */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
         <button className="flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg py-1.5 transition-colors font-medium">
            <Type className="w-3 h-3 mr-1" /> Run OCR
         </button>
         <button className="flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 rounded-lg py-1.5 transition-colors font-medium">
            Summary
         </button>
         <button className="flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg py-1.5 transition-colors font-medium">
            <Focus className="w-3 h-3 mr-1" /> Extract Info
         </button>
      </div>

      {/* Extracted Text Area */}
      {ocrText && (
         <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 space-y-1">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
               <Type className="w-3 h-3 mr-1" /> Extracted Text
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
               {ocrText}
            </p>
         </div>
      )}
    </div>
  );
};

export default createResourceNode({
  label: 'Resource Image',
  accentColor: '#06b6d4',
  icon: <ImageIcon className="w-4 h-4 text-white" />
}, ResourceImageBody);
