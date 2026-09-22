const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findStudents() {
    const names = ['Harshita', 'Thrisha', 'Neha', 'Gowtham', 'Abhishek', 'Dev', 'Balakumaran', 'Subham'];
    
    console.log('--- Querying profiles for these names ---');
    const { data: profs, error } = await supabase.from('profiles').select('*');
    if (profs) {
        const matches = profs.filter(p => names.some(n => (p.full_name || '').includes(n)));
        console.log(`Found ${matches.length} matching profiles:`);
        matches.forEach(m => console.log(`- ${m.full_name} (id: ${m.id}, role: ${m.role}, email: ${m.email}, grade: ${m.grade})`));
    }
}

findStudents();
