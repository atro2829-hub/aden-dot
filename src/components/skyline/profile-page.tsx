'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuthStore, useUsersStore, usePostsStore, useAppStore, formatTimeAgo, formatCount, fileToBase64 } from '@/lib/store';
import type { User, Gender } from '@/types/skyline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Settings, Share2, Ban, Flag, Link2, Camera, Crown, Shield, Heart, Eye, MessageCircle,
  Users, MapPin, Calendar, Award, Star, Gift, ChevronRight, Edit3, X, LogOut, Palette,
  Globe, Lock, BarChart3, UserCheck, MoreHorizontal, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Badge component for user roles
function UserRoleBadge({ role }: { role: User['role'] }) {
  switch (role) {
    case 'admin':
      return <Badge className="bg-red-100 text-red-700 text-[10px]"><Shield className="h-3 w-3 mr-0.5" /> Admin</Badge>;
    case 'moderator':
      return <Badge className="bg-blue-100 text-blue-700 text-[10px]"><Star className="h-3 w-3 mr-0.5" /> Moderator</Badge>;
    case 'supporter':
      return <Badge className="bg-green-100 text-green-700 text-[10px]"><Heart className="h-3 w-3 mr-0.5" /> Supporter</Badge>;
    default:
      return null;
  }
}

// Gender badge
function GenderBadge({ gender }: { gender: Gender }) {
  if (gender === 'unspecified') return null;
  return (
    <Badge variant="secondary" className="text-[10px]">
      {gender === 'male' ? '♂ Male' : '♀ Female'}
    </Badge>
  );
}

// Profile header
function ProfileHeader({ profileUser, isOwn }: { profileUser: User; isOwn: boolean }) {
  const [showMore, setShowMore] = useState(false);
  const { followUser, unfollowUser } = useUsersStore();
  const currentUser = useAuthStore((s) => s.user);
  const handleCopyLink = useCallback(() => {
    navigator.clipboard?.writeText(`${window.location.origin}/profile/${profileUser.username}`);
    toast.success('Profile link copied!');
  }, [profileUser.username]);

  const handleFollowAction = useCallback(async () => {
    await followUser(profileUser.uid);
    toast.success(`Following ${profileUser.nickname || profileUser.username}`);
  }, [profileUser, followUser]);

  const handleUnfollowAction = useCallback(async () => {
    await unfollowUser(profileUser.uid);
    toast.success(`Unfollowed ${profileUser.nickname || profileUser.username}`);
  }, [profileUser, unfollowUser]);

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      {/* Cover image */}
      <div className="h-32 bg-gradient-to-r from-violet-400 to-rose-400 relative">
        {profileUser.coverImage && <img src={profileUser.coverImage} alt="Cover" className="w-full h-full object-cover" />}
        {!isOwn && (
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/30 text-white hover:bg-black/50 h-8 w-8" onClick={() => setShowMore(true)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Profile info */}
      <CardContent className="pt-0 px-4 pb-4">
        <div className="flex items-end gap-3 -mt-8 mb-3">
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
              <AvatarImage src={profileUser.profileImage || '/avatar.png'} />
              <AvatarFallback className="text-xl">{(profileUser.nickname || profileUser.username).charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {profileUser.status === 'online' && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div className="flex-1 pt-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-lg font-bold">{profileUser.nickname || profileUser.username}</h2>
              {profileUser.isVerified && <Badge className="bg-violet-100 text-violet-700 text-[10px]">✓ Verified</Badge>}
              {profileUser.isPremium && <Badge className="bg-amber-100 text-amber-700 text-[10px]"><Crown className="h-3 w-3 mr-0.5" /> Premium</Badge>}
              <UserRoleBadge role={profileUser.role} />
              <GenderBadge gender={profileUser.gender} />
            </div>
            <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
          </div>
        </div>

        {profileUser.bio && <p className="text-sm mb-3">{profileUser.bio}</p>}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3">
          <div className="text-center">
            <p className="font-bold text-sm">{formatCount(profileUser.postsCount)}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <button className="text-center">
            <p className="font-bold text-sm">{formatCount(profileUser.followersCount)}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>
          <button className="text-center">
            <p className="font-bold text-sm">{formatCount(profileUser.followingCount)}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
          <div className="text-center">
            <p className="font-bold text-sm">{profileUser.level}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm">{profileUser.popularity}%</p>
            <p className="text-xs text-muted-foreground">Popularity</p>
          </div>
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {profileUser.region && (
            <Badge variant="secondary" className="text-xs"><MapPin className="h-3 w-3 mr-1" /> {profileUser.region}</Badge>
          )}
          <Badge variant="secondary" className="text-xs"><Calendar className="h-3 w-3 mr-1" /> Joined {profileUser.joinDate}</Badge>
          <Badge variant="secondary" className="text-xs"><Gift className="h-3 w-3 mr-1" /> {profileUser.giftsCount} Gifts</Badge>
          <Badge variant="secondary" className="text-xs"><Users className="h-3 w-3 mr-1" /> {profileUser.subscribers} Subscribers</Badge>
        </div>

        {/* Action buttons */}
        {isOwn ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { /* open edit profile - handled by parent */ }}>
              <Edit3 className="h-4 w-4 mr-1" /> Edit Profile
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => { toast.info('Premium coming soon!'); }}>
              <Crown className="h-4 w-4 mr-1" /> Buy Premium
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button className="flex-1 bg-gradient-to-r from-violet-500 to-rose-500" onClick={handleFollowAction}>
              <UserCheck className="h-4 w-4 mr-1" /> Follow
            </Button>
            <Button variant="outline" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-1" /> Message
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* User more sheet */}
      <Sheet open={showMore} onOpenChange={setShowMore}>
        <SheetContent>
          <SheetHeader><SheetTitle>Profile Options</SheetTitle></SheetHeader>
          <div className="space-y-2 mt-4">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleCopyLink}>
              <Link2 className="h-4 w-4" /> Copy Link
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setShowMore(false); toast.info('User blocked'); }}>
              <Ban className="h-4 w-4" /> Block User
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setShowMore(false); toast.info('Report submitted'); }}>
              <Flag className="h-4 w-4" /> Report User
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}

// Edit profile dialog
function EditProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [username, setUsername] = useState(user?.username || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [coverImage, setCoverImage] = useState(user?.coverImage || '');
  const [profilePreview, setProfilePreview] = useState(user?.profileImage || '');
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || '');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open && user) {
      setUsername(user.username || '');
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setProfileImage(user.profileImage || '');
      setCoverImage(user.coverImage || '');
      setProfilePreview(user.profileImage || '');
      setCoverPreview(user.coverImage || '');
    }
  }, [open, user]);

  const handleProfileImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setProfileImage(base64);
    setProfilePreview(base64);
  }, []);

  const handleCoverImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setCoverImage(base64);
    setCoverPreview(base64);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateUser({ username, nickname, bio, profileImage, coverImage });
      toast.success('Changes Saved');
      onClose();
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [username, nickname, bio, profileImage, coverImage, updateUser, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Cover Image</Label>
            <div className="relative mt-2 h-24 rounded-lg overflow-hidden bg-gradient-to-r from-violet-300 to-rose-300">
              {coverPreview && <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />}
              <label className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 cursor-pointer transition-colors">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleCoverImage} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <Label>Profile Image</Label>
            <div className="flex justify-center mt-2">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-background">
                  <AvatarImage src={profilePreview || '/avatar.png'} />
                  <AvatarFallback className="text-xl">{nickname?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-violet-500 text-white flex items-center justify-center cursor-pointer hover:bg-violet-600">
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handleProfileImage} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} />
          </div>
          <div className="space-y-2">
            <Label>Nickname</Label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Biography</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={250} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-gradient-to-r from-violet-500 to-rose-500" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Settings page
function SettingsPage() {
  const logout = useAuthStore((s) => s.logout);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const settingsGroups = [
    {
      title: 'Application',
      items: [
        { icon: Palette, label: 'Theme', desc: 'Light / Dark mode', onClick: () => toast.info('Theme toggle coming soon!') },
        { icon: Globe, label: 'Language', desc: 'English', onClick: () => toast.info('Language settings coming soon!') },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: UserCheck, label: 'Edit Profile', desc: 'Update your information', onClick: () => toast.info('Opening edit profile...') },
        { icon: Lock, label: 'Privacy', desc: 'Manage privacy settings', onClick: () => toast.info('Privacy settings coming soon!') },
        { icon: Shield, label: 'Security', desc: 'Password and 2FA', onClick: () => toast.info('Security settings coming soon!') },
      ],
    },
    {
      title: 'Statistics',
      items: [
        { icon: BarChart3, label: 'Statistics Settings', desc: 'Hide views, likes, comments', onClick: () => toast.info('Statistics settings coming soon!') },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {settingsGroups.map((group) => (
        <Card key={group.title} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button key={item.label} onClick={item.onClick} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setShowLogoutDialog(true)}>
            <LogOut className="h-5 w-5" /> Log out
          </Button>
        </CardContent>
      </Card>
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Out</DialogTitle>
            <DialogDescription>Are you sure you want to log out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { await logout(); setShowLogoutDialog(false); }}>Log Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main Profile page component
export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const currentProfileUID = useAppStore((s) => s.currentProfileUID);
  const getUserByUID = useUsersStore((s) => s.getUserByUID);
  const userPosts = usePostsStore((s) => s.userPosts);
  const fetchUserPosts = usePostsStore((s) => s.fetchUserPosts);
  const isLoadingPosts = usePostsStore((s) => s.isLoading);
  const [tab, setTab] = useState<'posts' | 'settings'>('posts');
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const isOwn = !currentProfileUID || currentProfileUID === user?.uid;

  // Load profile user data
  useEffect(() => {
    const loadProfile = async () => {
      if (isOwn && user) {
        setProfileUser(user);
        fetchUserPosts(user.uid);
      } else if (currentProfileUID) {
        setIsLoadingProfile(true);
        try {
          const profile = await getUserByUID(currentProfileUID);
          if (profile) {
            setProfileUser(profile);
            fetchUserPosts(profile.uid);
          } else {
            setProfileUser(null);
          }
        } catch {
          setProfileUser(null);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };
    loadProfile();
  }, [currentProfileUID, isOwn, user, getUserByUID, fetchUserPosts]);

  // Update profile user when auth user changes
  useEffect(() => {
    if (isOwn && user) {
      setProfileUser(user);
    }
  }, [isOwn, user]);

  if (isLoadingProfile) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!profileUser) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <ProfileHeader profileUser={profileUser} isOwn={isOwn} />

      {isOwn && (
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">Posts ({userPosts.length})</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {tab === 'settings' && isOwn ? (
        <SettingsPage />
      ) : (
        <>
          {isLoadingPosts ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : userPosts.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">This user hasn&apos;t shared a post yet</p>
              </CardContent>
            </Card>
          ) : (
            userPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden border-0 shadow-sm">
                <CardContent className="p-4">
                  {post.type === 'TEXT' && <p className="text-sm">{post.content}</p>}
                  {post.type === 'IMAGE' && post.mediaBase64 && <img src={post.mediaBase64} alt="" className="w-full rounded-lg max-h-64 object-cover" />}
                  {post.type === 'IMAGE' && !post.mediaBase64 && <div className="h-40 rounded-lg bg-gradient-to-br from-violet-100 to-rose-100 flex items-center justify-center"><Palette className="h-8 w-8 text-violet-300" /></div>}
                  {post.type === 'VIDEO' && post.mediaBase64 && <video src={post.mediaBase64} controls className="w-full rounded-lg max-h-64" />}
                  {post.type === 'VIDEO' && !post.mediaBase64 && <div className="h-40 rounded-lg bg-gradient-to-br from-violet-100 to-rose-100 flex items-center justify-center"><Eye className="h-8 w-8 text-violet-300" /></div>}
                  {post.description && post.type !== 'TEXT' && <p className="text-sm mt-2">{post.description}</p>}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likesCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.commentsCount}</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}

      <EditProfileDialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
    </div>
  );
}
