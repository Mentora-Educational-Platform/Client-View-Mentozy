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

async function testRpc() {
    const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260427_create_community_system.sql'), 'utf-8');
    
    // Try calling exec_sql or exec if exists
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('exec_sql', { sql_query: sql });
    console.log("exec_sql result:", rpcRes, "error:", rpcErr);

    const { data: rpcRes2, error: rpcErr2 } = await supabase.rpc('exec', { query: sql });
    console.log("exec result:", rpcRes2, "error:", rpcErr2);
}

testRpc();
