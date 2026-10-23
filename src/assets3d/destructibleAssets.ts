import * as THREE from 'three';
import { createFresnelAtmosphereMaterial } from './planetAssets';

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
  const isIce = rockType === 'ice';
  const baseColor = isIce ? '#3b6e8c' : isRed ? '#5c2e26' : '#524c47';
  const midColor = isIce ? '#5fa8cc' : isRed ? '#783d33' : '#6b645e';
  const lightColor = isIce ? '#bae6fd' : isRed ? '#965245' : '#888078';

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
    cGrad.addColorStop(0, isIce ? '#16354d' : '#1c1714');
    cGrad.addColorStop(0.7, isIce ? '#245273' : '#2f2824');
    cGrad.addColorStop(0.85, isIce ? '#e0f2fe' : isRed ? '#8a4b3d' : '#807972');
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

// ============================================================================
// OBSTAKEL GALAKSI BARU: RANJAU EMP, PUING SATELIT/KAPAL & KOMET AKTIF
// ============================================================================

export function createSpaceMineMesh(): THREE.Group {
  const mineGroup = new THREE.Group();

  const shellGeo = new THREE.IcosahedronGeometry(3.2, 2);
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.88,
    roughness: 0.25
  });
  mineGroup.add(new THREE.Mesh(shellGeo, shellMat));

  // Hazard Equatorial Ring
  const bandGeo = new THREE.TorusGeometry(3.32, 0.28, 12, 32);
  const bandMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 1.8
  });
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.rotation.x = Math.PI / 2;
  mineGroup.add(band);

  // 14 Radial Sensor Spikes
  const spikeGeo = new THREE.ConeGeometry(0.38, 2.6, 8);
  spikeGeo.translate(0, 4.1, 0);
  const spikeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.92,
    roughness: 0.2
  });
  const tipGeo = new THREE.SphereGeometry(0.28, 8, 8);
  tipGeo.translate(0, 5.4, 0);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff2a4b });

  const dirs = [
    new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(-1, 1, 1).normalize(),
    new THREE.Vector3(1, -1, 1).normalize(), new THREE.Vector3(-1, -1, 1).normalize(),
    new THREE.Vector3(1, 1, -1).normalize(), new THREE.Vector3(-1, 1, -1).normalize(),
    new THREE.Vector3(1, -1, -1).normalize(), new THREE.Vector3(-1, -1, -1).normalize()
  ];

  const up = new THREE.Vector3(0, 1, 0);
  dirs.forEach((d) => {
    const q = new THREE.Quaternion().setFromUnitVectors(up, d);
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    spike.quaternion.copy(q);
    mineGroup.add(spike);

    const tip = new THREE.Mesh(tipGeo, beaconMat);
    tip.quaternion.copy(q);
    mineGroup.add(tip);
  });

  // Pulsing Red Threat Aura Sphere
  const auraGeo = new THREE.SphereGeometry(5.6, 16, 16);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xff1e42,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const aura = new THREE.Mesh(auraGeo, auraMat);
  mineGroup.add(aura);

  mineGroup.userData = { beaconMat, aura };
  return mineGroup;
}

export function createDerelictDebrisMesh(variant = 0): THREE.Group {
  const debrisGroup = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.82,
    roughness: 0.42
  });
  const scorchedMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.65,
    roughness: 0.72
  });
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    emissive: 0x0f172a,
    metalness: 0.9,
    roughness: 0.18,
    side: THREE.DoubleSide
  });
  const sparkMat = new THREE.MeshBasicMaterial({
    color: variant % 2 === 0 ? 0x38bdf8 : 0xf97316
  });

  if (variant % 3 === 0) {
    // Variant 0: Broken Orbital Communications Satellite with shattered Solar Wings
    const core = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 8.5, 12), hullMat);
    core.rotation.z = 0.4;
    debrisGroup.add(core);

    const dish = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.2, 16, 1, true), scorchedMat);
    dish.position.set(0, 4.8, 0);
    dish.rotation.x = Math.PI;
    debrisGroup.add(dish);

    const wingL = new THREE.Mesh(new THREE.BoxGeometry(11, 0.25, 3.6), solarMat);
    wingL.position.set(-7.2, 0.5, 0);
    wingL.rotation.set(0.25, 0.1, -0.18);
    debrisGroup.add(wingL);

    const wingR = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.25, 3.4), solarMat);
    wingR.position.set(5.5, -0.8, 0.5);
    wingR.rotation.set(-0.35, -0.2, 0.4);
    debrisGroup.add(wingR);
  } else if (variant % 3 === 1) {
    // Variant 1: Torn Starship Hull Girder & Exposed Reactor Core
    const beam = new THREE.Mesh(new THREE.BoxGeometry(14, 3.2, 3.8), scorchedMat);
    debrisGroup.add(beam);

    const plate1 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 6.2, 0.6), hullMat);
    plate1.position.set(-2, 1.8, 2.1);
    plate1.rotation.set(0.2, 0.4, -0.3);
    debrisGroup.add(plate1);

    const reactor = new THREE.Mesh(new THREE.SphereGeometry(2.3, 14, 14), sparkMat);
    reactor.position.set(3.2, 0, 0);
    debrisGroup.add(reactor);
  } else {
    // Variant 2: Cargo Container Cluster & Broken Docking Ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(5.8, 0.85, 10, 24, Math.PI * 1.45), hullMat);
    debrisGroup.add(ring);

    const pod1 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4.2, 7.5), scorchedMat);
    pod1.position.set(1.5, -1.2, 0);
    pod1.rotation.set(0.3, 0.5, 0.2);
    debrisGroup.add(pod1);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 10), sparkMat);
    beacon.position.set(-3.5, 2.5, 1.0);
    debrisGroup.add(beacon);
  }

  return debrisGroup;
}

export function createCometMesh(): THREE.Group {
  const cometGroup = new THREE.Group();

  const iceTex = getCrateredAsteroidTexture('ice');
  const nucleusGeo = createCrateredAsteroidGeometry(5.2, 2, 42.7);
  const nucleusMat = new THREE.MeshStandardMaterial({
    map: iceTex.map,
    bumpMap: iceTex.bumpMap,
    bumpScale: 1.2,
    color: 0xe0f2fe,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    roughness: 0.55,
    metalness: 0.25
  });
  const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
  cometGroup.add(nucleus);

  // Glowing Cyan Coma Halo
  const comaGeo = new THREE.SphereGeometry(8.2, 20, 20);
  const comaMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  cometGroup.add(new THREE.Mesh(comaGeo, comaMat));

  // Long Ion Tail Cone (points backward along local +Z)
  const tailGeo = new THREE.ConeGeometry(7.2, 68, 20, 1, true);
  tailGeo.rotateX(-Math.PI / 2);
  tailGeo.translate(0, 0, 35);
  const tailMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  cometGroup.add(new THREE.Mesh(tailGeo, tailMat));

  // Inner Bright Dust Tail
  const innerTailGeo = new THREE.ConeGeometry(3.6, 44, 16, 1, true);
  innerTailGeo.rotateX(-Math.PI / 2);
  innerTailGeo.translate(0, 0, 23);
  const innerTailMat = new THREE.MeshBasicMaterial({
    color: 0xe0ffff,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  cometGroup.add(new THREE.Mesh(innerTailGeo, innerTailMat));

  cometGroup.userData = { nucleus };
  return cometGroup;
}

// ============================================================================
// BINTANG BERSINAR (DESTRUCTIBLE RADIANT STARS), SUPERNOVA & PECAHAN KOMET
// ============================================================================

export function createRadiantStarMesh(starData: {
  radius?: number;
  coreColor?: number;
  coronaColor?: number;
  flareColor?: number;
}): THREE.Group {
  const group = new THREE.Group();
  const radius = starData.radius || 42;
  const coreColor = starData.coreColor ?? 0xfff3a1;
  const coronaColor = starData.coronaColor ?? 0xff7b00;
  const flareColor = starData.flareColor ?? 0xff3b00;

  // 1. Radiant Stellar Core Sphere
  const coreGeo = new THREE.SphereGeometry(radius, 36, 36);
  const coreMat = new THREE.MeshBasicMaterial({
    color: coreColor
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // 2. Dual Fresnel Radiative Coronas
  const innerCoronaGeo = new THREE.SphereGeometry(radius * 1.32, 36, 36);
  const innerCoronaMat = createFresnelAtmosphereMaterial(coronaColor, 2.4);
  const innerCorona = new THREE.Mesh(innerCoronaGeo, innerCoronaMat);
  group.add(innerCorona);

  const outerCoronaGeo = new THREE.SphereGeometry(radius * 1.75, 36, 36);
  const outerCoronaMat = createFresnelAtmosphereMaterial(flareColor, 1.35);
  const outerCorona = new THREE.Mesh(outerCoronaGeo, outerCoronaMat);
  group.add(outerCorona);

  // 3. Rotating Coronal Flare Rings (Prominences)
  const flareLoops: THREE.Mesh[] = [];
  [-0.35, 0.45, 1.25].forEach((rotZ, idx) => {
    const loopGeo = new THREE.TorusGeometry(radius * (1.18 + idx * 0.12), radius * 0.08, 12, 48);
    const loopMat = new THREE.MeshBasicMaterial({
      color: flareColor,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const loopMesh = new THREE.Mesh(loopGeo, loopMat);
    loopMesh.rotation.set(idx * 0.8, idx * 0.4, rotZ);
    group.add(loopMesh);
    flareLoops.push(loopMesh);
  });

  group.userData = {
    isStarCore: true,
    coreMesh,
    innerCorona,
    outerCorona,
    flareLoops
  };

  return group;
}

export function spawnSupernovaCosmicExplosionVFX(
  fxGroup: THREE.Group,
  vfxEntities: any[],
  pos: THREE.Vector3
) {
  // 1. Ultra-Massive Expanding Chromatic Shockwave (up to 175m radius)
  const swGeo = new THREE.SphereGeometry(3.5, 32, 24);
  const swMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 1.0,
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
    maxScale: 52, // 3.5 * 52 = 182m
    life: 0.95,
    maxLife: 0.95
  });

  // 2. Secondary Ionized Violet-Cyan Plasma Ring Wave
  const ringGeo = new THREE.TorusGeometry(5.0, 1.5, 16, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.copy(pos);
  ringMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  fxGroup.add(ringMesh);
  vfxEntities.push({
    type: 'fireball',
    mesh: ringMesh,
    mat: ringMat,
    maxScale: 32,
    life: 0.82,
    maxLife: 0.82
  });

  // 3. Central Blinding Supernova Fireball Core
  const fbGeo = new THREE.IcosahedronGeometry(8.5, 2);
  const fbMat = new THREE.MeshBasicMaterial({
    color: 0xffa500,
    transparent: true,
    opacity: 1.0,
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
    maxScale: 18,
    life: 0.75,
    maxLife: 0.75
  });

  // 4. Dispersing High-Velocity Superheated Stellar Debris
  const chunkCount = 28;
  for (let c = 0; c < chunkCount; c++) {
    const dGeo = new THREE.DodecahedronGeometry(1.5 + Math.random() * 2.2, 0);
    const dMat = new THREE.MeshBasicMaterial({
      color: c % 3 === 0 ? 0xff4500 : c % 3 === 1 ? 0xffd700 : 0x00f0ff
    });
    const dMesh = new THREE.Mesh(dGeo, dMat);
    dMesh.position.copy(pos);
    fxGroup.add(dMesh);
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 140,
      (Math.random() - 0.5) * 140,
      (Math.random() - 0.5) * 140
    );
    const rot = new THREE.Vector3(
      Math.random() * 12,
      Math.random() * 12,
      Math.random() * 12
    );
    vfxEntities.push({
      type: 'debris',
      mesh: dMesh,
      mat: dMat,
      vel,
      rot,
      life: 1.2 + Math.random() * 0.8,
      maxLife: 2.0
    });
  }
}

export function spawnIcyCometShatterVFX(
  fxGroup: THREE.Group,
  vfxEntities: any[],
  pos: THREE.Vector3
) {
  // Cyan icy shockwave
  const swGeo = new THREE.SphereGeometry(2.5, 18, 14);
  const swMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
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
    maxScale: 14,
    life: 0.45,
    maxLife: 0.45
  });

  // Tumbling icy crystal fragments
  const chunkCount = 14;
  for (let c = 0; c < chunkCount; c++) {
    const dGeo = new THREE.OctahedronGeometry(0.8 + Math.random() * 1.2, 0);
    const dMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.25,
      metalness: 0.45
    });
    const dMesh = new THREE.Mesh(dGeo, dMat);
    dMesh.position.copy(pos);
    fxGroup.add(dMesh);
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 65,
      (Math.random() - 0.5) * 65,
      (Math.random() - 0.5) * 65
    );
    const rot = new THREE.Vector3(
      Math.random() * 9,
      Math.random() * 9,
      Math.random() * 9
    );
    vfxEntities.push({
      type: 'debris',
      mesh: dMesh,
      mat: dMat,
      vel,
      rot,
      life: 0.85 + Math.random() * 0.5,
      maxLife: 1.4
    });
  }
}


