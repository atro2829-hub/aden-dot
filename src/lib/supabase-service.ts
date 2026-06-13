/**
 * Skyline Supabase Service Layer
 * Complete abstraction for all database operations
 * Replaces Zustand mock stores with real Supabase queries
 *
 * All methods use getSupabaseBrowser() for client-side operations.
 * All methods include proper error handling with try/catch.
 * All data mapping uses the supabase-mapper.ts utilities.
 */

import { getSupabaseBrowser } from './supabase-browser';
import {
  mapUserFromDB, mapPostFromDB, mapCommentFromDB, mapStoryFromDB,
  mapChatMessageFromDB, mapChatRoomFromDB, mapNotificationFromDB,
  mapGiftTypeFromDB, mapGiftFromDB, mapLiveStreamFromDB, mapWalletFromDB,
  mapTransactionFromDB, mapAchievementFromDB, mapUserAchievementFromDB,
  mapDailyRewardFromDB, mapUserToDB, mapPostToDB, mapCommentToDB,
  mapStoryToDB, mapChatMessageToDB, mapNotificationToDB, mapLiveStreamToDB,
  mapWalletToDB, mapTransactionToDB,
  type UserRow, type PostRow, type CommentRow, type StoryRow,
  type ChatRoomRow, type ChatMessageRow, type NotificationRow,
  type GiftTypeRow, type GiftRow, type LiveStreamRow,
  type LiveStreamCommentRow, type WalletRow, type TransactionRow,
  type AchievementRow, type UserAchievementRow, type DailyRewardRow,
  type FollowerRow, type PostLikeRow, type PostFavoriteRow, type CommentLikeRow,
} from './supabase-mapper';
import type {
  User, Post, Comment, Story, ChatRoom, ChatMessage, Notification,
  GiftType, Gift, LiveStream, LiveStreamComment, Wallet, Transaction,
  Achievement, UserAchievement, DailyReward,
  PostType, Gender, UserStatus, UserRole, MessageType, NotificationType,
  TransactionType, CurrencyType, GiftCategory, GiftAnimation, LiveStreamStatus,
  AchievementCategory,
} from '@/types/skyline';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

// ============ UTILITY FUNCTIONS ============

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function formatCount(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/** Helper: get the Supabase client or throw */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(): SupabaseClient<any> {
  const client = getSupabaseBrowser();
  if (!client) throw new Error('Supabase client not configured');
  return client as SupabaseClient<any>;
}

// ============ AUTH SERVICE ============

export const authService = {
  /** Register with Supabase Auth + create user profile */
  async signUp(email: string, password: string, username?: string, nickname?: string) {
    try {
      const client = getClient();
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;

      // Create user profile in users table
      if (data.user) {
        const uid = data.user.id;
        await client.from('users').upsert({
          uid,
          email,
          username: username || null,
          nickname: nickname || '',
          is_profile_complete: false,
          is_email_verified: false,
          status: 'online',
          last_seen: Date.now(),
        });

        // Create wallet for new user
        await client.from('wallets').upsert({
          uid,
          coins_balance: 100, // Welcome bonus
          diamonds_balance: 0,
        });
      }

      return data;
    } catch (error) {
      console.error('[AuthService] signUp error:', error);
      throw error;
    }
  },

  /** Login with Supabase Auth */
  async signIn(email: string, password: string) {
    try {
      const client = getClient();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Update last seen
      if (data.user) {
        await client.from('users').update({
          status: 'online',
          last_seen: Date.now(),
        }).eq('uid', data.user.id);
      }

      return data;
    } catch (error) {
      console.error('[AuthService] signIn error:', error);
      throw error;
    }
  },

  /** Logout */
  async signOut() {
    try {
      const client = getClient();
      const user = (await client.auth.getUser()).data.user;
      if (user) {
        try {
          await client.from('users').update({
            status: 'offline',
            last_seen: Date.now(),
          }).eq('uid', user.id);
        } catch { /* ignore status update error */ }
      }
      const { error } = await client.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('[AuthService] signOut error:', error);
      throw error;
    }
  },

  /** Get current auth user from Supabase Auth */
  async getCurrentUser() {
    try {
      const client = getClient();
      const { data: { user }, error } = await client.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('[AuthService] getCurrentUser error:', error);
      return null;
    }
  },

  /** Get current session */
  async getSession() {
    try {
      const client = getClient();
      const { data: { session }, error } = await client.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('[AuthService] getSession error:', error);
      return null;
    }
  },

  /** Resend email verification */
  async resendVerificationEmail(email: string) {
    try {
      const client = getClient();
      const { error } = await client.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
    } catch (error) {
      console.error('[AuthService] resendVerificationEmail error:', error);
      throw error;
    }
  },

  /** Listen for auth state changes */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    const client = getClient();
    return client.auth.onAuthStateChange(callback);
  },
};

// ============ USER SERVICE ============

export const userService = {
  /** Get user profile with all fields */
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('uid', uid)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapUserFromDB(data as UserRow);
    } catch (error) {
      console.error('[UserService] getUserProfile error:', error);
      return null;
    }
  },

  /** Update profile fields */
  async updateUserProfile(uid: string, updates: Partial<User>): Promise<User | null> {
    try {
      const client = getClient();
      const rowUpdates = mapUserToDB(updates);
      const { data, error } = await client
        .from('users')
        .update(rowUpdates)
        .eq('uid', uid)
        .select()
        .single();
      if (error) throw error;
      return mapUserFromDB(data as UserRow);
    } catch (error) {
      console.error('[UserService] updateUserProfile error:', error);
      return null;
    }
  },

  /** Search users by username/nickname */
  async searchUsers(query: string, limit = 20): Promise<User[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,nickname.ilike.%${query}%`)
        .limit(limit);
      if (error) throw error;
      return (data as UserRow[]).map(mapUserFromDB);
    } catch (error) {
      console.error('[UserService] searchUsers error:', error);
      return [];
    }
  },

  /** Get single user by UID */
  async getUserByUID(uid: string): Promise<User | null> {
    return this.getUserProfile(uid);
  },

  /** Create user profile (used after auth signup) */
  async createUser(uid: string, email: string, username: string, nickname: string): Promise<User | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('users')
        .insert({
          uid,
          email,
          username,
          nickname,
          is_profile_complete: false,
          is_email_verified: false,
          status: 'online',
          last_seen: Date.now(),
        })
        .select()
        .single();
      if (error) throw error;
      return mapUserFromDB(data as UserRow);
    } catch (error) {
      console.error('[UserService] createUser error:', error);
      return null;
    }
  },

  /** Update last seen timestamp */
  async updateLastSeen(uid: string): Promise<void> {
    try {
      const client = getClient();
      await client
        .from('users')
        .update({ last_seen: Date.now(), status: 'online' })
        .eq('uid', uid);
    } catch (error) {
      console.error('[UserService] updateLastSeen error:', error);
    }
  },
};

// ============ POSTS SERVICE ============

export const postsService = {
  /** Create new post with Base64 media */
  async createPost(post: {
    publisherUID: string;
    type: PostType;
    content: string;
    mediaBase64?: string;
    mediaMimeType?: string;
    description?: string;
    isPrivate?: boolean;
    region?: string;
  }): Promise<Post | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('posts')
        .insert({
          publisher_uid: post.publisherUID,
          type: post.type,
          content: post.content,
          media_base64: post.mediaBase64 || '',
          media_mime_type: post.mediaMimeType || '',
          description: post.description || '',
          is_private: post.isPrivate || false,
          region: post.region || '',
        })
        .select('*, publisher:users!posts_publisher_uid_fkey(*)')
        .single();
      if (error) throw error;
      return mapPostFromDB(data as PostRow & { publisher: UserRow });
    } catch (error) {
      console.error('[PostsService] createPost error:', error);
      return null;
    }
  },

  /** Get feed with publisher info + like/favorite status */
  async getFeed(currentUID: string, page = 0, limit = 20): Promise<Post[]> {
    try {
      const client = getClient();
      const offset = page * limit;

      // Get posts from followed users + own posts
      const { data: following } = await client
        .from('followers')
        .select('followed_uid')
        .eq('follower_uid', currentUID);

      const followedUIDs = following?.map(f => f.followed_uid) || [];
      followedUIDs.push(currentUID);

      const { data, error } = await client
        .from('posts')
        .select('*, publisher:users!posts_publisher_uid_fkey(*)')
        .in('publisher_uid', followedUIDs)
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Check likes/favorites for current user
      const postIds = (data as PostRow[]).map(p => p.id);
      const [likes, favorites] = await Promise.all([
        client.from('post_likes').select('post_id').eq('user_uid', currentUID).in('post_id', postIds),
        client.from('post_favorites').select('post_id').eq('user_uid', currentUID).in('post_id', postIds),
      ]);

      const likedPostIds = new Set((likes.data || []).map(l => (l as PostLikeRow).post_id));
      const favoritedPostIds = new Set((favorites.data || []).map(f => (f as PostFavoriteRow).post_id));

      return (data as (PostRow & { publisher: UserRow })[]).map(row => {
        const post = mapPostFromDB(row);
        post.isLiked = likedPostIds.has(row.id);
        post.isFavorite = favoritedPostIds.has(row.id);
        return post;
      });
    } catch (error) {
      console.error('[PostsService] getFeed error:', error);
      return [];
    }
  },

  /** Get all public posts (explore) */
  async getExplorePosts(page = 0, limit = 20): Promise<Post[]> {
    try {
      const client = getClient();
      const offset = page * limit;
      const { data, error } = await client
        .from('posts')
        .select('*, publisher:users!posts_publisher_uid_fkey(*)')
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return (data as (PostRow & { publisher: UserRow })[]).map(mapPostFromDB);
    } catch (error) {
      console.error('[PostsService] getExplorePosts error:', error);
      return [];
    }
  },

  /** Get single post by ID */
  async getPostById(id: string): Promise<Post | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('posts')
        .select('*, publisher:users!posts_publisher_uid_fkey(*)')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapPostFromDB(data as PostRow & { publisher: UserRow });
    } catch (error) {
      console.error('[PostsService] getPostById error:', error);
      return null;
    }
  },

  /** Get posts by user */
  async getUserPosts(uid: string, page = 0, limit = 20): Promise<Post[]> {
    try {
      const client = getClient();
      const offset = page * limit;
      const { data, error } = await client
        .from('posts')
        .select('*, publisher:users!posts_publisher_uid_fkey(*)')
        .eq('publisher_uid', uid)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return (data as (PostRow & { publisher: UserRow })[]).map(mapPostFromDB);
    } catch (error) {
      console.error('[PostsService] getUserPosts error:', error);
      return [];
    }
  },

  /** Like/unlike post */
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    try {
      const client = getClient();
      const { data: existing } = await client
        .from('post_likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_uid', userId)
        .single();

      if (existing) {
        await client.from('post_likes').delete().eq('post_id', postId).eq('user_uid', userId);
        // Decrement likes count - try RPC first, fallback to manual
        try {
          const likesData = (await client.from('posts').select('likes_count').eq('id', postId).single()).data;
          if (likesData) {
            await client.from('posts').update({ likes_count: Math.max(0, (likesData as PostRow).likes_count - 1) }).eq('id', postId);
          }
        } catch { /* ignore */ }
        return false; // unliked
      } else {
        await client.from('post_likes').insert({ post_id: postId, user_uid: userId });
        // Increment likes count
        try {
          const likesData = (await client.from('posts').select('likes_count').eq('id', postId).single()).data;
          if (likesData) {
            await client.from('posts').update({ likes_count: (likesData as PostRow).likes_count + 1 }).eq('id', postId);
          }
        } catch { /* ignore */ }
        return true; // liked
      }
    } catch (error) {
      console.error('[PostsService] toggleLike error:', error);
      return false;
    }
  },

  /** Favorite/unfavorite post */
  async toggleFavorite(postId: string, userId: string): Promise<boolean> {
    try {
      const client = getClient();
      const { data: existing } = await client
        .from('post_favorites')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_uid', userId)
        .single();

      if (existing) {
        await client.from('post_favorites').delete().eq('post_id', postId).eq('user_uid', userId);
        return false; // unfavorited
      } else {
        await client.from('post_favorites').insert({ post_id: postId, user_uid: userId });
        return true; // favorited
      }
    } catch (error) {
      console.error('[PostsService] toggleFavorite error:', error);
      return false;
    }
  },

  /** Delete post */
  async deletePost(postId: string, userId: string): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('publisher_uid', userId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[PostsService] deletePost error:', error);
      return false;
    }
  },

  /** Increment post views */
  async incrementViews(postId: string): Promise<void> {
    try {
      const client = getClient();
      const { error } = await client.rpc('increment_post_views', { post_id: postId });
      if (error) {
        // Fallback: manual increment
        const { data } = await client.from('posts').select('views_count').eq('id', postId).single();
        if (data) {
          await client.from('posts').update({ views_count: (data as PostRow).views_count + 1 }).eq('id', postId);
        }
      }
    } catch (error) {
      console.error('[PostsService] incrementViews error:', error);
    }
  },
};

// ============ COMMENTS SERVICE ============

export const commentsService = {
  /** Add comment */
  async createComment(comment: {
    postID: string;
    publisherUID: string;
    content: string;
    parentCommentID?: string;
  }): Promise<Comment | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('comments')
        .insert({
          post_id: comment.postID,
          publisher_uid: comment.publisherUID,
          content: comment.content,
          parent_comment_id: comment.parentCommentID || null,
        })
        .select('*, publisher:users!comments_publisher_uid_fkey(*)')
        .single();
      if (error) throw error;

      // Increment comments count on post
      await client.from('posts').select('comments_count').eq('id', comment.postID).single()
        .then(({ data: postData }) => {
          if (postData) client.from('posts').update({ comments_count: (postData as PostRow).comments_count + 1 }).eq('id', comment.postID);
        });

      return mapCommentFromDB(data as CommentRow & { publisher: UserRow });
    } catch (error) {
      console.error('[CommentsService] createComment error:', error);
      return null;
    }
  },

  /** Get comments with user info */
  async getPostComments(postId: string, limit = 50): Promise<Comment[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('comments')
        .select('*, publisher:users!comments_publisher_uid_fkey(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data as (CommentRow & { publisher: UserRow })[]).map(mapCommentFromDB);
    } catch (error) {
      console.error('[CommentsService] getPostComments error:', error);
      return [];
    }
  },

  /** Delete comment */
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('publisher_uid', userId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[CommentsService] deleteComment error:', error);
      return false;
    }
  },

  /** Like/unlike comment */
  async toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
    try {
      const client = getClient();
      const { data: existing } = await client
        .from('comment_likes')
        .select('comment_id')
        .eq('comment_id', commentId)
        .eq('user_uid', userId)
        .single();

      if (existing) {
        await client.from('comment_likes').delete().eq('comment_id', commentId).eq('user_uid', userId);
        // Decrement likes count
        const { data: commentData } = await client.from('comments').select('likes_count').eq('id', commentId).single();
        if (commentData) {
          await client.from('comments').update({ likes_count: Math.max(0, (commentData as CommentRow).likes_count - 1) }).eq('id', commentId);
        }
        return false; // unliked
      } else {
        await client.from('comment_likes').insert({ comment_id: commentId, user_uid: userId });
        // Increment likes count
        const { data: commentData } = await client.from('comments').select('likes_count').eq('id', commentId).single();
        if (commentData) {
          await client.from('comments').update({ likes_count: (commentData as CommentRow).likes_count + 1 }).eq('id', commentId);
        }
        return true; // liked
      }
    } catch (error) {
      console.error('[CommentsService] toggleCommentLike error:', error);
      return false;
    }
  },
};

// ============ STORIES SERVICE ============

export const storiesService = {
  /** Create story with Base64 media */
  async createStory(story: {
    publisherUID: string;
    mediaBase64: string;
    mediaMimeType: string;
  }): Promise<Story | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('stories')
        .insert({
          publisher_uid: story.publisherUID,
          media_base64: story.mediaBase64,
          media_mime_type: story.mediaMimeType,
        })
        .select('*, publisher:users!stories_publisher_uid_fkey(*)')
        .single();
      if (error) throw error;
      return mapStoryFromDB(data as StoryRow & { publisher: UserRow });
    } catch (error) {
      console.error('[StoriesService] createStory error:', error);
      return null;
    }
  },

  /** Get stories from last 24h grouped by user */
  async getActiveStories(limit = 50): Promise<Story[]> {
    try {
      const client = getClient();
      const twentyFourHoursAgo = Date.now() - 86400000;
      const { data, error } = await client
        .from('stories')
        .select('*, publisher:users!stories_publisher_uid_fkey(*)')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as (StoryRow & { publisher: UserRow })[]).map(mapStoryFromDB);
    } catch (error) {
      console.error('[StoriesService] getActiveStories error:', error);
      return [];
    }
  },

  /** Get stories for a specific user */
  async getUserStories(uid: string): Promise<Story[]> {
    try {
      const client = getClient();
      const twentyFourHoursAgo = Date.now() - 86400000;
      const { data, error } = await client
        .from('stories')
        .select('*, publisher:users!stories_publisher_uid_fkey(*)')
        .eq('publisher_uid', uid)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as (StoryRow & { publisher: UserRow })[]).map(mapStoryFromDB);
    } catch (error) {
      console.error('[StoriesService] getUserStories error:', error);
      return [];
    }
  },

  /** Mark story as viewed */
  async viewStory(storyId: string, userId: string): Promise<void> {
    try {
      const client = getClient();
      const { data: story } = await client.from('stories').select('viewers').eq('id', storyId).single();
      if (!story) return;
      const viewers = (story as { viewers: string[] }).viewers || [];
      if (!viewers.includes(userId)) {
        viewers.push(userId);
        await client.from('stories').update({ viewers, views_count: viewers.length }).eq('id', storyId);
      }
    } catch (error) {
      console.error('[StoriesService] viewStory error:', error);
    }
  },

  /** Delete story */
  async deleteStory(storyId: string, userId: string): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('publisher_uid', userId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[StoriesService] deleteStory error:', error);
      return false;
    }
  },
};

// ============ CHAT SERVICE ============

export const chatService = {
  /** Get user's chat rooms with other user info */
  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('chat_rooms')
        .select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_time', { ascending: false });
      if (error) throw error;

      const rooms: ChatRoom[] = [];
      for (const room of data as ChatRoomRow[]) {
        const otherUID = room.participant_1 === userId ? room.participant_2 : room.participant_1;
        const otherUser = await userService.getUserProfile(otherUID);
        if (!otherUser) continue;

        // Count unread
        const { count } = await client
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)
          .eq('is_read', false)
          .neq('sender_uid', userId);

        rooms.push(mapChatRoomFromDB(room, userId, otherUser, count || 0));
      }
      return rooms;
    } catch (error) {
      console.error('[ChatService] getChatRooms error:', error);
      return [];
    }
  },

  /** Create or get existing chat room */
  async createOrGetChatRoom(userId1: string, userId2: string): Promise<string | null> {
    try {
      const client = getClient();
      // Check if room exists
      const { data: existing } = await client
        .from('chat_rooms')
        .select('id')
        .or(`and(participant_1.eq.${userId1},participant_2.eq.${userId2}),and(participant_1.eq.${userId2},participant_2.eq.${userId1})`)
        .single();

      if (existing) return (existing as { id: string }).id;

      // Create new room
      const { data, error } = await client
        .from('chat_rooms')
        .insert({ participant_1: userId1, participant_2: userId2 })
        .select('id')
        .single();
      if (error) throw error;
      return (data as { id: string }).id;
    } catch (error) {
      console.error('[ChatService] createOrGetChatRoom error:', error);
      return null;
    }
  },

  /** Send message with optional Base64 media */
  async sendMessage(params: {
    roomId: string;
    senderUID: string;
    content: string;
    mediaBase64?: string;
    mediaMimeType?: string;
    messageType?: MessageType;
  }): Promise<ChatMessage | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('chat_messages')
        .insert({
          room_id: params.roomId,
          sender_uid: params.senderUID,
          content: params.content,
          media_base64: params.mediaBase64 || '',
          media_mime_type: params.mediaMimeType || '',
          message_type: params.messageType || 'text',
        })
        .select()
        .single();
      if (error) throw error;

      // Update room's last message
      await client
        .from('chat_rooms')
        .update({
          last_message: params.content.substring(0, 100),
          last_message_time: Date.now(),
        })
        .eq('id', params.roomId);

      // Get room info to determine receiver
      const { data: room } = await client
        .from('chat_rooms')
        .select('participant_1, participant_2')
        .eq('id', params.roomId)
        .single();

      const receiverUID = room
        ? (room as { participant_1: string; participant_2: string }).participant_1 === params.senderUID
          ? (room as { participant_1: string; participant_2: string }).participant_2
          : (room as { participant_1: string; participant_2: string }).participant_1
        : '';

      return mapChatMessageFromDB(data as ChatMessageRow, receiverUID);
    } catch (error) {
      console.error('[ChatService] sendMessage error:', error);
      return null;
    }
  },

  /** Get messages in room */
  async getMessages(roomId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    try {
      const client = getClient();
      const { data: room } = await client
        .from('chat_rooms')
        .select('participant_1, participant_2')
        .eq('id', roomId)
        .single();
      if (!room) return [];

      const { data, error } = await client
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);
      if (error) throw error;

      const roomData = room as { participant_1: string; participant_2: string };
      return (data as ChatMessageRow[]).map(row =>
        mapChatMessageFromDB(row, row.sender_uid === roomData.participant_1 ? roomData.participant_2 : roomData.participant_1)
      );
    } catch (error) {
      console.error('[ChatService] getMessages error:', error);
      return [];
    }
  },

  /** Mark all messages as read */
  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    try {
      const client = getClient();
      await client
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .neq('sender_uid', userId)
        .eq('is_read', false);
    } catch (error) {
      console.error('[ChatService] markMessagesAsRead error:', error);
    }
  },

  /** Realtime subscription to messages in a room */
  subscribeToMessages(roomId: string, callback: (message: ChatMessage) => void): RealtimeChannel | null {
    try {
      const client = getClient();
      return client
        .channel(`chat_room:${roomId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        }, (payload) => {
          const row = payload.new as ChatMessageRow;
          callback(mapChatMessageFromDB(row, ''));
        })
        .subscribe();
    } catch (error) {
      console.error('[ChatService] subscribeToMessages error:', error);
      return null;
    }
  },

  /** Unsubscribe from a channel */
  unsubscribeFromRoom(channel: RealtimeChannel): void {
    try {
      const client = getClient();
      client.removeChannel(channel);
    } catch (error) {
      console.error('[ChatService] unsubscribeFromRoom error:', error);
    }
  },
};

// ============ FOLLOW SERVICE ============

export const followService = {
  /** Follow user */
  async followUser(followerUID: string, followedUID: string): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client
        .from('followers')
        .insert({ follower_uid: followerUID, followed_uid: followedUID });
      if (error) throw error;

      // Update follower counts
      try {
        const followerData = (await client.from('users').select('following_count').eq('uid', followerUID).single()).data;
        if (followerData) {
          await client.from('users').update({ following_count: (followerData.following_count || 0) + 1 }).eq('uid', followerUID);
        }
      } catch { /* ignore count update errors */ }

      try {
        const followedData = (await client.from('users').select('followers_count').eq('uid', followedUID).single()).data;
        if (followedData) {
          await client.from('users').update({ followers_count: (followedData.followers_count || 0) + 1 }).eq('uid', followedUID);
        }
      } catch { /* ignore count update errors */ }

      return true;
    } catch (error) {
      console.error('[FollowService] followUser error:', error);
      return false;
    }
  },

  /** Unfollow user */
  async unfollowUser(followerUID: string, followedUID: string): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client
        .from('followers')
        .delete()
        .eq('follower_uid', followerUID)
        .eq('followed_uid', followedUID);
      if (error) throw error;

      // Update follower counts
      const { data: followerData } = await client.from('users').select('following_count').eq('uid', followerUID).single();
      if (followerData) {
        await client.from('users').update({
          following_count: Math.max(0, (followerData as UserRow).following_count - 1),
        }).eq('uid', followerUID);
      }

      const { data: followedData } = await client.from('users').select('followers_count').eq('uid', followedUID).single();
      if (followedData) {
        await client.from('users').update({
          followers_count: Math.max(0, (followedData as UserRow).followers_count - 1),
        }).eq('uid', followedUID);
      }

      return true;
    } catch (error) {
      console.error('[FollowService] unfollowUser error:', error);
      return false;
    }
  },

  /** Check follow status */
  async isFollowing(followerUID: string, followedUID: string): Promise<boolean> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('followers')
        .select('follower_uid')
        .eq('follower_uid', followerUID)
        .eq('followed_uid', followedUID)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('[FollowService] isFollowing error:', error);
      return false;
    }
  },

  /** Get followers list */
  async getFollowers(uid: string, limit = 50): Promise<User[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('followers')
        .select('follower:users!followers_follower_uid_fkey(*)')
        .eq('followed_uid', uid)
        .limit(limit);
      if (error) throw error;
      return (data as unknown as { follower: UserRow }[]).map(d => mapUserFromDB(d.follower));
    } catch (error) {
      console.error('[FollowService] getFollowers error:', error);
      return [];
    }
  },

  /** Get following list */
  async getFollowing(uid: string, limit = 50): Promise<User[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('followers')
        .select('followed:users!followers_followed_uid_fkey(*)')
        .eq('follower_uid', uid)
        .limit(limit);
      if (error) throw error;
      return (data as unknown as { followed: UserRow }[]).map(d => mapUserFromDB(d.followed));
    } catch (error) {
      console.error('[FollowService] getFollowing error:', error);
      return [];
    }
  },
};

// ============ NOTIFICATION SERVICE ============

export const notificationService = {
  /** Get user notifications */
  async getNotifications(userId: string, limit = 30): Promise<Notification[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('notifications')
        .select('*, from_user:users!notifications_from_uid_fkey(uid, username, nickname, profile_image)')
        .eq('user_uid', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;

      return (data as (NotificationRow & { from_user: { uid: string; username: string; nickname: string; profile_image: string } })[]).map(row =>
        mapNotificationFromDB(row)
      );
    } catch (error) {
      console.error('[NotificationService] getNotifications error:', error);
      return [];
    }
  },

  /** Mark as read */
  async markNotificationRead(id: string): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[NotificationService] markNotificationRead error:', error);
      return false;
    }
  },

  /** Mark all as read */
  async markAllNotificationsRead(userId: string): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client
        .from('notifications')
        .update({ is_read: true })
        .eq('user_uid', userId)
        .eq('is_read', false);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[NotificationService] markAllNotificationsRead error:', error);
      return false;
    }
  },

  /** Create notification */
  async createNotification(notification: {
    userUID: string;
    type: NotificationType;
    fromUID: string;
    postID?: string;
    content?: string;
  }): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client
        .from('notifications')
        .insert({
          user_uid: notification.userUID,
          type: notification.type,
          from_uid: notification.fromUID,
          post_id: notification.postID || null,
          content: notification.content || '',
        });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[NotificationService] createNotification error:', error);
      return false;
    }
  },

  /** Realtime subscription to notifications */
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): RealtimeChannel | null {
    try {
      const client = getClient();
      return client
        .channel(`notifications:${userId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_uid=eq.${userId}`,
        }, (payload) => {
          const row = payload.new as NotificationRow;
          callback(mapNotificationFromDB(row));
        })
        .subscribe();
    } catch (error) {
      console.error('[NotificationService] subscribeToNotifications error:', error);
      return null;
    }
  },
};

// ============ GIFTS SERVICE ============

export const giftsService = {
  /** Get all gift types from shop */
  async getGiftTypes(): Promise<GiftType[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('gift_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as GiftTypeRow[]).map(mapGiftTypeFromDB);
    } catch (error) {
      console.error('[GiftsService] getGiftTypes error:', error);
      return [];
    }
  },

  /** Send gift */
  async sendGift(params: {
    senderUID: string;
    receiverUID: string;
    giftTypeId: string;
    message?: string;
    postID?: string;
    liveStreamID?: string;
  }): Promise<Gift | null> {
    try {
      const client = getClient();

      // Check sender's balance
      const { data: wallet } = await client
        .from('wallets')
        .select('coins_balance, total_coins_spent')
        .eq('uid', params.senderUID)
        .single();

      const { data: giftType } = await client
        .from('gift_types')
        .select('coin_cost, diamond_value')
        .eq('id', params.giftTypeId)
        .single();

      if (!wallet || !giftType) throw new Error('Wallet or gift type not found');

      const cost = (giftType as { coin_cost: number }).coin_cost;
      const diamondValue = (giftType as { diamond_value: number }).diamond_value;
      const walletData = wallet as { coins_balance: number; total_coins_spent: number };

      if (walletData.coins_balance < cost) throw new Error('Insufficient coins');

      // Deduct from sender
      await client
        .from('wallets')
        .update({
          coins_balance: walletData.coins_balance - cost,
          total_coins_spent: walletData.total_coins_spent + cost,
        })
        .eq('uid', params.senderUID);

      // Add diamonds to receiver
      const { data: receiverWallet } = await client
        .from('wallets')
        .select('diamonds_balance, total_diamonds_earned')
        .eq('uid', params.receiverUID)
        .single();

      if (receiverWallet) {
        const rw = receiverWallet as { diamonds_balance: number; total_diamonds_earned: number };
        await client
          .from('wallets')
          .update({
            diamonds_balance: rw.diamonds_balance + diamondValue,
            total_diamonds_earned: rw.total_diamonds_earned + diamondValue,
          })
          .eq('uid', params.receiverUID);
      }

      // Create gift record
      const { data, error } = await client
        .from('gifts')
        .insert({
          gift_type_id: params.giftTypeId,
          sender_uid: params.senderUID,
          receiver_uid: params.receiverUID,
          post_id: params.postID || null,
          live_stream_id: params.liveStreamID || null,
          quantity: 1,
          message: params.message || '',
        })
        .select('*, gift_type:gift_types(*), sender:users!gifts_sender_uid_fkey(*), receiver:users!gifts_receiver_uid_fkey(*)')
        .single();
      if (error) throw error;

      // Create transaction records
      const giftId = (data as GiftRow).id;
      await client.from('transactions').insert([
        {
          user_uid: params.senderUID,
          type: 'gift_send',
          currency: 'coins',
          amount: cost,
          description: `Gift sent: ${cost} coins`,
          reference_id: giftId,
        },
        {
          user_uid: params.receiverUID,
          type: 'gift_receive',
          currency: 'diamonds',
          amount: diamondValue,
          description: `Gift received: ${diamondValue} diamonds`,
          reference_id: giftId,
        },
      ]);

      // Create notification
      await notificationService.createNotification({
        userUID: params.receiverUID,
        type: 'gift',
        fromUID: params.senderUID,
        content: 'Sent you a gift!',
      });

      // Update live stream gifts total if applicable
      if (params.liveStreamID) {
        try {
          const streamData = (await client.from('live_streams').select('gifts_coins_total').eq('id', params.liveStreamID).single()).data;
          if (streamData) {
            await client.from('live_streams').update({
              gifts_coins_total: (streamData as LiveStreamRow).gifts_coins_total + cost,
            }).eq('id', params.liveStreamID!);
          }
        } catch { /* ignore */ }
      }

      return mapGiftFromDB(data as GiftRow & { gift_type: GiftTypeRow; sender: UserRow; receiver: UserRow });
    } catch (error) {
      console.error('[GiftsService] sendGift error:', error);
      return null;
    }
  },

  /** Get gifts received by user */
  async getUserGifts(uid: string, limit = 20): Promise<Gift[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('gifts')
        .select('*, gift_type:gift_types(*), sender:users!gifts_sender_uid_fkey(*), receiver:users!gifts_receiver_uid_fkey(*)')
        .eq('receiver_uid', uid)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as (GiftRow & { gift_type: GiftTypeRow; sender: UserRow; receiver: UserRow })[]).map(mapGiftFromDB);
    } catch (error) {
      console.error('[GiftsService] getUserGifts error:', error);
      return [];
    }
  },

  /** Get gifts sent by user */
  async getSentGifts(uid: string, limit = 20): Promise<Gift[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('gifts')
        .select('*, gift_type:gift_types(*), sender:users!gifts_sender_uid_fkey(*), receiver:users!gifts_receiver_uid_fkey(*)')
        .eq('sender_uid', uid)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as (GiftRow & { gift_type: GiftTypeRow; sender: UserRow; receiver: UserRow })[]).map(mapGiftFromDB);
    } catch (error) {
      console.error('[GiftsService] getSentGifts error:', error);
      return [];
    }
  },
};

// ============ LIVE STREAM SERVICE ============

export const liveStreamService = {
  /** Start live stream */
  async createStream(params: {
    hostUID: string;
    title: string;
    description?: string;
    category?: string;
    thumbnailBase64?: string;
  }): Promise<LiveStream | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('live_streams')
        .insert({
          host_uid: params.hostUID,
          title: params.title,
          description: params.description || '',
          thumbnail_base64: params.thumbnailBase64 || '',
          category: params.category || 'general',
          status: 'live',
        })
        .select('*, host:users!live_streams_host_uid_fkey(*)')
        .single();
      if (error) throw error;
      return mapLiveStreamFromDB(data as LiveStreamRow & { host: UserRow });
    } catch (error) {
      console.error('[LiveStreamService] createStream error:', error);
      return null;
    }
  },

  /** Get currently live streams */
  async getLiveStreams(status: LiveStreamStatus = 'live', limit = 20): Promise<LiveStream[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('live_streams')
        .select('*, host:users!live_streams_host_uid_fkey(*)')
        .eq('status', status)
        .order('viewer_count', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as (LiveStreamRow & { host: UserRow })[]).map(mapLiveStreamFromDB);
    } catch (error) {
      console.error('[LiveStreamService] getLiveStreams error:', error);
      return [];
    }
  },

  /** Get stream details */
  async getStreamById(id: string): Promise<LiveStream | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('live_streams')
        .select('*, host:users!live_streams_host_uid_fkey(*), co_host:users!live_streams_co_host_uid_fkey(*)')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapLiveStreamFromDB(data as LiveStreamRow & { host: UserRow; co_host?: UserRow });
    } catch (error) {
      console.error('[LiveStreamService] getStreamById error:', error);
      return null;
    }
  },

  /** End stream */
  async endStream(id: string): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client
        .from('live_streams')
        .update({
          status: 'ended',
          ended_at: Date.now(),
        })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[LiveStreamService] endStream error:', error);
      return false;
    }
  },

  /** Join as viewer */
  async joinStream(streamId: string, userId: string): Promise<boolean> {
    try {
      const client = getClient();
      // Add viewer
      const { error: insertError } = await client
        .from('live_stream_viewers')
        .insert({ stream_id: streamId, user_uid: userId })
        .select()
        .single();
      if (insertError && insertError.code !== '23505') throw insertError; // ignore duplicate

      // Increment viewer count
      try {
        const streamData = (await client.from('live_streams').select('viewer_count').eq('id', streamId).single()).data;
        if (streamData) {
          await client.from('live_streams').update({ viewer_count: (streamData as LiveStreamRow).viewer_count + 1 }).eq('id', streamId);
        }
      } catch { /* ignore */ }

      return true;
    } catch (error) {
      console.error('[LiveStreamService] joinStream error:', error);
      return false;
    }
  },

  /** Leave stream */
  async leaveStream(streamId: string, userId: string): Promise<void> {
    try {
      const client = getClient();
      await client
        .from('live_stream_viewers')
        .update({ left_at: Date.now() })
        .eq('stream_id', streamId)
        .eq('user_uid', userId)
        .is('left_at', null);

      // Decrement viewer count
      const { data: streamData } = await client.from('live_streams').select('viewer_count').eq('id', streamId).single();
      if (streamData) {
        await client.from('live_streams').update({
          viewer_count: Math.max(0, (streamData as LiveStreamRow).viewer_count - 1),
        }).eq('id', streamId);
      }
    } catch (error) {
      console.error('[LiveStreamService] leaveStream error:', error);
    }
  },

  /** Comment in stream */
  async addStreamComment(streamId: string, userId: string, content: string): Promise<LiveStreamComment | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('live_stream_comments')
        .insert({ stream_id: streamId, user_uid: userId, content })
        .select()
        .single();
      if (error) throw error;

      const row = data as LiveStreamCommentRow;
      return {
        id: row.id,
        streamID: row.stream_id,
        userUID: row.user_uid,
        content: row.content,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error('[LiveStreamService] addStreamComment error:', error);
      return null;
    }
  },

  /** Get stream comments */
  async getStreamComments(streamId: string, limit = 100): Promise<LiveStreamComment[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('live_stream_comments')
        .select('*, user:users!live_stream_comments_user_uid_fkey(uid, username, nickname, profile_image)')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true })
        .limit(limit);
      if (error) throw error;

      return (data as (LiveStreamCommentRow & { user: { uid: string; username: string; nickname: string; profile_image: string } })[]).map(row => ({
        id: row.id,
        streamID: row.stream_id,
        userUID: row.user_uid,
        user: row.user ? {
          uid: row.user.uid,
          email: '',
          username: row.user.username,
          nickname: row.user.nickname,
          profileImage: row.user.profile_image,
        } as User : undefined,
        content: row.content,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('[LiveStreamService] getStreamComments error:', error);
      return [];
    }
  },

  /** Like stream */
  async likeStream(streamId: string): Promise<boolean> {
    try {
      const client = getClient();
      try {
        const streamData = (await client.from('live_streams').select('like_count').eq('id', streamId).single()).data;
        if (streamData) {
          await client.from('live_streams').update({ like_count: (streamData as LiveStreamRow).like_count + 1 }).eq('id', streamId);
        }
      } catch { /* ignore */ }
      return true;
    } catch (error) {
      console.error('[LiveStreamService] likeStream error:', error);
      return false;
    }
  },

  /** Subscribe to stream realtime events */
  subscribeToStream(streamId: string, callbacks: {
    onComment?: (comment: LiveStreamComment) => void;
    onViewerUpdate?: (count: number) => void;
    onGift?: (gift: Gift) => void;
    onEnd?: () => void;
  }): RealtimeChannel | null {
    try {
      const client = getClient();
      const channel = client.channel(`live_stream:${streamId}`);

      if (callbacks.onComment) {
        channel.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_comments',
          filter: `stream_id=eq.${streamId}`,
        }, (payload) => {
          const row = payload.new as LiveStreamCommentRow;
          callbacks.onComment!({
            id: row.id,
            streamID: row.stream_id,
            userUID: row.user_uid,
            content: row.content,
            createdAt: row.created_at,
          });
        });
      }

      if (callbacks.onViewerUpdate || callbacks.onEnd) {
        channel.on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_streams',
          filter: `id=eq.${streamId}`,
        }, (payload) => {
          const row = payload.new as LiveStreamRow;
          if (callbacks.onViewerUpdate) callbacks.onViewerUpdate(row.viewer_count);
          if (callbacks.onEnd && row.status === 'ended') callbacks.onEnd();
        });
      }

      if (callbacks.onGift) {
        channel.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'gifts',
          filter: `live_stream_id=eq.${streamId}`,
        }, (payload) => {
          const row = payload.new as GiftRow;
          callbacks.onGift!({
            id: row.id,
            giftTypeId: row.gift_type_id,
            senderUID: row.sender_uid,
            receiverUID: row.receiver_uid,
            liveStreamID: row.live_stream_id || undefined,
            quantity: row.quantity,
            message: row.message,
            createdAt: row.created_at,
          });
        });
      }

      channel.subscribe();
      return channel;
    } catch (error) {
      console.error('[LiveStreamService] subscribeToStream error:', error);
      return null;
    }
  },

  /** Unsubscribe from stream */
  unsubscribeFromStream(channel: RealtimeChannel): void {
    try {
      const client = getClient();
      client.removeChannel(channel);
    } catch (error) {
      console.error('[LiveStreamService] unsubscribeFromStream error:', error);
    }
  },
};

// ============ WALLET SERVICE ============

export const walletService = {
  /** Get user wallet */
  async getWallet(uid: string): Promise<Wallet | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('wallets')
        .select('*')
        .eq('uid', uid)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapWalletFromDB(data as WalletRow);
    } catch (error) {
      console.error('[WalletService] getWallet error:', error);
      return null;
    }
  },

  /** Update wallet balance */
  async updateWallet(uid: string, updates: Partial<Wallet>): Promise<Wallet | null> {
    try {
      const client = getClient();
      const rowUpdates = mapWalletToDB(updates);
      const { data, error } = await client
        .from('wallets')
        .update(rowUpdates)
        .eq('uid', uid)
        .select()
        .single();
      if (error) throw error;
      return mapWalletFromDB(data as WalletRow);
    } catch (error) {
      console.error('[WalletService] updateWallet error:', error);
      return null;
    }
  },

  /** Record transaction */
  async createTransaction(transaction: {
    userUID: string;
    type: TransactionType;
    currency: CurrencyType;
    amount: number;
    description?: string;
    referenceID?: string;
  }): Promise<Transaction | null> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('transactions')
        .insert({
          user_uid: transaction.userUID,
          type: transaction.type,
          currency: transaction.currency,
          amount: transaction.amount,
          description: transaction.description || '',
          reference_id: transaction.referenceID || null,
        })
        .select()
        .single();
      if (error) throw error;
      return mapTransactionFromDB(data as TransactionRow);
    } catch (error) {
      console.error('[WalletService] createTransaction error:', error);
      return null;
    }
  },

  /** Get transaction history */
  async getTransactions(uid: string, page = 0, limit = 30): Promise<Transaction[]> {
    try {
      const client = getClient();
      const offset = page * limit;
      const { data, error } = await client
        .from('transactions')
        .select('*')
        .eq('user_uid', uid)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return (data as TransactionRow[]).map(mapTransactionFromDB);
    } catch (error) {
      console.error('[WalletService] getTransactions error:', error);
      return [];
    }
  },

  /** Purchase coins */
  async purchaseCoins(uid: string, amount: number, paymentReference: string): Promise<boolean> {
    try {
      const client = getClient();
      const { data: wallet } = await client.from('wallets').select('coins_balance, total_coins_earned').eq('uid', uid).single();
      if (!wallet) throw new Error('Wallet not found');

      const w = wallet as { coins_balance: number; total_coins_earned: number };
      await client.from('wallets').update({
        coins_balance: w.coins_balance + amount,
        total_coins_earned: w.total_coins_earned + amount,
      }).eq('uid', uid);

      await client.from('transactions').insert({
        user_uid: uid,
        type: 'purchase',
        currency: 'coins',
        amount,
        description: `Purchased ${amount} coins`,
        reference_id: paymentReference,
      });

      return true;
    } catch (error) {
      console.error('[WalletService] purchaseCoins error:', error);
      return false;
    }
  },
};

// ============ ACHIEVEMENT SERVICE ============

export const achievementService = {
  /** Get all achievements */
  async getAchievements(): Promise<Achievement[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      if (error) throw error;
      return (data as AchievementRow[]).map(mapAchievementFromDB);
    } catch (error) {
      console.error('[AchievementService] getAchievements error:', error);
      return [];
    }
  },

  /** Get user's achievements */
  async getUserAchievements(uid: string): Promise<UserAchievement[]> {
    try {
      const client = getClient();
      const { data, error } = await client
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_uid', uid);
      if (error) throw error;

      return (data as (UserAchievementRow & { achievement: AchievementRow })[]).map(mapUserAchievementFromDB);
    } catch (error) {
      console.error('[AchievementService] getUserAchievements error:', error);
      return [];
    }
  },

  /** Claim daily reward */
  async claimDailyReward(uid: string): Promise<DailyReward | null> {
    try {
      const client = getClient();

      // Get last claimed day
      const { data: lastReward } = await client
        .from('daily_rewards')
        .select('day_number, created_at')
        .eq('user_uid', uid)
        .order('day_number', { ascending: false })
        .limit(1);

      const lastDay = lastReward && lastReward.length > 0
        ? (lastReward[0] as { day_number: number }).day_number
        : 0;
      const nextDay = lastDay + 1;
      const reward = nextDay <= 7 ? nextDay * 10 : 70;
      const diamonds = nextDay % 7 === 0 ? 5 : 0;

      const { data, error } = await client
        .from('daily_rewards')
        .insert({
          user_uid: uid,
          day_number: nextDay,
          coins_reward: reward,
          diamonds_reward: diamonds,
          is_claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      // Add coins to wallet
      const { data: wallet } = await client.from('wallets').select('coins_balance, diamonds_balance').eq('uid', uid).single();
      if (wallet) {
        const w = wallet as { coins_balance: number; diamonds_balance: number };
        await client.from('wallets').update({
          coins_balance: w.coins_balance + reward,
          diamonds_balance: w.diamonds_balance + diamonds,
        }).eq('uid', uid);
      }

      return mapDailyRewardFromDB(data as DailyRewardRow);
    } catch (error) {
      console.error('[AchievementService] claimDailyReward error:', error);
      return null;
    }
  },
};

// ============ STORAGE SERVICE ============

export const storageService = {
  /** Upload media to Supabase Storage */
  async uploadMedia(bucket: string, path: string, base64Data: string): Promise<string> {
    try {
      const client = getClient();
      const response = await fetch(base64Data);
      const blob = await response.blob();

      const { error } = await client.storage
        .from(bucket)
        .upload(path, blob, { upsert: true });
      if (error) throw error;

      const { data: urlData } = client.storage
        .from(bucket)
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('[StorageService] uploadMedia error:', error);
      return '';
    }
  },

  /** Delete media from Supabase Storage */
  async deleteMedia(bucket: string, path: string): Promise<boolean> {
    try {
      const client = getClient();
      const { error } = await client.storage
        .from(bucket)
        .remove([path]);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[StorageService] deleteMedia error:', error);
      return false;
    }
  },

  /** Get public URL for a file */
  getPublicUrl(bucket: string, path: string): string {
    try {
      const client = getClient();
      const { data } = client.storage
        .from(bucket)
        .getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return '';
    }
  },
};
