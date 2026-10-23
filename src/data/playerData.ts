// ============================================================================
// KOMPONEN DATA PEMAIN, POIN, HIGH SCORE, KATALOG TATA SURYA & MILKY WAY
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

export const WORLD_OBJECTS: any[] = [
  // ==========================================================================
  // SOLAR SYSTEM REPLICA PLANETS (TATA SURYA DALAM GALAKSI BIMA SAKTI)
  // ==========================================================================
  {
    id: 'planet_mercury',
    name: 'Mercury (Merkurius)',
    category: 'planet',
    planetPreset: 'mercury',
    zoneType: 'SOLAR INNER RIM',
    position: [480, 120, 60],
    radius: 26,
    interactionRadius: 95,
    color: 0x8f8982,
    atmosphereColor: 0xb8b0a4,
    emissiveColor: 0x1f1b18,
    rotationSpeed: 0.04,
    hasRings: false,
    hasClouds: false,
    rewardCredits: 220,
    rewardXP: 160,
    description:
      'Planet terdalam Tata Surya yang dipenuhi kawah tumbukan Caloris Basin dan inti besi masif di dekat korona Matahari.'
  },
  {
    id: 'planet_venus',
    name: 'Venus (Morning Star)',
    category: 'planet',
    planetPreset: 'venus',
    zoneType: 'THERMAL GREENHOUSE',
    position: [290, 65, -85],
    radius: 48,
    interactionRadius: 135,
    color: 0xe3bb76,
    atmosphereColor: 0xffd27d,
    emissiveColor: 0x3b280c,
    rotationSpeed: -0.03,
    hasRings: false,
    hasClouds: true,
    rewardCredits: 280,
    rewardXP: 200,
    description:
      'Planet terestrial berselubung awan asam sulfat keemasan супер-rotasi dengan tekanan atmosferik ekstrem.'
  },
  {
    id: 'aurelia_prime',
    name: 'Earth (Bumi // Terra Prime)',
    category: 'planet',
    planetPreset: 'earth',
    zoneType: 'SAFE ZONE // SOL-3',
    position: [0, 0, -420],
    radius: 68,
    interactionRadius: 175,
    color: 0x1d6bb8,
    atmosphereColor: 0x49d9ff,
    emissiveColor: 0x0a2742,
    rotationSpeed: 0.08,
    hasRings: false,
    hasClouds: true,
    rewardCredits: 300,
    rewardXP: 220,
    description:
      'Replika Planet Bumi (Terra) di Lengan Orion Galaksi Bima Sakti dengan samudra biru, daratan benua hijau, tudung es kutub, dan atmosfer nitrogen-oksigen.'
  },
  {
    id: 'selene_iv',
    name: 'The Moon (Bulan // Luna)',
    category: 'moon',
    planetPreset: 'moon',
    zoneType: 'SAFE ZONE // LUNA',
    position: [145, 38, -340],
    radius: 21,
    interactionRadius: 85,
    color: 0x9aa8c7,
    atmosphereColor: 0x6b7c9e,
    emissiveColor: 0x111522,
    rotationSpeed: 0.12,
    hasRings: false,
    hasClouds: false,
    rewardCredits: 180,
    rewardXP: 120,
    description:
      'Satelit alami Bumi dengan dataran basaltik gelap (Maria), kawah Tycho, dan menara relai telemetri lunar.'
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
    description:
      'Stasiun luar angkasa sentrifugal berputar yang menjadi markas utama armada Astral Vanguard di orbit Bumi.'
  },
  {
    id: 'planet_mars',
    name: 'Mars (The Red Planet)',
    category: 'planet',
    planetPreset: 'mars',
    zoneType: 'FRONTIER COLONY',
    position: [-340, -35, -540],
    radius: 44,
    interactionRadius: 135,
    color: 0xc1440e,
    atmosphereColor: 0xe77d11,
    emissiveColor: 0x3b1104,
    rotationSpeed: 0.075,
    hasRings: false,
    hasClouds: false,
    rewardCredits: 340,
    rewardXP: 250,
    description:
      'Planet Merah dengan gurun oksida besi, gunung berapi raksasa Olympus Mons, ngarai Valles Marineris, dan tudung es kutub.'
  },
  {
    id: 'tartarus_belt',
    name: 'Main Asteroid Belt (Tartarus Core)',
    category: 'asteroid_zone',
    planetPreset: 'mercury',
    zoneType: 'DANGER ZONE',
    position: [260, -20, -160],
    radius: 42,
    interactionRadius: 150,
    color: 0xffb454,
    atmosphereColor: 0xffb454,
    emissiveColor: 0x3b2306,
    rotationSpeed: 0.18,
    hasRings: false,
    hasClouds: false,
    rewardCredits: 350,
    rewardXP: 280,
    description:
      'Inti sabuk asteroid rapat di antara orbit Mars dan Yupiter yang kaya akan mineral kuantum dan ranjau luar angkasa.'
  },
  {
    id: 'planet_jupiter',
    name: 'Jupiter (Yupiter // Gas Giant)',
    category: 'planet',
    planetPreset: 'jupiter',
    zoneType: 'JOVIAN MAGNETOSPHERE',
    position: [520, 45, -920],
    radius: 132,
    interactionRadius: 310,
    color: 0xd8ca9d,
    atmosphereColor: 0xf4a460,
    emissiveColor: 0x2d1e10,
    rotationSpeed: 0.16,
    hasRings: true,
    ringColor: 0xa89274,
    ringInnerScale: 1.22,
    ringOuterScale: 1.48,
    hasClouds: true,
    moons: [
      { name: 'Io', distance: 175, radius: 11, color: 0xfacc15, speed: 0.45 },
      { name: 'Europa', distance: 215, radius: 10, color: 0xe0f2fe, speed: 0.32 }
    ],
    rewardCredits: 550,
    rewardXP: 420,
    description:
      'Raksasa gas terbesar di Tata Surya dengan sabuk awan amonia berkecepatan tinggi, badai abadi Great Red Spot, dan bulan Galilean Io & Europa.'
  },
  {
    id: 'planet_saturn',
    name: 'Saturn (Saturnus // Ringed Jewel)',
    category: 'planet',
    planetPreset: 'saturn',
    zoneType: 'CASSINI RING SECTOR',
    position: [-680, 95, -820],
    radius: 108,
    interactionRadius: 295,
    color: 0xead6b8,
    atmosphereColor: 0xfde68a,
    emissiveColor: 0x2b2315,
    rotationSpeed: 0.14,
    hasRings: true,
    ringColor: 0xe2c799,
    ringInnerScale: 1.32,
    ringOuterScale: 2.45,
    axialTilt: 0.46,
    hasClouds: true,
    moons: [
      { name: 'Titan', distance: 285, radius: 15, color: 0xf59e0b, speed: 0.26 }
    ],
    rewardCredits: 620,
    rewardXP: 480,
    description:
      'Raksasa gas keemasan ikonik yang dikelilingi sistem cincin es & batuan berlapis-lapis (Cassini Division) serta bulan berkabut Titan.'
  },
  {
    id: 'pyros_v',
    name: 'Pyros V (Volcanic Exoplanet)',
    category: 'planet',
    planetPreset: 'pyros',
    zoneType: 'HAZARD SECTOR',
    position: [560, -70, -600],
    radius: 76,
    interactionRadius: 200,
    color: 0xd94e34,
    atmosphereColor: 0xff7b39,
    emissiveColor: 0x4d1205,
    rotationSpeed: 0.06,
    hasRings: false,
    hasClouds: true,
    rewardCredits: 450,
    rewardXP: 320,
    description:
      'Proto-planet hiper-vulkanik dengan sungai magma tektonik dan badai ion termal.'
  },
  {
    id: 'planet_uranus',
    name: 'Uranus (Tilted Ice Giant)',
    category: 'planet',
    planetPreset: 'uranus',
    zoneType: 'OUTER ICE SECTOR',
    position: [-380, -90, -1340],
    radius: 78,
    interactionRadius: 215,
    color: 0x7de3f4,
    atmosphereColor: 0x38bdf8,
    emissiveColor: 0x0c2d3a,
    rotationSpeed: 0.11,
    hasRings: true,
    ringColor: 0x7dd3fc,
    ringInnerScale: 1.35,
    ringOuterScale: 1.75,
    axialTilt: 1.71, // ~98 degree vertical tilt!
    hasClouds: true,
    rewardCredits: 580,
    rewardXP: 440,
    description:
      'Raksasa es cyan-aquamarine dengan kemiringan sumbu ekstrem 97,7 derajat sehingga cincinnya berputar secara vertikal.'
  },
  {
    id: 'cryon_9',
    name: 'Neptune (Neptunus // Cryon-9)',
    category: 'planet',
    planetPreset: 'neptune',
    zoneType: 'DEEP SPACE // KUIPER EDGE',
    position: [260, -65, -1480],
    radius: 76,
    interactionRadius: 215,
    color: 0x274687,
    atmosphereColor: 0x3b82f6,
    emissiveColor: 0x0f1b3d,
    rotationSpeed: 0.12,
    hasRings: true,
    ringColor: 0x60a5fa,
    ringInnerScale: 1.3,
    ringOuterScale: 1.62,
    hasClouds: true,
    rewardCredits: 600,
    rewardXP: 460,
    description:
      'Raksasa es biru kobalt terdalam di Tata Surya dengan angin metana supersonik dan pusaran badai Great Dark Spot.'
  },
  {
    id: 'planet_pluto',
    name: 'Pluto & Kuiper Ice Belt',
    category: 'planet',
    planetPreset: 'pluto',
    zoneType: 'KUIPER FRONTIER',
    position: [0, -125, -1720],
    radius: 28,
    interactionRadius: 110,
    color: 0xd2b48c,
    atmosphereColor: 0x93c5fd,
    emissiveColor: 0x1e1b18,
    rotationSpeed: 0.05,
    hasRings: false,
    hasClouds: false,
    rewardCredits: 520,
    rewardXP: 400,
    description:
      'Planet katai es di jantung Sabuk Kuiper yang memiliki dataran gletser nitrogen berbentuk hati ikonik (Tombaugh Regio).'
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
    description:
      'Stabilisator hiper-dimensi kuno yang melayang di koridor Nebula Violet menuju pusat Bima Sakti.'
  },
  {
    id: 'sagittarius_a_star',
    name: 'Sagittarius A* (Milky Way Core)',
    category: 'black_hole',
    zoneType: 'GALACTIC CORE SINGULARITY',
    position: [-80, 210, -2150],
    radius: 95,
    interactionRadius: 340,
    color: 0xff6b00,
    atmosphereColor: 0x00f0ff,
    emissiveColor: 0xff4500,
    rotationSpeed: 0.35,
    hasRings: true,
    ringColor: 0xff8800,
    hasClouds: false,
    rewardCredits: 1200,
    rewardXP: 950,
    description:
      'Lubang hitam supermasif di pusat Galaksi Bima Sakti (Milky Way) yang dikelilingi piringan akresi plasma relativistik dan cincin foton.'
  },
  {
    id: 'black_hole_gargantua',
    name: 'Gargantua Singularity (Deep Rift)',
    category: 'black_hole',
    zoneType: 'GRAVITATIONAL ANOMALY',
    position: [420, -140, -1850],
    radius: 82,
    interactionRadius: 320,
    color: 0x7c3aed,
    atmosphereColor: 0x38bdf8,
    emissiveColor: 0x2e1065,
    rotationSpeed: 0.42,
    hasRings: true,
    ringColor: 0xa855f7,
    hasClouds: false,
    rewardCredits: 1100,
    rewardXP: 880,
    description:
      'Singularitas lubang hitam berotasi ekstrem dengan vorteks akresi ungu-kebiruan dan horizon peristiwa penarik materi.'
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
      'Pilot, calibrate your flight control thrusters by flying through 5 holographic vector rings leading toward Earth (Terra Prime).',
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
    title: '02 // Earth-Luna Sector Cartography',
    type: 'scan_targets',
    difficulty: 'Navigator',
    timeLimit: 180,
    rewardCredits: 700,
    rewardXP: 450,
    briefing:
      'Approach within sensor range and complete a telemetry scan of Earth (Bumi), The Moon (Luna), and Krios Orbital Station.',
    targetIds: ['aurelia_prime', 'selene_iv', 'krios_station']
  },
  {
    id: 'mission_03_asteroid_harvest',
    title: '03 // Main Asteroid Belt Core Extraction',
    type: 'collect_cores',
    difficulty: 'Specialist',
    timeLimit: 150,
    rewardCredits: 950,
    rewardXP: 620,
    briefing:
      'Navigate the hazardous Main Asteroid Belt (Tartarus Core), dodge EMP mines, and harvest 5 unstable Quantum Energy Cores.',
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
    title: '04 // Saturn Cassini Ring Trench Run',
    type: 'checkpoints',
    difficulty: 'Veteran',
    timeLimit: 95,
    rewardCredits: 1350,
    rewardXP: 850,
    briefing:
      'Engage afterburners and complete the high-velocity corridor from the Asteroid Belt to Saturn’s majestic ring system under 95 seconds.',
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
    title: '05 // Chronos & Jovian Expedition',
    type: 'checkpoints',
    difficulty: 'Commander',
    timeLimit: 145,
    rewardCredits: 2000,
    rewardXP: 1300,
    briefing:
      'Chart a deep-space route past Pyros V and Jupiter to fly through the long-range telemetry beacons toward the Chronos Anomaly Relay.',
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
      'Deploy into the Asteroid Belt. Engage the hostile fighter squadrons (WRAITH INTERCEPTOR & AEGIS SENTINEL), destroy the Dreadnought Kronos pulse batteries and citadel bridge, and extract through the Warp Gate.',
    bossPosition: [280, 10, -220],
    fighterSpawns: [
      [230, 25, -180],
      [320, -15, -250],
      [260, 40, -290],
      [340, 15, -170]
    ]
  },
  {
    id: 'mission_07_solar_grand_tour',
    title: '07 // Milky Way & Solar System Grand Tour',
    type: 'scan_targets',
    difficulty: 'Grandmaster',
    timeLimit: 320,
    rewardCredits: 4200,
    rewardXP: 3000,
    briefing:
      'Execute a trans-orbital reconnaissance tour across the Solar System: scan Mars, Jupiter, Saturn, and the supermassive black hole Sagittarius A*.',
    targetIds: ['planet_mars', 'planet_jupiter', 'planet_saturn', 'sagittarius_a_star']
  }
];

export const ACHIEVEMENTS_CATALOG = [
  { id: 'first_flight', title: 'First Ignition', desc: 'Fly a total distance of 1,000 meters in deep space.', reward: 200 },
  { id: 'cartographer', title: 'Stellar Cartographer', desc: 'Discover and scan at least 3 celestial objects.', reward: 400 },
  { id: 'solar_voyager', title: 'Solar System Voyager', desc: 'Scan at least 8 planets & moons across the Solar System.', reward: 1200 },
  { id: 'mission_ace', title: 'Vanguard Ace', desc: 'Complete at least 2 official flight missions.', reward: 500 },
  { id: 'fleet_commander', title: 'Fleet Expansion', desc: 'Unlock a second spacecraft in the Orbital Hangar.', reward: 600 },
  { id: 'chief_engineer', title: 'Chief Engineer', desc: 'Upgrade any ship subsystem to Level 3 or higher.', reward: 450 },
  { id: 'deep_explorer', title: 'Milky Way Pathfinder', desc: 'Scan all 15 major celestial bodies in the Solar System & Milky Way.', reward: 2500 },
  { id: 'emperor_slayer', title: 'Dreadnought Bane', desc: 'Defeat the hostile Dreadnought Kronos in Tartarus sector.', reward: 2500 }
];

export const EXPEDITION_SECTORS = [
  {
    id: 'alpha',
    region: 'SOLAR SYSTEM // TERRA-LUNA ORBIT',
    label: 'SECTOR EARTH (BUMI)',
    targetName: 'Earth (Terra Prime)',
    coordinates: '00.0000° N, 1.00 AU SOL',
    elevation: '408km Low Earth Orbit',
    density: '1.225 kg/m³',
    nitrogen: 78.1,
    oxygen: 20.9,
    argon: 1.0,
    radius: '6,371KM',
    gravity: '9.807 M/S²',
    magnetic: '0.31GAUSS',
    tilt: '23.44°',
    briefing:
      'Replika orbit Bumi & Bulan di Lengan Orion Galaksi Bima Sakti. Optimal untuk peluncuran langsung menuju Stasiun Krios, Venus, dan Merkurius.',
    spawnPos: [0, 10, 45]
  },
  {
    id: 'beta',
    region: 'INNER & RED PLANET CORRIDOR',
    label: 'SECTOR MARS & VENUS',
    targetName: 'Mars (Olympus Mons)',
    coordinates: '18.6500° N, 1.52 AU SOL',
    elevation: '21,229m Olympus Datum',
    density: '0.020 kg/m³',
    nitrogen: 2.7,
    oxygen: 0.13,
    argon: 1.6,
    radius: '3,389KM',
    gravity: '3.721 M/S²',
    magnetic: '0.01GAUSS',
    tilt: '25.19°',
    briefing:
      'Koridor planet bagian dalam Tata Surya. Dekat dengan dataran merah Mars, sabuk asteroid utama, dan awan asam Venus.',
    spawnPos: [-240, 12, -390]
  },
  {
    id: 'gamma',
    region: 'GAS GIANTS // JUPITER & SATURN RINGS',
    label: 'SECTOR JOVIAN–SATURN',
    targetName: 'Jupiter & Saturnus',
    coordinates: '5.20 AU – 9.58 AU SOL',
    elevation: 'Cassini Ring Plane',
    density: '1.326 g/cm³',
    nitrogen: 4.0,
    oxygen: 1.0,
    argon: 0.5,
    radius: '69,911KM',
    gravity: '24.79 M/S²',
    magnetic: '4.28GAUSS',
    tilt: '26.73°',
    briefing:
      'Sektor raksasa gas Tata Surya: amati Great Red Spot di Yupiter dan terbang menembus cincin es berlapis Cassini Division di Saturnus.',
    spawnPos: [380, 65, -760]
  },
  {
    id: 'delta',
    region: 'KUIPER ICE RIM & MILKY WAY CORE',
    label: 'SECTOR SAGITTARIUS A*',
    targetName: 'Uranus, Neptunus & Sgr A*',
    coordinates: '30.1 AU – GALACTIC CORE',
    elevation: 'Event Horizon Rim',
    density: '1.638 g/cm³',
    nitrogen: 15.0,
    oxygen: 2.0,
    argon: 1.2,
    radius: '24,622KM',
    gravity: '11.15 M/S²',
    magnetic: '0.23GAUSS',
    tilt: '97.77°',
    briefing:
      'Perbatasan terdalam Tata Surya & inti Galaksi Bima Sakti. Jelajahi Uranus, Neptunus, Pluto, komet Sabuk Kuiper, hingga lubang hitam supermasif Sagittarius A*.',
    spawnPos: [-110, 60, -1220]
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
    mission_06_destroy_emperor: { status: 'available', attempts: 0, bestTime: null, rewardsClaimed: false },
    mission_07_solar_grand_tour: { status: 'available', attempts: 0, bestTime: null, rewardsClaimed: false }
  },
  exploration: {
    discoveredObjectIds: [],
    totalFlightDistance: 0,
    totalFlightTime: 0,
    collectedFreeCores: 0
  },
  claimedAchievements: [],
  settings: {
    graphicsQuality: 'High',
    shadowsEnabled: true,
    bloomEnabled: true,
    particleDensity: 'High',
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
  if (achId === 'solar_voyager') return exp.discoveredObjectIds.length >= 8;
  if (achId === 'mission_ace') return completedCount >= 2;
  if (achId === 'fleet_commander') return unlockedShipsCount >= 2;
  if (achId === 'chief_engineer') return hasLevel3Upgrade;
  if (achId === 'deep_explorer') return exp.discoveredObjectIds.length >= WORLD_OBJECTS.length;
  if (achId === 'emperor_slayer') return saveData.missions?.mission_06_destroy_emperor?.status === 'completed';
  return false;
}
