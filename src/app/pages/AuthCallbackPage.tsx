import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { FullScreenLoader } from "../components/FullScreenLoader"

export function AuthCallbackPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleRedirect = async () => {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) return

            // Fetch role from profiles table
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single()

            const role = profile?.role || session.user.user_metadata?.role || session.user.app_metadata?.role;
            const isOrg = session.user.user_metadata?.is_org || role === 'org';

            if (role === 'admin' || session.user.app_metadata?.role === 'admin') {
                navigate("/admin");
            } else if (isOrg) {
                navigate("/org-dashboard");
            } else if (role === "mentor" || role === "teacher") {
                navigate("/mentor-dashboard");
            } else {
                // Check if applicant with active mentor application
                const { data: applicationData } = await supabase
                    .from('mentor_applications')
                    .select('status')
                    .eq('user_id', session.user.id)
                    .order('submitted_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (applicationData && applicationData.status !== 'approved') {
                    navigate("/mentor/application");
                } else {
                    navigate("/student-dashboard");
                }
            }
        }

        handleRedirect()
    }, [navigate])

    return (
        <div className="min-h-screen relative bg-[#FAFAFA] font-sans">
            <FullScreenLoader />
        </div>
    )
}

export default AuthCallbackPage;
