const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMentorsAndOrgs() {
    const { data: mentors } = await supabase.from('profiles').select('id, full_name, email, role, created_at').in('role', ['mentor', 'admin']);
    console.log("Mentors and Admins:");
    mentors?.forEach(m => console.log(m.id, m.full_name, m.email, m.role));
}

checkMentorsAndOrgs();
