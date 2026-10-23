// ============================================================================
// KOMPONEN DATA PEMAIN, POIN, HIGH SCORE, KATALOG & PERSISTENCE (SCHEMA V1)
// ============================================================================

export const SAVE_SCHEMA_VERSION = 1;

export const SHIPS_CATALOG = [
  {
    id: 'vanguard_vx1',
    name: 'VX-01 Corsair Vanguard',
    role: 'Tactical Strike Interceptor',
    description:
      'Armored multi-faceted strike fighter with golden-amber reflective canopy, hazard-orange canards, twin dorsal thermal nacelles, and underwing heavy autocannons.',
    unlockCost: 0,
    UnlockLevel: 1,
    primaryColor: 0xff6200,
    secondaryColor: 0x1a212d,
    accentHex: '#FF6200',
    baseStats: {
      topSpeed: 135,
      acceleration: 68,
      handling: 1.85,
      boostCapacity: 100,
      shield: 120
    }
  },
  {
    id: 'phantom_nx7',
    name: 'NX-07 Phantom',
    role: 'High-Velocity Interceptor',
    description:
      'Forward-swept stealth frame featuring twin plasma afterburners and ultra-responsive gyro stabilizers.',
    unlockCost: 1200,
    UnlockLevel: 2,
    primaryColor: 0x7c5cff,
    secondaryColor: 0x0d1428,
    accentHex: '#7C5CFF',
    baseStats: {
      topSpeed: 185,
      acceleration: 95,
      handling: 2.35,
      boostCapacity: 140,
      shield: 100
    }
  },
  {
    id: 'titan_at99',
    name: 'AT-99 Titan',
    role: 'Heavy Deep-Core Cruiser',
    description:
      'Armored expedition vessel equipped with quad heavy thrusters and reinforced multi-layer deflector shields.',
    unlockCost: 2400,
    UnlockLevel: 3,
    primaryColor: 0x48e0a4,
    secondaryColor: 0x1a2639,
    accentHex: '#48E0A4',
    baseStats: {
      topSpeed: 155,
      acceleration: 76,
      handling: 1.65,
      boostCapacity: 165,
      shield: 220
    }
  }
];

export const WORLD_OBJECTS = [
  {
    id: 'aurelia_prime',
    name: 'Aurelia Prime',
    category: 'planet',
    zoneType: 'SAFE ZONE',
    position: [0, 0, -420],
    radius: 68,
    interactionRadius: 175,
    color: 0x2b82c9,
    atmosphereColor: 0x49d9ff,
    emissiveColor: 0x0a2742,
    rotationSpeed: 0.08,
    hasRings: false,
    hasClouds: true,
    rewardCredits: 250,
    rewardXP: 180,
    description: 'Oceanic super-terran world teeming with bioluminescent reefs and orbital trade lanes.'
  },
  {
    id: 'selene_iv',
    name: 'Selene-IV Moon',
    category: 'moon',
    zoneType: 'SAFE ZONE',
    position: [145, 38, -340],
    radius: 20,
    interactionRadius: 85,
    color: 0x9aa8c7,
    atmosphereColor: 0x6b7c9e,
    emissiveColor: 0x111522,
    rotationSpeed: 0.14,
    hasRings: false,
    hasClouds: false,
    rewardCredits: 180,
    rewardXP: 120,
    description: 'Tidally locked silicate moon hosting automated lunar relay towers.'
  },
  {
    id: 'krios_station',
    name: 'Krios Orbital Station',
    category: 'station',
    zoneType: 'SAFE HUB',
    position: [-160, 25, -240],
    radius: 32,
    interactionRadius: 110,
    color: 0x49d9ff,
    atmosphereColor: 0x49d9ff,
    emissiveColor: 0x49d9ff,
    rotationSpeed: 0.25,
    hasRings: false,
    hasClouds: false,
    rewardCredits: 300,
    rewardXP: 220,
    description: 'Centrifugal deep-space citadel serving as the primary staging hub for Vanguard pilots.'
  },
  {
    id: 'pyros_v',
    name: 'Pyros V',
    category: 'planet',
    zoneType: 'HAZARD SECTOR',
    position: [560, -70, -680],
    radius: 82,
    interactionRadius: 210,
    color: 0xd94e34,
    atmosphereColor: 0xff7b39,
    emissiveColor: 0x4d1205,
    rotationSpeed: 0.06,
    hasRings: false,
    hasClouds: true,
    rewardCredits: 450,
    rewardXP: 320,
    description: 'Hyper-volcanic proto-planet with tectonic magma rivers and intense thermal radiation.'
  },
  {
    id: 'cryon_9',
    name: 'Cryon-9 Ringed Giant',
    category: 'planet',
    zoneType: 'DEEP SPACE',
    position: [-680, 95, -820],
    radius: 96,
    interactionRadius: 260,
    color: 0x5c7cfa,
    atmosphereColor: 0x7c5cff,
    emissiveColor: 0x181c42,
    rotationSpeed: 0.11,
    hasRings: true,
    ringColor: 0x8da4f7,
    hasClouds: true,
    rewardCredits: 500,
    rewardXP: 380,
    description: 'Majestic ice giant encircled by a dense band of glacially reflective shepherd rings.'
  },
  {
    id: 'tartarus_belt',
    name: 'Tartarus Asteroid Core',
    category: 'asteroid_zone',
    zoneType: 'DANGER ZONE',
    position: [260, -20, -160],
    radius: 45,
    interactionRadius: 150,
    color: 0xffb454,
    atmosphereColor: 0xffb454,
    emissiveColor: 0x3b2306,
    rotationSpeed: 0.18,
    hasRings: false,
    hasClouds: false,
    rewardCredits: 350,
    rewardXP: 280,
    description: 'High-density metallic asteroid cluster rich in Quantum Mineral Cores.'
  },
  {
    id: 'nebula_vortex',
    name: 'Chronos Anomaly Relay',
    category: 'anomaly',
    zoneType: 'RESTRICTED ANOMALY',
    position: [40, 140, -1180],
    radius: 42,
    interactionRadius: 145,
    color: 0x7c5cff,
    atmosphereColor: 0x48e0a4,
    emissiveColor: 0x3b1d82,
    rotationSpeed: 0.4,
    hasRings: true,
    ringColor: 0x48e0a4,
    hasClouds: false,
    rewardCredits: 750,
    rewardXP: 600,
    description: 'Ancient hyper-dimensional stabilizer suspended inside the Violet Nebula frontier.'
  }
];

export const MISSIONS_CATALOG = [
  {
    id: 'mission_01_calibration',
    title: '01 // Orbital Vector Calibration',
    type: 'checkpoints',
    difficulty: 'Cadet',
    timeLimit: 110,
    rewardCredits: 450,
    rewardXP: 300,
    briefing:
      'Pilot, calibrate your flight control thrusters by flying through 5 holographic vector rings leading toward Aurelia Prime.',
    checkpoints: [
      [0, 5, -90],
      [-28, 18, -175],
      [20, 28, -255],
      [-45, 10, -325],
      [-105, 22, -265]
    ]
  },
  {
    id: 'mission_02_cartography',
    title: '02 // Helios Sector Cartography',
    type: 'scan_targets',
    difficulty: 'Navigator',
    timeLimit: 180,
    rewardCredits: 700,
    rewardXP: 450,
    briefing:
      'Approach within sensor range and complete a telemetry scan of Aurelia Prime, Selene-IV Moon, and Krios Orbital Station.',
    targetIds: ['aurelia_prime', 'selene_iv', 'krios_station']
  },
  {
    id: 'mission_03_asteroid_harvest',
    title: '03 // Tartarus Core Extraction',
    type: 'collect_cores',
    difficulty: 'Specialist',
    timeLimit: 150,
    rewardCredits: 950,
    rewardXP: 620,
    briefing:
      'Navigate the hazardous Tartarus Asteroid Belt and harvest 5 unstable Quantum Energy Cores before containment expires.',
    corePositions: [
      [180, -10, -120],
      [235, 12, -165],
      [290, -28, -195],
      [245, -5, -245],
      [195, 22, -210]
    ]
  },
  {
    id: 'mission_04_krios_express',
    title: '04 // Krios High-Speed Trench Run',
    type: 'checkpoints',
    difficulty: 'Veteran',
    timeLimit: 95,
    rewardCredits: 1350,
    rewardXP: 850,
    briefing:
      'Engage afterburners and complete the high-velocity corridor from Tartarus Sector to Cryon-9 approach vector under 95 seconds.',
    checkpoints: [
      [90, 0, -140],
      [-40, 30, -260],
      [-180, 40, -380],
      [-350, 65, -520],
      [-510, 82, -670]
    ]
  },
  {
    id: 'mission_05_nebula_expedition',
    title: '05 // Chronos Anomaly Expedition',
    type: 'checkpoints',
    difficulty: 'Commander',
    timeLimit: 145,
    rewardCredits: 2000,
    rewardXP: 1300,
    briefing:
      'Chart a deep-space route past Pyros V and fly through the long-range telemetry beacons to reach the Chronos Anomaly Relay.',
    checkpoints: [
      [160, -20, -320],
      [360, -45, -520],
      [390, 20, -760],
      [220, 85, -980],
      [45, 138, -1120]
    ]
  },
  {
    id: 'mission_06_destroy_emperor',
    title: '06 // Operation Eclipse: Strike Dreadnought Kronos',
    type: 'boss_battle',
    difficulty: 'Legendary',
    timeLimit: 220,
    rewardCredits: 3500,
    rewardXP: 2500,
    briefing:
      'Pilot, deploy into the Tartarus Asteroid Belt. Engage the hostile fighter squadrons (WRAITH INTERCEPTOR & AEGIS SENTINEL), destroy the Dreadnought Kronos pulse batteries and citadel bridge, and extract through the Warp Gate.',
    bossPosition: [280, 10, -220],
    fighterSpawns: [
      [230, 25, -180],
      [320, -15, -250],
      [260, 40, -290],
      [340, 15, -170]
    ]
  }
];

export const ACHIEVEMENTS_CATALOG = [
  { id: 'first_flight', title: 'First Ignition', desc: 'Fly a total distance of 1,000 meters in deep space.', reward: 200 },
  { id: 'cartographer', title: 'Stellar Cartographer', desc: 'Discover and scan at least 3 celestial objects.', reward: 400 },
  { id: 'mission_ace', title: 'Vanguard Ace', desc: 'Complete at least 2 official flight missions.', reward: 500 },
  { id: 'fleet_commander', title: 'Fleet Expansion', desc: 'Unlock a second spacecraft in the Orbital Hangar.', reward: 600 },
  { id: 'chief_engineer', title: 'Chief Engineer', desc: 'Upgrade any ship subsystem to Level 3 or higher.', reward: 450 },
  { id: 'deep_explorer', title: 'Void Pathfinder', desc: 'Scan all 7 major objects in the Helios System.', reward: 1500 },
  { id: 'emperor_slayer', title: 'Dreadnought Bane', desc: 'Defeat the hostile Dreadnought Kronos in Tartarus sector.', reward: 2500 }
];

export const EXPEDITION_SECTORS = [
  {
    id: 'alpha',
    region: 'NORTHERN GEOCORE',
    label: 'SECTOR ALPHA',
    targetName: 'Sector Alpha',
    coordinates: '51.5074° N, 0.1278° W',
    elevation: '35m Above Datum',
    density: '1.225 kg/m³',
    nitrogen: 78.1,
    oxygen: 20.9,
    argon: 1.0,
    radius: '6,371KM',
    gravity: '9.807 M/S²',
    magnetic: '0.31GAUSS',
    tilt: '23.44°',
    briefing:
      'Stable continental sector. Standard atmospheric envelope. Optimal for primary shuttle vector approach. Command networks reporting active beacon links.',
    spawnPos: [0, 10, 45]
  },
  {
    id: 'beta',
    region: 'ATLANTIC OCEANIC RIFT',
    label: 'SECTOR BETA',
    targetName: 'Sector Beta',
    coordinates: '28.1492° N, 41.8021° W',
    elevation: '12m Above Datum',
    density: '1.290 kg/m³',
    nitrogen: 76.4,
    oxygen: 22.1,
    argon: 1.5,
    radius: '6,378KM',
    gravity: '9.798 M/S²',
    magnetic: '0.38GAUSS',
    tilt: '23.44°',
    briefing:
      'Deep oceanic trench telemetry active. High-density ionized moisture layers detected. Recommended for low-altitude orbital reconnaissance sweeps.',
    spawnPos: [-120, 18, -160]
  },
  {
    id: 'gamma',
    region: 'EASTERN MEGALOPOLIS RIM',
    label: 'SECTOR GAMMA',
    targetName: 'Sector Gamma',
    coordinates: '35.6762° N, 139.6503° E',
    elevation: '88m Above Datum',
    density: '1.184 kg/m³',
    nitrogen: 78.5,
    oxygen: 20.2,
    argon: 1.3,
    radius: '6,368KM',
    gravity: '9.812 M/S²',
    magnetic: '0.29GAUSS',
    tilt: '23.44°',
    briefing:
      'High-energy orbital relay corridor. Dense satellite and station traffic across upper thermosphere. Deflector shields advised during transit.',
    spawnPos: [180, 22, -210]
  },
  {
    id: 'delta',
    region: 'PACIFIC DEEP ABYSSAL BASIN',
    label: 'SECTOR DELTA',
    targetName: 'Sector Delta',
    coordinates: '11.3493° N, 142.1996° E',
    elevation: '04m Above Datum',
    density: '1.315 kg/m³',
    nitrogen: 77.2,
    oxygen: 21.4,
    argon: 1.4,
    radius: '6,371KM',
    gravity: '9.804 M/S²',
    magnetic: '0.42GAUSS',
    tilt: '23.44°',
    briefing:
      'Frontier abyssal anomaly zone. Strong geomagnetic flux readings near rival fleet staging coordinates. Weapons free authorized upon arrival.',
    spawnPos: [275, 16, -45]
  }
];

export const DEFAULT_SAVE_DATA = {
  schemaVersion: SAVE_SCHEMA_VERSION,
  pilotProfile: {
    id: 'PLT-8849-VNG',
    callsign: 'NOVA-01',
    level: 1,
    experience: 0,
    credits: 650,
    score: 0,
    highScore: 0,
    enemiesDestroyed: 0,
    asteroidsDestroyed: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  ships: {
    vanguard_vx1: {
      shipId: 'vanguard_vx1',
      unlocked: true,
      upgradeLevels: { speed: 1, handling: 1, boost: 1, shield: 1 }
    },
    phantom_nx7: {
      shipId: 'phantom_nx7',
      unlocked: false,
      upgradeLevels: { speed: 1, handling: 1, boost: 1, shield: 1 }
    },
    titan_at99: {
      shipId: 'titan_at99',
      unlocked: false,
      upgradeLevels: { speed: 1, handling: 1, boost: 1, shield: 1 }
    }
  },
  selectedShipId: 'vanguard_vx1',
  missions: {
    mission_01_calibration: { status: 'available', attempts: 0, bestTime: null, rewardsClaimed: false },
    mission_02_cartography: { status: 'available', attempts: 0, bestTime: null, rewardsClaimed: false },
    mission_03_asteroid_harvest: { status: 'available', attempts: 0, bestTime: null, rewardsClaimed: false },
    mission_04_krios_express: { status: 'available', attempts: 0, bestTime: null, rewardsClaimed: false },
    mission_05_nebula_expedition: { status: 'available', attempts: 0, bestTime: null, rewardsClaimed: false },
    mission_06_destroy_emperor: { status: 'available', attempts: 0, bestTime: null, rewardsClaimed: false }
  },
  exploration: {
    discoveredObjectIds: [],
    totalFlightDistance: 0,
    totalFlightTime: 0,
    collectedFreeCores: 0
  },
  claimedAchievements: [],
  settings: {
    graphicsQuality: 'High', // Low, Medium, High
    shadowsEnabled: true,
    bloomEnabled: true,
    particleDensity: 'High', // Low, Medium, High
    mouseSteering: false,
    mouseSensitivity: 1.0,
    touchDragSteering: true,
    touchDragSensitivity: 1.0,
    cameraSensitivity: 1.0,
    invertY: false,
    fov: 68,
    hudVisible: true,
    masterVolume: 0.75,
    musicVolume: 0.45,
    sfxVolume: 0.8,
    muted: false,
    bindings: {
      pitchUp: 'KeyS',
      pitchDown: 'KeyW',
      yawLeft: 'KeyA',
      yawRight: 'KeyD',
      rollLeft: 'KeyQ',
      rollRight: 'KeyE',
      boost: 'ShiftLeft',
      brake: 'ControlLeft',
      scan: 'KeyF',
      camera: 'KeyC',
      primaryFire: 'Space',
      secondaryFire: 'KeyG',
      weapon1: 'Digit1',
      weapon2: 'Digit2',
      weapon3: 'Digit3'
    }
  }
};

export class PersistenceService {
  dbName: string;
  storeName: string;
  saveKey: string;
  memoryFallback: any;

  constructor() {
    this.dbName = 'SpaceExplorer3D_Storage';
    this.storeName = 'pilot_save_store';
    this.saveKey = 'primary_save_v1';
    this.memoryFallback = null;
  }

  async openDB(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') return null;
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  validateAndMigrate(raw: any) {
    if (!raw || typeof raw !== 'object') {
      return structuredClone(DEFAULT_SAVE_DATA);
    }
    const base = structuredClone(DEFAULT_SAVE_DATA);
    try {
      const mergedProfile = { ...base.pilotProfile, ...(raw.pilotProfile || {}) };
      mergedProfile.score = Number(mergedProfile.score || 0);
      mergedProfile.highScore = Math.max(Number(mergedProfile.highScore || 0), mergedProfile.score);
      mergedProfile.enemiesDestroyed = Number(mergedProfile.enemiesDestroyed || 0);
      mergedProfile.asteroidsDestroyed = Number(mergedProfile.asteroidsDestroyed || 0);

      const merged = {
        schemaVersion: SAVE_SCHEMA_VERSION,
        pilotProfile: mergedProfile,
        ships: { ...base.ships, ...(raw.ships || {}) },
        selectedShipId:
          raw.selectedShipId && base.ships[raw.selectedShipId as keyof typeof base.ships]
            ? raw.selectedShipId
            : base.selectedShipId,
        missions: { ...base.missions, ...(raw.missions || {}) },
        exploration: {
          ...base.exploration,
          ...(raw.exploration || {}),
          discoveredObjectIds: Array.isArray(raw.exploration?.discoveredObjectIds)
            ? raw.exploration.discoveredObjectIds
            : []
        },
        claimedAchievements: Array.isArray(raw.claimedAchievements) ? raw.claimedAchievements : [],
        settings: {
          ...base.settings,
          ...(raw.settings || {}),
          bindings: { ...base.settings.bindings, ...(raw.settings?.bindings || {}) }
        }
      };
      return merged;
    } catch {
      return base;
    }
  }

  async load(): Promise<typeof DEFAULT_SAVE_DATA> {
    const db = await this.openDB();
    if (!db) {
      return this.validateAndMigrate(this.memoryFallback);
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(this.saveKey);
        req.onsuccess = () => {
          resolve(this.validateAndMigrate(req.result));
        };
        req.onerror = () => resolve(this.validateAndMigrate(this.memoryFallback));
      } catch {
        resolve(this.validateAndMigrate(this.memoryFallback));
      }
    });
  }

  async save(data: any): Promise<boolean> {
    const clean = JSON.parse(JSON.stringify(data));
    clean.pilotProfile.updatedAt = Date.now();
    clean.pilotProfile.highScore = Math.max(
      Number(clean.pilotProfile.highScore || 0),
      Number(clean.pilotProfile.score || 0)
    );
    this.memoryFallback = clean;
    const db = await this.openDB();
    if (!db) return true;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.put(clean, this.saveKey);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async reset(): Promise<typeof DEFAULT_SAVE_DATA> {
    const fresh = structuredClone(DEFAULT_SAVE_DATA);
    await this.save(fresh);
    return fresh;
  }
}

export const persistence = new PersistenceService();

// ============================================================================
// PROGRESSION, POINTS, HIGH SCORE & SHIP STATS HELPERS
// ============================================================================
export function computeEffectiveShipStats(shipSpec: any, shipState: any) {
  const levels = shipState?.upgradeLevels || { speed: 1, handling: 1, boost: 1, shield: 1 };
  return {
    topSpeed: Math.round(shipSpec.baseStats.topSpeed * (1 + (levels.speed - 1) * 0.12)),
    acceleration: Math.round(shipSpec.baseStats.acceleration * (1 + (levels.speed - 1) * 0.12)),
    handling: +(shipSpec.baseStats.handling * (1 + (levels.handling - 1) * 0.11)).toFixed(2),
    boostCapacity: Math.round(shipSpec.baseStats.boostCapacity * (1 + (levels.boost - 1) * 0.15)),
    shield: Math.round(shipSpec.baseStats.shield * (1 + (levels.shield - 1) * 0.18))
  };
}

export function getLevelFromXP(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 120)) + 1);
}

export function formatKeyCode(code: string) {
  if (!code) return '---';
  return code
    .replace('Key', '')
    .replace('ShiftLeft', 'L-SHIFT')
    .replace('ShiftRight', 'R-SHIFT')
    .replace('ControlLeft', 'L-CTRL')
    .replace('ControlRight', 'R-CTRL')
    .replace('Space', 'SPACE');
}

export function checkAchievementUnlocked(achId: string, saveData: any) {
  const exp = saveData.exploration;
  const completedCount = Object.values(saveData.missions || {}).filter((m: any) => m.status === 'completed').length;
  const unlockedShipsCount = Object.values(saveData.ships || {}).filter((s: any) => s.unlocked).length;
  const hasLevel3Upgrade = Object.values(saveData.ships || {}).some((s: any) =>
    Object.values(s.upgradeLevels || {}).some((lvl: any) => lvl >= 3)
  );

  if (achId === 'first_flight') return exp.totalFlightDistance >= 1000;
  if (achId === 'cartographer') return exp.discoveredObjectIds.length >= 3;
  if (achId === 'mission_ace') return completedCount >= 2;
  if (achId === 'fleet_commander') return unlockedShipsCount >= 2;
  if (achId === 'chief_engineer') return hasLevel3Upgrade;
  if (achId === 'deep_explorer') return exp.discoveredObjectIds.length >= WORLD_OBJECTS.length;
  if (achId === 'emperor_slayer') return saveData.missions?.mission_06_destroy_emperor?.status === 'completed';
  return false;
}
