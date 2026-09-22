const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
    const testRecipientId = '4fccffee-1ec3-4e3b-a321-be88623d5e25'; // Abhishek Singh Rana

    console.log("=== Testing create_notification RPC ===");
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('create_notification', {
        p_recipient_id: testRecipientId,
        p_type: 'announcement',
        p_title: 'Welcome to AIVantage!',
        p_body: 'Classes and assignments have started. Check your dashboard.',
        p_link: '/org-announcements'
    });

    console.log("create_notification RPC result:", rpcRes, rpcErr || '');
}

testRpc();
