/**
 * Local-First Database Layer for Aden Dot
 * ------------------------------------------
 * Provides a complete offline-capable data layer using localStorage.
 * Automatically used as a fallback when Supabase is unreachable.
 *
 * Types match @/types/skyline exactly so this can be a drop-in replacement.
 */

import type {
  User, Post, Comment, Story, ChatRoom, ChatMessage, Notification,
  GiftType, Gift, LiveStream, LiveStreamComment, Wallet, Transaction,
  Achievement, UserAchievement, DailyReward,
  PostType, Gender, UserStatus, UserRole, MessageType, NotificationType,
  TransactionType, CurrencyType, GiftCategory, GiftAnimation, LiveStreamStatus,
  AchievementCategory,
} from '@/types/skyline';

// ============ Storage Keys ============
const KEYS = {
  USERS: 'adendot_local_users',
  POSTS: 'adendot_local_posts',
  COMMENTS: 'adendot_local_comments',
  STORIES: 'adendot_local_stories',
  FOLLOWS: 'adendot_local_follows',
  NOTIFICATIONS: 'adendot_local_notifications',
  CHAT_ROOMS: 'adendot_local_chat_rooms',
  CHAT_MESSAGES: 'adendot_local_chat_messages',
  WALLETS: 'adendot_local_wallets',
  TRANSACTIONS: 'adendot_local_transactions',
  LIVE_STREAMS: 'adendot_local_live_streams',
  LIVE_COMMENTS: 'adendot_local_live_comments',
  GIFTS_LOG: 'adendot_local_gifts_log',
  GIFTS_TYPES: 'adendot_local_gifts_types',
  ACHIEVEMENTS: 'adendot_local_achievements',
  USER_ACHIEVEMENTS: 'adendot_local_user_achievements',
  DAILY_REWARDS: 'adendot_local_daily_rewards',
  CURRENT_USER: 'adendot_local_current_user',
  SEEDED: 'adendot_local_seeded_v1',
  PASSWORDS: 'adendot_local_passwords',
  LIKES: 'adendot_local_likes',
};

// Notification wrapper - extends Notification with recipient field for local storage
interface StoredNotification extends Notification {
  toUID: string;
}

// ============ Helpers ============
function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[LocalDB] write error:', e);
  }
}

function genId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function hashPassword(password: string): string {
  let hash = 0;
  const salted = `adendot_salt_${password}_v1`;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `h_${Math.abs(hash).toString(36)}_${salted.length}`;
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function nowMs(): number {
  return Date.now();
}

function minutesAgoMs(minutes: number): number {
  return Date.now() - minutes * 60 * 1000;
}

function hoursAgoMs(hours: number): number {
  return Date.now() - hours * 60 * 60 * 1000;
}

function daysAgoMs(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

// ============ Demo Data Seeding ============
function seedIfEmpty(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEYS.SEEDED)) return;

  const now = nowMs();

  // --- Demo Users (matching User interface exactly) ---
  const demoUsers: User[] = [
    {
      uid: 'admin_local_uid',
      email: 'admin@adendot.app',
      username: 'admin',
      nickname: 'إدارة منصة عدن دوت',
      bio: 'الحساب الرسمي لإدارة منصة عدن دوت - جنوب الجزيرة العربية',
      gender: 'male',
      profileImage: '',
      coverImage: '',
      status: 'online',
      role: 'admin',
      isVerified: true,
      isPremium: true,
      region: 'aden',
      followersCount: 9999,
      followingCount: 12,
      postsCount: 0,
      level: 99,
      xp: 999999,
      popularity: 100,
      giftsCount: 0,
      subscribers: 5000,
      coinsBalance: 99999,
      diamondsBalance: 99999,
      isProfileComplete: true,
      isEmailVerified: true,
      joinDate: new Date(daysAgoMs(365)).toISOString(),
      lastSeen: now,
    },
    {
      uid: 'user_ahmad',
      email: 'ahmad@example.com',
      username: 'ahmad_aden',
      nickname: 'أحمد العدني',
      bio: 'كاتب و شاعر من عدن',
      gender: 'male',
      profileImage: '',
      coverImage: '',
      status: 'online',
      role: 'user',
      isVerified: true,
      isPremium: false,
      region: 'aden',
      followersCount: 1240,
      followingCount: 380,
      postsCount: 87,
      level: 12,
      xp: 4500,
      popularity: 68,
      giftsCount: 24,
      subscribers: 320,
      coinsBalance: 1250,
      diamondsBalance: 85,
      isProfileComplete: true,
      isEmailVerified: true,
      joinDate: new Date(daysAgoMs(200)).toISOString(),
      lastSeen: now,
    },
    {
      uid: 'user_salem',
      email: 'salem@example.com',
      username: 'salem_south',
      nickname: 'سالم الجنوبي',
      bio: 'مصور محترف - لحظات من الجنوب',
      gender: 'male',
      profileImage: '',
      coverImage: '',
      status: 'offline',
      role: 'user',
      isVerified: true,
      isPremium: true,
      region: 'hadramaut',
      followersCount: 3420,
      followingCount: 220,
      postsCount: 156,
      level: 24,
      xp: 18200,
      popularity: 82,
      giftsCount: 156,
      subscribers: 1200,
      coinsBalance: 4200,
      diamondsBalance: 320,
      isProfileComplete: true,
      isEmailVerified: true,
      joinDate: new Date(daysAgoMs(180)).toISOString(),
      lastSeen: minutesAgoMs(45),
    },
    {
      uid: 'user_amal',
      email: 'amal@example.com',
      username: 'amal_writes',
      nickname: 'أمل السعيدة',
      bio: 'كاتبة محتوى و رائدة أعمال',
      gender: 'female',
      profileImage: '',
      coverImage: '',
      status: 'online',
      role: 'user',
      isVerified: true,
      isPremium: true,
      region: 'aden',
      followersCount: 8900,
      followingCount: 540,
      postsCount: 234,
      level: 38,
      xp: 45200,
      popularity: 95,
      giftsCount: 487,
      subscribers: 3400,
      coinsBalance: 8900,
      diamondsBalance: 750,
      isProfileComplete: true,
      isEmailVerified: true,
      joinDate: new Date(daysAgoMs(150)).toISOString(),
      lastSeen: now,
    },
    {
      uid: 'user_khaled',
      email: 'khaled@example.com',
      username: 'khaled_mukalla',
      nickname: 'خالد المكلاي',
      bio: 'رياضي و مغامر',
      gender: 'male',
      profileImage: '',
      coverImage: '',
      status: 'away',
      role: 'user',
      isVerified: false,
      isPremium: false,
      region: 'hadramaut',
      followersCount: 2100,
      followingCount: 180,
      postsCount: 92,
      level: 8,
      xp: 2400,
      popularity: 55,
      giftsCount: 18,
      subscribers: 420,
      coinsBalance: 1800,
      diamondsBalance: 95,
      isProfileComplete: true,
      isEmailVerified: true,
      joinDate: new Date(daysAgoMs(90)).toISOString(),
      lastSeen: minutesAgoMs(180),
    },
  ];

  const passwords: Record<string, string> = {
    admin_local_uid: hashPassword('Aden@2026'),
    user_ahmad: hashPassword('123456'),
    user_salem: hashPassword('123456'),
    user_amal: hashPassword('123456'),
    user_khaled: hashPassword('123456'),
  };

  // --- Demo Posts (matching Post interface exactly) ---
  const demoPosts: Post[] = [
    {
      id: 'post_1',
      publisherUID: 'user_ahmad',
      publisherUsername: 'ahmad_aden',
      publisherNickname: 'أحمد العدني',
      publisherProfileImage: '',
      publisherVerified: true,
      type: 'TEXT',
      content: 'صباح الخير من عدن الجميلة. اليوم جديد و الأمل أكبر. هل تعلم أن عدن كانت من أولى المدن التي عرفت الكهرباء في المنطقة؟',
      description: '',
      likesCount: 245,
      commentsCount: 38,
      viewsCount: 1820,
      sharesCount: 12,
      isLiked: false,
      isFavorite: false,
      isPrivate: false,
      isPinned: false,
      commentsDisabled: false,
      favoritesDisabled: false,
      createdAt: minutesAgoMs(120),
      region: 'aden',
    },
    {
      id: 'post_2',
      publisherUID: 'user_salem',
      publisherUsername: 'salem_south',
      publisherNickname: 'سالم الجنوبي',
      publisherProfileImage: '',
      publisherVerified: true,
      type: 'TEXT',
      content: 'لقطات من سواحل المكلا اليوم - البحر هادئ و النسيم عليل. الطبيعة في الجنوب تعزينا على كل شيء.',
      description: '',
      likesCount: 892,
      commentsCount: 67,
      viewsCount: 4520,
      sharesCount: 45,
      isLiked: false,
      isFavorite: false,
      isPrivate: false,
      isPinned: false,
      commentsDisabled: false,
      favoritesDisabled: false,
      createdAt: minutesAgoMs(240),
      region: 'hadramaut',
    },
    {
      id: 'post_3',
      publisherUID: 'user_amal',
      publisherUsername: 'amal_writes',
      publisherNickname: 'أمل السعيدة',
      publisherProfileImage: '',
      publisherVerified: true,
      type: 'TEXT',
      content: 'مشروعي الجديد لإعادة تدوير البلاستيك في عدن بدأ يؤتي ثماره. الحلم يكبر بفضل دعمكم. شكراً لكل من آمن بالفكرة.',
      description: '',
      likesCount: 1567,
      commentsCount: 124,
      viewsCount: 8230,
      sharesCount: 89,
      isLiked: false,
      isFavorite: false,
      isPrivate: false,
      isPinned: false,
      commentsDisabled: false,
      favoritesDisabled: false,
      createdAt: minutesAgoMs(360),
      region: 'aden',
    },
    {
      id: 'post_4',
      publisherUID: 'user_khaled',
      publisherUsername: 'khaled_mukalla',
      publisherNickname: 'خالد المكلاي',
      publisherProfileImage: '',
      publisherVerified: false,
      type: 'TEXT',
      content: 'تمرين اليوم في صالة المكلا الرياضية - لا تتوقف عن الحركة، الجسم السليم في العقل السليم.',
      description: '',
      likesCount: 320,
      commentsCount: 18,
      viewsCount: 980,
      sharesCount: 7,
      isLiked: false,
      isFavorite: false,
      isPrivate: false,
      isPinned: false,
      commentsDisabled: false,
      favoritesDisabled: false,
      createdAt: minutesAgoMs(480),
      region: 'hadramaut',
    },
  ];

  // --- Demo Comments (matching Comment interface) ---
  const demoComments: Comment[] = [
    {
      id: 'comment_1',
      postID: 'post_1',
      publisherUID: 'user_salem',
      publisherUsername: 'salem_south',
      publisherNickname: 'سالم الجنوبي',
      publisherProfileImage: '',
      content: 'صباح النور و السعادة يا أحمد، كلامك يحيي الأمل في القلوب.',
      likesCount: 24,
      isLiked: false,
      isLikedByPublisher: false,
      parentCommentID: null,
      repliesCount: 2,
      createdAt: minutesAgoMs(100),
    },
    {
      id: 'comment_2',
      postID: 'post_1',
      publisherUID: 'user_amal',
      publisherUsername: 'amal_writes',
      publisherNickname: 'أمل السعيدة',
      publisherProfileImage: '',
      content: 'معلومة جميلة، لم أكن أعرفها عن عدن. شكراً.',
      likesCount: 12,
      isLiked: false,
      isLikedByPublisher: false,
      parentCommentID: null,
      repliesCount: 0,
      createdAt: minutesAgoMs(80),
    },
    {
      id: 'comment_3',
      postID: 'post_2',
      publisherUID: 'user_ahmad',
      publisherUsername: 'ahmad_aden',
      publisherNickname: 'أحمد العدني',
      publisherProfileImage: '',
      content: 'صور رائعة يا سالم، البحر في حضرموت لا يُوصف.',
      likesCount: 45,
      isLiked: false,
      isLikedByPublisher: false,
      parentCommentID: null,
      repliesCount: 1,
      createdAt: minutesAgoMs(200),
    },
  ];

  // --- Demo Stories (matching Story interface) ---
  const demoStories: Story[] = [
    {
      id: 'story_1',
      publisherUID: 'user_ahmad',
      publisherUsername: 'ahmad_aden',
      publisherNickname: 'أحمد العدني',
      publisherProfileImage: '',
      mediaBase64: '',
      mediaMimeType: 'text/plain',
      viewsCount: 87,
      viewers: ['user_salem', 'user_amal'],
      createdAt: hoursAgoMs(2),
    },
    {
      id: 'story_2',
      publisherUID: 'user_salem',
      publisherUsername: 'salem_south',
      publisherNickname: 'سالم الجنوبي',
      publisherProfileImage: '',
      mediaBase64: 'من المكلا',
      mediaMimeType: 'text/plain',
      viewsCount: 142,
      viewers: ['user_ahmad', 'user_amal', 'user_khaled'],
      createdAt: hoursAgoMs(3),
    },
    {
      id: 'story_3',
      publisherUID: 'user_amal',
      publisherUsername: 'amal_writes',
      publisherNickname: 'أمل السعيدة',
      publisherProfileImage: '',
      mediaBase64: 'مشروعي يتقدم',
      mediaMimeType: 'text/plain',
      viewsCount: 234,
      viewers: ['user_ahmad', 'user_salem'],
      createdAt: hoursAgoMs(1),
    },
  ];

  // --- Demo Follows ---
  const demoFollows = [
    { followerId: 'user_ahmad', followingId: 'user_salem', createdAt: new Date(daysAgoMs(100)).toISOString() },
    { followerId: 'user_ahmad', followingId: 'user_amal', createdAt: new Date(daysAgoMs(90)).toISOString() },
    { followerId: 'user_salem', followingId: 'user_ahmad', createdAt: new Date(daysAgoMs(80)).toISOString() },
    { followerId: 'user_salem', followingId: 'user_amal', createdAt: new Date(daysAgoMs(70)).toISOString() },
    { followerId: 'user_amal', followingId: 'user_ahmad', createdAt: new Date(daysAgoMs(60)).toISOString() },
    { followerId: 'user_amal', followingId: 'user_salem', createdAt: new Date(daysAgoMs(50)).toISOString() },
    { followerId: 'user_khaled', followingId: 'user_ahmad', createdAt: new Date(daysAgoMs(40)).toISOString() },
    { followerId: 'user_khaled', followingId: 'user_amal', createdAt: new Date(daysAgoMs(30)).toISOString() },
  ];

  // --- Demo Chat Messages (matching ChatMessage interface) ---
  const demoChatMessages: ChatMessage[] = [
    {
      id: 'msg_1',
      senderUID: 'user_salem',
      receiverUID: 'user_ahmad',
      content: 'مرحبا أحمد، كيف حالك؟',
      messageType: 'text',
      isRead: true,
      createdAt: minutesAgoMs(35),
    },
    {
      id: 'msg_2',
      senderUID: 'user_ahmad',
      receiverUID: 'user_salem',
      content: 'بخير الحمد لله، شو الأخبار عندك؟',
      messageType: 'text',
      isRead: false,
      createdAt: minutesAgoMs(30),
    },
    {
      id: 'msg_3',
      senderUID: 'user_amal',
      receiverUID: 'user_ahmad',
      content: 'أحمد، شفت آخر تطورات المشروع؟',
      messageType: 'text',
      isRead: true,
      createdAt: minutesAgoMs(125),
    },
    {
      id: 'msg_4',
      senderUID: 'user_ahmad',
      receiverUID: 'user_amal',
      content: 'نعم، رائع ما حققتِه! مبروك.',
      messageType: 'text',
      isRead: false,
      createdAt: minutesAgoMs(120),
    },
  ];

  // --- Demo Notifications (matching Notification interface + toUID wrapper) ---
  const demoNotifications: StoredNotification[] = [
    {
      id: 'notif_1',
      type: 'like',
      fromUID: 'user_salem',
      fromUsername: 'salem_south',
      fromProfileImage: '',
      postID: 'post_1',
      content: 'أعجب بمنشورك',
      isRead: false,
      createdAt: minutesAgoMs(15),
      toUID: 'user_ahmad',
    },
    {
      id: 'notif_2',
      type: 'comment',
      fromUID: 'user_amal',
      fromUsername: 'amal_writes',
      fromProfileImage: '',
      postID: 'post_1',
      content: 'علّقت على منشورك',
      isRead: false,
      createdAt: minutesAgoMs(45),
      toUID: 'user_ahmad',
    },
    {
      id: 'notif_3',
      type: 'follow',
      fromUID: 'user_khaled',
      fromUsername: 'khaled_mukalla',
      fromProfileImage: '',
      content: 'بدأ متابعتك',
      isRead: true,
      createdAt: hoursAgoMs(5),
      toUID: 'user_ahmad',
    },
  ];

  // --- Demo Wallets (matching Wallet interface) ---
  const demoWallets: Wallet[] = demoUsers.map(u => ({
    uid: u.uid,
    coinsBalance: u.coinsBalance,
    diamondsBalance: u.diamondsBalance,
    totalCoinsEarned: u.coinsBalance,
    totalDiamondsEarned: u.diamondsBalance,
    totalCoinsSpent: 0,
  }));

  // --- Demo Gift Types (matching GiftType interface) ---
  const demoGiftTypes: GiftType[] = [
    { id: 'gift_rose', name: 'Rose', nameAr: 'وردة', emoji: '🌹', imageUrl: '', coinCost: 10, diamondValue: 1, category: 'basic', animationType: 'float', isActive: true, sortOrder: 1 },
    { id: 'gift_heart', name: 'Heart', nameAr: 'قلب', emoji: '❤️', imageUrl: '', coinCost: 50, diamondValue: 5, category: 'basic', animationType: 'float', isActive: true, sortOrder: 2 },
    { id: 'gift_star', name: 'Star', nameAr: 'نجمة', emoji: '⭐', imageUrl: '', coinCost: 100, diamondValue: 10, category: 'premium', animationType: 'burst', isActive: true, sortOrder: 3 },
    { id: 'gift_diamond', name: 'Diamond', nameAr: 'ماس', emoji: '💎', imageUrl: '', coinCost: 500, diamondValue: 50, category: 'luxury', animationType: 'burst', isActive: true, sortOrder: 4 },
    { id: 'gift_crown', name: 'Crown', nameAr: 'تاج', emoji: '👑', imageUrl: '', coinCost: 1000, diamondValue: 100, category: 'luxury', animationType: 'firework', isActive: true, sortOrder: 5 },
    { id: 'gift_rocket', name: 'Rocket', nameAr: 'صاروخ', emoji: '🚀', imageUrl: '', coinCost: 2500, diamondValue: 250, category: 'exclusive', animationType: 'firework', isActive: true, sortOrder: 6 },
  ];

  // --- Demo Achievements (matching Achievement interface) ---
  const demoAchievements: Achievement[] = [
    { id: 'ach_first_post', code: 'FIRST_POST', name: 'First Post', nameAr: 'أول منشور', description: 'Publish your first post', descriptionAr: 'انشر أول منشور لك', iconEmoji: '📝', category: 'content', requirementValue: 1, rewardCoins: 50, rewardDiamonds: 0, isActive: true },
    { id: 'ach_100_followers', code: 'FOLLOWERS_100', name: 'Centurion', nameAr: 'مئوي', description: 'Reach 100 followers', descriptionAr: 'احصل على 100 متابع', iconEmoji: '💯', category: 'social', requirementValue: 100, rewardCoins: 100, rewardDiamonds: 5, isActive: true },
    { id: 'ach_first_live', code: 'FIRST_LIVE', name: 'First Live', nameAr: 'البث الأول', description: 'Start your first live stream', descriptionAr: 'ابدأ أول بث مباشر', iconEmoji: '📹', category: 'live', requirementValue: 1, rewardCoins: 150, rewardDiamonds: 10, isActive: true },
    { id: 'ach_viral', code: 'VIRAL_1000', name: 'Viral', nameAr: 'فيروسي', description: 'Get 1000 likes on a post', descriptionAr: 'احصل على 1000 إعجاب', iconEmoji: '🔥', category: 'content', requirementValue: 1000, rewardCoins: 300, rewardDiamonds: 30, isActive: true },
    { id: 'ach_admin', code: 'ADMIN', name: 'Admin', nameAr: 'إداري', description: 'Official admin account', descriptionAr: 'حساب إداري رسمي', iconEmoji: '⚙️', category: 'general', requirementValue: 1, rewardCoins: 999, rewardDiamonds: 99, isActive: true },
  ];

  // Persist all
  write(KEYS.USERS, demoUsers);
  write(KEYS.PASSWORDS, passwords);
  write(KEYS.POSTS, demoPosts);
  write(KEYS.COMMENTS, demoComments);
  write(KEYS.STORIES, demoStories);
  write(KEYS.FOLLOWS, demoFollows);
  write(KEYS.CHAT_MESSAGES, demoChatMessages);
  write(KEYS.NOTIFICATIONS, demoNotifications);
  write(KEYS.WALLETS, demoWallets);
  write(KEYS.GIFTS_TYPES, demoGiftTypes);
  write(KEYS.ACHIEVEMENTS, demoAchievements);
  write(KEYS.LIVE_STREAMS, [] as LiveStream[]);
  write(KEYS.DAILY_REWARDS, [] as DailyReward[]);

  localStorage.setItem(KEYS.SEEDED, '1');
}

// ============ Public API ============
export function initLocalDatabase(): void {
  seedIfEmpty();
}

// ---- Auth ----
export const localAuth = {
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    seedIfEmpty();
    const users = read<User[]>(KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { user: null, error: 'البريد الإلكتروني غير مسجل' };
    const passwords = read<Record<string, string>>(KEYS.PASSWORDS, {});
    if (!verifyPassword(password, passwords[user.uid] || '')) {
      return { user: null, error: 'كلمة المرور غير صحيحة' };
    }
    write(KEYS.CURRENT_USER, user.uid);
    return { user, error: null };
  },

  async register(email: string, password: string, username?: string, nickname?: string): Promise<{ user: User | null; error: string | null }> {
    seedIfEmpty();
    const users = read<User[]>(KEYS.USERS, []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { user: null, error: 'هذا البريد مسجل مسبقاً' };
    }
    const uname = username || `user_${Math.random().toString(36).slice(2, 7)}`;
    if (users.some(u => u.username.toLowerCase() === uname.toLowerCase())) {
      return { user: null, error: 'اسم المستخدم محجوز' };
    }
    const uid = genId('user');
    const newUser: User = {
      uid,
      email,
      username: uname,
      nickname: nickname || uname,
      bio: '',
      gender: 'unspecified',
      profileImage: '',
      coverImage: '',
      status: 'online',
      role: 'user',
      isVerified: false,
      isPremium: false,
      region: 'aden',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      level: 1,
      xp: 0,
      popularity: 0,
      giftsCount: 0,
      subscribers: 0,
      coinsBalance: 50,
      diamondsBalance: 0,
      isProfileComplete: false,
      isEmailVerified: false,
      joinDate: new Date().toISOString(),
      lastSeen: nowMs(),
    };
    users.push(newUser);
    write(KEYS.USERS, users);
    const passwords = read<Record<string, string>>(KEYS.PASSWORDS, {});
    passwords[uid] = hashPassword(password);
    write(KEYS.PASSWORDS, passwords);
    const wallets = read<Wallet[]>(KEYS.WALLETS, []);
    wallets.push({
      uid,
      coinsBalance: 50,
      diamondsBalance: 0,
      totalCoinsEarned: 50,
      totalDiamondsEarned: 0,
      totalCoinsSpent: 0,
    });
    write(KEYS.WALLETS, wallets);
    write(KEYS.CURRENT_USER, uid);
    return { user: newUser, error: null };
  },

  async loginWithGoogle(googleProfile: { email: string; name: string; picture: string; sub: string }): Promise<{ user: User | null; error: string | null }> {
    seedIfEmpty();
    const users = read<User[]>(KEYS.USERS, []);
    let user = users.find(u => u.email.toLowerCase() === googleProfile.email.toLowerCase());
    if (!user) {
      const uid = `google_${googleProfile.sub}`;
      const username = `g_${googleProfile.sub.slice(0, 8)}`;
      const newUser: User = {
        uid,
        email: googleProfile.email,
        username,
        nickname: googleProfile.name || username,
        bio: 'مسجل عبر Google',
        gender: 'unspecified',
        profileImage: googleProfile.picture || '',
        coverImage: '',
        status: 'online',
        role: 'user',
        isVerified: false,
        isPremium: false,
        region: 'aden',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        level: 1,
        xp: 0,
        popularity: 0,
        giftsCount: 0,
        subscribers: 0,
        coinsBalance: 50,
        diamondsBalance: 0,
        isProfileComplete: true,
        isEmailVerified: true,
        joinDate: new Date().toISOString(),
        lastSeen: nowMs(),
      };
      users.push(newUser);
      write(KEYS.USERS, users);
      const wallets = read<Wallet[]>(KEYS.WALLETS, []);
      wallets.push({
        uid,
        coinsBalance: 50,
        diamondsBalance: 0,
        totalCoinsEarned: 50,
        totalDiamondsEarned: 0,
        totalCoinsSpent: 0,
      });
      write(KEYS.WALLETS, wallets);
      user = newUser;
    }
    write(KEYS.CURRENT_USER, user.uid);
    return { user, error: null };
  },

  async logout(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const uid = localStorage.getItem(KEYS.CURRENT_USER);
    if (!uid) return null;
    const users = read<User[]>(KEYS.USERS, []);
    return users.find(u => u.uid === uid) || null;
  },

  isAdmin(): boolean {
    const u = this.getCurrentUser();
    return u?.role === 'admin';
  },
};

// ---- Users ----
export const localUsers = {
  getAll(): User[] {
    seedIfEmpty();
    return read<User[]>(KEYS.USERS, []);
  },
  getById(uid: string): User | null {
    return this.getAll().find(u => u.uid === uid) || null;
  },
  update(uid: string, data: Partial<User>): User | null {
    const users = this.getAll();
    const idx = users.findIndex(u => u.uid === uid);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    write(KEYS.USERS, users);
    return users[idx];
  },
  search(query: string): User[] {
    const q = query.toLowerCase();
    return this.getAll().filter(u =>
      u.nickname.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
    );
  },
};

// ---- Posts ----
export const localPosts = {
  getAll(): Post[] {
    seedIfEmpty();
    return read<Post[]>(KEYS.POSTS, []).sort((a, b) => b.createdAt - a.createdAt);
  },
  getByUser(uid: string): Post[] {
    return this.getAll().filter(p => p.publisherUID === uid);
  },
  getById(id: string): Post | null {
    return this.getAll().find(p => p.id === id) || null;
  },
  create(data: { userId: string; content: string; type?: PostType; region?: string }): Post {
    const posts = read<Post[]>(KEYS.POSTS, []);
    const author = localUsers.getById(data.userId);
    const newPost: Post = {
      id: genId('post'),
      publisherUID: data.userId,
      publisherUsername: author?.username || 'user',
      publisherNickname: author?.nickname || 'مستخدم',
      publisherProfileImage: author?.profileImage || '',
      publisherVerified: author?.isVerified || false,
      type: data.type || 'TEXT',
      content: data.content,
      description: '',
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isFavorite: false,
      isPrivate: false,
      isPinned: false,
      commentsDisabled: false,
      favoritesDisabled: false,
      createdAt: nowMs(),
      region: data.region || 'aden',
    };
    posts.push(newPost);
    write(KEYS.POSTS, posts);
    const users = read<User[]>(KEYS.USERS, []);
    const idx = users.findIndex(u => u.uid === data.userId);
    if (idx !== -1) {
      users[idx].postsCount = (users[idx].postsCount || 0) + 1;
      write(KEYS.USERS, users);
    }
    return newPost;
  },
  toggleLike(postId: string, userId: string): Post | null {
    const posts = read<Post[]>(KEYS.POSTS, []);
    const idx = posts.findIndex(p => p.id === postId);
    if (idx === -1) return null;
    const likes = read<Record<string, boolean>>(KEYS.LIKES, {});
    const likeKey = `${postId}_${userId}`;
    const wasLiked = !!likes[likeKey];
    if (wasLiked) {
      posts[idx].likesCount = Math.max(0, posts[idx].likesCount - 1);
      posts[idx].isLiked = false;
      likes[likeKey] = false;
    } else {
      posts[idx].likesCount = (posts[idx].likesCount || 0) + 1;
      posts[idx].isLiked = true;
      likes[likeKey] = true;
    }
    write(KEYS.POSTS, posts);
    write(KEYS.LIKES, likes);
    return posts[idx];
  },
  incrementShare(postId: string): void {
    const posts = read<Post[]>(KEYS.POSTS, []);
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      posts[idx].sharesCount = (posts[idx].sharesCount || 0) + 1;
      write(KEYS.POSTS, posts);
    }
  },
  incrementView(postId: string): void {
    const posts = read<Post[]>(KEYS.POSTS, []);
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      posts[idx].viewsCount = (posts[idx].viewsCount || 0) + 1;
      write(KEYS.POSTS, posts);
    }
  },
  delete(postId: string): void {
    const posts = read<Post[]>(KEYS.POSTS, []).filter(p => p.id !== postId);
    write(KEYS.POSTS, posts);
  },
};

// ---- Comments ----
export const localComments = {
  getByPost(postId: string): Comment[] {
    seedIfEmpty();
    return read<Comment[]>(KEYS.COMMENTS, [])
      .filter(c => c.postID === postId)
      .sort((a, b) => a.createdAt - b.createdAt);
  },
  create(data: { postId: string; userId: string; content: string }): Comment {
    const comments = read<Comment[]>(KEYS.COMMENTS, []);
    const author = localUsers.getById(data.userId);
    const newComment: Comment = {
      id: genId('comment'),
      postID: data.postId,
      publisherUID: data.userId,
      publisherUsername: author?.username || 'user',
      publisherNickname: author?.nickname || 'مستخدم',
      publisherProfileImage: author?.profileImage || '',
      content: data.content,
      likesCount: 0,
      isLiked: false,
      isLikedByPublisher: false,
      parentCommentID: null,
      repliesCount: 0,
      createdAt: nowMs(),
    };
    comments.push(newComment);
    write(KEYS.COMMENTS, comments);
    const posts = read<Post[]>(KEYS.POSTS, []);
    const idx = posts.findIndex(p => p.id === data.postId);
    if (idx !== -1) {
      posts[idx].commentsCount = (posts[idx].commentsCount || 0) + 1;
      write(KEYS.POSTS, posts);
    }
    return newComment;
  },
  toggleLike(commentId: string, userId: string): void {
    const comments = read<Comment[]>(KEYS.COMMENTS, []);
    const idx = comments.findIndex(c => c.id === commentId);
    if (idx === -1) return;
    const likes = read<Record<string, boolean>>(KEYS.LIKES, {});
    const likeKey = `comment_${commentId}_${userId}`;
    const wasLiked = !!likes[likeKey];
    if (wasLiked) {
      comments[idx].likesCount = Math.max(0, comments[idx].likesCount - 1);
      comments[idx].isLiked = false;
      likes[likeKey] = false;
    } else {
      comments[idx].likesCount = (comments[idx].likesCount || 0) + 1;
      comments[idx].isLiked = true;
      likes[likeKey] = true;
    }
    write(KEYS.COMMENTS, comments);
    write(KEYS.LIKES, likes);
  },
};

// ---- Stories ----
export const localStories = {
  getActive(): Story[] {
    seedIfEmpty();
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return read<Story[]>(KEYS.STORIES, [])
      .filter(s => s.createdAt > dayAgo)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
  getByUser(uid: string): Story[] {
    return this.getActive().filter(s => s.publisherUID === uid);
  },
  create(data: { userId: string; content: string; mediaType?: string }): Story {
    const stories = read<Story[]>(KEYS.STORIES, []);
    const author = localUsers.getById(data.userId);
    const newStory: Story = {
      id: genId('story'),
      publisherUID: data.userId,
      publisherUsername: author?.username || 'user',
      publisherNickname: author?.nickname || 'مستخدم',
      publisherProfileImage: author?.profileImage || '',
      mediaBase64: data.content,
      mediaMimeType: data.mediaType || 'text/plain',
      viewsCount: 0,
      viewers: [],
      createdAt: nowMs(),
    };
    stories.push(newStory);
    write(KEYS.STORIES, stories);
    return newStory;
  },
  view(storyId: string, viewerId: string): void {
    const stories = read<Story[]>(KEYS.STORIES, []);
    const idx = stories.findIndex(s => s.id === storyId);
    if (idx === -1) return;
    if (!stories[idx].viewers.includes(viewerId)) {
      stories[idx].viewers.push(viewerId);
      stories[idx].viewsCount = (stories[idx].viewsCount || 0) + 1;
      write(KEYS.STORIES, stories);
    }
  },
};

// ---- Follows ----
export const localFollows = {
  isFollowing(followerId: string, followingId: string): boolean {
    seedIfEmpty();
    return read<{followerId: string; followingId: string}[]>(KEYS.FOLLOWS, [])
      .some(f => f.followerId === followerId && f.followingId === followingId);
  },
  follow(followerId: string, followingId: string): void {
    const follows = read<{followerId: string; followingId: string; createdAt: string}[]>(KEYS.FOLLOWS, []);
    if (follows.some(f => f.followerId === followerId && f.followingId === followingId)) return;
    follows.push({ followerId, followingId, createdAt: new Date().toISOString() });
    write(KEYS.FOLLOWS, follows);
    const users = read<User[]>(KEYS.USERS, []);
    const fi = users.findIndex(u => u.uid === followerId);
    const ti = users.findIndex(u => u.uid === followingId);
    if (fi !== -1) users[fi].followingCount = (users[fi].followingCount || 0) + 1;
    if (ti !== -1) users[ti].followersCount = (users[ti].followersCount || 0) + 1;
    write(KEYS.USERS, users);
  },
  unfollow(followerId: string, followingId: string): void {
    const follows = read<{followerId: string; followingId: string; createdAt: string}[]>(KEYS.FOLLOWS, []);
    const filtered = follows.filter(f => !(f.followerId === followerId && f.followingId === followingId));
    write(KEYS.FOLLOWS, filtered);
    const users = read<User[]>(KEYS.USERS, []);
    const fi = users.findIndex(u => u.uid === followerId);
    const ti = users.findIndex(u => u.uid === followingId);
    if (fi !== -1) users[fi].followingCount = Math.max(0, (users[fi].followingCount || 0) - 1);
    if (ti !== -1) users[ti].followersCount = Math.max(0, (users[ti].followersCount || 0) - 1);
    write(KEYS.USERS, users);
  },
  getFollowers(uid: string): User[] {
    const follows = read<{followerId: string; followingId: string}[]>(KEYS.FOLLOWS, []);
    const ids = follows.filter(f => f.followingId === uid).map(f => f.followerId);
    return localUsers.getAll().filter(u => ids.includes(u.uid));
  },
  getFollowing(uid: string): User[] {
    const follows = read<{followerId: string; followingId: string}[]>(KEYS.FOLLOWS, []);
    const ids = follows.filter(f => f.followerId === uid).map(f => f.followingId);
    return localUsers.getAll().filter(u => ids.includes(u.uid));
  },
};

// ---- Notifications ----
export const localNotifications = {
  getByUser(uid: string): Notification[] {
    seedIfEmpty();
    return read<StoredNotification[]>(KEYS.NOTIFICATIONS, [])
      .filter(n => n.toUID === uid)
      .map(({ toUID, ...rest }) => rest as Notification)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
  markAsRead(id: string): void {
    const notifs = read<StoredNotification[]>(KEYS.NOTIFICATIONS, []);
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].isRead = true;
      write(KEYS.NOTIFICATIONS, notifs);
    }
  },
  markAllAsRead(uid: string): void {
    const notifs = read<StoredNotification[]>(KEYS.NOTIFICATIONS, []);
    notifs.forEach(n => { if (n.toUID === uid) n.isRead = true; });
    write(KEYS.NOTIFICATIONS, notifs);
  },
  create(data: { toUID: string; type: NotificationType; fromUID: string; fromUsername: string; content: string; postID?: string }): void {
    const notifs = read<StoredNotification[]>(KEYS.NOTIFICATIONS, []);
    const n: StoredNotification = {
      id: genId('notif'),
      type: data.type,
      fromUID: data.fromUID,
      fromUsername: data.fromUsername,
      fromProfileImage: '',
      postID: data.postID,
      content: data.content,
      isRead: false,
      createdAt: nowMs(),
      toUID: data.toUID,
    };
    notifs.push(n);
    write(KEYS.NOTIFICATIONS, notifs);
  },
};

// ---- Chat ----
export const localChat = {
  getRooms(userId: string): ChatRoom[] {
    seedIfEmpty();
    const messages = read<ChatMessage[]>(KEYS.CHAT_MESSAGES, []);
    // Find all unique partners
    const partnerIds = new Set<string>();
    messages.forEach(m => {
      if (m.senderUID === userId) partnerIds.add(m.receiverUID);
      if (m.receiverUID === userId) partnerIds.add(m.senderUID);
    });
    const rooms: ChatRoom[] = [];
    partnerIds.forEach(pid => {
      const partner = localUsers.getById(pid);
      if (!partner) return;
      const roomMessages = messages.filter(m =>
        (m.senderUID === userId && m.receiverUID === pid) ||
        (m.senderUID === pid && m.receiverUID === userId)
      ).sort((a, b) => a.createdAt - b.createdAt);
      const last = roomMessages[roomMessages.length - 1];
      const unread = roomMessages.filter(m => m.receiverUID === userId && !m.isRead).length;
      rooms.push({
        id: `room_${[userId, pid].sort().join('_')}`,
        participants: [userId, pid],
        lastMessage: last?.content || '',
        lastMessageTime: last?.createdAt || 0,
        unreadCount: unread,
        otherUser: partner,
      });
    });
    return rooms.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  },
  getMessages(otherUserId: string, currentUserId: string): ChatMessage[] {
    return read<ChatMessage[]>(KEYS.CHAT_MESSAGES, [])
      .filter(m =>
        (m.senderUID === currentUserId && m.receiverUID === otherUserId) ||
        (m.senderUID === otherUserId && m.receiverUID === currentUserId)
      )
      .sort((a, b) => a.createdAt - b.createdAt);
  },
  sendMessage(receiverId: string, senderId: string, content: string, type: MessageType = 'text'): ChatMessage {
    const msgs = read<ChatMessage[]>(KEYS.CHAT_MESSAGES, []);
    const newMsg: ChatMessage = {
      id: genId('msg'),
      senderUID: senderId,
      receiverUID: receiverId,
      content,
      messageType: type,
      isRead: false,
      createdAt: nowMs(),
    };
    msgs.push(newMsg);
    write(KEYS.CHAT_MESSAGES, msgs);
    return newMsg;
  },
};

// ---- Wallet ----
export const localWallet = {
  getByUser(uid: string): Wallet | null {
    seedIfEmpty();
    return read<Wallet[]>(KEYS.WALLETS, []).find(w => w.uid === uid) || null;
  },
  addTransaction(data: { userId: string; type: TransactionType; amount: number; currency: CurrencyType; description: string }): Transaction {
    const txs = read<Transaction[]>(KEYS.TRANSACTIONS, []);
    const tx: Transaction = {
      id: genId('tx'),
      userUID: data.userId,
      type: data.type,
      currency: data.currency,
      amount: data.amount,
      description: data.description,
      createdAt: nowMs(),
    };
    txs.push(tx);
    write(KEYS.TRANSACTIONS, txs);
    const wallets = read<Wallet[]>(KEYS.WALLETS, []);
    const idx = wallets.findIndex(w => w.uid === data.userId);
    if (idx !== -1) {
      const isCredit = data.type === 'earn' || data.type === 'bonus' || data.type === 'gift_receive' || data.type === 'refund';
      const isDebit = data.type === 'spend' || data.type === 'withdraw' || data.type === 'gift_send' || data.type === 'purchase';
      if (data.currency === 'coins') {
        if (isCredit) {
          wallets[idx].coinsBalance += data.amount;
          wallets[idx].totalCoinsEarned += data.amount;
        } else if (isDebit) {
          wallets[idx].coinsBalance = Math.max(0, wallets[idx].coinsBalance - data.amount);
          wallets[idx].totalCoinsSpent += data.amount;
        }
      } else {
        if (isCredit) {
          wallets[idx].diamondsBalance += data.amount;
          wallets[idx].totalDiamondsEarned += data.amount;
        } else if (isDebit) {
          wallets[idx].diamondsBalance = Math.max(0, wallets[idx].diamondsBalance - data.amount);
        }
      }
      write(KEYS.WALLETS, wallets);
      // also update user
      const users = read<User[]>(KEYS.USERS, []);
      const uidx = users.findIndex(u => u.uid === data.userId);
      if (uidx !== -1) {
        users[uidx].coinsBalance = wallets[idx].coinsBalance;
        users[uidx].diamondsBalance = wallets[idx].diamondsBalance;
        write(KEYS.USERS, users);
      }
    }
    return tx;
  },
  getTransactions(uid: string): Transaction[] {
    return read<Transaction[]>(KEYS.TRANSACTIONS, [])
      .filter(t => t.userUID === uid)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
};

// ---- Gifts ----
export const localGifts = {
  getAll(): GiftType[] {
    seedIfEmpty();
    return read<GiftType[]>(KEYS.GIFTS_TYPES, []);
  },
  send(data: { fromUserId: string; toUserId: string; giftId: string; liveStreamId?: string }): { success: boolean; error?: string } {
    const gifts = read<GiftType[]>(KEYS.GIFTS_TYPES, []);
    const gift = gifts.find(g => g.id === data.giftId);
    if (!gift) return { success: false, error: 'الهدية غير موجودة' };
    const wallet = localWallet.getByUser(data.fromUserId);
    if (!wallet || wallet.coinsBalance < gift.coinCost) {
      return { success: false, error: 'رصيدك غير كافٍ' };
    }
    localWallet.addTransaction({
      userId: data.fromUserId,
      type: 'gift_send',
      amount: gift.coinCost,
      currency: 'coins',
      description: `إرسال ${gift.nameAr}`,
    });
    localWallet.addTransaction({
      userId: data.toUserId,
      type: 'gift_receive',
      amount: gift.diamondValue,
      currency: 'diamonds',
      description: `استلام ${gift.nameAr}`,
    });
    const log = read<Gift[]>(KEYS.GIFTS_LOG, []);
    log.push({
      id: genId('gift_sent'),
      giftTypeId: data.giftId,
      giftType: gift,
      senderUID: data.fromUserId,
      receiverUID: data.toUserId,
      liveStreamID: data.liveStreamId,
      quantity: 1,
      message: '',
      createdAt: nowMs(),
    });
    write(KEYS.GIFTS_LOG, log);
    return { success: true };
  },
};

// ---- Live Streams ----
export const localLive = {
  getActive(): LiveStream[] {
    seedIfEmpty();
    return read<LiveStream[]>(KEYS.LIVE_STREAMS, [])
      .filter(s => s.status === 'live')
      .sort((a, b) => b.startedAt - a.startedAt);
  },
  create(data: { userId: string; title: string; description?: string }): LiveStream {
    const streams = read<LiveStream[]>(KEYS.LIVE_STREAMS, []);
    const s: LiveStream = {
      id: genId('live'),
      hostUID: data.userId,
      title: data.title,
      description: data.description || '',
      thumbnailBase64: '',
      category: 'general',
      viewerCount: 0,
      peakViewerCount: 0,
      likeCount: 0,
      giftsCoinsTotal: 0,
      status: 'live',
      isRecording: false,
      recordingUrl: '',
      startedAt: nowMs(),
    };
    streams.push(s);
    write(KEYS.LIVE_STREAMS, streams);
    return s;
  },
  end(streamId: string): void {
    const streams = read<LiveStream[]>(KEYS.LIVE_STREAMS, []);
    const idx = streams.findIndex(s => s.id === streamId);
    if (idx !== -1) {
      streams[idx].status = 'ended';
      streams[idx].endedAt = nowMs();
      write(KEYS.LIVE_STREAMS, streams);
    }
  },
};

// ---- Achievements ----
export const localAchievements = {
  getAll(): Achievement[] {
    seedIfEmpty();
    return read<Achievement[]>(KEYS.ACHIEVEMENTS, []);
  },
  getByUser(uid: string): UserAchievement[] {
    return read<UserAchievement[]>(KEYS.USER_ACHIEVEMENTS, [])
      .filter(ua => ua.userUID === uid);
  },
  award(uid: string, achievementId: string): void {
    const uas = read<UserAchievement[]>(KEYS.USER_ACHIEVEMENTS, []);
    if (uas.some(ua => ua.userUID === uid && ua.achievementID === achievementId)) return;
    uas.push({
      userUID: uid,
      achievementID: achievementId,
      progress: 100,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    });
    write(KEYS.USER_ACHIEVEMENTS, uas);
  },
};

// ---- Daily Rewards ----
export const localDailyRewards = {
  claim(uid: string): { day: number; coins: number; diamonds: number; error?: string } {
    const claimKey = `adendot_daily_${uid}`;
    const lastClaim = localStorage.getItem(claimKey);
    const today = new Date().toDateString();
    if (lastClaim === today) {
      return { day: 0, coins: 0, diamonds: 0, error: 'تم استلام المكافأة اليوم، عُد غداً' };
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let day = 1;
    if (lastClaim === yesterday.toDateString()) {
      const prevDay = parseInt(localStorage.getItem(`adendot_daily_day_${uid}`) || '0');
      day = Math.min(prevDay + 1, 7);
    }
    const coins = day * 10;
    const diamonds = day >= 3 ? Math.floor(day / 3) : 0;
    localStorage.setItem(claimKey, today);
    localStorage.setItem(`adendot_daily_day_${uid}`, String(day));
    localWallet.addTransaction({
      userId: uid,
      type: 'bonus',
      amount: coins,
      currency: 'coins',
      description: `مكافأة اليوم ${day}`,
    });
    if (diamonds > 0) {
      localWallet.addTransaction({
        userId: uid,
        type: 'bonus',
        amount: diamonds,
        currency: 'diamonds',
        description: `مكافأة اليوم ${day} (ماس)`,
      });
    }
    return { day, coins, diamonds };
  },
  getNextDay(uid: string): number {
    const claimKey = `adendot_daily_${uid}`;
    const lastClaim = localStorage.getItem(claimKey);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let day = 1;
    if (lastClaim === yesterday.toDateString()) {
      const prevDay = parseInt(localStorage.getItem(`adendot_daily_day_${uid}`) || '0');
      day = Math.min(prevDay + 1, 7);
    }
    return day;
  },
};

// ============ Health Check ============
export function isLocalMode(): boolean {
  return true;
}

export function getLocalStats(): { users: number; posts: number; comments: number; stories: number } {
  return {
    users: read<User[]>(KEYS.USERS, []).length,
    posts: read<Post[]>(KEYS.POSTS, []).length,
    comments: read<Comment[]>(KEYS.COMMENTS, []).length,
    stories: localStories.getActive().length,
  };
}
