const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasksAndSubmissions() {
    const orgId = '1c6d1067-5d33-4b2d-843e-00f771e0007e';
    console.log("Checking org_task_submissions:");
    const { data: subs, error: subErr } = await supabase.from('org_task_submissions').select('*');
    console.log("Submissions:", subs, subErr || '');

    console.log("\nChecking all org_tasks:");
    const { data: tasks, error: taskErr } = await supabase.from('org_tasks').select('*');
    console.log("Tasks:", tasks, taskErr || '');

    const { data: orgProfile } = await supabase.from('profiles').select('*').eq('id', orgId).single();
    console.log("\nOrg Profile for 1c6d1067-5d33-4b2d-843e-00f771e0007e:", orgProfile);
}

checkTasksAndSubmissions();
