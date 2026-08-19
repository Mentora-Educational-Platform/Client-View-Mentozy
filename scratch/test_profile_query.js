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

async function testQuery() {
    console.log("--- QUERYING WITH 'email' ---");
    const { data: data1, error: err1 } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, grade, school')
        .in('id', ['32dedca2-6718-40fb-81d9-676b736f2111']);
    
    console.log("Result with email column:", data1);
    console.log("Error with email column:", err1);

    console.log("\n--- QUERYING WITHOUT 'email' ---");
    const { data: data2, error: err2 } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, grade, school')
        .in('id', ['32dedca2-6718-40fb-81d9-676b736f2111']);
    
    console.log("Result without email column:", data2);
    console.log("Error without email column:", err2);
}

testQuery();
