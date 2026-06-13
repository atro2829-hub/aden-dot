/**
 * Capacitor Permission Request Utilities
 * Handles runtime permission requests for Android using Capacitor APIs.
 * Shows native permission dialogs when the user first uses features.
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';

// ============ Permission Status Types ============

export interface PermissionStatus {
  camera: 'granted' | 'denied' | 'prompt' | 'unavailable';
  storage: 'granted' | 'denied' | 'prompt' | 'unavailable';
  microphone: 'granted' | 'denied' | 'prompt' | 'unavailable';
  location: 'granted' | 'denied' | 'prompt' | 'unavailable';
  notifications: 'granted' | 'denied' | 'prompt' | 'unavailable';
}

// ============ Individual Permission Requests ============

/**
 * Request camera permission using Capacitor Camera API.
 * This triggers the native Android permission dialog.
 */
export async function requestCameraPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  if (!Capacitor.isNativePlatform()) return 'unavailable';

  try {
    const permission = await Camera.requestPermissions();
    // Camera.requestPermissions returns { camera: string, photos: string }
    const state = permission.camera as string;
    if (state === 'granted') return 'granted';
    if (state === 'denied') return 'denied';
    return 'prompt';
  } catch (error) {
    console.error('[Permissions] Camera permission error:', error);
    return 'unavailable';
  }
}

/**
 * Request storage/media permission using Capacitor Filesystem API.
 * On Android 13+ this requests READ_MEDIA_IMAGES and READ_MEDIA_VIDEO.
 * On older versions it requests READ_EXTERNAL_STORAGE and WRITE_EXTERNAL_STORAGE.
 */
export async function requestStoragePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  if (!Capacitor.isNativePlatform()) return 'unavailable';

  try {
    const permission = await Filesystem.requestPermissions();
    const state = permission.publicStorage as string;
    if (state === 'granted') return 'granted';
    if (state === 'denied') return 'denied';
    return 'prompt';
  } catch (error) {
    console.error('[Permissions] Storage permission error:', error);
    return 'unavailable';
  }
}

/**
 * Request microphone/record audio permission.
 * Uses Camera API with microphone option as a proxy since there's no
 * direct Capacitor microphone plugin. Falls back to browser MediaDevices API.
 */
export async function requestMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  if (!Capacitor.isNativePlatform()) return 'unavailable';

  try {
    // On Android, the RECORD_AUDIO permission is requested through the native layer.
    // We use a workaround by requesting it via the Web Audio API which triggers the native dialog.
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed to trigger the permission
      stream.getTracks().forEach(track => track.stop());
      return 'granted';
    }
    return 'unavailable';
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      return 'denied';
    }
    console.error('[Permissions] Microphone permission error:', error);
    return 'unavailable';
  }
}

/**
 * Request location permission using Capacitor Geolocation API.
 * This triggers the native Android location permission dialog.
 */
export async function requestLocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  if (!Capacitor.isNativePlatform()) return 'unavailable';

  try {
    // requestPermissions is available on the Geolocation plugin
    const permission = await Geolocation.requestPermissions();
    const state = permission.location as string;
    if (state === 'granted' || state === 'coarse') return 'granted';
    if (state === 'denied') return 'denied';
    return 'prompt';
  } catch (error) {
    console.error('[Permissions] Location permission error:', error);
    return 'unavailable';
  }
}

/**
 * Request push notification permission using Capacitor PushNotifications API.
 * On Android 13+ this triggers the POST_NOTIFICATIONS permission dialog.
 */
export async function requestNotificationsPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  if (!Capacitor.isNativePlatform()) return 'unavailable';

  try {
    return new Promise((resolve) => {
      // Check if already granted
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          // Register for push notifications
          PushNotifications.register();
          resolve('granted');
        } else if (result.receive === 'denied') {
          resolve('denied');
        } else {
          resolve('prompt');
        }
      }).catch((error) => {
        console.error('[Permissions] Notifications permission error:', error);
        resolve('unavailable');
      });
    });
  } catch (error) {
    console.error('[Permissions] Notifications permission error:', error);
    return 'unavailable';
  }
}

// ============ Check Permissions (without requesting) ============

/**
 * Check camera permission status without showing a dialog.
 */
export async function checkCameraPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  if (!Capacitor.isNativePlatform()) return 'unavailable';

  try {
    const permission = await Camera.checkPermissions();
    const state = permission.camera as string;
    if (state === 'granted') return 'granted';
    if (state === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unavailable';
  }
}

/**
 * Check storage permission status without showing a dialog.
 */
export async function checkStoragePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  if (!Capacitor.isNativePlatform()) return 'unavailable';

  try {
    const permission = await Filesystem.checkPermissions();
    const state = permission.publicStorage as string;
    if (state === 'granted') return 'granted';
    if (state === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unavailable';
  }
}

/**
 * Check location permission status without showing a dialog.
 */
export async function checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  if (!Capacitor.isNativePlatform()) return 'unavailable';

  try {
    const permission = await Geolocation.checkPermissions();
    const state = permission.location as string;
    if (state === 'granted' || state === 'coarse') return 'granted';
    if (state === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unavailable';
  }
}

// ============ Request All Permissions ============

/**
 * Request all required permissions at once.
 * Called on first login to set up the app.
 * Returns the status of each permission request.
 */
export async function requestAllPermissions(): Promise<PermissionStatus> {
  if (!Capacitor.isNativePlatform()) {
    return {
      camera: 'unavailable',
      storage: 'unavailable',
      microphone: 'unavailable',
      location: 'unavailable',
      notifications: 'unavailable',
    };
  }

  console.log('[Permissions] Requesting all permissions...');

  // Request permissions in sequence to avoid overwhelming the user
  const camera = await requestCameraPermission();
  const storage = await requestStoragePermission();
  const microphone = await requestMicrophonePermission();
  const location = await requestLocationPermission();
  const notifications = await requestNotificationsPermission();

  const status: PermissionStatus = {
    camera,
    storage,
    microphone,
    location,
    notifications,
  };

  console.log('[Permissions] All permission results:', status);

  // Save that we've requested permissions at least once
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({
      key: 'permissions_requested',
      value: 'true',
    });
  } catch {
    // Ignore preferences errors
  }

  return status;
}

/**
 * Check if this is the first time the user has logged in
 * and permissions haven't been requested yet.
 */
export async function shouldRequestPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const { Preferences } = await import('@capacitor/preferences');
    const result = await Preferences.get({ key: 'permissions_requested' });
    return result.value !== 'true';
  } catch {
    return false;
  }
}

/**
 * Request a specific permission by feature name.
 * Useful for requesting permissions lazily when the user first uses a feature.
 */
export async function requestPermissionForFeature(
  feature: 'camera' | 'storage' | 'microphone' | 'location' | 'notifications'
): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
  switch (feature) {
    case 'camera':
      return requestCameraPermission();
    case 'storage':
      return requestStoragePermission();
    case 'microphone':
      return requestMicrophonePermission();
    case 'location':
      return requestLocationPermission();
    case 'notifications':
      return requestNotificationsPermission();
    default:
      return 'unavailable';
  }
}
