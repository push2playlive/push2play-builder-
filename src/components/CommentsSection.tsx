import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Send, ThumbsUp, ThumbsDown, Heart, ChevronDown, ChevronUp, Reply, MessageSquare, Trash2 } from 'lucide-react';
import { Comment } from '../types';
import { getRelativeTime } from '../lib/time';

interface CommentsSectionProps {
  initialComments: Comment[];
  onAddComment?: (newComment: Comment) => void;
  onDeleteComment?: (commentId: string) => void;
}

// Pool of high-fidelity user avatars for unique rendering
const PORTRAIT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", // female 1
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", // male 1
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", // female 2
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", // male 2
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80", // female 3
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80", // male 3
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80", // female 4
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80", // male 4
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80", // female 5
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80", // male 5
];

/**
 * Returns a high-res unique avatar based deterministically on the username or string hash.
 */
export function getUniqueUserAvatar(username: string): string {
  if (!username) return PORTRAIT_AVATARS[0];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PORTRAIT_AVATARS.length;
  return PORTRAIT_AVATARS[index];
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  initialComments,
  onAddComment,
  onDeleteComment,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'new'>('top');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [collapsedReplies, setCollapsedReplies] = useState<Record<string, boolean>>({});

  const toggleRepliesCollapse = (commentId: string) => {
    setCollapsedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Common quick emojis for engagement
  const QUICK_EMOJIS = ['🔥', '👏', '🙌', '💯', '🚀', '💻', '💡', '😍'];

  // Initialize and ensure uniqueAvatarUrl is populated for all comments & replies
  useEffect(() => {
    const populated = initialComments.map((c) => {
      const uniqueUrl = c.uniqueAvatarUrl || getUniqueUserAvatar(c.author);
      const populatedReplies = c.replies?.map((r) => ({
        ...r,
        uniqueAvatarUrl: r.uniqueAvatarUrl || getUniqueUserAvatar(r.author),
        dislikes: r.dislikes !== undefined ? r.dislikes : Math.floor(Math.random() * 4),
        dislikedByMe: r.dislikedByMe || false,
      }));
      return {
        ...c,
        uniqueAvatarUrl: uniqueUrl,
        dislikes: c.dislikes !== undefined ? c.dislikes : Math.floor(Math.random() * 8),
        dislikedByMe: c.dislikedByMe || false,
        replies: populatedReplies,
      };
    });
    setComments(populated);
  }, [initialComments]);

  // Handle main comment form submission
  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newCommentId = `cm-user-${Date.now()}`;
    const authorName = 'You';
    const uniqueUrl = getUniqueUserAvatar(authorName);

    const newComment: Comment = {
      id: newCommentId,
      author: authorName,
      avatar: uniqueUrl, // fallback
      uniqueAvatarUrl: uniqueUrl, // new property
      text: commentInput.trim(),
      likes: 0,
      dislikes: 0,
      likedByMe: false,
      dislikedByMe: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentInput('');
    if (onAddComment) {
      onAddComment(newComment);
    }
  };

  // Handle inline replies
  const handleAddReplySubmit = (e: React.FormEvent, parentId: string, replyToAuthor?: string) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    const authorName = 'You';
    const uniqueUrl = getUniqueUserAvatar(authorName);

    const formattedText = replyToAuthor 
      ? `@${replyToAuthor} ${replyInput.trim()}`
      : replyInput.trim();

    const newReply: Comment = {
      id: `reply-${Date.now()}`,
      author: authorName,
      avatar: uniqueUrl,
      uniqueAvatarUrl: uniqueUrl,
      text: formattedText,
      likes: 0,
      dislikes: 0,
      likedByMe: false,
      dislikedByMe: false,
      createdAt: new Date().toISOString(),
    };

    const updated = comments.map((c) => {
      if (c.id === parentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply],
        };
      }
      return c;
    });

    setComments(updated);
    setReplyInput('');
    setReplyTarget(null);
  };

  // Delete comment
  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    if (onDeleteComment) {
      onDeleteComment(commentId);
    }
  };

  // Delete reply
  const handleDeleteReply = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies?.filter((r) => r.id !== replyId) || [],
          };
        }
        return c;
      })
    );
  };

  // Upvote/Like comment
  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const wasLiked = !!c.likedByMe;
          const wasDisliked = !!c.dislikedByMe;
          
          const nextLiked = !wasLiked;
          const nextDisliked = nextLiked ? false : wasDisliked;

          const currentLikes = c.likes ?? 0;
          const currentDislikes = c.dislikes ?? 0;

          return {
            ...c,
            likedByMe: nextLiked,
            dislikedByMe: nextDisliked,
            likes: nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
            dislikes: (wasDisliked && nextDisliked === false) ? Math.max(0, currentDislikes - 1) : currentDislikes,
          };
        }
        return c;
      })
    );
  };

  // Downvote/Dislike comment
  const handleDislikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const wasLiked = !!c.likedByMe;
          const wasDisliked = !!c.dislikedByMe;

          const nextDisliked = !wasDisliked;
          const nextLiked = nextDisliked ? false : wasLiked;

          const currentLikes = c.likes ?? 0;
          const currentDislikes = c.dislikes ?? 0;

          return {
            ...c,
            likedByMe: nextLiked,
            dislikedByMe: nextDisliked,
            dislikes: nextDisliked ? currentDislikes + 1 : Math.max(0, currentDislikes - 1),
            likes: (wasLiked && nextLiked === false) ? Math.max(0, currentLikes - 1) : currentLikes,
          };
        }
        return c;
      })
    );
  };

  // Upvote/Like nested reply
  const handleLikeReply = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies?.map((r) => {
              if (r.id === replyId) {
                const wasLiked = !!r.likedByMe;
                const wasDisliked = !!r.dislikedByMe;
                
                const nextLiked = !wasLiked;
                const nextDisliked = nextLiked ? false : wasDisliked;

                const currentLikes = r.likes ?? 0;
                const currentDislikes = r.dislikes ?? 0;

                return {
                  ...r,
                  likedByMe: nextLiked,
                  dislikedByMe: nextDisliked,
                  likes: nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
                  dislikes: (wasDisliked && nextDisliked === false) ? Math.max(0, currentDislikes - 1) : currentDislikes,
                };
              }
              return r;
            }),
          };
        }
        return c;
      })
    );
  };

  // Downvote/Dislike nested reply
  const handleDislikeReply = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies?.map((r) => {
              if (r.id === replyId) {
                const wasLiked = !!r.likedByMe;
                const wasDisliked = !!r.dislikedByMe;

                const nextDisliked = !wasDisliked;
                const nextLiked = nextDisliked ? false : wasLiked;

                const currentLikes = r.likes ?? 0;
                const currentDislikes = r.dislikes ?? 0;

                return {
                  ...r,
                  likedByMe: nextLiked,
                  dislikedByMe: nextDisliked,
                  dislikes: nextDisliked ? currentDislikes + 1 : Math.max(0, currentDislikes - 1),
                  likes: (wasLiked && nextLiked === false) ? Math.max(0, currentLikes - 1) : currentLikes,
                };
              }
              return r;
            }),
          };
        }
        return c;
      })
    );
  };

  // Sort logic
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'new') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.likes - a.likes;
  });

  return (
    <div className="space-y-6">
      {/* Header and Sorting */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#ff5722]" />
          <span>COMMENTS ({comments.length})</span>
        </h2>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-300 hover:text-white transition-all font-black uppercase tracking-wider shadow-md hover:border-zinc-800"
          >
            <span>SORT BY: {sortBy === 'new' ? 'Newest' : 'Most Liked'}</span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1.5 w-36 bg-[#0c0c0e]/95 backdrop-blur-md border border-zinc-900 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('new');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[10px] font-black transition-colors flex items-center justify-between ${
                      sortBy === 'new' 
                        ? 'text-[#ff5722] bg-[#ff5722]/10' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span>NEWEST</span>
                    {sortBy === 'new' && <span className="w-1 h-1 rounded-full bg-[#ff5722]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('top');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[10px] font-black transition-colors flex items-center justify-between ${
                      sortBy === 'top' 
                        ? 'text-[#ff5722] bg-[#ff5722]/10' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span>MOST LIKED</span>
                    {sortBy === 'top' && <span className="w-1 h-1 rounded-full bg-[#ff5722]" />}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Comment Input */}
      <form onSubmit={handleAddCommentSubmit} className="flex gap-3 items-start group">
        <img
          src={getUniqueUserAvatar('You')}
          alt="User portrait"
          className="w-9 h-9 rounded-full border border-[#ff5722]/30 object-cover ring-2 ring-[#ff5722]/10 transition-all group-focus-within:ring-[#ff5722]/30"
        />
        <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-2.5 flex flex-col gap-2 focus-within:border-zinc-800 transition-all shadow-xl">
          <textarea
            placeholder="Add to the high-fidelity discourse..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="w-full bg-transparent border-none text-[11px] placeholder-zinc-600 focus:outline-none focus:ring-0 resize-none min-h-[45px] text-zinc-200 font-medium"
          />
          <div className="flex justify-between items-center border-t border-zinc-900/40 pt-2">
            <div className="flex items-center gap-1.5 relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-[#ff5722] transition-colors"
              >
                <Smile className="h-4 w-4" />
              </button>
              
              {/* Emoji quick options */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    className="absolute bottom-8 left-0 z-50 bg-[#0c0c0e] border border-zinc-800 p-1.5 rounded-xl shadow-2xl flex gap-1"
                  >
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setCommentInput((prev) => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="hover:scale-125 transition-transform p-1 text-sm cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-4 py-1.5 bg-[#ff5722] text-white text-[10px] font-black rounded-xl hover:bg-[#e04c1d] disabled:opacity-40 disabled:hover:bg-[#ff5722] transition-all flex items-center gap-1 cursor-pointer shadow-lg shadow-[#ff5722]/10"
            >
              <span>COMMENT</span>
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </form>

      {/* Comment Thread List */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {sortedComments.map((comment) => {
            const avatarUrl = comment.uniqueAvatarUrl || getUniqueUserAvatar(comment.author);
            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex gap-3 items-start border-b border-zinc-900/30 pb-4 group/item"
              >
                <img
                  src={avatarUrl}
                  alt={comment.author}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-800 shadow-md ring-1 ring-white/5 transition-all group-hover/item:border-zinc-700"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white hover:text-[#ff5722] transition-colors cursor-pointer flex items-center gap-1">
                      {comment.author}
                      {comment.author === 'You' && (
                        <span className="bg-zinc-800 text-[7px] text-zinc-400 px-1 rounded-md font-mono scale-90">ME</span>
                      )}
                    </span>
                    <span className="text-[8px] text-zinc-600 font-semibold">{getRelativeTime(comment.createdAt)}</span>
                  </div>
                  
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">{comment.text}</p>
                  
                  {/* Actions / Engagement */}
                  <div className="flex items-center gap-4 pt-1 text-[9px] text-zinc-500 font-bold">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        comment.likedByMe ? 'text-rose-500 hover:text-rose-400' : 'text-zinc-500 hover:text-rose-500'
                      }`}
                    >
                      <motion.div
                        whileTap={{ scale: 0.7 }}
                        animate={comment.likedByMe ? { scale: [1, 1.5, 0.95, 1.1, 1], rotate: [0, -10, 10, -5, 0] } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center justify-center"
                      >
                        <Heart className={`h-3.5 w-3.5 ${comment.likedByMe ? 'fill-current text-rose-500' : ''}`} />
                      </motion.div>
                      <motion.span
                        key={comment.likes}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 12 }}
                        className="inline-block"
                      >
                        {comment.likes}
                      </motion.span>
                    </button>

                    <button
                      onClick={() => handleDislikeComment(comment.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        comment.dislikedByMe ? 'text-[#ff5722]' : 'hover:text-white'
                      }`}
                    >
                      <ThumbsDown className={`h-3 w-3 ${comment.dislikedByMe ? 'fill-current' : ''}`} />
                      <span>{comment.dislikes ?? 0}</span>
                    </button>

                    <button
                      onClick={() => {
                        setReplyTarget(replyTarget === comment.id ? null : comment.id);
                        setReplyInput('');
                      }}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <Reply className="h-3 w-3" />
                      <span>Reply</span>
                    </button>

                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center gap-1 text-zinc-500 hover:text-red-500 transition-colors ml-auto cursor-pointer"
                      title="Delete Comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>

                    {comment.creatorHearted && (
                      <div className="flex items-center gap-0.5 text-pink-500">
                        <Heart className="h-2.5 w-2.5 fill-current" />
                        <span className="text-[8px] font-black uppercase">Creator Hearted</span>
                      </div>
                    )}
                  </div>

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleRepliesCollapse(comment.id)}
                        className="flex items-center gap-1.5 text-[9px] font-black tracking-wider text-zinc-400 hover:text-[#ff5722] transition-colors cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-900/80 hover:border-[#ff5722]/20 shadow-sm"
                      >
                        {collapsedReplies[comment.id] ? (
                          <>
                            <ChevronDown className="h-3.5 w-3.5 text-[#ff5722] animate-pulse" />
                            <span>SHOW REPLIES ({comment.replies.length})</span>
                          </>
                        ) : (
                          <>
                            <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
                            <span>HIDE REPLIES</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Inline Reply Form */}
                  <AnimatePresence>
                    {replyTarget === comment.id && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={(e) => handleAddReplySubmit(e, comment.id)}
                        className="flex gap-2 items-start mt-3 pt-2 overflow-hidden"
                      >
                        <img
                          src={getUniqueUserAvatar('You')}
                          alt="Your avatar"
                          className="w-6 h-6 rounded-full object-cover border border-zinc-900"
                        />
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder={`Reply to ${comment.author}...`}
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-1.5 text-[10px] focus:outline-none focus:border-zinc-800 text-zinc-200 font-medium"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={!replyInput.trim()}
                            className="px-3 bg-zinc-900 hover:bg-[#ff5722] hover:text-white text-zinc-400 border border-zinc-800 hover:border-[#ff5722] rounded-xl text-[9px] font-black transition-all cursor-pointer"
                          >
                            SEND
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Nested Replies List */}
                  <AnimatePresence initial={false}>
                    {comment.replies && comment.replies.length > 0 && !collapsedReplies[comment.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden mt-3 ml-2 pl-4 border-l-2 border-zinc-800 bg-zinc-950/30 rounded-r-xl py-2.5 pr-2.5 space-y-3 hover:bg-zinc-950/40 hover:border-[#ff5722]/30 transition-all duration-300"
                      >
                        {comment.replies.map((reply) => {
                          const replyAvatar = reply.uniqueAvatarUrl || getUniqueUserAvatar(reply.author);
                          const isReplyingToThisReply = replyTarget === reply.id;
                          return (
                            <div key={reply.id} className="space-y-2">
                              <div className="flex gap-2.5 items-start mt-2 transition-colors">
                                <img
                                  src={replyAvatar}
                                  alt={reply.author}
                                  className="w-6 h-6 rounded-full object-cover border border-zinc-800"
                                />
                                <div className="space-y-0.5 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black text-zinc-300 hover:text-[#ff5722] cursor-pointer">
                                      {reply.author}
                                      {reply.author === 'You' && (
                                        <span className="bg-zinc-800 text-[6px] text-zinc-400 px-0.5 rounded ml-1 font-mono scale-90">ME</span>
                                      )}
                                    </span>
                                    <span className="text-[7px] text-zinc-600 font-semibold">{getRelativeTime(reply.createdAt)}</span>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">{reply.text}</p>
                                  
                                  {/* Inner Actions */}
                                  <div className="flex items-center gap-3 pt-1 text-[8px] text-zinc-500 font-bold">
                                    <button
                                      onClick={() => handleLikeReply(comment.id, reply.id)}
                                      className={`flex items-center gap-0.5 transition-colors ${
                                        reply.likedByMe ? 'text-rose-500 hover:text-rose-400' : 'text-zinc-500 hover:text-rose-500'
                                      }`}
                                    >
                                      <motion.div
                                        whileTap={{ scale: 0.7 }}
                                        animate={reply.likedByMe ? { scale: [1, 1.5, 0.95, 1.1, 1], rotate: [0, -10, 10, -5, 0] } : { scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="flex items-center justify-center"
                                      >
                                        <Heart className={`h-3 w-3 ${reply.likedByMe ? 'fill-current text-rose-500' : ''}`} />
                                      </motion.div>
                                      <motion.span
                                        key={reply.likes}
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 12 }}
                                        className="inline-block"
                                      >
                                        {reply.likes}
                                      </motion.span>
                                    </button>
  
                                    <button
                                      onClick={() => handleDislikeReply(comment.id, reply.id)}
                                      className={`flex items-center gap-0.5 transition-colors ${
                                        reply.dislikedByMe ? 'text-[#ff5722]' : 'hover:text-white'
                                      }`}
                                    >
                                      <ThumbsDown className={`h-2.5 w-2.5 ${reply.dislikedByMe ? 'fill-current' : ''}`} />
                                      <span>{reply.dislikes ?? 0}</span>
                                    </button>
  
                                    <button
                                      onClick={() => {
                                        setReplyTarget(replyTarget === reply.id ? null : reply.id);
                                        setReplyInput('');
                                      }}
                                      className="flex items-center gap-0.5 hover:text-white transition-colors"
                                    >
                                      <Reply className="h-2.5 w-2.5" />
                                      <span>Reply</span>
                                    </button>

                                    <button
                                      onClick={() => handleDeleteReply(comment.id, reply.id)}
                                      className="flex items-center gap-0.5 text-zinc-500 hover:text-red-500 transition-colors ml-auto cursor-pointer"
                                      title="Delete Reply"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
  
                              {/* Inner Reply Form (under child reply) */}
                              <AnimatePresence>
                                {isReplyingToThisReply && (
                                  <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    onSubmit={(e) => handleAddReplySubmit(e, comment.id, reply.author)}
                                    className="flex gap-2 items-start pl-9 pr-2 overflow-hidden mt-1 pb-1"
                                  >
                                    <img
                                      src={getUniqueUserAvatar('You')}
                                      alt="Your avatar"
                                      className="w-5 h-5 rounded-full object-cover border border-zinc-900"
                                    />
                                    <div className="flex-1 flex gap-2">
                                      <input
                                        type="text"
                                        placeholder={`Reply to ${reply.author}...`}
                                        value={replyInput}
                                        onChange={(e) => setReplyInput(e.target.value)}
                                        className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-2.5 py-1 text-[9px] focus:outline-none focus:border-zinc-800 text-zinc-200 font-medium"
                                        autoFocus
                                      />
                                      <button
                                        type="submit"
                                        disabled={!replyInput.trim()}
                                        className="px-2.5 bg-zinc-900 hover:bg-[#ff5722] hover:text-white text-zinc-400 border border-zinc-800 hover:border-[#ff5722] rounded-xl text-[8px] font-black transition-all cursor-pointer"
                                      >
                                        SEND
                                      </button>
                                    </div>
                                  </motion.form>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
