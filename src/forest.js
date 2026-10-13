import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function createGroundTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#3a4a28';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 4000; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const r = Math.random();

    if (r < 0.35) {
      ctx.fillStyle = 'rgba(20, 30, 15, 0.95)';
    } else if (r < 0.6) {
      ctx.fillStyle = 'rgba(40, 55, 25, 0.9)';
    } else if (r < 0.8) {
      ctx.fillStyle = 'rgba(70, 85, 45, 0.85)';
    } else if (r < 0.93) {
      ctx.fillStyle = 'rgba(55, 40, 20, 0.9)';
    } else {
      ctx.fillStyle = 'rgba(100, 110, 70, 0.7)';
    }

    if (Math.random() < 0.15) {
      ctx.fillRect(x, y, 2, 2);
    } else {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapNearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

export function createForest(scene) {
  const groundTexture = createGroundTexture();

  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.95,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const obstacles = [];
  const treeData = [];

  // === POHON PRIMITIVE (hijau) ===
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 4, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
  const leafGeo = new THREE.ConeGeometry(1.5, 3, 7);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1a2a1a });

  for (let i = 0; i < 80; i++) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    const leaves = new THREE.Mesh(leafGeo, leafMat);
    leaves.position.y = 4.5;
    leaves.castShadow = true;
    tree.add(leaves);

    const angle = Math.random() * Math.PI * 2;
    const dist = 5 + Math.random() * 115;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    const s = 0.7 + Math.random() * 0.8;
    tree.scale.set(s, s, s);

    scene.add(tree);
    obstacles.push({ x, z, radius: 0.5 * s });
    treeData.push({ x, z, size: 2 + s * 2 });
  }

  // === POHON MATI (GLB) — hanya 5, ukuran kecil ===
  const loader = new GLTFLoader();
  loader.load(
    './assets/tree-small.glb',
    (gltf) => {
      const template = gltf.scene;
      // Skala JAUH LEBIH KECIL — 0.3 (sebelumnya 2.5)
      const baseScale = 0.3;

      // Cuma 5 pohon mati (sebelumnya 25)
      for (let i = 0; i < 5; i++) {
        const tree = template.clone(true);

        tree.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 100;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        tree.position.set(x, 0, z);
        tree.rotation.y = Math.random() * Math.PI * 2;

        const s = baseScale * (0.7 + Math.random() * 0.6);
        tree.scale.set(s, s, s);

        scene.add(tree);

        obstacles.push({ x, z, radius: 2.0 * s });
        treeData.push({ x, z, size: 5 });
      }

      console.log('Pohon mati loaded: 5');
    },
    undefined,
    (err) => {
      console.warn('Gagal load tree-small.glb');
    }
  );

  return { obstacles, trees: treeData };
}
