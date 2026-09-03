import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
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
  Edit3, 
  Check, 
  Loader2,
  Award,
  Laptop
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { 
  KrishnaiteCourseApplication, 
  getKrishnaiteApplicationByUserId, 
  saveKrishnaiteDraftApplication, 
  submitKrishnaiteApplication, 
  generateKrishnaiteApplicationId 
} from '../../lib/api';
import { sendAdminNotification, buildKrishnaiteNewApplicationEmail } from '../../lib/adminNotifications';

export function KrishnaiteApplicationPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const topRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appId, setAppId] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');

  // 15-Step Form State
  const [formData, setFormData] = useState<{
    // Step 00: Welcome / Ack
    ack_general_process: boolean;

    // Step 01: Personal
    full_name: string;
    preferred_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    age: string;
    gender: string;
    country: string;
    state: string;
    city: string;
    timezone: string;
    profile_photo_url: string;

    // Step 02: Education
    education_status: string;
    current_grade: string;
    degree: string;
    specialization: string;
    institution: string;
    graduation_year: string;
    previous_education: string;
    academic_achievements: string;
    certifications: string;
    academic_link: string;

    // Step 03: Work / Experience
    no_work_experience: boolean;
    occupation: string;
    company: string;
    years_experience: string;
    industry: string;
    previous_experience: string;
    freelance_experience: string;
    entrepreneurial_experience: string;
    projects_worked_on: string;

    // Step 04: AI Experience
    used_ai_before: string;
    ai_tools_used: string[];
    ai_use_cases: string[];
    ai_experience_description: string;
    ai_wishlist: string;

    // Step 05: Learning Goals
    desired_topics: string[];
    top_3_goals: string;
    worth_it_criteria: string;

    // Step 06: Skills
    skill_ratings: Record<string, 'Beginner' | 'Intermediate' | 'Advanced'>;
    most_confident_skill: string;
    skill_to_improve: string;

    // Step 07: Practical Automation
    repetitive_tasks: string[];
    automate_daily_wish: string;
    manual_task_improvement: string;

    // Step 08: Creative Interests
    desired_creations: string[];
    project_idea: string;
    project_url: string;

    // Step 09: Commitment
    can_attend_live: string;
    hours_per_week: string;
    preferred_style: string[];
    willing_practical_assignments: string;
    commitment_rating: number;
    potential_blockers: string;

    // Step 10: Motivation
    why_join: string;
    life_change_hope: string;
    why_select_you: string;

    // Step 11: Community
    past_communities: string[];
    team_project_experience: string;
    live_question_comfort: number;
    peer_help_comfort: number;
    good_community_vision: string;

    // Step 12: Links
    linkedin_url: string;
    github_url: string;
    website_url: string;
    portfolio_url: string;
    youtube_url: string;
    behance_url: string;
    dribbble_url: string;
    other_link: string;

    // Step 13: Device & Access
    primary_device: string;
    operating_system: string;
    internet_reliability: string;
    browser_access: string;

    // Step 14: Final Declarations
    dec_accurate: boolean;
    dec_no_guarantee: boolean;
    dec_scholarship_terms: boolean;
    dec_aivantage_separate: boolean;
  }>({
    ack_general_process: false,
    full_name: '',
    preferred_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    age: '',
    gender: 'Prefer not to say',
    country: 'India',
    state: '',
    city: '',
    timezone: 'Asia/Kolkata (IST)',
    profile_photo_url: '',

    education_status: 'Undergraduate student',
    current_grade: '',
    degree: '',
    specialization: '',
    institution: '',
    graduation_year: '',
    previous_education: '',
    academic_achievements: '',
    certifications: '',
    academic_link: '',

    no_work_experience: false,
    occupation: '',
    company: '',
    years_experience: '',
    industry: '',
    previous_experience: '',
    freelance_experience: '',
    entrepreneurial_experience: '',
    projects_worked_on: '',

    used_ai_before: 'Occasionally',
    ai_tools_used: ['ChatGPT'],
    ai_use_cases: ['Studying', 'Writing'],
    ai_experience_description: '',
    ai_wishlist: '',

    desired_topics: ['AI productivity', 'AI automation'],
    top_3_goals: '',
    worth_it_criteria: '',

    skill_ratings: {
      Design: 'Beginner',
      Writing: 'Intermediate',
      Coding: 'Beginner',
      'Video editing': 'Beginner',
      Marketing: 'Beginner',
      Communication: 'Intermediate',
      Research: 'Intermediate',
      'Problem solving': 'Intermediate',
      'AI usage': 'Intermediate',
      'Prompt writing': 'Beginner',
      'Social media': 'Beginner',
      Entrepreneurship: 'Beginner'
    },
    most_confident_skill: 'Research',
    skill_to_improve: 'AI automation',

    repetitive_tasks: ['Writing', 'Research'],
    automate_daily_wish: '',
    manual_task_improvement: '',

    desired_creations: ['Personal productivity system'],
    project_idea: '',
    project_url: '',

    can_attend_live: 'Yes',
    hours_per_week: '6–10 hours',
    preferred_style: ['Hands-on tasks', 'Live demonstration'],
    willing_practical_assignments: 'Yes',
    commitment_rating: 5,
    potential_blockers: '',

    why_join: '',
    life_change_hope: '',
    why_select_you: '',

    past_communities: ['Courses'],
    team_project_experience: 'Yes',
    live_question_comfort: 4,
    peer_help_comfort: 5,
    good_community_vision: '',

    linkedin_url: '',
    github_url: '',
    website_url: '',
    portfolio_url: '',
    youtube_url: '',
    behance_url: '',
    dribbble_url: '',
    other_link: '',

    primary_device: 'Laptop',
    operating_system: 'Windows',
    internet_reliability: 'Reliable',
    browser_access: 'Yes',

    dec_accurate: false,
    dec_no_guarantee: false,
    dec_scholarship_terms: false,
    dec_aivantage_separate: false
  });

  // Step definitions
  const steps = [
    { number: 0, title: 'Welcome', icon: Sparkles },
    { number: 1, title: 'Personal Info', icon: ShieldCheck },
    { number: 2, title: 'Education', icon: BookOpen },
    { number: 3, title: 'Experience', icon: Briefcase },
    { number: 4, title: 'AI Experience', icon: Bot },
    { number: 5, title: 'Learning Goals', icon: Target },
    { number: 6, title: 'Current Skills', icon: Sliders },
    { number: 7, title: 'Automation', icon: Zap },
    { number: 8, title: 'Creative Interests', icon: Palette },
    { number: 9, title: 'Commitment', icon: Calendar },
    { number: 10, title: 'Motivation', icon: Heart },
    { number: 11, title: 'Community', icon: Users },
    { number: 12, title: 'Links & Portfolio', icon: LinkIcon },
    { number: 13, title: 'Device & Access', icon: Laptop },
    { number: 14, title: 'Final Declaration', icon: Award }
  ];

  // 1. Initial Load: Restore Draft from DB or LocalStorage
  useEffect(() => {
    async function loadExistingDraft() {
      if (authLoading) return;

      // Prefill user email/name if logged in
      if (user?.email) {
        setFormData(prev => ({
          ...prev,
          email: prev.email || user.email || '',
          full_name: prev.full_name || (user.user_metadata?.full_name as string) || ''
        }));
      }

      try {
        let existingApp: KrishnaiteCourseApplication | null = null;
        if (user?.id) {
          existingApp = await getKrishnaiteApplicationByUserId(user.id);
        }

        if (existingApp) {
          // If already submitted, redirect to application dashboard
          if (existingApp.status !== 'draft') {
            toast.info(`You already have a submitted application (${existingApp.application_id}).`);
            navigate('/krishnaite/application');
            return;
          }

          setAppId(existingApp.application_id);
          setRecordId(existingApp.id);
          setCurrentStep(existingApp.current_step || 0);

          // Merge loaded data
          setFormData(prev => ({
            ...prev,
            full_name: existingApp?.full_name || prev.full_name,
            preferred_name: existingApp?.preferred_name || prev.preferred_name,
            email: existingApp?.email || prev.email,
            phone: existingApp?.phone || prev.phone,
            date_of_birth: existingApp?.date_of_birth || prev.date_of_birth,
            age: existingApp?.age || prev.age,
            gender: existingApp?.gender || prev.gender,
            country: existingApp?.country || prev.country,
            state: existingApp?.state || prev.state,
            city: existingApp?.city || prev.city,
            timezone: existingApp?.timezone || prev.timezone,
            profile_photo_url: existingApp?.profile_photo_url || prev.profile_photo_url,

            education_status: existingApp?.education_data?.education_status || prev.education_status,
            current_grade: existingApp?.education_data?.current_grade || prev.current_grade,
            degree: existingApp?.education_data?.degree || prev.degree,
            specialization: existingApp?.education_data?.specialization || prev.specialization,
            institution: existingApp?.education_data?.institution || prev.institution,
            graduation_year: existingApp?.education_data?.graduation_year || prev.graduation_year,
            previous_education: existingApp?.education_data?.previous_education || prev.previous_education,
            academic_achievements: existingApp?.education_data?.academic_achievements || prev.academic_achievements,
            certifications: existingApp?.education_data?.certifications || prev.certifications,
            academic_link: existingApp?.education_data?.academic_link || prev.academic_link,

            no_work_experience: existingApp?.professional_data?.no_work_experience ?? prev.no_work_experience,
            occupation: existingApp?.professional_data?.occupation || prev.occupation,
            company: existingApp?.professional_data?.company || prev.company,
            years_experience: existingApp?.professional_data?.years_experience || prev.years_experience,
            industry: existingApp?.professional_data?.industry || prev.industry,
            previous_experience: existingApp?.professional_data?.previous_experience || prev.previous_experience,
            freelance_experience: existingApp?.professional_data?.freelance_experience || prev.freelance_experience,
            entrepreneurial_experience: existingApp?.professional_data?.entrepreneurial_experience || prev.entrepreneurial_experience,
            projects_worked_on: existingApp?.professional_data?.projects_worked_on || prev.projects_worked_on,

            used_ai_before: existingApp?.ai_experience?.used_ai_before || prev.used_ai_before,
            ai_tools_used: existingApp?.ai_experience?.ai_tools_used || prev.ai_tools_used,
            ai_use_cases: existingApp?.ai_experience?.ai_use_cases || prev.ai_use_cases,
            ai_experience_description: existingApp?.ai_experience?.ai_experience_description || prev.ai_experience_description,
            ai_wishlist: existingApp?.ai_experience?.ai_wishlist || prev.ai_wishlist,

            desired_topics: existingApp?.learning_goals?.desired_topics || prev.desired_topics,
            top_3_goals: existingApp?.learning_goals?.top_3_goals || prev.top_3_goals,
            worth_it_criteria: existingApp?.learning_goals?.worth_it_criteria || prev.worth_it_criteria,

            skill_ratings: existingApp?.skills?.skill_ratings || prev.skill_ratings,
            most_confident_skill: existingApp?.skills?.most_confident_skill || prev.most_confident_skill,
            skill_to_improve: existingApp?.skills?.skill_to_improve || prev.skill_to_improve,

            repetitive_tasks: existingApp?.automation_interests?.repetitive_tasks || prev.repetitive_tasks,
            automate_daily_wish: existingApp?.automation_interests?.automate_daily_wish || prev.automate_daily_wish,
            manual_task_improvement: existingApp?.automation_interests?.manual_task_improvement || prev.manual_task_improvement,

            desired_creations: existingApp?.creative_interests?.desired_creations || prev.desired_creations,
            project_idea: existingApp?.creative_interests?.project_idea || prev.project_idea,
            project_url: existingApp?.creative_interests?.project_url || prev.project_url,

            can_attend_live: existingApp?.learning_commitment?.can_attend_live || prev.can_attend_live,
            hours_per_week: existingApp?.learning_commitment?.hours_per_week || prev.hours_per_week,
            preferred_style: existingApp?.learning_commitment?.preferred_style || prev.preferred_style,
            willing_practical_assignments: existingApp?.learning_commitment?.willing_practical_assignments || prev.willing_practical_assignments,
            commitment_rating: existingApp?.learning_commitment?.commitment_rating || prev.commitment_rating,
            potential_blockers: existingApp?.learning_commitment?.potential_blockers || prev.potential_blockers,

            why_join: existingApp?.motivation_data?.why_join || prev.why_join,
            life_change_hope: existingApp?.motivation_data?.life_change_hope || prev.life_change_hope,
            why_select_you: existingApp?.motivation_data?.why_select_you || prev.why_select_you,

            past_communities: existingApp?.community_data?.past_communities || prev.past_communities,
            team_project_experience: existingApp?.community_data?.team_project_experience || prev.team_project_experience,
            live_question_comfort: existingApp?.community_data?.live_question_comfort || prev.live_question_comfort,
            peer_help_comfort: existingApp?.community_data?.peer_help_comfort || prev.peer_help_comfort,
            good_community_vision: existingApp?.community_data?.good_community_vision || prev.good_community_vision,

            linkedin_url: existingApp?.portfolio_data?.linkedin_url || prev.linkedin_url,
            github_url: existingApp?.portfolio_data?.github_url || prev.github_url,
            website_url: existingApp?.portfolio_data?.website_url || prev.website_url,
            portfolio_url: existingApp?.portfolio_data?.portfolio_url || prev.portfolio_url,
            youtube_url: existingApp?.portfolio_data?.youtube_url || prev.youtube_url,
            behance_url: existingApp?.portfolio_data?.behance_url || prev.behance_url,
            dribbble_url: existingApp?.portfolio_data?.dribbble_url || prev.dribbble_url,
            other_link: existingApp?.portfolio_data?.other_link || prev.other_link,

            primary_device: existingApp?.device_data?.primary_device || prev.primary_device,
            operating_system: existingApp?.device_data?.operating_system || prev.operating_system,
            internet_reliability: existingApp?.device_data?.internet_reliability || prev.internet_reliability,
            browser_access: existingApp?.device_data?.browser_access || prev.browser_access
          }));
        } else {
          setAppId(generateKrishnaiteApplicationId());
        }
      } catch (err) {
        console.warn('[Krishnaite App] Draft load error:', err);
      }
    }

    loadExistingDraft();
  }, [user, authLoading, navigate]);

  // Construct JSON payloads from flat form state
  const buildPayloads = (targetStep = currentStep) => {
    return {
      application_id: appId || generateKrishnaiteApplicationId(),
      id: recordId || undefined,
      user_id: user?.id,
      full_name: formData.full_name.trim(),
      preferred_name: formData.preferred_name.trim() || undefined,
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      age: formData.age || undefined,
      gender: formData.gender,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      timezone: formData.timezone,
      profile_photo_url: formData.profile_photo_url || undefined,

      education_data: {
        education_status: formData.education_status,
        current_grade: formData.current_grade,
        degree: formData.degree,
        specialization: formData.specialization,
        institution: formData.institution,
        graduation_year: formData.graduation_year,
        previous_education: formData.previous_education,
        academic_achievements: formData.academic_achievements,
        certifications: formData.certifications,
        academic_link: formData.academic_link
      },

      professional_data: {
        no_work_experience: formData.no_work_experience,
        occupation: formData.occupation,
        company: formData.company,
        years_experience: formData.years_experience,
        industry: formData.industry,
        previous_experience: formData.previous_experience,
        freelance_experience: formData.freelance_experience,
        entrepreneurial_experience: formData.entrepreneurial_experience,
        projects_worked_on: formData.projects_worked_on
      },

      ai_experience: {
        used_ai_before: formData.used_ai_before,
        ai_tools_used: formData.ai_tools_used,
        ai_use_cases: formData.ai_use_cases,
        ai_experience_description: formData.ai_experience_description,
        ai_wishlist: formData.ai_wishlist
      },

      learning_goals: {
        desired_topics: formData.desired_topics,
        top_3_goals: formData.top_3_goals,
        worth_it_criteria: formData.worth_it_criteria
      },

      skills: {
        skill_ratings: formData.skill_ratings,
        most_confident_skill: formData.most_confident_skill,
        skill_to_improve: formData.skill_to_improve
      },

      automation_interests: {
        repetitive_tasks: formData.repetitive_tasks,
        automate_daily_wish: formData.automate_daily_wish,
        manual_task_improvement: formData.manual_task_improvement
      },

      creative_interests: {
        desired_creations: formData.desired_creations,
        project_idea: formData.project_idea,
        project_url: formData.project_url
      },

      learning_commitment: {
        can_attend_live: formData.can_attend_live,
        hours_per_week: formData.hours_per_week,
        preferred_style: formData.preferred_style,
        willing_practical_assignments: formData.willing_practical_assignments,
        commitment_rating: formData.commitment_rating,
        potential_blockers: formData.potential_blockers
      },

      motivation_data: {
        why_join: formData.why_join,
        life_change_hope: formData.life_change_hope,
        why_select_you: formData.why_select_you
      },

      community_data: {
        past_communities: formData.past_communities,
        team_project_experience: formData.team_project_experience,
        live_question_comfort: formData.live_question_comfort,
        peer_help_comfort: formData.peer_help_comfort,
        good_community_vision: formData.good_community_vision
      },

      portfolio_data: {
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        website_url: formData.website_url,
        portfolio_url: formData.portfolio_url,
        youtube_url: formData.youtube_url,
        behance_url: formData.behance_url,
        dribbble_url: formData.dribbble_url,
        other_link: formData.other_link
      },

      device_data: {
        primary_device: formData.primary_device,
        operating_system: formData.operating_system,
        internet_reliability: formData.internet_reliability,
        browser_access: formData.browser_access
      },

      acknowledgements: {
        ack_general_process: formData.ack_general_process,
        dec_accurate: formData.dec_accurate,
        dec_no_guarantee: formData.dec_no_guarantee,
        dec_scholarship_terms: formData.dec_scholarship_terms,
        dec_aivantage_separate: formData.dec_aivantage_separate
      },

      source: 'general_application' as const,
      scholarship_type: 'standard_50' as const,
      scholarship_percentage: 50,
      course_value: 10000,
      discount_amount: 5000,
      payable_amount: 5000,
      current_step: targetStep
    };
  };

  // 2. Draft Save Helper
  const handleSaveDraft = async (silent = false) => {
    setIsSaving(true);
    try {
      const payload = buildPayloads(currentStep);
      const saved = await saveKrishnaiteDraftApplication(payload, user?.id);
      if (saved?.id) setRecordId(saved.id);
      if (saved?.application_id) setAppId(saved.application_id);
      if (!silent) toast.success('Application draft saved successfully.');
    } catch (err) {
      console.warn('[Krishnaite App] Save error:', err);
      if (!silent) toast.error('Could not save draft to cloud. Saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Step Validation
  const validateCurrentStep = (): boolean => {
    if (currentStep === 0) {
      if (!formData.ack_general_process) {
        toast.error('Please acknowledge that this application is for the general admission process.');
        return false;
      }
    } else if (currentStep === 1) {
      if (!formData.full_name.trim()) {
        toast.error('Please enter your full name.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        toast.error('Please enter a valid email address.');
        return false;
      }
      if (!formData.phone.trim()) {
        toast.error('Please enter your phone number.');
        return false;
      }
      if (formData.age && (parseInt(formData.age, 10) < 10 || parseInt(formData.age, 10) > 100)) {
        toast.error('Please enter a realistic age value.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.education_status) {
        toast.error('Please select your current education status.');
        return false;
      }
      if (!formData.institution.trim()) {
        toast.error('Please enter your school, college, or university.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.used_ai_before) {
        toast.error('Please select your AI familiarity level.');
        return false;
      }
      if (formData.ai_tools_used.length === 0) {
        toast.error('Please select at least one AI tool (or Other/None).');
        return false;
      }
    } else if (currentStep === 5) {
      if (formData.desired_topics.length === 0) {
        toast.error('Please select at least one topic you wish to learn.');
        return false;
      }
      if (!formData.top_3_goals.trim()) {
        toast.error('Please share your top goals for this 18-day program.');
        return false;
      }
    } else if (currentStep === 9) {
      if (!formData.can_attend_live) {
        toast.error('Please indicate if you can attend live sessions.');
        return false;
      }
    } else if (currentStep === 10) {
      if (!formData.why_join.trim()) {
        toast.error('Please tell us why you want to join this course.');
        return false;
      }
    } else if (currentStep === 14) {
      if (!formData.dec_accurate || !formData.dec_no_guarantee || !formData.dec_scholarship_terms || !formData.dec_aivantage_separate) {
        toast.error('Please check all declaration checkboxes before submitting.');
        return false;
      }
    }
    return true;
  };

  // 4. Navigation
  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    const next = currentStep + 1;
    setCurrentStep(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Autosave draft in background
    handleSaveDraft(true);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 5. Final Submission
  const handleSubmitApplication = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const payload = buildPayloads(14);
      const submitted = await submitKrishnaiteApplication(payload, user?.id);

      // Trigger Resend email notification to admissions
      sendAdminNotification({
        to: 'founder@mentozy.app',
        subject: `✨ New Krishnaite Course Application: ${submitted.full_name} (${submitted.application_id})`,
        html: buildKrishnaiteNewApplicationEmail({
          fullName: submitted.full_name,
          email: submitted.email,
          applicationId: submitted.application_id,
          submittedAt: new Date().toISOString(),
          scholarshipPercentage: 50
        })
      }).catch(err => console.warn('[Notifications] Krishnaite email dispatch skipped:', err));

      toast.success('Application submitted successfully!');
      navigate('/krishnaite/application');
    } catch (err: any) {
      console.error('[Krishnaite App] Submission error:', err);
      toast.error('Submission failed. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const percentComplete = Math.round(((currentStep) / (steps.length - 1)) * 100);

  return (
    <div ref={topRef} className="bg-[#FAF9F6] text-gray-900 font-mono min-h-screen pt-28 pb-20 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Breadcrumb & Back to Academy */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/academy"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-gray-900 text-xs font-bold uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-all min-h-[38px]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Course Overview
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 uppercase hidden sm:inline">
              ID: {appId || 'NEW-APPLICATION'}
            </span>
            <button
              onClick={() => handleSaveDraft(false)}
              disabled={isSaving || isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[38px]"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> : <Save className="w-3.5 h-3.5 text-amber-600" />}
              Save Draft
            </button>
          </div>
        </div>

        {/* Progress Card (Mobile Optimized & Compact) */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 p-4 sm:p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black uppercase">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-gray-900">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-gray-900 truncate font-black">{steps[currentStep].title}</span>
            </div>
            <span className="text-gray-600">{percentComplete}% Completed</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 border-2 border-gray-900 h-3 overflow-hidden">
            <div 
              className="bg-[#f39c12] h-full transition-all duration-300 border-r-2 border-gray-900"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Step Content Container */}
        <div className="bg-white border-2 sm:border-4 border-gray-900 p-5 sm:p-10 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-8">
          
          {/* =========================================================================
              STEP 00 — WELCOME & SCHOLARSHIP ACKNOWLEDGEMENT
             ========================================================================= */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-4 h-4 text-amber-700" />
                KRISHNAITE ADMISSIONS
              </div>

              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 leading-tight">
                WELCOME TO THE KRISHNAITE 18-DAY AI COURSE APPLICATION
              </h1>

              <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed">
                This application helps us understand who you are, what you want to learn, and whether the 18-day practical AI experience is a good fit for you.
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 p-3 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Clock className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>Estimated completion time: <strong>10–15 minutes</strong> • Drafts save automatically.</span>
              </div>

              {/* Scholarship Details Banner */}
              <div className="p-5 bg-[#eff3ff] border-2 sm:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
                <h3 className="text-sm sm:text-base font-black uppercase text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-700" />
                  Your Applicant Scholarship Breakdown
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white border-2 border-gray-900">
                    <p className="text-[10px] font-black uppercase text-gray-500">Actual Course Value</p>
                    <p className="text-lg font-black text-gray-900">₹10,000</p>
                  </div>
                  <div className="p-3 bg-white border-2 border-gray-900">
                    <p className="text-[10px] font-black uppercase text-gray-500">Standard Scholarship</p>
                    <p className="text-lg font-black text-indigo-700">50% SCHOLARSHIP</p>
                  </div>
                  <div className="p-3 bg-white border-2 border-gray-900">
                    <p className="text-[10px] font-black uppercase text-gray-500">Your Applicant Price</p>
                    <p className="text-lg font-black text-emerald-700">₹5,000</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-900/40 text-xs font-bold text-amber-950 space-y-1">
                  <p className="font-black flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    AIvantage Quiz Winners Note:
                  </p>
                  <p className="leading-relaxed">
                    The first 40 winners of the AIvantage Quiz receive a 100% scholarship (₹0) and are invited directly by Krishnaite. AIvantage status is assigned directly by admissions and cannot be claimed through this general form.
                  </p>
                </div>
              </div>

              {/* Required Acknowledgement Checkbox */}
              <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.ack_general_process}
                  onChange={e => setFormData(prev => ({ ...prev, ack_general_process: e.target.checked }))}
                  className="w-5 h-5 mt-0.5 border-2 border-gray-900 rounded-none accent-indigo-600 shrink-0 cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                  I understand that this application is for the general Krishnaite course admission process with a 50% scholarship (₹10,000 → ₹5,000), and that AIvantage Quiz winners are invited separately. *
                </span>
              </label>
            </div>
          )}

          {/* =========================================================================
              STEP 01 — PERSONAL INFORMATION
             ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 01 — PERSONAL INFORMATION
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  Please provide your contact details so we can reach you with admission decisions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="e.g. Alex Morgan"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Preferred Name / Call Name</label>
                  <input
                    type="text"
                    value={formData.preferred_name}
                    onChange={e => setFormData(prev => ({ ...prev, preferred_name: e.target.value }))}
                    placeholder="e.g. Alex"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. alex@example.com"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={e => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Age</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={formData.age}
                    onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="e.g. 21"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">State / Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g. Maharashtra, Karnataka"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Mumbai, Bengaluru"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-black uppercase text-gray-900">Timezone</label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={e => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 02 — EDUCATIONAL BACKGROUND
             ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 02 — TELL US ABOUT YOUR EDUCATION
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  Whether you are in school, college, or self-taught, tell us what you study or have studied.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-black uppercase text-gray-900">Current Education Status *</label>
                  <select
                    value={formData.education_status}
                    onChange={e => setFormData(prev => ({ ...prev, education_status: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="School student">School student (Class 9-12)</option>
                    <option value="Undergraduate student">Undergraduate student (B.Tech, B.Sc, B.Com, BBA, etc.)</option>
                    <option value="Postgraduate student">Postgraduate student (M.Tech, MBA, M.Sc, etc.)</option>
                    <option value="Diploma / vocational">Diploma / vocational</option>
                    <option value="Graduate">Recent Graduate</option>
                    <option value="Working professional">Working professional</option>
                    <option value="Self-learning">Self-learning / Independent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Institution / School / College *</label>
                  <input
                    type="text"
                    required
                    value={formData.institution}
                    onChange={e => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="e.g. Delhi University / MIT"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Course / Degree / Stream</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={e => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Current Grade / Year / Semester</label>
                  <input
                    type="text"
                    value={formData.current_grade}
                    onChange={e => setFormData(prev => ({ ...prev, current_grade: e.target.value }))}
                    placeholder="e.g. 3rd Year / 6th Semester"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Expected Graduation Year</label>
                  <input
                    type="text"
                    value={formData.graduation_year}
                    onChange={e => setFormData(prev => ({ ...prev, graduation_year: e.target.value }))}
                    placeholder="e.g. 2027"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-black uppercase text-gray-900">Academic Achievements (Optional)</label>
                  <textarea
                    rows={2}
                    value={formData.academic_achievements}
                    onChange={e => setFormData(prev => ({ ...prev, academic_achievements: e.target.value }))}
                    placeholder="Rankings, scholarships, competitions, Olympiads, etc."
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 03 — CURRENT WORK & EXPERIENCE
             ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 03 — WHAT DO YOU CURRENTLY DO?
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  Tell us about your work, freelance projects, or internships. Beginners are warmly welcomed!
                </p>
              </div>

              {/* No Experience Checkbox */}
              <label className="flex items-center gap-2.5 p-3 bg-gray-50 border-2 border-gray-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.no_work_experience}
                  onChange={e => setFormData(prev => ({ ...prev, no_work_experience: e.target.checked }))}
                  className="w-4 h-4 border-2 border-gray-900 rounded-none accent-indigo-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-900">
                  I don't have professional work experience yet (I am a student / beginner).
                </span>
              </label>

              {!formData.no_work_experience && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-900">Current Occupation / Role</label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                      placeholder="e.g. Frontend Developer, Content Creator, Intern"
                      className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-900">Company / Organization</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="e.g. Freelance / Tech Corp"
                      className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-900">Years of Experience</label>
                    <input
                      type="text"
                      value={formData.years_experience}
                      onChange={e => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                      placeholder="e.g. Less than 1 year, 2 years"
                      className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-900">Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g. Tech, Media, Education, Design"
                      className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">
                  Projects or Personal Experiments you've worked on (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.projects_worked_on}
                  onChange={e => setFormData(prev => ({ ...prev, projects_worked_on: e.target.value }))}
                  placeholder="Describe a project, class assignment, YouTube channel, website, or side hustle you built."
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 04 — YOUR AI EXPERIENCE
             ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 04 — WHAT IS YOUR EXPERIENCE WITH AI?
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  Be honest! Complete beginners to power users are all welcome.
                </p>
              </div>

              {/* Familiarity */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-900">Have you used AI before? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['Never', 'Occasionally', 'Regularly', 'Advanced user'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, used_ai_before: lvl }))}
                      className={`p-3 text-xs font-black uppercase border-2 border-gray-900 text-center transition-all ${
                        formData.used_ai_before === lvl 
                          ? 'bg-[#f39c12] text-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]' 
                          : 'bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools Used */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-900">Which AI tools have you used? (Select all that apply) *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Cursor', 'GitHub Copilot', 'Midjourney', 'Canva AI', 'v0 / Bolt', 'None / Other'].map(tool => {
                    const selected = formData.ai_tools_used.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            ai_tools_used: selected 
                              ? prev.ai_tools_used.filter(t => t !== tool)
                              : [...prev.ai_tools_used, tool]
                          }));
                        }}
                        className={`p-2.5 text-xs font-bold border-2 border-gray-900 text-left flex items-center justify-between transition-all ${
                          selected ? 'bg-indigo-100 text-indigo-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700'
                        }`}
                      >
                        <span>{tool}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-indigo-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Use Cases */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-900">What do you currently use AI for?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Studying', 'Research', 'Writing', 'Coding', 'Design', 'Image generation', 'Video', 'Productivity', 'Business', 'Automation', 'Content creation', 'Nothing yet'].map(useCase => {
                    const selected = formData.ai_use_cases.includes(useCase);
                    return (
                      <button
                        key={useCase}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            ai_use_cases: selected 
                              ? prev.ai_use_cases.filter(u => u !== useCase)
                              : [...prev.ai_use_cases, useCase]
                          }));
                        }}
                        className={`p-2.5 text-xs font-bold border-2 border-gray-900 text-left flex items-center justify-between transition-all ${
                          selected ? 'bg-emerald-100 text-emerald-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700'
                        }`}
                      >
                        <span>{useCase}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">What is one thing you wish AI could help you do?</label>
                <input
                  type="text"
                  value={formData.ai_wishlist}
                  onChange={e => setFormData(prev => ({ ...prev, ai_wishlist: e.target.value }))}
                  placeholder="e.g. Build websites in minutes, automate research summaries, generate ad creatives"
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 05 — WHAT DO YOU WANT TO LEARN?
             ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 05 — WHAT DO YOU WANT TO GET FROM THESE 18 DAYS?
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  Select the capabilities you want to build and share your target outcomes.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'AI productivity',
                  'AI automation',
                  'AI image generation',
                  'AI design',
                  'AI documents',
                  'Resume creation',
                  'Website creation',
                  'UI design',
                  'AI advertising',
                  'Video creation',
                  'Content creation',
                  'YouTube',
                  'Freelancing',
                  'Career development',
                  'Business',
                  'Personal productivity'
                ].map(topic => {
                  const selected = formData.desired_topics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          desired_topics: selected
                            ? prev.desired_topics.filter(t => t !== topic)
                            : [...prev.desired_topics, topic]
                        }));
                      }}
                      className={`p-3 text-xs font-bold border-2 border-gray-900 text-left flex items-center justify-between transition-all ${
                        selected ? 'bg-[#f39c12] text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{topic}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-gray-900" />}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">What are your top 3 goals for this program? *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.top_3_goals}
                  onChange={e => setFormData(prev => ({ ...prev, top_3_goals: e.target.value }))}
                  placeholder="1. Build an AI-powered website&#10;2. Automate daily study notes & research&#10;3. Create high quality content/designs for freelance"
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">
                  What would make you say, "These 18 days were worth it"?
                </label>
                <textarea
                  rows={2}
                  value={formData.worth_it_criteria}
                  onChange={e => setFormData(prev => ({ ...prev, worth_it_criteria: e.target.value }))}
                  placeholder="e.g. Having 5 real AI tools integrated into my daily routine and publishing a working project."
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 06 — YOUR CURRENT SKILLS
             ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 06 — WHAT CAN YOU ALREADY DO?
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  Rate your current comfort level across each area (Beginner / Intermediate / Advanced).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(formData.skill_ratings).map(skillName => {
                  const rating = formData.skill_ratings[skillName];
                  return (
                    <div key={skillName} className="p-3 bg-gray-50 border-2 border-gray-900 flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase text-gray-900">{skillName}</span>
                      <div className="flex items-center gap-1">
                        {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                skill_ratings: { ...prev.skill_ratings, [skillName]: lvl }
                              }));
                            }}
                            className={`px-2 py-1 text-[10px] font-bold border border-gray-900 uppercase transition-all ${
                              rating === lvl ? 'bg-indigo-600 text-white font-black' : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Which skill are you most confident about?</label>
                  <input
                    type="text"
                    value={formData.most_confident_skill}
                    onChange={e => setFormData(prev => ({ ...prev, most_confident_skill: e.target.value }))}
                    placeholder="e.g. Writing, Research, Coding"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Which skill would you most like to improve?</label>
                  <input
                    type="text"
                    value={formData.skill_to_improve}
                    onChange={e => setFormData(prev => ({ ...prev, skill_to_improve: e.target.value }))}
                    placeholder="e.g. AI Prompting, Web Building"
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 07 — PRACTICAL AI & AUTOMATION
             ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 07 — HOW DO YOU WORK TODAY?
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  Tell us about repetitive tasks that eat up your time so we can tailor automation demos.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-900">What repetitive tasks take up your time?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Writing', 'Research', 'Data entry', 'Email', 'Content creation', 'Design', 'Reports', 'Study notes', 'Social media', 'Scheduling', 'Other'].map(task => {
                    const selected = formData.repetitive_tasks.includes(task);
                    return (
                      <button
                        key={task}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            repetitive_tasks: selected
                              ? prev.repetitive_tasks.filter(t => t !== task)
                              : [...prev.repetitive_tasks, task]
                          }));
                        }}
                        className={`p-2.5 text-xs font-bold border-2 border-gray-900 text-left flex items-center justify-between ${
                          selected ? 'bg-amber-100 text-amber-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700'
                        }`}
                      >
                        <span>{task}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-amber-900" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">If you could automate one part of your daily life, what would it be?</label>
                <input
                  type="text"
                  value={formData.automate_daily_wish}
                  onChange={e => setFormData(prev => ({ ...prev, automate_daily_wish: e.target.value }))}
                  placeholder="e.g. Converting lecture notes into flashcards, drafting email replies"
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">
                  Describe one task you currently do manually that you think AI could improve:
                </label>
                <textarea
                  rows={2}
                  value={formData.manual_task_improvement}
                  onChange={e => setFormData(prev => ({ ...prev, manual_task_improvement: e.target.value }))}
                  placeholder="Explain the step-by-step pain point..."
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 08 — CREATIVE / PROJECT INTERESTS
             ========================================================================= */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 08 — WHAT WOULD YOU LIKE TO CREATE?
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  If you had unlimited access to practical AI tools for 18 days, what would you want to build?
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Website',
                  'YouTube channel',
                  'Advertisement',
                  'Brand',
                  'Portfolio',
                  'App',
                  'Social media content',
                  'Educational content',
                  'Business idea',
                  'Personal productivity system',
                  'Other'
                ].map(creation => {
                  const selected = formData.desired_creations.includes(creation);
                  return (
                    <button
                      key={creation}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          desired_creations: selected
                            ? prev.desired_creations.filter(c => c !== creation)
                            : [...prev.desired_creations, creation]
                        }));
                      }}
                      className={`p-3 text-xs font-bold border-2 border-gray-900 text-left flex items-center justify-between ${
                        selected ? 'bg-indigo-100 text-indigo-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{creation}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-indigo-900" />}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">Do you already have a specific project idea in mind? Describe it (Optional):</label>
                <textarea
                  rows={3}
                  value={formData.project_idea}
                  onChange={e => setFormData(prev => ({ ...prev, project_idea: e.target.value }))}
                  placeholder="e.g. A portfolio website showcasing my UI design work with an AI-powered inquiry chatbot."
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 09 — LEARNING STYLE & COMMITMENT
             ========================================================================= */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 09 — HOW WILL YOU PARTICIPATE?
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  The course is hands-on. Let us know how you prefer to learn and your availability.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Can you attend live sessions? *</label>
                  <select
                    value={formData.can_attend_live}
                    onChange={e => setFormData(prev => ({ ...prev, can_attend_live: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="Yes">Yes, absolutely</option>
                    <option value="No">No, will rely on recordings</option>
                    <option value="Depends on schedule">Depends on specific schedule</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Hours per week you can dedicate:</label>
                  <select
                    value={formData.hours_per_week}
                    onChange={e => setFormData(prev => ({ ...prev, hours_per_week: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="3–5 hours">3–5 hours / week</option>
                    <option value="6–10 hours">6–10 hours / week</option>
                    <option value="10–15 hours">10–15 hours / week</option>
                    <option value="15+ hours">15+ hours / week</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-900">Willing to complete practical tasks and submissions? *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Yes', 'No'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, willing_practical_assignments: opt }))}
                      className={`p-3 text-xs font-black uppercase border-2 border-gray-900 text-center ${
                        formData.willing_practical_assignments === opt ? 'bg-emerald-100 text-emerald-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-900">
                  How committed are you to completing the full 18-day experience? (1–5) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, commitment_rating: val }))}
                      className={`flex-1 py-3 text-sm font-black border-2 border-gray-900 text-center ${
                        formData.commitment_rating === val ? 'bg-[#f39c12] text-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">What might prevent you from completing the program? (Optional):</label>
                <input
                  type="text"
                  value={formData.potential_blockers}
                  onChange={e => setFormData(prev => ({ ...prev, potential_blockers: e.target.value }))}
                  placeholder="e.g. College exams during second week"
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 10 — YOUR PERSONAL MOTIVATION
             ========================================================================= */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 10 — TELL US WHY YOU
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  We care about genuine motivations over exaggerated credentials. Be yourself!
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">Why do you want to join the Krishnaite 18-Day AI Course? *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.why_join}
                  onChange={e => setFormData(prev => ({ ...prev, why_join: e.target.value }))}
                  placeholder="Tell us what drew you to this practical AI cohort..."
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">What are you hoping AI will change or improve in your life?</label>
                <textarea
                  rows={3}
                  value={formData.life_change_hope}
                  onChange={e => setFormData(prev => ({ ...prev, life_change_hope: e.target.value }))}
                  placeholder="Career growth, academic speed, creative confidence, starting a business..."
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">Why should Krishnaite select you for this program?</label>
                <textarea
                  rows={3}
                  value={formData.why_select_you}
                  onChange={e => setFormData(prev => ({ ...prev, why_select_you: e.target.value }))}
                  placeholder="What will you bring to the cohort community?"
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 11 — COMMUNITY & COLLABORATION
             ========================================================================= */}
          {currentStep === 11 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 11 — LEARNING TOGETHER
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  Mentozy & Krishnaite prioritize peer collaboration and collective progress.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-900">Have you previously participated in:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Hackathons', 'Communities', 'Clubs', 'Courses', 'Workshops', 'Open-source', 'Competitions', 'None'].map(item => {
                    const selected = formData.past_communities.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            past_communities: selected
                              ? prev.past_communities.filter(c => c !== item)
                              : [...prev.past_communities, item]
                          }));
                        }}
                        className={`p-2.5 text-xs font-bold border-2 border-gray-900 text-left flex items-center justify-between ${
                          selected ? 'bg-indigo-100 text-indigo-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700'
                        }`}
                      >
                        <span>{item}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-indigo-900" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-900">Comfort asking questions live (1–5):</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, live_question_comfort: v }))}
                        className={`flex-1 py-2 text-xs font-bold border-2 border-gray-900 ${
                          formData.live_question_comfort === v ? 'bg-[#f39c12] text-gray-900 font-black' : 'bg-white text-gray-700'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-900">Comfort helping peer participants (1–5):</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, peer_help_comfort: v }))}
                        className={`flex-1 py-2 text-xs font-bold border-2 border-gray-900 ${
                          formData.peer_help_comfort === v ? 'bg-[#f39c12] text-gray-900 font-black' : 'bg-white text-gray-700'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-900">What does a good learning community look like to you?</label>
                <textarea
                  rows={2}
                  value={formData.good_community_vision}
                  onChange={e => setFormData(prev => ({ ...prev, good_community_vision: e.target.value }))}
                  placeholder="e.g. A respectful environment where beginners feel safe asking basic questions and everyone shares cool discoveries."
                  className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 12 — LINKS & OPTIONAL PORTFOLIO
             ========================================================================= */}
          {currentStep === 12 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 12 — SHOW US YOUR WORK (ALL OPTIONAL)
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  None of these fields are mandatory. Beginners can apply without having any public profile.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={e => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">GitHub Profile</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={e => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Personal Website / Portfolio</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={e => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">YouTube / Behance / Dribbble</label>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={e => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 13 — DEVICE & ACCESS
             ========================================================================= */}
          {currentStep === 13 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 13 — ARE YOU READY TO PARTICIPATE?
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  You don't need high-end GPUs or expensive hardware. Accessible browser tools are utilized throughout.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Primary Device</label>
                  <select
                    value={formData.primary_device}
                    onChange={e => setFormData(prev => ({ ...prev, primary_device: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop PC</option>
                    <option value="Tablet">Tablet / iPad</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Operating System</label>
                  <select
                    value={formData.operating_system}
                    onChange={e => setFormData(prev => ({ ...prev, operating_system: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="Windows">Windows</option>
                    <option value="macOS">macOS</option>
                    <option value="Linux">Linux</option>
                    <option value="Android">Android</option>
                    <option value="iOS">iOS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Internet Availability</label>
                  <select
                    value={formData.internet_reliability}
                    onChange={e => setFormData(prev => ({ ...prev, internet_reliability: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="Reliable">Reliable broadband / 5G</option>
                    <option value="Sometimes unreliable">Sometimes unreliable</option>
                    <option value="Limited">Limited bandwidth</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-900">Can access a browser during sessions?</label>
                  <select
                    value={formData.browser_access}
                    onChange={e => setFormData(prev => ({ ...prev, browser_access: e.target.value }))}
                    className="w-full p-3 bg-white border-2 border-gray-900 text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 14 — FINAL DECLARATION & COMPREHENSIVE SUMMARY
             ========================================================================= */}
          {currentStep === 14 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  STEP 14 — APPLICATION SUMMARY & FINAL DECLARATION
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  Review your answers below. You can click "Edit" on any section to make updates before submitting.
                </p>
              </div>

              {/* Review Summary Dossier */}
              <div className="space-y-4">
                
                {/* 1. Personal & Scholarship Summary */}
                <div className="p-4 bg-gray-50 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-700" /> Personal Information & Scholarship
                    </span>
                    <button
                      type="button"
                      onClick={() => jumpToStep(1)}
                      className="text-xs font-bold text-indigo-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="text-xs font-bold text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-gray-200">
                    <p><strong>Name:</strong> {formData.full_name || '—'}</p>
                    <p><strong>Email:</strong> {formData.email || '—'}</p>
                    <p><strong>Phone:</strong> {formData.phone || '—'}</p>
                    <p><strong>Location:</strong> {formData.city}, {formData.state}, {formData.country}</p>
                    <p className="sm:col-span-2 text-indigo-900 font-black">
                      <strong>Scholarship:</strong> 50% Standard Scholarship (₹10,000 → ₹5,000)
                    </p>
                  </div>
                </div>

                {/* 2. Education & Experience */}
                <div className="p-4 bg-gray-50 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-700" /> Education & Work
                    </span>
                    <button
                      type="button"
                      onClick={() => jumpToStep(2)}
                      className="text-xs font-bold text-indigo-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="text-xs font-bold text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-gray-200">
                    <p><strong>Education:</strong> {formData.education_status}</p>
                    <p><strong>Institution:</strong> {formData.institution || '—'}</p>
                    <p><strong>Degree / Stream:</strong> {formData.degree || '—'}</p>
                    <p><strong>Work:</strong> {formData.no_work_experience ? 'Student / Beginner' : `${formData.occupation} at ${formData.company || 'Independent'}`}</p>
                  </div>
                </div>

                {/* 3. AI & Goals */}
                <div className="p-4 bg-gray-50 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-indigo-700" /> AI Experience & Target Goals
                    </span>
                    <button
                      type="button"
                      onClick={() => jumpToStep(4)}
                      className="text-xs font-bold text-indigo-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="text-xs font-bold text-gray-700 space-y-1.5 pt-1 border-t border-gray-200">
                    <p><strong>Familiarity:</strong> {formData.used_ai_before} • <strong>Tools:</strong> {formData.ai_tools_used.join(', ')}</p>
                    <p><strong>Selected Topics:</strong> {formData.desired_topics.join(', ')}</p>
                    <p><strong>Top Goals:</strong> {formData.top_3_goals}</p>
                  </div>
                </div>
              </div>

              {/* 4 Final Declarations Checkboxes */}
              <div className="space-y-3 p-4 bg-amber-50 border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                <h4 className="text-xs font-black uppercase text-gray-900 tracking-wider">
                  FINAL DECLARATION & ACKNOWLEDGEMENT
                </h4>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dec_accurate}
                    onChange={e => setFormData(prev => ({ ...prev, dec_accurate: e.target.checked }))}
                    className="w-4 h-4 mt-0.5 border-2 border-gray-900 rounded-none accent-indigo-600 shrink-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-900 leading-snug">
                    The information I provided is accurate to the best of my knowledge. *
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dec_no_guarantee}
                    onChange={e => setFormData(prev => ({ ...prev, dec_no_guarantee: e.target.checked }))}
                    className="w-4 h-4 mt-0.5 border-2 border-gray-900 rounded-none accent-indigo-600 shrink-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-900 leading-snug">
                    I understand that submitting an application does not guarantee program admission. *
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dec_scholarship_terms}
                    onChange={e => setFormData(prev => ({ ...prev, dec_scholarship_terms: e.target.checked }))}
                    className="w-4 h-4 mt-0.5 border-2 border-gray-900 rounded-none accent-indigo-600 shrink-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-900 leading-snug">
                    I understand that the general application provides a 50% scholarship, reducing the ₹10,000 course value to ₹5,000, subject to applicable terms. *
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dec_aivantage_separate}
                    onChange={e => setFormData(prev => ({ ...prev, dec_aivantage_separate: e.target.checked }))}
                    className="w-4 h-4 mt-0.5 border-2 border-gray-900 rounded-none accent-indigo-600 shrink-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-900 leading-snug">
                    I understand that AIvantage Quiz winners are handled through a separate direct-invitation process. *
                  </span>
                </label>
              </div>

            </div>
          )}

          {/* Bottom Action Navigation Bar */}
          <div className="pt-6 border-t-2 sm:border-t-4 border-gray-900 flex flex-wrap items-center justify-between gap-3">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-100 border-2 border-gray-900 font-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#f39c12] hover:bg-[#e67e22] border-2 border-gray-900 font-black text-xs uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[44px]"
              >
                Save & Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-gray-900 border-2 sm:border-4 border-gray-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[48px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> SUBMITTING...
                  </>
                ) : (
                  <>
                    SUBMIT APPLICATION →
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default KrishnaiteApplicationPage;
