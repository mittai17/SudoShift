import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BrainCircuit, 
  Check, 
  AlertCircle, 
  Save, 
  User, 
  UserCheck, 
  LayoutDashboard, 
  Folder, 
  Layers, 
  Copy, 
  Lock, 
  Activity,
  UserX,
  Loader2
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabase';

const PALETTE = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Slate', value: '#64748b' }
];

const COLORS = PALETTE.map(c => c.value);
const colorForUser = (id: string) => COLORS[id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % COLORS.length];

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Profile data states
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  // Stats states
  const [stats, setStats] = useState({
    workspaces: 0,
    folders: 0,
    canvases: 0
  });

  // UI state managers
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Real-time username verification state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error' | 'current'>('idle');

  // Fetch profile details, stats, and configs
  useEffect(() => {
    if (!user) return;

    const fetchProfileAndStats = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Fetch profile details
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (profile) {
          setUsername(profile.username || '');
          setFullName(profile.full_name || '');
          setSelectedColor(profile.avatar_color || colorForUser(user.id));
        } else {
          const defaultUser = user.email ? user.email.split('@')[0] : 'user';
          setUsername(defaultUser);
          setFullName(user.user_metadata?.full_name || defaultUser);
          setSelectedColor(colorForUser(user.id));
        }

        // 2. Fetch Workspaces owned by the user
        const { data: workspacesData, error: wsError } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id);

        if (wsError) throw wsError;
        const workspacesCount = workspacesData?.length || 0;

        // 3. Fetch Canvases created by the user
        const { count: canvasesCount, error: canvasError } = await supabase
          .from('canvases')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', user.id);

        if (canvasError) throw canvasError;

        // 4. Fetch Folders belonging to user's workspaces
        let foldersCount = 0;
        if (workspacesData && workspacesData.length > 0) {
          const wsIds = workspacesData.map(w => w.id);
          const { count, error: folderError } = await supabase
            .from('folders')
            .select('id', { count: 'exact', head: true })
            .in('workspace_id', wsIds);

          if (!folderError) {
            foldersCount = count || 0;
          }
        }

        setStats({
          workspaces: workspacesCount,
          folders: foldersCount,
          canvases: canvasesCount || 0
        });

      } catch (err: any) {
        console.error('Error fetching profile and stats:', err);
        setError(err.message || 'Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, [user]);

  // Debounced real-time username availability check
  useEffect(() => {
    if (!username.trim() || loading) {
      setUsernameStatus('idle');
      return;
    }

    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    
    // Skip remote check if it matches metadata username (i.e. is self)
    if (clean === user?.user_metadata?.username) {
      setUsernameStatus('current');
      return;
    }

    setUsernameStatus('checking');
    const delayDebounce = setTimeout(async () => {
      try {
        const { data, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', clean)
          .neq('id', user?.id)
          .maybeSingle();

        if (checkError) throw checkError;
        
        if (data) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (err) {
        setUsernameStatus('error');
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [username, user?.id, user?.user_metadata?.username, loading]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      setError('Username cannot be empty.');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('This username is already taken.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // 1. Perform final check in DB to prevent race condition
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .neq('id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        throw new Error('Username is already taken.');
      }

      // 2. Perform the profile update
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: cleanUsername,
          full_name: fullName.trim(),
          avatar_color: selectedColor,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // 3. Update auth user metadata so header updates dynamically too
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          username: cleanUsername,
          avatar_color: selectedColor
        }
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const copyUserId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : username.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#13141c] text-gray-100 font-sans selection:bg-emerald-600 selection:text-white pb-20 relative overflow-hidden">

      {/* Header Bar */}
      <nav className="flex items-center justify-between px-4 md:px-6 lg:px-12 py-4 border-b border-[#2a2b36]/80 bg-[#13141c]/70 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-2.5">
          <Link to="/" className="p-2 bg-emerald-600 hover:bg-[#4f46e5] text-white rounded-xl shadow-sm block transition-all active:scale-95">
            <BrainCircuit className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg tracking-tight text-gray-100 hidden sm:inline">Visual Second Brain</span>
        </div>
        <div className="flex items-center">
          <Link to="/" className="text-xs font-bold text-slate-500 hover:text-gray-200 bg-[#1a1b23] hover:bg-[#2a2b36]/80 px-3.5 py-2 rounded-xl transition-all border border-[#2a2b36]/50 flex items-center gap-1.5 active:scale-95">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Main Layout Area */}
      <main className="max-w-4xl mx-auto px-6 mt-12 animate-in fade-in slide-in-from-bottom-5 duration-300">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-gray-500 text-sm font-semibold">Loading profile information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Avatar Display & Statistics card */}
            <div className="md:col-span-5 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-[#13141c] border border-[#2a2b36] rounded-3xl shadow-sm p-6 text-center relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 inset-x-0 h-24 bg-[#13141c] border-b border-[#2a2b36] z-0" />
                
                {/* Large Avatar Bubble */}
                <div 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-extrabold transition-all duration-300 transform hover:scale-105 mt-10 relative z-10"
                  style={{ backgroundColor: selectedColor }}
                >
                  {initials || 'U'}
                </div>

                <h2 className="text-xl font-bold text-gray-200 mt-4 max-w-full truncate">{fullName}</h2>
                <p className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full mt-1.5">@{username}</p>

                {/* Statistics Grid */}
                <div className="w-full grid grid-cols-3 gap-3 border-t border-[#2a2b36] pt-6 mt-6">
                  <div className="bg-[#1a1b23] rounded-2xl p-2.5 border border-slate-150/50 flex flex-col items-center">
                    <Layers className="w-4 h-4 text-emerald-500 mb-1" />
                    <span className="text-sm font-extrabold text-gray-200 leading-none">{stats.workspaces}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mt-1">Spaces</span>
                  </div>

                  <div className="bg-[#1a1b23] rounded-2xl p-2.5 border border-slate-150/50 flex flex-col items-center">
                    <Folder className="w-4 h-4 text-emerald-500 mb-1" />
                    <span className="text-sm font-extrabold text-gray-200 leading-none">{stats.folders}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mt-1">Folders</span>
                  </div>

                  <div className="bg-[#1a1b23] rounded-2xl p-2.5 border border-slate-150/50 flex flex-col items-center">
                    <LayoutDashboard className="w-4 h-4 text-emerald-500 mb-1" />
                    <span className="text-sm font-extrabold text-gray-200 leading-none">{stats.canvases}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mt-1">Canvases</span>
                  </div>
                </div>
              </div>

              {/* ID Metadata Card */}
              <div className="bg-[#13141c] border border-[#2a2b36] rounded-3xl shadow-sm p-5 space-y-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Collaborator Details</span>
                <div className="flex items-center justify-between p-3 bg-[#1a1b23] rounded-2xl border border-[#2a2b36]/50">
                  <div className="min-w-0 flex-1 pr-3">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">User Unique ID</span>
                    <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">{user?.id}</p>
                  </div>
                  <button 
                    onClick={copyUserId}
                    className="p-2 bg-[#13141c] hover:bg-[#2a2b36] text-slate-500 hover:text-gray-300 rounded-xl transition-all border border-[#2a2b36] shrink-0 shadow-sm active:scale-95"
                    title="Copy User ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Settings Form */}
            <div className="md:col-span-7 bg-[#13141c] border border-[#2a2b36] rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-100 tracking-tight">Collaborator Settings</h1>
                <p className="text-slate-500 text-xs mt-1">Manage your identity metadata and real-time cursor presence colors.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                
                {/* Email (Disabled) */}
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email address</span>
                  <div className="relative">
                    <input
                      disabled
                      type="email"
                      value={user?.email || ''}
                      className="w-full bg-[#1a1b23] border border-[#2a2b36] text-gray-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm cursor-not-allowed font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-350 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">Authentication credentials are managed via Supabase.</span>
                </label>

                {/* Username */}
                <label className="block">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username (Unique tag)</span>
                    
                    {/* Status indicators */}
                    {usernameStatus === 'checking' && (
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying availability...
                      </span>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Username is available
                      </span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                        <UserX className="w-3 h-3" /> Username is already taken
                      </span>
                    )}
                    {usernameStatus === 'current' && (
                      <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                        This is your current username
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="e.g. adajoin"
                      className={`w-full bg-[#13141c] border rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all font-semibold text-gray-200 ${
                        usernameStatus === 'available' ? 'border-emerald-500 focus:ring-4 focus:ring-emerald-100' :
                        usernameStatus === 'taken' ? 'border-red-500 focus:ring-4 focus:ring-red-100' :
                        'border-[#2a2b36] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-900/50'
                      }`}
                    />
                    <span className="text-gray-500 font-bold text-sm absolute left-3.5 top-1/2 -translate-y-1/2 select-none">@</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">Only lower case letters, numbers, underscores, and hyphens allowed. Used for chat @mentions.</span>
                </label>

                {/* Display Name */}
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full name (Display Name)</span>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ada Lovelace"
                      className="w-full bg-[#13141c] border border-[#2a2b36] rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-900/50 transition-all text-gray-200 font-semibold"
                    />
                    <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </label>

                {/* Custom Avatar Color */}
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Workspace & Presence Color</span>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 p-4 bg-[#1a1b23] rounded-2xl border border-[#2a2b36]/50">
                    {PALETTE.map(color => {
                      const isSelected = selectedColor.toLowerCase() === color.value.toLowerCase();
                      return (
                        <button
                          type="button"
                          key={color.name}
                          onClick={() => setSelectedColor(color.value)}
                          className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center shadow-sm relative transition-all hover:scale-110 active:scale-95 group focus:outline-none"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] animate-in zoom-in-50 duration-200" />
                          )}
                          <span className="absolute bottom-[-24px] bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-10 whitespace-nowrap">
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Messages feedback */}
                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                    <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Profile configurations saved successfully!</span>
                  </div>
                )}

                {/* Action button */}
                <button
                  type="submit"
                  disabled={saving || usernameStatus === 'taken' || usernameStatus === 'checking'}
                  className="w-full bg-emerald-600 hover:bg-[#4f46e5] active:scale-98 disabled:opacity-60 disabled:scale-100 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Configurations</span>
                    </>
                  )}
                </button>

              </form>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
