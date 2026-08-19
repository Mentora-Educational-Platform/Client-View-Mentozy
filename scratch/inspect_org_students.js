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

async function inspect() {
    console.log("=== ALL ORG_STUDENTS ===");
    const { data: rows, error } = await supabase.from('org_students').select('*');
    console.log("Error:", error);
    console.log("Total rows in org_students:", rows?.length);
    console.log("Sample rows:", JSON.stringify(rows?.slice(0, 10), null, 2));

    if (rows && rows.length > 0) {
        const orgCounts = {};
        rows.forEach(r => {
            orgCounts[r.org_id] = (orgCounts[r.org_id] || 0) + 1;
        });
        console.log("Org ID Counts:", orgCounts);
    }
}

inspect();
