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

async function testRlsCheck() {
    console.log("=== TESTING RLS POLICY LOGIC ===");

    // Fetch auth user if session exists or check supabase auth
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    console.log("Auth user:", userData?.user?.id, "Error:", userErr?.message);

    // Fetch active organizations
    const { data: orgs, error: orgErr } = await supabase.from('organisations').select('id, name, owner_id').limit(5);
    console.log("Organisations:", orgs, "Error:", orgErr);
}

testRlsCheck();
