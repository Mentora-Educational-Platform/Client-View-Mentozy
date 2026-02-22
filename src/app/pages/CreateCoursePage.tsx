
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

    // Form State
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
                            setModules(sortedModules.map((m: any, idx: number) => ({
                                id: m.id || `module-${idx}`,
                                title: m.title,
                                description: '',
                                duration: m.duration || '1 Week',
                                objectives: [],
                                lessons: [] // Full recursive fetch would be needed here, keeping simple for now
                            })));
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

        const moduleTitles = modules.map(m => m.title || 'Untitled Module');

        const success = await createCourse(
            editingCourseId,
            {
                title: formData.title,
                description: formData.description,
                level: formData.level,
                duration: formData.duration,
            },
            moduleTitles,
            user?.id,
            actionStatus
        );

        setLoading(false);

        if (success) {
            toast.success(actionStatus === 'draft' ? "Course Saved as Draft!" : "Course Published Successfully!");
            // Reset state
            setFormData({ title: '', description: '', level: 'Intermediate', duration: '4 Weeks', price: '0' });
            setModules([]);

            // Redirect to mentor courses
            navigate('/mentor-courses');
        } else {
            toast.error("Failed to save course. Please try again.");
        }
    };

    if (fetchingDraft) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{editingCourseId ? 'Edit Course Draft' : 'Create New Course'}</h1>
                    <p className="text-gray-500 mt-2">Share your knowledge with the world. Create a structured learning path.</p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Course Header Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Advanced React Patterns"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    required
                                    placeholder="What will students learn in this course?"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Level</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                    value={formData.level}
                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 4 Weeks"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Price ($)</label>
                                    <label className="flex items-center cursor-pointer gap-2">
                                        <span className="text-sm font-bold text-gray-500">Make it Free</span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.price === '0'}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, price: e.target.checked ? '0' : '' })
                                                }}
                                            />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${formData.price === '0' ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.price === '0' ? 'transform translate-x-4' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    disabled={formData.price === '0'}
                                    className={`w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all ${formData.price === '0' ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-gray-50'}`}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Modules Placeholder */}
                        <div className="pt-6 border-t border-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-amber-500" />
                                Course Modules
                            </h3>

                            <div className="space-y-4 mb-4">
                                <CourseModulesEditor modules={modules} onChange={setModules} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/mentor-dashboard')}
                                className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={() => setActionStatus('draft')}
                                disabled={loading}
                                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors active:scale-95 flex items-center gap-2"
                            >
                                Save as Draft
                            </button>
                            <button
                                type="submit"
                                onClick={() => setActionStatus('published')}
                                disabled={loading}
                                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                {loading && actionStatus === 'published' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                <Save className="w-4 h-4" />
                                Publish Course
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
