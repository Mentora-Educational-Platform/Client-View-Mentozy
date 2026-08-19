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
    const { data: invitations } = await supabase.from('org_student_invitations').select('*');
    console.log("org_student_invitations sample:", invitations);

    const { data: orgStudents } = await supabase.from('org_students').select('*');
    console.log("org_students sample:", orgStudents);
}

inspect();
