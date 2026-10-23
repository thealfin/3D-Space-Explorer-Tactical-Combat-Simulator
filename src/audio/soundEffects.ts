// ============================================================================
// KOMPONEN SOUND EFFECT: MODULAR WEB AUDIO API SYNTHESIZER
// ============================================================================
import { DEFAULT_SAVE_DATA } from '../data/playerData';

export class SpaceAudioSystem {
  ctx: AudioContext | null;
  initialized: boolean;
  engineOsc: OscillatorNode | null;
  engineGain: GainNode | null;
  engineFilter: BiquadFilterNode | null;
  droneOsc1: OscillatorNode | null;
  droneOsc2: OscillatorNode | null;
  droneGain: GainNode | null;
  settings: typeof DEFAULT_SAVE_DATA.settings;

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
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
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

  updateVolumes(settings: typeof DEFAULT_SAVE_DATA.settings) {
    this.settings = settings;
    if (!this.initialized || !this.ctx) return;
    const muteFactor = settings.muted ? 0 : 1;
    const musicVol = settings.masterVolume * settings.musicVolume * muteFactor * 0.08;
    if (this.droneGain) {
      this.droneGain.gain.setTargetAtTime(musicVol, this.ctx.currentTime, 0.2);
    }
  }

  updateEngine(speedRatio: number, isBoosting: boolean, isPlaying: boolean) {
    if (!this.initialized || !this.ctx || !this.engineGain || !this.engineOsc || !this.engineFilter) return;
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

  playTone(freqStart: number, freqEnd: number, duration = 0.18, type: OscillatorType = 'sine', volScale = 0.2) {
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

export const audioSystem = new SpaceAudioSystem();

