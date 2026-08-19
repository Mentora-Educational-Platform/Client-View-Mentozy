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

async function testOrgMemberLogic() {
    const orgId = '1c6d1067-5d33-4b2d-843e-00f771e0007e';
    const userId = '1c6d1067-5d33-4b2d-843e-00f771e0007e';

    console.log("=== TESTING is_org_member LOGIC ===");
    console.log("orgId:", orgId, "userId:", userId);

    // Check RPC call
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('is_org_member', {
        p_org_id: orgId,
        p_user_id: userId
    });

    console.log("RPC is_org_member result:", rpcRes, "Error:", rpcErr);
}

testOrgMemberLogic();
