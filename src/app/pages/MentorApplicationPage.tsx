import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  Briefcase, 
  Award, 
  Clock, 
  Calendar, 
  Globe, 
  Link as LinkIcon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  UploadCloud, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  DollarSign, 
  HelpCircle, 
  Eye, 
  Info,
  Loader2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { sendAdminNotification, buildNewApplicationEmail } from '../../lib/adminNotifications';

const STORAGE_DRAFT_KEY = 'mentozy_mentor_application_draft_v2';

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface LanguageItem {
  language: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface SkillItem {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years: string;
}

export interface ApplicationFormData {
  // 1. Personal
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
  profilePhotoUrl: string;

  // 2. Education
  educationStatus: string;
  currentGrade: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  highestQualification: string;
  academicAchievements: string;

  // 3. Professional
  occupation: string;
  organization: string;
  jobTitle: string;
  yearsExperience: string;
  professionalSummary: string;
  previousExperiences: ExperienceItem[];

  // 4. Expertise & Skills
  primaryExpertise: string;
  secondaryExpertise: string[];
  skillsList: SkillItem[];
  whatCanYouTeach: string;

  // 5. Mentoring Experience & Preferences
  hasMentoringExperience: boolean;
  mentoringTypes: string[];
  mentoredAudience: string[];
  learnerCount: string;
  mentoringDuration: string;
  mentoringDescription: string;
  previousTeachingPlatforms: string[];
  mentoringEvidenceLinks: string;
  noExperienceConfidence: string;

  studentLevels: string[];
  studentAgeGroups: string[];
  mentorshipFormats: string[];
  sessionStyles: string[];
  topicsNotToMentor: string;

  // 6. Teaching Approach
  mentoringPhilosophy: string;
  teachingStyles: string[];
  scenarioDifficultStudent: string;
  scenarioDifferentSkillLevels: string;
  scenarioUnmotivatedStudent: string;
  scenarioUnknownQuestion: string;
  scenarioConstructiveFeedback: string;

  // 7. Availability & Communication
  hoursPerWeek: string;
  preferredSessionLengths: string[];
  availableDays: string[];
  availableTimeSlots: Record<string, string>;
  minimumNotice: string;
  languages: LanguageItem[];
  communicationMethods: string[];

  // 8. Portfolio & General Questions
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  websiteUrl: string;
  otherLinks: string;
  achievements: string;

  qWhyMentozy: string;
  qStudentOutcomes: string;
  qWishKnownEarlier: string;
  qHelpedSomeone: string;
  qDifferentApproach: string;
  qStudentDisagrees: string;
  qProfessionalBoundaries: string;
  qAcademicIntegrity: string;

  // 9. Pricing & Safety
  paidMentoringInterest: string;
  price30Min: string;
  price60Min: string;
  priceRecommendationRequested: boolean;
  freeIntroSessions: string;

  codeOfConductAgreed: boolean;
  termsAgreed: boolean;
  accurateInfoDeclared: boolean;
  verificationConsent: boolean;
}

const INITIAL_FORM: ApplicationFormData = {
  fullName: '',
  displayName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  country: 'India',
  state: '',
  city: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  profilePhotoUrl: '',

  educationStatus: 'Undergraduate Student',
  currentGrade: '3rd Year',
  degree: 'B.Tech in Computer Science',
  fieldOfStudy: 'Computer Science',
  institution: '',
  graduationYear: '2026',
  highestQualification: "Bachelor's",
  academicAchievements: '',

  occupation: 'Software Engineer',
  organization: '',
  jobTitle: '',
  yearsExperience: '1–2 years',
  professionalSummary: '',
  previousExperiences: [],

  primaryExpertise: 'Web Development',
  secondaryExpertise: ['React', 'Node.js', 'TypeScript', 'TailwindCSS'],
  skillsList: [
    { name: 'React', level: 'Advanced', years: '2' },
    { name: 'JavaScript / TypeScript', level: 'Advanced', years: '3' },
    { name: 'Full-Stack Development', level: 'Intermediate', years: '2' }
  ],
  whatCanYouTeach: '',

  hasMentoringExperience: true,
  mentoringTypes: ['Peer mentoring', 'Online mentoring'],
  mentoredAudience: ['College students', 'Beginners'],
  learnerCount: '6–20',
  mentoringDuration: '6–12 months',
  mentoringDescription: '',
  previousTeachingPlatforms: ['Community'],
  mentoringEvidenceLinks: '',
  noExperienceConfidence: '',

  studentLevels: ['Beginner', 'Intermediate'],
  studentAgeGroups: ['16–18', '18+'],
  mentorshipFormats: ['One-on-one', 'Project guidance', 'Career guidance'],
  sessionStyles: ['Project-based', 'Problem solving', 'Q&A'],
  topicsNotToMentor: '',

  mentoringPhilosophy: '',
  teachingStyles: ['Practical', 'Project-based', 'Conversational'],
  scenarioDifficultStudent: '',
  scenarioDifferentSkillLevels: '',
  scenarioUnmotivatedStudent: '',
  scenarioUnknownQuestion: '',
  scenarioConstructiveFeedback: '',

  hoursPerWeek: '3–5',
  preferredSessionLengths: ['30 minutes', '60 minutes'],
  availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  availableTimeSlots: {
    'Monday': '18:00 – 21:00',
    'Wednesday': '18:00 – 21:00',
    'Friday': '18:00 – 21:00',
    'Saturday': '10:00 – 14:00'
  },
  minimumNotice: '24 hours',
  languages: [
    { language: 'English', proficiency: 'Fluent' },
    { language: 'Hindi', proficiency: 'Native' }
  ],
  communicationMethods: ['Video call', 'Audio call', 'Screen sharing', 'Chat', 'Whiteboard'],

  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  websiteUrl: '',
  otherLinks: '',
  achievements: '',

  qWhyMentozy: '',
  qStudentOutcomes: '',
  qWishKnownEarlier: '',
  qHelpedSomeone: '',
  qDifferentApproach: '',
  qStudentDisagrees: '',
  qProfessionalBoundaries: '',
  qAcademicIntegrity: '',

  paidMentoringInterest: 'Yes',
  price30Min: '399',
  price60Min: '699',
  priceRecommendationRequested: false,
  freeIntroSessions: 'Maybe',

  codeOfConductAgreed: false,
  termsAgreed: false,
  accurateInfoDeclared: false,
  verificationConsent: false
};

const STEPS = [
  { id: 0, title: 'Welcome', short: 'Intro' },
  { id: 1, title: 'Personal Info', short: 'Personal' },
  { id: 2, title: 'Education', short: 'Education' },
  { id: 3, title: 'Professional Background', short: 'Experience' },
  { id: 4, title: 'Expertise & Skills', short: 'Expertise' },
  { id: 5, title: 'Mentoring & Preferences', short: 'Mentoring' },
  { id: 6, title: 'Approach & Scenarios', short: 'Approach' },
  { id: 7, title: 'Availability & Languages', short: 'Availability' },
  { id: 8, title: 'Portfolio & Questions', short: 'Portfolio' },
  { id: 9, title: 'Pricing & Safety', short: 'Pricing' },
  { id: 10, title: 'Review & Submit', short: 'Review' }
];

export function MentorApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSecondaryTag, setNewSecondaryTag] = useState('');
  const [applicantFeedbackReply, setApplicantFeedbackReply] = useState('');

  // 1. Load Draft from LocalStorage & Prefill Authenticated User
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn('Could not parse local application draft');
      }
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.user_metadata?.full_name || '',
        email: user.email || prev.email || '',
        displayName: prev.displayName || user.user_metadata?.full_name || ''
      }));
    }
  }, [user]);

  // 2. Check If User Already Has a Submitted Application in Database
  useEffect(() => {
    async function checkExistingApplication() {
      if (!user || !supabase) {
        setLoadingExisting(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mentor_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          setExistingApplication(data);
          // Redirect to the dedicated Applicant Portal
          navigate('/mentor/application', { replace: true });
        }
      } catch (err) {
        // Table might not exist yet or no existing app
      } finally {
        setLoadingExisting(false);
      }
    }

    checkExistingApplication();
  }, [user, navigate]);

  // 3. Auto-Save Draft to LocalStorage
  const handleUpdate = <K extends keyof ApplicationFormData>(field: K, value: ApplicationFormData[K]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Progress Calculation
  const progressPercent = useMemo(() => {
    if (currentStep === 0) return 5;
    return Math.min(100, Math.round((currentStep / 10) * 100));
  }, [currentStep]);

  // Navigation handlers
  const handleNext = () => {
    // Basic validations per step
    if (currentStep === 1) {
      if (!formData.fullName.trim() || formData.fullName.length < 2) {
        toast.error('Please enter your full name (at least 2 characters).');
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        toast.error('Please enter a valid email address.');
        return;
      }
    }

    if (currentStep === 4) {
      if (!formData.primaryExpertise.trim()) {
        toast.error('Please specify your primary area of expertise.');
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.min(10, prev + 1));
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Submit Application
  const handleSubmit = async () => {
    if (!formData.codeOfConductAgreed || !formData.termsAgreed || !formData.accurateInfoDeclared) {
      toast.error('Please accept the required declarations and Code of Conduct to proceed.');
      return;
    }

    setIsSubmitting(true);
    const appNumber = `MNT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      application_number: appNumber,
      user_id: user?.id || null,
      full_name: formData.fullName.trim(),
      display_name: formData.displayName.trim() || formData.fullName.trim(),
      email: formData.email.trim(),
      phone_number: formData.phone.trim(),
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      timezone: formData.timezone,
      profile_photo_url: formData.profilePhotoUrl,

      education_status: formData.educationStatus,
      current_grade: formData.currentGrade,
      degree: formData.degree,
      field_of_study: formData.fieldOfStudy,
      institution: formData.institution,
      graduation_year: formData.graduationYear,
      highest_qualification: formData.highestQualification,
      academic_achievements: formData.academicAchievements,

      occupation: formData.occupation,
      organization: formData.organization,
      job_title: formData.jobTitle,
      years_experience: formData.yearsExperience,
      professional_summary: formData.professionalSummary,
      previous_experiences: formData.previousExperiences,

      primary_expertise: formData.primaryExpertise,
      secondary_expertise: formData.secondaryExpertise,
      skills: formData.skillsList.map(s => s.name),
      skill_levels: formData.skillsList.reduce((acc, s) => ({ ...acc, [s.name]: s.level }), {}),
      what_can_you_teach: formData.whatCanYouTeach,

      has_mentoring_experience: formData.hasMentoringExperience,
      mentoring_types: formData.mentoringTypes,
      mentored_audience: formData.mentoredAudience,
      learner_count: formData.learnerCount,
      mentoring_duration: formData.mentoringDuration,
      mentoring_description: formData.mentoringDescription,
      previous_teaching_platforms: formData.previousTeachingPlatforms,
      mentoring_evidence_links: formData.mentoringEvidenceLinks,
      no_experience_confidence: formData.noExperienceConfidence,

      student_levels: formData.studentLevels,
      student_age_groups: formData.studentAgeGroups,
      mentorship_formats: formData.mentorshipFormats,
      session_styles: formData.sessionStyles,
      topics_not_to_mentor: formData.topicsNotToMentor,

      mentoring_philosophy: formData.mentoringPhilosophy,
      teaching_style: formData.teachingStyles,
      scenario_difficult_student: formData.scenarioDifficultStudent,
      scenario_different_skill_levels: formData.scenarioDifferentSkillLevels,
      scenario_unmotivated_student: formData.scenarioUnmotivatedStudent,
      scenario_unknown_question: formData.scenarioUnknownQuestion,
      scenario_constructive_feedback: formData.scenarioConstructiveFeedback,

      hours_per_week: formData.hoursPerWeek,
      preferred_session_lengths: formData.preferredSessionLengths,
      available_days: formData.availableDays,
      available_time_slots: formData.availableTimeSlots,
      minimum_notice: formData.minimumNotice,
      languages: formData.languages,
      communication_methods: formData.communicationMethods,

      linkedin_url: formData.linkedinUrl,
      github_url: formData.githubUrl,
      portfolio_url: formData.portfolioUrl,
      website_url: formData.websiteUrl,
      other_links: formData.otherLinks,
      achievements: formData.achievements,

      q_why_mentozy: formData.qWhyMentozy,
      q_student_outcomes: formData.qStudentOutcomes,
      q_wish_known_earlier: formData.qWishKnownEarlier,
      q_helped_someone: formData.qHelpedSomeone,
      q_different_approach: formData.qDifferentApproach,
      q_student_disagrees: formData.qStudentDisagrees,
      q_professional_boundaries: formData.qProfessionalBoundaries,
      q_academic_integrity: formData.qAcademicIntegrity,

      code_of_conduct_agreed: formData.codeOfConductAgreed,
      terms_agreed: formData.termsAgreed,
      accurate_info_declared: formData.accurateInfoDeclared,

      paid_mentoring_interest: formData.paidMentoringInterest,
      price_30_min: formData.price30Min ? Number(formData.price30Min) : null,
      price_60_min: formData.price60Min ? Number(formData.price60Min) : null,
      price_recommendation_requested: formData.priceRecommendationRequested,
      free_intro_sessions: formData.freeIntroSessions,

      status: 'under_review',
      submitted_at: new Date().toISOString()
    };

    try {
      if (supabase) {
        const { data: insertedData, error } = await supabase
          .from('mentor_applications')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.warn('Could not insert application to Supabase:', error.message);
        } else if (insertedData) {
          // Log Audit Event
          await supabase.from('mentor_application_events').insert({
            application_id: insertedData.id,
            actor_user_id: user?.id || null,
            actor_email: formData.email.trim(),
            event_type: 'submitted',
            message: `Application submitted by ${formData.fullName.trim()}`
          });
        }
      }

      // Dispatch server-side notification email to founder/admin
      await sendAdminNotification({
        to: 'founder@mentozy.app',
        subject: `🚀 New Mentor Application: ${formData.fullName.trim()} (${formData.primaryExpertise})`,
        html: buildNewApplicationEmail({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          primaryExpertise: formData.primaryExpertise,
          applicationNumber: appNumber,
          submittedAt: payload.submitted_at
        })
      });

    } catch (err) {
      console.warn('Submission database error:', err);
    } finally {
      setIsSubmitting(false);
      localStorage.removeItem(STORAGE_DRAFT_KEY);
      localStorage.setItem('mentozy_last_application_number', appNumber);
      localStorage.setItem('mentozy_applicant_email', formData.email.trim());
      setExistingApplication(payload);
      toast.success('🎉 Application Submitted Successfully! Opening your Applicant Portal...');
      setTimeout(() => {
        navigate('/mentor/application', { replace: true });
      }, 500);
    }
  };

  // Submit additional requested information
  const handleSubmitMoreInfo = async () => {
    if (!applicantFeedbackReply.trim() || !existingApplication) return;
    setIsSubmitting(true);

    try {
      if (supabase) {
        await supabase
          .from('mentor_applications')
          .update({
            applicant_response: applicantFeedbackReply.trim(),
            status: 'under_review',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingApplication.id);

        // Log audit event
        await supabase.from('mentor_application_events').insert({
          application_id: existingApplication.id,
          actor_user_id: user?.id || null,
          actor_email: existingApplication.email,
          event_type: 'information_received',
          message: `Applicant response: "${applicantFeedbackReply.trim()}"`
        });

        // Notify admin
        await sendAdminNotification({
          to: 'founder@mentozy.app',
          subject: `💬 Applicant Response Received: ${existingApplication.full_name || 'Applicant'} (${existingApplication.application_number})`,
          html: `<p><strong>${existingApplication.full_name}</strong> has submitted the requested information for application <strong>${existingApplication.application_number}</strong>:<br/><br/><em>"${applicantFeedbackReply.trim()}"</em></p>`
        });
      }
      setExistingApplication((prev: any) => ({
        ...prev,
        applicant_response: applicantFeedbackReply.trim(),
        status: 'under_review'
      }));
      toast.success('Response submitted to Mentozy reviewers');
      setApplicantFeedbackReply('');
    } catch (err) {
      toast.error('Could not submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // VIEW: Existing Application Status Tracker
  // ==========================================
  if (existingApplication && !loadingExisting) {
    const isUnderReview = existingApplication.status === 'under_review' || existingApplication.status === 'pending';
    const isNeedsInfo = existingApplication.status === 'needs_info';
    const isApproved = existingApplication.status === 'approved';
    const isRejected = existingApplication.status === 'rejected';

    return (
      <div className="min-h-screen bg-[#FAF9F6] font-mono text-gray-900 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white border-b-4 border-gray-900 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer group border-4 border-gray-900 bg-white px-3 py-1.5 shadow-[4px_4px_0px_rgba(0,0,0,1)]" 
              onClick={() => navigate('/')}
            >
              <span className="text-xl font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
              <div className="w-3.5 h-3.5 bg-[#f39c12] border-2 border-gray-900"></div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50"
            >
              Return Home
            </button>
          </div>
        </div>

        {/* Status Content */}
        <div className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12 flex flex-col items-center justify-center">
          <div className="w-full bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-left space-y-6">
            
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-4 border-gray-900">
              <div>
                <span className="inline-block px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-[11px] font-black uppercase tracking-wider mb-2">
                  Application Portal
                </span>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  {isApproved ? '🎉 Application Approved!' : isNeedsInfo ? '⚠️ Action Required' : isRejected ? 'Application Status' : '🎉 Application Received'}
                </h1>
              </div>

              {/* Status Pill */}
              <div className={`px-4 py-2 border-4 border-gray-900 font-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] self-start sm:self-auto ${
                isApproved ? 'bg-emerald-400 text-gray-900' :
                isNeedsInfo ? 'bg-amber-400 text-gray-900 animate-bounce' :
                isRejected ? 'bg-rose-400 text-gray-900' :
                'bg-[#f39c12] text-gray-900'
              }`}>
                {isApproved ? 'APPROVED' : isNeedsInfo ? 'NEEDS INFORMATION' : isRejected ? 'DECLINED' : 'UNDER REVIEW'}
              </div>
            </div>

            {/* Application Meta Details */}
            <div className="grid sm:grid-cols-2 gap-4 bg-[#FAF9F6] border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-xs">
              <div>
                <p className="font-bold text-gray-500 uppercase">Application ID</p>
                <p className="font-black text-base text-gray-900 mt-0.5">{existingApplication.application_number || 'MNT-2026-PENDING'}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500 uppercase">Applicant Name</p>
                <p className="font-black text-base text-gray-900 mt-0.5">{existingApplication.full_name || existingApplication.displayName}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500 uppercase">Primary Expertise</p>
                <p className="font-black text-sm text-gray-900 mt-0.5">{existingApplication.primary_expertise || 'General Mentorship'}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500 uppercase">Submitted On</p>
                <p className="font-black text-sm text-gray-900 mt-0.5">{new Date(existingApplication.submitted_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Under Review Message */}
            {isUnderReview && (
              <div className="space-y-4">
                <div className="p-4 bg-[#eff3ff] border-2 border-gray-900 text-xs font-bold leading-relaxed text-gray-800">
                  <p className="mb-2">
                    Thank you for applying to become a mentor on Mentozy. Your application is currently being evaluated by our academic and admissions panel.
                  </p>
                  <p>
                    We verify experience, mentoring approach, and profile details. You will receive an update at <strong className="text-gray-900 underline">{existingApplication.email}</strong> once the review is completed.
                  </p>
                </div>
              </div>
            )}

            {/* Admin Needs More Info Panel */}
            {isNeedsInfo && (
              <div className="space-y-4 bg-amber-50 border-4 border-gray-900 p-5">
                <h3 className="font-black text-sm uppercase text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Additional Information Requested by Reviewers:
                </h3>
                <div className="p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-800">
                  {existingApplication.admin_feedback || 'Please provide additional details regarding your past experience or certificates.'}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-gray-900">Your Response:</label>
                  <textarea 
                    rows={4}
                    value={applicantFeedbackReply}
                    onChange={e => setApplicantFeedbackReply(e.target.value)}
                    placeholder="Provide the requested details or links..."
                    className="w-full bg-white border-2 border-gray-900 p-3 text-xs font-bold focus:bg-amber-50 outline-none"
                  />
                  <button 
                    onClick={handleSubmitMoreInfo}
                    disabled={isSubmitting || !applicantFeedbackReply.trim()}
                    className="px-6 py-3 bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Response'}
                  </button>
                </div>
              </div>
            )}

            {/* Approved Message */}
            {isApproved && (
              <div className="space-y-4 bg-emerald-50 border-4 border-gray-900 p-5">
                <p className="text-xs font-bold text-gray-900 leading-relaxed">
                  Congratulations! Your application has been approved. You are now officially recognized as a Mentozy Mentor. Access your mentor workspace below.
                </p>
                <button 
                  onClick={() => navigate('/mentor-dashboard')}
                  className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-gray-900 font-black text-xs uppercase border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer"
                >
                  Go to Mentor Dashboard <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex flex-wrap gap-4 border-t-2 border-gray-200">
              <button 
                onClick={() => navigate('/mentor/application')}
                className="px-5 py-2.5 bg-[#f39c12] text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#e08e0b] cursor-pointer"
              >
                Open Applicant Portal →
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-5 py-2.5 bg-gray-900 text-white font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-gray-800"
              >
                Return Home
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Do you wish to start a new application draft?')) {
                    setExistingApplication(null);
                    setCurrentStep(0);
                  }
                }}
                className="px-5 py-2.5 bg-white text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-gray-50"
              >
                New Application
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MULTI-STEP FORM WORKFLOW (Steps 0 - 10)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FAF9F6] font-mono text-gray-900 flex flex-col select-none">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white border-b-4 border-gray-900 px-3 sm:px-6 py-2.5 sm:py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button 
              onClick={() => currentStep === 0 ? navigate('/teacher-type') : handleBack()} 
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 min-h-[40px] border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Back</span>
            </button>
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group border-2 sm:border-4 border-gray-900 bg-white px-2.5 sm:px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)]" 
              onClick={() => navigate('/')}
            >
              <span className="text-base sm:text-lg font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#f39c12] border-2 border-gray-900"></div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden sm:inline-block text-xs font-black text-gray-600 uppercase">
              Mentor Application
            </span>
            <div className="px-2.5 sm:px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-[11px] sm:text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {progressPercent}% <span className="hidden xs:inline">COMPLETE</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Strip */}
        <div className="max-w-5xl mx-auto mt-2.5 sm:mt-3 h-2 sm:h-2.5 bg-gray-200 border-2 border-gray-900 overflow-hidden relative">
          <div 
            className="h-full bg-[#f39c12] transition-all duration-300 border-r-2 border-gray-900"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Mobile Step Indicator Banner */}
        {currentStep > 0 && (
          <div className="max-w-5xl mx-auto mt-2 md:hidden flex items-center justify-between text-[11px] font-black uppercase text-gray-700 pt-0.5">
            <span className="bg-gray-900 text-white px-2 py-0.5 text-[10px]">Step {currentStep} of 10</span>
            <span className="text-gray-900 font-black truncate max-w-[200px] border-b-2 border-[#f39c12]">
              {STEPS[currentStep]?.short || 'Details'}
            </span>
          </div>
        )}

        {/* Step Indicator Tabs (Desktop) */}
        <div className="max-w-5xl mx-auto mt-2 hidden md:flex items-center justify-between overflow-x-auto py-1 text-[10px] font-bold text-gray-500 uppercase">
          {STEPS.slice(1).map((s) => (
            <span 
              key={s.id} 
              onClick={() => currentStep > 0 && setCurrentStep(s.id)}
              className={`cursor-pointer px-1 py-0.5 transition-colors ${
                currentStep === s.id ? 'text-gray-900 font-black border-b-2 border-gray-900' :
                currentStep > s.id ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              {s.id}. {s.short}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Main Form Canvas */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-6 md:p-10 flex flex-col justify-center min-w-0">
        
        {/* STEP 0: Welcome & Introduction Screen */}
        {currentStep === 0 && (
          <div className="bg-white border-2 sm:border-4 border-gray-900 p-5 sm:p-8 md:p-12 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] text-left space-y-6 sm:space-y-8 animate-in fade-in duration-300 min-w-0">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-3.5 h-3.5 text-[#f39c12]" /> Mentor Admissions
              </span>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 leading-none">
                Become a Mentor on <span className="bg-[#f39c12] border-4 border-gray-900 px-2 py-0.5 inline-block rotate-1">Mentozy</span>
              </h1>
              <p className="text-sm md:text-base text-gray-700 font-bold uppercase leading-relaxed max-w-2xl">
                Share your knowledge, guide eager learners, and help students master skills, build projects, and prepare for careers.
              </p>
            </div>

            {/* What you'll need grid */}
            <div className="bg-[#FAF9F6] border-4 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="text-sm font-black uppercase text-gray-900 tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> What You'll Need For This Application:
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-xs font-bold text-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-900"></div> Basic personal & contact information
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-900"></div> Education & professional background
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-900"></div> Primary & secondary areas of expertise
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-900"></div> Mentoring approach & scenario answers
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-900"></div> Weekly availability & languages
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-900"></div> Portfolio, LinkedIn or GitHub links
                </div>
              </div>
            </div>

            {/* Notice pill */}
            <div className="p-4 bg-[#eff3ff] border-2 border-gray-900 text-xs font-bold text-gray-800 flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black uppercase text-gray-900">Estimated completion time: 10–15 minutes</p>
                <p className="mt-1">
                  Your application will be reviewed by the Mentozy academic team. Progress is automatically saved as a draft.
                </p>
              </div>
            </div>

            {/* Launch Action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={() => setCurrentStep(1)}
                className="px-8 py-4 bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-sm uppercase border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Start Application <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 1 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Personal Information</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">Establish who you are for your mentor profile.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-black text-gray-900 uppercase">Full Name * <span className="text-red-500">🔴</span></label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => handleUpdate('fullName', e.target.value)}
                  placeholder="e.g. Harshita Bhaskaruni"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Preferred Display Name <span className="text-gray-400">⚪</span></label>
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={e => handleUpdate('displayName', e.target.value)}
                  placeholder="e.g. Harshita B."
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
                <span className="text-[10px] text-gray-500">How your name appears to students publicly.</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Email Address * <span className="text-red-500">🔴</span></label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => handleUpdate('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Phone Number <span className="text-yellow-600">🟡</span></label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => handleUpdate('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Date of Birth <span className="text-red-500">🔴</span></label>
                <input 
                  type="date" 
                  value={formData.dateOfBirth}
                  onChange={e => handleUpdate('dateOfBirth', e.target.value)}
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Gender <span className="text-yellow-600">🟡</span></label>
                <select 
                  value={formData.gender}
                  onChange={e => handleUpdate('gender', e.target.value)}
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Timezone * <span className="text-red-500">🔴</span></label>
                <input 
                  type="text" 
                  value={formData.timezone}
                  onChange={e => handleUpdate('timezone', e.target.value)}
                  placeholder="Asia/Kolkata"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-black text-gray-900 uppercase">Location (Country, State, City) * <span className="text-red-500">🔴</span></label>
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    placeholder="Country (India)" 
                    value={formData.country} 
                    onChange={e => handleUpdate('country', e.target.value)}
                    className="bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs" 
                  />
                  <input 
                    type="text" 
                    placeholder="State" 
                    value={formData.state} 
                    onChange={e => handleUpdate('state', e.target.value)}
                    className="bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs" 
                  />
                  <input 
                    type="text" 
                    placeholder="City" 
                    value={formData.city} 
                    onChange={e => handleUpdate('city', e.target.value)}
                    className="bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Education & Academic Background */}
        {currentStep === 2 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 2 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Education & Academic Background</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">Your academic credentials and learning path.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Current Education Status * <span className="text-red-500">🔴</span></label>
                <select 
                  value={formData.educationStatus}
                  onChange={e => handleUpdate('educationStatus', e.target.value)}
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                >
                  <option>Undergraduate Student</option>
                  <option>Postgraduate Student</option>
                  <option>Working Professional</option>
                  <option>High School</option>
                  <option>Doctoral Student</option>
                  <option>Self-Taught</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Current Grade / Year <span className="text-yellow-600">🟡</span></label>
                <input 
                  type="text" 
                  value={formData.currentGrade}
                  onChange={e => handleUpdate('currentGrade', e.target.value)}
                  placeholder="e.g. 3rd Year / Grade 12"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Degree / Program * <span className="text-red-500">🔴</span></label>
                <input 
                  type="text" 
                  value={formData.degree}
                  onChange={e => handleUpdate('degree', e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Field of Study * <span className="text-red-500">🔴</span></label>
                <input 
                  type="text" 
                  value={formData.fieldOfStudy}
                  onChange={e => handleUpdate('fieldOfStudy', e.target.value)}
                  placeholder="e.g. Computer Science, Design, Mathematics"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-black text-gray-900 uppercase">School / College / University * <span className="text-red-500">🔴</span></label>
                <input 
                  type="text" 
                  value={formData.institution}
                  onChange={e => handleUpdate('institution', e.target.value)}
                  placeholder="e.g. Indian Institute of Technology / Stanford University"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Expected / Actual Graduation Year <span className="text-yellow-600">🟡</span></label>
                <input 
                  type="text" 
                  value={formData.graduationYear}
                  onChange={e => handleUpdate('graduationYear', e.target.value)}
                  placeholder="2026"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Highest Qualification <span className="text-yellow-600">🟡</span></label>
                <select 
                  value={formData.highestQualification}
                  onChange={e => handleUpdate('highestQualification', e.target.value)}
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                >
                  <option>High School</option>
                  <option>Diploma</option>
                  <option>Bachelor's</option>
                  <option>Master's</option>
                  <option>Doctorate</option>
                  <option>Professional Certification</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-black text-gray-900 uppercase">Academic Achievements / Honors <span className="text-gray-400">⚪</span></label>
                <textarea 
                  rows={3}
                  value={formData.academicAchievements}
                  onChange={e => handleUpdate('academicAchievements', e.target.value)}
                  placeholder="Tell us about scholarships, Olympiads, research publications, awards, or competitive exam percentiles."
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Professional Background */}
        {currentStep === 3 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 3 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Professional Background</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">Your work history and industry experience.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Current Occupation * <span className="text-red-500">🔴</span></label>
                <input 
                  type="text" 
                  value={formData.occupation}
                  onChange={e => handleUpdate('occupation', e.target.value)}
                  placeholder="e.g. Software Engineer, Designer, Student, Educator"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Years of Total Experience * <span className="text-red-500">🔴</span></label>
                <select 
                  value={formData.yearsExperience}
                  onChange={e => handleUpdate('yearsExperience', e.target.value)}
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                >
                  <option>Less than 1 year</option>
                  <option>1–2 years</option>
                  <option>3–5 years</option>
                  <option>5–10 years</option>
                  <option>10+ years</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Current Organization / Company <span className="text-yellow-600">🟡</span></label>
                <input 
                  type="text" 
                  value={formData.organization}
                  onChange={e => handleUpdate('organization', e.target.value)}
                  placeholder="e.g. Google, Microsoft, Freelance, Startup"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Job Title / Role <span className="text-yellow-600">🟡</span></label>
                <input 
                  type="text" 
                  value={formData.jobTitle}
                  onChange={e => handleUpdate('jobTitle', e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-black text-gray-900 uppercase">Professional Summary * <span className="text-red-500">🔴</span></label>
                <textarea 
                  rows={3}
                  value={formData.professionalSummary}
                  onChange={e => handleUpdate('professionalSummary', e.target.value)}
                  placeholder="Briefly describe your career, the technologies/tools you work with, and what real-world experience you bring to students."
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Expertise & Skills */}
        {currentStep === 4 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 4 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Expertise & Skills</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">What skills will students book sessions with you for?</p>
            </div>

            <div className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Primary Expertise Category * <span className="text-red-500">🔴</span></label>
                <select 
                  value={formData.primaryExpertise}
                  onChange={e => handleUpdate('primaryExpertise', e.target.value)}
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                >
                  <option>Web Development</option>
                  <option>Software Engineering</option>
                  <option>AI / Machine Learning & Data Science</option>
                  <option>Mobile App Development (Flutter/React Native/iOS/Android)</option>
                  <option>UI / UX & Product Design</option>
                  <option>Cybersecurity & Ethical Hacking</option>
                  <option>Cloud Computing & DevOps (AWS/GCP/Docker)</option>
                  <option>Mathematics & Competitive Programming</option>
                  <option>Product Management & Career Preparation</option>
                  <option>Entrepreneurship & Startup Growth</option>
                </select>
              </div>

              {/* Secondary Tags */}
              <div className="space-y-2">
                <label className="font-black text-gray-900 uppercase">Secondary Sub-Skills / Tags <span className="text-yellow-600">🟡</span></label>
                <div className="flex flex-wrap gap-2">
                  {formData.secondaryExpertise.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      {tag}
                      <button 
                        onClick={() => handleUpdate('secondaryExpertise', formData.secondaryExpertise.filter(t => t !== tag))}
                        className="text-gray-500 hover:text-red-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input 
                    type="text" 
                    placeholder="Add tag (e.g. Next.js, Figma, Python)"
                    value={newSecondaryTag}
                    onChange={e => setNewSecondaryTag(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newSecondaryTag.trim()) {
                        e.preventDefault();
                        if (!formData.secondaryExpertise.includes(newSecondaryTag.trim())) {
                          handleUpdate('secondaryExpertise', [...formData.secondaryExpertise, newSecondaryTag.trim()]);
                        }
                        setNewSecondaryTag('');
                      }
                    }}
                    className="bg-[#FAF9F6] border-2 border-gray-900 p-2.5 font-bold text-xs flex-1"
                  />
                  <button 
                    onClick={() => {
                      if (newSecondaryTag.trim() && !formData.secondaryExpertise.includes(newSecondaryTag.trim())) {
                        handleUpdate('secondaryExpertise', [...formData.secondaryExpertise, newSecondaryTag.trim()]);
                        setNewSecondaryTag('');
                      }
                    }}
                    className="px-4 py-2.5 bg-[#f39c12] border-2 border-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* What Can You Teach */}
              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">What Can Students Learn From You? * <span className="text-red-500">🔴</span></label>
                <textarea 
                  rows={4}
                  value={formData.whatCanYouTeach}
                  onChange={e => handleUpdate('whatCanYouTeach', e.target.value)}
                  placeholder="Example: I can help beginners learn React, build full-stack web projects, master frontend architecture, and prepare for coding interviews."
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Mentoring Experience & Preferences */}
        {currentStep === 5 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 5 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Mentoring Experience & Preferences</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">Your past guidance background and preferred audience.</p>
            </div>

            <div className="space-y-5 text-xs">
              <div className="p-4 bg-[#FAF9F6] border-2 border-gray-900 space-y-3">
                <label className="font-black text-gray-900 uppercase block">Have you mentored, taught, coached, or guided others before? *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-black cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasExp" 
                      checked={formData.hasMentoringExperience === true} 
                      onChange={() => handleUpdate('hasMentoringExperience', true)} 
                    /> Yes, I have mentoring experience
                  </label>
                  <label className="flex items-center gap-2 font-black cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasExp" 
                      checked={formData.hasMentoringExperience === false} 
                      onChange={() => handleUpdate('hasMentoringExperience', false)} 
                    /> No, I am a first-time mentor
                  </label>
                </div>
              </div>

              {formData.hasMentoringExperience ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-black text-gray-900 uppercase">Approximate Number of Learners Mentored</label>
                    <select 
                      value={formData.learnerCount}
                      onChange={e => handleUpdate('learnerCount', e.target.value)}
                      className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                    >
                      <option>1–5</option>
                      <option>6–20</option>
                      <option>21–50</option>
                      <option>51–100</option>
                      <option>100+</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-black text-gray-900 uppercase">Mentoring Duration</label>
                    <select 
                      value={formData.mentoringDuration}
                      onChange={e => handleUpdate('mentoringDuration', e.target.value)}
                      className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                    >
                      <option>Less than 3 months</option>
                      <option>3–6 months</option>
                      <option>6–12 months</option>
                      <option>1–2 years</option>
                      <option>2+ years</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-black text-gray-900 uppercase">Describe Your Mentoring Experience</label>
                    <textarea 
                      rows={3}
                      value={formData.mentoringDescription}
                      onChange={e => handleUpdate('mentoringDescription', e.target.value)}
                      placeholder="Where did you mentor? What formats or curriculum did you follow?"
                      className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="font-black text-gray-900 uppercase">What makes you confident that you can guide and help students?</label>
                  <textarea 
                    rows={3}
                    value={formData.noExperienceConfidence}
                    onChange={e => handleUpdate('noExperienceConfidence', e.target.value)}
                    placeholder="Tell us what motivates you to mentor and how your expertise will benefit learners."
                    className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                  />
                </div>
              )}

              {/* Student Levels */}
              <div className="space-y-2 pt-2 border-t-2 border-gray-200">
                <label className="font-black text-gray-900 uppercase block">Preferred Student Levels</label>
                <div className="flex flex-wrap gap-2">
                  {['Beginner', 'Intermediate', 'Advanced', 'Any level'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        const exists = formData.studentLevels.includes(level);
                        handleUpdate('studentLevels', exists ? formData.studentLevels.filter(l => l !== level) : [...formData.studentLevels, level]);
                      }}
                      className={`px-3 py-1.5 border-2 border-gray-900 font-bold text-xs uppercase transition-all ${
                        formData.studentLevels.includes(level) ? 'bg-[#f39c12] text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700'
                      }`}
                    >
                      {formData.studentLevels.includes(level) && '✓ '} {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Teaching Approach & Scenarios */}
        {currentStep === 6 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 6 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Teaching Approach & Scenarios</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">How you handle real mentoring situations.</p>
            </div>

            <div className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Mentoring Philosophy: What does being a good mentor mean to you? * <span className="text-red-500">🔴</span></label>
                <textarea 
                  rows={3}
                  value={formData.mentoringPhilosophy}
                  onChange={e => handleUpdate('mentoringPhilosophy', e.target.value)}
                  placeholder="Share your philosophy on guiding, encouraging, and elevating learners."
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Scenario 1: A student repeatedly struggles with a concept after multiple explanations. What would you do? * <span className="text-red-500">🔴</span></label>
                <textarea 
                  rows={3}
                  value={formData.scenarioDifficultStudent}
                  onChange={e => handleUpdate('scenarioDifficultStudent', e.target.value)}
                  placeholder="How do you break down hard problems, change analogies, or use visual whiteboard aids?"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Scenario 2: A student asks you a question that you don't know the answer to. What would you do? <span className="text-yellow-600">🟡</span></label>
                <textarea 
                  rows={2}
                  value={formData.scenarioUnknownQuestion}
                  onChange={e => handleUpdate('scenarioUnknownQuestion', e.target.value)}
                  placeholder="e.g. Model curiosity, research together, or follow up with resources."
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Scenario 3: How would you give constructive feedback to a student making repeated mistakes? <span className="text-yellow-600">🟡</span></label>
                <textarea 
                  rows={2}
                  value={formData.scenarioConstructiveFeedback}
                  onChange={e => handleUpdate('scenarioConstructiveFeedback', e.target.value)}
                  placeholder="Describe your feedback style (positive reinforcement, actionable steps)."
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Availability & Languages */}
        {currentStep === 7 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 7 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Availability & Languages</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">When are you available for student sessions?</p>
            </div>

            <div className="space-y-5 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-black text-gray-900 uppercase">Weekly Time Commitment (Hours/Week) * <span className="text-red-500">🔴</span></label>
                  <select 
                    value={formData.hoursPerWeek}
                    onChange={e => handleUpdate('hoursPerWeek', e.target.value)}
                    className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                  >
                    <option>1–2 hours</option>
                    <option>3–5 hours</option>
                    <option>6–10 hours</option>
                    <option>10–20 hours</option>
                    <option>20+ hours</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-black text-gray-900 uppercase">Minimum Booking Notice <span className="text-yellow-600">🟡</span></label>
                  <select 
                    value={formData.minimumNotice}
                    onChange={e => handleUpdate('minimumNotice', e.target.value)}
                    className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                  >
                    <option>2 hours</option>
                    <option>6 hours</option>
                    <option>12 hours</option>
                    <option>24 hours</option>
                    <option>48 hours</option>
                  </select>
                </div>
              </div>

              {/* Available Days */}
              <div className="space-y-2">
                <label className="font-black text-gray-900 uppercase block">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const exists = formData.availableDays.includes(day);
                        handleUpdate('availableDays', exists ? formData.availableDays.filter(d => d !== day) : [...formData.availableDays, day]);
                      }}
                      className={`px-3.5 py-2 border-2 border-gray-900 font-bold text-xs uppercase transition-all ${
                        formData.availableDays.includes(day) ? 'bg-[#f39c12] text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700'
                      }`}
                    >
                      {formData.availableDays.includes(day) && '✓ '} {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2 pt-2 border-t-2 border-gray-200">
                <label className="font-black text-gray-900 uppercase block">Languages Spoken * <span className="text-red-500">🔴</span></label>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map(lang => (
                    <span key={lang.language} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-xs font-black uppercase">
                      {lang.language} ({lang.proficiency})
                      <button 
                        onClick={() => handleUpdate('languages', formData.languages.filter(l => l.language !== lang.language))}
                        className="text-gray-500 hover:text-red-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Portfolio, Links & Questions */}
        {currentStep === 8 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 8 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Portfolio & Verification Links</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">Showcase your public work and credentials.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">LinkedIn Profile <span className="text-yellow-600">🟡</span></label>
                <input 
                  type="url" 
                  value={formData.linkedinUrl}
                  onChange={e => handleUpdate('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">GitHub Profile <span className="text-gray-400">⚪</span></label>
                <input 
                  type="url" 
                  value={formData.githubUrl}
                  onChange={e => handleUpdate('githubUrl', e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Portfolio / Website <span className="text-gray-400">⚪</span></label>
                <input 
                  type="url" 
                  value={formData.portfolioUrl}
                  onChange={e => handleUpdate('portfolioUrl', e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-gray-900 uppercase">Other Relevant Links <span className="text-gray-400">⚪</span></label>
                <input 
                  type="text" 
                  value={formData.otherLinks}
                  onChange={e => handleUpdate('otherLinks', e.target.value)}
                  placeholder="Blog, YouTube channel, Research paper links"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-black text-gray-900 uppercase">Why do you want to become a mentor on Mentozy? * <span className="text-red-500">🔴</span></label>
                <textarea 
                  rows={3}
                  value={formData.qWhyMentozy}
                  onChange={e => handleUpdate('qWhyMentozy', e.target.value)}
                  placeholder="What excites you about Mentozy's mission and interactive live learning model?"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-black text-gray-900 uppercase">What would you do if a student asked you to complete their assignment/project for them? * <span className="text-red-500">🔴</span></label>
                <textarea 
                  rows={2}
                  value={formData.qAcademicIntegrity}
                  onChange={e => handleUpdate('qAcademicIntegrity', e.target.value)}
                  placeholder="How do you guide students to solve their own homework while upholding academic integrity?"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: Pricing & Platform Preferences */}
        {currentStep === 9 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 9 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Pricing & Platform Preferences</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">Set your mentoring fee preferences.</p>
            </div>

            <div className="space-y-5 text-xs">
              <div className="p-4 bg-[#FAF9F6] border-2 border-gray-900 space-y-3">
                <label className="font-black text-gray-900 uppercase block">Are you interested in offering paid mentoring sessions? *</label>
                <div className="flex gap-4">
                  {['Yes', 'No', 'Not sure'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 font-black cursor-pointer">
                      <input 
                        type="radio" 
                        name="paidInterest" 
                        checked={formData.paidMentoringInterest === opt} 
                        onChange={() => handleUpdate('paidMentoringInterest', opt)} 
                      /> {opt}
                    </label>
                  ))}
                </div>
              </div>

              {formData.paidMentoringInterest === 'Yes' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-black text-gray-900 uppercase">Preferred 30-Minute Session Fee (₹)</label>
                    <input 
                      type="number" 
                      value={formData.price30Min}
                      onChange={e => handleUpdate('price30Min', e.target.value)}
                      placeholder="399"
                      className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-black text-gray-900 uppercase">Preferred 60-Minute Session Fee (₹)</label>
                    <input 
                      type="number" 
                      value={formData.price60Min}
                      onChange={e => handleUpdate('price60Min', e.target.value)}
                      placeholder="699"
                      className="w-full bg-[#FAF9F6] border-2 border-gray-900 p-3 font-bold text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="font-black text-gray-900 uppercase block">Would you be open to offering free 15-minute introductory syncs for new learners?</label>
                <div className="flex gap-4">
                  {['Yes', 'No', 'Maybe'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 font-black cursor-pointer">
                      <input 
                        type="radio" 
                        name="freeIntro" 
                        checked={formData.freeIntroSessions === opt} 
                        onChange={() => handleUpdate('freeIntroSessions', opt)} 
                      /> {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 10: Profile Preview & Final Declaration */}
        {currentStep === 10 && (
          <div className="bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in fade-in duration-300">
            <div className="border-b-4 border-gray-900 pb-4">
              <span className="text-[11px] font-black text-gray-500 uppercase">Section 10 of 10</span>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Profile Preview & Declaration</h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">Review what students will see and submit your application.</p>
            </div>

            {/* Profile Preview Card */}
            <div className="p-6 bg-[#FAF9F6] border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {formData.displayName.charAt(0) || formData.fullName.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-gray-900 uppercase">{formData.displayName || formData.fullName || 'Mentor Name'}</h3>
                    <p className="text-xs font-bold text-indigo-700 uppercase">{formData.primaryExpertise} Mentor</p>
                    <p className="text-[10px] text-gray-500 uppercase">{formData.institution || formData.organization || 'Mentozy Educator'}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-[#f39c12] border-2 border-gray-900 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  ★ PENDING APPROVAL
                </span>
              </div>

              {formData.whatCanYouTeach && (
                <p className="text-xs font-bold text-gray-700 italic border-l-2 border-gray-900 pl-3">
                  "{formData.whatCanYouTeach}"
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 pt-2 border-t-2 border-gray-200">
                {formData.secondaryExpertise.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-white border border-gray-900 text-[10px] font-black uppercase">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Declarations & Consents */}
            <div className="space-y-3 pt-2 text-xs font-bold text-gray-800">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.accurateInfoDeclared}
                  onChange={e => handleUpdate('accurateInfoDeclared', e.target.checked)}
                  className="mt-0.5 w-4 h-4"
                />
                <span>I confirm that all information provided in this application is authentic, accurate, and complete. *</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.codeOfConductAgreed}
                  onChange={e => handleUpdate('codeOfConductAgreed', e.target.checked)}
                  className="mt-0.5 w-4 h-4"
                />
                <span>I agree to abide by Mentozy's Mentor Code of Conduct (treating learners respectfully, upholding academic honesty, and maintaining professional safety boundaries). *</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.termsAgreed}
                  onChange={e => handleUpdate('termsAgreed', e.target.checked)}
                  className="mt-0.5 w-4 h-4"
                />
                <span>I agree to Mentozy's Terms of Service and Privacy Policy. *</span>
              </label>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.codeOfConductAgreed || !formData.termsAgreed || !formData.accurateInfoDeclared}
                className="w-full py-4 bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-sm uppercase border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Mentor Application <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Form Control Strip */}
        {currentStep > 0 && currentStep < 10 && (
          <div className="mt-6 flex items-center justify-between gap-3 min-w-0">
            <button 
              onClick={handleBack}
              className="px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-white text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button 
                onClick={() => {
                  localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(formData));
                  toast.success('Draft saved to browser storage');
                }}
                className="hidden sm:flex items-center gap-1 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[44px] bg-white text-gray-700 font-bold text-xs uppercase border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Draft
              </button>

              <button 
                onClick={handleNext}
                className="px-5 sm:px-8 py-2.5 sm:py-3 min-h-[44px] bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-xs uppercase border-2 sm:border-4 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default MentorApplicationPage;
