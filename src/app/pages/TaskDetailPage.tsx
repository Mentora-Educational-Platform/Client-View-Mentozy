import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
    Clock, Calendar, ArrowLeft, Building2, 
    Upload, X, FileText, Image, Loader2, CheckCircle2, AlertCircle, Award, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export function TaskDetailPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<any>(null);
    const [orgName, setOrgName] = useState('Your Organization');
    const [loading, setLoading] = useState(true);

    // Submission states
    const [screenshots, setScreenshots] = useState<File[]>([]);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedAt, setSubmittedAt] = useState('');
    const [submittedFiles, setSubmittedFiles] = useState<any[]>([]);
    const [studentName, setStudentName] = useState('Raymond Oyondi');

    // Evaluation feedback states from database
    const [submissionText, setSubmissionText] = useState<string>('');
    const [submissionStatus, setSubmissionStatus] = useState<string>('pending');
    const [grade, setGrade] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');

    useEffect(() => {
        const fetchTaskAndSubmission = async () => {
            const client = supabase;
            if (!taskId || !client) return;

            setLoading(true);
            try {
                // 1. Fetch Task Details
                const { data: taskData, error: taskError } = await client
                    .from('org_tasks')
                    .select('*')
                    .eq('id', taskId)
                    .single();

                if (taskError) throw taskError;
                setTask(taskData);

                // 2. Fetch Organization Profile Name
                if (taskData.org_id) {
                    const { data: orgProfile } = await client
                        .from('profiles')
                        .select('full_name')
                        .eq('id', taskData.org_id)
                        .single();
                    if (orgProfile?.full_name) {
                        setOrgName(orgProfile.full_name);
                    }
                }

                // 3. Fetch Authenticated Student Details & Submissions
                const { data: { user: currentUser } } = await client.auth.getUser();
                if (currentUser) {
                    // Get student name
                    const { data: studProfile } = await client
                        .from('profiles')
                        .select('full_name')
                        .eq('id', currentUser.id)
                        .single();
                    if (studProfile?.full_name) {
                        setStudentName(studProfile.full_name);
                    }

                    // Check for existing database submission
                    const { data: submission, error: subError } = await client
                        .from('org_task_submissions')
                        .select('*')
                        .eq('task_id', taskId)
                        .eq('student_id', currentUser.id)
                        .maybeSingle();

                    // If submission exists, set fields
                    if (submission) {
                        setIsSubmitted(true);
                        setSubmittedAt(new Date(submission.created_at).toLocaleString());
                        setSubmittedFiles(submission.files || []);
                        setSubmissionText(submission.submission_text || '');
                        setSubmissionStatus(submission.status || 'pending');
                        setGrade(submission.grade || '');
                        setFeedback(submission.feedback || '');
                    }
                }
            } catch (err: any) {
                console.error('Error fetching task or submission details:', err);
                toast.error('Could not load task details.');
            } finally {
                setLoading(false);
            }
        };

        fetchTaskAndSubmission();
    }, [taskId]);

    // Handle Screenshot Upload
    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);
        
        // Filter only images
        const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length !== filesArray.length) {
            toast.error('Only image files are allowed for screenshots.');
        }

        const totalScreenshots = [...screenshots, ...imageFiles];
        if (totalScreenshots.length > 3) {
            toast.error('You can upload a maximum of 3 screenshots.');
            setScreenshots(totalScreenshots.slice(0, 3));
        } else {
            setScreenshots(totalScreenshots);
        }
    };

    // Remove Screenshot
    const removeScreenshot = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index));
    };

    // Handle PDF Upload
    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        if (file.type !== 'application/pdf') {
            toast.error('Only PDF documents are allowed.');
            return;
        }

        setPdfFile(file);
    };

    // Remove PDF
    const removePdf = () => {
        setPdfFile(null);
    };

    // Format File Size helper
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // Handle Task Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const client = supabase;
        if (!client) {
            toast.error('Database client not initialized.');
            return;
        }

        if (!submissionText.trim() && screenshots.length === 0 && !pdfFile) {
            toast.error('Please enter submission text or upload at least one file before submitting.');
            return;
        }

        const { data: { user: currentUser } } = await client.auth.getUser();
        if (!currentUser) {
            toast.error('You must be logged in to submit tasks.');
            return;
        }

        setIsSubmitting(true);
        setSubmitProgress(15);

        // Upload progress steps
        const interval = setInterval(() => {
            setSubmitProgress(prev => (prev >= 90 ? 90 : prev + 25));
        }, 100);

        try {
            const fileToDataUrl = (file: File): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(file);
                });
            };

            const screenshotItems = await Promise.all(
                screenshots.map(async f => ({
                    name: f.name,
                    size: formatBytes(f.size),
                    type: 'image',
                    url: await fileToDataUrl(f)
                }))
            );

            const pdfItems = pdfFile ? [{
                name: pdfFile.name,
                size: formatBytes(pdfFile.size),
                type: 'pdf',
                url: await fileToDataUrl(pdfFile)
            }] : [];

            const filesSummary = [...screenshotItems, ...pdfItems];

            const nowStr = new Date().toISOString();

            // Store in Database table
            const { error: dbError } = await client
                .from('org_task_submissions')
                .upsert({
                    task_id: taskId,
                    student_id: currentUser.id,
                    submission_text: submissionText.trim(),
                    files: filesSummary,
                    status: 'pending',
                    created_at: nowStr,
                    grade: null,
                    feedback: null,
                    graded_at: null
                }, {
                    onConflict: 'task_id,student_id'
                });

            if (dbError) throw dbError;

            clearInterval(interval);
            setSubmitProgress(100);

            setSubmittedAt(new Date(nowStr).toLocaleString());
            setSubmittedFiles(filesSummary);
            setSubmissionStatus('pending');
            setGrade('');
            setFeedback('');
            setIsSubmitted(true);
            
            toast.success('Task submitted successfully! 🎉');
        } catch (err: any) {
            console.error('Error submitting task to database:', err);
            toast.error(err.message || 'Failed to submit task. Check if SQL table exists.');
        } finally {
            clearInterval(interval);
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-500 font-bold">Opening Task Space...</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans text-center p-6">
                <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Task Not Found</h2>
                <p className="text-gray-500 text-sm mb-6 max-w-sm">This task might have been removed or you do not have permission to view it.</p>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const isOverdue = task.deadline ? new Date(task.deadline).getTime() < Date.now() : false;
    const canSubmit = screenshots.length > 0 || pdfFile !== null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16">
            
            {/* Top Minimal Navigation Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Dashboard
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mentozy Workspace</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8">
                
                {/* Task Header Summary Card */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-indigo-50 rounded-full pointer-events-none" />
                    
                    <div className="relative z-10 space-y-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-extrabold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" />
                                {orgName}
                            </span>
                            {task.deadline && (
                                <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                                    isOverdue 
                                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {isOverdue ? 'Overdue' : 'Active Deadline'}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                            {task.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-gray-500 font-semibold border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>Assigned: {new Date(task.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                            </div>
                            {task.deadline && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>Due: {new Date(task.deadline).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Workspace Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Side: Task Instructions Space */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                        <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
                            <span>Task Instructions Space</span>
                            <span>Read Only</span>
                        </div>
                        
                        <div className="p-8 md:p-12 flex-1 prose prose-indigo max-w-none text-left">
                            <div 
                                className="text-gray-850 leading-relaxed font-serif text-[16px] outline-none"
                                style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                                dangerouslySetInnerHTML={{ __html: task.content || '<p className="text-gray-400 italic">No details provided for this task.</p>' }}
                            />
                        </div>
                    </div>

                    {/* Right Side: Submit Workspace Panel */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6">
                        
                        <div className="border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-black text-gray-900">Your Submission</h3>
                            <p className="text-xs text-gray-500 mt-1">Upload files to submit your work for review.</p>
                        </div>

                        {/* Submission status view */}
                        {isSubmitted ? (
                            <div className="space-y-5">
                                
                                {/* Gradings/Evaluation Card from teacher */}
                                {submissionStatus === 'passed' && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl space-y-2.5">
                                        <div className="flex items-start gap-3">
                                            <Award className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-extrabold text-emerald-950">Submission Approved</h4>
                                                <p className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded w-fit mt-1">Grade: {grade || 'Pass'}</p>
                                            </div>
                                        </div>
                                        {feedback && (
                                            <div className="text-xs text-emerald-900 bg-white/60 p-3 rounded-xl border border-emerald-100 whitespace-pre-wrap leading-relaxed font-medium">
                                                <span className="font-bold text-emerald-950 block mb-0.5">Teacher Feedback:</span>
                                                {feedback}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {submissionStatus === 'redo' && (
                                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-extrabold text-rose-950">Revision Requested</h4>
                                                <p className="text-[10px] text-rose-700 font-semibold mt-0.5">Please update and resubmit your files.</p>
                                            </div>
                                        </div>
                                        {feedback && (
                                            <div className="text-xs text-rose-900 bg-white/60 p-3 rounded-xl border border-rose-100 whitespace-pre-wrap leading-relaxed font-medium">
                                                <span className="font-bold text-rose-950 block mb-0.5">Revision Notes:</span>
                                                {feedback}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {submissionStatus === 'pending' && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-extrabold text-emerald-950">Task Submitted ✓</h4>
                                                <p className="text-xs text-emerald-800 font-medium mt-0.5">Your submission has been recorded successfully.</p>
                                                <p className="text-[10px] text-emerald-700 font-semibold mt-1">Submitted on: {submittedAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {submittedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Submitted Files</p>
                                        <div className="divide-y divide-gray-100 border border-gray-150 rounded-2xl overflow-hidden bg-gray-50/50">
                                            {submittedFiles.map((file, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => {
                                                        if (file.url) {
                                                            window.open(file.url, '_blank');
                                                        } else {
                                                            toast.info(`Attachment ${file.name}`);
                                                        }
                                                    }}
                                                    className="p-3.5 flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-100/80 transition-colors"
                                                >
                                                    {file.type === 'pdf' ? (
                                                        <FileText className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                                    ) : (
                                                        <Image className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-gray-900 truncate text-xs">{file.name}</p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">{file.size} • Click to open</p>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => navigate(-1)}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Return to Dashboard
                                </button>

                                {submissionStatus !== 'passed' && (
                                    <button
                                        onClick={() => {
                                            setIsSubmitted(false);
                                            setScreenshots([]);
                                            setPdfFile(null);
                                        }}
                                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all"
                                    >
                                        Update / Resubmit Files
                                    </button>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                {/* Submission Text Notes Area */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                        Submission Text / Notes
                                    </label>
                                    <textarea
                                        value={submissionText}
                                        onChange={(e) => setSubmissionText(e.target.value)}
                                        rows={3}
                                        placeholder="Type your submission notes or summary here..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50/50 resize-y"
                                    />
                                </div>

                                {/* Screenshots Upload Area */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                        Screenshots (Max 3)
                                    </label>
                                    
                                    {screenshots.length < 3 && (
                                        <div className="relative border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-4 transition-colors bg-gray-50/30 hover:bg-indigo-50/5 flex flex-col items-center justify-center cursor-pointer group">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                multiple 
                                                onChange={handleScreenshotChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                disabled={isSubmitting}
                                            />
                                            <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors mb-1.5" />
                                            <span className="text-xs font-bold text-gray-700">Add Screenshots</span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">Images up to 5MB</span>
                                        </div>
                                    )}

                                    {/* Screenshots list */}
                                    {screenshots.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {screenshots.map((file, idx) => {
                                                const url = URL.createObjectURL(file);
                                                return (
                                                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeScreenshot(idx)}
                                                            className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-rose-600 transition-all opacity-90"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* PDF Upload Area */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                                        PDF Document (Max 1)
                                    </label>

                                    {!pdfFile ? (
                                        <div className="relative border-2 border-dashed border-gray-200 hover:border-rose-400 rounded-2xl p-4 transition-colors bg-gray-50/30 hover:bg-rose-50/5 flex flex-col items-center justify-center cursor-pointer group">
                                            <input 
                                                type="file" 
                                                accept=".pdf" 
                                                onChange={handlePdfChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                disabled={isSubmitting}
                                            />
                                            <FileText className="w-5 h-5 text-gray-400 group-hover:text-rose-600 transition-colors mb-1.5" />
                                            <span className="text-xs font-bold text-gray-700">Add PDF Document</span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">Single PDF up to 10MB</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 border border-rose-200 bg-rose-50/20 rounded-xl relative group">
                                            <FileText className="w-8 h-8 text-rose-500 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-900 truncate">{pdfFile.name}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{formatBytes(pdfFile.size)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removePdf}
                                                className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit button */}
                                <div className="pt-2">
                                    {isSubmitting ? (
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between text-xs font-bold text-indigo-600">
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    Uploading Files...
                                                </span>
                                                <span>{submitProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-150"
                                                    style={{ width: `${submitProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!canSubmit}
                                            className={`w-full py-4 text-sm font-black rounded-xl text-center shadow-lg transition-all ${
                                                canSubmit
                                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 cursor-pointer hover:-translate-y-0.5 active:translate-y-0'
                                                    : 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
                                            }`}
                                        >
                                            Submit Task
                                        </button>
                                    )}
                                    {!canSubmit && (
                                        <p className="text-[10px] text-gray-400 font-semibold text-center mt-2">
                                            ⚠️ Upload at least one file to activate submission.
                                        </p>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetailPage;
