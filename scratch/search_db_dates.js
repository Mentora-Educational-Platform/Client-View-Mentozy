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

async function searchTables() {
    const tables = ['profiles', 'org_students', 'org_teachers', 'mentors', 'organisations', 'org_student_invitations'];

    for (const t of tables) {
        try {
            const { data, error } = await supabase.from(t).select('*');
            if (error) {
                console.log(`Table ${t} error:`, error.message);
                continue;
            }
            console.log(`Table ${t} total count:`, data?.length);

            const jsonStr = JSON.stringify(data || []);
            if (jsonStr.includes('2026-05-31')) {
                console.log(`FOUND 2026-05-31 in ${t}!`);
            }
            if (jsonStr.includes('2026-06-11')) {
                console.log(`FOUND 2026-06-11 in ${t}!`);
            }
        } catch (e) {
            console.log(`Table ${t} catch error:`, e.message);
        }
    }
}

searchTables();
