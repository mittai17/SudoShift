import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, AlignLeft, BrainCircuit, CheckSquare, Clock, LayoutDashboard, LogOut, Plus, Sigma } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabase';

interface CanvasMeta {
  id: string;
  name: string;
  updated_at: string;
}

export default function Home() {
  const [canvases, setCanvases] = useState<CanvasMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState('');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const loadCanvases = async () => {
    setLoading(true);
    setSetupError('');

    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      setSetupError(error.message);
      setCanvases([]);
    } else {
      setCanvases((data || []).map((canvas: any, index: number) => ({
        id: canvas.id,
        name: canvas.name || `Canvas ${index + 1}`,
        updated_at: canvas.updated_at || canvas.created_at || new Date().toISOString(),
      })));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCanvases();
  }, []);

  const createNewCanvas = async () => {
    if (!user) return;
    setSetupError('');

    const id = uuidv4();
    const name = `Untitled Canvas ${canvases.length + 1}`;
    const now = new Date().toISOString();

    let { error: canvasError } = await supabase.from('canvases').insert({
      id,
      name,
      owner_id: user.id,
      nodes: [],
      edges: [],
      versions: [],
    });

    if (canvasError?.message?.includes("Could not find the 'name' column")) {
      const fallback = await supabase.from('canvases').insert({
        id,
        owner_id: user.id,
        nodes: [],
        edges: [],
        versions: [],
      });
      canvasError = fallback.error;
    }

    if (canvasError) {
      setSetupError(canvasError.message);
      return;
    }

    const { error: memberError } = await supabase.from('canvas_members').insert({
      canvas_id: id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberError) {
      setSetupError(memberError.message);
      return;
    }

    setCanvases((current) => [{ id, name, updated_at: now }, ...current]);
    navigate(`/app?id=${id}`);
  };

  const deleteCanvas = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const { error } = await supabase.from('canvases').delete().eq('id', id);
    if (error) {
      setSetupError(error.message);
      return;
    }

    setCanvases((current) => current.filter((canvas) => canvas.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans selection:bg-[#6366f1] selection:text-white pb-20">
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#6366f1] text-white rounded-lg shadow-sm">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Visual Second Brain</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
          <a href="#dashboard" className="hover:text-gray-900 transition-colors">My Canvases</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
          <Link to="/community" className="hover:text-gray-900 transition-colors">Community</Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right mr-2">
            <div className="text-xs font-semibold text-gray-700 max-w-40 truncate">{user?.user_metadata?.full_name || user?.email}</div>
            <div className="text-[11px] text-gray-400">Signed in</div>
          </div>
          <button onClick={createNewCanvas} className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Canvas</span>
          </button>
          <button onClick={signOut} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 lg:px-12 mt-12">
        <section id="dashboard" className="mb-20">
          <header className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">My Workspaces</h1>
              <p className="text-gray-500">Manage your saved collaborative boards and logic nodes.</p>
            </div>
          </header>

          {setupError && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-sm">Supabase database setup needed</div>
                <div className="text-sm mt-1">Run the SQL in <code className="bg-amber-100 px-1 py-0.5 rounded">supabase/repair_existing_schema.sql</code> in your Supabase SQL editor, then refresh.</div>
                <div className="text-xs mt-2 text-amber-700">{setupError}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div
              onClick={createNewCanvas}
              className="group cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#6366f1] bg-gray-50 hover:bg-[#EEF2FF] rounded-2xl p-6 h-48 flex flex-col items-center justify-center transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-[#6366f1]" />
              </div>
              <h3 className="font-semibold text-gray-700 group-hover:text-[#6366f1]">Create New Canvas</h3>
            </div>

            {loading && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 h-48 flex items-center justify-center text-sm text-gray-500">
                Loading canvases...
              </div>
            )}

            {canvases.map((canvas) => (
              <Link
                key={canvas.id}
                to={`/app?id=${canvas.id}`}
                className="group relative bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg rounded-2xl p-5 h-48 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">{canvas.name}</h3>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(canvas.updated_at).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={(event) => deleteCanvas(canvas.id, event)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-all"
                    title="Delete Canvas"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 1 2 2 2v2"></path></svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mt-32 border-t border-gray-200 pt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Clarity in the Working</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Visual Second Brain is a smart organizational canvas built around collaborative nodes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Sigma className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Formulas & Calculations</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Calculate budgets, rates, or math right inside the canvas.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <AlignLeft className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Rich Note Variations</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Mix text notes, tables, markdown, code, images, video embeds, timers, and more.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Team Execution</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Live cursors, chat, history, and role controls make the board usable with others.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
