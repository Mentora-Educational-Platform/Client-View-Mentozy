const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllPossibleTables() {
    const tableNames = [
        'org_students',
        'org_teachers',
        'org_student_invitations',
        'org_teacher_invitations',
        'organisation_students',
        'organisation_members',
        'org_members',
        'courses',
        'tracks',
        'track_enrollments',
        'cohorts',
        'cohort_members',
        'cohort_students',
        'classes',
        'class_enrollments',
        'live_classes',
        'events',
        'org_announcements',
        'org_tasks'
    ];

    for (const t of tableNames) {
        try {
            const { data, error } = await supabase.from(t).select('*').limit(5);
            if (error) {
                // Table might not exist
            } else {
                console.log(`Table '${t}': exists, count=${data?.length}`);
                if (data && data.length > 0) {
                    console.log(`Sample row from '${t}':`, data[0]);
                }
            }
        } catch (e) {
            // ignore
        }
    }
}

checkAllPossibleTables();
