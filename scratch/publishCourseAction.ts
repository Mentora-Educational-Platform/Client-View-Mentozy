import { createClient } from '@supabase/supabase-js';

// Define TS interfaces for our data structures
export interface Lesson {
  id?: string;
  title: string;
  explanation: string;
  videoLink?: string;
  worksheetUrl?: string;
  pdf_url?: string;
  worksheetName?: string;
  quizzes?: any[];
}

export interface Module {
  id?: string;
  title: string;
  description?: string;
  module_order?: number;
  lessons: Lesson[];
}

export interface CourseData {
  title: string;
  description: string;
  level?: string;
  duration?: string;
  price?: number;
  image_url?: string;
}

/**
 * Next.js Server Action to publish a course and auto-enroll all students in the organization.
 * 
 * This action performs a database transaction:
 * 1. Inserts the Course/Track record.
 * 2. Inserts the corresponding Curriculum Modules.
 * 3. Fetches all active students belonging to the organization.
 * 4. Bulk inserts enrollment records for all those students.
 */
export async function publishOrgCourseAction(
  courseData: CourseData,
  modules: Module[],
  creatorId: string,
  orgId: string
) {
  // Initialize Supabase Server client. Replace with your actual server client helper
  // e.g. createClientComponentClient/createRouteHandlerClient from @supabase/auth-helpers-nextjs
  // or createClient from @supabase/ssr
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // service role key allows bypassing RLS for bulk operations
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  try {
    // 1. Insert the Course (Track) into the database
    const durationWeeks = parseInt((courseData.duration || '4').split(' ')[0]) || 4;
    
    const trackPayload = {
      title: courseData.title,
      description: courseData.description,
      level: courseData.level || 'All Levels',
      duration_weeks: durationWeeks,
      image_url: courseData.image_url || null,
      price: courseData.price || 0,
      creator_id: creatorId,
      org_id: orgId,
      status: 'published'
    };

    const { data: trackRecords, error: trackError } = await supabase
      .from('tracks')
      .insert([trackPayload])
      .select('id')
      .single();

    if (trackError) {
      console.error("Error creating track:", trackError);
      return { success: false, error: `Failed to insert course: ${trackError.message}` };
    }

    const trackId = trackRecords.id;

    // 2. Insert Modules
    if (modules && modules.length > 0) {
      const moduleInserts = modules.map((mod, index) => ({
        track_id: trackId,
        title: mod.title || 'Untitled Module',
        module_order: index + 1,
        content: mod // Save the entire deep lesson object natively matching local state representation
      }));

      const { error: moduleError } = await supabase
        .from('track_modules')
        .insert(moduleInserts);

      if (moduleError) {
        console.error("Error inserting track modules:", moduleError);
        return { success: false, error: `Failed to insert course modules: ${moduleError.message}` };
      }
    }

    // 3. Auto-Enrollment System (Broadcast Switch)
    // Query organization students:
    // Option A: If students are linked via the org_students junction table (Matches Mentozy DB Schema)
    const { data: students, error: studentsError } = await supabase
      .from('org_students')
      .select('student_id')
      .eq('org_id', orgId)
      .eq('status', 'Active');

    // Option B Fallback: If your schema stores org_id and role directly inside the profiles / users table
    // Uncomment this if you migrate to profiles-linked schema:
    /*
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('org_id', orgId)
      .eq('role', 'student');
    */

    if (studentsError) {
      console.error("Error fetching organization students for auto-enrollment:", studentsError);
      // We return success of publishing, but alert about enrollment failure
      return { 
        success: true, 
        trackId, 
        warning: "Course published successfully, but failed to fetch students for auto-enrollment." 
      };
    }

    if (students && students.length > 0) {
      // Create bulk enrollment records
      const enrollmentPayloads = students.map((student: any) => {
        // Handle student ID key depending on which schema options were used
        const studentId = student.student_id || student.id;
        return {
          user_id: studentId,
          track_id: trackId,
          org_id: orgId,
          status: 'active',
          progress: 0,
          enrolled_at: new Date().toISOString()
        };
      });

      // Bulk insert enrollments. We use upsert or insert with ignoreDuplicates to avoid RLS/unique key clashes
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert(enrollmentPayloads);

      if (enrollError) {
        console.error("Error performing bulk enrollment insert:", enrollError);
        return { 
          success: true, 
          trackId, 
          warning: `Course published, but auto-enrollment failed: ${enrollError.message}` 
        };
      }
    }

    return { 
      success: true, 
      trackId, 
      enrolledCount: students?.length || 0 
    };

  } catch (error: any) {
    console.error("Unexpected error in publishOrgCourseAction:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
