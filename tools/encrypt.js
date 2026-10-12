const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const JavaScriptObfuscator = require('javascript-obfuscator');

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

const TAMPER_HASH = crypto
  .createHash('sha256')
  .update(keyHex + ivHex + 'forest-horror-wasm-2026')
  .digest('hex');

const loaderCode = `
(function() {
  let _0xdCount = 0;
  const _0xdCheck = function() {
    const _0xs = performance.now();
    debugger;
    const _0xe = performance.now();
    if (_0xe - _0xs > 150) {
      _0xdCount++;
      if (_0xdCount > 3) {
        document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace;">Debug detected.</div>';
        throw new Error('DEBUG');
      }
    }
  };
  setInterval(_0xdCheck, 2000);

  const _0xdomains = ['localhost', 'capacitor://localhost', 'file://', 'https://localhost'];
  let _0xvalid = false;
  for (const _0xd of _0xdomains) {
    if (window.location.href.indexOf(_0xd) === 0) { _0xvalid = true; break; }
  }
  if (!_0xvalid) {
    document.body.innerHTML = '';
    throw new Error('DOMAIN');
  }

  const _0xa = [${keyParts.map(p => `"${p}"`).join(',')}];
  const _0xb = [${ivParts.map(p => `"${p}"`).join(',')}];
  const _0xc = ${XOR_KEY};
  const _0xd = ${XOR_IV};
  const _0xe = "${TAMPER_HASH}";

  function _0xf(_0x10) {
    const _0x11 = new Uint8Array(_0x10.length / 2);
    for (let _0x12 = 0; _0x12 < _0x10.length; _0x12 += 2) {
      _0x11[_0x12 / 2] = parseInt(_0x10.substr(_0x12, 2), 16);
    }
    return _0x11;
  }

  function _0x18(_0x19) {
    let _0x1a = 0;
    for (let _0x1b = 0; _0x1b < _0x19.length; _0x1b++) {
      _0x1a = ((_0x1a << 5) - _0x1a) + _0x19.charCodeAt(_0x1b);
      _0x1a |= 0;
    }
    return _0x1a;
  }

  const _0x1c = _0x18(document.currentScript.src + _0xe);
  if (typeof _0x1c !== 'number') {
    document.body.innerHTML = '';
    throw new Error('TAMPER');
  }

  const _0x1d = _0xa.join('');
  const _0x1e = _0xb.join('');

  const BASE = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

  let _0xwasm = null;
  async function _0xloadWasm() {
    const res = await fetch(BASE + 'lib/decrypt.wasm');
    const bytes = await res.arrayBuffer();
    const mod = await WebAssembly.instantiate(bytes, {});
    _0xwasm = mod.instance.exports;
  }

  function _0xxorWithWasm(bytes, key) {
    if (!_0xwasm) return bytes;
    const mem = new Uint8Array(_0xwasm.memory.buffer);
    const ptr = 0;
    for (let i = 0; i < bytes.length; i++) {
      mem[ptr + i] = bytes[i];
    }
    _0xwasm.xorDecrypt(ptr, bytes.length, key);
    const result = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      result[i] = mem[ptr + i];
    }
    return result;
  }

  async function _0xdecryptFile(name) {
    const res = await fetch(BASE + name + '.enc');
    const encB64 = await res.text();
    const key = await crypto.subtle.importKey(
      'raw', _0xf(_0x1d),
      { name: 'AES-CBC' }, false, ['decrypt']
    );
    const encBytes = Uint8Array.from(atob(encB64), c => c.charCodeAt(0));
    const iv = _0xf(_0x1e);
    const ivProcessed = _0xxorWithWasm(iv, _0xd);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: ivProcessed },
      key, encBytes
    );
    return new TextDecoder().decode(decrypted);
  }

  const files = [
    'main.js', 'forest.js', 'lighting.js', 'controls.js',
    'battery.js', 'books.js', 'house.js', 'graveyard.js',
    'ui.js', 'audio.js', 'minimap.js'
  ];

  async function _0xloadAll() {
    try {
      await _0xloadWasm();
    } catch (e) {
      console.warn('WASM load failed, fallback to JS');
    }

    const modules = {};
    for (const name of files) {
      try {
        modules[name] = await _0xdecryptFile(name);
      } catch (e) {
        console.warn('Load fail:', name);
      }
    }

    const blobUrls = {};
    for (const name of files) {
      if (!modules[name]) continue;
      const blob = new Blob([modules[name]], { type: 'application/javascript' });
      blobUrls[name] = URL.createObjectURL(blob);
    }

    const finalUrls = {};
    for (const name of files) {
      if (!modules[name]) continue;
      let code = modules[name];

      code = code.replace(/from ['"]three['"]/g, "from '" + BASE + "lib/three.module.js'");
      code = code.replace(/from ['"]three\\/addons\\/loaders\\/GLTFLoader\\.js['"]/g, "from '" + BASE + "lib/GLTFLoader.js'");
      code = code.replace(/from ['"]three\\/addons\\/utils\\/BufferGeometryUtils\\.js['"]/g, "from '" + BASE + "lib/BufferGeometryUtils.js'");

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

  _0xloadAll().catch(err => {
    console.error('Loader error:', err);
    const el = document.getElementById('debug');
    if (el) {
      el.textContent = 'ERROR: ' + err.message;
      el.style.display = 'block';
    }
  });
})();
`;

const obfuscatedLoader = JavaScriptObfuscator.obfuscate(loaderCode, {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.3,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.5,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'variable',
  stringArrayThreshold: 0.75,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
  target: 'browser'
}).getObfuscatedCode();

fs.writeFileSync(path.join(OUT_DIR, 'loader.js'), obfuscatedLoader);

console.log('Selesai! File ter-encrypt ada di:', OUT_DIR);
console.log('Loader size:', obfuscatedLoader.length, 'bytes');
