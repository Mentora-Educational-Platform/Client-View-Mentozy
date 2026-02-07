const fs = require('fs');
const path = require('path');

const routes = [
    { path: 'plans', component: 'PlansPage' },
    { path: 'careers', component: 'CareerPage' },
    { path: 'mentors', component: 'MentorsPage' },
    { path: 'tracks', component: 'TracksPage' },
    { path: 'about', component: 'AboutPage' },
    { path: 'contact', component: 'ContactPage' },
    { path: 'login', component: 'LoginPage' },
    { path: 'signup', component: 'SignupPage' },
    { path: 'student-auth', component: 'StudentAuthPage' },
    { path: 'student-onboarding', component: 'StudentOnboardingPage' },
    { path: 'student-dashboard', component: 'StudentDashboardPage' },
    { path: 'mentor-auth', component: 'MentorOnboardingPage' },
    { path: 'mentor-dashboard', component: 'MentorDashboardPage' },
    { path: 'teacher-type', component: 'TeacherTypeSelectionPage' },
    { path: 'individual-onboarding', component: 'IndividualOnboardingPage' },
    { path: 'org-onboarding', component: 'OrganisationTeacherOnboardingPage' },
    { path: 'teacher-success', component: 'TeacherSuccessPage' },
    { path: 'admin', component: 'AdminDashboardPage' },
    { path: 'profile', component: 'ProfilePage' },
    { path: 'mentor-profile', component: 'MentorProfilePage' },
    { path: 'mentor-analytics', component: 'MentorAnalyticsPage' },
    { path: 'mentor-achievements', component: 'MentorAchievementsPage' },
    { path: 'mentor-calendar', component: 'MentorCalendarPage' },
    { path: 'courses', component: 'CoursesPage' },
    { path: 'calendar', component: 'CalendarPage' },
    { path: 'messages', component: 'MessagesPage' },
    { path: 'mentor-messages', component: 'MessagesPage' },
    { path: 'analytics', component: 'AnalyticsPage' },
    { path: 'certifications', component: 'CertificationsPage' }
];

const appDir = path.join(__dirname, '../src/app');

routes.forEach(route => {
    const dir = path.join(appDir, route.path);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const content = `import { ${route.component} } from '@/components/pages/${route.component}';

export default function Page() {
  return <${route.component} />;
}
`;

    fs.writeFileSync(path.join(dir, 'page.tsx'), content);
    console.log(`Created ${route.path}/page.tsx`);
});
