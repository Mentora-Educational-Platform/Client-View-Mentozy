const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostics() {
    console.log('--- 1. Testing Edge Function `send-mentor-notification` ---');
    try {
        const { data, error } = await supabase.functions.invoke('send-mentor-notification', {
            body: {
                to: ['contact@mentozy.app'],
                subject: 'Test Notification from Diagnostics',
                html: '<p>Test</p>',
                text: 'Test'
            }
        });
        console.log('Edge Function result:', { data, error });
    } catch (e) {
        console.error('Edge function invocation exception:', e);
    }

    console.log('\n--- 2. Checking `notifications` table ---');
    try {
        const { data: notifData, error: notifErr } = await supabase.from('notifications').select('*').limit(5);
        console.log('Notifications select query:', { notifData, notifErr });
    } catch (e) {
        console.error('Notifications table exception:', e);
    }

    console.log('\n--- 3. Checking `profiles` email column ---');
    try {
        const { data: profData, error: profErr } = await supabase.from('profiles').select('id, full_name, email, role').limit(5);
        console.log('Profiles sample:', { profData, profErr });
    } catch (e) {
        console.error('Profiles exception:', e);
    }

    console.log('\n--- 4. Checking `org_students` table ---');
    try {
        const { data: orgStudents, error: osErr } = await supabase.from('org_students').select('*').limit(5);
        console.log('Org students sample:', { orgStudents, osErr });
    } catch (e) {
        console.error('Org students exception:', e);
    }
}

runDiagnostics();
