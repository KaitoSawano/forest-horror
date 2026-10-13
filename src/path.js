import * as THREE from 'three';

export function createPath(scene) {
  // === TEXTURE JALAN TANAH ===
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Warna dasar tanah terang (coklat muda)
  ctx.fillStyle = '#8a7550';
  ctx.fillRect(0, 0, size, size);

  // Bintik-bintik tanah
  for (let i = 0; i < 6000; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const r = Math.random();

    if (r < 0.3) {
      ctx.fillStyle = 'rgba(60, 45, 25, 0.7)';
    } else if (r < 0.6) {
      ctx.fillStyle = 'rgba(120, 100, 70, 0.6)';
    } else if (r < 0.85) {
      ctx.fillStyle = 'rgba(90, 70, 45, 0.5)';
    } else {
      ctx.fillStyle = 'rgba(150, 130, 90, 0.5)';
    }

    if (Math.random() < 0.1) {
      ctx.fillRect(x, y, 2, 2);
    } else {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const pathTexture = new THREE.CanvasTexture(canvas);
  pathTexture.wrapS = THREE.RepeatWrapping;
  pathTexture.wrapT = THREE.RepeatWrapping;
  pathTexture.repeat.set(2, 30);
  pathTexture.magFilter = THREE.NearestFilter;
  pathTexture.minFilter = THREE.NearestMipmapNearestFilter;
  pathTexture.colorSpace = THREE.SRGBColorSpace;

  const pathMat = new THREE.MeshStandardMaterial({
    map: pathTexture,
    roughness: 0.95,
    color: 0xaa9977,
  });

  // === JALAN UTAMA ===
  // Membelah hutan dari spawn (0,0) ke utara (-Z)
  // Lebar 4 unit, panjang 200 unit
  const pathGeo = new THREE.PlaneGeometry(4, 200);
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.03, -50); // sedikit di atas tanah
  path.receiveShadow = true;
  scene.add(path);

  // === JALAN CABANG 1: ke rumah (barat daya) ===
  const path2Geo = new THREE.PlaneGeometry(3.5, 60);
  const path2 = new THREE.Mesh(path2Geo, pathMat);
  path2.rotation.x = -Math.PI / 2;
  path2.rotation.z = Math.PI / 4; // 45 derajat
  path2.position.set(-14, 0.03, 14);
  path2.receiveShadow = true;
  scene.add(path2);

  // === JALAN CABANG 2: ke kuburan (timur laut) ===
  const path3Geo = new THREE.PlaneGeometry(3.5, 50);
  const path3 = new THREE.Mesh(path3Geo, pathMat);
  path3.rotation.x = -Math.PI / 2;
  path3.rotation.z = Math.PI / 4;
  path3.position.set(11, 0.03, 11);
  path3.receiveShadow = true;
  scene.add(path3);

  // === TEPI JALAN (sedikit lebih gelap) ===
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x5a4a30,
    roughness: 1,
  });

  // Tepi kiri
  const edgeLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 200),
    edgeMat
  );
  edgeLeft.rotation.x = -Math.PI / 2;
  edgeLeft.position.set(-2.15, 0.04, -50);
  edgeLeft.receiveShadow = true;
  scene.add(edgeLeft);

  // Tepi kanan
  const edgeRight = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 200),
    edgeMat
  );
  edgeRight.rotation.x = -Math.PI / 2;
  edgeRight.position.set(2.15, 0.04, -50);
  edgeRight.receiveShadow = true;
  scene.add(edgeRight);

  console.log('Jalan tanah dibuat');
}
