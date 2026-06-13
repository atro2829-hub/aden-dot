'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import { ExploreIcon, VerifiedIcon, FollowIcon } from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const categories = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'trending', labelAr: 'الرائج', labelEn: 'Trending' },
  { id: 'people', labelAr: 'أشخاص', labelEn: 'People' },
  { id: 'photos', labelAr: 'صور', labelEn: 'Photos' },
  { id: 'videos', labelAr: 'فيديو', labelEn: 'Videos' },
  { id: 'music', labelAr: 'موسيقى', labelEn: 'Music' },
];

const trendingTopics = [
  { tag: '#عدن_دوت', posts: 1250 },
  { tag: '#اليمن_السعيد', posts: 890 },
  { tag: '#الخليج', posts: 670 },
  { tag: '#تصويري', posts: 540 },
  { tag: '#فن_عربي', posts: 430 },
  { tag: '#تقنية', posts: 380 },
];

const suggestedUsers = [
  { id: '1', name: 'أحمد الفنان', username: '@ahmed_art', verified: true, followers: 12500 },
  { id: '2', name: 'سارة الكاتبة', username: '@sara_write', verified: false, followers: 8900 },
  { id: '3', name: 'محمد التقني', username: '@moh_tech', verified: true, followers: 5600 },
  { id: '4', name: 'نورة المصممة', username: '@noura_design', verified: true, followers: 15200 },
  { id: '5', name: 'خالد الرياضي', username: '@khaled_sport', verified: false, followers: 3400 },
];

const exploreImages = [
  { id: '1', h: 200, color: '#EF4444' },
  { id: '2', h: 260, color: '#3B82F6' },
  { id: '3', h: 180, color: '#10B981' },
  { id: '4', h: 240, color: '#8B5CF6' },
  { id: '5', h: 220, color: '#F59E0B' },
  { id: '6', h: 280, color: '#EC4899' },
];

export function ExplorePage() {
  const lang = useAppStore((s) => s.language);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search */}
      <motion.div
        animate={{ scale: isSearchFocused ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder={t('explore.searchPlaceholder', lang)}
          className="h-11 rounded-xl bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50"
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
        />
      </motion.div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {lang === 'ar' ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Trending Topics */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('explore.trendingNow', lang)}</h3>
        <div className="space-y-2">
          {trendingTopics.map((topic, idx) => (
            <motion.button
              key={topic.tag}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors bg-card hover:bg-primary/5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-primary/10 text-primary">
                {idx + 1}
              </div>
              <div className="flex-1 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <p className="text-sm font-medium text-primary">{topic.tag}</p>
                <p className="text-[10px] text-muted-foreground">{formatNumber(topic.posts, lang)} {t('post.likes', lang)}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('explore.popular', lang)}</h3>
        <div className="columns-2 gap-2 space-y-2">
          {exploreImages.map((img, idx) => (
            <motion.div
              key={img.id}
              className="rounded-xl overflow-hidden break-inside-avoid"
              style={{ background: `${img.color}30`, height: img.h }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={32} color={`${img.color}80`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Suggested Users */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('explore.suggestedForYou', lang)}</h3>
        <div className="space-y-2">
          {suggestedUsers.map((user, idx) => (
            <motion.div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Avatar className="w-11 h-11">
                <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                  {user.verified && <VerifiedIcon size={14} />}
                </div>
                <span className="text-xs text-muted-foreground">{user.username} · {formatNumber(user.followers, lang)}</span>
              </div>
              <motion.button
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                whileTap={{ scale: 0.95 }}
              >
                {t('profile.follow', lang)}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Re-use ImageIcon
function ImageIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
