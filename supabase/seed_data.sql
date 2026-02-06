-- CLEANUP
TRUNCATE TABLE public.mentor_reviews CASCADE;
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.mentor_availability CASCADE;
TRUNCATE TABLE public.mentor_expertise CASCADE;
TRUNCATE TABLE public.mentors CASCADE;
TRUNCATE TABLE public.enrollments CASCADE;
TRUNCATE TABLE public.module_lessons CASCADE;
TRUNCATE TABLE public.track_modules CASCADE;
TRUNCATE TABLE public.tracks CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- PROFILES (Mentors)
INSERT INTO public.profiles (id, full_name, avatar_url, role, bio) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dr. Aris Thorne', 'bg-indigo-600/10 text-indigo-600', 'mentor', 'Specializing in the intersection of cognitive science and machine learning. 15+ years of experience.'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Elena Rodriguez', 'bg-rose-500/10 text-rose-600', 'mentor', 'Passionate about creating inclusive digital experiences. I help designers master design systems.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Marcus Holloway', 'bg-slate-800/10 text-slate-800', 'mentor', 'Helping startups and enterprises secure their infrastructure. Certified ethical hacker.'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Sienna Kim', 'bg-emerald-500/10 text-emerald-600', 'mentor', 'Expert at scaling user bases through data-driven marketing strategies.'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Rohal Sharma', 'bg-amber-500/10 text-amber-600', 'mentor', 'Dedicated instructor with a passion for teaching modern web technologies.'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'TechNova Academy', 'bg-blue-600/10 text-blue-600', 'mentor', 'Provider of high-impact technical training programs.');

-- MENTORS (Details)
INSERT INTO public.mentors (id, user_id, bio, company, years_experience, hourly_rate, rating, total_reviews) VALUES
(101, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Head of AI Research', 'DeepMind', 15, 75, 5.0, 342),
(102, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Senior UX Architect', 'Adobe', 9, 65, 4.5, 215),
(103, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Security Consultant', 'CrowdStrike', 12, 55, 4.3, 128),
(104, 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Marketing Director', 'Spotify', 10, 45, 4.1, 560),
(105, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Senior Instructor', 'TechNexus', 7, 35, 4.5, 142),
(106, 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Educational Partner', 'Global Ed', 5, 25, 4.3, 1200);

-- MENTOR EXPERTISE
INSERT INTO public.mentor_expertise (mentor_id, skill) VALUES
(101, 'Neural Networks'), (101, 'Ethics in AI'),
(102, 'Design Systems'), (102, 'User Psychology'),
(103, 'Cybersecurity'), (103, 'Cloud Security'),
(104, 'Growth Hacking'), (104, 'Brand Strategy'),
(105, 'Full Stack Web'), (105, 'React'),
(106, 'Bootcamps'), (106, 'Certifications');

-- TRACKS
INSERT INTO public.tracks (id, title, level, description, duration_weeks, image_url) VALUES
(1, 'Full Stack Web Development', 'Beginner to Advanced', 'Master the MERN stack (MongoDB, Express, React, Node.js) and build production-ready applications.', 24, NULL),
(2, 'Data Structures & Algorithms', 'Intermediate', 'Crack coding interviews at top tech companies. Focus on problem-solving patterns and optimization.', 12, NULL),
(3, 'Product Management', 'Beginner', 'Learn how to build products users love. From user research to roadmap planning and launch.', 16, NULL);

-- TRACK MODULES
INSERT INTO public.track_modules (track_id, title, module_order) VALUES
(1, 'HTML/CSS & JavaScript', 1),
(1, 'React & State Management', 2),
(1, 'Node.js & APIs', 3),
(1, 'Database Design', 4),
(1, 'Deployment & DevOps', 5),
(2, 'Arrays & Strings', 1),
(2, 'Trees & Graphs', 2),
(2, 'Dynamic Programming', 3),
(2, 'System Design Basics', 4),
(2, 'Mock Interviews', 5),
(3, 'Market Research', 1),
(3, 'User Personas', 2),
(3, 'Wireframing', 3),
(3, 'Agile Methodologies', 4),
(3, 'Go-to-Market Strategy', 5);
