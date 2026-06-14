import React, { useState, useRef } from 'react';
import { Bot, Send, Loader2, ArrowRight, Sparkles, ChevronDown, RotateCcw, X, MessageSquareText } from 'lucide-react';
import { fetchAiDumpWorkflow, AiDumpResponse } from '../../lib/aiDumpService';

// Phase colors for the workflow display
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

function PhaseCard({ phase, index }: { phase: { title: string; node: string; purpose: string; instructions: string }; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const color = PHASE_COLORS[index % PHASE_COLORS.length];

  return (
    <div
      className="rounded-lg border transition-all duration-200 overflow-hidden"
      style={{
        backgroundColor: expanded ? color.bgLight : 'transparent',
        borderColor: expanded ? color.border : '#2a2b36',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-white/5"
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ backgroundColor: color.bg }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-gray-200 truncate">{phase.title}</p>
          <p className="text-[9px] font-medium truncate" style={{ color: color.bg }}>{phase.node}</p>
        </div>
        <ChevronDown
          className="w-3 h-3 text-gray-500 shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-1.5" style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
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
}

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [aiDump, setAiDump] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiDumpResponse | null>(null);
  const [aiError, setAiError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAiDump = async () => {
    if (!aiDump.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    try {
      const result = await fetchAiDumpWorkflow(aiDump.trim());
      setAiResult(result);
    } catch (err: any) {
      setAiError(err.message || 'Something went wrong');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiReset = () => {
    setAiResult(null);
    setAiError('');
    setAiDump('');
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 16px rgba(99,102,241,0.5); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .ai-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.08) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-indigo-400/30"
        title="AI Workflow Architect"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-white" />
        )}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#13141c]" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[80vh] flex flex-col bg-[#13141c] border border-[#2a2b36] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2b36] bg-[#1a1b23] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-200 block leading-tight">Workflow Architect</span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] text-indigo-400/70">AI-Powered</span>
                </div>
              </div>
            </div>
            {aiResult && (
              <button
                onClick={handleAiReset}
                className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors rounded-lg hover:bg-[#2a2b36]"
                title="New query"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Body Area */}
          <div className="flex-1 overflow-y-auto bg-[#13141c] relative flex flex-col" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2b36 transparent' }}>
            {/* Input State */}
            {!aiResult && !aiLoading && (
              <div className="flex flex-col h-full justify-end p-4">
                <div className="mb-6 text-center space-y-2">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MessageSquareText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-200">How can I help you?</h3>
                  <p className="text-xs text-gray-500 max-w-[240px] mx-auto leading-relaxed">
                    Describe your goal or problem, and I'll architect a visual workflow for you.
                  </p>
                </div>
                
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={aiDump}
                    onChange={(e) => setAiDump(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAiDump();
                      }
                    }}
                    placeholder="E.g., I want to build a new habit..."
                    className="w-full bg-[#1a1b23] border border-[#2a2b36] rounded-xl p-3 pr-12 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                    style={{ minHeight: '80px' }}
                  />
                  <button
                    className="absolute right-2 bottom-2 p-2 transition-all rounded-lg shadow-sm disabled:opacity-30"
                    style={{
                      backgroundColor: aiDump.trim() ? '#6366f1' : '#2a2b36',
                      color: aiDump.trim() ? 'white' : '#6b7280',
                    }}
                    title="Generate Workflow"
                    disabled={!aiDump.trim()}
                    onClick={handleAiDump}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {aiError && (
                  <p className="text-xs text-red-400 mt-2 text-center">{aiError}</p>
                )}
              </div>
            )}

            {/* Loading State */}
            {aiLoading && (
              <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
                <div className="relative">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <div className="absolute inset-0 rounded-full" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm text-gray-200 font-medium">Architecting workflow...</p>
                  <p className="text-xs text-gray-500">Analyzing nodes & building phases</p>
                </div>
                <div className="w-48 h-1.5 rounded-full bg-[#2a2b36] overflow-hidden mt-2">
                  <div className="h-full rounded-full ai-shimmer" style={{ width: '100%', background: 'linear-gradient(90deg, transparent 0%, #6366f1 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            )}

            {/* Result State */}
            {aiResult && (
              <div className="flex flex-col h-full">
                {/* Goal Banner */}
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-[#2a2b36] shrink-0">
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Goal
                  </p>
                  <p className="text-sm text-gray-100 font-medium leading-snug">{aiResult.goal}</p>
                </div>

                {/* Phases */}
                <div className="p-3 space-y-2 flex-1">
                  {aiResult.phases.map((phase, i) => (
                    <PhaseCard key={i} phase={phase} index={i} />
                  ))}
                </div>

                {/* Connection Flow */}
                {aiResult.connections && aiResult.connections.length > 0 && (
                  <div className="px-4 py-3 border-t border-[#2a2b36] bg-[#1a1b23]/50 shrink-0">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Flow Structure</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {aiResult.connections.map((node, i) => (
                        <React.Fragment key={i}>
                          <span
                            className="text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm"
                            style={{
                              backgroundColor: PHASE_COLORS[i % PHASE_COLORS.length].bgLight,
                              color: PHASE_COLORS[i % PHASE_COLORS.length].bg,
                              border: `1px solid ${PHASE_COLORS[i % PHASE_COLORS.length].border}`,
                            }}
                          >
                            {node}
                          </span>
                          {i < aiResult.connections.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expected Outcome */}
                {aiResult.expectedOutcome && (
                  <div className="px-4 py-3 border-t border-[#2a2b36] bg-emerald-500/5 shrink-0">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Expected Outcome
                    </p>
                    <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">{aiResult.expectedOutcome}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
