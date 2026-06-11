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

async function testQueries() {
    const mockStudentId = 'fa18a1eb-b5c7-4836-8ae8-afe163b35ad1'; // sivasankar dev
    const mockOrgId = '1c6d1067-5d33-4b2d-843e-00f771e0007e'; // Krishnaite Global Academy

    console.log("Testing getOrgStudentEnrollments...");
    const { data: enrollData, error: enrollError } = await supabase
        .from('enrollments')
        .select('*, tracks(*, track_modules(title))')
        .eq('user_id', mockStudentId)
        .eq('org_id', mockOrgId);
    
    if (enrollError) {
        console.error("Enrollment query failed:", enrollError);
    } else {
        console.log("Enrollment query succeeded, records:", enrollData.length);
    }

    console.log("\nTesting getOrgTracks...");
    const { data: trackData, error: trackError } = await supabase
        .from('tracks')
        .select(`
            *,
            track_modules(*)
        `)
        .eq('org_id', mockOrgId);

    if (trackError) {
        console.error("Track query failed:", trackError);
    } else {
        console.log("Track query succeeded, records:", trackData.length);
        console.log("Tracks:", trackData);
    }
}

testQueries();
