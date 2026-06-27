-- =============================================
-- Aden Dot - Complete Supabase Database Schema
-- Version: 2.0 - Production Ready
-- =============================================
-- 
-- تعليمات التطبيق:
-- 1. اذهب إلى supabase.com وأنشئ مشروع جديد
-- 2. اذهب إلى SQL Editor
-- 3. انسخ والصق هذا الملف بالكامل
-- 4. اضغط Run
-- 5. اذهب إلى Project Settings → API
-- 6. انسخ Project URL و anon public key
-- 7. أدخلها في شاشة إعداد التطبيق
--
-- مهم: تأكد من تفعيل Email Auth في:
-- Authentication → Providers → Email → Enable
-- وألغِ تفعيل "Confirm email" إذا كنت لا تريد تأكيد البريد
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  nickname TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  gender TEXT DEFAULT 'unspecified' CHECK (gender IN ('male', 'female', 'unspecified')),
  profile_image TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'supporter')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  region TEXT DEFAULT '',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  popularity INTEGER DEFAULT 0,
  gifts_count INTEGER DEFAULT 0,
  subscribers INTEGER DEFAULT 0,
  coins_balance INTEGER DEFAULT 100,
  diamonds_balance INTEGER DEFAULT 0,
  is_profile_complete BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  join_date TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
  last_seen BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  images TEXT[] DEFAULT '{}',
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'repost')),
  tags TEXT[] DEFAULT '{}',
  location TEXT DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  gifts_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. POST LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, uid)
);

-- =============================================
-- 5. POST FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, uid)
);

-- =============================================
-- 6. COMMENT LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, uid)
);

-- =============================================
-- 7. FOLLOWERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  following_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_uid, following_uid)
);

-- =============================================
-- 8. STORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  media_url TEXT NOT NULL DEFAULT '',
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT DEFAULT '',
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. STORY VIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, uid)
);

-- =============================================
-- 10. CHAT ROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT '',
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  avatar TEXT DEFAULT '',
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  members_count INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. CHAT ROOM MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, uid)
);

-- =============================================
-- 12. CHAT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'gift', 'system', 'voice')),
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 13. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  from_uid TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('like', 'comment', 'follow', 'gift', 'mention', 'system', 'achievement', 'level_up', 'live_start', 'revenue')),
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 14. GIFT TYPES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.gift_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  animation_url TEXT DEFAULT '',
  category TEXT DEFAULT 'basic' CHECK (category IN ('basic', 'premium', 'luxury', 'special', 'seasonal')),
  coin_price INTEGER NOT NULL DEFAULT 10,
  diamond_price INTEGER DEFAULT 0,
  animation_type TEXT DEFAULT 'none' CHECK (animation_type IN ('none', 'float', 'burst', 'rain', 'firework', 'heart')),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 15. GIFTS (SENT) TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_type_id UUID NOT NULL REFERENCES public.gift_types(id) ON DELETE CASCADE,
  from_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  to_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  coin_value INTEGER NOT NULL DEFAULT 0,
  diamond_value INTEGER DEFAULT 0,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 16. LIVE STREAMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  status TEXT DEFAULT 'ended' CHECK (status IN ('live', 'ended', 'paused')),
  viewers_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  gifts_count INTEGER DEFAULT 0,
  diamonds_earned INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- =============================================
-- 17. LIVE STREAM COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.live_stream_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 18. WALLETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.wallets (
  uid TEXT PRIMARY KEY REFERENCES public.users(uid) ON DELETE CASCADE,
  coins_balance INTEGER DEFAULT 100,
  diamonds_balance INTEGER DEFAULT 0,
  total_earned_coins INTEGER DEFAULT 0,
  total_earned_diamonds INTEGER DEFAULT 0,
  total_spent_coins INTEGER DEFAULT 0,
  total_spent_diamonds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 19. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'purchase', 'gift_sent', 'gift_received', 'reward', 'refund', 'earning', 'admin_adjust')),
  currency TEXT DEFAULT 'coins' CHECK (currency IN ('coins', 'diamonds')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  reference_id TEXT DEFAULT '',
  reference_type TEXT DEFAULT '' CHECK (reference_type IN ('', 'gift', 'post', 'live_stream', 'purchase', 'daily_reward', 'achievement', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 20. ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon_url TEXT DEFAULT '',
  category TEXT DEFAULT 'social' CHECK (category IN ('social', 'content', 'engagement', 'revenue', 'streak', 'special')),
  requirement_type TEXT NOT NULL DEFAULT 'count',
  requirement_value INTEGER NOT NULL DEFAULT 1,
  reward_coins INTEGER DEFAULT 0,
  reward_diamonds INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 21. USER ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(uid, achievement_id)
);

-- =============================================
-- 22. DAILY REWARDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  coins_reward INTEGER DEFAULT 10,
  diamonds_reward INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 5,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  reward_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(uid, reward_date)
);

-- =============================================
-- 23. REPORTS TABLE (for admin)
-- =============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  reported_uid TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  reported_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  reason TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  resolution TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 24. APP CONFIG TABLE (for admin settings)
-- =============================================
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 25. USER BLOCKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  blocked_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_uid, blocked_uid)
);

-- =============================================
-- INDEXES for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_posts_uid ON public.posts(uid);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_uid ON public.comments(uid);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_uid ON public.post_likes(uid);
CREATE INDEX IF NOT EXISTS idx_post_favorites_uid ON public.post_favorites(uid);
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_uid);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_uid);
CREATE INDEX IF NOT EXISTS idx_stories_uid ON public.stories(uid);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_uid ON public.chat_room_members(uid);
CREATE INDEX IF NOT EXISTS idx_notifications_uid ON public.notifications(uid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(uid, is_read);
CREATE INDEX IF NOT EXISTS idx_gifts_to_uid ON public.gifts(to_uid);
CREATE INDEX IF NOT EXISTS idx_gifts_from_uid ON public.gifts(from_uid);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams(status);
CREATE INDEX IF NOT EXISTS idx_transactions_uid ON public.transactions(uid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_uid ON public.user_achievements(uid);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_uid ON public.daily_rewards(uid);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, users can update their own profile
CREATE POLICY "Users are publicly readable" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = uid);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- Posts: anyone can read, authenticated users can create/update/delete own
CREATE POLICY "Posts are publicly readable" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid()::text = uid);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid()::text = uid OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));

-- Comments: anyone can read, authenticated users can create/delete own
CREATE POLICY "Comments are publicly readable" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid()::text = uid OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));

-- Post Likes: anyone can read, authenticated users can like/unlike
CREATE POLICY "Post likes are publicly readable" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Users can unlike own likes" ON public.post_likes FOR DELETE USING (auth.uid()::text = uid);

-- Post Favorites: anyone can read, authenticated users can favorite
CREATE POLICY "Post favorites are publicly readable" ON public.post_favorites FOR SELECT USING (true);
CREATE POLICY "Authenticated users can favorite posts" ON public.post_favorites FOR INSERT WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Users can unfavorite" ON public.post_favorites FOR DELETE USING (auth.uid()::text = uid);

-- Comment Likes: anyone can read, authenticated users can like
CREATE POLICY "Comment likes are publicly readable" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like comments" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Users can unlike comments" ON public.comment_likes FOR DELETE USING (auth.uid()::text = uid);

-- Followers: anyone can read, authenticated users can follow/unfollow
CREATE POLICY "Followers are publicly readable" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow" ON public.followers FOR INSERT WITH CHECK (auth.uid()::text = follower_uid);
CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid()::text = follower_uid);

-- Stories: anyone can read, authenticated users can create/delete own
CREATE POLICY "Stories are publicly readable" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create stories" ON public.stories FOR INSERT WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Users can delete own stories" ON public.stories FOR DELETE USING (auth.uid()::text = uid);

-- Story Views: anyone can read, authenticated users can create
CREATE POLICY "Story views are publicly readable" ON public.story_views FOR SELECT USING (true);
CREATE POLICY "Authenticated users can view stories" ON public.story_views FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- Chat Rooms: members can read, authenticated users can create
CREATE POLICY "Chat rooms readable by members" ON public.chat_rooms FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = id AND uid = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Authenticated users can create chat rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Members can update chat rooms" ON public.chat_rooms FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = id AND uid = auth.uid()::text AND role IN ('admin', 'owner'))
);

-- Chat Room Members: members can read, authenticated users can join
CREATE POLICY "Members can see room members" ON public.chat_room_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_room_members crm WHERE crm.room_id = room_id AND crm.uid = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Authenticated users can join rooms" ON public.chat_room_members FOR INSERT WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Users can leave rooms" ON public.chat_room_members FOR DELETE USING (auth.uid()::text = uid);

-- Chat Messages: members can read, members can create
CREATE POLICY "Members can read messages" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = chat_messages.room_id AND uid = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Members can send messages" ON public.chat_messages FOR INSERT WITH CHECK (
  auth.uid()::text = uid AND
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = chat_messages.room_id AND uid = auth.uid()::text)
);
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING (
  auth.uid()::text = uid OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
);

-- Notifications: users can read their own
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (uid = auth.uid()::text);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (uid = auth.uid()::text);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (uid = auth.uid()::text);

-- Gift Types: anyone can read
CREATE POLICY "Gift types are publicly readable" ON public.gift_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage gift types" ON public.gift_types FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
);

-- Gifts: anyone can read, authenticated users can send
CREATE POLICY "Gifts are publicly readable" ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send gifts" ON public.gifts FOR INSERT WITH CHECK (auth.uid()::text = from_uid);

-- Live Streams: anyone can read, authenticated users can create
CREATE POLICY "Live streams are publicly readable" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create streams" ON public.live_streams FOR INSERT WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Streamers can update own streams" ON public.live_streams FOR UPDATE USING (auth.uid()::text = uid OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));

-- Live Stream Comments: anyone can read, authenticated users can comment
CREATE POLICY "Live stream comments are readable" ON public.live_stream_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment on streams" ON public.live_stream_comments FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- Wallets: users can read their own wallet
CREATE POLICY "Users can read own wallet" ON public.wallets FOR SELECT USING (uid = auth.uid()::text OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (uid = auth.uid()::text);
CREATE POLICY "System creates wallets" ON public.wallets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Transactions: users can read their own
CREATE POLICY "Users can read own transactions" ON public.transactions FOR SELECT USING (uid = auth.uid()::text OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));
CREATE POLICY "System creates transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Achievements: anyone can read
CREATE POLICY "Achievements are publicly readable" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
);

-- User Achievements: users can read their own
CREATE POLICY "Users can read own achievements" ON public.user_achievements FOR SELECT USING (uid = auth.uid()::text OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));
CREATE POLICY "System manages user achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Daily Rewards: users can read their own
CREATE POLICY "Users can read own rewards" ON public.daily_rewards FOR SELECT USING (uid = auth.uid()::text);
CREATE POLICY "System manages daily rewards" ON public.daily_rewards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can claim rewards" ON public.daily_rewards FOR UPDATE USING (uid = auth.uid()::text);

-- Reports: users can create, admins can read all
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid()::text = reporter_uid);
CREATE POLICY "Users can read own reports" ON public.reports FOR SELECT USING (
  reporter_uid = auth.uid()::text OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
);

-- App Config: anyone can read, admins can manage
CREATE POLICY "App config is publicly readable" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage app config" ON public.app_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
);

-- User Blocks: users can manage their blocks
CREATE POLICY "Users can read own blocks" ON public.user_blocks FOR SELECT USING (blocker_uid = auth.uid()::text);
CREATE POLICY "Users can block others" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid()::text = blocker_uid);
CREATE POLICY "Users can unblock" ON public.user_blocks FOR DELETE USING (auth.uid()::text = blocker_uid);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON public.chat_rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-increment posts_count when a post is created
CREATE OR REPLACE FUNCTION public.increment_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET posts_count = posts_count + 1 WHERE uid = NEW.uid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_posts_count AFTER INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.increment_posts_count();

-- Auto-decrement posts_count when a post is deleted
CREATE OR REPLACE FUNCTION public.decrement_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET posts_count = GREATEST(posts_count - 1, 0) WHERE uid = NEW.uid;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_posts_count AFTER DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.decrement_posts_count();

-- Auto-increment likes_count when a post is liked
CREATE OR REPLACE FUNCTION public.increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_post_likes AFTER INSERT ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.increment_post_likes();

-- Auto-decrement likes_count when a post is unliked
CREATE OR REPLACE FUNCTION public.decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_post_likes AFTER DELETE ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.decrement_post_likes();

-- Auto-increment comments_count
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_comments_count AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.increment_comments_count();

-- Auto-increment followers_count when someone follows
CREATE OR REPLACE FUNCTION public.increment_followers()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET following_count = following_count + 1 WHERE uid = NEW.follower_uid;
  UPDATE public.users SET followers_count = followers_count + 1 WHERE uid = NEW.following_uid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_followers AFTER INSERT ON public.followers FOR EACH ROW EXECUTE FUNCTION public.increment_followers();

-- Auto-decrement followers_count when someone unfollows
CREATE OR REPLACE FUNCTION public.decrement_followers()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET following_count = GREATEST(following_count - 1, 0) WHERE uid = OLD.follower_uid;
  UPDATE public.users SET followers_count = GREATEST(followers_count - 1, 0) WHERE uid = OLD.following_uid;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_followers AFTER DELETE ON public.followers FOR EACH ROW EXECUTE FUNCTION public.decrement_followers();

-- =============================================
-- SEED DATA - Default Gift Types
-- =============================================
INSERT INTO public.gift_types (name, image_url, category, coin_price, diamond_price, animation_type, sort_order) VALUES
  ('وردة', '🌹', 'basic', 10, 0, 'float', 1),
  ('قلب', '❤️', 'basic', 20, 0, 'heart', 2),
  ('نجمة', '⭐', 'basic', 50, 0, 'burst', 3),
  ('ألماسة', '💎', 'premium', 100, 1, 'float', 4),
  ('تاج', '👑', 'luxury', 500, 5, 'firework', 5),
  ('روcket', '🚀', 'premium', 200, 2, 'burst', 6),
  ('نمر', '🐯', 'luxury', 1000, 10, 'rain', 7),
  ('قلعة', '🏰', 'special', 2000, 20, 'firework', 8),
  ('كوكب', '🪐', 'special', 5000, 50, 'rain', 9),
  ('تنين', '🐉', 'seasonal', 10000, 100, 'firework', 10)
ON CONFLICT DO NOTHING;

-- Seed Achievements
INSERT INTO public.achievements (name, description, icon_url, category, requirement_type, requirement_value, reward_coins, reward_xp) VALUES
  ('العضو الجديد', 'أكمل ملفك الشخصي', '🌟', 'social', 'profile_complete', 1, 50, 10),
  ('كاتب محترف', 'انشر 10 منشورات', '✍️', 'content', 'posts_count', 10, 100, 25),
  ('نجم التواصل', 'احصل على 100 متابع', '⭐', 'social', 'followers_count', 100, 200, 50),
  ('محب للخير', 'أرسل 50 هدية', '🎁', 'engagement', 'gifts_sent', 50, 150, 30),
  ('مبدع', 'احصل على 500 إعجاب', '💡', 'content', 'likes_received', 500, 300, 75),
  ('صاحب البث', 'ابث 10 مرات', '📺', 'engagement', 'streams_count', 10, 250, 60),
  ('مغامر', 'سجل دخولك 30 يوماً متتالياً', '🔥', 'streak', 'login_streak', 30, 500, 100),
  ('ثري', 'اجمع 10000 عملة ذهبية', '💰', 'revenue', 'total_coins', 10000, 0, 200)
ON CONFLICT DO NOTHING;

-- Seed App Config
INSERT INTO public.app_config (key, value, description) VALUES
  ('app_version', '"2.0.0"', 'Current app version'),
  ('maintenance_mode', 'false', 'Maintenance mode flag'),
  ('max_post_length', '2000', 'Maximum post content length'),
  ('daily_coins_reward', '10', 'Daily login coins reward'),
  ('min_withdrawal_diamonds', '100', 'Minimum diamonds for withdrawal'),
  ('gift_commission_rate', '0.3', 'Commission rate for gifts (0-1)'),
  ('welcome_coins', '100', 'Welcome bonus coins for new users')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- =============================================
-- Enable realtime for chat messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_stream_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
