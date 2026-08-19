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

async function inspectOrgTeachers() {
    console.log("Checking org_teachers columns...");
    const { data, error } = await supabase.from('org_teachers').select('*').limit(1);
    console.log("org_teachers sample:", data, "error:", error);

    console.log("Checking org_students columns...");
    const { data: stdData, error: stdError } = await supabase.from('org_students').select('*').limit(1);
    console.log("org_students sample:", stdData, "error:", stdError);
}

inspectOrgTeachers();
