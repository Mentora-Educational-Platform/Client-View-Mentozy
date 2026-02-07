import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DollarSign, Clock, Users, TrendingUp, BarChart3 } from 'lucide-react';

export function MentorAnalyticsPage() {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">Track your growth, earnings, and impact.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">Total Earnings</span>
                            </div>
                            <div className="text-4xl font-black text-gray-900 mb-1">$0.00</div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                Not enough data yet
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/30 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">Mentoring Hours</span>
                            </div>
                            <div className="text-4xl font-black text-gray-900 mb-1">0.0</div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                Start your first session
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">Unique Students</span>
                            </div>
                            <div className="text-4xl font-black text-gray-900 mb-1">0</div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                Share your profile
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart Empty State */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between min-h-[400px]">
                        <h3 className="text-xl font-bold text-gray-900 mb-8">Revenue Growth</h3>
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-emerald-200" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-900">No revenue data available</p>
                                <p className="text-sm text-gray-500">Earnings will appear as bookings are completed.</p>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Activity Empty State */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between min-h-[400px]">
                        <h3 className="text-xl font-bold text-gray-900 mb-8">Weekly Activity</h3>
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                <BarChart3 className="w-8 h-8 text-indigo-200" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-900">No activity recorded</p>
                                <p className="text-sm text-gray-500">Your weekly session frequency starts here.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips for Mentors */}
                <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h4 className="text-xl font-bold mb-2">Want to boost your analytics?</h4>
                            <p className="text-gray-400 max-w-xl">Complete your profile, add session topics, and share your unique mentor link with your network to attract more students.</p>
                        </div>
                        <button className="px-8 py-3 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-colors whitespace-nowrap">
                            Customize Profile
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
