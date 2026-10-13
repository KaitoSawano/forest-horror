const loaderCode = `
(function() {
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

  var BASE = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

  var files = [
    'main.js', 'forest.js', 'lighting.js', 'controls.js',
    'battery.js', 'books.js', 'house.js', 'graveyard.js',
    'ui.js', 'audio.js', 'minimap.js'
  ];

  var modules = {};
  var loadedCount = 0;

  function loadFile(name, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', BASE + name + '.enc', true);
    xhr.onload = function() {
      if (xhr.status === 200 || xhr.status === 0) {
        var encB64 = xhr.responseText;
        decryptAndStore(name, encB64, callback);
      } else {
        callback(false);
      }
    };
    xhr.onerror = function() { callback(false); };
    xhr.send();
  }

  function decryptAndStore(name, encB64, callback) {
    try {
      var encBytes = base64ToBytes(encB64);
      var key = _0x1f;
      var iv = _0x20;

      // Pakai AES via forge atau fallback JS
      // Kita pakai JS pure AES-CBC (library kecil)
      // Sementara, kita skip decrypt — pakai base64 decode dulu
      // TODO: implement AES JS
      callback(false);
    } catch (e) {
      callback(false);
    }
  }

  function base64ToBytes(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
  }

  // Fallback: muat versi non-encrypt
  var script = document.createElement('script');
  script.type = 'module';
  script.src = BASE + 'main.js';
  script.onerror = function() {
    var el = document.getElementById('debug');
    if (el) {
      el.textContent = 'ERROR: Gagal load main.js';
      el.style.display = 'block';
    }
  };
  document.body.appendChild(script);
})();
`;
