import React, { useEffect, useState } from 'react';
import { BrainCircuit, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

type Mode = 'signin' | 'signup';

export default function Login() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    setError('');
    setMessage('');
  }, [mode]);

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    const cleanEmail = email.trim();
    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInError) throw signInError;
        navigate(from, { replace: true });
      } else {
        const cleanUsername = username.trim().toLowerCase();
        if (!cleanUsername) {
          throw new Error('Username is required.');
        }
        
        // 1. Check if username is already taken
        const { data: existing, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (existing) {
          throw new Error('Username is already taken.');
        }

        // 2. Perform sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
              full_name: fullName.trim() || cleanEmail.split('@')[0],
            },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          navigate(from, { replace: true });
        } else {
          setMessage('Check your email to confirm your account, then sign in.');
          setMode('signin');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950 flex">
      <section className="hidden lg:flex flex-1 bg-slate-950 text-white px-14 py-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl">Visual Second Brain</span>
        </div>
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.22em] text-indigo-300 mb-5">Collaborative canvas</p>
          <h1 className="text-5xl font-bold leading-tight mb-6">Sign in, share a board, and build together in real time.</h1>
          <p className="text-slate-300 text-lg leading-8">
            Authenticated workspaces keep your boards tied to your account while live cursors, chat, history, and node syncing keep the team moving.
          </p>
        </div>
        <div className="text-sm text-slate-400">Supabase Auth + Socket.IO collaboration</div>
      </section>

      <main className="w-full lg:w-[480px] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-lg bg-indigo-600 text-white">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl">Visual Second Brain</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${mode === 'signin' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Sign up
              </button>
            </div>

            <h2 className="text-2xl font-bold mb-2">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="text-sm text-slate-500 mb-6">
              {mode === 'signin' ? 'Open your saved canvases and collaboration rooms.' : 'Start saving canvases to your Supabase workspace.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <label className="block mb-3">
                    <span className="text-sm font-medium text-slate-700">Username</span>
                    <input
                      required
                      value={username}
                      onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. adajoin"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Name</span>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ada Lovelace"
                    />
                  </label>
                </>
              )}

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <div className="mt-1 relative">
                  <input
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>

              {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>}
              {message && <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm">{message}</div>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {busy ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
