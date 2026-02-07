import { useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export function AuthCallbackPage() {
    useEffect(() => {
        const handleRedirect = async () => {
            const supabase = getSupabase();
            if (!supabase) return;

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/login';
                return;
            }

            try {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (error) throw error;

                if (profile && (profile.role === 'mentor' || profile.role === 'teacher')) {
                    window.location.href = '/mentor-dashboard';
                } else {
                    window.location.href = '/student-dashboard';
                }
            } catch (err) {
                console.error("Error in auth callback:", err);
                window.location.href = '/student-dashboard'; // Fallback
            }
        };

        handleRedirect();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
                <h2 className="text-xl font-bold text-gray-900">Completing login...</h2>
                <p className="text-gray-500 text-sm font-medium">Redirecting you to your dashboard.</p>
            </div>
        </div>
    );
}

export default AuthCallbackPage;
