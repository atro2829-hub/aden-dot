'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  userService, followService, postsService, giftsService, fileToBase64,
} from '@/lib/supabase-service';
import {
  VerifiedIcon, PremiumIcon, CoinIcon, DiamondCurrencyIcon,
  GoldIcon, StarIcon, ShieldIcon, FireIcon,
  CrownIcon, PlatinumIcon, DiamondIcon, BronzeIcon,
  CameraIcon, ImageIcon, ArrowBackIcon, CheckIcon,
  MoreIcon, ShareIcon, FollowIcon, GiftIcon,
  HeartIcon, OnlineIcon, OfflineIcon, BusyIcon,
  ChatIcon, GlobeIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { User, Post, Gift } from '@/types/skyline';

// ============ Yemen Flag SVG ============
function YemenFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 2 / 3} viewBox="0 0 60 40" className="inline-block">
      <rect width="60" height="13.3" fill="#CE1126" />
      <rect y="13.3" width="60" height="13.4" fill="#FFFFFF" />
      <rect y="26.7" width="60" height="13.3" fill="#000000" />
    </svg>
  );
}

// ============ South Arabia Flag SVG ============
function SouthArabiaFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 2 / 3} viewBox="0 0 60 40" className="inline-block">
      <rect width="60" height="13.3" fill="#EF2B2D" />
      <rect y="13.3" width="60" height="13.4" fill="#FFFFFF" />
      <rect y="26.7" width="60" height="13.3" fill="#002868" />
      <polygon points="15,6 17.1,12.5 24,12.5 18.5,16.5 20.6,23 15,19 9.4,23 11.5,16.5 6,12.5 12.9,12.5" fill="#FFFFFF" />
    </svg>
  );
}

// ============ Admin Badge ============
function AdminBadge({ lang }: { lang: string }) {
  return (
    <motion.div
      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, delay: 0.4 }}
    >
      <CrownIcon size={12} />
      <span className="text-[9px] font-bold text-white">{lang === 'ar' ? 'مدير رسمي' : 'OFFICIAL ADMIN'}</span>
    </motion.div>
  );
}

// ============ Rank Helpers ============
function getRankIcon(level: number) {
  if (level >= 50) return <CrownIcon size={22} />;
  if (level >= 40) return <DiamondIcon size={22} />;
  if (level >= 30) return <PlatinumIcon size={22} />;
  if (level >= 15) return <GoldIcon size={22} />;
  if (level >= 5) return <StarIcon size={22} />;
  return <BronzeIcon size={22} />;
}

function getRankName(level: number, lang: string) {
  if (level >= 50) return t('rank.crown', lang as 'ar' | 'en');
  if (level >= 40) return t('rank.diamond', lang as 'ar' | 'en');
  if (level >= 30) return t('rank.platinum', lang as 'ar' | 'en');
  if (level >= 15) return t('rank.gold', lang as 'ar' | 'en');
  if (level >= 5) return t('rank.silver', lang as 'ar' | 'en');
  return t('rank.bronze', lang as 'ar' | 'en');
}

function getGenderIcon(gender: string, size = 16) {
  if (gender === 'male') return <span style={{ fontSize: size }}>♂</span>;
  if (gender === 'female') return <span style={{ fontSize: size }}>♀</span>;
  return null;
}

function renderFlag(region: string, size = 18) {
  if (region === 'yemen') return <YemenFlag size={size} />;
  if (region === 'south_arabia') return <SouthArabiaFlag size={size} />;
  return null;
}

function formatDate(dateStr: string, lang: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-YE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ============ Post Card Component ============
function PostCard({ post, lang }: { post: Post; lang: string }) {
  return (
    <motion.div
      className="p-4 rounded-2xl bg-card border border-border space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.publisherProfileImage || '/avatar.png'} />
          <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
            {post.publisherNickname?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate">{post.publisherNickname}</span>
            {post.publisherVerified && <VerifiedIcon size={14} />}
          </div>
          <span className="text-xs text-muted-foreground">@{post.publisherUsername}</span>
        </div>
      </div>
      {post.content && (
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      )}
      {post.mediaBase64 && (
        <div className="rounded-xl overflow-hidden">
          <img src={post.mediaBase64} alt="" className="w-full h-auto max-h-80 object-cover" />
        </div>
      )}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
        <span className="flex items-center gap-1">
          <HeartIcon size={14} color={post.isLiked ? '#EF4444' : 'currentColor'} /> {formatNumber(post.likesCount, lang as 'ar' | 'en')}
        </span>
        <span>💬 {formatNumber(post.commentsCount, lang as 'ar' | 'en')}</span>
        <span>👁 {formatNumber(post.viewsCount, lang as 'ar' | 'en')}</span>
      </div>
    </motion.div>
  );
}

// ============ Media Grid Card ============
function MediaCard({ post }: { post: Post }) {
  if (!post.mediaBase64) return null;
  return (
    <motion.div
      className="aspect-square rounded-xl overflow-hidden cursor-pointer"
      whileTap={{ scale: 0.95 }}
    >
      <img src={post.mediaBase64} alt="" className="w-full h-full object-cover" />
    </motion.div>
  );
}

// ============ Gift Card ============
function GiftCard({ gift, lang }: { gift: Gift; lang: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
      <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-2xl">
        {gift.giftType?.emoji || '🎁'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground truncate">
            {gift.senderUser?.nickname || (lang === 'ar' ? 'مستخدم' : 'User')}
          </span>
          {gift.senderUser?.isVerified && <VerifiedIcon size={12} />}
        </div>
        <p className="text-xs text-muted-foreground">
          {gift.giftType?.name || (lang === 'ar' ? 'هدية' : 'Gift')}
          {gift.message && ` — ${gift.message}`}
        </p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {new Date(gift.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-YE' : 'en-US', { month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
}

// ============ Edit Profile Modal ============
function EditProfileModal({
  isOpen,
  onClose,
  user,
  lang,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  lang: string;
  onSave: (data: Partial<User>) => Promise<void>;
}) {
  const [nickname, setNickname] = useState(user.nickname || '');
  const [bio, setBio] = useState(user.bio || '');
  const [region, setRegion] = useState(user.region || 'none');
  const [gender, setGender] = useState(user.gender || 'unspecified');
  const [profileImageBase64, setProfileImageBase64] = useState(user.profileImage || '');
  const [coverImageBase64, setCoverImageBase64] = useState(user.coverImage || '');
  const [saving, setSaving] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Reset form when user data changes
  useEffect(() => {
    setNickname(user.nickname || '');
    setBio(user.bio || '');
    setRegion(user.region || 'none');
    setGender(user.gender || 'unspecified');
    setProfileImageBase64(user.profileImage || '');
    setCoverImageBase64(user.coverImage || '');
  }, [user]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      if (type === 'profile') setProfileImageBase64(base64);
      else setCoverImageBase64(base64);
    } catch (err) {
      console.error('Image upload error:', err);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        nickname,
        bio,
        region,
        gender,
        profileImage: profileImageBase64,
        coverImage: coverImageBase64,
        isProfileComplete: true,
      });
      onClose();
    } catch (err) {
      console.error('Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto">
        <SheetHeader className="sticky top-0 bg-background z-10 pb-3">
          <div className="flex items-center justify-between">
            <button onClick={onClose}>
              <ArrowBackIcon size={20} />
            </button>
            <SheetTitle className="font-bold text-foreground">
              {lang === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
            </SheetTitle>
            <button onClick={handleSave} disabled={saving} className="text-primary font-bold text-sm">
              {saving ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}
            </button>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* Cover Image */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {lang === 'ar' ? 'صورة الغلاف' : 'Cover Photo'}
            </label>
            <div
              className="h-32 rounded-xl overflow-hidden bg-card border border-dashed border-border cursor-pointer relative group"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverImageBase64 ? (
                <img src={coverImageBase64} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <CameraIcon size={24} color="white" />
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'cover')}
            />
          </div>

          {/* Profile Image */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {lang === 'ar' ? 'صورة الملف الشخصي' : 'Profile Photo'}
            </label>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full overflow-hidden bg-card border-2 border-dashed border-border cursor-pointer relative group"
                onClick={() => profileInputRef.current?.click()}
              >
                {profileImageBase64 ? (
                  <img src={profileImageBase64} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <CameraIcon size={24} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <CameraIcon size={20} color="white" />
                </div>
              </div>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'profile')}
              />
              <span className="text-xs text-muted-foreground">
                {lang === 'ar' ? 'انقر لتغيير الصورة' : 'Tap to change photo'}
              </span>
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {lang === 'ar' ? 'الاسم المستعار' : 'Nickname'}
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={lang === 'ar' ? 'أدخل اسمك المستعار' : 'Enter your nickname'}
              className="rounded-xl"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {lang === 'ar' ? 'نبذة عنك' : 'Bio'}
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={lang === 'ar' ? 'أخبرنا عن نفسك...' : 'Tell us about yourself...'}
              className="rounded-xl resize-none h-24"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {lang === 'ar' ? 'الجنس' : 'Gender'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'male', label: lang === 'ar' ? 'ذكر' : 'Male', icon: '♂' },
                { id: 'female', label: lang === 'ar' ? 'أنثى' : 'Female', icon: '♀' },
                { id: 'unspecified', label: lang === 'ar' ? 'غير محدد' : 'Unspecified', icon: '?' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id as User['gender'])}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    gender === g.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <span className="text-lg">{g.icon}</span>
                  <span className="text-[10px] font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Flag Selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {lang === 'ar' ? 'العلم بجانب اسمك' : 'Flag next to your name'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: lang === 'ar' ? 'بدون' : 'None', icon: <span className="text-lg">🌐</span> },
                { id: 'yemen', label: lang === 'ar' ? 'اليمن' : 'Yemen', icon: <YemenFlag size={28} /> },
                { id: 'south_arabia', label: lang === 'ar' ? 'جنوب العربي' : 'South Arabia', icon: <SouthArabiaFlag size={28} /> },
              ].map((flag) => (
                <button
                  key={flag.id}
                  onClick={() => setRegion(flag.id)}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                    region === flag.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  {flag.icon}
                  <span className="text-[10px] font-medium">{flag.label}</span>
                  {region === flag.id && <CheckIcon size={14} color="var(--primary)" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============ Followers/Following Sheet ============
function FollowListSheet({
  isOpen,
  onClose,
  type,
  uid,
  currentUserUid,
  lang,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  uid: string;
  currentUserUid: string;
  lang: string;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;
    const load = type === 'followers' ? followService.getFollowers(uid) : followService.getFollowing(uid);
    let cancelled = false;
    load.then(async (data) => {
      if (cancelled) return;
      setUsers(data);
      // Check follow states for each user
      const states: Record<string, boolean> = {};
      await Promise.all(
        data.map(async (u) => {
          if (u.uid !== currentUserUid) {
            states[u.uid] = await followService.isFollowing(currentUserUid, u.uid);
          }
        })
      );
      if (!cancelled) {
        setFollowStates(states);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [isOpen, type, uid, currentUserUid]);

  const handleToggleFollow = async (targetUid: string) => {
    const isFollowing = followStates[targetUid] || false;
    setFollowStates((prev) => ({ ...prev, [targetUid]: !isFollowing }));
    try {
      if (isFollowing) {
        await followService.unfollowUser(currentUserUid, targetUid);
      } else {
        await followService.followUser(currentUserUid, targetUid);
      }
    } catch {
      setFollowStates((prev) => ({ ...prev, [targetUid]: isFollowing }));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>
            {type === 'followers'
              ? (lang === 'ar' ? 'المتابعون' : 'Followers')
              : (lang === 'ar' ? 'يتابع' : 'Following')}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2 max-h-[55vh] overflow-y-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <motion.div
                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              {lang === 'ar' ? 'لا يوجد مستخدمون' : 'No users found'}
            </div>
          ) : (
            users.map((u) => (
              <div key={u.uid} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={u.profileImage || '/avatar.png'} />
                  <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                    {u.nickname?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground truncate">{u.nickname}</span>
                    {u.isVerified && <VerifiedIcon size={12} />}
                    {renderFlag(u.region, 14)}
                  </div>
                  <span className="text-xs text-muted-foreground">@{u.username}</span>
                </div>
                {u.uid !== currentUserUid && (
                  <Button
                    size="sm"
                    variant={followStates[u.uid] ? 'outline' : 'default'}
                    className="text-xs h-7 px-3 rounded-full"
                    onClick={() => handleToggleFollow(u.uid)}
                  >
                    {followStates[u.uid]
                      ? (lang === 'ar' ? 'إلغاء' : 'Unfollow')
                      : (lang === 'ar' ? 'متابعة' : 'Follow')}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============ Report Dialog ============
function ReportDialog({
  isOpen,
  onClose,
  targetUID,
  lang,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetUID: string;
  lang: string;
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      const { getSupabaseBrowser } = await import('@/lib/supabase-browser');
      const client = getSupabaseBrowser();
      const authUser = (await client?.auth.getUser())?.data.user;
      if (!authUser || !client) return;
      await client.from('reports').insert({
        reporter_uid: authUser.id,
        reported_uid: targetUID,
        reason: 'other',
        description: reason,
        status: 'pending',
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setSubmitted(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{lang === 'ar' ? 'الإبلاغ عن مستخدم' : 'Report User'}</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="text-center py-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl mb-3">✅</motion.div>
            <p className="text-sm text-muted-foreground">
              {lang === 'ar' ? 'تم إرسال البلاغ بنجاح' : 'Report submitted successfully'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={lang === 'ar' ? 'اذكر سبب البلاغ...' : 'Describe the reason...'}
              className="resize-none h-24"
            />
            <Button onClick={handleSubmit} disabled={submitting || !reason.trim()} className="w-full">
              {submitting ? '...' : (lang === 'ar' ? 'إرسال البلاغ' : 'Submit Report')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============ Profile Page ============
export function ProfilePage() {
  const lang = useAppStore((s) => s.language) as 'ar' | 'en';
  const currentUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const currentProfileUID = useAppStore((s) => s.currentProfileUID);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setCurrentProfileUID = useAppStore((s) => s.setCurrentProfileUID);

  // Determine if viewing own or another profile
  const isOwnProfile = !currentProfileUID || currentProfileUID === currentUser?.uid;
  const viewingUID = isOwnProfile ? currentUser?.uid : currentProfileUID;

  // State
  const [profileUser, setProfileUser] = useState<User | null>(isOwnProfile ? currentUser : null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userGifts, setUserGifts] = useState<Gift[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(!isOwnProfile);
  const [activeTab, setLocalTab] = useState<'posts' | 'favorites' | 'about' | 'media' | 'gifts'>('posts');
  const [showEdit, setShowEdit] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followListType, setFollowListType] = useState<'followers' | 'following'>('followers');
  const [showReport, setShowReport] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Load other user profile data
  useEffect(() => {
    if (!viewingUID) return;

    if (!isOwnProfile && currentUser) {
      setProfileLoading(true);
      Promise.all([
        userService.getUserProfile(viewingUID),
        followService.isFollowing(currentUser.uid, viewingUID),
      ]).then(([profile, following]) => {
        setProfileUser(profile);
        setIsFollowingUser(following);
        setProfileLoading(false);
      });
    } else {
      setProfileUser(currentUser);
      setProfileLoading(false);
    }
  }, [viewingUID, isOwnProfile, currentUser]);

  // Load posts and gifts when profile user changes
  useEffect(() => {
    if (!viewingUID) return;
    setPostsLoading(true);
    Promise.all([
      postsService.getUserPosts(viewingUID, 0, 20),
      giftsService.getUserGifts(viewingUID, 20),
    ]).then(([posts, gifts]) => {
      setUserPosts(posts);
      setUserGifts(gifts);
      setPostsLoading(false);
    });
  }, [viewingUID]);

  const handleFollowToggle = async () => {
    if (!currentUser || !viewingUID) return;
    setFollowLoading(true);
    try {
      if (isFollowingUser) {
        await followService.unfollowUser(currentUser.uid, viewingUID);
      } else {
        await followService.followUser(currentUser.uid, viewingUID);
      }
      setIsFollowingUser(!isFollowingUser);
      // Refresh profile to get updated counts
      const updated = await userService.getUserProfile(viewingUID);
      if (updated) setProfileUser(updated);
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditSave = async (data: Partial<User>) => {
    if (!currentUser) return;
    await updateUser(data);
    const updated = await userService.getUserProfile(currentUser.uid);
    if (updated) setProfileUser(updated);
  };

  const handleOpenFollowers = (type: 'followers' | 'following') => {
    setFollowListType(type);
    if (type === 'followers') setShowFollowers(true);
    else setShowFollowing(true);
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <span className="text-4xl mb-3">👤</span>
        <p className="text-sm">{lang === 'ar' ? 'المستخدم غير موجود' : 'User not found'}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setCurrentProfileUID(null);
            setActiveTab('home');
          }}
        >
          {lang === 'ar' ? 'العودة' : 'Go Back'}
        </Button>
      </div>
    );
  }

  const user = profileUser;
  const isAdmin = user.role === 'admin';
  const xpForNextLevel = user.level * 1000;
  const xpProgress = Math.min((user.xp / xpForNextLevel) * 100, 100);
  const isOnline = user.status === 'online';
  const mediaPosts = userPosts.filter((p) => p.mediaBase64);
  const totalLikesReceived = userPosts.reduce((sum, p) => sum + p.likesCount, 0);

  const tabs = [
    { id: 'posts' as const, label: t('profile.myPosts', lang), icon: '📝' },
    { id: 'favorites' as const, label: t('profile.favorites', lang), icon: '⭐' },
    { id: 'media' as const, label: lang === 'ar' ? 'الوسائط' : 'Media', icon: '🖼️' },
    { id: 'gifts' as const, label: lang === 'ar' ? 'الهدايا' : 'Gifts', icon: '🎁' },
    { id: 'about' as const, label: t('profile.about', lang), icon: 'ℹ️' },
  ];

  return (
    <div className="space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* ===== Back button for other profiles ===== */}
      {!isOwnProfile && (
        <div className="flex items-center gap-3">
          <motion.button
            className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentProfileUID(null)}
          >
            <ArrowBackIcon size={18} />
          </motion.button>
          <span className="text-sm font-medium text-foreground">
            {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
          </span>
        </div>
      )}

      {/* ===== Cover Photo Section ===== */}
      <div className={`relative ${isAdmin ? 'ring-2 ring-amber-500/50 rounded-2xl' : ''}`}>
        <div className="h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background relative">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-3 left-6 w-24 h-24 rounded-full"
              style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}
            />
            <div
              className="absolute top-10 right-10 w-16 h-16 rounded-full"
              style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}
            />
            <div
              className="absolute bottom-0 left-1/3 w-32 h-20 rounded-full"
              style={{ background: 'radial-gradient(circle, var(--primary), transparent)', opacity: 0.25 }}
            />
          </div>
          {user.coverImage && (
            <img src={user.coverImage} alt="" className="w-full h-full object-cover" />
          )}
          {/* Admin gold overlay */}
          {isAdmin && (
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent" />
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-14 left-4">
          <div className="relative">
            <motion.div
              className={`w-[92px] h-[92px] rounded-full p-[3px] ${isAdmin ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500' : 'bg-primary'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            >
              <Avatar className="w-full h-full border-3 border-background">
                <AvatarImage src={user.profileImage || '/avatar.png'} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {user.nickname?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Online status indicator */}
            <motion.div
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center ${
                isOnline ? 'bg-green-500' : user.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isOnline ? (
                <OnlineIcon size={8} />
              ) : user.status === 'busy' ? (
                <BusyIcon size={8} />
              ) : (
                <OfflineIcon size={8} />
              )}
            </motion.div>

            {user.isPremium && (
              <motion.div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-primary shadow-lg shadow-primary/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.3 }}
              >
                <PremiumIcon size={16} />
              </motion.div>
            )}

            {user.isVerified && !isAdmin && (
              <motion.div
                className="absolute top-0 right-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
              >
                <VerifiedIcon size={20} />
              </motion.div>
            )}

            {isAdmin && (
              <motion.div
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.35 }}
              >
                <CrownIcon size={14} />
              </motion.div>
            )}

            {/* Camera for own profile */}
            {isOwnProfile && (
              <motion.button
                className="absolute -bottom-1 left-0 w-7 h-7 rounded-full flex items-center justify-center bg-card border border-border shadow-md"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEdit(true)}
              >
                <CameraIcon size={14} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Action Buttons Area */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {isOwnProfile ? (
            <motion.button
              className="px-5 py-2 rounded-full text-xs font-semibold glass-gold text-primary"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowEdit(true)}
            >
              {t('profile.editProfile', lang)}
            </motion.button>
          ) : (
            <>
              <motion.button
                className={`px-5 py-2 rounded-full text-xs font-semibold ${
                  isFollowingUser
                    ? 'bg-card border border-border text-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading
                  ? '...'
                  : isFollowingUser
                    ? t('profile.unfollow', lang)
                    : t('profile.follow', lang)}
              </motion.button>
              <motion.button
                className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  // Navigate to chat with this user
                  setCurrentProfileUID(null);
                  setActiveTab('chat');
                }}
              >
                <ChatIcon size={16} />
              </motion.button>
              <motion.button
                className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreIcon size={16} />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* More Menu Dropdown for other profiles */}
      <AnimatePresence>
        {showMoreMenu && !isOwnProfile && (
          <motion.div
            className="flex gap-2 flex-wrap"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <Button
              size="sm"
              variant="outline"
              className="text-xs rounded-full"
              onClick={() => {
                // Share profile
                if (navigator.share) {
                  navigator.share({
                    title: `${user.nickname} - Aden Dot`,
                    text: `${lang === 'ar' ? 'تحقق من حساب' : 'Check out'} @${user.username}`,
                  }).catch(() => {});
                }
              }}
            >
              <ShareIcon size={14} /> {lang === 'ar' ? 'مشاركة' : 'Share'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs rounded-full text-pink-500 border-pink-500/30 hover:bg-pink-500/10"
              onClick={() => {
                // Subscribe (placeholder)
              }}
            >
              <StarIcon size={14} /> {lang === 'ar' ? 'اشتراك' : 'Subscribe'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs rounded-full text-red-500 border-red-500/30 hover:bg-red-500/10"
              onClick={() => {
                setShowMoreMenu(false);
                setShowReport(true);
              }}
            >
              {lang === 'ar' ? 'إبلاغ' : 'Report'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Profile Info ===== */}
      <div className="mt-16 space-y-3">
        {/* Name + Badges Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className={`text-xl font-bold ${isAdmin ? 'text-amber-600' : 'text-foreground'}`}>
            {user.nickname || user.username}
          </h2>
          {renderFlag(user.region, 18)}
          {user.isVerified && <VerifiedIcon size={18} />}
          {user.isPremium && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground">
              {lang === 'ar' ? 'مميز' : 'PREMIUM'}
            </span>
          )}
          {isAdmin && <AdminBadge lang={lang} />}
        </div>

        {/* Username + Gender */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          {getGenderIcon(user.gender)}
          {isOnline ? (
            <Badge variant="secondary" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/20">
              {lang === 'ar' ? 'متصل' : 'Online'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[9px] bg-gray-500/10 text-gray-500">
              {lang === 'ar' ? 'غير متصل' : 'Offline'}
            </Badge>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-foreground/70 leading-relaxed">{user.bio}</p>
        )}

        {/* Region display */}
        {user.region && user.region !== 'none' && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GlobeIcon size={14} />
            <span>
              {user.region === 'yemen'
                ? (lang === 'ar' ? 'اليمن' : 'Yemen')
                : user.region === 'south_arabia'
                  ? (lang === 'ar' ? 'جنوب الجزيرة العربية' : 'South Arabia')
                  : user.region}
            </span>
            {renderFlag(user.region, 16)}
          </div>
        )}

        {/* Join date */}
        <div className="text-xs text-muted-foreground">
          📅 {t('profile.joined', lang)} {formatDate(user.joinDate, lang)}
        </div>
      </div>

      {/* ===== Level / XP / Rank Section ===== */}
      <motion.div
        className={`p-4 rounded-2xl bg-card border border-border space-y-3 ${isAdmin ? 'border-amber-500/30 bg-amber-500/5' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              {getRankIcon(user.level)}
            </motion.div>
            <div>
              <span className={`text-sm font-bold ${isAdmin ? 'text-amber-600' : 'text-primary'}`}>
                {t('profile.level', lang)} {user.level}
              </span>
              <span className="text-xs text-muted-foreground ml-2">• {getRankName(user.level, lang)}</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {user.xp}/{xpForNextLevel} XP
          </span>
        </div>
        {/* XP Progress Bar */}
        <div className="relative h-2.5 rounded-full overflow-hidden bg-muted">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${
              isAdmin
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-primary to-primary/80'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'goldShimmer 3s ease-in-out infinite',
            }}
          />
        </div>
      </motion.div>

      {/* ===== Stats Grid ===== */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: t('profile.posts', lang),
            value: user.postsCount,
            icon: (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            ),
          },
          {
            label: t('profile.followers', lang),
            value: user.followersCount,
            tappable: true,
            onTap: () => handleOpenFollowers('followers'),
            icon: (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            ),
          },
          {
            label: t('profile.following', lang),
            value: user.followingCount,
            tappable: true,
            onTap: () => handleOpenFollowers('following'),
            icon: (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
            ),
          },
          {
            label: t('profile.likes', lang),
            value: totalLikesReceived,
            icon: (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="var(--primary)">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            ),
          },
          {
            label: lang === 'ar' ? 'الهدايا' : 'Gifts',
            value: user.giftsCount,
            icon: <GiftIcon size={18} />,
          },
          {
            label: lang === 'ar' ? 'المشتركون' : 'Subscribers',
            value: user.subscribers,
            icon: (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            ),
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className={`text-center p-3 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors ${
              stat.tappable ? 'cursor-pointer' : ''
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 + 0.3 }}
            whileTap={stat.tappable ? { scale: 0.96 } : undefined}
            onClick={stat.onTap}
          >
            <div className="flex justify-center mb-1.5">{stat.icon}</div>
            <p className="text-base font-bold text-foreground">{formatNumber(stat.value, lang)}</p>
            <p className="text-[9px] text-muted-foreground font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ===== Badges ===== */}
      <div className="flex gap-2 flex-wrap">
        {user.isVerified && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-gold"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <VerifiedIcon size={12} />
            <span className="text-[10px] font-semibold text-primary">
              {lang === 'ar' ? 'موثّق' : 'Verified'}
            </span>
          </motion.div>
        )}
        {user.isPremium && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <PremiumIcon size={12} />
            <span className="text-[10px] font-semibold text-primary">
              {lang === 'ar' ? 'مميز' : 'Premium'}
            </span>
          </motion.div>
        )}
        {isAdmin && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <CrownIcon size={12} />
            <span className="text-[10px] font-semibold text-amber-600">
              {lang === 'ar' ? 'مدير رسمي' : 'Official Admin'}
            </span>
          </motion.div>
        )}
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {getRankIcon(user.level)}
          <span className="text-[10px] font-semibold text-primary">{getRankName(user.level, lang)}</span>
        </motion.div>
        {user.giftsCount > 0 && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/5 border border-pink-500/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <span className="text-[10px] font-semibold text-pink-500">
              {user.giftsCount} {lang === 'ar' ? 'هدية' : 'gifts'}
            </span>
          </motion.div>
        )}
      </div>

      {/* ===== Wallet Balances (own profile only) ===== */}
      {isOwnProfile && (
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-gold flex-1">
            <CoinIcon size={18} />
            <div>
              <p className="text-xs text-muted-foreground">{t('wallet.coins', lang)}</p>
              <p className="text-sm font-bold text-primary">{formatNumber(user.coinsBalance || 0, lang)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1 bg-blue-500/5 border border-blue-500/10">
            <DiamondCurrencyIcon size={18} />
            <div>
              <p className="text-xs text-muted-foreground">{t('wallet.diamonds', lang)}</p>
              <p className="text-sm font-bold text-blue-500">{formatNumber(user.diamondsBalance || 0, lang)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Profile Tabs with Sliding Indicator ===== */}
      <div>
        <div className="relative flex border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLocalTab(tab.id)}
              className={`flex-1 min-w-[60px] py-3 text-xs font-medium relative transition-colors whitespace-nowrap px-2 ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profileTabIndicator"
                  className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <div className="py-4">
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {postsLoading ? (
                  <div className="flex justify-center py-10">
                    <motion.div
                      className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    />
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center bg-primary/10">
                      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">{t('profile.noPosts', lang)}</p>
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <PostCard key={post.id} post={post} lang={lang} />
                  ))
                )}
              </motion.div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-center py-10"
              >
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeWidth="1.5"
                  className="mx-auto mb-3 opacity-40"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                <p className="text-sm text-muted-foreground">{t('profile.noCollections', lang)}</p>
              </motion.div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <motion.div
                key="media"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {mediaPosts.length === 0 ? (
                  <div className="text-center py-10">
                    <ImageIcon size={28} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm text-muted-foreground">
                      {lang === 'ar' ? 'لا توجد وسائط' : 'No media'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {mediaPosts.map((post) => (
                      <MediaCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Gifts Tab */}
            {activeTab === 'gifts' && (
              <motion.div
                key="gifts"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2"
              >
                {userGifts.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="text-3xl block mb-3 opacity-40">🎁</span>
                    <p className="text-sm text-muted-foreground">
                      {lang === 'ar' ? 'لا توجد هدايا' : 'No gifts yet'}
                    </p>
                  </div>
                ) : (
                  userGifts.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} lang={lang} />
                  ))
                )}
              </motion.div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* Bio */}
                {user.bio && (
                  <div className="p-4 rounded-2xl bg-card border border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                      {lang === 'ar' ? 'نبذة' : 'Bio'}
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Join date */}
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <p className="text-[9px] text-muted-foreground font-medium">
                      {t('profile.joined', lang)}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {formatDate(user.joinDate, lang)}
                    </p>
                  </div>

                  {/* Level */}
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <p className="text-[9px] text-muted-foreground font-medium">
                      {t('profile.level', lang)}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {user.level} — {getRankName(user.level, lang)}
                    </p>
                  </div>

                  {/* Gender */}
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <p className="text-[9px] text-muted-foreground font-medium">
                      {lang === 'ar' ? 'الجنس' : 'Gender'}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1">
                      {getGenderIcon(user.gender, 14)}
                      {user.gender === 'male'
                        ? (lang === 'ar' ? 'ذكر' : 'Male')
                        : user.gender === 'female'
                          ? (lang === 'ar' ? 'أنثى' : 'Female')
                          : (lang === 'ar' ? 'غير محدد' : 'Unspecified')}
                    </p>
                  </div>

                  {/* Region */}
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <p className="text-[9px] text-muted-foreground font-medium">
                      {lang === 'ar' ? 'المنطقة' : 'Region'}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1">
                      {renderFlag(user.region, 14)}
                      {user.region === 'yemen'
                        ? (lang === 'ar' ? 'اليمن' : 'Yemen')
                        : user.region === 'south_arabia'
                          ? (lang === 'ar' ? 'جنوب العربي' : 'South Arabia')
                          : user.region || (lang === 'ar' ? 'غير محدد' : 'Unspecified')}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <p className="text-[9px] text-muted-foreground font-medium">
                      {lang === 'ar' ? 'الحالة' : 'Status'}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1">
                      {isOnline ? (
                        <OnlineIcon size={10} />
                      ) : user.status === 'busy' ? (
                        <BusyIcon size={10} />
                      ) : (
                        <OfflineIcon size={10} />
                      )}
                      {user.status === 'online'
                        ? (lang === 'ar' ? 'متصل' : 'Online')
                        : user.status === 'busy'
                          ? (lang === 'ar' ? 'مشغول' : 'Busy')
                          : (lang === 'ar' ? 'غير متصل' : 'Offline')}
                    </p>
                  </div>

                  {/* Email Verified */}
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <p className="text-[9px] text-muted-foreground font-medium">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1">
                      {user.isEmailVerified ? '✅' : '⚠️'}
                      {user.isEmailVerified
                        ? (lang === 'ar' ? 'موثّق' : 'Verified')
                        : (lang === 'ar' ? 'غير موثّق' : 'Unverified')}
                    </p>
                  </div>
                </div>

                {/* Profile completion (own only) */}
                {isOwnProfile && (
                  <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {lang === 'ar' ? 'اكتمال الملف الشخصي' : 'Profile Completion'}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {user.isProfileComplete ? '100%' : '60%'}
                      </span>
                    </div>
                    <Progress value={user.isProfileComplete ? 100 : 60} className="h-2" />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* ===== Admin Profile Special Section ===== */}
      {isAdmin && (
        <motion.div
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <CrownIcon size={24} />
            </motion.div>
            <div>
              <h3 className={`text-sm font-bold ${isAdmin ? 'text-amber-600' : 'text-foreground'}`}>
                {lang === 'ar' ? 'حساب مسؤول رسمي' : 'Official Admin Account'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lang === 'ar'
                  ? 'هذا الحساب مُدار بواسطة فريق عدن دوت'
                  : 'This account is managed by the Aden Dot team'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== Modals & Sheets ===== */}
      <EditProfileModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        user={user}
        lang={lang}
        onSave={handleEditSave}
      />

      <FollowListSheet
        isOpen={showFollowers || (followListType === 'followers' && showFollowers)}
        onClose={() => setShowFollowers(false)}
        type="followers"
        uid={viewingUID || ''}
        currentUserUid={currentUser?.uid || ''}
        lang={lang}
      />

      <FollowListSheet
        isOpen={showFollowing || (followListType === 'following' && showFollowing)}
        onClose={() => setShowFollowing(false)}
        type="following"
        uid={viewingUID || ''}
        currentUserUid={currentUser?.uid || ''}
        lang={lang}
      />

      <ReportDialog
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetUID={viewingUID || ''}
        lang={lang}
      />
    </div>
  );
}
