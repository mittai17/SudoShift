import React, { useState, useMemo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Table as TableIcon, Plus, X, Type, Calculator, ArrowRight, ArrowDown } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

const getColName = (colIndex: number) => {
  let name = '';
  let c = colIndex;
  while (c >= 0) {
    name = String.fromCharCode(65 + (c % 26)) + name;
    c = Math.floor(c / 26) - 1;
  }
  return name;
};

export default function TableNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;

  const [tableData, setTableData] = useState<string[][]>(() => {
    try {
      if (task.description) {
        const parsed = JSON.parse(task.description);
        if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
          return parsed;
        }
      }
    } catch(e) {}
    return [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
  });

  const [activeCell, setActiveCell] = useState<{r: number, c: number} | null>(null);

  const saveAndSet = (newData: string[][]) => {
    setTableData(newData);
    if (onChange) {
      onChange(task.id, JSON.stringify(newData));
    }
  };

  const handleChange = (rIdx: number, cIdx: number, val: string) => {
    const newData = tableData.map((row, i) => 
      i === rIdx ? row.map((col, j) => j === cIdx ? val : col) : row
    );
    saveAndSet(newData);
  };

  const addRow = () => {
    if (tableData.length === 0) return;
    const newRow = Array(tableData[0].length).fill('');
    saveAndSet([...tableData, newRow]);
  };

  const addColumn = () => {
    const newData = tableData.map(row => [...row, '']);
    saveAndSet(newData);
  };

  const removeRow = (rIdx: number) => {
    if (tableData.length <= 1) return;
    const newData = tableData.filter((_, i) => i !== rIdx);
    saveAndSet(newData);
  };

  const removeColumn = (cIdx: number) => {
    if (tableData[0]?.length <= 1) return;
    const newData = tableData.map(row => row.filter((_, j) => j !== cIdx));
    saveAndSet(newData);
  };

  const evaluateCell = useCallback((val: string, visited = new Set<string>()): string => {
    if (!val) return '';
    if (typeof val === 'number') return val;
    if (!val.toString().startsWith('=')) return val;
    
    let expr = val.substring(1).toUpperCase();
    
    // Replace SUM functions
    expr = expr.replace(/SUM\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)/g, (match, start, end) => {
      // Find start col/row and end col/row
      const getCoords = (ref: string) => {
        const colMatch = ref.match(/[A-Z]+/);
        const rowMatch = ref.match(/[0-9]+/);
        if (!colMatch || !rowMatch) return { c: -1, r: -1 };
        
        let c = 0;
        for (let i = 0; i < colMatch[0].length; i++) {
          c = c * 26 + (colMatch[0].charCodeAt(i) - 64);
        }
        return { c: c - 1, r: parseInt(rowMatch[0]) - 1 };
      };
      
      const p1 = getCoords(start);
      const p2 = getCoords(end);
      
      let sum = 0;
      for (let r = Math.min(p1.r, p2.r); r <= Math.max(p1.r, p2.r); r++) {
        for (let c = Math.min(p1.c, p2.c); c <= Math.max(p1.c, p2.c); c++) {
           if (tableData[r] && tableData[r][c] !== undefined) {
             const cellName = `${getColName(c)}${r + 1}`;
             if (!visited.has(cellName)) { // prevent loops
               const ev = evaluateCell(tableData[r][c], new Set([...visited, cellName]));
               const num = parseFloat(ev);
               if (!isNaN(num)) sum += num;
             }
           }
        }
      }
      return sum.toString();
    });

    // Replace cell references A1, B2 etc
    tableData.forEach((row, r) => {
      row.forEach((col, c) => {
        const cellName = `${getColName(c)}${r+1}`;
        if (expr.includes(cellName)) {
           if (visited.has(cellName)) {
             expr = expr.replace(new RegExp(cellName, 'g'), '0'); // loop detection
           } else {
             const ev = evaluateCell(col, new Set([...visited, cellName]));
             const num = parseFloat(ev);
             expr = expr.replace(new RegExp(cellName, 'g'), isNaN(num) ? '0' : num.toString());
           }
        }
      });
    });

    try {
      // simple evaluation using function constructor
      const safeEval = new Function('return ' + expr);
      return String(safeEval());
    } catch(e) {
      return '#ERR';
    }
  }, [tableData]);

  // Evaluated data
  const processedData = useMemo(() => {
    return tableData.map((row, rIndex) => 
      row.map((cell, cIndex) => {
        if (activeCell?.r === rIndex && activeCell?.c === cIndex) return cell; // show raw when editing
        try {
          return evaluateCell(cell);
        } catch(e) {
          return '#ERROR';
        }
      })
    );
  }, [tableData, activeCell, evaluateCell]);

  const activeCellValue = activeCell && tableData[activeCell.r]?.[activeCell.c] !== undefined 
    ? tableData[activeCell.r][activeCell.c] 
    : '';

  return (
    <NodeWrapper>
      <div className="flex flex-col rounded-xl shadow-md bg-[#13141c] border border-[#2a2b36] transition-shadow w-auto min-w-[300px] max-w-3xl font-sans text-gray-800">
        <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
        
        {/* Header Ribbon */}
        <div className="bg-[#10b981] rounded-t-xl px-3 py-2 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <TableIcon className="w-4 h-4 opacity-80" />
            <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm">
              Spreadsheet
            </h3>
          </div>
        </div>

        {/* Formula Bar */}
        <div className="flex items-center border-b border-[#2a2b36] bg-[#1a1b23] px-2 py-1 space-x-2 text-xs">
          <div className="font-mono text-gray-400 bg-[#13141c] border border-[#2a2b36] px-2 py-1 rounded min-w-[3rem] text-center">
            {activeCell ? `${getColName(activeCell.c)}${activeCell.r + 1}` : ''}
          </div>
          <div className="text-gray-400 font-bold px-1 text-sm italic w-5 text-center px-2 border-l border-[#2a2b36] h-4 flex items-center justify-center">
            <span className="opacity-70 mt-0.5">fx</span>
          </div>
          <input 
            type="text"
            className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#10b981] text-xs font-mono"
            placeholder={activeCell ? "Enter value or formula (e.g. =A1+B1 or =SUM(A1:B2))" : "Select a cell to edit"}
            value={activeCellValue}
            disabled={!activeCell}
            onChange={(e) => {
              if (activeCell) handleChange(activeCell.r, activeCell.c, e.target.value);
            }}
          />
        </div>
        
        <div className="px-2 pb-2 mt-2 bg-[#13141c] w-full overflow-x-visible nodrag">
          <div className="border border-[#3f3f46] rounded overflow-visible flex flex-col w-fit bg-gray-100 shadow-sm">
            
            {/* Column Headers */}
            <div className="flex border-b border-[#3f3f46]">
              <div className="w-8 h-6 flex-shrink-0 bg-gray-100 border-r border-[#3f3f46] relative group">
                <button
                  onClick={addRow}
                  className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 bg-emerald-500 text-white rounded p-0.5 shadow z-20 hover:scale-110 transition-transform"
                  title="Add Row"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              {tableData[0]?.map((_, cIdx) => (
                <div key={cIdx} className="w-20 sm:w-24 border-r border-[#3f3f46] flex items-center justify-center text-[10px] font-semibold text-gray-500 relative group cursor-default h-6 select-none shadow-sm pb-[1px]">
                  {getColName(cIdx)}
                  <button
                    onClick={() => removeColumn(cIdx)}
                    className="absolute top-0 right-0 p-[2px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-500 hover:text-white"
                    title="Delete Column"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
              <div 
                className="w-6 flex items-center justify-center cursor-pointer hover:bg-gray-200 text-gray-500 transition-colors bg-[#1a1b23] border-l border-white shadow-sm"
                onClick={addColumn}
                title="Add Column"
              >
                <Plus className="w-3 h-3" />
              </div>
            </div>

            {/* Rows */}
            {tableData.map((row, rIdx) => (
              <div key={rIdx} className="flex border-b border-[#3f3f46] last:border-b-0 relative group">
                {/* Row Header */}
                <div className="w-8 flex-shrink-0 flex items-center justify-center border-r border-[#3f3f46] text-[10px] font-semibold text-gray-500 bg-gray-100 relative select-none h-7 shadow-sm">
                  {rIdx + 1}
                  <button
                    onClick={() => removeRow(rIdx)}
                    className="absolute top-0 left-0 p-[2px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-500 hover:text-white"
                    title="Delete Row"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </div>

                {/* Cells */}
                {row.map((col, cIdx) => {
                  const isActive = activeCell?.r === rIdx && activeCell?.c === cIdx;
                  return (
                    <div 
                      key={cIdx} 
                      className={`w-20 sm:w-24 h-7 border-r border-[#2a2b36] bg-[#13141c] flex last:border-r-0 relative z-10 ${isActive ? 'ring-2 ring-[#10b981] z-20' : 'hover:ring-1 hover:ring-emerald-300'}`}
                      onClick={() => setActiveCell({r: rIdx, c: cIdx})}
                    >
                      <input
                        className={`w-full h-full px-1.5 text-xs focus:outline-none bg-transparent cursor-cell ${isActive ? 'cursor-text' : ''}`}
                        value={processedData[rIdx][cIdx]}
                        onChange={(e) => handleChange(rIdx, cIdx, e.target.value)}
                        onFocus={() => setActiveCell({r: rIdx, c: cIdx})}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between pointer-events-none">
            <span>Try <span className="font-mono bg-gray-100 text-gray-400 px-1 py-[2px] rounded">=SUM(A1:B2)</span> or <span className="font-mono bg-gray-100 text-gray-400 px-1 py-[2px] rounded">=A1+B1</span></span>
          </div>
        </div>

        <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#10b981] border-2 border-white -mr-2 z-10" />
      </div>
    </NodeWrapper>
  );
}
