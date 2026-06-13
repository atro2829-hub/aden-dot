/**
 * Skyline Supabase Mapper
 * Converts between database snake_case rows and TypeScript camelCase types
 */

import type {
  User, Post, Comment, Story, ChatMessage, ChatRoom, Notification,
  GiftType, Gift, LiveStream, Wallet, Transaction,
  Achievement, UserAchievement, DailyReward,
  Gender, UserStatus, UserRole, PostType, MessageType, NotificationType,
  TransactionType, CurrencyType, GiftCategory, GiftAnimation, LiveStreamStatus,
  AchievementCategory,
} from '@/types/skyline';

// ============ DB Row Types (snake_case from Supabase) ============

export interface UserRow {
  uid: string;
  email: string;
  username: string | null;
  nickname: string;
  bio: string;
  gender: string;
  profile_image: string;
  cover_image: string;
  status: string;
  role: string;
  is_verified: boolean;
  is_premium: boolean;
  region: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  level: number;
  xp: number;
  popularity: number;
  gifts_count: number;
  subscribers: number;
  coins_balance: number;
  diamonds_balance: number;
  is_profile_complete: boolean;
  is_email_verified: boolean;
  join_date: string;
  last_seen: number;
  created_at?: string;
  updated_at?: string;
}

export interface PostRow {
  id: string;
  publisher_uid: string;
  type: string;
  content: string;
  media_base64: string;
  media_mime_type: string;
  description: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  shares_count: number;
  is_private: boolean;
  is_pinned: boolean;
  comments_disabled: boolean;
  favorites_disabled: boolean;
  region: string;
  created_at: number;
  updated_at?: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  publisher_uid: string;
  content: string;
  likes_count: number;
  is_liked_by_publisher: boolean;
  parent_comment_id: string | null;
  replies_count: number;
  created_at: number;
}

export interface StoryRow {
  id: string;
  publisher_uid: string;
  media_base64: string;
  media_mime_type: string;
  views_count: number;
  viewers: string[];
  created_at: number;
}

export interface ChatRoomRow {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string;
  last_message_time: number;
  created_at?: string;
}

export interface ChatMessageRow {
  id: string;
  room_id: string;
  sender_uid: string;
  content: string;
  media_base64: string;
  media_mime_type: string;
  message_type: string;
  is_read: boolean;
  created_at: number;
}

export interface NotificationRow {
  id: string;
  user_uid: string;
  type: string;
  from_uid: string | null;
  post_id: string | null;
  content: string;
  is_read: boolean;
  created_at: number;
}

export interface GiftTypeRow {
  id: string;
  name: string;
  name_ar: string;
  emoji: string;
  image_url: string;
  coin_cost: number;
  diamond_value: number;
  category: string;
  animation_type: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface GiftRow {
  id: string;
  gift_type_id: string;
  sender_uid: string;
  receiver_uid: string;
  post_id: string | null;
  live_stream_id: string | null;
  quantity: number;
  message: string;
  created_at: number;
}

export interface LiveStreamRow {
  id: string;
  host_uid: string;
  title: string;
  description: string;
  thumbnail_base64: string;
  category: string;
  viewer_count: number;
  peak_viewer_count: number;
  like_count: number;
  gifts_coins_total: number;
  status: string;
  co_host_uid: string | null;
  is_recording: boolean;
  recording_url: string;
  scheduled_at: string | null;
  started_at: number;
  ended_at: number | null;
  created_at?: string;
}

export interface LiveStreamCommentRow {
  id: string;
  stream_id: string;
  user_uid: string;
  content: string;
  created_at: number;
}

export interface WalletRow {
  uid: string;
  coins_balance: number;
  diamonds_balance: number;
  total_coins_earned: number;
  total_diamonds_earned: number;
  total_coins_spent: number;
  updated_at?: string;
}

export interface TransactionRow {
  id: string;
  user_uid: string;
  type: string;
  currency: string;
  amount: number;
  description: string;
  reference_id: string | null;
  created_at: number;
}

export interface AchievementRow {
  id: string;
  code: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  icon_emoji: string;
  category: string;
  requirement_value: number;
  reward_coins: number;
  reward_diamonds: number;
  is_active: boolean;
  created_at?: string;
}

export interface UserAchievementRow {
  user_uid: string;
  achievement_id: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface DailyRewardRow {
  id: string;
  user_uid: string;
  day_number: number;
  coins_reward: number;
  diamonds_reward: number;
  is_claimed: boolean;
  claimed_at: string | null;
}

export interface FollowerRow {
  follower_uid: string;
  followed_uid: string;
  created_at: string;
}

export interface PostLikeRow {
  post_id: string;
  user_uid: string;
}

export interface PostFavoriteRow {
  post_id: string;
  user_uid: string;
}

export interface CommentLikeRow {
  comment_id: string;
  user_uid: string;
}

// ============ DB Row → TypeScript Type Mappers ============

export function mapUserFromDB(row: UserRow): User {
  return {
    uid: row.uid,
    email: row.email,
    username: row.username || '',
    nickname: row.nickname || '',
    bio: row.bio || '',
    gender: (row.gender || 'unspecified') as Gender,
    profileImage: row.profile_image || '',
    coverImage: row.cover_image || '',
    status: (row.status || 'offline') as UserStatus,
    role: (row.role || 'user') as UserRole,
    isVerified: row.is_verified || false,
    isPremium: row.is_premium || false,
    region: row.region || '',
    followersCount: row.followers_count || 0,
    followingCount: row.following_count || 0,
    postsCount: row.posts_count || 0,
    level: row.level || 1,
    xp: row.xp || 0,
    popularity: row.popularity || 0,
    giftsCount: row.gifts_count || 0,
    subscribers: row.subscribers || 0,
    coinsBalance: row.coins_balance || 0,
    diamondsBalance: row.diamonds_balance || 0,
    isProfileComplete: row.is_profile_complete || false,
    isEmailVerified: row.is_email_verified || false,
    joinDate: row.join_date || '',
    lastSeen: row.last_seen || 0,
  };
}

export function mapPostFromDB(row: PostRow & { publisher?: UserRow }): Post {
  const publisher = row.publisher ? mapUserFromDB(row.publisher) : null;
  return {
    id: row.id,
    publisherUID: row.publisher_uid,
    publisherUsername: publisher?.username || '',
    publisherNickname: publisher?.nickname || '',
    publisherProfileImage: publisher?.profileImage || '',
    publisherVerified: publisher?.isVerified || false,
    type: row.type as PostType,
    content: row.content || '',
    mediaBase64: row.media_base64 || undefined,
    mediaMimeType: row.media_mime_type || undefined,
    description: row.description || '',
    likesCount: row.likes_count || 0,
    commentsCount: row.comments_count || 0,
    viewsCount: row.views_count || 0,
    sharesCount: row.shares_count || 0,
    isLiked: false, // Populated separately
    isFavorite: false, // Populated separately
    isPrivate: row.is_private || false,
    isPinned: row.is_pinned || false,
    commentsDisabled: row.comments_disabled || false,
    favoritesDisabled: row.favorites_disabled || false,
    createdAt: row.created_at || 0,
    region: row.region || '',
  };
}

export function mapCommentFromDB(row: CommentRow & { publisher?: UserRow }): Comment {
  const publisher = row.publisher ? mapUserFromDB(row.publisher) : null;
  return {
    id: row.id,
    postID: row.post_id,
    publisherUID: row.publisher_uid,
    publisherUsername: publisher?.username || '',
    publisherNickname: publisher?.nickname || '',
    publisherProfileImage: publisher?.profileImage || '',
    content: row.content,
    likesCount: row.likes_count || 0,
    isLiked: false, // Populated separately
    isLikedByPublisher: row.is_liked_by_publisher || false,
    parentCommentID: row.parent_comment_id,
    repliesCount: row.replies_count || 0,
    createdAt: row.created_at || 0,
  };
}

export function mapStoryFromDB(row: StoryRow & { publisher?: UserRow }): Story {
  const publisher = row.publisher ? mapUserFromDB(row.publisher) : null;
  return {
    id: row.id,
    publisherUID: row.publisher_uid,
    publisherUsername: publisher?.username || '',
    publisherNickname: publisher?.nickname || '',
    publisherProfileImage: publisher?.profileImage || '',
    mediaBase64: row.media_base64 || '',
    mediaMimeType: row.media_mime_type || '',
    viewsCount: row.views_count || 0,
    viewers: row.viewers || [],
    createdAt: row.created_at || 0,
  };
}

export function mapChatMessageFromDB(row: ChatMessageRow, receiverUID: string): ChatMessage {
  return {
    id: row.id,
    senderUID: row.sender_uid,
    receiverUID,
    content: row.content || '',
    mediaBase64: row.media_base64 || undefined,
    mediaMimeType: row.media_mime_type || undefined,
    messageType: row.message_type as MessageType,
    isRead: row.is_read || false,
    createdAt: row.created_at || 0,
  };
}

export function mapChatRoomFromDB(row: ChatRoomRow, currentUserUID: string, otherUser: User, unreadCount: number): ChatRoom {
  return {
    id: row.id,
    participants: [row.participant_1, row.participant_2],
    lastMessage: row.last_message || '',
    lastMessageTime: row.last_message_time || 0,
    unreadCount,
    otherUser,
  };
}

export function mapNotificationFromDB(row: NotificationRow & { from_user?: { uid: string; username: string; nickname: string; profile_image: string } }): Notification {
  return {
    id: row.id,
    type: row.type as NotificationType,
    fromUID: row.from_uid || '',
    fromUsername: row.from_user?.username || '',
    fromProfileImage: row.from_user?.profile_image || '',
    postID: row.post_id || undefined,
    content: row.content || undefined,
    isRead: row.is_read || false,
    createdAt: row.created_at || 0,
  };
}

export function mapGiftTypeFromDB(row: GiftTypeRow): GiftType {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar || '',
    emoji: row.emoji || '',
    imageUrl: row.image_url || '',
    coinCost: row.coin_cost,
    diamondValue: row.diamond_value || 0,
    category: row.category as GiftCategory,
    animationType: row.animation_type as GiftAnimation,
    isActive: row.is_active,
    sortOrder: row.sort_order || 0,
  };
}

export function mapGiftFromDB(row: GiftRow & { gift_type?: GiftTypeRow; sender?: UserRow; receiver?: UserRow }): Gift {
  return {
    id: row.id,
    giftTypeId: row.gift_type_id,
    giftType: row.gift_type ? mapGiftTypeFromDB(row.gift_type) : undefined,
    senderUID: row.sender_uid,
    senderUser: row.sender ? mapUserFromDB(row.sender) : undefined,
    receiverUID: row.receiver_uid,
    receiverUser: row.receiver ? mapUserFromDB(row.receiver) : undefined,
    postID: row.post_id || undefined,
    liveStreamID: row.live_stream_id || undefined,
    quantity: row.quantity || 1,
    message: row.message || '',
    createdAt: row.created_at || 0,
  };
}

export function mapLiveStreamFromDB(row: LiveStreamRow & { host?: UserRow; co_host?: UserRow }): LiveStream {
  return {
    id: row.id,
    hostUID: row.host_uid,
    hostUser: row.host ? mapUserFromDB(row.host) : undefined,
    title: row.title || '',
    description: row.description || '',
    thumbnailBase64: row.thumbnail_base64 || '',
    category: row.category || '',
    viewerCount: row.viewer_count || 0,
    peakViewerCount: row.peak_viewer_count || 0,
    likeCount: row.like_count || 0,
    giftsCoinsTotal: row.gifts_coins_total || 0,
    status: row.status as LiveStreamStatus,
    coHostUID: row.co_host_uid || undefined,
    coHostUser: row.co_host ? mapUserFromDB(row.co_host) : undefined,
    isRecording: row.is_recording || false,
    recordingUrl: row.recording_url || '',
    scheduledAt: row.scheduled_at || undefined,
    startedAt: row.started_at || 0,
    endedAt: row.ended_at || undefined,
  };
}

export function mapWalletFromDB(row: WalletRow): Wallet {
  return {
    uid: row.uid,
    coinsBalance: row.coins_balance || 0,
    diamondsBalance: row.diamonds_balance || 0,
    totalCoinsEarned: row.total_coins_earned || 0,
    totalDiamondsEarned: row.total_diamonds_earned || 0,
    totalCoinsSpent: row.total_coins_spent || 0,
  };
}

export function mapTransactionFromDB(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userUID: row.user_uid,
    type: row.type as TransactionType,
    currency: row.currency as CurrencyType,
    amount: row.amount,
    description: row.description || '',
    referenceID: row.reference_id || undefined,
    createdAt: row.created_at || 0,
  };
}

export function mapAchievementFromDB(row: AchievementRow): Achievement {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    nameAr: row.name_ar || '',
    description: row.description || '',
    descriptionAr: row.description_ar || '',
    iconEmoji: row.icon_emoji || '',
    category: row.category as AchievementCategory,
    requirementValue: row.requirement_value || 0,
    rewardCoins: row.reward_coins || 0,
    rewardDiamonds: row.reward_diamonds || 0,
    isActive: row.is_active,
  };
}

export function mapUserAchievementFromDB(row: UserAchievementRow & { achievement?: AchievementRow }): UserAchievement {
  return {
    userUID: row.user_uid,
    achievementID: row.achievement_id,
    achievement: row.achievement ? mapAchievementFromDB(row.achievement) : undefined,
    progress: row.progress || 0,
    isCompleted: row.is_completed || false,
    completedAt: row.completed_at || undefined,
  };
}

export function mapDailyRewardFromDB(row: DailyRewardRow): DailyReward {
  return {
    id: row.id,
    userUID: row.user_uid,
    dayNumber: row.day_number,
    coinsReward: row.coins_reward,
    diamondsReward: row.diamonds_reward,
    isClaimed: row.is_claimed,
    claimedAt: row.claimed_at || undefined,
  };
}

// ============ TypeScript Type → DB Insert Mappers ============

export function mapUserToDB(user: Partial<User>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (user.uid !== undefined) row.uid = user.uid;
  if (user.email !== undefined) row.email = user.email;
  if (user.username !== undefined) row.username = user.username;
  if (user.nickname !== undefined) row.nickname = user.nickname;
  if (user.bio !== undefined) row.bio = user.bio;
  if (user.gender !== undefined) row.gender = user.gender;
  if (user.profileImage !== undefined) row.profile_image = user.profileImage;
  if (user.coverImage !== undefined) row.cover_image = user.coverImage;
  if (user.status !== undefined) row.status = user.status;
  if (user.role !== undefined) row.role = user.role;
  if (user.isVerified !== undefined) row.is_verified = user.isVerified;
  if (user.isPremium !== undefined) row.is_premium = user.isPremium;
  if (user.region !== undefined) row.region = user.region;
  if (user.isProfileComplete !== undefined) row.is_profile_complete = user.isProfileComplete;
  if (user.isEmailVerified !== undefined) row.is_email_verified = user.isEmailVerified;
  if (user.lastSeen !== undefined) row.last_seen = user.lastSeen;
  return row;
}

export function mapPostToDB(post: Partial<Post>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (post.publisherUID !== undefined) row.publisher_uid = post.publisherUID;
  if (post.type !== undefined) row.type = post.type;
  if (post.content !== undefined) row.content = post.content;
  if (post.mediaBase64 !== undefined) row.media_base64 = post.mediaBase64;
  if (post.mediaMimeType !== undefined) row.media_mime_type = post.mediaMimeType;
  if (post.description !== undefined) row.description = post.description;
  if (post.isPrivate !== undefined) row.is_private = post.isPrivate;
  if (post.isPinned !== undefined) row.is_pinned = post.isPinned;
  if (post.commentsDisabled !== undefined) row.comments_disabled = post.commentsDisabled;
  if (post.favoritesDisabled !== undefined) row.favorites_disabled = post.favoritesDisabled;
  if (post.region !== undefined) row.region = post.region;
  return row;
}

export function mapCommentToDB(comment: Partial<Comment>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (comment.postID !== undefined) row.post_id = comment.postID;
  if (comment.publisherUID !== undefined) row.publisher_uid = comment.publisherUID;
  if (comment.content !== undefined) row.content = comment.content;
  if (comment.parentCommentID !== undefined) row.parent_comment_id = comment.parentCommentID;
  return row;
}

export function mapStoryToDB(story: Partial<Story>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (story.publisherUID !== undefined) row.publisher_uid = story.publisherUID;
  if (story.mediaBase64 !== undefined) row.media_base64 = story.mediaBase64;
  if (story.mediaMimeType !== undefined) row.media_mime_type = story.mediaMimeType;
  return row;
}

export function mapChatMessageToDB(msg: Partial<ChatMessage> & { roomID?: string }): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (msg.roomID !== undefined) row.room_id = msg.roomID;
  if (msg.senderUID !== undefined) row.sender_uid = msg.senderUID;
  if (msg.content !== undefined) row.content = msg.content;
  if (msg.mediaBase64 !== undefined) row.media_base64 = msg.mediaBase64;
  if (msg.mediaMimeType !== undefined) row.media_mime_type = msg.mediaMimeType;
  if (msg.messageType !== undefined) row.message_type = msg.messageType;
  return row;
}

export function mapNotificationToDB(notif: Partial<Notification> & { userUID?: string }): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (notif.userUID !== undefined) row.user_uid = notif.userUID;
  if (notif.type !== undefined) row.type = notif.type;
  if (notif.fromUID !== undefined) row.from_uid = notif.fromUID;
  if (notif.postID !== undefined) row.post_id = notif.postID;
  if (notif.content !== undefined) row.content = notif.content;
  if (notif.isRead !== undefined) row.is_read = notif.isRead;
  return row;
}

export function mapLiveStreamToDB(stream: Partial<LiveStream>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (stream.hostUID !== undefined) row.host_uid = stream.hostUID;
  if (stream.title !== undefined) row.title = stream.title;
  if (stream.description !== undefined) row.description = stream.description;
  if (stream.thumbnailBase64 !== undefined) row.thumbnail_base64 = stream.thumbnailBase64;
  if (stream.category !== undefined) row.category = stream.category;
  if (stream.status !== undefined) row.status = stream.status;
  if (stream.scheduledAt !== undefined) row.scheduled_at = stream.scheduledAt;
  if (stream.endedAt !== undefined) row.ended_at = stream.endedAt;
  return row;
}

export function mapWalletToDB(wallet: Partial<Wallet>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (wallet.uid !== undefined) row.uid = wallet.uid;
  if (wallet.coinsBalance !== undefined) row.coins_balance = wallet.coinsBalance;
  if (wallet.diamondsBalance !== undefined) row.diamonds_balance = wallet.diamondsBalance;
  if (wallet.totalCoinsEarned !== undefined) row.total_coins_earned = wallet.totalCoinsEarned;
  if (wallet.totalDiamondsEarned !== undefined) row.total_diamonds_earned = wallet.totalDiamondsEarned;
  if (wallet.totalCoinsSpent !== undefined) row.total_coins_spent = wallet.totalCoinsSpent;
  return row;
}

export function mapTransactionToDB(tx: Partial<Transaction>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (tx.userUID !== undefined) row.user_uid = tx.userUID;
  if (tx.type !== undefined) row.type = tx.type;
  if (tx.currency !== undefined) row.currency = tx.currency;
  if (tx.amount !== undefined) row.amount = tx.amount;
  if (tx.description !== undefined) row.description = tx.description;
  if (tx.referenceID !== undefined) row.reference_id = tx.referenceID;
  return row;
}
