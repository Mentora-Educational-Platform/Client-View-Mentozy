import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Award, 
  Send, 
  MessageSquare, 
  FileText, 
  Clock, 
  User, 
  ShieldCheck, 
  BookOpen, 
  Briefcase, 
  Bot, 
  Target, 
  Sliders, 
  Zap, 
  Palette, 
  Calendar, 
  Heart, 
  Users, 
  Link as LinkIcon, 
  Laptop, 
  History, 
  Loader2, 
  Save, 
  X,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  KrishnaiteCourseApplication, 
  KrishnaiteApplicationMessage,
  KrishnaiteApplicationEvent,
  getKrishnaiteApplicationById, 
  updateKrishnaiteApplicationStatus, 
  getKrishnaiteApplicationMessages, 
  sendKrishnaiteApplicationMessage,
  getKrishnaiteApplicationEvents
} from '../../../lib/api';
import { 
  sendAdminNotification, 
  buildKrishnaiteAcceptedEmail, 
  buildKrishnaiteNeedsInfoEmail, 
  buildKrishnaiteDeclinedEmail,
  buildKrishnaiteAIvantageWinnerInvitationEmail 
} from '../../../lib/adminNotifications';

export function AdminKrishnaiteApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState<KrishnaiteCourseApplication | null>(null);
  const [messages, setMessages] = useState<KrishnaiteApplicationMessage[]>([]);
  const [events, setEvents] = useState<KrishnaiteApplicationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin Notes
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Modals
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<50 | 75>(50);
  const [isAccepting, setIsAccepting] = useState(false);

  const [needsInfoModalOpen, setNeedsInfoModalOpen] = useState(false);
  const [needsInfoMessage, setNeedsInfoMessage] = useState('');
  const [isRequestingInfo, setIsRequestingInfo] = useState(false);

  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineFeedback, setDeclineFeedback] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  // Message Thread input
  const [newMsgText, setNewMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const app = await getKrishnaiteApplicationById(id);
      if (app) {
        setApplication(app);
        setAdminNotes(app.admin_notes || '');
        const msgs = await getKrishnaiteApplicationMessages(app.id);
        setMessages(msgs);
        const evts = await getKrishnaiteApplicationEvents(app.id);
        setEvents(evts);
      }
    } catch (err) {
      console.warn('[Admin Detail] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // 1. Save Admin Notes
  const handleSaveNotes = async () => {
    if (!application) return;
    setSavingNotes(true);
    try {
      const updated = await updateKrishnaiteApplicationStatus(application.id, application.status, {
        adminNotes,
        reviewedBy: user?.id
      });
      if (updated) setApplication(updated);
      toast.success('Internal notes saved.');
    } catch (err) {
      toast.error('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // 2. Accept Application
  const handleAcceptApplication = async () => {
    if (!application) return;
    setIsAccepting(true);
    try {
      const payable = selectedScholarship === 50 ? 5000 : 2500;
      const sType = selectedScholarship === 50 ? 'standard_50' : 'scholarship_75';

      const updated = await updateKrishnaiteApplicationStatus(application.id, 'accepted', {
        scholarshipPercentage: selectedScholarship,
        scholarshipType: sType,
        payableAmount: payable,
        reviewedBy: user?.id,
        adminNotes
      });

      if (updated) setApplication(updated);

      // Email notification to applicant
      sendAdminNotification({
        to: application.email,
        subject: `🎉 Congratulations! Accepted into Krishnaite 18-Day AI Course (${application.application_id})`,
        html: buildKrishnaiteAcceptedEmail({
          fullName: application.full_name,
          applicationId: application.application_id,
          scholarshipPercentage: selectedScholarship,
          payableAmount: payable
        })
      }).catch(err => console.warn('[Notifications] Accept email skipped:', err));

      toast.success(`Application accepted with ${selectedScholarship}% scholarship (Payable: ₹${payable.toLocaleString()}).`);
      setAcceptModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to accept application.');
    } finally {
      setIsAccepting(false);
    }
  };

  // 3. Request More Info
  const handleRequestMoreInfo = async () => {
    if (!application || !needsInfoMessage.trim()) return;
    setIsRequestingInfo(true);
    try {
      // Send message
      const msg = await sendKrishnaiteApplicationMessage(
        application.id,
        needsInfoMessage.trim(),
        'admin',
        'Krishnaite Admissions',
        user?.id
      );

      // Update status
      const updated = await updateKrishnaiteApplicationStatus(application.id, 'needs_info', {
        reviewedBy: user?.id,
        adminNotes
      });

      if (updated) setApplication(updated);

      // Email notification
      sendAdminNotification({
        to: application.email,
        subject: `⚠️ Action Required: Information Requested for Krishnaite 18-Day AI Course (${application.application_id})`,
        html: buildKrishnaiteNeedsInfoEmail({
          fullName: application.full_name,
          applicationId: application.application_id,
          requestMessage: needsInfoMessage.trim()
        })
      }).catch(err => console.warn('[Notifications] Info request email skipped:', err));

      setMessages(prev => [...prev, msg]);
      toast.success('Information request dispatched to applicant.');
      setNeedsInfoModalOpen(false);
      setNeedsInfoMessage('');
      loadData();
    } catch (err) {
      toast.error('Failed to request information.');
    } finally {
      setIsRequestingInfo(false);
    }
  };

  // 4. Decline Application
  const handleDeclineApplication = async () => {
    if (!application) return;
    setIsDeclining(true);
    try {
      const updated = await updateKrishnaiteApplicationStatus(application.id, 'declined', {
        reviewedBy: user?.id,
        adminNotes
      });
      if (updated) setApplication(updated);

      // Send rejection notification
      sendAdminNotification({
        to: application.email,
        subject: `Update regarding your Krishnaite 18-Day AI Course Application (${application.application_id})`,
        html: buildKrishnaiteDeclinedEmail({
          fullName: application.full_name,
          applicationId: application.application_id,
          feedback: declineFeedback.trim() || undefined
        })
      }).catch(err => console.warn('[Notifications] Decline email skipped:', err));

      toast.success('Application status updated to Declined.');
      setDeclineModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to decline application.');
    } finally {
      setIsDeclining(false);
    }
  };

  // 5. Upgrade / Designate as AIvantage Winner (100% Free)
  const handleDesignateAIvantageWinner = async () => {
    if (!application) return;
    const confirmed = window.confirm(`Designate ${application.full_name} as an AIvantage Quiz Winner with 100% Scholarship (₹0)?`);
    if (!confirmed) return;

    try {
      const updated = await updateKrishnaiteApplicationStatus(application.id, 'invited', {
        scholarshipPercentage: 100,
        scholarshipType: 'aivantage_100',
        payableAmount: 0,
        reviewedBy: user?.id,
        adminNotes
      });

      if (updated) setApplication(updated);

      // Send winner invitation email
      sendAdminNotification({
        to: application.email,
        subject: `🏆 You are Invited! AIvantage Quiz Winner — 18-Day AI Course (100% Free)`,
        html: buildKrishnaiteAIvantageWinnerInvitationEmail({
          fullName: application.full_name,
          applicationId: application.application_id,
          email: application.email
        })
      }).catch(err => console.warn('[Notifications] Winner email error:', err));

      toast.success(`Designated as AIvantage Winner with 100% scholarship (₹0).`);
      loadData();
    } catch (err) {
      toast.error('Failed to update scholarship.');
    }
  };

  // 6. Send Thread Message directly
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !newMsgText.trim()) return;

    setSendingMsg(true);
    try {
      const msg = await sendKrishnaiteApplicationMessage(
        application.id,
        newMsgText.trim(),
        'admin',
        'Krishnaite Admissions',
        user?.id
      );
      setMessages(prev => [...prev, msg]);
      setNewMsgText('');
      toast.success('Message posted to thread.');
    } catch (err) {
      toast.error('Failed to post message.');
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout activeTab="krishnaite">
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-700" />
          <p className="text-xs font-bold uppercase mt-2 text-gray-600">Loading Application Dossier...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout activeTab="krishnaite">
        <div className="p-12 bg-white border-2 border-gray-900 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-xl font-black uppercase">Application Not Found</h2>
          <Link
            to="/admin/krishnaite-applications"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-900 font-bold text-xs uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Applications List
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="krishnaite">
      <div className="space-y-6">
        
        {/* Back Link */}
        <Link
          to="/admin/krishnaite-applications"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] min-h-[38px]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Applications
        </Link>

        {/* Dossier Header & Action Station */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 p-5 sm:p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-gray-900 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 border border-indigo-900/40">
                <Sparkles className="w-3.5 h-3.5" />
                KRISHNAITE 18-DAY AI COURSE APPLICATION
              </div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
                {application.full_name}
              </h1>
              <p className="text-xs font-bold text-gray-600 flex flex-wrap items-center gap-2">
                <span>Application ID: <strong>{application.application_id}</strong></span>
                <span>•</span>
                <span>Submitted: {application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'Draft'}</span>
                <span>•</span>
                <span>Source: {application.source === 'aivantage_direct_invitation' ? '🏆 AIvantage Winner Direct Invitation' : 'General Public Admission'}</span>
              </p>
            </div>

            {/* Financial & Status Summary */}
            <div className="flex flex-col items-end gap-1.5">
              <span className="px-3 py-1 bg-gray-900 text-white font-black text-xs uppercase">
                STATUS: {application.status.toUpperCase()}
              </span>
              <span className="text-xs font-black text-indigo-700">
                {application.scholarship_percentage}% SCHOLARSHIP • {application.payable_amount === 0 ? '₹0 FREE' : `₹${application.payable_amount.toLocaleString()} PAYABLE`}
              </span>
            </div>
          </div>

          {/* Action Control Panel */}
          <div className="p-4 bg-gray-50 border-2 border-gray-900 space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-900 tracking-wider">
              ADMINISTRATIVE DECISION PANEL
            </h3>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => {
                  setSelectedScholarship(50);
                  setAcceptModalOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4 inline mr-1.5" /> ACCEPT APPLICATION...
              </button>

              <button
                onClick={() => setNeedsInfoModalOpen(true)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
              >
                <AlertCircle className="w-4 h-4 inline mr-1.5" /> REQUEST MORE INFORMATION
              </button>

              <button
                onClick={handleDesignateAIvantageWinner}
                className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
              >
                <Award className="w-4 h-4 inline mr-1.5" /> DESIGNATE AIvantage WINNER (100% FREE)
              </button>

              <button
                onClick={() => setDeclineModalOpen(true)}
                className="px-4 py-2.5 bg-red-400 hover:bg-red-500 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
              >
                <XCircle className="w-4 h-4 inline mr-1.5" /> DECLINE APPLICATION
              </button>
            </div>
          </div>

          {/* Internal Notes Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-gray-900">
                Internal Admissions Notes (Admins Only)
              </label>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline"
              >
                {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Notes
              </button>
            </div>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder="Add internal observations, interview remarks, or background checks..."
              className="w-full p-3 bg-gray-50 border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* 14-SECTION DOSSIER BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main 2-Column: Sections 01 through 13 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Personal Details */}
            <div className="bg-white border-2 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <User className="w-4 h-4 text-indigo-700" /> 01. Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-bold text-gray-700">
                <p><strong>Full Name:</strong> {application.full_name}</p>
                <p><strong>Preferred Name:</strong> {application.preferred_name || '—'}</p>
                <p><strong>Email:</strong> {application.email}</p>
                <p><strong>Phone:</strong> {application.phone || '—'}</p>
                <p><strong>DOB / Age:</strong> {application.date_of_birth || '—'} ({application.age || '—'} yrs)</p>
                <p><strong>Gender:</strong> {application.gender || '—'}</p>
                <p><strong>Location:</strong> {application.city}, {application.state}, {application.country}</p>
                <p><strong>Timezone:</strong> {application.timezone || '—'}</p>
              </div>
            </div>

            {/* 2. Education */}
            <div className="bg-white border-2 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <BookOpen className="w-4 h-4 text-indigo-700" /> 02. Educational Background
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-bold text-gray-700">
                <p><strong>Status:</strong> {application.education_data?.education_status || '—'}</p>
                <p><strong>Institution:</strong> {application.education_data?.institution || '—'}</p>
                <p><strong>Course / Degree:</strong> {application.education_data?.degree || '—'}</p>
                <p><strong>Current Grade/Year:</strong> {application.education_data?.current_grade || '—'}</p>
                <p><strong>Graduation Year:</strong> {application.education_data?.graduation_year || '—'}</p>
                <p className="sm:col-span-2"><strong>Academic Achievements:</strong> {application.education_data?.academic_achievements || 'None listed'}</p>
              </div>
            </div>

            {/* 3. Work & Experience */}
            <div className="bg-white border-2 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <Briefcase className="w-4 h-4 text-indigo-700" /> 03. Current Work & Experience
              </h3>
              <div className="space-y-2 text-xs font-bold text-gray-700">
                <p>
                  <strong>Role:</strong> {application.professional_data?.no_work_experience ? 'Student / Beginner (No prior professional experience)' : `${application.professional_data?.occupation || '—'} at ${application.professional_data?.company || 'Independent'}`}
                </p>
                {application.professional_data?.projects_worked_on && (
                  <p><strong>Projects / Experiments:</strong> {application.professional_data.projects_worked_on}</p>
                )}
              </div>
            </div>

            {/* 4. AI Experience & Tools */}
            <div className="bg-white border-2 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <Bot className="w-4 h-4 text-indigo-700" /> 04. AI Familiarity & Tools
              </h3>
              <div className="space-y-2 text-xs font-bold text-gray-700">
                <p><strong>Familiarity:</strong> {application.ai_experience?.used_ai_before || '—'}</p>
                <p><strong>Tools Used:</strong> {application.ai_experience?.ai_tools_used?.join(', ') || '—'}</p>
                <p><strong>Current Use Cases:</strong> {application.ai_experience?.ai_use_cases?.join(', ') || '—'}</p>
                <p><strong>AI Wishlist Item:</strong> {application.ai_experience?.ai_wishlist || '—'}</p>
              </div>
            </div>

            {/* 5. Learning Goals */}
            <div className="bg-white border-2 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <Target className="w-4 h-4 text-indigo-700" /> 05. Desired Topics & Top Goals
              </h3>
              <div className="space-y-2 text-xs font-bold text-gray-700">
                <p><strong>Selected Topics:</strong> {application.learning_goals?.desired_topics?.join(', ') || '—'}</p>
                <p className="whitespace-pre-wrap"><strong>Top 3 Goals:</strong><br />{application.learning_goals?.top_3_goals || '—'}</p>
                <p><strong>Worth It Criteria:</strong> {application.learning_goals?.worth_it_criteria || '—'}</p>
              </div>
            </div>

            {/* 6. Motivation */}
            <div className="bg-white border-2 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <Heart className="w-4 h-4 text-indigo-700" /> 10. Personal Motivation
              </h3>
              <div className="space-y-2 text-xs font-bold text-gray-700">
                <p><strong>Why Join:</strong> {application.motivation_data?.why_join || '—'}</p>
                <p><strong>Hope for Change:</strong> {application.motivation_data?.life_change_hope || '—'}</p>
                <p><strong>Why Select You:</strong> {application.motivation_data?.why_select_you || '—'}</p>
              </div>
            </div>

            {/* 7. Links & Portfolio */}
            <div className="bg-white border-2 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <LinkIcon className="w-4 h-4 text-indigo-700" /> 12. Online Profiles & Portfolio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                {application.portfolio_data?.linkedin_url && (
                  <a href={application.portfolio_data.linkedin_url} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline flex items-center gap-1">
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {application.portfolio_data?.github_url && (
                  <a href={application.portfolio_data.github_url} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline flex items-center gap-1">
                    GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {application.portfolio_data?.website_url && (
                  <a href={application.portfolio_data.website_url} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline flex items-center gap-1">
                    Website / Portfolio <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {!application.portfolio_data?.linkedin_url && !application.portfolio_data?.github_url && !application.portfolio_data?.website_url && (
                  <p className="text-gray-500">No external links provided (Beginner applicant).</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Communications Thread & Audit History */}
          <div className="space-y-6">
            
            {/* Communication Thread */}
            <div className="bg-white border-2 sm:border-4 border-gray-900 p-4 sm:p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <MessageSquare className="w-4 h-4 text-indigo-700" />
                <h3 className="text-xs font-black uppercase text-gray-900">
                  Applicant Thread ({messages.length})
                </h3>
              </div>

              {/* Messages list */}
              <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1 text-xs">
                {messages.length === 0 ? (
                  <p className="text-gray-400 font-bold text-center py-6">No messages in this thread yet.</p>
                ) : (
                  messages.map(msg => {
                    const isAdmin = msg.sender_type === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 border border-gray-900 ${
                          isAdmin ? 'bg-amber-50' : 'bg-indigo-50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-500 mb-1">
                          <span className={isAdmin ? 'text-amber-900' : 'text-indigo-900'}>
                            {msg.sender_name}
                          </span>
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="font-bold text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Post new message */}
              <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-gray-200">
                <textarea
                  rows={2}
                  value={newMsgText}
                  onChange={e => setNewMsgText(e.target.value)}
                  placeholder="Post message to applicant..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !newMsgText.trim()}
                  className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5"
                >
                  {sendingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  SEND MESSAGE
                </button>
              </form>
            </div>

            {/* Audit History Log */}
            <div className="bg-white border-2 border-gray-900 p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-900 pb-2">
                <History className="w-4 h-4 text-indigo-700" />
                <h3 className="text-xs font-black uppercase text-gray-900">
                  Audit History Log ({events.length})
                </h3>
              </div>

              <div className="max-h-[240px] overflow-y-auto space-y-2 text-[11px] font-mono">
                {events.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No audit events recorded yet.</p>
                ) : (
                  events.map(evt => (
                    <div key={evt.id} className="p-2 bg-gray-50 border border-gray-200 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                        <span className="font-black text-indigo-900">{evt.event_type}</span>
                        <span>{new Date(evt.created_at).toLocaleDateString()}</span>
                      </div>
                      {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                        <p className="text-[10px] text-gray-600 truncate font-mono">
                          {JSON.stringify(evt.metadata)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 1. ACCEPT APPLICATION CONFIRMATION MODAL */}
      {acceptModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-gray-900 p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6">
            
            <div className="flex items-center justify-between border-b-2 border-gray-900 pb-3">
              <h3 className="text-base font-black uppercase text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                CONFIRM PROGRAM ACCEPTANCE
              </h3>
              <button onClick={() => setAcceptModalOpen(false)} className="p-1 hover:bg-gray-100 border border-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-bold text-gray-700 leading-relaxed">
              Select the scholarship award for <strong>{application.full_name}</strong>:
            </p>

            <div className="space-y-3">
              {/* Option 1: 50% */}
              <label 
                className={`flex items-start gap-3 p-3.5 border-2 border-gray-900 cursor-pointer transition-all ${
                  selectedScholarship === 50 ? 'bg-emerald-50 border-emerald-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]' : 'bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="scholarship"
                  checked={selectedScholarship === 50}
                  onChange={() => setSelectedScholarship(50)}
                  className="mt-1 w-4 h-4 accent-emerald-600"
                />
                <div>
                  <p className="font-black text-xs uppercase text-gray-900">50% Standard Scholarship</p>
                  <p className="text-xs font-bold text-emerald-800">₹10,000 → ₹5,000 Payable</p>
                </div>
              </label>

              {/* Option 2: 75% */}
              <label 
                className={`flex items-start gap-3 p-3.5 border-2 border-gray-900 cursor-pointer transition-all ${
                  selectedScholarship === 75 ? 'bg-emerald-50 border-emerald-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]' : 'bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="scholarship"
                  checked={selectedScholarship === 75}
                  onChange={() => setSelectedScholarship(75)}
                  className="mt-1 w-4 h-4 accent-emerald-600"
                />
                <div>
                  <p className="font-black text-xs uppercase text-gray-900">75% Merited Scholarship</p>
                  <p className="text-xs font-bold text-emerald-800">₹10,000 → ₹2,500 Payable</p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-gray-900">
              <button
                type="button"
                onClick={() => setAcceptModalOpen(false)}
                className="px-4 py-2.5 bg-white border-2 border-gray-900 font-bold text-xs uppercase"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleAcceptApplication}
                disabled={isAccepting}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)]"
              >
                {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CONFIRM ACCEPTANCE →'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. REQUEST MORE INFO MODAL */}
      {needsInfoModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-gray-900 p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4">
            
            <div className="flex items-center justify-between border-b-2 border-gray-900 pb-3">
              <h3 className="text-base font-black uppercase text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                REQUEST MORE INFORMATION
              </h3>
              <button onClick={() => setNeedsInfoModalOpen(false)} className="p-1 hover:bg-gray-100 border border-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-bold text-gray-700">
              Specify what details or clarifications the applicant needs to provide:
            </p>

            <textarea
              rows={4}
              required
              value={needsInfoMessage}
              onChange={e => setNeedsInfoMessage(e.target.value)}
              placeholder="e.g. Please clarify your schedule availability for Tuesday & Thursday live demos..."
              className="w-full p-3 bg-gray-50 border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-gray-900">
              <button
                type="button"
                onClick={() => setNeedsInfoModalOpen(false)}
                className="px-4 py-2.5 bg-white border-2 border-gray-900 font-bold text-xs uppercase"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleRequestMoreInfo}
                disabled={isRequestingInfo || !needsInfoMessage.trim()}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 border-2 border-gray-900 font-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)]"
              >
                {isRequestingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SEND REQUEST →'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. DECLINE APPLICATION MODAL */}
      {declineModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-gray-900 p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4">
            
            <div className="flex items-center justify-between border-b-2 border-gray-900 pb-3">
              <h3 className="text-base font-black uppercase text-gray-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                DECLINE APPLICATION
              </h3>
              <button onClick={() => setDeclineModalOpen(false)} className="p-1 hover:bg-gray-100 border border-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-bold text-gray-700">
              Are you sure you want to decline this application? You can optionally add constructive feedback for the applicant:
            </p>

            <textarea
              rows={3}
              value={declineFeedback}
              onChange={e => setDeclineFeedback(e.target.value)}
              placeholder="Optional constructive feedback..."
              className="w-full p-3 bg-gray-50 border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-gray-900">
              <button
                type="button"
                onClick={() => setDeclineModalOpen(false)}
                className="px-4 py-2.5 bg-white border-2 border-gray-900 font-bold text-xs uppercase"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleDeclineApplication}
                disabled={isDeclining}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white border-2 border-gray-900 font-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)]"
              >
                {isDeclining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CONFIRM DECLINE'}
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminKrishnaiteApplicationDetailPage;
