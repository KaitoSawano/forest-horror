import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Format: [nama file, bagian lebar yang diambil (0-1)]
const treeTextures = [
  { file: './assets/tree01.png',  crop: 0.45 },
  { file: './assets/tree02.png',  crop: 0.45 },
  { file: './assets/tree05.png',  crop: 0.45 },
  { file: './assets/tree06.png',  crop: 0.45 },
  { file: './assets/tree07.png',  crop: 0.45 },
  { file: './assets/tree08.png',  crop: 0.45 },
  { file: './assets/treee03.png', crop: 0.45 },
  { file: './assets/treee05.png', crop: 0.45 },
];

const bushTextures = [
  { file: './assets/Plants.png',    crop: 1.0 },
  { file: './assets/Plants_03.png', crop: 1.0 },
  { file: './assets/Plants_05.png', crop: 1.0 },
  { file: './assets/Plants_09.png', crop: 1.0 },
  { file: './assets/grass.png',     crop: 1.0 },
];

export function createForest(scene) {
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a1e,
    roughness: 0.95,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const loader = new THREE.TextureLoader();

  treeTextures.forEach(({ file, crop }) => {
    loader.load(file, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;

      // Crop otomatis: ambil hanya bagian kiri gambar
      tex.repeat.set(crop, 1.0);
      tex.offset.set(0, 0);
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;

      spawnBillboards(scene, tex, 40, 4, 8, true);
    }, undefined, () => {
      console.warn('Gagal load:', file);
    });
  });

  bushTextures.forEach(({ file, crop }) => {
    loader.load(file, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;

      tex.repeat.set(crop, 1.0);
      tex.offset.set(0, 0);
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;

      spawnBillboards(scene, tex, 80, 0.8, 2, false);
    }, undefined, () => {
      console.warn('Gagal load:', file);
    });
  });
}

function spawnBillboards(scene, texture, count, minScale, maxScale, isTree) {
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 1,
    metalness: 0,
    depthWrite: true,
  });

  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geo, mat);

    const angle = Math.random() * Math.PI * 2;
    const dist = 5 + Math.random() * 95;
    mesh.position.set(
      Math.cos(angle) * dist,
      0,
      Math.sin(angle) * dist
    );

    const s = minScale + Math.random() * (maxScale - minScale);
    mesh.scale.set(s, s, s);
    mesh.position.y = s / 2;
    mesh.rotation.y = Math.random() * Math.PI * 2;

    if (!isTree) {
      mesh.rotation.x = (Math.random() - 0.5) * 0.15;
      mesh.rotation.z = (Math.random() - 0.5) * 0.15;
    }

    mesh.castShadow = isTree;
    scene.add(mesh);
  }
}
