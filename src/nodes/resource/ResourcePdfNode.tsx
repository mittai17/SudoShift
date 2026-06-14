import React, { useState } from 'react';
import { FileText, Upload, ChevronLeft, ChevronRight, Search, Bookmark, Highlighter, GraduationCap, AlignLeft, Download } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const ResourcePdfBody = ({ task, updateTask }: any) => {
  const fileUrl = task.fileUrl || '';
  const fileName = task.fileName || '';
  const currentPage = task.currentPage || 1;
  const totalPages = task.totalPages || 1;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateTask({ fileUrl: URL.createObjectURL(file), fileName: file.name });
    }
  };

  return (
    <div className="space-y-3">
      {/* File Upload / Status */}
      <div className="flex items-center gap-2">
         {fileUrl ? (
            <div className="flex-1 flex items-center bg-[#13141c] border border-cyan-500/50 rounded-lg p-2 text-xs">
               <FileText className="w-4 h-4 text-cyan-500 mr-2 shrink-0" />
               <span className="text-gray-200 truncate font-medium">{fileName}</span>
            </div>
         ) : (
            <label className="flex-1 flex items-center justify-center bg-[#2a2b36]/50 hover:bg-[#2a2b36] border border-[#2a2b36] border-dashed rounded-lg p-3 cursor-pointer transition-colors text-xs text-gray-400 hover:text-cyan-400 group">
               <Upload className="w-4 h-4 mr-2 text-gray-500 group-hover:text-cyan-500" /> Upload PDF Document
               <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
            </label>
         )}
      </div>

      {/* PDF Reader Mock */}
      {fileUrl && (
         <div className="border border-[#2a2b36] rounded-xl overflow-hidden bg-[#13141c]">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-[#1a1b23] p-1.5 border-b border-[#2a2b36]">
               <div className="flex items-center gap-1">
                  <button onClick={() => updateTask({ currentPage: Math.max(1, currentPage - 1) })} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-[10px] text-gray-300 font-mono w-12 text-center">{currentPage} / {totalPages}</span>
                  <button onClick={() => updateTask({ currentPage: Math.min(totalPages, currentPage + 1) })} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400"><ChevronRight className="w-4 h-4" /></button>
               </div>
               <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-[#2a2b36] rounded text-gray-400" title="Search"><Search className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-[#2a2b36] rounded text-gray-400" title="Bookmark"><Bookmark className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-[#2a2b36] rounded text-gray-400" title="Highlight"><Highlighter className="w-3.5 h-3.5" /></button>
               </div>
            </div>
            {/* Mock Page Content */}
            <div className="aspect-[1/1.4] bg-white relative p-4 m-2 rounded shadow-sm opacity-90 flex flex-col items-center justify-center text-center">
               <FileText className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-[10px] text-gray-400 max-w-[80%]">PDF rendering requires a heavy library like react-pdf. Upload a PDF to view its metadata.</p>
               <div className="absolute top-4 left-4 right-4 h-2 bg-yellow-200/50 rounded" />
               <div className="absolute top-8 left-4 w-3/4 h-2 bg-gray-200 rounded" />
               <div className="absolute top-12 left-4 w-5/6 h-2 bg-gray-200 rounded" />
            </div>
         </div>
      )}

      {/* PDF Tools */}
      <div className="bg-[#2a2b36]/20 border border-[#2a2b36] rounded-xl p-2 space-y-2">
         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center">PDF Tools</div>
         <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button className="flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <AlignLeft className="w-3 h-3 mr-1" /> Document Summary
            </button>
            <button className="flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <AlignLeft className="w-3 h-3 mr-1" /> Chapter Summary
            </button>
            <button className="flex items-center justify-center bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg py-1.5 transition-colors font-medium">
               Generate Flashcards
            </button>
            <button className="flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg py-1.5 transition-colors font-medium">
               <GraduationCap className="w-3 h-3 mr-1" /> Generate Quiz
            </button>
         </div>
      </div>

      <button className="w-full flex items-center justify-center bg-[#13141c] hover:bg-[#1a1b23] text-gray-300 border border-[#2a2b36] rounded-lg py-1.5 transition-colors text-[10px]">
         <Download className="w-3 h-3 mr-1" /> Extract Notes From PDF
      </button>
    </div>
  );
};

export default createResourceNode({
  label: 'Resource PDF',
  accentColor: '#06b6d4',
  icon: <FileText className="w-4 h-4 text-white" />
}, ResourcePdfBody);
