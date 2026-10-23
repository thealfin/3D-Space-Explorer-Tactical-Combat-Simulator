import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Rocket, Compass, Shield, Zap, Settings, User, Award, Play, Pause,
  RotateCcw, Volume2, VolumeX, Eye, EyeOff, Crosshair, Navigation, Cpu,
  CheckCircle2, AlertTriangle, Lock, Unlock, ChevronRight, Sparkles,
  Sliders, HelpCircle, Globe, Disc, Radio, RefreshCw, Layers, Gauge,
  Maximize2, Minimize2, Terminal, ArrowUpRight, Info, Check, X, Activity, Flame,
  Download, ChevronDown
} from 'lucide-react';

// ============================================================================
// 1. CONFIGURATION, DATA CATALOGS & DEFAULT STATE (SCHEMA V1)
// ============================================================================
const SAVE_SCHEMA_VERSION = 1;

const SHIPS_CATALOG = [
  {
    id: 'vanguard_vx1',
    name: 'VX-01 Corsair Vanguard',
    role: 'Tactical Strike Interceptor',
    description: 'Armored multi-faceted strike fighter with golden-amber reflective canopy, hazard-orange canards, twin dorsal thermal nacelles, and underwing heavy autocannons.',
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
      shield: 120,
    }
  },
  {
    id: 'phantom_nx7',
    name: 'NX-07 Phantom',
    role: 'High-Velocity Interceptor',
    description: 'Forward-swept stealth frame featuring twin plasma afterburners and ultra-responsive gyro stabilizers.',
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
      shield: 100,
    }
  },
  {
    id: 'titan_at99',
    name: 'AT-99 Titan',
    role: 'Heavy Deep-Core Cruiser',
    description: 'Armored expedition vessel equipped with quad heavy thrusters and reinforced multi-layer deflector shields.',
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
      shield: 220,
    }
  }
];

const WORLD_OBJECTS = [
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

const MISSIONS_CATALOG = [
  {
    id: 'mission_01_calibration',
    title: '01 // Orbital Vector Calibration',
    type: 'checkpoints',
    difficulty: 'Cadet',
    timeLimit: 110,
    rewardCredits: 450,
    rewardXP: 300,
    briefing: 'Pilot, calibrate your flight control thrusters by flying through 5 holographic vector rings leading toward Aurelia Prime.',
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
    briefing: 'Approach within sensor range and complete a telemetry scan of Aurelia Prime, Selene-IV Moon, and Krios Orbital Station.',
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
    briefing: 'Navigate the hazardous Tartarus Asteroid Belt and harvest 5 unstable Quantum Energy Cores before containment expires.',
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
    briefing: 'Engage afterburners and complete the high-velocity corridor from Tartarus Sector to Cryon-9 approach vector under 95 seconds.',
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
    briefing: 'Chart a deep-space route past Pyros V and fly through the long-range telemetry beacons to reach the Chronos Anomaly Relay.',
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
    briefing: 'Pilot, deploy into the Tartarus Asteroid Belt. Engage the hostile fighter squadrons (WRAITH INTERCEPTOR & AEGIS SENTINEL), destroy the Dreadnought Kronos pulse batteries and citadel bridge, and extract through the Warp Gate.',
    bossPosition: [280, 10, -220],
    fighterSpawns: [
      [230, 25, -180],
      [320, -15, -250],
      [260, 40, -290],
      [340, 15, -170]
    ]
  }
];

const ACHIEVEMENTS_CATALOG = [
  { id: 'first_flight', title: 'First Ignition', desc: 'Fly a total distance of 1,000 meters in deep space.', reward: 200 },
  { id: 'cartographer', title: 'Stellar Cartographer', desc: 'Discover and scan at least 3 celestial objects.', reward: 400 },
  { id: 'mission_ace', title: 'Vanguard Ace', desc: 'Complete at least 2 official flight missions.', reward: 500 },
  { id: 'fleet_commander', title: 'Fleet Expansion', desc: 'Unlock a second spacecraft in the Orbital Hangar.', reward: 600 },
  { id: 'chief_engineer', title: 'Chief Engineer', desc: 'Upgrade any ship subsystem to Level 3 or higher.', reward: 450 },
  { id: 'deep_explorer', title: 'Void Pathfinder', desc: 'Scan all 7 major objects in the Helios System.', reward: 1500 },
  { id: 'emperor_slayer', title: 'Dreadnought Bane', desc: 'Defeat the hostile Dreadnought Kronos in Tartarus sector.', reward: 2500 },
];

const DEFAULT_SAVE_DATA = {
  schemaVersion: SAVE_SCHEMA_VERSION,
  pilotProfile: {
    id: 'PLT-8849-VNG',
    callsign: 'NOVA-01',
    level: 1,
    experience: 0,
    credits: 650,
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

// ============================================================================
// 2. INDEXED-DB PERSISTENCE SERVICE (WITH VALIDATION & MIGRATION)
// ============================================================================
class PersistenceService {
  constructor() {
    this.dbName = 'SpaceExplorer3D_Storage';
    this.storeName = 'pilot_save_store';
    this.saveKey = 'primary_save_v1';
    this.memoryFallback = null;
  }

  async openDB() {
    if (typeof indexedDB === 'undefined') return null;
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = (e) => {
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

  validateAndMigrate(raw) {
    if (!raw || typeof raw !== 'object') {
      return structuredClone(DEFAULT_SAVE_DATA);
    }
    const base = structuredClone(DEFAULT_SAVE_DATA);
    try {
      const merged = {
        schemaVersion: SAVE_SCHEMA_VERSION,
        pilotProfile: { ...base.pilotProfile, ...(raw.pilotProfile || {}) },
        ships: { ...base.ships, ...(raw.ships || {}) },
        selectedShipId: raw.selectedShipId && base.ships[raw.selectedShipId] ? raw.selectedShipId : base.selectedShipId,
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

  async load() {
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

  async save(data) {
    const clean = JSON.parse(JSON.stringify(data));
    clean.pilotProfile.updatedAt = Date.now();
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

  async reset() {
    const fresh = structuredClone(DEFAULT_SAVE_DATA);
    await this.save(fresh);
    return fresh;
  }
}

const persistence = new PersistenceService();

// ============================================================================
// 3. MODULAR WEB AUDIO API SOUND SYSTEM (ENGINE, SFX, AMBIENT DRONE)
// ============================================================================
class SpaceAudioSystem {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneGain = null;
    this.settings = DEFAULT_SAVE_DATA.settings;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Continuous Engine Thruster Sound
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 48;

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 140;

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.0;

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();

      // Ambient Space Pad Drone
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc2.type = 'triangle';
      this.droneOsc1.frequency.value = 55; // A1
      this.droneOsc2.frequency.value = 82.41; // E2

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 260;

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0.0;

      this.droneOsc1.connect(droneFilter);
      this.droneOsc2.connect(droneFilter);
      droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);
      this.droneOsc1.start();
      this.droneOsc2.start();

      this.initialized = true;
      this.updateVolumes(this.settings);
    } catch {
      // Fail gracefully if Web Audio is blocked
    }
  }

  resume() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  updateVolumes(settings) {
    this.settings = settings;
    if (!this.initialized || !this.ctx) return;
    const muteFactor = settings.muted ? 0 : 1;
    const musicVol = settings.masterVolume * settings.musicVolume * muteFactor * 0.08;
    if (this.droneGain) {
      this.droneGain.gain.setTargetAtTime(musicVol, this.ctx.currentTime, 0.2);
    }
  }

  updateEngine(speedRatio, isBoosting, isPlaying) {
    if (!this.initialized || !this.ctx || !this.engineGain) return;
    const muteFactor = this.settings.muted || !isPlaying ? 0 : 1;
    const baseVol = this.settings.masterVolume * this.settings.sfxVolume * muteFactor * 0.11;
    const targetGain = baseVol * (0.25 + speedRatio * 0.75 + (isBoosting ? 0.35 : 0));
    const targetFreq = 42 + speedRatio * 68 + (isBoosting ? 42 : 0);
    const targetFilter = 120 + speedRatio * 340 + (isBoosting ? 420 : 0);

    const now = this.ctx.currentTime;
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(targetFilter, now, 0.08);
  }

  playTone(freqStart, freqEnd, duration = 0.18, type = 'sine', volScale = 0.2) {
    this.resume();
    if (!this.initialized || !this.ctx || this.settings.muted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);

      const vol = this.settings.masterVolume * this.settings.sfxVolume * volScale;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  playUIClick() {
    this.playTone(620, 880, 0.07, 'sine', 0.12);
  }

  playBoost() {
    this.playTone(110, 440, 0.38, 'sawtooth', 0.22);
  }

  playCollision() {
    this.playTone(150, 34, 0.42, 'sawtooth', 0.35);
  }

  playLaserShot(alt = false) {
    const start = alt ? 920 : 980;
    this.playTone(start, 180, 0.09, 'sawtooth', 0.18);
  }

  playPlasmaShot() {
    this.playTone(460, 85, 0.16, 'square', 0.22);
  }

  playTorpedoLaunch() {
    this.playTone(90, 420, 0.24, 'triangle', 0.28);
    setTimeout(() => this.playTone(420, 140, 0.28, 'sawtooth', 0.24), 80);
  }

  playHitSpark() {
    this.playTone(1400, 750, 0.04, 'sine', 0.14);
  }

  playTargetLock() {
    this.playTone(880, 880, 0.06, 'square', 0.15);
    setTimeout(() => this.playTone(1320, 1320, 0.08, 'square', 0.18), 70);
  }

  playExplosion(isHeavy = false) {
    this.resume();
    if (!this.initialized || !this.ctx || this.settings.muted) return;
    try {
      const now = this.ctx.currentTime;
      const duration = isHeavy ? 0.95 : 0.48;
      const sampleRate = this.ctx.sampleRate;
      const buffer = this.ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-3.5 * (i / data.length));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isHeavy ? 450 : 750, now);
      filter.frequency.exponentialRampToValueAtTime(35, now + duration);

      const gain = this.ctx.createGain();
      const vol = this.settings.masterVolume * this.settings.sfxVolume * (isHeavy ? 0.48 : 0.32);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noiseSource.start(now);

      // Low punch sub-bass oscillator
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(isHeavy ? 110 : 85, now);
      sub.frequency.exponentialRampToValueAtTime(22, now + duration * 0.7);
      subGain.gain.setValueAtTime(vol * 0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(now);
      sub.stop(now + duration * 0.7);
    } catch {}
  }

  playCheckpoint() {
    this.playTone(523.25, 1046.5, 0.24, 'triangle', 0.22);
  }

  playDiscovery() {
    this.playTone(440, 880, 0.45, 'sine', 0.24);
    setTimeout(() => this.playTone(659.25, 1318.5, 0.5, 'triangle', 0.22), 130);
  }

  playMissionComplete() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      setTimeout(() => this.playTone(f, f * 1.02, 0.35, 'triangle', 0.24), idx * 110);
    });
  }

  dispose() {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.initialized = false;
    }
  }
}

const audioSystem = new SpaceAudioSystem();

// ============================================================================
// 4. PROCEDURAL 3D ASSET & SHADER / TEXTURE GENERATORS (HIGH-RES 2K & PBR)
// ============================================================================
function createProceduralPlanetTexture(baseColorHex, secondaryHex, hasBands = false) {
  const width = 2048;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d');

  const c1 = new THREE.Color(baseColorHex);
  const c2 = new THREE.Color(secondaryHex);
  const cDark = c1.clone().multiplyScalar(0.32);
  const cLight = c1.clone().lerp(new THREE.Color(0xffffff), 0.38);

  // Base multi-stop latitudinal gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0.0, `#${cDark.getHexString()}`);
  grad.addColorStop(0.18, `#${c2.getHexString()}`);
  grad.addColorStop(0.5, `#${c1.getHexString()}`);
  grad.addColorStop(0.82, `#${c2.getHexString()}`);
  grad.addColorStop(1.0, `#${cDark.getHexString()}`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Neutral grey base for synthetic bump/normal heightmap
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, width, height);

  // Layer 1: Multi-frequency atmospheric bands & sinusoidal turbulent jetstreams
  const bandCount = hasBands ? 140 : 75;
  for (let i = 0; i < bandCount; i++) {
    const baseY = (i / bandCount) * height;
    const bandH = (hasBands ? 5 : 9) + (i % 7) * 3.5;
    const alpha = hasBands ? 0.06 + (i % 4) * 0.035 : 0.025 + (i % 3) * 0.02;
    ctx.fillStyle = i % 2 === 0
      ? `rgba(255, 250, 240, ${alpha})`
      : `rgba(8, 14, 30, ${alpha * 1.25})`;

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= width; x += 32) {
      const wave = Math.sin((x / width) * Math.PI * 4 + i * 0.7) * (hasBands ? 12 : 22)
        + Math.cos((x / width) * Math.PI * 10 - i * 1.3) * 5;
      ctx.lineTo(x, baseY + wave);
    }
    ctx.lineTo(width, baseY + bandH + 20);
    ctx.lineTo(0, baseY + bandH + 20);
    ctx.closePath();
    ctx.fill();

    // Relief band in bump map
    bCtx.fillStyle = i % 2 === 0 ? 'rgba(210,210,210,0.08)' : 'rgba(45,45,45,0.08)';
    bCtx.fillRect(0, baseY, width, bandH);
  }

  // Layer 2: Multi-octave procedural landmass / tectonic / storm vortex features
  const featureCount = hasBands ? 180 : 320;
  for (let i = 0; i < featureCount; i++) {
    const seed = i * 137.5;
    const x = ((Math.sin(seed * 0.73) * 0.5 + 0.5) * width);
    const y = ((Math.cos(seed * 0.41) * 0.5 + 0.5) * (height * 0.84)) + height * 0.08;
    const rx = (hasBands ? 28 : 18) + (i % 13) * (hasBands ? 14 : 11);
    const ry = (hasBands ? 8 : 14) + (i % 9) * (hasBands ? 4 : 9);
    const rot = hasBands ? (Math.sin(seed) * 0.12) : (Math.sin(seed) * Math.PI);

    const featGrad = ctx.createRadialGradient(x, y, rx * 0.1, x, y, rx);
    if (i % 3 === 0) {
      featGrad.addColorStop(0, `rgba(${Math.round(cLight.r * 255)}, ${Math.round(cLight.g * 255)}, ${Math.round(cLight.b * 255)}, 0.24)`);
      featGrad.addColorStop(1, 'rgba(255,255,255,0)');
    } else if (i % 3 === 1) {
      featGrad.addColorStop(0, `rgba(${Math.round(c2.r * 255)}, ${Math.round(c2.g * 255)}, ${Math.round(c2.b * 255)}, 0.28)`);
      featGrad.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
      featGrad.addColorStop(0, 'rgba(6, 12, 26, 0.26)');
      featGrad.addColorStop(1, 'rgba(6, 12, 26, 0)');
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(1, ry / Math.max(1, rx));
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fillStyle = featGrad;
    ctx.fill();
    ctx.restore();

    // Crater / mountain rim on bump map
    bCtx.save();
    bCtx.translate(x, y);
    bCtx.rotate(rot);
    bCtx.scale(1, ry / Math.max(1, rx));
    bCtx.beginPath();
    bCtx.arc(0, 0, rx * 0.75, 0, Math.PI * 2);
    bCtx.fillStyle = i % 2 === 0 ? 'rgba(235,235,235,0.16)' : 'rgba(30,30,30,0.18)';
    bCtx.fill();
    bCtx.lineWidth = 2.5;
    bCtx.strokeStyle = 'rgba(245,245,245,0.22)';
    bCtx.stroke();
    bCtx.restore();
  }

  // Layer 3: High-frequency surface micro-detail & specular grain
  for (let i = 0; i < 900; i++) {
    const gx = (Math.sin(i * 91.3) * 0.5 + 0.5) * width;
    const gy = (Math.cos(i * 57.9) * 0.5 + 0.5) * height;
    const r = 1.5 + (i % 5) * 1.8;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(gx, gy, r * 2, r);
    bCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';
    bCtx.fillRect(gx, gy, r * 2, r);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.ClampToEdgeWrapping;
  bumpTexture.anisotropy = 4;

  texture.userData = { bumpMap: bumpTexture };
  return texture;
}

function createProceduralCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 220; i++) {
    const x = (Math.sin(i * 63.7) * 0.5 + 0.5) * canvas.width;
    const y = (Math.cos(i * 39.1) * 0.5 + 0.5) * canvas.height;
    const rx = 24 + (i % 9) * 14;
    const ry = 6 + (i % 5) * 4;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
    grad.addColorStop(0.55, 'rgba(220, 240, 255, 0.14)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function createFresnelAtmosphereMaterial(atmosphereColorHex, intensity = 1.35) {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(atmosphereColorHex) },
      intensity: { value: intensity }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float intensity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float viewDot = abs(dot(vNormal, vViewDir));
        float fresnel = pow(clamp(1.0 - viewDot, 0.0, 1.0), 2.4);
        gl_FragColor = vec4(glowColor, fresnel * intensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide
  });
}

let cachedStarSprite = null;
function getStarSpriteTexture() {
  if (cachedStarSprite) return cachedStarSprite;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
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

let cachedNebulaSprite = null;
function getNebulaCloudTexture() {
  if (cachedNebulaSprite) return cachedNebulaSprite;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

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

function createHexGridFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

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

let cachedHullGreebleTex = null;
function getHullGreebleTexture() {
  if (cachedHullGreebleTex) return cachedHullGreebleTex;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

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

const wingDecalCache = {};
function getCorsairWingDecalTexture(accentHex = '#ff6200') {
  if (wingDecalCache[accentHex]) return wingDecalCache[accentHex];
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

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

  // Solar Compass Rose / Sawtooth Halo Ring (matching tumbnail.jpg wing emblem)
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

  // Tactical White Corsair Skull Insignia (matching tumbnail.jpg)
  ctx.fillStyle = '#e8eef5';
  // Cranium dome
  ctx.beginPath();
  ctx.arc(0, -34, 128, Math.PI * 0.88, Math.PI * 0.12, false);
  // Cheekbones & angular jaw
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
  // Left Eye
  ctx.beginPath();
  ctx.moveTo(-82, -18);
  ctx.lineTo(-22, -4);
  ctx.lineTo(-32, 34);
  ctx.lineTo(-76, 20);
  ctx.closePath();
  ctx.fill();
  // Right Eye
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

  // Caution Triangle on upper corner (like tumbnail.jpg orange scoop decal)
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

function buildSpaceshipMesh(shipSpec) {
  const root = new THREE.Group();
  const hullGroup = new THREE.Group();
  root.add(hullGroup);

  const greebleTex = getHullGreebleTexture();
  const isDefaultCorsair = shipSpec.id === 'vanguard_vx1';
  const hazardColorHex = isDefaultCorsair ? 0xff6200 : shipSpec.primaryColor || 0xff6200;
  const wingDecalTex = getCorsairWingDecalTexture(isDefaultCorsair ? '#ff6200' : (shipSpec.accentHex || '#ff6200'));

  // a. Fuselage: Matte Charcoal Gunmetal (0x1a212d, metalness: 0.88, roughness: 0.28)
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

  // Weathered Steel Edge Plating (nose strakes & cannon barrels)
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

  // d. Thermal Orange Heat Vents & Intake Rings (emissive: 0xff4800, intensity: 1.8)
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

  // Teal/Cyan Exhaust Petal Armor (rear turbine nozzles as in tumbnail.jpg)
  const nozzleArmorMat = new THREE.MeshStandardMaterial({
    color: 0x164e63,
    emissive: 0x083344,
    emissiveIntensity: 0.45,
    metalness: 0.9,
    roughness: 0.22
  });

  // ==========================================================================
  // 1. MULTI-FACETED FUSELAGE & NOSE ASSEMBLY (Pointing toward -Z)
  // ==========================================================================
  // Main Central Lifting-Body Core
  const coreFuselageGeo = new THREE.CylinderGeometry(0.68, 1.48, 5.4, 6);
  coreFuselageGeo.rotateX(-Math.PI / 2);
  coreFuselageGeo.scale(1.28, 0.58, 1.0);
  const coreFuselage = new THREE.Mesh(coreFuselageGeo, hullMat);
  coreFuselage.position.set(0, 0.02, 0.15);
  coreFuselage.castShadow = true;
  coreFuselage.receiveShadow = true;
  hullGroup.add(coreFuselage);

  // Sculpted Forward Stealth Nose Cone
  const noseConeGeo = new THREE.ConeGeometry(0.82, 2.35, 6);
  noseConeGeo.rotateX(-Math.PI / 2);
  noseConeGeo.scale(1.12, 0.52, 1.0);
  const noseCone = new THREE.Mesh(noseConeGeo, hullMat);
  noseCone.position.set(0, -0.06, -3.35);
  hullGroup.add(noseCone);

  // Signature Hazard-Orange Nose Tip Bumper (directly from tumbnail.jpg)
  const noseTipGeo = new THREE.BoxGeometry(0.66, 0.24, 0.58);
  const noseTip = new THREE.Mesh(noseTipGeo, hazardOrangeMat);
  noseTip.position.set(0, -0.08, -4.18);
  noseTip.rotation.x = 0.18;
  hullGroup.add(noseTip);

  // Dorsal Spine Armor Stripe (Hazard Orange stripe behind cockpit)
  const spineStripeGeo = new THREE.BoxGeometry(0.42, 0.12, 1.35);
  const spineStripe = new THREE.Mesh(spineStripeGeo, hazardOrangeMat);
  spineStripe.position.set(0, 0.48, -0.45);
  spineStripe.rotation.x = -0.08;
  hullGroup.add(spineStripe);

  // Dorsal Recessed Circular Cooling Core / Gyro Ring (between twin nacelles)
  const dorsalHousingGeo = new THREE.CylinderGeometry(0.46, 0.52, 0.18, 16);
  const dorsalHousing = new THREE.Mesh(dorsalHousingGeo, darkTrimMat);
  dorsalHousing.position.set(0, 0.48, 0.55);
  hullGroup.add(dorsalHousing);

  const dorsalGlowRingGeo = new THREE.TorusGeometry(0.28, 0.045, 12, 24);
  dorsalGlowRingGeo.rotateX(Math.PI / 2);
  const dorsalGlowRing = new THREE.Mesh(dorsalGlowRingGeo, cyanPlasmaMat);
  dorsalGlowRing.position.set(0, 0.58, 0.55);
  hullGroup.add(dorsalGlowRing);

  // Lateral Nose Strakes / Cheek Plates (weathered steel shelves flanking nose)
  [-1, 1].forEach((side) => {
    const cheekGeo = new THREE.BoxGeometry(0.55, 0.1, 1.95);
    const cheek = new THREE.Mesh(cheekGeo, steelPlateMat);
    cheek.position.set(side * 0.72, -0.14, -2.65);
    cheek.rotation.y = side * 0.22;
    cheek.rotation.z = -side * 0.1;
    hullGroup.add(cheek);

    // Forward Cockpit Flanking Thermal Intake Pods (glowing orange grilles)
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

  // ==========================================================================
  // 2. FACETED GOLDEN-AMBER REFLECTIVE COCKPIT CANOPY
  // ==========================================================================
  const cockpitGroup = new THREE.Group();
  cockpitGroup.position.set(0, 0.26, -2.15);
  hullGroup.add(cockpitGroup);

  // Forward Sloped Faceted Canopy Glass
  const frontGlassGeo = new THREE.CylinderGeometry(0.32, 0.58, 1.65, 6);
  frontGlassGeo.rotateX(-Math.PI / 2);
  frontGlassGeo.scale(1.08, 0.68, 1.0);
  const frontGlass = new THREE.Mesh(frontGlassGeo, canopyMat);
  frontGlass.position.set(0, 0.04, -0.45);
  frontGlass.rotation.x = 0.22;
  cockpitGroup.add(frontGlass);

  // Rear Canopy Glass Section
  const rearGlassGeo = new THREE.CylinderGeometry(0.58, 0.48, 1.05, 6);
  rearGlassGeo.rotateX(-Math.PI / 2);
  rearGlassGeo.scale(1.08, 0.72, 1.0);
  const rearGlass = new THREE.Mesh(rearGlassGeo, canopyMat);
  rearGlass.position.set(0, 0.22, 0.72);
  cockpitGroup.add(rearGlass);

  // Armored Gunmetal Canopy Frame Struts & Upper Brow Plate
  const canopyBrowGeo = new THREE.BoxGeometry(0.76, 0.14, 0.95);
  const canopyBrow = new THREE.Mesh(canopyBrowGeo, steelPlateMat);
  canopyBrow.position.set(0, 0.44, 0.75);
  canopyBrow.rotation.x = -0.08;
  cockpitGroup.add(canopyBrow);

  const canopyArchGeo = new THREE.BoxGeometry(0.92, 0.08, 0.12);
  const canopyArch = new THREE.Mesh(canopyArchGeo, darkTrimMat);
  canopyArch.position.set(0, 0.26, 0.18);
  cockpitGroup.add(canopyArch);

  // ==========================================================================
  // 3. FORWARD CANARDS, SWEPT TACTICAL WINGS, SCOOPS & CANTED WINGLETS
  // ==========================================================================
  const wingSpan = shipSpec.id === 'titan_at99' ? 7.2 : shipSpec.id === 'phantom_nx7' ? 6.5 : 6.2;
  const wingSweep = shipSpec.id === 'phantom_nx7' ? -0.18 : 0.18;

  // Create custom bevelled tactical delta wing geometry
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
    // Forward Canard Fins (Industrial Hazard Orange)
    const canardGroup = new THREE.Group();
    canardGroup.position.set(side * 0.88, -0.1, -2.05);
    canardGroup.rotation.y = side * 0.35;
    canardGroup.rotation.z = -side * 0.08;
    hullGroup.add(canardGroup);

    const canardGeo = new THREE.BoxGeometry(0.92, 0.09, 0.68);
    const canardMesh = new THREE.Mesh(canardGeo, hazardOrangeMat);
    canardMesh.position.set(side * 0.38, 0, 0);
    canardGroup.add(canardMesh);

    // Canard Tip Navigation Strobe
    const navLightGeo = new THREE.BoxGeometry(0.14, 0.06, 0.22);
    const navLight = new THREE.Mesh(navLightGeo, accentMat);
    navLight.position.set(side * 0.82, 0, -0.12);
    canardGroup.add(navLight);

    // Main Swept Wing Container
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

    // Upper Wing Decal Armor Plate (Corsair Skull & Solar Ring Emblem)
    const decalPlateGeo = new THREE.PlaneGeometry(wingSpan * 0.38, 1.85);
    decalPlateGeo.rotateX(-Math.PI / 2);
    const decalPlate = new THREE.Mesh(decalPlateGeo, wingDecalMat);
    decalPlate.position.set(side * (wingSpan * 0.22), 0.055, 0.12);
    decalPlate.rotation.y = side * -0.12;
    wingContainer.add(decalPlate);

    // Raised Upper-Wing Hazard Orange Air-Scoop Cowling (prominent in tumbnail.jpg)
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

    // Leading-Edge Wing Illumination Slits
    const edgeLightGeo = new THREE.BoxGeometry(0.55, 0.05, 0.08);
    const edgeLight = new THREE.Mesh(edgeLightGeo, accentMat);
    edgeLight.position.set(side * (wingSpan * 0.16), -0.02, -0.82);
    edgeLight.rotation.y = side * 0.32;
    wingContainer.add(edgeLight);

    // Wingtip Canted Stabilizer Winglets (Industrial Hazard Orange)
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

    // ========================================================================
    // 5. HEAVY UNDERWING WEAPON PODS (Twin Autocannons / Railguns)
    // ========================================================================
    const weaponPod = new THREE.Group();
    weaponPod.position.set(side * (wingSpan * 0.34), -0.34, 0.05);
    wingContainer.add(weaponPod);

    // Armored Hardpoint Pylon & Turret Receiver
    const pylonGeo = new THREE.BoxGeometry(0.28, 0.36, 0.92);
    const pylon = new THREE.Mesh(pylonGeo, darkTrimMat);
    pylon.position.set(0, 0.12, 0);
    weaponPod.add(pylon);

    const gunBodyGeo = new THREE.CylinderGeometry(0.22, 0.26, 1.25, 8);
    gunBodyGeo.rotateX(Math.PI / 2);
    const gunBody = new THREE.Mesh(gunBodyGeo, hullMat);
    gunBody.position.set(0, -0.12, -0.15);
    weaponPod.add(gunBody);

    // Dual Rifled Autocannon Barrels + Glowing Muzzle Tips
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

  // ==========================================================================
  // 4. TWIN DORSAL ENGINE NACELLES, THERMAL RINGS & CYAN PLASMA CONES
  // ==========================================================================
  const thrusterFlames = [];
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

    // Main Ribbed Cylindrical Turbine Housing
    const shroudGeo = new THREE.CylinderGeometry(0.42, 0.48, 2.35, 16);
    shroudGeo.rotateX(Math.PI / 2);
    const shroud = new THREE.Mesh(shroudGeo, hullMat);
    shroud.castShadow = true;
    nacelleGroup.add(shroud);

    // Forward Rounded Intake Nose with Glowing Orange Thermal Ring
    const intakeConeGeo = new THREE.ConeGeometry(0.42, 0.75, 16);
    intakeConeGeo.rotateX(-Math.PI / 2);
    const intakeCone = new THREE.Mesh(intakeConeGeo, steelPlateMat);
    intakeCone.position.set(0, 0, -1.52);
    nacelleGroup.add(intakeCone);

    const thermalRingGeo = new THREE.TorusGeometry(0.41, 0.055, 12, 24);
    const thermalRing = new THREE.Mesh(thermalRingGeo, accentMat);
    thermalRing.position.set(0, 0, -0.95);
    nacelleGroup.add(thermalRing);

    // 4 Glowing Lateral Orange Cooling Vent Slots along the Nacelle
    for (let v = 0; v < 4; v++) {
      const ventGeo = new THREE.BoxGeometry(0.9, 0.06, 0.11);
      const vent = new THREE.Mesh(ventGeo, accentMat);
      vent.position.set(0, 0.14, -0.55 + v * 0.24);
      nacelleGroup.add(vent);
    }

    // Rear Segmented Teal-Armored Turbine Exhaust Nozzle (matching tumbnail.jpg)
    const nozzleGeo = new THREE.CylinderGeometry(0.46, 0.36, 0.65, 12);
    nozzleGeo.rotateX(Math.PI / 2);
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleArmorMat);
    nozzle.position.set(0, 0, 1.42);
    nacelleGroup.add(nozzle);

    const innerNozzleRingGeo = new THREE.TorusGeometry(0.32, 0.045, 10, 20);
    const innerNozzleRing = new THREE.Mesh(innerNozzleRingGeo, cyanPlasmaMat);
    innerNozzleRing.position.set(0, 0, 1.74);
    nacelleGroup.add(innerNozzleRing);

    // Dynamic Multi-Layer Cyan Plasma Thruster Plume
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

  // Ship Dynamic Point Lights (Warm Amber Canopy/Vent Glow + Cyan Afterburner Light)
  const thrusterLight = new THREE.PointLight(0x00d2ff, 2.4, 18);
  thrusterLight.position.set(0, 0.3, 3.8);
  hullGroup.add(thrusterLight);

  const ventLight = new THREE.PointLight(0xff5500, 1.4, 10);
  ventLight.position.set(0, 0.6, -0.5);
  hullGroup.add(ventLight);

  // ==========================================================================
  // 6. ENERGY SHIELD BUBBLE (Flashes on Impact)
  // ==========================================================================
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

// ============================================================================
// 4B. GALAXY DOME, CRATERED ASTEROIDS & COMBAT ENTITY GENERATORS
// ============================================================================
let cachedGalaxySkyTex = null;
function getGalaxySkyboxTexture() {
  if (cachedGalaxySkyTex) return cachedGalaxySkyTex;
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base Deep Cosmic Midnight Black/Emerald
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#02070e');
  bgGrad.addColorStop(0.3, '#04161a');
  bgGrad.addColorStop(0.5, '#071f24');
  bgGrad.addColorStop(0.75, '#031217');
  bgGrad.addColorStop(1, '#02060b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Swirling Emerald-Teal & Jade Cosmic Nebula Streams (matching reference video)
  const nebulaStreams = [
    { cx: 700, cy: 450, rx: 650, ry: 320, rot: -0.28, color1: 'rgba(13, 148, 136, 0.38)', color2: 'rgba(4, 47, 46, 0)' },
    { cx: 1350, cy: 550, rx: 750, ry: 380, rot: 0.35, color1: 'rgba(15, 118, 110, 0.42)', color2: 'rgba(2, 44, 34, 0)' },
    { cx: 1050, cy: 300, rx: 500, ry: 240, rot: 0.15, color1: 'rgba(6, 182, 212, 0.28)', color2: 'rgba(8, 51, 68, 0)' },
    { cx: 350, cy: 720, rx: 420, ry: 200, rot: -0.42, color1: 'rgba(16, 185, 129, 0.25)', color2: 'rgba(6, 78, 59, 0)' },
    { cx: 1750, cy: 380, rx: 460, ry: 220, rot: 0.22, color1: 'rgba(45, 212, 191, 0.22)', color2: 'rgba(17, 24, 39, 0)' }
  ];

  nebulaStreams.forEach((st) => {
    ctx.save();
    ctx.translate(st.cx, st.cy);
    ctx.rotate(st.rot);
    ctx.scale(1, st.ry / st.rx);
    const rad = ctx.createRadialGradient(0, 0, st.rx * 0.15, 0, 0, st.rx);
    rad.addColorStop(0, st.color1);
    rad.addColorStop(0.6, st.color1.replace(/[\d.]+\)$/, '0.12)'));
    rad.addColorStop(1, st.color2);
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(0, 0, st.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Dark Cosmic Dust Rifts (veins of dark interstellar obscuration)
  for (let i = 0; i < 28; i++) {
    ctx.save();
    const x = (i / 28) * canvas.width + Math.sin(i * 3.4) * 80;
    const y = 380 + Math.cos(i * 2.1) * 220;
    const rx = 80 + Math.random() * 95;
    const ry = 22 + Math.random() * 35;
    ctx.translate(x, y);
    ctx.rotate(Math.sin(i * 1.7) * 0.5);
    ctx.scale(1, ry / rx);
    const dGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, rx);
    dGrad.addColorStop(0, 'rgba(1, 5, 10, 0.72)');
    dGrad.addColorStop(1, 'rgba(1, 5, 10, 0)');
    ctx.fillStyle = dGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Star clusters & micro stellar dust
  for (let i = 0; i < 1800; i++) {
    const sx = Math.random() * canvas.width;
    const sy = Math.random() * canvas.height;
    const sr = Math.random() < 0.08 ? 1.8 + Math.random() * 1.5 : 0.6 + Math.random() * 0.8;
    const alpha = 0.35 + Math.random() * 0.65;
    const isTeal = Math.random() < 0.45;
    ctx.fillStyle = isTeal ? `rgba(165, 243, 252, ${alpha})` : `rgba(254, 243, 199, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  cachedGalaxySkyTex = new THREE.CanvasTexture(canvas);
  cachedGalaxySkyTex.wrapS = THREE.RepeatWrapping;
  cachedGalaxySkyTex.wrapT = THREE.ClampToEdgeWrapping;
  cachedGalaxySkyTex.colorSpace = THREE.SRGBColorSpace;
  return cachedGalaxySkyTex;
}

const asteroidTexCache = {};
function getCrateredAsteroidTexture(rockType = 'grey') {
  if (asteroidTexCache[rockType]) return asteroidTexCache[rockType];
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bCtx = bumpCanvas.getContext('2d');

  const isRed = rockType === 'red';
  const baseColor = isRed ? '#5c2e26' : '#524c47';
  const midColor = isRed ? '#783d33' : '#6b645e';
  const lightColor = isRed ? '#965245' : '#888078';

  // Base Rocky Tone
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

    // Dark crater bowl in diffuse
    const cGrad = ctx.createRadialGradient(cx, cy, cr * 0.15, cx, cy, cr);
    cGrad.addColorStop(0, '#1c1714');
    cGrad.addColorStop(0.7, '#2f2824');
    cGrad.addColorStop(0.85, isRed ? '#8a4b3d' : '#807972');
    cGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();

    // Bump Map: depression in center + elevated bright rim ring
    const bGrad = bCtx.createRadialGradient(cx, cy, cr * 0.1, cx, cy, cr * 1.15);
    bGrad.addColorStop(0, '#282828');
    bGrad.addColorStop(0.72, '#484848');
    bGrad.addColorStop(0.88, '#e0e0e0');
    bGrad.addColorStop(1, '#808080');
    bCtx.fillStyle = bGrad;
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

function createCrateredAsteroidGeometry(radius = 1, detail = 2, seed = 0) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const len = v.length();
    const nx = v.x / len;
    const ny = v.y / len;
    const nz = v.z / len;

    // Multi-frequency spherical distortion
    const n1 = Math.sin(nx * 3.8 + seed) * Math.cos(ny * 3.8 + seed * 0.7) * Math.sin(nz * 3.8);
    const n2 = Math.sin(nx * 8.5 + seed * 1.3) * Math.cos(ny * 8.5) * 0.35;
    const n3 = Math.cos(nz * 14.2 + nx * 7.1) * 0.15;

    // Simulate crater pit indentations
    const craterDist = Math.hypot(nx - 0.5, ny - 0.4, nz - 0.3);
    const craterIndent = craterDist < 0.45 ? -Math.cos((craterDist / 0.45) * Math.PI * 0.5) * 0.28 : 0;

    const scale = 1.0 + (n1 * 0.22 + n2 * 0.12 + n3 * 0.08 + craterIndent);
    v.setLength(len * Math.max(0.65, scale));
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

let cachedSparkleSprite = null;
function getSparklingThrusterSprite() {
  if (cachedSparkleSprite) return cachedSparkleSprite;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
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

function createEnemyFighterMesh(variant = '5k_fighter') {
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

  // Faceted Wing Frame with Glowing Ring Structure (matching video)
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

function createBattleshipMesh() {
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
  const turrets = [];
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

function createWarpPortalMesh() {
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

// ============================================================================
// 5. PROGRESSION & SHIP STATS HELPERS
// ============================================================================
function computeEffectiveShipStats(shipSpec, shipState) {
  const levels = shipState?.upgradeLevels || { speed: 1, handling: 1, boost: 1, shield: 1 };
  return {
    topSpeed: Math.round(shipSpec.baseStats.topSpeed * (1 + (levels.speed - 1) * 0.12)),
    acceleration: Math.round(shipSpec.baseStats.acceleration * (1 + (levels.speed - 1) * 0.12)),
    handling: +(shipSpec.baseStats.handling * (1 + (levels.handling - 1) * 0.11)).toFixed(2),
    boostCapacity: Math.round(shipSpec.baseStats.boostCapacity * (1 + (levels.boost - 1) * 0.15)),
    shield: Math.round(shipSpec.baseStats.shield * (1 + (levels.shield - 1) * 0.18)),
  };
}

function getLevelFromXP(xp) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 120)) + 1);
}

function formatKeyCode(code) {
  if (!code) return '---';
  return code
    .replace('Key', '')
    .replace('ShiftLeft', 'L-SHIFT')
    .replace('ShiftRight', 'R-SHIFT')
    .replace('ControlLeft', 'L-CTRL')
    .replace('ControlRight', 'R-CTRL')
    .replace('Space', 'SPACE');
}

// ============================================================================
// 6. MAIN APPLICATION COMPONENT
// ============================================================================
const EXPEDITION_SECTORS = [
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
    briefing: 'Stable continental sector. Standard atmospheric envelope. Optimal for primary shuttle vector approach. Command networks reporting active beacon links.',
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
    briefing: 'Deep oceanic trench telemetry active. High-density ionized moisture layers detected. Recommended for low-altitude orbital reconnaissance sweeps.',
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
    briefing: 'High-energy orbital relay corridor. Dense satellite and station traffic across upper thermosphere. Deflector shields advised during transit.',
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
    briefing: 'Frontier abyssal anomaly zone. Strong geomagnetic flux readings near rival fleet staging coordinates. Weapons free authorized upon arrival.',
    spawnPos: [275, 16, -45]
  }
];

export default function SpaceExplorer3D() {
  // Persistent Save State
  const [saveData, setSaveData] = useState(DEFAULT_SAVE_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active Screen / Context: 'main_menu' | 'playing' | 'missions' | 'hangar' | 'profile' | 'settings'
  const [activeScreen, setActiveScreen] = useState('main_menu');
  const [isPaused, setIsPaused] = useState(false);
  const [cameraMode, setCameraMode] = useState('CHASE'); // 'CHASE' | 'COCKPIT' | 'CINEMATIC' | 'FREE_LOOK'
  const [showTutorial, setShowTutorial] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight > 540 : true
  );
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [remappingAction, setRemappingAction] = useState(null);

  // 4-Stage HUD Visibility Mode:
  // 'full'         -> All widgets + Header visible
  // 'no_stats'     -> Left telemetry/weapons box & Header hidden
  // 'no_stats_map' -> Left telemetry/weapons box, Header & Tactical Radar hidden
  // 'full_hide'    -> Full hide including Header (only Pause, ? & HUD/Fullscreen controls remain)
  const [hudMode, setHudMode] = useState<'full' | 'no_stats' | 'no_stats_map' | 'full_hide'>('full');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight && window.innerHeight <= 540 : false
  );

  // Detect Mobile Landscape orientation & Fullscreen state changes
  useEffect(() => {
    const checkViewport = () => {
      const mobileLand = window.innerWidth > window.innerHeight && window.innerHeight <= 540;
      setIsMobileLandscape(mobileLand);
    };
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    window.addEventListener('orientationchange', checkViewport);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    audioSystem.playUIClick();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore browser fullscreen permission errors
    }
  }, []);

  const cycleHudMode = useCallback(() => {
    audioSystem.playUIClick();
    setHudMode((prev) => {
      const order: Array<'full' | 'no_stats' | 'no_stats_map' | 'full_hide'> = [
        'full',
        'no_stats',
        'no_stats_map',
        'full_hide'
      ];
      return order[(order.indexOf(prev) + 1) % order.length];
    });
  }, []);

  // Pre-Launch Telemetry & Planetary Control State (matching Desain UI.jpg)
  const [selectedSectorId, setSelectedSectorId] = useState('alpha');
  const [auxDeflectorSync, setAuxDeflectorSync] = useState(true);
  const [auxDroneUplink, setAuxDroneUplink] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    'System Standby. Awaiting telemetry command.'
  ]);
  const planetarySectionRef = useRef<HTMLDivElement>(null);
  const selectedSector = useMemo(
    () => EXPEDITION_SECTORS.find((sec) => sec.id === selectedSectorId) || EXPEDITION_SECTORS[0],
    [selectedSectorId]
  );

  // Mission Runtime State
  const [activeMission, setActiveMission] = useState(null);
  const [missionResult, setMissionResult] = useState(null); // { status: 'completed'|'failed', mission, timeSpent }

  // Toast Notifications
  const [toast, setToast] = useState(null);
  const triggerToast = useCallback((title, subtitle, type = 'info') => {
    setToast({ id: Date.now(), title, subtitle, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  // Load saved progression on mount
  useEffect(() => {
    let mounted = true;
    persistence.load().then((loaded) => {
      if (!mounted) return;
      setSaveData(loaded);
      audioSystem.updateVolumes(loaded.settings);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
      audioSystem.dispose();
    };
  }, []);

  // Helper to update and persist saveData
  const updateSaveData = useCallback((updater) => {
    setSaveData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      next.pilotProfile.level = getLevelFromXP(next.pilotProfile.experience);
      persistence.save(next);
      audioSystem.updateVolumes(next.settings);
      return { ...next };
    });
  }, []);

  // High-frequency Refs for 60FPS WebGL Loop & Direct HUD DOM Updates
  const mountRef = useRef<HTMLDivElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const hudRefs = useRef({
    speedValue: null,
    speedBar: null,
    throttleValue: null,
    boostValue: null,
    boostBar: null,
    shieldValue: null,
    shieldBar: null,
    coordsValue: null,
    zoneBadge: null,
    scanPrompt: null,
    scanProgressBar: null,
    missionTimer: null,
    missionProgress: null,
    waypointOverlay: null,
    targetLockOverlay: null,
    targetLockName: null,
    targetLockDist: null,
    targetLockBar: null,
    compassDegrees: null,
    compassScroller: null,
    damageVignette: null,
    weaponSlot1: null,
    weaponSlot2: null,
    weaponSlot3: null
  });

  // Mutable Simulation State accessed inside requestAnimationFrame
  const simRef = useRef({
    isPlaying: false,
    isPaused: false,
    cameraMode: 'CHASE',
    activeScreen: 'main_menu',
    shipSpec: SHIPS_CATALOG[0],
    effectiveStats: computeEffectiveShipStats(SHIPS_CATALOG[0], DEFAULT_SAVE_DATA.ships.vanguard_vx1),
    settings: DEFAULT_SAVE_DATA.settings,
    discoveredIds: new Set(),

    // Flight Physics State
    position: new THREE.Vector3(0, 8, 45),
    quaternion: new THREE.Quaternion(),
    velocity: new THREE.Vector3(),
    speed: 35,
    throttle: 0.35,
    angularVel: new THREE.Vector3(0, 0, 0), // pitch, yaw, roll rates
    bankAngle: 0,
    boostEnergy: 100,
    isBoosting: false,
    boostCooldown: false,
    shieldCurrent: 120,
    shieldFlash: 0,
    cameraShake: 0,

    // Combat & Weapon Systems
    activeWeapon: 1, // 1: Rapid Autocannon, 2: Heavy Plasma Pulse, 3: Quantum Torpedo
    lastFireTime: 0,
    lastSecondaryFireTime: 0,
    autocannonAlt: false,
    damageVignetteTimer: 0,
    targetLockedEntity: null,

    // Camera Orbit / Free Look Angles
    freeLookYaw: 0,
    freeLookPitch: 0.15,
    isPointerDown: false,
    pointerX: 0,
    pointerY: 0,

    // Exploration & Scanning
    nearestObject: null,
    nearestDistance: Infinity,
    scanProgress: 0,
    isScanning: false,
    sessionDistance: 0,
    sessionTime: 0,

    // Active Mission Tracking
    mission: null,
    missionIndex: 0,
    missionScannedSet: new Set(),
    missionTimeRemaining: 0,

    // Keyboard & Mobile Touch Inputs
    keys: new Set(),
    mouseButtons: new Set(),
    touchInput: {
      pitch: 0,
      yaw: 0,
      roll: 0,
      boost: false,
      brake: false,
      scan: false,
      fire: false,
      secondary: false
    }
  });

  // Sync React state into mutable simulation ref
  const currentShipSpec = useMemo(
    () => SHIPS_CATALOG.find((s) => s.id === saveData.selectedShipId) || SHIPS_CATALOG[0],
    [saveData.selectedShipId]
  );
  const currentShipState = saveData.ships[currentShipSpec.id] || DEFAULT_SAVE_DATA.ships.vanguard_vx1;
  const effectiveStats = useMemo(
    () => computeEffectiveShipStats(currentShipSpec, currentShipState),
    [currentShipSpec, currentShipState]
  );

  useEffect(() => {
    const s = simRef.current;
    s.isPlaying = activeScreen === 'playing';
    s.isPaused = isPaused;
    s.cameraMode = cameraMode;
    s.activeScreen = activeScreen;
    s.shipSpec = currentShipSpec;
    s.effectiveStats = effectiveStats;
    s.settings = saveData.settings;
    s.discoveredIds = new Set(saveData.exploration.discoveredObjectIds);
    s.shieldCurrent = Math.min(s.shieldCurrent, effectiveStats.shield);
    if (s.RebuildShipMesh) {
      s.RebuildShipMesh(currentShipSpec);
    }
  }, [activeScreen, isPaused, cameraMode, currentShipSpec, effectiveStats, saveData.settings, saveData.exploration.discoveredObjectIds]);

  // Callbacks triggered from the 3D simulation loop into React state
  const handleObjectDiscovered = useCallback((worldObj) => {
    audioSystem.playDiscovery();
    triggerToast(
      `SECTOR DISCOVERED: ${worldObj.name.toUpperCase()}`,
      `+${worldObj.rewardCredits} CR  //  +${worldObj.rewardXP} XP Awarded`,
      'success'
    );
    updateSaveData((prev) => {
      if (prev.exploration.discoveredObjectIds.includes(worldObj.id)) return prev;
      return {
        ...prev,
        pilotProfile: {
          ...prev.pilotProfile,
          credits: prev.pilotProfile.credits + worldObj.rewardCredits,
          experience: prev.pilotProfile.experience + worldObj.rewardXP,
        },
        exploration: {
          ...prev.exploration,
          discoveredObjectIds: [...prev.exploration.discoveredObjectIds, worldObj.id],
        }
      };
    });
  }, [triggerToast, updateSaveData]);

  const handleFreeCoreCollected = useCallback(() => {
    audioSystem.playCheckpoint();
    triggerToast('QUANTUM MINERAL CORE HARVESTED', '+85 Credits // +45 XP', 'info');
    updateSaveData((prev) => ({
      ...prev,
      pilotProfile: {
        ...prev.pilotProfile,
        credits: prev.pilotProfile.credits + 85,
        experience: prev.pilotProfile.experience + 45
      },
      exploration: {
        ...prev.exploration,
        collectedFreeCores: (prev.exploration.collectedFreeCores || 0) + 1
      }
    }));
  }, [triggerToast, updateSaveData]);

  const handleMissionFinished = useCallback((status, missionSpec, timeSpent) => {
    const s = simRef.current;
    s.mission = null;
    setActiveMission(null);
    setMissionResult({ status, mission: missionSpec, timeSpent: Math.round(timeSpent) });

    if (status === 'completed') {
      audioSystem.playMissionComplete();
      updateSaveData((prev) => {
        const mPrev = prev.missions[missionSpec.id] || { attempts: 0, bestTime: null };
        const bestTime = mPrev.bestTime === null ? Math.round(timeSpent) : Math.min(mPrev.bestTime, Math.round(timeSpent));
        return {
          ...prev,
          pilotProfile: {
            ...prev.pilotProfile,
            credits: prev.pilotProfile.credits + missionSpec.rewardCredits,
            experience: prev.pilotProfile.experience + missionSpec.rewardXP
          },
          missions: {
            ...prev.missions,
            [missionSpec.id]: {
              status: 'completed',
              attempts: mPrev.attempts + 1,
              bestTime,
              rewardsClaimed: true
            }
          }
        };
      });
    } else {
      audioSystem.playCollision();
      updateSaveData((prev) => {
        const mPrev = prev.missions[missionSpec.id] || { attempts: 0, bestTime: null };
        return {
          ...prev,
          missions: {
            ...prev.missions,
            [missionSpec.id]: {
              ...mPrev,
              status: mPrev.status === 'completed' ? 'completed' : 'failed',
              attempts: mPrev.attempts + 1,
            }
          }
        };
      });
    }
  }, [updateSaveData]);

  // Start or Retry a Mission
  const startMission = useCallback((missionSpec) => {
    audioSystem.playUIClick();
    const s = simRef.current;
    if (missionSpec.type === 'boss_battle') {
      // Spawn facing the Rival Armada & The Emperor Battleship
      s.position.set(275, 16, -45);
    } else {
      s.position.set(0, 10, 35);
    }
    s.quaternion.identity();
    s.velocity.set(0, 0, 0);
    s.speed = 45;
    s.throttle = 0.45;
    s.angularVel.set(0, 0, 0);
    s.boostEnergy = s.effectiveStats.boostCapacity;
    s.shieldCurrent = s.effectiveStats.shield;

    s.mission = missionSpec;
    s.missionIndex = 0;
    s.missionScannedSet = new Set();
    s.missionTimeRemaining = missionSpec.timeLimit;
    if (s.RebuildMissionObjects) {
      s.RebuildMissionObjects(missionSpec);
    }

    setActiveMission(missionSpec);
    setMissionResult(null);
    setIsPaused(false);
    setActiveScreen('playing');
    triggerToast(`MISSION ACTIVE: ${missionSpec.title}`, missionSpec.briefing, 'info');
  }, [triggerToast]);

  // ============================================================================
  // 7. THREE.JS 3D ENGINE & SIMULATION LOOP
  // ============================================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Fog & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040711);
    scene.fog = new THREE.FogExp2(0x040711, 0.00048);

    const camera = new THREE.PerspectiveCamera(
      simRef.current.settings.fov || 68,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.5,
      3600
    );

    let renderer;
    let composer;
    let bloomPass;
    let pmremGenerator;
    let envRenderTarget;
    try {
      const canvas = document.createElement('canvas');
      const gl2Context = canvas.getContext('webgl2', {
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl2Context || undefined,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // PBR Environment Reflection Map for Golden Canopy & Metallic Hull
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRenderTarget.texture;

      // Post-Processing: EffectComposer + UnrealBloomPass + OutputPass
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        0.65, // strength
        0.45, // radius
        0.8   // threshold
      );
      composer.addPass(bloomPass);

      const outputPass = new OutputPass();
      composer.addPass(outputPass);
    } catch {
      container.innerHTML = '<div style="color:#F4F7FF;padding:40px;text-align:center;">WebGL is not supported or enabled on this device.</div>';
      return;
    }

    // Lighting: High-Contrast Cinematic Sci-Fi Rig (Cool Cyan Fill + Warm Solar Key + Rim)
    const ambientLight = new THREE.AmbientLight(0x1e2f4d, 0.95);
    scene.add(ambientLight);

    // 360° Procedural Emerald-Teal Galaxy Skybox Dome (matching reference video)
    const galaxySkyGeo = new THREE.SphereGeometry(3200, 48, 32);
    const galaxySkyMat = new THREE.MeshBasicMaterial({
      map: getGalaxySkyboxTexture(),
      side: THREE.BackSide,
      depthWrite: false
    });
    const galaxySkyMesh = new THREE.Mesh(galaxySkyGeo, galaxySkyMat);
    scene.add(galaxySkyMesh);

    const sunLight = new THREE.DirectionalLight(0xfff0d4, 2.6);
    sunLight.position.set(850, 480, 420);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 2200;
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00d2ff, 1.15);
    cyanRimLight.position.set(-620, -240, -520);
    scene.add(cyanRimLight);

    // Distant Visual Sun Sphere ("Helios Star") with Fresnel Corona
    const sunGeo = new THREE.SphereGeometry(58, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe4ad });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.copy(sunLight.position);
    scene.add(sunMesh);

    const sunCoronaGeo = new THREE.SphereGeometry(86, 32, 32);
    const sunCoronaMat = createFresnelAtmosphereMaterial(0xff8800, 1.8);
    const sunCorona = new THREE.Mesh(sunCoronaGeo, sunCoronaMat);
    sunMesh.add(sunCorona);

    // ========================================================================
    // ORBITAL LAUNCH DOCKING BAY AT SPAWN (INSPIRED BY TUMBNAIL.JPG HANGAR)
    // ========================================================================
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

    // Industrial Side Gantry Pillars & Neon Cyan Guidance Frames (matching tumbnail.jpg)
    [-1, 1].forEach((side) => {
      // Side Deck Railings & Red/Orange Thermal Pipes
      const railGeo = new THREE.BoxGeometry(1.4, 1.2, 28);
      const rail = new THREE.Mesh(railGeo, bayMetalMat);
      rail.position.set(side * 10.6, -0.4, 0);
      launchBayGroup.add(rail);

      const orangeStripGeo = new THREE.BoxGeometry(0.22, 0.25, 26);
      const orangeStrip = new THREE.Mesh(orangeStripGeo, neonOrangeBayMat);
      orangeStrip.position.set(side * 9.8, -0.1, 0);
      launchBayGroup.add(orangeStrip);

      // 3 Vertical Industrial Gantry Towers with Neon Cyan Rectangular Portals
      [-10, 0, 10].forEach((zOff) => {
        const pillarGeo = new THREE.BoxGeometry(1.5, 14, 1.5);
        const pillar = new THREE.Mesh(pillarGeo, bayMetalMat);
        pillar.position.set(side * 12.2, 5.8, zOff);
        launchBayGroup.add(pillar);

        // Glowing Neon Cyan L-Frame Portal Bars (signature background in tumbnail.jpg)
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

    // Warm Orange & Cool Cyan Dock Point Lights
    const dockCyanLight = new THREE.PointLight(0x00e5ff, 3.2, 38);
    dockCyanLight.position.set(-8, 8, 45);
    scene.add(dockCyanLight);

    const dockOrangeLight = new THREE.PointLight(0xff5500, 2.8, 34);
    dockOrangeLight.position.set(8, 3, 48);
    scene.add(dockOrangeLight);

    // ========================================================================
    // MULTI-LAYER HIGH-RESOLUTION STARFIELD & VOLUMETRIC NEBULA
    // ========================================================================
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

    // Layer 2: Bright Prime Stars with Diffraction Glow Spikes (950 bright stars)
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

    // Volumetric Nebula Clouds (Cyan, Deep Indigo/Purple & Solar Amber)
    const nebulaSprite = getNebulaCloudTexture();
    const nebulaCount = 260;
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaPos = new Float32Array(nebulaCount * 3);
    const nebulaCol = new Float32Array(nebulaCount * 3);
    const nebulaPalette = [
      new THREE.Color(0x00d2ff), // Neon Cyan
      new THREE.Color(0x4338ca), // Deep Indigo
      new THREE.Color(0x7c3aed), // Cosmic Purple
      new THREE.Color(0xff6200)  // Warm Amber Accent
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

    // Dynamic Velocity-Reactive Space Dust & Micro-Particles around Ship
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

    // Build World Celestial Entities (2K Textures + Synthetic Normal/Bump + Fresnel Shader)
    const cloudLayerTex = createProceduralCloudTexture();
    const worldMeshes = [];
    WORLD_OBJECTS.forEach((obj) => {
      const group = new THREE.Group();
      group.position.set(...obj.position);

      if (obj.category === 'station') {
        // Krios Rotating Orbital Ring Station
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
      } else if (obj.category === 'anomaly') {
        // Chronos Anomaly Relay Gyroscope
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
      } else {
        // Planet or Moon with 2048x1024 Procedural Texture, BumpMap & Fresnel Atmosphere Shader
        const tex = createProceduralPlanetTexture(obj.color, obj.atmosphereColor, obj.hasRings);
        const sphereGeo = new THREE.SphereGeometry(obj.radius, 64, 48);
        const sphereMat = new THREE.MeshStandardMaterial({
          map: tex,
          bumpMap: tex.userData?.bumpMap || null,
          bumpScale: 1.45,
          emissive: obj.emissiveColor,
          emissiveIntensity: 0.25,
          roughness: 0.65,
          metalness: 0.14
        });
        const planetMesh = new THREE.Mesh(sphereGeo, sphereMat);
        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;
        group.add(planetMesh);

        // Optional Cloud Layer
        if (obj.hasClouds) {
          const cloudGeo = new THREE.SphereGeometry(obj.radius * 1.018, 48, 36);
          const cloudMat = new THREE.MeshStandardMaterial({
            map: cloudLayerTex,
            transparent: true,
            opacity: 0.42,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });
          const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
          cloudMesh.userData.isCloudLayer = true;
          group.add(cloudMesh);
        }

        // Fresnel Atmospheric Rim Glow Shader Shell
        const atmoGeo = new THREE.SphereGeometry(obj.radius * 1.075, 48, 36);
        const atmoMat = createFresnelAtmosphereMaterial(obj.atmosphereColor, 1.38);
        group.add(new THREE.Mesh(atmoGeo, atmoMat));

        // Planetary Rings
        if (obj.hasRings) {
          const ringGeo = new THREE.RingGeometry(obj.radius * 1.32, obj.radius * 2.1, 96);
          const ringMat = new THREE.MeshStandardMaterial({
            color: obj.ringColor || 0x8da4f7,
            emissive: obj.ringColor || 0x8da4f7,
            emissiveIntensity: 0.18,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.72,
            roughness: 0.35
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2.3;
          ringMesh.rotation.y = 0.25;
          group.add(ringMesh);
        }
      }

      scene.add(group);
      worldMeshes.push({ data: obj, group });
    });

    // ========================================================================
    // DESTRUCTIBLE CRATERED ASTEROID BELT (HIGH-DETAIL ORGANIC PBR MESHES)
    // ========================================================================
    const asteroidGroup = new THREE.Group();
    scene.add(asteroidGroup);
    const interactiveAsteroids = [];
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

    const asteroidCount = 85;
    for (let i = 0; i < asteroidCount; i++) {
      const inBelt = i < asteroidCount * 0.72;
      const cx = inBelt ? 280 + (Math.random() - 0.5) * 360 : (Math.random() - 0.5) * 1200;
      const cy = inBelt ? -10 + (Math.random() - 0.5) * 160 : (Math.random() - 0.5) * 320;
      const cz = inBelt ? -200 + (Math.random() - 0.5) * 380 : -90 - Math.random() * 1100;
      const scale = 3.6 + Math.random() * 9.2;
      const isRed = (i % 3 === 0);

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
        rotSpeed: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.3),
        alive: true,
        name: isRed ? 'IRON ASTEROID' : 'CRATERED ASTEROID'
      });
    }

    // ========================================================================
    // HOSTILE FLEET: FIGHTERS, THE EMPEROR BATTLESHIP & WARP PORTAL
    // ========================================================================
    const combatGroup = new THREE.Group();
    scene.add(combatGroup);

    // Hostile Fighter Squadrons (5K FIGHTER & HB GUARD)
    const enemyFighters = [];
    const fighterSpawns = [
      { pos: [240, 20, -180], variant: '5k_fighter' },
      { pos: [320, -15, -240], variant: 'hb_guard' },
      { pos: [260, 35, -280], variant: '5k_fighter' },
      { pos: [330, 10, -160], variant: 'hb_guard' }
    ];
    fighterSpawns.forEach((cfg) => {
      const fMesh = createEnemyFighterMesh(cfg.variant);
      fMesh.position.set(...cfg.pos);
      combatGroup.add(fMesh);
      enemyFighters.push(fMesh);
    });

    // The Emperor Capital Battleship
    const battleshipMesh = createBattleshipMesh();
    battleshipMesh.position.set(280, 10, -220);
    combatGroup.add(battleshipMesh);

    // Blue Warp Extraction Portal (activates upon defeating the battleship)
    const warpPortalMesh = createWarpPortalMesh();
    warpPortalMesh.position.set(280, 10, -340);
    warpPortalMesh.visible = false;
    combatGroup.add(warpPortalMesh);

    // Free-Flight Collectible Quantum Mineral Cores (15 scattered crystals)
    const freeCoresGroup = new THREE.Group();
    scene.add(freeCoresGroup);
    const freeCores = [];
    const coreGeo = new THREE.OctahedronGeometry(2.8, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x48e0a4,
      wireframe: false
    });
    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(coreGeo, coreMat);
      mesh.position.set(
        (Math.random() - 0.5) * 520,
        (Math.random() - 0.5) * 110,
        -90 - Math.random() * 680
      );
      freeCoresGroup.add(mesh);
      freeCores.push({ mesh, collected: false });
    }

    // Player Spaceship Container
    const shipAnchor = new THREE.Group();
    scene.add(shipAnchor);
    let currentShipMesh = buildSpaceshipMesh(simRef.current.shipSpec);
    shipAnchor.add(currentShipMesh);

    simRef.current.RebuildShipMesh = (newSpec) => {
      if (currentShipMesh) {
        shipAnchor.remove(currentShipMesh);
      }
      currentShipMesh = buildSpaceshipMesh(newSpec);
      shipAnchor.add(currentShipMesh);
    };

    // ========================================================================
    // TWIN SPARKLING EMERALD-CYAN THRUSTER PARTICLE TRAILS (MATCHING VIDEO)
    // ========================================================================
    const sparkleSprite = getSparklingThrusterSprite();
    const trailPerNacelle = 55;
    const makeThrusterStream = () => {
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
      return { geo, mat, points, hist };
    };

    const leftThruster = makeThrusterStream();
    const rightThruster = makeThrusterStream();

    // Projectiles & VFX Groups
    const projectilesGroup = new THREE.Group();
    scene.add(projectilesGroup);
    const playerProjectiles = [];
    const enemyProjectiles = [];

    const fxGroup = new THREE.Group();
    scene.add(fxGroup);
    const vfxEntities = [];

    // Explosion & Shockwave VFX Helper
    const spawnExplosion = (pos, isHeavy = false) => {
      audioSystem.playExplosion(isHeavy);
      simRef.current.cameraShake = Math.min(1.2, simRef.current.cameraShake + (isHeavy ? 0.75 : 0.38));

      // 1. Expanding Translucent Spherical Shockwave (matching video at 00:04 & 00:33)
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
    };

    // Helper to spawn Muzzle Flash at wing cannon barrel
    const spawnMuzzleFlash = (worldPos, colorHex, scale = 1.0) => {
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
    };

    // Weapon Firing Function (Supports Slot 1 Autocannon, Slot 2 Dual Plasma Pulse, Slot 3 Quantum Torpedo)
    const fireWeapon = (isSecondary = false) => {
      const s = simRef.current;
      audioSystem.resume();
      const nowSec = performance.now() / 1000;
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(s.quaternion).normalize();
      const bankQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), s.bankAngle || 0);
      const shipVisualQuat = s.quaternion.clone().multiply(bankQuat);

      // Aim convergence point (locks onto target if available, else 160m ahead on crosshair)
      const aimPoint = s.targetLockedEntity?.pos
        ? s.targetLockedEntity.pos.clone()
        : s.position.clone().addScaledVector(fwd, 160);

      if (isSecondary || s.activeWeapon === 3) {
        // Quantum Energy Torpedo / Heavy Plasma Orb
        if (nowSec - s.lastSecondaryFireTime < 0.72) return;
        s.lastSecondaryFireTime = nowSec;
        audioSystem.playTorpedoLaunch();

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

        const muzzleOffset = new THREE.Vector3(0, -0.42, -3.2).applyQuaternion(shipVisualQuat);
        const spawnPos = s.position.clone().add(muzzleOffset);
        torpGroup.position.copy(spawnPos);
        torpGroup.quaternion.copy(shipVisualQuat);
        projectilesGroup.add(torpGroup);

        spawnMuzzleFlash(spawnPos, 0xc084fc, 1.8);

        const shotDir = aimPoint.clone().sub(spawnPos).normalize();
        const projSpeed = Math.max(180, s.speed + 155);
        playerProjectiles.push({
          mesh: torpGroup,
          vel: shotDir.multiplyScalar(projSpeed),
          life: 2.8,
          damage: 135,
          isHeavy: true,
          radius: 2.2
        });
      } else if (s.activeWeapon === 2) {
        // Heavy Plasma Pulse (Dual High-Energy Cyan-Emerald Plasma Orbs & Wake)
        if (nowSec - s.lastFireTime < 0.20) return;
        s.lastFireTime = nowSec;
        audioSystem.playPlasmaShot();

        [-2.18, 2.18].forEach((sideX) => {
          const plasmaGroup = new THREE.Group();

          // White-hot plasma core sphere (visible from all angles including direct rear chase cam)
          const coreGeo = new THREE.SphereGeometry(0.38, 12, 12);
          const coreMat = new THREE.MeshBasicMaterial({ color: 0xe0ffff });
          plasmaGroup.add(new THREE.Mesh(coreGeo, coreMat));

          // Bright cyan-emerald outer plasma aura sphere
          const auraGeo = new THREE.SphereGeometry(0.88, 12, 12);
          const auraMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.78,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });
          plasmaGroup.add(new THREE.Mesh(auraGeo, auraMat));

          // Elongated emerald-cyan plasma wake tail
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

          const muzzleOffset = new THREE.Vector3(sideX, -0.46, -2.35).applyQuaternion(shipVisualQuat);
          const spawnPos = s.position.clone().add(muzzleOffset);
          plasmaGroup.position.copy(spawnPos);

          const shotDir = aimPoint.clone().sub(spawnPos).normalize();
          plasmaGroup.lookAt(spawnPos.clone().add(shotDir));
          projectilesGroup.add(plasmaGroup);

          spawnMuzzleFlash(spawnPos, 0x00f0ff, 1.25);

          const projSpeed = Math.max(210, s.speed + 195);
          playerProjectiles.push({
            mesh: plasmaGroup,
            vel: shotDir.multiplyScalar(projSpeed),
            life: 2.2,
            damage: 42,
            isHeavy: false,
            radius: 1.35
          });
        });
      } else {
        // Rapid Autocannon (Dual/Alternating Glowing Plasma-Laser Tracer Bolts)
        if (nowSec - s.lastFireTime < 0.10) return;
        s.lastFireTime = nowSec;
        s.autocannonAlt = !s.autocannonAlt;
        audioSystem.playLaserShot(s.autocannonAlt);

        const boltGroup = new THREE.Group();

        // Bright core sphere so bolt is clearly visible from behind
        const headGeo = new THREE.SphereGeometry(0.30, 10, 10);
        const headMat = new THREE.MeshBasicMaterial({ color: 0xfff3d1 });
        boltGroup.add(new THREE.Mesh(headGeo, headMat));

        // Glowing red-orange plasma halo sphere
        const haloGeo = new THREE.SphereGeometry(0.66, 10, 10);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xff4500,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        boltGroup.add(new THREE.Mesh(haloGeo, haloMat));

        // High-velocity laser tracer shaft
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

        const sideX = s.autocannonAlt ? -2.18 : 2.18;
        const muzzleOffset = new THREE.Vector3(sideX, -0.46, -2.35).applyQuaternion(shipVisualQuat);
        const spawnPos = s.position.clone().add(muzzleOffset);
        boltGroup.position.copy(spawnPos);

        const shotDir = aimPoint.clone().sub(spawnPos).normalize();
        boltGroup.lookAt(spawnPos.clone().add(shotDir));
        projectilesGroup.add(boltGroup);

        spawnMuzzleFlash(spawnPos, 0xff5500, 0.95);

        const projSpeed = Math.max(240, s.speed + 230);
        playerProjectiles.push({
          mesh: boltGroup,
          vel: shotDir.multiplyScalar(projSpeed),
          life: 1.9,
          damage: 26,
          isHeavy: false,
          radius: 1.1
        });
      }
    };
    simRef.current.fireWeapon = fireWeapon;

    // Mission Objects Group (Checkpoints or Harvest Cores)
    const missionGroup = new THREE.Group();
    scene.add(missionGroup);
    let missionMeshes = [];

    simRef.current.RebuildMissionObjects = (missionSpec) => {
      while (missionGroup.children.length > 0) {
        missionGroup.remove(missionGroup.children[0]);
      }
      missionMeshes = [];

      // Clear any active enemy projectiles when switching missions / modes
      while (enemyProjectiles.length > 0) {
        const ep = enemyProjectiles.pop();
        if (ep?.mesh) projectilesGroup.remove(ep.mesh);
      }

      if (!missionSpec) return;

      if (missionSpec.type === 'boss_battle') {
        // Reset Rival Armada & The Emperor Battleship for Combat Mission
        enemyFighters.forEach((f, idx) => {
          const cfg = fighterSpawns[idx];
          if (cfg) f.position.set(...cfg.pos);
          f.userData.health = f.userData.maxHealth;
          f.userData.active = true;
          f.userData.shootCooldown = 1.0 + idx * 0.35;
          f.visible = true;
        });
        const bData = battleshipMesh.userData;
        bData.alive = true;
        battleshipMesh.visible = true;
        if (bData.shieldMesh) bData.shieldMesh.visible = true;
        bData.turrets.forEach((t, idx) => {
          t.userData.health = t.userData.maxHealth;
          t.userData.active = true;
          t.userData.cooldown = 1.0 + idx * 0.4;
          t.visible = true;
        });
        if (bData.deckhouse) {
          bData.deckhouse.userData.health = bData.deckhouse.userData.maxHealth;
          bData.deckhouse.userData.active = true;
          bData.deckhouse.visible = true;
        }
        warpPortalMesh.visible = false;
      } else if (missionSpec.type === 'checkpoints') {
        missionSpec.checkpoints.forEach((cp, idx) => {
          const ringGeo = new THREE.TorusGeometry(13, 0.85, 16, 48);
          const ringMat = new THREE.MeshBasicMaterial({
            color: idx === 0 ? 0x48e0a4 : 0x49d9ff,
            transparent: true,
            opacity: idx === 0 ? 0.95 : 0.38
          });
          const mesh = new THREE.Mesh(ringGeo, ringMat);
          mesh.position.set(...cp);
          missionGroup.add(mesh);
          missionMeshes.push(mesh);
        });
      } else if (missionSpec.type === 'collect_cores') {
        missionSpec.corePositions.forEach((pos) => {
          const cGeo = new THREE.OctahedronGeometry(4.5, 1);
          const cMat = new THREE.MeshBasicMaterial({ color: 0xffb454, wireframe: true });
          const mesh = new THREE.Mesh(cGeo, cMat);
          mesh.position.set(...pos);
          missionGroup.add(mesh);
          missionMeshes.push(mesh);
        });
      }
    };

    // Input Event Listeners
    const onKeyDown = (e) => {
      if (remappingAction) return;
      simRef.current.keys.add(e.code);
      const b = simRef.current.settings.bindings;
      const s = simRef.current;

      if (e.code === 'Digit1') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        s.activeWeapon = 1;
        audioSystem.playUIClick();
        if (s.isPlaying && !s.isPaused) fireWeapon(false);
      } else if (e.code === 'Digit2') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        s.activeWeapon = 2;
        audioSystem.playUIClick();
        if (s.isPlaying && !s.isPaused) fireWeapon(false);
      } else if (e.code === 'Digit3') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        s.activeWeapon = 3;
        audioSystem.playUIClick();
        if (s.isPlaying && !s.isPaused) fireWeapon(true);
      } else if (e.code === b.primaryFire || e.code === 'Space') {
        if (s.isPlaying) {
          e.preventDefault();
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          if (!s.isPaused) fireWeapon(false);
        }
      } else if (e.code === b.secondaryFire || e.code === 'KeyG') {
        if (s.isPlaying) {
          e.preventDefault();
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          if (!s.isPaused) fireWeapon(true);
        }
      } else if (e.code === 'Escape' && s.isPlaying) {
        setIsPaused((p) => !p);
      } else if (e.code === b.camera && s.isPlaying && !s.isPaused) {
        setCameraMode((prev) => {
          const order = ['CHASE', 'COCKPIT', 'CINEMATIC', 'FREE_LOOK'];
          return order[(order.indexOf(prev) + 1) % order.length];
        });
      } else if ((e.code === 'Tab' || e.code === 'KeyH') && s.isPlaying) {
        e.preventDefault();
        setHudMode((prev) => {
          const order: Array<'full' | 'no_stats' | 'no_stats_map' | 'full_hide'> = [
            'full',
            'no_stats',
            'no_stats_map',
            'full_hide'
          ];
          return order[(order.indexOf(prev) + 1) % order.length];
        });
      }
    };

    const onKeyUp = (e) => {
      simRef.current.keys.delete(e.code);
    };

    const onPointerDown = (e) => {
      audioSystem.resume();
      // Ignore clicks on UI buttons, inputs, or navigation controls
      if (e.target instanceof Element && e.target.closest('button, input, select, a, nav, header')) {
        return;
      }
      simRef.current.isPointerDown = true;
      simRef.current.mouseButtons.add(e.button);
      const rect = renderer.domElement.getBoundingClientRect();
      simRef.current.pointerX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      simRef.current.pointerY = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;

      if (simRef.current.isPlaying && !simRef.current.isPaused) {
        if (e.button === 0) fireWeapon(false);
        else if (e.button === 2) fireWeapon(true);
      }
    };

    const onContextMenu = (e) => {
      if (simRef.current.isPlaying) {
        e.preventDefault();
      }
    };

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;

      if (simRef.current.cameraMode === 'FREE_LOOK' && simRef.current.isPointerDown) {
        const dx = nx - simRef.current.pointerX;
        const dy = ny - simRef.current.pointerY;
        simRef.current.freeLookYaw -= dx * 2.5 * simRef.current.settings.cameraSensitivity;
        simRef.current.freeLookPitch = THREE.MathUtils.clamp(
          simRef.current.freeLookPitch + dy * 1.8 * simRef.current.settings.cameraSensitivity,
          -1.1,
          1.1
        );
      }
      simRef.current.pointerX = nx;
      simRef.current.pointerY = ny;
    };

    const onPointerUp = (e) => {
      simRef.current.mouseButtons.delete(e.button);
      if (simRef.current.mouseButtons.size === 0) {
        simRef.current.isPointerDown = false;
      }
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      if (composer) {
        composer.setSize(w, h);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);

    // Main Simulation & Render Loop
    let lastTime = performance.now();
    let animFrameId;
    const forwardVec = new THREE.Vector3();
    const upVec = new THREE.Vector3();
    const camOffset = new THREE.Vector3();
    const targetCamPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const projVec = new THREE.Vector3();

    const renderScene = () => {
      if (composer && simRef.current.settings.bloomEnabled && simRef.current.settings.graphicsQuality !== 'Low') {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    const animate = (now) => {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const s = simRef.current;
      const b = s.settings.bindings;

      // Apply Dynamic Settings to Renderer/Scene
      const targetFov = s.isBoosting ? (s.settings.fov || 68) + 14 : (s.settings.fov || 68);
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, dt * 6);
      camera.updateProjectionMatrix();
      leftThruster.points.visible = s.settings.particleDensity !== 'Low';
      rightThruster.points.visible = s.settings.particleDensity !== 'Low';
      spaceDust.visible = s.settings.particleDensity !== 'Low';
      nebulaClouds.visible = s.settings.graphicsQuality !== 'Low';
      if (bloomPass) {
        bloomPass.enabled = Boolean(s.settings.bloomEnabled && s.settings.graphicsQuality !== 'Low');
      }

      // Rotate Celestial Objects & Cloud Layers
      worldMeshes.forEach((wm) => {
        wm.group.rotation.y += wm.data.rotationSpeed * dt;
        wm.group.children.forEach((child) => {
          if (child.userData?.isCloudLayer) {
            child.rotation.y += wm.data.rotationSpeed * 0.45 * dt;
          }
        });
      });
      freeCores.forEach((fc) => {
        if (!fc.collected) {
          fc.mesh.rotation.y += 1.6 * dt;
          fc.mesh.rotation.x += 0.9 * dt;
        }
      });

      // Update Velocity-Reactive Space Dust Micro-Particles around Ship
      if (spaceDust.visible) {
        const dAttr = dustGeo.attributes.position;
        const speedFactor = s.isPlaying ? (0.2 + (s.speed / Math.max(1, s.effectiveStats.topSpeed))) : 0.08;
        dustMat.size = s.isBoosting ? 2.4 : 1.55;
        for (let i = 0; i < dustCount; i++) {
          let px = dAttr.getX(i);
          let py = dAttr.getY(i);
          let pz = dAttr.getZ(i);

          if (!s.isPlaying) {
            py += Math.sin(now * 0.001 + i) * 0.015;
            pz += 1.8 * dt;
          }

          // Wrap particles inside cubic volume centered on ship position
          const dx = px - s.position.x;
          const dy = py - s.position.y;
          const dz = pz - s.position.z;
          if (dx > dustBoxRange) px -= dustBoxRange * 2;
          else if (dx < -dustBoxRange) px += dustBoxRange * 2;
          if (dy > dustBoxRange) py -= dustBoxRange * 2;
          else if (dy < -dustBoxRange) py += dustBoxRange * 2;
          if (dz > dustBoxRange) pz -= dustBoxRange * 2;
          else if (dz < -dustBoxRange) pz += dustBoxRange * 2;

          dAttr.setXYZ(i, px, py, pz);
        }
        dAttr.needsUpdate = true;
        dustMat.opacity = Math.min(0.92, 0.45 + speedFactor * 0.35);
      }

      // IF IN MENU / HANGAR / PROFILE: Cinematic Showcase around Ship
      if (!s.isPlaying) {
        audioSystem.updateEngine(0, false, false);
        const showHangarBay = s.activeScreen === 'hangar';
        launchBayGroup.visible = showHangarBay;
        dockCyanLight.visible = showHangarBay;
        dockOrangeLight.visible = showHangarBay;
        leftThruster.points.visible = false;
        rightThruster.points.visible = false;

        if (s.activeScreen === 'main_menu') {
          // Hero 3/4 Deep-Space Framing (matching Desain UI.jpg)
          const hoverY = Math.sin(now * 0.0016) * 0.22;
          shipAnchor.position.set(s.position.x + 1.15, s.position.y + hoverY, s.position.z);
          shipAnchor.rotation.set(
            0.14 + Math.sin(now * 0.0009) * 0.03,
            2.38 + Math.sin(now * 0.0005) * 0.06,
            -0.24
          );
          camera.position.set(s.position.x - 0.6, s.position.y + 1.15, s.position.z + 7.2);
          camera.lookAt(s.position.x - 0.15, s.position.y + 0.15, s.position.z);
        } else {
          shipAnchor.position.copy(s.position);
          shipAnchor.quaternion.copy(s.quaternion);
          const orbitAngle = now * 0.00045;
          const radius = s.activeScreen === 'hangar' ? 8.8 : 11.5;
          camera.position.set(
            s.position.x + Math.sin(orbitAngle) * radius,
            s.position.y + 2.6,
            s.position.z + Math.cos(orbitAngle) * radius
          );
          camera.lookAt(s.position.x, s.position.y + 0.4, s.position.z);
        }

        // Gently pulse thrusters in showcase
        if (currentShipMesh?.userData?.thrusterFlames) {
          currentShipMesh.userData.thrusterFlames.forEach((fl) => {
            fl.scale.set(1, 0.85 + Math.sin(now * 0.015) * 0.18, 1);
          });
        }
        renderScene();
        return;
      }

      launchBayGroup.visible = true;
      dockCyanLight.visible = true;
      dockOrangeLight.visible = true;

      // IF PAUSED IN GAMEPLAY: Just render static frame
      if (s.isPaused) {
        audioSystem.updateEngine(0, false, false);
        renderScene();
        return;
      }

      // ======================================================================
      // ACTIVE FLIGHT CONTROLLER (6-DOF QUATERNION + DELTA-TIME DAMPING)
      // ======================================================================
      const invertSign = s.settings.invertY ? -1 : 1;
      let pitchInput = ((s.keys.has(b.pitchUp) || s.keys.has('ArrowDown') ? 1 : 0) -
        (s.keys.has(b.pitchDown) || s.keys.has('ArrowUp') ? 1 : 0)) * invertSign +
        s.touchInput.pitch * invertSign;

      let yawInput = (s.keys.has(b.yawLeft) || s.keys.has('ArrowLeft') ? 1 : 0) -
        (s.keys.has(b.yawRight) || s.keys.has('ArrowRight') ? 1 : 0) -
        s.touchInput.yaw;

      let rollInput = (s.keys.has(b.rollLeft) ? 1 : 0) -
        (s.keys.has(b.rollRight) ? 1 : 0) +
        s.touchInput.roll;

      // Optional Mouse Steering
      if (s.settings.mouseSteering && Math.hypot(s.pointerX, s.pointerY) > 0.08) {
        yawInput -= s.pointerX * 1.15 * s.settings.mouseSensitivity;
        pitchInput -= s.pointerY * 1.15 * s.settings.mouseSensitivity * invertSign;
      }

      const handling = s.effectiveStats.handling;
      s.angularVel.x = THREE.MathUtils.lerp(s.angularVel.x, pitchInput * handling * 1.1, dt * 6.5);
      s.angularVel.y = THREE.MathUtils.lerp(s.angularVel.y, yawInput * handling * 1.15, dt * 6.5);
      s.angularVel.z = THREE.MathUtils.lerp(s.angularVel.z, rollInput * handling * 1.75, dt * 6.5);

      const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), s.angularVel.x * dt);
      const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), s.angularVel.y * dt);
      const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), s.angularVel.z * dt);
      s.quaternion.multiply(qYaw).multiply(qPitch).multiply(qRoll).normalize();

      // Throttle, Boost & Braking
      const wantsBoost = (s.keys.has(b.boost) || s.touchInput.boost) && !s.boostCooldown && s.boostEnergy > 5;
      const wantsBrake = s.keys.has(b.brake) || s.touchInput.brake;

      if (wantsBoost) {
        if (!s.isBoosting) audioSystem.playBoost();
        s.isBoosting = true;
        s.boostEnergy = Math.max(0, s.boostEnergy - 28 * dt);
        if (s.boostEnergy <= 1) s.boostCooldown = true;
      } else {
        s.isBoosting = false;
        s.boostEnergy = Math.min(s.effectiveStats.boostCapacity, s.boostEnergy + 16 * dt);
        if (s.boostEnergy > s.effectiveStats.boostCapacity * 0.25) s.boostCooldown = false;
      }

      if (wantsBrake) {
        s.throttle = Math.max(0.05, s.throttle - 0.65 * dt);
      } else if (wantsBoost) {
        s.throttle = Math.min(1.0, s.throttle + 0.9 * dt);
      } else {
        // Maintain minimum cruise or adjust with R/F
        if (s.keys.has('KeyR')) s.throttle = Math.min(1.0, s.throttle + 0.5 * dt);
        if (s.keys.has('KeyV')) s.throttle = Math.max(0.0, s.throttle - 0.5 * dt);
        if (s.throttle < 0.25 && !wantsBrake) s.throttle = THREE.MathUtils.lerp(s.throttle, 0.42, dt * 0.8);
      }

      const maxSpd = s.effectiveStats.topSpeed * (s.isBoosting ? 1.72 : 1.0);
      const targetSpeed = wantsBrake ? 8 : s.throttle * maxSpd;
      s.speed = THREE.MathUtils.lerp(s.speed, targetSpeed, dt * (s.isBoosting ? 4.5 : 2.6));

      forwardVec.set(0, 0, -1).applyQuaternion(s.quaternion);
      s.velocity.copy(forwardVec).multiplyScalar(s.speed);
      const stepDist = s.speed * dt;
      s.position.addScaledVector(forwardVec, stepDist);
      s.sessionDistance += stepDist;
      s.sessionTime += dt;

      // Update Ship Transform & Visual Banking
      shipAnchor.position.copy(s.position);
      shipAnchor.quaternion.copy(s.quaternion);
      s.bankAngle = THREE.MathUtils.lerp(s.bankAngle, -s.angularVel.y * 0.38, dt * 7);

      if (currentShipMesh?.userData) {
        const { hullGroup, thrusterFlames, shieldMat } = currentShipMesh.userData;
        hullGroup.rotation.z = s.bankAngle;
        const flameScale = 0.45 + (s.speed / s.effectiveStats.topSpeed) * 1.15 + (s.isBoosting ? 0.9 : 0);
        thrusterFlames.forEach((fl) => {
          fl.scale.set(1, flameScale + Math.sin(now * 0.04) * 0.12, 1);
        });
        if (s.shieldFlash > 0) {
          s.shieldFlash = Math.max(0, s.shieldFlash - dt * 2.5);
          shieldMat.opacity = s.shieldFlash * 0.65;
        } else {
          shieldMat.opacity = 0;
        }
      }

      // Regenerate shield slowly out of combat/collision
      s.shieldCurrent = Math.min(s.effectiveStats.shield, s.shieldCurrent + 2.5 * dt);

      // ======================================================================
      // TWIN SPARKLING EMERALD-CYAN THRUSTER PARTICLE EMITTERS (MATCHING VIDEO)
      // ======================================================================
      const updateThrusterStream = (stream, offsetLocal) => {
        stream.hist.pop();
        const nozzleWorld = offsetLocal.clone().applyQuaternion(s.quaternion).add(s.position);
        stream.hist.unshift(nozzleWorld);
        const pAttr = stream.geo.attributes.position;
        for (let i = 0; i < trailPerNacelle; i++) {
          const pt = stream.hist[i];
          pAttr.setXYZ(i, pt.x, pt.y, pt.z);
        }
        pAttr.needsUpdate = true;
        stream.mat.size = s.isBoosting ? 4.8 : 3.2;
        stream.points.visible = s.settings.particleDensity !== 'Low';
      };

      updateThrusterStream(leftThruster, new THREE.Vector3(-0.76, 0.36, 3.2));
      updateThrusterStream(rightThruster, new THREE.Vector3(0.76, 0.36, 3.2));

      // Update Audio Engine
      audioSystem.updateEngine(s.speed / s.effectiveStats.topSpeed, s.isBoosting, true);

      // Continuous Weapon Firing while holding Space / LMB / G / RMB / Touch Fire
      const wantsPrimaryFire =
        s.keys.has(b.primaryFire || 'Space') ||
        s.keys.has('Space') ||
        s.mouseButtons.has(0) ||
        s.touchInput.fire;
      const wantsSecondaryFire =
        s.keys.has(b.secondaryFire || 'KeyG') ||
        s.keys.has('KeyG') ||
        s.mouseButtons.has(2) ||
        s.touchInput.secondary;

      if (wantsSecondaryFire) {
        fireWeapon(true);
      } else if (wantsPrimaryFire) {
        fireWeapon(false);
      }

      // Enemy units ONLY fire when in the Combat Mission mode (never in Free Flight)
      const isCombatMission = Boolean(s.mission && s.mission.type === 'boss_battle');

      // ======================================================================
      // PROJECTILES & COMBAT HIT DETECTION (ASTEROIDS, FIGHTERS, BATTLESHIP)
      // ======================================================================
      // 1. Player Projectiles
      for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        const p = playerProjectiles[i];
        p.mesh.position.addScaledVector(p.vel, dt);
        p.life -= dt;

        let hitSomething = false;

        // Check Hit against Interactive Asteroids
        for (let a = 0; a < interactiveAsteroids.length; a++) {
          const ast = interactiveAsteroids[a];
          if (!ast.alive) continue;
          const dist = p.mesh.position.distanceTo(ast.mesh.position);
          if (dist < ast.radius + p.radius) {
            hitSomething = true;
            ast.health -= p.damage;
            audioSystem.playHitSpark();
            spawnExplosion(p.mesh.position, false);

            if (ast.health <= 0) {
              ast.alive = false;
              ast.mesh.visible = false;
              spawnExplosion(ast.mesh.position, true);
              triggerToast('ASTEROID SHATTERED', '+35 Credits // +20 XP Awarded', 'info');
              updateSaveData((prev) => ({
                ...prev,
                pilotProfile: {
                  ...prev.pilotProfile,
                  credits: prev.pilotProfile.credits + 35,
                  experience: prev.pilotProfile.experience + 20
                }
              }));
            }
            break;
          }
        }

        // Check Hit against Hostile Fighters
        if (!hitSomething) {
          for (let f = 0; f < enemyFighters.length; f++) {
            const fighter = enemyFighters[f];
            if (!fighter.userData.active) continue;
            const dist = p.mesh.position.distanceTo(fighter.position);
            if (dist < fighter.userData.radius + p.radius) {
              hitSomething = true;
              fighter.userData.health -= p.damage;
              audioSystem.playHitSpark();
              spawnExplosion(p.mesh.position, false);

              if (fighter.userData.health <= 0) {
                fighter.userData.active = false;
                fighter.visible = false;
                spawnExplosion(fighter.position, true);
                triggerToast(`HOSTILE ELIMINATED: ${fighter.userData.name}`, '+180 Credits // +120 XP', 'success');
                updateSaveData((prev) => ({
                  ...prev,
                  pilotProfile: {
                    ...prev.pilotProfile,
                    credits: prev.pilotProfile.credits + 180,
                    experience: prev.pilotProfile.experience + 120
                  }
                }));
              }
              break;
            }
          }
        }

        // Check Hit against Emperor Battleship Subsystems (Turrets, Deckhouse & Main Hull/Shield)
        if (!hitSomething && battleshipMesh.userData.alive) {
          const bData = battleshipMesh.userData;

          // Check Turrets
          for (let t = 0; t < bData.turrets.length; t++) {
            const turret = bData.turrets[t];
            if (!turret.userData.active) continue;
            const tWorldPos = new THREE.Vector3();
            turret.getWorldPosition(tWorldPos);
            const dist = p.mesh.position.distanceTo(tWorldPos);

            if (dist < turret.userData.radius + p.radius) {
              hitSomething = true;
              turret.userData.health -= p.damage;
              audioSystem.playHitSpark();
              spawnExplosion(p.mesh.position, false);

              if (turret.userData.health <= 0) {
                turret.userData.active = false;
                turret.visible = false;
                spawnExplosion(tWorldPos, true);
                triggerToast('PULSE BATTERY DESTROYED', '+350 Credits // +250 XP', 'success');
                updateSaveData((prev) => ({
                  ...prev,
                  pilotProfile: {
                    ...prev.pilotProfile,
                    credits: prev.pilotProfile.credits + 350,
                    experience: prev.pilotProfile.experience + 250
                  }
                }));
              }
              break;
            }
          }

          // Check Citadel Bridge
          if (!hitSomething && bData.deckhouse.userData.active) {
            const dWorldPos = new THREE.Vector3();
            bData.deckhouse.getWorldPosition(dWorldPos);
            const dist = p.mesh.position.distanceTo(dWorldPos);
            if (dist < bData.deckhouse.userData.radius + p.radius) {
              hitSomething = true;
              bData.deckhouse.userData.health -= p.damage;
              audioSystem.playHitSpark();
              spawnExplosion(p.mesh.position, false);

              if (bData.deckhouse.userData.health <= 0) {
                bData.deckhouse.userData.active = false;
                bData.deckhouse.visible = false;
                spawnExplosion(dWorldPos, true);
                triggerToast('CITADEL BRIDGE DESTROYED', '+800 Credits // +500 XP', 'success');
                updateSaveData((prev) => ({
                  ...prev,
                  pilotProfile: {
                    ...prev.pilotProfile,
                    credits: prev.pilotProfile.credits + 800,
                    experience: prev.pilotProfile.experience + 500
                  }
                }));
              }
            }
          }

          // Check Direct Hit on Battleship Hull / Shield Bubble (routes damage to nearest active subsystem)
          if (!hitSomething) {
            const distToHull = p.mesh.position.distanceTo(battleshipMesh.position);
            if (distToHull < 52 + p.radius) {
              hitSomething = true;
              audioSystem.playHitSpark();
              spawnExplosion(p.mesh.position, false);
              if (bData.purpleShieldMat) {
                bData.purpleShieldMat.opacity = 0.68;
              }

              const activeTurret = bData.turrets.find((t) => t.userData.active);
              if (activeTurret) {
                activeTurret.userData.health -= p.damage * 0.85;
                if (activeTurret.userData.health <= 0) {
                  const tWorldPos = new THREE.Vector3();
                  activeTurret.getWorldPosition(tWorldPos);
                  activeTurret.userData.active = false;
                  activeTurret.visible = false;
                  spawnExplosion(tWorldPos, true);
                  triggerToast('PULSE BATTERY DESTROYED', '+350 Credits // +250 XP', 'success');
                  updateSaveData((prev) => ({
                    ...prev,
                    pilotProfile: {
                      ...prev.pilotProfile,
                      credits: prev.pilotProfile.credits + 350,
                      experience: prev.pilotProfile.experience + 250
                    }
                  }));
                }
              } else if (bData.deckhouse.userData.active) {
                bData.deckhouse.userData.health -= p.damage * 0.85;
                if (bData.deckhouse.userData.health <= 0) {
                  const dWorldPos = new THREE.Vector3();
                  bData.deckhouse.getWorldPosition(dWorldPos);
                  bData.deckhouse.userData.active = false;
                  bData.deckhouse.visible = false;
                  spawnExplosion(dWorldPos, true);
                  triggerToast('CITADEL BRIDGE DESTROYED', '+800 Credits // +500 XP', 'success');
                  updateSaveData((prev) => ({
                    ...prev,
                    pilotProfile: {
                      ...prev.pilotProfile,
                      credits: prev.pilotProfile.credits + 800,
                      experience: prev.pilotProfile.experience + 500
                    }
                  }));
                }
              }
            }
          }

          // Check if Battleship is completely neutralized & destroyed
          const allTurretsDown = bData.turrets.every((t) => !t.userData.active);
          const deckhouseDown = !bData.deckhouse.userData.active;
          if (allTurretsDown && deckhouseDown && bData.alive) {
            bData.alive = false;
            bData.shieldMesh.visible = false;

            // Catastrophic Chain Explosions & Final Destruction of Mothership
            for (let ex = -3; ex <= 3; ex++) {
              setTimeout(() => {
                const ep = battleshipMesh.position.clone().add(new THREE.Vector3(ex * 8, (ex % 2) * 4, ex * 14));
                spawnExplosion(ep, true);
                if (ex === 3) {
                  battleshipMesh.visible = false;
                }
              }, (ex + 3) * 160);
            }

            // Power on Blue Warp Extraction Gate
            warpPortalMesh.visible = true;
            triggerToast('DREADNOUGHT KRONOS DESTROYED // WARP GATE OPEN', 'Fly through the Blue Warp Portal to extract from Tartarus Sector', 'success');
          }
        }

        if (p.life <= 0 || hitSomething) {
          projectilesGroup.remove(p.mesh);
          playerProjectiles.splice(i, 1);
        }
      }

      // 2. Hostile Fighter AI & Return Fire (ONLY fires during Combat Mission)
      enemyFighters.forEach((f) => {
        if (!f.userData.active) return;
        const distToPlayer = f.position.distanceTo(s.position);

        if (isCombatMission) {
          // Turn & engage player in combat mission
          f.lookAt(s.position);
          if (distToPlayer > 60) {
            const flyDir = s.position.clone().sub(f.position).normalize();
            f.position.addScaledVector(flyDir, f.userData.speed * 0.45 * dt);
          }

          // Fire purple plasma bolts ONLY in combat mission mode
          f.userData.shootCooldown -= dt;
          if (f.userData.shootCooldown <= 0 && distToPlayer < 260) {
            f.userData.shootCooldown = 1.35 + Math.random() * 0.7;

            const eBoltGeo = new THREE.CylinderGeometry(0.24, 0.24, 4.2, 8);
            eBoltGeo.rotateX(Math.PI / 2);
            const eBoltMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
            const eBolt = new THREE.Mesh(eBoltGeo, eBoltMat);
            eBolt.position.copy(f.position);
            eBolt.lookAt(s.position);
            projectilesGroup.add(eBolt);

            const shotDir = s.position.clone().sub(f.position).normalize();
            enemyProjectiles.push({
              mesh: eBolt,
              vel: shotDir.multiplyScalar(280),
              life: 2.2,
              damage: 14
            });
          }
        }
      });

      // 3. Emperor Battleship Turret AI (ONLY fires during Combat Mission)
      if (battleshipMesh.userData.alive) {
        battleshipMesh.userData.turrets.forEach((turret) => {
          if (!turret.userData.active) return;
          const tWorldPos = new THREE.Vector3();
          turret.getWorldPosition(tWorldPos);
          const dist = tWorldPos.distanceTo(s.position);

          if (isCombatMission) {
            // Swivel turret barrels toward player & fire ONLY in combat mission mode
            if (turret.userData.barrelGroup) {
              turret.userData.barrelGroup.lookAt(s.position);
            }

            turret.userData.cooldown -= dt;
            if (turret.userData.cooldown <= 0 && dist < 340) {
              turret.userData.cooldown = 1.8 + Math.random() * 0.8;

              const tBoltGeo = new THREE.SphereGeometry(0.75, 10, 10);
              const tBoltMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
              const tBolt = new THREE.Mesh(tBoltGeo, tBoltMat);
              tBolt.position.copy(tWorldPos);
              projectilesGroup.add(tBolt);

              const shotDir = s.position.clone().sub(tWorldPos).normalize();
              enemyProjectiles.push({
                mesh: tBolt,
                vel: shotDir.multiplyScalar(230),
                life: 2.6,
                damage: 20
              });
            }
          }
        });

        // Pulsate purple shield bubble
        if (battleshipMesh.userData.purpleShieldMat) {
          battleshipMesh.userData.purpleShieldMat.opacity = THREE.MathUtils.lerp(
            battleshipMesh.userData.purpleShieldMat.opacity,
            0.28 + Math.sin(now * 0.003) * 0.08,
            dt * 5
          );
        }
      }

      // 4. Enemy Projectiles Collision against Player (Cleared immediately if in Free Flight)
      if (!isCombatMission && enemyProjectiles.length > 0) {
        while (enemyProjectiles.length > 0) {
          const ep = enemyProjectiles.pop();
          if (ep?.mesh) projectilesGroup.remove(ep.mesh);
        }
      }
      for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const ep = enemyProjectiles[i];
        ep.mesh.position.addScaledVector(ep.vel, dt);
        ep.life -= dt;

        const distToPlayer = ep.mesh.position.distanceTo(s.position);
        if (distToPlayer < 4.2) {
          s.shieldCurrent = Math.max(0, s.shieldCurrent - ep.damage);
          s.shieldFlash = 1.0;
          s.damageVignetteTimer = 0.55;
          s.cameraShake = Math.min(1.0, s.cameraShake + 0.4);
          audioSystem.playCollision();
          spawnExplosion(ep.mesh.position, false);
          ep.life = 0;
        }

        if (ep.life <= 0) {
          projectilesGroup.remove(ep.mesh);
          enemyProjectiles.splice(i, 1);
        }
      }

      // 5. Warp Extraction Gate Event Horizon Animation & Completion
      if (warpPortalMesh.visible) {
        warpPortalMesh.userData.ringMesh.rotation.z += 1.2 * dt;
        warpPortalMesh.userData.horizon.rotation.z -= 0.8 * dt;

        if (s.position.distanceTo(warpPortalMesh.position) < 22) {
          warpPortalMesh.visible = false;
          spawnExplosion(warpPortalMesh.position, true);
          if (s.mission?.id === 'mission_06_destroy_emperor') {
            const spent = s.mission.timeLimit - s.missionTimeRemaining;
            handleMissionFinished('completed', s.mission, spent);
          } else {
            triggerToast('WARP GATE EXTRACTION COMPLETED', '+1,500 Credits // Sector Cleared', 'success');
          }
        }
      }

      // 6. Update VFX Entities (Expanding Shockwaves, Fireballs, Tumbling Debris)
      for (let i = vfxEntities.length - 1; i >= 0; i--) {
        const fx = vfxEntities[i];
        fx.life -= dt;
        const progress = 1 - Math.max(0, fx.life / fx.maxLife);

        if (fx.type === 'shockwave') {
          const currentScale = 1 + progress * fx.maxScale;
          fx.mesh.scale.setScalar(currentScale);
          fx.mat.opacity = Math.max(0, (1 - progress) * 0.85);
        } else if (fx.type === 'fireball') {
          const currentScale = 1 + progress * fx.maxScale;
          fx.mesh.scale.setScalar(currentScale);
          fx.mat.opacity = Math.max(0, (1 - progress) * 0.95);
        } else if (fx.type === 'debris') {
          fx.mesh.position.addScaledVector(fx.vel, dt);
          fx.mesh.rotation.x += fx.rot.x * dt;
          fx.mesh.rotation.y += fx.rot.y * dt;
          fx.mesh.rotation.z += fx.rot.z * dt;
          fx.mesh.scale.setScalar(Math.max(0.1, 1 - progress * 0.7));
        }

        if (fx.life <= 0) {
          fxGroup.remove(fx.mesh);
          vfxEntities.splice(i, 1);
        }
      }

      // ======================================================================
      // COLLISION DETECTION (PLANETS & INTERACTIVE ASTEROIDS) + SCANNER
      // ======================================================================
      let closestObj = null;
      let closestDist = Infinity;

      for (let i = 0; i < WORLD_OBJECTS.length; i++) {
        const wo = WORLD_OBJECTS[i];
        const objPos = worldMeshes[i].group.position;
        const dist = s.position.distanceTo(objPos);

        if (dist < closestDist) {
          closestDist = dist;
          closestObj = wo;
        }

        // Physical Surface Collision Bounce
        const minSafeDist = wo.radius + 5.5;
        if (dist < minSafeDist) {
          const pushDir = s.position.clone().sub(objPos).normalize();
          s.position.copy(objPos).addScaledVector(pushDir, minSafeDist + 2.0);
          s.speed *= 0.45;
          s.shieldCurrent = Math.max(10, s.shieldCurrent - 24);
          s.shieldFlash = 1.0;
          s.cameraShake = 0.65;
          audioSystem.playCollision();
        }
      }

      // Interactive Asteroids Rotation & Ship Collision Check
      for (let i = 0; i < interactiveAsteroids.length; i++) {
        const ast = interactiveAsteroids[i];
        if (!ast.alive) continue;
        ast.mesh.rotation.x += ast.rotSpeed.x * dt;
        ast.mesh.rotation.y += ast.rotSpeed.y * dt;

        const dist = s.position.distanceTo(ast.mesh.position);
        const minSafeDist = ast.radius + 3.2;
        if (dist < minSafeDist) {
          const pushDir = s.position.clone().sub(ast.mesh.position).normalize();
          s.position.copy(ast.mesh.position).addScaledVector(pushDir, minSafeDist + 2.2);
          s.speed *= 0.5;
          s.shieldCurrent = Math.max(5, s.shieldCurrent - 18);
          s.shieldFlash = 1.0;
          s.damageVignetteTimer = 0.4;
          s.cameraShake = 0.55;
          audioSystem.playCollision();
          break;
        }
      }

      // Free Collectible Cores Check
      for (let i = 0; i < freeCores.length; i++) {
        const fc = freeCores[i];
        if (!fc.collected && s.position.distanceTo(fc.mesh.position) < 12) {
          fc.collected = true;
          fc.mesh.visible = false;
          handleFreeCoreCollected();
        }
      }

      // Proximity Discovery Scan
      s.nearestObject = closestObj;
      s.nearestDistance = closestDist;
      const canScan = closestObj && closestDist <= closestObj.interactionRadius;
      const isAlreadyDiscovered = closestObj && s.discoveredIds.has(closestObj.id);
      const wantsScan = s.keys.has(b.scan) || s.touchInput.scan;

      if (canScan && (!isAlreadyDiscovered || (s.mission?.type === 'scan_targets' && !s.missionScannedSet.has(closestObj.id)))) {
        // Automatically progress scan slowly on approach or rapidly when holding F / Scan
        const scanRate = wantsScan ? 0.95 : 0.42;
        s.scanProgress = Math.min(1, s.scanProgress + dt * scanRate);
        if (s.scanProgress >= 1) {
          s.scanProgress = 0;
          if (!isAlreadyDiscovered) {
            s.discoveredIds.add(closestObj.id);
            handleObjectDiscovered(closestObj);
          }
          if (s.mission?.type === 'scan_targets' && s.mission.targetIds.includes(closestObj.id)) {
            s.missionScannedSet.add(closestObj.id);
            audioSystem.playCheckpoint();
            if (s.missionScannedSet.size >= s.mission.targetIds.length) {
              const spent = s.mission.timeLimit - s.missionTimeRemaining;
              handleMissionFinished('completed', s.mission, spent);
            }
          }
        }
      } else {
        s.scanProgress = Math.max(0, s.scanProgress - dt * 0.8);
      }

      // Active Mission Logic (Checkpoints, Cores & Timer)
      if (s.mission) {
        s.missionTimeRemaining -= dt;
        if (s.missionTimeRemaining <= 0) {
          handleMissionFinished('failed', s.mission, s.mission.timeLimit);
        } else if (s.mission.type === 'checkpoints') {
          const targetMesh = missionMeshes[s.missionIndex];
          if (targetMesh) {
            targetMesh.rotation.z += 1.4 * dt;
            if (s.position.distanceTo(targetMesh.position) < 20) {
              audioSystem.playCheckpoint();
              targetMesh.visible = false;
              s.missionIndex += 1;
              if (missionMeshes[s.missionIndex]) {
                missionMeshes[s.missionIndex].material.color.setHex(0x48e0a4);
                missionMeshes[s.missionIndex].material.opacity = 0.95;
              } else {
                const spent = s.mission.timeLimit - s.missionTimeRemaining;
                handleMissionFinished('completed', s.mission, spent);
              }
            }
          }
        } else if (s.mission.type === 'collect_cores') {
          let remaining = 0;
          missionMeshes.forEach((m) => {
            if (!m.visible) return;
            remaining++;
            m.rotation.y += 2.0 * dt;
            if (s.position.distanceTo(m.position) < 16) {
              m.visible = false;
              remaining--;
              s.missionIndex += 1;
              audioSystem.playCheckpoint();
            }
          });
          if (remaining === 0) {
            const spent = s.mission.timeLimit - s.missionTimeRemaining;
            handleMissionFinished('completed', s.mission, spent);
          }
        }
      }

      // ======================================================================
      // MULTI-MODE CAMERA SYSTEM (CHASE, COCKPIT, CINEMATIC, FREE_LOOK)
      // ======================================================================
      upVec.set(0, 1, 0).applyQuaternion(s.quaternion);

      if (s.cameraMode === 'COCKPIT') {
        shipAnchor.visible = false;
        camOffset.set(0, 0.72, -1.5).applyQuaternion(s.quaternion);
        camera.position.copy(s.position).add(camOffset);
        lookTarget.copy(s.position).addScaledVector(forwardVec, 60);
        camera.up.copy(upVec);
        camera.lookAt(lookTarget);
      } else if (s.cameraMode === 'CINEMATIC') {
        shipAnchor.visible = true;
        const cAngle = now * 0.0007;
        camOffset.set(Math.sin(cAngle) * 14, 3.8, Math.cos(cAngle) * 14);
        camera.position.lerp(s.position.clone().add(camOffset), dt * 5);
        camera.up.set(0, 1, 0);
        camera.lookAt(s.position);
      } else if (s.cameraMode === 'FREE_LOOK') {
        shipAnchor.visible = true;
        const r = 13.5;
        camOffset.set(
          Math.sin(s.freeLookYaw) * Math.cos(s.freeLookPitch) * r,
          Math.sin(s.freeLookPitch) * r + 2.5,
          Math.cos(s.freeLookYaw) * Math.cos(s.freeLookPitch) * r
        );
        camera.position.copy(s.position).add(camOffset);
        camera.up.set(0, 1, 0);
        camera.lookAt(s.position);
      } else {
        // Default Third-Person Chase Camera with smooth lag
        shipAnchor.visible = true;
        camOffset.set(0, 3.3, 12.2).applyQuaternion(s.quaternion);
        targetCamPos.copy(s.position).add(camOffset);
        camera.position.lerp(targetCamPos, Math.min(1, dt * 10.5));
        lookTarget.copy(s.position).addScaledVector(forwardVec, 32);
        camera.up.lerp(upVec, Math.min(1, dt * 8));
        camera.lookAt(lookTarget);
      }

      // Subtle Camera Shake on collision
      if (s.cameraShake > 0) {
        s.cameraShake = Math.max(0, s.cameraShake - dt * 2.2);
        camera.position.x += (Math.random() - 0.5) * s.cameraShake * 1.4;
        camera.position.y += (Math.random() - 0.5) * s.cameraShake * 1.4;
      }

      // ======================================================================
      // DIRECT DOM HUD & RADAR CANVAS UPDATE (ZERO REACT RE-RENDERS)
      // ======================================================================
      const h = hudRefs.current;
      if (h.speedValue) h.speedValue.textContent = `${Math.round(s.speed * 10)}`;
      if (h.speedBar) {
        const pct = Math.min(100, (s.speed / (s.effectiveStats.topSpeed * 1.7)) * 100);
        h.speedBar.style.width = `${pct}%`;
      }
      if (h.throttleValue) h.throttleValue.textContent = `${Math.round(s.throttle * 100)}%`;
      if (h.boostValue) h.boostValue.textContent = `${Math.round((s.boostEnergy / s.effectiveStats.boostCapacity) * 100)}%`;
      if (h.boostBar) {
        h.boostBar.style.width = `${(s.boostEnergy / s.effectiveStats.boostCapacity) * 100}%`;
      }
      if (h.shieldValue) h.shieldValue.textContent = `${Math.round(s.shieldCurrent)} / ${s.effectiveStats.shield}`;
      if (h.shieldBar) {
        h.shieldBar.style.width = `${(s.shieldCurrent / s.effectiveStats.shield) * 100}%`;
      }
      if (h.coordsValue) {
        h.coordsValue.textContent = `X:${Math.round(s.position.x)} Y:${Math.round(s.position.y)} Z:${Math.round(s.position.z)}`;
      }
      if (h.zoneBadge && closestObj) {
        h.zoneBadge.textContent = closestDist < closestObj.interactionRadius * 1.5
          ? `${closestObj.name.toUpperCase()} // ${closestObj.zoneType}`
          : 'DEEP SPACE // HELIOS SECTOR';
      }
      if (h.scanPrompt) {
        if (canScan && (!isAlreadyDiscovered || (s.mission?.type === 'scan_targets' && !s.missionScannedSet.has(closestObj.id)))) {
          h.scanPrompt.style.opacity = '1';
          if (h.scanProgressBar) h.scanProgressBar.style.width = `${Math.round(s.scanProgress * 100)}%`;
        } else {
          h.scanPrompt.style.opacity = '0';
        }
      }
      if (h.missionTimer && s.mission) {
        h.missionTimer.textContent = `${Math.max(0, Math.ceil(s.missionTimeRemaining))}s`;
      }
      if (h.missionProgress && s.mission) {
        if (s.mission.type === 'checkpoints') {
          h.missionProgress.textContent = `${s.missionIndex} / ${s.mission.checkpoints.length} RINGS`;
        } else if (s.mission.type === 'scan_targets') {
          h.missionProgress.textContent = `${s.missionScannedSet.size} / ${s.mission.targetIds.length} SCANNED`;
        } else if (s.mission.type === 'collect_cores') {
          h.missionProgress.textContent = `${s.missionIndex} / ${s.mission.corePositions.length} CORES`;
        } else if (s.mission.type === 'boss_battle') {
          if (warpPortalMesh.visible) {
            h.missionProgress.textContent = 'ENTER WARP PORTAL';
          } else {
            const bData = battleshipMesh.userData;
            const downTurrets = bData.turrets.filter((t) => !t.userData.active).length;
            const downDeck = bData.deckhouse.userData.active ? 0 : 1;
            h.missionProgress.textContent = `${downTurrets + downDeck} / 5 BATTLESHIP CORES DESTROYED`;
          }
        }
      }

      // ======================================================================
      // 3D TACTICAL TARGET LOCK-ON RETICLE & HUD PROJECTION (MATCHING VIDEO)
      // ======================================================================
      let bestTarget = null;
      let bestDot = 0.82; // within ~35 degrees of center crosshair

      // Check Hostile Fighters
      enemyFighters.forEach((f) => {
        if (!f.userData.active) return;
        const dir = f.position.clone().sub(s.position).normalize();
        const dot = forwardVec.dot(dir);
        const dist = s.position.distanceTo(f.position);
        if (dot > bestDot && dist < 420) {
          bestDot = dot;
          bestTarget = {
            pos: f.position,
            name: f.userData.name,
            health: f.userData.health,
            maxHealth: f.userData.maxHealth,
            dist
          };
        }
      });

      // Check Battleship Subsystems (Turrets & Deckhouse)
      if (!bestTarget && battleshipMesh.userData.alive) {
        battleshipMesh.userData.turrets.forEach((turret) => {
          if (!turret.userData.active) return;
          const tp = new THREE.Vector3();
          turret.getWorldPosition(tp);
          const dir = tp.clone().sub(s.position).normalize();
          const dot = forwardVec.dot(dir);
          const dist = s.position.distanceTo(tp);
          if (dot > bestDot && dist < 450) {
            bestDot = dot;
            bestTarget = {
              pos: tp,
              name: turret.userData.name,
              health: turret.userData.health,
              maxHealth: turret.userData.maxHealth,
              dist
            };
          }
        });

        if (!bestTarget && battleshipMesh.userData.deckhouse.userData.active) {
          const dp = new THREE.Vector3();
          battleshipMesh.userData.deckhouse.getWorldPosition(dp);
          const dir = dp.clone().sub(s.position).normalize();
          const dot = forwardVec.dot(dir);
          const dist = s.position.distanceTo(dp);
          if (dot > bestDot && dist < 450) {
            bestDot = dot;
            bestTarget = {
              pos: dp,
              name: battleshipMesh.userData.deckhouse.userData.name,
              health: battleshipMesh.userData.deckhouse.userData.health,
              maxHealth: battleshipMesh.userData.deckhouse.userData.maxHealth,
              dist
            };
          }
        }
      }

      // Check Interactive Cratered Asteroids
      if (!bestTarget) {
        interactiveAsteroids.forEach((ast) => {
          if (!ast.alive) return;
          const dir = ast.mesh.position.clone().sub(s.position).normalize();
          const dot = forwardVec.dot(dir);
          const dist = s.position.distanceTo(ast.mesh.position);
          if (dot > bestDot && dist < 280) {
            bestDot = dot;
            bestTarget = {
              pos: ast.mesh.position,
              name: ast.name,
              health: ast.health,
              maxHealth: ast.maxHealth,
              dist
            };
          }
        });
      }

      s.targetLockedEntity = bestTarget;

      if (h.targetLockOverlay) {
        if (bestTarget) {
          projVec.copy(bestTarget.pos).project(camera);
          if (projVec.z < 1) {
            const x = (projVec.x * 0.5 + 0.5) * container.clientWidth;
            const y = (-projVec.y * 0.5 + 0.5) * container.clientHeight;
            h.targetLockOverlay.style.opacity = '1';
            h.targetLockOverlay.style.transform = `translate(${x - 48}px, ${y - 48}px)`;
            if (h.targetLockName) h.targetLockName.textContent = bestTarget.name;
            if (h.targetLockDist) h.targetLockDist.textContent = `${Math.round(bestTarget.dist)}m`;
            if (h.targetLockBar) {
              const hpPct = Math.max(0, Math.min(100, (bestTarget.health / bestTarget.maxHealth) * 100));
              h.targetLockBar.style.width = `${hpPct}%`;
            }
          } else {
            h.targetLockOverlay.style.opacity = '0';
          }
        } else {
          h.targetLockOverlay.style.opacity = '0';
        }
      }

      // Top Heading Compass Tape Update
      const headingDeg = Math.round(((Math.atan2(forwardVec.x, -forwardVec.z) * 180 / Math.PI) + 360) % 360);
      if (h.compassDegrees) h.compassDegrees.textContent = `${headingDeg}°`;
      if (h.compassScroller) {
        h.compassScroller.style.transform = `translateX(${-((headingDeg % 360) * 2.4)}px)`;
      }

      // Red Screen-Edge Damage Vignette Flash
      if (h.damageVignette) {
        if (s.damageVignetteTimer > 0) {
          s.damageVignetteTimer = Math.max(0, s.damageVignetteTimer - dt);
          h.damageVignette.style.opacity = `${(s.damageVignetteTimer / 0.55).toFixed(2)}`;
        } else {
          h.damageVignette.style.opacity = '0';
        }
      }

      // Weapon Slots Active Indicator
      [h.weaponSlot1, h.weaponSlot2, h.weaponSlot3].forEach((slotEl, idx) => {
        if (!slotEl) return;
        const isActive = s.activeWeapon === idx + 1;
        slotEl.style.borderColor = isActive ? '#00f0ff' : 'rgba(154, 168, 199, 0.25)';
        slotEl.style.backgroundColor = isActive ? 'rgba(0, 240, 255, 0.22)' : 'rgba(13, 20, 40, 0.75)';
      });

      // 3D Screen-Space Target Marker Projection (Waypoints)
      if (h.waypointOverlay) {
        let targetWorldPos = null;
        let targetLabel = '';
        if (warpPortalMesh.visible) {
          targetWorldPos = warpPortalMesh.position;
          targetLabel = 'WARP GATE // EXTRACT';
        } else if (s.mission) {
          if (s.mission.type === 'boss_battle') {
            targetWorldPos = battleshipMesh.position;
            targetLabel = 'DREADNOUGHT KRONOS';
          } else if (s.mission.type === 'checkpoints' && missionMeshes[s.missionIndex]) {
            targetWorldPos = missionMeshes[s.missionIndex].position;
            targetLabel = `WAYPOINT 0${s.missionIndex + 1}`;
          } else if (s.mission.type === 'collect_cores') {
            const nextCore = missionMeshes.find((m) => m.visible);
            if (nextCore) {
              targetWorldPos = nextCore.position;
              targetLabel = 'QUANTUM CORE';
            }
          } else if (s.mission.type === 'scan_targets') {
            const nextId = s.mission.targetIds.find((id) => !s.missionScannedSet.has(id));
            const obj = WORLD_OBJECTS.find((w) => w.id === nextId);
            if (obj) {
              targetWorldPos = new THREE.Vector3(...obj.position);
              targetLabel = `SCAN: ${obj.name.toUpperCase()}`;
            }
          }
        } else if (closestObj) {
          targetWorldPos = new THREE.Vector3(...closestObj.position);
          targetLabel = closestObj.name.toUpperCase();
        }

        if (targetWorldPos) {
          const dist = Math.round(s.position.distanceTo(targetWorldPos));
          projVec.copy(targetWorldPos).project(camera);
          if (projVec.z < 1) {
            const x = (projVec.x * 0.5 + 0.5) * container.clientWidth;
            const y = (-projVec.y * 0.5 + 0.5) * container.clientHeight;
            h.waypointOverlay.style.opacity = '1';
            h.waypointOverlay.style.transform = `translate(${x - 60}px, ${y - 26}px)`;
            h.waypointOverlay.innerHTML = `<div style="border:1px solid #49D9FF;background:rgba(13,20,40,0.82);padding:3px 8px;border-radius:6px;font-size:10px;color:#F4F7FF;white-space:nowrap;box-shadow:0 0 12px rgba(73,217,255,0.35);"><span style="color:#49D9FF;font-weight:700;">◈ ${targetLabel}</span> <span style="color:#9AA8C7;">${dist}m</span></div>`;
          } else {
            h.waypointOverlay.style.opacity = '0';
          }
        } else {
          h.waypointOverlay.style.opacity = '0';
        }
      }

      // Draw 2D Tactical Radar / Minimap
      const rCanvas = radarCanvasRef.current;
      if (rCanvas) {
        const rCtx = rCanvas.getContext('2d');
        const w = rCanvas.width;
        const hSize = rCanvas.height;
        const cx = w / 2;
        const cy = hSize / 2;
        const radarRange = 850;

        rCtx.clearRect(0, 0, w, hSize);
        rCtx.strokeStyle = 'rgba(73, 217, 255, 0.22)';
        rCtx.lineWidth = 1;
        [0.33, 0.66, 0.95].forEach((rScale) => {
          rCtx.beginPath();
          rCtx.arc(cx, cy, (w / 2) * rScale, 0, Math.PI * 2);
          rCtx.stroke();
        });

        // Crosshairs
        rCtx.beginPath();
        rCtx.moveTo(cx, 6);
        rCtx.lineTo(cx, hSize - 6);
        rCtx.moveTo(6, cy);
        rCtx.lineTo(w - 6, cy);
        rCtx.stroke();

        // Yaw angle of ship to rotate radar relative to nose
        const yawAngle = Math.atan2(forwardVec.x, -forwardVec.z);

        // Plot World Objects
        WORLD_OBJECTS.forEach((wo) => {
          const dx = wo.position[0] - s.position.x;
          const dz = wo.position[2] - s.position.z;
          const rx = dx * Math.cos(-yawAngle) - dz * Math.sin(-yawAngle);
          const rz = dx * Math.sin(-yawAngle) + dz * Math.cos(-yawAngle);

          const px = cx + (rx / radarRange) * (w * 0.45);
          const py = cy + (rz / radarRange) * (hSize * 0.45);
          if (Math.hypot(px - cx, py - cy) < w * 0.46) {
            rCtx.fillStyle = wo.category === 'station' ? '#48E0A4' : wo.zoneType.includes('HAZARD') ? '#FF5D73' : '#49D9FF';
            rCtx.beginPath();
            rCtx.arc(px, py, wo.category === 'planet' ? 4.2 : 3, 0, Math.PI * 2);
            rCtx.fill();
          }
        });

        // Plot Mission Checkpoints
        if (s.mission && missionMeshes[s.missionIndex]) {
          const mp = missionMeshes[s.missionIndex].position;
          const dx = mp.x - s.position.x;
          const dz = mp.z - s.position.z;
          const rx = dx * Math.cos(-yawAngle) - dz * Math.sin(-yawAngle);
          const rz = dx * Math.sin(-yawAngle) + dz * Math.cos(-yawAngle);
          const px = THREE.MathUtils.clamp(cx + (rx / radarRange) * (w * 0.45), 10, w - 10);
          const py = THREE.MathUtils.clamp(cy + (rz / radarRange) * (hSize * 0.45), 10, hSize - 10);
          rCtx.fillStyle = '#FFB454';
          rCtx.beginPath();
          rCtx.arc(px, py, 4.5, 0, Math.PI * 2);
          rCtx.fill();
        }

        // Player Ship Center Triangle
        rCtx.fillStyle = '#F4F7FF';
        rCtx.beginPath();
        rCtx.moveTo(cx, cy - 5);
        rCtx.lineTo(cx - 4, cy + 4);
        rCtx.lineTo(cx + 4, cy + 4);
        rCtx.closePath();
        rCtx.fill();
      }

      renderScene();
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      if (composer) composer.dispose();
      if (envRenderTarget) envRenderTarget.dispose();
      if (pmremGenerator) pmremGenerator.dispose();
      renderer.dispose();
    };
  }, [handleObjectDiscovered, handleFreeCoreCollected, handleMissionFinished, remappingAction, updateSaveData]);

  // Periodic Flush of Flight Distance & Time to Persistent Save State
  useEffect(() => {
    const interval = setInterval(() => {
      const s = simRef.current;
      if (s.isPlaying && !s.isPaused && (s.sessionDistance > 10 || s.sessionTime > 2)) {
        const distDelta = Math.round(s.sessionDistance);
        const timeDelta = Math.round(s.sessionTime);
        s.sessionDistance = 0;
        s.sessionTime = 0;
        updateSaveData((prev) => ({
          ...prev,
          exploration: {
            ...prev.exploration,
            totalFlightDistance: prev.exploration.totalFlightDistance + distDelta,
            totalFlightTime: prev.exploration.totalFlightTime + timeDelta
          }
        }));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [updateSaveData]);

  // Keybind Remapping Listener
  useEffect(() => {
    if (!remappingAction) return;
    const handleRebind = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setRemappingAction(null);
        return;
      }
      updateSaveData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          bindings: {
            ...prev.settings.bindings,
            [remappingAction]: e.code
          }
        }
      }));
      setRemappingAction(null);
      audioSystem.playUIClick();
    };
    window.addEventListener('keydown', handleRebind, { once: true });
    return () => window.removeEventListener('keydown', handleRebind);
  }, [remappingAction, updateSaveData]);

  // ============================================================================
  // 8. HANGAR, PROFILE ACHIEVEMENTS & SETTINGS ACTIONS
  // ============================================================================
  const handleSelectOrUnlockShip = (shipSpec) => {
    audioSystem.playUIClick();
    const state = saveData.ships[shipSpec.id];
    if (state?.unlocked) {
      updateSaveData((prev) => ({ ...prev, selectedShipId: shipSpec.id }));
      triggerToast(`ACTIVE VESSEL: ${shipSpec.name.toUpperCase()}`, 'Spacecraft systems online and ready for launch.', 'info');
      return;
    }

    if (saveData.pilotProfile.credits < shipSpec.unlockCost) {
      triggerToast('INSUFFICIENT CREDITS', `Need ${shipSpec.unlockCost} CR to unlock ${shipSpec.name}.`, 'danger');
      return;
    }

    updateSaveData((prev) => ({
      ...prev,
      selectedShipId: shipSpec.id,
      pilotProfile: {
        ...prev.pilotProfile,
        credits: prev.pilotProfile.credits - shipSpec.unlockCost,
        experience: prev.pilotProfile.experience + 250
      },
      ships: {
        ...prev.ships,
        [shipSpec.id]: {
          shipId: shipSpec.id,
          unlocked: true,
          upgradeLevels: { speed: 1, handling: 1, boost: 1, shield: 1 }
        }
      }
    }));
    audioSystem.playDiscovery();
    triggerToast(`SHIP UNLOCKED: ${shipSpec.name.toUpperCase()}`, 'Vessel commissioned into your orbital hangar.', 'success');
  };

  const handleUpgradeShipSystem = (shipId, statKey) => {
    audioSystem.playUIClick();
    const shipState = saveData.ships[shipId];
    const currentLvl = shipState?.upgradeLevels?.[statKey] || 1;
    if (currentLvl >= 5) return;

    const cost = currentLvl * 260;
    if (saveData.pilotProfile.credits < cost) {
      triggerToast('INSUFFICIENT CREDITS', `Requires ${cost} CR for Level ${currentLvl + 1} upgrade.`, 'danger');
      return;
    }

    updateSaveData((prev) => ({
      ...prev,
      pilotProfile: {
        ...prev.pilotProfile,
        credits: prev.pilotProfile.credits - cost,
        experience: prev.pilotProfile.experience + 90
      },
      ships: {
        ...prev.ships,
        [shipId]: {
          ...prev.ships[shipId],
          upgradeLevels: {
            ...prev.ships[shipId].upgradeLevels,
            [statKey]: currentLvl + 1
          }
        }
      }
    }));
    triggerToast('SUBSYSTEM UPGRADED', `${statKey.toUpperCase()} upgraded to Mk.${currentLvl + 1}`, 'success');
  };

  const isAchievementUnlocked = (achId) => {
    const exp = saveData.exploration;
    const completedCount = Object.values(saveData.missions).filter((m) => m.status === 'completed').length;
    const unlockedShipsCount = Object.values(saveData.ships).filter((s) => s.unlocked).length;
    const hasLevel3Upgrade = Object.values(saveData.ships).some((s) =>
      Object.values(s.upgradeLevels || {}).some((lvl) => lvl >= 3)
    );

    if (achId === 'first_flight') return exp.totalFlightDistance >= 1000;
    if (achId === 'cartographer') return exp.discoveredObjectIds.length >= 3;
    if (achId === 'mission_ace') return completedCount >= 2;
    if (achId === 'fleet_commander') return unlockedShipsCount >= 2;
    if (achId === 'chief_engineer') return hasLevel3Upgrade;
    if (achId === 'deep_explorer') return exp.discoveredObjectIds.length >= WORLD_OBJECTS.length;
    return false;
  };

  const claimAchievement = (ach) => {
    if (saveData.claimedAchievements.includes(ach.id)) return;
    audioSystem.playMissionComplete();
    updateSaveData((prev) => ({
      ...prev,
      claimedAchievements: [...prev.claimedAchievements, ach.id],
      pilotProfile: {
        ...prev.pilotProfile,
        credits: prev.pilotProfile.credits + ach.reward,
        experience: prev.pilotProfile.experience + 200
      }
    }));
    triggerToast(`ACHIEVEMENT CLAIMED: ${ach.title.toUpperCase()}`, `+${ach.reward} CR & +200 XP Awarded`, 'success');
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none font-sans"
      style={{ backgroundColor: '#050816', color: '#F4F7FF' }}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Screen-Space 3D Target Waypoint Marker (Hidden in 'full_hide' mode) */}
      <div
        ref={(el) => (hudRefs.current.waypointOverlay = el)}
        className={`pointer-events-none fixed top-0 left-0 z-10 transition-opacity duration-150 ${
          hudMode === 'full_hide' ? 'hidden' : ''
        }`}
        style={{ opacity: 0 }}
      />

      {/* Screen-Edge Red Damage Vignette Flash */}
      <div
        ref={(el) => (hudRefs.current.damageVignette = el)}
        className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-150"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(255, 30, 30, 0.45) 80%, rgba(255, 0, 0, 0.8) 100%)',
          opacity: 0
        }}
      />

      {/* Tactical Combat Target Lock-On Overlay (Diamond Reticle, Name, Distance & Health Bar) */}
      <div
        ref={(el) => (hudRefs.current.targetLockOverlay = el)}
        className="pointer-events-none fixed top-0 left-0 z-20 flex flex-col items-center justify-center transition-opacity duration-75"
        style={{ width: '96px', height: '96px', opacity: 0 }}
      >
        <div className="relative w-12 h-12 border-2 border-red-500 rotate-45 animate-pulse shadow-[0_0_12px_rgba(255,50,50,0.6)]" style={{ borderColor: '#ff3344' }}>
          <div className="absolute inset-1 border border-red-400 opacity-60" />
        </div>
        <div className="mt-2 px-2 py-0.5 rounded bg-black/85 border border-red-500/60 text-center whitespace-nowrap backdrop-blur-sm">
          <div ref={(el) => (hudRefs.current.targetLockName = el)} className="text-[10px] font-bold font-mono text-red-400 tracking-wider">TARGET</div>
          <div className="flex items-center gap-1.5 justify-center">
            <span ref={(el) => (hudRefs.current.targetLockDist = el)} className="text-[9px] font-mono text-white">0m</span>
            <div className="w-10 h-1 bg-red-950 rounded-full overflow-hidden border border-red-800">
              <div ref={(el) => (hudRefs.current.targetLockBar = el)} className="h-full bg-red-500" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all"
          style={{
            backgroundColor: 'rgba(13, 20, 40, 0.92)',
            borderColor: toast.type === 'success' ? '#48E0A4' : toast.type === 'danger' ? '#FF5D73' : '#49D9FF'
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#48E0A4' }} />
          ) : toast.type === 'danger' ? (
            <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: '#FF5D73' }} />
          ) : (
            <Sparkles className="w-5 h-5 shrink-0" style={{ color: '#49D9FF' }} />
          )}
          <div>
            <div className="text-xs font-bold tracking-wider" style={{ color: '#F4F7FF' }}>{toast.title}</div>
            <div className="text-xs" style={{ color: '#9AA8C7' }}>{toast.subtitle}</div>
          </div>
        </div>
      )}

      {/* Top Global Telemetry & Navigation Bar (Hidden in non-full HUD flight modes) */}
      <header
        className={`relative z-30 flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 border-b backdrop-blur-md mobile-landscape-compact-header ${
          activeScreen === 'playing' && hudMode !== 'full' ? 'hidden' : ''
        }`}
        style={{
          backgroundColor: activeScreen === 'main_menu' ? 'rgba(3, 5, 10, 0.92)' : 'rgba(8, 12, 24, 0.88)',
          borderColor: 'rgba(0, 168, 255, 0.14)'
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              audioSystem.playUIClick();
              setIsPaused(false);
              setActiveScreen('main_menu');
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00a8ff', boxShadow: '0 0 8px #00a8ff' }} />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-slate-200 uppercase">
              INTEGRITY: <strong className="text-white">{Math.round((saveData.ships[currentShipSpec.id]?.unlocked ? 100 : 100))}%</strong>
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-3 sm:pl-4 border-l border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-400">
            <span>CALLSIGN: <strong className="text-slate-200">{saveData.pilotProfile.callsign}</strong></span>
            <span className="text-slate-600">//</span>
            <span style={{ color: '#00a8ff' }}>{saveData.pilotProfile.credits.toLocaleString()} CR</span>
          </div>
        </div>

        {/* Center Navigation Pills when outside Main Menu */}
        {activeScreen !== 'main_menu' && (
          <nav className="flex items-center gap-1 bg-[#060a14]/90 border border-slate-800/80 px-1.5 py-0.5 sm:py-1 rounded-full">
            {[
              { id: 'main_menu', label: 'DECK', icon: Activity },
              { id: 'hangar', label: 'SPECS', icon: Sliders },
              { id: 'missions', label: 'MISSIONS', icon: Globe },
              { id: 'profile', label: 'SYSTEMS', icon: Layers },
              { id: 'settings', label: 'CONTROL', icon: Settings },
              { id: 'playing', label: 'FLIGHT', icon: Compass }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    audioSystem.playUIClick();
                    setIsPaused(false);
                    setActiveScreen(tab.id);
                  }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono tracking-wider transition-all cursor-pointer"
                  style={{
                    backgroundColor: active ? '#0088ff' : 'transparent',
                    color: active ? '#ffffff' : '#8b9bb4',
                    boxShadow: active ? '0 0 14px rgba(0, 136, 255, 0.45)' : 'none'
                  }}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Telemetry Actions (Audio Mute & Fullscreen Toggle) */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-semibold tracking-wider transition-colors cursor-pointer"
            style={{ backgroundColor: '#090e1a', borderColor: 'rgba(0, 168, 255, 0.3)', color: '#00a8ff' }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Mode'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}</span>
          </button>

          <button
            onClick={() => {
              updateSaveData((prev) => ({
                ...prev,
                settings: { ...prev.settings, muted: !prev.settings.muted }
              }));
            }}
            className="p-1.5 rounded-full border transition-colors cursor-pointer"
            style={{ backgroundColor: '#090e1a', borderColor: 'rgba(148, 163, 184, 0.2)' }}
            title="Toggle Audio Mute"
          >
            {saveData.settings.muted ? (
              <VolumeX className="w-3.5 h-3.5" style={{ color: '#FF5D73' }} />
            ) : (
              <Volume2 className="w-3.5 h-3.5" style={{ color: '#00a8ff' }} />
            )}
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* VIEW 1: PRE-LAUNCH INTERFACE                                         */}
      {/* ==================================================================== */}
      {activeScreen === 'main_menu' && (
        <div className="relative z-20 h-[calc(100vh-49px)] overflow-y-auto overflow-x-hidden scroll-smooth pointer-events-auto">
          {/* STAGE 1: HERO 3D SPACECRAFT DECK (ASTRAL VANGUARD) */}
          <section
            className="relative min-h-[calc(100vh-49px)] flex flex-col justify-between px-6 md:px-16 pt-10 pb-6"
            style={{
              background:
                'radial-gradient(circle at 72% 44%, rgba(0, 140, 255, 0.08) 0%, rgba(3, 6, 14, 0.42) 48%, rgba(2, 4, 10, 0.88) 100%)'
            }}
          >
            {/* Left Hero Content & 2x2 Telemetry Readout */}
            <div className="my-auto max-w-xl">
              <div
                className="text-[11px] md:text-xs font-mono uppercase tracking-[0.32em] mb-2 font-semibold"
                style={{ color: '#00a8ff' }}
              >
                HYPERDRIVE TACTICAL EXPLORER
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.94] uppercase">
                <span className="block text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">ASTRAL</span>
                <span className="block font-light tracking-wide mt-1" style={{ color: '#8b9bb4' }}>
                  VANGUARD
                </span>
              </h1>

              {/* 2x2 Telemetry Specs Grid (Exact match to Desain UI.jpg) */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-8 max-w-md">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border shrink-0"
                    style={{ backgroundColor: 'rgba(0, 168, 255, 0.08)', borderColor: 'rgba(0, 168, 255, 0.35)' }}
                  >
                    <Flame className="w-3.5 h-3.5" style={{ color: '#00a8ff' }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">FUSION CORE</div>
                    <div className="text-xs font-mono font-bold text-slate-100">1423.8 °C</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border shrink-0"
                    style={{ backgroundColor: 'rgba(0, 168, 255, 0.08)', borderColor: 'rgba(0, 168, 255, 0.35)' }}
                  >
                    <Shield className="w-3.5 h-3.5" style={{ color: '#00a8ff' }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">DEFLECTOR</div>
                    <div className="text-xs font-mono font-bold text-slate-100">422.0 GHz // {effectiveStats.shield} HP</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border shrink-0"
                    style={{ backgroundColor: 'rgba(0, 168, 255, 0.08)', borderColor: 'rgba(0, 168, 255, 0.35)' }}
                  >
                    <Gauge className="w-3.5 h-3.5" style={{ color: '#00a8ff' }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">THROTTLE THRUST</div>
                    <div className="text-xs font-mono font-bold text-slate-100">85% Output ({effectiveStats.topSpeed * 10} m/s)</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border shrink-0"
                    style={{ backgroundColor: 'rgba(0, 168, 255, 0.08)', borderColor: 'rgba(0, 168, 255, 0.35)' }}
                  >
                    <Navigation className="w-3.5 h-3.5" style={{ color: '#00a8ff' }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">COORDINATES</div>
                    <div className="text-xs font-mono font-bold text-slate-100">Sector 42 // Heliopause</div>
                  </div>
                </div>
              </div>

              {/* Primary Launch Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <button
                  onClick={() => {
                    audioSystem.playUIClick();
                    setActiveScreen('playing');
                  }}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-full font-mono font-bold text-xs tracking-wider uppercase transition-transform hover:scale-105 cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #0077ff 0%, #00a8ff 100%)',
                    color: '#ffffff',
                    boxShadow: '0 0 24px rgba(0, 140, 255, 0.5)'
                  }}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>LAUNCH FREE FLIGHT</span>
                </button>

                <button
                  onClick={() => {
                    const combatMission = MISSIONS_CATALOG.find((m) => m.id === 'mission_06_destroy_emperor');
                    if (combatMission) {
                      startMission(combatMission);
                    } else {
                      setActiveScreen('missions');
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-mono font-semibold text-xs tracking-wider uppercase border backdrop-blur-md transition-colors hover:bg-white/10 cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(7, 12, 24, 0.82)',
                    borderColor: 'rgba(0, 168, 255, 0.4)',
                    color: '#e2e8f0'
                  }}
                >
                  <Crosshair className="w-3.5 h-3.5" style={{ color: '#00a8ff' }} />
                  <span>COMBAT MISSION: DREADNOUGHT KRONOS</span>
                </button>
              </div>
            </div>

            {/* Bottom-Center Floating Navigation Dock & Scroll Prompt */}
            <div className="flex flex-col items-center gap-3 mt-6">
              <div
                className="flex items-center gap-1 p-1.5 rounded-full border backdrop-blur-xl shadow-2xl"
                style={{ backgroundColor: 'rgba(6, 10, 20, 0.92)', borderColor: 'rgba(148, 163, 184, 0.16)' }}
              >
                {[
                  { id: 'main_menu', label: 'DECK', icon: Activity },
                  { id: 'hangar', label: 'SPECS', icon: Sliders },
                  { id: 'missions', label: 'MISSIONS', icon: Globe },
                  { id: 'profile', label: 'SYSTEMS', icon: Layers },
                  { id: 'settings', label: 'CONTROL', icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        audioSystem.playUIClick();
                        if (item.id === 'main_menu') {
                          setActiveScreen('playing');
                        } else {
                          setActiveScreen(item.id);
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer"
                      style={{
                        backgroundColor: isActive ? '#0088ff' : 'transparent',
                        color: isActive ? '#ffffff' : '#8b9bb4',
                        boxShadow: isActive ? '0 0 16px rgba(0, 136, 255, 0.5)' : 'none'
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  audioSystem.playUIClick();
                  planetarySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center gap-1 text-[10px] font-mono tracking-[0.28em] text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <span>SCROLL TO PLANETARY LINK</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" style={{ color: '#00a8ff' }} />
              </button>
            </div>
          </section>

          {/* ================================================================ */}
          {/* STAGE 2: HELIOS SECTOR COMMAND NEXUS                             */}
          {/* ================================================================ */}
          <section
            ref={planetarySectionRef}
            className="relative min-h-screen px-6 md:px-16 py-12 border-t flex flex-col justify-between"
            style={{
              backgroundColor: 'rgba(3, 6, 12, 0.96)',
              borderColor: 'rgba(0, 168, 255, 0.15)'
            }}
          >
            {/* Top Section Header Row */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.24em] mb-1.5" style={{ color: '#00a8ff' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00a8ff' }} />
                  <span>ASTRAL TELEMETRY // ORBITAL SCANNER</span>
                </div>
                <h2 className="text-3xl md:text-4xl tracking-tight uppercase">
                  <span className="font-extrabold text-white">HELIOS SECTOR </span>
                  <span className="font-light" style={{ color: '#94a3b8' }}>COMMAND NEXUS</span>
                </h2>
              </div>

              {/* Right Telemetry Link Boxes */}
              <div className="flex items-center gap-3">
                <div
                  className="px-4 py-2 rounded-lg border font-mono"
                  style={{ backgroundColor: '#070b14', borderColor: 'rgba(148, 163, 184, 0.15)' }}
                >
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">LINK LATENCY</div>
                  <div className="text-xs font-bold" style={{ color: '#00a8ff' }}>1.28 SEC SECURE</div>
                </div>
                <div
                  className="px-4 py-2 rounded-lg border font-mono"
                  style={{ backgroundColor: '#070b14', borderColor: 'rgba(148, 163, 184, 0.15)' }}
                >
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">TELEMETRY STREAM</div>
                  <div className="text-xs font-bold" style={{ color: '#10b981' }}>ACTIVE FEED</div>
                </div>
              </div>
            </div>

            {/* 3-Column Planetary Mission Control Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto">
              {/* LEFT COLUMN: Diagnostics, Physical Constants & Expedition Sectors */}
              <div className="lg:col-span-4 space-y-4">
                {/* Card 1: Planetary Diagnostics */}
                <div
                  className="p-5 rounded-xl border space-y-3"
                  style={{ backgroundColor: '#060a12', borderColor: 'rgba(0, 168, 255, 0.18)' }}
                >
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-slate-300 border-b border-slate-800/80 pb-2.5">
                    <Activity className="w-3.5 h-3.5" style={{ color: '#00a8ff' }} />
                    <span>PLANETARY DIAGNOSTICS</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Target:</span>
                      <span className="text-white font-bold">{selectedSector.targetName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coordinates:</span>
                      <span style={{ color: '#00a8ff' }}>{selectedSector.coordinates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Elevation / Datum:</span>
                      <span className="text-slate-200">{selectedSector.elevation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Atmospheric Density:</span>
                      <span className="text-slate-200">{selectedSector.density}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">ATMOSPHERE GAS MIX</div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-300">Nitrogen (N₂)</span>
                        <span className="text-slate-400">{selectedSector.nitrogen}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${selectedSector.nitrogen}%`, backgroundColor: '#00a8ff' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-300">Oxygen (O₂)</span>
                        <span className="text-slate-400">{selectedSector.oxygen}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${selectedSector.oxygen}%`, backgroundColor: '#00a8ff' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-300">Argon & CO₂</span>
                        <span className="text-slate-400">{selectedSector.argon}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${selectedSector.argon * 4}%`, backgroundColor: '#38bdf8' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Core Physical Constants */}
                <div
                  className="p-5 rounded-xl border"
                  style={{ backgroundColor: '#060a12', borderColor: 'rgba(148, 163, 184, 0.14)' }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
                    CORE PHYSICAL CONSTANTS
                  </div>
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div>
                      <div className="text-[10px] text-slate-500">Mean Radius</div>
                      <div className="text-xs font-bold text-white mt-0.5">{selectedSector.radius}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Core Gravity</div>
                      <div className="text-xs font-bold text-white mt-0.5">{selectedSector.gravity}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Magnetic Field</div>
                      <div className="text-xs font-bold mt-0.5" style={{ color: '#00a8ff' }}>{selectedSector.magnetic}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Tilt Angle</div>
                      <div className="text-xs font-bold text-white mt-0.5">{selectedSector.tilt}</div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Expedition Sectors */}
                <div
                  className="p-5 rounded-xl border space-y-2.5"
                  style={{ backgroundColor: '#060a12', borderColor: 'rgba(148, 163, 184, 0.14)' }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    EXPEDITION SECTORS
                  </div>
                  {EXPEDITION_SECTORS.map((sec) => {
                    const isSelected = sec.id === selectedSectorId;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => {
                          audioSystem.playUIClick();
                          setSelectedSectorId(sec.id);
                          setTerminalLogs((prev) => [
                            ...prev.slice(-4),
                            `Vector locked: ${sec.label} (${sec.coordinates}). Telemetry synchronized.`
                          ]);
                        }}
                        className="w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? 'rgba(0, 136, 255, 0.1)' : '#090e19',
                          borderColor: isSelected ? '#00a8ff' : 'rgba(148, 163, 184, 0.12)'
                        }}
                      >
                        <div>
                          <div
                            className="text-[9px] font-mono uppercase tracking-widest"
                            style={{ color: isSelected ? '#00a8ff' : '#64748b' }}
                          >
                            {sec.region}
                          </div>
                          <div className="text-xs font-mono font-bold text-white mt-0.5">{sec.label}</div>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00a8ff', boxShadow: '0 0 8px #00a8ff' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CENTER COLUMN: Interactive High-Detail Planetary Globe Visualizer */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center py-6">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex items-center justify-center">
                  {/* Outer Atmospheric Cosmic Glow */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(0, 168, 255, 0.32) 0%, rgba(0, 88, 255, 0.12) 55%, transparent 75%)',
                      filter: 'blur(18px)'
                    }}
                  />
                  {/* Planet Sphere with Continents, Clouds & Fresnel Rim Shadow */}
                  <div
                    className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border"
                    style={{
                      borderColor: 'rgba(56, 189, 248, 0.45)',
                      background:
                        'radial-gradient(circle at 32% 28%, #1e4b6e 0%, #0d2842 42%, #051120 78%, #02060d 100%)',
                      boxShadow:
                        'inset -28px -24px 48px rgba(0, 0, 0, 0.92), inset 10px 10px 32px rgba(56, 189, 248, 0.42), 0 0 50px rgba(0, 140, 255, 0.28)'
                    }}
                  >
                    {/* Procedural Continental Landmass & Cloud Swirl SVG Overlay */}
                    <svg viewBox="0 0 200 200" className="w-full h-full opacity-75">
                      <defs>
                        <radialGradient id="cloudGlow" cx="35%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.55" />
                          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <path
                        d="M45,35 C68,28 95,42 112,32 C130,22 155,40 162,65 C168,90 142,115 125,132 C105,150 75,142 58,125 C40,108 22,55 45,35 Z"
                        fill="#1e3a2f"
                        opacity="0.65"
                      />
                      <path
                        d="M85,75 C110,68 138,82 148,105 C158,128 135,160 110,168 C85,175 62,155 68,130 C74,105 60,82 85,75 Z"
                        fill="#2d4a3e"
                        opacity="0.55"
                      />
                      <ellipse cx="95" cy="65" rx="72" ry="22" transform="rotate(-18 95 65)" fill="url(#cloudGlow)" />
                      <ellipse cx="105" cy="115" rx="64" ry="18" transform="rotate(14 105 115)" fill="url(#cloudGlow)" />
                      <ellipse cx="80" cy="145" rx="48" ry="12" transform="rotate(-8 80 145)" fill="url(#cloudGlow)" />
                    </svg>

                    {/* Active Target Reticle Pin on Globe */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border border-cyan-400/60 animate-ping absolute" />
                      <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff]" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    audioSystem.playUIClick();
                    simRef.current.position.set(...selectedSector.spawnPos);
                    simRef.current.quaternion.identity();
                    setActiveScreen('playing');
                    triggerToast(`DEPLOYED TO ${selectedSector.label}`, selectedSector.briefing, 'info');
                  }}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border transition-transform hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(0, 136, 255, 0.16)',
                    borderColor: '#00a8ff',
                    color: '#ffffff',
                    boxShadow: '0 0 20px rgba(0, 168, 255, 0.3)'
                  }}
                >
                  <Rocket className="w-3.5 h-3.5" style={{ color: '#00a8ff' }} />
                  <span>DEPLOY SHUTTLE TO {selectedSector.label}</span>
                </button>
              </div>

              {/* RIGHT COLUMN: Target Intercept Monitor, Terminal Log & Auxiliary Handshake */}
              <div className="lg:col-span-4 space-y-4">
                {/* Card 1: Target Intercept Monitor */}
                <div
                  className="p-5 rounded-xl border space-y-3.5"
                  style={{ backgroundColor: '#060a12', borderColor: 'rgba(0, 168, 255, 0.18)' }}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-slate-300">
                      <Compass className="w-3.5 h-3.5" style={{ color: '#00a8ff' }} />
                      <span>TARGET INTERCEPT MONITOR</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      LOCK_STABLE
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">BEACON TARGET:</span>
                      <span className="font-bold" style={{ color: '#00a8ff' }}>{selectedSector.targetName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">COORDINATES:</span>
                      <span className="text-white font-semibold">{selectedSector.coordinates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SIGNAL QUALITY:</span>
                      <span className="font-bold" style={{ color: '#10b981' }}>100% SECURE</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2.5">
                      SPECTROSCOPIC ANALYSIS
                    </div>
                    <button
                      onClick={() => {
                        audioSystem.playDiscovery();
                        setTerminalLogs((prev) => [
                          ...prev.slice(-4),
                          `Spectrometer scan complete on ${selectedSector.targetName}: N₂ ${selectedSector.nitrogen}%, O₂ ${selectedSector.oxygen}%, Mag ${selectedSector.magnetic}.`
                        ]);
                        triggerToast(
                          `SPECTROMETER SCAN: ${selectedSector.label}`,
                          `Atmospheric & geomagnetic telemetry verified for ${selectedSector.region}.`,
                          'success'
                        );
                      }}
                      className="w-full py-2.5 px-4 rounded-full font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                      style={{
                        background: 'linear-gradient(90deg, #0077ff 0%, #00a8ff 100%)',
                        color: '#ffffff',
                        boxShadow: '0 0 20px rgba(0, 140, 255, 0.4)'
                      }}
                    >
                      <Disc className="w-3.5 h-3.5" />
                      <span>ESTABLISH SPECTROMETER SCAN</span>
                    </button>
                  </div>
                </div>

                {/* Card 2: Terminal Dialogue Log */}
                <div
                  className="p-5 rounded-xl border flex flex-col justify-between h-48"
                  style={{ backgroundColor: '#060a12', borderColor: 'rgba(148, 163, 184, 0.14)' }}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest" style={{ color: '#00a8ff' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00a8ff' }} />
                      <span>TERMINAL DIALOGUE LOG</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">v2.04.88_OS</span>
                  </div>

                  <div className="my-auto space-y-1.5 overflow-y-auto font-mono text-[11px] text-slate-300 py-2">
                    {terminalLogs.map((logLine, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span style={{ color: '#00a8ff' }}>&gt; </span>
                        <span>{logLine}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 3: Auxiliary Handshake Parameters */}
                <div
                  className="p-5 rounded-xl border space-y-2.5"
                  style={{ backgroundColor: '#060a12', borderColor: 'rgba(148, 163, 184, 0.14)' }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    AUXILIARY HANDSHAKE PARAMETERS
                  </div>

                  <label className="flex items-center justify-between text-xs font-mono text-slate-300 cursor-pointer py-1">
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-slate-500" />
                      <span>Atmosphere Deflector Sync</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={auxDeflectorSync}
                      onChange={(e) => {
                        audioSystem.playUIClick();
                        setAuxDeflectorSync(e.target.checked);
                        setTerminalLogs((prev) => [
                          ...prev.slice(-4),
                          `Atmosphere Deflector Sync: ${e.target.checked ? 'ENABLED' : 'DISABLED'}.`
                        ]);
                      }}
                      className="w-3.5 h-3.5 accent-sky-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-mono text-slate-300 cursor-pointer py-1">
                    <span className="flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-slate-500" />
                      <span>Remote Recon Drone Uplink</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={auxDroneUplink}
                      onChange={(e) => {
                        audioSystem.playUIClick();
                        setAuxDroneUplink(e.target.checked);
                        setTerminalLogs((prev) => [
                          ...prev.slice(-4),
                          `Remote Recon Drone Uplink: ${e.target.checked ? 'ONLINE' : 'STANDBY'}.`
                        ]);
                      }}
                      className="w-3.5 h-3.5 accent-sky-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Target Vector Active Briefing Footer Bar */}
            <div
              className="mt-8 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4"
              style={{ backgroundColor: '#060a12', borderColor: 'rgba(0, 168, 255, 0.16)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center border shrink-0"
                  style={{ backgroundColor: 'rgba(0, 168, 255, 0.1)', borderColor: 'rgba(0, 168, 255, 0.3)' }}
                >
                  <Globe className="w-5 h-5" style={{ color: '#00a8ff' }} />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#00a8ff' }}>
                    TARGET VECTOR ACTIVE BRIEFING // {selectedSector.region}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">{selectedSector.briefing}</div>
                </div>
              </div>
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-slate-700 font-bold hidden xl:block">
                SECTOR LINK PROTOCOL
              </div>
            </div>
          </section>
        </div>
      )}

      {}
      {/* ==================================================================== */}
      {/* VIEW 2: ACTIVE FLIGHT HUD & COCKPIT OVERLAY                          */}
      {/* ==================================================================== */}
      {activeScreen === 'playing' && saveData.settings.hudVisible && (
        <div
          className={`relative z-20 pointer-events-none flex flex-col justify-between ${
            hudMode === 'full'
              ? isMobileLandscape
                ? 'h-[calc(100dvh-38px)] p-2'
                : 'h-[calc(100dvh-57px)] p-4 md:p-6'
              : isMobileLandscape
              ? 'h-screen p-2'
              : 'h-screen p-4 md:p-6'
          }`}
        >
          {/* Top HUD Row: Sector Telemetry, Active Mission & Camera / HUD / Fullscreen / Pause Controls */}
          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
            {/* Sector & Coordinates (Hidden in 'full_hide') */}
            <div
              className={`px-3 sm:px-4 py-2 rounded-xl border backdrop-blur-md pointer-events-auto mobile-landscape-shrink-tl ${
                hudMode === 'full_hide' ? 'hidden' : ''
              }`}
              style={{ backgroundColor: 'rgba(13, 20, 40, 0.78)', borderColor: 'rgba(73, 217, 255, 0.25)' }}
            >
              <div
                ref={(el) => (hudRefs.current.zoneBadge = el)}
                className="text-xs font-bold tracking-wider"
                style={{ color: '#49D9FF' }}
              >
                DEEP SPACE // HELIOS SECTOR
              </div>
              <div
                ref={(el) => (hudRefs.current.coordsValue = el)}
                className="text-[11px] font-mono mt-0.5"
                style={{ color: '#9AA8C7' }}
              >
                X:0 Y:8 Z:45
              </div>
            </div>

            {/* Active Mission Objective Panel (Hidden in 'full_hide') */}
            {activeMission && (
              <div
                className={`px-3.5 py-2.5 rounded-xl border backdrop-blur-md max-w-sm pointer-events-auto mobile-landscape-shrink-tc ${
                  hudMode === 'full_hide' ? 'hidden' : ''
                }`}
                style={{ backgroundColor: 'rgba(13, 20, 40, 0.88)', borderColor: '#7C5CFF' }}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#48E0A4' }}>
                    {activeMission.title}
                  </span>
                  <span
                    ref={(el) => (hudRefs.current.missionTimer = el)}
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(255, 180, 84, 0.15)', color: '#FFB454' }}
                  >
                    110s
                  </span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: '#9AA8C7' }}>{activeMission.briefing}</p>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span ref={(el) => (hudRefs.current.missionProgress = el)} style={{ color: '#49D9FF' }}>
                    0 / 5 COMPLETED
                  </span>
                  <button
                    onClick={() => {
                      simRef.current.mission = null;
                      simRef.current.RebuildMissionObjects?.(null);
                      setActiveMission(null);
                    }}
                    className="text-[11px] underline hover:text-white cursor-pointer"
                    style={{ color: '#FF5D73' }}
                  >
                    Abort
                  </button>
                </div>
              </div>
            )}

            {/* Heading Compass Tape (Azimuth Indicator 0°..359°, Hidden in 'full_hide') */}
            <div
              className={`flex-col items-center pointer-events-none mx-auto mobile-landscape-shrink-tc ${
                hudMode === 'full_hide' ? 'hidden' : 'hidden sm:flex'
              }`}
            >
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-t-lg border-t border-x backdrop-blur-md" style={{ backgroundColor: 'rgba(13, 20, 40, 0.85)', borderColor: 'rgba(73, 217, 255, 0.3)' }}>
                <span className="text-[10px] font-mono tracking-wider" style={{ color: '#49D9FF' }}>HDG</span>
                <span ref={(el) => (hudRefs.current.compassDegrees = el)} className="text-xs font-mono font-bold text-white">000°</span>
              </div>
              <div className="w-56 h-5 overflow-hidden border-b border-x relative backdrop-blur-sm" style={{ backgroundColor: 'rgba(5, 8, 22, 0.75)', borderColor: 'rgba(73, 217, 255, 0.3)' }}>
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 z-10" style={{ backgroundColor: '#ff4444' }} />
                <div ref={(el) => (hudRefs.current.compassScroller = el)} className="flex items-center h-full whitespace-nowrap text-[9px] font-mono select-none" style={{ color: '#49D9FF', willChange: 'transform' }}>
                  <span className="inline-block w-24 text-center">N (000)</span>
                  <span className="inline-block w-24 text-center">045</span>
                  <span className="inline-block w-24 text-center">E (090)</span>
                  <span className="inline-block w-24 text-center">135</span>
                  <span className="inline-block w-24 text-center">S (180)</span>
                  <span className="inline-block w-24 text-center">225</span>
                  <span className="inline-block w-24 text-center">W (270)</span>
                  <span className="inline-block w-24 text-center">315</span>
                  <span className="inline-block w-24 text-center">N (360)</span>
                  <span className="inline-block w-24 text-center">045</span>
                  <span className="inline-block w-24 text-center">E (090)</span>
                </div>
              </div>
            </div>

            {/* Top-Right Action Buttons (Pinned to Top-Right via ml-auto) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto ml-auto mobile-landscape-shrink-tr">
              {/* Camera Switcher (Hidden in 'full_hide') */}
              <button
                onClick={() => {
                  audioSystem.playUIClick();
                  const order = ['CHASE', 'COCKPIT', 'CINEMATIC', 'FREE_LOOK'];
                  setCameraMode((prev) => order[(order.indexOf(prev) + 1) % order.length]);
                }}
                className={`items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md cursor-pointer ${
                  hudMode === 'full_hide' ? 'hidden' : 'flex'
                }`}
                style={{ backgroundColor: 'rgba(13, 20, 40, 0.8)', borderColor: 'rgba(73, 217, 255, 0.3)' }}
                title="Cycle Camera Mode [C]"
              >
                <Eye className="w-3.5 h-3.5" style={{ color: '#49D9FF' }} />
                <span>CAM: {cameraMode}</span>
              </button>

              {/* 4-Stage HUD Visibility Mode Switcher */}
              <button
                onClick={cycleHudMode}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md cursor-pointer transition-colors"
                style={{
                  backgroundColor: hudMode === 'full_hide' ? 'rgba(13, 20, 40, 0.65)' : 'rgba(13, 20, 40, 0.8)',
                  borderColor: hudMode === 'full' ? 'rgba(73, 217, 255, 0.3)' : 'rgba(72, 224, 164, 0.45)',
                  color: hudMode === 'full' ? '#F4F7FF' : '#48E0A4'
                }}
                title="Cycle HUD Visibility Mode (Full -> Hide Stats/Header -> Hide Map -> Full Hide) [H / Tab]"
              >
                {hudMode === 'full_hide' ? (
                  <EyeOff className="w-4 h-4" style={{ color: '#9AA8C7' }} />
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5" style={{ color: '#48E0A4' }} />
                    <span className="text-[10px] font-mono">
                      {hudMode === 'full'
                        ? 'HUD: FULL'
                        : hudMode === 'no_stats'
                        ? 'HUD: MIN'
                        : 'HUD: NO MAP'}
                    </span>
                  </>
                )}
              </button>

              {/* Fullscreen Toggle Button (Hidden in 'full_hide') */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-xl border backdrop-blur-md cursor-pointer ${
                  hudMode === 'full_hide' ? 'hidden' : 'flex'
                }`}
                style={{ backgroundColor: 'rgba(13, 20, 40, 0.8)', borderColor: 'rgba(73, 217, 255, 0.3)' }}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" style={{ color: '#49D9FF' }} />
                ) : (
                  <Maximize2 className="w-4 h-4" style={{ color: '#49D9FF' }} />
                )}
              </button>

              {/* Help / Controls Toggle Button (?) - Always visible in all 4 modes */}
              <button
                onClick={() => {
                  audioSystem.playUIClick();
                  setShowTutorial((t) => !t);
                }}
                className="p-2 rounded-xl border backdrop-blur-md cursor-pointer"
                style={{
                  backgroundColor: showTutorial && hudMode === 'full_hide' ? 'rgba(73, 217, 255, 0.2)' : 'rgba(13, 20, 40, 0.8)',
                  borderColor: 'rgba(154, 168, 199, 0.25)'
                }}
                title="Toggle Flight Controls Guide"
              >
                <HelpCircle className="w-4 h-4" style={{ color: '#9AA8C7' }} />
              </button>

              {/* Pause Button - Always visible in all 4 modes */}
              <button
                onClick={() => {
                  audioSystem.playUIClick();
                  setIsPaused((p) => !p);
                }}
                className="p-2 rounded-xl border backdrop-blur-md cursor-pointer"
                style={{ backgroundColor: 'rgba(13, 20, 40, 0.8)', borderColor: 'rgba(154, 168, 199, 0.25)' }}
                title="Pause Game [Esc]"
              >
                <Pause className="w-4 h-4" style={{ color: '#F4F7FF' }} />
              </button>
            </div>
          </div>

          {/* Center Crosshair, Flight Brackets & Cockpit Frame (Hidden in 'full_hide') */}
          <div
            className={`relative items-center justify-center my-auto mobile-landscape-shrink-center ${
              hudMode === 'full_hide' ? 'hidden' : 'flex'
            }`}
          >
            {/* Lateral Curved Sci-Fi Flight Brackets */}
            <div className="absolute left-2 sm:left-12 md:left-24 top-1/2 -translate-y-1/2 pointer-events-none opacity-45 flex items-center">
              <svg width="36" height="200" viewBox="0 0 36 200" fill="none">
                <path d="M30 10 C10 60 10 140 30 190" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 50 L8 50" stroke="#00f0ff" strokeWidth="1.5" />
                <path d="M14 100 L3 100" stroke="#00f0ff" strokeWidth="2.5" />
                <path d="M18 150 L8 150" stroke="#00f0ff" strokeWidth="1.5" />
                <text x="2" y="103" fill="#00f0ff" fontSize="8" fontFamily="monospace">00</text>
              </svg>
            </div>
            <div className="absolute right-2 sm:right-12 md:right-24 top-1/2 -translate-y-1/2 pointer-events-none opacity-45 flex items-center">
              <svg width="36" height="200" viewBox="0 0 36 200" fill="none">
                <path d="M6 10 C26 60 26 140 6 190" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 50 L28 50" stroke="#00f0ff" strokeWidth="1.5" />
                <path d="M22 100 L33 100" stroke="#00f0ff" strokeWidth="2.5" />
                <path d="M18 150 L28 150" stroke="#00f0ff" strokeWidth="1.5" />
                <text x="17" y="103" fill="#00f0ff" fontSize="8" fontFamily="monospace">ALT</text>
              </svg>
            </div>

            <div className="w-16 h-16 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(73, 217, 255, 0.28)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#49D9FF' }} />
            </div>
            {cameraMode === 'COCKPIT' && (
              <div
                className="w-72 h-44 rounded-3xl border-x-2 border-t border-b pointer-events-none absolute"
                style={{ borderColor: 'rgba(73, 217, 255, 0.22)' }}
              />
            )}

            {/* Proximity Planetary Scanner Prompt */}
            <div
              ref={(el) => (hudRefs.current.scanPrompt = el)}
              className="absolute top-20 px-4 py-2.5 rounded-xl border backdrop-blur-md text-center transition-opacity duration-200"
              style={{
                backgroundColor: 'rgba(13, 20, 40, 0.9)',
                borderColor: '#48E0A4',
                opacity: 0
              }}
            >
              <div className="text-xs font-bold tracking-wider mb-1" style={{ color: '#48E0A4' }}>
                CELESTIAL OBJECT IN SENSOR RANGE — SCANNING [HOLD F]
              </div>
              <div className="w-48 h-2 rounded-full overflow-hidden mx-auto" style={{ backgroundColor: '#151F36' }}>
                <div
                  ref={(el) => (hudRefs.current.scanProgressBar = el)}
                  className="h-full transition-all"
                  style={{ width: '0%', backgroundColor: '#48E0A4' }}
                />
              </div>
            </div>
          </div>

          {/* Bottom HUD Row: Flight Gauges, 3D Radar & Adaptive Touch Controls */}
          <div
            className={`flex items-end justify-between ${
              isMobileLandscape ? 'flex-nowrap gap-1.5' : 'flex-wrap gap-4'
            }`}
          >
            {/* Left: Speedometer, Boost, Shield & Weapons (Hidden in 'no_stats', 'no_stats_map', and 'full_hide') */}
            <div
              className={`p-4 rounded-2xl border backdrop-blur-md w-full sm:w-80 space-y-3 pointer-events-auto mobile-landscape-shrink-bl ${
                hudMode !== 'full' ? 'hidden' : ''
              }`}
              style={{ backgroundColor: 'rgba(13, 20, 40, 0.84)', borderColor: 'rgba(73, 217, 255, 0.25)' }}
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider block" style={{ color: '#9AA8C7' }}>VELOCITY</span>
                  <div className="flex items-baseline gap-1">
                    <span ref={(el) => (hudRefs.current.speedValue = el)} className="text-2xl font-extrabold font-mono" style={{ color: '#49D9FF' }}>
                      350
                    </span>
                    <span className="text-xs font-mono" style={{ color: '#9AA8C7' }}>m/s</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider block" style={{ color: '#9AA8C7' }}>THROTTLE</span>
                  <span ref={(el) => (hudRefs.current.throttleValue = el)} className="text-sm font-bold font-mono" style={{ color: '#F4F7FF' }}>
                    35%
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#151F36' }}>
                <div ref={(el) => (hudRefs.current.speedBar = el)} className="h-full" style={{ width: '35%', backgroundColor: '#49D9FF' }} />
              </div>

              {/* Boost Bar */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="flex items-center gap-1" style={{ color: '#FFB454' }}>
                    <Zap className="w-3 h-3" /> WARP CAPACITOR [SHIFT]
                  </span>
                  <span ref={(el) => (hudRefs.current.boostValue = el)} className="font-mono">100%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#151F36' }}>
                  <div ref={(el) => (hudRefs.current.boostBar = el)} className="h-full" style={{ width: '100%', backgroundColor: '#FFB454' }} />
                </div>
              </div>

              {/* Shield Bar */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="flex items-center gap-1" style={{ color: '#48E0A4' }}>
                    <Shield className="w-3 h-3" /> DEFLECTOR SHIELD
                  </span>
                  <span ref={(el) => (hudRefs.current.shieldValue = el)} className="font-mono">120 / 120</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#151F36' }}>
                  <div ref={(el) => (hudRefs.current.shieldBar = el)} className="h-full" style={{ width: '100%', backgroundColor: '#48E0A4' }} />
                </div>
              </div>

              {/* Combat Weapon Selector Bar (Slots 1 - 3) */}
              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5" style={{ color: '#9AA8C7' }}>
                  <span className="flex items-center gap-1 font-bold text-white"><Crosshair className="w-3 h-3 text-cyan-400" /> WEAPONS [1 - 3]</span>
                  <span className="text-cyan-400">LMB / RMB FIRE</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    ref={(el) => (hudRefs.current.weaponSlot1 = el)}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      audioSystem.playUIClick();
                      simRef.current.activeWeapon = 1;
                      simRef.current.fireWeapon?.(false);
                    }}
                    className="px-2 py-1.5 rounded-lg border text-left transition-colors cursor-pointer"
                    style={{ backgroundColor: 'rgba(0, 240, 255, 0.22)', borderColor: '#00f0ff' }}
                    title="Slot 1: Rapid-fire Twin Autocannon"
                  >
                    <div className="text-[10px] font-bold font-mono text-cyan-300">[1] CANNON</div>
                    <div className="text-[8px] font-mono text-slate-400">26x2 DMG</div>
                  </button>
                  <button
                    ref={(el) => (hudRefs.current.weaponSlot2 = el)}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      audioSystem.playUIClick();
                      simRef.current.activeWeapon = 2;
                      simRef.current.fireWeapon?.(false);
                    }}
                    className="px-2 py-1.5 rounded-lg border text-left transition-colors cursor-pointer"
                    style={{ backgroundColor: 'rgba(13, 20, 40, 0.75)', borderColor: 'rgba(154, 168, 199, 0.25)' }}
                    title="Slot 2: Dual Plasma Pulse"
                  >
                    <div className="text-[10px] font-bold font-mono text-teal-300">[2] PLASMA</div>
                    <div className="text-[8px] font-mono text-slate-400">42x2 DMG</div>
                  </button>
                  <button
                    ref={(el) => (hudRefs.current.weaponSlot3 = el)}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      audioSystem.playUIClick();
                      simRef.current.activeWeapon = 3;
                      simRef.current.fireWeapon?.(true);
                    }}
                    className="px-2 py-1.5 rounded-lg border text-left transition-colors cursor-pointer"
                    style={{ backgroundColor: 'rgba(13, 20, 40, 0.75)', borderColor: 'rgba(154, 168, 199, 0.25)' }}
                    title="Slot 3: Quantum Energy Torpedo"
                  >
                    <div className="text-[10px] font-bold font-mono text-purple-300">[3] TORP</div>
                    <div className="text-[8px] font-mono text-slate-400">135 DMG</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Center: Interactive Tutorial & Analog / Movement Flight Pad (Full size on Mobile Landscape!) */}
            <div className="flex flex-col items-center gap-2 pointer-events-auto mx-auto shrink-0">
              {showTutorial && (
                <div
                  className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 px-3.5 py-2 rounded-xl border backdrop-blur-md text-[11px] sm:text-xs max-w-xl"
                  style={{ backgroundColor: 'rgba(13, 20, 40, 0.86)', borderColor: 'rgba(154,168,199,0.2)', color: '#9AA8C7' }}
                >
                  <span><strong className="text-white">W/S</strong> Pitch</span>
                  <span><strong className="text-white">A/D</strong> Yaw</span>
                  <span><strong className="text-white">Q/E</strong> Roll</span>
                  <span><strong className="text-white">SHIFT</strong> Boost</span>
                  <span><strong className="text-white">CTRL</strong> Brake</span>
                  <span><strong className="text-white">SPACE / LMB</strong> Fire</span>
                  <span><strong className="text-white">G / RMB</strong> Torpedo</span>
                  <span><strong className="text-white">1-3</strong> Weapons</span>
                  <span><strong className="text-white">H</strong> HUD Mode</span>
                </div>
              )}

              {/* Touch / On-Screen Flight Controls (Kept at 100% size on Mobile Landscape; hidden only in 'full_hide') */}
              <div className={`items-center gap-2 ${hudMode === 'full_hide' ? 'hidden' : 'flex'}`}>
                <div className="grid grid-cols-3 gap-1 p-1.5 rounded-xl border backdrop-blur-md" style={{ backgroundColor: 'rgba(13,20,40,0.82)', borderColor: 'rgba(73,217,255,0.25)' }}>
                  <button
                    onPointerDown={() => (simRef.current.touchInput.roll = 1)}
                    onPointerUp={() => (simRef.current.touchInput.roll = 0)}
                    onPointerLeave={() => (simRef.current.touchInput.roll = 0)}
                    className="w-11 h-11 rounded-lg text-[10px] font-bold border"
                    style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.2)' }}
                  >
                    ROLL L
                  </button>
                  <button
                    onPointerDown={() => (simRef.current.touchInput.pitch = -1)}
                    onPointerUp={() => (simRef.current.touchInput.pitch = 0)}
                    onPointerLeave={() => (simRef.current.touchInput.pitch = 0)}
                    className="w-11 h-11 rounded-lg text-[10px] font-bold border"
                    style={{ backgroundColor: '#151F36', borderColor: '#49D9FF' }}
                  >
                    PITCH ▲
                  </button>
                  <button
                    onPointerDown={() => (simRef.current.touchInput.roll = -1)}
                    onPointerUp={() => (simRef.current.touchInput.roll = 0)}
                    onPointerLeave={() => (simRef.current.touchInput.roll = 0)}
                    className="w-11 h-11 rounded-lg text-[10px] font-bold border"
                    style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.2)' }}
                  >
                    ROLL R
                  </button>
                  <button
                    onPointerDown={() => (simRef.current.touchInput.yaw = -1)}
                    onPointerUp={() => (simRef.current.touchInput.yaw = 0)}
                    onPointerLeave={() => (simRef.current.touchInput.yaw = 0)}
                    className="w-11 h-11 rounded-lg text-[10px] font-bold border"
                    style={{ backgroundColor: '#151F36', borderColor: '#49D9FF' }}
                  >
                    ◀ YAW
                  </button>
                  <button
                    onPointerDown={() => (simRef.current.touchInput.pitch = 1)}
                    onPointerUp={() => (simRef.current.touchInput.pitch = 0)}
                    onPointerLeave={() => (simRef.current.touchInput.pitch = 0)}
                    className="w-11 h-11 rounded-lg text-[10px] font-bold border"
                    style={{ backgroundColor: '#151F36', borderColor: '#49D9FF' }}
                  >
                    PITCH ▼
                  </button>
                  <button
                    onPointerDown={() => (simRef.current.touchInput.yaw = 1)}
                    onPointerUp={() => (simRef.current.touchInput.yaw = 0)}
                    onPointerLeave={() => (simRef.current.touchInput.yaw = 0)}
                    className="w-11 h-11 rounded-lg text-[10px] font-bold border"
                    style={{ backgroundColor: '#151F36', borderColor: '#49D9FF' }}
                  >
                    YAW ▶
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onPointerDown={(e) => {
                        e.currentTarget.blur();
                        simRef.current.touchInput.fire = true;
                        simRef.current.fireWeapon?.(false);
                      }}
                      onPointerUp={() => (simRef.current.touchInput.fire = false)}
                      onPointerLeave={() => (simRef.current.touchInput.fire = false)}
                      className="px-2.5 h-8 rounded-lg font-bold text-[9px] border tracking-wider flex-1 cursor-pointer"
                      style={{ backgroundColor: 'rgba(255, 68, 68, 0.25)', borderColor: '#ff4444', color: '#ff8888' }}
                    >
                      FIRE [LMB]
                    </button>
                    <button
                      onPointerDown={(e) => {
                        e.currentTarget.blur();
                        simRef.current.touchInput.secondary = true;
                        simRef.current.fireWeapon?.(true);
                      }}
                      onPointerUp={() => (simRef.current.touchInput.secondary = false)}
                      onPointerLeave={() => (simRef.current.touchInput.secondary = false)}
                      className="px-2.5 h-8 rounded-lg font-bold text-[9px] border tracking-wider flex-1 cursor-pointer"
                      style={{ backgroundColor: 'rgba(168, 85, 247, 0.25)', borderColor: '#a855f7', color: '#d8b4fe' }}
                    >
                      TORP [RMB]
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onPointerDown={() => (simRef.current.touchInput.boost = true)}
                      onPointerUp={() => (simRef.current.touchInput.boost = false)}
                      onPointerLeave={() => (simRef.current.touchInput.boost = false)}
                      className="px-2 h-7 rounded-lg font-bold text-[9px] border flex-1"
                      style={{ backgroundColor: 'rgba(255, 180, 84, 0.2)', borderColor: '#FFB454', color: '#FFB454' }}
                    >
                      BOOST
                    </button>
                    <button
                      onPointerDown={() => (simRef.current.touchInput.brake = true)}
                      onPointerUp={() => (simRef.current.touchInput.brake = false)}
                      onPointerLeave={() => (simRef.current.touchInput.brake = false)}
                      className="px-2 h-7 rounded-lg font-bold text-[9px] border flex-1"
                      style={{ backgroundColor: 'rgba(255, 93, 115, 0.2)', borderColor: '#FF5D73', color: '#FF5D73' }}
                    >
                      BRAKE
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 3D Tactical Spatial Radar (Hidden in 'no_stats_map' and 'full_hide') */}
            <div
              className={`p-3 rounded-2xl border backdrop-blur-md flex-col items-center pointer-events-auto mobile-landscape-shrink-br ${
                hudMode === 'no_stats_map' || hudMode === 'full_hide' ? 'hidden' : 'flex'
              }`}
              style={{ backgroundColor: 'rgba(13, 20, 40, 0.84)', borderColor: 'rgba(73, 217, 255, 0.25)' }}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#49D9FF' }}>
                <Navigation className="w-3 h-3" /> TACTICAL RADAR (850M)
              </div>
              <canvas
                ref={radarCanvasRef}
                width={136}
                height={136}
                className="rounded-full border"
                style={{ backgroundColor: '#050816', borderColor: 'rgba(73, 217, 255, 0.35)' }}
              />
            </div>
          </div>
        </div>
      )}

      {}
      {/* ==================================================================== */}
      {/* VIEW 3: MISSIONS & CHALLENGES SCREEN                                 */}
      {/* ==================================================================== */}
      {activeScreen === 'missions' && (
        <div className="relative z-20 h-[calc(100vh-57px)] overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">MISSION COMMAND & CHALLENGES</h2>
                <p className="text-sm" style={{ color: '#9AA8C7' }}>
                  Select an orbital contract to deploy waypoints, timed checkpoints, or planetary reconnaissance targets.
                </p>
              </div>
              <button
                onClick={() => setActiveScreen('playing')}
                className="px-4 py-2 rounded-xl text-xs font-bold border"
                style={{ backgroundColor: '#151F36', borderColor: '#49D9FF', color: '#49D9FF' }}
              >
                RETURN TO COCKPIT
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MISSIONS_CATALOG.map((m) => {
                const mState = saveData.missions[m.id] || { status: 'available', attempts: 0, bestTime: null };
                const isCompleted = mState.status === 'completed';
                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl border backdrop-blur-md flex flex-col justify-between"
                    style={{
                      backgroundColor: 'rgba(13, 20, 40, 0.9)',
                      borderColor: isCompleted ? '#48E0A4' : 'rgba(73, 217, 255, 0.25)'
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: isCompleted ? 'rgba(72,224,164,0.16)' : 'rgba(73,217,255,0.15)',
                            color: isCompleted ? '#48E0A4' : '#49D9FF'
                          }}
                        >
                          {isCompleted ? 'COMPLETED' : m.difficulty.toUpperCase()}
                        </span>
                        <span className="text-xs font-mono" style={{ color: '#9AA8C7' }}>
                          TIME LIMIT: {m.timeLimit}s
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1.5">{m.title}</h3>
                      <p className="text-xs leading-relaxed mb-4" style={{ color: '#9AA8C7' }}>
                        {m.briefing}
                      </p>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between gap-3" style={{ borderColor: 'rgba(154,168,199,0.15)' }}>
                      <div className="text-xs font-mono">
                        <span style={{ color: '#48E0A4' }}>+{m.rewardCredits} CR</span>
                        <span className="mx-1.5" style={{ color: '#9AA8C7' }}>•</span>
                        <span style={{ color: '#7C5CFF' }}>+{m.rewardXP} XP</span>
                        {mState.bestTime !== null && (
                          <div className="text-[10px]" style={{ color: '#9AA8C7' }}>
                            BEST TIME: {mState.bestTime}s ({mState.attempts} runs)
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => startMission(m)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-transform hover:scale-105"
                        style={{ backgroundColor: '#49D9FF', color: '#050816' }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? 'REPLAY MISSION' : 'START MISSION'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {}
      {/* ==================================================================== */}
      {/* VIEW 4: ORBITAL HANGAR & SHIP UPGRADES                               */}
      {/* ==================================================================== */}
      {activeScreen === 'hangar' && (
        <div className="relative z-20 h-[calc(100vh-57px)] overflow-y-auto p-6 md:p-10 pointer-events-none">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Ship Catalog Selection */}
            <div className="lg:col-span-5 space-y-3 pointer-events-auto">
              <div className="p-4 rounded-2xl border backdrop-blur-md" style={{ backgroundColor: 'rgba(13, 20, 40, 0.9)', borderColor: 'rgba(73, 217, 255, 0.25)' }}>
                <h2 className="text-xl font-bold mb-1">ORBITAL HANGAR BAY</h2>
                <p className="text-xs" style={{ color: '#9AA8C7' }}>
                  Commission new spacecraft or upgrade thruster, gyro, capacitor, and shield subsystems.
                </p>
              </div>

              {SHIPS_CATALOG.map((ship) => {
                const sState = saveData.ships[ship.id];
                const isSelected = saveData.selectedShipId === ship.id;
                const isUnlocked = sState?.unlocked;
                return (
                  <div
                    key={ship.id}
                    className="p-4 rounded-2xl border backdrop-blur-md transition-all"
                    style={{
                      backgroundColor: isSelected ? 'rgba(21, 31, 54, 0.94)' : 'rgba(13, 20, 40, 0.86)',
                      borderColor: isSelected ? ship.accentHex : 'rgba(154, 168, 199, 0.2)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base font-bold">{ship.name}</span>
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(73,217,255,0.12)', color: ship.accentHex }}
                      >
                        {ship.role}
                      </span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: '#9AA8C7' }}>{ship.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono" style={{ color: isUnlocked ? '#48E0A4' : '#FFB454' }}>
                        {isUnlocked ? (isSelected ? '● ACTIVE VESSEL' : 'UNLOCKED') : `COST: ${ship.unlockCost} CR`}
                      </span>
                      <button
                        onClick={() => handleSelectOrUnlockShip(ship)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold transition-transform hover:scale-105"
                        style={{
                          backgroundColor: isSelected ? '#48E0A4' : '#49D9FF',
                          color: '#050816'
                        }}
                      >
                        {isUnlocked ? (isSelected ? 'SELECTED' : 'SELECT SHIP') : `UNLOCK (${ship.unlockCost} CR)`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Center Spacer for Live 3D Ship Preview */}
            <div className="hidden lg:block lg:col-span-2" />

            {/* Right Column: Active Ship Telemetry & Component Upgrades */}
            <div
              className="lg:col-span-5 p-5 rounded-2xl border backdrop-blur-md pointer-events-auto space-y-4"
              style={{ backgroundColor: 'rgba(13, 20, 40, 0.9)', borderColor: 'rgba(73, 217, 255, 0.3)' }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'rgba(154,168,199,0.15)' }}>
                <div>
                  <div className="text-xs font-mono" style={{ color: '#49D9FF' }}>ENGINEERING WORKBENCH</div>
                  <h3 className="text-lg font-bold">{currentShipSpec.name} Subsystems</h3>
                </div>
                <button
                  onClick={() => setActiveScreen('playing')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold"
                  style={{ backgroundColor: '#49D9FF', color: '#050816' }}
                >
                  LAUNCH SHIP
                </button>
              </div>

              {[
                { key: 'speed', label: 'Ion Thruster Drive', desc: 'Boosts top speed & acceleration', val: `${effectiveStats.topSpeed * 10} m/s` },
                { key: 'handling', label: 'Gyro Attitude Thrusters', desc: 'Improves pitch, yaw & roll response', val: `${effectiveStats.handling} rad/s` },
                { key: 'boost', label: 'Warp Plasma Capacitor', desc: 'Expands boost duration & recharge', val: `${effectiveStats.boostCapacity} MJ` },
                { key: 'shield', label: 'Deflector Shield Matrix', desc: 'Increases collision shield absorption', val: `${effectiveStats.shield} HP` },
              ].map((sys) => {
                const lvl = currentShipState.upgradeLevels?.[sys.key] || 1;
                const cost = lvl * 260;
                return (
                  <div key={sys.key} className="p-3.5 rounded-xl border" style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.16)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <div className="text-xs font-bold">{sys.label}</div>
                        <div className="text-[11px]" style={{ color: '#9AA8C7' }}>{sys.desc}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold" style={{ color: '#49D9FF' }}>{sys.val}</div>
                        <div className="text-[10px]" style={{ color: '#48E0A4' }}>LVL {lvl} / 5</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-2.5">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div
                            key={step}
                            className="h-2 flex-1 rounded-full"
                            style={{ backgroundColor: step <= lvl ? '#49D9FF' : '#050816' }}
                          />
                        ))}
                      </div>
                      <button
                        disabled={lvl >= 5}
                        onClick={() => handleUpgradeShipSystem(currentShipSpec.id, sys.key)}
                        className="px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-40"
                        style={{ backgroundColor: lvl >= 5 ? '#0D1428' : '#7C5CFF', color: '#F4F7FF' }}
                      >
                        {lvl >= 5 ? 'MAXED' : `UPGRADE (${cost} CR)`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {}
      {/* ==================================================================== */}
      {/* VIEW 5: PILOT PROFILE, PLANETARY CODEX & ACHIEVEMENTS                */}
      {/* ==================================================================== */}
      {activeScreen === 'profile' && (
        <div className="relative z-20 h-[calc(100vh-57px)] overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Pilot Dossier Header */}
            <div
              className="p-6 rounded-2xl border backdrop-blur-md flex flex-wrap items-center justify-between gap-4"
              style={{ backgroundColor: 'rgba(13, 20, 40, 0.92)', borderColor: 'rgba(73, 217, 255, 0.3)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border text-2xl font-extrabold"
                  style={{ backgroundColor: '#151F36', borderColor: '#49D9FF', color: '#49D9FF' }}
                >
                  L{saveData.pilotProfile.level}
                </div>
                <div>
                  <div className="text-xs font-mono" style={{ color: '#9AA8C7' }}>PILOT SERVICE RECORD // {saveData.pilotProfile.id}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      type="text"
                      value={saveData.pilotProfile.callsign}
                      maxLength={14}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        updateSaveData((prev) => ({
                          ...prev,
                          pilotProfile: { ...prev.pilotProfile, callsign: val }
                        }));
                      }}
                      className="text-xl font-bold px-2.5 py-0.5 rounded-lg border bg-transparent focus:outline-none"
                      style={{ borderColor: 'rgba(73,217,255,0.35)', color: '#F4F7FF' }}
                    />
                    <span className="text-xs" style={{ color: '#9AA8C7' }}>(Editable Callsign)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border" style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.15)' }}>
                  <div className="text-[10px]" style={{ color: '#9AA8C7' }}>EXPERIENCE</div>
                  <div className="text-sm font-bold font-mono" style={{ color: '#49D9FF' }}>{saveData.pilotProfile.experience} XP</div>
                </div>
                <div className="p-3 rounded-xl border" style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.15)' }}>
                  <div className="text-[10px]" style={{ color: '#9AA8C7' }}>FLIGHT DISTANCE</div>
                  <div className="text-sm font-bold font-mono" style={{ color: '#48E0A4' }}>
                    {(saveData.exploration.totalFlightDistance / 1000).toFixed(2)} km
                  </div>
                </div>
                <div className="p-3 rounded-xl border" style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.15)' }}>
                  <div className="text-[10px]" style={{ color: '#9AA8C7' }}>FLIGHT TIME</div>
                  <div className="text-sm font-bold font-mono" style={{ color: '#FFB454' }}>
                    {Math.floor(saveData.exploration.totalFlightTime / 60)}m {saveData.exploration.totalFlightTime % 60}s
                  </div>
                </div>
                <div className="p-3 rounded-xl border" style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.15)' }}>
                  <div className="text-[10px]" style={{ color: '#9AA8C7' }}>MISSIONS WON</div>
                  <div className="text-sm font-bold font-mono" style={{ color: '#7C5CFF' }}>
                    {Object.values(saveData.missions).filter((m) => m.status === 'completed').length} / {MISSIONS_CATALOG.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements & Commendations */}
            <div
              className="p-6 rounded-2xl border backdrop-blur-md"
              style={{ backgroundColor: 'rgba(13, 20, 40, 0.92)', borderColor: 'rgba(154, 168, 199, 0.2)' }}
            >
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" style={{ color: '#FFB454' }} />
                <span>PILOT ACHIEVEMENTS & COMMENDATIONS</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ACHIEVEMENTS_CATALOG.map((ach) => {
                  const unlocked = isAchievementUnlocked(ach.id);
                  const claimed = saveData.claimedAchievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className="p-4 rounded-xl border flex flex-col justify-between"
                      style={{
                        backgroundColor: '#151F36',
                        borderColor: claimed ? '#48E0A4' : unlocked ? '#FFB454' : 'rgba(154,168,199,0.15)'
                      }}
                    >
                      <div>
                        <div className="text-sm font-bold mb-1">{ach.title}</div>
                        <div className="text-xs mb-3" style={{ color: '#9AA8C7' }}>{ach.desc}</div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(154,168,199,0.1)' }}>
                        <span className="text-xs font-mono" style={{ color: '#48E0A4' }}>+{ach.reward} CR</span>
                        {claimed ? (
                          <span className="text-xs font-mono font-bold" style={{ color: '#48E0A4' }}>✓ CLAIMED</span>
                        ) : unlocked ? (
                          <button
                            onClick={() => claimAchievement(ach)}
                            className="px-3 py-1 rounded-lg text-xs font-bold"
                            style={{ backgroundColor: '#FFB454', color: '#050816' }}
                          >
                            CLAIM REWARD
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono" style={{ color: '#9AA8C7' }}>LOCKED</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discovered Sectors Codex */}
            <div
              className="p-6 rounded-2xl border backdrop-blur-md"
              style={{ backgroundColor: 'rgba(13, 20, 40, 0.92)', borderColor: 'rgba(154, 168, 199, 0.2)' }}
            >
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5" style={{ color: '#49D9FF' }} />
                <span>HELIOS SYSTEM EXPLORATION CODEX</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {WORLD_OBJECTS.map((obj) => {
                  const discovered = saveData.exploration.discoveredObjectIds.includes(obj.id);
                  return (
                    <div
                      key={obj.id}
                      className="p-3.5 rounded-xl border"
                      style={{
                        backgroundColor: '#151F36',
                        borderColor: discovered ? '#49D9FF' : 'rgba(154,168,199,0.15)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{obj.name}</span>
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: discovered ? 'rgba(72,224,164,0.15)' : 'rgba(154,168,199,0.12)',
                            color: discovered ? '#48E0A4' : '#9AA8C7'
                          }}
                        >
                          {discovered ? 'SCANNED' : 'UNMAPPED'}
                        </span>
                      </div>
                      <p className="text-[11px]" style={{ color: '#9AA8C7' }}>
                        {discovered ? obj.description : 'Approach within orbital scanner range in Free Flight to record telemetry.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {/* ==================================================================== */}
      {/* VIEW 6: SETTINGS & CONTROL CONFIGURATION                             */}
      {/* ==================================================================== */}
      {activeScreen === 'settings' && (
        <div className="relative z-20 h-[calc(100vh-57px)] overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <div
              className="p-6 rounded-2xl border backdrop-blur-md space-y-6"
              style={{ backgroundColor: 'rgba(13, 20, 40, 0.94)', borderColor: 'rgba(73, 217, 255, 0.3)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'rgba(154,168,199,0.15)' }}>
                <div>
                  <h2 className="text-2xl font-bold">SYSTEM & FLIGHT SETTINGS</h2>
                  <p className="text-xs" style={{ color: '#9AA8C7' }}>
                    Configure WebGL graphics quality, audio synthesizers, flight sensitivity, and custom keybindings.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      audioSystem.playUIClick();
                      updateSaveData((prev) => ({ ...prev, settings: structuredClone(DEFAULT_SAVE_DATA.settings) }));
                      triggerToast('SETTINGS RESTORED', 'Default graphics, audio, and controls applied.', 'info');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border"
                    style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.25)' }}
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={() => setConfirmResetOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border"
                    style={{ backgroundColor: 'rgba(255, 93, 115, 0.15)', borderColor: '#FF5D73', color: '#FF5D73' }}
                  >
                    Wipe Save Data
                  </button>
                </div>
              </div>

              {/* Graphics & Camera Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#49D9FF' }}>
                    GRAPHICS & CAMERA
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-xs">Graphics Quality Preset</span>
                    <div className="flex gap-1">
                      {['Low', 'Medium', 'High'].map((q) => (
                        <button
                          key={q}
                          onClick={() =>
                            updateSaveData((prev) => ({
                              ...prev,
                              settings: { ...prev.settings, graphicsQuality: q, particleDensity: q }
                            }))
                          }
                          className="px-3 py-1 rounded-lg text-xs font-semibold border"
                          style={{
                            backgroundColor: saveData.settings.graphicsQuality === q ? '#49D9FF' : '#151F36',
                            color: saveData.settings.graphicsQuality === q ? '#050816' : '#F4F7FF',
                            borderColor: 'rgba(154,168,199,0.2)'
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Field of View (FOV)</span>
                      <span className="font-mono">{saveData.settings.fov}°</span>
                    </div>
                    <input
                      type="range"
                      min="55"
                      max="90"
                      value={saveData.settings.fov}
                      onChange={(e) =>
                        updateSaveData((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, fov: Number(e.target.value) }
                        }))
                      }
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs">Invert Flight Pitch Y-Axis</span>
                    <button
                      onClick={() =>
                        updateSaveData((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, invertY: !prev.settings.invertY }
                        }))
                      }
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: saveData.settings.invertY ? '#48E0A4' : '#151F36',
                        color: saveData.settings.invertY ? '#050816' : '#9AA8C7'
                      }}
                    >
                      {saveData.settings.invertY ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs">Mouse Flight Steering</span>
                    <button
                      onClick={() =>
                        updateSaveData((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, mouseSteering: !prev.settings.mouseSteering }
                        }))
                      }
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: saveData.settings.mouseSteering ? '#48E0A4' : '#151F36',
                        color: saveData.settings.mouseSteering ? '#050816' : '#9AA8C7'
                      }}
                    >
                      {saveData.settings.mouseSteering ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>

                {/* Audio Volume Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#7C5CFF' }}>
                    AUDIO SYNTHESIZER LEVELS
                  </h3>

                  {[
                    { key: 'masterVolume', label: 'Master Volume' },
                    { key: 'musicVolume', label: 'Ambient Space Music' },
                    { key: 'sfxVolume', label: 'Thruster & Telemetry SFX' },
                  ].map((vol) => (
                    <div key={vol.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{vol.label}</span>
                        <span className="font-mono">{Math.round(saveData.settings[vol.key] * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={saveData.settings[vol.key]}
                        onChange={(e) =>
                          updateSaveData((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, [vol.key]: Number(e.target.value) }
                          }))
                        }
                        className="w-full accent-purple-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Control Keybind Remapping */}
              <div className="pt-4 border-t" style={{ borderColor: 'rgba(154,168,199,0.15)' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#48E0A4' }}>
                  KEYBOARD CONTROL REMAPPING (CLICK TO REBIND)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'pitchDown', label: 'Pitch Nose Down' },
                    { id: 'pitchUp', label: 'Pitch Nose Up' },
                    { id: 'yawLeft', label: 'Yaw Left' },
                    { id: 'yawRight', label: 'Yaw Right' },
                    { id: 'rollLeft', label: 'Roll Left' },
                    { id: 'rollRight', label: 'Roll Right' },
                    { id: 'boost', label: 'Warp Boost' },
                    { id: 'brake', label: 'Thruster Brake' },
                    { id: 'scan', label: 'Sensor Scan' },
                    { id: 'camera', label: 'Cycle Camera' },
                  ].map((act) => {
                    const isListening = remappingAction === act.id;
                    return (
                      <button
                        key={act.id}
                        onClick={() => setRemappingAction(act.id)}
                        className="p-2.5 rounded-xl border text-left transition-all"
                        style={{
                          backgroundColor: isListening ? 'rgba(73, 217, 255, 0.2)' : '#151F36',
                          borderColor: isListening ? '#49D9FF' : 'rgba(154,168,199,0.2)'
                        }}
                      >
                        <div className="text-[10px]" style={{ color: '#9AA8C7' }}>{act.label}</div>
                        <div className="text-xs font-mono font-bold mt-0.5" style={{ color: '#49D9FF' }}>
                          {isListening ? 'PRESS KEY...' : formatKeyCode(saveData.settings.bindings[act.id])}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {/* ==================================================================== */}
      {/* MODAL 1: IN-GAME PAUSE OVERLAY                                       */}
      {/* ==================================================================== */}
      {isPaused && activeScreen === 'playing' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div
            className="w-full max-w-md p-6 rounded-2xl border text-center space-y-4"
            style={{ backgroundColor: '#0D1428', borderColor: '#49D9FF' }}
          >
            <h2 className="text-2xl font-bold tracking-wider">FLIGHT PAUSED</h2>
            <p className="text-xs" style={{ color: '#9AA8C7' }}>
              Spacecraft thrusters holding steady in local inertial frame.
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ backgroundColor: '#49D9FF', color: '#050816' }}
              >
                RESUME FLIGHT
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  setActiveScreen('settings');
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-xs border"
                style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.25)' }}
              >
                FLIGHT SETTINGS
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  setActiveScreen('main_menu');
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-xs border"
                style={{ backgroundColor: '#151F36', borderColor: 'rgba(255,93,115,0.35)', color: '#FF5D73' }}
              >
                RETURN TO MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: MISSION COMPLETION / FAILURE SCREEN                         */}
      {/* ==================================================================== */}
      {missionResult && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div
            className="w-full max-w-md p-6 rounded-2xl border text-center space-y-4"
            style={{
              backgroundColor: '#0D1428',
              borderColor: missionResult.status === 'completed' ? '#48E0A4' : '#FF5D73'
            }}
          >
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border"
              style={{
                backgroundColor: missionResult.status === 'completed' ? 'rgba(72,224,164,0.15)' : 'rgba(255,93,115,0.15)',
                borderColor: missionResult.status === 'completed' ? '#48E0A4' : '#FF5D73'
              }}
            >
              {missionResult.status === 'completed' ? (
                <CheckCircle2 className="w-8 h-8" style={{ color: '#48E0A4' }} />
              ) : (
                <AlertTriangle className="w-8 h-8" style={{ color: '#FF5D73' }} />
              )}
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#9AA8C7' }}>
                {missionResult.mission.title}
              </div>
              <h2 className="text-2xl font-extrabold mt-1">
                {missionResult.status === 'completed' ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
              </h2>
            </div>

            {missionResult.status === 'completed' ? (
              <div className="p-4 rounded-xl border space-y-1 font-mono text-xs" style={{ backgroundColor: '#151F36', borderColor: 'rgba(72,224,164,0.3)' }}>
                <div>COMPLETION TIME: <span className="text-white font-bold">{missionResult.timeSpent}s</span></div>
                <div style={{ color: '#48E0A4' }}>REWARD: +{missionResult.mission.rewardCredits} CREDITS</div>
                <div style={{ color: '#49D9FF' }}>EXPERIENCE: +{missionResult.mission.rewardXP} XP</div>
              </div>
            ) : (
              <p className="text-xs" style={{ color: '#9AA8C7' }}>
                Orbital time window expired before all mission objectives were verified.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => startMission(missionResult.mission)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs border"
                style={{ backgroundColor: '#151F36', borderColor: '#49D9FF', color: '#49D9FF' }}
              >
                RETRY MISSION
              </button>
              <button
                onClick={() => setMissionResult(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs"
                style={{ backgroundColor: '#49D9FF', color: '#050816' }}
              >
                CONTINUE FLIGHT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CONFIRM PROGRESS RESET                                      */}
      {/* ==================================================================== */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div
            className="w-full max-w-sm p-6 rounded-2xl border text-center space-y-4"
            style={{ backgroundColor: '#0D1428', borderColor: '#FF5D73' }}
          >
            <AlertTriangle className="w-10 h-10 mx-auto" style={{ color: '#FF5D73' }} />
            <h3 className="text-lg font-bold">WIPE PILOT PROGRESSION?</h3>
            <p className="text-xs" style={{ color: '#9AA8C7' }}>
              This will permanently reset your pilot level, credits, unlocked spacecraft, discovered planets, and mission records.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border"
                style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.25)' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const fresh = await persistence.reset();
                  setSaveData(fresh);
                  setConfirmResetOpen(false);
                  triggerToast('PROGRESSION RESET', 'Pilot profile initialized to factory state.', 'info');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                style={{ backgroundColor: '#FF5D73', color: '#050816' }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}