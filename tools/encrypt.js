const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC_DIR = path.join(__dirname, '..', 'src');
const OUT_DIR = path.join(__dirname, '..', 'src-encrypted');

const ENCRYPTION_KEY = crypto.randomBytes(32);
const IV = crypto.randomBytes(16);

function encryptFile(inputPath, outputPath) {
  const data = fs.readFileSync(inputPath, 'utf8');
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  fs.writeFileSync(outputPath, encrypted);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function processDir(srcDir, outDir) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const outPath = path.join(outDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'lib' || entry.name === 'assets' || entry.name === 'ui') {
        copyDir(srcPath, outPath);
      } else {
        processDir(srcPath, outPath);
      }
    } else if (entry.name.endsWith('.js')) {
      encryptFile(srcPath, outPath + '.enc');
    } else {
      fs.copyFileSync(srcPath, outPath);
    }
  }
}

if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true });
}

processDir(SRC_DIR, OUT_DIR);

const keyHex = ENCRYPTION_KEY.toString('hex');
const ivHex = IV.toString('hex');

const loaderCode = `
(function() {
  const K = "${keyHex}";
  const I = "${ivHex}";
  const files = [
    'main.js', 'forest.js', 'lighting.js', 'controls.js',
    'battery.js', 'books.js', 'house.js', 'graveyard.js',
    'ui.js', 'audio.js', 'minimap.js'
  ];

  // Base URL absolut berdasarkan origin (file:// atau https://localhost)
  const BASE = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  async function decryptFile(name) {
    const res = await fetch(BASE + name + '.enc');
    const encB64 = await res.text();
    const key = await crypto.subtle.importKey(
      'raw', hexToBytes(K),
      { name: 'AES-CBC' }, false, ['decrypt']
    );
    const encBytes = Uint8Array.from(atob(encB64), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: hexToBytes(I) },
      key, encBytes
    );
    return new TextDecoder().decode(decrypted);
  }

  async function loadAll() {
    const modules = {};
    for (const name of files) {
      try {
        modules[name] = await decryptFile(name);
      } catch (e) {
        console.warn('Gagal load:', name, e);
      }
    }

    // Pass 1: buat blob URL dulu (tanpa rewrite import)
    const blobUrls = {};
    for (const name of files) {
      if (!modules[name]) continue;
      const blob = new Blob([modules[name]], { type: 'application/javascript' });
      blobUrls[name] = URL.createObjectURL(blob);
    }

    // Pass 2: rewrite import di setiap module ke blob URL yang sudah ada
    const finalUrls = {};
    for (const name of files) {
      if (!modules[name]) continue;
      let code = modules[name];

      // Rewrite three → path absolut
      code = code.replace(/from ['"]three['"]/g, "from '" + BASE + "lib/three.module.js'");
      code = code.replace(/from ['"]three\\/addons\\/loaders\\/GLTFLoader\\.js['"]/g, "from '" + BASE + "lib/GLTFLoader.js'");
      code = code.replace(/from ['"]three\\/addons\\/utils\\/BufferGeometryUtils\\.js['"]/g, "from '" + BASE + "lib/BufferGeometryUtils.js'");

      // Rewrite import relatif antar module → blob URL
      for (const other of files) {
        const escaped = other.replace('.', '\\\\.');
        const re = new RegExp("from ['\\\"]\\\\./" + escaped + "['\\\"]", 'g');
        code = code.replace(re, "from '" + blobUrls[other] + "'");
      }

      const blob = new Blob([code], { type: 'application/javascript' });
      finalUrls[name] = URL.createObjectURL(blob);
    }

    await import(finalUrls['main.js']);
  }

  loadAll().catch(err => {
    console.error('Loader error:', err);
    const el = document.getElementById('debug');
    if (el) {
      el.textContent = 'LOADER ERROR: ' + err.message;
      el.style.display = 'block';
    }
  });
})();
`;

fs.writeFileSync(path.join(OUT_DIR, 'loader.js'), loaderCode);

console.log('Selesai! File ter-encrypt ada di:', OUT_DIR);
