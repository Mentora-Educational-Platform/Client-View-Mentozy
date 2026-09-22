import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bell, Loader2, Megaphone, RefreshCw, Send, Trash2, Pin, Calendar, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { getSupabase } from '../../lib/supabase';
import { getOrgStudents, getOrgTeachers } from '../../lib/api';
import { LinkifiedText } from '../components/common/LinkifiedText';
import { notifyNewAnnouncement } from '../../lib/emailNotifications';
import { dispatchBulkNotifications } from '../../lib/notificationService';

interface Announcement {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

const ORG_ANNOUNCEMENTS_TABLE = 'org_announcements';

const isMissingAnnouncementsTableError = (error: unknown) => {
    if (!error || typeof error !== 'object') return false;

    const code = 'code' in error ? String(error.code) : '';
    const message = 'message' in error ? String(error.message).toLowerCase() : '';
    const details = 'details' in error ? String(error.details).toLowerCase() : '';
    const hint = 'hint' in error ? String(error.hint).toLowerCase() : '';

    return (
        code === '42P01' ||
        code === 'PGRST205' ||
        (message.includes('relation') && message.includes(ORG_ANNOUNCEMENTS_TABLE)) ||
        (message.includes('could not find') && message.includes(ORG_ANNOUNCEMENTS_TABLE)) ||
        details.includes(ORG_ANNOUNCEMENTS_TABLE) ||
        hint.includes(ORG_ANNOUNCEMENTS_TABLE)
    );
};

export function OrgAnnouncementsPage() {
    const { user } = useAuth();
    const { mode, activeOrganization } = useOrganizationMode();

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnnouncementsBackendUnavailable, setIsAnnouncementsBackendUnavailable] = useState(false);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const isTeacher = activeOrganization?.role === 'teacher';
    const isOrgAdmin = Boolean(user?.user_metadata?.is_org) || (mode === 'organization' && activeOrganization?.role !== 'student');
    const canCreateAnnouncement = isOrgAdmin || isTeacher;

    const targetOrgId = useMemo(() => {
        if (activeOrganization?.id) return activeOrganization.id;
        if (user?.id) return user.id;
        return null;
    }, [activeOrganization?.id, user?.id]);

    const loadAnnouncements = async () => {
        if (!targetOrgId) {
            setAnnouncements([]);
            setIsLoading(false);
            return;
        }

        const supabase = getSupabase();
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from(ORG_ANNOUNCEMENTS_TABLE)
                .select('id, title, content, created_at')
                .eq('org_id', targetOrgId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnnouncements(data || []);
            setIsAnnouncementsBackendUnavailable(false);
        } catch (error) {
            console.error('Error loading announcements:', error);
            if (isMissingAnnouncementsTableError(error)) {
                setAnnouncements([]);
                setIsAnnouncementsBackendUnavailable(true);
                return;
            }

            setIsAnnouncementsBackendUnavailable(false);
            toast.error('Failed to load announcements.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, [targetOrgId]);

    const handleSubmitAnnouncement = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!targetOrgId) return;

        if (!title.trim() || !content.trim()) {
            toast.error('Please enter both title and announcement message.');
            return;
        }

        const supabase = getSupabase();
        if (!supabase) return;

        setIsSaving(true);
        try {
            const { error } = await supabase.from(ORG_ANNOUNCEMENTS_TABLE).insert({
                org_id: targetOrgId,
                title: title.trim(),
                content: content.trim(),
            });

            if (error) throw error;

            toast.success('Announcement published successfully.');
            const savedTitle = title.trim();
            const savedContent = content.trim();
            setTitle('');
            setContent('');
            await loadAnnouncements();

            // Background broadcast notifications & emails to organization members
            (async () => {
                try {
                    const [students, teachers] = await Promise.all([
                        getOrgStudents(targetOrgId),
                        getOrgTeachers(targetOrgId)
                    ]);

                    const recipientIds = Array.from(new Set([
                        ...(students || []).map((s: any) => s.student_id || s.id),
                        ...(teachers || []).map((t: any) => t.teacher_id || t.id)
                    ])).filter(Boolean) as string[];

                    const memberEmails = Array.from(new Set([
                        ...(students || []).map((s: any) => s.email),
                        ...(teachers || []).map((t: any) => t.email)
                    ])).filter((email: any) => typeof email === 'string' && email.includes('@') && email.toLowerCase() !== 'no email') as string[];

                    if (recipientIds.length > 0) {
                        await dispatchBulkNotifications({
                            recipientIds,
                            actorId: user?.id,
                            orgId: targetOrgId,
                            type: 'announcement',
                            title: `📢 ${savedTitle}`,
                            body: savedContent,
                            link: '/org-announcements',
                            emailAction: async () => {
                                if (memberEmails.length === 0) return true;
                                return notifyNewAnnouncement({
                                    toEmails: memberEmails,
                                    orgName: activeOrganization?.name || 'Your Organization',
                                    title: savedTitle,
                                    content: savedContent,
                                    authorName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Organization Admin',
                                    announcementUrl: window.location.origin + '/org-announcements',
                                });
                            }
                        });
                    }
                } catch (notifErr) {
                    console.warn('[OrgAnnouncements] Broadcast notification error:', notifErr);
                }
            })();
        } catch (error: any) {
            console.error('Error sharing announcement:', error);
            toast.error(error.message || 'Failed to share announcement. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            const { error } = await supabase.from(ORG_ANNOUNCEMENTS_TABLE).delete().eq('id', id);
            if (error) throw error;
            toast.success('Announcement removed');
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (err: any) {
            console.error('Error deleting announcement:', err);
            toast.error('Failed to delete announcement');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 font-mono text-gray-900">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#eff3ff] border-4 border-gray-900 p-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black uppercase tracking-wider bg-white border-2 border-gray-900 px-2.5 py-0.5 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                {canCreateAnnouncement ? 'ORGANIZATION BROADCAST' : 'STUDENT NOTICE BOARD'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">ANNOUNCEMENTS</h1>
                        <p className="text-sm font-bold mt-2 text-gray-700">
                            {canCreateAnnouncement
                                ? 'Broadcast alerts, exam schedules, and updates to all organization students.'
                                : 'Stay up to date with the latest news, notices, and updates from your institute.'}
                        </p>
                    </div>
                    <button
                        onClick={loadAnnouncements}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-5 py-3 border-2 border-gray-900 text-sm font-black text-gray-900 bg-white hover:bg-[#eff3ff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        REFRESH
                    </button>
                </div>

                {/* Create Form for Org Admins & Teachers */}
                {canCreateAnnouncement && (
                    <form onSubmit={handleSubmitAnnouncement} className="bg-white border-4 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-6">
                        <div className="flex items-center gap-3 text-lg font-black text-gray-900 border-b-4 border-gray-900 pb-4">
                            <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <Megaphone className="w-5 h-5 text-gray-900" />
                            </div>
                            WRITE & PUBLISH ANNOUNCEMENT
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-black text-gray-900 uppercase">Announcement Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Next Week Live Workshop & Exam Schedule"
                                className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-gray-900 bg-[#FAF9F6] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-black text-gray-900 uppercase">Announcement Message / Details</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                placeholder="Write your full message for the student cohort..."
                                className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-gray-900 bg-[#FAF9F6] shadow-[2px_2px_0px_rgba(0,0,0,1)] resize-y"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#eff3ff] text-gray-900 font-black border-2 border-gray-900 hover:bg-[#eff3ff]/85 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-60 cursor-pointer"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            PUBLISH TO STUDENTS
                        </button>
                    </form>
                )}

                {/* Announcements List */}
                <section className="bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="px-6 py-4 border-b-4 border-gray-900 bg-[#eff3ff] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white border-2 border-gray-900 flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                <Bell className="w-4 h-4 text-gray-900" />
                            </div>
                            <h2 className="font-black text-gray-900 uppercase">Published Announcements ({announcements.length})</h2>
                        </div>
                    </div>

                    {isAnnouncementsBackendUnavailable && (
                        <div className="mx-6 mt-6 border-2 border-gray-900 bg-[#eff3ff] p-4 text-sm font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            Announcements backend is not configured yet. Showing an empty state for now.
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-16 flex justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="py-16 text-center text-gray-500 font-bold uppercase space-y-1">
                            <p className="text-gray-900 text-base">No announcements yet.</p>
                            <p className="text-xs text-gray-500">
                                {canCreateAnnouncement
                                    ? 'Use the form above to share your first announcement with students.'
                                    : 'When teachers publish notices, they will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y-4 divide-gray-900">
                            {announcements.map((announcement) => (
                                <article key={announcement.id} className="p-6 hover:bg-[#eff3ff]/10 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-[#eff3ff] border border-gray-900 px-2 py-0.5 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                    Notice
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{announcement.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2 self-start sm:self-auto">
                                            <span className="text-xs font-black text-gray-500 border-2 border-gray-900 bg-[#FAF9F6] px-2 py-1 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                {new Date(announcement.created_at).toLocaleString()}
                                            </span>
                                            {canCreateAnnouncement && (
                                                <button
                                                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                    className="p-1.5 text-gray-500 hover:text-rose-600 bg-white border-2 border-gray-900 hover:bg-rose-50 shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer"
                                                    title="Delete Announcement"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        <LinkifiedText text={announcement.content} showIcon />
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}

export default OrgAnnouncementsPage;
