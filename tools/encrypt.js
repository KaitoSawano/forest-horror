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

const XOR_KEY = Math.floor(Math.random() * 200) + 50;
const XOR_IV = Math.floor(Math.random() * 200) + 50;

const loaderCode = `
(function() {
  var LOGS = [];

  function log(msg) {
    LOGS.push(msg);
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
    console.log('[LOADER]', msg);
  }

  log('window.crypto=' + (typeof window.crypto));
  log('crypto.subtle=' + (typeof (window.crypto && window.crypto.subtle)));
  log('crypto.subtle.importKey=' + (typeof (window.crypto && window.crypto.subtle && window.crypto.subtle.importKey)));

  if (!window.crypto || !window.crypto.subtle) {
    log('FATAL: crypto.subtle TIDAK DIDUKUNG');
    log('Butuh HTTPS atau localhost');
    return;
  }

  var _0xa = [${keyParts.map(p => `"${p}"`).join(',')}];
  var _0xb = [${ivParts.map(p => `"${p}"`).join(',')}];
  var _0xc = ${XOR_KEY};
  var _0xd = ${XOR_IV};

  function _0xf(_0x10) {
    var _0x11 = new Uint8Array(_0x10.length / 2);
    for (var _0x12 = 0; _0x12 < _0x10.length; _0x12 += 2) {
      _0x11[_0x12 / 2] = parseInt(_0x10.substr(_0x12, 2), 16);
    }
    return _0x11;
  }

  function _0x13(_0x14, _0x15) {
    var _0x16 = new Uint8Array(_0x14.length);
    for (var _0x17 = 0; _0x17 < _0x14.length; _0x17++) {
      _0x16[_0x17] = _0x14[_0x17] ^ _0x15;
    }
    return _0x16;
  }

  var _0x1d = _0xa.join('');
  var _0x1e = _0xb.join('');

  var _0x1f = _0x13(_0xf(_0x1d), _0xc);
  var _0x20 = _0x13(_0xf(_0x1e), _0xd);

  log('Key length=' + _0x1f.length);
  log('IV length=' + _0x20.length);

  var BASE = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
  log('BASE=' + BASE);

  var files = [
    'main.js', 'forest.js', 'lighting.js', 'controls.js',
    'battery.js', 'books.js', 'house.js', 'graveyard.js',
    'ui.js', 'audio.js', 'minimap.js'
  ];

  async function decryptFile(name) {
    log('FETCH:' + name);
    var res = await fetch(BASE + name + '.enc');
    log('STATUS:' + name + '=' + res.status);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var encB64 = await res.text();
    log('SIZE:' + name + '=' + encB64.length);

    log('IMPORTKEY:' + name);
    var key = await crypto.subtle.importKey(
      'raw', _0x1f,
      { name: 'AES-CBC' }, false, ['decrypt']
    );
    log('IMPORTKEY_OK:' + name);

    var encBytes = new Uint8Array(atob(encB64).split('').map(function(c) {
      return c.charCodeAt(0);
    }));
    log('ENCBYTES:' + name + '=' + encBytes.length);

    log('DECRYPT:' + name);
    var decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: _0x20 },
      key, encBytes
    );
    log('DECRYPT_OK:' + name);
    return new TextDecoder().decode(decrypted);
  }

  async function loadAll() {
    var modules = {};
    for (var i = 0; i < files.length; i++) {
      try {
        modules[files[i]] = await decryptFile(files[i]);
        log('OK:' + files[i]);
      } catch (e) {
        var msg = e.message || e.name || String(e) || 'unknown';
        log('FAIL:' + files[i] + '=' + msg);
        log('STACK:' + (e.stack || 'no stack').substring(0, 100));
      }
    }

    var loadedCount = 0;
    for (var x in modules) loadedCount++;
    log('LOADED:' + loadedCount + '/' + files.length);

    if (loadedCount === 0) {
      log('SEMUA FILE GAGAL DECRYPT');
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
      return;
    }

    log('IMPORT main.js...');
    await import(finalUrls['main.js']);
    log('SUKSES');
  }

  loadAll().catch(function(err) {
    log('FATAL:' + (err.message || err.name || String(err)));
  });
})();
`;

fs.writeFileSync(path.join(OUT_DIR, 'loader.js'), loaderCode);

console.log('Selesai! File ter-encrypt ada di:', OUT_DIR);
console.log('Loader size:', loaderCode.length, 'bytes');
