
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { BookOpen, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CreateCoursePage() {
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 'Intermediate',
        duration: '4 Weeks',
        price: '0'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulation of API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Course Created Successfully!");
            // Reset or Redirect
            setFormData({ title: '', description: '', level: 'Intermediate', duration: '4 Weeks', price: '0' });
        }, 1500);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
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
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
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
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-center text-gray-400">
                                    <p className="text-sm">Modules configurator coming soon...</p>
                                </div>
                            </div>

                            <button type="button" className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Add Module
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 flex justify-end gap-3">
                            <button type="button" className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                <Save className="w-4 h-4" />
                                Create Course
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
