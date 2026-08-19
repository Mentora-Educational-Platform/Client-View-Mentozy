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
    console.log("=== MESSAGES TABLE SAMPLE ===");
    const { data: messages, error: msgErr } = await supabase.from('messages').select('*').limit(3);
    console.log("Messages Error:", msgErr);
    console.log("Messages Sample Row:", messages?.[0] || 'No messages');

    console.log("\n=== STORAGE BUCKETS ===");
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    console.log("Buckets Error:", bErr);
    console.log("Buckets:", buckets);
}

inspect();
