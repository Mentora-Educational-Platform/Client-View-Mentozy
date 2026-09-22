const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findRecentStudents() {
    const { data: bala } = await supabase.from('profiles').select('*').ilike('full_name', '%Balakumaran%');
    console.log("Balakumaran:", bala);

    const { data: allStudents } = await supabase.from('profiles').select('id, full_name, email, role, grade, created_at, phone').eq('role', 'student');
    console.log("\nAll students count:", allStudents?.length);
    console.log("All students sorted by created_at desc:");
    allStudents?.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    allStudents?.forEach((s, idx) => console.log(`${idx+1}. ${s.full_name} | ${s.email} | ${s.grade} | ${s.created_at}`));
}

findRecentStudents();
