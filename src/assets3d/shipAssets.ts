import * as THREE from 'three';

// ============================================================================
// KOMPONEN ASET 3D: PESAWAT PEMAIN (PLAYER SPACESHIP, DECALS & THRUSTERS)
// ============================================================================

let cachedHullGreebleTex: THREE.CanvasTexture | null = null;
export function getHullGreebleTexture(): THREE.CanvasTexture {
  if (cachedHullGreebleTex) return cachedHullGreebleTex;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 1024, 1024);

  // Armor panel seams
  ctx.strokeStyle = '#383838';
  ctx.lineWidth = 3;
  for (let i = 64; i < 1024; i += 128) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // Raised maintenance hatches & rivets
  for (let y = 32; y < 1024; y += 128) {
    for (let x = 32; x < 1024; x += 128) {
      ctx.fillStyle = ((x + y) / 128) % 2 === 0 ? '#969696' : '#6e6e6e';
      ctx.fillRect(x + 12, y + 12, 72, 44);
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 12, y + 12, 72, 44);

      // Corner rivets
      ctx.fillStyle = '#b8b8b8';
      [[x + 6, y + 6], [x + 90, y + 6], [x + 6, y + 90], [x + 90, y + 90]].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  cachedHullGreebleTex = new THREE.CanvasTexture(canvas);
  cachedHullGreebleTex.wrapS = THREE.RepeatWrapping;
  cachedHullGreebleTex.wrapT = THREE.RepeatWrapping;
  cachedHullGreebleTex.anisotropy = 4;
  return cachedHullGreebleTex;
}

const wingDecalCache: Record<string, THREE.CanvasTexture> = {};
export function getCorsairWingDecalTexture(accentHex = '#ff6200'): THREE.CanvasTexture {
  if (wingDecalCache[accentHex]) return wingDecalCache[accentHex];
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base Matte Charcoal Armor Plating (#1a212d)
  ctx.fillStyle = '#1a212d';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle dark slate armor panel variations
  ctx.fillStyle = '#212a38';
  ctx.fillRect(40, 40, 944, 440);
  ctx.fillStyle = '#151b26';
  ctx.fillRect(60, 520, 904, 440);

  // Panel Seams & Rivet Lines
  ctx.strokeStyle = '#0d1118';
  ctx.lineWidth = 5;
  ctx.strokeRect(32, 32, 960, 960);
  ctx.beginPath();
  ctx.moveTo(32, 500);
  ctx.lineTo(992, 500);
  ctx.moveTo(490, 32);
  ctx.lineTo(490, 992);
  ctx.stroke();

  // Diagonal Industrial Hazard Orange Tactical Stripes
  ctx.save();
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.moveTo(80, 920);
  ctx.lineTo(920, 160);
  ctx.stroke();

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(60, 885);
  ctx.lineTo(890, 135);
  ctx.stroke();
  ctx.restore();

  // Solar Compass Rose / Sawtooth Halo Ring
  const cx = 520;
  const cy = 520;
  const ringR = 250;

  ctx.save();
  ctx.translate(cx, cy);

  // Outer Solar Sawtooth Spikes in Hazard Orange
  const teeth = 36;
  ctx.fillStyle = accentHex;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(-12, -ringR);
    ctx.lineTo(0, -(ringR + (i % 2 === 0 ? 44 : 24)));
    ctx.lineTo(12, -ringR);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Double Ring Border
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(0, 0, ringR - 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#1a212d';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, ringR - 6, 0, Math.PI * 2);
  ctx.stroke();

  // Dark inner backing circle
  ctx.fillStyle = '#141a24';
  ctx.beginPath();
  ctx.arc(0, 0, ringR - 18, 0, Math.PI * 2);
  ctx.fill();

  // Tactical White Corsair Skull Insignia
  ctx.fillStyle = '#e8eef5';
  ctx.beginPath();
  ctx.arc(0, -34, 128, Math.PI * 0.88, Math.PI * 0.12, false);
  ctx.lineTo(106, 42);
  ctx.lineTo(68, 92);
  ctx.lineTo(54, 148);
  ctx.lineTo(-54, 148);
  ctx.lineTo(-68, 92);
  ctx.lineTo(-106, 42);
  ctx.closePath();
  ctx.fill();

  // Aggressive angled eye sockets
  ctx.fillStyle = '#141a24';
  ctx.beginPath();
  ctx.moveTo(-82, -18);
  ctx.lineTo(-22, -4);
  ctx.lineTo(-32, 34);
  ctx.lineTo(-76, 20);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(82, -18);
  ctx.lineTo(22, -4);
  ctx.lineTo(32, 34);
  ctx.lineTo(76, 20);
  ctx.closePath();
  ctx.fill();

  // Triangular nasal cavity
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(-20, 66);
  ctx.lineTo(20, 66);
  ctx.closePath();
  ctx.fill();

  // Skull teeth slits
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#141a24';
  for (let tx = -36; tx <= 36; tx += 18) {
    ctx.beginPath();
    ctx.moveTo(tx, 96);
    ctx.lineTo(tx, 148);
    ctx.stroke();
  }

  // Brow cleft & weathered scratch lines
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -162);
  ctx.lineTo(-8, -72);
  ctx.stroke();
  ctx.restore();

  // Caution Triangle on upper corner
  ctx.strokeStyle = '#0f141d';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(150, 120);
  ctx.lineTo(110, 190);
  ctx.lineTo(190, 190);
  ctx.closePath();
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  wingDecalCache[accentHex] = tex;
  return tex;
}

let cachedSparkleSprite: THREE.CanvasTexture | null = null;
export function getSparklingThrusterSprite(): THREE.CanvasTexture {
  if (cachedSparkleSprite) return cachedSparkleSprite;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const cx = 64;
  const cy = 64;

  const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 60);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(165, 243, 252, 0.95)');
  grad.addColorStop(0.48, 'rgba(16, 185, 129, 0.65)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  // 4-point sparkling star diamond
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(cx + 4, cy);
  ctx.lineTo(cx, 118);
  ctx.lineTo(cx - 4, cy);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, cy);
  ctx.lineTo(cx, cy + 4);
  ctx.lineTo(118, cy);
  ctx.lineTo(cx, cy - 4);
  ctx.closePath();
  ctx.fill();

  cachedSparkleSprite = new THREE.CanvasTexture(canvas);
  return cachedSparkleSprite;
}

export function createThrusterStream(scene: THREE.Scene, trailPerNacelle = 55) {
  const sparkleSprite = getSparklingThrusterSprite();
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(trailPerNacelle * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 3.2,
    map: sparkleSprite,
    color: 0x34d399,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  const hist = Array.from({ length: trailPerNacelle }, () => new THREE.Vector3(0, 8, 45));
  return { geo, mat, points, hist, count: trailPerNacelle };
}

export function buildSpaceshipMesh(shipSpec: any): THREE.Group {
  const root = new THREE.Group();
  const hullGroup = new THREE.Group();
  root.add(hullGroup);

  const greebleTex = getHullGreebleTexture();
  const isDefaultCorsair = shipSpec.id === 'vanguard_vx1';
  const hazardColorHex = isDefaultCorsair ? 0xff6200 : shipSpec.primaryColor || 0xff6200;
  const wingDecalTex = getCorsairWingDecalTexture(isDefaultCorsair ? '#ff6200' : (shipSpec.accentHex || '#ff6200'));

  // a. Fuselage: Matte Charcoal Gunmetal
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x1a212d,
    metalness: 0.88,
    roughness: 0.28,
    bumpMap: greebleTex,
    bumpScale: 0.035
  });

  // Secondary Dark Gunmetal Trim & Mechanical Alloy
  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x0f141c,
    metalness: 0.92,
    roughness: 0.22,
    bumpMap: greebleTex,
    bumpScale: 0.02
  });

  // Weathered Steel Edge Plating
  const steelPlateMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.86,
    roughness: 0.3
  });

  // b. Cockpit: Golden/Amber Faceted Reflective Canopy
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0xffa500,
    metalness: 0.95,
    roughness: 0.05,
    opacity: 0.9,
    transparent: true,
    emissive: 0xcc6600,
    emissiveIntensity: 0.35
  });

  // c. Forward Canards, Scoops & Wingtips: Industrial Hazard Orange
  const hazardOrangeMat = new THREE.MeshStandardMaterial({
    color: hazardColorHex,
    metalness: 0.42,
    roughness: 0.35,
    bumpMap: greebleTex,
    bumpScale: 0.015
  });

  // Decal Wing Surface Material (Corsair Skull & Solar Halo)
  const wingDecalMat = new THREE.MeshStandardMaterial({
    map: wingDecalTex,
    metalness: 0.82,
    roughness: 0.3,
    bumpMap: greebleTex,
    bumpScale: 0.025
  });

  // d. Thermal Orange Heat Vents & Intake Rings
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xff6200,
    emissive: 0xff4800,
    emissiveIntensity: 1.8,
    metalness: 0.3,
    roughness: 0.2
  });

  // Cyan Plasma & Dorsal Core Emissive Material
  const cyanPlasmaMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00d2ff,
    emissiveIntensity: 1.75,
    metalness: 0.2,
    roughness: 0.15
  });

  // Teal/Cyan Exhaust Petal Armor
  const nozzleArmorMat = new THREE.MeshStandardMaterial({
    color: 0x164e63,
    emissive: 0x083344,
    emissiveIntensity: 0.45,
    metalness: 0.9,
    roughness: 0.22
  });

  // 1. MULTI-FACETED FUSELAGE & NOSE ASSEMBLY (Pointing toward -Z)
  const coreFuselageGeo = new THREE.CylinderGeometry(0.68, 1.48, 5.4, 6);
  coreFuselageGeo.rotateX(-Math.PI / 2);
  coreFuselageGeo.scale(1.28, 0.58, 1.0);
  const coreFuselage = new THREE.Mesh(coreFuselageGeo, hullMat);
  coreFuselage.position.set(0, 0.02, 0.15);
  coreFuselage.castShadow = true;
  coreFuselage.receiveShadow = true;
  hullGroup.add(coreFuselage);

  const noseConeGeo = new THREE.ConeGeometry(0.82, 2.35, 6);
  noseConeGeo.rotateX(-Math.PI / 2);
  noseConeGeo.scale(1.12, 0.52, 1.0);
  const noseCone = new THREE.Mesh(noseConeGeo, hullMat);
  noseCone.position.set(0, -0.06, -3.35);
  hullGroup.add(noseCone);

  const noseTipGeo = new THREE.BoxGeometry(0.66, 0.24, 0.58);
  const noseTip = new THREE.Mesh(noseTipGeo, hazardOrangeMat);
  noseTip.position.set(0, -0.08, -4.18);
  noseTip.rotation.x = 0.18;
  hullGroup.add(noseTip);

  const spineStripeGeo = new THREE.BoxGeometry(0.42, 0.12, 1.35);
  const spineStripe = new THREE.Mesh(spineStripeGeo, hazardOrangeMat);
  spineStripe.position.set(0, 0.48, -0.45);
  spineStripe.rotation.x = -0.08;
  hullGroup.add(spineStripe);

  const dorsalHousingGeo = new THREE.CylinderGeometry(0.46, 0.52, 0.18, 16);
  const dorsalHousing = new THREE.Mesh(dorsalHousingGeo, darkTrimMat);
  dorsalHousing.position.set(0, 0.48, 0.55);
  hullGroup.add(dorsalHousing);

  const dorsalGlowRingGeo = new THREE.TorusGeometry(0.28, 0.045, 12, 24);
  dorsalGlowRingGeo.rotateX(Math.PI / 2);
  const dorsalGlowRing = new THREE.Mesh(dorsalGlowRingGeo, cyanPlasmaMat);
  dorsalGlowRing.position.set(0, 0.58, 0.55);
  hullGroup.add(dorsalGlowRing);

  [-1, 1].forEach((side) => {
    const cheekGeo = new THREE.BoxGeometry(0.55, 0.1, 1.95);
    const cheek = new THREE.Mesh(cheekGeo, steelPlateMat);
    cheek.position.set(side * 0.72, -0.14, -2.65);
    cheek.rotation.y = side * 0.22;
    cheek.rotation.z = -side * 0.1;
    hullGroup.add(cheek);

    const intakeHousingGeo = new THREE.CylinderGeometry(0.28, 0.34, 1.35, 8);
    intakeHousingGeo.rotateX(Math.PI / 2);
    const intakeHousing = new THREE.Mesh(intakeHousingGeo, hullMat);
    intakeHousing.position.set(side * 0.78, 0.22, -0.75);
    intakeHousing.rotation.y = -side * 0.08;
    hullGroup.add(intakeHousing);

    const intakeGlowGeo = new THREE.SphereGeometry(0.23, 12, 12);
    intakeGlowGeo.scale(1.0, 0.75, 0.4);
    const intakeGlow = new THREE.Mesh(intakeGlowGeo, accentMat);
    intakeGlow.position.set(side * 0.79, 0.22, -1.42);
    hullGroup.add(intakeGlow);
  });

  // 2. FACETED GOLDEN-AMBER REFLECTIVE COCKPIT CANOPY
  const cockpitGroup = new THREE.Group();
  cockpitGroup.position.set(0, 0.26, -2.15);
  hullGroup.add(cockpitGroup);

  const frontGlassGeo = new THREE.CylinderGeometry(0.32, 0.58, 1.65, 6);
  frontGlassGeo.rotateX(-Math.PI / 2);
  frontGlassGeo.scale(1.08, 0.68, 1.0);
  const frontGlass = new THREE.Mesh(frontGlassGeo, canopyMat);
  frontGlass.position.set(0, 0.04, -0.45);
  frontGlass.rotation.x = 0.22;
  cockpitGroup.add(frontGlass);

  const rearGlassGeo = new THREE.CylinderGeometry(0.58, 0.48, 1.05, 6);
  rearGlassGeo.rotateX(-Math.PI / 2);
  rearGlassGeo.scale(1.08, 0.72, 1.0);
  const rearGlass = new THREE.Mesh(rearGlassGeo, canopyMat);
  rearGlass.position.set(0, 0.22, 0.72);
  cockpitGroup.add(rearGlass);

  const canopyBrowGeo = new THREE.BoxGeometry(0.76, 0.14, 0.95);
  const canopyBrow = new THREE.Mesh(canopyBrowGeo, steelPlateMat);
  canopyBrow.position.set(0, 0.44, 0.75);
  canopyBrow.rotation.x = -0.08;
  cockpitGroup.add(canopyBrow);

  const canopyArchGeo = new THREE.BoxGeometry(0.92, 0.08, 0.12);
  const canopyArch = new THREE.Mesh(canopyArchGeo, darkTrimMat);
  canopyArch.position.set(0, 0.26, 0.18);
  cockpitGroup.add(canopyArch);

  // 3. FORWARD CANARDS, SWEPT TACTICAL WINGS, SCOOPS & CANTED WINGLETS
  const wingSpan = shipSpec.id === 'titan_at99' ? 7.2 : shipSpec.id === 'phantom_nx7' ? 6.5 : 6.2;
  const wingSweep = shipSpec.id === 'phantom_nx7' ? -0.18 : 0.18;

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, -1.35);
  wingShape.lineTo(wingSpan * 0.48, -0.35);
  wingShape.lineTo(wingSpan * 0.52, 0.55);
  wingShape.lineTo(wingSpan * 0.18, 1.15);
  wingShape.lineTo(0, 1.45);
  wingShape.closePath();

  const wingExtrudeGeo = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.06,
    bevelSegments: 2
  });
  wingExtrudeGeo.rotateX(Math.PI / 2);

  [-1, 1].forEach((side) => {
    const canardGroup = new THREE.Group();
    canardGroup.position.set(side * 0.88, -0.1, -2.05);
    canardGroup.rotation.y = side * 0.35;
    canardGroup.rotation.z = -side * 0.08;
    hullGroup.add(canardGroup);

    const canardGeo = new THREE.BoxGeometry(0.92, 0.09, 0.68);
    const canardMesh = new THREE.Mesh(canardGeo, hazardOrangeMat);
    canardMesh.position.set(side * 0.38, 0, 0);
    canardGroup.add(canardMesh);

    const navLightGeo = new THREE.BoxGeometry(0.14, 0.06, 0.22);
    const navLight = new THREE.Mesh(navLightGeo, accentMat);
    navLight.position.set(side * 0.82, 0, -0.12);
    canardGroup.add(navLight);

    const wingContainer = new THREE.Group();
    wingContainer.position.set(side * 0.78, -0.02, 0.85);
    wingContainer.rotation.y = side * wingSweep;
    wingContainer.rotation.z = -side * 0.05;
    hullGroup.add(wingContainer);

    const wingMain = new THREE.Mesh(wingExtrudeGeo, hullMat);
    wingMain.scale.x = side;
    wingMain.castShadow = true;
    wingMain.receiveShadow = true;
    wingContainer.add(wingMain);

    const decalPlateGeo = new THREE.PlaneGeometry(wingSpan * 0.38, 1.85);
    decalPlateGeo.rotateX(-Math.PI / 2);
    const decalPlate = new THREE.Mesh(decalPlateGeo, wingDecalMat);
    decalPlate.position.set(side * (wingSpan * 0.22), 0.055, 0.12);
    decalPlate.rotation.y = side * -0.12;
    wingContainer.add(decalPlate);

    const scoopGroup = new THREE.Group();
    scoopGroup.position.set(side * (wingSpan * 0.27), 0.18, 0.35);
    scoopGroup.rotation.y = side * -0.08;
    wingContainer.add(scoopGroup);

    const scoopHoodGeo = new THREE.BoxGeometry(0.88, 0.28, 1.38);
    const scoopHood = new THREE.Mesh(scoopHoodGeo, hazardOrangeMat);
    scoopGroup.add(scoopHood);

    const scoopMouthGeo = new THREE.BoxGeometry(0.76, 0.2, 0.18);
    const scoopMouth = new THREE.Mesh(scoopMouthGeo, darkTrimMat);
    scoopMouth.position.set(0, -0.02, -0.66);
    scoopGroup.add(scoopMouth);

    const edgeLightGeo = new THREE.BoxGeometry(0.55, 0.05, 0.08);
    const edgeLight = new THREE.Mesh(edgeLightGeo, accentMat);
    edgeLight.position.set(side * (wingSpan * 0.16), -0.02, -0.82);
    edgeLight.rotation.y = side * 0.32;
    wingContainer.add(edgeLight);

    const wingletGroup = new THREE.Group();
    wingletGroup.position.set(side * (wingSpan * 0.49), 0.08, 0.15);
    wingletGroup.rotation.z = side * 0.28;
    wingContainer.add(wingletGroup);

    const wingletFinGeo = new THREE.BoxGeometry(0.12, 0.92, 1.48);
    const wingletFin = new THREE.Mesh(wingletFinGeo, hazardOrangeMat);
    wingletFin.position.set(0, 0.22, 0);
    wingletGroup.add(wingletFin);

    const wingletBaseGeo = new THREE.BoxGeometry(0.18, 0.24, 1.56);
    const wingletBase = new THREE.Mesh(wingletBaseGeo, darkTrimMat);
    wingletBase.position.set(0, -0.15, 0);
    wingletGroup.add(wingletBase);

    // 5. HEAVY UNDERWING WEAPON PODS (Twin Autocannons / Railguns)
    const weaponPod = new THREE.Group();
    weaponPod.position.set(side * (wingSpan * 0.34), -0.34, 0.05);
    wingContainer.add(weaponPod);

    const pylonGeo = new THREE.BoxGeometry(0.28, 0.36, 0.92);
    const pylon = new THREE.Mesh(pylonGeo, darkTrimMat);
    pylon.position.set(0, 0.12, 0);
    weaponPod.add(pylon);

    const gunBodyGeo = new THREE.CylinderGeometry(0.22, 0.26, 1.25, 8);
    gunBodyGeo.rotateX(Math.PI / 2);
    const gunBody = new THREE.Mesh(gunBodyGeo, hullMat);
    gunBody.position.set(0, -0.12, -0.15);
    weaponPod.add(gunBody);

    [-0.09, 0.09].forEach((bx) => {
      const barrelGeo = new THREE.CylinderGeometry(0.055, 0.065, 1.45, 10);
      barrelGeo.rotateX(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeo, steelPlateMat);
      barrel.position.set(bx, -0.14, -1.05);
      weaponPod.add(barrel);

      const muzzleTipGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.16, 10);
      muzzleTipGeo.rotateX(Math.PI / 2);
      const muzzleTip = new THREE.Mesh(muzzleTipGeo, accentMat);
      muzzleTip.position.set(bx, -0.14, -1.78);
      weaponPod.add(muzzleTip);
    });
  });

  // 4. TWIN DORSAL ENGINE NACELLES, THERMAL RINGS & CYAN PLASMA CONES
  const thrusterFlames: THREE.Mesh[] = [];
  const nacelleSpecs = shipSpec.id === 'titan_at99'
    ? [
        { x: -0.76, y: 0.36, z: 1.55, scale: 1.0 },
        { x: 0.76, y: 0.36, z: 1.55, scale: 1.0 },
        { x: -1.42, y: 0.14, z: 1.85, scale: 0.82 },
        { x: 1.42, y: 0.14, z: 1.85, scale: 0.82 }
      ]
    : [
        { x: -0.76, y: 0.36, z: 1.55, scale: 1.0 },
        { x: 0.76, y: 0.36, z: 1.55, scale: 1.0 }
      ];

  nacelleSpecs.forEach(({ x, y, z, scale }) => {
    const nacelleGroup = new THREE.Group();
    nacelleGroup.position.set(x, y, z);
    nacelleGroup.scale.setScalar(scale);
    hullGroup.add(nacelleGroup);

    const shroudGeo = new THREE.CylinderGeometry(0.42, 0.48, 2.35, 16);
    shroudGeo.rotateX(Math.PI / 2);
    const shroud = new THREE.Mesh(shroudGeo, hullMat);
    shroud.castShadow = true;
    nacelleGroup.add(shroud);

    const intakeConeGeo = new THREE.ConeGeometry(0.42, 0.75, 16);
    intakeConeGeo.rotateX(-Math.PI / 2);
    const intakeCone = new THREE.Mesh(intakeConeGeo, steelPlateMat);
    intakeCone.position.set(0, 0, -1.52);
    nacelleGroup.add(intakeCone);

    const thermalRingGeo = new THREE.TorusGeometry(0.41, 0.055, 12, 24);
    const thermalRing = new THREE.Mesh(thermalRingGeo, accentMat);
    thermalRing.position.set(0, 0, -0.95);
    nacelleGroup.add(thermalRing);

    for (let v = 0; v < 4; v++) {
      const ventGeo = new THREE.BoxGeometry(0.9, 0.06, 0.11);
      const vent = new THREE.Mesh(ventGeo, accentMat);
      vent.position.set(0, 0.14, -0.55 + v * 0.24);
      nacelleGroup.add(vent);
    }

    const nozzleGeo = new THREE.CylinderGeometry(0.46, 0.36, 0.65, 12);
    nozzleGeo.rotateX(Math.PI / 2);
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleArmorMat);
    nozzle.position.set(0, 0, 1.42);
    nacelleGroup.add(nozzle);

    const innerNozzleRingGeo = new THREE.TorusGeometry(0.32, 0.045, 10, 20);
    const innerNozzleRing = new THREE.Mesh(innerNozzleRingGeo, cyanPlasmaMat);
    innerNozzleRing.position.set(0, 0, 1.74);
    nacelleGroup.add(innerNozzleRing);

    const flameContainer = new THREE.Group();
    flameContainer.position.set(0, 0, 1.78);
    nacelleGroup.add(flameContainer);

    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const outerFlameGeo = new THREE.ConeGeometry(0.34, 2.2, 16);
    outerFlameGeo.translate(0, 1.1, 0);
    outerFlameGeo.rotateX(Math.PI / 2);
    const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    flameContainer.add(outerFlame);

    const coreFlameMat = new THREE.MeshBasicMaterial({
      color: 0xe0faff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const coreFlameGeo = new THREE.ConeGeometry(0.18, 1.35, 12);
    coreFlameGeo.translate(0, 0.67, 0);
    coreFlameGeo.rotateX(Math.PI / 2);
    const coreFlame = new THREE.Mesh(coreFlameGeo, coreFlameMat);
    flameContainer.add(coreFlame);

    thrusterFlames.push(outerFlame, coreFlame);
  });

  // Ship Dynamic Point Lights
  const thrusterLight = new THREE.PointLight(0x00d2ff, 2.4, 18);
  thrusterLight.position.set(0, 0.3, 3.8);
  hullGroup.add(thrusterLight);

  const ventLight = new THREE.PointLight(0xff5500, 1.4, 10);
  ventLight.position.set(0, 0.6, -0.5);
  hullGroup.add(ventLight);

  // 6. ENERGY SHIELD BUBBLE (Flashes on Impact)
  const shieldGeo = new THREE.IcosahedronGeometry(4.2, 2);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.0,
    wireframe: true,
    blending: THREE.AdditiveBlending
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  hullGroup.add(shieldMesh);

  root.userData = {
    hullGroup,
    thrusterFlames,
    shieldMat,
    accentMat,
    thrusterLight
  };

  return root;
}

