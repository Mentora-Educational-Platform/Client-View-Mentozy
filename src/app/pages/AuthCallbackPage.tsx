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
                setTimeout(() => navigate("/"), 3000)
                return
            }

            if (profile.role === "mentor") {
                setTimeout(() => navigate("/mentor-dashboard"), 3000)
            } else {
                setTimeout(() => navigate("/student-dashboard"), 3000)
            }
        }

        handleRedirect()
    }, [navigate])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] font-sans overflow-hidden">
            <div className="flex flex-col items-center justify-center space-y-10">
                {/* Animated Peacock Feather */}
                <div className="relative animate-[bounce_3s_infinite]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 100 100"
                        className="w-40 h-40 drop-shadow-2xl"
                    >
                        <defs>
                            <linearGradient id="feather-stem" x1="50" y1="100" x2="50" y2="10">
                                <stop offset="0%" stopColor="#e5e5e5" />
                                <stop offset="100%" stopColor="#16a34a" />
                            </linearGradient>
                            <radialGradient id="feather-eye-outer" cx="50" cy="30" r="28">
                                <stop offset="0%" stopColor="#eab308" />
                                <stop offset="30%" stopColor="#10b981" />
                                <stop offset="65%" stopColor="#0ea5e9" />
                                <stop offset="100%" stopColor="#1e3a8a" />
                            </radialGradient>
                            <radialGradient id="feather-eye-inner" cx="50" cy="28" r="14">
                                <stop offset="0%" stopColor="#020617" />
                                <stop offset="60%" stopColor="#1e40af" />
                                <stop offset="100%" stopColor="#38bdf8" />
                            </radialGradient>
                        </defs>

                        {/* Stem */}
                        <path
                            d="M50 100 Q46 50 50 5 Q54 50 50 100 Z"
                            fill="url(#feather-stem)"
                        />

                        {/* Feathery Strands Left */}
                        <path d="M50 85 Q25 65 35 30" stroke="#15803d" strokeWidth="1.5" fill="none" opacity="0.8" />
                        <path d="M50 75 Q15 55 30 25" stroke="#166534" strokeWidth="2" fill="none" opacity="0.9" />
                        <path d="M50 65 Q10 45 35 15" stroke="#14532d" strokeWidth="1.5" fill="none" opacity="0.7" />
                        <path d="M50 55 Q20 35 40 10" stroke="#065f46" strokeWidth="1" fill="none" opacity="0.6" />
                        <path d="M50 90 Q30 75 42 45" stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.8" />

                        {/* Feathery Strands Right */}
                        <path d="M50 85 Q75 65 65 30" stroke="#15803d" strokeWidth="1.5" fill="none" opacity="0.8" />
                        <path d="M50 75 Q85 55 70 25" stroke="#166534" strokeWidth="2" fill="none" opacity="0.9" />
                        <path d="M50 65 Q90 45 65 15" stroke="#14532d" strokeWidth="1.5" fill="none" opacity="0.7" />
                        <path d="M50 55 Q80 35 60 10" stroke="#065f46" strokeWidth="1" fill="none" opacity="0.6" />
                        <path d="M50 90 Q70 75 58 45" stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.8" />

                        {/* Main Eye Base */}
                        <path d="M50 5 Q20 30 50 60 Q80 30 50 5 Z" fill="url(#feather-eye-outer)" opacity="0.95" />

                        {/* Inner Eye Layer */}
                        <path d="M50 12 Q30 28 50 50 Q70 28 50 12 Z" fill="url(#feather-eye-inner)" />

                        {/* Center Highlight / Core */}
                        <ellipse cx="50" cy="28" rx="6" ry="10" fill="#020617" />
                        <path d="M50 20 Q54 26 50 32 Q46 26 50 20 Z" fill="#38bdf8" opacity="0.8" />
                        <circle cx="50" cy="24" r="2" fill="#bae6fd" opacity="0.9" />
                    </svg>

                    {/* Subtle Glow Behind Feather */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-teal-400 rounded-full blur-3xl opacity-20 -z-10"></div>
                </div>

                {/* Text Area */}
                <div className="text-center mt-4 h-16 flex items-center justify-center">
                    <h2 className="text-3xl md:text-5xl font-serif italic tracking-[0.2em] md:tracking-[0.3em] drop-shadow-md pb-2 flex">
                        {"v.a.s.u.d.e.v.a.....".split('').map((char, index) => (
                            <span
                                key={index}
                                className="opacity-0 animate-[fade-in_0.5s_ease-in-out_forwards] text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600"
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                {char}
                            </span>
                        ))}
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default AuthCallbackPage;
