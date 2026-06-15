import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sigma } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

export default function FormulaNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;

  const [formulas, setFormulas] = useState(
    task.description || 'Budget = 4500\nSpend = 3600\nBudget - Spend'
  );
  const [results, setResults] = useState<React.ReactNode[] | null>(null);
  const [inFlight, setInFlight] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormulas(value);
    if (onChange) {
      onChange(task.id, value);
    }
  };

  const calculate = () => {
    try {
      const lines = formulas.split('\n');

      const vars: Record<string, number> = {};
      const output: React.ReactNode[] = [];

      lines.forEach((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) {
          output.push(<div key={i} className="h-4"></div>);
          return;
        }

        try {
          let expr = '';
          let varName: string | null = null;

          // Assignment
          if (trimmed.includes('=')) {
            const parts = trimmed.split('=');
            if (parts.length !== 2) throw new Error();

            varName = parts[0].trim();
            expr = parts[1].trim();

            // Validate variable name
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
              throw new Error();
            }
          } else {
            expr = trimmed;
          }

          // ✅ SAFE variable replacement (FIXED)
          Object.keys(vars)
            .sort((a, b) => b.length - a.length)
            .forEach((k) => {
              expr = expr.replace(
                new RegExp(`\\b${k}\\b`, 'g'),
                vars[k].toString()
              );
            });

          // ❗ Only allow math characters
          if (/[^0-9+\-*/().\s]/.test(expr)) {
            throw new Error();
          }

          // ✅ FIXED evaluation
          const val = new Function(`return ${expr}`)();
          const rounded = Number(val.toFixed(2));

          if (varName) {
            vars[varName] = rounded;

            output.push(
              <div key={i} className="text-gray-800">
                <span className="text-indigo-600 font-medium">
                  {varName}
                </span>{' '}
                ={' '}
                <span className="font-mono text-emerald-600">
                  {rounded}
                </span>
              </div>
            );
          } else {
            output.push(
              <div key={i} className="text-gray-800">
                <span className="text-gray-500">= </span>
                <span className="font-mono text-emerald-600">
                  {rounded}
                </span>
              </div>
            );
          }
        } catch {
          output.push(
            <div
              key={i}
              className="text-red-500 text-xs shadow-sm bg-red-50 px-1 rounded inline-block mt-0.5 whitespace-nowrap"
            >
              Error in: {line}
            </div>
          );
        }
      });

      return output;
    } catch {
      return <div className="text-red-500 text-xs">Evaluation Error</div>;
    }
  };

  const evaluate = () => {
    setInFlight(true);
    try {
      const out = calculate();
      if (Array.isArray(out)) setResults(out);
      else setResults([out]);
    } finally {
      setInFlight(false);
    }
  };

  // Auto resize textarea
  const onTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  useEffect(() => {
    // initial evaluation
    evaluate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NodeWrapper>
      <div className="relative">
        <Handle
          type="target"
          position={Position.Left}
          className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10"
        />

        <div className="flex flex-col w-72 rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden transition-shadow hover:shadow-lg nodrag">
          
          {/* Header */}
          <div className="bg-[#6366f1] px-3 py-2 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2 cursor-grab active:cursor-grabbing w-full">
              <Sigma className="w-4 h-4 opacity-80 pointer-events-none" />
              <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate select-none pointer-events-none">
                Formulas & Calculations
              </h3>
            </div>
          </div>

          {/* Body */}
          <div className="p-3 bg-white flex flex-col space-y-3 cursor-default">
            
            <textarea
              value={formulas}
              onChange={handleChange}
              onInput={onTextareaInput}
              placeholder="A = 10&#10;B = 20&#10;A + B"
              className="w-full min-h-[60px] bg-gray-50 border border-gray-200 rounded p-2 text-xs font-mono focus:outline-none focus:border-indigo-400 resize-none cursor-text shadow-inner"
              spellCheck={false}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={evaluate}
                disabled={inFlight}
                className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-60"
              >
                Calculate
              </button>
              <button
                onClick={() => {
                  if (onChange) onChange(task.id, formulas);
                }}
                className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setFormulas('');
                  setResults(null);
                  if (onChange) onChange(task.id, '');
                }}
                className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
              >
                Clear
              </button>
            </div>

            <div className="bg-gray-50/80 rounded-lg p-2 min-h-[3rem] text-sm font-mono shadow-inner overflow-x-auto select-text border border-gray-100">
              {results ? results : <div className="text-gray-400 text-xs">No results</div>}
            </div>

          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className="w-4 h-4 bg-[#6366f1] border-2 border-white -mr-2 z-10"
        />
      </div>
    </NodeWrapper>
  );
}
