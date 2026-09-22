const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNotifInsert() {
    console.log('--- Testing Notification Insert without select ---');
    // Using a test recipient ID from profiles: '4fccffee-1ec3-4e3b-a321-be88623d5e25'
    const recipientId = '4fccffee-1ec3-4e3b-a321-be88623d5e25';
    
    const { data, error } = await supabase.from('notifications').insert({
        recipient_id: recipientId,
        type: 'message',
        title: 'Test Notification',
        body: 'Hello world',
        link: '/messages',
        is_read: false
    });

    console.log('Insert result:', { data, error });

    const { data: fetchRows, error: fetchErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', recipientId);
    
    console.log('Fetch rows:', { fetchRows, fetchErr });
}

testNotifInsert();
