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

async function testMimeOverride() {
    const pdfBuffer = Buffer.from("%PDF-1.4 sample pdf document");
    const filePath = `message_attachments/docs/${Date.now()}_assignment.pdf`;
    
    // Test contentType: 'application/octet-stream'
    const { data: d1, error: e1 } = await supabase.storage.from('avatars').upload(filePath, pdfBuffer, {
        contentType: 'application/octet-stream',
        upsert: true
    });
    console.log("Octet-stream upload:", d1, "Error:", e1);

    if (d1) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        console.log("Public URL for PDF:", urlData.publicUrl);
    }
}

testMimeOverride();
