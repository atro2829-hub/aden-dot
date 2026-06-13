-- ============================================
-- Skyline Social Media - Complete Database Schema
-- Version 2.0 - With Live Streaming, Gifts, Wallets
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  nickname TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  gender TEXT DEFAULT 'unspecified' CHECK (gender IN ('male', 'female', 'unspecified')),
  profile_image TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'supporter')),
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  region TEXT DEFAULT '',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  popularity INTEGER DEFAULT 0,
  gifts_count INTEGER DEFAULT 0,
  subscribers INTEGER DEFAULT 0,
  coins_balance INTEGER DEFAULT 0,
  diamonds_balance INTEGER DEFAULT 0,
  is_profile_complete BOOLEAN DEFAULT false,
  is_email_verified BOOLEAN DEFAULT false,
  join_date TIMESTAMPTZ DEFAULT now(),
  last_seen BIGINT DEFAULT extract(epoch from now()) * 1000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  publisher_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('TEXT', 'IMAGE', 'VIDEO', 'POLL', 'ARTICLE')),
  content TEXT DEFAULT '',
  media_base64 TEXT DEFAULT '',
  media_mime_type TEXT DEFAULT '',
  description TEXT DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_liked BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  comments_disabled BOOLEAN DEFAULT false,
  favorites_disabled BOOLEAN DEFAULT false,
  region TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  created_at BIGINT DEFAULT extract(epoch from now()) * 1000,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. POST LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_likes (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (post_id, user_uid)
);

-- ============================================
-- 4. POST FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_favorites (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (post_id, user_uid)
);

-- ============================================
-- 5. COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  publisher_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_liked_by_publisher BOOLEAN DEFAULT false,
  parent_comment_id TEXT,
  replies_count INTEGER DEFAULT 0,
  created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- ============================================
-- 6. COMMENT LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (comment_id, user_uid)
);

-- ============================================
-- 7. STORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  publisher_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  media_base64 TEXT DEFAULT '',
  media_mime_type TEXT DEFAULT '',
  views_count INTEGER DEFAULT 0,
  viewers TEXT[] DEFAULT '{}',
  created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- ============================================
-- 8. FOLLOWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS followers (
  follower_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  followed_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_uid, followed_uid),
  CHECK (follower_uid != followed_uid)
);

-- ============================================
-- 9. CHAT ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  participant_1 TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  participant_2 TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  last_message TEXT DEFAULT '',
  last_message_time BIGINT DEFAULT extract(epoch from now()) * 1000,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- ============================================
-- 10. CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  room_id TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  media_base64 TEXT DEFAULT '',
  media_mime_type TEXT DEFAULT '',
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'voice', 'gift', 'location', 'contact')),
  is_read BOOLEAN DEFAULT false,
  created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- ============================================
-- 11. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'gift', 'live_start', 'level_up', 'achievement', 'system')),
  from_uid TEXT REFERENCES users(uid) ON DELETE SET NULL,
  post_id TEXT,
  content TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- ============================================
-- 12. GIFT TYPES TABLE (Gift Shop Catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS gift_types (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  name_ar TEXT DEFAULT '',
  emoji TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  coin_cost INTEGER NOT NULL DEFAULT 10,
  diamond_value INTEGER NOT NULL DEFAULT 1,
  category TEXT DEFAULT 'basic' CHECK (category IN ('basic', 'premium', 'luxury', 'seasonal', 'exclusive')),
  animation_type TEXT DEFAULT 'float' CHECK (animation_type IN ('float', 'burst', 'rain', 'firework', 'heart_rain')),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 13. GIFTS TABLE (Sent/Received Gifts)
-- ============================================
CREATE TABLE IF NOT EXISTS gifts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  gift_type_id TEXT NOT NULL REFERENCES gift_types(id),
  sender_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  receiver_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  post_id TEXT REFERENCES posts(id) ON DELETE SET NULL,
  live_stream_id TEXT,
  quantity INTEGER DEFAULT 1,
  message TEXT DEFAULT '',
  created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- ============================================
-- 14. LIVE STREAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS live_streams (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  host_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  thumbnail_base64 TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  viewer_count INTEGER DEFAULT 0,
  peak_viewer_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  gifts_coins_total INTEGER DEFAULT 0,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'ended', 'scheduled')),
  co_host_uid TEXT REFERENCES users(uid),
  is_recording BOOLEAN DEFAULT false,
  recording_url TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  started_at BIGINT DEFAULT extract(epoch from now()) * 1000,
  ended_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 15. LIVE STREAM VIEWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS live_stream_viewers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  stream_id TEXT NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  joined_at BIGINT DEFAULT extract(epoch from now()) * 1000,
  left_at BIGINT,
  watch_duration_seconds INTEGER DEFAULT 0,
  UNIQUE(stream_id, user_uid)
);

-- ============================================
-- 16. LIVE STREAM COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS live_stream_comments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  stream_id TEXT NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- ============================================
-- 17. WALLETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wallets (
  uid TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  coins_balance INTEGER DEFAULT 0,
  diamonds_balance INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 0,
  total_diamonds_earned INTEGER DEFAULT 0,
  total_coins_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 18. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'earn', 'spend', 'withdraw', 'gift_send', 'gift_receive', 'bonus', 'refund')),
  currency TEXT NOT NULL CHECK (currency IN ('coins', 'diamonds')),
  amount INTEGER NOT NULL,
  description TEXT DEFAULT '',
  reference_id TEXT,
  created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- ============================================
-- 19. ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 20. USER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_uid, achievement_id)
);

-- ============================================
-- 21. DAILY REWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_rewards (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  coins_reward INTEGER DEFAULT 10,
  diamonds_reward INTEGER DEFAULT 0,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 22. POLLS TABLE (For Post Type = POLL)
-- ============================================
CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_multi_choice BOOLEAN DEFAULT false,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 23. POLL OPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS poll_options (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  votes_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- ============================================
-- 24. POLL VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS poll_votes (
  poll_option_id TEXT NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (poll_option_id, user_uid)
);

-- ============================================
-- 25. BLOCKED USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  blocked_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (blocker_uid, blocked_uid)
);

-- ============================================
-- 26. REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  reporter_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  reported_uid TEXT REFERENCES users(uid) ON DELETE CASCADE,
  reported_post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'violence', 'nudity', 'hate_speech', 'misinformation', 'other')),
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 27. HASHTAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hashtags (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  tag TEXT UNIQUE NOT NULL,
  posts_count INTEGER DEFAULT 0,
  trending_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 28. POST HASHTAGS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS post_hashtags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id TEXT NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

-- ============================================
-- 29. SAVED POST COLLECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_emoji TEXT DEFAULT '',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 30. COLLECTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS collection_items (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (collection_id, post_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- ===== USERS POLICIES =====
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = uid);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- ===== POSTS POLICIES =====
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid()::text = publisher_uid);

-- ===== POST LIKES POLICIES =====
CREATE POLICY "Post likes are viewable by everyone" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can unlike" ON post_likes FOR DELETE USING (auth.uid()::text = user_uid);

-- ===== POST FAVORITES POLICIES =====
CREATE POLICY "Post favorites are viewable by everyone" ON post_favorites FOR SELECT USING (true);
CREATE POLICY "Authenticated users can favorite posts" ON post_favorites FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can unfavorite" ON post_favorites FOR DELETE USING (auth.uid()::text = user_uid);

-- ===== COMMENTS POLICIES =====
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid()::text = publisher_uid);

-- ===== COMMENT LIKES POLICIES =====
CREATE POLICY "Comment likes are viewable by everyone" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like comments" ON comment_likes FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can unlike comments" ON comment_likes FOR DELETE USING (auth.uid()::text = user_uid);

-- ===== STORIES POLICIES =====
CREATE POLICY "Stories are viewable by everyone" ON stories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create stories" ON stories FOR INSERT WITH CHECK (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid()::text = publisher_uid);

-- ===== FOLLOWERS POLICIES =====
CREATE POLICY "Followers are viewable by everyone" ON followers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow" ON followers FOR INSERT WITH CHECK (auth.uid()::text = follower_uid);
CREATE POLICY "Users can unfollow" ON followers FOR DELETE USING (auth.uid()::text = follower_uid);

-- ===== CHAT ROOMS POLICIES =====
CREATE POLICY "Users can view their chat rooms" ON chat_rooms FOR SELECT USING (auth.uid()::text = participant_1 OR auth.uid()::text = participant_2);
CREATE POLICY "Authenticated users can create chat rooms" ON chat_rooms FOR INSERT WITH CHECK (auth.uid()::text = participant_1 OR auth.uid()::text = participant_2);

-- ===== CHAT MESSAGES POLICIES =====
CREATE POLICY "Users can view messages in their rooms" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_rooms WHERE chat_rooms.id = room_id AND (chat_rooms.participant_1 = auth.uid()::text OR chat_rooms.participant_2 = auth.uid()::text))
);
CREATE POLICY "Authenticated users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid()::text = sender_uid);
CREATE POLICY "Users can update own messages" ON chat_messages FOR UPDATE USING (auth.uid()::text = sender_uid);

-- ===== NOTIFICATIONS POLICIES =====
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_uid);

-- ===== GIFT TYPES POLICIES =====
CREATE POLICY "Gift types are viewable by everyone" ON gift_types FOR SELECT USING (true);
CREATE POLICY "Only admins can manage gift types" ON gift_types FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE uid = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Only admins can update gift types" ON gift_types FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE uid = auth.uid()::text AND role = 'admin'));

-- ===== GIFTS POLICIES =====
CREATE POLICY "Gifts are viewable by everyone" ON gifts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send gifts" ON gifts FOR INSERT WITH CHECK (auth.uid()::text = sender_uid);

-- ===== LIVE STREAMS POLICIES =====
CREATE POLICY "Live streams are viewable by everyone" ON live_streams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create streams" ON live_streams FOR INSERT WITH CHECK (auth.uid()::text = host_uid);
CREATE POLICY "Host can update own stream" ON live_streams FOR UPDATE USING (auth.uid()::text = host_uid);
CREATE POLICY "Host can end own stream" ON live_streams FOR DELETE USING (auth.uid()::text = host_uid);

-- ===== LIVE STREAM VIEWERS POLICIES =====
CREATE POLICY "Stream viewers are viewable by everyone" ON live_stream_viewers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join streams" ON live_stream_viewers FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can update own viewer record" ON live_stream_viewers FOR UPDATE USING (auth.uid()::text = user_uid);

-- ===== LIVE STREAM COMMENTS POLICIES =====
CREATE POLICY "Stream comments are viewable by everyone" ON live_stream_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment on streams" ON live_stream_comments FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

-- ===== WALLETS POLICIES =====
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid()::text = uid);
CREATE POLICY "Users can update own wallet" ON wallets FOR UPDATE USING (auth.uid()::text = uid);
CREATE POLICY "Users can insert own wallet" ON wallets FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- ===== TRANSACTIONS POLICIES =====
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System can create transactions" ON transactions FOR INSERT WITH CHECK (true);

-- ===== ACHIEVEMENTS POLICIES =====
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);
CREATE POLICY "Only admins can manage achievements" ON achievements FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE uid = auth.uid()::text AND role = 'admin'));

-- ===== USER ACHIEVEMENTS POLICIES =====
CREATE POLICY "User achievements are viewable by everyone" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "System can update achievements" ON user_achievements FOR UPDATE USING (true);
CREATE POLICY "System can create user achievements" ON user_achievements FOR INSERT WITH CHECK (true);

-- ===== DAILY REWARDS POLICIES =====
CREATE POLICY "Users can view own rewards" ON daily_rewards FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "Users can claim own rewards" ON daily_rewards FOR UPDATE USING (auth.uid()::text = user_uid);
CREATE POLICY "System can create daily rewards" ON daily_rewards FOR INSERT WITH CHECK (true);

-- ===== POLLS POLICIES =====
CREATE POLICY "Polls are viewable by everyone" ON polls FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create polls" ON polls FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own poll" ON polls FOR UPDATE USING (true);

-- ===== POLL OPTIONS POLICIES =====
CREATE POLICY "Poll options are viewable by everyone" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create options" ON poll_options FOR INSERT WITH CHECK (true);

-- ===== POLL VOTES POLICIES =====
CREATE POLICY "Poll votes are viewable by everyone" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON poll_votes FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

-- ===== BLOCKED USERS POLICIES =====
CREATE POLICY "Users can view own blocks" ON blocked_users FOR SELECT USING (auth.uid()::text = blocker_uid);
CREATE POLICY "Users can block others" ON blocked_users FOR INSERT WITH CHECK (auth.uid()::text = blocker_uid);
CREATE POLICY "Users can unblock" ON blocked_users FOR DELETE USING (auth.uid()::text = blocker_uid);

-- ===== REPORTS POLICIES =====
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid()::text = reporter_uid);
CREATE POLICY "Authenticated users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid()::text = reporter_uid);

-- ===== HASHTAGS POLICIES =====
CREATE POLICY "Hashtags are viewable by everyone" ON hashtags FOR SELECT USING (true);
CREATE POLICY "System can manage hashtags" ON hashtags FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update hashtags" ON hashtags FOR UPDATE USING (true);

-- ===== POST HASHTAGS POLICIES =====
CREATE POLICY "Post hashtags are viewable by everyone" ON post_hashtags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create post hashtags" ON post_hashtags FOR INSERT WITH CHECK (true);

-- ===== COLLECTIONS POLICIES =====
CREATE POLICY "Users can view own collections" ON collections FOR SELECT USING (auth.uid()::text = user_uid OR is_private = false);
CREATE POLICY "Users can create collections" ON collections FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can update own collections" ON collections FOR UPDATE USING (auth.uid()::text = user_uid);
CREATE POLICY "Users can delete own collections" ON collections FOR DELETE USING (auth.uid()::text = user_uid);

-- ===== COLLECTION ITEMS POLICIES =====
CREATE POLICY "Users can view collection items" ON collection_items FOR SELECT USING (true);
CREATE POLICY "Users can add to own collections" ON collection_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove from own collections" ON collection_items FOR DELETE USING (true);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_publisher ON posts(publisher_uid);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_region ON posts(region);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status) WHERE status = 'live';
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_stories_publisher ON stories(publisher_uid);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_followers_followed ON followers(followed_uid);
CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_uid);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participants ON chat_rooms(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_uid, is_read);
CREATE INDEX IF NOT EXISTS idx_gifts_sender ON gifts(sender_uid);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver ON gifts(receiver_uid);
CREATE INDEX IF NOT EXISTS idx_gifts_created ON gifts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_streams_host ON live_streams(host_uid);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled ON live_streams(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_uid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_uid);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user ON daily_rewards(user_uid);
CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON hashtags(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_uid);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update posts_count on users when post is created/deleted
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET posts_count = posts_count + 1 WHERE uid = NEW.publisher_uid;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET posts_count = GREATEST(posts_count - 1, 0) WHERE uid = OLD.publisher_uid;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_posts_count ON posts;
CREATE TRIGGER trigger_update_posts_count
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_user_posts_count();

-- Auto-update likes_count on posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_likes ON post_likes;
CREATE TRIGGER trigger_update_post_likes
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Auto-update comments_count on posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_comments ON comments;
CREATE TRIGGER trigger_update_post_comments
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Auto-update followers_count on users
CREATE OR REPLACE FUNCTION update_user_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET followers_count = followers_count + 1 WHERE uid = NEW.followed_uid;
    UPDATE users SET following_count = following_count + 1 WHERE uid = NEW.follower_uid;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE uid = OLD.followed_uid;
    UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE uid = OLD.follower_uid;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_followers_count ON followers;
CREATE TRIGGER trigger_update_followers_count
  AFTER INSERT OR DELETE ON followers
  FOR EACH ROW EXECUTE FUNCTION update_user_followers_count();

-- Auto-update gifts_count on users when gift is received
CREATE OR REPLACE FUNCTION update_user_gifts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET gifts_count = gifts_count + NEW.quantity WHERE uid = NEW.receiver_uid;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_gifts_count ON gifts;
CREATE TRIGGER trigger_update_gifts_count
  AFTER INSERT ON gifts
  FOR EACH ROW EXECUTE FUNCTION update_user_gifts_count();

-- Auto-create wallet when user is created
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (uid, coins_balance, diamonds_balance) VALUES (NEW.uid, 100, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_wallet ON users;
CREATE TRIGGER trigger_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- Auto-delete old stories (24h)
CREATE OR REPLACE FUNCTION cleanup_old_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM stories WHERE created_at < (extract(epoch from now()) * 1000 - 86400000);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_posts_updated_at ON posts;
CREATE TRIGGER trigger_update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA: Default Gift Types
-- ============================================
INSERT INTO gift_types (name, name_ar, emoji, coin_cost, diamond_value, category, animation_type, sort_order) VALUES
('Heart', 'قلب', '❤️', 10, 1, 'basic', 'float', 1),
('Rose', 'وردة', '🌹', 20, 2, 'basic', 'float', 2),
('Star', 'نجمة', '⭐', 50, 5, 'basic', 'float', 3),
('Crown', 'تاج', '👑', 100, 10, 'premium', 'burst', 4),
('Diamond', 'ألماسة', '💎', 200, 20, 'premium', 'burst', 5),
('Rocket', 'صاروخ', '🚀', 500, 50, 'luxury', 'firework', 6),
('Fire', 'نار', '🔥', 300, 30, 'luxury', 'firework', 7),
('Unicorn', 'يونيكورن', '🦄', 1000, 100, 'exclusive', 'rain', 8),
('Dragon', 'تنين', '🐉', 2000, 200, 'exclusive', 'rain', 9),
('Castle', 'قصر', '🏰', 5000, 500, 'exclusive', 'heart_rain', 10),
('Love Letter', 'رسالة حب', '💌', 30, 3, 'basic', 'float', 11),
('Lollipop', 'مصاصة', '🍭', 15, 1, 'basic', 'float', 12),
('Butterfly', 'فراشة', '🦋', 150, 15, 'premium', 'burst', 13),
('Rainbow', 'قوس قزح', '🌈', 400, 40, 'luxury', 'firework', 14),
('Lightning', 'برق', '⚡', 250, 25, 'premium', 'burst', 15);

-- ============================================
-- SEED DATA: Default Achievements
-- ============================================
INSERT INTO achievements (code, name, name_ar, description, description_ar, icon_emoji, category, requirement_value, reward_coins, reward_diamonds) VALUES
('first_post', 'First Post', 'أول منشور', 'Create your first post', 'انشر أول منشور لك', '📝', 'content', 1, 50, 0),
('ten_posts', 'Content Creator', 'صانع محتوى', 'Create 10 posts', 'انشر 10 منشورات', '✍️', 'content', 10, 200, 5),
('hundred_posts', 'Influencer', 'مؤثر', 'Create 100 posts', 'انشر 100 منشور', '🏆', 'content', 100, 1000, 50),
('first_like', 'Getting Love', 'حب أول', 'Receive your first like', 'احصل على أول إعجاب', '❤️', 'social', 1, 10, 0),
('hundred_followers', 'Rising Star', 'نجم صاعد', 'Get 100 followers', 'احصل على 100 متابع', '⭐', 'social', 100, 500, 25),
('thousand_followers', 'Superstar', 'نجم', 'Get 1000 followers', 'احصل على 1000 متابع', '🌟', 'social', 1000, 2000, 100),
('first_gift', 'Gifted', 'مهدى', 'Receive your first gift', 'استلم أول هدية', '🎁', 'gifts', 1, 50, 5),
('gift_millionaire', 'Gift Millionaire', 'مليونير الهدايا', 'Receive 1000 gifts', 'استلم 1000 هدية', '💰', 'gifts', 1000, 5000, 200),
('first_stream', 'Live Rookie', 'مبتدئ البث', 'Start your first live stream', 'ابدأ أول بث مباشر', '🎥', 'live', 1, 100, 10),
('streamer_pro', 'Pro Streamer', 'باث محترف', 'Stream for 10 hours total', 'ابث لمدة 10 ساعات', '🎬', 'live', 10, 1000, 50),
('daily_streak_7', 'Weekly Streak', 'أسبوع متواصل', 'Login 7 days in a row', 'سجل دخولك 7 أيام متواصلة', '🔥', 'streak', 7, 300, 15),
('daily_streak_30', 'Monthly Streak', 'شهر متواصل', 'Login 30 days in a row', 'سجل دخولك 30 يوم متواصل', '💎', 'streak', 30, 2000, 100);
