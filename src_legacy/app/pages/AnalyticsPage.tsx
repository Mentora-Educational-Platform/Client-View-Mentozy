import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Clock, BookOpen, Target,
    Award, Brain, Zap, ChevronUp
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

const studyData = [
    { name: 'Mon', hours: 4.5 },
    { name: 'Tue', hours: 6.2 },
    { name: 'Wed', hours: 3.8 },
    { name: 'Thu', hours: 5.5 },
    { name: 'Fri', hours: 7.0 },
    { name: 'Sat', hours: 2.5 },
    { name: 'Sun', hours: 4.0 },
];

const subjectData = [
    { name: 'Artificial Intelligence', value: 45, color: '#f59e0b' },
    { name: 'Full Stack Dev', value: 30, color: '#10b981' },
    { name: 'UI/UX Design', value: 15, color: '#ef4444' },
    { name: 'Cloud Computing', value: 10, color: '#6366f1' },
];

const growthData = [
    { month: 'Jan', score: 20 },
    { month: 'Feb', score: 35 },
    { month: 'Mar', score: 48 },
    { month: 'Apr', score: 55 },
    { month: 'May', score: 72 },
    { month: 'Jun', score: 85 },
];

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Performance Analytics</h1>
                        <p className="text-gray-500 font-medium">Track your learning journey and knowledge evolution</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex flex-col items-end px-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Progress</span>
                            <span className="text-sm font-bold text-emerald-600">85% Complete</span>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Top Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Study Hours', value: '142.5', sub: '+12% this week', icon: Clock, color: 'bg-amber-50 text-amber-600' },
                        { label: 'Quizzes Done', value: '28', sub: '92% Accuracy', icon: Target, color: 'bg-rose-50 text-rose-600' },
                        { label: 'Books Read', value: '14', sub: '5 in progress', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
                        { label: 'Knowledge Level', value: 'Advanced', sub: 'Top 5% of class', icon: Brain, color: 'bg-indigo-50 text-indigo-600' },
                    ].map((stat: { label: string, value: string, sub: string, icon: any, color: string }, i: number) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                    <ChevronUp className="w-3 h-3" />
                                    12%
                                </div>
                            </div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</h3>
                            <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                            <p className="text-xs text-gray-500 font-medium">{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Bar Chart: Study Hours */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Study Activity
                            </h3>
                            <select className="bg-gray-50 border-none rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer">
                                <option>This Week</option>
                                <option>Last Week</option>
                            </select>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={studyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#fef3c7', radius: 10 }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="hours" fill="#d97706" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Area Chart: Knowledge Growth */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-indigo-500" />
                                Knowledge Matrix
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                <span className="text-xs font-bold text-gray-500">Skill Score</span>
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart: Subject Distribution */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden lg:col-span-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-8">Skill Breakdown</h3>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="h-64 w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={subjectData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {subjectData.map((entry: { color: string }, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 space-y-4">
                                {subjectData.map((item: { name: string, value: number, color: string }, i: number) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-gray-400">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Badges & Achievements Area */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 lg:col-span-1 overflow-hidden relative">
                        <Award className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10 -rotate-12" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-6">Recent Achievements</h3>
                            <div className="space-y-6">
                                {[
                                    { title: 'Consistency King', desc: '14-day study streak maintained', date: 'Earned 2 days ago' },
                                    { title: 'Top Contributor', desc: 'Answered 50 peer questions', date: 'Earned last week' },
                                    { title: 'Project Master', desc: 'Completed 5 major AI projects', date: 'In progress - 80%' },
                                ].map((badge: { title: string, desc: string, date: string }, i: number) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white/20 transition-all">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{badge.title}</h4>
                                            <p className="text-white/70 text-sm mb-1">{badge.desc}</p>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{badge.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-8 w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                                View All Badges
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
