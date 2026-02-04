import {
    Award, Download, ExternalLink, ShieldCheck,
    Search, Filter, ChevronRight, Star,
    GraduationCap
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

interface Certificate {
    id: string;
    title: string;
    instructor: string;
    date: string;
    credentialId: string;
    type: 'platinum' | 'gold' | 'silver';
    grade: string;
}

export default function CertificationsPage() {
    const certificates: Certificate[] = [
        {
            id: '1',
            title: 'Advanced Neural Networks & GANs',
            instructor: 'Dr. Aris Thorne',
            date: 'Jan 15, 2026',
            credentialId: 'MEN-882-QX-2026',
            type: 'platinum',
            grade: 'Grade: A+'
        },
        {
            id: '2',
            title: 'Full Stack Web Architecture',
            instructor: 'Prof. Marcus Vane',
            date: 'Dec 10, 2025',
            credentialId: 'MEN-441-FS-2025',
            type: 'gold',
            grade: 'Grade: A'
        },
        {
            id: '3',
            title: 'UI/UX Design Systems',
            instructor: 'Sarah Chen',
            date: 'Nov 05, 2025',
            credentialId: 'MEN-112-UI-2025',
            type: 'silver',
            grade: 'Grade: B+'
        }
    ];

    const inProgress = [
        { title: 'Cloud Infrastructure Mastery', progress: 85, nextMilestone: 'Final Exam' },
        { title: 'AI Ethics & Policy', progress: 40, nextMilestone: 'Case Study 2' }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-10 pb-16">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Your Achievements
                            <div className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-bold uppercase tracking-widest border border-amber-200">
                                {certificates.length} Verified
                            </div>
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 text-lg">Download and share your verifiable learning credentials</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search certificates..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 w-64 shadow-sm"
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                            <Filter className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Main Certificates Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {certificates.map((cert) => (
                        <div
                            key={cert.id}
                            className={`relative group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ${cert.type === 'platinum' ? 'ring-2 ring-indigo-500/10' :
                                cert.type === 'gold' ? 'ring-2 ring-amber-500/10' : ''
                                }`}
                        >
                            {/* Decorative Background Elements */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${cert.type === 'platinum' ? 'bg-indigo-600' :
                                cert.type === 'gold' ? 'bg-amber-600' : 'bg-gray-600'
                                }`}></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all duration-500 ${cert.type === 'platinum' ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white' :
                                        cert.type === 'gold' ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' :
                                            'bg-gradient-to-br from-gray-500 to-slate-700 text-white'
                                        }`}>
                                        <Award className="w-7 h-7" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 mb-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            Verified
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cert.date}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight min-h-[3.5rem] line-clamp-2">
                                    {cert.title}
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instructor</p>
                                            <p className="text-sm font-bold text-gray-700">{cert.instructor}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                            <Star className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Achievement</p>
                                            <p className="text-sm font-bold text-gray-700">{cert.grade}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50/50 rounded-2xl mb-8 border border-gray-100/50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Credential ID</p>
                                    <p className="text-xs font-mono font-bold text-gray-600 text-center select-all">{cert.credentialId}</p>
                                </div>

                                <div className="flex gap-3">
                                    <button className="flex-1 bg-gray-900 text-white py-3 rounded-2xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200">
                                        <Download className="w-4 h-4" />
                                        PDF Download
                                    </button>
                                    <button className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all shadow-sm">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* In Progress Section */}
                <div className="pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Next in Line</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {inProgress.map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                    <div className="relative flex items-center justify-center">
                                        <svg className="w-12 h-12 transform -rotate-90">
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="20"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="transparent"
                                                className="text-gray-100"
                                            />
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="20"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="transparent"
                                                strokeDasharray={125.6}
                                                strokeDashoffset={125.6 * (1 - item.progress / 100)}
                                                className="text-indigo-600"
                                            />
                                        </svg>
                                        <span className="absolute text-[10px] font-black">{item.progress}%</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500 font-medium tracking-tight">Next: <span className="font-bold text-indigo-500">{item.nextMilestone}</span></p>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Invite/Special Card */}
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-[2rem] text-white shadow-xl shadow-amber-100/20 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-lg mb-1">Unlock 100% Scholarship</h4>
                                <p className="text-white/80 text-xs">Complete 2 more courses with A+ grade to qualify for the Mentozy Global Fellowship.</p>
                            </div>
                            <button className="mt-4 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 px-4 text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all self-start">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
