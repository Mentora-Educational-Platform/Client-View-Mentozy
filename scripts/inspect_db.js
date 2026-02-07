
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    console.log('--- Database Inspection ---');

    const { data: profiles } = await supabase.from('profiles').select('id, full_name, role');
    console.log('Profiles:', JSON.stringify(profiles, null, 2));

    const { data: mentors } = await supabase.from('mentors').select('id, user_id, bio, company');
    console.log('Mentors:', JSON.stringify(mentors, null, 2));
}

inspect();
