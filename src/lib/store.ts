/**
 * Skyline Zustand Stores
 * Thin wrappers around Supabase service layer that manage local state.
 * All data operations delegate to the Supabase service.
 * Stores provide optimistic updates where appropriate.
 */

import { create } from 'zustand';
import type {
  User, Post, Comment, Story, ChatRoom, ChatMessage, Notification,
  GiftType, Gift, LiveStream, LiveStreamComment, Wallet, Transaction, Achievement, UserAchievement, DailyReward,
} from '@/types/skyline';
import {
  authService, userService, postsService, commentsService, storiesService,
  chatService, followService, notificationService, giftsService,
  liveStreamService, walletService, achievementService,
  fileToBase64, base64ToFile, formatTimeAgo, formatCount,
} from './supabase-service';

// Re-export utility functions for backward compatibility
export { fileToBase64, base64ToFile, formatTimeAgo, formatCount };

// ============ Auth Store ============

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username?: string, nickname?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  completeProfile: (data: { username: string; nickname: string; bio: string; gender: string; profileImage: string }) => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /** Initialize auth state from Supabase session */
  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await userService.getUserProfile(session.user.id);
        if (profile) {
          set({
            user: profile,
            isAuthenticated: true,
          });
        }
      }
    } catch (error) {
      console.error('[AuthStore] initializeAuth error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /** Refresh user profile from Supabase */
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const profile = await userService.getUserProfile(user.uid);
      if (profile) {
        set({ user: profile });
      }
    } catch (error) {
      console.error('[AuthStore] refreshProfile error:', error);
    }
  },

  /** Login with email and password */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.signIn(email, password);
      if (data.user) {
        const profile = await userService.getUserProfile(data.user.id);
        if (profile) {
          set({
            user: profile,
            isAuthenticated: true,
          });
          return true;
        }
      }
      set({ error: 'Login failed: could not load profile' });
      return false;
    } catch (error: unknown) {
      let message = error instanceof Error ? error.message : 'Login failed';
      // Translate common Supabase errors
      if (message.includes('Invalid API key')) {
        message = 'مفتاح API غير صالح - يرجى إعداد الاتصال بقاعدة البيانات أولاً';
      } else if (message.includes('Invalid login credentials')) {
        message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (message.includes('Email not confirmed')) {
        message = 'البريد الإلكتروني غير مؤكد - تحقق من بريدك';
      } else if (message.includes('User already registered')) {
        message = 'هذا البريد مسجل مسبقاً';
      } else if (message.includes('Password should be')) {
        message = 'كلمة المرور قصيرة جداً - يجب أن تكون 6 أحرف على الأقل';
      } else if (message.includes('Supabase client not configured')) {
        message = 'قاعدة البيانات غير مُعدة - يرجى إعداد الاتصال أولاً';
      } else if (message.includes('network') || message.includes('Failed to fetch')) {
        message = 'خطأ في الاتصال - تحقق من الإنترنت';
      }
      set({ error: message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /** Register with email, password, and optional username/nickname */
  register: async (email: string, password: string, username?: string, nickname?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.signUp(email, password, username, nickname);
      if (data.user) {
        const profile = await userService.getUserProfile(data.user.id);
        if (profile) {
          set({
            user: profile,
            isAuthenticated: true,
          });
          return true;
        }
        // If profile not yet available, create a temporary user
        const isAdmin = email === 'admin@adendot.app';
        const tempUser: User = {
          uid: data.user.id,
          email,
          username: username || '',
          nickname: nickname || '',
          bio: '',
          gender: 'unspecified',
          profileImage: '',
          coverImage: '',
          status: 'online',
          role: isAdmin ? 'admin' : 'user',
          isVerified: isAdmin,
          isPremium: false,
          region: '',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          level: 1,
          xp: 0,
          popularity: 0,
          giftsCount: 0,
          subscribers: 0,
          coinsBalance: 100,
          diamondsBalance: 0,
          isProfileComplete: false,
          isEmailVerified: true,
          joinDate: new Date().toISOString().split('T')[0],
          lastSeen: Date.now(),
        };
        set({ user: tempUser, isAuthenticated: true });
        return true;
      }
      set({ error: 'Registration failed' });
      return false;
    } catch (error: unknown) {
      let message = error instanceof Error ? error.message : 'Registration failed';
      // Translate common Supabase errors
      if (message.includes('Invalid API key')) {
        message = 'مفتاح API غير صالح - يرجى إعداد الاتصال بقاعدة البيانات أولاً';
      } else if (message.includes('User already registered')) {
        message = 'هذا البريد مسجل مسبقاً';
      } else if (message.includes('Password should be')) {
        message = 'كلمة المرور قصيرة جداً - يجب أن تكون 6 أحرف على الأقل';
      } else if (message.includes('Email not confirmed')) {
        message = 'البريد الإلكتروني غير مؤكد';
      } else if (message.includes('Supabase client not configured')) {
        message = 'قاعدة البيانات غير مُعدة - يرجى إعداد الاتصال أولاً';
      } else if (message.includes('network') || message.includes('Failed to fetch')) {
        message = 'خطأ في الاتصال - تحقق من الإنترنت';
      }
      set({ error: message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /** Logout */
  logout: async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('[AuthStore] logout error:', error);
    }
    set({ user: null, isAuthenticated: false, error: null });
  },

  /** Update user profile data */
  updateUser: async (data: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    // Optimistic update
    set({ user: { ...user, ...data } });

    // Sync to Supabase
    try {
      const updated = await userService.updateUserProfile(user.uid, data);
      if (updated) {
        set({ user: updated });
      }
    } catch (error) {
      console.error('[AuthStore] updateUser error:', error);
    }
  },

  /** Complete user profile */
  completeProfile: async (data) => {
    const { user } = get();
    if (!user) return;

    const updates: Partial<User> = {
      username: data.username,
      nickname: data.nickname,
      bio: data.bio,
      gender: data.gender as User['gender'],
      profileImage: data.profileImage || user.profileImage,
      isProfileComplete: true,
    };

    // Optimistic update
    set({ user: { ...user, ...updates } });

    // Sync to Supabase
    try {
      const updated = await userService.updateUserProfile(user.uid, updates);
      if (updated) {
        set({ user: updated });
      }
    } catch (error) {
      console.error('[AuthStore] completeProfile error:', error);
    }
  },
}));

// ============ Posts Store ============

interface PostsState {
  posts: Post[];
  feedFilter: 'global' | 'local' | 'followings' | 'favorites';
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  userPosts: Post[];
  fetchPosts: (uid: string, region?: string) => Promise<void>;
  loadMorePosts: (uid: string) => Promise<void>;
  fetchUserPosts: (uid: string) => Promise<void>;
  createPost: (post: Omit<Post, 'id' | 'publisherUID' | 'publisherUsername' | 'publisherNickname' | 'publisherProfileImage' | 'publisherVerified' | 'likesCount' | 'commentsCount' | 'viewsCount' | 'isLiked' | 'isFavorite' | 'createdAt'>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleFavorite: (postId: string) => Promise<void>;
  setFeedFilter: (filter: PostsState['feedFilter']) => void;
  getComments: (postId: string) => Promise<Comment[]>;
  addComment: (postId: string, content: string) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  userPosts: [],
  feedFilter: 'global',
  isLoading: false,
  error: null,
  currentPage: 0,
  hasMore: true,

  /** Fetch posts for the current feed filter */
  fetchPosts: async (uid: string, _region?: string) => {
    set({ isLoading: true, error: null, currentPage: 0, hasMore: true });
    try {
      const filter = get().feedFilter;
      let posts: Post[] = [];

      if (filter === 'followings') {
        posts = await postsService.getFeed(uid, 0, 20);
      } else if (filter === 'favorites') {
        // For favorites, we'd need a dedicated endpoint
        // For now, get all posts and the service will populate isFavorite
        posts = await postsService.getExplorePosts(0, 20);
        posts = posts.filter(p => p.isFavorite);
      } else {
        posts = await postsService.getExplorePosts(0, 20);
      }

      set({ posts, currentPage: 1, hasMore: posts.length >= 20 });
    } catch (error) {
      console.error('[PostsStore] fetchPosts error:', error);
      set({ error: 'Failed to load posts' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Load more posts for pagination */
  loadMorePosts: async (uid: string) => {
    const { currentPage, hasMore, feedFilter, posts } = get();
    if (!hasMore) return;

    set({ isLoading: true });
    try {
      let newPosts: Post[] = [];
      if (feedFilter === 'followings') {
        newPosts = await postsService.getFeed(uid, currentPage, 20);
      } else {
        newPosts = await postsService.getExplorePosts(currentPage, 20);
      }

      set({
        posts: [...posts, ...newPosts],
        currentPage: currentPage + 1,
        hasMore: newPosts.length >= 20,
      });
    } catch (error) {
      console.error('[PostsStore] loadMorePosts error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /** Fetch posts by a specific user (for profile page) */
  fetchUserPosts: async (uid: string) => {
    set({ isLoading: true });
    try {
      const userPosts = await postsService.getUserPosts(uid, 0, 50);
      set({ userPosts });
    } catch (error) {
      console.error('[PostsStore] fetchUserPosts error:', error);
      set({ error: 'Failed to load user posts' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Create a new post */
  createPost: async (post) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    const optimisticPost: Post = {
      ...post,
      id: `temp_${Date.now()}`,
      publisherUID: user.uid,
      publisherUsername: user.username,
      publisherNickname: user.nickname,
      publisherProfileImage: user.profileImage,
      publisherVerified: user.isVerified,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      isLiked: false,
      isFavorite: false,
      createdAt: Date.now(),
    };
    set((state) => ({ posts: [optimisticPost, ...state.posts] }));

    // Sync to Supabase
    try {
      const created = await postsService.createPost({
        publisherUID: user.uid,
        type: post.type,
        content: post.content || '',
        mediaBase64: post.mediaBase64,
        mediaMimeType: post.mediaMimeType,
        description: post.description,
        isPrivate: post.isPrivate,
        region: post.region || user.region,
      });

      if (created) {
        // Replace optimistic post with real one
        set((state) => ({
          posts: state.posts.map(p => p.id === optimisticPost.id ? created : p),
        }));
      }
    } catch (error) {
      console.error('[PostsStore] createPost error:', error);
      // Remove optimistic post on failure
      set((state) => ({ posts: state.posts.filter(p => p.id !== optimisticPost.id) }));
    }
  },

  /** Delete a post */
  deletePost: async (postId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    const previousPosts = get().posts;
    set((state) => ({ posts: state.posts.filter(p => p.id !== postId) }));

    // Sync to Supabase
    try {
      const success = await postsService.deletePost(postId, user.uid);
      if (!success) {
        // Revert on failure
        set({ posts: previousPosts });
      }
    } catch (error) {
      console.error('[PostsStore] deletePost error:', error);
      set({ posts: previousPosts });
    }
  },

  /** Toggle like on a post */
  toggleLike: async (postId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    set((state) => ({
      posts: state.posts.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      ),
    }));

    // Sync to Supabase
    try {
      await postsService.toggleLike(postId, user.uid);
    } catch (error) {
      console.error('[PostsStore] toggleLike error:', error);
      // Revert
      set((state) => ({
        posts: state.posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
            : p
        ),
      }));
    }
  },

  /** Toggle favorite on a post */
  toggleFavorite: async (postId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    set((state) => ({
      posts: state.posts.map(p => p.id === postId ? { ...p, isFavorite: !p.isFavorite } : p),
    }));

    // Sync to Supabase
    try {
      await postsService.toggleFavorite(postId, user.uid);
    } catch (error) {
      console.error('[PostsStore] toggleFavorite error:', error);
      // Revert
      set((state) => ({
        posts: state.posts.map(p => p.id === postId ? { ...p, isFavorite: !p.isFavorite } : p),
      }));
    }
  },

  /** Set feed filter and refetch */
  setFeedFilter: (filter) => set({ feedFilter: filter }),

  /** Get comments for a post */
  getComments: async (postId: string) => {
    try {
      return await commentsService.getPostComments(postId);
    } catch (error) {
      console.error('[PostsStore] getComments error:', error);
      return [];
    }
  },

  /** Add a comment to a post */
  addComment: async (postId: string, content: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update - increment comment count
    set((state) => ({
      posts: state.posts.map(p =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ),
    }));

    // Sync to Supabase
    try {
      await commentsService.createComment({
        postID: postId,
        publisherUID: user.uid,
        content,
      });
    } catch (error) {
      console.error('[PostsStore] addComment error:', error);
      // Revert
      set((state) => ({
        posts: state.posts.map(p =>
          p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
        ),
      }));
    }
  },
}));

// ============ Stories Store ============

interface StoriesState {
  stories: Story[];
  isLoading: boolean;
  error: string | null;
  fetchStories: () => Promise<void>;
  addStory: (mediaBase64: string, mediaMimeType: string) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
}

export const useStoriesStore = create<StoriesState>((set, get) => ({
  stories: [],
  isLoading: false,
  error: null,

  /** Fetch active stories */
  fetchStories: async () => {
    set({ isLoading: true, error: null });
    try {
      const stories = await storiesService.getActiveStories();
      set({ stories });
    } catch (error) {
      console.error('[StoriesStore] fetchStories error:', error);
      set({ error: 'Failed to load stories' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Add a new story */
  addStory: async (mediaBase64: string, mediaMimeType: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    const optimisticStory: Story = {
      id: `temp_${Date.now()}`,
      publisherUID: user.uid,
      publisherUsername: user.username,
      publisherNickname: user.nickname,
      publisherProfileImage: user.profileImage,
      mediaBase64,
      mediaMimeType,
      viewsCount: 0,
      viewers: [],
      createdAt: Date.now(),
    };
    set((state) => ({ stories: [optimisticStory, ...state.stories] }));

    // Sync to Supabase
    try {
      const created = await storiesService.createStory({
        publisherUID: user.uid,
        mediaBase64,
        mediaMimeType,
      });

      if (created) {
        set((state) => ({
          stories: state.stories.map(s => s.id === optimisticStory.id ? created : s),
        }));
      }
    } catch (error) {
      console.error('[StoriesStore] addStory error:', error);
      // Remove optimistic story on failure
      set((state) => ({ stories: state.stories.filter(s => s.id !== optimisticStory.id) }));
    }
  },

  /** View a story (mark as seen) */
  viewStory: async (storyId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    set((state) => ({
      stories: state.stories.map(s =>
        s.id === storyId
          ? { ...s, viewsCount: s.viewsCount + 1, viewers: [...s.viewers, user.uid] }
          : s
      ),
    }));

    // Sync to Supabase
    try {
      await storiesService.viewStory(storyId, user.uid);
    } catch (error) {
      console.error('[StoriesStore] viewStory error:', error);
    }
  },

  /** Delete a story */
  deleteStory: async (storyId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const previousStories = get().stories;
    set((state) => ({ stories: state.stories.filter(s => s.id !== storyId) }));

    try {
      const success = await storiesService.deleteStory(storyId, user.uid);
      if (!success) {
        set({ stories: previousStories });
      }
    } catch (error) {
      console.error('[StoriesStore] deleteStory error:', error);
      set({ stories: previousStories });
    }
  },
}));

// ============ Chat Store ============

interface ChatState {
  chatRooms: ChatRoom[];
  activeChatMessages: ChatMessage[];
  activeRoomId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchChatRooms: () => Promise<void>;
  setActiveChat: (otherUserId: string) => Promise<void>;
  sendMessage: (receiverUID: string, content: string, mediaBase64?: string, mediaMimeType?: string) => Promise<void>;
  markAsRead: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatRooms: [],
  activeChatMessages: [],
  activeRoomId: null,
  isLoading: false,
  error: null,

  /** Fetch chat rooms for current user */
  fetchChatRooms: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const rooms = await chatService.getChatRooms(user.uid);
      set({ chatRooms: rooms });
    } catch (error) {
      console.error('[ChatStore] fetchChatRooms error:', error);
      set({ error: 'Failed to load chat rooms' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Open a chat with another user */
  setActiveChat: async (otherUserId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, activeChatMessages: [] });
    try {
      // Create or get room
      const roomId = await chatService.createOrGetChatRoom(user.uid, otherUserId);
      if (roomId) {
        set({ activeRoomId: roomId });

        // Load messages
        const messages = await chatService.getMessages(roomId);
        set({ activeChatMessages: messages });

        // Mark as read
        await chatService.markMessagesAsRead(roomId, user.uid);

        // Refresh rooms to update unread counts
        const rooms = await chatService.getChatRooms(user.uid);
        set({ chatRooms: rooms });
      }
    } catch (error) {
      console.error('[ChatStore] setActiveChat error:', error);
      set({ error: 'Failed to open chat' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Send a message */
  sendMessage: async (receiverUID: string, content: string, mediaBase64?: string, mediaMimeType?: string) => {
    const user = useAuthStore.getState().user;
    const { activeRoomId } = get();
    if (!user) return;

    // Determine room ID
    let roomId = activeRoomId;
    if (!roomId) {
      roomId = await chatService.createOrGetChatRoom(user.uid, receiverUID);
      if (!roomId) return;
      set({ activeRoomId: roomId });
    }

    // Optimistic update
    const optimisticMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      senderUID: user.uid,
      receiverUID,
      content,
      mediaBase64,
      mediaMimeType,
      messageType: mediaBase64 ? 'image' : 'text',
      isRead: false,
      createdAt: Date.now(),
    };
    set((state) => ({ activeChatMessages: [...state.activeChatMessages, optimisticMessage] }));

    // Sync to Supabase
    try {
      const sent = await chatService.sendMessage({
        roomId,
        senderUID: user.uid,
        content,
        mediaBase64,
        mediaMimeType,
        messageType: mediaBase64 ? 'image' : 'text',
      });

      if (sent) {
        set((state) => ({
          activeChatMessages: state.activeChatMessages.map(m =>
            m.id === optimisticMessage.id ? sent : m
          ),
        }));
      }

      // Refresh chat rooms to update last message
      const rooms = await chatService.getChatRooms(user.uid);
      set({ chatRooms: rooms });
    } catch (error) {
      console.error('[ChatStore] sendMessage error:', error);
    }
  },

  /** Mark current room messages as read */
  markAsRead: async () => {
    const user = useAuthStore.getState().user;
    const { activeRoomId } = get();
    if (!user || !activeRoomId) return;

    try {
      await chatService.markMessagesAsRead(activeRoomId, user.uid);
    } catch (error) {
      console.error('[ChatStore] markAsRead error:', error);
    }
  },
}));

// ============ Users Store ============

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  searchUsers: (query: string) => Promise<User[]>;
  followUser: (uid: string) => Promise<void>;
  unfollowUser: (uid: string) => Promise<void>;
  getUserByUID: (uid: string) => Promise<User | null>;
  fetchUsers: () => Promise<void>;
  searchResults: User[];
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  searchResults: [],
  isLoading: false,
  error: null,

  /** Fetch suggested users */
  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      // Search for all users (limited) - could be replaced with a "suggested" endpoint
      const users = await userService.searchUsers('', 50);
      set({ users });
    } catch (error) {
      console.error('[UsersStore] fetchUsers error:', error);
      set({ error: 'Failed to load users' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Search users by query */
  searchUsers: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return [];
    }

    try {
      const results = await userService.searchUsers(query);
      set({ searchResults: results });
      return results;
    } catch (error) {
      console.error('[UsersStore] searchUsers error:', error);
      return [];
    }
  },

  /** Follow a user */
  followUser: async (uid: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    set((state) => ({
      users: state.users.map(u =>
        u.uid === uid ? { ...u, followersCount: u.followersCount + 1 } : u
      ),
    }));
    useAuthStore.getState().updateUser({ followingCount: user.followingCount + 1 });

    // Sync to Supabase
    try {
      await followService.followUser(user.uid, uid);
    } catch (error) {
      console.error('[UsersStore] followUser error:', error);
      // Revert
      set((state) => ({
        users: state.users.map(u =>
          u.uid === uid ? { ...u, followersCount: Math.max(0, u.followersCount - 1) } : u
        ),
      }));
    }
  },

  /** Unfollow a user */
  unfollowUser: async (uid: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    set((state) => ({
      users: state.users.map(u =>
        u.uid === uid ? { ...u, followersCount: Math.max(0, u.followersCount - 1) } : u
      ),
    }));
    useAuthStore.getState().updateUser({ followingCount: Math.max(0, user.followingCount - 1) });

    // Sync to Supabase
    try {
      await followService.unfollowUser(user.uid, uid);
    } catch (error) {
      console.error('[UsersStore] unfollowUser error:', error);
      // Revert
      set((state) => ({
        users: state.users.map(u =>
          u.uid === uid ? { ...u, followersCount: u.followersCount + 1 } : u
        ),
      }));
    }
  },

  /** Get a user by UID */
  getUserByUID: async (uid: string) => {
    // Check local cache first
    const cached = get().users.find(u => u.uid === uid);
    if (cached) return cached;

    // Fetch from Supabase
    try {
      return await userService.getUserByUID(uid);
    } catch (error) {
      console.error('[UsersStore] getUserByUID error:', error);
      return null;
    }
  },
}));

// ============ Notifications Store ============

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  /** Fetch notifications */
  fetchNotifications: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const notifications = await notificationService.getNotifications(user.uid);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error('[NotificationsStore] fetchNotifications error:', error);
      set({ error: 'Failed to load notifications' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Mark a notification as read */
  markAsRead: async (id: string) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await notificationService.markNotificationRead(id);
    } catch (error) {
      console.error('[NotificationsStore] markAsRead error:', error);
    }
  },

  /** Mark all notifications as read */
  markAllAsRead: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

    try {
      await notificationService.markAllNotificationsRead(user.uid);
    } catch (error) {
      console.error('[NotificationsStore] markAllAsRead error:', error);
    }
  },
}));

// ============ Gifts Store ============

interface GiftsState {
  giftTypes: GiftType[];
  receivedGifts: Gift[];
  sentGifts: Gift[];
  isLoading: boolean;
  error: string | null;
  fetchGiftTypes: () => Promise<void>;
  sendGift: (params: { receiverUID: string; giftTypeId: string; message?: string; postID?: string; liveStreamID?: string }) => Promise<boolean>;
  fetchReceivedGifts: () => Promise<void>;
  fetchSentGifts: () => Promise<void>;
}

export const useGiftsStore = create<GiftsState>((set) => ({
  giftTypes: [],
  receivedGifts: [],
  sentGifts: [],
  isLoading: false,
  error: null,

  /** Fetch gift types from shop */
  fetchGiftTypes: async () => {
    set({ isLoading: true });
    try {
      const giftTypes = await giftsService.getGiftTypes();
      set({ giftTypes });
    } catch (error) {
      console.error('[GiftsStore] fetchGiftTypes error:', error);
      set({ error: 'Failed to load gift shop' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Send a gift */
  sendGift: async (params) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    try {
      const gift = await giftsService.sendGift({
        senderUID: user.uid,
        receiverUID: params.receiverUID,
        giftTypeId: params.giftTypeId,
        message: params.message,
        postID: params.postID,
        liveStreamID: params.liveStreamID,
      });

      if (gift) {
        set((state) => ({ sentGifts: [gift, ...state.sentGifts] }));
        // Refresh wallet balance
        await useAuthStore.getState().refreshProfile();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[GiftsStore] sendGift error:', error);
      return false;
    }
  },

  /** Fetch received gifts */
  fetchReceivedGifts: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const gifts = await giftsService.getUserGifts(user.uid);
      set({ receivedGifts: gifts });
    } catch (error) {
      console.error('[GiftsStore] fetchReceivedGifts error:', error);
    }
  },

  /** Fetch sent gifts */
  fetchSentGifts: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const gifts = await giftsService.getSentGifts(user.uid);
      set({ sentGifts: gifts });
    } catch (error) {
      console.error('[GiftsStore] fetchSentGifts error:', error);
    }
  },
}));

// ============ Live Stream Store ============

interface LiveStreamState {
  liveStreams: LiveStream[];
  currentStream: LiveStream | null;
  streamComments: LiveStreamComment[];
  isLoading: boolean;
  error: string | null;
  fetchLiveStreams: () => Promise<void>;
  createStream: (params: { title: string; description?: string; category?: string; thumbnailBase64?: string }) => Promise<LiveStream | null>;
  endStream: (streamId: string) => Promise<void>;
  joinStream: (streamId: string) => Promise<void>;
  leaveStream: (streamId: string) => Promise<void>;
  getStreamById: (id: string) => Promise<LiveStream | null>;
  addComment: (streamId: string, content: string) => Promise<void>;
  fetchComments: (streamId: string) => Promise<void>;
}

export const useLiveStreamStore = create<LiveStreamState>((set) => ({
  liveStreams: [],
  currentStream: null,
  streamComments: [],
  isLoading: false,
  error: null,

  /** Fetch live streams */
  fetchLiveStreams: async () => {
    set({ isLoading: true });
    try {
      const streams = await liveStreamService.getLiveStreams('live');
      set({ liveStreams: streams });
    } catch (error) {
      console.error('[LiveStreamStore] fetchLiveStreams error:', error);
      set({ error: 'Failed to load live streams' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Create a new stream */
  createStream: async (params) => {
    const user = useAuthStore.getState().user;
    if (!user) return null;

    try {
      const stream = await liveStreamService.createStream({
        hostUID: user.uid,
        ...params,
      });

      if (stream) {
        set((state) => ({
          liveStreams: [stream, ...state.liveStreams],
          currentStream: stream,
        }));
      }
      return stream;
    } catch (error) {
      console.error('[LiveStreamStore] createStream error:', error);
      return null;
    }
  },

  /** End a stream */
  endStream: async (streamId: string) => {
    try {
      const success = await liveStreamService.endStream(streamId);
      if (success) {
        set((state) => ({
          liveStreams: state.liveStreams.filter(s => s.id !== streamId),
          currentStream: state.currentStream?.id === streamId ? null : state.currentStream,
        }));
      }
    } catch (error) {
      console.error('[LiveStreamStore] endStream error:', error);
    }
  },

  /** Join a stream as viewer */
  joinStream: async (streamId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await liveStreamService.joinStream(streamId, user.uid);
      const stream = await liveStreamService.getStreamById(streamId);
      if (stream) {
        set({ currentStream: stream });
      }
    } catch (error) {
      console.error('[LiveStreamStore] joinStream error:', error);
    }
  },

  /** Leave a stream */
  leaveStream: async (streamId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await liveStreamService.leaveStream(streamId, user.uid);
    } catch (error) {
      console.error('[LiveStreamStore] leaveStream error:', error);
    }
  },

  /** Get stream by ID */
  getStreamById: async (id: string) => {
    try {
      return await liveStreamService.getStreamById(id);
    } catch (error) {
      console.error('[LiveStreamStore] getStreamById error:', error);
      return null;
    }
  },

  /** Add a comment to a live stream */
  addComment: async (streamId: string, content: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    const optimisticComment: LiveStreamComment = {
      id: `temp_${Date.now()}`,
      streamID: streamId,
      userUID: user.uid,
      user: user,
      content,
      createdAt: Date.now(),
    };
    set((state) => ({ streamComments: [...state.streamComments, optimisticComment] }));

    // Sync to Supabase
    try {
      const comment = await liveStreamService.addStreamComment(streamId, user.uid, content);
      if (comment) {
        set((state) => ({
          streamComments: state.streamComments.map(c => c.id === optimisticComment.id ? comment : c),
        }));
      }
    } catch (error) {
      console.error('[LiveStreamStore] addComment error:', error);
      // Remove optimistic comment on failure
      set((state) => ({ streamComments: state.streamComments.filter(c => c.id !== optimisticComment.id) }));
    }
  },

  /** Fetch comments for a live stream */
  fetchComments: async (streamId: string) => {
    try {
      const comments = await liveStreamService.getStreamComments(streamId);
      set({ streamComments: comments });
    } catch (error) {
      console.error('[LiveStreamStore] fetchComments error:', error);
    }
  },
}));

// ============ Wallet Store ============

interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchWallet: () => Promise<void>;
  fetchTransactions: (page?: number) => Promise<void>;
  purchaseCoins: (amount: number, paymentReference: string) => Promise<boolean>;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  transactions: [],
  isLoading: false,
  error: null,

  /** Fetch wallet data */
  fetchWallet: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const wallet = await walletService.getWallet(user.uid);
      set({ wallet });
    } catch (error) {
      console.error('[WalletStore] fetchWallet error:', error);
      set({ error: 'Failed to load wallet' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Fetch transactions */
  fetchTransactions: async (page = 0) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const transactions = await walletService.getTransactions(user.uid, page);
      set({ transactions });
    } catch (error) {
      console.error('[WalletStore] fetchTransactions error:', error);
    }
  },

  /** Purchase coins */
  purchaseCoins: async (amount: number, paymentReference: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    try {
      const success = await walletService.purchaseCoins(user.uid, amount, paymentReference);
      if (success) {
        // Refresh wallet and profile
        await useWalletStore.getState().fetchWallet();
        await useAuthStore.getState().refreshProfile();
      }
      return success;
    } catch (error) {
      console.error('[WalletStore] purchaseCoins error:', error);
      return false;
    }
  },
}));

// ============ Achievement Store ============

interface AchievementState {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  dailyReward: DailyReward | null;
  isLoading: boolean;
  error: string | null;
  fetchAchievements: () => Promise<void>;
  fetchUserAchievements: () => Promise<void>;
  claimDailyReward: () => Promise<DailyReward | null>;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],
  userAchievements: [],
  dailyReward: null,
  isLoading: false,
  error: null,

  /** Fetch all achievements */
  fetchAchievements: async () => {
    set({ isLoading: true });
    try {
      const achievements = await achievementService.getAchievements();
      set({ achievements });
    } catch (error) {
      console.error('[AchievementStore] fetchAchievements error:', error);
      set({ error: 'Failed to load achievements' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Fetch user's achievements */
  fetchUserAchievements: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const userAchievements = await achievementService.getUserAchievements(user.uid);
      set({ userAchievements });
    } catch (error) {
      console.error('[AchievementStore] fetchUserAchievements error:', error);
    }
  },

  /** Claim daily reward */
  claimDailyReward: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return null;

    try {
      const reward = await achievementService.claimDailyReward(user.uid);
      if (reward) {
        set({ dailyReward: reward });
        // Refresh wallet
        await useWalletStore.getState().fetchWallet();
        await useAuthStore.getState().refreshProfile();
      }
      return reward;
    } catch (error) {
      console.error('[AchievementStore] claimDailyReward error:', error);
      return null;
    }
  },
}));

// ============ App State Store ============

interface AppState {
  activeTab: 'home' | 'explore' | 'create' | 'chat' | 'profile' | 'live' | 'wallet' | 'achievements' | 'settings' | 'earnings' | 'admin';
  currentProfileUID: string | null;
  showAuth: 'login' | 'register' | 'complete-profile' | 'verify-email' | 'forgot-password' | null;
  showCreatePost: boolean;
  showNotifications: boolean;
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  setActiveTab: (tab: AppState['activeTab']) => void;
  setCurrentProfileUID: (uid: string | null) => void;
  setShowAuth: (show: AppState['showAuth']) => void;
  setShowCreatePost: (show: boolean) => void;
  setShowNotifications: (show: boolean) => void;
  toggleTheme: () => void;
  setLanguage: (lang: 'ar' | 'en') => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  currentProfileUID: null,
  showAuth: null,
  showCreatePost: false,
  showNotifications: false,
  theme: 'dark',
  language: 'ar',
  setActiveTab: (activeTab) => set({ activeTab, showNotifications: false }),
  setCurrentProfileUID: (currentProfileUID) => set({ currentProfileUID }),
  setShowAuth: (showAuth) => set({ showAuth }),
  setShowCreatePost: (showCreatePost) => set({ showCreatePost }),
  setShowNotifications: (showNotifications) => set({ showNotifications }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setLanguage: (language) => set({ language }),
}));
