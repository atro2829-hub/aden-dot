/**
 * Aden Dot — Utility Helpers
 * =================================
 * Small helpers used everywhere: relative time, number formatting,
 * color tokens, feature flag checks, etc.
 *
 * Every helper focuses on the small details that make a social
 * app feel polished (e.g., "منذ ٣ دقائق" instead of "2026-06-28 17:04").
 */

// ============ Relative Time (Arabic) ============
// Returns strings like "الآن", "منذ دقيقة", "منذ ٣ ساعات", "أمس", "منذ يومين"
export function formatRelativeTime(input: number | string | Date): string {
  const date = new Date(input);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  // Use Arabic-Indic digits for a more native feel
  const toArabicDigits = (n: number): string => {
    if (n === 0) return '٠';
    return String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
  };

  if (diffSec < 30) return 'الآن';
  if (diffSec < 60) return `منذ ${toArabicDigits(diffSec)} ثانية`;
  if (diffMin === 1) return 'منذ دقيقة';
  if (diffMin < 11) return `منذ ${toArabicDigits(diffMin)} دقائق`;
  if (diffMin < 60) return `منذ ${toArabicDigits(diffMin)} دقيقة`;
  if (diffHour === 1) return 'منذ ساعة';
  if (diffHour < 11) return `منذ ${toArabicDigits(diffHour)} ساعات`;
  if (diffHour < 24) return `منذ ${toArabicDigits(diffHour)} ساعة`;
  if (diffDay === 1) return 'أمس';
  if (diffDay === 2) return 'منذ يومين';
  if (diffDay < 11) return `منذ ${toArabicDigits(diffDay)} أيام`;
  if (diffDay < 30) return `منذ ${toArabicDigits(diffDay)} يوماً`;
  if (diffMonth === 1) return 'منذ شهر';
  if (diffMonth < 12) return `منذ ${toArabicDigits(diffMonth)} أشهر`;
  if (diffYear === 1) return 'منذ سنة';
  return `منذ ${toArabicDigits(diffYear)} سنوات`;
}

// ============ Absolute Time (Arabic) ============
// Returns "٢٨ يونيو ٢٠٢٦ - ٥:٠٤ م"
export function formatAbsoluteTime(input: number | string | Date): string {
  const date = new Date(input);
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hour = date.getHours();
  const minute = date.getMinutes();
  const period = hour < 12 ? 'ص' : 'م';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  const toAr = (n: number) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
  const pad = (n: number) => toAr(n).padStart(2, '٠');
  return `${toAr(day)} ${month} ${toAr(year)} - ${pad(hour)}:${pad(minute)} ${period}`;
}

// ============ Compact Number (Arabic) ============
// 1234 -> ١٫٢K, 1234567 -> ١٫٢M, 9500 -> ٩٫٥K
export function formatCompactNumber(n: number): string {
  if (n === null || n === undefined || isNaN(n)) return '٠';
  const toAr = (s: string | number) => String(s).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
  if (n < 1000) return toAr(n);
  if (n < 10000) {
    // Show 9500 as ٩٬٥٠٠ (with thousands separator) rather than ٩٫٥K — feels more precise for small numbers
    return toAr(n.toLocaleString('en-US'));
  }
  if (n < 1000000) {
    const k = n / 1000;
    const rounded = k >= 100 ? Math.round(k) : Math.round(k * 10) / 10;
    return toAr(rounded) + 'K';
  }
  if (n < 1000000000) {
    const m = n / 1000000;
    const rounded = m >= 100 ? Math.round(m) : Math.round(m * 10) / 10;
    return toAr(rounded) + 'M';
  }
  const b = n / 1000000000;
  return toAr(Math.round(b * 10) / 10) + 'B';
}

// ============ Full Count (Arabic with plural forms) ============
// 0 -> "٠ متابع", 1 -> "١ متابع", 2 -> "٢ متابعان", 3-10 -> "X متابعين", 11+ -> "X متابعاً"
export function formatCountWithWord(n: number, singular: string, dual: string, plural3to10: string, plural11plus: string): string {
  const toAr = (num: number) => String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
  if (n === 0) return `لا توجد ${singular}`;
  if (n === 1) return `${toAr(1)} ${singular}`;
  if (n === 2) return `${toAr(2)} ${dual}`;
  if (n >= 3 && n <= 10) return `${toAr(n)} ${plural3to10}`;
  return `${toAr(n)} ${plural11plus}`;
}

// Specialized helpers
export const formatFollowers = (n: number) => formatCountWithWord(n, 'متابع', 'متابعان', 'متابعين', 'متابعاً');
export const formatFollowing = (n: number) => formatCountWithWord(n, 'متابَع', 'متابَعان', 'متابَعين', 'متابَعاً');
export const formatPosts = (n: number) => formatCountWithWord(n, 'منشور', 'منشوران', 'منشورات', 'منشوراً');
export const formatLikes = (n: number) => formatCountWithWord(n, 'إعجاب', 'إعجابان', 'إعجابات', 'إعجاباً');
export const formatComments = (n: number) => formatCountWithWord(n, 'تعليق', 'تعليقان', 'تعليقات', 'تعليقاً');
export const formatShares = (n: number) => formatCountWithWord(n, 'مشاركة', 'مشاركتان', 'مشاركات', 'مشاركةً');
export const formatViews = (n: number) => formatCountWithWord(n, 'مشاهدة', 'مشاهدتان', 'مشاهدات', 'مشاهدةً');
export const formatGifts = (n: number) => formatCountWithWord(n, 'هدية', 'هديتان', 'هدايا', 'هديةً');

// ============ Brand Colors ============
export const COLORS = {
  primary: '#D4A853',
  primaryDark: '#B58F3F',
  primaryLight: '#E8C777',
  background: '#FAF8F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F2EB',
  border: '#EAE4D5',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  success: '#17BF63',
  warning: '#FFB300',
  danger: '#E0245E',
  info: '#1D9BF0',
  badge: {
    vip: '#D4A853',
    government: '#E0245E',
    press: '#1D9BF0',
    organization: '#17BF63',
    verified: '#8899A6',
    founder: '#D4A853',
  },
} as const;

// ============ Initials (for avatars) ============
export function getInitials(name?: string): string {
  if (!name) return '؟';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '؟';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ============ Avatar Background Color (deterministic from uid) ============
const AVATAR_COLORS = ['#D4A853', '#E0245E', '#1D9BF0', '#17BF63', '#9C27B0', '#FF6B35', '#00BCD4', '#8BC34A'];
export function getAvatarColor(seed?: string): string {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ============ Validate URL ============
export function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ============ Detect Hashtags / Mentions in text ============
export function extractHashtags(text: string): string[] {
  const re = /#[\u0600-\u06FF\w]+/g;
  return text.match(re) || [];
}

export function extractMentions(text: string): string[] {
  const re = /@[\u0600-\u06FF\w]+/g;
  return text.match(re) || [];
}

// ============ Debounce (for search inputs) ============
export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  }) as T;
}

// ============ Class Name Merger (tiny clsx-like helper) ============
export function cx(...classes: (string | false | null | undefined | 0)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ============ Haptic feedback wrapper (Capacitor) ============
export async function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
  try {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.Haptics) {
      const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins.Haptics;
      const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
      await Haptics.impact({ style: map[style] });
    }
  } catch {
    // Silent fail — haptics not available
  }
}

// ============ File size formatter ============
export function formatFileSize(bytes: number): string {
  const toAr = (n: number | string) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
  if (bytes < 1024) return `${toAr(bytes)} بايت`;
  if (bytes < 1024 * 1024) return `${toAr((bytes / 1024).toFixed(1))} كيلوبايت`;
  if (bytes < 1024 * 1024 * 1024) return `${toAr((bytes / (1024 * 1024)).toFixed(1))} ميجابايت`;
  return `${toAr((bytes / (1024 * 1024 * 1024)).toFixed(1))} جيجابايت`;
}

// ============ Color shade (darken / lighten) ============
export function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(2.55 * percent)));
  return `rgb(${r}, ${g}, ${b})`;
}
