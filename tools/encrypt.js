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

function discoverJsFiles(dir, baseDir = dir) {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'lib' || entry.name === 'assets' || entry.name === 'ui') {
        continue;
      }
      result.push(...discoverJsFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.js')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      result.push(relativePath);
    }
  }

  return result;
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

const jsFiles = discoverJsFiles(SRC_DIR);
console.log('File JS ditemukan:', jsFiles.length);
jsFiles.forEach(f => console.log('  -', f));

processDir(SRC_DIR, OUT_DIR);

const keyHex = ENCRYPTION_KEY.toString('hex');
const ivHex = IV.toString('hex');

function splitHex(hex, parts) {
  const len = hex.length;
  const chunkSize = Math.ceil(len / parts);
  const result = [];
  for (let i = 0; i < len; i += chunkSize) {
    result.push(hex.substring(i, i + chunkSize));
  }
  return result;
}

const keyParts = splitHex(keyHex, 24);
const ivParts = splitHex(ivHex, 20);

const filesArray = jsFiles.map(f => `'${f}'`).join(', ');

const loaderCode = `
(function() {
  // === NATIVE FEEL ===
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('selectstart', function(e) { e.preventDefault(); });
  document.addEventListener('dragstart', function(e) { e.preventDefault(); });
  document.addEventListener('gesturestart', function(e) { e.preventDefault(); });

  // === HIDE SPLASH SCREEN ===
  function hideSplash() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SplashScreen) {
      try {
        window.Capacitor.Plugins.SplashScreen.hide();
      } catch (e) {}
    }
  }
  setTimeout(hideSplash, 100);

  // === HIDE STATUS BAR + NAVIGATION BAR ===
  var lastUserInteraction = Date.now();
  var HIDE_DELAY = 3000;

  function hideBars() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar) {
      try {
        window.Capacitor.Plugins.StatusBar.hide();
        window.Capacitor.Plugins.StatusBar.setOverlaysWebView({ overlay: true });
      } catch (e) {}
    }
    
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.HideNavbar) {
      try {
        window.Capacitor.Plugins.HideNavbar.hide();
      } catch (e) {}
    }
  }

  document.addEventListener('touchstart', function(e) {
    var touch = e.touches[0];
    if (touch && touch.clientY < 100) {
      lastUserInteraction = Date.now();
    }
  }, { passive: true });

  document.addEventListener('touchstart', function(e) {
    var touch = e.touches[0];
    if (touch && touch.clientX > window.innerWidth - 100) {
      lastUserInteraction = Date.now();
    }
  }, { passive: true });

  setInterval(function() {
    var elapsed = Date.now() - lastUserInteraction;
    if (elapsed > HIDE_DELAY) {
      hideBars();
    }
  }, 500);

  hideBars();

  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      lastUserInteraction = Date.now();
      setTimeout(hideBars, 100);
    }
  });

  window.addEventListener('focus', function() {
    lastUserInteraction = Date.now();
    setTimeout(hideBars, 100);
  });

  // === LOADING BAR ===
  var loadingBar = document.getElementById('loading-bar');
  var loadingText = document.getElementById('loading-text');

  function updateLoading(percent, text) {
    if (loadingBar) loadingBar.style.width = percent + '%';
    if (loadingText && text) loadingText.textContent = text;
  }

  updateLoading(5, 'Menyiapkan...');

  var LOGS = [];

  function log(msg) {
    LOGS.push(msg);
    console.log('[LOADER]', msg);
  }

  function showLogs() {
    var el = document.getElementById('debug');
    if (el) {
      el.textContent = LOGS.join('\\n');
      el.style.display = 'block';
      el.style.whiteSpace = 'pre-wrap';
      el.style.fontSize = '10px';
      el.style.maxHeight = '90vh';
      el.style.overflow = 'auto';
      el.style.zIndex = '99999';
    }
  }

  function hideLogs() {
    var el = document.getElementById('debug');
    if (el) {
      el.style.display = 'none';
    }
  }

  if (!window.crypto || !window.crypto.subtle) {
    log('FATAL: crypto.subtle TIDAK DIDUKUNG');
    showLogs();
    return;
  }

  var _0xa = [${keyParts.map(p => `"${p}"`).join(',')}];
  var _0xb = [${ivParts.map(p => `"${p}"`).join(',')}];

  function _0xf(_0x10) {
    var _0x11 = new Uint8Array(_0x10.length / 2);
    for (var _0x12 = 0; _0x12 < _0x10.length; _0x12 += 2) {
      _0x11[_0x12 / 2] = parseInt(_0x10.substr(_0x12, 2), 16);
    }
    return _0x11;
  }

  var _0x1d = _0xa.join('');
  var _0x1e = _0xb.join('');

  var _0x1f = _0xf(_0x1d);
  var _0x20 = _0xf(_0x1e);

  var BASE = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
  log('BASE=' + BASE);

  var files = [${filesArray}];
  log('FILES:' + files.length);

  async function decryptFile(name) {
    var res = await fetch(BASE + name + '.enc');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var encB64 = await res.text();

    var key = await crypto.subtle.importKey(
      'raw', _0x1f,
      { name: 'AES-CBC' }, false, ['decrypt']
    );

    var encBytes = new Uint8Array(atob(encB64).split('').map(function(c) {
      return c.charCodeAt(0);
    }));

    var decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: _0x20 },
      key, encBytes
    );
    return new TextDecoder().decode(decrypted);
  }

  async function loadAll() {
    var modules = {};
    for (var i = 0; i < files.length; i++) {
      try {
        modules[files[i]] = await decryptFile(files[i]);
        log('OK:' + files[i]);
        updateLoading(10 + (i / files.length) * 70, 'Memuat ' + files[i] + '...');
      } catch (e) {
        log('FAIL:' + files[i] + '=' + (e.message || e.name || 'unknown'));
      }
    }

    updateLoading(85, 'Menjalankan...');

    var loadedCount = 0;
    for (var x in modules) loadedCount++;
    log('LOADED:' + loadedCount + '/' + files.length);

    if (loadedCount === 0) {
      log('SEMUA FILE GAGAL DECRYPT');
      showLogs();
      return;
    }

    var blobUrls = {};
    for (var j = 0; j < files.length; j++) {
      var name = files[j];
      if (!modules[name]) continue;
      var blob = new Blob([modules[name]], { type: 'application/javascript' });
      blobUrls[name] = URL.createObjectURL(blob);
    }

    var finalUrls = {};
    for (var k = 0; k < files.length; k++) {
      var name2 = files[k];
      if (!modules[name2]) continue;
      var code = modules[name2];

      code = code.replace(/from ['"]three['"]/g, "from '" + BASE + "lib/three.module.js'");
      code = code.replace(/from ['"]three\\/addons\\/loaders\\/GLTFLoader\\.js['"]/g, "from '" + BASE + "lib/GLTFLoader.js'");
      code = code.replace(/from ['"]three\\/addons\\/utils\\/BufferGeometryUtils\\.js['"]/g, "from '" + BASE + "lib/BufferGeometryUtils.js'");

      for (var m = 0; m < files.length; m++) {
        var other = files[m];
        if (!blobUrls[other]) continue;

        var escaped = other.replace('.', '\\\\.');
        var re = new RegExp("from ['\\\"]\\\\./" + escaped + "['\\\"]", 'g');
        code = code.replace(re, "from '" + blobUrls[other] + "'");
      }

      var blob2 = new Blob([code], { type: 'application/javascript' });
      finalUrls[name2] = URL.createObjectURL(blob2);
    }

    if (!finalUrls['main.js']) {
      log('NO_MAIN_BLOB');
      showLogs();
      return;
    }

    updateLoading(95, 'Menjalankan game...');
    log('IMPORT main.js...');
    try {
      await import(finalUrls['main.js']);
      log('SUKSES');
      updateLoading(100, 'Selesai');

      setTimeout(function() {
        var loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.classList.add('hidden');
      }, 500);

      setTimeout(hideLogs, 2000);
      setTimeout(hideBars, 100);
      setTimeout(hideBars, 500);
      setTimeout(hideBars, 1000);
    } catch (e) {
      log('IMPORT_FAIL:' + (e.message || e.name || 'unknown'));
      showLogs();
    }
  }

  loadAll().catch(function(err) {
    log('FATAL:' + (err.message || err.name || 'unknown'));
    showLogs();
  });
})();
`;

fs.writeFileSync(path.join(OUT_DIR, 'loader.js'), loaderCode);

console.log('Selesai! File ter-encrypt ada di:', OUT_DIR);
console.log('Total file JS:', jsFiles.length);
console.log('Loader size:', loaderCode.length, 'bytes');
