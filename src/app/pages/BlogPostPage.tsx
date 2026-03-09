import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';
import { User, MessageCircle, Heart, Share, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
    id: string;
    title: string;
    author: string;
    created_at: string;
    content: string;
    image_url: string | null;
    likes_count: number;
}

interface Comment {
    id: string;
    author: string;
    content: string;
    created_at: string;
}

export function BlogPostPage() {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiking, setIsLiking] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);

    useEffect(() => {
        if (id) {
            const likedStr = localStorage.getItem('mentozy_liked_blogs');
            if (likedStr) {
                try {
                    const likedArray = JSON.parse(likedStr);
                    if (likedArray.includes(id)) {
                        setHasLiked(true);
                    }
                } catch (e) { }
            }
        }
    }, [id]);

    // Comment Form State
    const [newCommentAuthor, setNewCommentAuthor] = useState('');
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            if (!id) return;
            const supabase = getSupabase();
            if (!supabase) return;

            setIsLoading(true);

            // Fetch Blog Post
            const { data: postData, error: postError } = await supabase
                .from('blogs')
                .select('*')
                .eq('id', id)
                .single();

            if (!postError && postData) {
                setPost(postData);
            } else {
                toast.error("Blog post not found.");
            }

            // Fetch Comments
            const { data: commentsData } = await supabase
                .from('blog_comments')
                .select('*')
                .eq('blog_id', id)
                .order('created_at', { ascending: false });

            if (commentsData) {
                setComments(commentsData);
            }

            setIsLoading(false);
        };

        fetchPostAndComments();
    }, [id]);

    const handleLike = async () => {
        if (!post || isLiking || hasLiked) return;
        setIsLiking(true);
        const supabase = getSupabase();
        if (!supabase) return;

        // Optimistic UI update
        const newLikes = (post.likes_count || 0) + 1;
        setPost({ ...post, likes_count: newLikes });
        setHasLiked(true); // Optimistically set liked

        const { error } = await supabase
            .from('blogs')
            .update({ likes_count: newLikes })
            .eq('id', post.id);

        if (error) {
            // Revert on error
            setPost({ ...post, likes_count: post.likes_count });
            setHasLiked(false);
            toast.error("Failed to like the post.");
        } else {
            // Persist to local storage
            const likedStr = localStorage.getItem('mentozy_liked_blogs');
            let likedArray: string[] = [];
            if (likedStr) {
                try {
                    likedArray = JSON.parse(likedStr);
                } catch (e) { }
            }
            if (!likedArray.includes(post.id)) {
                likedArray.push(post.id);
                localStorage.setItem('mentozy_liked_blogs', JSON.stringify(likedArray));
            }
        }
        setIsLiking(false);
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentContent.trim()) return;

        setIsSubmittingComment(true);
        const supabase = getSupabase();
        if (!supabase || !post) return;

        const authorName = newCommentAuthor.trim() || 'Anonymous Reader';

        const { data, error } = await supabase
            .from('blog_comments')
            .insert({
                blog_id: post.id,
                author: authorName,
                content: newCommentContent.trim()
            })
            .select()
            .single();

        if (error) {
            toast.error("Failed to post comment.");
        } else if (data) {
            setComments([data, ...comments]);
            setNewCommentContent('');
            setNewCommentAuthor('');
            toast.success("Comment added!");
        }

        setIsSubmittingComment(false);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-serif text-gray-900 mb-4">Post not found</h1>
                <Link to="/blog" className="text-green-600 hover:text-green-700 font-medium">
                    ← Back to Blog
                </Link>
            </div>
        );
    }

    const handleShare = async () => {
        const shareData = {
            title: post.title,
            text: `Read "${post.title}" on Mentozy Blog`,
            url: window.location.href,
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`Read "${post.title}" on Mentozy Blog:\n${window.location.href}`);
                toast.success("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
            // Fallback if user cancels or it fails
            if (err instanceof Error && err.name !== 'AbortError') {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
            }
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Minimalist Top Nav */}
            <nav className="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/blog" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium text-sm">Back to Blog</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button onClick={handleLike} disabled={isLiking || hasLiked} className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-red-500 cursor-default' : 'text-gray-500 hover:text-red-500'}`}>
                            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span className="text-sm">{post.likes_count || 0}</span>
                        </button>
                        <button onClick={() => {
                            document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }} className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{comments.length}</span>
                        </button>
                        <button onClick={handleShare} className="text-gray-500 hover:text-gray-900 transition-colors">
                            <Share className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Article Content */}
            <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 lg:py-24">
                <h1 className="text-4xl sm:text-5xl md:text-[56px] leading-[1.1] font-serif font-bold text-gray-900 mb-8">
                    {post.title}
                </h1>

                <div className="flex items-center gap-4 mb-12 pb-8 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                        <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{post.author}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{Math.max(1, Math.ceil(post.content.split(' ').length / 200))} min read</span>
                            <span>·</span>
                            <span>{formatDate(post.created_at)}</span>
                        </div>
                    </div>
                </div>

                {post.image_url && (
                    <figure className="mb-14 overflow-hidden rounded-md">
                        <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-auto max-h-[600px] object-cover"
                        />
                    </figure>
                )}

                <article className="prose prose-lg prose-gray max-w-none font-serif text-[21px] leading-[1.58] text-[#242424] mb-20">
                    {post.content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-8">{paragraph}</p>
                    ))}
                </article>

                {/* Interaction Footer */}
                <div className="flex items-center justify-between py-6 border-y border-gray-100 mb-16">
                    <div className="flex items-center gap-6">
                        <button onClick={handleLike} disabled={isLiking || hasLiked} className={`flex items-center gap-2 transition-colors group ${hasLiked ? 'text-red-500 cursor-default' : 'text-gray-500 hover:text-red-500'}`}>
                            <div className={`p-2 rounded-full transition-colors ${hasLiked ? 'bg-red-50' : 'group-hover:bg-red-50'}`}>
                                <Heart className={`w-6 h-6 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            </div>
                            <span className="font-medium">{post.likes_count || 0}</span>
                        </button>
                        <button onClick={() => {
                            document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors group">
                            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <span className="font-medium">{comments.length}</span>
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                <section id="comments-section" className="scroll-mt-24">
                    <h3 className="text-2xl font-bold font-serif text-gray-900 mb-8">Responses ({comments.length})</h3>

                    {/* Add Comment Box */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-12">
                        <form onSubmit={handleComment}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                    <User className="w-4 h-4 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Your Name (optional)"
                                    value={newCommentAuthor}
                                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                                    className="bg-transparent text-gray-900 font-medium placeholder:text-gray-400 outline-none flex-1 text-sm font-sans"
                                />
                            </div>
                            <textarea
                                required
                                rows={3}
                                placeholder="What are your thoughts?"
                                value={newCommentContent}
                                onChange={(e) => setNewCommentContent(e.target.value)}
                                className="w-full bg-transparent text-gray-800 placeholder:text-gray-400 outline-none resize-none font-sans text-[15px] mb-4"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!newCommentContent.trim() || isSubmittingComment}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
                                >
                                    {isSubmittingComment ? 'Responding...' : 'Respond'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-8">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 font-sans">No responses yet. Be the first to share your thoughts!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="pb-8 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-xs font-bold text-gray-600">{comment.author[0]?.toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{comment.author}</div>
                                            <div className="text-xs text-gray-500">{formatDate(comment.created_at)}</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-800 font-sans text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
