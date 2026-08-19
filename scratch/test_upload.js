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

async function testBuckets() {
    const bucketsToTest = ['task-attachments', 'task-submissions', 'avatars', 'public', 'materials'];
    for (const b of bucketsToTest) {
        const { data, error } = await supabase.storage.from(b).list();
        console.log(`Bucket '${b}':`, error ? `error: ${error.message}` : `exists! items: ${data.length}`);
    }
}

testBuckets();
