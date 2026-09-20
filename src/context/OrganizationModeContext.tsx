import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSupabase } from '../lib/supabase';

export interface Organization {
    id: string;
    name: string;
    avatar_url?: string;
    role: 'student' | 'teacher'; // User's role within this organization
}

interface OrganizationModeContextType {
    mode: 'personal' | 'organization';
    activeOrganization: Organization | null;
    userOrganizations: Organization[];
    setMode: (mode: 'personal' | 'organization') => void;
    setActiveOrganization: (org: Organization | null) => void;
    loading: boolean;
    hasOrganizations: boolean;
    refreshOrganizations: () => Promise<void>;
}

const OrganizationModeContext = createContext<OrganizationModeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mentozy_org_mode';
const LOCAL_STORAGE_ORG_KEY = 'mentozy_active_org';

export function OrganizationModeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [mode, setModeState] = useState<'personal' | 'organization'>('personal');
    const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);
    const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch organizations the user belongs to (as student or teacher)
    const fetchUserOrganizations = useCallback(async () => {
        if (!user?.id) {
            setUserOrganizations([]);
            setLoading(false);
            return;
        }

        const supabase = getSupabase();
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            // Build organization list
            const organizations: Organization[] = [];
            const addedOrgIds = new Set<string>();

            // 1. Fetch top-level organisations where user is owner
            try {
                const { data: dbOrgs } = await supabase
                    .from('organisations')
                    .select('id, name, logo_url, owner_id')
                    .eq('owner_id', user.id);

                if (dbOrgs && dbOrgs.length > 0) {
                    dbOrgs.forEach((org: any) => {
                        if (!addedOrgIds.has(org.id)) {
                            addedOrgIds.add(org.id);
                            organizations.push({
                                id: org.id,
                                name: org.name || 'Organization',
                                avatar_url: org.logo_url,
                                role: 'teacher'
                            });
                        }
                    });
                }
            } catch (err) {
                console.warn('organisations table query fallback:', err);
            }

            // 2. Fetch organizations where user is a teacher (from org_teachers)
            try {
                const { data: teacherRecords, error: teacherError } = await supabase
                    .from('org_teachers')
                    .select('org_id, role, status')
                    .eq('teacher_id', user.id)
                    .eq('status', 'Active');

                if (teacherError) {
                    console.error('Error fetching teacher orgs:', teacherError);
                }

                if (teacherRecords && teacherRecords.length > 0) {
                    const orgIds = teacherRecords.map((t: any) => t.org_id).filter(Boolean);
                    if (orgIds.length > 0) {
                        const { data: orgProfiles } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url')
                            .in('id', orgIds);

                        const profileMap: Record<string, any> = {};
                        (orgProfiles || []).forEach((p: any) => {
                            profileMap[p.id] = p;
                        });

                        teacherRecords.forEach((t: any) => {
                            if (!addedOrgIds.has(t.org_id)) {
                                addedOrgIds.add(t.org_id);
                                const p = profileMap[t.org_id];
                                organizations.push({
                                    id: t.org_id,
                                    name: p?.full_name || 'Organization Workspace',
                                    avatar_url: p?.avatar_url,
                                    role: 'teacher'
                                });
                            }
                        });
                    }
                }
            } catch (err) {
                console.error('Error in teacher orgs processing:', err);
            }

            // 2b. Also include organizations where mentor accepted invitation in org_invitations
            try {
                const { data: acceptedInvites } = await supabase
                    .from('org_invitations')
                    .select('org_id')
                    .eq('mentor_id', user.id)
                    .eq('status', 'accepted');

                if (acceptedInvites && acceptedInvites.length > 0) {
                    const newOrgIds = acceptedInvites.map((i: any) => i.org_id).filter((id: string) => id && !addedOrgIds.has(id));
                    if (newOrgIds.length > 0) {
                        const { data: orgProfiles } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url')
                            .in('id', newOrgIds);

                        const profileMap: Record<string, any> = {};
                        (orgProfiles || []).forEach((p: any) => {
                            profileMap[p.id] = p;
                        });

                        newOrgIds.forEach((orgId: string) => {
                            if (!addedOrgIds.has(orgId)) {
                                addedOrgIds.add(orgId);
                                const p = profileMap[orgId];
                                organizations.push({
                                    id: orgId,
                                    name: p?.full_name || 'Organization Workspace',
                                    avatar_url: p?.avatar_url,
                                    role: 'teacher'
                                });
                            }
                        });
                    }
                }
            } catch (err) {
                console.warn('Accepted teacher invites query note:', err);
            }

            // 3. Fetch organizations where user is a student (from org_students)
            try {
                const { data: studentRecords, error: studentError } = await supabase
                    .from('org_students')
                    .select('org_id, status')
                    .eq('student_id', user.id)
                    .eq('status', 'Active');

                if (studentError) {
                    console.error('Error fetching student orgs:', studentError);
                }

                if (studentRecords && studentRecords.length > 0) {
                    const orgIds = studentRecords.map((s: any) => s.org_id).filter(Boolean);
                    if (orgIds.length > 0) {
                        const { data: orgProfiles } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url')
                            .in('id', orgIds);

                        const profileMap: Record<string, any> = {};
                        (orgProfiles || []).forEach((p: any) => {
                            profileMap[p.id] = p;
                        });

                        studentRecords.forEach((s: any) => {
                            if (!addedOrgIds.has(s.org_id)) {
                                addedOrgIds.add(s.org_id);
                                const p = profileMap[s.org_id];
                                organizations.push({
                                    id: s.org_id,
                                    name: p?.full_name || 'Organization',
                                    avatar_url: p?.avatar_url,
                                    role: 'student'
                                });
                            }
                        });
                    }
                }
            } catch (err) {
                console.error('Error in student orgs processing:', err);
            }

            // 4. If current user is an organisation admin/owner, include their organisation profile
            if (user?.user_metadata?.is_org && !addedOrgIds.has(user.id)) {
                addedOrgIds.add(user.id);
                organizations.push({
                    id: user.id,
                    name: user.user_metadata?.full_name || 'My Organisation',
                    avatar_url: user.user_metadata?.avatar_url,
                    role: 'teacher'
                });
            }

            setUserOrganizations(organizations);

            // Restore saved state from localStorage
            const savedMode = localStorage.getItem(LOCAL_STORAGE_KEY) as 'personal' | 'organization' | null;
            const savedOrgId = localStorage.getItem(LOCAL_STORAGE_ORG_KEY);

            const isOrgAdmin = Boolean(user?.user_metadata?.is_org);

            if ((savedMode === 'organization' || isOrgAdmin) && organizations.length > 0) {
                const savedOrg = savedOrgId ? organizations.find(o => o.id === savedOrgId) : null;
                const activeOrg = savedOrg || organizations[0];
                setModeState('organization');
                setActiveOrganizationState(activeOrg);
                localStorage.setItem(LOCAL_STORAGE_KEY, 'organization');
                localStorage.setItem(LOCAL_STORAGE_ORG_KEY, activeOrg.id);
            } else {
                setModeState('personal');
                setActiveOrganizationState(null);
            }
        } catch (error) {
            console.error('Error fetching user organizations:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchUserOrganizations();
    }, [fetchUserOrganizations]);

    const setMode = useCallback((newMode: 'personal' | 'organization') => {
        setModeState(newMode);
        localStorage.setItem(LOCAL_STORAGE_KEY, newMode);

        if (newMode === 'personal') {
            setActiveOrganizationState(null);
            localStorage.removeItem(LOCAL_STORAGE_ORG_KEY);
        } else if (newMode === 'organization' && userOrganizations.length > 0 && !activeOrganization) {
            // Auto-select first organization if none selected
            setActiveOrganizationState(userOrganizations[0]);
            localStorage.setItem(LOCAL_STORAGE_ORG_KEY, userOrganizations[0].id);
        }
    }, [userOrganizations, activeOrganization]);

    const setActiveOrganization = useCallback((org: Organization | null) => {
        setActiveOrganizationState(org);
        if (org) {
            localStorage.setItem(LOCAL_STORAGE_ORG_KEY, org.id);
            if (mode !== 'organization') {
                setModeState('organization');
                localStorage.setItem(LOCAL_STORAGE_KEY, 'organization');
            }
        } else {
            localStorage.removeItem(LOCAL_STORAGE_ORG_KEY);
        }
    }, [mode]);

    const value = {
        mode,
        activeOrganization,
        userOrganizations,
        setMode,
        setActiveOrganization,
        loading,
        hasOrganizations: userOrganizations.length > 0,
        refreshOrganizations: fetchUserOrganizations,
    };

    return (
        <OrganizationModeContext.Provider value={value}>
            {children}
        </OrganizationModeContext.Provider>
    );
}

export const useOrganizationMode = () => {
    const context = useContext(OrganizationModeContext);
    if (context === undefined) {
        throw new Error('useOrganizationMode must be used within an OrganizationModeProvider');
    }
    return context;
};
