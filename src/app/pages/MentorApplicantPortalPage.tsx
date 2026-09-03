import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  MessageSquare, 
  Send, 
  FileText, 
  User, 
  ArrowRight, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Sparkles,
  HelpCircle,
  Award,
  BookOpen,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { sendAdminNotification, buildApplicantResponseEmail } from '../../lib/adminNotifications';

interface ApplicationData {
  id: string;
  application_number: string;
  user_id?: string;
  full_name: string;
  display_name?: string;
  email: string;
  phone_number?: string;
  primary_expertise: string;
  secondary_expertise?: string[];
  education_status?: string;
  degree?: string;
  institution?: string;
  occupation?: string;
  organization?: string;
  years_experience?: string;
  what_can_you_teach?: string;
  mentoring_philosophy?: string;
  hours_per_week?: string;
  price_30_min?: number;
  price_60_min?: number;
  status: string;
  admin_feedback?: string;
  applicant_response?: string;
  submitted_at: string;
  reviewed_at?: string;
}

interface MessageItem {
  id: string;
  sender_type: 'admin' | 'applicant' | 'system';
  sender_name?: string;
  message: string;
  created_at: string;
}

export function MentorApplicantPortalPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  // Response Form States
  const [responseText, setResponseText] = useState('');
  const [supportingLink, setSupportingLink] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Ask Question / Direct Message State
  const [questionText, setQuestionText] = useState('');
  const [sendingQuestion, setSendingQuestion] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // 1. Fetch Application & Messages
  const fetchPortalData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      let appData: ApplicationData | null = null;

      // 1. Query by authenticated user ID
      if (user?.id) {
        const { data } = await supabase
          .from('mentor_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) appData = data;
      }

      // 2. Query by authenticated user email
      if (!appData && user?.email) {
        const { data } = await supabase
          .from('mentor_applications')
          .select('*')
          .eq('email', user.email)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) appData = data;
      }

      // 3. Query by stored application number from localStorage
      const storedAppNumber = localStorage.getItem('mentozy_last_application_number');
      if (!appData && storedAppNumber) {
        const { data } = await supabase
          .from('mentor_applications')
          .select('*')
          .eq('application_number', storedAppNumber)
          .maybeSingle();

        if (data) appData = data;
      }

      // 4. Query by stored email from localStorage
      const storedEmail = localStorage.getItem('mentozy_applicant_email');
      if (!appData && storedEmail) {
        const { data } = await supabase
          .from('mentor_applications')
          .select('*')
          .eq('email', storedEmail)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) appData = data;
      }

      if (appData) {
        setApplication(appData);

        // Fetch communication messages
        const { data: msgList } = await supabase
          .from('mentor_application_messages')
          .select('*')
          .eq('application_id', appData.id)
          .order('created_at', { ascending: true });

        if (msgList) {
          setMessages(msgList);
        }
      }
    } catch (err) {
      console.warn('[Applicant Portal] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [user]);

  // 2. Submit Response to Information Request
  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() || !application || !supabase) {
      toast.error('Please enter your response before submitting.');
      return;
    }

    setSubmittingResponse(true);

    try {
      const fullResponse = supportingLink.trim() 
        ? `${responseText.trim()}\n\nSupporting Link: ${supportingLink.trim()}`
        : responseText.trim();

      const now = new Date().toISOString();

      // 1. Update application status back to under_review and store response
      const { error: updateError } = await supabase
        .from('mentor_applications')
        .update({
          applicant_response: fullResponse,
          status: 'under_review',
          updated_at: now
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      // 2. Store response in mentor_application_messages
      await supabase
        .from('mentor_application_messages')
        .insert({
          application_id: application.id,
          sender_user_id: user?.id || null,
          sender_type: 'applicant',
          sender_name: application.full_name || 'Applicant',
          message: fullResponse,
          created_at: now
        });

      // 3. Log Audit Event
      await supabase
        .from('mentor_application_events')
        .insert({
          application_id: application.id,
          actor_user_id: user?.id || null,
          actor_email: application.email,
          event_type: 'information_received',
          message: `Applicant response: "${fullResponse}"`
        });

      // 4. Send Resend notification to founder/admin safely
      await sendAdminNotification({
        to: 'founder@mentozy.app',
        subject: `Mentor Application Response — ${application.application_number}`,
        html: buildApplicantResponseEmail({
          fullName: application.full_name,
          applicationNumber: application.application_number,
          responseMessage: fullResponse
        })
      });

      toast.success('Your response has been submitted to the admissions team!');
      setResponseText('');
      setSupportingLink('');
      fetchPortalData();
    } catch (err: any) {
      console.error('[Response Error]:', err);
      toast.error(err.message || 'Failed to submit response.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  // 3. Send Direct In-App Message to Admissions Team
  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !application || !supabase) return;

    setSendingQuestion(true);

    try {
      const now = new Date().toISOString();

      // Insert message
      await supabase
        .from('mentor_application_messages')
        .insert({
          application_id: application.id,
          sender_user_id: user?.id || null,
          sender_type: 'applicant',
          sender_name: application.full_name || 'Applicant',
          message: questionText.trim(),
          created_at: now
        });

      // Notify admin
      await sendAdminNotification({
        to: 'founder@mentozy.app',
        subject: `💬 New Message from Applicant: ${application.full_name} (${application.application_number})`,
        html: `<p><strong>${application.full_name}</strong> sent an inquiry regarding application <strong>${application.application_number}</strong>:<br/><br/><em>"${questionText.trim()}"</em></p>`
      });

      toast.success('Inquiry transmitted to Mentozy admissions.');
      setQuestionText('');
      setShowContactModal(false);
      fetchPortalData();
    } catch (err) {
      toast.error('Could not send message. Please try again.');
    } finally {
      setSendingQuestion(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] font-mono flex items-center justify-center text-gray-900">
        <div className="text-center space-y-3 bg-white p-8 border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#f39c12]" />
          <p className="font-black text-xs uppercase">Loading Your Application Portal...</p>
        </div>
      </div>
    );
  }

  // If no application found
  if (!application) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] font-mono flex items-center justify-center p-6 text-gray-900 select-none">
        <div className="max-w-md w-full bg-white border-4 border-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center space-y-6">
          <div className="w-14 h-14 bg-amber-100 border-4 border-gray-900 flex items-center justify-center mx-auto text-amber-700 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            <FileText className="w-7 h-7 text-gray-900" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase text-gray-900">Application Lookup</h2>
            <p className="text-xs font-bold text-gray-600">
              No active application found in this session. Enter your Application ID (e.g. <code>MNT-2026-XXXXXX</code>) or registered email below:
            </p>
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('lookupInput') as HTMLInputElement)?.value?.trim();
              if (!input || !supabase) return;
              setLoading(true);
              try {
                const isId = input.toUpperCase().startsWith('MNT-');
                const { data } = await supabase
                  .from('mentor_applications')
                  .select('*')
                  .eq(isId ? 'application_number' : 'email', isId ? input.toUpperCase() : input.toLowerCase())
                  .order('submitted_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (data) {
                  localStorage.setItem('mentozy_last_application_number', data.application_number);
                  localStorage.setItem('mentozy_applicant_email', data.email);
                  setApplication(data);
                  toast.success('Application record loaded!');
                } else {
                  toast.error('No mentor application found matching that ID or email.');
                }
              } catch (err) {
                toast.error('Lookup failed.');
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-3"
          >
            <input 
              name="lookupInput"
              type="text"
              required
              placeholder="Application ID (MNT-2026-...) or Email"
              className="w-full bg-[#FAF9F6] border-2 border-gray-900 px-3 py-2.5 text-xs font-bold focus:bg-white outline-none"
            />
            <button 
              type="submit"
              className="w-full py-3 bg-[#eff3ff] hover:bg-indigo-100 text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              Look Up Application Record →
            </button>
          </form>

          <div className="pt-2 border-t-2 border-gray-200">
            <button 
              onClick={() => navigate('/mentor/apply')}
              className="w-full py-3 bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              Start New Mentor Application →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isUnderReview = application.status === 'under_review' || application.status === 'pending' || application.status === 'submitted';
  const isNeedsInfo = application.status === 'needs_info';
  const isApproved = application.status === 'approved';
  const isRejected = application.status === 'rejected';

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-mono text-gray-900 flex flex-col justify-between select-none">
      
      {/* Top Header */}
      <header className="bg-white border-b-4 border-gray-900 px-3 sm:px-6 py-2.5 sm:py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-3 border-2 sm:border-4 border-gray-900 bg-white px-2.5 sm:px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] shrink-0"
          >
            <span className="text-base sm:text-lg font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
            <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-[#f39c12] border-2 border-gray-900"></div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-black shrink-0">
            <span className="hidden sm:inline-block px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-[11px] shadow-[2px_2px_0px_rgba(0,0,0,1)] truncate max-w-[200px]">
              {application.email}
            </span>
            <button 
              onClick={() => { signOut(); navigate('/'); }}
              className="px-2.5 sm:px-3 py-1.5 min-h-[38px] bg-white border-2 border-gray-900 text-gray-700 hover:bg-gray-50 uppercase text-[11px] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-6 md:p-10 space-y-5 sm:space-y-8 min-w-0">
        
        {/* 1. Header Card */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] text-left space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b-2 sm:border-b-4 border-gray-900 pb-4">
            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Applicant Portal</span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-gray-900 tracking-tight break-words">
                Welcome, {application.full_name}
              </h1>
            </div>

            <div className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 sm:border-4 border-gray-900 font-black text-[11px] sm:text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] self-start sm:self-auto shrink-0 ${
              isApproved ? 'bg-emerald-300 text-gray-900' :
              isNeedsInfo ? 'bg-purple-300 text-gray-900 animate-pulse' :
              isRejected ? 'bg-rose-300 text-gray-900' :
              'bg-amber-300 text-gray-900'
            }`}>
              {isApproved ? 'Approved' : isNeedsInfo ? 'Action Required' : isRejected ? 'Declined' : 'Under Review'}
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Application ID</p>
              <p className="font-black text-gray-900 text-xs sm:text-sm mt-0.5">{application.application_number}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Primary Expertise</p>
              <p className="font-black text-indigo-700 text-xs sm:text-sm mt-0.5 truncate">{application.primary_expertise}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Submission Date</p>
              <p className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5">
                {new Date(application.submitted_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* 2. State Specific Display Hero */}

        {/* APPROVED HERO */}
        {isApproved && (
          <div className="bg-emerald-50 border-2 sm:border-4 border-gray-900 p-5 sm:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] text-left space-y-4 min-w-0">
            <div className="w-12 sm:w-14 h-12 sm:h-14 bg-emerald-400 border-2 sm:border-4 border-gray-900 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <CheckCircle2 className="w-6 sm:w-8 h-6 sm:h-8 text-gray-900" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black uppercase text-gray-900">
                🎉 Your Mentor Application Has Been Approved!
              </h2>
              <p className="text-xs md:text-sm font-bold text-gray-700 leading-relaxed max-w-2xl">
                Congratulations! Your application to become a Mentozy mentor has been approved. You can now access the full Mentor Dashboard to configure your schedule, manage courses, and connect with students.
              </p>
            </div>
            <button
              onClick={() => navigate('/mentor-dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] bg-emerald-400 hover:bg-emerald-500 text-gray-900 font-black text-xs uppercase border-2 sm:border-4 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue to Mentor Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* NEEDS INFO: ACTION REQUIRED HERO */}
        {isNeedsInfo && (
          <div className="bg-purple-50 border-2 sm:border-4 border-gray-900 p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] text-left space-y-4 sm:space-y-5 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-300 border-2 border-gray-900 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] shrink-0">
                <AlertCircle className="w-6 h-6 text-gray-900" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider block">Admissions Action Required</span>
                <h2 className="text-lg sm:text-xl font-black uppercase text-gray-900">Additional Information Requested</h2>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-900 p-3.5 sm:p-4 space-y-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black text-gray-500 uppercase">Mentozy Admissions Request:</p>
              <p className="font-bold text-xs text-gray-900 break-words">
                "{application.admin_feedback || 'Please provide additional clarification regarding your application.'}"
              </p>
            </div>

            {/* In-Line Response Form */}
            <form onSubmit={handleSubmitResponse} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-gray-900">
                  Your Response *
                </label>
                <textarea
                  rows={4}
                  required
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Type your response to the reviewer request here..."
                  className="w-full bg-white border-2 border-gray-900 p-3 text-xs font-bold focus:bg-[#FAF9F6] outline-none min-h-[90px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-gray-900">
                  Optional Supporting Link (Portfolio / GitHub / Certificate)
                </label>
                <input
                  type="url"
                  value={supportingLink}
                  onChange={e => setSupportingLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border-2 border-gray-900 px-3 py-2.5 text-xs font-bold focus:bg-[#FAF9F6] outline-none min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingResponse}
                className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-xs uppercase border-2 sm:border-4 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingResponse ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Response...
                  </>
                ) : (
                  <>
                    Submit Response to Reviewers <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* UNDER REVIEW HERO */}
        {isUnderReview && (
          <div className="bg-amber-50 border-2 sm:border-4 border-gray-900 p-5 sm:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] text-left space-y-3 min-w-0">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#f39c12] border-2 sm:border-4 border-gray-900 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-gray-900" />
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-gray-900">Application Under Review</h2>
            <p className="text-xs font-bold text-gray-700 leading-relaxed max-w-2xl">
              Your mentor application has been successfully received and is currently in the review queue. Our admissions team reviews each profile carefully to match our curriculum standards. You will receive an update here once a decision is made.
            </p>
          </div>
        )}

        {/* REJECTED HERO */}
        {isRejected && (
          <div className="bg-rose-50 border-2 sm:border-4 border-gray-900 p-5 sm:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] text-left space-y-3 min-w-0">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-rose-200 border-2 sm:border-4 border-gray-900 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] text-rose-800">
              <XCircle className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-gray-900">Application Not Approved</h2>
            <p className="text-xs font-bold text-gray-700 leading-relaxed max-w-2xl">
              Thank you for your interest in becoming a Mentozy mentor. After review by our admissions committee, your application was not approved at this time. We encourage you to continue developing your expertise and apply again in a future cohort.
            </p>
          </div>
        )}

        {/* 3. Application Progress Timeline */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] text-left space-y-4 sm:space-y-6 min-w-0">
          <h3 className="font-black text-xs sm:text-sm uppercase text-gray-900 border-b-2 border-gray-900 pb-2">
            Application Progress Timeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Step 1 */}
            <div className="border-2 sm:border-4 border-gray-900 p-3.5 sm:p-4 bg-emerald-100 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-1">
              <span className="text-[10px] font-black text-emerald-900 uppercase">Phase 1</span>
              <p className="font-black text-xs uppercase text-gray-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> Submitted
              </p>
              <p className="text-[10px] font-bold text-gray-600">Application dossier received</p>
            </div>

            {/* Step 2 */}
            <div className={`border-2 sm:border-4 border-gray-900 p-3.5 sm:p-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-1 ${
              isNeedsInfo ? 'bg-purple-200' :
              isUnderReview ? 'bg-amber-100 animate-pulse' :
              'bg-emerald-100'
            }`}>
              <span className="text-[10px] font-black uppercase text-gray-600">Phase 2</span>
              <p className="font-black text-xs uppercase text-gray-900 flex items-center gap-1.5">
                {isNeedsInfo ? <AlertCircle className="w-4 h-4 text-purple-700 shrink-0" /> : <Clock className="w-4 h-4 text-amber-700 shrink-0" />}
                {isNeedsInfo ? 'Info Requested' : 'Under Review'}
              </p>
              <p className="text-[10px] font-bold text-gray-600">
                {isNeedsInfo ? 'Applicant reply needed' : 'Admissions evaluation'}
              </p>
            </div>

            {/* Step 3 */}
            <div className={`border-2 sm:border-4 border-gray-900 p-3.5 sm:p-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-1 ${
              isApproved ? 'bg-emerald-200' :
              isRejected ? 'bg-rose-200' :
              'bg-gray-100 opacity-60'
            }`}>
              <span className="text-[10px] font-black uppercase text-gray-500">Phase 3</span>
              <p className="font-black text-xs uppercase text-gray-900 flex items-center gap-1.5">
                {isApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : 
                 isRejected ? <XCircle className="w-4 h-4 text-rose-700 shrink-0" /> : 
                 <Clock className="w-4 h-4 text-gray-500 shrink-0" />}
                {isApproved ? 'Approved' : isRejected ? 'Declined' : 'Decision'}
              </p>
              <p className="text-[10px] font-bold text-gray-600">
                {isApproved ? 'Mentor profile active' : isRejected ? 'Application closed' : 'Pending review completion'}
              </p>
            </div>

          </div>
        </div>

        {/* 4. Application Communication Thread */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden text-left min-w-0">
          <div className="p-3.5 sm:p-4 md:p-6 bg-[#eff3ff] border-b-2 sm:border-b-4 border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-700 shrink-0" />
              <h3 className="font-black text-xs uppercase tracking-wider text-gray-900">
                Admissions Messages & Inquiries
              </h3>
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full sm:w-auto px-3 py-2 min-h-[40px] bg-white border-2 border-gray-900 text-gray-900 text-[11px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50 cursor-pointer text-center"
            >
              Ask Admissions a Question +
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs font-bold">
                <p>No messages exchanged yet. Use the button above if you have any questions regarding your application.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => {
                  const isAdmin = msg.sender_type === 'admin';

                  return (
                    <div 
                      key={msg.id} 
                      className={`p-3.5 sm:p-4 border-2 border-gray-900 max-w-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-1.5 break-words overflow-hidden ${
                        isAdmin ? 'bg-[#eff3ff] mr-auto' : 'bg-amber-50 ml-auto'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase">
                        <span className={`truncate ${isAdmin ? 'text-indigo-800' : 'text-amber-800'}`}>
                          {isAdmin ? 'Mentozy Admissions Team' : 'You (Applicant)'}
                        </span>
                        <span className="text-gray-500 shrink-0">{new Date(msg.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 whitespace-pre-line leading-relaxed break-words">
                        {msg.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 5. Collapsible Application Dossier Summary */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden text-left min-w-0">
          <button
            onClick={() => setShowSummary(prev => !prev)}
            className="w-full p-4 sm:p-5 bg-[#FAF9F6] flex items-center justify-between font-black text-xs uppercase hover:bg-gray-100 cursor-pointer min-h-[48px]"
          >
            <span>View Submitted Application Summary</span>
            {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSummary && (
            <div className="p-4 sm:p-6 border-t-2 sm:border-t-4 border-gray-900 space-y-4 sm:space-y-6 text-xs font-bold">
              
              {/* Personal & Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b-2 border-gray-100">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase">Applicant Name & Email</p>
                  <p className="font-black text-gray-900 mt-0.5 break-words">{application.full_name} ({application.email})</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase">Education</p>
                  <p className="font-black text-gray-900 mt-0.5 break-words">{application.degree || application.education_status || '—'} · {application.institution || '—'}</p>
                </div>
              </div>

              {/* Professional & Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b-2 border-gray-100">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase">Occupation & Organization</p>
                  <p className="font-black text-gray-900 mt-0.5 break-words">{application.occupation || '—'} at {application.organization || '—'} ({application.years_experience || '0'} yrs exp)</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase">Primary Expertise</p>
                  <p className="font-black text-indigo-700 mt-0.5 break-words">{application.primary_expertise}</p>
                </div>
              </div>

              {/* Teaching & Approach */}
              <div className="space-y-2 pb-4 border-b-2 border-gray-100">
                <p className="text-gray-500 text-[10px] uppercase">What Can You Teach / Curriculum Summary</p>
                <p className="text-gray-900 leading-relaxed break-words bg-[#FAF9F6] p-3 border-2 border-gray-200">
                  {application.what_can_you_teach || '—'}
                </p>
              </div>

              {/* Mentoring Philosophy */}
              {application.mentoring_philosophy && (
                <div className="space-y-2 pb-4 border-b-2 border-gray-100">
                  <p className="text-gray-500 text-[10px] uppercase">Mentoring Philosophy</p>
                  <p className="text-gray-900 leading-relaxed break-words bg-[#FAF9F6] p-3 border-2 border-gray-200">
                    {application.mentoring_philosophy}
                  </p>
                </div>
              )}

              {/* Rates & Commitment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase">Weekly Commitment & Pricing</p>
                  <p className="font-black text-gray-900 mt-0.5">
                    {application.hours_per_week || '3–5'} hrs/week · ₹{application.price_30_min || '399'} (30m) / ₹{application.price_60_min || '699'} (60m)
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* ASK ADMISSIONS QUESTION MODAL */}
      {showContactModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowContactModal(false); }}
        >
          <div className="bg-white border-4 border-gray-900 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4 text-left animate-in fade-in duration-150">
            <h3 className="font-black text-sm sm:text-base uppercase text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-700 shrink-0" /> Send Message to Admissions
            </h3>
            <p className="text-xs font-bold text-gray-600">
              Your inquiry will be logged in your application thread and sent to the review team.
            </p>
            <form onSubmit={handleSendQuestion} className="space-y-4">
              <textarea
                rows={4}
                required
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Ask about your application status, requirements, or schedule..."
                className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 text-xs font-bold focus:bg-white outline-none min-h-[90px]"
              />
              <div className="flex gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-3 min-h-[44px] border-2 border-gray-900 bg-white font-black text-xs uppercase cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingQuestion || !questionText.trim()}
                  className="flex-1 py-3 min-h-[44px] bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {sendingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase border-t-2 border-gray-200">
        Mentozy Mentor Admissions Portal · Confidential Application Record
      </footer>

    </div>
  );
}

export default MentorApplicantPortalPage;
