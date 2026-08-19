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

async function testOrgMessaging() {
    const krishId = '1c6d1067-5d33-4b2d-843e-00f771e0007e';
    const fakeUserId = 'ad8475a4-77e6-41c2-b5fd-4d320be8eb32'; // Unrelated student

    console.log("Testing org contacts query for org:", krishId);
    
    // Fetch org_students
    const { data: dbStudents } = await supabase
        .from('org_students')
        .select('student_id')
        .eq('org_id', krishId);

    // Fetch org_teachers
    const { data: dbTeachers } = await supabase
        .from('org_teachers')
        .select('mentor_id')
        .eq('org_id', krishId);

    console.log("Students count for Krishnaite:", dbStudents?.length || 0);
    console.log("Teachers count for Krishnaite:", dbTeachers?.length || 0);

    // Test permission check
    const { count: isStudent } = await supabase
        .from('org_students')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', krishId)
        .eq('student_id', fakeUserId);

    console.log("Is fakeUserId a student of Krishnaite?", Boolean(isStudent && isStudent > 0));
}

testOrgMessaging();
