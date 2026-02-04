"use client";
import { GraduationCap, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export function StudentAuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100">

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-6">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Continue as Student</h2>
                    <p className="mt-2 text-gray-600">Access your learning journey</p>
                </div>

                <div className="space-y-4">
                    <Link href="/student-onboarding"
                        className="group w-full flex items-center justify-between p-5 bg-amber-50 border-2 border-amber-200 hover:bg-amber-100 hover:border-amber-300 rounded-2xl transition-all duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-sm">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900">Create New Account</p>
                                <p className="text-xs text-gray-600">I'm new to Mentozy</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link href="/login"
                        className="group w-full flex items-center justify-between p-5 bg-white border-2 border-gray-100 hover:border-gray-300 rounded-2xl transition-all duration-200"
                    >
                        <div className="text-left pl-2">
                            <p className="font-bold text-gray-900">Log In</p>
                            <p className="text-xs text-gray-500">I already have an account</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </Link>
                </div>

                <div className="mt-10 text-center">
                    <Link href="/signup"
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ← Back to role selection
                    </Link>
                </div>
            </div>
        </div>
    );
}
