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

async function testPdfUpload() {
    const pdfBuffer = Buffer.from("%PDF-1.4 sample pdf document");
    const filePath = `message_attachments/${Date.now()}_assignment.pdf`;
    const { data, error } = await supabase.storage.from('avatars').upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });
    console.log("PDF Upload Error:", error);
    console.log("PDF Upload Data:", data);
}

testPdfUpload();
