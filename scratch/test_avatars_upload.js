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

async function testAvatarsUpload() {
    const imageBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", 'base64');
    const filePath = `message_attachments/${Date.now()}_test.png`;
    const { data, error } = await supabase.storage.from('avatars').upload(filePath, imageBuffer, { contentType: 'image/png', upsert: true });
    console.log("Avatars Upload Error:", error);
    console.log("Avatars Upload Data:", data);

    if (data) {
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        console.log("Avatars Public URL:", publicUrlData.publicUrl);
    }
}

testAvatarsUpload();
