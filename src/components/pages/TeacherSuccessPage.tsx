"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, ArrowRight, User, AlertCircle } from 'lucide-react';

export function TeacherSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'active'; // active | pending
    const autoLogin = searchParams.get('autologin') === 'true';
    const email = searchParams.get('email') || '';

    const isPending = status === 'pending';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPending ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                    {isPending ? <Clock className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {isPending ? 'Application Submitted' : 'Welcome to Mentozy!'}
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    {isPending
                        ? "Your application for an Offline Campus account has been received. Our team is reviewing your documents and will contact you shortly."
                        : "Your teacher account has been successfully created. You can now access your dashboard and start setting up your profile."
                    }
                </p>

                {/* Auto-login failed warning */}
                {!isPending && !autoLogin && email && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold text-amber-900 mb-1">Please log in to continue</p>
                                <p className="text-amber-700">Your account was created but you need to log in with:</p>
                                <p className="font-mono text-xs bg-white px-2 py-1 rounded mt-2 text-amber-900">{email}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {!isPending && autoLogin && (
                        <button
                            onClick={() => router.push('/mentor-dashboard')}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    )}

                    {!isPending && !autoLogin && (
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            Log In <ArrowRight className="w-4 h-4" />
                        </button>
                    )}

                    {isPending && (
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all"
                        >
                            Back to Home
                        </button>
                    )}

                    {!isPending && autoLogin && (
                        <button
                            onClick={() => router.push('/mentor-dashboard?tab=profile')}
                            className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <User className="w-4 h-4" /> Complete Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

