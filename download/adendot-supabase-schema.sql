-- =============================================
-- Skyline Social Media App - Complete Database Schema
-- Supabase Project: ocjcbowrewenogrkexmr
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
  publisher_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  type TEXT DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'IMAGE', 'VIDEO', 'POLL', 'ARTICLE')),
  content TEXT DEFAULT '',
  media_base64 TEXT,
  media_mime_type TEXT DEFAULT '',
  description TEXT DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  comments_disabled BOOLEAN DEFAULT FALSE,
  favorites_disabled BOOLEAN DEFAULT FALSE,
  region TEXT DEFAULT '',
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. POST LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_uid)
);

-- =============================================
-- 4. POST FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_favorites (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_uid)
);

-- =============================================
-- 5. COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  publisher_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_liked_by_publisher BOOLEAN DEFAULT FALSE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  replies_count INTEGER DEFAULT 0,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- =============================================
-- 6. COMMENT LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_uid)
);

-- =============================================
-- 7. STORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publisher_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  media_base64 TEXT DEFAULT '',
  media_mime_type TEXT DEFAULT 'image/jpeg',
  views_count INTEGER DEFAULT 0,
  viewers TEXT[] DEFAULT '{}',
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- =============================================
-- 8. FOLLOWERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.followers (
  follower_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  followed_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_uid, followed_uid),
  CHECK (follower_uid != followed_uid)
);

-- =============================================
-- 9. CHAT ROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  participant_2 TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  last_message TEXT DEFAULT '',
  last_message_time BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (participant_1, participant_2)
);

-- =============================================
-- 10. CHAT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  media_base64 TEXT,
  media_mime_type TEXT DEFAULT '',
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'voice', 'gift', 'location', 'contact')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- =============================================
-- 11. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'gift', 'live_start', 'level_up', 'achievement', 'system')),
  from_uid TEXT,
  post_id UUID,
  content TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- =============================================
-- 12. GIFT TYPES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.gift_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT DEFAULT '',
  emoji TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  coin_cost INTEGER NOT NULL DEFAULT 10,
  diamond_value INTEGER DEFAULT 1,
  category TEXT DEFAULT 'basic' CHECK (category IN ('basic', 'premium', 'luxury', 'seasonal', 'exclusive')),
  animation_type TEXT DEFAULT 'float' CHECK (animation_type IN ('float', 'burst', 'rain', 'firework', 'heart_rain')),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 13. GIFTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_type_id UUID NOT NULL REFERENCES public.gift_types(id) ON DELETE CASCADE,
  sender_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  receiver_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  live_stream_id UUID,
  quantity INTEGER DEFAULT 1,
  message TEXT DEFAULT '',
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- =============================================
-- 14. LIVE STREAMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  thumbnail_base64 TEXT DEFAULT '',
  category TEXT DEFAULT '',
  viewer_count INTEGER DEFAULT 0,
  peak_viewer_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  gifts_coins_total INTEGER DEFAULT 0,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'ended', 'scheduled')),
  co_host_uid TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  is_recording BOOLEAN DEFAULT FALSE,
  recording_url TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  started_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  ended_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 15. LIVE STREAM VIEWERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.live_stream_viewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  joined_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  left_at BIGINT,
  watch_duration_seconds INTEGER DEFAULT 0,
  UNIQUE (stream_id, user_uid)
);

-- =============================================
-- 16. LIVE STREAM COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.live_stream_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- =============================================
-- 17. WALLETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.wallets (
  uid TEXT PRIMARY KEY REFERENCES public.users(uid) ON DELETE CASCADE,
  coins_balance INTEGER DEFAULT 100,
  diamonds_balance INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 100,
  total_diamonds_earned INTEGER DEFAULT 0,
  total_coins_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 18. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'earn', 'spend', 'withdraw', 'gift_send', 'gift_receive', 'bonus', 'refund')),
  currency TEXT NOT NULL CHECK (currency IN ('coins', 'diamonds')),
  amount INTEGER NOT NULL,
  description TEXT DEFAULT '',
  reference_id TEXT,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- =============================================
-- 19. ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  icon_emoji TEXT DEFAULT '',
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'social', 'content', 'live', 'gifts', 'streak')),
  requirement_value INTEGER DEFAULT 1,
  reward_coins INTEGER DEFAULT 0,
  reward_diamonds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 20. USER ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_uid, achievement_id)
);

-- =============================================
-- 21. DAILY REWARDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  coins_reward INTEGER DEFAULT 10,
  diamonds_reward INTEGER DEFAULT 0,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ
);

-- =============================================
-- 22. BLOCKED USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
  blocker_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  blocked_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_uid, blocked_uid)
);

-- =============================================
-- 23. REPORTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  reported_uid TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  reported_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'violence', 'nudity', 'hate_speech', 'misinformation', 'other')),
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 24. HASHTAGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag TEXT UNIQUE NOT NULL,
  posts_count INTEGER DEFAULT 0,
  trending_score REAL DEFAULT 0
);

-- =============================================
-- 25. COLLECTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_emoji TEXT DEFAULT '',
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 26. COLLECTION POSTS TABLE (join table)
-- =============================================
CREATE TABLE IF NOT EXISTS public.collection_posts (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, post_id)
);

-- =============================================
-- 27. POLLS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID UNIQUE NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_multi_choice BOOLEAN DEFAULT FALSE,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 28. POLL OPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  votes_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- =============================================
-- 29. POLL VOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.poll_votes (
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (option_id, user_uid)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_posts_publisher ON public.posts(publisher_uid);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_stories_publisher ON public.stories(publisher_uid);
CREATE INDEX IF NOT EXISTS idx_stories_created ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_followers_followed ON public.followers(followed_uid);
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_uid);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participants ON public.chat_rooms(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_uid, is_read);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver ON public.gifts(receiver_uid);
CREATE INDEX IF NOT EXISTS idx_gifts_sender ON public.gifts(sender_uid);
CREATE INDEX IF NOT EXISTS idx_live_streams_host ON public.live_streams(host_uid);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_uid);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_uid);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_uid);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Users can read all, update own
-- =============================================

-- Users: anyone can read, users can update their own row
CREATE POLICY "Users are readable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = uid) WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- Posts: anyone can read, authenticated users can insert/update own
CREATE POLICY "Posts are readable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid()::text = publisher_uid);

-- Post Likes: anyone can read, authenticated users can like
CREATE POLICY "Post likes are readable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (auth.uid()::text = user_uid);

-- Post Favorites: anyone can read, authenticated users can favorite
CREATE POLICY "Post favorites are readable by everyone" ON public.post_favorites FOR SELECT USING (true);
CREATE POLICY "Authenticated users can favorite posts" ON public.post_favorites FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can unfavorite posts" ON public.post_favorites FOR DELETE USING (auth.uid()::text = user_uid);

-- Comments: anyone can read, authenticated users can create
CREATE POLICY "Comments are readable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid()::text = publisher_uid);

-- Comment Likes
CREATE POLICY "Comment likes are readable by everyone" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like comments" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can unlike comments" ON public.comment_likes FOR DELETE USING (auth.uid()::text = user_uid);

-- Stories: anyone can read, authenticated users can create own
CREATE POLICY "Stories are readable by everyone" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create stories" ON public.stories FOR INSERT WITH CHECK (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can update own stories" ON public.stories FOR UPDATE USING (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can delete own stories" ON public.stories FOR DELETE USING (auth.uid()::text = publisher_uid);

-- Followers: anyone can read, users can follow/unfollow
CREATE POLICY "Followers are readable by everyone" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow" ON public.followers FOR INSERT WITH CHECK (auth.uid()::text = follower_uid);
CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid()::text = follower_uid);

-- Chat Rooms: participants can read/manage
CREATE POLICY "Chat rooms visible to participants" ON public.chat_rooms FOR SELECT USING (auth.uid()::text = participant_1 OR auth.uid()::text = participant_2);
CREATE POLICY "Authenticated users can create chat rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid()::text = participant_1 OR auth.uid()::text = participant_2);
CREATE POLICY "Participants can update chat rooms" ON public.chat_rooms FOR UPDATE USING (auth.uid()::text = participant_1 OR auth.uid()::text = participant_2);

-- Chat Messages: room participants can read/send
CREATE POLICY "Chat messages visible to room participants" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_rooms WHERE chat_rooms.id = chat_messages.room_id AND (chat_rooms.participant_1 = auth.uid()::text OR chat_rooms.participant_2 = auth.uid()::text))
);
CREATE POLICY "Authenticated users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid()::text = sender_uid);
CREATE POLICY "Users can update messages in their rooms" ON public.chat_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.chat_rooms WHERE chat_rooms.id = chat_messages.room_id AND (chat_rooms.participant_1 = auth.uid()::text OR chat_rooms.participant_2 = auth.uid()::text))
);

-- Notifications: users can read own, system can insert
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid()::text = user_uid);

-- Gift Types: anyone can read
CREATE POLICY "Gift types are readable by everyone" ON public.gift_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage gift types" ON public.gift_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update gift types" ON public.gift_types FOR UPDATE USING (true);

-- Gifts: anyone can read, authenticated can send
CREATE POLICY "Gifts are readable by everyone" ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send gifts" ON public.gifts FOR INSERT WITH CHECK (auth.uid()::text = sender_uid);

-- Live Streams: anyone can read, authenticated can create
CREATE POLICY "Live streams are readable by everyone" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create streams" ON public.live_streams FOR INSERT WITH CHECK (auth.uid()::text = host_uid);
CREATE POLICY "Hosts can update own streams" ON public.live_streams FOR UPDATE USING (auth.uid()::text = host_uid);
CREATE POLICY "Hosts can end own streams" ON public.live_streams FOR DELETE USING (auth.uid()::text = host_uid);

-- Live Stream Viewers
CREATE POLICY "Stream viewers readable by everyone" ON public.live_stream_viewers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join streams" ON public.live_stream_viewers FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can update own viewer record" ON public.live_stream_viewers FOR UPDATE USING (auth.uid()::text = user_uid);

-- Live Stream Comments
CREATE POLICY "Stream comments readable by everyone" ON public.live_stream_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment on streams" ON public.live_stream_comments FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

-- Wallets: users can read own
CREATE POLICY "Users can read own wallet" ON public.wallets FOR SELECT USING (auth.uid()::text = uid);
CREATE POLICY "System can update wallets" ON public.wallets FOR UPDATE USING (true);
CREATE POLICY "System can create wallets" ON public.wallets FOR INSERT WITH CHECK (true);

-- Transactions: users can read own
CREATE POLICY "Users can read own transactions" ON public.transactions FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System can create transactions" ON public.transactions FOR INSERT WITH CHECK (true);

-- Achievements: anyone can read
CREATE POLICY "Achievements are readable by everyone" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "System can manage achievements" ON public.achievements FOR INSERT WITH CHECK (true);

-- User Achievements: users can read own
CREATE POLICY "Users can read own achievements" ON public.user_achievements FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System can update achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update achievement progress" ON public.user_achievements FOR UPDATE USING (true);

-- Daily Rewards: users can read own
CREATE POLICY "Users can read own daily rewards" ON public.daily_rewards FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System can manage daily rewards" ON public.daily_rewards FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can claim own rewards" ON public.daily_rewards FOR UPDATE USING (auth.uid()::text = user_uid);

-- Blocked Users: users can read own blocks
CREATE POLICY "Users can read own blocks" ON public.blocked_users FOR SELECT USING (auth.uid()::text = blocker_uid);
CREATE POLICY "Users can block others" ON public.blocked_users FOR INSERT WITH CHECK (auth.uid()::text = blocker_uid);
CREATE POLICY "Users can unblock" ON public.blocked_users FOR DELETE USING (auth.uid()::text = blocker_uid);

-- Reports: users can create reports, admins can read
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid()::text = reporter_uid);
CREATE POLICY "Users can read own reports" ON public.reports FOR SELECT USING (auth.uid()::text = reporter_uid);

-- Hashtags: anyone can read
CREATE POLICY "Hashtags are readable by everyone" ON public.hashtags FOR SELECT USING (true);
CREATE POLICY "System can manage hashtags" ON public.hashtags FOR INSERT WITH CHECK (true);

-- Collections: users can read own, anyone can read public
CREATE POLICY "Collections readable by owner or public" ON public.collections FOR SELECT USING (auth.uid()::text = user_uid OR is_private = false);
CREATE POLICY "Users can create collections" ON public.collections FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can update own collections" ON public.collections FOR UPDATE USING (auth.uid()::text = user_uid);
CREATE POLICY "Users can delete own collections" ON public.collections FOR DELETE USING (auth.uid()::text = user_uid);

-- Collection Posts
CREATE POLICY "Collection posts readable with collection" ON public.collection_posts FOR SELECT USING (true);
CREATE POLICY "Users can add to own collections" ON public.collection_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove from own collections" ON public.collection_posts FOR DELETE USING (true);

-- Polls
CREATE POLICY "Polls readable by everyone" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create polls" ON public.polls FOR INSERT WITH CHECK (true);

-- Poll Options
CREATE POLICY "Poll options readable by everyone" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "System can create poll options" ON public.poll_options FOR INSERT WITH CHECK (true);

-- Poll Votes
CREATE POLICY "Poll votes readable by everyone" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

-- =============================================
-- DATABASE FUNCTIONS
-- =============================================

-- Function to increment post views
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void AS $$
  UPDATE public.posts SET views_count = views_count + 1 WHERE id = post_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to increment stream viewers
CREATE OR REPLACE FUNCTION public.increment_stream_viewers(stream_id UUID)
RETURNS void AS $$
  UPDATE public.live_streams SET viewer_count = viewer_count + 1, peak_viewer_count = GREATEST(peak_viewer_count, viewer_count + 1) WHERE id = stream_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to increment stream likes
CREATE OR REPLACE FUNCTION public.increment_stream_likes(stream_id UUID)
RETURNS void AS $$
  UPDATE public.live_streams SET like_count = like_count + 1 WHERE id = stream_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to increment stream gifts
CREATE OR REPLACE FUNCTION public.increment_stream_gifts(stream_id UUID, amount INTEGER)
RETURNS void AS $$
  UPDATE public.live_streams SET gifts_coins_total = gifts_coins_total + amount WHERE id = stream_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to handle new user creation (auto-create wallet)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (uid, email, username, nickname, is_email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'User'),
    NEW.email_confirmed_at IS NOT NULL
  );
  INSERT INTO public.wallets (uid, coins_balance, diamonds_balance)
  VALUES (NEW.id, 100, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create user profile and wallet on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to update posts_count when post is created/deleted
CREATE OR REPLACE FUNCTION public.update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users SET posts_count = posts_count + 1 WHERE uid = NEW.publisher_uid;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users SET posts_count = GREATEST(posts_count - 1, 0) WHERE uid = OLD.publisher_uid;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_posts_count ON public.posts;
CREATE TRIGGER update_posts_count
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_user_posts_count();

-- Function to update followers/following counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users SET following_count = following_count + 1 WHERE uid = NEW.follower_uid;
    UPDATE public.users SET followers_count = followers_count + 1 WHERE uid = NEW.followed_uid;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users SET following_count = GREATEST(following_count - 1, 0) WHERE uid = OLD.follower_uid;
    UPDATE public.users SET followers_count = GREATEST(followers_count - 1, 0) WHERE uid = OLD.followed_uid;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_follow_counts ON public.followers;
CREATE TRIGGER update_follow_counts
  AFTER INSERT OR DELETE ON public.followers
  FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- Function to update likes_count on posts
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_post_likes_count ON public.post_likes;
CREATE TRIGGER update_post_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- Function to update comments_count on posts
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_post_comments_count ON public.comments;
CREATE TRIGGER update_post_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- =============================================
-- SEED DATA: Default Gift Types
-- =============================================
INSERT INTO public.gift_types (name, name_ar, emoji, coin_cost, diamond_value, category, animation_type, sort_order) VALUES
  ('Rose', 'وردة', '🌹', 10, 1, 'basic', 'float', 1),
  ('Heart', 'قلب', '❤️', 20, 2, 'basic', 'float', 2),
  ('Star', 'نجمة', '⭐', 50, 5, 'basic', 'burst', 3),
  ('Crown', 'تاج', '👑', 100, 10, 'premium', 'firework', 4),
  ('Diamond', 'ألماسة', '💎', 200, 20, 'premium', 'firework', 5),
  ('Rocket', 'صاروخ', '🚀', 500, 50, 'luxury', 'burst', 6),
  ('Castle', 'قصر', '🏰', 1000, 100, 'luxury', 'firework', 7),
  ('Dragon', 'تنين', '🐉', 2000, 200, 'exclusive', 'heart_rain', 8),
  ('Unicorn', 'يونيكورن', '🦄', 5000, 500, 'exclusive', 'heart_rain', 9),
  ('Galaxy', 'مجرة', '🌌', 10000, 1000, 'exclusive', 'rain', 10)
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED DATA: Default Achievements
-- =============================================
INSERT INTO public.achievements (code, name, name_ar, description, description_ar, icon_emoji, category, requirement_value, reward_coins, reward_diamonds) VALUES
  ('first_post', 'First Post', 'أول منشور', 'Create your first post', 'أنشئ أول منشور لك', '📝', 'content', 1, 50, 0),
  ('ten_posts', 'Content Creator', 'صانع محتوى', 'Create 10 posts', 'أنشئ 10 منشورات', '✍️', 'content', 10, 200, 5),
  ('hundred_posts', 'Post Master', 'سيد المنشورات', 'Create 100 posts', 'أنشئ 100 منشور', '🏆', 'content', 100, 1000, 50),
  ('first_follower', 'Getting Noticed', 'جذب الانتباه', 'Get your first follower', 'احصل على أول متابع', '👋', 'social', 1, 25, 0),
  ('fifty_followers', 'Popular', 'مشهور', 'Get 50 followers', 'احصل على 50 متابع', '🌟', 'social', 50, 500, 20),
  ('thousand_followers', 'Influencer', 'مؤثر', 'Get 1000 followers', 'احصل على 1000 متابع', '💯', 'social', 1000, 5000, 200),
  ('first_gift', 'First Gift', 'أول هدية', 'Receive your first gift', 'استلم أول هدية', '🎁', 'gifts', 1, 30, 1),
  ('hundred_gifts', 'Gift Magnet', 'مغناطيس الهدايا', 'Receive 100 gifts', 'استلم 100 هدية', '🧲', 'gifts', 100, 2000, 100),
  ('first_stream', 'Going Live', 'بث مباشر', 'Start your first live stream', 'ابدأ أول بث مباشر', '📹', 'live', 1, 100, 5),
  ('stream_star', 'Stream Star', 'نجم البث', 'Get 100 viewers in a stream', 'احصل على 100 مشاهد في بث', '⭐', 'live', 100, 3000, 150),
  ('daily_streak_7', 'Weekly Warrior', 'محارب أسبوعي', 'Login 7 days in a row', 'سجل دخولك 7 أيام متتالية', '🔥', 'streak', 7, 300, 10),
  ('daily_streak_30', 'Monthly Master', 'سيد الشهر', 'Login 30 days in a row', 'سجل دخولك 30 يوماً متتالياً', '💪', 'streak', 30, 2000, 100)
ON CONFLICT DO NOTHING;

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_stream_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;

