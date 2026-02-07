"use client";
import { useState, useEffect } from 'react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react';

export function MentorAnalyticsPage() {
    // Mock Data for Analytics
    const earningsData = [
        { name: 'Jan', value: 450 },
        { name: 'Feb', value: 620 },
        { name: 'Mar', value: 580 },
        { name: 'Apr', value: 850 },
        { name: 'May', value: 1200 },
        { name: 'Jun', value: 980 },
    ];

    const sessionData = [
        { name: 'Mon', sessions: 2 },
        { name: 'Tue', sessions: 4 },
        { name: 'Wed', sessions: 1 },
        { name: 'Thu', sessions: 5 },
        { name: 'Fri', sessions: 3 },
        { name: 'Sat', sessions: 6 },
        { name: 'Sun', sessions: 2 },
    ];

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
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">Total Earnings</span>
                            </div>
                            <div className="text-4xl font-black text-gray-900 mb-1">$4,680</div>
                            <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                                <TrendingUp className="w-4 h-4" />
                                +12% from last month
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">Mentoring Hours</span>
                            </div>
                            <div className="text-4xl font-black text-gray-900 mb-1">128.5</div>
                            <div className="flex items-center gap-1 text-indigo-600 text-sm font-bold">
                                <TrendingUp className="w-4 h-4" />
                                +5.4% from last month
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">Unique Students</span>
                            </div>
                            <div className="text-4xl font-black text-gray-900 mb-1">42</div>
                            <div className="flex items-center gap-1 text-amber-600 text-sm font-bold">
                                <TrendingUp className="w-4 h-4" />
                                +3 new this week
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Revenue Growth</h3>
                            <select className="bg-gray-50 border-none text-sm font-bold text-gray-600 rounded-xl px-4 py-2 focus:ring-0">
                                <option>Last 6 Months</option>
                                <option>Last Year</option>
                            </select>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={earningsData}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => [`$${value}`, 'Earnings']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorEarnings)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sessions Bar Chart */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Weekly Activity</h3>
                            <div className="text-sm font-bold text-gray-400">Total: 23 Sessions</div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sessionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6', radius: 4 }}
                                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '1rem', border: 'none' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="sessions" radius={[10, 10, 10, 10]} barSize={40}>
                                        {sessionData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 3 ? '#6366f1' : '#e0e7ff'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
