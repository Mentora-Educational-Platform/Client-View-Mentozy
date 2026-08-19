import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyCommunityMigration() {
    console.log("Checking Supabase connection and tables...");

    // Check if community_posts table exists
    const { data: postsData, error: postsError } = await supabase.from('community_posts').select('id').limit(1);

    if (postsError) {
        console.log("community_posts query returned error:", postsError.message);
    } else {
        console.log("community_posts table exists!");
    }

    // Check community_categories
    const { data: catData, error: catError } = await supabase.from('community_categories').select('id').limit(1);
    if (catError) {
        console.log("community_categories query returned error:", catError.message);
    } else {
        console.log("community_categories table exists!");
    }
}

applyCommunityMigration();
