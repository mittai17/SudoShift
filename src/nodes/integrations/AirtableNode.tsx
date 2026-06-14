import { SiAirtable } from 'react-icons/si';
import React, { useState } from 'react';
import { Filter, Table, Table2, Database, Key, AlertCircle, FileText, Download, Loader2 } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const AirtableNodeBody = ({ task, updateTask }: any) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('airtable_api_key') || '');
  

  
  const actionType = task.actionType || 'list';
  const baseId = task.baseId || '';
  const tableName = task.tableName || '';
  const filterFormula = task.filterFormula || '';

  const handleFetch = async () => {
    setError('');
    setResult('');
    setIsFetching(true);

    try {
      const res = await fetch('/api/integrations/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, apiKey, baseId, tableName, filterFormula }),
      });
      const data = await res.json();

      if (!res?.ok && !data?.success && data?.error) {
        throw new Error(data.error || 'API request failed');
      }

      setResult(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      updateTask({ lastResult: data });
    } catch (err: any) {
      setError(err.message || 'Failed to perform action');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Auth Input */}
      <div className="flex items-center gap-2 bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
        <Key className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <input
          type="password"
          placeholder="API Key..."
          className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            localStorage.setItem('airtable_api_key', e.target.value);
          }}
        />
      </div>



      {/* Action Selector */}
      <div className="flex flex-wrap gap-2 text-xs">
         <button 
            onClick={() => updateTask({ actionType: 'list' })}
            className={`flex-1 min-w-[80px] flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'list' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            list
         </button>
         <button 
            onClick={() => updateTask({ actionType: 'create' })}
            className={`flex-1 min-w-[80px] flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'create' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            create
         </button>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-2">
         <div className="flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
            <Database className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
            <input 
               type="text" placeholder="Base ID..."
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
               value={baseId} onChange={(e) => updateTask({ baseId: e.target.value })} 
            />
         </div>
         <div className="flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
            <Table className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
            <input 
               type="text" placeholder="Table Name..."
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
               value={tableName} onChange={(e) => updateTask({ tableName: e.target.value })} 
            />
         </div>
         <div className="flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
            <Filter className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
            <input 
               type="text" placeholder="Filter Formula..."
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
               value={filterFormula} onChange={(e) => updateTask({ filterFormula: e.target.value })} 
            />
         </div>
         <button 
            onClick={handleFetch} disabled={isFetching}
            className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg py-2 transition-colors font-bold disabled:opacity-50 text-xs shadow-lg shadow-cyan-900/20"
            style={{ backgroundColor: '#18BFFF' }}
         >
            {isFetching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Database className="w-4 h-4 mr-2" /> Execute {actionType}</>}
         </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <span className="text-[10px] text-red-300">{error}</span>
        </div>
      )}

      {/* Result Area */}
      <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden">
        <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center justify-between">
          <div className="flex items-center"><FileText className="w-3 h-3 mr-1" /> Output</div>
          {result && (
            <button
              onClick={() => {
                const blob = new Blob([result], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'AirtableNode-result.json';
                a.click();
              }}
              className="hover:text-white" title="Export"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
        <textarea
          className="w-full text-[10px] text-gray-300 font-mono bg-transparent border-none p-3 focus:outline-none resize-none min-h-[80px] custom-scrollbar"
          placeholder={isFetching ? 'Processing...' : 'Result will appear here...'}
          value={result}
          readOnly
        />
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'AirtableNode',
  accentColor: '#18BFFF',
  icon: <SiAirtable className="w-4 h-4 text-white" />,
  width: 'w-[360px]'
}, AirtableNodeBody);
