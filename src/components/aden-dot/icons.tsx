/**
 * Aden Dot — Custom SVG Icon Library
 * ===================================
 * All icons are drawn with consistent stroke width (1.8),
 * rounded line caps, and gold (#D4A853) as the default color.
 * NO emojis — every icon is a custom SVG path so the app has
 * a unified visual language across all screens.
 *
 * Usage:
 *   <IconHeart size={20} color="var(--primary)" />
 *   <IconHeartFilled size={20} color="#E0245E" />
 *
 * Most icons accept optional `filled` prop to switch between
 * outline and solid variants.
 */

import type { CSSProperties } from 'react';

export interface IconProps {
  size?: number;
  color?: string;
  filled?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

const defaultProps = {
  size: 20,
  color: '#D4A853',
  filled: false,
  strokeWidth: 1.8,
  className: '',
  style: {},
};

function SvgWrap({
  size = 20,
  children,
  className = '',
  style = {},
}: {
  size?: number;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// ============ Heart / Like ============
export function IconHeart({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Comment ============
export function IconComment({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </SvgWrap>
  );
}

// ============ Share ============
export function IconShare({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </SvgWrap>
  );
}

// ============ Bookmark / Save ============
export function IconBookmark({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Gift ============
export function IconGift({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" fill={filled ? 'currentColor' : 'none'} />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </SvgWrap>
  );
}

// ============ Live Stream ============
export function IconLive({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="3" fill={filled ? 'currentColor' : 'none'} />
      <path d="M6.343 17.657a8 8 0 0 1 0-11.314M17.657 6.343a8 8 0 0 1 0 11.314M3.515 20.485a12 12 0 0 1 0-16.97M20.485 3.515a12 12 0 0 1 0 16.97" />
    </SvgWrap>
  );
}

// ============ User ============
export function IconUser({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        fill={filled ? 'currentColor' : 'none'}
      />
      <circle cx="12" cy="7" r="4" fill={filled ? 'currentColor' : 'none'} />
    </SvgWrap>
  );
}

// ============ User Check (Following) ============
export function IconUserCheck({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </SvgWrap>
  );
}

// ============ User Plus (Follow) ============
export function IconUserPlus({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </SvgWrap>
  );
}

// ============ User X (Unfollow) ============
export function IconUserX({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="18" y1="8" x2="23" y2="13" />
      <line x1="23" y1="8" x2="18" y2="13" />
    </SvgWrap>
  );
}

// ============ Wallet ============
export function IconWallet({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M21 12V7H5a2 2 0 0 1 0-4h14v4"
        fill={filled ? 'currentColor' : 'none'}
      />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" fill={filled ? 'currentColor' : 'none'} />
    </SvgWrap>
  );
}

// ============ Diamond ============
export function IconDiamond({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M6 3h12l4 6-10 13L2 9Z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <path d="M11 3 8 9l4 13 4-13-3-6" />
      <line x1="2" y1="9" x2="22" y2="9" />
    </SvgWrap>
  );
}

// ============ Coin ============
export function IconCoin({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="9" fill={filled ? 'currentColor' : 'none'} />
      <path d="M14.5 9.5a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.7-2.5 2s1.1 1.7 2.5 2 2.5.7 2.5 2-1.1 2-2.5 2-2.5-.6-2.5-1.5" />
      <line x1="12" y1="6" x2="12" y2="7.5" />
      <line x1="12" y1="16.5" x2="12" y2="18" />
    </SvgWrap>
  );
}

// ============ Bell (Notification) ============
export function IconBell({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        fill={filled ? 'currentColor' : 'none'}
      />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </SvgWrap>
  );
}

// ============ Search ============
export function IconSearch({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </SvgWrap>
  );
}

// ============ Chat ============
export function IconChat({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Settings (Gear) ============
export function IconSettings({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </SvgWrap>
  );
}

// ============ More (Horizontal Dots) ============
export function IconMore({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </SvgWrap>
  );
}

// ============ More (Vertical Dots) ============
export function IconMoreVertical({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </SvgWrap>
  );
}

// ============ Block ============
export function IconBlock({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="9" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
    </SvgWrap>
  );
}

// ============ Flag (Report) ============
export function IconFlag({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <line x1="4" y1="22" x2="4" y2="15" />
    </SvgWrap>
  );
}

// ============ Trash ============
export function IconTrash({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </SvgWrap>
  );
}

// ============ Edit / Pencil ============
export function IconEdit({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </SvgWrap>
  );
}

// ============ Eye (View) ============
export function IconEye({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </SvgWrap>
  );
}

// ============ Image ============
export function IconImage({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </SvgWrap>
  );
}

// ============ Video ============
export function IconVideo({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polygon
        points="23 7 16 12 23 17 23 7"
        fill={filled ? 'currentColor' : 'none'}
      />
      <rect
        x="1"
        y="5"
        width="15"
        height="14"
        rx="2"
        ry="2"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Camera ============
export function IconCamera({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </SvgWrap>
  );
}

// ============ Home ============
export function IconHome({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Compass (Explore) ============
export function IconCompass({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="10" fill={filled ? 'currentColor' : 'none'} />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={filled ? 'white' : 'currentColor'} />
    </SvgWrap>
  );
}

// ============ Star (Premium) ============
export function IconStar({ size, color = '#D4A853', filled = true, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Lock (Private) ============
export function IconLock({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill={filled ? 'currentColor' : 'none'} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </SvgWrap>
  );
}

// ============ Globe (Public) ============
export function IconGlobe({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </SvgWrap>
  );
}

// ============ Users (Group) ============
export function IconUsers({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        fill={filled ? 'currentColor' : 'none'}
      />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </SvgWrap>
  );
}

// ============ Trending Up ============
export function IconTrendingUp({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </SvgWrap>
  );
}

// ============ Hash (Hashtag) ============
export function IconHash({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </SvgWrap>
  );
}

// ============ At (Mention) ============
export function IconAt({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </SvgWrap>
  );
}

// ============ Check (Plain) ============
export function IconCheck({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polyline points="20 6 9 17 4 12" />
    </SvgWrap>
  );
}

// ============ X / Close ============
export function IconX({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </SvgWrap>
  );
}

// ============ Arrow Left / Right / Up / Down ============
export function IconArrowLeft({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </SvgWrap>
  );
}

export function IconArrowRight({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </SvgWrap>
  );
}

export function IconArrowUp({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </SvgWrap>
  );
}

// ============ Verified Badge (multi-color, used inline) ============
// size hint: render at 16/18/20px next to usernames
export function IconVerified({
  size = 16,
  color = '#1D9BF0',
  type = 'verified',
  className,
  style,
}: IconProps & { type?: 'vip' | 'government' | 'press' | 'organization' | 'verified' }) {
  // Each badge type gets a distinct color + tiny symbol inside
  const config: Record<string, { color: string; inner: React.ReactNode }> = {
    vip: {
      color: '#D4A853',
      inner: <polygon points="12 5 14 10 19 10 15 13.5 16.5 19 12 16 7.5 19 9 13.5 5 10 10 10" fill="white" />,
    },
    government: {
      color: '#E0245E',
      inner: <polyline points="9 12 11.5 14.5 16 9" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    },
    press: {
      color: '#1D9BF0',
      inner: <polyline points="9 12 11.5 14.5 16 9" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    },
    organization: {
      color: '#17BF63',
      inner: <polyline points="9 12 11.5 14.5 16 9" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    },
    verified: {
      color: '#8899A6',
      inner: <polyline points="9 12 11.5 14.5 16 9" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    },
  };
  const cfg = config[type] || config.verified;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-label={type}
    >
      {/* scalloped seal shape */}
      <path
        d="M12 2l2.4 1.8 3-.3 1.2 2.8 2.8 1.2-.3 3L23 12l-1.8 2.4.3 3-2.8 1.2-1.2 2.8-3-.3L12 23l-2.4-1.8-3 .3-1.2-2.8L2.6 17.7l.3-3L1 12l1.8-2.4-.3-3 2.8-1.2L6.5 3.4l3 .3L12 2z"
        fill={cfg.color}
      />
      {cfg.inner}
    </svg>
  );
}

// ============ Crown (VIP only) ============
export function IconCrown({ size = 18, color = '#D4A853', filled = true, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M2 19h20l-2-9-5 3-3-7-3 7-5-3-2 9z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <circle cx="2" cy="10" r="1.5" fill="currentColor" />
      <circle cx="22" cy="10" r="1.5" fill="currentColor" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
    </SvgWrap>
  );
}

// ============ Logout ============
export function IconLogout({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </SvgWrap>
  );
}

// ============ Plus (Add) ============
export function IconPlus({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </SvgWrap>
  );
}

// ============ Clock ============
export function IconClock({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </SvgWrap>
  );
}

// ============ Pin (Pinned post) ============
export function IconPin({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M12 17v5"
        stroke={color}
      />
      <path
        d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Mic ============
export function IconMic({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </SvgWrap>
  );
}

// ============ Phone ============
export function IconPhone({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Mail ============
export function IconMail({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <polyline points="22,6 12,13 2,6" />
    </SvgWrap>
  );
}

// ============ Link ============
export function IconLink({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </SvgWrap>
  );
}

// ============ Send (Post comment / DM) ============
export function IconSend({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </SvgWrap>
  );
}

// ============ Smile (Reaction) ============
export function IconSmile({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </SvgWrap>
  );
}

// ============ Filter (Funnel) ============
export function IconFilter({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </SvgWrap>
  );
}

// ============ Pause ============
export function IconPause({ size, color = '#D4A853', filled = true, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <rect x="6" y="4" width="4" height="16" fill={filled ? 'currentColor' : 'none'} />
      <rect x="14" y="4" width="4" height="16" fill={filled ? 'currentColor' : 'none'} />
    </SvgWrap>
  );
}

// ============ Play ============
export function IconPlay({ size, color = '#D4A853', filled = true, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polygon points="5 3 19 12 5 21 5 3" fill={filled ? 'currentColor' : 'none'} />
    </SvgWrap>
  );
}

// ============ Volume ============
export function IconVolume({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </SvgWrap>
  );
}

// ============ Volume Mute ============
export function IconVolumeMute({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </SvgWrap>
  );
}

// ============ Moon (Dark mode) ============
export function IconMoon({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Sun (Light mode) ============
export function IconSun({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="5" fill={filled ? 'currentColor' : 'none'} />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </SvgWrap>
  );
}

// ============ Refresh ============
export function IconRefresh({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </SvgWrap>
  );
}

// ============ Alert (Warning) ============
export function IconAlert({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </SvgWrap>
  );
}

// ============ Info ============
export function IconInfo({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="10" fill={filled ? 'currentColor' : 'none'} />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </SvgWrap>
  );
}

// ============ Pause/Ban Circle ============
export function IconBan({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </SvgWrap>
  );
}

// ============ Shield (Admin) ============
export function IconShield({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </SvgWrap>
  );
}

// ============ Chart (Stats) ============
export function IconChart({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </SvgWrap>
  );
}

// ============ Database ============
export function IconDatabase({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </SvgWrap>
  );
}

// ============ Wifi Off ============
export function IconWifiOff({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </SvgWrap>
  );
}

// ============ Map Pin (Location) ============
export function IconMapPin({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <circle cx="12" cy="10" r="3" />
    </SvgWrap>
  );
}

// ============ Calendar ============
export function IconCalendar({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </SvgWrap>
  );
}

// ============ Download ============
export function IconDownload({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </SvgWrap>
  );
}

// ============ Upload ============
export function IconUpload({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </SvgWrap>
  );
}

// ============ Spinner (Loading) ============
export function IconSpinner({ size = 20, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </SvgWrap>
  );
}

// ============ File / Document ============
export function IconFile({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </SvgWrap>
  );
}

// ============ South Flag (Custom for South Arabia — represents the uploaded flag) ============
// This icon is a stylized representation of the modern South Yemen movement flag:
// red/white/black horizontal stripes with a blue triangle on the hoist side
// containing a red five-pointed star.
export function IconSouthFlag({ size = 24, color = '#D4A853', className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-label="South Arabia flag"
    >
      {/* pole */}
      <rect x="3" y="2" width="1.2" height="20" fill={color} />
      {/* flag body */}
      <g transform="translate(4.2 3)">
        {/* stripes */}
        <rect x="0" y="0" width="16" height="2.5" fill="#CE1126" />
        <rect x="0" y="2.5" width="16" height="2.5" fill="#FFFFFF" />
        <rect x="0" y="5" width="16" height="2.5" fill="#000000" />
        {/* blue triangle */}
        <polygon points="0,0 7,3.75 0,7.5" fill="#3DA5D9" />
        {/* red star in triangle */}
        <polygon
          points="2.4,2.6 2.85,3.5 3.85,3.6 3.1,4.25 3.35,5.2 2.4,4.7 1.45,5.2 1.7,4.25 0.95,3.6 1.95,3.5"
          fill="#CE1126"
        />
      </g>
    </svg>
  );
}

// ============ Camera with Plus (Create Post) ============
export function IconCreatePost({ size = 24, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
      <line x1="20" y1="3" x2="20" y2="9" stroke={color} />
      <line x1="17" y1="6" x2="23" y2="6" stroke={color} />
    </SvgWrap>
  );
}

// ============ Heart Pulse (live activity indicator) ============
export function IconHeartPulse({ size = 20, color = '#E0245E', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" />
      <polyline points="3.5 12 8 12 10 9 13 15 15 12 20.5 12" stroke="white" strokeWidth="1.5" />
    </SvgWrap>
  );
}

// ============ Award (Achievement) ============
export function IconAward({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="8" r="7" fill={filled ? 'currentColor' : 'none'} />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </SvgWrap>
  );
}

// ============ Bookmark / Saved list ============
export function IconBookmarkList({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </SvgWrap>
  );
}

// ============ Tag ============
export function IconTag({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path
        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </SvgWrap>
  );
}

// ============ Help / Question ============
export function IconHelp({ size, color = '#D4A853', filled, className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <circle cx="12" cy="12" r="10" fill={filled ? 'currentColor' : 'none'} />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </SvgWrap>
  );
}

// ============ Power ============
export function IconPower({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </SvgWrap>
  );
}

// ============ Key ============
export function IconKey({ size, color = '#D4A853', className, style }: IconProps) {
  return (
    <SvgWrap size={size} className={className} style={{ color, ...style }}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </SvgWrap>
  );
}
