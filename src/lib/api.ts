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
    email?: string; // Added for email fetching
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

        return dbMentors.map((item) => {
            const name = item.profiles?.full_name || 'Expert Mentor';
            const role = item.bio ? item.bio.split('.')[0] : 'Instructor';

            return {
                id: item.id,
                name: name,
                role: role,
                company: item.company || 'Global Expert',
                expertise: item.mentor_expertise?.map((e) => e.skill) || ["Technology"],
                rating: Number(item.rating) || 5.0,
                reviews: item.total_reviews || 0,
                image: item.profiles?.avatar_url || 'bg-amber-500/10 text-amber-600',
                initials: name.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
                bio: item.bio || undefined,
                years_experience: item.years_experience || 5,
                hourly_rate: item.hourly_rate || 20,
            };
        });
    } catch (e) {
        console.error("Unexpected error fetching mentors:", e);
        return [];
    }
};

export const getTracks = async (): Promise<Track[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

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

        return dbTracks.map((item) => ({
            id: item.id,
            title: item.title,
            level: item.level || 'All Levels',
            duration: item.duration_weeks ? `${item.duration_weeks} Weeks` : 'Self-paced',
            projects: 0,
            description: item.description || '',
            modules: item.track_modules?.map((m) => m.title) || [],
            image_url: item.image_url || undefined
        }));
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

        return data.map((e: any) => {
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
            // Check if mentor exists (could be null if deleted)
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

export const createBooking = async (userId: string, mentorId: number, scheduledAt: string, duration?: string, note?: string): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { data, error } = await supabase.rpc('create_booking_adhoc', {
            p_student_id: userId,
            p_mentor_id: mentorId,
            p_start_time: scheduledAt
        });

        // Log duration for debugging/analytics (and to satisfy TS unused var)
        if (duration) console.log("Booking duration:", duration);

        if (error) {
            console.error("RPC Error creating booking:", error);
            return false;
        }

        // --- SMTP EMAIL SENDING ---
        try {
            // Fetch Student Email
            const { data: studentProfile } = await supabase.from('profiles').select('email, full_name').eq('id', userId).single();
            const studentEmail = studentProfile?.email;
            const studentName = studentProfile?.full_name || 'Student';

            // Fetch Mentor Email (via profile join)
            const { data: mentorUser } = await supabase.from('mentors').select('user_id, profiles(email, full_name)').eq('id', mentorId).single();

            // Handle possibility of join returning null or array
            // The type isn't strictly typed here so proceed with caution
            const mentorProfile = (mentorUser as any)?.profiles;
            const mentorEmail = mentorProfile?.email;
            const mentorName = mentorProfile?.full_name || 'Mentor';

            if (studentEmail) {
                await supabase.functions.invoke('send-email', {
                    body: {
                        to: studentEmail,
                        subject: 'Mentozy: Booking Confirmed!',
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h1 style="color: #4F46E5;">Booking Confirmed!</h1>
                                <p>Hi ${studentName},</p>
                                <p>Your session with <strong>${mentorName}</strong> has been successfully booked.</p>
                                <p><strong>Date & Time:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
                                <p><strong>Note:</strong> ${note || 'No notes added.'}</p>
                                <br/>
                                <p>We look forward to seeing you grow!</p>
                                <p>Best,<br/>Team Mentozy</p>
                            </div>
                        `,
                        text: `Hi ${studentName}, Your session with ${mentorName} is confirmed for ${new Date(scheduledAt).toLocaleString()}. Note: ${note || 'None'}.`
                    }
                });
            }

            if (mentorEmail) {
                await supabase.functions.invoke('send-email', {
                    body: {
                        to: mentorEmail,
                        subject: 'Mentozy: New Booking Received!',
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h1 style="color: #4F46E5;">New Session Booked</h1>
                                <p>Hi ${mentorName},</p>
                                <p><strong>${studentName}</strong> has booked a session with you.</p>
                                <p><strong>Date & Time:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
                                <p><strong>Note:</strong> ${note || 'No notes added.'}</p>
                                <p>Please log in to your dashboard to view details.</p>
                                <br/>
                                <p>Best,<br/>Team Mentozy</p>
                            </div>
                        `,
                        text: `Hi ${mentorName}, ${studentName} has booked a session with you for ${new Date(scheduledAt).toLocaleString()}. Note: ${note || 'None'}.`
                    }
                });
            }
        } catch (emailError) {
            console.error("Non-blocking error sending confirmation emails:", emailError);
        }
        // --------------------------

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

export interface TimeSlot {
    id: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    available: boolean;
}

export const getMentorAvailability = async (mentorId: number, date: Date): Promise<TimeSlot[]> => {
    // In a real app, this would query the DB for the mentor's schedule and existing bookings
    // For now, we mock it to return standard business hours with random availability
    // TODO: Connect to mentor_availability table

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

    return slots;
};
