#!/usr/bin/env python3
"""Patch MainActivity.java untuk immersive fullscreen yang agresif."""
import os
import subprocess

# Cari MainActivity.java
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

if 'SYSTEM_UI_FLAG_IMMERSIVE_STICKY' in content:
    print('Immersive fullscreen already present')
    exit(0)

immersive_code = '''
        // === IMMERSIVE FULLSCREEN AGRESIF ===
        final android.view.View decorView = getWindow().getDecorView();
        
        // Hide system UI
        decorView.setSystemUiVisibility(
            android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
            | android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        );
        
        // Transparent status bar
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);
        
        // Listener untuk restore immersive mode kalau user swipe
        decorView.setOnSystemUiVisibilityChangeListener(
            new android.view.View.OnSystemUiVisibilityChangeListener() {
                @Override
                public void onSystemUiVisibilityChange(int visibility) {
                    if ((visibility & android.view.View.SYSTEM_UI_FLAG_FULLSCREEN) == 0) {
                        decorView.postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                decorView.setSystemUiVisibility(
                                    android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                                    | android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                                    | android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                                    | android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                                    | android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                                    | android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                                );
                            }
                        }, 3000);
                    }
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
    print('Immersive fullscreen added')
else:
    print('super.onCreate not found')
