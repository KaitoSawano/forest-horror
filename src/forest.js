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

  // === POHON PRIMITIVE PAKAI INSTANCED MESH ===
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 4, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });

  const leafGeo = new THREE.ConeGeometry(1.5, 3, 7);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1a2a1a });

  const treeCount = 80;

  const trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const leafInstanced = new THREE.InstancedMesh(leafGeo, leafMat, treeCount);

  trunkInstanced.castShadow = true;
  trunkInstanced.receiveShadow = true;
  leafInstanced.castShadow = true;

  const dummy = new THREE.Object3D();

  for (let i = 0; i < treeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 5 + Math.random() * 115;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const s = 0.7 + Math.random() * 0.8;
    const rotY = Math.random() * Math.PI * 2;

    dummy.position.set(x, 2 * s, z);
    dummy.rotation.set(0, rotY, 0);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    trunkInstanced.setMatrixAt(i, dummy.matrix);

    dummy.position.set(x, 4.5 * s, z);
    dummy.rotation.set(0, rotY, 0);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    leafInstanced.setMatrixAt(i, dummy.matrix);

    obstacles.push({ x, z, radius: 0.5 * s });
    treeData.push({ x, z, size: 2 + s * 2 });
  }

  trunkInstanced.instanceMatrix.needsUpdate = true;
  leafInstanced.instanceMatrix.needsUpdate = true;

  scene.add(trunkInstanced);
  scene.add(leafInstanced);

  console.log('Pohon primitive: 80 (2 draw calls)');

  // === POHON MATI (GLB) PAKAI INSTANCED MESH JUGA ===
  const loader = new GLTFLoader();
  loader.load(
    './assets/tree-small.glb',
    (gltf) => {
      const template = gltf.scene;
      const baseScale = 0.35;

      // Hitung total pohon mati
      const deadTreeCount = 40;

      // Kumpulkan semua mesh dari template
      const meshes = [];
      template.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child);
        }
      });

      console.log('Mesh dalam tree-small.glb:', meshes.length);

      // Buat InstancedMesh untuk setiap mesh
      const instancedMeshes = meshes.map((mesh) => {
        const im = new THREE.InstancedMesh(
          mesh.geometry,
          mesh.material,
          deadTreeCount
        );
        im.castShadow = false;  // matikan shadow biar ringan
        im.receiveShadow = true;
        return im;
      });

      // Set matrix untuk setiap instance
      for (let i = 0; i < deadTreeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 110;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const s = baseScale * (0.7 + Math.random() * 0.6);
        const rotY = Math.random() * Math.PI * 2;

        dummy.position.set(x, 0, z);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();

        for (const im of instancedMeshes) {
          im.setMatrixAt(i, dummy.matrix);
        }

        obstacles.push({ x, z, radius: 1.5 * s });
        treeData.push({ x, z, size: 4 });
      }

      for (const im of instancedMeshes) {
        im.instanceMatrix.needsUpdate = true;
        scene.add(im);
      }

      console.log('Pohon mati: ' + deadTreeCount + ' (' + instancedMeshes.length + ' draw calls)');
    },
    undefined,
    (err) => {
      console.warn('Gagal load tree-small.glb');
    }
  );

  return { obstacles, trees: treeData };
}
