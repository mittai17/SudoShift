import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  AlertCircle, 
  BrainCircuit, 
  LayoutDashboard, 
  LogOut, 
  Plus, 
  Folder, 
  FolderOpen, 
  Trash2, 
  ChevronRight,
  FolderTree,
  MoreVertical,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabase';

interface CanvasMeta {
  id: string;
  name: string;
  updated_at: string;
  folder_id: string | null;
}

const PALETTE = [
  '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#d946ef', '#14b8a6', '#0ea5e9', '#64748b'
];
const colorForUser = (id: string) => PALETTE[id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % PALETTE.length];

export default function Home() {
  const [canvases, setCanvases] = useState<CanvasMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState('');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Workspaces and Folders states
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Creation states
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);

  // Dropdown & Rename states
  const [activeMenuCanvasId, setActiveMenuCanvasId] = useState<string | null>(null);
  const [renamingCanvasId, setRenamingCanvasId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const loadWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data && data.length > 0) {
        setWorkspaces(data);
        const savedWs = localStorage.getItem('activeWorkspaceId');
        const found = data.find(w => w.id === savedWs);
        setActiveWorkspaceId(found ? found.id : data[0].id);
      } else if (user) {
        // Safe fallback to create default Personal Workspace on the fly
        const { data: newWs, error: wsErr } = await supabase
          .from('workspaces')
          .insert({ name: 'Personal Workspace', owner_id: user.id })
          .select()
          .single();
        if (wsErr) throw wsErr;
        if (newWs) {
          setWorkspaces([newWs]);
          setActiveWorkspaceId(newWs.id);
        }
      }
    } catch (err: any) {
      setSetupError(err.message || 'Failed to load workspaces.');
    }
  };

  const loadFolders = async (wsId: string) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('workspace_id', wsId)
        .order('name');
      if (error) throw error;
      setFolders(data || []);
    } catch (err: any) {
      console.error('Failed to load folders:', err);
    }
  };

  const loadCanvases = async (wsId: string, folderId: string | null) => {
    setLoading(true);
    setSetupError('');
    try {
      let query = supabase
        .from('canvases')
        .select('*')
        .eq('workspace_id', wsId);

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;

      setCanvases((data || []).map((canvas: any, index: number) => ({
        id: canvas.id,
        name: canvas.name || `Canvas ${index + 1}`,
        updated_at: canvas.updated_at || canvas.created_at || new Date().toISOString(),
        folder_id: canvas.folder_id,
      })));
    } catch (err: any) {
      setSetupError(err.message);
      setCanvases([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync state triggers
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  useEffect(() => {
    if (activeWorkspaceId) {
      localStorage.setItem('activeWorkspaceId', activeWorkspaceId);
      loadFolders(activeWorkspaceId);
      loadCanvases(activeWorkspaceId, activeFolderId);
    }
  }, [activeWorkspaceId, activeFolderId]);

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || !user) return;
    setSetupError('');

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({ name: newWorkspaceName.trim(), owner_id: user.id })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setWorkspaces(prev => [...prev, data]);
        setActiveWorkspaceId(data.id);
        setActiveFolderId(null);
        setNewWorkspaceName('');
        setWorkspaceModalOpen(false);
      }
    } catch (err: any) {
      setSetupError(err.message);
    }
  };

  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !activeWorkspaceId) return;
    setSetupError('');

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({ name: newFolderName.trim(), workspace_id: activeWorkspaceId })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFolders(prev => [...prev, data]);
        setActiveFolderId(data.id);
        setNewFolderName('');
        setFolderModalOpen(false);
      }
    } catch (err: any) {
      setSetupError(err.message);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (window.confirm("Are you sure you want to delete this folder? Canvases inside it will not be deleted, but will be moved to 'No Folder'.")) {
      try {
        const { error } = await supabase.from('folders').delete().eq('id', folderId);
        if (error) throw error;
        
        if (activeFolderId === folderId) {
          setActiveFolderId(null);
        }
        loadFolders(activeWorkspaceId!);
        loadCanvases(activeWorkspaceId!, null);
      } catch (err: any) {
        setSetupError(err.message);
      }
    }
  };

  const createNewCanvas = async () => {
    if (!user || !activeWorkspaceId) return;
    setSetupError('');

    const id = uuidv4();
    const name = `Untitled Canvas ${canvases.length + 1}`;
    const now = new Date().toISOString();

    try {
      const { error: canvasError } = await supabase.from('canvases').insert({
        id,
        name,
        owner_id: user.id,
        workspace_id: activeWorkspaceId,
        folder_id: activeFolderId,
        nodes: [],
        edges: [],
        versions: [],
      });

      if (canvasError) throw canvasError;

      const { error: memberError } = await supabase.from('canvas_members').insert({
        canvas_id: id,
        user_id: user.id,
        role: 'owner',
      });

      if (memberError) throw memberError;

      setCanvases(current => [{ id, name, updated_at: now, folder_id: activeFolderId }, ...current]);
      navigate(`/app?id=${id}`);
    } catch (err: any) {
      setSetupError(err.message);
    }
  };

  const deleteCanvas = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (!window.confirm("Are you sure you want to delete this canvas? This action cannot be undone.")) return;

    try {
      const { error } = await supabase.from('canvases').delete().eq('id', id);
      if (error) throw error;
      setCanvases(current => current.filter(canvas => canvas.id !== id));
    } catch (err: any) {
      setSetupError(err.message);
    }
  };

  const [renamingInFlight, setRenamingInFlight] = useState(false);

  const startRenameCanvas = (canvas: CanvasMeta, e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setRenamingCanvasId(canvas.id);
    setRenameValue(canvas.name);
    setActiveMenuCanvasId(null);
    setSetupError('');
  };

  const cancelRenameCanvas = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setRenamingCanvasId(null);
    setRenameValue('');
  };

  const handleRenameCanvas = async (canvasId: string, e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (renamingInFlight) return;

    const trimmed = renameValue.trim();
    if (!trimmed) {
      cancelRenameCanvas();
      return;
    }

    setRenamingInFlight(true);
    const now = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('canvases')
        .update({ name: trimmed, updated_at: now })
        .eq('id', canvasId);

      if (error) throw error;

      setCanvases(current =>
        current.map(c => (c.id === canvasId ? { ...c, name: trimmed, updated_at: now } : c))
      );
    } catch (err: any) {
      setSetupError(err.message || 'Failed to rename canvas.');
    } finally {
      setRenamingInFlight(false);
      cancelRenameCanvas();
    }
  };

  const activeWorkspaceName = workspaces.find(w => w.id === activeWorkspaceId)?.name || 'Personal Workspace';
  const activeFolderName = folders.find(f => f.id === activeFolderId)?.name || '';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans selection:bg-[#6366f1] selection:text-white pb-20">
      <nav className="flex items-center justify-between px-4 md:px-6 lg:px-12 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#6366f1] text-white rounded-lg shadow-sm">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Visual Second Brain</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
          <RouterLink to="/" className="hover:text-gray-900 transition-colors">My Canvases</RouterLink>
          <RouterLink to="/how-it-works" className="hover:text-gray-900 transition-colors">How it Works</RouterLink>
        </div>
        <div className="flex items-center gap-2">
          {/* Linked Profile Page Circle */}
          <RouterLink to="/profile" className="flex items-center gap-2.5 mr-3 hover:opacity-85 transition-opacity group">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0 border border-white"
              style={{ backgroundColor: user?.user_metadata?.avatar_color || colorForUser(user?.id || 'user') }}
            >
              {user?.user_metadata?.full_name?.substring(0, 1).toUpperCase() || user?.email?.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-gray-700 max-w-40 truncate group-hover:text-indigo-600 transition-colors">
                {user?.user_metadata?.full_name || user?.email}
              </div>
              <div className="text-[10px] text-gray-400 font-bold group-hover:text-indigo-500 transition-colors">Edit Profile</div>
            </div>
          </RouterLink>
          <button onClick={signOut} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="w-full pb-20">
        <section id="dashboard" className="mb-20">
          <div className="flex flex-col md:flex-row">
            {/* Mobile Sidebar Toggle Header */}
            <div className="md:hidden mx-4 mt-8 flex items-center justify-between bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="truncate text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scope</span>
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    {activeWorkspaceName} {activeFolderName ? `/ ${activeFolderName}` : ''}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-all shrink-0 active:scale-95 shadow-sm"
              >
                {sidebarCollapsed ? 'Show Folders' : 'Hide Folders'}
              </button>
            </div>

            {sidebarCollapsed && (
              <div className="hidden md:flex w-16 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-73px)] sticky top-[73px] items-center justify-center">
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl transition-all shadow-sm active:scale-95"
                  title="Open workspace panel"
                >
                  <FolderOpen className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Sidebar Column */}
            <aside className={`relative w-full md:w-80 shrink-0 bg-white border border-gray-200 md:border-l-0 md:border-y-0 md:border-r rounded-3xl md:rounded-none p-5 md:p-6 shadow-sm md:shadow-none h-fit md:min-h-[calc(100vh-73px)] md:sticky md:top-[73px] ${sidebarCollapsed ? 'hidden' : 'block'}`}>
              {/* Workspace Selector */}
              <div className="space-y-2.5 pb-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workspace</span>
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    className="p-1.5 md:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:bg-white md:border md:border-gray-200 md:shadow-sm rounded-lg md:rounded-full transition-colors md:absolute md:-right-4 md:top-1/2 md:-translate-y-1/2 md:z-10"
                    title="Close workspace panel"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={activeWorkspaceId || ''}
                    onChange={(e) => {
                      setActiveWorkspaceId(e.target.value);
                      setActiveFolderId(null);
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none text-slate-800 shadow-sm cursor-pointer"
                  >
                    {workspaces.map(ws => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setWorkspaceModalOpen(true)}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
                    title="Create Workspace"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Folders List Selector */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Folders</span>
                  <button 
                    onClick={() => setFolderModalOpen(true)}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-all"
                    title="Create Folder"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setActiveFolderId(null)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeFolderId === null
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>All Canvases</span>
                  </button>

                  {folders.map(folder => (
                    <div
                      key={folder.id}
                      className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                        activeFolderId === folder.id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      onClick={() => setActiveFolderId(folder.id)}
                    >
                      <div className="flex items-center space-x-2.5 truncate min-w-0 pr-1">
                        <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-xs font-bold">{folder.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFolder(folder.id);
                        }}
                        className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-all opacity-0 group-hover:opacity-100 shrink-0"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Canvases Grid Area */}
            <div className="flex-1 min-w-0 px-4 md:px-8 lg:px-12 mt-8 md:mt-12">
              <div className="max-w-5xl">
              <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span>{activeWorkspaceName}</span>
                    {activeFolderName && (
                      <>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        <span className="text-slate-500">{activeFolderName}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">My Workspaces</h1>
                  <p className="text-gray-500">Manage your saved collaborative boards and logic nodes.</p>
                </div>
              </header>

              {setupError && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Supabase database setup needed</div>
                    <div className="text-xs mt-2 text-amber-700">{setupError}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  onClick={createNewCanvas}
                  className="group cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#6366f1] bg-gray-50 hover:bg-[#EEF2FF] rounded-2xl p-6 h-48 flex flex-col items-center justify-center transition-all"
                >
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-[#6366f1]" />
                  </div>
                  <h3 className="font-bold text-gray-700 group-hover:text-[#6366f1] text-sm">Create New Canvas</h3>
                </div>

                {loading && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 h-48 flex items-center justify-center text-sm text-gray-500">
                    Loading canvases...
                  </div>
                )}

                {!loading && canvases.length === 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 h-48 flex flex-col items-center justify-center text-sm text-gray-400">
                    <FolderTree className="w-7 h-7 mb-2 text-gray-300" />
                    <span>No canvases found in this directory.</span>
                  </div>
                )}

                {canvases.map(canvas => (
                  <div
                    key={canvas.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/app?id=${canvas.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/app?id=${canvas.id}`);
                      }
                    }}
                    className="group relative bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg rounded-2xl p-5 h-48 flex flex-col justify-between transition-all cursor-pointer"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                          <LayoutDashboard className="w-5 h-5" />
                        </div>
                        {/* Three Dot Button */}
                        <div
                          className="relative"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveMenuCanvasId(prev => prev === canvas.id ? null : canvas.id);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                            title="Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Overlay */}
                          {activeMenuCanvasId === canvas.id && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveMenuCanvasId(null);
                                }}
                              />
                              <div
                                className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    startRenameCanvas(canvas, e);
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Rename</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteCanvas(canvas.id, e);
                                    setActiveMenuCanvasId(null);
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {renamingCanvasId === canvas.id ? (
                        <form
                          onSubmit={(e) => handleRenameCanvas(canvas.id, e)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="space-y-2"
                        >
                          <input
                            type="text"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Escape') cancelRenameCanvas(e);
                            }}
                            autoFocus
                            className="w-full bg-slate-50 border border-indigo-500 rounded-lg px-2.5 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-800"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleRenameCanvas(canvas.id, e)}
                              disabled={renamingInFlight || !renameValue.trim()}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{renamingInFlight ? 'Saving' : 'Save'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={cancelRenameCanvas}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-bold hover:bg-slate-50 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-3">
                          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">{canvas.name}</h3>
                        </div>
                      )}
                    </div>

                    <div
                      className="flex items-center justify-between mt-4"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <div className="flex items-center space-x-2 shrink-0">
                        <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <select
                          value={canvas.folder_id || ''}
                          onChange={async (e) => {
                            const newFolderId = e.target.value === '' ? null : e.target.value;
                            const { error } = await supabase
                              .from('canvases')
                              .update({ folder_id: newFolderId })
                              .eq('id', canvas.id);
                            if (!error) {
                              loadCanvases(activeWorkspaceId!, activeFolderId);
                            }
                          }}
                          className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-all max-w-[110px]"
                        >
                          <option value="">No Folder</option>
                          {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-gray-400 font-bold block sm:hidden md:block">
                          {new Date(canvas.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Workspace Creation Modal */}
      {workspaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form onSubmit={createWorkspace} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">New Workspace</h3>
              <button type="button" onClick={() => setWorkspaceModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">&times;</button>
            </div>
            <div className="p-6">
              <input
                required
                type="text"
                value={newWorkspaceName}
                onChange={e => setNewWorkspaceName(e.target.value)}
                placeholder="Workspace name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setWorkspaceModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Folder Creation Modal */}
      {folderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form onSubmit={createFolder} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">New Folder</h3>
              <button type="button" onClick={() => setFolderModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">&times;</button>
            </div>
            <div className="p-6">
              <input
                required
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setFolderModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
