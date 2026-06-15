import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, Send, Loader2, Sparkles, RotateCcw, X, Plus, Trash2,
  Zap, ChevronDown, MessageSquare, Wand2, History
} from 'lucide-react';
import { sendAiMessage, ChatMessage, CanvasOp, AiDumpResponse } from '../../lib/aiDumpService';
import { v4 as uuidv4 } from 'uuid';

const PHASE_COLORS = [
  { bg: '#f59e0b', bgLight: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  { bg: '#6366f1', bgLight: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
  { bg: '#22c55e', bgLight: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
  { bg: '#0ea5e9', bgLight: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)' },
  { bg: '#ef4444', bgLight: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  { bg: '#f97316', bgLight: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
  { bg: '#8b5cf6', bgLight: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
  { bg: '#ec4899', bgLight: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)' },
];

interface Props {
  canvasId?: string;
  nodes?: any[];
  setNodes?: React.Dispatch<React.SetStateAction<any[]>>;
  setEdges?: React.Dispatch<React.SetStateAction<any[]>>;
}

function WorkflowCard({ workflow }: { workflow: AiDumpResponse }) {
  const [expanded, setExpanded] = useState<number | null>(0);
  return (
    <div className="mt-2 space-y-1.5">
      <div className="px-2.5 py-2 bg-emerald-500/100/10 rounded-lg border border-emerald-500/50/20">
        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Goal
        </p>
        <p className="text-xs text-gray-100 font-medium leading-snug">{workflow.goal}</p>
      </div>
      {workflow.phases.map((phase, i) => {
        const color = PHASE_COLORS[i % PHASE_COLORS.length];
        return (
          <div
            key={i}
            className="rounded-lg border transition-all overflow-hidden"
            style={{ backgroundColor: expanded === i ? color.bgLight : 'transparent', borderColor: expanded === i ? color.border : '#2a2b36' }}
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-[#13141c]/5 transition-colors"
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: color.bg }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-200 truncate">{phase.title}</p>
                <p className="text-[9px] font-medium truncate" style={{ color: color.bg }}>{phase.node}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-500 shrink-0 transition-transform" style={{ transform: expanded === i ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            {expanded === i && (
              <div className="px-2.5 pb-2.5 space-y-1.5">
                <div>
                  <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Why</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{phase.purpose}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Action</p>
                  <p className="text-[10px] text-gray-300 leading-relaxed">{phase.instructions}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {workflow.expectedOutcome && (
        <div className="px-2.5 py-2 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Outcome
          </p>
          <p className="text-[10px] text-emerald-100/90 leading-relaxed">{workflow.expectedOutcome}</p>
        </div>
      )}
    </div>
  );
}

function CanvasOpsPreview({ ops, onApply }: { ops: CanvasOp[], onApply: () => void }) {
  return (
    <div className="mt-2 rounded-lg border border-purple-500/30 bg-purple-500/5 overflow-hidden">
      <div className="px-2.5 py-1.5 bg-purple-500/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Wand2 className="w-3 h-3 text-purple-400" />
          <span className="text-[10px] font-bold text-purple-300">{ops.length} canvas operation{ops.length > 1 ? 's' : ''} ready</span>
        </div>
        <button
          onClick={onApply}
          className="text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-500 px-2 py-0.5 rounded-md transition-colors"
        >
          Apply to Canvas
        </button>
      </div>
      <div className="px-2.5 py-1.5 space-y-0.5">
        {ops.slice(0, 5).map((op, i) => (
          <p key={i} className="text-[9px] text-gray-400">
            {op.op === 'addNode' ? `➕ Add ${op.type}: "${op.title}"` :
              op.op === 'addEdge' ? `🔗 Connect node ${op.from} → node ${op.to}` :
                op.op === 'deleteNode' ? `🗑️ Delete node ${op.nodeId}` :
                  `✏️ Update node`}
          </p>
        ))}
        {ops.length > 5 && <p className="text-[9px] text-gray-500">+{ops.length - 5} more...</p>}
      </div>
    </div>
  );
}

export function AiAssistantWidget({ canvasId = 'default', nodes = [], setNodes, setEdges }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [appliedOps, setAppliedOps] = useState<Set<number>>(new Set());
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const storageKey = `ai_chat_history_${canvasId}`;
  const workflowsStorageKey = `ai_workflows_history_${canvasId}`;

  // Load persisted history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        setMessages(parsed);
      }
      const savedWfs = localStorage.getItem(workflowsStorageKey);
      if (savedWfs) {
        setSavedWorkflows(JSON.parse(savedWfs));
      }
    } catch { /* ignore */ }
  }, [storageKey, workflowsStorageKey]);

  // Persist history on change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Keep last 50 messages
        const toSave = messages.slice(-50);
        localStorage.setItem(storageKey, JSON.stringify(toSave));
      } catch { /* ignore */ }
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, isOpen]);

  const applyCanvasOps = useCallback((ops: CanvasOp[], msgIndex: number) => {
    if (!setNodes || !setEdges) return;
    const newNodeIds: string[] = [];

    setNodes(prev => {
      let updated = [...prev];
      ops.forEach(op => {
        if (op.op === 'addNode') {
          const baseX = 200 + (newNodeIds.length % 4) * 280;
          const baseY = 200 + Math.floor(newNodeIds.length / 4) * 200;
          const id = uuidv4();
          newNodeIds.push(id);
          updated.push({
            id,
            type: op.type || 'note-node',
            position: { x: op.x ?? baseX, y: op.y ?? baseY },
            data: {
              task: {
                id,
                title: op.title || 'AI Node',
                description: op.description || '',
                matrix: (op.type || 'note-node').toUpperCase().replace(/-/g, '_'),
                deadline: null,
              }
            }
          });
        }
      });
      return updated;
    });

    // Add edges after a tick so node IDs are available
    setTimeout(() => {
      setEdges(prev => {
        let updated = [...prev];
        ops.forEach(op => {
          if (op.op === 'addEdge' && op.from !== undefined && op.to !== undefined) {
            const srcId = newNodeIds[op.from];
            const tgtId = newNodeIds[op.to];
            if (srcId && tgtId) {
              updated.push({
                id: uuidv4(),
                source: srcId,
                target: tgtId,
                type: 'smoothstep',
                style: { strokeWidth: 2, stroke: '#6366f1' },
              });
            }
          }
        });
        return updated;
      });
    }, 50);

    setAppliedOps(prev => new Set([...prev, msgIndex]));
  }, [setNodes, setEdges]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const canvasContext = {
        nodeCount: nodes.length,
        nodeTypes: [...new Set(nodes.map((n: any) => n.type).filter(Boolean))],
      };

      const response = await sendAiMessage(text, newHistory, canvasContext);

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        canvasOps: response.canvasOps,
        workflow: response.workflow,
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (response.workflow || (response.canvasOps && response.canvasOps.length > 0)) {
        setSavedWorkflows(prev => {
          const next = [assistantMsg, ...prev].slice(0, 30);
          localStorage.setItem(workflowsStorageKey, JSON.stringify(next));
          return next;
        });
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: `⚠️ ${err.message || 'Something went wrong. Please try again.'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setAppliedOps(new Set());
    localStorage.removeItem(storageKey);
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseGlow { 0%,100% { box-shadow:0 0 8px rgba(99,102,241,0.3); } 50% { box-shadow:0 0 18px rgba(99,102,241,0.55); } }
        .ai-msg-in { animation: fadeSlideIn 0.22s ease-out; }
      `}</style>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-indigo-400/30"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', animation: !isOpen ? 'pulseGlow 3s ease-in-out infinite' : 'none' }}
        title="AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-7 h-7 text-white" />}
        {!isOpen && messages.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500/100 rounded-full border-2 border-[#13141c] flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">{messages.filter(m => m.role === 'assistant').length}</span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-[400px] flex flex-col bg-[#13141c] border border-[#2a2b36] rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 140px)', animation: 'fadeSlideIn 0.25s ease-out' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2b36] bg-[#1a1b23] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-200 block leading-tight">AI Workflow Architect</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400/80">Active · Memory {messages.length > 0 ? 'on' : 'ready'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowHistoryView(!showHistoryView)} className={`p-1.5 transition-colors rounded-lg hover:bg-[#2a2b36] ${showHistoryView ? 'text-emerald-400 bg-[#2a2b36]' : 'text-gray-500 hover:text-gray-300'}`} title="History">
                <History className="w-3.5 h-3.5" />
              </button>
              {messages.length > 0 && !showHistoryView && (
                <button onClick={clearHistory} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-[#2a2b36]" title="Clear history">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors rounded-lg hover:bg-[#2a2b36]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages or History View */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2b36 transparent' }}>
            {showHistoryView ? (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">History</h3>
                {savedWorkflows.length === 0 ? (
                  <div className="text-center text-xs text-gray-500 mt-10">No previous workflows saved yet.</div>
                ) : (
                  savedWorkflows.map((msg, idx) => (
                    <div key={idx} className="bg-[#1a1b23] border border-[#2a2b36] rounded-xl p-3 space-y-2">
                      <p className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleString()}</p>
                      {msg.workflow && <WorkflowCard workflow={msg.workflow} />}
                      {msg.canvasOps && msg.canvasOps.length > 0 && (
                        <CanvasOpsPreview ops={msg.canvasOps} onApply={() => { setShowHistoryView(false); applyCanvasOps(msg.canvasOps!, -1); }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' }}>
                  <Sparkles className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">How can I help you?</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[220px] leading-relaxed">
                    Describe your goal — I'll plan a workflow, create nodes, and build it on your canvas.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                  {['Plan a project', 'Build a habit tracker', 'Create a study workflow'].map(s => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-[10px] px-2 py-1 rounded-full border border-[#2a2b36] text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50/40 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`ai-msg-in flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                    {msg.role === 'user' ? (
                      <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[9px] text-gray-500">AI Architect</span>
                        </div>
                        <div className="bg-[#1a1b23] border border-[#2a2b36] rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        {msg.workflow && <WorkflowCard workflow={msg.workflow} />}
                        {msg.canvasOps && msg.canvasOps.length > 0 && !appliedOps.has(idx) && (
                          <CanvasOpsPreview ops={msg.canvasOps} onApply={() => applyCanvasOps(msg.canvasOps!, idx)} />
                        )}
                        {appliedOps.has(idx) && (
                          <p className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1">
                            <span>✓</span> Applied to canvas
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-[9px] text-gray-400 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && !showHistoryView && (
              <div className="flex justify-start ai-msg-in">
                <div className="bg-[#1a1b23] border border-[#2a2b36] rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#2a2b36] bg-[#1a1b23] shrink-0">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
                className="w-full bg-[#13141c] border border-[#2a2b36] rounded-xl p-3 pr-12 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50/60 transition-all resize-none leading-relaxed"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-1.5 rounded-lg transition-all disabled:opacity-30"
                style={{ backgroundColor: input.trim() ? '#6366f1' : '#2a2b36', color: 'white' }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 mt-1.5 text-center">
              Memory active · {messages.length} message{messages.length !== 1 ? 's' : ''} · Canvas: {nodes.length} node{nodes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
