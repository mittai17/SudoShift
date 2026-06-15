import React, { useState, useEffect } from 'react';
import { Settings, User, Shield } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('editor');

  useEffect(() => {
    if (isOpen) {
      setUserName(localStorage.getItem('user_name') || '');
      setUserRole(localStorage.getItem('user_role') || 'editor');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('user_name', userName);
    localStorage.setItem('user_role', userRole);
    onClose();
    // Optional: reload to apply new user name if needed
    window.dispatchEvent(new Event('storage'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 md:p-4">
      <div className="bg-[#13141c] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#1a1b23]/50">
          <h3 className="font-semibold text-lg text-gray-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            Application Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-400 transition-colors p-1"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">



          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-gray-100 border-b border-gray-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              User Profile
            </h4>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-[#1a1b23] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-[#6366f1]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-gray-100 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              Role Management
            </h4>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">Default Role</label>
              <select
                value={userRole}
                onChange={e => setUserRole(e.target.value)}
                className="w-full bg-[#1a1b23] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-[#6366f1]"
              >
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-[#1a1b23] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#13141c] border border-[#2a2b36] text-gray-300 hover:bg-[#1a1b23] rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
