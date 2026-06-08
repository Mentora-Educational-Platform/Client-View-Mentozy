import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bell, Loader2, Megaphone, RefreshCw, Send } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { getSupabase } from '../../lib/supabase';

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

    const isOrgAdmin = Boolean(user?.user_metadata?.is_org) && mode !== 'organization';

    const targetOrgId = useMemo(() => {
        if (mode === 'organization' && activeOrganization?.id) return activeOrganization.id;
        if (isOrgAdmin && user?.id) return user.id;
        return null;
    }, [activeOrganization?.id, isOrgAdmin, mode, user?.id]);

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

            toast.success('Announcement shared successfully.');
            setTitle('');
            setContent('');
            await loadAnnouncements();
        } catch (error) {
            console.error('Error sharing announcement:', error);
            toast.error('Failed to share announcement. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 font-mono text-gray-900">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#eff3ff] border-4 border-gray-900 p-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">ANNOUNCEMENTS</h1>
                        <p className="text-sm font-bold mt-2 text-gray-700">
                            {isOrgAdmin
                                ? 'Create and publish updates for your students.'
                                : 'Latest updates from your organization.'}
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

                {/* Create Form */}
                {isOrgAdmin && (
                    <form onSubmit={handleSubmitAnnouncement} className="bg-white border-4 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-6">
                        <div className="flex items-center gap-3 text-lg font-black text-gray-900 border-b-4 border-gray-900 pb-4">
                            <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <Megaphone className="w-5 h-5 text-gray-900" />
                            </div>
                            SHARE NEW ANNOUNCEMENT
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-black text-gray-900 uppercase">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Mock test schedule for this week"
                                className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-gray-900 bg-[#FAF9F6] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-black text-gray-900 uppercase">Message</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                placeholder="Write the announcement for your students..."
                                className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-gray-900 bg-[#FAF9F6] shadow-[2px_2px_0px_rgba(0,0,0,1)] resize-y"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#eff3ff] text-gray-900 font-black border-2 border-gray-900 hover:bg-[#eff3ff]/85 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            PUBLISH ANNOUNCEMENT
                        </button>
                    </form>
                )}

                {/* Announcements List */}
                <section className="bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="px-6 py-4 border-b-4 border-gray-900 bg-[#eff3ff] flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border-2 border-gray-900 flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            <Bell className="w-4 h-4 text-gray-900" />
                        </div>
                        <h2 className="font-black text-gray-900 uppercase">Recent Announcements</h2>
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
                        <div className="py-16 text-center text-gray-500 font-bold uppercase">No announcements yet.</div>
                    ) : (
                        <div className="divide-y-4 divide-gray-900">
                            {announcements.map((announcement) => (
                                <article key={announcement.id} className="p-6 hover:bg-[#eff3ff]/10 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{announcement.title}</h3>
                                        <span className="text-xs font-black text-gray-500 border-2 border-gray-900 bg-[#FAF9F6] px-2 py-1 shadow-[1px_1px_0px_rgba(0,0,0,1)] self-start sm:self-auto">
                                            {new Date(announcement.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
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

