const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotificationSystem() {
    console.log("=== 1. Testing notifications table query ===");
    const testRecipientId = '4fccffee-1ec3-4e3b-a321-be88623d5e25'; // Abhishek Singh Rana

    const { data: listBefore, error: errBefore } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testRecipientId);

    console.log("Existing notifications for test recipient:", listBefore?.length, errBefore || '');

    console.log("\n=== 2. Testing notification insert ===");
    const { data: insertData, error: insertErr } = await supabase
        .from('notifications')
        .insert({
            recipient_id: testRecipientId,
            type: 'message',
            title: 'New Message from Mentozy Support',
            body: 'Hello! This is a test notification from the central notification system.',
            link: '/messages',
            is_read: false
        })
        .select();

    console.log("Insert result:", insertData, insertErr || '');

    console.log("\n=== 3. Testing fetchUserNotifications query ===");
    const { data: listAfter, error: errAfter } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testRecipientId)
        .order('created_at', { ascending: false });

    console.log("Fetched notifications:", listAfter?.length, errAfter || '');
    if (listAfter && listAfter.length > 0) {
        console.log("Latest notification:", listAfter[0]);
    }
}

testNotificationSystem();
