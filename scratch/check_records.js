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

async function checkAll() {
    console.log("=== ALL PROFILES ===");
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, role');
    console.log("Profiles count:", profiles?.length);
    console.log(profiles);

    console.log("\n=== ALL ORG_STUDENTS ===");
    const { data: orgStudents } = await supabase.from('org_students').select('*');
    console.log("org_students count:", orgStudents?.length);
    console.log(orgStudents);

    console.log("\n=== ALL ORGANISATIONS ===");
    const { data: orgs } = await supabase.from('organisations').select('*');
    console.log("organisations count:", orgs?.length);
    console.log(orgs);
}

checkAll();
