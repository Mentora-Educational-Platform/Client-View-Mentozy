import { GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8 font-mono">
            <div className="max-w-4xl w-full space-y-10">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Link to="/" className="flex items-center gap-2 cursor-pointer border-4 border-gray-900 bg-white px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all">
                            <span className="text-2xl font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
                            <div className="w-3 w-3 bg-[#f39c12] border-2 border-gray-900"></div>
                        </Link>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight uppercase mb-4">
                        Welcome to Mentozy
                    </h1>
                    <p className="mt-3 text-base md:text-lg text-gray-700 max-w-xl mx-auto font-bold uppercase">
                        Choose how you want to use the platform to get started.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Student Card */}
                    <Link
                        to="/student-auth"
                        className="group relative flex flex-col items-center p-8 md:p-10 bg-white border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all text-center"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center text-gray-900 mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:bg-[#f39c12] transition-colors">
                            <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <h3 className="text-xl md:text-3xl font-black text-gray-900 mb-2 uppercase">Student</h3>
                        <p className="text-gray-700 font-bold mb-8 uppercase text-sm leading-relaxed">I want to learn, find mentors, and build skills.</p>
                        <div className="mt-auto bg-[#eff3ff] border-4 border-gray-900 px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-gray-900 font-black flex items-center gap-2 uppercase text-sm group-hover:bg-[#f39c12] transition-colors">
                            Continue <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>

                    {/* Teacher/Mentor Card */}
                    <Link
                        to="/teacher-type"
                        className="group relative flex flex-col items-center p-8 md:p-10 bg-white border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all text-center"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center text-gray-900 mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:bg-[#f39c12] transition-colors">
                            <Briefcase className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <h3 className="text-xl md:text-3xl font-black text-gray-900 mb-2 uppercase">Mentor / Teacher</h3>
                        <p className="text-gray-700 font-bold mb-8 uppercase text-sm leading-relaxed">I want to guide students and share my expertise.</p>
                        <div className="mt-auto bg-[#eff3ff] border-4 border-gray-900 px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-gray-900 font-black flex items-center gap-2 uppercase text-sm group-hover:bg-[#f39c12] transition-colors">
                            Continue <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>
                </div>

                <div className="text-center space-y-3">
                    <p className="text-sm font-bold uppercase text-gray-700">
                        Already have an account?{' '}
                        <Link to="/login" className="font-black text-gray-900 underline decoration-gray-900 decoration-2 underline-offset-4 hover:text-[#f39c12]">
                            Log in
                        </Link>
                    </p>
                    <div className="pt-2 border-t-2 border-dashed border-gray-300">
                        <p className="text-xs font-bold text-gray-600">
                            Representing a School, Academy, or Institution?{' '}
                            <Link to="/org-onboarding" className="text-black font-black underline hover:text-[#f39c12]">
                                Partner With Us →
                            </Link>{' '}
                            •{' '}
                            <Link to="/org-login" className="text-zinc-600 font-bold hover:text-black underline">
                                Organization Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;