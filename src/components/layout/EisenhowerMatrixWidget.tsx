import React, { useState, useRef, useEffect } from 'react';
import {
  Flame, Calendar, Users, Trash2, Loader2, Sparkles,
  ChevronUp, ChevronDown, X, Send, BarChart3, Target,
  Plus, Archive, UserPlus, ClipboardList, RotateCcw
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Quadrant = 'do' | 'decide' | 'delegate' | 'delete';

interface Task {
  text: string;
  quadrant: Quadrant;
}

interface MatrixResult {
  goal: string;
  tasks: Task[];
  recommendations: {
    doNow: string[];
    schedule: string[];
    delegate: string[];
    eliminate: string[];
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EXAMPLE_TASKS: Task[] = [
  { text: 'Fix backend API bugs', quadrant: 'do' },
  { text: 'Create presentation slides', quadrant: 'decide' },
  { text: 'Learn Kubernetes', quadrant: 'decide' },
  { text: 'Design team logo', quadrant: 'delegate' },
  { text: 'Watch random YouTube videos', quadrant: 'delete' },
];

const QUADRANT_CONFIG = {
  do: {
    label: 'DO',
    subtitle: 'Urgent + Important',
    emoji: '🔥',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.25)',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.35)',
    icon: <Flame className="w-3 h-3" />,
  },
  decide: {
    label: 'DECIDE',
    subtitle: 'Important + Not Urgent',
    emoji: '📅',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.25)',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.35)',
    icon: <Calendar className="w-3 h-3" />,
  },
  delegate: {
    label: 'DELEGATE',
    subtitle: 'Urgent + Not Important',
    emoji: '👥',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.25)',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.35)',
    icon: <Users className="w-3 h-3" />,
  },
  delete: {
    label: 'DELETE',
    subtitle: 'Not Urgent + Not Important',
    emoji: '🗑',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.25)',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.35)',
    icon: <Trash2 className="w-3 h-3" />,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuadrantCard({ quadrant, tasks }: { quadrant: Quadrant; tasks: Task[] }) {
  const cfg = QUADRANT_CONFIG[quadrant];
  return (
    <div
      className="flex-1 rounded-xl p-2.5 border transition-all"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border, boxShadow: `0 0 12px ${cfg.glow}` }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{cfg.emoji}</span>
        <div>
          <p className="text-[10px] font-bold leading-tight" style={{ color: cfg.color }}>{cfg.label}</p>
          <p className="text-[8px] text-gray-500 leading-tight">{cfg.subtitle}</p>
        </div>
      </div>
      <div className="space-y-1 min-h-[32px]">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-start gap-1.5 group">
            <div className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: cfg.color }} />
            <p className="text-[9px] text-gray-300 leading-snug">{t.text}</p>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-[9px] text-gray-600 italic">No tasks here</p>
        )}
      </div>
    </div>
  );
}

function RecommendationRow({ label, items, color, icon }: {
  label: string;
  items: string[];
  color: string;
  icon: React.ReactNode;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span style={{ color }}>{icon}</span>
        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
      </div>
      <div className="pl-3 space-y-0.5">
        {items.map((item, i) => (
          <p key={i} className="text-[9px] text-gray-400 leading-snug">• {item}</p>
        ))}
      </div>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';

export function EisenhowerMatrixWidget({ onAddNodes }: { onAddNodes?: (nodes: any[]) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [goal, setGoal] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MatrixResult | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<'input' | 'matrix' | 'recommendations'>('input');
  const [showActions, setShowActions] = useState<string | null>(null);
  const taskRef = useRef<HTMLTextAreaElement>(null);

  // Pre-load with example tasks shown nicely
  const displayTasks: Task[] = result ? result.tasks : EXAMPLE_TASKS;

  const tasksByQuadrant = (q: Quadrant) => displayTasks.filter(t => t.quadrant === q);

  const handleAnalyze = async () => {
    const trimGoal = goal.trim();
    const trimTasks = taskInput.trim();
    if (!trimGoal || !trimTasks) {
      setError('Please enter both a goal and tasks.');
      return;
    }
    setError('');
    setIsLoading(true);
    setView('matrix');

    // MOCK DATA GENERATION: Bypass API and sort tasks visually
    setTimeout(() => {
      const taskLines = trimTasks.split('\n').map(t => t.trim()).filter(Boolean);
      const quadrants: Quadrant[] = ['do', 'decide', 'delegate', 'delete'];
      
      const mockedTasks: Task[] = taskLines.map((text, i) => ({
        text,
        quadrant: quadrants[i % 4] // evenly distribute tasks for visual mockup
      }));

      const mockResult: MatrixResult = {
        goal: trimGoal,
        tasks: mockedTasks,
        recommendations: {
          doNow: ['Start the most urgent task immediately', 'Block out 2 hours of focus time'],
          schedule: ['Put the important but non-urgent tasks on your calendar', 'Set a deadline for next week'],
          delegate: ['Identify a team member to handle this', 'Send an email to assign the task'],
          eliminate: ['Cancel this task entirely', 'Remove from your mental load']
        }
      };

      setResult(mockResult);
      
      // SUPER SHOW: Automatically send the results to the canvas immediately!
      if (onAddNodes) {
        let doCount = 0;
        let decideCount = 0;
        let delegateCount = 0;
        let deleteCount = 0;
        
        const nodesToAdd = mockedTasks.map(t => {
          let matrix = 'DO';
          let description = 'Prioritized: Do Now';
          let deadline: string | null = null;
          let position = { x: 100, y: 100 };
          
          if (t.quadrant === 'do') {
            position = { x: 100 + (doCount * 20), y: 100 + (doCount * 30) };
            doCount++;
          } else if (t.quadrant === 'decide') {
            matrix = 'DECIDE';
            description = 'Prioritized: Schedule';
            deadline = new Date(Date.now() + 86400000 * 2).toISOString();
            position = { x: 500 + (decideCount * 20), y: 100 + (decideCount * 30) };
            decideCount++;
          } else if (t.quadrant === 'delegate') {
            matrix = 'DELEGATE';
            description = 'Prioritized: Delegate';
            position = { x: 100 + (delegateCount * 20), y: 400 + (delegateCount * 30) };
            delegateCount++;
          } else if (t.quadrant === 'delete') {
            matrix = 'DELETE';
            description = 'Prioritized: Delete';
            position = { x: 500 + (deleteCount * 20), y: 400 + (deleteCount * 30) };
            deleteCount++;
          }

          return {
            id: uuidv4(),
            title: `[${matrix}] ${t.text}`,
            description,
            matrix,
            deadline,
            position
          };
        });
        onAddNodes(nodesToAdd);
      }

      setIsLoading(false);
    }, 800); // simulate a slight loading delay for effect
  };

  const handleReset = () => {
    setResult(null);
    setGoal('');
    setTaskInput('');
    setError('');
    setView('input');
  };

  const actionButtons = [
    { id: 'task', label: 'Create Task Node', icon: <ClipboardList className="w-3 h-3" />, color: '#22c55e' },
    { id: 'event', label: 'Create Event Node', icon: <Calendar className="w-3 h-3" />, color: '#3b82f6' },
    { id: 'assign', label: 'Assign Team Member', icon: <UserPlus className="w-3 h-3" />, color: '#f97316' },
    { id: 'archive', label: 'Archive Task', icon: <Archive className="w-3 h-3" />, color: '#8b5cf6' },
  ];

  return (
    <div className="border-t border-[#1e2030] shrink-0">
      <style>{`
        @keyframes em-fadein { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .em-fadein { animation: em-fadein 0.2s ease-out; }
        @keyframes em-pulse { 0%,100% { opacity:0.7; } 50% { opacity:1; } }
        .em-pulse { animation: em-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* ── Toggle Header ─────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#1a1b23] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
          >
            <BarChart3 className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-semibold text-gray-200 leading-tight">Eisenhower Matrix</p>
            <p className="text-[9px] text-gray-500">AI Priority Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {result && (
            <span className="text-[8px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full em-pulse">
              ANALYZED
            </span>
          )}
          {isOpen
            ? <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-colors" />
            : <ChevronUp className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-colors" />
          }
        </div>
      </button>

      {/* ── Expanded Panel ─────────────────────────────────── */}
      {isOpen && (
        <div className="em-fadein bg-[#13141c] max-h-[75vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2b36 transparent' }}>

          {/* Tab switcher */}
          <div className="flex px-3 pt-2 gap-1.5 sticky top-0 bg-[#13141c] pb-2 z-10 border-b border-[#1e2030]">
            {(['input', 'matrix', 'recommendations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className="flex-1 text-[9px] font-semibold py-1 rounded-lg transition-all capitalize"
                style={view === tab
                  ? { background: 'linear-gradient(135deg, #f59e0b22, #ef444422)', color: '#f59e0b', border: '1px solid #f59e0b44' }
                  : { background: 'transparent', color: '#6b7280', border: '1px solid #2a2b36' }
                }
              >
                {tab === 'input' ? 'Input' : tab === 'matrix' ? 'Matrix' : 'Actions'}
              </button>
            ))}
            {result && (
              <button onClick={handleReset} className="p-1 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-[#2a2b36]" title="Reset">
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* ─── INPUT VIEW ──────────────────────────────── */}
          {view === 'input' && (
            <div className="px-3 py-3 space-y-3 em-fadein">
              {/* How it works */}
              <div className="rounded-xl p-2.5 border border-[#2a2b36] bg-[#1a1b23]">
                <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> How It Works
                </p>
                <p className="text-[9px] text-gray-500 leading-relaxed">
                  Enter your goal and list of tasks. AI will categorize them into 4 quadrants based on urgency & importance, then give prioritized recommendations.
                </p>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {(Object.entries(QUADRANT_CONFIG) as [Quadrant, typeof QUADRANT_CONFIG.do][]).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className="text-[10px]">{cfg.emoji}</span>
                      <span className="text-[8px]" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal input */}
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <Target className="w-3 h-3 text-amber-400" /> Goal
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. Launch MVP in 2 weeks"
                  className="w-full bg-[#1a1b23] border border-[#2a2b36] rounded-lg px-2.5 py-2 text-[11px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>

              {/* Tasks input */}
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <ClipboardList className="w-3 h-3 text-amber-400" /> Tasks
                  <span className="text-[8px] text-gray-600 normal-case font-normal ml-1">(one per line)</span>
                </label>
                <textarea
                  ref={taskRef}
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  placeholder={"Fix backend API bugs\nCreate presentation slides\nLearn Kubernetes\nDesign team logo"}
                  className="w-full bg-[#1a1b23] border border-[#2a2b36] rounded-lg px-2.5 py-2 text-[11px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors resize-none leading-relaxed"
                  rows={5}
                />
              </div>

              {error && (
                <p className="text-[9px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-2.5 py-1.5">{error}</p>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[11px] text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
              >
                {isLoading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</>
                  : <><Sparkles className="w-3.5 h-3.5" /> Analyze with AI</>
                }
              </button>
            </div>
          )}

          {/* ─── MATRIX VIEW ─────────────────────────────── */}
          {view === 'matrix' && (
            <div className="px-3 py-3 em-fadein space-y-2">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #f59e0b22, #ef444422)', border: '1px solid #f59e0b44' }}
                  >
                    <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                  </div>
                  <p className="text-[11px] text-gray-400">AI is analyzing your tasks…</p>
                </div>
              )}

              {!isLoading && (
                <>
                  {result?.goal && (
                    <div className="px-2.5 py-2 bg-amber-500/10 rounded-lg border border-amber-500/20 mb-2">
                      <p className="text-[8px] text-amber-400 font-bold uppercase tracking-widest mb-0.5">🎯 Goal</p>
                      <p className="text-[10px] text-gray-200 font-medium leading-snug">{result.goal}</p>
                    </div>
                  )}

                  {/* 2×2 Matrix */}
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <QuadrantCard quadrant="do" tasks={tasksByQuadrant('do')} />
                      <QuadrantCard quadrant="decide" tasks={tasksByQuadrant('decide')} />
                    </div>
                    <div className="flex gap-1.5">
                      <QuadrantCard quadrant="delegate" tasks={tasksByQuadrant('delegate')} />
                      <QuadrantCard quadrant="delete" tasks={tasksByQuadrant('delete')} />
                    </div>
                  </div>

                  {!result && (
                    <p className="text-[9px] text-gray-600 text-center pt-1 italic">
                      Example layout — analyze your tasks to see AI results
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── RECOMMENDATIONS & ACTIONS VIEW ──────────── */}
          {view === 'recommendations' && (
            <div className="px-3 py-3 em-fadein space-y-3">
              {!result ? (
                <div className="text-center py-6">
                  <p className="text-[10px] text-gray-500">Run an analysis first to see AI recommendations.</p>
                  <button
                    onClick={() => setView('input')}
                    className="mt-3 text-[10px] text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2"
                  >
                    Go to Input →
                  </button>
                </div>
              ) : (
                <>
                  {/* AI Recommendations */}
                  <div className="rounded-xl p-2.5 border border-[#2a2b36] bg-[#1a1b23] space-y-2.5">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> AI Recommendations
                    </p>
                    <RecommendationRow
                      label="Do Now"
                      items={result.recommendations.doNow}
                      color={QUADRANT_CONFIG.do.color}
                      icon={<Flame className="w-3 h-3" />}
                    />
                    <RecommendationRow
                      label="Schedule"
                      items={result.recommendations.schedule}
                      color={QUADRANT_CONFIG.decide.color}
                      icon={<Calendar className="w-3 h-3" />}
                    />
                    <RecommendationRow
                      label="Delegate"
                      items={result.recommendations.delegate}
                      color={QUADRANT_CONFIG.delegate.color}
                      icon={<Users className="w-3 h-3" />}
                    />
                    <RecommendationRow
                      label="Eliminate"
                      items={result.recommendations.eliminate}
                      color={QUADRANT_CONFIG.delete.color}
                      icon={<Trash2 className="w-3 h-3" />}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
                    <div className="space-y-1.5">
                      {actionButtons.map(btn => (
                        <button
                          key={btn.id}
                          onClick={() => {
                            setShowActions(showActions === btn.id ? null : btn.id);
                            
                              // Send data to canvas!
                            if (onAddNodes && result) {
                              if (btn.id === 'task') {
                                const doTasks = tasksByQuadrant('do');
                                if (doTasks.length > 0) {
                                  onAddNodes(doTasks.map(t => ({ id: uuidv4(), title: `[DO] ${t.text}`, description: 'Prioritized: Do Now', matrix: 'DO', deadline: null })));
                                }
                              } else if (btn.id === 'event') {
                                const decideTasks = tasksByQuadrant('decide');
                                if (decideTasks.length > 0) {
                                  onAddNodes(decideTasks.map(t => ({ id: uuidv4(), title: `[DECIDE] ${t.text}`, description: 'Prioritized: Schedule', matrix: 'DECIDE', deadline: new Date(Date.now() + 86400000 * 2).toISOString() })));
                                }
                              } else if (btn.id === 'assign') {
                                const delegateTasks = tasksByQuadrant('delegate');
                                if (delegateTasks.length > 0) {
                                  onAddNodes(delegateTasks.map(t => ({ id: uuidv4(), title: `[DELEGATE] ${t.text}`, description: 'Prioritized: Delegate', matrix: 'DELEGATE', deadline: null })));
                                }
                              }
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:scale-[1.01] active:scale-95 text-left"
                          style={{
                            backgroundColor: showActions === btn.id ? `${btn.color}14` : '#1a1b23',
                            borderColor: showActions === btn.id ? `${btn.color}44` : '#2a2b36',
                            color: showActions === btn.id ? btn.color : '#9ca3af',
                          }}
                        >
                          <span style={{ color: btn.color }}>{btn.icon}</span>
                          <span className="text-[10px] font-medium">{btn.label}</span>
                          <Plus className="w-3 h-3 ml-auto" />
                        </button>
                      ))}
                    </div>

                    {showActions && (
                      <div className="mt-2 px-3 py-2.5 rounded-xl bg-[#1a1b23] border border-[#2a2b36] em-fadein">
                        <p className="text-[9px] text-gray-500">
                          {showActions === 'task' && '✅ Drag a task from the matrix to the canvas to create a Task Node automatically.'}
                          {showActions === 'event' && '📅 Select a "Decide" task and schedule it as an Event Node on your canvas.'}
                          {showActions === 'assign' && '👥 Assign a "Delegate" task to a team member by sharing your canvas.'}
                          {showActions === 'archive' && '🗑 Archive "Delete" tasks to keep your canvas clean and focused.'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
