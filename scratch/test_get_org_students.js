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

async function run() {
    const krishId = '1c6d1067-5d33-4b2d-843e-00f771e0007e';
    console.log("Querying org_students for org_id:", krishId);

    const { data: dbOrgStudents, error: orgErr } = await supabase
        .from('org_students')
        .select('id, org_id, student_id, status, grade, joined_at')
        .eq('org_id', krishId);

    console.log("org_students result:", dbOrgStudents, "error:", orgErr);

    const { data: allOS, error: allErr } = await supabase
        .from('org_students')
        .select('*');

    console.log("all org_students result:", allOS, "error:", allErr);
}

run();
