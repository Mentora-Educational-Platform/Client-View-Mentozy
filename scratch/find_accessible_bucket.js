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

async function findBucket() {
    const buckets = ['avatars', 'task-attachments', 'public', 'materials', 'assignments'];
    const sampleBuffer = Buffer.from("test file content");
    
    for (const b of buckets) {
        const filePath = `test_${Date.now()}.txt`;
        const { data, error } = await supabase.storage.from(b).upload(filePath, sampleBuffer, { upsert: true });
        console.log(`Bucket '${b}' upload:`, error ? `Error: ${error.message}` : `SUCCESS! path: ${data.path}`);
    }
}

findBucket();
