import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sigma } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

export default function FormulaNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;
  const [formulas, setFormulas] = useState(task.description || 'Income = 5000\nExpenses = 3200\nProfit = Income - Expenses');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormulas(e.target.value);
    if (onChange) {
      onChange(task.id, e.target.value);
    }
  };

  const calculate = () => {
    try {
      const lines = formulas.split('\n');
      const vars: Record<string, number> = {};
      const output: React.ReactNode[] = [];
      
      lines.forEach((line, i) => {
        if (!line.trim()) {
          output.push(<div key={i} className="h-4"></div>);
          return;
        }
        
        try {
          if (line.includes('=')) {
            const [name, expression] = line.split('=');
            const varName = name.trim();
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) throw new Error("Invalid variable name");
            
            let expr = (expression || '').trim();
            // Replace vars by matching whole words
            Object.keys(vars).sort((a,b) => b.length - a.length).forEach(k => {
               expr = expr.replace(new RegExp(`\\b${k}\\b`, 'g'), vars[k].toString());
            });
            // Safe eval check (only math characters allowed after substitution)
            if (/[^0-9+\-*/().\s]/.test(expr)) throw new Error("Invalid expression");
            
            // eslint-disable-next-line no-new-func
            const val = new Function(`return ${expr}`)() || 0;
            // Limit precision
            const roundedVal = Math.round(val * 100000) / 100000;
            vars[varName] = roundedVal;
            output.push(<div key={i} className="text-gray-800"><span className="text-indigo-600 font-medium">{varName}</span> = <span className="font-mono text-emerald-600">{roundedVal}</span></div>);
          } else {
             let expr = line.trim();
            Object.keys(vars).sort((a,b) => b.length - a.length).forEach(k => {
               expr = expr.replace(new RegExp(`\\b${k}\\b`, 'g'), vars[k].toString());
            });
            if (/[^0-9+\-*/().\s]/.test(expr)) throw new Error("Invalid expression");
            // eslint-disable-next-line no-new-func
            const val = new Function(`return ${expr}`)() || 0;
            const roundedVal = Math.round(val * 100000) / 100000;
            output.push(<div key={i} className="text-gray-800">&gt; <span className="font-mono text-emerald-600">{roundedVal}</span></div>);
          }
        } catch(e) {
          output.push(<div key={i} className="text-red-500 text-xs shadow-sm bg-red-50 px-1 rounded inline-block mt-0.5 whitespace-nowrap">Error in: {line}</div>);
        }
      });
      return output;
    } catch (e) {
      return <div className="text-red-500 text-xs">Evaluation Error</div>;
    }
  }

  // Auto-resize textarea
  const onTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <NodeWrapper>
      <div className="relative">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      <div className="flex flex-col w-72 rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden transition-shadow hover:shadow-lg nodrag">
      
      <div className="bg-[#6366f1] px-3 py-2 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2 cursor-grab active:cursor-grabbing w-full">
            <Sigma className="w-4 h-4 opacity-80 pointer-events-none" />
            <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate select-none pointer-events-none">
            Formulas & Calculations
            </h3>
        </div>
      </div>
      
      <div className="p-3 bg-white flex flex-col space-y-3 cursor-default">
         <textarea
            value={formulas}
            onChange={handleChange}
            onInput={onTextareaInput}
            placeholder="A = 10&#10;B = 20&#10;A + B"
            className="w-full min-h-[60px] bg-gray-50 border border-gray-200 rounded p-2 text-xs font-mono focus:outline-none focus:border-indigo-400 resize-none cursor-text shadow-inner"
            spellCheck={false}
         />
         <div className="bg-gray-50/80 rounded-lg p-2 min-h-[3rem] text-sm font-mono shadow-inner overflow-x-auto select-text border border-gray-100">
            {calculate()}
         </div>
      </div>

      </div>
      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#6366f1] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
