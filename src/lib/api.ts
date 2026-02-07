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
    status?: string | null;
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
    user_id: string;
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
    mentor_note?: string; // [NEW] Link note
    payment_link?: string; // [NEW] Payment Link / UPI ID
    mentors?: Mentor; // Joined data (Student View)
    profiles?: Profile; // Joined data (Mentor View: Student info)
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

// Fallback Data - CALIBRATED: Prices $15-$75, Natural Ratings


const FALLBACK_TRACKS: Track[] = [];

export const getMentors = async (): Promise<Mentor[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('mentors')
            .select(`
                *,
                profiles (full_name, avatar_url),
                mentor_expertise (skill)
            `);

        if (error) {
            console.warn("Error fetching mentors from Supabase:", error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        const dbMentors = data as unknown as DBMentor[];

        const mappedMentors: Mentor[] = dbMentors.map((item) => {
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
                user_id: item.user_id,
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
                status: item.status || bioData?.status, // Prioritize DB column
                domain: bioData?.domain
            };
        });

        return mappedMentors;
    } catch (e) {
        console.error("Unexpected error fetching mentors:", e);
        return [];
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
            console.warn("Error fetching tracks from Supabase:", error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
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
        return [];
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
                    user_id: m.user_id,
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
                mentor_note: b.mentor_note,
                payment_link: b.payment_link,
                mentors: mappedMentor
            } as Booking;
        });
    } catch (e) {
        console.error("Unexpected error in getStudentBookings:", e);
        return [];
    }
};

export const createBooking = async (userId: string, mentorId: number, scheduledAt: string, duration?: string, note?: string): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { data, error } = await supabase.rpc('create_booking_adhoc', {
            p_student_id: userId,
            p_mentor_id: mentorId,
            p_start_time: scheduledAt
        });

        // SIMULATION: Log the extra details since the RPC might not support them yet
        if (duration || note) {
            console.log(`[Mock] Booking Details - Duration: ${duration}, Note: ${note}`);
        }

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
            mentor_note: b.mentor_note,
            payment_link: b.payment_link,
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

export const acceptBooking = async (bookingId: string, meetingLink: string, note?: string, paymentLink?: string): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        // Update Booking Record
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'confirmed',
                meeting_link: meetingLink,
                mentor_note: note,
                payment_link: paymentLink
            })
            .eq('id', bookingId);

        if (error) {
            console.error("Error accepting booking:", error);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Error in acceptBooking:", e);
        return false;
    }
};

export interface TimeSlot {
    id: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    available: boolean;
}

export const getMentorAvailability = async (mentorId: number, date: Date): Promise<TimeSlot[]> => {
    // In a real app, this would query the DB for the mentor's schedule and existing bookings
    // For now, we mock it to return standard business hours with random availability

    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17;  // 5 PM

    // Generate slots for the given date
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = new Date(baseDate);
        slotStart.setHours(hour);

        const slotEnd = new Date(baseDate);
        slotEnd.setHours(hour + 1);

        // Mock randomization: 70% chance of being available
        // But ensure at least some slots are available
        const isAvailable = Math.random() > 0.3;

        slots.push({
            id: `${mentorId}-${slotStart.toISOString()}`,
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            available: isAvailable
        });
    }

    // ... previous code
    return slots;
};

export interface Contact {
    id: string;
    name: string;
    role: string; // 'student' | 'mentor'
    avatar?: string;
    lastMessage?: string;
    status: 'online' | 'offline';
}

// Messages
export const getMessages = async (userId1: string, userId2: string): Promise<Message[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
            .order('created_at', { ascending: true });

        if (error) {
            console.error("Error fetching messages:", error);
            return [];
        }

        return data as Message[];
    } catch (e) {
        console.error("Unexpected error in getMessages:", e);
        return [];
    }
};

export const sendMessage = async (senderId: string, receiverId: string, content: string): Promise<Message | null> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                content: content
            })
            .select()
            .single();

        if (error) {
            console.error("Error sending message:", error);
            return null;
        }

        return data as Message;
    } catch (e) {
        console.error("Unexpected error in sendMessage:", e);
        return null;
    }
};

export const getMentorByUserId = async (userId: string): Promise<any | null> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('mentors')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (e) {
        console.error("Error fetching mentor details:", e);
        return null;
    }
};

export const updateMentorProfile = async (userId: string, updates: any): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { error } = await supabase
            .from('mentors')
            .update(updates)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error updating mentor profile:", e);
        return false;
    }
};

export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error marking message as read:", e);
        return false;
    }
};

export const markAllAsRead = async (senderId: string, receiverId: string): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('sender_id', senderId)
            .eq('receiver_id', receiverId)
            .eq('is_read', false);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error marking all as read:", e);
        return false;
    }
};

export const getContacts = async (userId: string, role: string): Promise<Contact[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        // USER REQUEST: Students should ONLY see peers (students), Mentors ONLY see peers (mentors).
        // Remove Mentor-Student logic from messages contacts as requested.

        // 1. Get Peer Contacts (Same Role)
        const { data: peers, error: peerError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .eq('role', role)
            .neq('id', userId);

        if (peerError) {
            console.error("Error fetching peer contacts:", peerError);
            return [];
        }

        // 2. Map Peers to Contact format
        // In a real app, lastMessage and unread count would be joined from messages table
        // For now, we fetch just the unread status per-contact locally in the component
        const peerContacts: Contact[] = (peers || []).map((p: any) => ({
            id: p.id,
            name: p.full_name || 'User',
            role: p.role,
            avatar: p.avatar_url,
            status: 'offline', // Default, real-time presence would go here
            lastMessage: 'Strict peer contact'
        }));

        return peerContacts;
    } catch (e) {
        console.error("Error fetching contacts:", e);
        return [];
    }
};

// Update Mentor Status
export const updateMentorStatus = async (userId: string, status: 'active' | 'unavailable'): Promise<boolean> => {
    // ... existing code
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { error } = await supabase
            .from('mentors')
            .update({ status })
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error updating mentor status:", e);
        return false;
    }
};
