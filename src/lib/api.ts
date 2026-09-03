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
    attachment_url?: string;
    attachment_name?: string;
    attachment_type?: string;
    attachment_size?: number;
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
        // Try calling the Next.js backend Server Action / API Route first for secure execution
        try {
            const response = await fetch('/api/publish-course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courseId,
                    courseData,
                    modules,
                    creatorId,
                    status,
                    orgId: (courseData as any).org_id || null
                })
            });

            if (response.ok) {
                const resData = await response.json();
                if (resData && resData.success) {
                    return true;
                }
            } else if (response.status !== 404) {
                // If it's a real server error (not a 404 missing endpoint), report it
                const errData = await response.json().catch(() => ({}));
                console.error("Backend publish course error:", errData);
                toast.error(errData.error || "Failed to publish course via secure backend.");
                return false;
            }
        } catch (fetchErr) {
            // Fetch failed (e.g., connection refused because Next.js dev server is not running locally)
            console.warn("Backend server not reached. Falling back to direct client-side database writing...", fetchErr);
        }

        // --- Client-side fallback if backend is unavailable ---
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

        if ((courseData as any).org_id) {
            payload.org_id = (courseData as any).org_id;
        }

        let trackId = courseId;

        if (trackId) {
            const { error: updateError } = await supabase
                .from('tracks')
                .update(payload)
                .eq('id', trackId);

            if (updateError) {
                console.error("Error updating track:", updateError);
                toast.error(`Database Error: ${updateError.message}`);
                return false;
            }

            await supabase.from('track_modules').delete().eq('track_id', trackId);
        } else {
            const { data: trackRecords, error: trackError } = await supabase
                .from('tracks')
                .insert([payload])
                .select('id');

            if (trackError) {
                console.error("Error creating track:", trackError);
                toast.error(`Database Error: ${trackError.message}`);
                return false;
            }

            if (!trackRecords || trackRecords.length === 0) return false;
            trackId = trackRecords[0].id as number;
        }

        if (modules && modules.length > 0) {
            const moduleInserts = modules.map((mod, index) => ({
                track_id: trackId,
                title: mod.title || 'Untitled Module',
                module_order: index + 1,
                content: mod
            }));

            const { error: moduleError } = await supabase
                .from('track_modules')
                .insert(moduleInserts);

            if (moduleError) {
                console.error("Error creating modules:", moduleError);
                toast.error(`Database Error: ${moduleError.message}`);
                return false;
            }
        }

        // NOTE: Client-side bulk enrollment is stripped here to avoid RLS blockages on client-side inserts.
        // It is fully offloaded to the server-side action (publishCourseAction.ts).
        return true;

    } catch (e: any) {
        console.error("Unexpected error in createCourse:", e);
        return false;
    }
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
        console.log("getUserProfile START for userId:", userId);
        const supabase = getSupabase();
        if (!supabase) {
            console.warn("getUserProfile: No Supabase instance");
            return null;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching profile from Supabase:", error);
            return null;
        }

        console.log("getUserProfile SUCCESS for userId:", userId, data);
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

        const { data: trackData } = await supabase
            .from('tracks')
            .select('org_id')
            .eq('id', trackId)
            .single();

        const { error } = await supabase
            .from('enrollments')
            .insert({ 
                user_id: userId, 
                track_id: trackId,
                org_id: trackData?.org_id || null
            });

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

export const canUserMessageInOrg = async (userId: string, orgId: string, supabase: any): Promise<boolean> => {
    if (!userId || !orgId) return false;
    
    // Check if user is organisation owner
    const { data: orgData } = await supabase.from('organisations').select('owner_id').eq('id', orgId).single();
    if (orgData?.owner_id === userId || orgId === userId) return true;

    // Check if in org_students
    const { count: studentCount } = await supabase
        .from('org_students')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('student_id', userId);
    if (studentCount && studentCount > 0) return true;

    // Check if in org_teachers
    const { count: teacherCount } = await supabase
        .from('org_teachers')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('mentor_id', userId);
    if (teacherCount && teacherCount > 0) return true;

    return false;
};

export interface MessageAttachment {
    url: string;
    name: string;
    type: string;
    size: number;
}

export const ALLOWED_ATTACHMENT_EXTENSIONS = [
    'jpg', 'jpeg', 'png', 'webp', 'gif',
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'
];

export const BLOCKED_ATTACHMENT_EXTENSIONS = [
    'exe', 'bat', 'cmd', 'scr', 'js', 'ps1', 'apk', 'sh', 'vbs', 'msi', 'dll', 'com'
];

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const uploadMessageAttachment = async (
    file: File,
    userId: string,
    orgId?: string
): Promise<MessageAttachment | null> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return null;

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (BLOCKED_ATTACHMENT_EXTENSIONS.includes(ext) || !ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
            toast.error("This file type isn't supported.");
            return null;
        }

        if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
            toast.error("File is too large. Maximum attachment size is 10 MB.");
            return null;
        }

        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const scopeOrg = orgId || 'personal';
        const filePath = `message_attachments/${scopeOrg}/${userId}/${Date.now()}_${cleanName}`;

        // Upload file to Supabase Object Storage bucket 'avatars'. Pass 'image/png' for non-image files if bucket restricts MIME types
        const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
        const mimeToUse = isImage ? (file.type || 'image/png') : 'image/png';

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                contentType: mimeToUse,
                upsert: true
            });

        if (error || !data) {
            console.error("Storage upload error:", error);
            toast.error("Attachment upload failed. Please try again.");
            return null;
        }

        const { data: publicData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return {
            url: publicData.publicUrl,
            name: file.name,
            type: file.type || (isImage ? 'image/png' : 'application/pdf'),
            size: file.size
        };
    } catch (e) {
        console.error("Error in uploadMessageAttachment:", e);
        toast.error("Attachment upload failed.");
        return null;
    }
};

export const parseMessageAttachment = (msg: Message): { text: string; attachment?: MessageAttachment } => {
    let text = msg.content || '';
    let attachment: MessageAttachment | undefined = undefined;

    // 1. Check if content contains [ATTACHMENT:{...}] prefix and extract JSON attachment
    if (text.includes('[ATTACHMENT:')) {
        const startIndex = text.indexOf('[ATTACHMENT:');
        const endIndex = text.indexOf(']', startIndex);
        if (endIndex > startIndex + 12) {
            try {
                const jsonStr = text.substring(startIndex + 12, endIndex);
                const att = JSON.parse(jsonStr);
                attachment = {
                    url: att.url,
                    name: att.name || 'Attachment',
                    type: att.type || 'application/octet-stream',
                    size: Number(att.size) || 0
                };
            } catch (e) {
                console.error("Error parsing JSON attachment payload:", e);
            }
            // Strip out [ATTACHMENT:{...}] prefix cleanly from text message!
            text = (text.substring(0, startIndex) + text.substring(endIndex + 1)).trim();
        }
    }

    // 2. Direct attachment columns on message record
    if (!attachment && msg.attachment_url) {
        attachment = {
            url: msg.attachment_url,
            name: msg.attachment_name || 'Attachment',
            type: msg.attachment_type || 'application/octet-stream',
            size: Number(msg.attachment_size) || 0
        };
    }

    // 3. Legacy JSON format parsing safety check
    if (!attachment && text.trim().startsWith('{') && text.includes('"url"')) {
        try {
            const parsed = JSON.parse(text.trim());
            if (parsed && parsed.url) {
                attachment = {
                    url: parsed.url,
                    name: parsed.name || 'Attachment',
                    type: parsed.type || 'application/octet-stream',
                    size: Number(parsed.size) || 0
                };
                text = parsed.content || '';
            }
        } catch (e) {
            // Not valid JSON, treat as plain text
        }
    }

    return { text, attachment };
};

export const sendMessage = async (
    senderId: string,
    receiverId: string,
    content: string,
    orgId?: string,
    attachment?: MessageAttachment
): Promise<Message | null> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return null;

        // Security check: If orgId is passed, verify receiver is an authorized member of this organisation
        if (orgId) {
            const isAuthorized = await canUserMessageInOrg(receiverId, orgId, supabase);
            if (!isAuthorized) {
                console.error(`Security Violation: Recipient ${receiverId} is not a member of organisation ${orgId}`);
                return null;
            }
        }

        const insertPayload: any = {
            sender_id: senderId,
            receiver_id: receiverId,
            content: content || ''
        };

        if (attachment) {
            insertPayload.attachment_url = attachment.url;
            insertPayload.attachment_name = attachment.name;
            insertPayload.attachment_type = attachment.type;
            insertPayload.attachment_size = attachment.size;
        }

        const { data, error } = await supabase
            .from('messages')
            .insert(insertPayload)
            .select()
            .single();

        if (error) {
            // Fallback for DB without attachment columns: embed lightweight prefix ONLY if columns missing
            const rawContent = attachment
                ? `[ATTACHMENT:${JSON.stringify(attachment)}] ${content}`.trim()
                : content;

            const { data: fallbackData, error: fallbackError } = await supabase
                .from('messages')
                .insert({
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content: rawContent
                })
                .select()
                .single();

            if (fallbackError) {
                console.error("Error sending message:", fallbackError);
                return null;
            }

            return fallbackData as Message;
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

export const getOrgContacts = async (orgId: string, currentUserId: string): Promise<Contact[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !orgId) return [];

        // 1. Fetch active students for this organisation
        const { data: dbStudents } = await supabase
            .from('org_students')
            .select('student_id')
            .eq('org_id', orgId)
            .neq('status', 'removed')
            .neq('status', 'inactive');

        // 2. Fetch active teachers for this organisation
        const { data: dbTeachers } = await supabase
            .from('org_teachers')
            .select('mentor_id')
            .eq('org_id', orgId)
            .neq('status', 'removed')
            .neq('status', 'inactive');

        const studentIds = new Set((dbStudents || []).map((s: any) => s.student_id));
        const teacherIds = new Set((dbTeachers || []).map((t: any) => t.mentor_id));

        // 3. Fetch organisation owner ID if orgId is a parent organisation record
        const { data: orgData } = await supabase
            .from('organisations')
            .select('owner_id')
            .eq('id', orgId)
            .single();

        const ownerId = orgData?.owner_id || orgId;

        // Combine all authorized member IDs excluding current user
        const allMemberIds = Array.from(new Set([
            ...studentIds,
            ...teacherIds,
            ownerId
        ])).filter(id => id && id !== currentUserId);

        if (allMemberIds.length === 0) return [];

        // 4. Fetch profiles for authorised member IDs only
        const { data: profiles, error: profileErr } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .in('id', allMemberIds);

        if (profileErr || !profiles) {
            console.error("Error fetching org member profiles for messaging:", profileErr);
            return [];
        }

        return profiles.map((p: any) => {
            let memberRole = 'student';
            if (teacherIds.has(p.id) || p.id === ownerId || p.role === 'mentor' || p.role === 'admin') {
                memberRole = 'teacher';
            }
            return {
                id: p.id,
                name: p.full_name || 'Member',
                role: memberRole,
                avatar: p.avatar_url,
                status: 'online',
                lastMessage: memberRole === 'teacher' ? 'Teacher / Mentor' : 'Student'
            };
        });
    } catch (e) {
        console.error("Error fetching org contacts:", e);
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
        if(!supabase || !orgId) return [];
        
        // 1. Fetch org_students for the specific active organization
        const { data: dbOrgStudents, error: orgErr } = await supabase
            .from('org_students')
            .select('id, org_id, student_id, status, grade, joined_at')
            .eq('org_id', orgId);
            
        if (orgErr) {
            console.error("Error fetching org students:", orgErr);
            return [];
        }

        if (!dbOrgStudents || dbOrgStudents.length === 0) {
            return [];
        }

        // Filter active relationships
        const activeMemberships = dbOrgStudents.filter((s: any) => s.status !== 'removed' && s.status !== 'inactive');
        const studentIds = Array.from(new Set(activeMemberships.map((s: any) => s.student_id)));

        if (studentIds.length === 0) return [];

        // 2. Fetch profiles for these specific student IDs only
        const { data: profiles, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .in('id', studentIds);

        if (profileErr) {
            console.error("Error fetching student profiles for org:", profileErr);
        }

        const profilesMap: Record<string, any> = {};
        if (profiles) {
            profiles.forEach(p => {
                profilesMap[p.id] = p;
            });
        }

        return activeMemberships.map((s: any) => {
            const student = profilesMap[s.student_id];
            return {
                id: s.id,
                student_id: s.student_id,
                name: student?.full_name || 'Student',
                email: student?.email || 'No email',
                avatar: student?.avatar_url,
                grade: student?.grade || s.grade || 'General',
                status: s.status || 'Active',
                joinDate: s.joined_at ? new Date(s.joined_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                courses: 0,
                performance: 'A'
            };
        });
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

export const getOrgTracks = async (orgId: string): Promise<Track[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('tracks')
            .select(`
                *,
                track_modules(*)
            `)
            .eq('org_id', orgId)
            .order('id', { ascending: false });

        if (error) {
            console.error("Error fetching org tracks:", error);
            return [];
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            level: item.level || 'All Levels',
            duration: item.duration_weeks ? `${item.duration_weeks} Weeks` : 'Self-paced',
            projects: 0,
            description: item.description || '',
            modules: item.track_modules?.map((m: any) => m.content || { title: m.title }) || [],
        }));
    } catch (e) {
        console.error("Error in getOrgTracks:", e);
        return [];
    }
};

// ==========================================
// COMMUNITY & FORUMS TYPES & API FUNCTIONS
// ==========================================

export interface CommunityCategory {
    id: string;
    org_id?: string;
    name: string;
    slug: string;
    description?: string;
    created_at?: string;
}

export interface CommunityPost {
    id: string;
    org_id: string;
    category_id?: string;
    category_name?: string;
    category_slug?: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    author_role: 'student' | 'teacher' | 'mentor' | 'admin';
    title: string;
    content: string;
    is_pinned: boolean;
    is_locked: boolean;
    is_deleted: boolean;
    attachment_url?: string;
    attachment_name?: string;
    attachment_type?: string;
    attachment_size?: number;
    reply_count: number;
    like_count: number;
    user_has_liked?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface CommunityReply {
    id: string;
    post_id: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    author_role: 'student' | 'teacher' | 'mentor' | 'admin';
    content: string;
    is_accepted: boolean;
    is_deleted: boolean;
    attachment_url?: string;
    attachment_name?: string;
    attachment_type?: string;
    attachment_size?: number;
    created_at: string;
}

export const DEFAULT_COMMUNITY_CATEGORIES: CommunityCategory[] = [
    { id: 'cat-gen', name: 'General', slug: 'general', description: 'General organisation discussion & chat' },
    { id: 'cat-ann', name: 'Announcements', slug: 'announcements', description: 'Official announcements and updates' },
    { id: 'cat-qa', name: 'Questions & Answers', slug: 'qa', description: 'Ask questions, get help, and solve issues' },
    { id: 'cat-proj', name: 'Projects', slug: 'projects', description: 'Showcase projects, get feedback, and review code' },
    { id: 'cat-res', name: 'Resources', slug: 'resources', description: 'Shared learning materials, docs, and notes' }
];

export const getCommunityCategories = async (orgId: string): Promise<CommunityCategory[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !orgId) return DEFAULT_COMMUNITY_CATEGORIES;

        const { data, error } = await supabase
            .from('community_categories')
            .select('*')
            .eq('org_id', orgId)
            .order('created_at', { ascending: true });

        if (error || !data || data.length === 0) {
            return DEFAULT_COMMUNITY_CATEGORIES;
        }

        return data.map((item: any) => ({
            id: item.id,
            org_id: item.org_id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            created_at: item.created_at
        }));
    } catch (e) {
        console.error("Error in getCommunityCategories:", e);
        return DEFAULT_COMMUNITY_CATEGORIES;
    }
};

export const getCommunityPosts = async (
    orgId: string,
    categorySlug?: string,
    searchTerm?: string,
    sortOption: 'latest' | 'discussed' | 'liked' | 'pinned' = 'latest',
    currentUserId?: string
): Promise<CommunityPost[]> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !orgId) return [];

        // 1. Fetch raw posts for org_id
        let query = supabase
            .from('community_posts')
            .select('*')
            .eq('org_id', orgId)
            .eq('is_deleted', false);

        const { data: rawPosts, error } = await query;
        if (error || !rawPosts) {
            console.warn("Could not query community_posts from DB:", error?.message);
            return [];
        }

        if (rawPosts.length === 0) {
            return [];
        }

        // 2. Fetch categories map
        const categories = await getCommunityCategories(orgId);
        const categoryMap = new Map<string, CommunityCategory>();
        categories.forEach(c => categoryMap.set(c.id, c));
        categories.forEach(c => categoryMap.set(c.slug, c));

        // 3. Fetch author profiles, replies, reactions in parallel
        const postIds = rawPosts.map((p: any) => p.id);
        const authorIds = Array.from(new Set(rawPosts.map((p: any) => p.author_id)));

        const [profilesRes, repliesRes, reactionsRes] = await Promise.all([
            supabase.from('profiles').select('id, full_name, avatar_url, role').in('id', authorIds),
            supabase.from('community_replies').select('id, post_id').in('post_id', postIds).eq('is_deleted', false),
            supabase.from('community_reactions').select('id, post_id, user_id').in('post_id', postIds)
        ]);

        const profileMap = new Map<string, { name: string; avatar?: string; role: string }>();
        if (profilesRes.data) {
            profilesRes.data.forEach((p: any) => {
                profileMap.set(p.id, {
                    name: p.full_name || 'Member',
                    avatar: p.avatar_url || undefined,
                    role: p.role || 'student'
                });
            });
        }

        // Count replies per post
        const replyCountMap = new Map<string, number>();
        if (repliesRes.data) {
            repliesRes.data.forEach((r: any) => {
                replyCountMap.set(r.post_id, (replyCountMap.get(r.post_id) || 0) + 1);
            });
        }

        // Count likes per post and user liked status
        const likeCountMap = new Map<string, number>();
        const userLikedSet = new Set<string>();
        if (reactionsRes.data) {
            reactionsRes.data.forEach((r: any) => {
                likeCountMap.set(r.post_id, (likeCountMap.get(r.post_id) || 0) + 1);
                if (currentUserId && r.user_id === currentUserId) {
                    userLikedSet.add(r.post_id);
                }
            });
        }

        // Assemble CommunityPost objects
        let posts: CommunityPost[] = rawPosts.map((p: any) => {
            const author = profileMap.get(p.author_id) || { name: 'Organisation Member', role: 'student' };
            const cat = categoryMap.get(p.category_id) || categoryMap.get('general') || DEFAULT_COMMUNITY_CATEGORIES[0];

            return {
                id: p.id,
                org_id: p.org_id,
                category_id: p.category_id,
                category_name: cat.name,
                category_slug: cat.slug,
                author_id: p.author_id,
                author_name: author.name,
                author_avatar: author.avatar,
                author_role: (author.role as any) || 'student',
                title: p.title,
                content: p.content,
                is_pinned: Boolean(p.is_pinned),
                is_locked: Boolean(p.is_locked),
                is_deleted: Boolean(p.is_deleted),
                attachment_url: p.attachment_url || undefined,
                attachment_name: p.attachment_name || undefined,
                attachment_type: p.attachment_type || undefined,
                attachment_size: p.attachment_size ? Number(p.attachment_size) : undefined,
                reply_count: replyCountMap.get(p.id) || 0,
                like_count: likeCountMap.get(p.id) || 0,
                user_has_liked: userLikedSet.has(p.id),
                created_at: p.created_at,
                updated_at: p.updated_at
            };
        });

        // 4. Category Filtering
        if (categorySlug && categorySlug !== 'all') {
            posts = posts.filter(p => p.category_slug === categorySlug || p.category_id === categorySlug);
        }

        // 5. Search Term Filtering
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            posts = posts.filter(p => 
                p.title.toLowerCase().includes(term) || 
                p.content.toLowerCase().includes(term) ||
                p.author_name.toLowerCase().includes(term)
            );
        }

        // 6. Sorting (Pinned first, then selected sort)
        posts.sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) {
                return a.is_pinned ? -1 : 1;
            }
            if (sortOption === 'discussed') {
                return b.reply_count - a.reply_count;
            }
            if (sortOption === 'liked') {
                return b.like_count - a.like_count;
            }
            // Default latest
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return posts;
    } catch (e) {
        console.error("Error in getCommunityPosts:", e);
        return [];
    }
};

export const getCommunityPostDetails = async (
    postId: string,
    currentUserId?: string
): Promise<{ post: CommunityPost | null; replies: CommunityReply[] }> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !postId) return { post: null, replies: [] };

        // 1. Fetch target post
        const { data: p, error } = await supabase
            .from('community_posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error || !p) {
            return { post: null, replies: [] };
        }

        // 2. Fetch author profile
        const { data: authorProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, role')
            .eq('id', p.author_id)
            .single();

        // 3. Fetch replies
        const { data: rawReplies } = await supabase
            .from('community_replies')
            .select('*')
            .eq('post_id', postId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        // 4. Fetch reply author profiles
        const replyAuthorIds = Array.from(new Set((rawReplies || []).map((r: any) => r.author_id)));
        let replyProfileMap = new Map<string, { name: string; avatar?: string; role: string }>();

        if (replyAuthorIds.length > 0) {
            const { data: replyProfiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .in('id', replyAuthorIds);

            (replyProfiles || []).forEach((prof: any) => {
                replyProfileMap.set(prof.id, {
                    name: prof.full_name || 'Member',
                    avatar: prof.avatar_url || undefined,
                    role: prof.role || 'student'
                });
            });
        }

        // 5. Fetch reactions count & user reaction
        const { data: reactionsData } = await supabase
            .from('community_reactions')
            .select('user_id')
            .eq('post_id', postId);

        const likeCount = (reactionsData || []).length;
        const userHasLiked = currentUserId ? (reactionsData || []).some((r: any) => r.user_id === currentUserId) : false;

        const post: CommunityPost = {
            id: p.id,
            org_id: p.org_id,
            category_id: p.category_id,
            author_id: p.author_id,
            author_name: authorProfile?.full_name || 'Organisation Member',
            author_avatar: authorProfile?.avatar_url || undefined,
            author_role: (authorProfile?.role as any) || 'student',
            title: p.title,
            content: p.content,
            is_pinned: Boolean(p.is_pinned),
            is_locked: Boolean(p.is_locked),
            is_deleted: Boolean(p.is_deleted),
            attachment_url: p.attachment_url || undefined,
            attachment_name: p.attachment_name || undefined,
            attachment_type: p.attachment_type || undefined,
            attachment_size: p.attachment_size ? Number(p.attachment_size) : undefined,
            reply_count: (rawReplies || []).length,
            like_count: likeCount,
            user_has_liked: userHasLiked,
            created_at: p.created_at,
            updated_at: p.updated_at
        };

        const replies: CommunityReply[] = (rawReplies || []).map((r: any) => {
            const replyAuthor = replyProfileMap.get(r.author_id) || { name: 'Organisation Member', role: 'student' };

            return {
                id: r.id,
                post_id: r.post_id,
                author_id: r.author_id,
                author_name: replyAuthor.name,
                author_avatar: replyAuthor.avatar,
                author_role: (replyAuthor.role as any) || 'student',
                content: r.content,
                is_accepted: Boolean(r.is_accepted),
                is_deleted: Boolean(r.is_deleted),
                attachment_url: r.attachment_url || undefined,
                attachment_name: r.attachment_name || undefined,
                attachment_type: r.attachment_type || undefined,
                attachment_size: r.attachment_size ? Number(r.attachment_size) : undefined,
                created_at: r.created_at
            };
        });

        return { post, replies };
    } catch (e) {
        console.error("Error in getCommunityPostDetails:", e);
        return { post: null, replies: [] };
    }
};

export const createCommunityPost = async (
    orgId: string,
    categoryId: string,
    authorId: string,
    title: string,
    content: string,
    attachment?: MessageAttachment
): Promise<CommunityPost | null> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !orgId || !title.trim()) {
            console.error("createCommunityPost missing required parameters:", { orgId, authorId, title });
            return null;
        }

        // Diagnostic Session Logging
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log("SUPABASE AUTH STATE:", {
            authenticated: !!session?.user,
            userId: session?.user?.id ?? null,
            email: session?.user?.email ?? null,
        });
        console.log("SESSION ERROR:", sessionError);
        console.log("POST AUTHOR ID (passed):", authorId);
        console.log("POST ORG ID:", orgId);

        // Fetch current authenticated Supabase user ID to ensure author_id matches auth.uid()
        const { data: authUserData } = await supabase.auth.getUser();
        const currentAuthUserId = authUserData?.user?.id || session?.user?.id || authorId;

        console.log("RESOLVED AUTH USER ID:", currentAuthUserId);

        if (!currentAuthUserId) {
            console.error("User is not authenticated to create a community post.");
            return null;
        }

        // Validate if categoryId is a valid UUID; if not (e.g. fallback slug/string like 'cat-gen'), send null
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
        const validCategoryId = isValidUuid ? categoryId : null;

        const insertData: any = {
            org_id: orgId,
            category_id: validCategoryId,
            author_id: currentAuthUserId,
            title: title.trim(),
            content: content.trim() || ''
        };

        if (attachment) {
            insertData.attachment_url = attachment.url;
            insertData.attachment_name = attachment.name;
            insertData.attachment_type = attachment.type;
            insertData.attachment_size = attachment.size;
        }

        console.log("Submitting Community Post Insert Payload:", insertData);

        const { data, error } = await supabase
            .from('community_posts')
            .insert(insertData)
            .select()
            .single();

        if (error || !data) {
            console.error("Community post creation failed - Full Error Object:", error);
            console.error("Error Code:", error?.code, "Message:", error?.message, "Details:", error?.details, "Hint:", error?.hint);
            return null;
        }

        // Fetch author profile
        const { data: prof } = await supabase.from('profiles').select('full_name, avatar_url, role').eq('id', authorId).single();

        return {
            id: data.id,
            org_id: data.org_id,
            category_id: data.category_id,
            author_id: data.author_id,
            author_name: prof?.full_name || 'You',
            author_avatar: prof?.avatar_url || undefined,
            author_role: (prof?.role as any) || 'student',
            title: data.title,
            content: data.content,
            is_pinned: Boolean(data.is_pinned),
            is_locked: Boolean(data.is_locked),
            is_deleted: false,
            attachment_url: data.attachment_url || undefined,
            attachment_name: data.attachment_name || undefined,
            attachment_type: data.attachment_type || undefined,
            attachment_size: data.attachment_size ? Number(data.attachment_size) : undefined,
            reply_count: 0,
            like_count: 0,
            user_has_liked: false,
            created_at: data.created_at
        };
    } catch (e) {
        console.error("Error in createCommunityPost:", e);
        return null;
    }
};

export const createCommunityReply = async (
    postId: string,
    authorId: string,
    content: string,
    attachment?: MessageAttachment
): Promise<CommunityReply | null> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !postId || !authorId || !content.trim()) return null;

        const insertData: any = {
            post_id: postId,
            author_id: authorId,
            content: content.trim()
        };

        if (attachment) {
            insertData.attachment_url = attachment.url;
            insertData.attachment_name = attachment.name;
            insertData.attachment_type = attachment.type;
            insertData.attachment_size = attachment.size;
        }

        const { data, error } = await supabase
            .from('community_replies')
            .insert(insertData)
            .select()
            .single();

        if (error || !data) {
            console.error("Error creating community reply:", error);
            return null;
        }

        const { data: prof } = await supabase.from('profiles').select('full_name, avatar_url, role').eq('id', authorId).single();

        return {
            id: data.id,
            post_id: data.post_id,
            author_id: data.author_id,
            author_name: prof?.full_name || 'You',
            author_avatar: prof?.avatar_url || undefined,
            author_role: (prof?.role as any) || 'student',
            content: data.content,
            is_accepted: false,
            is_deleted: false,
            attachment_url: data.attachment_url || undefined,
            attachment_name: data.attachment_name || undefined,
            attachment_type: data.attachment_type || undefined,
            attachment_size: data.attachment_size ? Number(data.attachment_size) : undefined,
            created_at: data.created_at
        };
    } catch (e) {
        console.error("Error in createCommunityReply:", e);
        return null;
    }
};

export const toggleCommunityReaction = async (
    postId: string,
    userId: string,
    reactionType = 'like'
): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !postId || !userId) return false;

        // Check if already reacted
        const { data: existing } = await supabase
            .from('community_reactions')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .eq('reaction_type', reactionType)
            .single();

        if (existing) {
            // Delete reaction (unlike)
            await supabase.from('community_reactions').delete().eq('id', existing.id);
            return false;
        } else {
            // Insert reaction (like)
            await supabase.from('community_reactions').insert({
                post_id: postId,
                user_id: userId,
                reaction_type: reactionType
            });
            return true;
        }
    } catch (e) {
        console.error("Error in toggleCommunityReaction:", e);
        return false;
    }
};

export const togglePinCommunityPost = async (postId: string, isPinned: boolean): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !postId) return false;
        const { error } = await supabase.from('community_posts').update({ is_pinned: isPinned }).eq('id', postId);
        return !error;
    } catch (e) {
        return false;
    }
};

export const toggleLockCommunityPost = async (postId: string, isLocked: boolean): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !postId) return false;
        const { error } = await supabase.from('community_posts').update({ is_locked: isLocked }).eq('id', postId);
        return !error;
    } catch (e) {
        return false;
    }
};

export const toggleAcceptedCommunityReply = async (postId: string, replyId: string, isAccepted: boolean): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase || !postId || !replyId) return false;

        // Unmark previous accepted replies for this post first
        if (isAccepted) {
            await supabase.from('community_replies').update({ is_accepted: false }).eq('post_id', postId);
        }

        const { error } = await supabase.from('community_replies').update({ is_accepted: isAccepted }).eq('id', replyId);
        return !error;
    } catch (e) {
        return false;
    }
};

export const deleteCommunityPost = async (postId: string): Promise<boolean> => {
    try {
        console.log("DELETE REQUEST:", postId);
        const supabase = getSupabase();
        if (!supabase || !postId) return false;

        const { data, error } = await supabase
            .from('community_posts')
            .update({ is_deleted: true })
            .eq('id', postId)
            .select();

        console.log("DELETE RESULT:", {
            data,
            error,
        });

        if (error) {
            console.error("Community post delete failed - Error:", error);
            return false;
        }

        // When RLS blocks an update, Supabase returns error=null and data=[] (0 rows affected)
        if (data && data.length === 0) {
            console.warn("DELETE REJECTED BY RLS OR NOT FOUND: 0 rows were updated in community_posts.");
            return false;
        }

        return true;
    } catch (e) {
        console.error("Exception in deleteCommunityPost:", e);
        return false;
    }
};

export const deleteCommunityReply = async (replyId: string): Promise<boolean> => {
    try {
        console.log("DELETE REPLY REQUEST:", replyId);
        const supabase = getSupabase();
        if (!supabase || !replyId) return false;

        const { data, error } = await supabase
            .from('community_replies')
            .update({ is_deleted: true })
            .eq('id', replyId)
            .select();

        console.log("DELETE REPLY RESULT:", {
            data,
            error,
        });

        if (error) {
            console.error("Community reply delete failed - Error:", error);
            return false;
        }

        if (data && data.length === 0) {
            console.warn("DELETE REPLY REJECTED BY RLS OR NOT FOUND: 0 rows were updated in community_replies.");
            return false;
        }

        return true;
    } catch (e) {
        console.error("Exception in deleteCommunityReply:", e);
        return false;
    }
};

/* =========================================================================
   KRISHNAITE 18-DAY PRACTICAL AI COURSE TYPES & API
   ========================================================================= */

export type KrishnaiteApplicationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'needs_info' 
  | 'accepted' 
  | 'declined' 
  | 'waitlisted' 
  | 'invited';

export type KrishnaiteScholarshipType = 
  | 'standard_50' 
  | 'scholarship_75' 
  | 'aivantage_100';

export type KrishnaiteApplicationSource = 
  | 'general_application' 
  | 'aivantage_direct_invitation';

export interface KrishnaiteCourseApplication {
  id: string;
  application_id: string; // e.g. KGA-2026-XXXXXX
  user_id?: string;
  
  // Basic info
  full_name: string;
  preferred_name?: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  age?: string;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
  profile_photo_url?: string;

  // JSONB Data Payloads
  education_data?: Record<string, any>;
  professional_data?: Record<string, any>;
  ai_experience?: Record<string, any>;
  learning_goals?: Record<string, any>;
  skills?: Record<string, any>;
  automation_interests?: Record<string, any>;
  creative_interests?: Record<string, any>;
  learning_commitment?: Record<string, any>;
  motivation_data?: Record<string, any>;
  community_data?: Record<string, any>;
  portfolio_data?: Record<string, any>;
  device_data?: Record<string, any>;
  acknowledgements?: Record<string, any>;

  // Source & Status
  source: KrishnaiteApplicationSource;
  status: KrishnaiteApplicationStatus;

  // Financial & Scholarship (server-anchored)
  scholarship_type: KrishnaiteScholarshipType;
  scholarship_percentage: number;
  course_value: number;
  discount_amount: number;
  payable_amount: number;

  // Admin & Progress
  current_step: number;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface KrishnaiteApplicationMessage {
  id: string;
  application_id: string;
  sender_user_id?: string;
  sender_type: 'admin' | 'applicant' | 'system';
  sender_name?: string;
  message: string;
  attachments?: any[];
  created_at: string;
}

export interface KrishnaiteApplicationEvent {
  id: string;
  application_id: string;
  actor_user_id?: string;
  event_type: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Local storage key fallback
const LOCAL_STORAGE_KGA_DRAFT_KEY = 'mentozy_krishnaite_draft_v1';
const LOCAL_STORAGE_KGA_APPS_KEY = 'mentozy_krishnaite_apps_local_v1';
const LOCAL_STORAGE_KGA_MSGS_KEY = 'mentozy_krishnaite_msgs_local_v1';
const LOCAL_STORAGE_KGA_EVENTS_KEY = 'mentozy_krishnaite_events_local_v1';

export function generateKrishnaiteApplicationId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KGA-2026-${rand}`;
}

/**
 * Fetch application for the currently logged-in user
 */
export async function getKrishnaiteApplicationByUserId(userId: string): Promise<KrishnaiteCourseApplication | null> {
  const supabase = getSupabase();
  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('krishnaite_course_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return data as KrishnaiteCourseApplication;
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB fetch by user error, checking local store:', err);
    }
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_APPS_KEY);
    if (raw) {
      const list: KrishnaiteCourseApplication[] = JSON.parse(raw);
      const found = list.find(a => a.user_id === userId);
      if (found) return found;
    }
    // Check active draft
    const rawDraft = localStorage.getItem(LOCAL_STORAGE_KGA_DRAFT_KEY);
    if (rawDraft) {
      const draft = JSON.parse(rawDraft);
      if (draft && (!draft.user_id || draft.user_id === userId)) return draft;
    }
  } catch (e) {
    console.warn('[Krishnaite API] Local storage read error:', e);
  }

  return null;
}

/**
 * Fetch application by unique internal ID (UUID) or public application_id (KGA-2026-XXXXXX)
 */
export async function getKrishnaiteApplicationById(idOrAppId: string): Promise<KrishnaiteCourseApplication | null> {
  const supabase = getSupabase();
  if (supabase && idOrAppId) {
    try {
      // Check by UUID id or application_id
      const isUUID = idOrAppId.includes('-');
      const query = supabase.from('krishnaite_course_applications').select('*');
      
      const { data, error } = await (isUUID && idOrAppId.length > 20
        ? query.or(`id.eq.${idOrAppId},application_id.eq.${idOrAppId}`)
        : query.eq('application_id', idOrAppId)
      ).maybeSingle();

      if (!error && data) {
        return data as KrishnaiteCourseApplication;
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB fetch by ID error, checking local store:', err);
    }
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_APPS_KEY);
    if (raw) {
      const list: KrishnaiteCourseApplication[] = JSON.parse(raw);
      const found = list.find(a => a.id === idOrAppId || a.application_id === idOrAppId);
      if (found) return found;
    }
    const rawDraft = localStorage.getItem(LOCAL_STORAGE_KGA_DRAFT_KEY);
    if (rawDraft) {
      const draft = JSON.parse(rawDraft);
      if (draft && (draft.id === idOrAppId || draft.application_id === idOrAppId)) return draft;
    }
  } catch (e) {
    console.warn('[Krishnaite API] Local storage read error:', e);
  }

  return null;
}

/**
 * Save draft application (Step changes, autosave)
 */
export async function saveKrishnaiteDraftApplication(
  data: Partial<KrishnaiteCourseApplication>,
  userId?: string
): Promise<KrishnaiteCourseApplication> {
  const supabase = getSupabase();
  
  // Mandatory server-side anchor rules for general applications:
  const appId = data.application_id || generateKrishnaiteApplicationId();
  const draftPayload: Partial<KrishnaiteCourseApplication> = {
    ...data,
    application_id: appId,
    user_id: userId || data.user_id,
    source: data.source || 'general_application',
    status: data.status || 'draft',
    scholarship_type: data.scholarship_type || 'standard_50',
    scholarship_percentage: data.scholarship_percentage || 50,
    course_value: 10000,
    discount_amount: 5000,
    payable_amount: 5000,
    updated_at: new Date().toISOString()
  };

  // 1. Save to Local Storage always as instant resilient backup
  try {
    localStorage.setItem(LOCAL_STORAGE_KGA_DRAFT_KEY, JSON.stringify(draftPayload));
  } catch (e) {
    console.warn('[Krishnaite API] localStorage save error:', e);
  }

  // 2. Persist to DB if logged in and Supabase available
  if (supabase && userId) {
    try {
      // Check if existing record exists
      const { data: existing } = await supabase
        .from('krishnaite_course_applications')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { data: updated, error } = await supabase
          .from('krishnaite_course_applications')
          .update(draftPayload)
          .eq('id', existing.id)
          .select()
          .single();

        if (!error && updated) {
          return updated as KrishnaiteCourseApplication;
        }
      } else {
        const { data: inserted, error } = await supabase
          .from('krishnaite_course_applications')
          .insert({
            ...draftPayload,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!error && inserted) {
          return inserted as KrishnaiteCourseApplication;
        }
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB draft save error, continuing with local draft:', err);
    }
  }

  return {
    id: data.id || `local-${Date.now()}`,
    created_at: data.created_at || new Date().toISOString(),
    ...draftPayload
  } as KrishnaiteCourseApplication;
}

/**
 * Submit final application
 */
export async function submitKrishnaiteApplication(
  fullData: Partial<KrishnaiteCourseApplication>,
  userId?: string
): Promise<KrishnaiteCourseApplication> {
  const supabase = getSupabase();
  const submittedAt = new Date().toISOString();
  const appId = fullData.application_id || generateKrishnaiteApplicationId();

  // Enforce server-side 50% scholarship security:
  const finalPayload: Partial<KrishnaiteCourseApplication> = {
    ...fullData,
    application_id: appId,
    user_id: userId || fullData.user_id,
    source: 'general_application',
    status: 'under_review',
    scholarship_type: 'standard_50',
    scholarship_percentage: 50,
    course_value: 10000,
    discount_amount: 5000,
    payable_amount: 5000,
    submitted_at: submittedAt,
    updated_at: submittedAt
  };

  let savedRecord: KrishnaiteCourseApplication | null = null;

  if (supabase && userId) {
    try {
      const { data: existing } = await supabase
        .from('krishnaite_course_applications')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { data: updated, error } = await supabase
          .from('krishnaite_course_applications')
          .update(finalPayload)
          .eq('id', existing.id)
          .select()
          .single();

        if (!error && updated) savedRecord = updated as KrishnaiteCourseApplication;
      } else {
        const { data: inserted, error } = await supabase
          .from('krishnaite_course_applications')
          .insert({
            ...finalPayload,
            created_at: submittedAt
          })
          .select()
          .single();

        if (!error && inserted) savedRecord = inserted as KrishnaiteCourseApplication;
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB submit error, saving to local store:', err);
    }
  }

  if (!savedRecord) {
    savedRecord = {
      id: fullData.id || `kga-${Date.now()}`,
      created_at: fullData.created_at || submittedAt,
      ...finalPayload
    } as KrishnaiteCourseApplication;
  }

  // Update local storage
  try {
    localStorage.removeItem(LOCAL_STORAGE_KGA_DRAFT_KEY);
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_APPS_KEY);
    const list: KrishnaiteCourseApplication[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(a => a.id === savedRecord!.id || a.application_id === savedRecord!.application_id);
    if (idx >= 0) {
      list[idx] = savedRecord;
    } else {
      list.unshift(savedRecord);
    }
    localStorage.setItem(LOCAL_STORAGE_KGA_APPS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[Krishnaite API] Local storage update error:', e);
  }

  // Log Audit Event
  logKrishnaiteApplicationEvent(
    savedRecord.id,
    'APPLICATION_SUBMITTED',
    {
      application_id: savedRecord.application_id,
      applicant_email: savedRecord.email,
      scholarship_percentage: 50,
      payable_amount: 5000
    },
    userId
  ).catch(err => console.warn('[Krishnaite API] Audit event log skipped:', err));

  return savedRecord;
}

/**
 * Fetch all applications for Admin Station
 */
export async function getAllKrishnaiteApplications(): Promise<KrishnaiteCourseApplication[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('krishnaite_course_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as KrishnaiteCourseApplication[];
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB fetch all applications error, checking local store:', err);
    }
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_APPS_KEY);
    if (raw) {
      return JSON.parse(raw) as KrishnaiteCourseApplication[];
    }
  } catch (e) {
    console.warn('[Krishnaite API] Local store read error:', e);
  }

  return [];
}

/**
 * Update application status and scholarship (Admin Workstation)
 */
export async function updateKrishnaiteApplicationStatus(
  id: string,
  status: KrishnaiteApplicationStatus,
  updates?: {
    adminNotes?: string;
    scholarshipPercentage?: number;
    scholarshipType?: KrishnaiteScholarshipType;
    payableAmount?: number;
    reviewedBy?: string;
  }
): Promise<KrishnaiteCourseApplication | null> {
  const supabase = getSupabase();
  const updatePayload: Record<string, any> = {
    status,
    updated_at: new Date().toISOString()
  };

  if (updates?.adminNotes !== undefined) updatePayload.admin_notes = updates.adminNotes;
  if (updates?.reviewedBy !== undefined) {
    updatePayload.reviewed_by = updates.reviewedBy;
    updatePayload.reviewed_at = new Date().toISOString();
  }
  if (updates?.scholarshipPercentage !== undefined) {
    updatePayload.scholarship_percentage = updates.scholarshipPercentage;
    updatePayload.discount_amount = (10000 * updates.scholarshipPercentage) / 100;
    updatePayload.payable_amount = updates.payableAmount ?? (10000 - updatePayload.discount_amount);
  }
  if (updates?.scholarshipType !== undefined) {
    updatePayload.scholarship_type = updates.scholarshipType;
  }

  let updatedApp: KrishnaiteCourseApplication | null = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('krishnaite_course_applications')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        updatedApp = data as KrishnaiteCourseApplication;
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB update error, updating local store:', err);
    }
  }

  // Update local storage fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_APPS_KEY);
    if (raw) {
      const list: KrishnaiteCourseApplication[] = JSON.parse(raw);
      const idx = list.findIndex(a => a.id === id || a.application_id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updatePayload };
        updatedApp = list[idx];
        localStorage.setItem(LOCAL_STORAGE_KGA_APPS_KEY, JSON.stringify(list));
      }
    }
  } catch (e) {
    console.warn('[Krishnaite API] Local storage update error:', e);
  }

  // Log Audit Event
  if (updatedApp) {
    const eventType = 
      status === 'accepted' ? 'APPLICATION_ACCEPTED' :
      status === 'declined' ? 'APPLICATION_DECLINED' :
      status === 'needs_info' ? 'NEEDS_INFO_REQUESTED' :
      status === 'waitlisted' ? 'APPLICATION_WAITLISTED' :
      status === 'invited' ? 'AIVANTAGE_WINNER_DESIGNATED' : 'STATUS_CHANGED';

    logKrishnaiteApplicationEvent(
      updatedApp.id,
      eventType,
      {
        new_status: status,
        scholarship_percentage: updatedApp.scholarship_percentage,
        payable_amount: updatedApp.payable_amount,
        admin_notes: updates?.adminNotes
      },
      updates?.reviewedBy
    ).catch(e => console.warn('[Krishnaite API] Audit log skipped:', e));
  }

  return updatedApp;
}

/**
 * Admin-controlled Direct AIvantage Winner Designation
 */
export async function createAIvantageWinnerInvitation(winnerData: {
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
  adminUserId?: string;
}): Promise<KrishnaiteCourseApplication> {
  const supabase = getSupabase();
  const appId = generateKrishnaiteApplicationId();
  const now = new Date().toISOString();

  const winnerPayload: Partial<KrishnaiteCourseApplication> = {
    application_id: appId,
    full_name: winnerData.fullName,
    email: winnerData.email,
    phone: winnerData.phone,
    source: 'aivantage_direct_invitation',
    status: 'invited',
    scholarship_type: 'aivantage_100',
    scholarship_percentage: 100,
    course_value: 10000,
    discount_amount: 10000,
    payable_amount: 0,
    admin_notes: winnerData.notes,
    reviewed_by: winnerData.adminUserId,
    reviewed_at: now,
    submitted_at: now,
    created_at: now,
    updated_at: now
  };

  let createdRecord: KrishnaiteCourseApplication | null = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('krishnaite_course_applications')
        .insert(winnerPayload)
        .select()
        .single();

      if (!error && data) {
        createdRecord = data as KrishnaiteCourseApplication;
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB winner insert error, saving to local store:', err);
    }
  }

  if (!createdRecord) {
    createdRecord = {
      id: `winner-${Date.now()}`,
      ...winnerPayload
    } as KrishnaiteCourseApplication;
  }

  // Update local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_APPS_KEY);
    const list: KrishnaiteCourseApplication[] = raw ? JSON.parse(raw) : [];
    list.unshift(createdRecord);
    localStorage.setItem(LOCAL_STORAGE_KGA_APPS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[Krishnaite API] Local storage error:', e);
  }

  // Log Audit Event
  logKrishnaiteApplicationEvent(
    createdRecord.id,
    'AIVANTAGE_WINNER_DESIGNATED',
    {
      application_id: createdRecord.application_id,
      email: createdRecord.email,
      source: 'aivantage_direct_invitation',
      scholarship: '100% Free'
    },
    winnerData.adminUserId
  ).catch(e => console.warn('[Krishnaite API] Audit log skipped:', e));

  return createdRecord;
}

/**
 * Messages & Communications Thread for Krishnaite Applications
 */
export async function getKrishnaiteApplicationMessages(appId: string): Promise<KrishnaiteApplicationMessage[]> {
  const supabase = getSupabase();
  if (supabase && appId) {
    try {
      const { data, error } = await supabase
        .from('krishnaite_application_messages')
        .select('*')
        .eq('application_id', appId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as KrishnaiteApplicationMessage[];
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB messages fetch error, checking local store:', err);
    }
  }

  // Fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_MSGS_KEY);
    if (raw) {
      const map: Record<string, KrishnaiteApplicationMessage[]> = JSON.parse(raw);
      return map[appId] || [];
    }
  } catch (e) {
    console.warn('[Krishnaite API] Local storage read error:', e);
  }

  return [];
}

export async function sendKrishnaiteApplicationMessage(
  appId: string,
  message: string,
  senderType: 'admin' | 'applicant' | 'system',
  senderName?: string,
  senderUserId?: string
): Promise<KrishnaiteApplicationMessage> {
  const supabase = getSupabase();
  const msgPayload = {
    application_id: appId,
    message,
    sender_type: senderType,
    sender_name: senderName || (senderType === 'admin' ? 'Krishnaite Admissions' : 'Applicant'),
    sender_user_id: senderUserId,
    created_at: new Date().toISOString()
  };

  let savedMsg: KrishnaiteApplicationMessage | null = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('krishnaite_application_messages')
        .insert(msgPayload)
        .select()
        .single();

      if (!error && data) {
        savedMsg = data as KrishnaiteApplicationMessage;
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB message insert error, storing locally:', err);
    }
  }

  if (!savedMsg) {
    savedMsg = {
      id: `msg-${Date.now()}`,
      ...msgPayload
    } as KrishnaiteApplicationMessage;
  }  // Local storage fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_MSGS_KEY);
    const map: Record<string, KrishnaiteApplicationMessage[]> = raw ? JSON.parse(raw) : {};
    if (!map[appId]) map[appId] = [];
    map[appId].push(savedMsg);
    localStorage.setItem(LOCAL_STORAGE_KGA_MSGS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[Krishnaite API] Local storage write error:', e);
  }

  // Log Audit Event
  const eventType = senderType === 'applicant' ? 'APPLICANT_RESPONDED' : 'ADMIN_NOTE_ADDED';
  logKrishnaiteApplicationEvent(
    appId,
    eventType,
    { message_snippet: message.substring(0, 100), sender_type: senderType },
    senderUserId
  ).catch(e => console.warn('[Krishnaite API] Audit log skipped:', e));

  return savedMsg;
}

/**
 * Audit Events Logger & Fetcher
 */
export async function getKrishnaiteApplicationEvents(appId: string): Promise<KrishnaiteApplicationEvent[]> {
  const supabase = getSupabase();
  if (supabase && appId) {
    try {
      const { data, error } = await supabase
        .from('krishnaite_application_events')
        .select('*')
        .eq('application_id', appId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as KrishnaiteApplicationEvent[];
      }
    } catch (err) {
      console.warn('[Krishnaite API] DB events fetch error, checking local store:', err);
    }
  }

  // Fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_EVENTS_KEY);
    if (raw) {
      const map: Record<string, KrishnaiteApplicationEvent[]> = JSON.parse(raw);
      return map[appId] || [];
    }
  } catch (e) {
    console.warn('[Krishnaite API] Local storage read error:', e);
  }

  return [];
}

export async function logKrishnaiteApplicationEvent(
  appId: string,
  eventType: string,
  metadata: Record<string, any> = {},
  actorUserId?: string
): Promise<void> {
  const supabase = getSupabase();
  const eventPayload = {
    application_id: appId,
    event_type: eventType,
    metadata,
    actor_user_id: actorUserId,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      await supabase.from('krishnaite_application_events').insert(eventPayload);
    } catch (err) {
      console.warn('[Krishnaite API] DB event insert error:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KGA_EVENTS_KEY);
    const map: Record<string, KrishnaiteApplicationEvent[]> = raw ? JSON.parse(raw) : {};
    if (!map[appId]) map[appId] = [];
    map[appId].unshift({
      id: `evt-${Date.now()}`,
      ...eventPayload
    });
    localStorage.setItem(LOCAL_STORAGE_KGA_EVENTS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[Krishnaite API] Local storage event write error:', e);
  }
}

// ==========================================
// MENTOZY ORGANIZATIONS MANAGEMENT
// ==========================================

export interface MentozyOrganization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  owner_id?: string;
  owner_email?: string;
  founder_name?: string;
  org_type?: string;
  status: 'active' | 'pending' | 'suspended';
  teacher_count?: number;
  student_count?: number;
  course_count?: number;
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

const LOCAL_STORAGE_ORGS_KEY = 'mentozy_orgs_local_v1';

const DEFAULT_DEMO_ORGS: MentozyOrganization[] = [
  {
    id: 'org-krishnaite-academy',
    name: 'Krishnaite Academy',
    slug: 'krishnaite-academy',
    description: 'Official Krishnaite practical AI and high-impact technology learning organization.',
    owner_email: 'founder@krishnaite.com',
    founder_name: 'Krishnaite Foundation',
    org_type: 'Academy / Tech Institute',
    status: 'active',
    teacher_count: 8,
    student_count: 142,
    course_count: 4,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    notes: 'Official Partner Academy'
  },
  {
    id: 'org-springfield-tech',
    name: 'Apex Coding Institute',
    slug: 'apex-coding-institute',
    description: 'Premier regional coding and developer training institute.',
    owner_email: 'admin@apexcoding.edu',
    founder_name: 'Prof. Rajesh Verma',
    org_type: 'Coaching / Institute',
    status: 'active',
    teacher_count: 4,
    student_count: 58,
    course_count: 2,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    notes: 'Approved partnership via direct admissions'
  }
];

export async function getAllOrganizations(): Promise<MentozyOrganization[]> {
  const supabase = getSupabase();
  let dbOrgs: MentozyOrganization[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Fetch teacher and student counts for each org
        const enriched = await Promise.all(data.map(async (org: any) => {
          let teacherCount = 0;
          let studentCount = 0;
          try {
            const { count: tCount } = await supabase
              .from('org_teachers')
              .select('*', { count: 'exact', head: true })
              .eq('org_id', org.id);
            teacherCount = tCount || 0;
          } catch (e) { /* ignore */ }

          try {
            const { count: sCount } = await supabase
              .from('org_students')
              .select('*', { count: 'exact', head: true })
              .eq('org_id', org.id);
            studentCount = sCount || 0;
          } catch (e) { /* ignore */ }

          return {
            id: org.id,
            name: org.name,
            slug: org.slug || org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: org.description,
            logo_url: org.logo_url,
            owner_id: org.owner_id,
            owner_email: org.owner_email || 'admin@' + (org.slug || 'org') + '.com',
            founder_name: org.founder_name || 'Organization Admin',
            org_type: org.org_type || 'Educational Institute',
            status: (org.status as any) || 'active',
            teacher_count: teacherCount,
            student_count: studentCount,
            created_at: org.created_at || new Date().toISOString(),
            updated_at: org.updated_at,
            notes: org.notes
          };
        }));
        dbOrgs = enriched;
      }
    } catch (err) {
      console.warn('[Orgs API] DB fetch warning:', err);
    }
  }

  // Local storage fallback & merge
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORGS_KEY);
    if (raw) {
      const localList: MentozyOrganization[] = JSON.parse(raw);
      const dbIds = new Set(dbOrgs.map(o => o.id));
      const filteredLocal = localList.filter(o => !dbIds.has(o.id));
      return [...dbOrgs, ...filteredLocal];
    } else {
      localStorage.setItem(LOCAL_STORAGE_ORGS_KEY, JSON.stringify(DEFAULT_DEMO_ORGS));
      if (dbOrgs.length === 0) {
        return DEFAULT_DEMO_ORGS;
      }
    }
  } catch (e) {
    console.warn('[Orgs API] Local storage read error:', e);
  }

  return dbOrgs.length > 0 ? dbOrgs : DEFAULT_DEMO_ORGS;
}

export async function getOrganizationById(id: string): Promise<MentozyOrganization | null> {
  const all = await getAllOrganizations();
  return all.find(o => o.id === id || o.slug === id) || null;
}

export async function provisionOrganization(payload: {
  name: string;
  email: string;
  password?: string;
  orgType: string;
  description?: string;
  founderName?: string;
  notes?: string;
  adminUserId?: string;
}): Promise<MentozyOrganization> {
  const supabase = getSupabase();
  const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const orgId = `org-${slug}-${Date.now().toString(36)}`;

  const newOrg: MentozyOrganization = {
    id: orgId,
    name: payload.name,
    slug,
    description: payload.description || `${payload.name} Educational Organization`,
    owner_email: payload.email,
    founder_name: payload.founderName || 'Administrator',
    org_type: payload.orgType,
    status: 'active',
    teacher_count: 0,
    student_count: 0,
    course_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: payload.notes || 'Provisioned by Admin'
  };

  // 1. Attempt database insert if available
  if (supabase) {
    try {
      await supabase.from('organisations').upsert({
        id: orgId,
        name: payload.name,
        slug,
        description: payload.description,
        owner_id: payload.adminUserId,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('[Orgs API] DB organisation upsert skipped:', err);
    }
  }

  // 2. Persist to Local Storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORGS_KEY);
    const list: MentozyOrganization[] = raw ? JSON.parse(raw) : DEFAULT_DEMO_ORGS;
    list.unshift(newOrg);
    localStorage.setItem(LOCAL_STORAGE_ORGS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[Orgs API] Local storage org write error:', e);
  }

  return newOrg;
}

export async function updateOrganizationStatus(
  id: string,
  status: 'active' | 'pending' | 'suspended',
  notes?: string
): Promise<MentozyOrganization | null> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      await supabase
        .from('organisations')
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      console.warn('[Orgs API] DB status update skipped:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORGS_KEY);
    if (raw) {
      const list: MentozyOrganization[] = JSON.parse(raw);
      const idx = list.findIndex(o => o.id === id);
      if (idx !== -1) {
        list[idx].status = status;
        if (notes !== undefined) list[idx].notes = notes;
        list[idx].updated_at = new Date().toISOString();
        localStorage.setItem(LOCAL_STORAGE_ORGS_KEY, JSON.stringify(list));
        return list[idx];
      }
    }
  } catch (e) {
    console.warn('[Orgs API] Local storage status update error:', e);
  }

  return null;
}
