const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env manually
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
    envContent.split('\n').forEach(line => {
        if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
    });
} catch (e) {}

if (!supabaseUrl || !supabaseKey) {
    try {
        const envLocalContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
        envLocalContent.split('\n').forEach(line => {
            if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
            if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
        });
    } catch (e) {}
}

console.log("Supabase URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const { data: posts, error: postsErr } = await supabase.from('community_posts').select('id').limit(1);
    console.log("community_posts result:", posts, "error:", postsErr ? postsErr.message : null);

    const { data: cats, error: catsErr } = await supabase.from('community_categories').select('id').limit(1);
    console.log("community_categories result:", cats, "error:", catsErr ? catsErr.message : null);

    const { data: reps, error: repsErr } = await supabase.from('community_replies').select('id').limit(1);
    console.log("community_replies result:", reps, "error:", repsErr ? repsErr.message : null);

    const { data: react, error: reactErr } = await supabase.from('community_reactions').select('id').limit(1);
    console.log("community_reactions result:", react, "error:", reactErr ? reactErr.message : null);
}

checkTables();
