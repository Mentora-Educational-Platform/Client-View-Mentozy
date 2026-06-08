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
            case 'Formula Sheets': return 'text-gray-900 bg-[#f39c12]';
            case 'Data Sheets': return 'text-gray-900 bg-[#eff3ff]';
            case 'Images': return 'text-gray-900 bg-white';
            default: return 'text-gray-900 bg-white';
        }
    };

    const filteredItems = resources.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="pt-32 pb-32 bg-[#FAF9F6] min-h-screen font-mono relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 font-black text-xs uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-6">
                        <BookOpen className="w-4 h-4 text-[#f39c12]" />
                        Free Open Library
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight uppercase leading-none">
                        Discover & Share <span className="bg-[#f39c12] border-4 border-gray-900 px-2 py-1 rotate-1 inline-block">Knowledge</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8 font-bold uppercase">
                        Access hundreds of free PDFs, formula sheets, data sheets, and resources shared openly by students and mentors.
                    </p>
                    <button
                        onClick={() => {
                            if (user) setIsUploadOpen(true)
                            else toast.error('You need to log in to upload resources!')
                        }}
                        className="inline-flex items-center gap-2 px-8 py-4 border-4 border-gray-900 bg-[#f39c12] text-gray-900 font-black uppercase text-sm hover:bg-[#e08e0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all"
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
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for resources, tags, or authors..."
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-900 bg-[#FAF9F6] focus:outline-none text-xs font-black uppercase"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                            <Filter className="text-gray-900 w-5 h-5 ml-2 mr-1 hidden md:block" />
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-5 py-3 border-2 border-gray-900 whitespace-nowrap text-xs font-black uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${activeCategory === category
                                        ? 'bg-[#f39c12] text-gray-900'
                                        : 'bg-white text-gray-900 hover:bg-[#eff3ff]'
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
                        <div className="w-12 h-12 border-4 border-gray-900 border-t-[#f39c12] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-900 font-black uppercase text-xs">Loading open resources...</p>
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
                                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-md shadow-[0_8px_15px_-3px_rgba(0,0,0,0.15)] border-t-4 border-gray-900 flex flex-col justify-end overflow-hidden">
                                        <div className="h-2 w-full bg-black/10" />
                                    </div>
                                    
                                    <div className="relative z-10 flex flex-wrap justify-center gap-6 md:gap-10 lg:gap-14 items-end">
                                        {shelfItems.map((item, index) => {
                                            const Icon = getIconForCategory(item.category);
                                            const spineColor = item.category === 'Formula Sheets' ? '#f39c12' : 
                                                               item.category === 'Data Sheets' ? '#5763f6' : 
                                                               item.category === 'Images' ? '#22c55e' : '#e11d48';

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    className="group relative w-[160px] h-[220px] md:w-[200px] md:h-[280px] bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
                                                    style={{
                                                        borderLeftWidth: '14px',
                                                        borderLeftColor: spineColor
                                                    }}
                                                >
                                                    {/* Spine Detail (Title sideways or simple line) */}
                                                    <div className="absolute left-[-14px] top-0 bottom-0 w-[14px] opacity-20 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

                                                    {/* Book Cover Design */}
                                                    <div className="p-4 md:p-5 flex-1 flex flex-col bg-white relative z-0">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className={`w-8 h-8 md:w-10 md:h-10 border-2 border-gray-900 flex items-center justify-center ${getColorForCategory(item.category)}`}>
                                                                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                                            </div>
                                                            <div className="flex items-center gap-1 bg-white border-2 border-gray-900 px-1.5 py-0.5 text-[9px] md:text-[10px] font-black uppercase text-gray-900">
                                                                <Eye className="w-3 h-3" />
                                                                {item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-center">
                                                            <h3 className="text-xs md:text-sm font-black text-gray-900 mb-1 leading-tight line-clamp-3 group-hover:text-[#f39c12] transition-colors uppercase">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-wider mt-1 line-clamp-1">
                                                                By {item.author_name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Page Edges Simulation (bottom) */}
                                                    <div className="h-3 bg-white border-t-2 border-gray-900 flex flex-col justify-evenly px-2 pointer-events-none">
                                                        <div className="h-[1px] bg-gray-900/20 w-full" />
                                                        <div className="h-[1px] bg-gray-900/20 w-full" />
                                                    </div>

                                                    {/* Action Buttons overlayed on hover */}
                                                    <div className="absolute inset-0 bg-white/95 border-2 border-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2.5 p-4 z-20">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                                                            className="w-full py-2 bg-[#f39c12] border-2 border-gray-900 text-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#e08e0b]"
                                                        >
                                                            Preview
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                                                            className="w-full py-2 bg-[#eff3ff] border-2 border-gray-900 text-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 hover:bg-[#dbe4ff]"
                                                        >
                                                            <Download className="w-3.5 h-3.5" /> Download
                                                        </button>
                                                        <div className="flex gap-2 w-full mt-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleLike(item); }}
                                                                className={`flex-1 py-1.5 border-2 border-gray-900 rounded-none flex items-center justify-center transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] ${likedResources.has(item.id) ? 'bg-rose-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
                                                                title="Like"
                                                            >
                                                                <Heart className={`w-3.5 h-3.5 ${likedResources.has(item.id) ? 'fill-current' : ''}`} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    navigator.clipboard.writeText(item.file_url);
                                                                    toast.success("Link copied!");
                                                                }}
                                                                className="flex-1 py-1.5 border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                                                title="Share"
                                                            >
                                                                <Share2 className="w-3.5 h-3.5" />
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
                    <div className="text-center py-20 bg-white border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-xl mx-auto">
                        <div className="w-20 h-20 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-gray-900" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase">No resources found</h3>
                        <p className="text-gray-700 font-bold uppercase text-xs mb-6">There are currently no resources available. Be the first to share one!</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => !uploading && setIsUploadOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white border-4 border-gray-900 p-6 md:p-8 w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                        >
                            <button
                                onClick={() => setIsUploadOpen(false)}
                                disabled={uploading}
                                className="absolute right-6 top-6 text-gray-900 hover:text-gray-650 disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2 uppercase">
                                <Upload className="w-6 h-6 text-[#f39c12]" /> Share Resource
                            </h3>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={uploadTitle}
                                        onChange={e => setUploadTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-900 focus:outline-none text-xs font-bold uppercase"
                                        placeholder="E.g. React Cheat Sheet"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-gray-900 uppercase mb-1">Category</label>
                                        <select
                                            value={uploadCategory}
                                            onChange={e => setUploadCategory(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-900 focus:outline-none text-xs font-bold uppercase"
                                        >
                                            {categories.filter(c => c !== 'All').map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase mb-1">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={uploadTags}
                                        onChange={e => setUploadTags(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-900 focus:outline-none text-xs font-bold uppercase"
                                        placeholder="Math, Algebra, Forms..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-900 uppercase mb-1">File</label>
                                    <input
                                        type="file"
                                        required
                                        onChange={e => setFileToUpload(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-xs font-bold uppercase file:mr-4 file:py-1.5 file:px-3 file:border-2 file:border-gray-900 file:bg-[#eff3ff] file:text-gray-900 file:font-black"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full mt-4 py-3 border-4 border-gray-900 bg-[#f39c12] text-gray-900 font-black uppercase text-xs hover:bg-[#e08e0b] shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
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
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setPreviewResource(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white border-4 border-gray-900 p-6 md:p-8 w-full max-w-5xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <button
                                onClick={() => setPreviewResource(null)}
                                className="absolute right-6 top-6 z-10 p-2 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-6 mr-14">
                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 uppercase">{previewResource.title}</h3>
                                <div className="flex items-center gap-4 text-xs font-black uppercase text-gray-500">
                                    <span>By {previewResource.author_name}</span>
                                    <span>•</span>
                                    <span>{previewResource.category}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto bg-[#FAF9F6] border-4 border-gray-900 p-2 mb-6 flex items-center justify-center min-h-[400px]">
                                {previewResource.file_url.endsWith('.pdf') ? (
                                    <iframe
                                        src={previewResource.file_url}
                                        className="w-full h-[60vh] rounded-none border-0"
                                        title={previewResource.title}
                                    />
                                ) : (
                                    <img
                                        src={previewResource.file_url}
                                        alt={previewResource.title}
                                        className="max-w-full max-h-[60vh] object-contain"
                                    />
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-4 border-t-4 border-gray-900 pt-6">
                                <button
                                    onClick={() => setPreviewResource(null)}
                                    className="px-6 py-3 text-gray-900 text-xs font-black uppercase hover:bg-gray-100 border-2 border-gray-900 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleDownload(previewResource)}
                                    className="px-8 py-3 bg-[#f39c12] border-4 border-gray-900 text-gray-900 text-xs font-black uppercase hover:bg-[#e08e0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
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
