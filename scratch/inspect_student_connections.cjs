const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnections() {
    const studentIds = [
        '4fccffee-1ec3-4e3b-a321-be88623d5e25',
        'c15bfbd4-4be3-4a0f-97a8-b46f3734e1be',
        'b339d819-6f51-4737-8fd7-d02b4f28ccf6',
        '32dedca2-6718-40fb-81d9-676b736f2111',
        '23d7353e-c143-474a-955c-688ab4121616',
        'de430e13-1b3a-4fb2-9d79-3034888dd8e0',
        '1037eb18-44cd-4ee2-8349-8835135d3896',
        'ef69ad47-838a-4372-8ced-3fc42c2b1e17'
    ];

    console.log('--- 1. Checking enrollments table ---');
    const { data: enrollments } = await supabase.from('enrollments').select('*').in('user_id', studentIds);
    console.log('Enrollments for these 8:', enrollments);

    console.log('\n--- 2. Checking messages table ---');
    const { data: msgs } = await supabase.from('messages').select('sender_id, receiver_id').limit(20);
    console.log('Messages sample:', msgs);

    console.log('\n--- 3. Checking bookings table ---');
    const { data: bookings } = await supabase.from('bookings').select('*').in('user_id', studentIds);
    console.log('Bookings for these 8:', bookings);

    console.log('\n--- 4. Checking org_tasks / org_task_submissions ---');
    const { data: subs } = await supabase.from('org_task_submissions').select('*');
    console.log('Submissions:', subs);
}

checkConnections();
