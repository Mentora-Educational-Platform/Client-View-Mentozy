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

async function applyMigration() {
    console.log("Checking if message-attachments storage bucket exists...");
    const { data: bucket, error: bErr } = await supabase.storage.createBucket('message-attachments', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
    });
    console.log("Create Bucket result:", bucket, "error:", bErr);
}

applyMigration();
