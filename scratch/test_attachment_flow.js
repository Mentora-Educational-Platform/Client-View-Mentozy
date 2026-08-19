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

async function testAttachmentFlow() {
    console.log("=== TESTING ATTACHMENT FLOW ===");
    
    // Create sample buffer for assignment.pdf
    const sampleBuffer = Buffer.from("%PDF-1.4 sample pdf content for mentozy educational assignment");
    const filePath = `test-org/test-user/${Date.now()}_assignment.pdf`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('task-submissions')
        .upload(filePath, sampleBuffer, { contentType: 'application/pdf', upsert: true });

    console.log("Upload Error:", uploadErr);
    console.log("Upload Result:", uploadData);

    const { data: publicUrlData } = supabase.storage
        .from('task-submissions')
        .getPublicUrl(filePath);

    console.log("Generated Attachment URL:", publicUrlData.publicUrl);
}

testAttachmentFlow();
