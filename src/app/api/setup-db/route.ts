import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Database Setup API Route
 * Creates all Skyline tables using the Supabase client
 * Falls back to providing SQL for manual execution
 */
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Complete SQL schema
const SCHEMA_SQL = `
-- Skyline Social Media App - Complete Database Schema
-- Execute this in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS public.users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  nickname TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  gender TEXT DEFAULT 'unspecified',
  profile_image TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  status TEXT DEFAULT 'offline',
  role TEXT DEFAULT 'user',
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

-- 2. POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  type TEXT DEFAULT 'TEXT',
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

-- 3. POST LIKES
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_uid)
);

-- 4. POST FAVORITES
CREATE TABLE IF NOT EXISTS public.post_favorites (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_uid)
);

-- 5. COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  publisher_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_liked_by_publisher BOOLEAN DEFAULT FALSE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  replies_count INTEGER DEFAULT 0,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- 6. COMMENT LIKES
CREATE TABLE IF NOT EXISTS public.comment_likes (
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_uid)
);

-- 7. STORIES
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  media_base64 TEXT DEFAULT '',
  media_mime_type TEXT DEFAULT 'image/jpeg',
  views_count INTEGER DEFAULT 0,
  viewers TEXT[] DEFAULT '{}',
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- 8. FOLLOWERS
CREATE TABLE IF NOT EXISTS public.followers (
  follower_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  followed_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_uid, followed_uid)
);

-- 9. CHAT ROOMS
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  participant_2 TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  last_message TEXT DEFAULT '',
  last_message_time BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (participant_1, participant_2)
);

-- 10. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  media_base64 TEXT,
  media_mime_type TEXT DEFAULT '',
  message_type TEXT DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  type TEXT NOT NULL,
  from_uid TEXT,
  post_id UUID,
  content TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- 12. GIFT TYPES
CREATE TABLE IF NOT EXISTS public.gift_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT DEFAULT '',
  emoji TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  coin_cost INTEGER NOT NULL DEFAULT 10,
  diamond_value INTEGER DEFAULT 1,
  category TEXT DEFAULT 'basic',
  animation_type TEXT DEFAULT 'float',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. GIFTS
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_type_id UUID NOT NULL REFERENCES public.gift_types(id) ON DELETE CASCADE,
  sender_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  receiver_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  live_stream_id UUID,
  quantity INTEGER DEFAULT 1,
  message TEXT DEFAULT '',
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- 14. LIVE STREAMS
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  thumbnail_base64 TEXT DEFAULT '',
  category TEXT DEFAULT '',
  viewer_count INTEGER DEFAULT 0,
  peak_viewer_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  gifts_coins_total INTEGER DEFAULT 0,
  status TEXT DEFAULT 'live',
  co_host_uid TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  is_recording BOOLEAN DEFAULT FALSE,
  recording_url TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  started_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  ended_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. LIVE STREAM VIEWERS
CREATE TABLE IF NOT EXISTS public.live_stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  joined_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  left_at BIGINT,
  watch_duration_seconds INTEGER DEFAULT 0,
  UNIQUE (stream_id, user_uid)
);

-- 16. LIVE STREAM COMMENTS
CREATE TABLE IF NOT EXISTS public.live_stream_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- 17. WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
  uid TEXT PRIMARY KEY REFERENCES public.users(uid) ON DELETE CASCADE,
  coins_balance INTEGER DEFAULT 100,
  diamonds_balance INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 100,
  total_diamonds_earned INTEGER DEFAULT 0,
  total_coins_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  type TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT DEFAULT '',
  reference_id TEXT,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- 19. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  icon_emoji TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  requirement_value INTEGER DEFAULT 1,
  reward_coins INTEGER DEFAULT 0,
  reward_diamonds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_uid, achievement_id)
);

-- 21. DAILY REWARDS
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  coins_reward INTEGER DEFAULT 10,
  diamonds_reward INTEGER DEFAULT 0,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ
);

-- 22. BLOCKED USERS
CREATE TABLE IF NOT EXISTS public.blocked_users (
  blocker_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  blocked_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_uid, blocked_uid)
);

-- 23. REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  reported_uid TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  reported_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. HASHTAGS
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT UNIQUE NOT NULL,
  posts_count INTEGER DEFAULT 0,
  trending_score REAL DEFAULT 0
);

-- 25. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_emoji TEXT DEFAULT '',
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. COLLECTION POSTS
CREATE TABLE IF NOT EXISTS public.collection_posts (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, post_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_posts_publisher ON public.posts(publisher_uid);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_stories_publisher ON public.stories(publisher_uid);
CREATE INDEX IF NOT EXISTS idx_followers_followed ON public.followers(followed_uid);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_uid, is_read);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams(status);

-- ENABLE RLS ON ALL TABLES
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
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users readable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = uid) WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid()::text = uid);

CREATE POLICY "Posts readable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid()::text = publisher_uid);

CREATE POLICY "Post likes readable" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can unlike" ON public.post_likes FOR DELETE USING (auth.uid()::text = user_uid);

CREATE POLICY "Post favorites readable" ON public.post_favorites FOR SELECT USING (true);
CREATE POLICY "Users can favorite" ON public.post_favorites FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users can unfavorite" ON public.post_favorites FOR DELETE USING (auth.uid()::text = user_uid);

CREATE POLICY "Comments readable" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid()::text = publisher_uid);

CREATE POLICY "Stories readable" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Users can create stories" ON public.stories FOR INSERT WITH CHECK (auth.uid()::text = publisher_uid);
CREATE POLICY "Users can delete own stories" ON public.stories FOR DELETE USING (auth.uid()::text = publisher_uid);

CREATE POLICY "Followers readable" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.followers FOR INSERT WITH CHECK (auth.uid()::text = follower_uid);
CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid()::text = follower_uid);

CREATE POLICY "Chat rooms for participants" ON public.chat_rooms FOR SELECT USING (auth.uid()::text = participant_1 OR auth.uid()::text = participant_2);
CREATE POLICY "Users can create rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid()::text = participant_1 OR auth.uid()::text = participant_2);
CREATE POLICY "Participants update rooms" ON public.chat_rooms FOR UPDATE USING (auth.uid()::text = participant_1 OR auth.uid()::text = participant_2);

CREATE POLICY "Messages for participants" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_rooms WHERE chat_rooms.id = chat_messages.room_id AND (participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text))
);
CREATE POLICY "Users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid()::text = sender_uid);
CREATE POLICY "Participants update messages" ON public.chat_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.chat_rooms WHERE chat_rooms.id = chat_messages.room_id AND (participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text))
);

CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid()::text = user_uid);

CREATE POLICY "Gift types readable" ON public.gift_types FOR SELECT USING (true);
CREATE POLICY "Admins manage gift types" ON public.gift_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins update gift types" ON public.gift_types FOR UPDATE USING (true);

CREATE POLICY "Gifts readable" ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Users can send gifts" ON public.gifts FOR INSERT WITH CHECK (auth.uid()::text = sender_uid);

CREATE POLICY "Streams readable" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "Users can create streams" ON public.live_streams FOR INSERT WITH CHECK (auth.uid()::text = host_uid);
CREATE POLICY "Hosts update streams" ON public.live_streams FOR UPDATE USING (auth.uid()::text = host_uid);

CREATE POLICY "Stream viewers readable" ON public.live_stream_viewers FOR SELECT USING (true);
CREATE POLICY "Users can join streams" ON public.live_stream_viewers FOR INSERT WITH CHECK (auth.uid()::text = user_uid);
CREATE POLICY "Users update own viewer" ON public.live_stream_viewers FOR UPDATE USING (auth.uid()::text = user_uid);

CREATE POLICY "Stream comments readable" ON public.live_stream_comments FOR SELECT USING (true);
CREATE POLICY "Users comment on streams" ON public.live_stream_comments FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

CREATE POLICY "Users read own wallet" ON public.wallets FOR SELECT USING (auth.uid()::text = uid);
CREATE POLICY "System manages wallets" ON public.wallets FOR UPDATE USING (true);
CREATE POLICY "System creates wallets" ON public.wallets FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own transactions" ON public.transactions FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System creates transactions" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Achievements readable" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "System manages achievements" ON public.achievements FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own achievements" ON public.user_achievements FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System manages user achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "System updates achievements" ON public.user_achievements FOR UPDATE USING (true);

CREATE POLICY "Users read own rewards" ON public.daily_rewards FOR SELECT USING (auth.uid()::text = user_uid);
CREATE POLICY "System manages rewards" ON public.daily_rewards FOR INSERT WITH CHECK (true);
CREATE POLICY "Users claim rewards" ON public.daily_rewards FOR UPDATE USING (auth.uid()::text = user_uid);

-- AUTO-USER CREATION TRIGGER
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void AS $$
  UPDATE public.posts SET views_count = views_count + 1 WHERE id = post_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_stream_viewers(stream_id UUID)
RETURNS void AS $$
  UPDATE public.live_streams SET viewer_count = viewer_count + 1, peak_viewer_count = GREATEST(peak_viewer_count, viewer_count + 1) WHERE id = stream_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_stream_likes(stream_id UUID)
RETURNS void AS $$
  UPDATE public.live_streams SET like_count = like_count + 1 WHERE id = stream_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_stream_gifts(stream_id UUID, amount INTEGER)
RETURNS void AS $$
  UPDATE public.live_streams SET gifts_coins_total = gifts_coins_total + amount WHERE id = stream_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- COUNTER TRIGGERS
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

-- SEED: Gift Types
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

-- SEED: Achievements
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

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_stream_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
`;

export async function GET() {
  // Check current database status
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ 
      error: 'Missing Supabase configuration',
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SERVICE_KEY,
    }, { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if the users table exists
    const { data, error } = await supabase.from('users').select('uid').limit(1);
    
    if (error) {
      return NextResponse.json({
        status: 'not_setup',
        message: 'Database tables not created yet',
        sqlEditorUrl: `https://supabase.com/dashboard/project/ocjcbowrewenogrkexmr/sql/new`,
        sql: SCHEMA_SQL,
      });
    }

    return NextResponse.json({
      status: 'ready',
      message: 'Database is set up and ready',
      tablesExist: true,
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST() {
  // Return the SQL for the client to execute via the SQL Editor
  return NextResponse.json({
    success: false,
    message: 'Direct SQL execution is not available from the server. Use the SQL Editor link.',
    sqlEditorUrl: `https://supabase.com/dashboard/project/ocjcbowrewenogrkexmr/sql/new`,
    sql: SCHEMA_SQL,
  });
}
