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

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase configs in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
    if (pError) {
        console.error("Error fetching profiles:", pError);
    } else {
        console.log("Profile structure:", profiles && profiles.length > 0 ? Object.keys(profiles[0]) : 'Profiles table empty');
        console.log("Profile record:", profiles && profiles.length > 0 ? profiles[0] : 'None');
    }

    const { data: enrollments, error: eError } = await supabase.from('enrollments').select('*').limit(1);
    if (eError) {
        console.error("Error fetching enrollments:", eError);
    } else {
        console.log("Enrollment structure:", enrollments && enrollments.length > 0 ? Object.keys(enrollments[0]) : 'Enrollments table empty');
        console.log("Enrollment record:", enrollments && enrollments.length > 0 ? enrollments[0] : 'None');
    }

    const { data: orgStudents, error: osError } = await supabase.from('org_students').select('*').limit(1);
    if (osError) {
        console.error("Error fetching org_students:", osError);
    } else {
        console.log("org_students structure:", orgStudents && orgStudents.length > 0 ? Object.keys(orgStudents[0]) : 'org_students table empty');
        console.log("org_students record:", orgStudents && orgStudents.length > 0 ? orgStudents[0] : 'None');
    }
}

checkSchema();
