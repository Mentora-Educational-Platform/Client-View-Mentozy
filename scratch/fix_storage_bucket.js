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

async function testStorageBuckets() {
    console.log("=== CHECKING STORAGE BUCKETS ===");
    const { data: buckets, error } = await supabase.storage.listBuckets();
    console.log("Buckets:", buckets, "Error:", error);

    // Try uploading PDF to avatars bucket without MIME restriction or with allowed content types
    const pdfBuffer = Buffer.from("%PDF-1.4 sample pdf file");
    
    // Check if we can update avatars bucket allowed_mime_types or test other bucket
    const { data: updateRes, error: updateErr } = await supabase.storage.updateBucket('avatars', {
        public: true,
        allowedMimeTypes: null // allow all mime types
    });
    console.log("Update Bucket result:", updateRes, "Error:", updateErr);

    const pdfPath = `message_attachments/test_${Date.now()}.pdf`;
    const { data: uploadRes, error: uploadErr } = await supabase.storage.from('avatars').upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
    });
    console.log("PDF Upload to avatars after update:", uploadRes, "Error:", uploadErr);
}

testStorageBuckets();
