import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { BookOpen, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CourseModulesEditor, Module } from '../components/course/CourseModulesEditor';
import { createCourse } from '../../lib/api';
import { getSupabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function CreateCoursePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchingDraft, setFetchingDraft] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [actionStatus, setActionStatus] = useState<'published' | 'draft'>('published');
    const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

    const [activeTab, setActiveTab] = useState<'basic' | 'curriculum' | 'pricing'>('basic');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 'Intermediate',
        duration: '4 Weeks',
        price: '0'
    });

    const [modules, setModules] = useState<Module[]>([]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const editId = queryParams.get('edit');

        if (editId) {
            setFetchingDraft(true);
            setEditingCourseId(parseInt(editId));

            async function fetchDraft() {
                try {
                    const supabase = getSupabase();
                    if (!supabase) return;

                    const { data, error } = await supabase
                        .from('tracks')
                        .select('*, track_modules(*)')
                        .eq('id', editId)
                        .single();

                    if (data && !error) {
                        setFormData({
                            title: data.title || '',
                            description: data.description || '',
                            level: data.level || 'Intermediate',
                            duration: data.duration_weeks ? `${data.duration_weeks} Weeks` : '4 Weeks',
                            price: '0' // Defaulting as it's not in DB schema yet
                        });

                        if (data.track_modules && data.track_modules.length > 0) {
                            const sortedModules = data.track_modules.sort((a: any, b: any) => a.module_order - b.module_order);
                            setModules(sortedModules.map((m: any, idx: number) => {
                                if (m.content) {
                                    return {
                                        ...m.content,
                                        id: m.id || m.content.id || `module-${idx}`
                                    };
                                }
                                return {
                                    id: m.id || `module-${idx}`,
                                    title: m.title,
                                    description: '',
                                    duration: m.duration || '1 Week',
                                    objectives: [],
                                    lessons: []
                                };
                            }));
                        }
                    }
                } catch (err) {
                    console.error("Error fetching draft", err);
                } finally {
                    setFetchingDraft(false);
                }
            }

            fetchDraft();
        }
    }, [location.search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const success = await createCourse(
            editingCourseId,
            {
                title: formData.title,
                description: formData.description,
                level: formData.level,
                duration: formData.duration,
            },
            modules,
            user?.id,
            actionStatus
        );

        setLoading(false);

        if (success) {
            toast.success(actionStatus === 'draft' ? "Course Saved as Draft!" : "Course Published Successfully!");
            setFormData({ title: '', description: '', level: 'Intermediate', duration: '4 Weeks', price: '0' });
            setModules([]);
            navigate('/mentor-courses');
        } else {
            toast.error("Failed to save course. Please try again.");
        }
    };

    if (fetchingDraft) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh] font-mono text-gray-900 bg-[#FAF9F6]">
                    <div className="w-10 h-10 border-4 border-gray-900 border-t-[#f39c12] rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-20 font-mono text-gray-900">
                <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                    <div className="text-left">
                        <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-gray-900 bg-white text-xs font-black uppercase tracking-wider mb-3 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            Course Creator
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{editingCourseId ? 'Edit Course Draft' : 'Create New Course'}</h1>
                        <p className="text-xs text-gray-600 mt-2 uppercase font-bold">Build a professional, structured learning path for your students.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={(e) => {
                                setActionStatus('draft');
                                handleSubmit(e as any);
                            }}
                            disabled={loading}
                            className="px-6 py-3 bg-white border-4 border-gray-900 text-gray-900 font-black text-xs uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                setActionStatus('published');
                                handleSubmit(e as any);
                            }}
                            disabled={loading}
                            className="px-6 py-3 bg-[#f39c12] border-4 border-gray-900 text-gray-900 font-black text-xs uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                        >
                            {loading && actionStatus === 'published' && <div className="w-4 h-4 border-2 border-gray-950 border-t-white rounded-full animate-spin" />}
                            <Save className="w-4 h-4" />
                            Publish Course
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Coursera-style Left Sidebar (Neobrutalist) */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-white border-4 border-gray-900 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 px-2">Course Setup</h2>
                            <ul className="space-y-2">
                                {['basic', 'curriculum', 'pricing'].map((tab) => {
                                    const label = tab === 'basic' ? 'Basic Info' : tab === 'curriculum' ? 'Curriculum' : 'Pricing & Settings';
                                    const isActive = activeTab === tab;
                                    return (
                                        <li key={tab}>
                                            <button 
                                                onClick={() => setActiveTab(tab as any)} 
                                                className={`w-full text-left px-4 py-3 border-2 transition-all flex items-center gap-3 text-xs font-black uppercase ${isActive ? 'bg-[#f39c12] border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-gray-900' : 'text-gray-750 border-transparent hover:bg-gray-50'}`}
                                            >
                                                <div className={`w-2 h-2 border border-gray-900 ${isActive ? 'bg-black' : 'bg-transparent'}`} />
                                                {label}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 text-left">
                        <form id="course-form" onSubmit={handleSubmit} className="bg-white border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] p-8 min-h-[600px]">
                            
                            {/* BASIC INFO TAB */}
                            {activeTab === 'basic' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 mb-6 border-b-4 border-gray-900 pb-4 uppercase tracking-tight">Basic Information</h2>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-900 mb-1.5">Course Title *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Advanced System Design & Architecture"
                                                className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none focus:bg-[#eff3ff]"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                            <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">A clear, descriptive title helps students understand what they will learn.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-900 mb-1.5">Description *</label>
                                            <textarea
                                                rows={5}
                                                required
                                                placeholder="What will students learn in this course? Describe the target audience and core topics."
                                                className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none focus:bg-[#eff3ff] resize-none"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                                            <div>
                                                <label className="block text-xs font-black uppercase text-gray-900 mb-1.5">Level *</label>
                                                <select
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none cursor-pointer"
                                                    value={formData.level}
                                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                                >
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Advanced</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase text-gray-900 mb-1.5">Estimated Duration *</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 4 Weeks"
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase outline-none"
                                                    value={formData.duration}
                                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-end border-t-2 border-gray-900">
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('curriculum')}
                                            className="px-6 py-3 bg-gray-900 text-white font-black text-xs uppercase hover:bg-gray-800 transition-colors"
                                        >
                                            Save & Continue to Curriculum
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CURRICULUM TAB */}
                            {activeTab === 'curriculum' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 mb-2 border-b-4 border-gray-900 pb-4 flex items-center gap-3 uppercase tracking-tight">
                                            <BookOpen className="w-6 h-6 text-[#f39c12]" />
                                            Curriculum Builder
                                        </h2>
                                        <p className="text-xs text-gray-500 font-bold uppercase mt-3 mb-6">Start putting together your course syllabus by creating modules (weeks), topics, readings, and practice quizzes.</p>
                                    </div>
                                    
                                    <CourseModulesEditor modules={modules} onChange={setModules} />

                                    <div className="pt-8 flex justify-between border-t-2 border-gray-900">
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('basic')}
                                            className="px-5 py-3 border-2 border-gray-900 bg-white font-black text-xs uppercase hover:bg-gray-100 transition-colors"
                                        >
                                            Back to Basic Info
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('pricing')}
                                            className="px-6 py-3 bg-gray-900 text-white font-black text-xs uppercase hover:bg-gray-800 transition-colors"
                                        >
                                            Save & Continue to Pricing
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PRICING TAB */}
                            {activeTab === 'pricing' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 mb-6 border-b-4 border-gray-900 pb-4 uppercase tracking-tight">Pricing & Settings</h2>
                                    </div>
                                    
                                    <div className="bg-[#FAF9F6] border-4 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                            <div>
                                                <h3 className="font-black text-gray-900 text-sm uppercase">Course Price ($)</h3>
                                                <p className="text-xs text-gray-655 mt-1 font-bold uppercase">Set a price or make it freely available to the global community.</p>
                                            </div>
                                            <label className="flex items-center cursor-pointer gap-3 bg-white px-4 py-2 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                <span className="text-xs font-black uppercase text-gray-700">Make it Free</span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={formData.price === '0'}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, price: e.target.checked ? '0' : '' })
                                                        }}
                                                    />
                                                    <div className={`block w-10 h-6 border-2 border-gray-900 transition-colors ${formData.price === '0' ? 'bg-[#f39c12]' : 'bg-gray-200'}`}></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white border border-gray-900 w-4 h-4 transition-transform ${formData.price === '0' ? 'transform translate-x-4' : ''}`}></div>
                                                </div>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="e.g. 49"
                                            min="0"
                                            disabled={formData.price === '0'}
                                            className={`w-full max-w-sm px-4 py-3 border-2 border-gray-900 outline-none text-sm font-bold transition-all uppercase ${formData.price === '0' ? 'bg-gray-150 opacity-50 cursor-not-allowed' : 'bg-white'}`}
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-8 flex justify-between border-t-2 border-gray-900">
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('curriculum')}
                                            className="px-5 py-3 border-2 border-gray-900 bg-white font-black text-xs uppercase hover:bg-gray-100 transition-colors"
                                        >
                                            Back to Curriculum
                                        </button>
                                        <button 
                                            type="submit"
                                            onClick={() => setActionStatus('published')}
                                            disabled={loading}
                                            className="px-6 py-3 bg-[#f39c12] border-4 border-gray-900 text-gray-900 font-black text-xs uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                                        >
                                            {loading && actionStatus === 'published' && <div className="w-4 h-4 border-2 border-gray-950 border-t-white rounded-full animate-spin" />}
                                            <Save className="w-5 h-5" />
                                            Publish Course Now
                                        </button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default CreateCoursePage;
