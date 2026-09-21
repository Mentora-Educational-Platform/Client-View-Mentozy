import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { 
    Clock, Calendar, User, CheckCircle2, AlertCircle, 
    Eye, Check, X, FileText, Image, Search, RefreshCw,
    ArrowUpRight, MessageSquare, Award, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { LinkifiedText } from '../components/common/LinkifiedText';
import { notifyTaskGraded } from '../../lib/emailNotifications';
import { dispatchNotification } from '../../lib/notificationService';

interface Submission {
    id: string;
    taskId: string;
    taskTitle: string;
    studentId?: string;
    studentName: string;
    studentEmail: string;
    studentAvatar?: string;
    submittedAt: string;
    submissionText?: string;
    files: Array<{
        name: string;
        size: string;
        type: string;
        url?: string;
    }>;
    status: 'pending' | 'passed' | 'redo' | 'graded';
    grade?: string;
    feedback?: string;
    gradedAt?: string;
}

export function OrgSubmissionsPage() {
    const { user } = useAuth();
    const { activeOrganization } = useOrganizationMode();
    const isStudent = activeOrganization?.role === 'student';

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal Review / Detail State
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [gradeValue, setGradeValue] = useState('Pass');
    const [feedbackText, setFeedbackText] = useState('');
    const [submittingEvaluation, setSubmittingEvaluation] = useState(false);
    const [activeFilePreview, setActiveFilePreview] = useState<{ name: string; size?: string; type: string; url?: string } | null>(null);

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
            if (!currentUser) {
                setLoading(false);
                return;
            }

            const targetOrgId = activeOrganization?.id || currentUser.id;

            // 2. Query tasks to map IDs, titles, and owners
            const { data: dbTasks, error: taskError } = await client
                .from('org_tasks')
                .select('id, title, org_id')
                .eq('org_id', targetOrgId);

            if (taskError) throw taskError;

            const tasksMap: Record<string, { title: string; org_id: string }> = {};
            const orgTaskIds: string[] = [];
            if (dbTasks) {
                dbTasks.forEach(t => {
                    tasksMap[t.id] = { title: t.title, org_id: t.org_id };
                    orgTaskIds.push(t.id);
                });
            }

            const mappedSubs: Submission[] = [];

            if (isStudent) {
                // Fetch ONLY current student's submissions
                let subQuery = client
                    .from('org_task_submissions')
                    .select('*')
                    .eq('student_id', currentUser.id);

                if (orgTaskIds.length > 0) {
                    subQuery = subQuery.in('task_id', orgTaskIds);
                }

                const { data: dbSubs, error: subError } = await subQuery;
                if (subError) throw subError;

                if (dbSubs && dbSubs.length > 0) {
                    dbSubs.forEach((sub: any) => {
                        const taskInfo = tasksMap[sub.task_id];
                        mappedSubs.push({
                            id: sub.id,
                            taskId: sub.task_id,
                            taskTitle: taskInfo?.title || 'Organization Task',
                            studentId: currentUser.id,
                            studentName: currentUser.user_metadata?.full_name || 'Me',
                            studentEmail: currentUser.email || '',
                            studentAvatar: currentUser.user_metadata?.avatar_url,
                            submittedAt: new Date(sub.created_at).toLocaleString(),
                            submissionText: sub.submission_text || undefined,
                            files: sub.files || [],
                            status: sub.status,
                            grade: sub.grade || undefined,
                            feedback: sub.feedback || undefined,
                            gradedAt: sub.graded_at ? new Date(sub.graded_at).toLocaleString() : undefined
                        });
                    });
                }
            } else {
                // Teacher / Admin: Query all submissions for the active organization tasks
                if (orgTaskIds.length > 0) {
                    const { data: dbSubs, error: subError } = await client
                        .from('org_task_submissions')
                        .select('*')
                        .in('task_id', orgTaskIds);

                    if (subError) throw subError;

                    if (dbSubs && dbSubs.length > 0) {
                        const studentIds = Array.from(new Set(dbSubs.map((s: any) => s.student_id)));
                        const profilesMap: Record<string, { full_name: string; email: string; avatar_url: string }> = {};
                        
                        if (studentIds.length > 0) {
                            const { data: dbProfiles, error: profileError } = await client
                                .from('profiles')
                                .select('id, full_name, email, avatar_url')
                                .in('id', studentIds);

                            if (!profileError && dbProfiles) {
                                dbProfiles.forEach(p => {
                                    profilesMap[p.id] = {
                                        full_name: p.full_name || 'Student',
                                        email: p.email || '',
                                        avatar_url: p.avatar_url || ''
                                    };
                                });
                            }
                        }

                        dbSubs.forEach((sub: any) => {
                            const taskInfo = tasksMap[sub.task_id];
                            const studentInfo = profilesMap[sub.student_id];
                            mappedSubs.push({
                                id: sub.id,
                                taskId: sub.task_id,
                                taskTitle: taskInfo?.title || 'Active Task',
                                studentId: sub.student_id,
                                studentName: studentInfo?.full_name || 'Student User',
                                studentEmail: studentInfo?.email || 'student@org.dev',
                                studentAvatar: studentInfo?.avatar_url,
                                submittedAt: new Date(sub.created_at).toLocaleString(),
                                submissionText: sub.submission_text || undefined,
                                files: sub.files || [],
                                status: sub.status,
                                grade: sub.grade || undefined,
                                feedback: sub.feedback || undefined,
                                gradedAt: sub.graded_at ? new Date(sub.graded_at).toLocaleString() : undefined
                            });
                        });
                    }
                }
            }

            // Sort by submitted time descending
            mappedSubs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            setSubmissions(mappedSubs);
        } catch (error: any) {
            console.error('Failed to load submissions from database:', error);
            toast.error(error.message || 'Could not load submissions. Please retry.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, [activeOrganization?.id, isStudent]);

    // Handle Search Filter
    const filteredSubmissions = submissions.filter(sub => {
        const query = searchQuery.toLowerCase();
        return (
            sub.studentName.toLowerCase().includes(query) ||
            sub.taskTitle.toLowerCase().includes(query) ||
            sub.status.toLowerCase().includes(query) ||
            (sub.grade && sub.grade.toLowerCase().includes(query))
        );
    });

    // Stats calculations
    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        passed: submissions.filter(s => s.status === 'passed').length,
        redo: submissions.filter(s => s.status === 'redo').length,
    };

    // Open grader / detail modal
    const openReview = (sub: Submission) => {
        setSelectedSubmission(sub);
        setGradeValue(sub.grade || 'Pass');
        setFeedbackText(sub.feedback || '');
        setReviewModalOpen(true);
    };

    // Submit Grade/Feedback (Teachers & Admins)
    const submitGrade = async () => {
        if (!selectedSubmission) return;
        const client = supabase;
        if (!client) return;

        setSubmittingEvaluation(true);
        const gradedAtTime = new Date().toISOString();
        const nextStatus = gradeValue === 'Redo' ? 'redo' : 'passed';

        try {
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

            const studentEmail = selectedSubmission.studentEmail;
            const studentName = selectedSubmission.studentName;
            const taskTitle = selectedSubmission.taskTitle;
            const trimmedFeedback = feedbackText.trim();

            setSubmissions(prev => prev.map(s => {
                if (s.id === selectedSubmission.id) {
                    return {
                        ...s,
                        status: nextStatus,
                        grade: gradeValue,
                        feedback: trimmedFeedback,
                        gradedAt: new Date(gradedAtTime).toLocaleString()
                    };
                }
                return s;
            }));

            setReviewModalOpen(false);
            setSelectedSubmission(null);
            toast.success(`Submission evaluated successfully as "${gradeValue}"!`);

            // Dispatch persistent notification & email to student
            if (selectedSubmission.studentId) {
                const isPassed = nextStatus === 'passed';
                const notifTitle = isPassed ? `🎉 Task Passed: ${taskTitle}` : `⚠️ Revision Requested: ${taskTitle}`;
                const notifBody = trimmedFeedback 
                    ? `Status: ${isPassed ? 'Passed' : 'Revision Required'} (${gradeValue}). Feedback: "${trimmedFeedback}"`
                    : `Your submission for "${taskTitle}" was evaluated as ${gradeValue}.`;

                dispatchNotification({
                    recipientId: selectedSubmission.studentId,
                    actorId: user?.id,
                    orgId: activeOrganization?.id,
                    type: 'grade',
                    title: notifTitle,
                    body: notifBody,
                    link: '/student-dashboard',
                    sourceType: 'org_task_submissions',
                    sourceId: selectedSubmission.id,
                    emailAction: async () => {
                        if (studentEmail && studentEmail !== 'student@org.dev') {
                            return notifyTaskGraded({
                                toEmail: studentEmail,
                                studentName: studentName,
                                taskTitle: taskTitle,
                                status: nextStatus as 'passed' | 'redo',
                                feedbackNote: trimmedFeedback || undefined,
                                taskUrl: window.location.origin + '/student-dashboard',
                            });
                        }
                        return false;
                    }
                });
            }
        } catch (err: any) {
            console.error('Failed to submit evaluation to database:', err);
            toast.error(err.message || 'Failed to submit evaluation. Check permissions.');
        } finally {
            setSubmittingEvaluation(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 font-mono text-gray-900">
                
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#eff3ff] border-4 border-gray-900 p-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black uppercase tracking-wider bg-white border-2 border-gray-900 px-2.5 py-0.5 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                {isStudent ? 'STUDENT PORTAL' : 'EVALUATION & GRADING'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">
                            {isStudent ? 'MY SUBMISSIONS' : 'STUDENT SUBMISSIONS'}
                        </h1>
                        <p className="text-sm font-bold text-gray-700 mt-2">
                            {isStudent 
                                ? 'Track your submitted tasks, mentor grades, and feedback notes.' 
                                : 'View, evaluate, and grade assignments submitted by organization students.'}
                        </p>
                    </div>
                    <button
                        onClick={loadSubmissions}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-3 border-2 border-gray-900 text-sm font-black text-gray-900 bg-white hover:bg-[#eff3ff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        REFRESH
                    </button>
                </div>

                {/* Dashboard Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-5 border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                {isStudent ? 'Total Submitted' : 'Total Received'}
                            </p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-5 border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                {isStudent ? 'In Review' : 'Pending Review'}
                            </p>
                            <p className="text-4xl font-black text-[#f39c12] mt-2">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#fcf3cf] border-2 border-gray-900 flex items-center justify-center text-[#f39c12] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                    </div>
                    <div className="bg-white p-5 border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                {isStudent ? 'Approved / Passed' : 'Approved / Passed'}
                            </p>
                            <p className="text-4xl font-black text-[#2ecc71] mt-2">{stats.passed}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#e8f8f5] border-2 border-gray-900 flex items-center justify-center text-[#2ecc71] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-5 border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                {isStudent ? 'Revisions Needed' : 'Redos Requested'}
                            </p>
                            <p className="text-4xl font-black text-[#e74c3c] mt-2">{stats.redo}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#fdebd0] border-2 border-gray-900 flex items-center justify-center text-[#e74c3c] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                    
                    {/* Search & Filter Header */}
                    <div className="p-5 border-b-4 border-gray-900 bg-[#eff3ff] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="w-5 h-5 text-gray-900 absolute left-3 top-3.5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isStudent ? "Search by task or status..." : "Search by student, task, or status..."}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-900 bg-[#FAF9F6] focus:outline-none focus:bg-[#eff3ff] text-sm font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            />
                        </div>
                        <div className="text-xs font-black uppercase tracking-wider bg-white border-2 border-gray-900 px-3 py-1.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            Showing {filteredSubmissions.length} submissions
                        </div>
                    </div>

                    {/* Table View */}
                    {loading ? (
                        <div className="py-20 text-center">
                            <RefreshCw className="w-10 h-10 animate-spin text-gray-900 mx-auto mb-4" />
                            <p className="text-sm font-black uppercase">Loading submissions...</p>
                        </div>
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">
                            <AlertCircle className="w-12 h-12 text-gray-900 mx-auto mb-3" />
                            <p className="font-black text-gray-900 uppercase">No submissions found</p>
                            <p className="text-xs font-bold text-gray-500 mt-1">
                                {isStudent 
                                    ? "You haven't submitted any tasks yet. Head over to Active Task Spaces to submit."
                                    : "Ready for student submissions to arrive."}
                            </p>
                            {isStudent && (
                                <Link
                                    to="/student-dashboard"
                                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#eff3ff] border-2 border-gray-900 text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff]/80"
                                >
                                    Browse Tasks →
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#eff3ff] border-b-4 border-gray-900 text-xs font-black text-gray-900 uppercase tracking-widest">
                                        {!isStudent && <th className="p-4 pl-6 border-r-2 border-gray-900">Student</th>}
                                        <th className={`p-4 border-r-2 border-gray-900 ${isStudent ? 'pl-6' : ''}`}>Task</th>
                                        <th className="p-4 border-r-2 border-gray-900">Submitted At</th>
                                        <th className="p-4 border-r-2 border-gray-900">Attachments</th>
                                        <th className="p-4 border-r-2 border-gray-900">Status & Grade</th>
                                        {isStudent && <th className="p-4 border-r-2 border-gray-900">Mentor Feedback</th>}
                                        <th className="p-4 pr-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-900 text-sm font-bold">
                                    {filteredSubmissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-[#eff3ff]/10 transition-colors">
                                            {/* Student Card (Staff only) */}
                                            {!isStudent && (
                                                <td className="p-4 pl-6 border-r-2 border-gray-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center text-gray-900 font-bold overflow-hidden shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                                            {sub.studentAvatar ? (
                                                                <img src={sub.studentAvatar} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-5 h-5 text-gray-900" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-950 uppercase">{sub.studentName}</p>
                                                            <p className="text-[10px] text-gray-500 mt-0.5">{sub.studentEmail}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Task Name */}
                                            <td className={`p-4 border-r-2 border-gray-900 ${isStudent ? 'pl-6' : ''}`}>
                                                <div className="max-w-[240px]">
                                                    <span className="text-[10px] font-black text-gray-700 bg-[#eff3ff] border border-gray-900 px-2 py-0.5 shadow-[1px_1px_0px_rgba(0,0,0,1)] block w-fit mb-1.5 uppercase">
                                                        Task Space
                                                    </span>
                                                    <Link 
                                                        to={`/tasks/${sub.taskId}`}
                                                        className="font-black text-gray-900 hover:text-indigo-600 truncate uppercase flex items-center gap-1 group"
                                                        title={sub.taskTitle}
                                                    >
                                                        <span className="truncate">{sub.taskTitle}</span>
                                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                    </Link>
                                                </div>
                                            </td>

                                            {/* Submitted At */}
                                            <td className="p-4 text-gray-700 font-bold text-xs border-r-2 border-gray-900 whitespace-nowrap">
                                                {sub.submittedAt}
                                            </td>

                                            {/* Files list */}
                                            <td className="p-4 border-r-2 border-gray-900">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {sub.files.length === 0 ? (
                                                        <span className="text-[11px] text-gray-400 font-bold italic">No files attached</span>
                                                    ) : (
                                                        sub.files.map((file, i) => (
                                                            <span 
                                                                key={i} 
                                                                className={`text-[10px] font-black px-2.5 py-1 flex items-center gap-1.5 border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] ${
                                                                    file.type === 'pdf' 
                                                                        ? 'bg-rose-100 text-rose-900' 
                                                                        : 'bg-indigo-100 text-indigo-900'
                                                                }`}
                                                            >
                                                                {file.type === 'pdf' ? <FileText className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                                                                {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status & Grade Badge */}
                                            <td className="p-4 border-r-2 border-gray-900">
                                                <div className="space-y-1">
                                                    {sub.status === 'pending' && (
                                                        <span className="text-xs font-black text-[#f39c12] bg-[#fcf3cf] border-2 border-[#f39c12] px-3 py-1 flex items-center gap-1.5 w-fit shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                                            <span className="w-2 h-2 bg-[#f39c12] rounded-full animate-pulse" />
                                                            {isStudent ? 'IN REVIEW' : 'NEEDS GRADING'}
                                                        </span>
                                                    )}
                                                    {sub.status === 'passed' && (
                                                        <span className="text-xs font-black text-[#2ecc71] bg-[#e8f8f5] border-2 border-[#2ecc71] px-3 py-1 flex items-center gap-1.5 w-fit shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                                            <Check className="w-4 h-4 text-[#2ecc71]" />
                                                            PASSED {sub.grade ? `(${sub.grade})` : ''}
                                                        </span>
                                                    )}
                                                    {sub.status === 'redo' && (
                                                        <span className="text-xs font-black text-[#e74c3c] bg-[#fdebd0] border-2 border-[#e74c3c] px-3 py-1 flex items-center gap-1.5 w-fit shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                                            <X className="w-4 h-4 text-[#e74c3c]" />
                                                            REVISION REQUIRED
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Feedback Snippet (Student View) */}
                                            {isStudent && (
                                                <td className="p-4 border-r-2 border-gray-900">
                                                    {sub.feedback ? (
                                                        <div className="text-xs text-gray-800 font-bold max-w-[200px] truncate" title={sub.feedback}>
                                                            "<LinkifiedText text={sub.feedback} />"
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400 font-bold italic">
                                                            {sub.status === 'pending' ? 'Pending evaluation...' : 'No comments'}
                                                        </span>
                                                    )}
                                                </td>
                                            )}

                                            {/* Actions */}
                                            <td className="p-4 pr-6 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => openReview(sub)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border-2 border-gray-900 bg-[#eff3ff] hover:bg-[#eff3ff]/80 text-gray-900 font-black text-xs transition-all active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {isStudent ? 'VIEW DETAILS' : 'GRADE'}
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

            {/* Submissions Review / Grader / Details Modal */}
            {reviewModalOpen && selectedSubmission && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
                    <div className="bg-white border-4 border-gray-900 max-w-2xl w-full overflow-hidden shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="p-6 border-b-4 border-gray-900 bg-[#eff3ff] flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">
                                    {isStudent ? 'SUBMISSION DETAILS & FEEDBACK' : 'REVIEW STUDENT SUBMISSION'}
                                </h3>
                                <p className="text-xs font-bold text-gray-700 mt-1">
                                    {isStudent ? `Task: ${selectedSubmission.taskTitle}` : `Student: ${selectedSubmission.studentName}`}
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    setReviewModalOpen(false);
                                    setSelectedSubmission(null);
                                    setActiveFilePreview(null);
                                }}
                                className="p-2 text-gray-900 hover:bg-white border-2 border-gray-900 transition-colors shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] bg-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#FAF9F6]">
                            
                            {/* Task details bar */}
                            <div className="p-4 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {isStudent ? 'Assigned Task' : 'Grading Task'}
                                    </span>
                                    <h4 className="text-lg font-black text-gray-900 mt-1 uppercase">{selectedSubmission.taskTitle}</h4>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-bold">
                                        <Clock className="w-4 h-4 text-gray-900" />
                                        <span>Submitted on: {selectedSubmission.submittedAt}</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/tasks/${selectedSubmission.taskId}`}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eff3ff] border-2 border-gray-900 text-xs font-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff]/80 self-start sm:self-center"
                                >
                                    Task Space <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* Student Submission Text / Notes */}
                            {selectedSubmission.submissionText && (
                                <div className="p-4 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-1.5">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                        {isStudent ? 'Your Submission Notes' : 'Student Text Submission'}
                                    </span>
                                    <p className="text-sm font-bold text-gray-900 whitespace-pre-wrap leading-relaxed">
                                        <LinkifiedText text={selectedSubmission.submissionText} showIcon />
                                    </p>
                                </div>
                            )}

                            {/* Files Section */}
                            {selectedSubmission.files.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-xs font-black text-gray-700 bg-white border-2 border-gray-900 px-3 py-1 w-fit uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                        Submitted Attachments ({selectedSubmission.files.length})
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedSubmission.files.map((file, i) => (
                                            <div 
                                                key={i}
                                                className="p-3.5 border-2 border-gray-900 flex items-center gap-3 bg-white hover:bg-[#eff3ff] transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                                                onClick={() => {
                                                    if (file.type === 'pdf' && file.url) {
                                                        window.open(file.url, '_blank');
                                                    }
                                                    setActiveFilePreview(file);
                                                }}
                                            >
                                                {file.type === 'pdf' ? (
                                                    <FileText className="w-8 h-8 text-rose-500 flex-shrink-0" />
                                                ) : (
                                                    <Image className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black text-gray-900 truncate uppercase">{file.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{file.size} • Click to {file.type === 'image' ? 'Preview' : 'Open PDF'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Interactive Attachment Previewer */}
                            {activeFilePreview && (
                                <div className="p-4 border-2 border-gray-900 bg-white relative space-y-3 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                    <div className="flex items-center justify-between text-xs font-black text-gray-900 uppercase border-b-2 border-gray-900 pb-2">
                                        <span className="flex items-center gap-2">
                                            {activeFilePreview.type === 'pdf' ? <FileText className="w-4 h-4 text-rose-500" /> : <Image className="w-4 h-4 text-indigo-500" />}
                                            {activeFilePreview.type === 'pdf' ? 'PDF Attachment View:' : 'Screenshot Preview:'} {activeFilePreview.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {activeFilePreview.url && (
                                                <button
                                                    onClick={() => window.open(activeFilePreview.url, '_blank')}
                                                    className="text-indigo-600 hover:text-indigo-800 font-black uppercase text-[10px] border border-gray-900 px-2 py-0.5 bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                                                >
                                                    Open Full Window ↗
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setActiveFilePreview(null)}
                                                className="text-gray-500 hover:text-rose-600 font-black uppercase text-[10px] border border-gray-900 px-2 py-0.5 bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                                            >
                                                Close Preview
                                            </button>
                                        </div>
                                    </div>

                                    {activeFilePreview.type === 'image' ? (
                                        <div className="w-full max-h-[420px] overflow-auto bg-slate-950 border-2 border-gray-900 flex items-center justify-center p-3">
                                            <img 
                                                src={activeFilePreview.url || `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='100%25' height='100%25' fill='%231e1b4b'/%3E%3Ctext x='50%25' y='45%25' fill='%23818cf8' font-family='sans-serif' font-size='22' font-weight='bold' text-anchor='middle'%3EATTACHMENT PREVIEW%3C/text%3E%3Ctext x='50%25' y='55%25' fill='%23a5b4fc' font-family='sans-serif' font-size='14' text-anchor='middle'%3E${encodeURIComponent(activeFilePreview.name)}%3C/text%3E%3C/svg%3E`} 
                                                alt={activeFilePreview.name} 
                                                className="max-w-full max-h-[390px] object-contain rounded border border-slate-700 shadow-lg" 
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-[400px] border-2 border-gray-900 bg-gray-100 relative">
                                            {activeFilePreview.url ? (
                                                <iframe 
                                                    src={activeFilePreview.url} 
                                                    className="w-full h-full border-none"
                                                    title={activeFilePreview.name}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-900 p-6 flex flex-col items-center justify-center text-center space-y-4">
                                                    <FileText className="w-14 h-14 text-rose-400 animate-bounce" />
                                                    <div>
                                                        <h6 className="text-white font-bold text-base uppercase">{activeFilePreview.name}</h6>
                                                        <p className="text-slate-400 text-xs mt-1 max-w-md">PDF attachment preview.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Student Mode Feedback Display */}
                            {isStudent ? (
                                <div className="space-y-4 pt-4 border-t-2 border-gray-900">
                                    <h5 className="text-xs font-black text-gray-700 bg-white border-2 border-gray-900 px-3 py-1 w-fit uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                        Mentor Evaluation & Feedback
                                    </h5>

                                    <div className="p-5 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                            <span className="text-xs font-black text-gray-500 uppercase">Assigned Grade:</span>
                                            <span className="text-sm font-black px-3 py-1 bg-[#eff3ff] border border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                {selectedSubmission.grade || (selectedSubmission.status === 'passed' ? 'Pass' : 'Pending Evaluation')}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 pt-1">
                                            <span className="text-xs font-black text-gray-500 uppercase block">Mentor Comments:</span>
                                            {selectedSubmission.feedback ? (
                                                <div className="text-sm font-bold text-gray-900 bg-[#FAF9F6] border border-gray-900 p-3 leading-relaxed">
                                                    "<LinkifiedText text={selectedSubmission.feedback} showIcon />"
                                                </div>
                                            ) : (
                                                <p className="text-xs font-bold text-gray-400 italic">
                                                    {selectedSubmission.status === 'pending'
                                                        ? 'Your submission is queued for mentor review.'
                                                        : 'No specific comments provided by mentor.'}
                                                </p>
                                            )}
                                        </div>

                                        {selectedSubmission.gradedAt && (
                                            <div className="text-[10px] font-bold text-gray-400 text-right pt-2 border-t border-gray-100">
                                                Evaluated on {selectedSubmission.gradedAt}
                                            </div>
                                        )}
                                    </div>

                                    {selectedSubmission.status === 'redo' && (
                                        <div className="p-4 bg-[#fdebd0] border-2 border-[#e74c3c] shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-black text-[#e74c3c] uppercase">Correction Requested</p>
                                                <p className="text-[11px] font-bold text-gray-800 mt-0.5">Please review feedback and re-submit your task.</p>
                                            </div>
                                            <Link
                                                to={`/tasks/${selectedSubmission.taskId}`}
                                                className="px-4 py-2 bg-[#e74c3c] text-white border-2 border-gray-900 font-black text-xs uppercase shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:bg-[#e74c3c]/90 whitespace-nowrap"
                                            >
                                                Re-Submit Task →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Teacher / Admin Grading Input Box */
                                <div className="space-y-4 pt-4 border-t-2 border-gray-900">
                                    <h5 className="text-xs font-black text-gray-700 bg-white border-2 border-gray-900 px-3 py-1 w-fit uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                        Evaluate Task
                                    </h5>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-gray-700 uppercase">Set Grade / Status</label>
                                            <select
                                                value={gradeValue}
                                                onChange={(e) => setGradeValue(e.target.value)}
                                                className="w-full px-3.5 py-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-sm bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
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
                                        <label className="block text-xs font-black text-gray-700 uppercase">Feedback Notes</label>
                                        <textarea
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            rows={3}
                                            placeholder="Add encouragement, recommendations, or explain why correction is required..."
                                            className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] text-sm font-bold bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] resize-y"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 border-t-4 border-gray-900 bg-[#eff3ff] flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setReviewModalOpen(false);
                                    setSelectedSubmission(null);
                                    setActiveFilePreview(null);
                                }}
                                className="px-5 py-2.5 border-2 border-gray-900 text-sm font-black text-gray-900 bg-white hover:bg-[#eff3ff] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"
                            >
                                CLOSE
                            </button>
                            {!isStudent && (
                                <button
                                    onClick={submitGrade}
                                    disabled={submittingEvaluation}
                                    className="px-5 py-2.5 bg-[#eff3ff] border-2 border-gray-900 text-gray-900 text-sm font-black hover:bg-[#eff3ff]/80 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                                >
                                    {submittingEvaluation ? 'SUBMITTING...' : 'SUBMIT EVALUATION'}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default OrgSubmissionsPage;
