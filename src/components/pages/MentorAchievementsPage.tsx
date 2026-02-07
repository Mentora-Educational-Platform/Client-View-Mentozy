import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Award, Star, ThumbsUp, Medal, Crown, Quote } from 'lucide-react';

export function MentorAchievementsPage() {

    const achievements = [
        { id: 1, title: 'Top Rated', description: 'Maintained a 5.0 rating for 3 months', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
        { id: 2, title: 'Super Mentor', description: 'Completed 100+ sessions', icon: Crown, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        { id: 3, title: 'Fast Responder', description: 'Replies within 1 hour usually', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    ];

    const reviews = [
        { id: 1, student: "Alex Chen", role: "Computer Science Student", text: "Dr. Thorne explains complex topics with such clarity. The session on Neural Networks was a game changer for my project!", rating: 5, date: "2 days ago" },
        { id: 2, student: "Sarah Miller", role: "Data Science Major", text: "Incredibly patient and knowledgeable. Highly recommended!", rating: 5, date: "1 week ago" },
        { id: 3, student: "Jordan Lee", role: "AI Enthusiast", text: "Great insights into the industry. Helped me prepare for my interview perfectly.", rating: 5, date: "2 weeks ago" }
    ];

    function Zap({ className }: { className?: string }) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10 pb-20">
                {/* Header */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-gray-900 to-indigo-900 p-10 text-white shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <Award className="w-8 h-8 text-amber-400" />
                            </div>
                            <h1 className="text-4xl font-black">Achievements & Reviews</h1>
                        </div>
                        <p className="text-gray-300 text-lg max-w-2xl">Your impact visualized. See what badges you've earned and what students are saying about you.</p>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
                </div>

                {/* Badges Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Medal className="w-6 h-6 text-indigo-600" />
                        Your Badges
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {achievements.map(badge => (
                            <div key={badge.id} className={`p-6 rounded-[2rem] border ${badge.border} ${badge.bg} flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 shadow-sm hover:shadow-md cursor-default`}>
                                <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 ${badge.color}`}>
                                    <badge.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{badge.title}</h3>
                                <p className="text-sm font-medium text-gray-500">{badge.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ThumbsUp className="w-6 h-6 text-emerald-600" />
                        Student Reviews
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {reviews.map(review => (
                            <div key={review.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-lg">
                                        {review.student.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{review.student}</h4>
                                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{review.role}</p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                <span className="font-bold text-amber-700">{review.rating}.0</span>
                                            </div>
                                        </div>
                                        <div className="relative bg-gray-50 p-6 rounded-2xl rounded-tl-none mt-2">
                                            <Quote className="absolute top-4 left-4 w-6 h-6 text-gray-200" />
                                            <p className="text-gray-700 italic relative z-10 pl-6">"{review.text}"</p>
                                        </div>
                                        <div className="mt-3 text-right text-xs font-bold text-gray-400">
                                            {review.date}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
