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

async function checkColumns() {
    console.log("Adding columns if missing to messages table...");
    // Let's test selecting attachment columns from messages table
    const { data, error } = await supabase.from('messages').select('id, attachment_url, attachment_name, attachment_type, attachment_size').limit(1);
    console.log("Select attachment columns error:", error);
    console.log("Select attachment columns result:", data);
}

checkColumns();
