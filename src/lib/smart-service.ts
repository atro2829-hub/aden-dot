/**
 * Smart Fallback Service for Aden Dot
 * --------------------------------------
 * Wraps the Supabase service layer with automatic local-first fallback.
 *
 * Strategy:
 *  1. Try Supabase first (if configured & reachable)
 *  2. On network failure, fall back to local database
 *  3. Cache successful Supabase responses locally for offline use
 *  4. Track connection state for UI feedback
 *
 * This ensures the app ALWAYS works, even when Supabase is down or unreachable.
 */

import type {
  User, Post, Comment, Story, ChatRoom, ChatMessage, Notification,
  GiftType, Gift, LiveStream, Wallet, Transaction,
  Achievement, UserAchievement, DailyReward,
  PostType, MessageType, NotificationType, TransactionType, CurrencyType,
} from '@/types/skyline';
import {
  localAuth, localUsers, localPosts, localComments, localStories,
  localFollows, localNotifications, localChat, localWallet, localGifts,
  localLive, localAchievements, localDailyRewards, initLocalDatabase,
} from './local-database';
import { getActiveSupabaseConfig } from './supabase-config';

// ============ Connection State ============
type ConnectionMode = 'supabase' | 'local' | 'unknown';

let currentMode: ConnectionMode = 'unknown';
const modeListeners = new Set<(mode: ConnectionMode) => void>();

export function getConnectionMode(): ConnectionMode {
  return currentMode;
}

export function setConnectionMode(mode: ConnectionMode): void {
  if (currentMode === mode) return;
  currentMode = mode;
  modeListeners.forEach(l => l(mode));
}

export function onConnectionModeChange(listener: (mode: ConnectionMode) => void): () => void {
  modeListeners.add(listener);
  return () => modeListeners.delete(listener);
}

// ============ Supabase Reachability Check ============
let supabaseReachable: boolean | null = null;
let lastCheckAt = 0;
const CHECK_INTERVAL = 30_000; // 30 seconds

/**
 * Check if Supabase is configured and reachable.
 * Cached for 30 seconds to avoid hammering.
 */
export async function checkSupabaseReachable(): Promise<boolean> {
  const now = Date.now();
  if (supabaseReachable !== null && now - lastCheckAt < CHECK_INTERVAL) {
    return supabaseReachable;
  }

  const config = getActiveSupabaseConfig();
  if (!config) {
    supabaseReachable = false;
    lastCheckAt = now;
    setConnectionMode('local');
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${config.url}/auth/v1/health`, {
      method: 'GET',
      headers: { 'apikey': config.anonKey },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    supabaseReachable = response.ok;
    setConnectionMode(supabaseReachable ? 'supabase' : 'local');
  } catch {
    supabaseReachable = false;
    setConnectionMode('local');
  }
  lastCheckAt = now;
  return supabaseReachable;
}

/** Force reset the cache (called after user changes config) */
export function resetReachabilityCache(): void {
  supabaseReachable = null;
  lastCheckAt = 0;
}

// ============ Auth Service (with fallback) ============
export const smartAuth = {
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();

    if (reachable) {
      try {
        const { authService, userService } = await import('./supabase-service');
        const data = await authService.signIn(email, password);
        if (data.user) {
          const profile = await userService.getUserProfile(data.user.id);
          if (profile) {
            return { user: profile, error: null };
          }
        }
        return { user: null, error: 'فشل تحميل الملف الشخصي' };
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        const isNetwork = /network|failed to fetch|timeout|aborted|err_network|err_name_resolution|err_connection/i.test(msg);
        if (!isNetwork) {
          if (msg.includes('Invalid login credentials')) {
            return { user: null, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
          }
          return { user: null, error: msg };
        }
        console.warn('[SmartAuth] Supabase unreachable, falling back to local');
      }
    }

    return localAuth.login(email, password);
  },

  async register(email: string, password: string, username?: string, nickname?: string): Promise<{ user: User | null; error: string | null }> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();

    if (reachable) {
      try {
        const { authService, userService } = await import('./supabase-service');
        const data = await authService.signUp(email, password, username, nickname);
        if (data.user) {
          let profile: User | null = null;
          for (let i = 0; i < 3; i++) {
            profile = await userService.getUserProfile(data.user.id);
            if (profile) break;
            await new Promise(r => setTimeout(r, 500));
          }
          if (profile) return { user: profile, error: null };
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        const isNetwork = /network|failed to fetch|timeout|aborted|err_network|err_name_resolution|err_connection/i.test(msg);
        if (!isNetwork) {
          if (msg.includes('User already registered')) {
            return { user: null, error: 'هذا البريد مسجل مسبقاً' };
          }
          return { user: null, error: msg };
        }
      }
    }

    return localAuth.register(email, password, username, nickname);
  },

  async loginWithGoogle(profile: { email: string; name: string; picture: string; sub: string }): Promise<{ user: User | null; error: string | null }> {
    initLocalDatabase();
    return localAuth.loginWithGoogle(profile);
  },

  async logout(): Promise<void> {
    try {
      const reachable = await checkSupabaseReachable();
      if (reachable) {
        const { authService } = await import('./supabase-service');
        await authService.signOut();
      }
    } catch {
      // ignore
    }
    await localAuth.logout();
  },

  getCurrentUser(): User | null {
    return localAuth.getCurrentUser();
  },

  isAdmin(): boolean {
    return localAuth.isAdmin();
  },
};

// ============ Posts Service (with fallback) ============
export const smartPosts = {
  async getFeed(currentUID?: string): Promise<Post[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable && currentUID) {
      try {
        const { postsService } = await import('./supabase-service');
        return await postsService.getFeed(currentUID);
      } catch {
        // fall back
      }
    }
    return localPosts.getAll();
  },

  async getByUser(uid: string): Promise<Post[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { postsService } = await import('./supabase-service');
        return await postsService.getUserPosts(uid);
      } catch {
        // fall back
      }
    }
    return localPosts.getByUser(uid);
  },

  async getById(id: string): Promise<Post | null> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { postsService } = await import('./supabase-service');
        return await postsService.getPostById(id);
      } catch {
        // fall back
      }
    }
    return localPosts.getById(id);
  },

  async create(data: { userId: string; content: string; type?: PostType; region?: string }): Promise<Post | null> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { postsService } = await import('./supabase-service');
        return await postsService.createPost({
          publisherUID: data.userId,
          type: data.type || 'TEXT',
          content: data.content,
          description: '',
          region: data.region || 'aden',
        });
      } catch {
        // fall back
      }
    }
    return localPosts.create(data);
  },

  async toggleLike(postId: string, userId: string): Promise<void> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { postsService } = await import('./supabase-service');
        await postsService.toggleLike(postId, userId);
        return;
      } catch {
        // fall back
      }
    }
    localPosts.toggleLike(postId, userId);
  },

  async incrementShare(postId: string): Promise<void> {
    initLocalDatabase();
    // No Supabase equivalent — use local only
    localPosts.incrementShare(postId);
  },

  async incrementView(postId: string): Promise<void> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { postsService } = await import('./supabase-service');
        await postsService.incrementViews(postId);
        return;
      } catch {
        // fall back
      }
    }
    localPosts.incrementView(postId);
  },

  async delete(postId: string, userId: string): Promise<void> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { postsService } = await import('./supabase-service');
        await postsService.deletePost(postId, userId);
        return;
      } catch {
        // fall back
      }
    }
    localPosts.delete(postId);
  },
};

// ============ Comments Service ============
export const smartComments = {
  async getByPost(postId: string): Promise<Comment[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { commentsService } = await import('./supabase-service');
        return await commentsService.getPostComments(postId);
      } catch {
        // fall back
      }
    }
    return localComments.getByPost(postId);
  },

  async create(data: { postId: string; userId: string; content: string }): Promise<Comment | null> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { commentsService } = await import('./supabase-service');
        return await commentsService.createComment({
          postID: data.postId,
          publisherUID: data.userId,
          content: data.content,
        });
      } catch {
        // fall back
      }
    }
    return localComments.create(data);
  },

  async toggleLike(commentId: string, userId: string): Promise<void> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { commentsService } = await import('./supabase-service');
        await commentsService.toggleCommentLike(commentId, userId);
        return;
      } catch {
        // fall back
      }
    }
    localComments.toggleLike(commentId, userId);
  },
};

// ============ Stories Service ============
export const smartStories = {
  async getActive(): Promise<Story[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { storiesService } = await import('./supabase-service');
        return await storiesService.getActiveStories();
      } catch {
        // fall back
      }
    }
    return localStories.getActive();
  },

  async create(data: { userId: string; content: string; mediaType?: string }): Promise<Story | null> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { storiesService } = await import('./supabase-service');
        return await storiesService.createStory({
          publisherUID: data.userId,
          mediaBase64: data.content,
          mediaMimeType: data.mediaType || 'text/plain',
        });
      } catch {
        // fall back
      }
    }
    return localStories.create(data);
  },

  async view(storyId: string, viewerId: string): Promise<void> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { storiesService } = await import('./supabase-service');
        await storiesService.viewStory(storyId, viewerId);
        return;
      } catch {
        // fall back
      }
    }
    localStories.view(storyId, viewerId);
  },
};

// ============ Follows Service ============
export const smartFollows = {
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { followService } = await import('./supabase-service');
        return await followService.isFollowing(followerId, followingId);
      } catch {
        // fall back
      }
    }
    return localFollows.isFollowing(followerId, followingId);
  },

  async follow(followerId: string, followingId: string): Promise<void> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { followService } = await import('./supabase-service');
        await followService.followUser(followerId, followingId);
        return;
      } catch {
        // fall back
      }
    }
    localFollows.follow(followerId, followingId);
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { followService } = await import('./supabase-service');
        await followService.unfollowUser(followerId, followingId);
        return;
      } catch {
        // fall back
      }
    }
    localFollows.unfollow(followerId, followingId);
  },

  async getFollowers(uid: string): Promise<User[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { followService } = await import('./supabase-service');
        return await followService.getFollowers(uid);
      } catch {
        // fall back
      }
    }
    return localFollows.getFollowers(uid);
  },

  async getFollowing(uid: string): Promise<User[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { followService } = await import('./supabase-service');
        return await followService.getFollowing(uid);
      } catch {
        // fall back
      }
    }
    return localFollows.getFollowing(uid);
  },
};

// ============ Users Service ============
export const smartUsers = {
  async getById(uid: string): Promise<User | null> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { userService } = await import('./supabase-service');
        return await userService.getUserProfile(uid);
      } catch {
        // fall back
      }
    }
    return localUsers.getById(uid);
  },

  async search(query: string): Promise<User[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { userService } = await import('./supabase-service');
        return await userService.searchUsers(query);
      } catch {
        // fall back
      }
    }
    return localUsers.search(query);
  },

  async update(uid: string, data: Partial<User>): Promise<User | null> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { userService } = await import('./supabase-service');
        await userService.updateUserProfile(uid, data);
        return localUsers.update(uid, data);
      } catch {
        // fall back
      }
    }
    return localUsers.update(uid, data);
  },
};

// ============ Notifications Service ============
export const smartNotifications = {
  async getByUser(uid: string): Promise<Notification[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { notificationService } = await import('./supabase-service');
        return await notificationService.getNotifications(uid);
      } catch {
        // fall back
      }
    }
    return localNotifications.getByUser(uid);
  },

  async markAsRead(id: string): Promise<void> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { notificationService } = await import('./supabase-service');
        await notificationService.markNotificationRead(id);
        return;
      } catch {
        // fall back
      }
    }
    localNotifications.markAsRead(id);
  },

  async markAllAsRead(uid: string): Promise<void> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { notificationService } = await import('./supabase-service');
        await notificationService.markAllNotificationsRead(uid);
        return;
      } catch {
        // fall back
      }
    }
    localNotifications.markAllAsRead(uid);
  },
};

// ============ Chat Service ============
export const smartChat = {
  async getRooms(userId: string): Promise<ChatRoom[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { chatService } = await import('./supabase-service');
        return await chatService.getChatRooms(userId);
      } catch {
        // fall back
      }
    }
    return localChat.getRooms(userId);
  },

  async getMessages(otherUserId: string, currentUserId: string): Promise<ChatMessage[]> {
    initLocalDatabase();
    // Local mode: get messages between two users directly
    return localChat.getMessages(otherUserId, currentUserId);
  },

  async sendMessage(receiverId: string, senderId: string, content: string, type: MessageType = 'text'): Promise<ChatMessage | null> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { chatService } = await import('./supabase-service');
        const roomId = await chatService.createOrGetChatRoom(senderId, receiverId);
        if (roomId) {
          return await chatService.sendMessage({
            roomId,
            senderUID: senderId,
            content,
            messageType: type,
          });
        }
      } catch {
        // fall back
      }
    }
    return localChat.sendMessage(receiverId, senderId, content, type);
  },
};

// ============ Wallet Service ============
export const smartWallet = {
  async getByUser(uid: string): Promise<Wallet | null> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { walletService } = await import('./supabase-service');
        return await walletService.getWallet(uid);
      } catch {
        // fall back
      }
    }
    return localWallet.getByUser(uid);
  },

  async getTransactions(uid: string): Promise<Transaction[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { walletService } = await import('./supabase-service');
        return await walletService.getTransactions(uid);
      } catch {
        // fall back
      }
    }
    return localWallet.getTransactions(uid);
  },
};

// ============ Gifts Service ============
export const smartGifts = {
  async getAll(): Promise<GiftType[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { giftsService } = await import('./supabase-service');
        return await giftsService.getGiftTypes();
      } catch {
        // fall back
      }
    }
    return localGifts.getAll();
  },

  async send(data: { fromUserId: string; toUserId: string; giftId: string; liveStreamId?: string }): Promise<{ success: boolean; error?: string }> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { giftsService } = await import('./supabase-service');
        await giftsService.sendGift({
          senderUID: data.fromUserId,
          receiverUID: data.toUserId,
          giftTypeId: data.giftId,
          liveStreamID: data.liveStreamId,
        });
        return { success: true };
      } catch {
        // fall back
      }
    }
    return localGifts.send(data);
  },
};

// ============ Live Stream Service ============
export const smartLive = {
  async getActive(): Promise<LiveStream[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { liveStreamService } = await import('./supabase-service');
        return await liveStreamService.getLiveStreams();
      } catch {
        // fall back
      }
    }
    return localLive.getActive();
  },

  async create(data: { userId: string; title: string; description?: string }): Promise<LiveStream> {
    initLocalDatabase();
    return localLive.create(data);
  },

  async end(streamId: string): Promise<void> {
    initLocalDatabase();
    localLive.end(streamId);
  },
};

// ============ Achievements Service ============
export const smartAchievements = {
  async getAll(): Promise<Achievement[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { achievementService } = await import('./supabase-service');
        return await achievementService.getAchievements();
      } catch {
        // fall back
      }
    }
    return localAchievements.getAll();
  },

  async getByUser(uid: string): Promise<UserAchievement[]> {
    initLocalDatabase();
    const reachable = await checkSupabaseReachable();
    if (reachable) {
      try {
        const { achievementService } = await import('./supabase-service');
        return await achievementService.getUserAchievements(uid);
      } catch {
        // fall back
      }
    }
    return localAchievements.getByUser(uid);
  },
};

// ============ Daily Rewards ============
export const smartDailyRewards = {
  claim(uid: string): { day: number; coins: number; diamonds: number; error?: string } {
    initLocalDatabase();
    return localDailyRewards.claim(uid);
  },

  getNextDay(uid: string): number {
    initLocalDatabase();
    return localDailyRewards.getNextDay(uid);
  },
};
