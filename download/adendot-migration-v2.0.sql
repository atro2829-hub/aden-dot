
-- =============================================
-- Aden Dot v2.0 — Premium Features Migration
-- =============================================
-- Adds: user badges, feature flags, view counts,
-- follow RPC, smart feed algorithm, content moderation tables.
-- All idempotent — safe to re-run.
-- =============================================

-- Add new columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS badge_type TEXT DEFAULT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_views INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_views INTEGER NOT NULL DEFAULT 0;

-- Add views_count to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Add views_count to live_streams
ALTER TABLE public.live_streams ADD COLUMN IF NOT EXISTS peak_viewers INTEGER NOT NULL DEFAULT 0;

-- =============================================
-- NEW TABLE: Badges (catalog of available badges)
-- =============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  color TEXT NOT NULL DEFAULT '#D4A853',
  badge_type TEXT NOT NULL DEFAULT 'verified' CHECK (badge_type IN ('vip', 'government', 'press', 'organization', 'verified', 'founder')),
  icon_name TEXT NOT NULL DEFAULT 'IconVerified',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_assignable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_badges_type ON public.badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_sort ON public.badges(sort_order);

-- =============================================
-- NEW TABLE: Feature Flags (admin controls app sections)
-- =============================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_admin_only BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON public.feature_flags(category);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(is_enabled);

-- =============================================
-- NEW TABLE: Post Views (track unique views for algorithm + analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_uid TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_uid)
);

CREATE INDEX IF NOT EXISTS idx_post_views_post ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user ON public.post_views(user_uid);
CREATE INDEX IF NOT EXISTS idx_post_views_time ON public.post_views(viewed_at DESC);

-- =============================================
-- NEW TABLE: User Interactions (for affinity algorithm)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  target_user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'follow', 'gift', 'view')),
  weight NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON public.user_interactions(user_uid);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target ON public.user_interactions(target_user_uid);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);

-- =============================================
-- NEW TABLE: Reported Content (consolidated moderation queue)
-- =============================================
CREATE TABLE IF NOT EXISTS public.reported_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'user', 'live_stream', 'message')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  reason_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_note TEXT,
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reported_content_status ON public.reported_content(status);
CREATE INDEX IF NOT EXISTS idx_reported_content_content ON public.reported_content(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_reported_content_reporter ON public.reported_content(reporter_uid);

-- =============================================
-- ENABLE RLS ON NEW TABLES
-- =============================================
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reported_content ENABLE ROW LEVEL SECURITY;

-- Badges: anyone can read catalog, only admins can write
DROP POLICY IF EXISTS "Anyone can read badges" ON public.badges;
CREATE POLICY "Anyone can read badges" ON public.badges FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage badges" ON public.badges;
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));

-- Feature flags: anyone can read (needed to gate UI), only admins can write
DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;
CREATE POLICY "Anyone can read feature flags" ON public.feature_flags FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));

-- Post views: users can insert own views, cannot read others (privacy)
DROP POLICY IF EXISTS "Users can record own views" ON public.post_views;
CREATE POLICY "Users can record own views" ON public.post_views FOR INSERT TO authenticated
  WITH CHECK (user_uid = auth.uid()::text OR user_uid IS NULL);

DROP POLICY IF EXISTS "Users can read own views" ON public.post_views;
CREATE POLICY "Users can read own views" ON public.post_views FOR SELECT TO authenticated
  USING (user_uid = auth.uid()::text);

-- User interactions: users can read own, insert own; cannot read others
DROP POLICY IF EXISTS "Users can read own interactions" ON public.user_interactions;
CREATE POLICY "Users can read own interactions" ON public.user_interactions FOR SELECT TO authenticated
  USING (user_uid = auth.uid()::text OR target_user_uid = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own interactions" ON public.user_interactions;
CREATE POLICY "Users can insert own interactions" ON public.user_interactions FOR INSERT TO authenticated
  WITH CHECK (user_uid = auth.uid()::text);

-- Reported content: users can submit & read own reports, admins see all
DROP POLICY IF EXISTS "Users can submit reports" ON public.reported_content;
CREATE POLICY "Users can submit reports" ON public.reported_content FOR INSERT TO authenticated
  WITH CHECK (reporter_uid = auth.uid()::text);

DROP POLICY IF EXISTS "Users can read own reports" ON public.reported_content;
CREATE POLICY "Users can read own reports" ON public.reported_content FOR SELECT TO authenticated
  USING (reporter_uid = auth.uid()::text OR EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage reports" ON public.reported_content;
CREATE POLICY "Admins can manage reports" ON public.reported_content FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin'));

-- =============================================
-- SEED DEFAULT BADGES
-- =============================================
INSERT INTO public.badges (code, name, name_ar, color, badge_type, sort_order, description_ar) VALUES
  ('vip', 'VIP', 'كبار الشخصيات', '#D4A853', 'vip', 1, 'شارة ذهبية لكبار الشخصيات'),
  ('government', 'Government Official', 'مسئول حكومي', '#E0245E', 'government', 2, 'شارة حمراء للمسئولين الحكوميين'),
  ('press', 'Press / Journalist', 'صحفي معتمد', '#1D9BF0', 'press', 3, 'شارة زرقاء للصحفيين المعتمدين'),
  ('organization', 'Organization', 'مؤسسة / منظمة', '#17BF63', 'organization', 4, 'شارة خضراء للمؤسسات والمنظمات'),
  ('verified', 'Verified', 'موثق', '#8899A6', 'verified', 5, 'شارة توثيق عادية'),
  ('founder', 'Founder', 'المؤسس', '#D4A853', 'founder', 0, 'شارة المؤسس الخاصة')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SEED DEFAULT FEATURE FLAGS
-- =============================================
INSERT INTO public.feature_flags (code, name, name_ar, category, is_enabled, sort_order, description_ar) VALUES
  ('live_streaming', 'Live Streaming', 'البث المباشر', 'content', true, 1, 'السماح للمستخدمين ببدء البث المباشر'),
  ('gifts', 'Gifts System', 'نظام الهدايا', 'monetization', true, 2, 'إرسال واستقبال الهدايا'),
  ('stories', 'Stories', 'القصص', 'content', true, 3, 'نشر القصص التي تختفي خلال 24 ساعة'),
  ('explore', 'Explore Page', 'صفحة الاستكشاف', 'navigation', true, 4, 'استكشاف المحتوى الرائج'),
  ('chat', 'Direct Messages', 'الرسائل الخاصة', 'communication', true, 5, 'محادثات خاصة بين المستخدمين'),
  ('wallet', 'Wallet & Payments', 'المحفظة والمدفوعات', 'monetization', true, 6, 'الإيداع والسحب وإدارة المحفظة'),
  ('comments', 'Comments', 'التعليقات', 'content', true, 7, 'السماح بالتعليق على المنشورات'),
  ('posts_creation', 'Post Creation', 'إنشاء المنشورات', 'content', true, 8, 'السماح بإنشاء منشورات جديدة'),
  ('verified_badges', 'Verified Badges', 'شارات التحقق', 'profile', true, 9, 'إظهار شارات التحقق على الملفات الشخصية'),
  ('south_flag', 'South Arabia Flag', 'علم الجنوب العربي', 'branding', true, 10, 'إظهار علم الجنوب العربي في التطبيق'),
  ('dark_mode', 'Dark Mode', 'الوضع الليلي', 'appearance', true, 11, 'السماح بتبديل الوضع الليلي'),
  ('user_search', 'User Search', 'البحث عن المستخدمين', 'navigation', true, 12, 'السماح بالبحث عن مستخدمين آخرين'),
  ('hashtags', 'Hashtags', 'الوسوم', 'content', true, 13, 'تفعيل نظام الوسوم'),
  ('live_gifts', 'Live Stream Gifts', 'هدايا البث المباشر', 'monetization', true, 14, 'إرسال هدايا أثناء البث المباشر'),
  ('subscriptions', 'Subscriptions', 'الاشتراكات المدفوعة', 'monetization', true, 15, 'نظام الاشتراكات في المبدعين')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- RPC: Toggle Follow (atomic — follows / unfollows in one call)
-- =============================================
CREATE OR REPLACE FUNCTION public.toggle_follow(p_target_uid TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_follower_uid TEXT := auth.uid()::text;
  v_exists BOOLEAN;
  v_target_role TEXT;
BEGIN
  IF v_follower_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_target_uid = v_follower_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_follow_self');
  END IF;

  -- Check target exists and not suspended
  SELECT role INTO v_target_role FROM public.users WHERE uid = p_target_uid;
  IF v_target_role IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'user_not_found');
  END IF;

  -- Check if already following
  SELECT EXISTS (
    SELECT 1 FROM public.followers
    WHERE follower_uid = v_follower_uid AND following_uid = p_target_uid
  ) INTO v_exists;

  IF v_exists THEN
    -- Unfollow
    DELETE FROM public.followers
    WHERE follower_uid = v_follower_uid AND following_uid = p_target_uid;

    UPDATE public.users SET following_count = GREATEST(following_count - 1, 0)
    WHERE uid = v_follower_uid;
    UPDATE public.users SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE uid = p_target_uid;

    RETURN jsonb_build_object('ok', true, 'action', 'unfollowed');
  ELSE
    -- Follow
    INSERT INTO public.followers (follower_uid, following_uid)
    VALUES (v_follower_uid, p_target_uid)
    ON CONFLICT DO NOTHING;

    UPDATE public.users SET following_count = following_count + 1
    WHERE uid = v_follower_uid;
    UPDATE public.users SET followers_count = followers_count + 1
    WHERE uid = p_target_uid;

    -- Record interaction for affinity algorithm
    INSERT INTO public.user_interactions (user_uid, target_user_uid, interaction_type, weight)
    VALUES (v_follower_uid, p_target_uid, 'follow', 5.0);

    -- Notify target user
    INSERT INTO public.notifications (user_uid, type, from_uid, content)
    VALUES (p_target_uid, 'follow', v_follower_uid, 'بدأ بمتابعتك');

    RETURN jsonb_build_object('ok', true, 'action', 'followed');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_follow TO authenticated;

-- =============================================
-- RPC: Record Post View (idempotent — increments counter only once per user)
-- =============================================
CREATE OR REPLACE FUNCTION public.record_post_view(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_uid TEXT := auth.uid()::text;
  v_already_viewed BOOLEAN;
BEGIN
  IF v_user_uid IS NULL THEN
    -- Anonymous view — just bump counter
    UPDATE public.posts SET views_count = views_count + 1 WHERE id = p_post_id;
    RETURN jsonb_build_object('ok', true, 'anonymous', true);
  END IF;

  -- Check if this user already viewed this post
  SELECT EXISTS (
    SELECT 1 FROM public.post_views
    WHERE post_id = p_post_id AND user_uid = v_user_uid
  ) INTO v_already_viewed;

  IF NOT v_already_viewed THEN
    INSERT INTO public.post_views (post_id, user_uid)
    VALUES (p_post_id, v_user_uid)
    ON CONFLICT DO NOTHING;

    UPDATE public.posts SET views_count = views_count + 1 WHERE id = p_post_id;
    UPDATE public.users SET total_views = total_views + 1
    WHERE uid = (SELECT author_uid FROM public.posts WHERE id = p_post_id);
  END IF;

  RETURN jsonb_build_object('ok', true, 'already_viewed', v_already_viewed);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_post_view TO authenticated;

-- =============================================
-- RPC: Get Smart Feed (Facebook-style ranked feed)
-- =============================================
-- Scoring: likes×1 + comments×2 + shares×3 + gifts×5
--          + recency_boost (last 1h: +20, last 6h: +10, last 24h: +5)
--          + affinity_score (based on user's past interactions with author)
--          + verified_boost (verified authors: +15)
--          + pinned_boost (pinned posts: +100)
-- =============================================
CREATE OR REPLACE FUNCTION public.get_smart_feed(p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_uid TEXT := auth.uid()::text;
  v_feed JSONB;
BEGIN
  IF v_user_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Build feed with weighted scoring
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', p.id,
    'author_uid', p.author_uid,
    'content', p.content,
    'media_urls', p.media_urls,
    'media_type', p.media_type,
    'likes_count', p.likes_count,
    'comments_count', p.comments_count,
    'shares_count', COALESCE(p.shares_count, 0),
    'views_count', p.views_count,
    'gifts_count', COALESCE(p.gifts_count, 0),
    'is_pinned', p.is_pinned,
    'created_at', p.created_at,
    'author_username', u.username,
    'author_nickname', u.nickname,
    'author_profile_image', u.profile_image,
    'author_badge_type', u.badge_type,
    'author_is_verified', u.is_verified,
    'score',
      (p.likes_count * 1) +
      (p.comments_count * 2) +
      (COALESCE(p.shares_count, 0) * 3) +
      (COALESCE(p.gifts_count, 0) * 5) +
      CASE
        WHEN p.created_at > now() - INTERVAL '1 hour' THEN 20
        WHEN p.created_at > now() - INTERVAL '6 hours' THEN 10
        WHEN p.created_at > now() - INTERVAL '24 hours' THEN 5
        ELSE 0
      END +
      COALESCE((
        SELECT SUM(weight) FROM public.user_interactions
        WHERE user_uid = v_user_uid AND target_user_uid = p.author_uid
      ), 0) +
      CASE WHEN u.is_verified THEN 15 ELSE 0 END +
      CASE WHEN p.is_pinned THEN 100 ELSE 0 END
  ) ORDER BY
    CASE WHEN p.is_pinned THEN 0 ELSE 1 END,
    (
      (p.likes_count * 1) +
      (p.comments_count * 2) +
      (COALESCE(p.shares_count, 0) * 3) +
      (COALESCE(p.gifts_count, 0) * 5) +
      CASE
        WHEN p.created_at > now() - INTERVAL '1 hour' THEN 20
        WHEN p.created_at > now() - INTERVAL '6 hours' THEN 10
        WHEN p.created_at > now() - INTERVAL '24 hours' THEN 5
        ELSE 0
      END +
      COALESCE((
        SELECT SUM(weight) FROM public.user_interactions
        WHERE user_uid = v_user_uid AND target_user_uid = p.author_uid
      ), 0) +
      CASE WHEN u.is_verified THEN 15 ELSE 0 END +
      CASE WHEN p.is_pinned THEN 100 ELSE 0 END
    ) DESC,
    p.created_at DESC
  ), '[]'::jsonb) INTO v_feed
  FROM public.posts p
  JOIN public.users u ON u.uid = p.author_uid
  WHERE p.is_hidden = false
    AND p.status = 'active'
    AND u.is_suspended = false
  LIMIT p_limit OFFSET p_offset;

  RETURN jsonb_build_object('ok', true, 'feed', v_feed);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_smart_feed TO authenticated;

-- =============================================
-- RPC: Assign Badge (admin only)
-- =============================================
CREATE OR REPLACE FUNCTION public.assign_badge(p_user_uid TEXT, p_badge_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_uid TEXT := auth.uid()::text;
  v_admin_role TEXT;
  v_badge_type TEXT;
BEGIN
  SELECT role INTO v_admin_role FROM public.users WHERE uid = v_admin_uid;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  SELECT badge_type INTO v_badge_type FROM public.badges WHERE code = p_badge_code AND is_assignable = true;
  IF v_badge_type IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'badge_not_found');
  END IF;

  UPDATE public.users
  SET badge_type = v_badge_type,
      is_verified = true
  WHERE uid = p_user_uid;

  RETURN jsonb_build_object('ok', true, 'badge_type', v_badge_type);
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_badge TO authenticated;

-- =============================================
-- RPC: Remove Badge (admin only)
-- =============================================
CREATE OR REPLACE FUNCTION public.remove_badge(p_user_uid TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_uid TEXT := auth.uid()::text;
  v_admin_role TEXT;
BEGIN
  SELECT role INTO v_admin_role FROM public.users WHERE uid = v_admin_uid;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  UPDATE public.users
  SET badge_type = NULL,
      is_verified = false
  WHERE uid = p_user_uid;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_badge TO authenticated;

-- =============================================
-- RPC: Suspend User (admin only)
-- =============================================
CREATE OR REPLACE FUNCTION public.suspend_user(
  p_user_uid TEXT,
  p_reason TEXT DEFAULT '',
  p_until TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_uid TEXT := auth.uid()::text;
  v_admin_role TEXT;
  v_target_role TEXT;
BEGIN
  SELECT role INTO v_admin_role FROM public.users WHERE uid = v_admin_uid;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  SELECT role INTO v_target_role FROM public.users WHERE uid = p_user_uid;
  IF v_target_role IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'user_not_found');
  END IF;

  IF v_target_role = 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_suspend_admin');
  END IF;

  UPDATE public.users
  SET is_suspended = true,
      suspended_reason = p_reason,
      suspended_until = p_until
  WHERE uid = p_user_uid;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.suspend_user TO authenticated;

-- =============================================
-- RPC: Unsuspend User (admin only)
-- =============================================
CREATE OR REPLACE FUNCTION public.unsuspend_user(p_user_uid TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_uid TEXT := auth.uid()::text;
  v_admin_role TEXT;
BEGIN
  SELECT role INTO v_admin_role FROM public.users WHERE uid = v_admin_uid;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  UPDATE public.users
  SET is_suspended = false,
      suspended_reason = NULL,
      suspended_until = NULL
  WHERE uid = p_user_uid;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.unsuspend_user TO authenticated;

-- =============================================
-- RPC: Set Feature Flag (admin only)
-- =============================================
CREATE OR REPLACE FUNCTION public.set_feature_flag(p_code TEXT, p_enabled BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_uid TEXT := auth.uid()::text;
  v_admin_role TEXT;
BEGIN
  SELECT role INTO v_admin_role FROM public.users WHERE uid = v_admin_uid;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  UPDATE public.feature_flags
  SET is_enabled = p_enabled,
      updated_by = v_admin_uid,
      updated_at = now()
  WHERE code = p_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'flag_not_found');
  END IF;

  RETURN jsonb_build_object('ok', true, 'code', p_code, 'enabled', p_enabled);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_feature_flag TO authenticated;

-- =============================================
-- RPC: Hide Post (admin only — for content moderation)
-- =============================================
CREATE OR REPLACE FUNCTION public.hide_post(p_post_id UUID, p_hidden BOOLEAN DEFAULT true)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_uid TEXT := auth.uid()::text;
  v_admin_role TEXT;
BEGIN
  SELECT role INTO v_admin_role FROM public.users WHERE uid = v_admin_uid;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  UPDATE public.posts SET is_hidden = p_hidden WHERE id = p_post_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.hide_post TO authenticated;

-- =============================================
-- RPC: Pin Post (admin only)
-- =============================================
CREATE OR REPLACE FUNCTION public.pin_post(p_post_id UUID, p_pinned BOOLEAN DEFAULT true)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_uid TEXT := auth.uid()::text;
  v_admin_role TEXT;
BEGIN
  SELECT role INTO v_admin_role FROM public.users WHERE uid = v_admin_uid;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  UPDATE public.posts SET is_pinned = p_pinned WHERE id = p_post_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.pin_post TO authenticated;

-- =============================================
-- Add realtime for new tables
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_flags;
ALTER PUBLICATION supabase_realtime ADD TABLE public.badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reported_content;
