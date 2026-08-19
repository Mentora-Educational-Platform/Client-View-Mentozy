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

async function debugPostInsert() {
    console.log("=== DEBUGGING COMMUNITY POST INSERT ===");

    // 1. Fetch an organisation to test with
    const { data: orgs, error: orgErr } = await supabase.from('organisations').select('id, name').limit(1);
    console.log("Orgs test:", orgs, "Error:", orgErr);

    if (!orgs || orgs.length === 0) {
        console.error("No organisation found to test.");
        return;
    }

    const testOrgId = orgs[0].id;
    console.log("Test Org ID:", testOrgId);

    // 2. Fetch current auth user
    const { data: usersData, error: userErr } = await supabase.auth.getUser();
    console.log("Auth User test:", usersData?.user?.id, "Error:", userErr?.message);

    // 3. Test insert into community_posts with dummy UUIDs / payload
    const testPayload = {
        org_id: testOrgId,
        category_id: null,
        author_id: '00000000-0000-0000-0000-000000000000', // dummy
        title: 'Test Post',
        content: 'Test content'
    };

    console.log("Inserting test payload:", testPayload);
    const { data, error } = await supabase.from('community_posts').insert(testPayload).select().single();
    console.log("Insert result data:", data);
    console.log("Insert result error:", error);
}

debugPostInsert();
