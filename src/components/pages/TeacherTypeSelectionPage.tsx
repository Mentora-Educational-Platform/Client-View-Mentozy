"use client";

import { User, Building, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TeacherTypeSelectionPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Simple Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.push('/signup')} className="text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-gray-900">Mentozy</span>
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-sm"></div>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex items-center justify-center p-6">
                <div className="max-w-4xl w-full">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Join Mentozy as a Teacher</h1>
                        <p className="text-lg text-gray-600">Choose how you want to teach on Mentozy</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Individual Teacher Card */}
                        <div
                            onClick={() => router.push('/individual-onboarding')}
                            className="bg-white p-10 rounded-3xl border-2 border-gray-100 cursor-pointer transition-all duration-300 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/5 group flex flex-col items-center text-center"
                        >
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <User className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Individual Teacher</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                For solo educators, mentors, and experts looking to guide students personally.
                            </p>
                            <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 font-semibold flex items-center gap-2">
                                Continue <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Organisation Card */}
                        <div
                            onClick={() => router.push('/org-onboarding')}
                            className="bg-white p-10 rounded-3xl border-2 border-gray-100 cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 group flex flex-col items-center text-center"
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Building className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Organisation</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                For institutes, schools, and coaching centers managing multiple students and staff.
                            </p>
                            <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 font-semibold flex items-center gap-2">
                                Continue <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
