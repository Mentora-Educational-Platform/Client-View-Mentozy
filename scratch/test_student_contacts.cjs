const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zcujgxjbxprfuscjfnxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWpneGpieHByZnVzY2pmbnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjkyNzEsImV4cCI6MjA4NTE0NTI3MX0.JX7M7trbbNRZRKP1JYlWhjV-c6NRFVHp8WOlpXDx7KM';

const supabase = createClient(supabaseUrl, supabaseKey);

const KNOWN_ORG_STUDENT_IDS = [
    '32dedca2-6718-40fb-81d9-676b736f2111',
    '23d7353e-c143-474a-955c-688ab4121616',
    '1037eb18-44cd-4ee2-8349-8835135d3896',
    'c15bfbd4-4be3-4a0f-97a8-b46f3734e1be',
    '4fccffee-1ec3-4e3b-a321-be88623d5e25',
    'b339d819-6f51-4737-8fd7-d02b4f28ccf6',
    'ef69ad47-838a-4372-8ced-3fc42c2b1e17',
    'de430e13-1b3a-4fb2-9d79-3034888dd8e0'
];

async function getOrgTeachers(orgId) {
    const teacherList = [];
    const seenTeacherIds = new Set();

    const { data: orgProfile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone, email, role')
        .eq('id', orgId)
        .maybeSingle();

    if (orgProfile) {
        seenTeacherIds.add(orgProfile.id);
        teacherList.push({
            id: orgProfile.id,
            teacher_id: orgProfile.id,
            name: orgProfile.full_name || 'Krishnaite Global Academy',
            email: orgProfile.email || 'admissions@krishnaite.dev',
            role: 'teacher'
        });
    }

    return teacherList;
}

async function getOrgStudents(orgId) {
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', KNOWN_ORG_STUDENT_IDS);
    return (profiles || []).map(p => ({
        id: p.id,
        student_id: p.id,
        name: p.full_name || 'Student',
        email: p.email,
        role: 'student',
        grade: p.grade || 'General'
    }));
}

async function getOrgContacts(orgId, currentUserId) {
    const contacts = [];
    const seenIds = new Set();
    if (currentUserId) seenIds.add(currentUserId);

    const students = await getOrgStudents(orgId);
    students.forEach(s => {
        if (!seenIds.has(s.student_id)) {
            seenIds.add(s.student_id);
            contacts.push(s);
        }
    });

    const teachers = await getOrgTeachers(orgId);
    teachers.forEach(t => {
        if (!seenIds.has(t.teacher_id)) {
            seenIds.add(t.teacher_id);
            contacts.push(t);
        }
    });

    return contacts;
}

async function runTest() {
    const orgId = '1c6d1067-5d33-4b2d-843e-00f771e0007e';
    const studentId = '4fccffee-1ec3-4e3b-a321-be88623d5e25'; // Abhishek Singh Rana

    console.log("=== 1. Contacts seen by Org Admin ===");
    const adminContacts = await getOrgContacts(orgId, orgId);
    const adminStudents = adminContacts.filter(c => c.role === 'student');
    const adminTeachers = adminContacts.filter(c => c.role === 'teacher');
    console.log(`Admin sees: ${adminStudents.length} Students, ${adminTeachers.length} Teachers`);

    console.log("\n=== 2. Contacts seen by Student (Abhishek) ===");
    const studentContacts = await getOrgContacts(orgId, studentId);
    const sStudents = studentContacts.filter(c => c.role === 'student');
    const sTeachers = studentContacts.filter(c => c.role === 'teacher');
    console.log(`Student sees: ${sStudents.length} Students, ${sTeachers.length} Teachers`);
    console.log("Teachers list for student:", sTeachers);
}

runTest();
