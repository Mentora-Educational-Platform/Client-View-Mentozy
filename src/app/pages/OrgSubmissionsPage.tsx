import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { 
    Clock, Calendar, User, CheckCircle2, AlertCircle, 
    Eye, Check, X, FileText, Image, Search, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
    id: string;
    taskId: string;
    taskTitle: string;
    studentName: string;
    studentEmail: string;
    studentAvatar?: string;
    submittedAt: string;
    files: Array<{
        name: string;
        size: string;
        type: string;
    }>;
    status: 'pending' | 'passed' | 'redo' | 'graded';
    grade?: string;
    feedback?: string;
    gradedAt?: string;
}

export function OrgSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal Review State
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [gradeValue, setGradeValue] = useState('Pass');
    const [feedbackText, setFeedbackText] = useState('');
    const [activeScreenshotPreview, setActiveScreenshotPreview] = useState<string | null>(null);

    const loadSubmissions = async () => {
        setLoading(true);
        try {
            const client = supabase;
            if (!client) {
                setLoading(false);
                return;
            }

            // 1. Fetch current logged-in org user details
            const { data: { user: currentUser } } = await client.auth.getUser();

            // 2. Query submissions directly from Supabase Table
            const { data: dbSubs, error: subError } = await client
                .from('org_task_submissions')
                .select(`
                    id,
                    task_id,
                    student_id,
                    files,
                    status,
                    grade,
                    feedback,
                    created_at,
                    graded_at,
                    profiles:student_id (full_name, avatar_url, email),
                    org_tasks:task_id (title, org_id)
                `);

            if (subError) throw subError;

            const mappedSubs: Submission[] = [];

            if (dbSubs) {
                // Filter only submissions corresponding to tasks belonging to the logged-in host
                dbSubs
                    .filter((sub: any) => sub.org_tasks?.org_id === currentUser?.id)
                    .forEach((sub: any) => {
                        mappedSubs.push({
                            id: sub.id,
                            taskId: sub.task_id,
                            taskTitle: sub.org_tasks?.title || 'Active Task',
                            studentName: sub.profiles?.full_name || 'Student User',
                            studentEmail: sub.profiles?.email || 'student@krishnaite.dev',
                            studentAvatar: sub.profiles?.avatar_url,
                            submittedAt: new Date(sub.created_at).toLocaleString(),
                            files: sub.files || [],
                            status: sub.status,
                            grade: sub.grade || undefined,
                            feedback: sub.feedback || undefined,
                            gradedAt: sub.graded_at ? new Date(sub.graded_at).toLocaleString() : undefined
                        });
                    });
            }

            // Sort database entries by submitted time descending
            mappedSubs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            
            setSubmissions(mappedSubs);
        } catch (error) {
            console.error('Failed to load submissions from database:', error);
            toast.error('Could not load student submissions. Make sure database table is active.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    // Handle Search Filter
    const filteredSubmissions = submissions.filter(sub => {
        const query = searchQuery.toLowerCase();
        return (
            sub.studentName.toLowerCase().includes(query) ||
            sub.taskTitle.toLowerCase().includes(query) ||
            sub.status.toLowerCase().includes(query)
        );
    });

    // Stats calculations
    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        passed: submissions.filter(s => s.status === 'passed').length,
        redo: submissions.filter(s => s.status === 'redo').length,
    };

    // Open grader modal
    const openReview = (sub: Submission) => {
        setSelectedSubmission(sub);
        setGradeValue(sub.grade || 'Pass');
        setFeedbackText(sub.feedback || '');
        setReviewModalOpen(true);
    };

    // Submit Grade/Feedback
    const submitGrade = async () => {
        if (!selectedSubmission) return;
        const client = supabase;
        if (!client) return;

        const gradedAtTime = new Date().toISOString();
        const nextStatus = gradeValue === 'Redo' ? 'redo' : 'passed';

        try {
            // Update Database table directly
            const { error: dbError } = await client
                .from('org_task_submissions')
                .update({
                    status: nextStatus,
                    grade: gradeValue,
                    feedback: feedbackText.trim(),
                    graded_at: gradedAtTime
                })
                .eq('id', selectedSubmission.id);

            if (dbError) throw dbError;

            // Update local state to show immediately
            setSubmissions(prev => prev.map(s => {
                if (s.id === selectedSubmission.id) {
                    return {
                        ...s,
                        status: nextStatus,
                        grade: gradeValue,
                        feedback: feedbackText.trim(),
                        gradedAt: new Date(gradedAtTime).toLocaleString()
                    };
                }
                return s;
            }));

            setReviewModalOpen(false);
            setSelectedSubmission(null);
            toast.success(`Submission evaluated successfully as "${gradeValue}"!`);
        } catch (err: any) {
            console.error('Failed to submit evaluation to database:', err);
            toast.error(err.message || 'Failed to submit evaluation. Check SQL table.');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student Submissions</h1>
                        <p className="text-sm text-gray-500">View, evaluate, and grade tasks submitted by students.</p>
                    </div>
                    <button
                        onClick={loadSubmissions}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Submissions
                    </button>
                </div>

                {/* Dashboard Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Received</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Review</p>
                            <p className="text-3xl font-black text-amber-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Clock className="w-5 h-5 animate-pulse" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved / Passed</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.passed}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Redos Requested</p>
                            <p className="text-3xl font-black text-rose-600 mt-1">{stats.redo}</p>
                        </div>
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    
                    {/* Search & Filter Header */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by student, task, or status..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            Showing {filteredSubmissions.length} submissions
                        </div>
                    </div>

                    {/* Table View */}
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm text-gray-500 font-semibold">Loading student work...</p>
                        </div>
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="font-bold text-gray-900">No submissions found</p>
                            <p className="text-xs text-gray-400 mt-1">Ready for student submissions to come in.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <th className="p-4 pl-6">Student</th>
                                        <th className="p-4">Task</th>
                                        <th className="p-4">Submitted At</th>
                                        <th className="p-4">Files</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 pr-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredSubmissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Student Card */}
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                                                        {sub.studentAvatar ? (
                                                            <img src={sub.studentAvatar} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-5 h-5 text-indigo-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-950">{sub.studentName}</p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">{sub.studentEmail}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Task Name */}
                                            <td className="p-4">
                                                <div className="max-w-[240px] truncate">
                                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md block w-fit mb-1 max-w-[150px] truncate">
                                                        Task Space
                                                    </span>
                                                    <span className="font-bold text-gray-900 truncate" title={sub.taskTitle}>
                                                        {sub.taskTitle}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Submitted At */}
                                            <td className="p-4 text-gray-600 font-medium text-xs">
                                                {sub.submittedAt}
                                            </td>

                                            {/* Files list */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {sub.files.map((file, i) => (
                                                        <span 
                                                            key={i} 
                                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                                                                file.type === 'pdf' 
                                                                    ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                            }`}
                                                        >
                                                            {file.type === 'pdf' ? <FileText className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                                                            {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="p-4">
                                                {sub.status === 'pending' && (
                                                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                                        Needs Grading
                                                    </span>
                                                )}
                                                {sub.status === 'passed' && (
                                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        Passed {sub.grade ? `(${sub.grade})` : ''}
                                                    </span>
                                                )}
                                                {sub.status === 'redo' && (
                                                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                                                        <X className="w-3.5 h-3.5 text-rose-600" />
                                                        Redo Required
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 pr-6 text-right">
                                                <button
                                                    onClick={() => openReview(sub)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-sm"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Grade Sub
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

            {/* Submissions Review / Grader Modal */}
            {reviewModalOpen && selectedSubmission && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Review Student Submission</h3>
                                <p className="text-xs text-gray-500">Student: {selectedSubmission.studentName}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setReviewModalOpen(false);
                                    setSelectedSubmission(null);
                                    setActiveScreenshotPreview(null);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-150 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            
                            {/* Task details bar */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grading Task</span>
                                <h4 className="text-base font-extrabold text-gray-900 mt-1">{selectedSubmission.taskTitle}</h4>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-semibold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Submitted on: {selectedSubmission.submittedAt}</span>
                                </div>
                            </div>

                            {/* Files Section */}
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Submitted Attachments</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedSubmission.files.map((file, i) => (
                                        <div 
                                            key={i}
                                            className="p-3.5 border border-gray-150 rounded-2xl flex items-center gap-3 bg-white hover:border-indigo-300 transition-all cursor-pointer group"
                                            onClick={() => {
                                                if (file.type === 'image') {
                                                    setActiveScreenshotPreview(file.name);
                                                } else {
                                                    toast.info(`Simulating opening PDF document "${file.name}"...`);
                                                }
                                            }}
                                        >
                                            {file.type === 'pdf' ? (
                                                <FileText className="w-8 h-8 text-rose-500 flex-shrink-0" />
                                            ) : (
                                                <Image className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{file.name}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{file.size} • Click to {file.type === 'image' ? 'Preview' : 'Open'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Screenshot Lightbox Preview Area */}
                            {activeScreenshotPreview && (
                                <div className="p-3 border border-indigo-100 bg-indigo-50/20 rounded-2xl relative space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-indigo-600">
                                        <span>Image Preview: {activeScreenshotPreview}</span>
                                        <button 
                                            onClick={() => setActiveScreenshotPreview(null)}
                                            className="text-gray-400 hover:text-rose-600 font-extrabold uppercase text-[10px]"
                                        >
                                            Close Preview
                                        </button>
                                    </div>
                                    <div className="w-full h-48 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-slate-500 text-xs border border-indigo-100 flex-col gap-2 relative">
                                        <Image className="w-10 h-10 text-indigo-400 opacity-60 animate-bounce" />
                                        <span className="font-mono font-bold text-slate-400">Mock student workspace screenshot</span>
                                        <span className="text-[10px] text-slate-600">Slack workspace verification & confirmation message</span>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {/* Grading Input Box */}
                            <div className="space-y-4 pt-4 border-t border-gray-150">
                                <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Evaluate Task</h5>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-700">Set Grade / Status</label>
                                        <select
                                            value={gradeValue}
                                            onChange={(e) => setGradeValue(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-sm bg-white"
                                        >
                                            <option value="Pass">Pass</option>
                                            <option value="A+">A+ (Exceptional)</option>
                                            <option value="A">A (Excellent)</option>
                                            <option value="B">B (Good)</option>
                                            <option value="Redo">Request Redo (Needs Correction)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700">Feedback Notes</label>
                                    <textarea
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        rows={3}
                                        placeholder="Add encouragement, recommendations, or explain why correction is required..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm resize-y"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setReviewModalOpen(false);
                                    setSelectedSubmission(null);
                                    setActiveScreenshotPreview(null);
                                }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={submitGrade}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                            >
                                Submit Evaluation
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default OrgSubmissionsPage;
