import * as THREE from 'three';

// ============================================================================
// KOMPONEN ASET 3D: OBJEK YANG BISA DI-HIT, PROYEKTIL, EFEK LEDAKAN & PORTAL
// ============================================================================

const asteroidTexCache: Record<string, { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture }> = {};

export function getCrateredAsteroidTexture(rockType = 'grey') {
  if (asteroidTexCache[rockType]) return asteroidTexCache[rockType];
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bCtx = bumpCanvas.getContext('2d')!;

  const isRed = rockType === 'red';
  const baseColor = isRed ? '#5c2e26' : '#524c47';
  const midColor = isRed ? '#783d33' : '#6b645e';
  const lightColor = isRed ? '#965245' : '#888078';

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 1024, 1024);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 1024, 1024);

  // Surface Noise & Multi-scale Mineral Blotches
  for (let i = 0; i < 450; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = 12 + Math.random() * 45;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, Math.random() < 0.5 ? midColor : lightColor);
    grad.addColorStop(1, baseColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Realistic Impact Craters with Raised Rims & Depressed Bowls
  for (let i = 0; i < 65; i++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 1024;
    const cr = 18 + Math.random() * 55;

    const cGrad = ctx.createRadialGradient(cx, cy, cr * 0.15, cx, cy, cr);
    cGrad.addColorStop(0, '#1c1714');
    cGrad.addColorStop(0.7, '#2f2824');
    cGrad.addColorStop(0.85, isRed ? '#8a4b3d' : '#807972');
    cGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();

    const bGrad = bCtx.createRadialGradient(cx, cy, cr * 0.1, cx, cy, cr * 1.15);
    bGrad.addColorStop(0, '#282828');
    bGrad.addColorStop(0.72, '#484848');
    bGrad.addColorStop(0.88, '#e0e0e0');
    bGrad.addColorStop(1, '#808080');
    bCtx.fillStyle = bGrad;
    ctx.beginPath();
    bCtx.beginPath();
    bCtx.arc(cx, cy, cr * 1.15, 0, Math.PI * 2);
    bCtx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.anisotropy = 4;

  const res = { map: tex, bumpMap: bumpTex };
  asteroidTexCache[rockType] = res;
  return res;
}

export function createCrateredAsteroidGeometry(radius = 1, detail = 2, seed = 0): THREE.IcosahedronGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const len = v.length();
    const nx = v.x / len;
    const ny = v.y / len;
    const nz = v.z / len;

    const n1 = Math.sin(nx * 3.8 + seed) * Math.cos(ny * 3.8 + seed * 0.7) * Math.sin(nz * 3.8);
    const n2 = Math.sin(nx * 8.5 + seed * 1.3) * Math.cos(ny * 8.5) * 0.35;
    const n3 = Math.cos(nz * 14.2 + nx * 7.1) * 0.15;

    const craterDist = Math.hypot(nx - 0.5, ny - 0.4, nz - 0.3);
    const craterIndent = craterDist < 0.45 ? -Math.cos((craterDist / 0.45) * Math.PI * 0.5) * 0.28 : 0;

    const scale = 1.0 + (n1 * 0.22 + n2 * 0.12 + n3 * 0.08 + craterIndent);
    v.setLength(len * Math.max(0.65, scale));
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

export function createWarpPortalMesh(): THREE.Group {
  const root = new THREE.Group();

  const ringGeo = new THREE.TorusGeometry(18, 1.4, 24, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    emissive: 0x0284c7,
    emissiveIntensity: 2.2,
    metalness: 0.8,
    roughness: 0.2
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  root.add(ringMesh);

  const horizonGeo = new THREE.CircleGeometry(17.5, 32);
  const horizonMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  root.add(horizon);

  root.userData = { ringMesh, horizon, active: true };
  return root;
}

export function createTorpedoProjectileMesh(): THREE.Group {
  const torpGroup = new THREE.Group();
  const coreGeo = new THREE.SphereGeometry(0.68, 14, 14);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  torpGroup.add(new THREE.Mesh(coreGeo, coreMat));

  const torpGeo = new THREE.SphereGeometry(1.25, 16, 16);
  const torpMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  torpGroup.add(new THREE.Mesh(torpGeo, torpMat));

  const haloGeo = new THREE.SphereGeometry(2.05, 14, 14);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.58,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  torpGroup.add(new THREE.Mesh(haloGeo, haloMat));

  const ringGeo = new THREE.TorusGeometry(1.55, 0.12, 8, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xe879f9,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  torpGroup.add(new THREE.Mesh(ringGeo, ringMat));
  return torpGroup;
}

export function createPlasmaPulseProjectileMesh(): THREE.Group {
  const plasmaGroup = new THREE.Group();

  const coreGeo = new THREE.SphereGeometry(0.38, 12, 12);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xe0ffff });
  plasmaGroup.add(new THREE.Mesh(coreGeo, coreMat));

  const auraGeo = new THREE.SphereGeometry(0.88, 12, 12);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  plasmaGroup.add(new THREE.Mesh(auraGeo, auraMat));

  const wakeGeo = new THREE.ConeGeometry(0.46, 5.4, 10);
  wakeGeo.rotateX(-Math.PI / 2);
  wakeGeo.translate(0, 0, 2.4);
  const wakeMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  plasmaGroup.add(new THREE.Mesh(wakeGeo, wakeMat));
  return plasmaGroup;
}

export function createAutocannonBoltMesh(): THREE.Group {
  const boltGroup = new THREE.Group();

  const headGeo = new THREE.SphereGeometry(0.30, 10, 10);
  const headMat = new THREE.MeshBasicMaterial({ color: 0xfff3d1 });
  boltGroup.add(new THREE.Mesh(headGeo, headMat));

  const haloGeo = new THREE.SphereGeometry(0.66, 10, 10);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xff4500,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  boltGroup.add(new THREE.Mesh(haloGeo, haloMat));

  const shaftGeo = new THREE.CylinderGeometry(0.16, 0.30, 4.6, 8);
  shaftGeo.rotateX(Math.PI / 2);
  shaftGeo.translate(0, 0, 2.0);
  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0xff3b00,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  boltGroup.add(new THREE.Mesh(shaftGeo, shaftMat));
  return boltGroup;
}

export function spawnExplosionVFX(
  fxGroup: THREE.Group,
  vfxEntities: any[],
  pos: THREE.Vector3,
  isHeavy = false
) {
  // 1. Expanding Translucent Spherical Shockwave
  const swGeo = new THREE.SphereGeometry(1.6, 24, 18);
  const swMat = new THREE.MeshBasicMaterial({
    color: isHeavy ? 0xa855f7 : 0x60a5fa,
    wireframe: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const swMesh = new THREE.Mesh(swGeo, swMat);
  swMesh.position.copy(pos);
  fxGroup.add(swMesh);
  vfxEntities.push({
    type: 'shockwave',
    mesh: swMesh,
    mat: swMat,
    scale: 1,
    maxScale: isHeavy ? 28 : 16,
    life: 0.55,
    maxLife: 0.55
  });

  // 2. Central Fireball Core
  const fbGeo = new THREE.IcosahedronGeometry(isHeavy ? 3.5 : 2.2, 1);
  const fbMat = new THREE.MeshBasicMaterial({
    color: 0xff4500,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending
  });
  const fbMesh = new THREE.Mesh(fbGeo, fbMat);
  fbMesh.position.copy(pos);
  fxGroup.add(fbMesh);
  vfxEntities.push({
    type: 'fireball',
    mesh: fbMesh,
    mat: fbMat,
    scale: 1,
    maxScale: isHeavy ? 18 : 10,
    life: 0.42,
    maxLife: 0.42
  });

  // 3. Tumbling 3D Debris Fragments
  const chunkCount = isHeavy ? 14 : 7;
  for (let c = 0; c < chunkCount; c++) {
    const dGeo = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.8, 0);
    const dMat = new THREE.MeshStandardMaterial({
      color: Math.random() < 0.5 ? 0x64748b : 0x475569,
      roughness: 0.8
    });
    const dMesh = new THREE.Mesh(dGeo, dMat);
    dMesh.position.copy(pos);
    fxGroup.add(dMesh);
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 55,
      (Math.random() - 0.5) * 55,
      (Math.random() - 0.5) * 55
    );
    const rot = new THREE.Vector3(
      Math.random() * 8,
      Math.random() * 8,
      Math.random() * 8
    );
    vfxEntities.push({
      type: 'debris',
      mesh: dMesh,
      mat: dMat,
      vel,
      rot,
      life: 0.85 + Math.random() * 0.4,
      maxLife: 1.2
    });
  }
}

export function spawnMuzzleFlashVFX(
  fxGroup: THREE.Group,
  vfxEntities: any[],
  worldPos: THREE.Vector3,
  colorHex: number,
  scale = 1.0
) {
  const mfGeo = new THREE.SphereGeometry(0.55 * scale, 10, 10);
  const mfMat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const mfMesh = new THREE.Mesh(mfGeo, mfMat);
  mfMesh.position.copy(worldPos);
  fxGroup.add(mfMesh);
  vfxEntities.push({
    type: 'fireball',
    mesh: mfMesh,
    mat: mfMat,
    maxScale: 2.2 * scale,
    life: 0.09,
    maxLife: 0.09
  });
}

