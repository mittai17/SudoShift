import React, { useState, useEffect } from 'react';
import { Code, Copy, Check, Download, Upload } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

interface JsonTransportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JsonTransportDialog({ isOpen, onClose }: JsonTransportDialogProps) {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const state = {
        nodes: getNodes(),
        edges: getEdges()
      };
      setJsonText(JSON.stringify(state, null, 2));
      setError('');
    }
  }, [isOpen, getNodes, getEdges]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.nodes && parsed.edges) {
        // Option to generate new IDs for nodes if needed, but since it's just import, 
        // n8n allows exact state replication or duplicate if sharing.
        // We'll just replace the entire state.
        setNodes(parsed.nodes);
        setEdges(parsed.edges);
        onClose();
      } else {
        setError('Invalid format: missing "nodes" or "edges" arrays.');
      }
    } catch (err: any) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-fuchsia-600" />
            JSON Transport
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            &times;
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-gray-600 uppercase">Workflow JSON</label>
            <button 
              onClick={handleCopy}
              className="text-xs flex items-center gap-1 text-[#6366f1] hover:text-indigo-700 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy to Clipboard'}
            </button>
          </div>
          
          <textarea
            className="w-full flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] resize-none overflow-auto"
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError('');
            }}
            spellCheck={false}
          />

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <p className="text-xs text-gray-500 mt-2">
            You can copy this JSON to share your workflow, or paste a JSON from another user to import it.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-fuchsia-600 text-white hover:bg-fuchsia-700 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Upload size={16} />
            Import JSON State
          </button>
        </div>
      </div>
    </div>
  );
}
