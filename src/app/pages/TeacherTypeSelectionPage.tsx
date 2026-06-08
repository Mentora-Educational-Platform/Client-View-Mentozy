import { User, Building, ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MENTOR_APPLICATIONS_URL = 'https://applications.mentozy.app/';

export function TeacherTypeSelectionPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-mono text-gray-900">
            {/* Header */}
            <div className="bg-white border-b-4 border-gray-900 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/signup')} 
                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-55 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div 
                        className="flex items-center gap-3 cursor-pointer group border-4 border-gray-900 bg-white px-3 py-1.5 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all" 
                        onClick={() => navigate('/')}
                    >
                        <span className="text-xl font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
                        <div className="w-3.5 h-3.5 bg-[#f39c12] border-2 border-gray-900"></div>
                    </div>
                </div>
            </div>

            {/* Selection Area */}
            <div className="flex-grow flex items-center justify-center p-6 md:p-12">
                <div className="max-w-4xl w-full">
                    {/* Header */}
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-6">
                            Role Selection
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight leading-none">
                            Join Mentozy as a <span className="bg-[#f39c12] border-4 border-gray-900 px-2 py-1 rotate-1 inline-block">Teacher</span>
                        </h1>
                        <p className="text-sm md:text-base text-gray-700 font-bold uppercase leading-relaxed max-w-xl mx-auto">
                            Choose how you want to teach on Mentozy.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Individual Teacher Card */}
                        <div
                            onClick={() => window.open(MENTOR_APPLICATIONS_URL, '_blank', 'noopener,noreferrer')}
                            className="bg-white p-10 border-4 border-gray-900 cursor-pointer shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col items-center text-center group"
                        >
                            <div className="w-20 h-20 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center text-gray-900 mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300">
                                <User className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight group-hover:text-[#f39c12] transition-colors">Individual Mentor</h3>
                            <p className="text-gray-700 font-bold leading-relaxed text-xs mb-8 uppercase flex-1">
                                Apply with us to become a mentor via our applications portal.
                            </p>
                            <div className="w-full py-4 border-4 border-gray-900 bg-[#f39c12] text-gray-900 text-sm font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:bg-[#e08e0b] transition-all flex items-center justify-center gap-2">
                                Apply <ChevronRight className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Organisation Card */}
                        <div
                            onClick={() => navigate('/org-onboarding')}
                            className="bg-white p-10 border-4 border-gray-900 cursor-pointer shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col items-center text-center group"
                        >
                            <div className="w-20 h-20 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center text-gray-900 mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300">
                                <Building className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight group-hover:text-[#f39c12] transition-colors">Organisation</h3>
                            <p className="text-gray-700 font-bold leading-relaxed text-xs mb-8 uppercase flex-1">
                                For institutes, schools, and coaching centers managing multiple students and staff.
                            </p>
                            <div className="w-full py-4 border-4 border-gray-900 bg-[#f39c12] text-gray-900 text-sm font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:bg-[#e08e0b] transition-all flex items-center justify-center gap-2">
                                Onboard <ChevronRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherTypeSelectionPage;
