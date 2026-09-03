import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Users,
  BookOpen, 
  Briefcase, 
  Award, 
  Globe, 
  Link as LinkIcon, 
  HelpCircle, 
  DollarSign, 
  ShieldCheck, 
  Send, 
  Loader2, 
  Calendar, 
  MessageSquare,
  FileCheck,
  ExternalLink,
  ChevronRight,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { 
  sendAdminNotification, 
  buildNeedsInfoEmail, 
  buildApprovalEmail, 
  buildRejectionEmail 
} from '../../../lib/adminNotifications';

interface ApplicationDetail {
  id: string;
  application_number: string;
  user_id?: string;
  full_name: string;
  display_name?: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
  profile_photo_url?: string;

  education_status?: string;
  current_grade?: string;
  degree?: string;
  field_of_study?: string;
  institution?: string;
  graduation_year?: string;
  highest_qualification?: string;
  academic_achievements?: string;

  occupation?: string;
  organization?: string;
  job_title?: string;
  years_experience?: string;
  professional_summary?: string;
  previous_experiences?: any[];

  primary_expertise?: string;
  secondary_expertise?: string[];
  skills?: string[];
  skill_levels?: Record<string, string>;
  what_can_you_teach?: string;

  has_mentoring_experience?: boolean;
  mentoring_types?: string[];
  mentored_audience?: string[];
  learner_count?: string;
  mentoring_duration?: string;
  mentoring_description?: string;
  previous_teaching_platforms?: string[];
  mentoring_evidence_links?: string;
  no_experience_confidence?: string;

  student_levels?: string[];
  student_age_groups?: string[];
  mentorship_formats?: string[];
  session_styles?: string[];
  topics_not_to_mentor?: string;

  mentoring_philosophy?: string;
  teaching_style?: string[];
  scenario_difficult_student?: string;
  scenario_different_skill_levels?: string;
  scenario_unmotivated_student?: string;
  scenario_unknown_question?: string;
  scenario_constructive_feedback?: string;

  hours_per_week?: string;
  preferred_session_lengths?: string[];
  available_days?: string[];
  available_time_slots?: Record<string, string>;
  minimum_notice?: string;
  languages?: Array<{ language: string; proficiency: string }>;
  communication_methods?: string[];

  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  website_url?: string;
  other_links?: string;
  achievements?: string;

  q_why_mentozy?: string;
  q_student_outcomes?: string;
  q_wish_known_earlier?: string;
  q_helped_someone?: string;
  q_different_approach?: string;
  q_student_disagrees?: string;
  q_professional_boundaries?: string;
  q_academic_integrity?: string;

  paid_mentoring_interest?: string;
  price_30_min?: number;
  price_60_min?: number;
  free_intro_sessions?: string;

  status: string;
  admin_notes?: string;
  admin_feedback?: string;
  applicant_response?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

interface ApplicationEvent {
  id: string;
  event_type: string;
  message?: string;
  created_at: string;
  actor_email?: string;
}

export function AdminMentorApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingAdminReply, setSendingAdminReply] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false);

  // Action Inputs
  const [adminFeedbackMessage, setAdminFeedbackMessage] = useState('');
  const [internalRejectReason, setInternalRejectReason] = useState('');

  // 1. Fetch Application, Event Log, and Communication Messages
  const fetchApplicationDetails = async () => {
    if (!applicationId || !supabase) return;
    setLoading(true);

    try {
      // Query application
      const { data, error } = await supabase
        .from('mentor_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      setApplication(data);

      // Query event trail
      const { data: eventData } = await supabase
        .from('mentor_application_events')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (eventData) {
        setEvents(eventData);
      }

      // Query communication messages
      const { data: msgData } = await supabase
        .from('mentor_application_messages')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (msgData) {
        setMessages(msgData);
      }
    } catch (err: any) {
      console.error('[Admin Detail Error]:', err);
      toast.error('Could not load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  // Log Audit Event Helper
  const logAuditEvent = async (eventType: string, message: string) => {
    if (!supabase || !applicationId) return;
    try {
      await supabase.from('mentor_application_events').insert({
        application_id: applicationId,
        actor_user_id: user?.id || null,
        actor_email: user?.email || 'admin',
        event_type: eventType,
        message: message,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('[Audit Log] Error writing event:', err);
    }
  };

  // 2. Approve Action
  const handleApproveApplication = async () => {
    if (!application || !supabase) return;
    setActionLoading(true);

    try {
      const now = new Date().toISOString();

      // 1. Update application status
      const { error: appError } = await supabase
        .from('mentor_applications')
        .update({
          status: 'approved',
          reviewed_at: now,
          reviewed_by: user?.id || null,
          updated_at: now
        })
        .eq('id', application.id);

      if (appError) throw appError;

      // 2. Grant Mentor role on user's profile if linked
      if (application.user_id) {
        await supabase
          .from('profiles')
          .update({
            role: 'mentor',
            updated_at: now
          })
          .eq('id', application.user_id);

        // 3. Upsert mentor profile record
        await supabase
          .from('mentors')
          .upsert({
            user_id: application.user_id,
            name: application.display_name || application.full_name,
            expertise: application.primary_expertise,
            skills: application.skills || [],
            bio: application.what_can_you_teach || application.professional_summary || '',
            hourly_rate: application.price_60_min || 499,
            status: 'active'
          }, { onConflict: 'user_id' });
      }

      // 4. Record in Communication Messages
      await supabase.from('mentor_application_messages').insert({
        application_id: application.id,
        sender_user_id: user?.id || null,
        sender_type: 'system',
        sender_name: 'Mentozy Admissions',
        message: `Application Approved! Mentor account activated by admissions committee.`,
        created_at: now
      });

      // 5. Log Audit Event
      await logAuditEvent('approved', `Application approved by administrator (${user?.email || 'Admin'}). Mentor privileges activated.`);

      // 6. Send Approval Notification via Resend
      await sendAdminNotification({
        to: application.email,
        subject: '🎉 Congratulations! Your Mentozy Mentor Application has been Approved',
        html: buildApprovalEmail({ fullName: application.full_name })
      });

      toast.success('🎉 Application Approved! Mentor permissions activated.');
      setIsApproveModalOpen(false);
      fetchApplicationDetails();
    } catch (err: any) {
      console.error('[Approve Error]:', err);
      toast.error(err.message || 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Request Information Action
  const handleRequestInformation = async () => {
    if (!application || !supabase || !adminFeedbackMessage.trim()) {
      toast.error('Please enter the request message for the applicant.');
      return;
    }
    setActionLoading(true);

    try {
      const now = new Date().toISOString();

      const { error: appError } = await supabase
        .from('mentor_applications')
        .update({
          status: 'needs_info',
          admin_feedback: adminFeedbackMessage.trim(),
          reviewed_at: now,
          reviewed_by: user?.id || null,
          updated_at: now
        })
        .eq('id', application.id);

      if (appError) throw appError;

      // Add to communication messages
      await supabase.from('mentor_application_messages').insert({
        application_id: application.id,
        sender_user_id: user?.id || null,
        sender_type: 'admin',
        sender_name: 'Mentozy Admissions Team',
        message: adminFeedbackMessage.trim(),
        created_at: now
      });

      // Log Audit Event
      await logAuditEvent('information_requested', `Admin requested information: "${adminFeedbackMessage.trim()}"`);

      // Dispatch Email Notification via Resend
      await sendAdminNotification({
        to: application.email,
        subject: `Action Required — Mentozy Mentor Application (${application.application_number})`,
        html: buildNeedsInfoEmail({
          fullName: application.full_name,
          applicationNumber: application.application_number,
          requestMessage: adminFeedbackMessage.trim()
        })
      });

      toast.success('Information request transmitted to applicant.');
      setIsRequestInfoModalOpen(false);
      setAdminFeedbackMessage('');
      fetchApplicationDetails();
    } catch (err: any) {
      console.error('[Request Info Error]:', err);
      toast.error(err.message || 'Failed to request information.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Reject Action
  const handleRejectApplication = async () => {
    if (!application || !supabase) return;
    setActionLoading(true);

    try {
      const now = new Date().toISOString();

      const { error: appError } = await supabase
        .from('mentor_applications')
        .update({
          status: 'rejected',
          admin_notes: internalRejectReason.trim() || null,
          reviewed_at: now,
          reviewed_by: user?.id || null,
          updated_at: now
        })
        .eq('id', application.id);

      if (appError) throw appError;

      // Add to communication messages
      await supabase.from('mentor_application_messages').insert({
        application_id: application.id,
        sender_user_id: user?.id || null,
        sender_type: 'system',
        sender_name: 'Mentozy Admissions',
        message: `Application reviewed and marked as Declined.`,
        created_at: now
      });

      // Log Audit Event
      await logAuditEvent('rejected', `Application declined. Internal reason: "${internalRejectReason.trim() || 'No internal reason specified.'}"`);

      // Dispatch Email Notification via Resend
      await sendAdminNotification({
        to: application.email,
        subject: `Update Regarding Your Mentozy Mentor Application (${application.application_number})`,
        html: buildRejectionEmail({ fullName: application.full_name })
      });

      toast.success('Application marked as Declined.');
      setIsRejectModalOpen(false);
      fetchApplicationDetails();
    } catch (err: any) {
      console.error('[Reject Error]:', err);
      toast.error(err.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Send Admin Follow-up Message in thread
  const handleSendAdminFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !application || !supabase) return;

    setSendingAdminReply(true);

    try {
      const now = new Date().toISOString();

      await supabase.from('mentor_application_messages').insert({
        application_id: application.id,
        sender_user_id: user?.id || null,
        sender_type: 'admin',
        sender_name: 'Mentozy Admissions Team',
        message: adminReplyText.trim(),
        created_at: now
      });

      toast.success('Message sent to applicant thread.');
      setAdminReplyText('');
      fetchApplicationDetails();
    } catch (err) {
      toast.error('Could not send message.');
    } finally {
      setSendingAdminReply(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout activeTab="applications">
        <div className="p-20 text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#f39c12] mb-3" />
          <p className="font-black text-xs uppercase">Loading full applicant dossier...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout activeTab="applications">
        <div className="p-16 text-center space-y-4 bg-white border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black uppercase text-gray-900">Application Record Not Found</h2>
          <p className="text-xs font-bold text-gray-600">The requested application ID does not exist in the database.</p>
          <button 
            onClick={() => navigate('/admin/mentor-applications')}
            className="px-5 py-2.5 bg-gray-900 text-white font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
          >
            ← Back to Applications
          </button>
        </div>
      </AdminLayout>
    );
  }

  const isUnderReview = application.status === 'under_review' || application.status === 'pending' || application.status === 'submitted';
  const isNeedsInfo = application.status === 'needs_info';
  const isApproved = application.status === 'approved';
  const isRejected = application.status === 'rejected';

  return (
    <AdminLayout activeTab="applications">
      <div className="space-y-6 text-left">
        
        {/* Top Back Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-4 border-gray-900">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/admin/mentor-applications')}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dossier Review</span>
              <h1 className="text-xl md:text-2xl font-black uppercase text-gray-900 tracking-tight">
                {application.full_name} ({application.application_number || 'MNT-2026'})
              </h1>
            </div>
          </div>

          {/* Current Status Pill */}
          <div className={`px-4 py-2 border-4 border-gray-900 font-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] self-start sm:self-auto ${
            isApproved ? 'bg-emerald-300 text-gray-900' :
            isNeedsInfo ? 'bg-purple-300 text-gray-900 animate-pulse' :
            isRejected ? 'bg-rose-300 text-gray-900' :
            'bg-amber-300 text-gray-900'
          }`}>
            Status: {isApproved ? 'Approved' : isNeedsInfo ? 'Needs Information' : isRejected ? 'Declined' : 'Under Review'}
          </div>
        </div>

        {/* Action Banners for Needs Info / Applicant Response */}
        {application.applicant_response && (
          <div className="bg-emerald-50 border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2">
            <h3 className="font-black text-xs uppercase text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> New Response Received from Applicant:
            </h3>
            <p className="text-xs font-bold text-gray-900 bg-white border-2 border-gray-900 p-3">
              "{application.applicant_response}"
            </p>
          </div>
        )}

        {isNeedsInfo && application.admin_feedback && (
          <div className="bg-purple-50 border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2">
            <h3 className="font-black text-xs uppercase text-purple-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" /> Pending Information Requested:
            </h3>
            <p className="text-xs font-bold text-gray-800 bg-white border-2 border-gray-900 p-3">
              "{application.admin_feedback}"
            </p>
          </div>
        )}

        {/* Main Grid: Application Dossier (Left) + Action Panel (Right) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Full 10 Sections Dossier */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Personal Information */}
            <div className="bg-white border-4 border-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="font-black text-sm uppercase text-gray-900 border-b-2 border-gray-900 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-700" /> 1. Personal Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Full Name</p>
                  <p className="font-black text-gray-900 mt-0.5">{application.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Display Name</p>
                  <p className="font-black text-gray-900 mt-0.5">{application.display_name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Email Address</p>
                  <p className="font-black text-indigo-700 mt-0.5">{application.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Phone Number</p>
                  <p className="font-bold text-gray-900 mt-0.5">{application.phone_number || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Date of Birth / Gender</p>
                  <p className="font-bold text-gray-900 mt-0.5">{application.date_of_birth || '—'} · {application.gender || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Location & Timezone</p>
                  <p className="font-bold text-gray-900 mt-0.5">{application.city || ''}, {application.state || ''}, {application.country || ''} ({application.timezone || 'Asia/Kolkata'})</p>
                </div>
              </div>
            </div>

            {/* 2. Education & Academic Background */}
            <div className="bg-white border-4 border-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="font-black text-sm uppercase text-gray-900 border-b-2 border-gray-900 pb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-700" /> 2. Education & Academic Background
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Status & Grade</p>
                  <p className="font-black text-gray-900 mt-0.5">{application.education_status || '—'} ({application.current_grade || '—'})</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Degree / Program</p>
                  <p className="font-black text-gray-900 mt-0.5">{application.degree || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Field of Study</p>
                  <p className="font-bold text-gray-900 mt-0.5">{application.field_of_study || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Institution</p>
                  <p className="font-bold text-gray-900 mt-0.5">{application.institution || '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Academic Achievements & Honors</p>
                  <p className="font-bold text-gray-800 mt-0.5 bg-[#FAF9F6] border border-gray-900 p-2.5">
                    {application.academic_achievements || 'No specific honors listed.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Professional Background */}
            <div className="bg-white border-4 border-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="font-black text-sm uppercase text-gray-900 border-b-2 border-gray-900 pb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-700" /> 3. Professional Background
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Current Occupation & Company</p>
                  <p className="font-black text-gray-900 mt-0.5">{application.occupation || '—'} at {application.organization || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Job Title & Experience</p>
                  <p className="font-black text-gray-900 mt-0.5">{application.job_title || '—'} ({application.years_experience || '—'})</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Professional Summary</p>
                  <p className="font-bold text-gray-800 mt-0.5 bg-[#FAF9F6] border border-gray-900 p-2.5">
                    {application.professional_summary || 'No professional summary provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Expertise & Skills */}
            <div className="bg-white border-4 border-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="font-black text-sm uppercase text-gray-900 border-b-2 border-gray-900 pb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-700" /> 4. Expertise & What Can They Teach
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Primary Expertise Category</p>
                  <p className="font-black text-base text-indigo-800 mt-0.5">{application.primary_expertise}</p>
                </div>

                {application.secondary_expertise && application.secondary_expertise.length > 0 && (
                  <div>
                    <p className="text-gray-500 uppercase font-bold text-[10px]">Secondary Skill Tags</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {application.secondary_expertise.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-[#eff3ff] border border-gray-900 font-black text-[11px] uppercase">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">What Students Learn From This Mentor</p>
                  <p className="font-bold text-gray-900 mt-1 bg-amber-50 border-2 border-gray-900 p-3 italic">
                    "{application.what_can_you_teach || '—'}"
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Mentoring Experience & Preferences */}
            <div className="bg-white border-4 border-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="font-black text-sm uppercase text-gray-900 border-b-2 border-gray-900 pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-700" /> 5. Mentoring Experience & Audience Preferences
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Prior Mentoring Experience?</p>
                  <p className="font-black text-gray-900 mt-0.5">{application.has_mentoring_experience ? 'Yes' : 'First-Time Mentor'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Learners Mentored / Duration</p>
                  <p className="font-bold text-gray-900 mt-0.5">{application.learner_count || '—'} learners ({application.mentoring_duration || '—'})</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Mentoring Details / Confidence Statement</p>
                  <p className="font-bold text-gray-800 mt-0.5 bg-[#FAF9F6] border border-gray-900 p-2.5">
                    {application.mentoring_description || application.no_experience_confidence || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Target Student Levels</p>
                  <p className="font-bold text-gray-900 mt-0.5">{application.student_levels?.join(', ') || 'Any level'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Preferred Formats</p>
                  <p className="font-bold text-gray-900 mt-0.5">{application.mentorship_formats?.join(', ') || '1-on-1'}</p>
                </div>
              </div>
            </div>

            {/* 6. Teaching Approach & Scenario Responses */}
            <div className="bg-white border-4 border-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="font-black text-sm uppercase text-gray-900 border-b-2 border-gray-900 pb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-700" /> 6. Teaching Philosophy & Scenario Answers
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <p className="font-black text-gray-900 uppercase text-[11px]">Mentoring Philosophy</p>
                  <p className="font-bold text-gray-800 bg-[#FAF9F6] border border-gray-900 p-3 mt-1">
                    "{application.mentoring_philosophy || '—'}"
                  </p>
                </div>

                <div>
                  <p className="font-black text-gray-900 uppercase text-[11px]">Scenario 1: Struggling Student</p>
                  <p className="font-bold text-gray-800 bg-[#FAF9F6] border border-gray-900 p-3 mt-1">
                    "{application.scenario_difficult_student || '—'}"
                  </p>
                </div>

                <div>
                  <p className="font-black text-gray-900 uppercase text-[11px]">Scenario 2: Unknown Question</p>
                  <p className="font-bold text-gray-800 bg-[#FAF9F6] border border-gray-900 p-3 mt-1">
                    "{application.scenario_unknown_question || '—'}"
                  </p>
                </div>

                <div>
                  <p className="font-black text-gray-900 uppercase text-[11px]">Scenario 3: Constructive Feedback</p>
                  <p className="font-bold text-gray-800 bg-[#FAF9F6] border border-gray-900 p-3 mt-1">
                    "{application.scenario_constructive_feedback || '—'}"
                  </p>
                </div>

                <div>
                  <p className="font-black text-gray-900 uppercase text-[11px]">Academic Integrity: Refusing Homework Completion Requests</p>
                  <p className="font-bold text-gray-800 bg-amber-50 border border-gray-900 p-3 mt-1">
                    "{application.q_academic_integrity || '—'}"
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Availability, Pricing & Languages */}
            <div className="bg-white border-4 border-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="font-black text-sm uppercase text-gray-900 border-b-2 border-gray-900 pb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-700" /> 7. Availability, Fees & Languages
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Weekly Time Commitment</p>
                  <p className="font-black text-gray-900 mt-0.5">{application.hours_per_week || '3–5'} hours/week</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Booking Notice</p>
                  <p className="font-bold text-gray-900 mt-0.5">{application.minimum_notice || '24 hours'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Session Rates (30m / 60m)</p>
                  <p className="font-black text-emerald-700 text-sm mt-0.5">
                    ₹{application.price_30_min || '399'} (30 min) · ₹{application.price_60_min || '699'} (60 min)
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase font-bold text-[10px]">Languages</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {application.languages?.map(l => `${l.language} (${l.proficiency})`).join(', ') || 'English'}
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Portfolio & Verification Links */}
            <div className="bg-white border-4 border-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="font-black text-sm uppercase text-gray-900 border-b-2 border-gray-900 pb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-700" /> 8. Portfolio & Public Links
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {application.linkedin_url && (
                  <a 
                    href={application.linkedin_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-3 bg-[#FAF9F6] border-2 border-gray-900 flex items-center justify-between font-bold text-indigo-700 hover:bg-[#eff3ff]"
                  >
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {application.github_url && (
                  <a 
                    href={application.github_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-3 bg-[#FAF9F6] border-2 border-gray-900 flex items-center justify-between font-bold text-indigo-700 hover:bg-[#eff3ff]"
                  >
                    <span>GitHub Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {application.portfolio_url && (
                  <a 
                    href={application.portfolio_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-3 bg-[#FAF9F6] border-2 border-gray-900 flex items-center justify-between font-bold text-indigo-700 hover:bg-[#eff3ff]"
                  >
                    <span>Portfolio / Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {application.what_can_you_teach && (
                  <div>
                    <p className="text-gray-500 uppercase font-bold text-[10px]">Curriculum & Teaching Summary</p>
                    <p className="text-gray-900 mt-0.5 leading-relaxed break-words bg-[#FAF9F6] p-3 border-2 border-gray-200">{application.what_can_you_teach}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Communication & Thread Panel */}
            <div className="bg-white border-2 sm:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden min-w-0">
              <div className="p-3.5 sm:p-4 bg-[#eff3ff] border-b-2 sm:border-b-4 border-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-700 shrink-0" />
                  <h3 className="font-black text-xs uppercase tracking-wider text-gray-900">
                    Applicant Communication Thread
                  </h3>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-xs font-bold">
                    <p>No messages in this applicant thread yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map(msg => {
                      const isSystem = msg.sender_type === 'system';
                      const isAdmin = msg.sender_type === 'admin';

                      return (
                        <div 
                          key={msg.id} 
                          className={`p-3.5 border-2 border-gray-900 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-1 break-words overflow-hidden ${
                            isSystem ? 'bg-gray-100 border-dashed' :
                            isAdmin ? 'bg-[#eff3ff]' : 'bg-amber-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase">
                            <span className={`truncate ${isAdmin ? 'text-indigo-800' : isSystem ? 'text-gray-600' : 'text-amber-800'}`}>
                              {msg.sender_name || (isAdmin ? 'Admissions Team' : 'Applicant')}
                            </span>
                            <span className="text-gray-500 shrink-0">{new Date(msg.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          <p className="font-bold text-gray-900 whitespace-pre-line leading-relaxed break-words">
                            {msg.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Direct follow-up message form */}
                <form onSubmit={handleSendAdminFollowup} className="pt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={adminReplyText}
                    onChange={e => setAdminReplyText(e.target.value)}
                    placeholder="Post an internal note or message to this applicant thread..."
                    className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-2.5 text-xs font-bold focus:bg-white outline-none min-h-[70px]"
                  />
                  <button
                    type="submit"
                    disabled={sendingAdminReply || !adminReplyText.trim()}
                    className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] bg-[#f39c12] hover:bg-[#e08e0b] border-2 border-gray-900 text-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {sendingAdminReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Post Message to Thread
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Decision & Review Action Panel */}
          <div className="lg:col-span-4 space-y-5 sm:space-y-6 lg:sticky lg:top-24 min-w-0 w-full">
            
            {/* Main Action Box */}
            <div className="bg-white border-2 sm:border-4 border-gray-900 p-4 sm:p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4 sm:space-y-5 min-w-0">
              <div className="border-b-2 border-gray-900 pb-3">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Admissions Decision</span>
                <h3 className="text-sm sm:text-base font-black uppercase text-gray-900 mt-0.5">Admin Actions</h3>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 sm:space-y-3">
                
                {/* 1. Approve Button */}
                <button
                  onClick={() => setIsApproveModalOpen(true)}
                  disabled={actionLoading || isApproved}
                  className="w-full py-3 sm:py-3.5 min-h-[44px] bg-emerald-400 hover:bg-emerald-500 text-gray-900 font-black text-xs uppercase border-2 sm:border-4 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Mentor
                </button>

                {/* 2. Request More Information Button */}
                <button
                  onClick={() => setIsRequestInfoModalOpen(true)}
                  disabled={actionLoading}
                  className="w-full py-2.5 sm:py-3 min-h-[44px] bg-[#eff3ff] hover:bg-indigo-100 text-indigo-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Request Info
                </button>

                {/* 3. Reject Button */}
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={actionLoading || isRejected}
                  className="w-full py-2.5 sm:py-3 min-h-[44px] bg-rose-100 hover:bg-rose-200 text-rose-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Decline Application
                </button>

              </div>
            </div>

            {/* Audit Trail Timeline Box */}
            <div className="bg-white border-2 sm:border-4 border-gray-900 p-4 sm:p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-3.5 sm:space-y-4 min-w-0">
              <h3 className="font-black text-xs uppercase text-gray-900 border-b-2 border-gray-900 pb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-900" /> Application Audit Trail
              </h3>

              <div className="space-y-3 text-xs">
                {/* Initial submission */}
                <div className="border-l-2 border-gray-900 pl-3 py-1 space-y-0.5">
                  <p className="font-black text-[11px] uppercase text-gray-900">Application Submitted</p>
                  <p className="text-[10px] text-gray-500">{new Date(application.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>

                {/* Event logs */}
                {events.map(ev => (
                  <div key={ev.id} className="border-l-2 border-[#f39c12] pl-3 py-1 space-y-0.5">
                    <p className="font-black text-[11px] uppercase text-gray-900">{ev.event_type.replace('_', ' ')}</p>
                    {ev.message && <p className="text-[10px] text-gray-700 font-bold break-words">"{ev.message}"</p>}
                    <p className="text-[9px] text-gray-500">{new Date(ev.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      {isApproveModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsApproveModalOpen(false); }}
        >
          <div className="bg-white border-4 border-gray-900 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4 text-left animate-in fade-in duration-150">
            <h3 className="font-black text-sm sm:text-base uppercase text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> Confirm Mentor Approval
            </h3>
            <p className="text-xs font-bold text-gray-700 leading-relaxed">
              Approving this application will grant <strong>{application.full_name}</strong> active mentor permissions on Mentozy and create their public mentor card.
            </p>
            <div className="pt-2 flex gap-2.5 sm:gap-3">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="flex-1 py-3 min-h-[44px] border-2 border-gray-900 bg-white font-black text-xs uppercase cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveApplication}
                disabled={actionLoading}
                className="flex-1 py-3 min-h-[44px] bg-emerald-400 hover:bg-emerald-500 text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST MORE INFORMATION MODAL */}
      {isRequestInfoModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsRequestInfoModalOpen(false); }}
        >
          <div className="bg-white border-4 border-gray-900 w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4 text-left animate-in fade-in duration-150">
            <h3 className="font-black text-sm sm:text-base uppercase text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-700 shrink-0" /> Request Additional Information
            </h3>
            <p className="text-xs font-bold text-gray-600">
              The message below will be sent to the applicant's portal and email.
            </p>
            <textarea
              rows={4}
              value={adminFeedbackMessage}
              onChange={e => setAdminFeedbackMessage(e.target.value)}
              placeholder="e.g. Please provide additional links to your past frontend projects or clarify your weekly availability."
              className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 text-xs font-bold focus:bg-white outline-none min-h-[90px]"
            />
            <div className="pt-2 flex gap-2.5 sm:gap-3">
              <button
                onClick={() => setIsRequestInfoModalOpen(false)}
                className="flex-1 py-3 min-h-[44px] border-2 border-gray-900 bg-white font-black text-xs uppercase cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestInformation}
                disabled={actionLoading || !adminFeedbackMessage.trim()}
                className="flex-1 py-3 min-h-[44px] bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {isRejectModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsRejectModalOpen(false); }}
        >
          <div className="bg-white border-4 border-gray-900 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4 text-left animate-in fade-in duration-150">
            <h3 className="font-black text-sm sm:text-base uppercase text-gray-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" /> Decline Mentor Application
            </h3>
            <p className="text-xs font-bold text-gray-700">
              Are you sure you want to decline this mentor application? You can enter an optional internal reason for the audit log.
            </p>
            <textarea
              rows={3}
              value={internalRejectReason}
              onChange={e => setInternalRejectReason(e.target.value)}
              placeholder="Optional internal review reason (for admin records only)"
              className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 text-xs font-bold focus:bg-white outline-none min-h-[70px]"
            />
            <div className="pt-2 flex gap-2.5 sm:gap-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-3 min-h-[44px] border-2 border-gray-900 bg-white font-black text-xs uppercase cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectApplication}
                disabled={actionLoading}
                className="flex-1 py-3 min-h-[44px] bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default AdminMentorApplicationDetailPage;
