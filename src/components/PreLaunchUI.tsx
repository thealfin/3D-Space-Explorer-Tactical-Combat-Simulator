import React from 'react';
import {
  Rocket,
  Compass,
  Shield,
  Zap,
  Globe,
  Settings,
  Play,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Crosshair,
  ChevronDown,
  Activity,
  Disc,
  Flame,
  Gauge,
  Navigation,
  Radio,
  Layers,
  Trophy
} from 'lucide-react';
import {
  SHIPS_CATALOG,
  MISSIONS_CATALOG,
  EXPEDITION_SECTORS
} from '../data/playerData';
import { audioSystem } from '../audio/soundEffects';

// ============================================================================
// KOMPONEN INTERFACE SEBELUM BERMAIN (PRE-LAUNCH DECK, HANGAR, MISSIONS & MODALS)
// ============================================================================

interface PreLaunchScreenProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  effectiveStats: any;
  saveData: any;
  startMission: (mission: any) => void;
  planetarySectionRef: React.RefObject<HTMLElement | null>;
  selectedSector: any;
  selectedSectorId: string;
  setSelectedSectorId: (id: string) => void;
  terminalLogs: string[];
  setTerminalLogs: React.Dispatch<React.SetStateAction<string[]>>;
  auxDeflectorSync: boolean;
  setAuxDeflectorSync: (val: boolean) => void;
  auxDroneUplink: boolean;
  setAuxDroneUplink: (val: boolean) => void;
  simRef: React.MutableRefObject<any>;
  triggerToast: (title: string, subtitle: string, type?: string) => void;
}

export const PreLaunchScreen: React.FC<PreLaunchScreenProps> = ({
  activeScreen,
  setActiveScreen,
  effectiveStats,
  saveData,
  startMission,
  planetarySectionRef,
  selectedSector,
  selectedSectorId,
  setSelectedSectorId,
  terminalLogs,
  setTerminalLogs,
  auxDeflectorSync,
  setAuxDeflectorSync,
  auxDroneUplink,
  setAuxDroneUplink,
  simRef,
  triggerToast
}) => {
  const highScore = Math.max(saveData.pilotProfile.highScore || 0, saveData.pilotProfile.score || 0);

  return (
    <div className="relative z-20 h-[calc(100vh-49px)] overflow-y-auto overflow-x-hidden scroll-smooth pointer-events-auto">
      {/* STAGE 1: HERO 3D SPACECRAFT DECK (ASTRAL VANGUARD) */}
      <section
        className="relative min-h-[calc(100vh-49px)] flex flex-col justify-between px-6 md:px-16 pt-10 pb-6"
        style={{
          background:
            'radial-gradient(circle at 72% 44%, rgba(0, 140, 255, 0.08) 0%, rgba(3, 6, 14, 0.42) 48%, rgba(2, 4, 10, 0.88) 100%)'
        }}
      >
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

          {/* 2x2 Telemetry Specs Grid */}
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
                <div className="text-xs font-mono font-bold text-slate-100">
                  85% Output ({effectiveStats.topSpeed * 10} m/s)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border shrink-0"
                style={{ backgroundColor: 'rgba(255, 180, 84, 0.08)', borderColor: 'rgba(255, 180, 84, 0.35)' }}
              >
                <Trophy className="w-3.5 h-3.5" style={{ color: '#FFB454' }} />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">HIGH SCORE</div>
                <div className="text-xs font-mono font-bold text-amber-300">
                  {highScore.toLocaleString()} PTS // {saveData.pilotProfile.callsign}
                </div>
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

      {/* STAGE 2: HELIOS SECTOR COMMAND NEXUS */}
      <section
        ref={planetarySectionRef}
        className="relative min-h-screen px-6 md:px-16 py-12 border-t flex flex-col justify-between"
        style={{
          backgroundColor: 'rgba(3, 6, 12, 0.96)',
          borderColor: 'rgba(0, 168, 255, 0.15)'
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div
              className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.24em] mb-1.5"
              style={{ color: '#00a8ff' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00a8ff' }} />
              <span>ASTRAL TELEMETRY // ORBITAL SCANNER</span>
            </div>
            <h2 className="text-3xl md:text-4xl tracking-tight uppercase">
              <span className="font-extrabold text-white">HELIOS SECTOR </span>
              <span className="font-light" style={{ color: '#94a3b8' }}>
                COMMAND NEXUS
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="px-4 py-2 rounded-lg border font-mono"
              style={{ backgroundColor: '#070b14', borderColor: 'rgba(148, 163, 184, 0.15)' }}
            >
              <div className="text-[9px] uppercase tracking-widest text-slate-500">LINK LATENCY</div>
              <div className="text-xs font-bold" style={{ color: '#00a8ff' }}>
                1.28 SEC SECURE
              </div>
            </div>
            <div
              className="px-4 py-2 rounded-lg border font-mono"
              style={{ backgroundColor: '#070b14', borderColor: 'rgba(148, 163, 184, 0.15)' }}
            >
              <div className="text-[9px] uppercase tracking-widest text-slate-500">TELEMETRY STREAM</div>
              <div className="text-xs font-bold" style={{ color: '#10b981' }}>
                ACTIVE FEED
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Planetary Mission Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto">
          <div className="lg:col-span-4 space-y-4">
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
                  <div className="text-xs font-bold mt-0.5" style={{ color: '#00a8ff' }}>
                    {selectedSector.magnetic}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Tilt Angle</div>
                  <div className="text-xs font-bold text-white mt-0.5">{selectedSector.tilt}</div>
                </div>
              </div>
            </div>

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
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#00a8ff', boxShadow: '0 0 8px #00a8ff' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CENTER COLUMN: Interactive High-Detail Planetary Globe Visualizer */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center py-6">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 168, 255, 0.32) 0%, rgba(0, 88, 255, 0.12) 55%, transparent 75%)',
                  filter: 'blur(18px)'
                }}
              />
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
                  <span className="font-bold" style={{ color: '#00a8ff' }}>
                    {selectedSector.targetName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">COORDINATES:</span>
                  <span className="text-white font-semibold">{selectedSector.coordinates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SIGNAL QUALITY:</span>
                  <span className="font-bold" style={{ color: '#10b981' }}>
                    100% SECURE
                  </span>
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

            <div
              className="p-5 rounded-xl border flex flex-col justify-between h-48"
              style={{ backgroundColor: '#060a12', borderColor: 'rgba(148, 163, 184, 0.14)' }}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: '#00a8ff' }}
                >
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
              <div
                className="text-[10px] font-mono font-bold uppercase tracking-widest"
                style={{ color: '#00a8ff' }}
              >
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
  );
};

interface MissionsScreenProps {
  saveData: any;
  setActiveScreen: (screen: string) => void;
  startMission: (mission: any) => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({
  saveData,
  setActiveScreen,
  startMission
}) => {
  return (
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
            className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer"
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

                <div
                  className="pt-3 border-t flex items-center justify-between gap-3"
                  style={{ borderColor: 'rgba(154,168,199,0.15)' }}
                >
                  <div className="text-xs font-mono">
                    <span style={{ color: '#48E0A4' }}>+{m.rewardCredits} CR</span>
                    <span className="mx-1.5" style={{ color: '#9AA8C7' }}>
                      •
                    </span>
                    <span style={{ color: '#7C5CFF' }}>+{m.rewardXP} XP</span>
                    {mState.bestTime !== null && (
                      <div className="text-[10px]" style={{ color: '#9AA8C7' }}>
                        BEST TIME: {mState.bestTime}s ({mState.attempts} runs)
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => startMission(m)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-transform hover:scale-105 cursor-pointer"
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
  );
};

interface HangarScreenProps {
  saveData: any;
  currentShipSpec: any;
  currentShipState: any;
  effectiveStats: any;
  setActiveScreen: (screen: string) => void;
  handleSelectOrUnlockShip: (ship: any) => void;
  handleUpgradeShipSystem: (shipId: string, systemKey: string) => void;
}

export const HangarScreen: React.FC<HangarScreenProps> = ({
  saveData,
  currentShipSpec,
  currentShipState,
  effectiveStats,
  setActiveScreen,
  handleSelectOrUnlockShip,
  handleUpgradeShipSystem
}) => {
  return (
    <div className="relative z-20 h-[calc(100vh-57px)] overflow-y-auto p-6 md:p-10 pointer-events-none">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3 pointer-events-auto">
          <div
            className="p-4 rounded-2xl border backdrop-blur-md"
            style={{ backgroundColor: 'rgba(13, 20, 40, 0.9)', borderColor: 'rgba(73, 217, 255, 0.25)' }}
          >
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
                <p className="text-xs mb-3" style={{ color: '#9AA8C7' }}>
                  {ship.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono" style={{ color: isUnlocked ? '#48E0A4' : '#FFB454' }}>
                    {isUnlocked ? (isSelected ? '● ACTIVE VESSEL' : 'UNLOCKED') : `COST: ${ship.unlockCost} CR`}
                  </span>
                  <button
                    onClick={() => handleSelectOrUnlockShip(ship)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold transition-transform hover:scale-105 cursor-pointer"
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

        <div className="hidden lg:block lg:col-span-2" />

        <div
          className="lg:col-span-5 p-5 rounded-2xl border backdrop-blur-md pointer-events-auto space-y-4"
          style={{ backgroundColor: 'rgba(13, 20, 40, 0.9)', borderColor: 'rgba(73, 217, 255, 0.3)' }}
        >
          <div
            className="flex items-center justify-between border-b pb-3"
            style={{ borderColor: 'rgba(154,168,199,0.15)' }}
          >
            <div>
              <div className="text-xs font-mono" style={{ color: '#49D9FF' }}>
                ENGINEERING WORKBENCH
              </div>
              <h3 className="text-lg font-bold">{currentShipSpec.name} Subsystems</h3>
            </div>
            <button
              onClick={() => setActiveScreen('playing')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              style={{ backgroundColor: '#49D9FF', color: '#050816' }}
            >
              LAUNCH SHIP
            </button>
          </div>

          {[
            { key: 'speed', label: 'Ion Thruster Drive', desc: 'Boosts top speed & acceleration', val: `${effectiveStats.topSpeed * 10} m/s` },
            { key: 'handling', label: 'Gyro Attitude Thrusters', desc: 'Improves pitch, yaw & roll response', val: `${effectiveStats.handling} rad/s` },
            { key: 'boost', label: 'Warp Plasma Capacitor', desc: 'Expands boost duration & recharge', val: `${effectiveStats.boostCapacity} MJ` },
            { key: 'shield', label: 'Deflector Shield Matrix', desc: 'Increases collision shield absorption', val: `${effectiveStats.shield} HP` }
          ].map((sys) => {
            const lvl = currentShipState.upgradeLevels?.[sys.key] || 1;
            const cost = lvl * 260;
            return (
              <div
                key={sys.key}
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.16)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <div className="text-xs font-bold">{sys.label}</div>
                    <div className="text-[11px]" style={{ color: '#9AA8C7' }}>
                      {sys.desc}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold" style={{ color: '#49D9FF' }}>
                      {sys.val}
                    </div>
                    <div className="text-[10px]" style={{ color: '#48E0A4' }}>
                      LVL {lvl} / 5
                    </div>
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
                    className="px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
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
  );
};

interface GameModalsProps {
  isPaused: boolean;
  activeScreen: string;
  setIsPaused: (val: boolean) => void;
  setActiveScreen: (screen: string) => void;
  missionResult: any;
  setMissionResult: (res: any) => void;
  startMission: (mission: any) => void;
  confirmResetOpen: boolean;
  setConfirmResetOpen: (open: boolean) => void;
  persistence: any;
  setSaveData: (data: any) => void;
  triggerToast: (title: string, subtitle: string, type?: string) => void;
}

export const GameModals: React.FC<GameModalsProps> = ({
  isPaused,
  activeScreen,
  setIsPaused,
  setActiveScreen,
  missionResult,
  setMissionResult,
  startMission,
  confirmResetOpen,
  setConfirmResetOpen,
  persistence,
  setSaveData,
  triggerToast
}) => {
  return (
    <>
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
                className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer"
                style={{ backgroundColor: '#49D9FF', color: '#050816' }}
              >
                RESUME FLIGHT
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  setActiveScreen('settings');
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-xs border cursor-pointer"
                style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.25)' }}
              >
                FLIGHT SETTINGS
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  setActiveScreen('main_menu');
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-xs border cursor-pointer"
                style={{ backgroundColor: '#151F36', borderColor: 'rgba(255,93,115,0.35)', color: '#FF5D73' }}
              >
                RETURN TO MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

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
                backgroundColor:
                  missionResult.status === 'completed' ? 'rgba(72,224,164,0.15)' : 'rgba(255,93,115,0.15)',
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
              <div
                className="p-4 rounded-xl border space-y-1 font-mono text-xs"
                style={{ backgroundColor: '#151F36', borderColor: 'rgba(72,224,164,0.3)' }}
              >
                <div>
                  COMPLETION TIME: <span className="text-white font-bold">{missionResult.timeSpent}s</span>
                </div>
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
                className="flex-1 py-2.5 rounded-xl font-bold text-xs border cursor-pointer"
                style={{ backgroundColor: '#151F36', borderColor: '#49D9FF', color: '#49D9FF' }}
              >
                RETRY MISSION
              </button>
              <button
                onClick={() => setMissionResult(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
                style={{ backgroundColor: '#49D9FF', color: '#050816' }}
              >
                CONTINUE FLIGHT
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div
            className="w-full max-w-sm p-6 rounded-2xl border text-center space-y-4"
            style={{ backgroundColor: '#0D1428', borderColor: '#FF5D73' }}
          >
            <AlertTriangle className="w-10 h-10 mx-auto" style={{ color: '#FF5D73' }} />
            <h3 className="text-lg font-bold">WIPE PILOT PROGRESSION?</h3>
            <p className="text-xs" style={{ color: '#9AA8C7' }}>
              This will permanently reset your pilot level, credits, high score, unlocked spacecraft, discovered planets, and mission records.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer"
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
                className="flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                style={{ backgroundColor: '#FF5D73', color: '#050816' }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

