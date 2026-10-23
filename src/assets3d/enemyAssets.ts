import * as THREE from 'three';
import { createWarpPortalMesh } from './destructibleAssets';

// ============================================================================
// KOMPONEN ASET 3D: PESAWAT TEMPUR MUSUH & KAPAL INDUK DREADNOUGHT KRONOS
// ============================================================================

export function createEnemyFighterMesh(variant = '5k_fighter'): THREE.Group {
  const root = new THREE.Group();
  const name = variant === '5k_fighter' ? 'WRAITH INTERCEPTOR' : 'AEGIS SENTINEL';
  const isGuard = variant === 'hb_guard';

  const armorMat = new THREE.MeshStandardMaterial({
    color: isGuard ? 0x1f2937 : 0x0f172a,
    metalness: 0.9,
    roughness: 0.28
  });

  const purpleGlowMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x9333ea,
    emissiveIntensity: 2.2,
    metalness: 0.2,
    roughness: 0.2
  });

  // Sleek Forward-Swept Hull
  const fuselageGeo = new THREE.ConeGeometry(0.75, 4.4, 6);
  fuselageGeo.rotateX(-Math.PI / 2);
  const fuselage = new THREE.Mesh(fuselageGeo, armorMat);
  fuselage.position.set(0, 0, -0.6);
  root.add(fuselage);

  // Faceted Wing Frame with Glowing Ring Structure
  const ringWingGeo = new THREE.TorusGeometry(2.4, 0.2, 12, 32);
  const ringWing = new THREE.Mesh(ringWingGeo, purpleGlowMat);
  ringWing.rotation.x = Math.PI / 2;
  ringWing.position.set(0, 0.1, 0.5);
  root.add(ringWing);

  // Twin Laser Cannon Barrels
  [-1.2, 1.2].forEach((x) => {
    const gunGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.8, 8);
    gunGeo.rotateX(Math.PI / 2);
    const gun = new THREE.Mesh(gunGeo, armorMat);
    gun.position.set(x, -0.15, -1.2);
    root.add(gun);

    const tipGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const tip = new THREE.Mesh(tipGeo, purpleGlowMat);
    tip.position.set(x, -0.15, -2.1);
    root.add(tip);
  });

  // Engine Thruster Glow Cone
  const thrusterGeo = new THREE.ConeGeometry(0.38, 1.4, 12);
  thrusterGeo.rotateX(Math.PI / 2);
  const thrusterMesh = new THREE.Mesh(thrusterGeo, purpleGlowMat);
  thrusterMesh.position.set(0, 0, 2.2);
  root.add(thrusterMesh);

  root.userData = {
    type: 'fighter',
    name,
    health: isGuard ? 90 : 65,
    maxHealth: isGuard ? 90 : 65,
    radius: 6.8,
    speed: isGuard ? 52 : 62,
    shootCooldown: 1.2 + Math.random() * 0.8,
    active: true
  };

  return root;
}

export function createBattleshipMesh(): THREE.Group {
  const root = new THREE.Group();

  const armorMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.32
  });

  const secondaryMetal = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.92,
    roughness: 0.22
  });

  const accentOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 1.2
  });

  const purpleShieldMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0xa855f7,
    emissiveIntensity: 1.15,
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  // Main Heavy Capital Hull (~115m long)
  const hullGeo = new THREE.BoxGeometry(26, 12, 112);
  const hull = new THREE.Mesh(hullGeo, armorMat);
  hull.castShadow = true;
  hull.receiveShadow = true;
  root.add(hull);

  // Bow Nose Wedge Section
  const bowGeo = new THREE.ConeGeometry(18, 42, 4);
  bowGeo.rotateX(-Math.PI / 2);
  bowGeo.rotateY(Math.PI / 4);
  const bow = new THREE.Mesh(bowGeo, armorMat);
  bow.position.set(0, 0, -74);
  root.add(bow);

  // Stern Heavy Thruster Engine Array (6 Quad Massive Engines)
  for (let row = -1; row <= 1; row += 2) {
    for (let col = -1; col <= 1; col++) {
      const engGeo = new THREE.CylinderGeometry(2.8, 3.4, 16, 16);
      engGeo.rotateX(Math.PI / 2);
      const eng = new THREE.Mesh(engGeo, secondaryMetal);
      eng.position.set(col * 8, row * 3.5, 58);
      root.add(eng);

      const glowGeo = new THREE.CylinderGeometry(2.4, 2.7, 2, 16);
      glowGeo.rotateX(Math.PI / 2);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x9333ea });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.set(col * 8, row * 3.5, 66);
      root.add(glowMesh);
    }
  }

  // Superstructure Lateral Trenches & Flanking Wings
  [-1, 1].forEach((side) => {
    const finGeo = new THREE.BoxGeometry(18, 2.5, 54);
    const fin = new THREE.Mesh(finGeo, secondaryMetal);
    fin.position.set(side * 20, 1.5, 12);
    fin.rotation.z = side * 0.12;
    root.add(fin);

    const stripeGeo = new THREE.BoxGeometry(0.6, 2.6, 48);
    const stripe = new THREE.Mesh(stripeGeo, accentOrangeMat);
    stripe.position.set(side * 28.5, 1.6, 12);
    root.add(stripe);
  });

  // Command Bridge / Deckhouse Subsystem (Targetable Component)
  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(0, 9.5, 15);
  root.add(bridgeGroup);

  const bridgeGeo = new THREE.BoxGeometry(14, 7, 24);
  const bridgeMesh = new THREE.Mesh(bridgeGeo, secondaryMetal);
  bridgeMesh.castShadow = true;
  bridgeGroup.add(bridgeMesh);

  const visorGeo = new THREE.BoxGeometry(11, 1.4, 0.4);
  const visorMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 1.8, -12.1);
  bridgeGroup.add(visor);

  bridgeGroup.userData = {
    type: 'subsystem',
    id: 'deckhouse',
    name: 'CITADEL BRIDGE',
    parentShip: root,
    health: 260,
    maxHealth: 260,
    radius: 13.5,
    active: true
  };

  // 4 Targetable Heavy Defense Turrets ('PULSE BATTERY')
  const turrets: THREE.Group[] = [];
  const turretPositions = [
    { x: -7.5, y: 7.2, z: -32, up: 1 },
    { x: 7.5, y: 7.2, z: -32, up: 1 },
    { x: 0, y: 7.2, z: -10, up: 1 },
    { x: 0, y: -7.2, z: -18, up: -1 }
  ];

  turretPositions.forEach((tp, idx) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(tp.x, tp.y, tp.z);
    root.add(tGroup);

    const baseGeo = new THREE.CylinderGeometry(3.2, 3.8, 2.2, 16);
    const baseMesh = new THREE.Mesh(baseGeo, secondaryMetal);
    tGroup.add(baseMesh);

    const barrelGroup = new THREE.Group();
    barrelGroup.position.set(0, tp.up * 1.2, 0);
    tGroup.add(barrelGroup);

    [-0.9, 0.9].forEach((bx) => {
      const bGeo = new THREE.CylinderGeometry(0.38, 0.45, 7.5, 10);
      bGeo.rotateX(Math.PI / 2);
      const bMesh = new THREE.Mesh(bGeo, secondaryMetal);
      bMesh.position.set(bx, 0, -3.5);
      barrelGroup.add(bMesh);

      const coilGeo = new THREE.TorusGeometry(0.48, 0.1, 8, 16);
      const coilMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.set(bx, 0, -4.8);
      barrelGroup.add(coil);
    });

    tGroup.userData = {
      type: 'subsystem',
      id: `turret_${idx}`,
      name: 'PULSE BATTERY',
      parentShip: root,
      barrelGroup,
      health: 125,
      maxHealth: 125,
      radius: 9.5,
      cooldown: 0.8 + idx * 0.4,
      active: true
    };
    turrets.push(tGroup);
  });

  // Translucent Purple Oval Deflector Shield Bubble
  const shieldGeo = new THREE.SphereGeometry(72, 32, 24);
  shieldGeo.scale(1.15, 0.65, 1.38);
  const shieldMesh = new THREE.Mesh(shieldGeo, purpleShieldMat);
  shieldMesh.position.set(0, 0, -10);
  root.add(shieldMesh);

  root.userData = {
    type: 'battleship',
    name: 'DREADNOUGHT KRONOS',
    turrets,
    deckhouse: bridgeGroup,
    shieldMesh,
    purpleShieldMat,
    shieldActive: true,
    alive: true
  };

  return root;
}

export function spawnHostileFleet(scene: THREE.Scene) {
  const combatGroup = new THREE.Group();
  scene.add(combatGroup);

  const enemyFighters: THREE.Group[] = [];
  const fighterSpawns: { pos: [number, number, number]; variant: string }[] = [
    { pos: [240, 20, -180], variant: '5k_fighter' },
    { pos: [320, -15, -240], variant: 'hb_guard' },
    { pos: [260, 35, -280], variant: '5k_fighter' },
    { pos: [330, 10, -160], variant: 'hb_guard' }
  ];
  fighterSpawns.forEach((cfg) => {
    const fMesh = createEnemyFighterMesh(cfg.variant);
    fMesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    combatGroup.add(fMesh);
    enemyFighters.push(fMesh);
  });

  const battleshipMesh = createBattleshipMesh();
  battleshipMesh.position.set(280, 10, -220);
  combatGroup.add(battleshipMesh);

  const warpPortalMesh = createWarpPortalMesh();
  warpPortalMesh.position.set(280, 10, -340);
  warpPortalMesh.visible = false;
  combatGroup.add(warpPortalMesh);

  return { combatGroup, enemyFighters, battleshipMesh, warpPortalMesh };
}

