"use client";
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Loader2, Users, FileText, CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, pendingApps: 0, activeMentors: 0 });
    const [pendingApps, setPendingApps] = useState<any[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            // 1. Fetch Stats
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            // 2. Fetch All Mentors to filter in memory (since status is in JSON)
            const { data: allMentors, error } = await supabase
                .from('mentors')
                .select(`
                    id,
                    company,
                    bio, 
                    created_at,
                    profiles:user_id ( full_name, phone )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // In-memory filtering
            const pending: any[] = [];
            let activeCount = 0;

            allMentors?.forEach((mentor: any) => {
                try {
                    // Safe parse if string, otherwise use object
                    const bioData = typeof mentor.bio === 'string' ? JSON.parse(mentor.bio) : mentor.bio;
                    // Check for pending status (or assume pending if type is offline and no status?)
                    // For now strict check
                    if (bioData?.status === 'pending') {
                        pending.push(mentor);
                    } else if (bioData?.status === 'active') {
                        activeCount++;
                    }
                } catch (e) {
                    console.warn("Failed to parse bio for mentor", mentor.id);
                }
            });

            setStats({
                totalUsers: totalUsers || 0,
                pendingApps: pending.length,
                activeMentors: activeCount
            });

            setPendingApps(pending || []);
        } catch (error: any) {
            console.error('Error fetching admin data:', error);
            const msg = error?.message || error?.error_description || JSON.stringify(error);
            toast.error(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (mentorId: string, action: 'approve' | 'reject') => {
        setProcessingId(mentorId);
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            // Fetch current bio to preserve other fields
            const { data: current, error: fetchError } = await supabase
                .from('mentors')
                .select('bio')
                .eq('id', mentorId)
                .single();

            if (fetchError || !current) throw new Error("Mentor not found");

            const bioObj = typeof current.bio === 'string' ? JSON.parse(current.bio) : current.bio;
            bioObj.status = action === 'approve' ? 'active' : 'rejected';

            // Update with new JSON
            const { error } = await supabase
                .from('mentors')
                .update({
                    bio: JSON.stringify(bioObj),
                    // If someday status column exists, we could update it here too, but for now just JSON
                })
                .eq('id', mentorId);

            if (error) throw error;

            toast.success(action === 'approve' ? 'Application Approved' : 'Application Rejected');

            // Refresh Data
            fetchData();
        } catch (error: any) {
            toast.error(`Failed to ${action} application`);
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-500 w-8 h-8" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage users and institute applications</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">
                        Admin Access
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
                    <StatCard title="Pending Applications" value={stats.pendingApps} icon={FileText} color="amber" />
                    <StatCard title="Active Mentors" value={stats.activeMentors} icon={CheckCircle} color="emerald" />
                </div>

                {/* Pending Applications Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            Pending Organization Approvals
                        </h2>
                    </div>

                    {pendingApps.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 bg-gray-50/50">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500/20" />
                            <p className="font-medium">All caught up!</p>
                            <p className="text-sm">No pending applications found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="p-4">Organization / Founder</th>
                                        <th className="p-4">Contact</th>
                                        <th className="p-4">Details</th>
                                        <th className="p-4">Submission Date</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900">{app.company || 'N/A'}</div>
                                                <div className="text-gray-500 text-xs">{app.profiles?.full_name}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-gray-900">{app.profiles?.email}</div>
                                                <div className="text-gray-500 text-xs">{app.profiles?.phone || 'No phone'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="max-w-xs truncate text-gray-600">
                                                    {/* In a real app, parse the bio JSON/text properly */}
                                                    {app.bio?.substring(0, 50)}...
                                                </div>
                                                <button className="text-amber-600 hover:text-amber-700 text-xs font-semibold mt-1">View Documents</button>
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleAction(app.id, 'reject')}
                                                    disabled={processingId === app.id}
                                                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAction(app.id, 'approve')}
                                                    disabled={processingId === app.id}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow-emerald-500/20 disabled:opacity-50 inline-flex items-center gap-1"
                                                >
                                                    {processingId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                    Approve
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
        emerald: 'bg-emerald-100 text-emerald-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
