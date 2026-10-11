import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { createForest } from './forest.js';
import { createLighting } from './lighting.js';
import { PlayerControls } from './controls.js';
import { Flashlight } from './battery.js';
import { HUD } from './ui.js';

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

  const obstacles = createForest(scene);
  createLighting(scene);

  const MAP_BOUNDARY = 80;

  const controls = new PlayerControls(camera, canvas, obstacles, MAP_BOUNDARY);
  const flashlight = new Flashlight(camera);
  const hud = new HUD();

  const state = {
    playerPos: new THREE.Vector3(0, 1.7, 0),
    time: 7 * 60,
    hp: 100,
    enemyDistance: 999,
  };

  const clock = new THREE.Clock();
  let firstFrame = true;

  function animate() {
    requestAnimationFrame(animate);
    let dt = Math.min(clock.getDelta(), 0.1);
    if (firstFrame) { dt = 0; firstFrame = false; }

    controls.update(dt, state);
    flashlight.update(dt, state, hud);
    hud.update(state);

    state.time = (state.time + dt * 60) % (24 * 60);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  showError('OK - Scene loaded');
  setTimeout(() => {
    const el = document.getElementById('debug');
    if (el) el.style.display = 'none';
  }, 3000);

} catch (err) {
  showError('CATCH: ' + err.message);
}
