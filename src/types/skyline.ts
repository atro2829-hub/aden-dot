// Skyline Social Media App Types - v2.0
// With Live Streaming, Gifts, Wallets, Achievements

export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'POLL' | 'ARTICLE';
export type Gender = 'male' | 'female' | 'unspecified';
export type UserStatus = 'online' | 'offline' | 'busy' | 'away';
export type UserRole = 'user' | 'moderator' | 'admin' | 'supporter';
export type GiftCategory = 'basic' | 'premium' | 'luxury' | 'seasonal' | 'exclusive';
export type GiftAnimation = 'float' | 'burst' | 'rain' | 'firework' | 'heart_rain';
export type LiveStreamStatus = 'live' | 'ended' | 'scheduled';
export type MessageType = 'text' | 'image' | 'video' | 'voice' | 'gift' | 'location' | 'contact';
export type TransactionType = 'purchase' | 'earn' | 'spend' | 'withdraw' | 'gift_send' | 'gift_receive' | 'bonus' | 'refund';
export type CurrencyType = 'coins' | 'diamonds';
export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'gift' | 'live_start' | 'level_up' | 'achievement' | 'system';
export type AchievementCategory = 'general' | 'social' | 'content' | 'live' | 'gifts' | 'streak';
export type ReportReason = 'spam' | 'harassment' | 'violence' | 'nudity' | 'hate_speech' | 'misinformation' | 'other';

export interface User {
  uid: string;
  email: string;
  username: string;
  nickname: string;
  bio: string;
  gender: Gender;
  profileImage: string;
  coverImage: string;
  status: UserStatus;
  role: UserRole;
  isVerified: boolean;
  isPremium: boolean;
  region: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  level: number;
  xp: number;
  popularity: number;
  giftsCount: number;
  subscribers: number;
  coinsBalance: number;
  diamondsBalance: number;
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  joinDate: string;
  lastSeen: number;
}

export interface Post {
  id: string;
  publisherUID: string;
  publisherUsername: string;
  publisherNickname: string;
  publisherProfileImage: string;
  publisherVerified: boolean;
  type: PostType;
  content: string;
  mediaBase64?: string;
  mediaMimeType?: string;
  description: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isFavorite: boolean;
  isPrivate: boolean;
  isPinned: boolean;
  commentsDisabled: boolean;
  favoritesDisabled: boolean;
  createdAt: number;
  region: string;
  poll?: Poll;
}

export interface Comment {
  id: string;
  postID: string;
  publisherUID: string;
  publisherUsername: string;
  publisherNickname: string;
  publisherProfileImage: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  isLikedByPublisher: boolean;
  parentCommentID: string | null;
  repliesCount: number;
  createdAt: number;
}

export interface Story {
  id: string;
  publisherUID: string;
  publisherUsername: string;
  publisherNickname: string;
  publisherProfileImage: string;
  mediaBase64: string;
  mediaMimeType: string;
  viewsCount: number;
  viewers: string[];
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderUID: string;
  receiverUID: string;
  content: string;
  mediaBase64?: string;
  mediaMimeType?: string;
  messageType: MessageType;
  isRead: boolean;
  createdAt: number;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  otherUser: User;
}

export interface Notification {
  id: string;
  type: NotificationType;
  fromUID: string;
  fromUsername: string;
  fromProfileImage: string;
  postID?: string;
  content?: string;
  isRead: boolean;
  createdAt: number;
}

// ===== NEW TYPES =====

export interface GiftType {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  imageUrl: string;
  coinCost: number;
  diamondValue: number;
  category: GiftCategory;
  animationType: GiftAnimation;
  isActive: boolean;
  sortOrder: number;
}

export interface Gift {
  id: string;
  giftTypeId: string;
  giftType?: GiftType;
  senderUID: string;
  senderUser?: User;
  receiverUID: string;
  receiverUser?: User;
  postID?: string;
  liveStreamID?: string;
  quantity: number;
  message: string;
  createdAt: number;
}

export interface LiveStream {
  id: string;
  hostUID: string;
  hostUser?: User;
  title: string;
  description: string;
  thumbnailBase64: string;
  category: string;
  viewerCount: number;
  peakViewerCount: number;
  likeCount: number;
  giftsCoinsTotal: number;
  status: LiveStreamStatus;
  coHostUID?: string;
  coHostUser?: User;
  isRecording: boolean;
  recordingUrl: string;
  scheduledAt?: string;
  startedAt: number;
  endedAt?: number;
}

export interface LiveStreamViewer {
  id: string;
  streamID: string;
  userUID: string;
  user?: User;
  joinedAt: number;
  leftAt?: number;
  watchDurationSeconds: number;
}

export interface LiveStreamComment {
  id: string;
  streamID: string;
  userUID: string;
  user?: User;
  content: string;
  createdAt: number;
}

export interface Wallet {
  uid: string;
  coinsBalance: number;
  diamondsBalance: number;
  totalCoinsEarned: number;
  totalDiamondsEarned: number;
  totalCoinsSpent: number;
}

export interface Transaction {
  id: string;
  userUID: string;
  type: TransactionType;
  currency: CurrencyType;
  amount: number;
  description: string;
  referenceID?: string;
  createdAt: number;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  iconEmoji: string;
  category: AchievementCategory;
  requirementValue: number;
  rewardCoins: number;
  rewardDiamonds: number;
  isActive: boolean;
}

export interface UserAchievement {
  userUID: string;
  achievementID: string;
  achievement?: Achievement;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface DailyReward {
  id: string;
  userUID: string;
  dayNumber: number;
  coinsReward: number;
  diamondsReward: number;
  isClaimed: boolean;
  claimedAt?: string;
}

export interface Poll {
  id: string;
  postID: string;
  question: string;
  isMultiChoice: boolean;
  endsAt?: string;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  pollID: string;
  optionText: string;
  votesCount: number;
  sortOrder: number;
  isVoted?: boolean;
}

export interface BlockedUser {
  blockerUID: string;
  blockedUID: string;
  blockedUser?: User;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterUID: string;
  reportedUID?: string;
  reportedPostID?: string;
  reason: ReportReason;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Hashtag {
  id: string;
  tag: string;
  postsCount: number;
  trendingScore: number;
}

export interface Collection {
  id: string;
  userUID: string;
  name: string;
  iconEmoji: string;
  isPrivate: boolean;
  createdAt: string;
}
