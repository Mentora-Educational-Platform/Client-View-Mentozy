const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMentorIdReferences() {
    console.log("=== SEARCHING FOR MENTOR_ID REFERENCES IN DATABASE SCHEMAS & POLICIES ===");

    // Query RLS policies for community_posts if readable or check postgres system catalog via RPC if available
    const { data: policies, error: polErr } = await supabase.from('community_posts').select('*').limit(1);
    console.log("Select community_posts result:", policies, "Error:", polErr);

    // Test helper function is_org_member or similar functions
    const { data: funcRes, error: funcErr } = await supabase.rpc('is_org_member', {
        p_org_id: '1c6d1067-5d33-4b2d-843e-00f771e0007e',
        p_user_id: '1c6d1067-5d33-4b2d-843e-00f771e0007e'
    });
    console.log("is_org_member test result:", funcRes, "Error:", funcErr);
}

findMentorIdReferences();
