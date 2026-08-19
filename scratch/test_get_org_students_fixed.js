import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixedQuery() {
    const studentId = '32dedca2-6718-40fb-81d9-676b736f2111';
    
    // Simulate what getOrgStudents does:
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', [studentId]);

    console.log("Profiles query error:", error);
    console.log("Profiles query result:", profiles);

    if (profiles && profiles.length > 0) {
        const student = profiles[0];
        const mapped = {
            id: 'membership-sample-123',
            student_id: student.id,
            name: student.full_name || 'Student',
            email: student.email || 'No email',
            avatar: student.avatar_url,
            grade: student.grade || 'General',
            status: 'Active',
            joinDate: '2026-08-19',
            courses: 0,
            performance: 'A'
        };
        console.log("\nMapped student row for UI:", mapped);
    }
}

testFixedQuery();
