import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { createForest } from './forest.js';
import { createLighting } from './lighting.js';
import { PlayerControls } from './controls.js';
import { Flashlight } from './battery.js';
import { HUD } from './ui.js';

// Error handler — tampilkan error di layar
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
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.12);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.7, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  createForest(scene);
  createLighting(scene);

  const controls = new PlayerControls(camera, renderer.domElement);
  const flashlight = new Flashlight(camera);
  const hud = new HUD();

  const state = {
    playerPos: new THREE.Vector3(0, 1.7, 0),
    time: 7 * 60,
    hp: 100,
    battery: 100,
    enemyDistance: 999,
  };

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);

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
