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

async function inspect() {
    console.log("Checking organisations table...");
    const { data: orgs, error: orgErr } = await supabase.from('organisations').select('*');
    console.log("Organisations count:", orgs?.length || 0, orgErr ? orgErr.message : '');
    console.log(orgs);

    console.log("\nChecking org_students count per org_id...");
    const { data: orgStudents, error: osErr } = await supabase.from('org_students').select('id, org_id, student_id, status');
    console.log("Total org_students rows:", orgStudents?.length || 0, osErr ? osErr.message : '');

    const counts = {};
    if (orgStudents) {
        orgStudents.forEach(row => {
            counts[row.org_id] = (counts[row.org_id] || 0) + 1;
        });
    }
    console.log("org_students counts per org_id:", counts);

    console.log("\nChecking org_student_invitations...");
    const { data: invites } = await supabase.from('org_student_invitations').select('*');
    console.log("Total invites:", invites?.length || 0, invites);
}

inspect();
