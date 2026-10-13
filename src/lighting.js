import * as THREE from 'three';

export function createLighting(scene) {
  const ambient = new THREE.HemisphereLight(0x1a2233, 0x000000, 0.08);
  scene.add(ambient);

  const moon = new THREE.DirectionalLight(0x334466, 0.1);
  moon.position.set(30, 80, -30);
  scene.add(moon);

  // === BINTANG PAKAI SPHERE KECIL ===
  const starsCount = 400;
  const starGeo = new THREE.SphereGeometry(0.15, 4, 4);
  const starMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    fog: false,
  });

  const stars = new THREE.InstancedMesh(starGeo, starMat, starsCount);
  stars.frustumCulled = false;

  const dummy = new THREE.Object3D();

  for (let i = 0; i < starsCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.7);
    const r = 100;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi) + 20;
    const z = r * Math.sin(phi) * Math.sin(theta);

    dummy.position.set(x, y, z);
    const scale = 0.5 + Math.random() * 1.5;
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();

    stars.setMatrixAt(i, dummy.matrix);
  }

  stars.instanceMatrix.needsUpdate = true;
  scene.add(stars);

  console.log('Bintang:', starsCount);
}
