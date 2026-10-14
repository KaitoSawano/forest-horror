// UmbraGrove
// Copyright (C) 2026-present AtticForge
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import * as THREE from 'three';
import { createForest } from './forest.js';
import { createLighting } from './lighting.js';
import { PlayerControls } from './controls.js';
import { Flashlight } from './battery.js';
import { HUD } from './ui.js';
import { ForestAudio } from './audio.js';
import { BookManager } from './books.js';
import { createHouse } from './house.js';
import { createGraveyard } from './graveyard.js';
import { Minimap } from './minimap.js';
import { createPath } from './path.js';

// UmbraGrove
// Copyright (C) 2026-present AtticForge
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

function showError(msg) {
  const el = document.getElementById('debug');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}
window.addEventListener('error', (e) => showError('ERROR: ' + e.message));
window.addEventListener('unhandledrejection', (e) => showError('REJECT: ' + (e.reason?.message || e.reason)));

function createStarSky() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#050508');
  grad.addColorStop(0.6, '#0a0a12');
  grad.addColorStop(1, '#151015');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height * 0.8;
    const r = Math.random() * 0.8 + 0.2;
    const alpha = Math.random() * 0.5 + 0.4;

    const colorRoll = Math.random();
    let color;
    if (colorRoll < 0.75) {
      color = `rgba(255, 255, 255, ${alpha})`;
    } else if (colorRoll < 0.92) {
      color = `rgba(200, 220, 255, ${alpha})`;
    } else {
      color = `rgba(255, 240, 200, ${alpha})`;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height * 0.7;
    const r = Math.random() * 1 + 1.2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

try {
  const canvas = document.getElementById('game');

  const scene = new THREE.Scene();
  scene.background = createStarSky();
  scene.fog = new THREE.FogExp2(0x0a0a12, 0.08);

  // === KAMERA DENGAN FOV DINAMIS ===
  // FOV 75 untuk 16:9, naikkan untuk layar lebih panjang (20:9, 21:9)
  const aspect = window.innerWidth / window.innerHeight;
  let fov = 75;

  if (aspect > 2.0) {
    // Layar sangat panjang (20:9, 21:9) — naikkan FOV
    fov = 90;
  } else if (aspect > 1.8) {
    // Layar panjang (19.5:9, 20:9)
    fov = 85;
  } else if (aspect > 1.7) {
    // Layar standar modern (18:9, 19:9)
    fov = 80;
  }

  const camera = new THREE.PerspectiveCamera(
    fov,
    aspect,
    0.1,
    100
  );
  camera.position.set(0, 1.7, 0);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const MAP_BOUNDARY = 120;

  const pathInfo = createPath(scene);
  const forestData = createForest(scene, pathInfo);
  const obstacles = forestData.obstacles;

  createLighting(scene);

  const controls = new PlayerControls(camera, canvas, obstacles, MAP_BOUNDARY);
  const flashlight = new Flashlight(camera);
  const hud = new HUD();
  const audio = new ForestAudio();
  const minimap = new Minimap(MAP_BOUNDARY);

  const books = new BookManager(scene, obstacles, MAP_BOUNDARY);

  const state = {
    playerPos: new THREE.Vector3(0, 1.7, 0),
    time: 7 * 60,
    hp: 100,
    yaw: 0,
    books: {
      collected: 0,
      total: books.getTotal(),
    },
  };

  createHouse(scene, obstacles, MAP_BOUNDARY).then((house) => {
    if (house) minimap.setHouse(house.position.x, house.position.z);
  });

  createGraveyard(scene, obstacles, MAP_BOUNDARY).then((grave) => {
    if (grave) {
      const box = new THREE.Box3().setFromObject(grave);
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.z);
      minimap.setGraveyard(grave.position.x, grave.position.z, maxSize / 2);
    }
  });

  minimap.setTrees(forestData.trees);

  setTimeout(() => {
    minimap.setBooks(books.books);
  }, 1000);

  books.onAllCollected = () => {
    gameStarted = false;
    const overlay = document.getElementById('gameover-overlay');
    if (overlay) overlay.classList.add('visible');
    audio.pauseAll();
  };

  let gameStarted = false;

  const menuEl = document.getElementById('menu');
  const joystickEl = document.getElementById('joystick-base');
  const jumpBtnEl = document.getElementById('jump-btn');
  const crosshairEl = document.getElementById('crosshair');
  const helpOverlay = document.getElementById('help-overlay');

  document.getElementById('btn-play').addEventListener('click', () => {
    gameStarted = true;
    menuEl.classList.add('hidden');
    joystickEl.style.display = 'block';
    jumpBtnEl.style.display = 'block';
    crosshairEl.style.display = 'block';
    minimap.show();
    hud.show();

    audio.stopMenuMusic();
    audio.forceStart();
  });

  document.getElementById('btn-help').addEventListener('click', () => {
    helpOverlay.classList.add('visible');
  });

  document.getElementById('help-close').addEventListener('click', () => {
    helpOverlay.classList.remove('visible');
  });

  document.getElementById('btn-quit').addEventListener('click', () => {
    if (window.confirm('Keluar dari game?')) {
      window.close();
    }
  });

  const restartBtn = document.getElementById('btn-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      location.reload();
    });
  }

  audio.startMenuMusic();

  const onFirstGesture = () => {
    if (!audio.menuStarted) audio.startMenuMusic();
    document.removeEventListener('pointerdown', onFirstGesture);
    document.removeEventListener('touchstart', onFirstGesture);
    document.removeEventListener('click', onFirstGesture);
  };
  document.addEventListener('pointerdown', onFirstGesture, { passive: true });
  document.addEventListener('touchstart', onFirstGesture, { passive: true });
  document.addEventListener('click', onFirstGesture);

  const clock = new THREE.Clock();
  let firstFrame = true;

  function animate() {
    requestAnimationFrame(animate);
    let dt = Math.min(clock.getDelta(), 0.1);
    if (firstFrame) { dt = 0; firstFrame = false; }

    if (gameStarted) {
      controls.update(dt, state);
      flashlight.update(dt, state, hud);
      books.update(dt, state.playerPos);
      state.books.collected = books.getCollected();
      hud.update(state);
      minimap.update(state);
      state.time = (state.time + dt * 60) % (24 * 60);
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    const newAspect = window.innerWidth / window.innerHeight;
    camera.aspect = newAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

} catch (err) {
  showError('CATCH: ' + err.message);
}
