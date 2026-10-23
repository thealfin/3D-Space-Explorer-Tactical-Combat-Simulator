import * as THREE from 'three';
import { getHullGreebleTexture } from './shipAssets';
import { createProceduralCloudTexture, buildPlanetMesh } from './planetAssets';
import { getCrateredAsteroidTexture, createCrateredAsteroidGeometry } from './destructibleAssets';

// ============================================================================
// KOMPONEN ASET 3D: OBJEK LUAR ANGKASA (STASIUN, SABUK ASTEROID, HANGAR & NEBULA)
// ============================================================================

let cachedStarSprite: THREE.CanvasTexture | null = null;
export function getStarSpriteTexture(): THREE.CanvasTexture {
  if (cachedStarSprite) return cachedStarSprite;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const cx = 64;
  const cy = 64;

  const rad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 60);
  rad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  rad.addColorStop(0.18, 'rgba(235, 248, 255, 0.85)');
  rad.addColorStop(0.45, 'rgba(140, 210, 255, 0.25)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 128, 128);

  // Subtle stellar diffraction spikes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.fillRect(cx - 1, 10, 2, 108);
  ctx.fillRect(10, cy - 1, 108, 2);

  cachedStarSprite = new THREE.CanvasTexture(canvas);
  return cachedStarSprite;
}

let cachedNebulaSprite: THREE.CanvasTexture | null = null;
export function getNebulaCloudTexture(): THREE.CanvasTexture {
  if (cachedNebulaSprite) return cachedNebulaSprite;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < 6; i++) {
    const ox = 128 + (Math.sin(i * 2.1) * 26);
    const oy = 128 + (Math.cos(i * 1.7) * 26);
    const r = 75 + (i % 3) * 18;
    const grad = ctx.createRadialGradient(ox, oy, 6, ox, oy, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.14)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  cachedNebulaSprite = new THREE.CanvasTexture(canvas);
  return cachedNebulaSprite;
}

export function createHexGridFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#071224';
  ctx.fillRect(0, 0, 1024, 1024);

  const hexR = 36;
  const hexH = Math.sqrt(3) * hexR;
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 3;

  for (let row = -1; row < 20; row++) {
    for (let col = -1; col < 18; col++) {
      const cx = col * hexR * 1.5;
      const cy = row * hexH + (col % 2 === 0 ? 0 : hexH * 0.5);
      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const angle = (Math.PI / 3) * s;
        const hx = cx + (hexR - 3) * Math.cos(angle);
        const hy = cy + (hexR - 3) * Math.sin(angle);
        if (s === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = (row + col) % 5 === 0 ? 'rgba(0, 210, 255, 0.34)' : 'rgba(14, 116, 178, 0.18)';
      ctx.fill();
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 8;
  return tex;
}

export function buildOrbitalLaunchBay(scene: THREE.Scene): THREE.Group {
  const launchBayGroup = new THREE.Group();
  launchBayGroup.position.set(0, 1.2, 45);
  scene.add(launchBayGroup);

  const hexFloorTex = createHexGridFloorTexture();
  const bayMetalMat = new THREE.MeshStandardMaterial({
    color: 0x161f2e,
    metalness: 0.88,
    roughness: 0.3
  });
  const neonCyanBayMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00d2ff,
    emissiveIntensity: 2.1
  });
  const neonOrangeBayMat = new THREE.MeshStandardMaterial({
    color: 0xff5500,
    emissive: 0xff3b00,
    emissiveIntensity: 1.9
  });

  // Glowing Hexagonal Energy Deck Pad below the ship
  const hexPadGeo = new THREE.BoxGeometry(22, 0.5, 28);
  const hexPadMesh = new THREE.Mesh(hexPadGeo, bayMetalMat);
  hexPadMesh.position.set(0, -1.2, 0);
  hexPadMesh.receiveShadow = true;
  launchBayGroup.add(hexPadMesh);

  const hexGridPlaneGeo = new THREE.PlaneGeometry(19.5, 25.5);
  hexGridPlaneGeo.rotateX(-Math.PI / 2);
  const hexGridPlaneMat = new THREE.MeshStandardMaterial({
    map: hexFloorTex,
    emissive: 0x00a8ff,
    emissiveMap: hexFloorTex,
    emissiveIntensity: 1.25,
    roughness: 0.2,
    metalness: 0.5
  });
  const hexGridPlane = new THREE.Mesh(hexGridPlaneGeo, hexGridPlaneMat);
  hexGridPlane.position.set(0, -0.92, 0);
  launchBayGroup.add(hexGridPlane);

  // Industrial Side Gantry Pillars & Neon Cyan Guidance Frames
  [-1, 1].forEach((side) => {
    const railGeo = new THREE.BoxGeometry(1.4, 1.2, 28);
    const rail = new THREE.Mesh(railGeo, bayMetalMat);
    rail.position.set(side * 10.6, -0.4, 0);
    launchBayGroup.add(rail);

    const orangeStripGeo = new THREE.BoxGeometry(0.22, 0.25, 26);
    const orangeStrip = new THREE.Mesh(orangeStripGeo, neonOrangeBayMat);
    orangeStrip.position.set(side * 9.8, -0.1, 0);
    launchBayGroup.add(orangeStrip);

    [-10, 0, 10].forEach((zOff) => {
      const pillarGeo = new THREE.BoxGeometry(1.5, 14, 1.5);
      const pillar = new THREE.Mesh(pillarGeo, bayMetalMat);
      pillar.position.set(side * 12.2, 5.8, zOff);
      launchBayGroup.add(pillar);

      const vBarGeo = new THREE.BoxGeometry(0.24, 9.5, 0.24);
      const vBar = new THREE.Mesh(vBarGeo, neonCyanBayMat);
      vBar.position.set(side * 11.2, 6.2, zOff);
      launchBayGroup.add(vBar);

      const hBarGeo = new THREE.BoxGeometry(2.8, 0.24, 0.24);
      const hBar = new THREE.Mesh(hBarGeo, neonCyanBayMat);
      hBar.position.set(side * 9.9, 10.8, zOff);
      launchBayGroup.add(hBar);
    });
  });

  const dockCyanLight = new THREE.PointLight(0x00e5ff, 3.2, 38);
  dockCyanLight.position.set(-8, 8, 45);
  scene.add(dockCyanLight);

  const dockOrangeLight = new THREE.PointLight(0xff5500, 2.8, 34);
  dockOrangeLight.position.set(8, 3, 48);
  scene.add(dockOrangeLight);

  return launchBayGroup;
}

export function buildCosmicEnvironment(scene: THREE.Scene) {
  const starSprite = getStarSpriteTexture();

  // Layer 1: Deep Background Pinpoint Starfield (6,000 stars)
  const starCount = 6000;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const palette = [
    new THREE.Color(0xf8fafc),
    new THREE.Color(0x38bdf8),
    new THREE.Color(0x818cf8),
    new THREE.Color(0xfdba74),
    new THREE.Color(0xc084fc)
  ];

  for (let i = 0; i < starCount; i++) {
    const r = 520 + Math.random() * 2200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i * 3 + 2] = r * Math.cos(phi) - 350;

    const c = palette[i % palette.length];
    const mag = 0.55 + Math.random() * 0.45;
    starColors[i * 3] = c.r * mag;
    starColors[i * 3 + 1] = c.g * mag;
    starColors[i * 3 + 2] = c.b * mag;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  const starMat = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false
  });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // Layer 2: Bright Prime Stars with Diffraction Glow Spikes
  const primeStarCount = 950;
  const primeStarGeo = new THREE.BufferGeometry();
  const primeStarPos = new Float32Array(primeStarCount * 3);
  const primeStarCol = new Float32Array(primeStarCount * 3);
  for (let i = 0; i < primeStarCount; i++) {
    const r = 480 + Math.random() * 1900;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    primeStarPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    primeStarPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    primeStarPos[i * 3 + 2] = r * Math.cos(phi) - 350;

    const c = palette[i % palette.length];
    primeStarCol[i * 3] = c.r;
    primeStarCol[i * 3 + 1] = c.g;
    primeStarCol[i * 3 + 2] = c.b;
  }
  primeStarGeo.setAttribute('position', new THREE.BufferAttribute(primeStarPos, 3));
  primeStarGeo.setAttribute('color', new THREE.BufferAttribute(primeStarCol, 3));
  const primeStarMat = new THREE.PointsMaterial({
    size: 9.5,
    map: starSprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const primeStarField = new THREE.Points(primeStarGeo, primeStarMat);
  scene.add(primeStarField);

  // Volumetric Nebula Clouds
  const nebulaSprite = getNebulaCloudTexture();
  const nebulaCount = 260;
  const nebulaGeo = new THREE.BufferGeometry();
  const nebulaPos = new Float32Array(nebulaCount * 3);
  const nebulaCol = new Float32Array(nebulaCount * 3);
  const nebulaPalette = [
    new THREE.Color(0x00d2ff),
    new THREE.Color(0x4338ca),
    new THREE.Color(0x7c3aed),
    new THREE.Color(0xff6200)
  ];
  for (let i = 0; i < nebulaCount; i++) {
    nebulaPos[i * 3] = (Math.random() - 0.5) * 1650;
    nebulaPos[i * 3 + 1] = (Math.random() - 0.5) * 620;
    nebulaPos[i * 3 + 2] = -200 - Math.random() * 1250;
    const nc = nebulaPalette[i % nebulaPalette.length];
    nebulaCol[i * 3] = nc.r;
    nebulaCol[i * 3 + 1] = nc.g;
    nebulaCol[i * 3 + 2] = nc.b;
  }
  nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
  nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebulaCol, 3));
  const nebulaMat = new THREE.PointsMaterial({
    size: 95,
    map: nebulaSprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const nebulaClouds = new THREE.Points(nebulaGeo, nebulaMat);
  scene.add(nebulaClouds);

  // Dynamic Velocity-Reactive Space Dust around Ship
  const dustCount = 340;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 3);
  const dustBoxRange = 95;
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * dustBoxRange * 2;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * dustBoxRange * 2;
    dustPositions[i * 3 + 2] = 45 + (Math.random() - 0.5) * dustBoxRange * 2;
    const dc = i % 3 === 0 ? new THREE.Color(0x00e5ff) : i % 3 === 1 ? new THREE.Color(0xff8c42) : new THREE.Color(0xe2e8f0);
    dustColors[i * 3] = dc.r;
    dustColors[i * 3 + 1] = dc.g;
    dustColors[i * 3 + 2] = dc.b;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 1.6,
    map: starSprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const spaceDust = new THREE.Points(dustGeo, dustMat);
  scene.add(spaceDust);

  return { starField, primeStarField, nebulaClouds, spaceDust, dustGeo, dustBoxRange };
}

export function buildSpaceStationMesh(obj: any): THREE.Group {
  const group = new THREE.Group();
  group.position.set(obj.position[0], obj.position[1], obj.position[2]);

  const ringGeo = new THREE.TorusGeometry(obj.radius, 3.4, 24, 64);
  const stationMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.88,
    roughness: 0.22,
    bumpMap: getHullGreebleTexture(),
    bumpScale: 0.08
  });
  const ring = new THREE.Mesh(ringGeo, stationMat);
  group.add(ring);

  const coreGeo = new THREE.CylinderGeometry(7.2, 7.2, 38, 24);
  coreGeo.rotateX(Math.PI / 2);
  const core = new THREE.Mesh(coreGeo, stationMat);
  group.add(core);

  const spokeGeo = new THREE.BoxGeometry(obj.radius * 1.95, 2.0, 2.0);
  const spoke1 = new THREE.Mesh(spokeGeo, stationMat);
  const spoke2 = new THREE.Mesh(spokeGeo, stationMat);
  spoke2.rotation.z = Math.PI / 2;
  group.add(spoke1, spoke2);

  const beaconGeo = new THREE.TorusGeometry(obj.radius * 0.45, 0.75, 16, 48);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00d2ff,
    emissiveIntensity: 1.8
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  group.add(beacon);

  return group;
}

export function buildAnomalyRelayMesh(obj: any): THREE.Group {
  const group = new THREE.Group();
  group.position.set(obj.position[0], obj.position[1], obj.position[2]);

  const outerGeo = new THREE.TorusGeometry(obj.radius, 1.8, 20, 64);
  const innerGeo = new THREE.OctahedronGeometry(obj.radius * 0.45, 2);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x7c5cff,
    emissive: 0x49d9ff,
    emissiveIntensity: 1.2,
    metalness: 0.85,
    roughness: 0.18
  });
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x48e0a4,
    wireframe: true
  });
  group.add(new THREE.Mesh(outerGeo, outerMat));
  group.add(new THREE.Mesh(innerGeo, innerMat));

  return group;
}

export function buildWorldCelestialObjects(scene: THREE.Scene, worldObjects: any[]) {
  const cloudLayerTex = createProceduralCloudTexture();
  const worldMeshes: { data: any; group: THREE.Group }[] = [];

  worldObjects.forEach((obj) => {
    let group: THREE.Group;
    if (obj.category === 'station') {
      group = buildSpaceStationMesh(obj);
    } else if (obj.category === 'anomaly') {
      group = buildAnomalyRelayMesh(obj);
    } else {
      group = buildPlanetMesh(obj, cloudLayerTex);
    }
    scene.add(group);
    worldMeshes.push({ data: obj, group });
  });

  return worldMeshes;
}

export function spawnDestructibleAsteroidBelt(scene: THREE.Scene, asteroidCount = 85) {
  const asteroidGroup = new THREE.Group();
  scene.add(asteroidGroup);
  const interactiveAsteroids: any[] = [];
  const greyTex = getCrateredAsteroidTexture('grey');
  const redTex = getCrateredAsteroidTexture('red');

  const greyAsteroidMat = new THREE.MeshStandardMaterial({
    map: greyTex.map,
    bumpMap: greyTex.bumpMap,
    bumpScale: 1.45,
    roughness: 0.9,
    metalness: 0.15
  });
  const redAsteroidMat = new THREE.MeshStandardMaterial({
    map: redTex.map,
    bumpMap: redTex.bumpMap,
    bumpScale: 1.45,
    roughness: 0.88,
    metalness: 0.18
  });

  for (let i = 0; i < asteroidCount; i++) {
    const inBelt = i < asteroidCount * 0.72;
    const cx = inBelt ? 280 + (Math.random() - 0.5) * 360 : (Math.random() - 0.5) * 1200;
    const cy = inBelt ? -10 + (Math.random() - 0.5) * 160 : (Math.random() - 0.5) * 320;
    const cz = inBelt ? -200 + (Math.random() - 0.5) * 380 : -90 - Math.random() * 1100;
    const scale = 3.6 + Math.random() * 9.2;
    const isRed = i % 3 === 0;

    const geo = createCrateredAsteroidGeometry(scale, 2, i * 7.3);
    const mesh = new THREE.Mesh(geo, isRed ? redAsteroidMat : greyAsteroidMat);
    mesh.position.set(cx, cy, cz);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    asteroidGroup.add(mesh);

    const hp = Math.round(scale * 12);
    interactiveAsteroids.push({
      mesh,
      health: hp,
      maxHealth: hp,
      radius: scale * 1.15,
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.3
      ),
      alive: true,
      name: isRed ? 'IRON ASTEROID' : 'CRATERED ASTEROID'
    });
  }

  return { asteroidGroup, interactiveAsteroids };
}

export function spawnCollectibleQuantumCores(scene: THREE.Scene, count = 15) {
  const freeCoresGroup = new THREE.Group();
  scene.add(freeCoresGroup);
  const freeCores: { mesh: THREE.Mesh; collected: boolean }[] = [];
  const coreGeo = new THREE.OctahedronGeometry(2.8, 0);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x48e0a4,
    wireframe: false
  });
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(coreGeo, coreMat);
    mesh.position.set(
      (Math.random() - 0.5) * 520,
      (Math.random() - 0.5) * 110,
      -90 - Math.random() * 680
    );
    freeCoresGroup.add(mesh);
    freeCores.push({ mesh, collected: false });
  }
  return { freeCoresGroup, freeCores };
}

