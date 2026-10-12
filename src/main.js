import * as THREE from 'three';
import { createForest } from './forest.js';
import { createLighting } from './lighting.js';
import { PlayerControls } from './controls.js';
import { Flashlight } from './battery.js';
import { HUD } from './ui.js';
import { ForestAudio } from './audio.js';
import { BookManager } from './books.js';
import { createHouse } from './house.js';

function showError(msg) {
  const el = document.getElementById('debug');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}
window.addEventListener('error', (e) => showError('ERROR: ' + e.message));
window.addEventListener('unhandledrejection', (e) => showError('REJECT: ' + (e.reason?.message || e.reason)));

try {
  const canvas = document.getElementById('game');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.06);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.7, 0);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const MAP_BOUNDARY = 120;

  const obstacles = createForest(scene);
  createLighting(scene);

  createHouse(scene, obstacles, MAP_BOUNDARY);

  const controls = new PlayerControls(camera, canvas, obstacles, MAP_BOUNDARY);
  const flashlight = new Flashlight(camera);
  const hud = new HUD();
  const audio = new ForestAudio();

  const books = new BookManager(scene, obstacles, MAP_BOUNDARY);

  const state = {
    playerPos: new THREE.Vector3(0, 1.7, 0),
    time: 7 * 60,
    hp: 100,
    books: {
      collected: 0,
      total: books.getTotal(),
    },
  };

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
  const hudEl = document.getElementById('hud');
  const helpOverlay = document.getElementById('help-overlay');

  document.getElementById('btn-play').addEventListener('click', () => {
    gameStarted = true;
    menuEl.classList.add('hidden');
    joystickEl.style.display = 'block';
    jumpBtnEl.style.display = 'block';
    crosshairEl.style.display = 'block';
    hudEl.classList.add('visible');

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
      state.time = (state.time + dt * 60) % (24 * 60);
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

} catch (err) {
  showError('CATCH: ' + err.message);
}
