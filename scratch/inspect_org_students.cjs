const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("=== 1. Checking org_students table ===");
    const { data: orgStudents, error: err1 } = await supabase.from('org_students').select('*');
    console.log("org_students rows:", orgStudents?.length, err1 || '');
    if (orgStudents && orgStudents.length > 0) {
        console.log("org_students sample:", JSON.stringify(orgStudents, null, 2));
    }

    console.log("\n=== 2. Checking org_student_invitations table ===");
    const { data: orgInvites, error: err2 } = await supabase.from('org_student_invitations').select('*');
    console.log("org_student_invitations rows:", orgInvites?.length, err2 || '');
    if (orgInvites && orgInvites.length > 0) {
        console.log("org_student_invitations sample:", JSON.stringify(orgInvites, null, 2));
    }

    console.log("\n=== 3. Checking organizations table ===");
    const { data: orgs, error: err3 } = await supabase.from('organizations').select('*');
    console.log("organizations:", JSON.stringify(orgs, null, 2), err3 || '');

    console.log("\n=== 4. Checking all profiles with role = student ===");
    const { data: students, error: err4 } = await supabase.from('profiles').select('id, full_name, email, role, grade, created_at').eq('role', 'student');
    console.log("Total students in profiles:", students?.length);
    console.log("Students sample:", students?.slice(0, 10));
}

inspect();
