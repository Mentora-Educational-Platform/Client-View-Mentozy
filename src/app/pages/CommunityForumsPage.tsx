import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
    getCommunityCategories, getCommunityPosts, getCommunityPostDetails,
    createCommunityPost, createCommunityReply, toggleCommunityReaction,
    togglePinCommunityPost, toggleLockCommunityPost, toggleAcceptedCommunityReply,
    deleteCommunityPost, deleteCommunityReply, uploadMessageAttachment,
    CommunityCategory, CommunityPost, CommunityReply, MessageAttachment,
    ALLOWED_ATTACHMENT_EXTENSIONS, BLOCKED_ATTACHMENT_EXTENSIONS, MAX_ATTACHMENT_SIZE_BYTES
} from '../../lib/api';
import {
    MessageSquare, Users, Layers, Heart, Send, Sparkles,
    Search, Pin, Lock, Unlock, Trash2, CheckCircle2,
    Paperclip, FileText, ExternalLink, X, Plus, Filter,
    MessageCircle, ArrowLeft, Loader2, ShieldCheck, UserCheck, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function CommunityForumsPage() {
    const { user } = useAuth();
    const { mode, activeOrganization } = useOrganizationMode();
    const isOrgMode = mode === 'organization' && Boolean(activeOrganization?.id);
    const orgId = activeOrganization?.id || '';

    // State
    const [categories, setCategories] = useState<CommunityCategory[]>([]);
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'latest' | 'discussed' | 'liked'>('latest');

    // Composer Modal State
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [composerFile, setComposerFile] = useState<File | null>(null);
    const [submittingPost, setSubmittingPost] = useState(false);

    // Selected Post Details Modal State
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [activePost, setActivePost] = useState<CommunityPost | null>(null);
    const [replies, setReplies] = useState<CommunityReply[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyFile, setReplyFile] = useState<File | null>(null);
    const [submittingReply, setSubmittingReply] = useState(false);

    const composerFileInputRef = useRef<HTMLInputElement>(null);
    const replyFileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Categories and Initial Posts
    useEffect(() => {
        if (!orgId) {
            setLoading(false);
            return;
        }

        async function loadInitialData() {
            setLoading(true);
            const cats = await getCommunityCategories(orgId);
            setCategories(cats);
            if (cats.length > 0 && !selectedCategory) {
                setSelectedCategory(cats[0].id);
            }

            const initialPosts = await getCommunityPosts(orgId, activeCategorySlug, searchTerm, sortOption, user?.id);
            setPosts(initialPosts);
            setLoading(false);
        }

        loadInitialData();
    }, [orgId, user?.id]);

    // Refetch posts when filters or search change
    useEffect(() => {
        if (!orgId) return;

        async function fetchFilteredPosts() {
            const fetched = await getCommunityPosts(orgId, activeCategorySlug, searchTerm, sortOption, user?.id);
            setPosts(fetched);
        }

        fetchFilteredPosts();
    }, [orgId, activeCategorySlug, searchTerm, sortOption, user?.id]);

    // Load Post Details & Replies when a post is clicked
    useEffect(() => {
        if (!selectedPostId) {
            setActivePost(null);
            setReplies([]);
            return;
        }

        async function loadPostDetails() {
            setDetailsLoading(true);
            const { post, replies: postReplies } = await getCommunityPostDetails(selectedPostId, user?.id);
            setActivePost(post);
            setReplies(postReplies);
            setDetailsLoading(false);
        }

        loadPostDetails();
    }, [selectedPostId, user?.id]);

    // File Validation
    const validateFile = (file: File): boolean => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (BLOCKED_ATTACHMENT_EXTENSIONS.includes(ext) || !ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
            toast.error("This file type is not supported.");
            return false;
        }
        if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
            toast.error("File is too large. Maximum size is 10 MB.");
            return false;
        }
        return true;
    };

    // Handle Create Post
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId || !user) {
            toast.error("You must belong to an organisation to post.");
            return;
        }

        if (!postTitle.trim() || !postContent.trim()) {
            toast.error("Please enter a title and post content.");
            return;
        }

        setSubmittingPost(true);
        let uploadedAttachment: MessageAttachment | undefined = undefined;

        if (composerFile) {
            const uploaded = await uploadMessageAttachment(composerFile, user.id, orgId);
            if (!uploaded) {
                setSubmittingPost(false);
                return;
            }
            uploadedAttachment = uploaded;
        }

        const newPost = await createCommunityPost(
            orgId,
            selectedCategory || categories[0]?.id || '',
            user.id,
            postTitle,
            postContent,
            uploadedAttachment
        );

        setSubmittingPost(false);

        if (newPost) {
            toast.success("Thread published to community!");
            setPosts(prev => [newPost, ...prev]);
            setPostTitle('');
            setPostContent('');
            setComposerFile(null);
            setIsComposerOpen(false);
        } else {
            toast.error("Failed to create post. Please try again.");
        }
    };

    // Handle Create Reply
    const handleCreateReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPostId || !user || !replyContent.trim()) return;

        if (activePost?.is_locked) {
            toast.error("This discussion thread is locked.");
            return;
        }

        setSubmittingReply(true);
        let uploadedAttachment: MessageAttachment | undefined = undefined;

        if (replyFile) {
            const uploaded = await uploadMessageAttachment(replyFile, user.id, orgId);
            if (!uploaded) {
                setSubmittingReply(false);
                return;
            }
            uploadedAttachment = uploaded;
        }

        const newReply = await createCommunityReply(selectedPostId, user.id, replyContent, uploadedAttachment);
        setSubmittingReply(false);

        if (newReply) {
            toast.success("Reply posted!");
            setReplies(prev => [...prev, newReply]);
            setReplyContent('');
            setReplyFile(null);

            // Update reply count in posts feed
            setPosts(prev => prev.map(p => p.id === selectedPostId ? { ...p, reply_count: p.reply_count + 1 } : p));
            if (activePost) {
                setActivePost({ ...activePost, reply_count: activePost.reply_count + 1 });
            }
        } else {
            toast.error("Failed to post reply.");
        }
    };

    // Handle Reaction / Like Toggle
    const handleToggleReaction = async (post: CommunityPost) => {
        if (!user) return;

        // Optimistic UI update
        const hasLiked = post.user_has_liked;
        const newLikeCount = hasLiked ? Math.max(0, post.like_count - 1) : post.like_count + 1;

        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, user_has_liked: !hasLiked, like_count: newLikeCount } : p));
        if (activePost && activePost.id === post.id) {
            setActivePost({ ...activePost, user_has_liked: !hasLiked, like_count: newLikeCount });
        }

        const serverLiked = await toggleCommunityReaction(post.id, user.id);
        if (serverLiked !== !hasLiked) {
            // Revert if server call failed
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, user_has_liked: hasLiked, like_count: post.like_count } : p));
        }
    };

    // Moderation Actions
    const handleTogglePin = async (post: CommunityPost) => {
        const nextState = !post.is_pinned;
        const ok = await togglePinCommunityPost(post.id, nextState);
        if (ok) {
            toast.success(nextState ? "Thread pinned to top" : "Thread unpinned");
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_pinned: nextState } : p));
            if (activePost && activePost.id === post.id) {
                setActivePost({ ...activePost, is_pinned: nextState });
            }
        }
    };

    const handleToggleLock = async (post: CommunityPost) => {
        const nextState = !post.is_locked;
        const ok = await toggleLockCommunityPost(post.id, nextState);
        if (ok) {
            toast.success(nextState ? "Thread locked for new replies" : "Thread unlocked");
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_locked: nextState } : p));
            if (activePost && activePost.id === post.id) {
                setActivePost({ ...activePost, is_locked: nextState });
            }
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to remove this community post?")) return;
        const ok = await deleteCommunityPost(postId);
        if (ok) {
            toast.success("Post deleted");
            setPosts(prev => prev.filter(p => p.id !== postId));
            if (selectedPostId === postId) {
                setSelectedPostId(null);
            }
        }
    };

    const handleToggleAccepted = async (reply: CommunityReply) => {
        if (!activePost) return;
        const nextState = !reply.is_accepted;
        const ok = await toggleAcceptedCommunityReply(activePost.id, reply.id, nextState);
        if (ok) {
            toast.success(nextState ? "Marked as accepted answer" : "Accepted status removed");
            setReplies(prev => prev.map(r => ({
                ...r,
                is_accepted: r.id === reply.id ? nextState : false
            })));
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        if (!dateStr) return '';
        const time = new Date(dateStr).getTime();
        const diffSec = Math.floor((Date.now() - time) / 1000);
        if (diffSec < 60) return 'Just now';
        if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
        if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-7xl mx-auto">
                
                {/* Community Banner */}
                <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] font-black text-violet-600 mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> {isOrgMode ? activeOrganization.name : 'Mentozy'} Community
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                                Asynchronous Discussions & Knowledge Sharing
                            </h1>
                            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                                Collaborate asynchronously with your cohort peers, mentors, and organisation admins. Ask questions, share project updates, and exchange learning resources.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsComposerOpen(true)}
                            className="bg-gray-900 hover:bg-violet-700 text-white rounded-2xl px-6 py-3.5 font-bold shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Start a Thread</span>
                        </button>
                    </div>
                </div>

                {/* Filter Controls & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        <button
                            onClick={() => setActiveCategorySlug('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${activeCategorySlug === 'all' ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>All Threads</span>
                        </button>

                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategorySlug(cat.slug)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${activeCategorySlug === cat.slug ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sort */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search community..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>

                        <select
                            value={sortOption}
                            onChange={e => setSortOption(e.target.value as any)}
                            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none"
                        >
                            <option value="latest">Latest</option>
                            <option value="discussed">Most Discussed</option>
                            <option value="liked">Most Liked</option>
                        </select>
                    </div>
                </div>

                {/* Community Feed */}
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading Community Threads...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map(post => (
                            <article
                                key={post.id}
                                className={`rounded-3xl bg-white border p-6 transition-all hover:shadow-md ${post.is_pinned ? 'border-amber-200 bg-amber-50/20 shadow-sm' : 'border-gray-100 shadow-sm'}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        
                                        {/* Meta Badges */}
                                        <div className="flex items-center gap-2 flex-wrap text-xs">
                                            {post.is_pinned && (
                                                <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                                    <Pin className="w-3 h-3 fill-amber-700" /> Pinned
                                                </span>
                                            )}
                                            {post.is_locked && (
                                                <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                                    <Lock className="w-3 h-3" /> Locked
                                                </span>
                                            )}
                                            <span className="bg-violet-50 text-violet-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                                {post.category_name}
                                            </span>
                                        </div>

                                        {/* Post Title */}
                                        <h2
                                            onClick={() => setSelectedPostId(post.id)}
                                            className="text-lg font-black text-gray-900 hover:text-violet-600 transition-colors cursor-pointer"
                                        >
                                            {post.title}
                                        </h2>

                                        {/* Content Preview */}
                                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                            {post.content}
                                        </p>

                                        {/* Attachment Badge */}
                                        {post.attachment_url && (
                                            <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700">
                                                <Paperclip className="w-3.5 h-3.5 text-violet-500" />
                                                <span className="font-bold truncate max-w-[200px]">{post.attachment_name || 'Attachment'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions & Author Details */}
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                        
                                        {/* Author */}
                                        <div className="flex items-center gap-2">
                                            {post.author_avatar ? (
                                                <img src={post.author_avatar} alt={post.author_name} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                                    {post.author_name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs font-bold text-gray-900">{post.author_name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium capitalize">{post.author_role} · {formatTimeAgo(post.created_at)}</p>
                                            </div>
                                        </div>

                                        {/* Engagement Stats */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleToggleReaction(post)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${post.user_has_liked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                <Heart className={`w-3.5 h-3.5 ${post.user_has_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                                <span>{post.like_count}</span>
                                            </button>

                                            <button
                                                onClick={() => setSelectedPostId(post.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-50 border border-violet-100 text-violet-700 hover:bg-violet-100 transition-all"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>{post.reply_count} Replies</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    /* Clean Empty State */
                    <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">No discussions yet</h3>
                            <p className="text-sm text-gray-500">
                                Start the first conversation with your organisation members. Ask a question, share a project, or post an update.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsComposerOpen(true)}
                            className="bg-gray-900 hover:bg-violet-700 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Start a Thread
                        </button>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* START THREAD COMPOSER MODAL */}
                {/* ------------------------------------------------------------- */}
                {isComposerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-violet-600" />
                                    <h2 className="text-xl font-black text-gray-900">Start a New Discussion</h2>
                                </div>
                                <button
                                    onClick={() => setIsComposerOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreatePost} className="space-y-4">
                                {/* Category Selection */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-semibold"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name} — {cat.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Week 2 Project Feedback / SQL Query Help"
                                        value={postTitle}
                                        onChange={e => setPostTitle(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-bold"
                                        required
                                    />
                                </div>

                                {/* Body */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                        Your Discussion Post
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Share details, ask questions, or provide context for your cohort..."
                                        value={postContent}
                                        onChange={e => setPostContent(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                        required
                                    />
                                </div>

                                {/* File Attachment */}
                                <div>
                                    <input
                                        type="file"
                                        ref={composerFileInputRef}
                                        className="hidden"
                                        onChange={e => {
                                            const f = e.target.files?.[0];
                                            if (f && validateFile(f)) setComposerFile(f);
                                        }}
                                    />
                                    {composerFile ? (
                                        <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-100 rounded-xl text-xs text-violet-900">
                                            <div className="flex items-center gap-2 truncate">
                                                <Paperclip className="w-4 h-4 text-violet-600 flex-shrink-0" />
                                                <span className="font-bold truncate">{composerFile.name}</span>
                                                <span className="text-[10px] text-violet-500">({formatFileSize(composerFile.size)})</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setComposerFile(null)}
                                                className="p-1 hover:bg-violet-200 rounded"
                                            >
                                                <X className="w-4 h-4 text-violet-700" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => composerFileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                                        >
                                            <Paperclip className="w-4 h-4 text-gray-500" /> Attach File (Image, PDF, DOCX)
                                        </button>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsComposerOpen(false)}
                                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingPost}
                                        className="px-6 py-2.5 bg-gray-900 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {submittingPost ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" /> Post Thread
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* POST DETAILS & REPLIES THREAD MODAL */}
                {/* ------------------------------------------------------------- */}
                {selectedPostId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto flex flex-col">
                            
                            {/* Modal Nav Header */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-shrink-0">
                                <button
                                    onClick={() => setSelectedPostId(null)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Community
                                </button>

                                {/* Moderation Tools */}
                                {activePost && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTogglePin(activePost)}
                                            className={`p-2 rounded-xl border transition-colors ${activePost.is_pinned ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                            title={activePost.is_pinned ? "Unpin thread" : "Pin thread to top"}
                                        >
                                            <Pin className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleLock(activePost)}
                                            className={`p-2 rounded-xl border transition-colors ${activePost.is_locked ? 'bg-gray-200 border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                            title={activePost.is_locked ? "Unlock thread" : "Lock thread"}
                                        >
                                            {activePost.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeletePost(activePost.id)}
                                            className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors"
                                            title="Delete thread"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {detailsLoading || !activePost ? (
                                <div className="p-16 flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading Thread...</p>
                                </div>
                            ) : (
                                <div className="space-y-6 flex-1">
                                    
                                    {/* Post Main Box */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {activePost.author_avatar ? (
                                                    <img src={activePost.author_avatar} alt={activePost.author_name} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                                                        {activePost.author_name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{activePost.author_name}</p>
                                                    <p className="text-xs text-gray-400 capitalize">{activePost.author_role} · {formatTimeAgo(activePost.created_at)}</p>
                                                </div>
                                            </div>
                                            <span className="bg-violet-50 text-violet-700 font-bold px-3 py-1 rounded-full text-xs">
                                                {activePost.category_name}
                                            </span>
                                        </div>

                                        <h1 className="text-2xl font-black text-gray-900">{activePost.title}</h1>
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{activePost.content}</p>

                                        {/* Post Attachment */}
                                        {activePost.attachment_url && (
                                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3 truncate">
                                                    <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-xs font-bold text-gray-900 truncate">{activePost.attachment_name || 'Attachment'}</p>
                                                        <p className="text-[10px] text-gray-400">{formatFileSize(activePost.attachment_size)}</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={activePost.attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <span>View</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Replies Section Header */}
                                    <div className="border-t border-gray-100 pt-6">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4 text-violet-600" />
                                            Replies ({replies.length})
                                        </h3>

                                        {/* Reply List */}
                                        <div className="space-y-4 mb-6">
                                            {replies.length > 0 ? (
                                                replies.map(reply => (
                                                    <div
                                                        key={reply.id}
                                                        className={`p-4 rounded-2xl border space-y-2 ${reply.is_accepted ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-100 bg-gray-50/50'}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center">
                                                                    {reply.author_name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs font-bold text-gray-900">{reply.author_name}</span>
                                                                    <span className="text-[10px] text-gray-400 ml-2">{formatTimeAgo(reply.created_at)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Accepted Answer Badge / Action */}
                                                            <div className="flex items-center gap-2">
                                                                {reply.is_accepted && (
                                                                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepted Answer
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={() => handleToggleAccepted(reply)}
                                                                    className="p-1 text-gray-400 hover:text-emerald-600"
                                                                    title="Mark as accepted answer"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{reply.content}</p>

                                                        {reply.attachment_url && (
                                                            <a
                                                                href={reply.attachment_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-[11px] text-violet-600 font-bold hover:underline"
                                                            >
                                                                <Paperclip className="w-3 h-3" /> View Attachment ({reply.attachment_name})
                                                            </a>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No replies yet. Be the first to reply!</p>
                                            )}
                                        </div>

                                        {/* Reply Composer */}
                                        {activePost.is_locked ? (
                                            <div className="p-4 bg-gray-100 rounded-2xl text-center text-xs font-bold text-gray-500">
                                                This discussion is locked. New replies are disabled.
                                            </div>
                                        ) : (
                                            <form onSubmit={handleCreateReply} className="space-y-3">
                                                <textarea
                                                    rows={3}
                                                    placeholder="Write your reply..."
                                                    value={replyContent}
                                                    onChange={e => setReplyContent(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                                    required
                                                />
                                                <div className="flex items-center justify-between">
                                                    <input
                                                        type="file"
                                                        ref={replyFileInputRef}
                                                        className="hidden"
                                                        onChange={e => {
                                                            const f = e.target.files?.[0];
                                                            if (f && validateFile(f)) setReplyFile(f);
                                                        }}
                                                    />
                                                    {replyFile ? (
                                                        <span className="text-xs text-violet-600 font-bold truncate max-w-[200px]">
                                                            📎 {replyFile.name}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => replyFileInputRef.current?.click()}
                                                            className="text-xs text-gray-500 font-bold hover:text-gray-900 inline-flex items-center gap-1"
                                                        >
                                                            <Paperclip className="w-3.5 h-3.5" /> Attach File
                                                        </button>
                                                    )}

                                                    <button
                                                        type="submit"
                                                        disabled={submittingReply}
                                                        className="px-5 py-2 bg-gray-900 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {submittingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                        <span>Post Reply</span>
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default CommunityForumsPage;
