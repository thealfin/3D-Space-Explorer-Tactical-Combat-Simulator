import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Compass,
  Shield,
  Zap,
  Globe,
  Settings,
  Volume2,
  VolumeX,
  Pause,
  Eye,
  EyeOff,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Sliders,
  Crosshair,
  Activity,
  Navigation,
  Layers,
  Maximize2,
  Minimize2,
  Trophy
} from 'lucide-react';

// Modular Components & Subsystems
import {
  SHIPS_CATALOG,
  WORLD_OBJECTS,
  MISSIONS_CATALOG,
  EXPEDITION_SECTORS,
  DEFAULT_SAVE_DATA,
  persistence,
  computeEffectiveShipStats,
  getLevelFromXP
} from './src/data/playerData';
import { audioSystem } from './src/audio/soundEffects';
import { buildSpaceshipMesh, createThrusterStream } from './src/assets3d/shipAssets';
import { getGalaxySkyboxTexture, createSolarStarMesh } from './src/assets3d/planetAssets';
import { spawnExplosionVFX } from './src/assets3d/destructibleAssets';
import { spawnHostileFleet } from './src/assets3d/enemyAssets';
import {
  buildOrbitalLaunchBay,
  buildCosmicEnvironment,
  buildWorldCelestialObjects,
  spawnDestructibleAsteroidBelt,
  spawnCollectibleQuantumCores
} from './src/assets3d/spaceObjectsAssets';
import {
  fireShipWeapon,
  updateFlightPhysicsStep,
  renderTacticalRadar
} from './src/physics/gamePhysics';
import {
  PreLaunchScreen,
  MissionsScreen,
  HangarScreen,
  GameModals
} from './src/components/PreLaunchUI';
import { PlayerProfileUI } from './src/components/PlayerProfileUI';
import { SettingsUI } from './src/components/SettingsUI';

// ============================================================================
// MAIN APPLICATION COMPONENT (MODULAR ARCHITECTURE)
// ============================================================================
export default function SpaceExplorer3D() {
  // Persistent Save State
  const [saveData, setSaveData] = useState<any>(DEFAULT_SAVE_DATA);
  const [, setIsLoaded] = useState(false);

  // Active Screen / Context: 'main_menu' | 'playing' | 'missions' | 'hangar' | 'profile' | 'settings'
  const [activeScreen, setActiveScreen] = useState('main_menu');
  const [isPaused, setIsPaused] = useState(false);
  const [cameraMode, setCameraMode] = useState('CHASE'); // 'CHASE' | 'COCKPIT' | 'CINEMATIC' | 'FREE_LOOK'
  const [showTutorial, setShowTutorial] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight > 540 : true
  );
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [remappingAction, setRemappingAction] = useState<string | null>(null);

  // 4-Stage HUD Visibility Mode:
  // 'full'         -> All widgets + Header visible
  // 'no_stats'     -> Left telemetry/weapons box, tutorial guide & Header hidden (HUD: MIN)
  // 'no_stats_map' -> Left telemetry/weapons box, tutorial guide, Header & Tactical Radar hidden (HUD: NO MAP)
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

  // Pre-Launch Telemetry & Planetary Control State
  const [selectedSectorId, setSelectedSectorId] = useState('alpha');
  const [auxDeflectorSync, setAuxDeflectorSync] = useState(true);
  const [auxDroneUplink, setAuxDroneUplink] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    'System Standby. Awaiting telemetry command.'
  ]);
  const planetarySectionRef = useRef<HTMLElement | null>(null);
  const selectedSector = useMemo(
    () => EXPEDITION_SECTORS.find((sec) => sec.id === selectedSectorId) || EXPEDITION_SECTORS[0],
    [selectedSectorId]
  );

  // Mission Runtime State
  const [activeMission, setActiveMission] = useState<any>(null);
  const [missionResult, setMissionResult] = useState<any>(null);

  // Toast Notifications
  const [toast, setToast] = useState<any>(null);
  const triggerToast = useCallback((title: string, subtitle: string, type = 'info') => {
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
  const updateSaveData = useCallback((updater: (prev: any) => any) => {
    setSaveData((prev: any) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      next.pilotProfile.level = getLevelFromXP(next.pilotProfile.experience);
      if ((next.pilotProfile.score || 0) > (next.pilotProfile.highScore || 0)) {
        next.pilotProfile.highScore = next.pilotProfile.score;
      }
      persistence.save(next);
      audioSystem.updateVolumes(next.settings);
      return { ...next };
    });
  }, []);

  // Helper to award Combat Score & update High Score
  const awardCombatScore = useCallback(
    (points: number, creditsDelta: number, xpDelta: number, statKey?: 'enemiesDestroyed' | 'asteroidsDestroyed') => {
      updateSaveData((prev: any) => {
        const newScore = (prev.pilotProfile.score || 0) + points;
        const newHighScore = Math.max(prev.pilotProfile.highScore || 0, newScore);
        return {
          ...prev,
          pilotProfile: {
            ...prev.pilotProfile,
            credits: prev.pilotProfile.credits + creditsDelta,
            experience: prev.pilotProfile.experience + xpDelta,
            score: newScore,
            highScore: newHighScore,
            enemiesDestroyed:
              statKey === 'enemiesDestroyed'
                ? (prev.pilotProfile.enemiesDestroyed || 0) + 1
                : prev.pilotProfile.enemiesDestroyed || 0,
            asteroidsDestroyed:
              statKey === 'asteroidsDestroyed'
                ? (prev.pilotProfile.asteroidsDestroyed || 0) + 1
                : prev.pilotProfile.asteroidsDestroyed || 0
          }
        };
      });
    },
    [updateSaveData]
  );

  // High-frequency Refs for 60FPS WebGL Loop & Direct HUD DOM Updates
  const mountRef = useRef<HTMLDivElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const hudRefs = useRef<Record<string, any>>({
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
  const simRef = useRef<any>({
    isPlaying: false,
    isPaused: false,
    cameraMode: 'CHASE',
    activeScreen: 'main_menu',
    shipSpec: SHIPS_CATALOG[0],
    effectiveStats: computeEffectiveShipStats(SHIPS_CATALOG[0], DEFAULT_SAVE_DATA.ships.vanguard_vx1),
    settings: DEFAULT_SAVE_DATA.settings,
    discoveredIds: new Set<string>(),

    // Flight Physics State
    position: new THREE.Vector3(0, 8, 45),
    quaternion: new THREE.Quaternion(),
    velocity: new THREE.Vector3(),
    speed: 35,
    throttle: 0.35,
    angularVel: new THREE.Vector3(0, 0, 0),
    bankAngle: 0,
    boostEnergy: 100,
    isBoosting: false,
    boostCooldown: false,
    shieldCurrent: 120,
    shieldFlash: 0,
    cameraShake: 0,

    // Combat & Weapon Systems
    activeWeapon: 1,
    lastFireTime: 0,
    lastSecondaryFireTime: 0,
    autocannonAlt: false,
    damageVignetteTimer: 0,
    targetLockedEntity: null,

    // Camera Orbit / Free Look & Mobile Roblox/FPS Touch-Drag Steering State
    freeLookYaw: 0,
    freeLookPitch: 0.15,
    isPointerDown: false,
    pointerX: 0,
    pointerY: 0,
    touchSteerPointerId: null as number | null,
    touchSteerLastX: 0,
    touchSteerLastY: 0,
    touchDragYaw: 0,
    touchDragPitch: 0,
    touchDragMoved: false,
    touchDownTime: 0,

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
    missionScannedSet: new Set<string>(),
    missionTimeRemaining: 0,

    // Keyboard & Mobile Touch Inputs
    keys: new Set<string>(),
    mouseButtons: new Set<number>(),
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
  }, [
    activeScreen,
    isPaused,
    cameraMode,
    currentShipSpec,
    effectiveStats,
    saveData.settings,
    saveData.exploration.discoveredObjectIds
  ]);

  // Callbacks triggered from the 3D simulation loop into React state
  const handleObjectDiscovered = useCallback(
    (worldObj: any) => {
      audioSystem.playDiscovery();
      triggerToast(
        `SECTOR DISCOVERED: ${worldObj.name.toUpperCase()}`,
        `+${worldObj.rewardCredits} CR  //  +${worldObj.rewardXP} XP  //  +150 PTS`,
        'success'
      );
      updateSaveData((prev: any) => {
        if (prev.exploration.discoveredObjectIds.includes(worldObj.id)) return prev;
        const newScore = (prev.pilotProfile.score || 0) + 150;
        return {
          ...prev,
          pilotProfile: {
            ...prev.pilotProfile,
            credits: prev.pilotProfile.credits + worldObj.rewardCredits,
            experience: prev.pilotProfile.experience + worldObj.rewardXP,
            score: newScore,
            highScore: Math.max(prev.pilotProfile.highScore || 0, newScore)
          },
          exploration: {
            ...prev.exploration,
            discoveredObjectIds: [...prev.exploration.discoveredObjectIds, worldObj.id]
          }
        };
      });
    },
    [triggerToast, updateSaveData]
  );

  const handleFreeCoreCollected = useCallback(() => {
    audioSystem.playCheckpoint();
    triggerToast('QUANTUM MINERAL CORE HARVESTED', '+85 Credits // +45 XP // +100 PTS', 'info');
    updateSaveData((prev: any) => {
      const newScore = (prev.pilotProfile.score || 0) + 100;
      return {
        ...prev,
        pilotProfile: {
          ...prev.pilotProfile,
          credits: prev.pilotProfile.credits + 85,
          experience: prev.pilotProfile.experience + 45,
          score: newScore,
          highScore: Math.max(prev.pilotProfile.highScore || 0, newScore)
        },
        exploration: {
          ...prev.exploration,
          collectedFreeCores: (prev.exploration.collectedFreeCores || 0) + 1
        }
      };
    });
  }, [triggerToast, updateSaveData]);

  const handleMissionFinished = useCallback(
    (status: string, missionSpec: any, timeSpent: number) => {
      const s = simRef.current;
      s.mission = null;
      setActiveMission(null);
      setMissionResult({ status, mission: missionSpec, timeSpent: Math.round(timeSpent) });

      if (status === 'completed') {
        audioSystem.playMissionComplete();
        updateSaveData((prev: any) => {
          const mPrev = prev.missions[missionSpec.id] || { attempts: 0, bestTime: null };
          const bestTime =
            mPrev.bestTime === null ? Math.round(timeSpent) : Math.min(mPrev.bestTime, Math.round(timeSpent));
          const newScore = (prev.pilotProfile.score || 0) + missionSpec.rewardCredits;
          return {
            ...prev,
            pilotProfile: {
              ...prev.pilotProfile,
              credits: prev.pilotProfile.credits + missionSpec.rewardCredits,
              experience: prev.pilotProfile.experience + missionSpec.rewardXP,
              score: newScore,
              highScore: Math.max(prev.pilotProfile.highScore || 0, newScore)
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
        updateSaveData((prev: any) => {
          const mPrev = prev.missions[missionSpec.id] || { attempts: 0, bestTime: null };
          return {
            ...prev,
            missions: {
              ...prev.missions,
              [missionSpec.id]: {
                ...mPrev,
                status: mPrev.status === 'completed' ? 'completed' : 'failed',
                attempts: mPrev.attempts + 1
              }
            }
          };
        });
      }
    },
    [updateSaveData]
  );

  // Start or Retry a Mission
  const startMission = useCallback(
    (missionSpec: any) => {
      audioSystem.playUIClick();
      const s = simRef.current;
      if (missionSpec.type === 'boss_battle') {
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
    },
    [triggerToast]
  );

  // ============================================================================
  // THREE.JS 3D ENGINE & SIMULATION LOOP
  // ============================================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040711);
    scene.fog = new THREE.FogExp2(0x040711, 0.00048);

    const camera = new THREE.PerspectiveCamera(
      simRef.current.settings.fov || 68,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.5,
      3600
    );

    let renderer: THREE.WebGLRenderer;
    let composer: EffectComposer | undefined;
    let bloomPass: UnrealBloomPass | undefined;
    let pmremGenerator: THREE.PMREMGenerator | undefined;
    let envRenderTarget: THREE.WebGLRenderTarget | undefined;
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

      pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRenderTarget.texture;

      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        0.65,
        0.45,
        0.8
      );
      composer.addPass(bloomPass);

      const outputPass = new OutputPass();
      composer.addPass(outputPass);
    } catch {
      container.innerHTML =
        '<div style="color:#F4F7FF;padding:40px;text-align:center;">WebGL is not supported or enabled on this device.</div>';
      return;
    }

    // Lighting & 360° Galaxy Skybox Dome
    const ambientLight = new THREE.AmbientLight(0x1e2f4d, 0.95);
    scene.add(ambientLight);

    const galaxySkyGeo = new THREE.SphereGeometry(3200, 48, 32);
    const galaxySkyMat = new THREE.MeshBasicMaterial({
      map: getGalaxySkyboxTexture(),
      side: THREE.BackSide,
      depthWrite: false
    });
    scene.add(new THREE.Mesh(galaxySkyGeo, galaxySkyMat));

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

    const sunMesh = createSolarStarMesh(sunLight.position);
    scene.add(sunMesh);

    // Modular 3D Environment, Orbital Launch Bay, Planets, Stations, Asteroids & Fleet
    const launchBayGroup = buildOrbitalLaunchBay(scene);
    const { nebulaClouds, spaceDust, dustGeo, dustBoxRange } = buildCosmicEnvironment(scene);
    const worldMeshes = buildWorldCelestialObjects(scene, WORLD_OBJECTS);
    const { interactiveAsteroids } = spawnDestructibleAsteroidBelt(scene, 85);
    const { enemyFighters, battleshipMesh, warpPortalMesh } = spawnHostileFleet(scene);
    const { freeCores } = spawnCollectibleQuantumCores(scene, 15);

    // Player Spaceship Container
    const shipAnchor = new THREE.Group();
    scene.add(shipAnchor);
    let currentShipMesh = buildSpaceshipMesh(simRef.current.shipSpec);
    shipAnchor.add(currentShipMesh);

    simRef.current.RebuildShipMesh = (newSpec: any) => {
      if (currentShipMesh) {
        shipAnchor.remove(currentShipMesh);
      }
      currentShipMesh = buildSpaceshipMesh(newSpec);
      shipAnchor.add(currentShipMesh);
    };

    // Twin Sparkling Thruster Particle Streams
    const leftThruster = createThrusterStream(scene, 55);
    const rightThruster = createThrusterStream(scene, 55);

    // Projectiles & VFX Groups
    const projectilesGroup = new THREE.Group();
    scene.add(projectilesGroup);
    const playerProjectiles: any[] = [];
    const enemyProjectiles: any[] = [];

    const fxGroup = new THREE.Group();
    scene.add(fxGroup);
    const vfxEntities: any[] = [];

    const spawnExplosion = (pos: THREE.Vector3, isHeavy = false) => {
      audioSystem.playExplosion(isHeavy);
      simRef.current.cameraShake = Math.min(1.2, simRef.current.cameraShake + (isHeavy ? 0.75 : 0.38));
      spawnExplosionVFX(fxGroup, vfxEntities, pos, isHeavy);
    };

    const fireWeapon = (isSecondary = false) => {
      fireShipWeapon(simRef.current, isSecondary, projectilesGroup, playerProjectiles, fxGroup, vfxEntities);
    };
    simRef.current.fireWeapon = fireWeapon;

    // Mission Objects Group
    const missionGroup = new THREE.Group();
    scene.add(missionGroup);
    let missionMeshes: THREE.Mesh[] = [];

    const fighterSpawns: [number, number, number][] = [
      [240, 20, -180],
      [320, -15, -240],
      [260, 35, -280],
      [330, 10, -160]
    ];

    simRef.current.RebuildMissionObjects = (missionSpec: any) => {
      while (missionGroup.children.length > 0) {
        missionGroup.remove(missionGroup.children[0]);
      }
      missionMeshes = [];

      while (enemyProjectiles.length > 0) {
        const ep = enemyProjectiles.pop();
        if (ep?.mesh) projectilesGroup.remove(ep.mesh);
      }

      if (!missionSpec) return;

      if (missionSpec.type === 'boss_battle') {
        enemyFighters.forEach((f, idx) => {
          const pos = fighterSpawns[idx];
          if (pos) f.position.set(pos[0], pos[1], pos[2]);
          f.userData.health = f.userData.maxHealth;
          f.userData.active = true;
          f.userData.shootCooldown = 1.0 + idx * 0.35;
          f.visible = true;
        });
        const bData = battleshipMesh.userData;
        bData.alive = true;
        battleshipMesh.visible = true;
        if (bData.shieldMesh) bData.shieldMesh.visible = true;
        bData.turrets.forEach((t: THREE.Group, idx: number) => {
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
        missionSpec.checkpoints.forEach((cp: [number, number, number], idx: number) => {
          const ringGeo = new THREE.TorusGeometry(13, 0.85, 16, 48);
          const ringMat = new THREE.MeshBasicMaterial({
            color: idx === 0 ? 0x48e0a4 : 0x49d9ff,
            transparent: true,
            opacity: idx === 0 ? 0.95 : 0.38
          });
          const mesh = new THREE.Mesh(ringGeo, ringMat);
          mesh.position.set(cp[0], cp[1], cp[2]);
          missionGroup.add(mesh);
          missionMeshes.push(mesh);
        });
      } else if (missionSpec.type === 'collect_cores') {
        missionSpec.corePositions.forEach((pos: [number, number, number]) => {
          const cGeo = new THREE.OctahedronGeometry(4.5, 1);
          const cMat = new THREE.MeshBasicMaterial({ color: 0xffb454, wireframe: true });
          const mesh = new THREE.Mesh(cGeo, cMat);
          mesh.position.set(pos[0], pos[1], pos[2]);
          missionGroup.add(mesh);
          missionMeshes.push(mesh);
        });
      }
    };

    // Input Event Listeners (Keyboard + Roblox/Mobile FPS Touch-Drag Screen Steering)
    const onKeyDown = (e: KeyboardEvent) => {
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

    const onKeyUp = (e: KeyboardEvent) => {
      simRef.current.keys.delete(e.code);
    };

    const onPointerDown = (e: PointerEvent) => {
      audioSystem.resume();
      // Ignore clicks/touches on UI buttons, inputs, or navigation controls
      if (e.target instanceof Element && e.target.closest('button, input, select, a, nav, header')) {
        return;
      }
      const s = simRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      s.pointerX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      s.pointerY = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;

      if (e.pointerType === 'touch') {
        // Roblox / Mobile FPS Touch-Drag Screen Steering
        if (s.touchSteerPointerId === null) {
          s.touchSteerPointerId = e.pointerId;
          s.touchSteerLastX = e.clientX;
          s.touchSteerLastY = e.clientY;
          s.touchDragMoved = false;
          s.touchDownTime = performance.now();
        }
      } else {
        s.isPointerDown = true;
        s.mouseButtons.add(e.button);
        if (s.touchSteerPointerId === null) {
          s.touchSteerPointerId = e.pointerId;
          s.touchSteerLastX = e.clientX;
          s.touchSteerLastY = e.clientY;
          s.touchDragMoved = false;
          s.touchDownTime = performance.now();
        }
        if (s.isPlaying && !s.isPaused) {
          if (e.button === 0) fireWeapon(false);
          else if (e.button === 2) fireWeapon(true);
        }
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      if (simRef.current.isPlaying) {
        e.preventDefault();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const s = simRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;

      // Handle Roblox / Mobile FPS Touch-Drag Screen Steering & Free Look Orbit
      if (e.pointerId === s.touchSteerPointerId && (e.pointerType === 'touch' || s.isPointerDown)) {
        const dx = e.clientX - s.touchSteerLastX;
        const dy = e.clientY - s.touchSteerLastY;
        s.touchSteerLastX = e.clientX;
        s.touchSteerLastY = e.clientY;

        if (Math.hypot(dx, dy) > 2.5) {
          s.touchDragMoved = true;
        }

        const sensitivity = s.settings.touchDragSensitivity ?? 1.0;
        const refDim = Math.max(240, Math.min(rect.width, rect.height));

        if (s.cameraMode === 'FREE_LOOK') {
          s.freeLookYaw -= (dx / refDim) * 3.2 * (s.settings.cameraSensitivity || 1.0);
          s.freeLookPitch = THREE.MathUtils.clamp(
            s.freeLookPitch + (dy / refDim) * 2.4 * (s.settings.cameraSensitivity || 1.0),
            -1.1,
            1.1
          );
        } else if (s.settings.touchDragSteering !== false && (e.pointerType === 'touch' || !s.settings.mouseSteering)) {
          // Swipe horizontally to Yaw & bank, swipe vertically to Pitch nose
          const yawDelta = -(dx / refDim) * 14.5 * sensitivity;
          const pitchDelta = -(dy / refDim) * 14.5 * sensitivity;
          s.touchDragYaw = THREE.MathUtils.clamp((s.touchDragYaw || 0) + yawDelta, -2.6, 2.6);
          s.touchDragPitch = THREE.MathUtils.clamp((s.touchDragPitch || 0) + pitchDelta, -2.6, 2.6);
        }
      }

      s.pointerX = nx;
      s.pointerY = ny;
    };

    const onPointerUpOrCancel = (e: PointerEvent) => {
      const s = simRef.current;
      if (e.pointerId === s.touchSteerPointerId) {
        s.touchSteerPointerId = null;
        s.touchDragYaw = 0;
        s.touchDragPitch = 0;
      }
      if (e.pointerType !== 'touch') {
        s.mouseButtons.delete(e.button);
        if (s.mouseButtons.size === 0) {
          s.isPointerDown = false;
        }
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
    window.addEventListener('pointerup', onPointerUpOrCancel);
    window.addEventListener('pointercancel', onPointerUpOrCancel);
    window.addEventListener('resize', onResize);

    // Main Simulation & Render Loop
    let lastTime = performance.now();
    let animFrameId: number;
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

    const animate = (now: number) => {
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
        const speedFactor = s.isPlaying ? 0.2 + s.speed / Math.max(1, s.effectiveStats.topSpeed) : 0.08;
        const dustMat = spaceDust.material as THREE.PointsMaterial;
        dustMat.size = s.isBoosting ? 2.4 : 1.55;
        for (let i = 0; i < dAttr.count; i++) {
          let px = dAttr.getX(i);
          let py = dAttr.getY(i);
          let pz = dAttr.getZ(i);

          if (!s.isPlaying) {
            py += Math.sin(now * 0.001 + i) * 0.015;
            pz += 1.8 * dt;
          }

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
        leftThruster.points.visible = false;
        rightThruster.points.visible = false;

        if (s.activeScreen === 'main_menu') {
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

        if (currentShipMesh?.userData?.thrusterFlames) {
          currentShipMesh.userData.thrusterFlames.forEach((fl: THREE.Mesh) => {
            fl.scale.set(1, 0.85 + Math.sin(now * 0.015) * 0.18, 1);
          });
        }
        renderScene();
        return;
      }

      launchBayGroup.visible = true;

      if (s.isPaused) {
        audioSystem.updateEngine(0, false, false);
        renderScene();
        return;
      }

      // 6-DOF Flight Physics + Touch-Drag Steering Step
      updateFlightPhysicsStep(
        s,
        dt,
        now,
        shipAnchor,
        currentShipMesh,
        leftThruster,
        rightThruster,
        forwardVec
      );

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

      const isCombatMission = Boolean(s.mission && s.mission.type === 'boss_battle');

      // Projectiles & Combat Hit Detection
      for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        const p = playerProjectiles[i];
        p.mesh.position.addScaledVector(p.vel, dt);
        p.life -= dt;

        let hitSomething = false;

        // 1. Check Interactive Asteroids
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
              triggerToast('ASTEROID SHATTERED', '+50 PTS // +35 Credits // +20 XP', 'info');
              awardCombatScore(50, 35, 20, 'asteroidsDestroyed');
            }
            break;
          }
        }

        // 2. Check Hostile Fighters
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
                triggerToast(`HOSTILE ELIMINATED: ${fighter.userData.name}`, '+250 PTS // +180 Credits // +120 XP', 'success');
                awardCombatScore(250, 180, 120, 'enemiesDestroyed');
              }
              break;
            }
          }
        }

        // 3. Check Dreadnought Kronos Battleship Subsystems
        if (!hitSomething && battleshipMesh.userData.alive) {
          const bData = battleshipMesh.userData;

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
                triggerToast('PULSE BATTERY DESTROYED', '+500 PTS // +350 Credits // +250 XP', 'success');
                awardCombatScore(500, 350, 250, 'enemiesDestroyed');
              }
              break;
            }
          }

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
                triggerToast('CITADEL BRIDGE DESTROYED', '+1,000 PTS // +800 Credits // +500 XP', 'success');
                awardCombatScore(1000, 800, 500, 'enemiesDestroyed');
              }
            }
          }

          if (!hitSomething) {
            const distToHull = p.mesh.position.distanceTo(battleshipMesh.position);
            if (distToHull < 52 + p.radius) {
              hitSomething = true;
              audioSystem.playHitSpark();
              spawnExplosion(p.mesh.position, false);
              if (bData.purpleShieldMat) {
                bData.purpleShieldMat.opacity = 0.68;
              }

              const activeTurret = bData.turrets.find((t: THREE.Group) => t.userData.active);
              if (activeTurret) {
                activeTurret.userData.health -= p.damage * 0.85;
                if (activeTurret.userData.health <= 0) {
                  const tWorldPos = new THREE.Vector3();
                  activeTurret.getWorldPosition(tWorldPos);
                  activeTurret.userData.active = false;
                  activeTurret.visible = false;
                  spawnExplosion(tWorldPos, true);
                  triggerToast('PULSE BATTERY DESTROYED', '+500 PTS // +350 Credits // +250 XP', 'success');
                  awardCombatScore(500, 350, 250, 'enemiesDestroyed');
                }
              } else if (bData.deckhouse.userData.active) {
                bData.deckhouse.userData.health -= p.damage * 0.85;
                if (bData.deckhouse.userData.health <= 0) {
                  const dWorldPos = new THREE.Vector3();
                  bData.deckhouse.getWorldPosition(dWorldPos);
                  bData.deckhouse.userData.active = false;
                  bData.deckhouse.visible = false;
                  spawnExplosion(dWorldPos, true);
                  triggerToast('CITADEL BRIDGE DESTROYED', '+1,000 PTS // +800 Credits // +500 XP', 'success');
                  awardCombatScore(1000, 800, 500, 'enemiesDestroyed');
                }
              }
            }
          }

          const allTurretsDown = bData.turrets.every((t: THREE.Group) => !t.userData.active);
          const deckhouseDown = !bData.deckhouse.userData.active;
          if (allTurretsDown && deckhouseDown && bData.alive) {
            bData.alive = false;
            bData.shieldMesh.visible = false;
            awardCombatScore(2500, 1200, 800, 'enemiesDestroyed');

            for (let ex = -3; ex <= 3; ex++) {
              setTimeout(() => {
                const ep = battleshipMesh.position.clone().add(new THREE.Vector3(ex * 8, (ex % 2) * 4, ex * 14));
                spawnExplosion(ep, true);
                if (ex === 3) {
                  battleshipMesh.visible = false;
                }
              }, (ex + 3) * 160);
            }

            warpPortalMesh.visible = true;
            triggerToast(
              'DREADNOUGHT KRONOS DESTROYED (+2,500 PTS)',
              'Fly through the Blue Warp Portal to extract from Tartarus Sector',
              'success'
            );
          }
        }

        if (p.life <= 0 || hitSomething) {
          projectilesGroup.remove(p.mesh);
          playerProjectiles.splice(i, 1);
        }
      }

      // Hostile Fighter AI
      enemyFighters.forEach((f) => {
        if (!f.userData.active) return;
        const distToPlayer = f.position.distanceTo(s.position);

        if (isCombatMission) {
          f.lookAt(s.position);
          if (distToPlayer > 60) {
            const flyDir = s.position.clone().sub(f.position).normalize();
            f.position.addScaledVector(flyDir, f.userData.speed * 0.45 * dt);
          }

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

      // Battleship Turret AI
      if (battleshipMesh.userData.alive) {
        battleshipMesh.userData.turrets.forEach((turret: THREE.Group) => {
          if (!turret.userData.active) return;
          const tWorldPos = new THREE.Vector3();
          turret.getWorldPosition(tWorldPos);
          const dist = tWorldPos.distanceTo(s.position);

          if (isCombatMission) {
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

        if (battleshipMesh.userData.purpleShieldMat) {
          battleshipMesh.userData.purpleShieldMat.opacity = THREE.MathUtils.lerp(
            battleshipMesh.userData.purpleShieldMat.opacity,
            0.28 + Math.sin(now * 0.003) * 0.08,
            dt * 5
          );
        }
      }

      // Enemy Projectiles vs Player
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

      // Warp Portal Extraction
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

      // Update VFX Entities
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

      // Planet & Asteroid Collisions + Proximity Scanner
      let closestObj: any = null;
      let closestDist = Infinity;

      for (let i = 0; i < WORLD_OBJECTS.length; i++) {
        const wo = WORLD_OBJECTS[i];
        const objPos = worldMeshes[i].group.position;
        const dist = s.position.distanceTo(objPos);

        if (dist < closestDist) {
          closestDist = dist;
          closestObj = wo;
        }

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

      for (let i = 0; i < freeCores.length; i++) {
        const fc = freeCores[i];
        if (!fc.collected && s.position.distanceTo(fc.mesh.position) < 12) {
          fc.collected = true;
          fc.mesh.visible = false;
          handleFreeCoreCollected();
        }
      }

      s.nearestObject = closestObj;
      s.nearestDistance = closestDist;
      const canScan = closestObj && closestDist <= closestObj.interactionRadius;
      const isAlreadyDiscovered = closestObj && s.discoveredIds.has(closestObj.id);
      const wantsScan = s.keys.has(b.scan) || s.touchInput.scan;

      if (canScan && (!isAlreadyDiscovered || (s.mission?.type === 'scan_targets' && !s.missionScannedSet.has(closestObj.id)))) {
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

      // Active Mission Logic
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
                const mat = missionMeshes[s.missionIndex].material as THREE.MeshBasicMaterial;
                mat.color.setHex(0x48e0a4);
                mat.opacity = 0.95;
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

      // Multi-Mode Camera System
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
        shipAnchor.visible = true;
        camOffset.set(0, 3.3, 12.2).applyQuaternion(s.quaternion);
        targetCamPos.copy(s.position).add(camOffset);
        camera.position.lerp(targetCamPos, Math.min(1, dt * 10.5));
        lookTarget.copy(s.position).addScaledVector(forwardVec, 32);
        camera.up.lerp(upVec, Math.min(1, dt * 8));
        camera.lookAt(lookTarget);
      }

      if (s.cameraShake > 0) {
        s.cameraShake = Math.max(0, s.cameraShake - dt * 2.2);
        camera.position.x += (Math.random() - 0.5) * s.cameraShake * 1.4;
        camera.position.y += (Math.random() - 0.5) * s.cameraShake * 1.4;
      }

      // Direct DOM HUD & Tactical Radar Updates
      const h = hudRefs.current;
      if (h.speedValue) h.speedValue.textContent = `${Math.round(s.speed * 10)}`;
      if (h.speedBar) {
        const pct = Math.min(100, (s.speed / (s.effectiveStats.topSpeed * 1.7)) * 100);
        h.speedBar.style.width = `${pct}%`;
      }
      if (h.throttleValue) h.throttleValue.textContent = `${Math.round(s.throttle * 100)}%`;
      if (h.boostValue)
        h.boostValue.textContent = `${Math.round((s.boostEnergy / s.effectiveStats.boostCapacity) * 100)}%`;
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
        h.zoneBadge.textContent =
          closestDist < closestObj.interactionRadius * 1.5
            ? `${closestObj.name.toUpperCase()} // ${closestObj.zoneType}`
            : 'DEEP SPACE // HELIOS SECTOR';
      }
      if (h.scanPrompt) {
        if (
          canScan &&
          (!isAlreadyDiscovered || (s.mission?.type === 'scan_targets' && !s.missionScannedSet.has(closestObj.id)))
        ) {
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
            const downTurrets = bData.turrets.filter((t: THREE.Group) => !t.userData.active).length;
            const downDeck = bData.deckhouse.userData.active ? 0 : 1;
            h.missionProgress.textContent = `${downTurrets + downDeck} / 5 BATTLESHIP CORES DESTROYED`;
          }
        }
      }

      // 3D Tactical Target Lock-On Reticle Projection
      let bestTarget: any = null;
      let bestDot = 0.82;

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

      if (!bestTarget && battleshipMesh.userData.alive) {
        battleshipMesh.userData.turrets.forEach((turret: THREE.Group) => {
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
      const headingDeg = Math.round(((Math.atan2(forwardVec.x, -forwardVec.z) * 180) / Math.PI + 360) % 360);
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

      // 3D Screen-Space Waypoint Marker Projection
      if (h.waypointOverlay) {
        let targetWorldPos: THREE.Vector3 | null = null;
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
            const nextId = s.mission.targetIds.find((id: string) => !s.missionScannedSet.has(id));
            const obj = WORLD_OBJECTS.find((w) => w.id === nextId);
            if (obj) {
              targetWorldPos = new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]);
              targetLabel = `SCAN: ${obj.name.toUpperCase()}`;
            }
          }
        } else if (closestObj) {
          targetWorldPos = new THREE.Vector3(closestObj.position[0], closestObj.position[1], closestObj.position[2]);
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

      // Draw 2D Tactical Radar
      renderTacticalRadar(radarCanvasRef.current, s, forwardVec, missionMeshes);

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
      window.removeEventListener('pointerup', onPointerUpOrCancel);
      window.removeEventListener('pointercancel', onPointerUpOrCancel);
      window.removeEventListener('resize', onResize);
      if (composer) composer.dispose();
      if (envRenderTarget) envRenderTarget.dispose();
      if (pmremGenerator) pmremGenerator.dispose();
      renderer.dispose();
    };
  }, [
    handleObjectDiscovered,
    handleFreeCoreCollected,
    handleMissionFinished,
    remappingAction,
    triggerToast,
    awardCombatScore
  ]);

  // Periodic Flush of Flight Distance & Time to Persistent Save State
  useEffect(() => {
    const interval = setInterval(() => {
      const s = simRef.current;
      if (s.isPlaying && !s.isPaused && (s.sessionDistance > 10 || s.sessionTime > 2)) {
        const distDelta = Math.round(s.sessionDistance);
        const timeDelta = Math.round(s.sessionTime);
        s.sessionDistance = 0;
        s.sessionTime = 0;
        updateSaveData((prev: any) => ({
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
    const handleRebind = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setRemappingAction(null);
        return;
      }
      updateSaveData((prev: any) => ({
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

  // Hangar & Achievement Actions
  const handleSelectOrUnlockShip = (shipSpec: any) => {
    audioSystem.playUIClick();
    const state = saveData.ships[shipSpec.id];
    if (state?.unlocked) {
      updateSaveData((prev: any) => ({ ...prev, selectedShipId: shipSpec.id }));
      triggerToast(`ACTIVE VESSEL: ${shipSpec.name.toUpperCase()}`, 'Spacecraft systems online and ready for launch.', 'info');
      return;
    }

    if (saveData.pilotProfile.credits < shipSpec.unlockCost) {
      triggerToast('INSUFFICIENT CREDITS', `Need ${shipSpec.unlockCost} CR to unlock ${shipSpec.name}.`, 'danger');
      return;
    }

    updateSaveData((prev: any) => ({
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

  const handleUpgradeShipSystem = (shipId: string, statKey: string) => {
    audioSystem.playUIClick();
    const shipState = saveData.ships[shipId];
    const currentLvl = shipState?.upgradeLevels?.[statKey] || 1;
    if (currentLvl >= 5) return;

    const cost = currentLvl * 260;
    if (saveData.pilotProfile.credits < cost) {
      triggerToast('INSUFFICIENT CREDITS', `Requires ${cost} CR for Level ${currentLvl + 1} upgrade.`, 'danger');
      return;
    }

    updateSaveData((prev: any) => ({
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

  const claimAchievement = (ach: any) => {
    if (saveData.claimedAchievements.includes(ach.id)) return;
    audioSystem.playMissionComplete();
    updateSaveData((prev: any) => ({
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

  const currentScore = saveData.pilotProfile.score || 0;
  const highScore = Math.max(saveData.pilotProfile.highScore || 0, currentScore);

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none font-sans"
      style={{ backgroundColor: '#050816', color: '#F4F7FF' }}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 touch-none" />

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
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(255, 30, 30, 0.45) 80%, rgba(255, 0, 0, 0.8) 100%)',
          opacity: 0
        }}
      />

      {/* Tactical Combat Target Lock-On Overlay */}
      <div
        ref={(el) => (hudRefs.current.targetLockOverlay = el)}
        className="pointer-events-none fixed top-0 left-0 z-20 flex flex-col items-center justify-center transition-opacity duration-75"
        style={{ width: '96px', height: '96px', opacity: 0 }}
      >
        <div
          className="relative w-12 h-12 border-2 border-red-500 rotate-45 animate-pulse shadow-[0_0_12px_rgba(255,50,50,0.6)]"
          style={{ borderColor: '#ff3344' }}
        >
          <div className="absolute inset-1 border border-red-400 opacity-60" />
        </div>
        <div className="mt-2 px-2 py-0.5 rounded bg-black/85 border border-red-500/60 text-center whitespace-nowrap backdrop-blur-sm">
          <div
            ref={(el) => (hudRefs.current.targetLockName = el)}
            className="text-[10px] font-bold font-mono text-red-400 tracking-wider"
          >
            TARGET
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <span ref={(el) => (hudRefs.current.targetLockDist = el)} className="text-[9px] font-mono text-white">
              0m
            </span>
            <div className="w-10 h-1 bg-red-950 rounded-full overflow-hidden border border-red-800">
              <div
                ref={(el) => (hudRefs.current.targetLockBar = el)}
                className="h-full bg-red-500"
                style={{ width: '100%' }}
              />
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
            <div className="text-xs font-bold tracking-wider" style={{ color: '#F4F7FF' }}>
              {toast.title}
            </div>
            <div className="text-xs" style={{ color: '#9AA8C7' }}>
              {toast.subtitle}
            </div>
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
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#00a8ff', boxShadow: '0 0 8px #00a8ff' }}
            />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-slate-200 uppercase">
              INTEGRITY: <strong className="text-white">100%</strong>
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-3 sm:pl-4 border-l border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-400">
            <span>
              CALLSIGN: <strong className="text-slate-200">{saveData.pilotProfile.callsign}</strong>
            </span>
            <span className="text-slate-600">//</span>
            <span style={{ color: '#00a8ff' }}>{saveData.pilotProfile.credits.toLocaleString()} CR</span>
            <span className="text-slate-600">//</span>
            <span className="flex items-center gap-1" style={{ color: '#FFB454' }}>
              <Trophy className="w-3 h-3" /> {currentScore.toLocaleString()} PTS (HI: {highScore.toLocaleString()})
            </span>
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
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}</span>
          </button>

          <button
            onClick={() => {
              updateSaveData((prev: any) => ({
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

      {/* VIEW 1: PRE-LAUNCH INTERFACE */}
      {activeScreen === 'main_menu' && (
        <PreLaunchScreen
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          effectiveStats={effectiveStats}
          saveData={saveData}
          startMission={startMission}
          planetarySectionRef={planetarySectionRef}
          selectedSector={selectedSector}
          selectedSectorId={selectedSectorId}
          setSelectedSectorId={setSelectedSectorId}
          terminalLogs={terminalLogs}
          setTerminalLogs={setTerminalLogs}
          auxDeflectorSync={auxDeflectorSync}
          setAuxDeflectorSync={setAuxDeflectorSync}
          auxDroneUplink={auxDroneUplink}
          setAuxDroneUplink={setAuxDroneUplink}
          simRef={simRef}
          triggerToast={triggerToast}
        />
      )}

      {/* VIEW 2: ACTIVE FLIGHT HUD & COCKPIT OVERLAY */}
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
          {/* Top HUD Row */}
          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
            {/* Sector, Coordinates & Combat Score (Hidden in 'full_hide') */}
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
              <div className="flex items-center gap-3 mt-0.5">
                <div
                  ref={(el) => (hudRefs.current.coordsValue = el)}
                  className="text-[11px] font-mono"
                  style={{ color: '#9AA8C7' }}
                >
                  X:0 Y:8 Z:45
                </div>
                <div className="text-[11px] font-mono font-bold" style={{ color: '#FFB454' }}>
                  SCORE: {currentScore.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Active Mission Objective Panel */}
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
                <p className="text-[11px] mb-2" style={{ color: '#9AA8C7' }}>
                  {activeMission.briefing}
                </p>
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

            {/* Heading Compass Tape */}
            <div
              className={`flex-col items-center pointer-events-none mx-auto mobile-landscape-shrink-tc ${
                hudMode === 'full_hide' ? 'hidden' : 'hidden sm:flex'
              }`}
            >
              <div
                className="flex items-center gap-1.5 px-3 py-0.5 rounded-t-lg border-t border-x backdrop-blur-md"
                style={{ backgroundColor: 'rgba(13, 20, 40, 0.85)', borderColor: 'rgba(73, 217, 255, 0.3)' }}
              >
                <span className="text-[10px] font-mono tracking-wider" style={{ color: '#49D9FF' }}>
                  HDG
                </span>
                <span ref={(el) => (hudRefs.current.compassDegrees = el)} className="text-xs font-mono font-bold text-white">
                  000°
                </span>
              </div>
              <div
                className="w-56 h-5 overflow-hidden border-b border-x relative backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(5, 8, 22, 0.75)', borderColor: 'rgba(73, 217, 255, 0.3)' }}
              >
                <div
                  className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 z-10"
                  style={{ backgroundColor: '#ff4444' }}
                />
                <div
                  ref={(el) => (hudRefs.current.compassScroller = el)}
                  className="flex items-center h-full whitespace-nowrap text-[9px] font-mono select-none"
                  style={{ color: '#49D9FF', willChange: 'transform' }}
                >
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

            {/* Top-Right Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto ml-auto mobile-landscape-shrink-tr">
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
                    <span className="hidden sm:inline">
                      {hudMode === 'full' ? 'HUD: FULL' : hudMode === 'no_stats' ? 'HUD: MIN' : 'HUD: NO MAP'}
                    </span>
                  </>
                )}
              </button>

              {/* Fullscreen Toggle Button */}
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

              {/* Help / Controls Guide Button (?) - Hidden in HUD: MIN ('no_stats') & HUD: NO MAP ('no_stats_map') */}
              <button
                onClick={() => {
                  audioSystem.playUIClick();
                  setShowTutorial((t) => !t);
                }}
                className={`p-2 rounded-xl border backdrop-blur-md cursor-pointer ${
                  hudMode === 'no_stats' || hudMode === 'no_stats_map' ? 'hidden' : 'flex'
                }`}
                style={{ backgroundColor: 'rgba(13, 20, 40, 0.8)', borderColor: 'rgba(154, 168, 199, 0.25)' }}
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
            <div className="absolute left-2 sm:left-12 md:left-24 top-1/2 -translate-y-1/2 pointer-events-none opacity-45 flex items-center">
              <svg width="36" height="200" viewBox="0 0 36 200" fill="none">
                <path d="M30 10 C10 60 10 140 30 190" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 50 L8 50" stroke="#00f0ff" strokeWidth="1.5" />
                <path d="M14 100 L3 100" stroke="#00f0ff" strokeWidth="2.5" />
                <path d="M18 150 L8 150" stroke="#00f0ff" strokeWidth="1.5" />
                <text x="2" y="103" fill="#00f0ff" fontSize="8" fontFamily="monospace">
                  00
                </text>
              </svg>
            </div>
            <div className="absolute right-2 sm:right-12 md:right-24 top-1/2 -translate-y-1/2 pointer-events-none opacity-45 flex items-center">
              <svg width="36" height="200" viewBox="0 0 36 200" fill="none">
                <path d="M6 10 C26 60 26 140 6 190" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 50 L28 50" stroke="#00f0ff" strokeWidth="1.5" />
                <path d="M22 100 L33 100" stroke="#00f0ff" strokeWidth="2.5" />
                <path d="M18 150 L28 150" stroke="#00f0ff" strokeWidth="1.5" />
                <text x="17" y="103" fill="#00f0ff" fontSize="8" fontFamily="monospace">
                  ALT
                </text>
              </svg>
            </div>

            <div
              className="w-16 h-16 rounded-full border flex items-center justify-center"
              style={{ borderColor: 'rgba(73, 217, 255, 0.28)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#49D9FF' }} />
            </div>
            {cameraMode === 'COCKPIT' && (
              <div
                className="w-72 h-44 rounded-3xl border-x-2 border-t border-b pointer-events-none absolute"
                style={{ borderColor: 'rgba(73, 217, 255, 0.22)' }}
              />
            )}

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

          {/* Bottom HUD Row */}
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
                  <span className="text-[10px] uppercase tracking-wider block" style={{ color: '#9AA8C7' }}>
                    VELOCITY
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      ref={(el) => (hudRefs.current.speedValue = el)}
                      className="text-2xl font-extrabold font-mono"
                      style={{ color: '#49D9FF' }}
                    >
                      350
                    </span>
                    <span className="text-xs font-mono" style={{ color: '#9AA8C7' }}>
                      m/s
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider block" style={{ color: '#9AA8C7' }}>
                    THROTTLE
                  </span>
                  <span
                    ref={(el) => (hudRefs.current.throttleValue = el)}
                    className="text-sm font-bold font-mono"
                    style={{ color: '#F4F7FF' }}
                  >
                    35%
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#151F36' }}>
                <div
                  ref={(el) => (hudRefs.current.speedBar = el)}
                  className="h-full"
                  style={{ width: '35%', backgroundColor: '#49D9FF' }}
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="flex items-center gap-1" style={{ color: '#FFB454' }}>
                    <Zap className="w-3 h-3" /> WARP CAPACITOR [SHIFT]
                  </span>
                  <span ref={(el) => (hudRefs.current.boostValue = el)} className="font-mono">
                    100%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#151F36' }}>
                  <div
                    ref={(el) => (hudRefs.current.boostBar = el)}
                    className="h-full"
                    style={{ width: '100%', backgroundColor: '#FFB454' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="flex items-center gap-1" style={{ color: '#48E0A4' }}>
                    <Shield className="w-3 h-3" /> DEFLECTOR SHIELD
                  </span>
                  <span ref={(el) => (hudRefs.current.shieldValue = el)} className="font-mono">
                    120 / 120
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#151F36' }}>
                  <div
                    ref={(el) => (hudRefs.current.shieldBar = el)}
                    className="h-full"
                    style={{ width: '100%', backgroundColor: '#48E0A4' }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/50">
                <div
                  className="flex items-center justify-between text-[10px] font-mono mb-1.5"
                  style={{ color: '#9AA8C7' }}
                >
                  <span className="flex items-center gap-1 font-bold text-white">
                    <Crosshair className="w-3 h-3 text-cyan-400" /> WEAPONS [1 - 3]
                  </span>
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

            {/* Center: Interactive Tutorial & Analog / Movement Flight Pad */}
            <div className="flex flex-col items-center gap-2 pointer-events-auto mx-auto shrink-0">
              {/* Tutorial / Controls Guide Bar: Hidden when in HUD: MIN ('no_stats'), HUD: NO MAP ('no_stats_map'), or 'full_hide' */}
              {showTutorial && hudMode === 'full' && (
                <div
                  className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 px-3.5 py-2 rounded-xl border backdrop-blur-md text-[11px] sm:text-xs max-w-xl"
                  style={{
                    backgroundColor: 'rgba(13, 20, 40, 0.86)',
                    borderColor: 'rgba(154,168,199,0.2)',
                    color: '#9AA8C7'
                  }}
                >
                  <span>
                    <strong className="text-white">W/S</strong> Pitch
                  </span>
                  <span>
                    <strong className="text-white">A/D</strong> Yaw
                  </span>
                  <span>
                    <strong className="text-white">Q/E</strong> Roll
                  </span>
                  <span>
                    <strong className="text-white">SWIPE SCREEN</strong> Steer
                  </span>
                  <span>
                    <strong className="text-white">SHIFT</strong> Boost
                  </span>
                  <span>
                    <strong className="text-white">CTRL</strong> Brake
                  </span>
                  <span>
                    <strong className="text-white">SPACE / LMB</strong> Fire
                  </span>
                  <span>
                    <strong className="text-white">G / RMB</strong> Torpedo
                  </span>
                  <span>
                    <strong className="text-white">H</strong> HUD Mode
                  </span>
                </div>
              )}

              {/* Touch / On-Screen Flight Controls (Kept at 100% size on Mobile Landscape; hidden only in 'full_hide') */}
              <div className={`items-center gap-2 ${hudMode === 'full_hide' ? 'hidden' : 'flex'}`}>
                <div
                  className="grid grid-cols-3 gap-1 p-1.5 rounded-xl border backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(13,20,40,0.82)', borderColor: 'rgba(73,217,255,0.25)' }}
                >
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
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                style={{ color: '#49D9FF' }}
              >
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

      {/* VIEW 3: MISSIONS & CHALLENGES SCREEN */}
      {activeScreen === 'missions' && (
        <MissionsScreen
          saveData={saveData}
          setActiveScreen={setActiveScreen}
          startMission={startMission}
        />
      )}

      {/* VIEW 4: ORBITAL HANGAR & SHIP UPGRADES */}
      {activeScreen === 'hangar' && (
        <HangarScreen
          saveData={saveData}
          currentShipSpec={currentShipSpec}
          currentShipState={currentShipState}
          effectiveStats={effectiveStats}
          setActiveScreen={setActiveScreen}
          handleSelectOrUnlockShip={handleSelectOrUnlockShip}
          handleUpgradeShipSystem={handleUpgradeShipSystem}
        />
      )}

      {/* VIEW 5: PILOT PROFILE, COMBAT SCORE, HIGH SCORE & PLANETARY CODEX */}
      {activeScreen === 'profile' && (
        <PlayerProfileUI
          saveData={saveData}
          updateSaveData={updateSaveData}
          claimAchievement={claimAchievement}
        />
      )}

      {/* VIEW 6: SETTINGS & CONTROL CONFIGURATION */}
      {activeScreen === 'settings' && (
        <SettingsUI
          saveData={saveData}
          updateSaveData={updateSaveData}
          remappingAction={remappingAction}
          setRemappingAction={setRemappingAction}
          setConfirmResetOpen={setConfirmResetOpen}
          triggerToast={triggerToast}
        />
      )}

      {/* MODALS: PAUSE, MISSION RESULT & PROGRESS RESET */}
      <GameModals
        isPaused={isPaused}
        activeScreen={activeScreen}
        setIsPaused={setIsPaused}
        setActiveScreen={setActiveScreen}
        missionResult={missionResult}
        setMissionResult={setMissionResult}
        startMission={startMission}
        confirmResetOpen={confirmResetOpen}
        setConfirmResetOpen={setConfirmResetOpen}
        persistence={persistence}
        setSaveData={setSaveData}
        triggerToast={triggerToast}
      />
    </div>
  );
}
