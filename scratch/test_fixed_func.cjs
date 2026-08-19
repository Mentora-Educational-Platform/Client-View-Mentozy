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

async function testFixedFunction() {
    console.log("=== TESTING IS_ORG_MEMBER FIX ===");
    
    // Test if we can query is_org_member RPC
    const { data: testRes, error: testErr } = await supabase.rpc('is_org_member', {
        p_org_id: '1c6d1067-5d33-4b2d-843e-00f771e0007e',
        p_user_id: '1c6d1067-5d33-4b2d-843e-00f771e0007e'
    });
    console.log("RPC is_org_member before fix result:", testRes, "error:", testErr);
}

testFixedFunction();
