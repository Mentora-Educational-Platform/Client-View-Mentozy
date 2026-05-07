import { getSupabase } from './supabase';
import { toast } from 'sonner';

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
    modules: any[]; // Changed to hold full module objects instead of just titles.
    image_url?: string;
    status?: 'published' | 'draft';
    creator_id?: string;
    price?: number;
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
    status: 'pending' | 'accepted' | 'confirmed' | 'cancelled' | 'completed';
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
    profiles(full_name, avatar_url),
    mentor_expertise(skill)
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
                track_modules(*)
            `)
            .order('module_order', { foreignTable: 'track_modules', ascending: true });

        if (error) {
            console.warn("Error fetching tracks from Supabase:", error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        const dbTracks = data as unknown as any[];

        const mappedTracks: Track[] = dbTracks.map((item) => ({
            id: item.id,
            title: item.title,
            level: item.level || 'All Levels',
            duration: item.duration_weeks ? `${item.duration_weeks} Weeks` : 'Self-paced',
            projects: 0,
            description: item.description || '',
            modules: item.track_modules?.map((m: any) => m.content || { title: m.title }) || [],
            image_url: item.image_url || undefined,
            price: item.price !== undefined ? parseFloat(item.price) : 0
        }));

        return mappedTracks;
    } catch (e) {
        console.error("Unexpected error fetching tracks:", e);
        return [];
    }
};

export const getMentorCreatedCourses = async (mentorUserId: string): Promise<Track[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('tracks')
            .select(`
    *,
    track_modules(title, module_order)
        `)
            .eq('creator_id', mentorUserId)
            .order('id', { ascending: false });

        if (error) {
            console.warn("Error fetching mentor courses from Supabase (may be missing creator_id column):", error.message);
            return []; // Fail gracefully if column missing
        }

        if (!data || data.length === 0) return [];

        return (data as any[]).map((item) => ({
            id: item.id,
            title: item.title,
            level: item.level || 'All Levels',
            duration: item.duration_weeks ? `${item.duration_weeks} Weeks` : 'Self-paced',
            projects: 0,
            description: item.description || '',
            modules: item.track_modules?.sort((a: any, b: any) => a.module_order - b.module_order).map((m: any) => m.title) || [],
            image_url: item.image_url || undefined,
            status: item.status || 'published',
            creator_id: item.creator_id
        }));

    } catch (e) {
        console.error("Unexpected error in getMentorCreatedCourses:", e);
        return [];
    }
};

export const createCourse = async (
    courseId: number | null,
    courseData: Partial<Track>,
    modules: any[],
    creatorId?: string,
    status: 'published' | 'draft' = 'published'
): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const payload: any = {
            title: courseData.title,
            level: courseData.level || 'All Levels',
            description: courseData.description,
            duration_weeks: parseInt((courseData.duration || '4').split(' ')[0]) || 4,
            image_url: courseData.image_url,
            price: courseData.price ? parseFloat(courseData.price as unknown as string) : 0
        };

        if (creatorId) {
            payload.creator_id = creatorId;
            payload.status = status;
        }

        let trackId = courseId;

        if (trackId) {
            // Update existing Track
            const { error: updateError } = await supabase
                .from('tracks')
                .update(payload)
                .eq('id', trackId);

            if (updateError) {
                console.error("Error updating track full details:", updateError);
                toast.error(`Database Error: ${updateError.message || 'Unknown error'}`);
                return false;
            }

            // Delete existing modules to replace them cleanly
            await supabase.from('track_modules').delete().eq('track_id', trackId);

        } else {
            // Insert new Track
            const { data: trackRecords, error: trackError } = await supabase
                .from('tracks')
                .insert([payload])
                .select('id');

            if (trackError) {
                console.error("Error creating track full details:", trackError);
                console.error("Payload was:", payload);
                toast.error(`Database Error: ${trackError.message || 'Unknown error'}`);
                return false;
            }

            if (!trackRecords || trackRecords.length === 0) {
                console.warn("Track creation returned no data.");
                return false;
            }

            trackId = trackRecords[0].id as number;
        }

        if (!trackId) {
            console.error("Failed to retrieve or determine track ID after creation/update.");
            return false;
        }

        // Insert Modules into track_modules table
        if (modules && modules.length > 0) {
            const moduleInserts = modules.map((mod, index) => ({
                track_id: trackId,
                title: mod.title || 'Untitled Module',
                module_order: index + 1,
                content: mod // Save the entire deep lesson object here natively!
            }));

            const { error: moduleError } = await supabase
                .from('track_modules')
                .insert(moduleInserts);

            if (moduleError) {
                console.error("Error creating modules:", moduleError);
                toast.error(`Database Error: ${moduleError.message || 'Unknown error'}`);
                return false;
            }
        }

        return true;

    } catch (e) {
        console.error("Unexpected error in createCourse:", e);
        return false;
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

export const getCourseDataForStudent = async (trackId: number): Promise<any> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('tracks')
            .select(`
                *,
                track_modules(*)
            `)
            .eq('id', trackId)
            .single();

        if (error) {
            console.error("Error fetching course data:", error);
            return null;
        }

        // Sort modules by order
        if (data.track_modules) {
            data.track_modules.sort((a: any, b: any) => a.module_order - b.module_order);
        }

        return data;
    } catch (e) {
        console.error("Unexpected error in getCourseDataForStudent:", e);
        return null;
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

export const updateEnrollmentProgress = async (userId: string, trackId: number, progress: number): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { error } = await supabase
            .from('enrollments')
            .update({ progress: Math.min(100, Math.max(0, Math.round(progress))) })
            .eq('user_id', userId)
            .eq('track_id', trackId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error updating enrollment progress:", e);
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
    mentors(
                    *,
        profiles(full_name, avatar_url),
        mentor_expertise(skill)
    ),
    mentor_availability(start_time)
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
                    image: m.profiles?.avatar_url || '',
                    initials: '??',
                    hourly_rate: m.hourly_rate || undefined
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
            console.log(`[Mock] Booking Details - Duration: ${duration}, Note: ${note} `);
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

export const uploadDocument = async (file: File): Promise<{ url: string | null; error: Error | null }> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return { url: null, error: new Error("Supabase client not initialized") };

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `worksheets/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('course_documents')
            .upload(filePath, file);

        if (uploadError) {
            console.error("Supabase Storage upload error:", uploadError);
            return { url: null, error: uploadError };
        }

        const { data } = supabase.storage
            .from('course_documents')
            .getPublicUrl(filePath);

        return { url: data.publicUrl, error: null };
    } catch (e) {
        console.error("Unexpected error in uploadDocument:", e);
        return { url: null, error: e instanceof Error ? e : new Error(String(e)) };
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

        const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
    *,
    profiles!student_id(*),
        mentor_availability(start_time)
            `)
            .eq('mentor_id', mentorData.id);

        // Also fetch booked slots from availability table as "real sessions"
        const { data: slotsData, error: slotsError } = await supabase
            .from('mentor_availability')
            .select('*')
            .eq('mentor_id', mentorData.id)
            .eq('is_booked', true);

        if (bookingsError || slotsError) {
            console.error("Error fetching sessions:", bookingsError || slotsError);
            return [];
        }

        const realBookings = (bookingsData || []).map((b: any) => ({
            id: b.id,
            user_id: b.student_id,
            mentor_id: b.mentor_id,
            status: b.status,
            scheduled_at: b.mentor_availability?.start_time || new Date().toISOString(),
            meeting_link: b.meeting_link,
            mentor_note: b.mentor_note,
            payment_link: b.payment_link,
            profiles: b.profiles
        }));

        const availabilityBookings = (slotsData || []).map((s: any) => {
            // Check if this slot already has a booking to avoid duplicates
            if (realBookings.some(rb => rb.scheduled_at === s.start_time)) return null;

            return {
                id: s.id,
                user_id: 'unknown',
                mentor_id: s.mentor_id,
                status: 'confirmed',
                scheduled_at: s.start_time,
                profiles: {
                    id: 'unknown',
                    full_name: 'Scheduled Student',
                    role: 'student'
                }
            };
        }).filter(Boolean) as Booking[];

        return [...realBookings, ...availabilityBookings];
    } catch (e) {
        console.error("Unexpected error in getMentorBookings:", e);
        return [];
    }
};

export const updateBookingStatus = async (bookingId: string, status: 'accepted' | 'confirmed' | 'cancelled' | 'completed'): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', bookingId)
            .select();

        if (error) {
            console.error("Error updating booking status:", error);
            return false;
        }

        if (!data || data.length === 0) {
            console.error("No row updated in DB! This is likely an RLS issue or incorrect Booking ID.");
            return false;
        }

        return true;
    } catch (e) {
        console.error("Error in updateBookingStatus:", e);
        return false;
    }
};

export const acceptBooking = async (
    bookingId: string,
    details?: { note?: string }
): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const updatePayload: {
            status: 'accepted';
            mentor_note?: string;
        } = {
            status: 'accepted'
        };

        if (typeof details?.note === 'string' && details.note.trim().length > 0) {
            updatePayload.mentor_note = details.note.trim();
        }

        // Update booking record.
        const { data, error } = await supabase
            .from('bookings')
            .update(updatePayload)
            .eq('id', bookingId)
            .select()
            .maybeSingle();

        if (error) {
            console.error("[API] Error accepting booking:", error.message, error.details);
            return false;
        }

        if (!data?.id) {
            console.error(`[API] No row updated in DB for acceptBooking (ID: ${bookingId})!`);
            return false;
        }

        return true;
    } catch (e) {
        console.error("Error in acceptBooking:", e);
        return false;
    }
};

export const markBookingPaidAndConfirm = async (bookingId: string): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { data, error } = await supabase
            .from('bookings')
            .update({
                status: 'confirmed'
            })
            .eq('id', bookingId)
            .select();

        if (error) {
            console.error("Error confirming booking after payment:", error);
            return false;
        }

        if (!data || data.length === 0) {
            console.error("No row updated in DB for markBookingPaidAndConfirm! Check RLS or Booking ID.");
            return false;
        }

        return true;
    } catch (e) {
        console.error("Error in markBookingPaidAndConfirm:", e);
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
            id: `${mentorId} -${slotStart.toISOString()} `,
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
            .or(`and(sender_id.eq.${userId1}, receiver_id.eq.${userId2}), and(sender_id.eq.${userId2}, receiver_id.eq.${userId1})`)
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

// --- ORGANIZATION TEACHER INVITES ---
export const searchMentorsForOrg = async (query: string): Promise<Profile[]> => {
    try {
        const supabase = getSupabase();
        if(!supabase || !query || query.length < 2) return [];

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'mentor')
            .ilike('full_name', `%${query}%`)
            .limit(10);
            
        if (error) throw error;
        return data as Profile[];
    } catch(e) {
        console.error("Error searching mentors:", e);
        return [];
    }
}

export const sendOrgMentorInvite = async (orgId: string, mentorId: string): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if(!supabase) return false;
        
        // Check if already a teacher
        const { count: teacherCount } = await supabase.from('org_teachers').select('id', {count: 'exact', head: true}).eq('org_id', orgId).eq('mentor_id', mentorId);
        if (teacherCount && teacherCount > 0) return false; // Already a teacher
        
        // Remove old stranded invites
        await supabase.from('org_invitations').delete().eq('org_id', orgId).eq('mentor_id', mentorId);
        
        const { error } = await supabase
            .from('org_invitations')
            .insert({
                org_id: orgId,
                mentor_id: mentorId,
                status: 'pending'
            });
            
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error sending org invite:", e);
        return false;
    }
}

export const getPendingOrgInvitesForMentor = async (mentorId: string): Promise<any[]> => {
    try {
        const supabase = getSupabase();
        if(!supabase) return [];
        
        const { data, error } = await supabase
            .from('org_invitations')
            .select('id, org_id, mentor_id, status, created_at, org:profiles!org_invitations_org_id_fkey(full_name, avatar_url)')
            .eq('mentor_id', mentorId)
            .eq('status', 'pending');
            
        if (error) {
            console.error("error:", error);
            // Note: If foreign key is ambiguous, we'll try without explicit fkey mapping
            const fallback = await supabase.from('org_invitations').select('id, org_id, mentor_id, status, created_at').eq('mentor_id', mentorId).eq('status', 'pending');
            return fallback.data || [];
        }
        return data || [];
    } catch(e) {
        console.error("Error getting pending org invites:", e);
        return [];
    }
}

export const respondToOrgInvite = async (inviteId: string, orgId: string, mentorId: string, accept: boolean): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if(!supabase) return false;
        
        const status = accept ? 'accepted' : 'rejected';
        const { error } = await supabase
            .from('org_invitations')
            .update({ status })
            .eq('id', inviteId);
            
        if (error) throw error;
        
        if (accept) {
            // Add to org_teachers
            const { error: insertError } = await supabase.from('org_teachers').insert({
                org_id: orgId,
                mentor_id: mentorId,
                status: 'Active',
                role: 'Instructor',
                department: 'General'
            });
            if (insertError) throw insertError;
        }
        
        return true;
    } catch(e) {
        console.error("Error responding to org invite:", e);
        return false;
    }
}

export const getOrgTeachers = async (orgId: string): Promise<any[]> => {
    try {
        const supabase = getSupabase();
        if(!supabase) return [];
        
        const { data, error } = await supabase
            .from('org_teachers')
            .select('id, status, department, role, joined_at, mentor_id, mentor:profiles!mentor_id(full_name, avatar_url, phone)')
            .eq('org_id', orgId);
            
        if (error) {
            console.error(error);
            return [];
        }
        
        return (data || []).map((t: any) => ({
            id: t.id,
            mentor_id: t.mentor_id,
            name: t.mentor?.full_name || 'Teacher',
            email: t.mentor?.email || 'No email',
            phone: t.mentor?.phone || '',
            avatar: t.mentor?.avatar_url,
            department: t.department,
            role: t.role,
            status: t.status,
            joinDate: new Date(t.joined_at).toISOString().split('T')[0],
            classes: 0
        }));
    } catch(e) {
        console.error("Error fetching org teachers:", e);
        return [];
    }
}

export const getOrgStudents = async (orgId: string): Promise<any[]> => {
    try {
        const supabase = getSupabase();
        if(!supabase) return [];
        
        const { data, error } = await supabase
            .from('org_students')
            .select('id, status, grade, joined_at, student_id, student:profiles!student_id(full_name, avatar_url)')
            .eq('org_id', orgId);
            
        if (error) {
            console.error("Error fetching org students:", error);
            return [];
        }
        
        return (data || []).map((s: any) => ({
            id: s.id,
            student_id: s.student_id,
            name: s.student?.full_name || 'Student',
            email: s.student?.email || 'No email',
            avatar: s.student?.avatar_url,
            grade: s.grade || 'General',
            status: s.status || 'Active',
            joinDate: new Date(s.joined_at).toISOString().split('T')[0],
            courses: 0,
            performance: 'A'
        }));
    } catch(e) {
        console.error("Error fetching org students:", e);
        return [];
    }
}

export const searchStudentsForOrg = async (query: string): Promise<Profile[]> => {
    try {
        const supabase = getSupabase();
        if(!supabase || !query || query.length < 2) return [];

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .ilike('full_name', `%${query}%`)
            .limit(10);
            
        if (error) throw error;
        return data as Profile[];
    } catch(e) {
        console.error("Error searching students:", e);
        return [];
    }
}

export const sendOrgStudentInvite = async (orgId: string, studentId: string): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if(!supabase) return false;
        
        // Check if already a student
        const { count: studentCount } = await supabase.from('org_students').select('id', {count: 'exact', head: true}).eq('org_id', orgId).eq('student_id', studentId);
        if (studentCount && studentCount > 0) return false; 
        
        // Remove old stranded invites
        await supabase.from('org_student_invitations').delete().eq('org_id', orgId).eq('student_id', studentId);
        
        const { error } = await supabase
            .from('org_student_invitations')
            .insert({
                org_id: orgId,
                student_id: studentId,
                status: 'pending'
            });
            
        if (error) throw error;
        return true;
    } catch(e) {
        console.error("Error sending org student invite:", e);
        return false;
    }
}

export const getPendingOrgInvitesForStudent = async (studentId: string): Promise<any[]> => {
    try {
        const supabase = getSupabase();
        if(!supabase) return [];
        
        const { data, error } = await supabase
            .from('org_student_invitations')
            .select('id, org_id, student_id, status, created_at, org:profiles!org_id(full_name, avatar_url)')
            .eq('student_id', studentId)
            .eq('status', 'pending');
            
        if (error) {
            console.error("Error getting pending org student invites:", error);
            return [];
        }
        return data || [];
    } catch(e) {
        console.error("Error getting pending org student invites:", e);
        return [];
    }
}

export const respondToOrgStudentInvite = async (inviteId: string, orgId: string, studentId: string, accept: boolean): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if(!supabase) return false;
        
        const status = accept ? 'accepted' : 'rejected';
        const { error } = await supabase
            .from('org_student_invitations')
            .update({ status })
            .eq('id', inviteId);
            
        if (error) throw error;
        
        if (accept) {
            // Add to org_students
            const { error: insertError } = await supabase.from('org_students').insert({
                org_id: orgId,
                student_id: studentId,
                status: 'Active',
                grade: 'General'
            });
            if (insertError) throw insertError;
        }
        
        return true;
    } catch(e) {
        console.error("Error responding to org student invite:", e);
        return false;
    }
}

// ==============================
// ORGANIZATION MODE API FUNCTIONS
// ==============================

export interface OrgMembership {
    id: string;
    org_id: string;
    role: 'student' | 'teacher';
    status: string;
    joined_at: string;
    organization: {
        id: string;
        name: string;
        avatar_url?: string;
    };
}

// Get all organizations the user belongs to (as student or teacher)
export const getUserOrganizations = async (userId: string): Promise<OrgMembership[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const memberships: OrgMembership[] = [];

        // Fetch organizations where user is a student
        const { data: studentOrgs, error: studentError } = await supabase
            .from('org_students')
            .select(`
                id,
                org_id,
                status,
                joined_at,
                profiles!org_students_org_id_fkey (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .eq('student_id', userId)
            .eq('status', 'Active');

        if (!studentError && studentOrgs) {
            studentOrgs.forEach((item: any) => {
                if (item.profiles) {
                    memberships.push({
                        id: item.id,
                        org_id: item.org_id,
                        role: 'student',
                        status: item.status,
                        joined_at: item.joined_at,
                        organization: {
                            id: item.profiles.id,
                            name: item.profiles.full_name || 'Unknown Organization',
                            avatar_url: item.profiles.avatar_url,
                        },
                    });
                }
            });
        }

        // Fetch organizations where user is a teacher
        const { data: teacherOrgs, error: teacherError } = await supabase
            .from('org_teachers')
            .select(`
                id,
                org_id,
                status,
                joined_at,
                profiles!org_teachers_org_id_fkey (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .eq('teacher_id', userId)
            .eq('status', 'Active');

        if (!teacherError && teacherOrgs) {
            teacherOrgs.forEach((item: any) => {
                if (item.profiles) {
                    // Check if already added as student (user can be both)
                    const existingIndex = memberships.findIndex(m => m.org_id === item.org_id);
                    if (existingIndex === -1) {
                        memberships.push({
                            id: item.id,
                            org_id: item.org_id,
                            role: 'teacher',
                            status: item.status,
                            joined_at: item.joined_at,
                            organization: {
                                id: item.profiles.id,
                                name: item.profiles.full_name || 'Unknown Organization',
                                avatar_url: item.profiles.avatar_url,
                            },
                        });
                    }
                }
            });
        }

        return memberships;
    } catch (e) {
        console.error("Error fetching user organizations:", e);
        return [];
    }
};

// Get enrollments for a student within a specific organization
export const getOrgStudentEnrollments = async (studentId: string, orgId: string): Promise<Enrollment[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('enrollments')
            .select('*, tracks(*, track_modules(title))')
            .eq('user_id', studentId)
            .eq('org_id', orgId);

        if (error) {
            console.error("Error fetching org enrollments:", error);
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
            return { ...e, tracks: mappedTrack } as Enrollment;
        });
    } catch (e) {
        console.error("Error in getOrgStudentEnrollments:", e);
        return [];
    }
};

// Get bookings/sessions for a student within a specific organization
export const getOrgStudentBookings = async (studentId: string, orgId: string): Promise<Booking[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                mentors(
                    *,
                    profiles(full_name, avatar_url),
                    mentor_expertise(skill)
                ),
                mentor_availability(start_time)
            `)
            .eq('student_id', studentId)
            .eq('org_id', orgId);

        if (error) {
            console.error("Error fetching org bookings:", error);
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
        console.error("Error in getOrgStudentBookings:", e);
        return [];
    }
};

// Get students assigned to a teacher within an organization
export const getOrgTeacherStudents = async (teacherId: string, orgId: string): Promise<Profile[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        // Get all students in the organization
        const { data, error } = await supabase
            .from('org_students')
            .select(`
                student_id,
                status,
                grade,
                profiles!org_students_student_id_fkey (
                    id,
                    full_name,
                    avatar_url,
                    role,
                    grade,
                    school,
                    interests
                )
            `)
            .eq('org_id', orgId)
            .eq('status', 'Active');

        if (error) {
            console.error("Error fetching org teacher students:", error);
            return [];
        }

        return data
            .filter((item: any) => item.profiles)
            .map((item: any) => ({
                id: item.profiles.id,
                full_name: item.profiles.full_name || 'Unknown Student',
                avatar_url: item.profiles.avatar_url,
                role: item.profiles.role,
                grade: item.grade || item.profiles.grade,
                school: item.profiles.school,
                interests: item.profiles.interests,
            } as Profile));
    } catch (e) {
        console.error("Error in getOrgTeacherStudents:", e);
        return [];
    }
};

// Get sessions for a teacher within an organization
export const getOrgTeacherSessions = async (teacherId: string, orgId: string): Promise<Booking[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        // First get the mentor id for this teacher
        const { data: mentorData, error: mentorError } = await supabase
            .from('mentors')
            .select('id')
            .eq('user_id', teacherId)
            .single();

        if (mentorError || !mentorData) {
            console.error("Error fetching mentor id:", mentorError);
            return [];
        }

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles!bookings_student_id_fkey (
                    id,
                    full_name,
                    avatar_url
                ),
                mentor_availability(start_time)
            `)
            .eq('mentor_id', mentorData.id)
            .eq('org_id', orgId);

        if (error) {
            console.error("Error fetching org teacher sessions:", error);
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
            profiles: b.profiles ? {
                id: b.profiles.id,
                full_name: b.profiles.full_name || 'Unknown Student',
                avatar_url: b.profiles.avatar_url,
                role: 'student' as const,
            } : undefined
        } as Booking));
    } catch (e) {
        console.error("Error in getOrgTeacherSessions:", e);
        return [];
    }
};

// Get courses managed by teacher in organization
export const getOrgTeacherCourses = async (teacherId: string, orgId: string): Promise<Track[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('tracks')
            .select('*, track_modules(title, module_order)')
            .eq('creator_id', teacherId)
            .eq('org_id', orgId);

        if (error) {
            console.error("Error fetching org teacher courses:", error);
            return [];
        }

        return data.map((t: any) => ({
            id: t.id,
            title: t.title,
            level: t.level || 'All Levels',
            duration: t.duration_weeks ? `${t.duration_weeks} Weeks` : 'Self-paced',
            projects: 0,
            description: t.description || '',
            modules: t.track_modules?.sort((a: any, b: any) => a.module_order - b.module_order).map((m: any) => m.title) || [],
            image_url: t.image_url,
            status: t.status,
            creator_id: t.creator_id,
            price: t.price
        } as Track));
    } catch (e) {
        console.error("Error in getOrgTeacherCourses:", e);
        return [];
    }
};

// Get personal enrollments (excluding organization enrollments)
export const getPersonalEnrollments = async (userId: string): Promise<Enrollment[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('enrollments')
            .select('*, tracks(*, track_modules(title))')
            .eq('user_id', userId)
            .is('org_id', null);

        if (error) {
            console.error("Error fetching personal enrollments:", error);
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
            return { ...e, tracks: mappedTrack } as Enrollment;
        });
    } catch (e) {
        console.error("Error in getPersonalEnrollments:", e);
        return [];
    }
};

// Get personal bookings (excluding organization bookings)
export const getPersonalBookings = async (userId: string): Promise<Booking[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                mentors(
                    *,
                    profiles(full_name, avatar_url),
                    mentor_expertise(skill)
                ),
                mentor_availability(start_time)
            `)
            .eq('student_id', userId)
            .is('org_id', null);

        if (error) {
            console.error("Error fetching personal bookings:", error);
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
        console.error("Error in getPersonalBookings:", e);
        return [];
    }
};

// Get organization details
export const getOrganizationDetails = async (orgId: string): Promise<Profile | null> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', orgId)
            .single();

        if (error) {
            console.error("Error fetching organization details:", error);
            return null;
        }

        return data as Profile;
    } catch (e) {
        console.error("Error in getOrganizationDetails:", e);
        return null;
    }
};

