/**
 * Google Sign-In Helper for Aden Dot
 * -------------------------------------
 * Works on both Web (Google Identity Services) and Capacitor (native Google Auth).
 *
 * On native Android: Uses @codetrix-studio/capacitor-google-auth
 * On Web: Falls back to Google Identity Services (GIS) script
 *
 * Setup requirements (documented for the user):
 *  1. Create a Google OAuth Client ID at https://console.cloud.google.com/apis/credentials
 *  2. For Android: Add the package name (com.qtbmdev.adendot) and SHA-1 fingerprint
 *  3. For Web: Add the authorized JavaScript origins
 *  4. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in env / GitHub Actions
 *  5. Configure capacitor.config.ts with the same client ID (serverClientId)
 */

// Default client ID - user should replace with their own
const DEFAULT_GOOGLE_CLIENT_ID = '1009829494587-kfj3q8sbqtnl1prq5nq35lmqe7q8m3v4.apps.googleusercontent.com';

export function getGoogleClientId(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  }
  return DEFAULT_GOOGLE_CLIENT_ID;
}

export interface GoogleProfile {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

// Lazy-load the Capacitor Google Auth plugin
async function getCapacitorGoogleAuth(): Promise<any | null> {
  try {
    if (typeof window === 'undefined') return null;
    // Check if Capacitor is available
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return null;
    // Dynamic import the plugin
    const mod = await import('@codetrix-studio/capacitor-google-auth');
    return mod.GoogleAuth;
  } catch {
    return null;
  }
}

// Initialize the plugin (called once at app startup)
export async function initGoogleAuth(): Promise<void> {
  const GoogleAuth = await getCapacitorGoogleAuth();
  if (GoogleAuth) {
    try {
      await GoogleAuth.initialize({
        clientId: getGoogleClientId(),
        scopes: ['profile', 'email'],
        grantOfflineAccess: false,
      });
      console.log('[GoogleAuth] Initialized on native');
    } catch (e) {
      console.warn('[GoogleAuth] Init failed:', e);
    }
  } else {
    // On web, load GIS script if not already loaded
    if (typeof window !== 'undefined' && !document.getElementById('google-gis-script')) {
      const script = document.createElement('script');
      script.id = 'google-gis-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      console.log('[GoogleAuth] GIS script loaded for web');
    }
  }
}

/**
 * Sign in with Google. Returns the user profile or throws on error.
 */
export async function signInWithGoogle(): Promise<GoogleProfile> {
  const GoogleAuth = await getCapacitorGoogleAuth();

  if (GoogleAuth) {
    // Native path
    try {
      const result = await GoogleAuth.signIn();
      if (result?.authentication?.idToken) {
        // Decode the ID token to get profile
        const payload = decodeJwt(result.authentication.idToken);
        return {
          email: payload.email || '',
          name: payload.name || payload.email?.split('@')[0] || 'User',
          picture: payload.picture || '',
          sub: payload.sub || '',
        };
      }
      throw new Error('فشل تسجيل الدخول عبر Google - لم يتم استلام رمز الدخول');
    } catch (e: any) {
      if (e?.message?.includes('cancelled') || e?.code === '12501') {
        throw new Error('تم إلغاء تسجيل الدخول');
      }
      throw new Error('فشل تسجيل الدخول عبر Google: ' + (e?.message || 'خطأ غير معروف'));
    }
  }

  // Web fallback - use Google Identity Services
  return new Promise<GoogleProfile>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.google) {
      reject(new Error('Google Identity Services غير متاح - استخدم تسجيل الدخول العادي'));
      return;
    }

    try {
      const clientId = getGoogleClientId();
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) {
            try {
              const payload = decodeJwt(response.credential);
              resolve({
                email: payload.email || '',
                name: payload.name || payload.email?.split('@')[0] || 'User',
                picture: payload.picture || '',
                sub: payload.sub || '',
              });
            } catch (e) {
              reject(new Error('فشل في قراءة بيانات Google'));
            }
          } else {
            reject(new Error('لم يتم استلام بيانات اعتماد Google'));
          }
        },
      });
      window.google.accounts.id.prompt();
    } catch (e: any) {
      reject(new Error('فشل تهيئة Google: ' + (e?.message || '')));
    }
  });
}

/**
 * Sign out from Google (native only)
 */
export async function signOutGoogle(): Promise<void> {
  const GoogleAuth = await getCapacitorGoogleAuth();
  if (GoogleAuth) {
    try {
      await GoogleAuth.signOut();
    } catch {
      // ignore
    }
  }
}

// ============ Helpers ============
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[GoogleAuth] JWT decode failed:', e);
    return {};
  }
}

// Augment the Window type
declare global {
  interface Window {
    google?: any;
  }
}
