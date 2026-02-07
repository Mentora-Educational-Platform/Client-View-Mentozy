import { Suspense, lazy, memo, useEffect } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from '../context/AuthContext';
import { HomePage } from './pages/HomePage';
import { Toaster } from 'sonner';
import { NotFoundPage } from './pages/NotFoundPage';

// Lazy load pages
const CareerPage = lazy(() => import('./pages/CareerPage').then(module => ({ default: module.CareerPage })));
const MentorsPage = lazy(() => import('./pages/MentorsPage').then(module => ({ default: module.MentorsPage })));
const TracksPage = lazy(() => import('./pages/TracksPage').then(module => ({ default: module.TracksPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })));
const StudentAuthPage = lazy(() => import('./pages/StudentAuthPage').then(module => ({ default: module.StudentAuthPage })));
const StudentOnboardingPage = lazy(() => import('./pages/StudentOnboardingPage').then(module => ({ default: module.StudentOnboardingPage })));
const MentorOnboardingPage = lazy(() => import('./pages/MentorOnboardingPage').then(module => ({ default: module.MentorOnboardingPage })));
const MentorDashboardPage = lazy(() => import('./pages/MentorDashboardPage').then(module => ({ default: module.MentorDashboardPage })));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage').then(module => ({ default: module.StudentDashboardPage })));
const DashboardMentorsPage = lazy(() => import('./pages/DashboardMentorsPage').then(module => ({ default: module.DashboardMentorsPage })));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage').then(module => ({ default: module.AuthCallbackPage })));


// New Pages
const TeacherTypeSelectionPage = lazy(() => import('./pages/TeacherTypeSelectionPage').then(module => ({ default: module.TeacherTypeSelectionPage })));
const IndividualOnboardingPage = lazy(() => import('./pages/IndividualOnboardingPage').then(module => ({ default: module.IndividualOnboardingPage })));
const OrganisationTeacherOnboardingPage = lazy(() => import('./pages/OrganisationTeacherOnboardingPage').then(module => ({ default: module.OrganisationTeacherOnboardingPage })));
const TeacherSuccessPage = lazy(() => import('./pages/TeacherSuccessPage').then(module => ({ default: module.TeacherSuccessPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const PlansPage = lazy(() => import('./pages/PlansPage').then(module => ({ default: module.PlansPage })));
const CoursesPage = lazy(() => import('./pages/CoursesPage').then(module => ({ default: module.CoursesPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then(module => ({ default: module.CalendarPage })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then(module => ({ default: module.MessagesPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));

export type Page = 'home' | 'careers' | 'mentors' | 'tracks' | 'about' | 'contact' | 'login' | 'signup' | 'student-auth' | 'student-onboarding' | 'student-dashboard';

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
  </div>
);

// Memoized Header & Footer
const MemoizedHeader = memo(Header);
const MemoizedFooter = memo(Footer);

// Mentor Pages
const MentorAnalyticsPage = lazy(() => import('./pages/MentorAnalyticsPage').then(module => ({ default: module.MentorAnalyticsPage })));
const MentorAchievementsPage = lazy(() => import('./pages/MentorAchievementsPage').then(module => ({ default: module.MentorAchievementsPage })));
const MentorProfilePage = lazy(() => import('./pages/MentorProfilePage').then(module => ({ default: module.MentorProfilePage })));
const MentorCalendarPage = lazy(() => import('./pages/MentorCalendarPage').then(module => ({ default: module.MentorCalendarPage })));
const CreateCoursePage = lazy(() => import('./pages/CreateCoursePage').then(module => ({ default: module.CreateCoursePage })));

// Layout Component
const Layout = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <MemoizedHeader />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <MemoizedFooter />
    </div>
  );
};

function App() {
  const location = useLocation();

  // Scroll to top or hash on location change
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <AuthProvider>
      <Toaster position="top-center" richColors /> {/* Added Toaster component */}
      <Routes>
        {/* Public Pages with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/careers" element={<CareerPage />} />
          <Route path="/mentors" element={<MentorsPage />} />

          {/* Auth/Dashboard pages moved to standalone routes below */}
          <Route path="/tracks" element={<TracksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth Pages without Layout (or custom layout manually) */}
        <Route path="/auth/callback" element={
          <Suspense fallback={<PageLoader />}>
            <AuthCallbackPage />
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<PageLoader />}>
            <SignupPage />
          </Suspense>
        } />
        <Route path="/student-auth" element={
          <Suspense fallback={<PageLoader />}>
            <StudentAuthPage />
          </Suspense>
        } />
        <Route path="/student-onboarding" element={
          <Suspense fallback={<PageLoader />}>
            <StudentOnboardingPage />
          </Suspense>
        } />
        <Route path="/student-dashboard" element={
          <Suspense fallback={<PageLoader />}>
            <StudentDashboardPage />
          </Suspense>
        } />
        <Route path="/settings" element={
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        } />
        {/* Missing Mentor Routes Added Back */}
        <Route path="/mentor-auth" element={
          <Suspense fallback={<PageLoader />}>
            <MentorOnboardingPage />
          </Suspense>
        } />
        <Route path="/mentor-dashboard" element={
          <Suspense fallback={<PageLoader />}>
            <MentorDashboardPage />
          </Suspense>
        } />
        <Route path="/mentor-settings" element={
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        } />

        {/* New Teacher / Org Flow Routes */}
        <Route path="/teacher-type" element={
          <Suspense fallback={<PageLoader />}>
            <TeacherTypeSelectionPage />
          </Suspense>
        } />
        <Route path="/individual-onboarding" element={
          <Suspense fallback={<PageLoader />}>
            <IndividualOnboardingPage />
          </Suspense>
        } />
        <Route path="/org-onboarding" element={
          <Suspense fallback={<PageLoader />}>
            <OrganisationTeacherOnboardingPage />
          </Suspense>
        } />
        <Route path="/teacher-success" element={
          <Suspense fallback={<PageLoader />}>
            <TeacherSuccessPage />
          </Suspense>
        } />
        <Route path="/admin" element={
          <Suspense fallback={<PageLoader />}>
            <AdminDashboardPage />
          </Suspense>
        } />
        <Route path="/profile" element={
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        } />
        {/* Mentor Routes */}
        <Route path="/mentor-profile" element={
          <Suspense fallback={<PageLoader />}>
            <MentorProfilePage />
          </Suspense>
        } />
        <Route path="/mentor-analytics" element={
          <Suspense fallback={<PageLoader />}>
            <MentorAnalyticsPage />
          </Suspense>
        } />
        <Route path="/mentor-achievements" element={
          <Suspense fallback={<PageLoader />}>
            <MentorAchievementsPage />
          </Suspense>
        } />
        <Route path="/mentor-calendar" element={
          <Suspense fallback={<PageLoader />}>
            <MentorCalendarPage />
          </Suspense>
        } />
        <Route path="/courses" element={
          <Suspense fallback={<PageLoader />}>
            <CoursesPage />
          </Suspense>
        } />
        <Route path="/calendar" element={
          <Suspense fallback={<PageLoader />}>
            <CalendarPage />
          </Suspense>
        } />
        <Route path="/dashboard-mentors" element={
          <Suspense fallback={<PageLoader />}>
            <DashboardMentorsPage />
          </Suspense>
        } />
        <Route path="/messages" element={
          <Suspense fallback={<PageLoader />}>
            <MessagesPage />
          </Suspense>
        } />
        <Route path="/mentor-messages" element={
          <Suspense fallback={<PageLoader />}>
            <MessagesPage />
          </Suspense>
        } />
        <Route path="/analytics" element={
          <Suspense fallback={<PageLoader />}>
            <AnalyticsPage />
          </Suspense>
        } />
        <Route path="/certifications" element={
          <Suspense fallback={<PageLoader />}>
            <CertificationsPage />
          </Suspense>
        } />
        <Route path="/mentor-create-course" element={
          <Suspense fallback={<PageLoader />}>
            <CreateCoursePage />
          </Suspense>
        } />

        {/* Catch-all Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;