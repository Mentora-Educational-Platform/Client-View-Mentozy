const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAllProfiles() {
    const { data: profs, error } = await supabase.from('profiles').select('id, full_name, role, email');
    console.log(`Total profiles in DB: ${profs?.length}`);
    const students = profs?.filter(p => p.role === 'student') || [];
    console.log(`Total students in DB: ${students.length}`);
    students.forEach((s, idx) => console.log(`${idx+1}. ${s.full_name} (${s.email})`));

    const teachers = profs?.filter(p => p.role === 'mentor' || p.role === 'teacher') || [];
    console.log(`\nTotal teachers in DB: ${teachers.length}`);
    teachers.forEach((t, idx) => console.log(`${idx+1}. ${t.full_name} (${t.email})`));
}

listAllProfiles();
