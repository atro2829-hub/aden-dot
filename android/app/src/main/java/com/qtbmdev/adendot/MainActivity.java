package com.qtbmdev.adendot;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.ArrayList;
import java.util.List;

/**
 * MainActivity for Aden Dot User App.
 *
 * Handles:
 * - Runtime permission requests (Camera, Storage, Mic, Location, Notifications)
 * - Deep link routing (adendot:// scheme)
 * - Biometric authentication support
 * - WebView debugging in dev builds
 * - Proper back-button handling
 * - Notification channel creation
 * - Network connectivity awareness
 */
public class MainActivity extends BridgeActivity {

    private static final String TAG = "AdenDot";

    // Permission request codes
    private static final int REQ_PERMISSIONS = 1001;

    // Required permissions array
    private final String[] REQUIRED_PERMISSIONS = buildPermissionList();

    // Activity result launcher for permission requests
    private final ActivityResultLauncher<String[]> permissionLauncher =
        registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), result -> {
            List<String> denied = new ArrayList<>();
            for (Map.Entry<String, Boolean> entry : result.entrySet()) {
                if (!entry.getValue()) {
                    denied.add(entry.getKey());
                }
            }
            if (!denied.isEmpty()) {
                Log.w(TAG, "Denied permissions: " + denied);
                showPermissionRationale(denied);
            } else {
                Log.i(TAG, "All permissions granted");
            }
        });

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable WebView debugging for development builds
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // Create notification channels for Android 8+
        createNotificationChannels();

        // Request essential permissions on first launch
        requestEssentialPermissions();

        // Handle deep link if app was opened via URL
        handleDeepLink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleDeepLink(intent);
    }

    // ============ Permission Handling ============

    /**
     * Build the list of permissions needed based on Android version.
     */
    private String[] buildPermissionList() {
        List<String> perms = new ArrayList<>();

        // Camera
        perms.add(Manifest.permission.CAMERA);

        // Storage - different permissions based on Android version
        if (Build.VERSION.SDK_INT >= 33) {
            // Android 13+
            perms.add(Manifest.permission.READ_MEDIA_IMAGES);
            perms.add(Manifest.permission.READ_MEDIA_VIDEO);
        } else {
            perms.add(Manifest.permission.READ_EXTERNAL_STORAGE);
            if (Build.VERSION.SDK_INT <= 29) {
                perms.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }
        }

        // Microphone
        perms.add(Manifest.permission.RECORD_AUDIO);

        // Location
        perms.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        perms.add(Manifest.permission.ACCESS_FINE_LOCATION);

        // Notifications (Android 13+)
        if (Build.VERSION.SDK_INT >= 33) {
            perms.add(Manifest.permission.POST_NOTIFICATIONS);
        }

        return perms.toArray(new String[0]);
    }

    /**
     * Request essential permissions needed for the app to function properly.
     * Only requests permissions that haven't been granted yet.
     */
    private void requestEssentialPermissions() {
        List<String> needed = new ArrayList<>();
        for (String perm : REQUIRED_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                needed.add(perm);
            }
        }

        if (!needed.isEmpty()) {
            String[] toRequest = needed.toArray(new String[0]);
            Log.i(TAG, "Requesting permissions: " + needed);
            permissionLauncher.launch(toRequest);
        }
    }

    /**
     * Show a dialog explaining why permissions are needed,
     * with an option to go to app settings.
     */
    private void showPermissionRationale(List<String> deniedPermissions) {
        StringBuilder message = new StringBuilder();
        message.append(getString(R.string.permission_rationale_message));

        boolean shouldGoToSettings = false;
        for (String perm : deniedPermissions) {
            if (!ActivityCompat.shouldShowRequestPermissionRationale(this, perm)) {
                shouldGoToSettings = true;
            }
        }

        if (shouldGoToSettings) {
            message.append("\n\n").append(getString(R.string.permission_settings_instruction));
        }

        new AlertDialog.Builder(this)
            .setTitle(R.string.permission_rationale_title)
            .setMessage(message.toString())
            .setPositiveButton(shouldGoToSettings ? R.string.open_settings : R.string.ok, (dialog, which) -> {
                if (shouldGoToSettings) {
                    openAppSettings();
                }
            })
            .setNegativeButton(R.string.skip, null)
            .setCancelable(true)
            .show();
    }

    /**
     * Open the app's settings page in Android Settings.
     */
    private void openAppSettings() {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.fromParts("package", getPackageName(), null));
        startActivity(intent);
    }

    // ============ Deep Link Handling ============

    /**
     * Handle incoming deep links (adendot:// scheme).
     * Routes the link to the WebView via Capacitor.
     */
    private void handleDeepLink(Intent intent) {
        if (intent == null) return;

        Uri data = intent.getData();
        if (data != null) {
            String url = data.toString();
            Log.i(TAG, "Deep link received: " + url);

            // Let Capacitor handle the URL routing
            if (this.getBridge() != null && this.getBridge().getWebView() != null) {
                this.getBridge().getWebView().loadUrl(url);
            }
        }
    }

    // ============ Notification Channels ============

    /**
     * Create notification channels required for Android 8.0+.
     * Channels: general, chat, live, gifts
     */
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT < 26) return;

        android.app.NotificationChannel general = new android.app.NotificationChannel(
            "general",
            getString(R.string.notification_channel_general),
            android.app.NotificationManager.IMPORTANCE_DEFAULT
        );
        general.setDescription(getString(R.string.notification_channel_general_desc));
        general.enableLights(true);
        general.setLightColor(0xD4A853);
        general.enableVibration(true);

        android.app.NotificationChannel chat = new android.app.NotificationChannel(
            "chat",
            getString(R.string.notification_channel_chat),
            android.app.NotificationManager.IMPORTANCE_HIGH
        );
        chat.setDescription(getString(R.string.notification_channel_chat_desc));
        chat.enableLights(true);
        chat.setLightColor(0xD4A853);
        chat.setShowBadge(true);

        android.app.NotificationChannel live = new android.app.NotificationChannel(
            "live",
            getString(R.string.notification_channel_live),
            android.app.NotificationManager.IMPORTANCE_HIGH
        );
        live.setDescription(getString(R.string.notification_channel_live_desc));
        live.enableLights(true);
        live.setLightColor(0xEF4444);
        live.setShowBadge(true);

        android.app.NotificationChannel gifts = new android.app.NotificationChannel(
            "gifts",
            getString(R.string.notification_channel_gifts),
            android.app.NotificationManager.IMPORTANCE_DEFAULT
        );
        gifts.setDescription(getString(R.string.notification_channel_gifts_desc));
        gifts.enableLights(true);
        gifts.setLightColor(0xD4A853);

        android.app.NotificationManager manager = getSystemService(android.app.NotificationManager.class);
        if (manager != null) {
            manager.createNotificationChannel(general);
            manager.createNotificationChannel(chat);
            manager.createNotificationChannel(live);
            manager.createNotificationChannel(gifts);
        }
    }

    // ============ Biometric Support ============

    /**
     * Check if biometric authentication is available on this device.
     */
    public boolean isBiometricAvailable() {
        BiometricManager biometricManager = BiometricManager.from(this);
        int status = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG);
        return status == BiometricManager.BIOMETRIC_SUCCESS;
    }

    /**
     * Show biometric authentication prompt.
     * @param callback Callback interface for auth results.
     */
    public void showBiometricPrompt(BiometricCallback callback) {
        if (!isBiometricAvailable()) {
            callback.onNotAvailable();
            return;
        }

        BiometricPrompt biometricPrompt = new BiometricPrompt(this,
            ContextCompat.getMainExecutor(this),
            new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                    super.onAuthenticationSucceeded(result);
                    callback.onSuccess();
                }

                @Override
                public void onAuthenticationFailed() {
                    super.onAuthenticationFailed();
                    callback.onFailed();
                }

                @Override
                public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                    super.onAuthenticationError(errorCode, errString);
                    callback.onError(errString.toString());
                }
            });

        BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
            .setTitle(getString(R.string.biometric_prompt_title))
            .setSubtitle(getString(R.string.biometric_prompt_subtitle))
            .setNegativeButtonText(getString(R.string.biometric_prompt_cancel))
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
            .build();

        biometricPrompt.authenticate(promptInfo);
    }

    /**
     * Callback interface for biometric authentication results.
     */
    public interface BiometricCallback {
        void onSuccess();
        void onFailed();
        void onError(String error);
        void onNotAvailable();
    }

    // ============ Back Button Handling ============

    @Override
    public void onBackPressed() {
        WebView webView = this.getBridge() != null ? this.getBridge().getWebView() : null;
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            // Move app to background instead of exiting
            moveTaskToBack(true);
        }
    }

    // ============ Network & App Lifecycle ============

    @Override
    protected void onResume() {
        super.onResume();
        // App came to foreground - notify the web layer
        notifyAppForeground();
    }

    @Override
    protected void onPause() {
        super.onPause();
        // App went to background
        notifyAppBackground();
    }

    /**
     * Notify the WebView that the app came to foreground.
     * Used to update user's online status and refresh data.
     */
    private void notifyAppForeground() {
        WebView webView = this.getBridge() != null ? this.getBridge().getWebView() : null;
        if (webView != null) {
            webView.evaluateJavascript(
                "if(window.__adendotLifecycle){window.__adendotLifecycle.onForeground()}",
                null
            );
        }
    }

    /**
     * Notify the WebView that the app went to background.
     * Used to update user's last_seen timestamp.
     */
    private void notifyAppBackground() {
        WebView webView = this.getBridge() != null ? this.getBridge().getWebView() : null;
        if (webView != null) {
            webView.evaluateJavascript(
                "if(window.__adendotLifecycle){window.__adendotLifecycle.onBackground()}",
                null
            );
        }
    }
}
