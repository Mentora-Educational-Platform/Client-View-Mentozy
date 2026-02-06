import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Award, Star, ThumbsUp, Medal, Quote, Lock, MessageSquare } from 'lucide-react';

export function MentorAchievementsPage() {
    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                {/* Header */}
                <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-gray-900 via-indigo-950 to-indigo-900 p-12 text-white shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-6">
                            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/20 shadow-inner">
                                <Award className="w-10 h-10 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight">Achievements & Reviews</h1>
                                <div className="h-1 w-20 bg-amber-400 rounded-full mt-2"></div>
                            </div>
                        </div>
                        <p className="text-indigo-100 text-lg max-w-2xl font-medium leading-relaxed">
                            Your journey as a mentor is just beginning. Track your milestones, earn prestigious badges, and read heartfelt feedback from your students here.
                        </p>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px] -ml-20 -mb-20"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Badges Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <Medal className="w-6 h-6 text-indigo-600" />
                                Your Badges
                            </h2>
                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center group transition-all hover:border-indigo-100">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-gray-200 rounded-full animate-pulse opacity-50"></div>
                                    <Lock className="w-10 h-10 text-gray-300 relative z-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">No Badges Yet</h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-[200px] mb-8">
                                    Start hosting sessions to unlock your first professional achievement!
                                </p>
                                <div className="px-5 py-2.5 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-100">
                                    Coming Soon
                                </div>
                            </div>
                        </div>

                        {/* Stats Summary (Zero State) */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-[2.5rem] border border-indigo-100/50">
                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6">Quick Overview</h4>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Total Rating</span>
                                    <span className="text-lg font-black text-gray-300">--</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Sessions</span>
                                    <span className="text-lg font-black text-gray-300">0</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Response Rate</span>
                                    <span className="text-lg font-black text-gray-300">New</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <ThumbsUp className="w-6 h-6 text-emerald-600" />
                                Recent Reviews
                            </h2>
                            <span className="px-4 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">
                                0 Reviews
                            </span>
                        </div>

                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center border-dashed min-h-[450px]">
                            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-0">
                                <MessageSquare className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">Awaiting Your First Feedback</h3>
                            <p className="text-gray-500 text-lg max-w-md leading-relaxed">
                                Reviews from students will appear here once you've completed your first mentorship sessions.
                            </p>
                            <div className="mt-10 flex items-center gap-2 text-amber-500 font-bold bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100">
                                <Star className="w-5 h-5 fill-amber-500" />
                                <span className="text-sm uppercase tracking-wider">Top rated status pending</span>
                            </div>
                        </div>

                        {/* Review Tip */}
                        <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                                <Quote className="w-4 h-4" />
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-blue-900">Pro Tip</h5>
                                <p className="text-sm text-blue-700 mt-1">
                                    High-quality feedback helps other students find you faster! Encourage your students to leave a review after your sessions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default MentorAchievementsPage;
