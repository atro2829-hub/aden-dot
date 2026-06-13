'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { usePostsStore, useStoriesStore, useAuthStore, useAppStore, formatTimeAgo, formatCount, fileToBase64 } from '@/lib/store';
import type { Post, PostType, Comment, Story } from '@/types/skyline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Heart, MessageCircle, Eye, Bookmark, MoreHorizontal, Share2, Image, Video, Type,
  Send, X, Play, ChevronLeft, ChevronRight, Trash2, Edit3, Flag, Link2, Copy, ThumbsUp, Reply, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Story circle component
function StoryCircle({ username, nickname, profileImage, isOwn, onClick }: { username: string; nickname: string; profileImage: string; isOwn?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[72px]">
      <div className={`rounded-full p-[2px] ${isOwn ? 'bg-muted' : 'bg-gradient-to-br from-violet-500 to-rose-500'}`}>
        <Avatar className="w-14 h-14 border-2 border-background">
          <AvatarImage src={profileImage || '/avatar.png'} />
          <AvatarFallback className="text-xs">{(nickname || username).charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <span className="text-[11px] text-muted-foreground truncate max-w-[72px]">{nickname || username}</span>
    </button>
  );
}

// Story viewer
function StoryViewer({ open, onClose, stories }: { open: boolean; onClose: () => void; stories: Story[] }) {
  const [current, setCurrent] = useState(0);
  if (!stories.length) return null;
  const story = stories[current];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-black border-0">
        <div className="relative aspect-[9/16] bg-gradient-to-b from-violet-900 to-rose-900 flex items-center justify-center">
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 bg-gradient-to-b from-black/50 to-transparent">
            <Avatar className="w-8 h-8 border border-white/30">
              <AvatarImage src={story.publisherProfileImage || '/avatar.png'} />
              <AvatarFallback className="text-xs text-white">{(story.publisherNickname || story.publisherUsername).charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{story.publisherNickname || story.publisherUsername}</p>
              <p className="text-white/60 text-xs">{formatTimeAgo(story.createdAt)}</p>
            </div>
            <button onClick={onClose} className="ml-auto text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
            {stories.map((_, i) => (
              <div key={i} className="flex-1 h-[2px] rounded-full bg-white/30 overflow-hidden">
                <div className={`h-full bg-white transition-all ${i < current ? 'w-full' : i === current ? 'w-1/2' : 'w-0'}`} />
              </div>
            ))}
          </div>
          {story.mediaBase64 && story.mediaMimeType?.startsWith('image') && (
            <img src={story.mediaBase64} alt="Story content" className="w-full h-full object-cover" />
          )}
          {story.mediaBase64 && story.mediaMimeType?.startsWith('video') && (
            <video src={story.mediaBase64} className="w-full h-full object-cover" autoPlay muted />
          )}
          {!story.mediaBase64 && (
            <div className="text-white/60 text-lg">Story Content</div>
          )}
          {current > 0 && (
            <button onClick={() => setCurrent(current - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1 text-white"><ChevronLeft className="w-5 h-5" /></button>
          )}
          {current < stories.length - 1 && (
            <button onClick={() => setCurrent(current + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1 text-white"><ChevronRight className="w-5 h-5" /></button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Post card component
function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const commentsLoadedRef = useRef(false);
  const { toggleLike, toggleFavorite, deletePost, getComments, addComment } = usePostsStore();
  const user = useAuthStore((s) => s.user);
  const isOwner = post.publisherUID === user?.uid;

  // Load comments when the comments section is opened
  const handleToggleComments = useCallback(() => {
    const nextShow = !showComments;
    setShowComments(nextShow);
    if (nextShow && !commentsLoadedRef.current) {
      setIsLoadingComments(true);
      getComments(post.id).then((result) => {
        setComments(result);
        commentsLoadedRef.current = true;
        setIsLoadingComments(false);
      }).catch(() => {
        setIsLoadingComments(false);
      });
    }
  }, [showComments, post.id, getComments]);

  const handleComment = useCallback(async () => {
    if (!commentText.trim()) return;
    await addComment(post.id, commentText);
    setCommentText('');
    // Reload comments after adding
    const updated = await getComments(post.id);
    setComments(updated);
  }, [commentText, post.id, addComment, getComments]);

  const handleShare = useCallback(() => {
    navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success('Link copied!');
  }, [post.id]);

  const handleCopyText = useCallback(() => {
    navigator.clipboard?.writeText(post.content || post.description);
    toast.success('Text copied!');
  }, [post.content, post.description]);

  const handleDelete = useCallback(() => {
    deletePost(post.id);
    toast.success('Post deleted');
  }, [deletePost, post.id]);

  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      {/* Post header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.publisherProfileImage || '/avatar.png'} />
          <AvatarFallback>{post.publisherNickname?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm truncate">{post.publisherNickname || post.publisherUsername}</span>
            {post.publisherVerified && <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-violet-100 text-violet-700">✓</Badge>}
          </div>
          <span className="text-xs text-muted-foreground">@{post.publisherUsername} · {formatTimeAgo(post.createdAt)}</span>
        </div>
        <Sheet open={showMore} onOpenChange={setShowMore}>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowMore(true)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <SheetContent>
            <SheetHeader><SheetTitle>Post Options</SheetTitle></SheetHeader>
            <div className="space-y-2 mt-4">
              <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleCopyText}>
                <Copy className="h-4 w-4" /> Copy Text
              </Button>
              {isOwner && (
                <>
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => { setShowMore(false); toast.info('Edit coming soon!'); }}>
                    <Edit3 className="h-4 w-4" /> Edit Post
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" /> Delete Post
                  </Button>
                </>
              )}
              {!isOwner && (
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setShowMore(false); toast.info('Report submitted'); }}>
                  <Flag className="h-4 w-4" /> Report
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Post content */}
      <CardContent className="pt-0 px-4">
        {post.type === 'TEXT' && post.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}
        {post.type === 'IMAGE' && post.mediaBase64 && (
          <div className="rounded-xl overflow-hidden mt-2 bg-muted">
            <img src={post.mediaBase64} alt="Post image" className="w-full object-cover max-h-[500px]" />
          </div>
        )}
        {post.type === 'IMAGE' && !post.mediaBase64 && (
          <div className="rounded-xl overflow-hidden mt-2 bg-gradient-to-br from-violet-100 to-rose-100 h-64 flex items-center justify-center">
            <Image className="w-12 h-12 text-violet-300" />
          </div>
        )}
        {post.type === 'VIDEO' && post.mediaBase64 && (
          <div className="rounded-xl overflow-hidden mt-2 bg-black">
            <video src={post.mediaBase64} controls className="w-full max-h-[500px]" />
          </div>
        )}
        {post.type === 'VIDEO' && !post.mediaBase64 && (
          <div className="rounded-xl overflow-hidden mt-2 bg-gradient-to-br from-violet-100 to-rose-100 h-64 flex items-center justify-center">
            <div className="text-center">
              <Play className="w-12 h-12 text-violet-300 mx-auto" />
              <p className="text-sm text-violet-400 mt-2">Video Post</p>
            </div>
          </div>
        )}
        {post.description && post.type !== 'TEXT' && (
          <p className="text-sm mt-2 leading-relaxed">{post.description}</p>
        )}

        {/* Post stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatCount(post.viewsCount)}</span>
          <span>{formatTimeAgo(post.createdAt)}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.isLiked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}>
            <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
            <span>{formatCount(post.likesCount)}</span>
          </button>
          <button onClick={handleToggleComments} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-violet-500 transition-colors">
            <MessageCircle className="h-5 w-5" />
            <span>{formatCount(post.commentsCount)}</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-green-500 transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button onClick={() => toggleFavorite(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.isFavorite ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}`}>
            <Bookmark className={`h-5 w-5 ${post.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t space-y-3">
            <ScrollArea className="max-h-60">
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet! Write the first comment.</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <Avatar className="w-7 h-7 flex-shrink-0">
                        <AvatarImage src={c.publisherProfileImage || '/avatar.png'} />
                        <AvatarFallback className="text-[10px]">{c.publisherNickname?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold">{c.publisherNickname}</span>
                          {c.isLikedByPublisher && <Badge variant="secondary" className="h-3 px-1 text-[8px]">Liked by publisher</Badge>}
                        </div>
                        <p className="text-xs leading-relaxed">{c.content}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-muted-foreground">{formatTimeAgo(c.createdAt)}</span>
                          <button className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-rose-500">
                            <ThumbsUp className="h-3 w-3" /> {c.likesCount}
                          </button>
                          <button className="text-[10px] text-muted-foreground hover:text-violet-500 flex items-center gap-0.5">
                            <Reply className="h-3 w-3" /> Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="flex gap-2">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={user?.profileImage || '/avatar.png'} />
                <AvatarFallback className="text-[10px]">{user?.nickname?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input className="flex-1 h-8 text-sm" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleComment()} />
                <Button size="icon" className="h-8 w-8 bg-violet-500 hover:bg-violet-600" onClick={handleComment} disabled={!commentText.trim()}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Create post component
function CreatePostSection() {
  const [postType, setPostType] = useState<PostType>('TEXT');
  const [textContent, setTextContent] = useState('');
  const [description, setDescription] = useState('');
  const [mediaBase64, setMediaBase64] = useState('');
  const [mediaMimeType, setMediaMimeType] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const createPost = usePostsStore((s) => s.createPost);
  const user = useAuthStore((s) => s.user);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setMediaBase64(base64);
      setMediaMimeType(file.type);
      setMediaPreview(base64);
      toast.success('File loaded successfully!');
    } catch {
      toast.error('Failed to process file');
    }
  }, []);

  const handlePublish = useCallback(async () => {
    if (postType === 'TEXT' && !textContent.trim()) {
      toast.error('Please enter text');
      return;
    }
    if ((postType === 'IMAGE' || postType === 'VIDEO') && !mediaBase64) {
      toast.error('Please select a media file');
      return;
    }
    setIsPublishing(true);
    try {
      await createPost({
        type: postType,
        content: textContent,
        mediaBase64: mediaBase64 || undefined,
        mediaMimeType: mediaMimeType || undefined,
        description,
        isPrivate,
        isPinned: false,
        commentsDisabled,
        favoritesDisabled: false,
        sharesCount: 0,
        region: user?.region || 'US',
      });
      setTextContent('');
      setDescription('');
      setMediaBase64('');
      setMediaMimeType('');
      setMediaPreview('');
      setIsPrivate(false);
      setCommentsDisabled(false);
      toast.success('Post published!');
    } catch {
      toast.error('Failed to publish post');
    } finally {
      setIsPublishing(false);
    }
  }, [postType, textContent, description, mediaBase64, mediaMimeType, isPrivate, commentsDisabled, createPost, user?.region]);

  const removeMedia = useCallback(() => {
    setMediaBase64('');
    setMediaMimeType('');
    setMediaPreview('');
  }, []);

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImage || '/avatar.png'} />
            <AvatarFallback>{user?.nickname?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">What&apos;s new today?</span>
        </div>

        {/* Post type tabs */}
        <Tabs value={postType} onValueChange={(v) => setPostType(v as PostType)} className="mb-3">
          <TabsList className="w-full">
            <TabsTrigger value="TEXT" className="flex-1 gap-1"><Type className="h-3.5 w-3.5" /> Text</TabsTrigger>
            <TabsTrigger value="IMAGE" className="flex-1 gap-1"><Image className="h-3.5 w-3.5" /> Image</TabsTrigger>
            <TabsTrigger value="VIDEO" className="flex-1 gap-1"><Video className="h-3.5 w-3.5" /> Video</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Text input */}
        {postType === 'TEXT' && (
          <Textarea placeholder="Share your thoughts..." value={textContent} onChange={(e) => setTextContent(e.target.value)} maxLength={500} rows={3} className="resize-none" disabled={isPublishing} />
        )}
        {(postType === 'IMAGE' || postType === 'VIDEO') && (
          <>
            <Textarea placeholder="Post description..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} className="resize-none mb-2" disabled={isPublishing} />
            {mediaPreview ? (
              <div className="relative rounded-xl overflow-hidden bg-muted mb-2">
                {postType === 'IMAGE' ? (
                  <img src={mediaPreview} alt="Media preview" className="w-full max-h-64 object-cover" />
                ) : (
                  <video src={mediaPreview} controls className="w-full max-h-64" />
                )}
                <button onClick={removeMedia} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-violet-400 hover:bg-violet-50 transition-colors cursor-pointer">
                {postType === 'IMAGE' ? <Image className="h-8 w-8 text-muted-foreground mb-2" /> : <Video className="h-8 w-8 text-muted-foreground mb-2" />}
                <span className="text-sm text-muted-foreground">Select {postType === 'IMAGE' ? 'an image' : 'a video'}</span>
                <span className="text-xs text-muted-foreground mt-1">Encoded as Base64</span>
                <input type="file" accept={postType === 'IMAGE' ? 'image/*' : 'video/*'} onChange={handleFileSelect} className="hidden" />
              </label>
            )}
          </>
        )}

        {/* Options */}
        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
            Private
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={commentsDisabled} onChange={(e) => setCommentsDisabled(e.target.checked)} className="rounded" />
            Disable comments
          </label>
        </div>

        <Button className="w-full mt-3 bg-gradient-to-r from-violet-500 to-rose-500 hover:from-violet-600 hover:to-rose-600" onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : 'Publish'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Add Story component
function AddStoryButton() {
  const [open, setOpen] = useState(false);
  const [mediaBase64, setMediaBase64] = useState('');
  const [mediaMimeType, setMediaMimeType] = useState('');
  const [preview, setPreview] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const addStory = useStoriesStore((s) => s.addStory);
  const user = useAuthStore((s) => s.user);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setMediaBase64(base64);
      setMediaMimeType(file.type);
      setPreview(base64);
    } catch {
      // ignore
    }
  }, []);

  const handlePublish = useCallback(async () => {
    if (!mediaBase64) return;
    setIsPublishing(true);
    try {
      await addStory(mediaBase64, mediaMimeType);
      setOpen(false);
      setMediaBase64('');
      setMediaMimeType('');
      setPreview('');
      toast.success('Story added!');
    } catch {
      toast.error('Failed to add story');
    } finally {
      setIsPublishing(false);
    }
  }, [mediaBase64, mediaMimeType, addStory]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 min-w-[72px]">
        <div className="rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-rose-500">
          <div className="w-14 h-14 rounded-full border-2 border-background bg-muted flex items-center justify-center">
            <span className="text-2xl text-violet-500">+</span>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground">Add Story</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Story</DialogTitle>
            <DialogDescription>Select an image or video for your story</DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="rounded-xl overflow-hidden bg-muted">
              {mediaMimeType.startsWith('image') ? (
                <img src={preview} alt="Story preview" className="w-full max-h-64 object-cover" />
              ) : (
                <video src={preview} controls className="w-full max-h-64" />
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-violet-400 cursor-pointer">
              <Image className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Select media (Base64 encoded)</span>
              <input type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
            </label>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-violet-500 to-rose-500" onClick={handlePublish} disabled={!mediaBase64 || isPublishing}>
              {isPublishing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : 'Publish Story'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Main Home Feed component
export function HomeFeed() {
  const [feedFilter, setLocalFeedFilter] = useState<'global' | 'local' | 'followings' | 'favorites'>('global');
  const posts = usePostsStore((s) => s.posts);
  const stories = useStoriesStore((s) => s.stories);
  const isLoadingPosts = usePostsStore((s) => s.isLoading);
  const isLoadingStories = useStoriesStore((s) => s.isLoading);
  const fetchPosts = usePostsStore((s) => s.fetchPosts);
  const fetchStories = useStoriesStore((s) => s.fetchStories);
  const setStoreFeedFilter = usePostsStore((s) => s.setFeedFilter);
  const user = useAuthStore((s) => s.user);
  const [storyViewOpen, setStoryViewOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch posts and stories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchStories(),
          user ? fetchPosts(user.uid, user.region) : fetchPosts('anonymous', ''),
        ]);
      } catch (error) {
        console.error('[HomeFeed] Failed to load data:', error);
      } finally {
        setHasInitialized(true);
      }
    };
    loadData();
  }, [fetchStories, fetchPosts, user?.uid, user?.region]);

  // Re-fetch posts when feed filter changes
  useEffect(() => {
    if (hasInitialized && user) {
      fetchPosts(user.uid, user.region);
    }
  }, [feedFilter, hasInitialized, user, fetchPosts]);

  const handleFilterChange = useCallback((value: string) => {
    const filter = value as typeof feedFilter;
    setLocalFeedFilter(filter);
    setStoreFeedFilter(filter);
  }, [setLocalFeedFilter, setStoreFeedFilter]);

  const filteredPosts = posts.filter((p) => {
    switch (feedFilter) {
      case 'favorites': return p.isFavorite;
      case 'followings': return true; // show all from feed
      case 'local': return p.region === user?.region;
      default: return true;
    }
  });

  return (
    <div className="space-y-4 pb-4">
      {/* Stories row */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-3">
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-1">
              <AddStoryButton />
              {isLoadingStories && stories.length === 0 ? (
                <div className="flex items-center justify-center min-w-[72px]">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                stories.map((story) => (
                  <StoryCircle key={story.id} username={story.publisherUsername} nickname={story.publisherNickname} profileImage={story.publisherProfileImage} onClick={() => setStoryViewOpen(true)} />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <StoryViewer open={storyViewOpen} onClose={() => setStoryViewOpen(false)} stories={stories} />

      {/* Create post */}
      <CreatePostSection />

      {/* Feed filter */}
      <Tabs value={feedFilter} onValueChange={handleFilterChange}>
        <TabsList className="w-full">
          <TabsTrigger value="global" className="flex-1">Global</TabsTrigger>
          <TabsTrigger value="local" className="flex-1">Local</TabsTrigger>
          <TabsTrigger value="followings" className="flex-1">Followed</TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Posts */}
      {isLoadingPosts && !hasInitialized ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading posts...</p>
          </CardContent>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No posts found</p>
          </CardContent>
        </Card>
      ) : (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
