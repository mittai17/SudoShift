import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, Check, AlertCircle, Save, User, UserCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          setUsername(data.username || '');
          setFullName(data.full_name || '');
        } else {
          // Fallback if profile doesn't exist yet for some reason
          const defaultUser = user.email ? user.email.split('@')[0] : 'user';
          setUsername(defaultUser);
          setFullName(user.user_metadata?.full_name || defaultUser);
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      setError('Username cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // 1. Check username availability (excluding self)
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
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // 3. Update auth user metadata so header updates dynamically too
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          username: cleanUsername
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans selection:bg-[#6366f1] selection:text-white pb-20">
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Link to="/" className="p-2 bg-[#6366f1] text-white rounded-lg shadow-sm block hover:bg-[#4f46e5] transition-colors">
            <BrainCircuit className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg tracking-tight">Visual Second Brain</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Canvases</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">My Profile</h1>
                <p className="text-xs text-indigo-100">Manage your collaborator credentials</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-10 text-sm text-gray-500">
                Loading profile details...
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email address</span>
                  <input
                    disabled
                    type="email"
                    value={user?.email || ''}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Email address cannot be changed.</span>
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Username (unique ID)</span>
                  <input
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="e.g. adajoin"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-semibold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Only letters, numbers, underscores, and hyphens. Used for @mentions.</span>
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full name (display name)</span>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ada Lovelace"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                  />
                </label>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                    <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Profile updated successfully!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-60 disabled:scale-100 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                >
                  {saving ? (
                    'Saving changes...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
