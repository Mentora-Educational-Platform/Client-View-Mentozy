
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Briefcase, User, Building, Award, CheckCircle2 } from 'lucide-react';
import { APPLICATIONS_REDIRECT_URL } from '../components/ApplicationFormModal';

export function MentorOnboardingPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '',
        company: '',
        expertise: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);

        const payload = {
            full_name: formData.fullName.trim(),
            email: formData.email.trim(),
            job_role: formData.role.trim(),
            company: formData.company.trim(),
            expertise: formData.expertise
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            submitted_at: new Date().toISOString(),
        };

        try {
            if (supabase) {
                const { error } = await supabase.from('mentor_applications').insert(payload);
                if (error) {
                    console.warn('Could not save mentor application to Supabase:', error.message);
                }
            }
        } catch (err) {
            console.warn('Mentor application submit error:', err);
        }

        toast.success("Application submitted", {
            description: `Thanks ${formData.fullName.split(' ')[0] || 'there'}! Redirecting you to the mentor application space…`,
        });

        setTimeout(() => {
            window.location.href = '/mentor/apply';
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 transform rotate-12">
                        <span className="text-white font-black text-2xl -rotate-12">M</span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Apply as Mentor</h2>
                    <p className="text-gray-500 font-medium">
                        Tell us about yourself to begin your application on Mentozy.
                    </p>
                </div>

                <div className="bg-white py-10 px-10 shadow-2xl shadow-gray-200/[0.5] rounded-[2.5rem] border border-gray-100">

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                    placeholder="Ex. Jane Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                placeholder="jane@company.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="role"
                                        type="text"
                                        required
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                        placeholder="Ex. Sr. Engineer"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="company"
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                        placeholder="Ex. Tech Corp"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Key Expertise (comma separated)</label>
                            <div className="relative">
                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="expertise"
                                    type="text"
                                    required
                                    value={formData.expertise}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                    placeholder="Ex. React, System Design, Leadership"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Mentor Application <CheckCircle2 className="w-5 h-5" /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
