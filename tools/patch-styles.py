#!/usr/bin/env python3
"""Tambahkan fullscreen style ke styles.xml tanpa menghapus style asli."""
import os

STYLES = 'android/app/src/main/res/values/styles.xml'

if not os.path.exists(STYLES):
    print('styles.xml not found')
    exit(1)

with open(STYLES, 'r') as f:
    content = f.read()

print('=== styles.xml SEBELUM ===')
print(content)

if 'AppTheme.NoActionBar.Fullscreen' in content:
    print('Fullscreen style sudah ada')
    exit(0)

fullscreen_style = '''    <style name="AppTheme.NoActionBar.Fullscreen" parent="AppTheme.NoActionBar">
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowDrawsSystemBarBackgrounds">false</item>
    </style>

</resources>'''

content = content.replace('</resources>', fullscreen_style)

with open(STYLES, 'w') as f:
    f.write(content)

print('=== styles.xml SESUDAH ===')
print(content)
print('Fullscreen style added')
