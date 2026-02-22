const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTracksColumns() {
    const { data, error } = await supabase.from('tracks').select('*').limit(1);
    if (error) {
        console.error("Error fetching tracks:", error);
    } else {
        console.log("Track record columns:", data && data.length > 0 ? Object.keys(data[0]) : 'Table is empty');
    }
}

checkTracksColumns();
