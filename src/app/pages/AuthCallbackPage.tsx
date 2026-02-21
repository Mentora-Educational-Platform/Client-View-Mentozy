import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"

export function AuthCallbackPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleRedirect = async () => {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) return

            // Fetch role from profiles table
            const { data: profile, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single()

            if (error || !profile) {
                navigate("/")
                return
            }

            if (profile.role === "mentor") {
                navigate("/mentor-dashboard")
            } else {
                navigate("/student-dashboard")
            }
        }

        handleRedirect()
    }, [navigate])

    return <p>Redirecting...</p>
}

export default AuthCallbackPage;
