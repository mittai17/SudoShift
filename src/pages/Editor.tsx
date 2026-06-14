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
import { ArrowLeft, ZoomIn, ZoomOut, Expand, Move, Send, MessageSquare, Users, History, Save, RotateCcw, Share2, Check, MousePointer2, Trash2, Settings, Code, X, Globe, Mail, UserPlus, Link as LinkIcon, LayoutGrid, MoreVertical, Edit2, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabase';

import Sidebar from '../components/layout/Sidebar';
import { Canvas } from '../components/canvas/Canvas';
import { SettingsDialog } from '../components/canvas/SettingsDialog';
import { JsonTransportDialog } from '../components/canvas/JsonTransportDialog';
import { AiAssistantWidget } from '../components/canvas/AiAssistantWidget';
import { TaskData } from '../types';
import { getInitialData } from '../data/initialData';
import { nodeTypes as registryNodeTypes, nodeColorMap, NODE_REGISTRY } from '../nodes/registry/nodeTypes';

// Legacy node imports for backward compat with existing canvas data
import TaskNodeLegacy from '../components/nodes/TaskNode';
import NoteNodeLegacy from '../components/nodes/NoteNode';
import MermaidNodeLegacy from '../components/nodes/MermaidNode';
import TableNodeLegacy from '../components/nodes/TableNode';
import ImageNodeLegacy from '../components/nodes/ImageNode';
import LinkNodeLegacy from '../components/nodes/LinkNode';
import ChecklistNodeLegacy from '../components/nodes/ChecklistNode';
import CodeNodeLegacy from '../components/nodes/CodeNode';
import VideoNodeLegacy from '../components/nodes/VideoNode';
import WhiteboardNodeLegacy from '../components/nodes/WhiteboardNode';
import TimerNodeLegacy from '../components/nodes/TimerNode';
import CalculatorNodeLegacy from '../components/nodes/CalculatorNode';
import CalendarNodeLegacy from '../components/nodes/CalendarNode';
import FormulaNodeLegacy from '../components/nodes/FormulaNode';

// Constants
const COLORS = ['#ef4444', '#f97316', '#84cc16', '#0ea5e9', '#8b5cf6', '#d946ef'];
const colorForUser = (id: string) => COLORS[id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % COLORS.length];

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
  const { user } = useAuth();
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
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [jsonTransportOpen, setJsonTransportOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [canvasName, setCanvasName] = useState('');
  const [isRenamingCanvas, setIsRenamingCanvas] = useState(false);
  const [canvasDarkMode, setCanvasDarkMode] = useState(false);

  // Direct Messaging / Chat Enhancements
  const [activeChatTab, setActiveChatTab] = useState<'team' | 'dm'>('team');
  const [selectedDMUserId, setSelectedDMUserId] = useState<string | null>(null);
  const [lastReadDMTime, setLastReadDMTime] = useState<Record<string, number>>({});
  const [lastReadTeamTime, setLastReadTeamTime] = useState<number>(Date.now());

  // Update last read times
  useEffect(() => {
    if (chatOpen) {
      if (activeChatTab === 'team') {
        setLastReadTeamTime(Date.now());
      } else if (activeChatTab === 'dm' && selectedDMUserId) {
        setLastReadDMTime(prev => ({
          ...prev,
          [selectedDMUserId]: Date.now()
        }));
      }
    }
  }, [chatOpen, activeChatTab, selectedDMUserId, messages]);

  useEffect(() => {
    if (canvasId && canvasId !== 'default') {
      supabase.from('canvases').select('name').eq('id', canvasId).single().then(({ data }) => {
        if (data && data.name) setCanvasName(data.name);
      });
    } else {
      setCanvasName('Local Workspace');
    }
  }, [canvasId]);

  const handleRenameCanvas = async () => {
    if (!canvasName.trim() || canvasId === 'default') {
      setIsRenamingCanvas(false);
      return;
    }
    await supabase.from('canvases').update({ name: canvasName.trim() }).eq('id', canvasId);
    setIsRenamingCanvas(false);
  };

  const currentUser = useMemo(() => ({
    id: user?.id || '',
    name: user?.user_metadata?.full_name || user?.email || 'User',
    email: user?.email,
    color: user?.user_metadata?.avatar_color || colorForUser(user?.id || 'user'),
  }), [user]);

  const unreadTeamCount = useMemo(() => {
    if (chatOpen && activeChatTab === 'team') return 0;
    return messages.filter(m => !m.recipientId && new Date(m.timestamp).getTime() > lastReadTeamTime).length;
  }, [messages, lastReadTeamTime, chatOpen, activeChatTab]);

  const unreadDMCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    messages.forEach(m => {
      if (m.recipientId === currentUser.id) {
        const senderId = m.user.id;
        if (chatOpen && activeChatTab === 'dm' && selectedDMUserId === senderId) return;
        const lastRead = lastReadDMTime[senderId] || 0;
        if (new Date(m.timestamp).getTime() > lastRead) {
          counts[senderId] = (counts[senderId] || 0) + 1;
        }
      }
    });
    return counts;
  }, [messages, lastReadDMTime, currentUser.id, chatOpen, activeChatTab, selectedDMUserId]);

  const totalUnreadDMCount = useMemo(() => {
    return Object.values(unreadDMCounts).reduce((sum, c) => sum + c, 0);
  }, [unreadDMCounts]);

  const formatTime = useCallback((isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }, []);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const skipSyncRef = useRef<boolean>(false);


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Setup Socket.IO
  useEffect(() => {
    let mounted = true;
    let newSocket: Socket | null = null;

    const connectSocket = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token || !mounted) return;

      newSocket = io({ auth: { token } });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket?.emit("join_canvas", { canvasId, user: currentUser });
      });

      newSocket.on("init_canvas", (data) => {
        skipSyncRef.current = true;
        if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
          setNodes(data.nodes);
          setEdges(data.edges || []);
        } else if (data && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
          setEdges(data.edges || []);
        } else if (canvasId === 'default') {
          const init = getInitialData();
          setNodes(init.initialNodes);
          setEdges(init.initialEdges);
        }
        setTimeout(() => skipSyncRef.current = false, 500);
      });

      newSocket.on("init_chat", (msgs) => setMessages(msgs || []));
      newSocket.on("new_message", (msg) => {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      });
      newSocket.on("versions_updated", (vs) => setVersions(vs || []));
      newSocket.on("members_updated", (m) => setMembers(m || []));
      newSocket.on("add_member_success", () => {
        setInviteSuccess(true);
        setInviteEmail('');
        setInviteError('');
        setIsInviting(false);
        setTimeout(() => setInviteSuccess(false), 3000);
      });
      newSocket.on("add_member_error", (err) => {
        setInviteError(err);
        setInviteSuccess(false);
        setIsInviting(false);
      });
      newSocket.on("connect_error", (error) => {
        console.error("Collaboration connection failed:", error.message);
      });
      newSocket.on("kicked", () => {
        alert("You have been removed from this canvas.");
        window.location.href = "/";
      });

      newSocket.on("cursors_update", (curs: any[]) => {
        const cmap: Record<string, any> = {};
        curs.filter(c => c.id !== newSocket?.id).forEach(c => cmap[c.id] = c);
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
    };

    connectSocket();

    return () => {
      mounted = false;
      newSocket?.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, currentUser.id]);

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
    // Legacy node types for backward compatibility
    taskNodeType: TaskNodeLegacy,
    noteNodeType: NoteNodeLegacy,
    mermaidNodeType: MermaidNodeLegacy,
    tableNodeType: TableNodeLegacy,
    imageNodeType: ImageNodeLegacy,
    linkNodeType: LinkNodeLegacy,
    checklistNodeType: ChecklistNodeLegacy,
    codeNodeType: CodeNodeLegacy,
    videoNodeType: VideoNodeLegacy,
    whiteboardNodeType: WhiteboardNodeLegacy,
    timerNodeType: TimerNodeLegacy,
    calculatorNodeType: CalculatorNodeLegacy,
    calendarNodeType: CalendarNodeLegacy,
    formulaNodeType: FormulaNodeLegacy,
    // New hierarchical node types from registry
    ...registryNodeTypes,
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
      if (!type) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      // Look up default data from the central registry
      const registryEntry = NODE_REGISTRY.find((n) => n.id === type);

      const taskData = registryEntry
        ? { id: uuidv4(), ...registryEntry.defaultData }
        : {
          id: uuidv4(),
          title: type === 'mermaidNodeType' ? 'Mermaid Diagram' : type === 'tableNodeType' ? 'Table' : type === 'imageNodeType' ? 'Image' : type === 'linkNodeType' ? 'Link' : type === 'checklistNodeType' ? 'Checklist' : type === 'codeNodeType' ? 'Code' : type === 'videoNodeType' ? 'Video' : type === 'whiteboardNodeType' ? 'Whiteboard' : type === 'timerNodeType' ? 'Timer' : type === 'calculatorNodeType' ? 'Calculator' : type === 'calendarNodeType' ? 'Calendar' : type === 'formulaNodeType' ? 'Formulas' : 'Note',
          description: type === 'mermaidNodeType' ? 'graph TD\n  A-->B;' : type === 'checklistNodeType' ? '[{"id":"1","text":"First item","checked":false}]' : type === 'formulaNodeType' ? 'Budget = 5000\nSpend = 1200\nBudget - Spend' : '',
          matrix: type === 'mermaidNodeType' ? 'MERMAID' : type === 'tableNodeType' ? 'TABLE' : type === 'imageNodeType' ? 'IMAGE' : type === 'linkNodeType' ? 'LINK' : type === 'checklistNodeType' ? 'CHECKLIST' : type === 'codeNodeType' ? 'CODE' : type === 'videoNodeType' ? 'VIDEO' : type === 'whiteboardNodeType' ? 'WHITEBOARD' : type === 'timerNodeType' ? 'TIMER' : type === 'calculatorNodeType' ? 'CALCULATOR' : type === 'calendarNodeType' ? 'CALENDAR' : type === 'formulaNodeType' ? 'FORMULA' : 'NOTE',
          deadline: null,
        };

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { onChange: handleNoteChange, task: taskData },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, handleNoteChange, myRole]
  );

  const handleAddNodeClick = useCallback(
    (type: string) => {
      if (myRole === 'viewer') return;

      const position = screenToFlowPosition({ 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
      });

      const registryEntry = NODE_REGISTRY.find((n) => n.id === type);

      const taskData = registryEntry
        ? { id: uuidv4(), ...registryEntry.defaultData }
        : {
          id: uuidv4(),
          title: type === 'mermaidNodeType' ? 'Mermaid Diagram' : type === 'tableNodeType' ? 'Table' : type === 'imageNodeType' ? 'Image' : type === 'linkNodeType' ? 'Link' : type === 'checklistNodeType' ? 'Checklist' : type === 'codeNodeType' ? 'Code' : type === 'videoNodeType' ? 'Video' : type === 'whiteboardNodeType' ? 'Whiteboard' : type === 'timerNodeType' ? 'Timer' : type === 'calculatorNodeType' ? 'Calculator' : type === 'calendarNodeType' ? 'Calendar' : type === 'formulaNodeType' ? 'Formulas' : 'Note',
          description: type === 'mermaidNodeType' ? 'graph TD\n  A-->B;' : type === 'checklistNodeType' ? '[{"id":"1","text":"First item","checked":false}]' : type === 'formulaNodeType' ? 'Budget = 5000\nSpend = 1200\nBudget - Spend' : '',
          matrix: type === 'mermaidNodeType' ? 'MERMAID' : type === 'tableNodeType' ? 'TABLE' : type === 'imageNodeType' ? 'IMAGE' : type === 'linkNodeType' ? 'LINK' : type === 'checklistNodeType' ? 'CHECKLIST' : type === 'codeNodeType' ? 'CODE' : type === 'videoNodeType' ? 'VIDEO' : type === 'whiteboardNodeType' ? 'WHITEBOARD' : type === 'timerNodeType' ? 'TIMER' : type === 'calculatorNodeType' ? 'CALCULATOR' : type === 'calendarNodeType' ? 'CALENDAR' : type === 'formulaNodeType' ? 'FORMULA' : 'NOTE',
          deadline: null,
        };

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { onChange: handleNoteChange, task: taskData },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, handleNoteChange, myRole]
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
    
    if (activeChatTab === 'dm' && selectedDMUserId) {
      socket.emit("send_message", { text: chatInput.trim(), recipientId: selectedDMUserId });
    } else {
      socket.emit("send_message", chatInput.trim());
    }
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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !socket) return;
    setIsInviting(true);
    setInviteError('');
    setInviteSuccess(false);
    socket.emit("add_member", { email: inviteEmail.trim().toLowerCase(), role: inviteRole });
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
      <div className="flex items-center justify-between px-2 md:px-4 py-2 bg-white border-b border-gray-200 z-10 shadow-sm shrink-0">
        <div className="flex items-center space-x-3">
          <Link to="/" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              if (!sidebarOpen && window.innerWidth < 1024) {
                setChatOpen(false);
                setHistoryOpen(false);
              }
            }}
            className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 flex items-center justify-center border border-slate-200"
            title="Toggle Nodes Panel"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          
          <div className="hidden sm:flex items-center space-x-2">
            {isRenamingCanvas ? (
              <input
                autoFocus
                type="text"
                value={canvasName}
                onChange={e => setCanvasName(e.target.value)}
                onBlur={handleRenameCanvas}
                onKeyDown={e => { if (e.key === 'Enter') handleRenameCanvas(); }}
                className="font-semibold text-sm px-1 py-0.5 border border-indigo-300 rounded outline-none focus:ring-2 focus:ring-indigo-500/20 w-48"
              />
            ) : (
              <div 
                className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 cursor-text transition-colors group"
                onClick={() => setIsRenamingCanvas(true)}
              >
                <h2 className="font-semibold text-sm truncate max-w-[200px]">{canvasName || 'Workspace'}</h2>
                <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2 mr-2">
            <Link to="/profile" className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm hover:scale-110 hover:shadow-md transition-all cursor-pointer block" style={{ backgroundColor: currentUser.color, color: 'white' }} title="Edit Profile">
              YOU
            </Link>
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
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Members</span>
          </button>

          <button
            onClick={handleShare}
            className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-[#6366f1] text-white hover:bg-indigo-600 border border-transparent'}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden md:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={() => {
              setHistoryOpen(!historyOpen);
              setChatOpen(false);
              if (!historyOpen && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${historyOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">History</span>
          </button>

          <button
            onClick={() => {
              setChatOpen(!chatOpen);
              setHistoryOpen(false);
              if (!chatOpen && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${chatOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden md:inline">Chat</span>
            {(unreadTeamCount + totalUnreadDMCount) > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold px-1 shadow-sm">
                {unreadTeamCount + totalUnreadDMCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setJsonTransportOpen(true)}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 border border-fuchsia-200"
          >
            <Code className="w-4 h-4" />
            <span className="hidden md:inline">JSON</span>
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* More Options Dropdown Menu for Mobile */}
          <div className="relative md:hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`p-1.5 rounded-lg transition-colors flex items-center justify-center border ${moreMenuOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'hover:bg-slate-100 text-slate-500 border-slate-200 bg-white'}`}
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {moreMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMoreMenuOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      setMembersModalOpen(true);
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-3 md:py-2.5 text-sm md:text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Members</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleShare();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-3 md:py-2.5 text-sm md:text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                     <span>{copied ? 'Copied' : 'Share Link'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setHistoryOpen(!historyOpen);
                      setChatOpen(false);
                      setMoreMenuOpen(false);
                      if (!historyOpen) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center space-x-2.5 px-4 py-3 md:py-2.5 text-sm md:text-xs font-bold transition-colors ${historyOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                  >
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </button>

                  <button
                    onClick={() => {
                      setJsonTransportOpen(true);
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-3 md:py-2.5 text-sm md:text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    <span>JSON Export</span>
                  </button>

                  <button
                    onClick={() => {
                      setSettingsOpen(true);
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-3 md:py-2.5 text-sm md:text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-[#f8fafc] font-sans text-gray-900 relative">
        {/* Sidebar Backdrop Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={`
          ${sidebarOpen ? 'flex' : 'hidden'} 
          absolute lg:static left-0 top-0 bottom-0 z-35 shrink-0 shadow-2xl lg:shadow-none h-full
        `}>
          <Sidebar 
            onAddNodes={handleAddTasks} 
            onAddEdges={handleAddEdges} 
            onAddNodeClick={handleAddNodeClick}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Desktop Sidebar Toggle Arrow */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-200 shadow-sm p-1.5 rounded-r-lg hover:bg-gray-50 transition-all duration-300"
          style={{ left: sidebarOpen ? '288px' : '0px' }}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
        </button>

        <div className="flex-1 h-full relative p-1 sm:p-2 md:p-4 pb-0">
          <div
            className={`w-full h-full rounded-t-xl rounded-tr-none md:rounded-xl shadow-inner border overflow-hidden relative transition-colors ${canvasDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-gray-200'}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onPointerMove={handlePointerMove}
          >
            <button
              type="button"
              onClick={() => setCanvasDarkMode((value) => !value)}
              className={`absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold shadow-sm transition-colors ${canvasDarkMode ? 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800' : 'bg-white text-slate-700 border-gray-200 hover:bg-slate-50'}`}
              title={canvasDarkMode ? 'Switch canvas to light mode' : 'Switch canvas to dark mode'}
            >
              {canvasDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{canvasDarkMode ? 'Light' : 'Dark'}</span>
            </button>
            <Canvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              panMode={panMode}
              setPanMode={setPanMode}
              hasSelectedElements={hasSelectedElements}
              handleZoomIn={handleZoomIn}
              handleZoomOut={handleZoomOut}
              handleFitView={handleFitView}
              handleDeleteSelected={handleDeleteSelected}
              isDarkMode={canvasDarkMode}
            />

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
                    <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.42c.45 0 .67-.54.35-.85L6.35 3.32a.5.5 0 0 0-.85.35z" />
                  </svg>
                  <div className="absolute top-5 left-5 bg-white text-xs px-2 py-0.5 rounded shadow-sm font-semibold truncate border whitespace-nowrap" style={{ color: data.user.color, borderColor: data.user.color }}>
                    {data.user.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Backdrop Overlay */}
        {chatOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-15"
            onClick={() => setChatOpen(false)}
          />
        )}

        {/* Chat Sidebar */}
        {chatOpen && (
          <div className="w-full max-w-xs sm:max-w-sm md:w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col z-20 h-full absolute lg:static right-0 top-0 bottom-0 animate-in slide-in-from-right-8 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Workspace Chat</span>
              </div>
              <button 
                onClick={() => setChatOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-150 shrink-0 bg-slate-50/50 p-1">
              <button
                onClick={() => { setActiveChatTab('team'); setSelectedDMUserId(null); }}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeChatTab === 'team'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Chat</span>
                {unreadTeamCount > 0 && (
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveChatTab('dm')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeChatTab === 'dm'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>DMs</span>
                {totalUnreadDMCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-extrabold rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                    {totalUnreadDMCount}
                  </span>
                )}
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {activeChatTab === 'team' ? (
                /* Team Chat Thread */
                messages.filter(m => !m.recipientId).length === 0 ? (
                  <div className="text-center text-slate-400 text-xs mt-10">
                    No team messages yet. Start collaborating!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.filter(m => !m.recipientId).map((msg, index, arr) => {
                      const isMe = msg.user.id === currentUser.id;
                      const prevMsg = index > 0 ? arr[index - 1] : null;
                      const showSenderHeader = !prevMsg || prevMsg.user.id !== msg.user.id;
                      
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${showSenderHeader ? 'mt-3' : 'mt-1'}`}>
                          {showSenderHeader && !isMe && (
                            <span className="text-[10px] text-slate-500 font-bold mb-1 ml-9">
                              {msg.user.name}
                            </span>
                          )}
                          <div className={`flex items-end space-x-2 max-w-[85%] ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                            {!isMe && (
                              <div 
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm ${
                                  showSenderHeader ? 'visible' : 'invisible'
                                }`}
                                style={{ backgroundColor: msg.user.color }}
                              >
                                {msg.user.name.substring(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col group">
                              <div 
                                className={`px-3.5 py-2 rounded-2xl text-xs shadow-sm leading-relaxed ${
                                  isMe 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : msg.text.includes(`@${currentUser.name}`) 
                                      ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-none font-medium'
                                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                                }`}
                              >
                                {msg.text.split(' ').map((word: string, i: number) => {
                                  if (word.startsWith('@')) {
                                    return (
                                      <span key={i} className={`font-bold ${isMe ? 'text-indigo-200' : 'text-indigo-600 bg-indigo-50/50 px-1 py-0.5 rounded'}`}>
                                        {word}{' '}
                                      </span>
                                    );
                                  }
                                  return word + ' ';
                                })}
                              </div>
                              <span className={`text-[9px] text-slate-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Direct Messages (DMs) */
                selectedDMUserId === null ? (
                  /* Member list to choose DM recipient */
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                      Direct Message collaborators
                    </span>
                    {members.filter(m => m.user.id !== currentUser.id).length === 0 ? (
                      <div className="text-center text-slate-400 text-xs mt-10">
                        Invite members to start private chatting!
                      </div>
                    ) : (
                      members.filter(m => m.user.id !== currentUser.id).map(member => {
                        const unreadCount = unreadDMCounts[member.user.id] || 0;
                        return (
                          <button
                            key={member.user.id}
                            onClick={() => setSelectedDMUserId(member.user.id)}
                            className="w-full flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all duration-200 text-left active:scale-95 group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div
                                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm relative shrink-0"
                                style={{ backgroundColor: member.user.color, color: 'white' }}
                              >
                                {member.user.name.substring(0, 1).toUpperCase()}
                                <div
                                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                    member.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                  }`}
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 text-xs group-hover:text-indigo-600 transition-colors block truncate">
                                  {member.user.name}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {member.isOnline ? 'Active now' : 'Offline'}
                                </span>
                              </div>
                            </div>
                            
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-[9px] font-extrabold rounded-full px-1.5 py-0.5 min-w-[16px] text-center shadow-sm">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                ) : (
                  /* DM Chat Thread with selected user */
                  (() => {
                    const selectedMember = members.find(m => m.user.id === selectedDMUserId);
                    const dmMessages = messages.filter(m => 
                      (m.user.id === currentUser.id && m.recipientId === selectedDMUserId) ||
                      (m.user.id === selectedDMUserId && m.recipientId === currentUser.id)
                    );
                    
                    return (
                      <div className="space-y-4">
                        {/* DM Thread Subheader */}
                        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 shrink-0">
                          <button
                            onClick={() => setSelectedDMUserId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            title="Back to DMs"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white relative shrink-0 shadow-sm"
                            style={{ backgroundColor: selectedMember?.user.color || '#94a3b8' }}
                          >
                            {selectedMember?.user.name.substring(0, 1).toUpperCase() || '?'}
                            <div
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                selectedMember?.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 text-xs block truncate leading-tight">
                              {selectedMember?.user.name || 'Collaborator'}
                            </span>
                            <span className="text-[10px] text-slate-400 leading-none">
                              {selectedMember?.isOnline ? 'Active now' : 'Offline'}
                            </span>
                          </div>
                        </div>

                        {/* DM Message history list */}
                        {dmMessages.length === 0 ? (
                          <div className="text-center text-slate-400 text-xs mt-10">
                            No private messages yet. Send a DM to start chatting!
                          </div>
                        ) : (
                          dmMessages.map((msg, index, arr) => {
                            const isMe = msg.user.id === currentUser.id;
                            const prevMsg = index > 0 ? arr[index - 1] : null;
                            const showSenderHeader = !prevMsg || prevMsg.user.id !== msg.user.id;
                            
                            return (
                              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${showSenderHeader ? 'mt-2' : 'mt-1'}`}>
                                <div className={`flex items-end space-x-2 max-w-[85%] ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                                  {!isMe && (
                                    <div 
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm ${
                                        showSenderHeader ? 'visible' : 'invisible'
                                      }`}
                                      style={{ backgroundColor: msg.user.color }}
                                    >
                                      {msg.user.name.substring(0, 1).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="flex flex-col group">
                                    <div 
                                      className={`px-3.5 py-2 rounded-2xl text-xs shadow-sm leading-relaxed ${
                                        isMe 
                                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                                          : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                                      }`}
                                    >
                                      {msg.text}
                                    </div>
                                    <span className={`text-[9px] text-slate-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                      {formatTime(msg.timestamp)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })()
                )
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input form - only visible if in team tab or if a user is selected in DMs */}
            {!(activeChatTab === 'dm' && selectedDMUserId === null) && (
              <div className="p-3.5 border-t border-gray-200 bg-white shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder={
                      activeChatTab === 'team'
                        ? "Type a message or @mention..."
                        : `Message ${members.find(m => m.user.id === selectedDMUserId)?.user.name || 'member'}...`
                    }
                    className="flex-1 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400 text-slate-800"
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim()} 
                    className="bg-[#6366f1] text-white p-2.5 rounded-2xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm hover:shadow"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* History Backdrop Overlay */}
        {historyOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-15"
            onClick={() => setHistoryOpen(false)}
          />
        )}

        {/* History Sidebar */}
        {historyOpen && (
          <div className="w-full max-w-xs sm:max-w-sm md:w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col z-20 h-full absolute lg:static right-0 top-0 bottom-0 animate-in slide-in-from-right-8 duration-200">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Share this canvas</h3>
                  <p className="text-xs text-slate-500">Collaborate with others in real-time</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMembersModalOpen(false);
                  setInviteEmail('');
                  setInviteError('');
                  setInviteSuccess(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[70vh] space-y-6">
              {/* Invite Form (Only visible to Owners) */}
              {myRole === 'owner' && canvasId !== 'default' && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                    Invite new member
                  </h4>
                  <form onSubmit={handleAddMember} className="flex items-stretch gap-2">
                    <div className="flex-1 relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 rounded-xl px-3.5 transition-all">
                      <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address..."
                        className="w-full bg-transparent border-0 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 p-0 h-[42px]"
                      />
                    </div>
                    
                    <div className="relative shrink-0">
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl pl-3.5 pr-9 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer h-[44px] min-w-[110px]"
                      >
                        <option value="editor">Can edit</option>
                        <option value="viewer">Can view</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isInviting || !inviteEmail.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:scale-100 shrink-0 h-[44px] flex items-center justify-center"
                    >
                      {isInviting ? 'Inviting...' : 'Invite'}
                    </button>
                  </form>
                  {inviteError && (
                    <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> {inviteError}
                    </p>
                  )}
                  {inviteSuccess && (
                    <p className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Member added successfully!
                    </p>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  People with access ({members.length})
                </h4>
                
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {members.map(member => {
                    const isCurrentUser = member.user.id === currentUser.id;
                    const canManage = myRole === 'owner' && !isCurrentUser && canvasId !== 'default';

                    return (
                      <div
                        key={member.user.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/80 rounded-2xl transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold shadow-sm relative shrink-0"
                            style={{ backgroundColor: member.user.color, color: 'white' }}
                          >
                            {member.user.name.substring(0, 1).toUpperCase()}
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                member.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                              title={member.isOnline ? 'Online' : 'Offline'}
                            />
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
                              <span className="font-bold text-slate-800 text-sm truncate max-w-[160px]">
                                {member.user.name}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  (You)
                                </span>
                              )}
                              {member.role === 'owner' && (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-extrabold rounded-md uppercase tracking-wider border border-indigo-100">
                                  Owner
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate max-w-[190px] mt-0.5">{member.user.email}</p>
                            <p className="text-[10px] font-bold flex items-center gap-1 mt-0.5">
                              {member.isOnline ? (
                                <span className="text-emerald-600 flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500" /> Active now
                                </span>
                              ) : (
                                <span className="text-slate-400">Offline</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center shrink-0">
                          {canManage ? (
                            <div className="relative">
                              <select
                                value={member.role}
                                onChange={(e) => {
                                  if (e.target.value === 'remove') {
                                    handleKickMember(member.user.id);
                                  } else {
                                    handleUpdateRole(member.user.id, e.target.value);
                                  }
                                }}
                                className="appearance-none bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                              >
                                <option value="editor">Can edit</option>
                                <option value="viewer">Can view</option>
                                <option value="remove" className="text-red-600 font-bold">Remove member</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            member.role !== 'owner' && (
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2.5 py-1 bg-slate-100 border border-slate-200/60 rounded-lg">
                                {member.role === 'editor' ? 'Can edit' : 'Can view'}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Collaboration Link Section */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Collaboration link
                </h4>
                <div className="flex items-center justify-between p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/40">
                  <div className="flex items-center space-x-3 min-w-0 mr-4">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50">
                      <Globe className="w-4.5 h-4.5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">Anyone with the link</p>
                      <p className="text-[11px] text-slate-500">Can view and edit this workspace</p>
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border shrink-0 ${
                      copied
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-none'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm hover:shadow active:scale-95'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setMembersModalOpen(false);
                  setInviteEmail('');
                  setInviteError('');
                  setInviteSuccess(false);
                }}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <SettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <JsonTransportDialog
        isOpen={jsonTransportOpen}
        onClose={() => setJsonTransportOpen(false)}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
      />
      <AiAssistantWidget />
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
