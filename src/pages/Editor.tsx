import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  ConnectionLineType,
  Panel,
  XYPosition,
  SelectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { differenceInHours, parseISO, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ZoomIn, ZoomOut, Expand, Move, Send, MessageSquare, Users, History, Save, RotateCcw, Share2, Check, MousePointer2, Trash2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

import Sidebar from '../components/layout/Sidebar';
import TaskNode from '../components/nodes/TaskNode';
import NoteNode from '../components/nodes/NoteNode';
import MermaidNode from '../components/nodes/MermaidNode';
import TableNode from '../components/nodes/TableNode';
import ImageNode from '../components/nodes/ImageNode';
import LinkNode from '../components/nodes/LinkNode';
import ChecklistNode from '../components/nodes/ChecklistNode';
import CodeNode from '../components/nodes/CodeNode';
import VideoNode from '../components/nodes/VideoNode';
import WhiteboardNode from '../components/nodes/WhiteboardNode';
import TimerNode from '../components/nodes/TimerNode';
import CalculatorNode from '../components/nodes/CalculatorNode';
import CalendarNode from '../components/nodes/CalendarNode';
import FormulaNode from '../components/nodes/FormulaNode';
import { TaskData } from '../types';
import { getInitialData } from '../data/initialData';

// Constants
const COLORS = ['#ef4444', '#f97316', '#84cc16', '#0ea5e9', '#8b5cf6', '#d946ef'];
const generateUser = () => ({
  id: uuidv4(),
  name: `User_${Math.floor(Math.random() * 1000)}`,
  color: COLORS[Math.floor(Math.random() * COLORS.length)]
});

// Detect conflicts: deadlines within 24 hours of each other
const detectConflicts = (nodes: Node[]): { conflictingNodeIds: Set<string>, conflictEdges: Edge[] } => {
  const tasksWithDates = nodes
    .filter(n => n.type === 'taskNodeType')
    .map(n => n.data.task as TaskData)
    .filter(t => t.deadline);

  const conflictingNodeIds = new Set<string>();
  const conflictEdges: Edge[] = [];

  for (let i = 0; i < tasksWithDates.length; i++) {
    for (let j = i + 1; j < tasksWithDates.length; j++) {
      const t1 = tasksWithDates[i];
      const t2 = tasksWithDates[j];
      
      const d1 = parseISO(t1.deadline!);
      const d2 = parseISO(t2.deadline!);
      
      if (!isValid(d1) || !isValid(d2)) continue;
      
      const hoursDiff = Math.abs(differenceInHours(d1, d2));
      
      // If tasks are due within 24 hours of each other, mark them as conflicting
      if (hoursDiff <= 24) {
        conflictingNodeIds.add(t1.id);
        conflictingNodeIds.add(t2.id);
        
        conflictEdges.push({
          id: `conflict-${t1.id}-${t2.id}`,
          source: t1.id,
          target: t2.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'rgb(239 68 68)', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(239 68 68)' },
        });
      }
    }
  }
  
  return { conflictingNodeIds, conflictEdges };
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { strokeWidth: 2, stroke: '#b1b1b7', strokeDasharray: '5,5' },
};

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView, getViewport, setViewport, flowToScreenPosition, deleteElements } = useReactFlow();
  const [panMode, setPanMode] = useState(false);
  const [searchParams] = useSearchParams();
  const canvasId = searchParams.get('id') || 'default';
  
  // Real-time state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cursors, setCursors] = useState<Record<string, { user: any, position: XYPosition }>>({});
  const [chatOpen, setChatOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [versionName, setVersionName] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [currentUser] = useState(generateUser());
  const [copied, setCopied] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const skipSyncRef = useRef<boolean>(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Setup Socket.IO
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    
    newSocket.on("connect", () => {
      newSocket.emit("join_canvas", { canvasId, user: currentUser });
    });
    
    newSocket.on("init_canvas", (data) => {
      skipSyncRef.current = true;
      if (data && data.nodes && data.nodes.length > 0) {
        setNodes(data.nodes);
        setEdges(data.edges);
      } else if (canvasId === 'default') {
         // Fallback to initial data just for default
         const init = getInitialData();
         setNodes(init.initialNodes);
         setEdges(init.initialEdges);
      }
      setTimeout(() => skipSyncRef.current = false, 500);
    });

    newSocket.on("init_chat", (msgs) => setMessages(msgs || []));
    newSocket.on("new_message", (msg) => setMessages(prev => [...prev, msg]));
    newSocket.on("versions_updated", (vs) => setVersions(vs || []));
    newSocket.on("members_updated", (m) => setMembers(m || []));
    newSocket.on("kicked", () => {
      alert("You have been removed from this canvas.");
      window.location.href = "/";
    });
    
    newSocket.on("cursors_update", (curs: any[]) => {
      const cmap: Record<string, any> = {};
      curs.filter(c => c.id !== newSocket.id).forEach(c => cmap[c.id] = c);
      setCursors(cmap);
    });

    newSocket.on("cursor_moved", (data) => {
      setCursors(prev => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          position: data.position
        }
      }));
    });

    newSocket.on("nodes_updated", (nds) => {
      skipSyncRef.current = true;
      setNodes(nds);
      setTimeout(() => skipSyncRef.current = false, 100);
    });

    newSocket.on("edges_updated", (eds) => {
      skipSyncRef.current = true;
      setEdges(eds);
      setTimeout(() => skipSyncRef.current = false, 100);
    });

    return () => { newSocket.disconnect(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId]);

  // Sync to server
  useEffect(() => {
    if (!skipSyncRef.current && socket) {
      socket.emit("update_nodes", nodes);
    }
  }, [nodes, socket]);

  useEffect(() => {
    if (!skipSyncRef.current && socket) {
      socket.emit("update_edges", edges);
    }
  }, [edges, socket]);

  // Track global mouse moves and broadcast
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (socket) {
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      socket.emit("cursor_move", flowPos);
    }
  }, [socket, screenToFlowPosition]);

  const handleZoomIn = useCallback(() => zoomIn({ duration: 200 }), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut({ duration: 200 }), [zoomOut]);
  const handleFitView = useCallback(() => fitView({ duration: 200 }), [fitView]);

  const hasSelectedElements = nodes.some(n => n.selected) || edges.some(e => e.selected);
  const handleDeleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => e.selected);
    deleteElements({ nodes: selectedNodes, edges: selectedEdges });
  }, [nodes, edges, deleteElements]);

  const handleNoteChange = useCallback((id: string, text: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
           return { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: text } } };
        }
        return n;
      })
    );
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({
    taskNodeType: TaskNode,
    noteNodeType: NoteNode,
    mermaidNodeType: MermaidNode,
    tableNodeType: TableNode,
    imageNodeType: ImageNode,
    linkNodeType: LinkNode,
    checklistNodeType: ChecklistNode,
    codeNodeType: CodeNode,
    videoNodeType: VideoNode,
    whiteboardNodeType: WhiteboardNode,
    timerNodeType: TimerNode,
    calculatorNodeType: CalculatorNode,
    calendarNodeType: CalendarNode,
    formulaNodeType: FormulaNode,
  }), []);

  // Determine user role
  const myRole = useMemo(() => {
    const me = members.find((m: any) => m.user.id === currentUser.id);
    return me?.role || 'editor';
  }, [members, currentUser.id]);

  const onConnect = useCallback(
    (params: any) => {
      if (myRole === 'viewer') return;
      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        style: { stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' }
      }, eds));
    },
    [setEdges, myRole]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (myRole === 'viewer') return;

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { 
          onChange: handleNoteChange,
          task: { 
            id: uuidv4(),
            title: type === 'mermaidNodeType' ? 'Mermaid Diagram' : type === 'tableNodeType' ? 'Table' : type === 'imageNodeType' ? 'Image' : type === 'linkNodeType' ? 'Link' : type === 'checklistNodeType' ? 'Checklist' : type === 'codeNodeType' ? 'Code' : type === 'videoNodeType' ? 'Video' : type === 'whiteboardNodeType' ? 'Whiteboard' : type === 'timerNodeType' ? 'Timer' : type === 'calculatorNodeType' ? 'Calculator' : type === 'calendarNodeType' ? 'Calendar' : type === 'formulaNodeType' ? 'Formulas' : 'Note',
            description: type === 'mermaidNodeType' ? 'graph TD\n  A-->B;' : type === 'checklistNodeType' ? '[{"id":"1","text":"First item","checked":false},{"id":"2","text":"Second item","checked":false}]' : type === 'formulaNodeType' ? 'Budget = 5000\nSpend = 1200\nBudget - Spend' : '',
            matrix: type === 'mermaidNodeType' ? 'MERMAID' : type === 'tableNodeType' ? 'TABLE' : type === 'imageNodeType' ? 'IMAGE' : type === 'linkNodeType' ? 'LINK' : type === 'checklistNodeType' ? 'CHECKLIST' : type === 'codeNodeType' ? 'CODE' : type === 'videoNodeType' ? 'VIDEO' : type === 'whiteboardNodeType' ? 'WHITEBOARD' : type === 'timerNodeType' ? 'TIMER' : type === 'calculatorNodeType' ? 'CALCULATOR' : type === 'calendarNodeType' ? 'CALENDAR' : type === 'formulaNodeType' ? 'FORMULA' : 'NOTE',
            deadline: null,
          } 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, handleNoteChange]
  );

  const handleAddTasks = (newTasks: TaskData[]) => {
    setNodes((nds) => {
      const startX = nds.length > 0 ? 250 : 50;
      const startY = nds.length * 50 + 100;

      const newFlowNodes: Node[] = newTasks.map((t, idx) => ({
        id: t.id,
        type: 'taskNodeType',
        position: { x: startX + idx * 300, y: startY + (idx % 2 === 0 ? 0 : 50) },
        data: { task: t }
      }));

      return [...nds, ...newFlowNodes];
    });
  };

  const handleAddEdges = (newEdges: any[]) => {
    setEdges((eds) => [...eds, ...newEdges.map(e => ({
      ...e,
      type: 'smoothstep',
      style: { stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' }
    }))]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    socket.emit("send_message", chatInput.trim());
    setChatInput('');
  };

  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) return;
    socket.emit("save_version", versionName.trim());
    setVersionName('');
  };

  const handleUpdateRole = (userId: string, role: string) => {
    if (socket) {
      socket.emit("update_member_role", { userId, role });
    }
  };

  const handleKickMember = (userId: string) => {
    if (socket && window.confirm("Are you sure you want to remove this member from the canvas?")) {
      socket.emit("kick_member", userId);
    }
  };

  const handleRestoreVersion = (versionId: string) => {
    if (socket && window.confirm("Are you sure you want to restore this version? Current unsaved progress will be written as a version, but it's best to save manual before restoring.")) {
      socket.emit("restore_version", versionId);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (nodes.length === 0) return;
    
    // Skip collision recalculation if skipSync is active helps with remote flickering, but local depends on it.
    if (skipSyncRef.current) return;
    
    const { conflictingNodeIds, conflictEdges } = detectConflicts(nodes);
    
    const ndsCopy = [...nodes];
    let changed = false;
    for (let i = 0; i < ndsCopy.length; i++) {
        const n = ndsCopy[i];
        if (n.type === 'taskNodeType') {
          const t = n.data.task as TaskData;
          const isConflicting = conflictingNodeIds.has(n.id);
          if (t.isConflicting !== isConflicting) {
            ndsCopy[i] = { ...n, data: { ...n.data, task: { ...t, isConflicting } } };
            changed = true;
          }
        }
    }
    if (changed) setNodes(ndsCopy);

    setEdges((eds) => {
      const nonConflictEdges = eds.filter(e => !e.id.startsWith('conflict-'));
      return [...nonConflictEdges, ...conflictEdges];
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      {/* Editor Header Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 z-10 shadow-sm shrink-0">
        <div className="flex items-center space-x-3">
          <Link to="/" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="font-semibold text-sm">Workspace</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2 mr-2">
            <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center bg-gray-100 text-[10px] font-bold shadow-sm" style={{ backgroundColor: currentUser.color, color: 'white' }}>
              YOU
            </div>
            {Object.values(cursors).slice(0, 3).map((c: any) => (
              <div key={c.user.id} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center bg-gray-100 text-[10px] font-bold shadow-sm" style={{ backgroundColor: c.user.color, color: 'white' }} title={c.user.name}>
                {c.user.name.substring(0, 1).toUpperCase()}
              </div>
            ))}
            {Object.keys(cursors).length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center bg-gray-200 text-[10px] font-bold shadow-sm text-gray-600">
                +{Object.keys(cursors).length - 3}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setMembersModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Members</span>
          </button>
          
          <button 
            onClick={handleShare}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-[#6366f1] text-white hover:bg-indigo-600 border border-transparent'}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden md:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>
          
          <button 
            onClick={() => { setHistoryOpen(!historyOpen); setChatOpen(false); }}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${historyOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">History</span>
          </button>
          
          <button 
            onClick={() => { setChatOpen(!chatOpen); setHistoryOpen(false); }}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chatOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden bg-[#f8fafc] font-sans text-gray-900 relative">
        <Sidebar onAddNodes={handleAddTasks} onAddEdges={handleAddEdges} />
        
        <div className="flex-1 h-full relative p-2 md:p-4 pb-0">
          <div className="w-full h-full bg-white rounded-t-xl rounded-tr-none md:rounded-xl shadow-inner border border-gray-200 overflow-hidden relative" onDrop={onDrop} onDragOver={onDragOver} onPointerMove={handlePointerMove}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              connectionLineType={ConnectionLineType.SmoothStep}
              panOnScroll={true}
              panOnDrag={panMode ? true : [1, 2]} // drag middle click or pan mode enabled
              selectionOnDrag={!panMode}
              selectionMode={SelectionMode.Partial}
              fitView
              minZoom={0.1}
              maxZoom={2}
            >
              <Background color="#64748b" variant={BackgroundVariant.Dots} gap={24} size={3} />
              
              <Panel position="top-right" className="bg-white shadow-md rounded-lg p-1.5 border border-gray-200 flex items-center space-x-1 z-10 m-4">
                <button 
                  onClick={() => setPanMode(false)} 
                  className={`p-2 rounded transition-colors ${!panMode ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Select Tool (Marquee)"
                >
                  <MousePointer2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPanMode(true)} 
                  className={`p-2 rounded transition-colors ${panMode ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Hand Tool (Pan)"
                >
                  <Move className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button onClick={handleZoomIn} className="p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="Zoom In">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={handleZoomOut} className="p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="Zoom Out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button onClick={handleFitView} className="p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="Fit View">
                  <Expand className="w-4 h-4" />
                </button>
                {hasSelectedElements && (
                  <>
                    <div className="w-px h-5 bg-gray-300 mx-1"></div>
                    <button onClick={handleDeleteSelected} className="p-2 rounded text-red-500 hover:bg-red-50 transition-colors" title="Delete Selected">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </Panel>

              <MiniMap 
                nodeColor={(node) => {
                  const task = node.data.task as TaskData;
                  if (task?.isConflicting) return '#ef4444';
                  if (node.type === 'noteNodeType') return '#ff6d5a';
                  if (node.type === 'mermaidNodeType') return '#8b5cf6';
                  if (node.type === 'tableNodeType') return '#10b981';
                  if (node.type === 'imageNodeType') return '#f59e0b';
                  if (node.type === 'linkNodeType') return '#3b82f6';
                  if (node.type === 'checklistNodeType') return '#ec4899';
                  if (node.type === 'codeNodeType') return '#6b7280';
                  if (node.type === 'videoNodeType') return '#ef4444';
                  if (node.type === 'whiteboardNodeType') return '#a855f7';
                  if (node.type === 'timerNodeType') return '#f43f5e';
                  if (node.type === 'calculatorNodeType') return '#18181b';
                  if (node.type === 'calendarNodeType') return '#0ea5e9';
                  if (node.type === 'formulaNodeType') return '#6366f1';
                  switch (task?.matrix) {
                    case 'DO': return '#12b886';
                    case 'DECIDE': return '#228be6';
                    case 'DELEGATE': return '#fab005';
                    case 'DELETE': return '#fa5252';
                    default: return '#868e96';
                  }
                }}
                maskColor="rgba(248, 250, 252, 0.6)"
                className="rounded-lg shadow-md border border-gray-200"
              />
            </ReactFlow>

            {/* Remote Cursors Overlay */}
            {Object.entries(cursors).map(([id, data]: [string, any]) => {
              if (!data.position) return null;
              const sp = flowToScreenPosition(data.position);
              return (
                <div 
                  key={id} 
                  className="absolute pointer-events-none z-50 flex items-center justify-center transition-all duration-75 ease-linear"
                  style={{ transform: `translate(${sp.x}px, ${sp.y}px)`, left: 0, top: 0 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={data.user.color} xmlns="http://www.w3.org/2000/svg" className="absolute -left-1 -top-1" style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.2))' }}>
                    <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.42c.45 0 .67-.54.35-.85L6.35 3.32a.5.5 0 0 0-.85.35z"/>
                  </svg>
                  <div className="absolute top-5 left-5 bg-white text-xs px-2 py-0.5 rounded shadow-sm font-semibold truncate border whitespace-nowrap" style={{ color: data.user.color, borderColor: data.user.color }}>
                    {data.user.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Sidebar */}
        {chatOpen && (
          <div className="w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col z-20 h-full animate-in slide-in-from-right-8 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
              <div className="flex items-center space-x-2 text-indigo-900 font-semibold">
                <Users className="w-5 h-5 text-indigo-500" />
                <span>Team Chat</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-10">
                    No messages yet. Start collaborating!
                  </div>
               ) : (
                 messages.map(msg => {
                   const isMe = msg.user.id === currentUser.id;
                   return (
                     <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                       {!isMe && <span className="text-[10px] text-gray-500 font-semibold mb-1 ml-1">{msg.user.name}</span>}
                       <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMe ? 'bg-[#6366f1] text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'}`}>
                         {/* Basic mention highlight matching */}
                         {msg.text.split(' ').map((word: string, i: number) => {
                           if (word.startsWith('@')) {
                              return <span key={i} className={`font-bold ${isMe ? 'text-indigo-200' : 'text-indigo-600'}`}>{word} </span>
                           }
                           return word + ' ';
                         })}
                       </div>
                     </div>
                   );
                 })
               )}
               <div ref={chatBottomRef} />
            </div>

            <div className="p-3 border-t border-gray-200 bg-white shrink-0">
               <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={e => setChatInput(e.target.value)}
                   placeholder="Type a message or @mention..."
                   className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                 />
                 <button type="submit" disabled={!chatInput.trim()} className="bg-[#6366f1] text-white p-2 rounded-full hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                   <Send className="w-4 h-4 ml-0.5" />
                 </button>
               </form>
            </div>
          </div>
        )}

        {/* History Sidebar */}
        {historyOpen && (
          <div className="w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col z-20 h-full animate-in slide-in-from-right-8 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
              <div className="flex items-center space-x-2 text-indigo-900 font-semibold">
                <History className="w-5 h-5 text-indigo-500" />
                <span>Version History</span>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {versions.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-10">
                    No versions saved yet. Save a state below.
                  </div>
               ) : (
                 versions.map(v => (
                   <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-semibold text-sm text-gray-900">{v.name}</h4>
                       <span className="text-[10px] text-gray-500 ml-2 shrink-0">{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                     <div className="flex items-center space-x-2 mb-3">
                       <div className="w-4 h-4 rounded-full" style={{ backgroundColor: v.author.color }}></div>
                       <span className="text-xs text-gray-600 truncate">{v.author.name}</span>
                     </div>
                     <button
                       onClick={() => handleRestoreVersion(v.id)}
                       className="w-full flex items-center justify-center space-x-2 py-1.5 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
                     >
                       <RotateCcw className="w-3.5 h-3.5" />
                       <span>Restore Version</span>
                     </button>
                   </div>
                 ))
               )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
               <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Save Current State</h3>
               <form onSubmit={handleSaveVersion} className="flex flex-col space-y-2">
                 <input 
                   type="text" 
                   value={versionName}
                   onChange={e => setVersionName(e.target.value)}
                   placeholder="e.g. Added login flow"
                   className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                 />
                 <button type="submit" className="w-full bg-[#6366f1] text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors shadow-sm text-sm font-medium flex items-center justify-center space-x-2">
                   <Save className="w-4 h-4" />
                   <span>Create Snapshot</span>
                 </button>
               </form>
            </div>
          </div>
        )}
      </div>

      {/* Members Modal */}
      {membersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#6366f1]" />
                Manage Members
              </h3>
              <button 
                onClick={() => setMembersModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {members.map(member => {
                  const isCurrentUser = member.user.id === currentUser.id;
                  const currentUserRole = members.find((m: any) => m.user.id === currentUser.id)?.role;
                  const canManage = currentUserRole === 'owner' && !isCurrentUser;

                  return (
                    <div key={member.user.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold shadow-sm relative" 
                          style={{ backgroundColor: member.user.color, color: 'white' }}
                        >
                          {member.user.name.substring(0, 1).toUpperCase()}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {member.user.name} {isCurrentUser && <span className="text-gray-400 font-normal">(You)</span>}
                            </span>
                            {member.role === 'owner' && (
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">Owner</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{member.isOnline ? 'Active now' : 'Offline'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {canManage ? (
                          <select 
                            value={member.role} 
                            onChange={(e) => handleUpdateRole(member.user.id, e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded focus:ring-[#6366f1] focus:border-[#6366f1] p-1.5"
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        ) : (
                          member.role !== 'owner' && <span className="text-xs text-gray-500 capitalize">{member.role}</span>
                        )}
                        
                        {canManage && (
                          <button 
                            onClick={() => handleKickMember(member.user.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove member"
                          >
                            <span className="text-xs font-medium">Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setMembersModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Editor() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
