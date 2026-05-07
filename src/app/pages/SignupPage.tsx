import { GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <div className="max-w-4xl w-full space-y-10">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Link to="/" className="flex items-center gap-2 cursor-pointer">
                            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Mentozy</span>
                            <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
                        </Link>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome to Mentozy</h1>
                    <p className="mt-3 text-base md:text-lg text-gray-600 dark:text-gray-400">
                        Choose how you want to use the platform to get started.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Student Card */}
                    <Link
                        to="/student-auth"
                        className="group relative flex flex-col items-center p-6 md:p-10 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 text-center rounded-3xl"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Student</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">I want to learn, find mentors, and build skills.</p>
                        <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2">
                            Continue <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>

                    {/* Teacher/Mentor Card */}
                    <Link
                        to="/teacher-type"
                        className="group relative flex flex-col items-center p-6 md:p-10 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-center rounded-3xl"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Briefcase className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Mentor / Teacher</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">I want to guide students and share my expertise.</p>
                        <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                            Continue <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Already have an account? <Link to="/login" className="font-semibold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 underline decoration-gray-300 dark:decoration-slate-700 underline-offset-4">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}