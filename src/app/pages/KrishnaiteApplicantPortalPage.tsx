import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Award, 
  Calendar, 
  User, 
  ShieldCheck, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { 
  KrishnaiteCourseApplication, 
  KrishnaiteApplicationMessage,
  getKrishnaiteApplicationByUserId, 
  getKrishnaiteApplicationById,
  getKrishnaiteApplicationMessages, 
  sendKrishnaiteApplicationMessage,
  updateKrishnaiteApplicationStatus
} from '../../lib/api';
import { sendAdminNotification, buildKrishnaiteApplicantRespondedEmail } from '../../lib/adminNotifications';

export function KrishnaiteApplicantPortalPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [application, setApplication] = useState<KrishnaiteCourseApplication | null>(null);
  const [messages, setMessages] = useState<KrishnaiteApplicationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [dossierExpanded, setDossierExpanded] = useState(false);

  // 1. Fetch Applicant Application & Messages
  const fetchData = async () => {
    setLoading(true);
    try {
      let app: KrishnaiteCourseApplication | null = null;

      if (user?.id) {
        app = await getKrishnaiteApplicationByUserId(user.id);
      }

      // Check URL search params for ?id=KGA-2026-XXXXXX if user applied as guest
      if (!app) {
        const params = new URLSearchParams(window.location.search);
        const qId = params.get('id');
        if (qId) {
          app = await getKrishnaiteApplicationById(qId);
        }
      }

      // If still not found, check localStorage directly
      if (!app) {
        try {
          const raw = localStorage.getItem('mentozy_krishnaite_apps_local_v1');
          if (raw) {
            const list: KrishnaiteCourseApplication[] = JSON.parse(raw);
            if (list.length > 0) app = list[0];
          }
        } catch (e) {
          console.warn('[Portal] Local storage check error:', e);
        }
      }

      if (app) {
        setApplication(app);
        const msgs = await getKrishnaiteApplicationMessages(app.id);
        setMessages(msgs);
      }
    } catch (err) {
      console.warn('[Portal] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  // 2. Submit Response to "Needs Information"
  const handleSendResponse = async () => {
    if (!replyText.trim() || !application) return;

    setSendingReply(true);
    try {
      // 1. Send Message
      const newMsg = await sendKrishnaiteApplicationMessage(
        application.id,
        replyText.trim(),
        'applicant',
        application.full_name || 'Applicant',
        user?.id
      );

      // 2. Flip Status back to under_review
      const updated = await updateKrishnaiteApplicationStatus(application.id, 'under_review');
      if (updated) setApplication(updated);

      // 3. Dispatch Email to Admissions
      sendAdminNotification({
        to: 'founder@mentozy.app',
        subject: `💬 Krishnaite Application Response: ${application.full_name} (${application.application_id})`,
        html: buildKrishnaiteApplicantRespondedEmail({
          fullName: application.full_name,
          applicationId: application.application_id,
          responseMessage: replyText.trim()
        })
      }).catch(err => console.warn('[Notifications] Email error:', err));

      setMessages(prev => [...prev, newMsg]);
      setReplyText('');
      toast.success('Your response has been sent to the Krishnaite admissions committee.');
    } catch (err) {
      console.error('[Portal] Reply error:', err);
      toast.error('Failed to submit response. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="bg-[#FAF9F6] text-gray-900 font-mono min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-700 mx-auto" />
          <p className="text-xs font-black uppercase text-gray-600">Loading Application Status...</p>
        </div>
      </div>
    );
  }

  // No Application Found State
  if (!application) {
    return (
      <div className="bg-[#FAF9F6] text-gray-900 font-mono min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border-4 border-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center space-y-6">
          <div className="w-12 h-12 bg-amber-100 border-2 border-gray-900 mx-auto flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <HelpCircle className="w-6 h-6 text-amber-700" />
          </div>

          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
            NO APPLICATION FOUND
          </h2>

          <p className="text-xs font-bold text-gray-600 leading-relaxed">
            We couldn't find an active 18-Day AI Course application linked to your account.
          </p>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/krishnaite/apply"
              className="px-6 py-3.5 bg-[#f39c12] hover:bg-[#e67e22] text-gray-900 border-2 border-gray-900 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              START NEW APPLICATION →
            </Link>

            <Link
              to="/academy"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            >
              BACK TO COURSE OVERVIEW
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine Timeline Progress
  const timelineStages = [
    { id: 'submitted', label: 'APPLICATION SUBMITTED' },
    { id: 'review', label: 'APPLICATION REVIEW' },
    { id: 'decision', label: 'DECISION' },
    { id: 'enrollment', label: 'ENROLLMENT' },
    { id: 'journey', label: '18-DAY JOURNEY' }
  ];

  const getStageIndex = () => {
    if (application.status === 'accepted') return 3;
    if (application.status === 'invited') return 3;
    if (application.status === 'declined') return 2;
    if (application.status === 'needs_info') return 1;
    if (application.status === 'under_review') return 1;
    if (application.status === 'submitted') return 0;
    return 0;
  };

  const currentStageIdx = getStageIndex();

  const getStatusBadge = () => {
    switch (application.status) {
      case 'accepted':
        return <span className="px-3 py-1 bg-emerald-500 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">ACCEPTED</span>;
      case 'invited':
        return <span className="px-3 py-1 bg-purple-500 text-white border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">🏆 AIVANTAGE WINNER (INVITED)</span>;
      case 'needs_info':
        return <span className="px-3 py-1 bg-amber-400 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">ACTION REQUIRED</span>;
      case 'declined':
        return <span className="px-3 py-1 bg-red-400 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">DECLINED</span>;
      case 'waitlisted':
        return <span className="px-3 py-1 bg-blue-400 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">WAITLISTED</span>;
      case 'under_review':
      default:
        return <span className="px-3 py-1 bg-amber-100 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">UNDER REVIEW</span>;
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-gray-900 font-mono min-h-screen pt-28 pb-20 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Breadcrumb & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/academy"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-gray-900 text-xs font-bold uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-all min-h-[38px]"
          >
            <ArrowLeft className="w-4 h-4" /> Course Overview
          </Link>

          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] min-h-[38px]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
          </button>
        </div>

        {/* Status Header Card */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 p-5 sm:p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-gray-900 pb-5">
            <div className="space-y-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 border border-indigo-900/40">
                <Sparkles className="w-3.5 h-3.5" />
                KRISHNAITE 18-DAY PRACTICAL AI COURSE
              </div>
              <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 break-words">
                {application.full_name || 'Applicant'}
              </h1>
              <p className="text-xs font-bold text-gray-600 flex flex-wrap items-center gap-2">
                <span>Application ID: <strong>{application.application_id}</strong></span>
                <span>•</span>
                <span>Submitted: {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Recent'}</span>
              </p>
            </div>

            <div className="shrink-0">
              {getStatusBadge()}
            </div>
          </div>

          {/* Scholarship & Payable Amount Card */}
          <div className="p-4 sm:p-6 bg-[#eff3ff] border-2 sm:border-3 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black uppercase text-gray-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-700" />
                Scholarship Allocation Details
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white border border-gray-900">
                {application.source === 'aivantage_direct_invitation' ? 'AIvantage Direct Invitation' : 'General Admission'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white border-2 border-gray-900">
                <p className="text-[10px] font-black uppercase text-gray-500">Actual Course Value</p>
                <p className="text-base sm:text-lg font-black text-gray-900">₹{application.course_value?.toLocaleString() || '10,000'}</p>
              </div>

              <div className="p-3 bg-white border-2 border-gray-900">
                <p className="text-[10px] font-black uppercase text-gray-500">Scholarship Tier</p>
                <p className="text-base sm:text-lg font-black text-indigo-700">
                  {application.scholarship_percentage}% SCHOLARSHIP
                </p>
              </div>

              <div className="p-3 bg-white border-2 border-gray-900">
                <p className="text-[10px] font-black uppercase text-gray-500">Payable Amount</p>
                <p className={`text-base sm:text-lg font-black ${application.payable_amount === 0 ? 'text-emerald-700' : 'text-gray-900'}`}>
                  {application.payable_amount === 0 ? '₹0 (100% Free)' : `₹${application.payable_amount?.toLocaleString() || '5,000'}`}
                </p>
              </div>
            </div>

            <p className="text-[11px] font-bold text-gray-600 leading-relaxed pt-1">
              {application.status === 'accepted' 
                ? 'Your scholarship has been confirmed. Enrollment details will be shared prior to cohort commencement.'
                : 'Scholarship allocation is verified by the Krishnaite admissions committee during the review process. No immediate payment is required until admission decision.'}
            </p>
          </div>

          {/* 5-Stage Progress Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase text-gray-900 tracking-wider">
              APPLICATION TIMELINE
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {timelineStages.map((stage, idx) => {
                const isPassed = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div
                    key={stage.id}
                    className={`p-3 border-2 border-gray-900 text-left transition-all ${
                      isCurrent
                        ? 'bg-[#f39c12] text-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-900'
                        : 'bg-gray-50 text-gray-400 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-black mb-1">
                      <span>0{idx + 1}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                      {isCurrent && <Clock className="w-3.5 h-3.5 text-gray-900" />}
                    </div>
                    <p className="text-[11px] font-black uppercase leading-snug">{stage.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ACTION REQUIRED BANNER & REPLY COMPOSER (When status is needs_info) */}
        {application.status === 'needs_info' && (
          <div className="bg-amber-100 border-4 border-gray-900 p-5 sm:p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-900 shrink-0" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-amber-950">
                ACTION REQUIRED — ADMISSIONS COMMITTEE REQUEST
              </h2>
            </div>

            <p className="text-xs sm:text-sm font-bold text-amber-900 leading-relaxed">
              The Krishnaite admissions team requires additional information to complete your application review. Please submit your response below:
            </p>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-black uppercase text-gray-900">Your Response:</label>
              <textarea
                rows={4}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your response here..."
                className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSendResponse}
                  disabled={sendingReply || !replyText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#f39c12] hover:bg-[#e67e22] text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  SUBMIT RESPONSE TO ADMISSIONS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Communication & Messages Thread Card */}
        {messages.length > 0 && (
          <div className="bg-white border-2 sm:border-4 border-gray-900 p-5 sm:p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-gray-900 pb-3">
              <MessageSquare className="w-5 h-5 text-indigo-700" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-gray-900">
                Admissions Communication Thread ({messages.length})
              </h3>
            </div>

            <div className="space-y-3">
              {messages.map(msg => {
                const isAdmin = msg.sender_type === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`p-4 border-2 border-gray-900 text-xs ${
                      isAdmin ? 'bg-amber-50 mr-4 sm:mr-12' : 'bg-indigo-50 ml-4 sm:ml-12'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-500 mb-1.5">
                      <span className={isAdmin ? 'text-amber-900 font-black' : 'text-indigo-900 font-black'}>
                        {msg.sender_name || (isAdmin ? 'Krishnaite Admissions' : 'Applicant')}
                      </span>
                      <span>{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <p className="font-bold text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Application Dossier (Expandable) */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
          <button
            type="button"
            onClick={() => setDossierExpanded(prev => !prev)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-black text-xs sm:text-sm uppercase tracking-wider bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-700" />
              View Complete Submitted Application Dossier
            </span>
            {dossierExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {dossierExpanded && (
            <div className="p-5 sm:p-8 space-y-6 border-t-2 border-gray-900 text-xs font-bold text-gray-800">
              {/* Personal */}
              <div className="p-4 bg-gray-50 border-2 border-gray-900 space-y-2">
                <h4 className="font-black text-gray-900 uppercase">Personal Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                  <p><strong>Name:</strong> {application.full_name}</p>
                  <p><strong>Email:</strong> {application.email}</p>
                  <p><strong>Phone:</strong> {application.phone || '—'}</p>
                  <p><strong>Location:</strong> {application.city}, {application.state}, {application.country}</p>
                </div>
              </div>

              {/* Education & Work */}
              <div className="p-4 bg-gray-50 border-2 border-gray-900 space-y-2">
                <h4 className="font-black text-gray-900 uppercase">Education & Experience</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                  <p><strong>Status:</strong> {application.education_data?.education_status || '—'}</p>
                  <p><strong>Institution:</strong> {application.education_data?.institution || '—'}</p>
                  <p><strong>Degree / Stream:</strong> {application.education_data?.degree || '—'}</p>
                  <p><strong>Occupation:</strong> {application.professional_data?.no_work_experience ? 'Student / Beginner' : `${application.professional_data?.occupation || '—'} (${application.professional_data?.company || 'Independent'})`}</p>
                </div>
              </div>

              {/* AI & Goals */}
              <div className="p-4 bg-gray-50 border-2 border-gray-900 space-y-2">
                <h4 className="font-black text-gray-900 uppercase">AI Background & Target Goals</h4>
                <div className="space-y-1.5 text-gray-700">
                  <p><strong>AI Familiarity:</strong> {application.ai_experience?.used_ai_before || '—'}</p>
                  <p><strong>Tools Used:</strong> {application.ai_experience?.ai_tools_used?.join(', ') || '—'}</p>
                  <p><strong>Top Goals:</strong> {application.learning_goals?.top_3_goals || '—'}</p>
                  <p><strong>Why Join:</strong> {application.motivation_data?.why_join || '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default KrishnaiteApplicantPortalPage;
