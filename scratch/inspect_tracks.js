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

async function inspectTracks() {
    console.log("=== ALL TRACKS ===");
    const { data: tracks, error } = await supabase.from('tracks').select('*');
    if (error) {
        console.error("Error fetching tracks:", error);
    } else {
        console.log(tracks);
    }
}

inspectTracks();
