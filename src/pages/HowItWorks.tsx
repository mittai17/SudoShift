import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AlignLeft,
  BrainCircuit,
  CheckSquare,
  LogOut,
  Sigma
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Inbox from '../components/Inbox';

const PALETTE = [
  '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#d946ef', '#14b8a6', '#0ea5e9', '#64748b'
];

const colorForUser = (id: string) =>
  PALETTE[id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % PALETTE.length];

export default function HowItWorks() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#0d0e15] text-gray-100 font-sans selection:bg-emerald-600 selection:text-white">
      <nav className="flex items-center justify-between px-4 md:px-6 lg:px-12 py-4 border-b border-[#2a2b36] bg-[#13141c] sticky top-0 z-10">
        <RouterLink to="/" className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Visual Second Brain</span>
        </RouterLink>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
          <RouterLink to="/" className="hover:text-gray-100 transition-colors">My Canvases</RouterLink>
          <RouterLink to="/how-it-works" className="text-gray-100 transition-colors">How it Works</RouterLink>
        </div>
        <div className="flex items-center gap-2">
          {/* Inbox Notifications Bell */}
          <Inbox />

          <RouterLink to="/profile" className="flex items-center gap-2.5 mr-3 hover:opacity-85 transition-opacity group">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0 border border-white"
              style={{ backgroundColor: user?.user_metadata?.avatar_color || colorForUser(user?.id || 'user') }}
            >
              {user?.user_metadata?.full_name?.substring(0, 1).toUpperCase() || user?.email?.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-gray-300 max-w-40 truncate group-hover:text-emerald-500 transition-colors">
                {user?.user_metadata?.full_name || user?.email}
              </div>
              <div className="text-[10px] text-gray-400 font-bold group-hover:text-emerald-400 transition-colors">Edit Profile</div>
            </div>
          </RouterLink>
          <button onClick={signOut} className="p-2 text-gray-500 hover:text-gray-100 hover:bg-gray-100 rounded-lg transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-12 py-16 md:py-20">
        <section>
          <div className="mb-12">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">How it Works</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-100 mb-4">Clarity in the Working</h1>
            <p className="text-lg text-gray-400 max-w-2xl">
              Visual Second Brain is a smart organizational canvas built around collaborative nodes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#13141c] p-8 rounded-2xl border border-[#2a2b36] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <Sigma className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-100 mb-3">Formulas & Calculations</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Calculate budgets, rates, or math right inside the canvas.</p>
            </div>

            <div className="bg-[#13141c] p-8 rounded-2xl border border-[#2a2b36] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <AlignLeft className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-100 mb-3">Rich Note Variations</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Mix text notes, tables, markdown, code, images, video embeds, timers, and more.</p>
            </div>

            <div className="bg-[#13141c] p-8 rounded-2xl border border-[#2a2b36] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-gray-100 mb-3">Team Execution</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Live cursors, chat, history, and role controls make the board usable with others.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
