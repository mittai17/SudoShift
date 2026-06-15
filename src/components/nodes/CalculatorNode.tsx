import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Calculator } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

export default function CalculatorNode({ data }: { data: NodeData }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleBtn = (val: string) => {
      if (val === 'C') {
          setDisplay('0');
          setEquation('');
      } else if (val === '=') {
          try {
              // Note: using Function constructor as a safer eval for mathematical operations
              const sanitized = display.replace(/x/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/.()]/g, '');
              const result = new Function('return ' + sanitized)();
              setEquation(display);
              // Handle float precision issues
              setDisplay(String(Math.round(result * 100000000) / 100000000));
          } catch(e) {
              setDisplay('Error');
          }
      } else {
          setDisplay(prev => prev === '0' && val !== '.' ? val : prev === 'Error' ? val : prev + val);
      }
  }

  const buttons = [
    'C', '(', ')', '÷',
    '7', '8', '9', 'x',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=',
  ];

  return (
    <NodeWrapper>
      <div className="flex flex-col w-56 rounded-xl shadow-md bg-zinc-900 border border-zinc-700  transition-shadow hover:shadow-lg nodrag">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-zinc-800 -ml-2 z-10" />
      
      <div className="bg-zinc-800 rounded-t-xl px-3 py-2 flex items-center space-x-2 text-zinc-300 justify-between">
          <div className="flex items-center space-x-2 cursor-grab active:cursor-grabbing w-full">
            <Calculator className="w-4 h-4 opacity-80 pointer-events-none" />
            <h3 className="font-semibold text-xs text-zinc-400 select-none pointer-events-none">Calculator</h3>
          </div>
      </div>
      
      <div className="p-3 flex flex-col space-y-3 cursor-default">
         <div className="bg-zinc-800 rounded-lg p-3 text-right flex flex-col min-h-[5rem] justify-end border border-zinc-700 shadow-inner">
             <div className="text-zinc-500 text-xs truncate mb-1">{equation}</div>
             <div className="text-zinc-100 text-3xl font-mono truncate tracking-tight">{display}</div>
         </div>
         <div className="grid grid-cols-4 gap-2">
             {buttons.map((btn, i) => (
                 <button 
                    key={i} 
                    onClick={() => handleBtn(btn)}
                    className={`p-2.5 text-sm font-medium rounded-lg active:scale-95 transition-all outline-none ${btn === '=' ? 'col-span-2 bg-emerald-500/100 text-white hover:bg-emerald-600 shadow-sm' : btn.match(/[0-9.]/) ? 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600 shadow-sm' : btn === 'C' ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700 shadow-sm'}`}
                 >
                     {btn}
                 </button>
             ))}
         </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-zinc-800 border-2 border-zinc-900 -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
