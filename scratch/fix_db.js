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

async function fixDb() {
    const orgId = '1c6d1067-5d33-4b2d-843e-00f771e0007e'; // Krishnaite Global Academy

    console.log("1. Updating tracks to set org_id for courses created by the org...");
    const { data: updateTrackData, error: trackErr } = await supabase
        .from('tracks')
        .update({ org_id: orgId })
        .eq('creator_id', orgId);

    if (trackErr) {
        console.error("Error updating tracks:", trackErr);
    } else {
        console.log("Tracks updated successfully!");
    }

    console.log("\n2. Fetching all student profiles...");
    const { data: students, error: studentErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student');

    if (studentErr) {
        console.error("Error fetching students:", studentErr);
        return;
    }

    console.log(`Found ${students.length} students. Linking them to organization...`);

    const orgStudentInserts = students.map(student => ({
        org_id: orgId,
        student_id: student.id,
        status: 'Active',
        grade: 'General'
    }));

    // Perform inserts one by one or filter existing ones to avoid duplicates
    for (const insert of orgStudentInserts) {
        // Check if already exists
        const { data: existing, error: existErr } = await supabase
            .from('org_students')
            .select('id')
            .eq('org_id', insert.org_id)
            .eq('student_id', insert.student_id);

        if (!existErr && existing && existing.length > 0) {
            console.log(`Student ${insert.student_id} already linked. Skipping.`);
        } else {
            const { error: insErr } = await supabase
                .from('org_students')
                .insert([insert]);
            
            if (insErr) {
                console.error(`Failed to link student ${insert.student_id}:`, insErr);
            } else {
                console.log(`Linked student ${insert.student_id} successfully.`);
            }
        }
    }

    console.log("\nDatabase update complete!");
}

fixDb();
