const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'src', 'lib', 'api.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Strip carriage returns for consistent matching
const originalWithCR = content.includes('\r\n');
content = content.replace(/\r/g, '');

// Replacement 1: org_id in createCourse payload
const target1 = `        if (creatorId) {
            payload.creator_id = creatorId;
            payload.status = status;
        }

        let trackId = courseId;`;

const replacement1 = `        if (creatorId) {
            payload.creator_id = creatorId;
            payload.status = status;
        }

        if ((courseData as any).org_id) {
            payload.org_id = (courseData as any).org_id;
        }

        let trackId = courseId;`;

if (content.includes(target1)) {
    content = content.replace(target1, replacement1);
    console.log("Successfully replaced target 1");
} else {
    console.log("Target 1 not found!");
}

// Replacement 2: enrollInTrack org_id lookup
const target2 = `export const enrollInTrack = async (userId: string, trackId: number): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { error } = await supabase
            .from('enrollments')
            .insert({ user_id: userId, track_id: trackId });

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error enrolling in track:", e);
        return false;
    }
};`;

const replacement2 = `export const enrollInTrack = async (userId: string, trackId: number): Promise<boolean> => {
    try {
        const supabase = getSupabase();
        if (!supabase) return false;

        const { data: trackData } = await supabase
            .from('tracks')
            .select('org_id')
            .eq('id', trackId)
            .single();

        const { error } = await supabase
            .from('enrollments')
            .insert({ 
                user_id: userId, 
                track_id: trackId,
                org_id: trackData?.org_id || null
            });

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error enrolling in track:", e);
        return false;
    }
};`;

if (content.includes(target2)) {
    content = content.replace(target2, replacement2);
    console.log("Successfully replaced target 2");
} else {
    console.log("Target 2 not found!");
}

// Restore carriage returns if they were originally present
if (originalWithCR) {
    content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(apiPath, content, 'utf8');
console.log("Saved changes to api.ts");
