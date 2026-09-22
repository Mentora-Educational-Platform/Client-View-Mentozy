const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTables() {
    const { data: orgs } = await supabase.from('organisations').select('*');
    console.log("Organisations:", orgs);

    const names = [
        'Harshita Bhaskaruni',
        'Thrisha Reddy',
        'Neha Kumari',
        'Gowtham Royal',
        'Abhishek Singh Rana',
        'Dev Bhardwaj',
        'Balakumaran G',
        'Subham Mishra'
    ];

    const { data: matchedProfiles } = await supabase.from('profiles').select('*').in('full_name', names);
    console.log("\nMatched 8 profiles:");
    matchedProfiles?.forEach(p => console.log(p.id, p.full_name, p.role, p.grade, p.created_at));
}

findTables();
