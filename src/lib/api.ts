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
    role: string;
    company: string;
    expertise: string[];
    rating: number;
    reviews: number;
    image: string;
    initials: string;
    bio?: string;
    years_experience?: number;
    hourly_rate?: number;
    // Organization / Extended Fields
    type?: 'online' | 'offline';
    website?: string;
    address?: string;
    founder?: string;
    status?: string;
    domain?: string;
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
    // New fields for Student Profile Overhaul
    about_me?: string;
    curiosities?: string;
    learning_now?: string;
    future_goals?: string;
    learning_goals?: string;
    learning_style?: string;
    availability?: string;
    location?: string;
    age?: string;
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

// Fallback Data - CALIBRATED: Prices $15-$75, Natural Ratings
const FALLBACK_MENTORS: Mentor[] = [
    {
        id: 101,
        name: "Dr. Aris Thorne",
        role: "Head of AI Research",
        company: "DeepMind",
        expertise: ["Neural Networks", "Ethics in AI"],
        rating: 5.0,
        reviews: 342,
        image: "bg-indigo-600/10 text-indigo-600",
        initials: "AT",
        bio: "Specializing in the intersection of cognitive science and machine learning. 15+ years of experience.",
        years_experience: 15,
        hourly_rate: 75
    },
    {
        id: 102,
        name: "Elena Rodriguez",
        role: "Senior UX Architect",
        company: "Adobe",
        expertise: ["Design Systems", "User Psychology"],
        rating: 4.5,
        reviews: 215,
        image: "bg-rose-500/10 text-rose-600",
        initials: "ER",
        bio: "Passionate about creating inclusive digital experiences. I help designers master design systems.",
        years_experience: 9,
        hourly_rate: 65
    },
    {
        id: 103,
        name: "Marcus Holloway",
        role: "Security Consultant",
        company: "CrowdStrike",
        expertise: ["Cybersecurity", "Cloud Security"],
        rating: 4.3,
        reviews: 128,
        image: "bg-slate-800/10 text-slate-800",
        initials: "MH",
        bio: "Helping startups and enterprises secure their infrastructure. Certified ethical hacker.",
        years_experience: 12,
        hourly_rate: 55
    },
    {
        id: 104,
        name: "Sienna Kim",
        role: "Marketing Director",
        company: "Spotify",
        expertise: ["Growth Hacking", "Brand Strategy"],
        rating: 4.1,
        reviews: 560,
        image: "bg-emerald-500/10 text-emerald-600",
        initials: "SK",
        bio: "Expert at scaling user bases through data-driven marketing strategies.",
        years_experience: 10,
        hourly_rate: 45
    },
    {
        id: 105,
        name: "Rohal Sharma",
        role: "Senior Instructor",
        company: "TechNexus",
        expertise: ["Full Stack Web", "React"],
        rating: 4.5,
        reviews: 142,
        image: "bg-amber-500/10 text-amber-600",
        initials: "RS",
        bio: "Dedicated instructor with a passion for teaching modern web technologies.",
        years_experience: 7,
        hourly_rate: 35
    },
    {
        id: 106,
        name: "TechNova Academy",
        role: "Educational Partner",
        company: "Global Ed",
        expertise: ["Bootcamps", "Certifications"],
        rating: 4.3,
        reviews: 1200,
        image: "bg-blue-600/10 text-blue-600",
        initials: "TN",
        type: "online",
        website: "technova.academy",
        address: "Digital Campus",
        founder: "Dr. Sarah Chen",
        status: "active",
        bio: "Provider of high-impact technical training programs.",
        hourly_rate: 25
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
    }
];

export const getMentors = async (): Promise<Mentor[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return FALLBACK_MENTORS;

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
            return FALLBACK_MENTORS;
        }

        const dbMentors = data as unknown as DBMentor[];

        const mappedMentors: Mentor[] = dbMentors
            .filter((item) => {
                const name = (item.profiles?.full_name || '').toLowerCase();
                const bio = (item.bio || '').toLowerCase();
                const company = (item.company || '').toLowerCase();

                // CALIBRATED FILTERING: Remove dwdsdaw and mentozy as requested
                const isTestOrBanned =
                    name.includes('dasd') || name.includes('ghgh') || name.includes('wdas') ||
                    name.includes('test') || name.includes('dwds') || name.includes('mentozy') ||
                    bio.includes('dasd') || bio.includes('ghgh') || bio.includes('dwds') ||
                    company.includes('dasd') || company.includes('mentozy');

                const isTooShort = name.trim().length < 3;

                return !isTestOrBanned && !isTooShort;
            })
            .map((item) => {
                let bioData: any = null;
                let bioText = item.bio || '';

                if (bioText.startsWith('{')) {
                    try {
                        bioData = JSON.parse(bioText);
                    } catch (e) { }
                }

                const name = item.profiles?.full_name || 'Expert Mentor';
                const role = bioData ? (bioData.role || 'Partner') : (item.bio ? item.bio.split('.')[0] : 'Instructor');

                // PRICE CALIBRATION: Clamping between 15 and 75
                let rate = item.hourly_rate || 20;
                if (rate < 15) rate = 15;
                if (rate > 75) rate = 75;

                // RATING CALIBRATION: Normalizing to 4.1 - 5.0 range
                let rating = item.rating || 4.5;
                if (rating < 4.1) rating = 4.1 + (Math.random() * 0.4);
                if (rating > 5.0) rating = 5.0;

                return {
                    id: item.id,
                    name: name,
                    role: role,
                    company: item.company || 'Global Expert',
                    expertise: item.mentor_expertise?.map((e) => e.skill) || ["Technology"],
                    rating: parseFloat(rating.toFixed(1)),
                    reviews: item.total_reviews || Math.floor(Math.random() * 50) + 10,
                    image: item.profiles?.avatar_url || 'bg-amber-500/10 text-amber-600',
                    initials: name.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
                    bio: bioData ? undefined : item.bio || undefined,
                    years_experience: item.years_experience || 5,
                    hourly_rate: rate,
                    type: bioData?.type,
                    website: bioData?.website,
                    address: bioData?.address,
                    founder: bioData?.founder,
                    status: bioData?.status,
                    domain: bioData?.domain
                };
            });

        // Mix with premium fallbacks
        return [...mappedMentors, ...FALLBACK_MENTORS].slice(0, 12);
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
            return FALLBACK_TRACKS;
        }

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

export const getStudentEnrollments = async (userId: string): Promise<Enrollment[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('enrollments')
            .select('*, tracks(*, track_modules(title))')
            .eq('user_id', userId);

        if (error) {
            console.error("Error fetching enrollments:", error);
            return [];
        }

        const realEnrollments = data.map((e: any) => {
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

        // If no real enrollments, return professional demo courses
        if (realEnrollments.length === 0) {
            return FALLBACK_TRACKS.slice(0, 2).map((track, idx) => ({
                id: `demo-${idx}`,
                user_id: userId,
                track_id: track.id || 0,
                status: 'active',
                progress: idx === 0 ? 45 : 12,
                enrolled_at: new Date().toISOString(),
                tracks: track
            })) as Enrollment[];
        }

        return realEnrollments;
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
                user_id: b.student_id,
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

        const { data: mentorData, error: mentorError } = await supabase
            .from('mentors')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (mentorError || !mentorData) {
            console.error("Error fetching mentor record:", mentorError);
            return [];
        }

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
