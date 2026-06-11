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

async function inspectData() {
    console.log("=== ORG_COURSES ===");
    const { data: orgCourses, error: ocErr } = await supabase.from('org_courses').select('*');
    if (ocErr) console.error("Org Courses error:", ocErr);
    else console.log(orgCourses);
}

inspectData();
