const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

const students = [
    { student_id: '32dedca2-6718-40fb-81d9-676b736f2111', grade: 'college' },
    { student_id: '23d7353e-c143-474a-955c-688ab4121616', grade: 'General' },
    { student_id: '1037eb18-44cd-4ee2-8349-8835135d3896', grade: 'General' },
    { student_id: 'c15bfbd4-4be3-4a0f-97a8-b46f3734e1be', grade: 'General' },
    { student_id: '4fccffee-1ec3-4e3b-a321-be88623d5e25', grade: 'General' },
    { student_id: 'b339d819-6f51-4737-8fd7-d02b4f28ccf6', grade: 'General' },
    { student_id: 'ef69ad47-838a-4372-8ced-3fc42c2b1e17', grade: 'U.G' },
    { student_id: 'de430e13-1b3a-4fb2-9d79-3034888dd8e0', grade: 'General' }
];

const orgIds = [
    '1c6d1067-5d33-4b2d-843e-00f771e0007e',
    'a425b6c9-8b6c-4088-b004-00feea605fcb'
];

async function seedOrgStudents() {
    for (const orgId of orgIds) {
        console.log(`\nSeeding students for org ${orgId}...`);
        for (const s of students) {
            const { data: existing } = await supabase
                .from('org_students')
                .select('id')
                .eq('org_id', orgId)
                .eq('student_id', s.student_id)
                .maybeSingle();

            if (!existing) {
                const { data, error } = await supabase.from('org_students').insert({
                    org_id: orgId,
                    student_id: s.student_id,
                    status: 'Active',
                    grade: s.grade
                });
                console.log(`Inserted student ${s.student_id}:`, error || 'Success');
            } else {
                console.log(`Student ${s.student_id} already exists`);
            }
        }
    }
}

seedOrgStudents();
