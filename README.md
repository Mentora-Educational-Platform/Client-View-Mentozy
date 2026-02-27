# Mentozy 🎓✨

Mentozy is a comprehensive, sophisticated Educational and Mentorship Platform that connects students with industry experts, offering a seamless ecosystem for personalized learning, structured courses, in-depth career guidance, and expert advice. It caters to individual mentors, specialized teachers, and educational organizations to foster a collaborative and effective learning environment.

## 🚀 Key Features 🚀

### For Students
- **Personalized Mentorship**: Find and connect with top-tier mentors across various fields like Computer Science, Startups, Career Guidance, and more via specialized landing hubs.
- **Course Viewer & Learning Tracks**: Dive deep into structured learning tracks, view rich course content, download essential educational resources (PDFs, Docs), and earn verified certifications.
- **Calendar & Session Management**: Book 1-on-1 personalized sessions, track upcoming events, and sync your learning schedule effortlessly on the dashboard.
- **Real-Time Messaging**: Communicate directly with your mentors to clear doubts, receive continuous feedback, and network efficiently.
- **Student Dashboard**: A dedicated, feature-rich portal to track overall progress, bookmarks, interactions, tasks, and detailed learning analytics.

### For Mentors & Organizations
- **Flexible Profile Onboarding**: Dedicated flows to onboard as an individual mentor, a teacher, or an expanding educational organization. 
- **Course Creation Studio**: A powerful, intuitive editor to build and assemble courses, modules, and deep lessons. Seamlessly upload rich documents (PDFs), manage course assets, and publish to thousands of students.
- **Smart Calendar & Availability Management**: Set your available working hours, schedule custom sessions, manage your incoming students seamlessly.
- **Advanced Analytics & Achievements**: Keep track of your growing impact, view your student ratings, revenue streams, and unlock exciting platform achievements based on your mentorship milestones.
- **Accessible Pricing Plans**: Free tiers for individual teachers with fair commissions and Premium/Ultra tiers optimized for large organizations handling extensive staff dashboards.

### Core Platform Mechanics
- **Secure Custom Authentication**: Robust split-authentication flows catering individually to students, mentors, and organizations including OTP onboarding, magic email updates, and secure password reset handled via Supabase Auth.
- **AI-Powered Assistance**: Integrated Assistant bot to guide users natively through the platform.
- **Dynamic SEO-Friendly Routing**: Built with React Router DOM strictly maintaining clean, robust, and scalable app architecture (e.g., SEO tuned Keyword Landing Pages).
- **Responsive & Premium UI**: Ensuring maximum usability across both mobile and desktop screens with a highly responsive layout, animated feedback loops (Framer Motion), accessible UI components (Radix UI), and stunning modern CSS design via Tailwind.

## 🛠 Tech Stack

- **Frontend Core**: React (v18), TypeScript, Vite
- **Styling Architecture**: Tailwind CSS (v4), Radix UI Primitives, Lucide Icons, Framer Motion (micro-animations), React Responsive Masonry, React Slick.
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Authentication API, RLS, Storage Buckets)
- **State Management & Data Flow**: React Hook Form, Context API, React DnD (Drag-and-Drop)
- **Application Routing**: React Router DOM (v7)

## 📁 Project Architecture

```
Client-View-Mentozy/
├── src/
│   ├── app/
│   │   ├── components/    # Reusable UI components (Sidebar, CourseModulesEditor, AssistantBot, etc.)
│   │   ├── pages/         # Application Views (Dashboards, Auth, Courses, Mentors, Profile)
│   │   └── App.tsx        # Central Application Routing Engine
│   ├── context/           # React Context Providers (e.g., AuthContext)
│   ├── lib/               # Utility functions, core API wrappers, constants, and helpers
│   ├── styles/            # Global stylesheet (Tailwind directives)
│   └── main.tsx           # React DOM Entry File
├── supabase/              # Supabase DB schema definitions, storage structure initialization, RLS scripts
├── public/                # Static public assets (Favicon, Logo, Images)
├── ...
└── package.json           # Dependencies and Scripts
```

## ⚙️ Setup & Installation

Follow these steps to launch Mentozy on your local development server:

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd Client-View-Mentozy
   ```

2. **Install project dependencies**:
   Make sure you have Node.js installed (v18 or higher recommended).
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and copy the contents from `.env.example`. Update it with your live Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Spin up the Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173` to explore Mentozy locally! 🚀

## 🗄️ Backend / Database Verification (Supabase)

To fully utilize Mentozy's powerful backend features (Auth, Modular Courses, User Document Uploads, Real-time RLS Security), ensure your connected project instance is properly molded utilizing the provided SQL migration scripts natively located in the project's root:

- `supabase-init-storage.sql`: Sets up scalable storage buckets for rich avatars and course documents.
- `supabase-fix-rls.sql`: Bolsters security establishing Row Level Security limits on access rules.
- `supabase-deep-lessons.sql` & `supabase-fix-modules.sql`: Re-structures schema schemas optimized for complex module-to-lesson architecture.
- `supabase-update-tracks.sql` & `supabase-verification.sql`: Manages platform course tracks logic and tutor verification statuses.

Execute these files inside your Supabase project's SQL Editor sequentially based on your deployment strategy.

## 💡 Inspiration

The idea for Mentozy stemmed from a common problem: students often feel lost or overwhelmed when trying to chart out their careers, especially in fast-paced fields like Tech, Startups, and Design. The gap between generic online courses and actionable, personalized guidance from industry veterans is massive. We wanted to build a platform that bridges this gap—a place where learning isn't just about watching videos, but about forming meaningful mentorships, getting real-time feedback, and having a structured path forward.

## ⚙️ What it does

Mentozy acts as a dual-sided marketplace and learning management system:
- **For Students**: It offers a rich portal where they can browse expert mentors by field (e.g., Computer Science, Startups), book 1-on-1 sessions, enroll in structured courses, and manage their learning calendar.
- **For Mentors/Organizations**: It provides a comprehensive dashboard to set up flexible pricing, define their availability, create complex multi-module courses utilizing a Drag-and-Drop builder, upload resources (PDFs), and track their growing analytics and achievements.

## 🏗️ How we built it

We chose a modern, scalable stack to ensure a premium user experience:
- **Frontend**: we heavily utilized React (v18) and Vite for a blazing-fast SPA experience. TypeScript was crucial for maintaining type safety across the complex data models.
- **Styling**: We combined Tailwind CSS (v4) with Radix UI primitives for accessible, customizable components, topped with Framer Motion for buttery-smooth micro-animations that make the UI feel alive.
- **Backend/Database**: Supabase forms the backbone. We heavily utilized its PostgreSQL database for complex relational data (Mentors, Courses, Modules, Lessons, Bookings) and its powerful Storage buckets for securely handling avatar images and course PDFs.
- **State/Routing**: React Router DOM (v7) handles the extensive nested routing, while React Hook Form ensures robust data validation on the myriad of onboarding and creation forms.

## 🚧 Challenges we ran into

- **Complex Schema Design**: Designing a relational database schema in Supabase that could handle dynamic Course Tracks, Modules, and deeply nested Lessons—while also balancing the dual roles of a user (Student vs. Mentor)—was tricky. Getting the Row Level Security (RLS) policies tight without breaking legitimate access took significant iteration.
- **Drag-and-Drop Course Builder**: Implementing the `react-dnd` library for the Course Modules Editor required managing complex nested state updates in React. Ensuring that reordering modules and lessons worked flawlessly without losing unsaved data was a major hurdle.
- **Authentication Flows**: Building separate, secure onboarding streams for Students, Individual Mentors, and Organizations (with different required data payload) using Supabase Auth took a lot of careful routing and session management.

## 🏆 Accomplishments that we're proud of

- **The UI/UX**: We are incredibly proud of how premium and professional the platform feels. The animations are crisp, the dynamic layouts (especially the Course Viewer) adapt beautifully, and the overall aesthetic wows users across both Desktop and Mobile.
- **Robust Course Editor**: Successfully shipping a modular course creation studio where mentors can build extensive curriculums, organize lessons, and upload real documents without friction.
- **Scalable Architecture**: Setting up the project in a way that allows us to easily plug in new features (like new Mentor Categories) and handle large amounts of data seamlessly via Supabase.

## 📚 What we learned

- **Supabase Mastery**: We deeply leveled up our knowledge of writing raw PostgreSQL, defining robust RLS policies, and managing cloud storage.
- **Advanced State Management**: Managing deeply nested React states (especially in the course builder and onboarding flows) taught us a lot about performance optimization and immutability.
- **User-Centric Design**: We learned how vital it is to provide clear, immediate feedback to users during long processes (like uploading files or filling out multi-step onboarding forms), which we addressed using `sonner` toasts and skeleton loaders.

## 🚀 What's next for Mentozy

- **Live Video Integration**: Building native WebRTC or Zoom integration so that 1-on-1 mentorship sessions can happen directly within the Mentozy platform.
- **AI-Powered Matching**: Enhancing the "Assistant Bot" and search algorithms to automatically recommend the perfect mentor to a student based on their onboarding profile and goals.
- **Community Forums**: Adding a community hub where students under the same mentor or within the same Track can collaborate, share projects, and discuss topics asynchronously.


---

*Built with ❤️ by the Mentozy Team*
