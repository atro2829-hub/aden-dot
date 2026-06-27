'use client';

import React from 'react';

// Color constants - kept for brand-specific SVG fills that can't use CSS variables
const GOLD = '#D4A853';
const GOLD_LIGHT = '#F5C542';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// ============ APP LOGO ============

export function AppLogoIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="22" fill="url(#logoGrad)" />
      <circle cx="24" cy="24" r="18" fill="currentColor" />
      <circle cx="24" cy="24" r="8" fill="url(#logoInnerGrad)" />
      <circle cx="24" cy="24" r="4" fill={GOLD_LIGHT} />
      <path d="M18 16L24 8L30 16" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 32L24 40L30 32" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_LIGHT} />
        </linearGradient>
        <linearGradient id="logoInnerGrad" x1="16" y1="16" x2="32" y2="32">
          <stop stopColor={GOLD} stopOpacity="0.3" />
          <stop offset="1" stopColor={GOLD_LIGHT} stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============ NAVIGATION ICONS ============

export function HomeIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

export function ExploreIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  );
}

export function CreateIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="url(#createGrad)" />
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="createGrad" x1="2" y1="2" x2="22" y2="22">
          <stop stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_LIGHT} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LiveIcon({ size = 24, color = '#EF4444', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M8 10l4 3-4 3V10z" fill={color} />
      <circle cx="17" cy="16" r="1.5" fill={color} />
    </svg>
  );
}

export function ChatIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

export function ProfileIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0112 0v1" />
      <path d="M16 21v-1a6 6 0 014-5.66" />
    </svg>
  );
}

// ============ RANK ICONS ============

export function BronzeIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#CD7F32" opacity="0.2" />
      <circle cx="12" cy="12" r="10" stroke="#CD7F32" strokeWidth="1.5" />
      <path d="M12 6l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" fill="#CD7F32" />
    </svg>
  );
}

export function SilverIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#C0C0C0" opacity="0.2" />
      <circle cx="12" cy="12" r="10" stroke="#C0C0C0" strokeWidth="1.5" />
      <path d="M12 6l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" fill="#C0C0C0" />
    </svg>
  );
}

export function GoldIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill={GOLD} opacity="0.2" />
      <circle cx="12" cy="12" r="10" stroke={GOLD} strokeWidth="1.5" />
      <path d="M12 6l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" fill={GOLD} />
    </svg>
  );
}

export function PlatinumIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#E5E4E2" opacity="0.2" />
      <circle cx="12" cy="12" r="10" stroke="#E5E4E2" strokeWidth="1.5" />
      <path d="M12 5l1.5 3.5L17 9l-2.5 2.5L16 15l-4-2-4 2 1.5-3.5L7 9l3.5-.5L12 5z" fill="#E5E4E2" />
    </svg>
  );
}

export function DiamondIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill={GOLD_LIGHT} opacity="0.15" />
      <circle cx="12" cy="12" r="10" stroke={GOLD_LIGHT} strokeWidth="1.5" />
      <path d="M12 4l6 7-6 9-6-9 6-7z" fill="url(#diamondGrad)" />
      <defs>
        <linearGradient id="diamondGrad" x1="6" y1="4" x2="18" y2="20">
          <stop stopColor={GOLD} />
          <stop offset="0.5" stopColor={GOLD_LIGHT} />
          <stop offset="1" stopColor={GOLD} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CrownIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill={GOLD} opacity="0.1" />
      <circle cx="12" cy="12" r="10" stroke={GOLD} strokeWidth="1.5" />
      <path d="M5 16l2-8 3 4 2-6 2 6 3-4 2 8H5z" fill="url(#crownGrad)" />
      <circle cx="7" cy="7" r="1" fill={GOLD_LIGHT} />
      <circle cx="12" cy="5" r="1" fill={GOLD_LIGHT} />
      <circle cx="17" cy="7" r="1" fill={GOLD_LIGHT} />
      <defs>
        <linearGradient id="crownGrad" x1="5" y1="6" x2="19" y2="16">
          <stop stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_LIGHT} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============ ACHIEVEMENT ICONS ============

export function StarIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function TrophyIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <path d="M18 9h2a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
      <path d="M6 4h12v6a6 6 0 01-12 0V4z" />
      <path d="M12 16v3" />
      <path d="M8 22h8" />
    </svg>
  );
}

export function MedalIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="14" r="7" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="14" r="4" fill={color} opacity="0.3" />
      <path d="M8 2l4 5 4-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function FireIcon({ size = 24, color = '#EF4444', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 22c4.97 0 7-3.58 7-7 0-3-1.5-5-3-6.5-.5-.5-1.5-.5-1.5.5 0 1.5-1 2-2 2s.5-3-.5-5c-.5-1-1.5-1.5-2-.5C9.5 6 8 8 8 10c0 1.5-1 2.5-2 2.5S4.5 11 4.5 10c0-.5-1-.5-1.5 0C1.5 12 0 14 0 17c0 2.5 2 5 5 5" fill={color} opacity="0.8" />
      <path d="M12 22c2 0 3-1.5 3-3.5 0-1.5-1-2.5-1.5-3-.25-.25-.75-.25-.75.25 0 .75-.5 1-1 1s.25-1.5-.25-2.5c-.25-.5-.75-.75-1-.25C10 15 9.5 16 9.5 17c0 .75-.5 1.25-1 1.25S7.75 17 7.75 16.5c0-.25-.5-.25-.75 0C6 17.5 5 18.5 5 20c0 1.25 1 2 2 2" fill={GOLD_LIGHT} />
    </svg>
  );
}

export function LightningIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function HeartIcon({ size = 24, color = '#EF4444', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export function DiamondGemIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 3h12l4 6-10 13L2 9z" />
      <path d="M2 9h20" />
      <path d="M10 3L8 9l4 13 4-13-2-6" />
    </svg>
  );
}

// ============ ACTION ICONS ============

export function LikeIcon({ size = 24, color = 'currentColor', className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export function CommentIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

export function ShareIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

export function FollowIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}

export function GiftIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M12 8v12" />
      <path d="M3 12h18" />
      <path d="M12 8c-2-3-6-3-6 0s4 0 6 0z" fill={color} opacity="0.3" />
      <path d="M12 8c2-3 6-3 6 0s-4 0-6 0z" fill={color} opacity="0.3" />
    </svg>
  );
}

export function WalletIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M16 12h.01" />
      <path d="M2 10h20" />
    </svg>
  );
}

// ============ STATUS ICONS ============

export function OnlineIcon({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className}>
      <circle cx="6" cy="6" r="5" fill="#22C55E" />
      <circle cx="6" cy="6" r="5" fill="none" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

export function OfflineIcon({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className}>
      <circle cx="6" cy="6" r="5" fill="#9CA3AF" />
      <circle cx="6" cy="6" r="5" fill="none" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

export function BusyIcon({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className}>
      <circle cx="6" cy="6" r="5" fill="#EF4444" />
      <circle cx="6" cy="6" r="5" fill="none" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

export function VerifiedIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
      <circle cx="8" cy="8" r="7" fill={GOLD} />
      <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function PremiumIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
      <circle cx="8" cy="8" r="7" fill="url(#premiumGrad)" />
      <path d="M8 4l1.5 3 3.5.5-2.5 2.5.5 3.5L8 11.5 5 13.5l.5-3.5L3 7.5l3.5-.5L8 4z" fill="white" opacity="0.9" />
      <defs>
        <linearGradient id="premiumGrad" x1="1" y1="1" x2="15" y2="15">
          <stop stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_LIGHT} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============ COIN / DIAMOND ICONS ============

export function CoinIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className}>
      <circle cx="10" cy="10" r="9" fill="url(#coinGrad)" />
      <circle cx="10" cy="10" r="6" fill="none" stroke="#B8860B" strokeWidth="0.8" />
      <text x="10" y="13.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#8B6914">$</text>
      <defs>
        <linearGradient id="coinGrad" x1="1" y1="1" x2="19" y2="19">
          <stop stopColor={GOLD_LIGHT} />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor="#B8860B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DiamondCurrencyIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className}>
      <path d="M10 2l7 8-7 8-7-8 7-8z" fill="url(#diamondCurrencyGrad)" />
      <path d="M10 4l4.5 5L10 16 5.5 9 10 4z" fill="white" opacity="0.3" />
      <defs>
        <linearGradient id="diamondCurrencyGrad" x1="3" y1="2" x2="17" y2="18">
          <stop stopColor="#A8D8FF" />
          <stop offset="0.5" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============ MISC ICONS ============

export function SettingsIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

export function BellIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

export function LockIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

export function SendIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export function ArrowBackIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function CameraIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function ImageIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export function MicIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <path d="M12 19v4M8 23h8" />
    </svg>
  );
}

export function EmojiIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <circle cx="9" cy="9" r="0.5" fill={color} />
      <circle cx="15" cy="9" r="0.5" fill={color} />
    </svg>
  );
}

export function MoreIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

export function CheckIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function DoubleCheckIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6L7 17l-5-5" />
      <path d="M22 6L11 17" />
    </svg>
  );
}

export function EyeIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function GlobeIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

export function FingerPrintIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 10a2 2 0 00-2 2c0 3.3-1 6-2.5 8.2" />
      <path d="M12 10a2 2 0 012 2c0 3.3 1 6 2.5 8.2" />
      <path d="M8 14a5 5 0 008 0" />
      <path d="M12 2a8 8 0 00-8 8c0 2.5-1 4.5-2 6" />
      <path d="M12 2a8 8 0 018 8c0 2.5 1 4.5 2 6" />
    </svg>
  );
}

// ============ FLAGS ============

/**
 * Flag of South Yemen (علم الجنوب) - horizontal tricolor: red / white / black
 * with a light blue triangle at the hoist (left) side.
 * Used in: login screen, profile badge, app watermark.
 */
export function SouthYemenFlagIcon({ size = 24, className, rounded = true }: IconProps & { rounded?: boolean }) {
  return (
    <svg
      width={size}
      height={size * 0.667}
      viewBox="0 0 60 40"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      style={rounded ? { borderRadius: '4px', overflow: 'hidden' } : undefined}
    >
      {/* Red stripe (top) */}
      <rect x="0" y="0" width="60" height="13.33" fill="#CE1126" />
      {/* White stripe (middle) */}
      <rect x="0" y="13.33" width="60" height="13.34" fill="#FFFFFF" />
      {/* Black stripe (bottom) */}
      <rect x="0" y="26.67" width="60" height="13.33" fill="#000000" />
      {/* Blue triangle at the hoist (left) */}
      <polygon points="0,0 24,20 0,40" fill="#3A7BCE" />
    </svg>
  );
}

/**
 * Flag of the Republic of Yemen - horizontal tricolor: red / white / black.
 * (Solid red on top, white middle, black bottom — no emblem.)
 */
export function YemenFlagIcon({ size = 24, className, rounded = true }: IconProps & { rounded?: boolean }) {
  return (
    <svg
      width={size}
      height={size * 0.667}
      viewBox="0 0 60 40"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      style={rounded ? { borderRadius: '4px', overflow: 'hidden' } : undefined}
    >
      <rect x="0" y="0" width="60" height="13.33" fill="#CE1126" />
      <rect x="0" y="13.33" width="60" height="13.34" fill="#FFFFFF" />
      <rect x="0" y="26.67" width="60" height="13.33" fill="#000000" />
    </svg>
  );
}

// ============ CONNECTION STATUS ICONS ============

export function WifiOffIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 1l22 22" />
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0122.58 9" />
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

export function WifiIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12.55a11 11 0 0114.08 0" />
      <path d="M1.42 9a16 16 0 0121.16 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

export function RefreshIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}
