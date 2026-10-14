#!/usr/bin/env python3
"""Copy HideNavbar plugin ke folder Android project."""
import os
import shutil
import subprocess

# Cari folder MainActivity
result = subprocess.run(
    ['find', 'android', '-name', 'MainActivity.java'],
    capture_output=True, text=True
)
files = result.stdout.strip().split('\n')
mainactivity = files[0] if files and files[0] else None

if not mainactivity:
    print('MainActivity not found')
    exit(1)

# Ambil folder package
package_dir = os.path.dirname(mainactivity)
print('Package dir:', package_dir)

# Copy plugin
src = 'tools/hide-navbar-plugin/HideNavbarPlugin.java'
dst = os.path.join(package_dir, 'HideNavbarPlugin.java')

shutil.copy(src, dst)
print('Plugin copied to:', dst)

# Register plugin di MainActivity
with open(mainactivity, 'r') as f:
    content = f.read()

if 'HideNavbarPlugin' not in content:
    # Tambah registerPlugin di onCreate
    if 'super.onCreate(savedInstanceState);' in content:
        content = content.replace(
            'super.onCreate(savedInstanceState);',
            '''super.onCreate(savedInstanceState);

        // Register HideNavbar plugin
        registerPlugin(HideNavbarPlugin.class);'''
        )
    
    with open(mainactivity, 'w') as f:
        f.write(content)
    print('Plugin registered in MainActivity')
else:
    print('Plugin already registered')
