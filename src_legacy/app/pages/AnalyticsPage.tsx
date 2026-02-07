import { BarChart3 } from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-indigo-600" />
                </div>
                <div className="max-w-md">
                    <h1 className="text-3xl font-black text-gray-900 mb-3">Analytics Dashboard</h1>
                    <p className="text-gray-500 text-lg font-medium">
                        Your learning adventure is just beginning. We'll start tracking your progress, course completions, and performance once you engage with mentors and tracks!
                    </p>
                </div>
                <div className="px-6 py-2 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-100">
                    Awaiting First Activity
                </div>
            </div>
        </DashboardLayout>
    );
}
