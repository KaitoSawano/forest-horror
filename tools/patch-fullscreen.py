#!/usr/bin/env python3
"""Patch MainActivity.java untuk immersive fullscreen + auto-hide 3 detik (status bar + nav bar)."""
import os
import subprocess

result = subprocess.run(
    ['find', 'android', '-name', 'MainActivity.java'],
    capture_output=True, text=True
)
files = result.stdout.strip().split('\n')
mainactivity = files[0] if files and files[0] else None

print('MainActivity:', mainactivity)

if not mainactivity or not os.path.exists(mainactivity):
    print('MainActivity not found, skipping')
    exit(0)

with open(mainactivity, 'r') as f:
    content = f.read()

if 'hideUiRunnable' in content:
    print('Immersive fullscreen already present')
    exit(0)

immersive_code = '''
        // === IMMERSIVE FULLSCREEN + AUTO HIDE 3 DETIK ===
        final android.view.View decorView = getWindow().getDecorView();
        final android.os.Handler handler = new android.os.Handler();
        
        final Runnable hideUiRunnable = new Runnable() {
            @Override
            public void run() {
                if (android.os.Build.VERSION.SDK_INT >= 30) {
                    android.view.WindowInsetsController controller = getWindow().getInsetsController();
                    if (controller != null) {
                        controller.hide(android.view.WindowInsets.Type.statusBars() | android.view.WindowInsets.Type.navigationBars());
                        controller.setSystemBarsBehavior(android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                    }
                } else {
                    decorView.setSystemUiVisibility(
                        android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                        | android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    );
                }
            }
        };
        
        // Panggil pertama kali
        hideUiRunnable.run();
        
        // Transparent bars
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);
        
        // Listener untuk system UI visibility (Android 10-)
        decorView.setOnSystemUiVisibilityChangeListener(
            new android.view.View.OnSystemUiVisibilityChangeListener() {
                @Override
                public void onSystemUiVisibilityChange(int visibility) {
                    if ((visibility & android.view.View.SYSTEM_UI_FLAG_FULLSCREEN) == 0) {
                        handler.removeCallbacks(hideUiRunnable);
                        handler.postDelayed(hideUiRunnable, 3000);
                    }
                }
            }
        );
        
        // Listener untuk window insets (Android 11+ — handle navigation bar)
        decorView.setOnApplyWindowInsetsListener(
            new android.view.View.OnApplyWindowInsetsListener() {
                @Override
                public android.view.WindowInsets onApplyWindowInsets(android.view.View v, android.view.WindowInsets insets) {
                    handler.removeCallbacks(hideUiRunnable);
                    handler.postDelayed(hideUiRunnable, 3000);
                    return insets;
                }
            }
        );
'''

if 'super.onCreate(savedInstanceState);' in content:
    content = content.replace(
        'super.onCreate(savedInstanceState);',
        'super.onCreate(savedInstanceState);' + immersive_code
    )
    with open(mainactivity, 'w') as f:
        f.write(content)
    print('Immersive fullscreen + auto-hide 3 detik added')
else:
    print('super.onCreate not found')
