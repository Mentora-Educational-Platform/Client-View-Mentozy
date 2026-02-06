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
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Performance Analytics</h1>
                    <p className="text-gray-500 text-lg">
                        We're building a powerful engine to track your learning journey.
                        Check back soon for detailed insights!
                    </p>
                </div>
                <div className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-bold rounded-lg border border-amber-200">
                    Feature Coming Soon
                </div>
            </div>
        </DashboardLayout>
    );
}
