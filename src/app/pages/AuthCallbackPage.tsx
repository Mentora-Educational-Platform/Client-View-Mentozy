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

            const role = session.user.user_metadata?.role || profile?.role;

            if (role === "mentor" || role === "teacher") {
                setTimeout(() => navigate("/mentor-dashboard"), 3000)
            } else {
                setTimeout(() => navigate("/student-dashboard"), 3000)
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
