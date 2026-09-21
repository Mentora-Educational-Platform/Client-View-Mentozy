import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  Megaphone, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Calendar, 
  Video, 
  UserPlus, 
  Award,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getSupabase, supabase } from '../../../lib/supabase';
import { 
  NotificationRecord, 
  fetchUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../../lib/notificationService';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'message':
      return <MessageSquare className="w-4 h-4 text-indigo-500 flex-shrink-0" />;
    case 'announcement':
      return <Megaphone className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    case 'grade':
      return <Award className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
    case 'task':
    case 'task_submission':
      return <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    case 'forum_reply':
      return <HelpCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />;
    case 'live_session':
      return <Video className="w-4 h-4 text-rose-500 flex-shrink-0" />;
    case 'event':
      return <Calendar className="w-4 h-4 text-cyan-500 flex-shrink-0" />;
    case 'teacher_invitation':
    case 'invitation_accepted':
      return <UserPlus className="w-4 h-4 text-teal-500 flex-shrink-0" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500 flex-shrink-0" />;
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // 1. Initial Fetch
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchUserNotifications(user.id, 40).then(data => {
      if (isMounted) {
        setNotifications(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // 2. Supabase Realtime Subscription
  useEffect(() => {
    if (!user?.id) return;

    const client = getSupabase() || supabase;
    if (!client) return;

    const channel = client
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload: { new: NotificationRecord }) => {
          const newNotif = payload.new;
          setNotifications(prev => {
            // Deduplicate
            if (prev.some(n => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload: { new: NotificationRecord }) => {
          const updatedNotif = payload.new;
          setNotifications(prev =>
            prev.map(n => (n.id === updatedNotif.id ? updatedNotif : n))
          );
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user?.id]);

  // 3. Click Outside Handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: NotificationRecord) => {
    if (!notification.is_read) {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      await markNotificationAsRead(notification.id);
    }

    setIsOpen(false);

    if (notification.link) {
      if (notification.link.startsWith('http://') || notification.link.startsWith('https://')) {
        window.location.href = notification.link;
      } else {
        navigate(notification.link);
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await markAllNotificationsAsRead(user.id);
  };

  if (!user) return null;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-lg flex items-center justify-center cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border border-gray-900 shadow-sm animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] rounded-xl z-50 overflow-hidden font-sans text-left animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-[#FAF9F6] border-b-2 border-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-gray-900 uppercase tracking-wide">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-xs font-semibold text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-gray-800">You're all caught up!</p>
                <p className="text-[11px] text-gray-500 mt-0.5">No notifications right now.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full p-3.5 text-left transition-colors flex gap-3 items-start hover:bg-indigo-50/50 cursor-pointer ${
                    !notif.is_read ? 'bg-indigo-50/30' : 'bg-white'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className={`text-xs truncate ${!notif.is_read ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>

                    {notif.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-bold mt-1.5">
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
