const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectOrgData() {
    console.log('--- 1. Checking organisations table ---');
    const { data: orgs, error: orgsErr } = await supabase.from('organisations').select('*');
    console.log('Organisations:', { orgs, orgsErr });

    console.log('\n--- 2. Checking org_students table ---');
    const { data: orgStudents, error: osErr } = await supabase.from('org_students').select('*');
    console.log('Org students:', { orgStudents, osErr });

    console.log('\n--- 3. Checking org_teachers table ---');
    const { data: orgTeachers, error: otErr } = await supabase.from('org_teachers').select('*');
    console.log('Org teachers:', { orgTeachers, otErr });

    console.log('\n--- 4. Checking mentors table ---');
    const { data: mentors, error: mErr } = await supabase.from('mentors').select('id, user_id, company').limit(5);
    console.log('Mentors sample:', { mentors, mErr });
}

inspectOrgData();
