'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useUsersStore, usePostsStore, useAppStore, useAuthStore, formatCount, formatTimeAgo } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Users, Hash, Crown, Shield, Star, Heart, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'users' | 'posts' | 'trending'>('users');
  const users = useUsersStore((s) => s.users);
  const searchResults = useUsersStore((s) => s.searchResults);
  const searchUsersFn = useUsersStore((s) => s.searchUsers);
  const fetchUsers = useUsersStore((s) => s.fetchUsers);
  const followUser = useUsersStore((s) => s.followUser);
  const unfollowUser = useUsersStore((s) => s.unfollowUser);
  const isLoadingUsers = useUsersStore((s) => s.isLoading);
  const posts = usePostsStore((s) => s.posts);
  const currentProfileUID = useAppStore((s) => s.setCurrentProfileUID);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const user = useAuthStore((s) => s.user);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (query.trim()) {
      const timeout = setTimeout(() => {
        searchUsersFn(query);
      }, 300);
      setSearchTimeout(timeout);
    }
  }, [searchTimeout, searchUsersFn]);

  const trendingTopics = [
    { tag: '#DevLife', posts: 12400 },
    { tag: '#Photography', posts: 8900 },
    { tag: '#DigitalArt', posts: 6700 },
    { tag: '#MusicProduction', posts: 5200 },
    { tag: '#Travel', posts: 4500 },
    { tag: '#Fitness', posts: 3800 },
  ];

  const recommendedUsers = users.filter((u) => u.uid !== user?.uid).slice(0, 4);

  const handleFollow = useCallback(async (uid: string) => {
    await followUser(uid);
    toast.success('Following!');
  }, [followUser]);

  const handleUnfollow = useCallback(async (uid: string) => {
    await unfollowUser(uid);
    toast.success('Unfollowed');
  }, [unfollowUser]);

  const handleViewProfile = useCallback((uid: string) => {
    currentProfileUID(uid);
    setActiveTab('profile');
  }, [currentProfileUID, setActiveTab]);

  return (
    <div className="space-y-4 pb-4">
      {/* Search bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, posts, topics..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="w-full">
          <TabsTrigger value="users" className="flex-1 gap-1"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
          <TabsTrigger value="posts" className="flex-1 gap-1"><Hash className="h-3.5 w-3.5" /> Posts</TabsTrigger>
          <TabsTrigger value="trending" className="flex-1 gap-1"><TrendingUp className="h-3.5 w-3.5" /> Trending</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading state */}
      {isLoadingUsers && !searchQuery.trim() && tab === 'users' && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Search results */}
      {searchQuery.trim() && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Search results for &quot;{searchQuery}&quot;</p>
          {tab === 'users' && (
            searchResults.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No user found with this username :(</p>
                </CardContent>
              </Card>
            ) : (
              searchResults.map((u) => (
                <Card key={u.uid} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Avatar className="w-10 h-10 cursor-pointer" onClick={() => handleViewProfile(u.uid)}>
                      <AvatarImage src={u.profileImage || '/avatar.png'} />
                      <AvatarFallback>{u.nickname?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewProfile(u.uid)}>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm truncate">{u.nickname || u.username}</span>
                        {u.isVerified && <Badge className="bg-violet-100 text-violet-700 text-[10px] h-4 px-1">✓</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                    {u.uid !== user?.uid && (
                      <Button size="sm" variant="outline" className="h-8" onClick={() => handleFollow(u.uid)}>
                        <UserPlus className="h-3.5 w-3.5 mr-1" /> Follow
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )
          )}
          {tab === 'posts' && (
            posts.filter((p) =>
              p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((p) => (
              <Card key={p.id} className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={p.publisherProfileImage || '/avatar.png'} />
                      <AvatarFallback className="text-[10px]">{p.publisherNickname?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{p.publisherNickname}</span>
                    <span className="text-xs text-muted-foreground">· {formatTimeAgo(p.createdAt)}</span>
                  </div>
                  <p className="text-sm line-clamp-2">{p.content || p.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Default content when no search */}
      {!searchQuery.trim() && (
        <>
          {tab === 'trending' && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-violet-500" /> Trending Topics</h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, i) => (
                    <div key={topic.tag} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{topic.tag}</p>
                        <p className="text-xs text-muted-foreground">{formatCount(topic.posts)} posts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'users' && !isLoadingUsers && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Users className="h-4 w-4 text-violet-500" /> Recommended Users</h3>
              {recommendedUsers.map((u) => (
                <Card key={u.uid} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Avatar className="w-12 h-12 cursor-pointer" onClick={() => handleViewProfile(u.uid)}>
                      <AvatarImage src={u.profileImage || '/avatar.png'} />
                      <AvatarFallback>{u.nickname?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewProfile(u.uid)}>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold truncate">{u.nickname || u.username}</span>
                        {u.isVerified && <Badge className="bg-violet-100 text-violet-700 text-[10px] h-4 px-1">✓</Badge>}
                        {u.isPremium && <Badge className="bg-amber-100 text-amber-700 text-[10px] h-4 px-1"><Crown className="h-2.5 w-2.5" /></Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                      <p className="text-xs text-muted-foreground">{formatCount(u.followersCount)} followers · {formatCount(u.postsCount)} posts</p>
                    </div>
                    <Button size="sm" className="h-8 bg-gradient-to-r from-violet-500 to-rose-500" onClick={() => handleFollow(u.uid)}>
                      Follow
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {recommendedUsers.length === 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No users to recommend yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {tab === 'posts' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Hash className="h-4 w-4 text-violet-500" /> Recommended Posts</h3>
              {posts.slice(0, 5).map((p) => (
                <Card key={p.id} className="border-0 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={p.publisherProfileImage || '/avatar.png'} />
                        <AvatarFallback className="text-[10px]">{p.publisherNickname?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{p.publisherNickname}</span>
                      <span className="text-xs text-muted-foreground">· {formatTimeAgo(p.createdAt)}</span>
                      <Badge variant="secondary" className="text-[10px] ml-auto">{p.type}</Badge>
                    </div>
                    <p className="text-sm line-clamp-2">{p.content || p.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {p.likesCount}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
