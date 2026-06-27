import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qtbmdev.adendot',
  appName: 'Aden Dot',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Allow mixed content for legacy API endpoints (only if needed)
    cleartext: true,
  },
  // Enable native CapacitorHttp to bypass WebView CORS for ALL fetch calls
  // This is critical for Supabase auth + REST calls from Capacitor WebView
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FFFFFF',
      overlaysWebView: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#D4A853'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
