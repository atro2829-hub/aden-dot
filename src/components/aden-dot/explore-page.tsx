'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  userService, postsService, followService,
} from '@/lib/supabase-service';
import { VerifiedIcon } from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { User, Post } from '@/types/skyline';

const categories = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'trending', labelAr: 'الرائج', labelEn: 'Trending' },
  { id: 'people', labelAr: 'أشخاص', labelEn: 'People' },
  { id: 'photos', labelAr: 'صور', labelEn: 'Photos' },
  { id: 'videos', labelAr: 'فيديو', labelEn: 'Videos' },
];

export function ExplorePage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data state
  const [explorePosts, setExplorePosts] = useState<Post[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [followedUIDs, setFollowedUIDs] = useState<Set<string>>(new Set());
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSuggested, setLoadingSuggested] = useState(true);

  // Extract trending hashtags from posts
  const trendingHashtags = useCallback(() => {
    const tagMap: Record<string, number> = {};
    for (const post of explorePosts) {
      const matches = post.content.match(/#\w+/g);
      if (matches) {
        for (const tag of matches) {
          tagMap[tag] = (tagMap[tag] || 0) + 1;
        }
      }
    }
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }));
  }, [explorePosts]);

  const trending = trendingHashtags();

  // Load explore posts
  const loadExplorePosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const posts = await postsService.getExplorePosts(0, 30);
      setExplorePosts(posts);
    } catch (err) {
      console.error('[ExplorePage] loadExplorePosts error:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // Load suggested users - fetch random users from DB
  const loadSuggestedUsers = useCallback(async () => {
    if (!user) return;
    setLoadingSuggested(true);
    try {
      // Get users the current user is NOT following, limited to 10
      const following = await followService.getFollowing(user.uid, 100);
      const followingSet = new Set(following.map(u => u.uid));
      followingSet.add(user.uid);
      setFollowedUIDs(followingSet);

      // Search for all users with a broad query, then filter
      const allUsers = await userService.searchUsers('', 30);
      const filtered = allUsers
        .filter(u => !followingSet.has(u.uid))
        .slice(0, 5);
      setSuggestedUsers(filtered);
    } catch (err) {
      console.error('[ExplorePage] loadSuggestedUsers error:', err);
    } finally {
      setLoadingSuggested(false);
    }
  }, [user]);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const results = await userService.searchUsers(searchQuery, 20);
        setSearchResults(results);
      } catch (err) {
        console.error('[ExplorePage] searchUsers error:', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial load
  useEffect(() => {
    loadExplorePosts();
    loadSuggestedUsers();
  }, [loadExplorePosts, loadSuggestedUsers]);

  // Pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadExplorePosts(), loadSuggestedUsers()]);
    setIsRefreshing(false);
  };

  // Follow/unfollow handler
  const handleFollowToggle = async (targetUID: string, isFollowing: boolean) => {
    if (!user) return;
    // Optimistic update
    const prevFollowed = new Set(followedUIDs);
    const newSet = new Set(followedUIDs);
    if (isFollowing) {
      newSet.delete(targetUID);
    } else {
      newSet.add(targetUID);
    }
    setFollowedUIDs(newSet);

    try {
      if (isFollowing) {
        await followService.unfollowUser(user.uid, targetUID);
      } else {
        await followService.followUser(user.uid, targetUID);
      }
    } catch (err) {
      console.error('[ExplorePage] followToggle error:', err);
      setFollowedUIDs(prevFollowed); // Revert on error
    }
  };

  // Filter posts by category
  const filteredPosts = explorePosts.filter(post => {
    if (activeCategory === 'all' || activeCategory === 'trending') return true;
    if (activeCategory === 'photos') return post.type === 'IMAGE';
    if (activeCategory === 'videos') return post.type === 'VIDEO';
    return true;
  });

  // Sort trending posts by likes
  const displayedPosts = activeCategory === 'trending'
    ? [...filteredPosts].sort((a, b) => b.likesCount - a.likesCount)
    : filteredPosts;

  // Image posts for masonry grid
  const imagePosts = displayedPosts.filter(p => p.mediaBase64 || p.type === 'IMAGE');

  return (
    <div className="space-y-4">
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            className="flex items-center justify-center py-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div
        animate={{ scale: isSearchFocused ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          placeholder={t('explore.searchPlaceholder', lang)}
          className="h-11 rounded-xl bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50"
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
        />
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {searchQuery.trim() && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {loadingSearch ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-11 h-11 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">{t('app.noResults', lang)}</p>
              </div>
            ) : (
              searchResults.map((u, idx) => (
                <motion.div
                  key={u.uid}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={u.profileImage} />
                    <AvatarFallback className="bg-primary/10 text-primary">{u.nickname?.charAt(0) || u.username?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">{u.nickname || u.username}</span>
                      {u.isVerified && <VerifiedIcon size={14} />}
                    </div>
                    <span className="text-xs text-muted-foreground">@{u.username} · {formatNumber(u.followersCount, lang)}</span>
                  </div>
                  {user && u.uid !== user.uid && (
                    <motion.button
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                        followedUIDs.has(u.uid)
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFollowToggle(u.uid, followedUIDs.has(u.uid))}
                    >
                      {followedUIDs.has(u.uid) ? t('profile.unfollow', lang) : t('profile.follow', lang)}
                    </motion.button>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories - hidden when searching */}
      {!searchQuery.trim() && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {lang === 'ar' ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Content - hidden when searching */}
      {!searchQuery.trim() && (
        <>
          {/* Trending Topics */}
          {activeCategory !== 'people' && trending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">{t('explore.trendingNow', lang)}</h3>
              <div className="space-y-2">
                {trending.map((topic, idx) => (
                  <motion.button
                    key={topic.tag}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors bg-card hover:bg-primary/5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSearchQuery(topic.tag)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-primary/10 text-primary">
                      {idx + 1}
                    </div>
                    <div className="flex-1 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      <p className="text-sm font-medium text-primary">{topic.tag}</p>
                      <p className="text-[10px] text-muted-foreground">{formatNumber(topic.count, lang)} {t('post.likes', lang)}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Masonry Grid with real posts */}
          {(activeCategory === 'all' || activeCategory === 'trending' || activeCategory === 'photos') && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">{t('explore.popular', lang)}</h3>
              {loadingPosts ? (
                <div className="columns-2 gap-2 space-y-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="rounded-xl break-inside-avoid" style={{ height: [200, 260, 180, 240, 220, 280][i - 1] }} />
                  ))}
                </div>
              ) : imagePosts.length > 0 ? (
                <div className="columns-2 gap-2 space-y-2">
                  {imagePosts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      className="rounded-xl overflow-hidden break-inside-avoid cursor-pointer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {post.mediaBase64 ? (
                        <img
                          src={post.mediaBase64.startsWith('data:') ? post.mediaBase64 : `data:${post.mediaMimeType || 'image/jpeg'};base64,${post.mediaBase64}`}
                          alt={post.description || post.content}
                          className="w-full object-cover rounded-xl"
                          style={{ minHeight: 150, maxHeight: 300 }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full bg-muted flex items-center justify-center" style={{ minHeight: 150 }}>
                          <ImagePlaceholderIcon />
                        </div>
                      )}
                      {post.content && (
                        <div className="p-2 bg-card">
                          <p className="text-xs text-foreground line-clamp-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{post.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">♥ {formatNumber(post.likesCount, lang)}</span>
                            <span className="text-[10px] text-muted-foreground">💬 {formatNumber(post.commentsCount, lang)}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">{t('app.noResults', lang)}</p>
                </div>
              )}
            </div>
          )}

          {/* Video posts section */}
          {activeCategory === 'videos' && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">{lang === 'ar' ? 'فيديو' : 'Videos'}</h3>
              {loadingPosts ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedPosts
                    .filter(p => p.type === 'VIDEO')
                    .map((post, idx) => (
                      <motion.div
                        key={post.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <VideoIcon />
                        </div>
                        <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                          <p className="text-sm font-medium text-foreground line-clamp-1">{post.content}</p>
                          <p className="text-xs text-muted-foreground">@{post.publisherUsername} · ♥ {formatNumber(post.likesCount, lang)}</p>
                        </div>
                      </motion.div>
                    ))}
                  {displayedPosts.filter(p => p.type === 'VIDEO').length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">{t('app.noResults', lang)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Suggested Users */}
          {(activeCategory === 'all' || activeCategory === 'people') && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">{t('explore.suggestedForYou', lang)}</h3>
              {loadingSuggested ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="w-11 h-11 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-7 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : suggestedUsers.length > 0 ? (
                <div className="space-y-2">
                  {suggestedUsers.map((u, idx) => (
                    <motion.div
                      key={u.uid}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={u.profileImage} />
                        <AvatarFallback className="bg-primary/10 text-primary">{u.nickname?.charAt(0) || u.username?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-foreground">{u.nickname || u.username}</span>
                          {u.isVerified && <VerifiedIcon size={14} />}
                        </div>
                        <span className="text-xs text-muted-foreground">@{u.username} · {formatNumber(u.followersCount, lang)}</span>
                      </div>
                      {user && u.uid !== user.uid && (
                        <motion.button
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                            followedUIDs.has(u.uid)
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFollowToggle(u.uid, followedUIDs.has(u.uid))}
                        >
                          {followedUIDs.has(u.uid) ? t('profile.unfollow', lang) : t('profile.follow', lang)}
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">{t('app.noResults', lang)}</p>
                </div>
              )}
            </div>
          )}

          {/* Pull to refresh button */}
          <div className="flex justify-center pt-2">
            <motion.button
              className="px-6 py-2 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing
                ? (lang === 'ar' ? 'جاري التحديث...' : 'Refreshing...')
                : (lang === 'ar' ? 'تحديث' : 'Refresh')}
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M8 10l4 3-4 3V10z" fill="var(--primary)" />
    </svg>
  );
}
