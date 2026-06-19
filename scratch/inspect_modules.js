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

async function inspectModules() {
    const { data: trackModules, error } = await supabase.from('track_modules').select('*');
    if (error) {
        console.error("Error fetching modules:", error);
    } else {
        trackModules.forEach(m => {
            console.log(`Module ID: ${m.id}, Track ID: ${m.track_id}, Title: ${m.title}`);
            console.log("Content:", JSON.stringify(m.content, null, 2));
            console.log("------------------------");
        });
    }
}

inspectModules();
