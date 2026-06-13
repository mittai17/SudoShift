import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Globe, Plus, Clock, ChevronRight, LayoutDashboard, Sigma, AlignLeft, CheckSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CanvasMeta {
  id: string;
  name: string;
  lastEdited: string;
}

export default function Home() {
  const [canvases, setCanvases] = useState<CanvasMeta[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load canvases from local storage, or initialize if none
    const saved = localStorage.getItem('visual-second-brain-canvases');
    if (saved) {
      try {
        setCanvases(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse canvases');
      }
    } else {
      // Default initial canvas
      const defaultData = [{ id: 'default', name: 'Workload Control Center', lastEdited: new Date().toISOString() }];
      setCanvases(defaultData);
      localStorage.setItem('visual-second-brain-canvases', JSON.stringify(defaultData));
    }
  }, []);

  const createNewCanvas = () => {
    const newCanvas: CanvasMeta = {
      id: uuidv4(),
      name: `Untitled Canvas ${canvases.length + 1}`,
      lastEdited: new Date().toISOString()
    };
    const updated = [newCanvas, ...canvases];
    setCanvases(updated);
    localStorage.setItem('visual-second-brain-canvases', JSON.stringify(updated));
    navigate(`/app?id=${newCanvas.id}`);
  };

  const deleteCanvas = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = canvases.filter(c => c.id !== id);
    setCanvases(updated);
    localStorage.setItem('visual-second-brain-canvases', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans selection:bg-[#6366f1] selection:text-white pb-20">
      {/* Navigation */}
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
        <div className="flex items-center">
          <button onClick={createNewCanvas} className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Canvas</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 lg:px-12 mt-12">
        {/* Dashboard Section */}
        <section id="dashboard" className="mb-20">
          <header className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">My Workspaces</h1>
              <p className="text-gray-500">Manage your virtual visual boards and logic nodes.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Card */}
            <div
              onClick={createNewCanvas}
              className="group cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#6366f1] bg-gray-50 hover:bg-[#EEF2FF] rounded-2xl p-6 h-48 flex flex-col items-center justify-center transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-[#6366f1]" />
              </div>
              <h3 className="font-semibold text-gray-700 group-hover:text-[#6366f1]">Create New Canvas</h3>
            </div>

            {/* List Canvases */}
            {canvases.map(canvas => (
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
                    <span>{new Date(canvas.lastEdited).toLocaleDateString()}</span>
                  </div>

                  {/* Delete button appears on group hover */}
                  {canvas.id !== 'default' && (
                    <button
                      onClick={(e) => deleteCanvas(canvas.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-all"
                      title="Delete Canvas"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mt-32 border-t border-gray-200 pt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Clarity in the Working</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Visual Second Brain is not just a drawing tool, it's a smart organizational system. Here's how it actually functions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 md:order-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">1</div>
                <p className="text-sm font-medium text-gray-700">Drag a node from the sidebar onto the canvas.</p>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">2</div>
                <p className="text-sm font-medium text-gray-700">Use handles (dots on the left/right) to connect dependencies.</p>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">3</div>
                <p className="text-sm font-medium text-gray-700">Pan around infinitely, zoom in and out as you build a massive map.</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-orange-600 mb-6">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Infinite Scroll-based Arrangement</h3>
              <p className="text-gray-600 leading-relaxed">
                Start with a blank canvas and scroll infinitely in any direction. The application is built entirely on node-based connections, letting you map out logic flows visually. Group identical tools together or link disparate concepts across the board to uncover new insights in your workflow.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Sigma className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Formulas & Calculations</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Calculate budgets, rates, or math right inside the canvas. Variable assignments cascade downward. If you type <code className="bg-gray-100 px-1 py-0.5 rounded text-xs mx-1">A = 100</code> on one line, you can reference it on the next: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs mx-1">A * 2</code> instantly outputs 200.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <AlignLeft className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Rich Note Variations</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Mix and match over 15 unique nodes: text notes, editable data tables, live markdown, code blocks, images, whiteboards, video embeds, calendars, focus timers, and more. All seamlessly connectable.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Eisenhower Task Execution</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Drag dedicated priority tasks labeled DO, DECIDE, DELEGATE, and DELETE. The matrix colors give immediate cognitive visual cues across your infinite scattered map so you know what needs attention at a glance.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

