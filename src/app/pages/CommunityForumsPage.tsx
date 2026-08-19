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
        } else {
            toast.error("Could not delete post. You might not have permission.");
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
            <div className="font-mono text-gray-900 min-h-screen bg-[#FAF9F6] p-4 sm:p-8 rounded-3xl border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] select-none space-y-8 max-w-7xl mx-auto">
                
                {/* Community Banner */}
                <div className="bg-[#eff3ff] border-4 border-gray-900 p-6 sm:p-8 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-gray-900 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_rgba(0,0,0,1)] text-gray-900">
                            <Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />
                            <span>{isOrgMode ? activeOrganization.name : 'Mentozy'} Community Space</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-3">
                            <MessageSquare className="w-8 h-8 text-[#818CF8] flex-shrink-0" />
                            <span>Community Forums</span>
                        </h1>
                        <p className="text-xs sm:text-sm font-bold text-gray-700 max-w-2xl leading-relaxed">
                            Collaborate asynchronously with your cohort peers, mentors, and organisation admins. Ask questions, share project updates, and exchange learning resources.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsComposerOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#818CF8] hover:bg-[#6366F1] text-white border-2 border-gray-900 rounded-xl font-black text-xs sm:text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex-shrink-0"
                    >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        <span>START A THREAD</span>
                    </button>
                </div>

                {/* Filter Controls & Search Toolbar */}
                <div className="bg-white p-4 rounded-2xl border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col lg:flex-row gap-4 justify-between items-center">
                    
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none w-full lg:w-auto">
                        <button
                            onClick={() => setActiveCategorySlug('all')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase border-2 border-gray-900 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                                activeCategorySlug === 'all'
                                    ? 'bg-gray-900 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                                    : 'bg-[#FAF9F6] text-gray-900 hover:bg-[#eff3ff] shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>ALL THREADS</span>
                        </button>

                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategorySlug(cat.slug)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase border-2 border-gray-900 transition-all flex-shrink-0 cursor-pointer ${
                                    activeCategorySlug === cat.slug
                                        ? 'bg-gray-900 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                                        : 'bg-[#FAF9F6] text-gray-900 hover:bg-[#eff3ff] shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sort */}
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search community discussions..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-900 rounded-xl bg-[#FAF9F6] outline-none font-bold text-gray-900 focus:bg-white text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            />
                        </div>

                        <select
                            value={sortOption}
                            onChange={e => setSortOption(e.target.value as any)}
                            className="px-4 py-2.5 border-2 border-gray-900 rounded-xl bg-[#FAF9F6] outline-none font-black text-gray-900 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
                        >
                            <option value="latest">LATEST</option>
                            <option value="discussed">MOST DISCUSSED</option>
                            <option value="liked">MOST LIKED</option>
                        </select>
                    </div>
                </div>

                {/* Community Feed */}
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
                        <p className="text-xs text-gray-600 font-black uppercase tracking-widest">Loading Community Threads...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.map(post => (
                            <article
                                key={post.id}
                                className="bg-white rounded-3xl overflow-hidden border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all flex flex-col"
                            >
                                {/* Post Top Bar */}
                                <div className={`border-b-4 border-gray-900 px-6 py-3.5 flex items-center justify-between gap-3 ${
                                    post.is_pinned ? 'bg-[#FFF4D6]' : 'bg-[#eff3ff]'
                                }`}>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-3 py-1 text-[10px] font-black uppercase border-2 border-gray-900 rounded-lg bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)] text-gray-900">
                                            {post.category_name}
                                        </span>
                                        {post.is_pinned && (
                                            <span className="px-2.5 py-1 text-[10px] font-black uppercase border-2 border-gray-900 rounded-lg bg-[#FFD166] shadow-[1px_1px_0px_rgba(0,0,0,1)] text-gray-900 flex items-center gap-1">
                                                <Pin className="w-3 h-3 fill-gray-900" /> PINNED
                                            </span>
                                        )}
                                        {post.is_locked && (
                                            <span className="px-2.5 py-1 text-[10px] font-black uppercase border-2 border-gray-900 rounded-lg bg-[#E2E8F0] shadow-[1px_1px_0px_rgba(0,0,0,1)] text-gray-800 flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> LOCKED
                                            </span>
                                        )}
                                    </div>

                                    {/* Author Mini info */}
                                    <div className="flex items-center gap-2">
                                        {post.author_avatar ? (
                                            <img src={post.author_avatar} alt={post.author_name} className="w-7 h-7 rounded-lg border border-gray-900 object-cover shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-lg border border-gray-900 bg-[#818CF8] text-white font-black text-[10px] flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                {post.author_name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="text-right hidden sm:block">
                                            <span className="text-xs font-black text-gray-900">{post.author_name}</span>
                                            <span className="text-[10px] font-bold text-gray-500 ml-2">({formatTimeAgo(post.created_at)})</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Post Body */}
                                <div className="p-6 space-y-4">
                                    <h2
                                        onClick={() => setSelectedPostId(post.id)}
                                        className="text-xl sm:text-2xl font-black text-gray-900 hover:text-[#818CF8] transition-colors cursor-pointer leading-snug"
                                    >
                                        {post.title}
                                    </h2>

                                    <p className="text-xs sm:text-sm font-semibold text-gray-700 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </p>

                                    {/* Attachment Preview Badge */}
                                    {post.attachment_url && (
                                        <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border-2 border-gray-900 text-xs font-black text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                            <Paperclip className="w-4 h-4 text-[#818CF8]" />
                                            <span className="truncate max-w-[240px]">{post.attachment_name || 'Attached Resource'}</span>
                                        </div>
                                    )}

                                    {/* Actions & Engagement Bar */}
                                    <div className="border-t-2 border-gray-900/10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                            <span className="px-2 py-0.5 text-[9px] font-black uppercase border border-gray-900 rounded-md bg-[#FAF9F6] text-gray-900">
                                                {post.author_role}
                                            </span>
                                            <span>Posted by <strong className="text-gray-900">{post.author_name}</strong></span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleToggleReaction(post)}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer ${
                                                    post.user_has_liked
                                                        ? 'bg-[#FF6B6B] text-white'
                                                        : 'bg-white text-gray-900 hover:bg-[#eff3ff]'
                                                }`}
                                            >
                                                <Heart className={`w-3.5 h-3.5 ${post.user_has_liked ? 'fill-white text-white' : 'text-gray-900'}`} />
                                                <span>{post.like_count}</span>
                                            </button>

                                            <button
                                                onClick={() => setSelectedPostId(post.id)}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border-2 border-gray-900 bg-[#818CF8] text-white hover:bg-[#6366F1] shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>{post.reply_count} REPLIES</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    /* Neo-Brutalist Empty State */
                    <div className="p-16 text-center bg-white rounded-3xl border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
                        <div className="w-16 h-16 bg-[#eff3ff] border-2 border-gray-900 text-gray-900 rounded-2xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                            <MessageSquare className="w-8 h-8 text-gray-900" />
                        </div>
                        <div className="max-w-md mx-auto space-y-2">
                            <h3 className="text-xl font-black uppercase text-gray-900">No discussions yet</h3>
                            <p className="text-xs font-bold text-gray-600">
                                Be the first to start a conversation in your organisation. Ask a question, share a project repo, or start a study thread.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsComposerOpen(true)}
                            className="bg-[#818CF8] hover:bg-[#6366F1] text-white border-2 border-gray-900 rounded-xl px-6 py-3 font-black text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all inline-flex items-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[3px]" /> START A THREAD
                        </button>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* START THREAD COMPOSER MODAL */}
                {/* ------------------------------------------------------------- */}
                {isComposerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                        <div className="bg-[#FAF9F6] rounded-3xl border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b-4 border-gray-900 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        <MessageSquare className="w-5 h-5 text-gray-900" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase text-gray-900">Start Discussion Thread</h2>
                                        <p className="text-[10px] font-bold uppercase text-gray-500">Post to {isOrgMode ? activeOrganization.name : 'Organisation'} Cohort</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsComposerOpen(false)}
                                    className="p-2 text-gray-900 hover:bg-gray-200 border-2 border-gray-900 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreatePost} className="space-y-5">
                                {/* Category Selection */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-900">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className="w-full border-2 border-gray-900 rounded-xl px-4 py-3 text-xs font-black text-gray-900 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-[#eff3ff]"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name.toUpperCase()} — {cat.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-900">
                                        Thread Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Week 2 Project Feedback / SQL Query Help"
                                        value={postTitle}
                                        onChange={e => setPostTitle(e.target.value)}
                                        className="w-full border-2 border-gray-900 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-[#eff3ff]"
                                        required
                                    />
                                </div>

                                {/* Body */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-900">
                                        Message & Details
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Share details, ask questions, or provide context for your cohort peers..."
                                        value={postContent}
                                        onChange={e => setPostContent(e.target.value)}
                                        className="w-full border-2 border-gray-900 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-[#eff3ff] resize-y"
                                        required
                                    />
                                </div>

                                {/* File Attachment */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-900">
                                        Attachment (Optional)
                                    </label>
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
                                        <div className="flex items-center justify-between p-3.5 bg-[#eff3ff] border-2 border-gray-900 rounded-xl text-xs font-bold text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                            <div className="flex items-center gap-2 truncate">
                                                <Paperclip className="w-4 h-4 text-gray-900 flex-shrink-0" />
                                                <span className="truncate">{composerFile.name}</span>
                                                <span className="text-[10px] text-gray-500 font-bold">({formatFileSize(composerFile.size)})</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setComposerFile(null)}
                                                className="p-1 hover:bg-gray-200 border border-gray-900 rounded-lg shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                                            >
                                                <X className="w-3.5 h-3.5 text-gray-900" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => composerFileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-900 hover:bg-[#eff3ff] rounded-xl text-xs font-black text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                                        >
                                            <Paperclip className="w-4 h-4 text-gray-900" /> ATTACH FILE (IMAGE, PDF, DOCX)
                                        </button>
                                    )}
                                </div>

                                {/* Modal Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-900">
                                    <button
                                        type="button"
                                        onClick={() => setIsComposerOpen(false)}
                                        className="px-5 py-3 rounded-xl border-2 border-gray-900 bg-white text-xs font-black text-gray-900 hover:bg-gray-100 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingPost}
                                        className="px-6 py-3 bg-[#818CF8] hover:bg-[#6366F1] text-white border-2 border-gray-900 rounded-xl text-xs font-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {submittingPost ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> PUBLISHING...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" /> PUBLISH THREAD
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                        <div className="bg-[#FAF9F6] rounded-3xl border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto flex flex-col">
                            
                            {/* Modal Nav Header */}
                            <div className="flex items-center justify-between border-b-4 border-gray-900 pb-4 flex-shrink-0">
                                <button
                                    onClick={() => setSelectedPostId(null)}
                                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 rounded-xl bg-white text-xs font-black text-gray-900 hover:bg-[#eff3ff] shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" /> BACK TO COMMUNITY
                                </button>

                                {/* Moderation Tools */}
                                {activePost && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTogglePin(activePost)}
                                            className={`p-2.5 rounded-xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer ${
                                                activePost.is_pinned
                                                    ? 'bg-[#FFD166] text-gray-900'
                                                    : 'bg-white text-gray-900 hover:bg-[#eff3ff]'
                                            }`}
                                            title={activePost.is_pinned ? "Unpin thread" : "Pin thread to top"}
                                        >
                                            <Pin className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleLock(activePost)}
                                            className={`p-2.5 rounded-xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer ${
                                                activePost.is_locked
                                                    ? 'bg-[#E2E8F0] text-gray-900'
                                                    : 'bg-white text-gray-900 hover:bg-[#eff3ff]'
                                            }`}
                                            title={activePost.is_locked ? "Unlock thread" : "Lock thread"}
                                        >
                                            {activePost.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeletePost(activePost.id)}
                                            className="p-2.5 rounded-xl bg-[#FF6B6B] text-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                                            title="Delete thread"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {detailsLoading || !activePost ? (
                                <div className="p-16 flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
                                    <p className="text-xs text-gray-600 font-black uppercase tracking-widest">Loading Thread...</p>
                                </div>
                            ) : (
                                <div className="space-y-6 flex-1">
                                    
                                    {/* Post Main Box */}
                                    <div className="bg-white rounded-2xl border-4 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {activePost.author_avatar ? (
                                                    <img src={activePost.author_avatar} alt={activePost.author_name} className="w-10 h-10 rounded-xl border-2 border-gray-900 object-cover shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl border-2 border-gray-900 bg-[#818CF8] text-white font-black text-sm flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                        {activePost.author_name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{activePost.author_name}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase">{activePost.author_role} · {formatTimeAgo(activePost.created_at)}</p>
                                                </div>
                                            </div>
                                            <span className="bg-[#eff3ff] text-gray-900 font-black border-2 border-gray-900 px-3 py-1 rounded-lg text-xs shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase">
                                                {activePost.category_name}
                                            </span>
                                        </div>

                                        <h1 className="text-2xl font-black text-gray-900 leading-snug">{activePost.title}</h1>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">{activePost.content}</p>

                                        {/* Post Attachment */}
                                        {activePost.attachment_url && (
                                            <div className="p-4 rounded-xl bg-[#FAF9F6] border-2 border-gray-900 flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                <div className="flex items-center gap-3 truncate">
                                                    <div className="p-2 bg-[#eff3ff] border border-gray-900 text-gray-900 rounded-lg">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-xs font-black text-gray-900 truncate">{activePost.attachment_name || 'Attachment'}</p>
                                                        <p className="text-[10px] font-bold text-gray-500">{formatFileSize(activePost.attachment_size)}</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={activePost.attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-[#818CF8] hover:bg-[#6366F1] text-white border-2 border-gray-900 rounded-xl text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] inline-flex items-center gap-1.5 transition-all"
                                                >
                                                    <span>VIEW</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Replies Section Header */}
                                    <div className="border-t-4 border-gray-900 pt-6 space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4 text-[#818CF8]" />
                                            <span>Discussion Replies ({replies.length})</span>
                                        </h3>

                                        {/* Reply List */}
                                        <div className="space-y-4 mb-6">
                                            {replies.length > 0 ? (
                                                replies.map(reply => (
                                                    <div
                                                        key={reply.id}
                                                        className={`p-4 rounded-2xl border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-3 ${
                                                            reply.is_accepted ? 'bg-[#E6FBF5] border-[#06D6A0]' : 'bg-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-lg border border-gray-900 bg-[#FAF9F6] text-gray-900 font-black text-xs flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                                    {reply.author_name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs font-black text-gray-900">{reply.author_name}</span>
                                                                    <span className="text-[10px] font-bold text-gray-500 ml-2">({formatTimeAgo(reply.created_at)})</span>
                                                                </div>
                                                            </div>

                                                            {/* Accepted Answer Badge / Action */}
                                                            <div className="flex items-center gap-2">
                                                                {reply.is_accepted && (
                                                                    <span className="bg-[#06D6A0] text-black border border-gray-900 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                                        <CheckCircle2 className="w-3 h-3 text-black" /> ACCEPTED ANSWER
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={() => handleToggleAccepted(reply)}
                                                                    className="p-1 text-gray-600 hover:text-emerald-600 transition-colors"
                                                                    title="Toggle accepted answer status"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <p className="text-xs font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">{reply.content}</p>

                                                        {reply.attachment_url && (
                                                            <a
                                                                href={reply.attachment_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-[11px] text-[#6366F1] font-black hover:underline"
                                                            >
                                                                <Paperclip className="w-3 h-3" /> View Attachment ({reply.attachment_name})
                                                            </a>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs font-bold text-gray-500 italic p-4 bg-white rounded-xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center">
                                                    No replies yet. Be the first to share your thoughts!
                                                </p>
                                            )}
                                        </div>

                                        {/* Reply Composer */}
                                        {activePost.is_locked ? (
                                            <div className="p-4 bg-gray-200 border-2 border-gray-900 rounded-2xl text-center text-xs font-black text-gray-700 shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase">
                                                This discussion is locked. New replies are disabled.
                                            </div>
                                        ) : (
                                            <form onSubmit={handleCreateReply} className="space-y-3 bg-white p-4 rounded-2xl border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                                <textarea
                                                    rows={3}
                                                    placeholder="Write your constructive reply..."
                                                    value={replyContent}
                                                    onChange={e => setReplyContent(e.target.value)}
                                                    className="w-full border-2 border-gray-900 rounded-xl p-3 text-xs font-bold text-gray-900 bg-[#FAF9F6] focus:bg-white outline-none shadow-[2px_2px_0px_rgba(0,0,0,1)] resize-y"
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
                                                        <span className="text-xs text-gray-900 font-black truncate max-w-[200px] bg-[#eff3ff] px-3 py-1 rounded-lg border border-gray-900">
                                                            📎 {replyFile.name}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => replyFileInputRef.current?.click()}
                                                            className="text-xs font-black text-gray-900 hover:bg-[#eff3ff] px-3 py-1.5 rounded-lg border border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] inline-flex items-center gap-1.5 transition-all cursor-pointer"
                                                        >
                                                            <Paperclip className="w-3.5 h-3.5" /> ATTACH FILE
                                                        </button>
                                                    )}

                                                    <button
                                                        type="submit"
                                                        disabled={submittingReply}
                                                        className="px-5 py-2.5 bg-[#818CF8] hover:bg-[#6366F1] text-white border-2 border-gray-900 rounded-xl text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {submittingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                        <span>POST REPLY</span>
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
