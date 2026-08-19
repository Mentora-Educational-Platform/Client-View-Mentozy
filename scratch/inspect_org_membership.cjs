const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectMembership() {
    const targetId = '1c6d1067-5d33-4b2d-843e-00f771e0007e';
    console.log("=== INSPECTING MEMBERSHIP FOR ID:", targetId, "===");

    // 1. Profile
    const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId);
    console.log("Profile:", profile, "Error:", profErr);

    // 2. Organisations (where id = targetId OR owner_id = targetId)
    const { data: orgById, error: orgByIdErr } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', targetId);
    console.log("Organisations where id = targetId:", orgById, "Error:", orgByIdErr);

    const { data: orgByOwner, error: orgByOwnerErr } = await supabase
        .from('organisations')
        .select('*')
        .eq('owner_id', targetId);
    console.log("Organisations where owner_id = targetId:", orgByOwner, "Error:", orgByOwnerErr);

    // 3. All organisations
    const { data: allOrgs, error: allOrgsErr } = await supabase
        .from('organisations')
        .select('*');
    console.log("All Organisations:", allOrgs, "Error:", allOrgsErr);

    // 4. org_students
    const { data: orgStudents, error: orgStudentsErr } = await supabase
        .from('org_students')
        .select('*')
        .eq('org_id', targetId);
    console.log("org_students where org_id = targetId:", orgStudents, "Error:", orgStudentsErr);

    // 5. org_teachers
    const { data: orgTeachers, error: orgTeachersErr } = await supabase
        .from('org_teachers')
        .select('*')
        .eq('org_id', targetId);
    console.log("org_teachers where org_id = targetId:", orgTeachers, "Error:", orgTeachersErr);
}

inspectMembership();
