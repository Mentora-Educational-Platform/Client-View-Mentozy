import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import { Profile, getUserProfile } from '../lib/api';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    role: string | null;
    isAdmin: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ user: User | null; profile: Profile | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Profile loader function
    const fetchUserProfile = useCallback(async (userId: string, authUser?: User | null): Promise<Profile | null> => {
        try {
            console.log("[AuthContext] fetchUserProfile for:", userId);
            const userProfile = await getUserProfile(userId);
            if (userProfile) {
                setProfile(userProfile);
                const userRole = userProfile.role || authUser?.user_metadata?.role || authUser?.app_metadata?.role || 'student';
                const adminStatus = userRole === 'admin' || authUser?.app_metadata?.role === 'admin';
                setRole(userRole);
                setIsAdmin(adminStatus);
                console.log("[AuthContext] Profile loaded:", { userRole, adminStatus });
                return userProfile;
            } else {
                const metaRole = authUser?.user_metadata?.role || authUser?.app_metadata?.role || 'student';
                const adminStatus = metaRole === 'admin' || authUser?.app_metadata?.role === 'admin';
                setProfile(null);
                setRole(metaRole);
                setIsAdmin(adminStatus);
                console.log("[AuthContext] Profile fallback:", { metaRole, adminStatus });
                return null;
            }
        } catch (err) {
            console.warn('[AuthContext] Error fetching profile:', err);
            const fallbackRole = authUser?.user_metadata?.role || authUser?.app_metadata?.role || 'student';
            const adminStatus = fallbackRole === 'admin' || authUser?.app_metadata?.role === 'admin';
            setRole(fallbackRole);
            setIsAdmin(adminStatus);
            return null;
        }
    }, []);

    const refreshProfile = useCallback(async (): Promise<Profile | null> => {
        if (!user) return null;
        return await fetchUserProfile(user.id, user);
    }, [user, fetchUserProfile]);

    // 1. Initial Session & Synchronous Auth Listener (NON-BLOCKING)
    useEffect(() => {
        const supabase = getSupabase();
        if (!supabase) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        // Fetch initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!isMounted) return;
            setSession(session);
            setUser(session?.user ?? null);
            if (!session?.user) {
                setLoading(false);
            }
        }).catch(err => {
            console.warn("[AuthContext] getSession error:", err);
            if (isMounted) setLoading(false);
        });

        // Listen for auth state changes synchronously (do not await queries inside listener)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            if (!isMounted) return;
            console.log("[AuthContext] onAuthStateChange:", _event, newSession?.user?.email);
            setSession(newSession);
            setUser(newSession?.user ?? null);
            if (!newSession?.user) {
                setProfile(null);
                setRole(null);
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // 2. Reactively load profile whenever user changes
    useEffect(() => {
        let isMounted = true;

        if (!user) {
            setProfile(null);
            setRole(null);
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchUserProfile(user.id, user).finally(() => {
            if (isMounted) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [user?.id, fetchUserProfile]);

    const signIn = async (email: string, password: string): Promise<{ user: User | null; profile: Profile | null }> => {
        const supabase = getSupabase();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim()
        });

        if (error) {
            throw error;
        }

        if (data.session) {
            setSession(data.session);
            setUser(data.user);
            const userProfile = await fetchUserProfile(data.user.id, data.user);
            return { user: data.user, profile: userProfile };
        }

        return { user: data.user, profile: null };
    };

    const signOut = async () => {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
        setIsAdmin(false);
        setLoading(false);
    };

    const value = {
        session,
        user,
        profile,
        role,
        isAdmin,
        loading,
        signIn,
        signOut,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
export default AuthContext;
