import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Superbase configs in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.from('tracks').select('*').limit(1);
    if (error) {
        console.error("Error fetching tracks:", error);
    } else {
        console.log("Track record structure:", data && data.length > 0 ? Object.keys(data[0]) : 'Table is empty or unable to infer schema without data');
    }

    const { data: mData, error: mError } = await supabase.from('track_modules').select('*').limit(1);
    if (mError) {
        console.error("Error fetching track_modules:", mError);
    } else {
        console.log("Track module record structure:", mData && mData.length > 0 ? Object.keys(mData[0]) : 'Table is empty');
    }
}

checkSchema();
