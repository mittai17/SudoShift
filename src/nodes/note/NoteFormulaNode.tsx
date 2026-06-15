import React, { useState, useCallback } from 'react';
import { FunctionSquare, Calculator, History, Check, AlertCircle, BrainCircuit, Sigma, Wand2 } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';

// Category → ready-made formula template
const CATEGORY_TEMPLATES: Record<string, string> = {
  General: `// BMI Calculator\nWeight = 80\nHeight = 1.75\nWeight / (Height * Height)`,
  Financial: `// Compound Interest\nPrincipal = 10000\nRate = 0.07\nYears = 5\nPrincipal * Math.pow(1 + Rate, Years)`,
  Scientific: `// Kinetic Energy (Joules)\nMass = 70\nVelocity = 15\n0.5 * Mass * Velocity * Velocity`,
  'Unit Conversion': `// Celsius to Fahrenheit\nCelsius = 37\n(Celsius * 9 / 5) + 32`,
  LaTeX: `// Quadratic Formula (discriminant)\na = 1\nb = -3\nc = 2\nMath.sqrt(b*b - 4*a*c)`,
};

function evaluateFormulaSafe(input: string): { result: string; error: string } {
  try {
    const lines = input.split('\n').filter(l => l.trim());
    if (lines.length === 0) return { result: '', error: '' };

    const vars: Record<string, number> = {};
    let lastExpr = '';

    for (const line of lines) {
      const assignMatch = line.match(/^\s*([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const expr = assignMatch[2].trim();
        const fn = new Function(...Object.keys(vars), `return (${expr});`);
        vars[varName] = fn(...Object.values(vars));
        lastExpr = varName;
      } else {
        lastExpr = line.trim();
      }
    }

    if (lastExpr) {
      const fn = new Function(...Object.keys(vars), `return (${lastExpr});`);
      const value = fn(...Object.values(vars));
      const formatted = typeof value === 'number' ? Number(value.toFixed(10)).toString() : String(value);
      return { result: formatted, error: '' };
    }

    return { result: '', error: '' };
  } catch (e: any) {
    return { result: '', error: e.message || 'Syntax Error' };
  }
}

const NoteFormulaBody = ({ task, updateTask }: any) => {
  const formula = task.formula || 'Budget = 5000\nSpend = 1200\nBudget - Spend';
  const category = task.category || 'General';

  const [result, setResult] = useState('3800');
  const [error, setError] = useState('');

  const evaluateFormula = useCallback((val: string) => {
    updateTask({ formula: val });
    const { result: r, error: e } = evaluateFormulaSafe(val);
    setResult(r);
    setError(e);
  }, [updateTask]);

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
                   <span className="text-violet-400 font-bold">= {result}</span>
                   <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                </>
             ) : (
                <span className="text-gray-500">Awaiting input...</span>
             )}
          </div>
      </div>

      {/* Math Tools */}
      <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-2 space-y-2">
         <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest px-1 flex items-center">Math Assistants</div>
         <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1.5 transition-colors">
               <FunctionSquare className="w-3 h-3 mr-1 text-blue-400" /> Explain
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1.5 transition-colors">
               <BrainCircuit className="w-3 h-3 mr-1 text-emerald-400" /> Solve
            </button>
            <button
               onClick={() => {
                 const tpl = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES['General'];
                 evaluateFormula(tpl);
               }}
               className="flex items-center justify-center gap-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded py-1.5 transition-colors font-bold"
            >
               <Wand2 className="w-3 h-3" /> Generate
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
