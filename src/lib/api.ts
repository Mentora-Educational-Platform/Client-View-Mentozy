
import { getSupabase } from './supabase';

// Database Types (matching Schema)
interface DBProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: 'student' | 'mentor' | 'admin';
    grade: string | null;
    school: string | null;
    phone: string | null;
    interests: string[] | null;
    streak: number;
}

interface DBMentor {
    id: number;
    user_id: string;
    bio: string | null;
    company: string | null;
    years_experience: number | null;
    hourly_rate: number | null;
    rating: number;
    total_reviews: number;
    created_at: string;
    // Joins
    profiles?: DBProfile;
    mentor_expertise?: { skill: string }[];
}

interface DBTrack {
    id: number;
    title: string;
    level: string | null;
    description: string | null;
    duration_weeks: number | null;
    image_url: string | null;
    // Joins
    track_modules?: { title: string; module_order: number }[];
}

export interface Mentor {
    id: number;
    name: string;
    role: string; // Mapped from Bio or specialized field if needed. Using 'Mentor' or company role.
    company: string;
    expertise: string[];
    rating: number;
    reviews: number;
    image: string;
    initials: string;
    // New V3 Fields
    bio?: string;
    years_experience?: number;
    hourly_rate?: number;
}

export interface Track {
    id?: number;
    title: string;
    level: string;
    duration: string; // Mapped from duration_weeks (e.g. "X Weeks")
    projects: number;
    description: string;
    modules: string[]; // Mapped from track_modules titles
    image_url?: string;
}

export interface Profile {
    id: string;
    email?: string;
    full_name: string;
    role: 'student' | 'mentor' | 'admin';
    avatar_url?: string;
    grade?: string;
    school?: string;
    interests?: string[];
    phone?: string;
    streak?: number;
}

export interface Enrollment {
    id: string;
    user_id: string;
    track_id: number;
    status: 'active' | 'completed' | 'dropped';
    progress: number;
    enrolled_at: string;
    tracks?: Track; // Joined data
}

export interface Booking {
    id: string;
    user_id: string;
    mentor_id: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    scheduled_at: string;
    meeting_link?: string;
    mentors?: Mentor; // Joined data (Student View)
    profiles?: Profile; // Joined data (Mentor View: Student info)
}

// Fallback Data
// Fallback Data
const FALLBACK_MENTORS: Mentor[] = [
    {
        id: 1,
        name: "Aditi Verma",
        role: "Senior Product Manager",
        company: "Google",
        expertise: ["Product Strategy", "Resume Review", "Mock Interviews"],
        rating: 4.9,
        reviews: 120,
        image: "bg-black-100 text-black-600",
        initials: "AV",
        bio: "Passionate about building scalable products and mentoring aspiring PMs.",
        years_experience: 8,
        hourly_rate: 150
    },
    {
        id: 2,
        name: "David Chen",
        role: "Staff Engineer",
        company: "Netflix",
        expertise: ["System Design", "Backend Architecture", "Career Growth"],
        rating: 5.0,
        reviews: 85,
        image: "bg-black-100 text-white-600",
        initials: "DC",
        bio: "Specializing in distributed systems and high-scale architecture.",
        years_experience: 10,
        hourly_rate: 200
    },
    {
        id: 3,
        name: "Sarah Jones",
        role: "Engineering Manager",
        company: "Spotify",
        expertise: ["Leadership", "Frontend Dev", "Salary Negotiation"],
        rating: 4.8,
        reviews: 200,
        image: "bg-black-100 text-white-600",
        initials: "SJ",
        bio: "Leading frontend teams and helping engineers grow into leadership roles.",
        years_experience: 12,
        hourly_rate: 180
    },
    {
        id: 4,
        name: "Rahul Gupta",
        role: "Data Scientist",
        company: "Amazon",
        expertise: ["AI/ML", "Python", "Data Structures"],
        rating: 4.9,
        reviews: 95,
        image: "bg-black-100 text-white-600",
        initials: "RG",
        bio: "Data enthusiast with a focus on machine learning and predictive modeling.",
        years_experience: 6,
        hourly_rate: 140
    },
    {
        id: 5,
        name: "Emily Wang",
        role: "UX Researcher",
        company: "Airbnb",
        expertise: ["User Research", "Portfolio Review", "Design Thinking"],
        rating: 5.0,
        reviews: 60,
        image: "bg-black-100 text-white-600",
        initials: "EW",
        bio: "Advocating for user-centric design through rigorous research and testing.",
        years_experience: 5,
        hourly_rate: 120
    },
    {
        id: 6,
        name: "Michael Brown",
        role: "Full Stack Dev",
        company: "Stripe",
        expertise: ["React", "Node.js", "Payment Integration"],
        rating: 4.7,
        reviews: 45,
        image: "bg-black-100 text-white-600",
        initials: "MB",
        bio: "Building robust payment infrastructure and developer-friendly APIs.",
        years_experience: 7,
        hourly_rate: 160
    }
];

const FALLBACK_TRACKS: Track[] = [
    {
        title: "Full Stack Web Development",
        level: "Beginner to Advanced",
        duration: "6 Months",
        projects: 8,
        description: "Master the MERN stack (MongoDB, Express, React, Node.js) and build production-ready applications.",
        modules: ["HTML/CSS & JavaScript", "React & State Management", "Node.js & APIs", "Database Design", "Deployment & DevOps"]
    },
    {
        title: "Data Structures & Algorithms",
        level: "Intermediate",
        duration: "3 Months",
        projects: 40,
        description: "Crack coding interviews at top tech companies. Focus on problem-solving patterns and optimization.",
        modules: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "System Design Basics", "Mock Interviews"]
    },
    {
        title: "Product Management",
        level: "Beginner",
        duration: "4 Months",
        projects: 5,
        description: "Learn how to build products users love. From user research to roadmap planning and launch.",
        modules: ["Market Research", "User Personas", "Wireframing", "Agile Methodologies", "Go-to-Market Strategy"]
    },
    {
        title: "UI/UX Design",
        level: "Beginner",
        duration: "4 Months",
        projects: 6,
        description: "Design beautiful and functional interfaces. Master Figma, prototyping, and design systems.",
        modules: ["Design Principles", "Figma Mastery", "User Research", "Prototyping", "Portfolio Building"]
    }
];

export const getMentors = async (): Promise<Mentor[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return FALLBACK_MENTORS;

        // Joined query to match V3 Schema
        const { data, error } = await supabase
            .from('mentors')
            .select(`
                *,
                profiles (full_name, avatar_url),
                mentor_expertise (skill)
            `);

        if (error) {
            console.warn("Error fetching mentors from Supabase, using fallback:", error.message);
            return FALLBACK_MENTORS;
        }

        if (!data || data.length === 0) {
            // Fallback if no mentors found
            return FALLBACK_MENTORS;
        }

        // Map DB result to UI Interface
        // Cast to DBMentor[] to satisfy type checking and use the type
        const dbMentors = data as unknown as DBMentor[];

        const mappedMentors: Mentor[] = dbMentors.map((item) => ({
            id: item.id,
            name: item.profiles?.full_name || 'Unknown Mentor',
            role: item.bio ? item.bio.split('.')[0] : 'Mentor',
            company: item.company || 'Independent',
            expertise: item.mentor_expertise?.map((e) => e.skill) || [],
            rating: item.rating || 0,
            reviews: item.total_reviews || 0,
            image: item.profiles?.avatar_url || '',
            initials: item.profiles?.full_name ? item.profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : '??',
            bio: item.bio || undefined,
            years_experience: item.years_experience || 0,
            hourly_rate: item.hourly_rate || 0
        }));

        return mappedMentors;
    } catch (e) {
        console.error("Unexpected error fetching mentors:", e);
        return FALLBACK_MENTORS;
    }
};

export const getTracks = async (): Promise<Track[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return FALLBACK_TRACKS;

        const { data, error } = await supabase
            .from('tracks')
            .select(`
                *,
                track_modules (title, module_order)
            `)
            .order('module_order', { foreignTable: 'track_modules', ascending: true });

        if (error) {
            console.warn("Error fetching tracks from Supabase, using fallback:", error.message);
            return FALLBACK_TRACKS;
        }

        if (!data || data.length === 0) {
            // Fallback if no tracks found
            return FALLBACK_TRACKS;
        }

        // Map DB result to UI Interface
        const dbTracks = data as unknown as DBTrack[];

        const mappedTracks: Track[] = dbTracks.map((item) => ({
            id: item.id,
            title: item.title,
            level: item.level || 'All Levels',
            duration: item.duration_weeks ? `${item.duration_weeks} Weeks` : 'Self-paced',
            projects: 0,
            description: item.description || '',
            modules: item.track_modules?.map((m) => m.title) || [],
            image_url: item.image_url || undefined
        }));

        return mappedTracks;
    } catch (e) {
        console.error("Unexpected error fetching tracks:", e);
        return FALLBACK_TRACKS;
    }
};

// ==========================================
// USER PROFILES
// ==========================================

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            return null;
        }

        return data as Profile;
    } catch (e) {
        console.error("Unexpected error in getUserProfile:", e);
        return null;
    }
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    } catch (e) {
        console.error("Error updating profile:", e);
        return null;
    }
};

// ==========================================
// ENROLLMENTS
// ==========================================

export const getStudentEnrollments = async (userId: string): Promise<Enrollment[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        // Fetch enrollments and join with tracks table and track_modules for mapping
        const { data, error } = await supabase
            .from('enrollments')
            .select('*, tracks(*, track_modules(title))')
            .eq('user_id', userId);

        if (error) {
            console.error("Error fetching enrollments:", error);
            return [];
        }

        return data.map((e: any) => {
            // Map the joined track to UI Track interface
            let mappedTrack: Track | undefined = undefined;
            if (e.tracks) {
                const t = e.tracks;
                mappedTrack = {
                    id: t.id,
                    title: t.title,
                    level: t.level || 'All Levels',
                    duration: t.duration_weeks ? `${t.duration_weeks} Weeks` : 'Self-paced',
                    projects: 0,
                    description: t.description || '',
                    modules: t.track_modules?.map((m: any) => m.title) || [],
                    image_url: t.image_url
                };
            }

            return {
                ...e,
                tracks: mappedTrack
            } as Enrollment;
        });
    } catch (e) {
        console.error("Unexpected error in getStudentEnrollments:", e);
        return [];
    }
};

export const enrollInTrack = async (userId: string, trackId: number): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { error } = await supabase
            .from('enrollments')
            .insert({ user_id: userId, track_id: trackId });

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error enrolling in track:", e);
        return false;
    }
};

// ==========================================
// BOOKINGS
// ==========================================

export const getStudentBookings = async (userId: string): Promise<Booking[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                mentors (
                    *,
                    profiles (full_name, avatar_url),
                    mentor_expertise (skill)
                ),
                mentor_availability (start_time)
            `)
            .eq('student_id', userId);

        if (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }

        return data.map((b: any) => {
            // Map joined mentor to UI Mentor
            let mappedMentor: Mentor | undefined = undefined;
            if (b.mentors) {
                const m = b.mentors;
                mappedMentor = {
                    id: m.id,
                    name: m.profiles?.full_name || 'Unknown Mentor',
                    role: m.bio ? m.bio.split('.')[0] : 'Expert',
                    company: m.company || 'Independent',
                    expertise: m.mentor_expertise?.map((e: any) => e.skill) || [],
                    rating: m.rating || 0,
                    reviews: m.total_reviews || 0,
                    image: m.profiles?.avatar_url || '',
                    initials: '??'
                };
            }

            return {
                id: b.id,
                user_id: b.student_id, // Map student_id -> UI's user_id
                mentor_id: b.mentor_id,
                status: b.status,
                scheduled_at: b.mentor_availability?.start_time || new Date().toISOString(),
                meeting_link: b.meeting_link,
                mentors: mappedMentor
            } as Booking;
        });
    } catch (e) {
        console.error("Unexpected error in getStudentBookings:", e);
        return [];
    }
};

export const createBooking = async (userId: string, mentorId: number, scheduledAt: string): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        // Use RPC to handle Ad-hoc booking (create availability + booking)
        const { data, error } = await supabase.rpc('create_booking_adhoc', {
            p_student_id: userId,
            p_mentor_id: mentorId,
            p_start_time: scheduledAt
        });

        if (error) {
            console.error("RPC Error creating booking:", error);
            return false;
        }
        return !!data;
    } catch (e) {
        console.error("Error creating booking:", e);
        return false;
    }
};

export const getMentorBookings = async (userId: string): Promise<Booking[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        // 1. Get Mentor ID from User ID
        const { data: mentorData, error: mentorError } = await supabase
            .from('mentors')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (mentorError || !mentorData) {
            console.error("Error fetching mentor record:", mentorError);
            return [];
        }

        // 2. Get Bookings for this Mentor
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *, 
                profiles!student_id (*),
                mentor_availability (start_time)
            `)
            .eq('mentor_id', mentorData.id);

        if (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }

        return data.map((b: any) => ({
            id: b.id,
            user_id: b.student_id,
            mentor_id: b.mentor_id,
            status: b.status,
            scheduled_at: b.mentor_availability?.start_time || new Date().toISOString(),
            meeting_link: b.meeting_link,
            profiles: b.profiles
        })) as Booking[];
    } catch (e) {
        console.error("Unexpected error in getMentorBookings:", e);
        return [];
    }
};

export const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', bookingId);

        if (error) {
            console.error("Error updating booking status:", error);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Error in updateBookingStatus:", e);
        return false;
    }
};
