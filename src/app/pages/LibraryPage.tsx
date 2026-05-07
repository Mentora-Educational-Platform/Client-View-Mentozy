import {
    BookOpen, FileText, Image as ImageIcon, Download,
    Search, Filter, Eye, Share2, FileSpreadsheet, X, Upload, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const categories = ['All', 'PDFs', 'Images', 'Formula Sheets', 'Data Sheets'];

// Interface for our database resources
interface LibraryResource {
    id: string;
    title: string;
    category: string;
    author_name: string;
    file_url: string;
    tags: string[];
    downloads: number;
    views: number;
    likes?: number;
}

// Default items if DB is empty
const defaultItems: LibraryResource[] = [
    {
        id: 'default-1',
        title: 'Mensuration & Formula Sheet',
        category: 'Formula Sheets',
        author_name: 'Math Mentor',
        downloads: 1205,
        views: 3400,
        file_url: '/library/mensuration.png',
        tags: ['Maths', 'Geometry', 'Mensuration'],
        likes: 245
    },
    {
        id: 'default-2',
        title: 'Trigonometry - Formula Sheet',
        category: 'Formula Sheets',
        author_name: 'Student Contributor',
        downloads: 854,
        views: 2100,
        file_url: '/library/trigonometry.png',
        tags: ['Maths', 'Trigonometry', 'Formulas'],
        likes: 189
    },
    {
        id: 'default-3',
        title: 'Pipes & Cisterns Complete Exam Revision',
        category: 'Data Sheets',
        author_name: 'EduSphere Academy',
        downloads: 432,
        views: 1800,
        file_url: '/library/pipes.png',
        tags: ['Aptitude', 'Exam Prep', 'Revision'],
        likes: 92
    },
    {
        id: 'default-4',
        title: 'How a Hydraulic Press Works?',
        category: 'Images',
        author_name: 'Physics Mentor',
        downloads: 673,
        views: 2900,
        file_url: '/library/press.png',
        tags: ['Physics', 'Mechanics', 'Engineering'],
        likes: 310
    },
    {
        id: 'default-5',
        title: 'How a CNC Machine Works?',
        category: 'Images',
        author_name: 'Tech Student',
        downloads: 1540,
        views: 4200,
        file_url: '/library/cnc.png',
        tags: ['Engineering', 'CNC', 'Manufacturing'],
        likes: 134
    }
];

export function LibraryPage() {
    const { user } = useAuth();
    const [resources, setResources] = useState<LibraryResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [likedResources, setLikedResources] = useState<Set<string>>(new Set());

    // Load liked posts from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('mentozy_liked_resources');
        if (stored) {
            try {
                setLikedResources(new Set(JSON.parse(stored)));
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    // Preview Modal State
    const [previewResource, setPreviewResource] = useState<LibraryResource | null>(null);

    // Upload Modal State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadCategory, setUploadCategory] = useState('PDFs');
    const [uploadTags, setUploadTags] = useState('');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('library_resources')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setResources(data && data.length > 0 ? data : defaultItems);
        } catch (error) {
            console.error('Error fetching resources:', error);
            // Fallback for demonstration since we just created the table
            setResources(defaultItems);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !supabase) {
            toast.error('You must be logged in to upload');
            return;
        }
        if (!fileToUpload || !uploadTitle.trim()) {
            toast.error('Please provide a file and a title');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload file to storage
            const fileExt = fileToUpload.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('library_files')
                .upload(filePath, fileToUpload);

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('library_files')
                .getPublicUrl(filePath);

            // 3. Save to database
            const tagsArray = uploadTags.split(',').map(tag => tag.trim()).filter(Boolean);
            const { error: dbError } = await supabase
                .from('library_resources')
                .insert({
                    title: uploadTitle,
                    category: uploadCategory,
                    author_id: user.id,
                    author_name: user?.user_metadata?.full_name || 'Anonymous User',
                    file_url: publicUrl,
                    tags: tagsArray
                });

            if (dbError) throw dbError;

            toast.success('Resource shared successfully!');
            setIsUploadOpen(false);
            setFileToUpload(null);
            setUploadTitle('');
            setUploadTags('');
            fetchResources(); // Refresh list
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(error.message || 'Failed to upload resource');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (resource: LibraryResource) => {
        if (!supabase) return;
        try {
            // Because they are hosted possibly on cross-origin storage, standard "a.download" alone might fail.
            // A more robust method is to fetch it as blob then download.
            const response = await fetch(resource.file_url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = resource.title + (resource.file_url.endsWith('.png') ? '.png' : '.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            // Increment download count
            const { error } = await supabase
                .from('library_resources')
                .update({ downloads: resource.downloads + 1 })
                .eq('id', resource.id);
            if (error) throw error;

            // Update local state to reflect the new count
            setResources(prev => prev.map(r => r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r));
        } catch (error) {
            console.error('Failed to increment download:', error);
            // Fallback opening
            window.open(resource.file_url, '_blank');
        }
    };

    const handleLike = async (resource: LibraryResource) => {
        if (!supabase) return;

        // Prevent duplicate likes from the same browser connection
        if (likedResources.has(resource.id)) {
            toast.info("You've already liked this resource!");
            return;
        }

        try {
            const currentLikes = resource.likes || 0;
            // Optimistic local update
            setResources(prev => prev.map(r => r.id === resource.id ? { ...r, likes: currentLikes + 1 } : r));

            // Add to local state & storage to disable button immediately
            const newLikedIds = new Set(likedResources).add(resource.id);
            setLikedResources(newLikedIds);
            localStorage.setItem('mentozy_liked_resources', JSON.stringify(Array.from(newLikedIds)));

            const { error } = await supabase
                .from('library_resources')
                .update({ likes: currentLikes + 1 })
                .eq('id', resource.id);
            if (error) throw error;
        } catch (error) {
            console.error('Failed to like resource:', error);
            // Revert on failure
            setResources(prev => prev.map(r => r.id === resource.id ? { ...r, likes: resource.likes } : r));

            // Remove from local tracked state if failure
            const revertedLikedIds = new Set(likedResources);
            revertedLikedIds.delete(resource.id);
            setLikedResources(revertedLikedIds);
            localStorage.setItem('mentozy_liked_resources', JSON.stringify(Array.from(revertedLikedIds)));
        }
    };

    const handlePreview = async (resource: LibraryResource) => {
        setPreviewResource(resource);

        if (!supabase) return;
        try {
            // Increment view count
            const { error } = await supabase
                .from('library_resources')
                .update({ views: resource.views + 1 })
                .eq('id', resource.id);
            if (error) throw error;

            // Update local state to reflect the new views count
            setResources(prev => prev.map(r => r.id === resource.id ? { ...r, views: r.views + 1 } : r));

            // Note: the preview modal itself shows the selected object's title/views/etc. 
            // It will keep the old count in the preview until refetched or closed/re-opened, 
            // or we could update setPreviewResource to the new object too, but it's fine.
        } catch (error) {
            console.error('Failed to increment views:', error);
        }
    };

    const getIconForCategory = (category: string) => {
        switch (category) {
            case 'Formula Sheets': return FileSpreadsheet;
            case 'Data Sheets': return FileText;
            case 'Images': return ImageIcon;
            default: return BookOpen;
        }
    };

    const getColorForCategory = (category: string) => {
        switch (category) {
            case 'Formula Sheets': return 'text-amber-500 bg-amber-100';
            case 'Data Sheets': return 'text-emerald-500 bg-emerald-100';
            case 'Images': return 'text-indigo-500 bg-indigo-100';
            default: return 'text-rose-500 bg-rose-100';
        }
    };

    const filteredItems = resources.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="pt-32 pb-32 bg-[#fafafa] dark:bg-slate-900 min-h-screen font-sans relative overflow-hidden transition-colors duration-300">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-20 w-80 h-80 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-40 right-20 w-96 h-96 bg-amber-100/40 dark:bg-amber-900/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium text-sm mb-6">
                        <BookOpen className="w-4 h-4" />
                        Free Open Library
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                        Discover & Share <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">Knowledge</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                        Access hundreds of free PDFs, formula sheets, data sheets, and resources shared openly by students and mentors.
                    </p>
                    <button
                        onClick={() => {
                            if (user) setIsUploadOpen(true)
                            else toast.error('You need to log in to upload resources!')
                        }}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-slate-900/20 dark:hover:shadow-amber-500/20"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Resource
                    </button>
                </motion.div>

                {/* Search and Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for resources, tags, or authors..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-amber-500/20 outline-none text-gray-700 dark:text-gray-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                            <Filter className="text-gray-400 dark:text-gray-500 w-5 h-5 ml-2 mr-1 hidden md:block" />
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-5 py-3 rounded-2xl whitespace-nowrap text-sm font-medium transition-all ${activeCategory === category
                                        ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 shadow-md'
                                        : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-amber-200 dark:border-slate-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading open resources...</p>
                    </div>
                )}

                {/* Library Bookshelves */}
                {!loading && (
                    <div className="space-y-12 md:space-y-20 pb-10">
                        {Array.from({ length: Math.ceil(filteredItems.length / 4) }).map((_, shelfIndex) => {
                            const shelfItems = filteredItems.slice(shelfIndex * 4, (shelfIndex + 1) * 4);
                            return (
                                <div key={shelfIndex} className="relative pt-4 pb-4 px-2 md:px-10">
                                    {/* The Shelf Line (Wood/Modern effect) */}
                                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 rounded-md shadow-[0_8px_15px_-3px_rgba(0,0,0,0.15)] border-t border-white/50 dark:border-slate-600/50 flex flex-col justify-end overflow-hidden">
                                        <div className="h-2 w-full bg-black/5 dark:bg-black/20" />
                                    </div>
                                    
                                    <div className="relative z-10 flex flex-wrap justify-center gap-6 md:gap-10 lg:gap-14 items-end">
                                        {shelfItems.map((item, index) => {
                                            const Icon = getIconForCategory(item.category);
                                            const spineColor = item.category === 'Formula Sheets' ? '#f59e0b' : 
                                                               item.category === 'Data Sheets' ? '#10b981' : 
                                                               item.category === 'Images' ? '#6366f1' : '#f43f5e';

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    className="group relative w-[160px] h-[220px] md:w-[200px] md:h-[280px] bg-white dark:bg-slate-800 rounded-r-xl rounded-l-sm border border-gray-200 dark:border-slate-700 shadow-md hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                                                    style={{
                                                        borderLeftWidth: '14px',
                                                        borderLeftColor: spineColor
                                                    }}
                                                >
                                                    {/* Spine Detail (Title sideways or simple line) */}
                                                    <div className="absolute left-[-14px] top-0 bottom-0 w-[14px] opacity-20 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

                                                    {/* Book Cover Design */}
                                                    <div className="p-4 md:p-5 flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 relative z-0">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${getColorForCategory(item.category).replace('bg-', 'dark:bg-').replace('text-', 'dark:text-')}`}>
                                                                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                                            </div>
                                                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400">
                                                                <Eye className="w-3 h-3" />
                                                                {item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-center">
                                                            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight line-clamp-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1 line-clamp-1">
                                                                By {item.author_name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Page Edges Simulation (bottom) */}
                                                    <div className="h-3 md:h-4 bg-gray-100 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600 border-b border-gray-300 dark:border-slate-800 flex flex-col justify-evenly px-2 pointer-events-none">
                                                        <div className="h-[1px] bg-gray-300/60 dark:bg-slate-600/60 w-full" />
                                                        <div className="h-[1px] bg-gray-300/60 dark:bg-slate-600/60 w-full" />
                                                    </div>

                                                    {/* Action Buttons overlayed on hover */}
                                                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4 z-20">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                                                            className="w-full py-2 bg-amber-400 text-slate-900 text-xs md:text-sm font-bold rounded-lg hover:bg-amber-300 transition-colors shadow-sm"
                                                        >
                                                            Preview
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                                                            className="w-full py-2 bg-white/10 text-white text-xs md:text-sm font-bold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                                        >
                                                            <Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> Download
                                                        </button>
                                                        <div className="flex gap-2 w-full mt-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleLike(item); }}
                                                                className={`flex-1 py-1.5 md:py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm ${likedResources.has(item.id) ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                                                title="Like"
                                                            >
                                                                <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${likedResources.has(item.id) ? 'fill-current' : ''}`} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    navigator.clipboard.writeText(item.file_url);
                                                                    toast.success("Link copied!");
                                                                }}
                                                                className="flex-1 py-1.5 md:py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors shadow-sm"
                                                                title="Share"
                                                            >
                                                                <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No resources found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">There are currently no resources available. Be the first to share one!</p>
                        {!user && <p className="text-sm text-gray-400 dark:text-gray-500">You need to log in to share resources.</p>}
                    </div>
                )}

            </div>

            {/* UPload Modal */}
            <AnimatePresence>
                {isUploadOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => !uploading && setIsUploadOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-slate-800 rounded-[2rem] p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-700"
                        >
                            <button
                                onClick={() => setIsUploadOpen(false)}
                                disabled={uploading}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Upload className="w-6 h-6 text-amber-500" /> Share Resource
                            </h3>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={uploadTitle}
                                        onChange={e => setUploadTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-white"
                                        placeholder="E.g. React Cheat Sheet"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                        <select
                                            value={uploadCategory}
                                            onChange={e => setUploadCategory(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-white"
                                        >
                                            {categories.filter(c => c !== 'All').map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={uploadTags}
                                        onChange={e => setUploadTags(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-white"
                                        placeholder="Math, Algebra, Forms..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">File</label>
                                    <input
                                        type="file"
                                        required
                                        onChange={e => setFileToUpload(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 dark:file:bg-amber-900/50 file:text-amber-700 dark:file:text-amber-400 hover:file:bg-amber-200 dark:text-gray-300"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full mt-4 py-4 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md"
                                >
                                    {uploading ? 'Uploading...' : 'Upload & Share'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewResource && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setPreviewResource(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-slate-800 rounded-[2rem] p-6 md:p-8 w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-700"
                        >
                            <button
                                onClick={() => setPreviewResource(null)}
                                className="absolute right-6 top-6 z-10 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-6 mr-14">
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{previewResource.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>By {previewResource.author_name}</span>
                                    <span>•</span>
                                    <span>{previewResource.category}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-2 mb-6 flex items-center justify-center min-h-[400px]">
                                {/* Try to render an image. If it's a PDF or something else, showing in an iframe is an option, or simple fallback message */}
                                {previewResource.file_url.endsWith('.pdf') ? (
                                    <iframe
                                        src={previewResource.file_url}
                                        className="w-full h-[60vh] rounded-lg border-0"
                                        title={previewResource.title}
                                    />
                                ) : (
                                    <img
                                        src={previewResource.file_url}
                                        alt={previewResource.title}
                                        className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                )}
                                <div className="hidden text-center text-gray-500 dark:text-gray-400">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                    <p>Preview not available for this file format.</p>
                                    <p className="text-sm mt-2">Please click download below.</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 border-t border-gray-100 dark:border-slate-700 pt-6">
                                <button
                                    onClick={() => setPreviewResource(null)}
                                    className="px-6 py-3 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleDownload(previewResource)}
                                    className="px-8 py-3 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-amber-400 transition-all shadow-md flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Now
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
