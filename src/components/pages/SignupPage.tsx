"use client";
import { GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl w-full space-y-10">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Link href="/" className="flex items-center gap-2 cursor-pointer">
                            <span className="text-2xl font-bold tracking-tight text-gray-900">Mentozy</span>
                            <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
                        </Link>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome to Mentozy</h1>
                    <p className="mt-3 text-lg text-gray-600">
                        Choose how you want to use the platform to get started.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Student Card */}
                    <Link href="/student-auth"
                        className="group relative flex flex-col items-center p-10 bg-white border-2 border-gray-100 rounded-3xl hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 text-center"
                    >
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <GraduationCap className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Student</h3>
                        <p className="text-gray-500 mb-8">I want to learn, find mentors, and build skills.</p>
                        <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 font-semibold flex items-center gap-2">
                            Continue <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>

                    {/* Teacher/Mentor Card */}
                    <Link href="/teacher-type"
                        className="group relative flex flex-col items-center p-10 bg-white border-2 border-gray-100 rounded-3xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-center"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Briefcase className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Mentor / Teacher</h3>
                        <p className="text-gray-500 mb-8">I want to guide students and share my expertise.</p>
                        <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 font-semibold flex items-center gap-2">
                            Continue <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="font-semibold text-gray-900 hover:text-amber-600 underline decoration-gray-300 underline-offset-4">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
