import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Mail, 
  UserPlus, 
  AtSign, 
  Check, 
  Trash2, 
  Inbox as EmptyInboxIcon, 
  X,
  CheckSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

interface Notification {
  id: string;
  user_id: string;
  type: 'invite' | 'mention' | 'dm' | 'other';
  actor_id: string | null;
  actor_name: string;
  canvas_id: string | null;
  canvas_name: string | null;
  message_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface InboxProps {
  onOpenChat?: (tab: 'team' | 'dm', targetUserId?: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Inbox({ onOpenChat }: InboxProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('inbox')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();

    // Subscribe to real-time events for the inbox table
    const channel = supabase
      .channel(`inbox-user-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inbox',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n => n.id === payload.new.id ? (payload.new as Notification) : n)
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      const { error } = await supabase
        .from('inbox')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('inbox')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('inbox')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);

    if (!notif.canvas_id) return;

    const currentCanvasId = new URLSearchParams(window.location.search).get('id');

    if (currentCanvasId === notif.canvas_id && onOpenChat) {
      // Trigger UI change immediately in editor
      if (notif.type === 'dm') {
        onOpenChat('dm', notif.actor_id || undefined);
      } else if (notif.type === 'mention') {
        onOpenChat('team');
      }
    } else {
      // Navigate to target canvas
      let url = `/app?id=${notif.canvas_id}`;
      if (notif.type === 'dm') {
        url += `&openChat=dm&userId=${notif.actor_id}`;
      } else if (notif.type === 'mention') {
        url += `&openChat=team`;
      }
      navigate(url);
    }
  };

  const renderIcon = (type: Notification['type']) => {
    switch (type) {
      case 'invite':
        return (
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <UserPlus className="w-4.5 h-4.5" />
          </div>
        );
      case 'mention':
        return (
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AtSign className="w-4.5 h-4.5" />
          </div>
        );
      case 'dm':
        return (
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Mail className="w-4.5 h-4.5" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
            <Bell className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
          isOpen ? 'bg-gray-100 text-indigo-600' : ''
        }`}
        title="View Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold px-1 border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header */}
          <div className="px-4.5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 text-sm tracking-tight">Inbox</span>
              {unreadCount > 0 && (
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto max-h-[360px] scrollbar-thin scrollbar-thumb-slate-200">
            {notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                  <EmptyInboxIcon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm mb-1">Your inbox is clear</h4>
                <p className="text-xs text-slate-400 max-w-[220px]">
                  You're all caught up! No notifications have arrived yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start p-4 hover:bg-slate-50/70 transition-all cursor-pointer relative group ${
                      !notif.is_read ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    {/* Icon Column */}
                    {renderIcon(notif.type)}

                    {/* Content Column */}
                    <div className="ml-3.5 flex-1 min-w-0 text-left">
                      <div className="text-xs text-slate-700 leading-snug">
                        <span className="font-bold text-slate-900 pr-1">{notif.actor_name}</span>
                        {notif.type === 'invite' && 'invited you to collaborate'}
                        {notif.type === 'mention' && 'mentioned you'}
                        {notif.type === 'dm' && 'sent you a private message'}
                        {notif.type === 'other' && notif.content}
                      </div>

                      {notif.canvas_name && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                          in <span className="italic text-indigo-500 font-bold">{notif.canvas_name}</span>
                        </div>
                      )}

                      {/* Snippet Preview */}
                      {notif.type !== 'invite' && notif.content && (
                        <div className="text-xs text-slate-500 mt-1 truncate bg-slate-50 px-2 py-1 rounded border border-slate-100/50">
                          {notif.content}
                        </div>
                      )}

                      <div className="text-[10px] text-gray-400 mt-1.5 font-medium flex items-center space-x-1.5">
                        <span>{formatRelativeTime(notif.created_at)}</span>
                        {!notif.is_read && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-indigo-600 font-semibold">Unread</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions Overlay */}
                    <div className="ml-2 flex flex-col items-center space-y-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.is_read && (
                        <button
                          onClick={(e) => markAsRead(notif.id, e)}
                          className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-md transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => deleteNotification(notif.id, e)}
                        className="p-1 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-md transition-colors cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Unread dot indicator (if not hovered or no group action) */}
                    {!notif.is_read && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full group-hover:hidden shadow-sm shadow-indigo-600/50 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
