import React, { useState } from 'react';
import { FunctionSquare, Calculator, History, Check, AlertCircle, Sparkles, BrainCircuit, Sigma } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';

const NoteFormulaBody = ({ task, updateTask }: any) => {
  const formula = task.formula || 'Budget = 5000\\nSpend = 1200\\nBudget - Spend';
  const category = task.category || 'General';

  // Mock basic parsing just for demonstration
  const [result, setResult] = useState('3800');
  const [error, setError] = useState('');

  const evaluateFormula = (val: string) => {
    updateTask({ formula: val });
    try {
      // Very naive mock execution to show "live" feel
      const lines = val.split('\\n');
      const lastLine = lines[lines.length - 1];
      if (lastLine.includes('Budget') && lastLine.includes('Spend')) {
        setResult('3800');
        setError('');
      } else if (lastLine.trim() === '') {
        setResult('');
        setError('');
      } else {
        // Just mock evaluation
        setResult(lastLine + ' (mocked calculation)');
        setError('');
      }
    } catch (e: any) {
      setError(e.message || 'Syntax Error');
      setResult('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Settings / Category */}
      <div className="flex items-center justify-between bg-[#2a2b36]/30 border border-[#2a2b36] rounded-lg p-1.5 focus-within:border-violet-500 transition-colors text-[10px]">
         <div className="flex items-center">
            <Calculator className="w-3.5 h-3.5 text-gray-400 mx-1" />
            <select 
               className="bg-transparent text-gray-300 font-medium focus:outline-none cursor-pointer"
               value={category} onChange={(e) => updateTask({ category: e.target.value })}
            >
               {['General', 'Financial', 'Scientific', 'Unit Conversion', 'LaTeX'].map(l => <option key={l}>{l}</option>)}
            </select>
         </div>
         <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="Variables"><Sigma className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-[#2a2b36] rounded text-gray-400" title="History"><History className="w-3.5 h-3.5" /></button>
         </div>
      </div>

      {/* Editor & Results Area */}
      <div className="bg-[#0d0e15] border border-[#2a2b36] rounded-xl overflow-hidden shadow-inner group flex flex-col focus-within:border-violet-500 transition-colors">
         {/* Editor */}
         <textarea 
            className="w-full text-xs text-gray-300 font-mono bg-transparent border-none p-3 focus:outline-none resize-none min-h-[80px] whitespace-pre custom-scrollbar border-b border-[#2a2b36]" 
            spellCheck="false" value={formula} onChange={(e) => evaluateFormula(e.target.value)} 
         />
         
         {/* Live Result View */}
         <div className="bg-[#1a1b23] p-3 text-xs font-mono min-h-[40px] flex items-center justify-between">
            {error ? (
               <div className="flex items-center text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> {error}
               </div>
            ) : result ? (
               <>
                  <div className="text-gray-400 w-full whitespace-pre-wrap">{formula}\\n<span className="text-violet-400 font-bold">= {result}</span></div>
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
               </>
            ) : (
               <span className="text-gray-500">Awaiting input...</span>
            )}
         </div>
      </div>

      {/* AI Tools */}
      <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-2 space-y-2">
         <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest px-1 flex items-center"><Sparkles className="w-3 h-3 mr-1" /> AI Math Assistants</div>
         <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1.5 transition-colors">
               <FunctionSquare className="w-3 h-3 mr-1 text-blue-400" /> Explain
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1.5 transition-colors">
               <BrainCircuit className="w-3 h-3 mr-1 text-emerald-400" /> Solve
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1.5 transition-colors">
               <Sparkles className="w-3 h-3 mr-1 text-yellow-400" /> Generate
            </button>
         </div>
      </div>
    </div>
  );
};

export default createNoteNode({
  label: 'Note Formula',
  accentColor: '#8b5cf6',
  icon: <FunctionSquare className="w-4 h-4 text-white" />,
  width: 'w-[400px]'
}, NoteFormulaBody);
