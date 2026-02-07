"use client";

import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NotFoundPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-lg w-full text-center">
                <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                    <AlertCircle className="w-12 h-12" />
                </div>

                <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>

                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    Oops! The page you are looking for seems to have gone on a sabbatical. It might have been removed or doesn't exist.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>

                    <Link href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5"
                    >
                        <Home className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}


