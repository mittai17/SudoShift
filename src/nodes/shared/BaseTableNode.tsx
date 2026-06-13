import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import Spreadsheet, { Matrix } from 'react-spreadsheet';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface TableConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

interface CellData { value: string; }

const parseTable = (desc: string): Matrix<CellData> => {
  try { 
    const parsed = JSON.parse(desc); 
    if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
      return parsed;
    }
  } catch {}
  return [
    [{ value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }]
  ];
};

export function createTableNode(config: TableConfig) {
  const TableComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [tableData, setTableData] = useState<Matrix<CellData>>(() => parseTable(task.description || ''));

    const handleDataChange = useCallback((newData: Matrix<CellData>) => {
      setTableData(newData);
      if (!nodeId) return;
      
      // Use debounce or just update on blur depending on performance.
      // For now, updating ReactFlow state on every inner change.
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: JSON.stringify(newData) } } }
          : n
      ));
    }, [nodeId, setNodes]);

    const addRow = () => {
      const rowLen = tableData[0]?.length || 3;
      const newRow = Array(rowLen).fill({ value: '' });
      handleDataChange([...tableData, newRow]);
    };

    const addCol = () => {
      const newData = tableData.map(row => [...row, { value: '' }]);
      handleDataChange(newData);
    };

    return (
      <NodeWrapper data={data} selected={selected}>
        <div className="flex flex-col rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-default" style={{ minWidth: 320, maxWidth: 500 }}>
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center justify-between text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <div className="flex items-center space-x-2">
              <span className="opacity-80">{config.icon}</span>
              <h3 className="font-semibold text-sm">{config.label}</h3>
            </div>
            <div className="flex space-x-1 nodrag">
              <button onClick={addCol} className="text-xs hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">+Col</button>
              <button onClick={addRow} className="text-xs hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">+Row</button>
            </div>
          </div>
          <div className="p-2 overflow-auto nodrag max-h-80" onPointerDownCapture={(e) => {
            // Stop propagation to prevent ReactFlow from dragging the node when interacting with the spreadsheet
            e.stopPropagation();
          }}>
            <Spreadsheet data={tableData} onChange={handleDataChange} />
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  TableComponent.displayName = `TableNode_${config.label.replace(/\s/g, '')}`;
  return TableComponent;
}
