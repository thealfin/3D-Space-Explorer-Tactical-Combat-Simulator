import React from 'react';
import { DEFAULT_SAVE_DATA, formatKeyCode } from '../data/playerData';
import { audioSystem } from '../audio/soundEffects';

// ============================================================================
// KOMPONEN SETTING & KONFIGURASI KONTROL GAME (GRAPHICS, AUDIO, TOUCH & KEYBINDS)
// ============================================================================

interface SettingsUIProps {
  saveData: any;
  updateSaveData: (updater: (prev: any) => any) => void;
  remappingAction: string | null;
  setRemappingAction: (action: string | null) => void;
  setConfirmResetOpen: (open: boolean) => void;
  triggerToast: (title: string, subtitle: string, type?: string) => void;
}

export const SettingsUI: React.FC<SettingsUIProps> = ({
  saveData,
  updateSaveData,
  remappingAction,
  setRemappingAction,
  setConfirmResetOpen,
  triggerToast
}) => {
  const touchSteeringEnabled = saveData.settings.touchDragSteering !== false;
  const touchSensitivity = saveData.settings.touchDragSensitivity ?? 1.0;

  return (
    <div className="relative z-20 h-[calc(100vh-57px)] overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div
          className="p-6 rounded-2xl border backdrop-blur-md space-y-6"
          style={{ backgroundColor: 'rgba(13, 20, 40, 0.94)', borderColor: 'rgba(73, 217, 255, 0.3)' }}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-4 border-b pb-4"
            style={{ borderColor: 'rgba(154,168,199,0.15)' }}
          >
            <div>
              <h2 className="text-2xl font-bold">SYSTEM & FLIGHT SETTINGS</h2>
              <p className="text-xs" style={{ color: '#9AA8C7' }}>
                Configure WebGL graphics quality, audio synthesizers, mobile touch-drag steering, and custom keybindings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audioSystem.playUIClick();
                  updateSaveData((prev) => ({
                    ...prev,
                    settings: structuredClone(DEFAULT_SAVE_DATA.settings)
                  }));
                  triggerToast('SETTINGS RESTORED', 'Default graphics, audio, and controls applied.', 'info');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer"
                style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.25)' }}
              >
                Reset Defaults
              </button>
              <button
                onClick={() => setConfirmResetOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer"
                style={{ backgroundColor: 'rgba(255, 93, 115, 0.15)', borderColor: '#FF5D73', color: '#FF5D73' }}
              >
                Wipe Save Data
              </button>
            </div>
          </div>

          {/* Graphics, Camera & Mobile Touch Steering Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#49D9FF' }}>
                GRAPHICS, CAMERA & TOUCH STEERING
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
                      className="px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer"
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
                  className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: saveData.settings.invertY ? '#48E0A4' : '#151F36',
                    color: saveData.settings.invertY ? '#050816' : '#9AA8C7'
                  }}
                >
                  {saveData.settings.invertY ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs">Desktop Mouse Pointer Steering</span>
                <button
                  onClick={() =>
                    updateSaveData((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, mouseSteering: !prev.settings.mouseSteering }
                    }))
                  }
                  className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: saveData.settings.mouseSteering ? '#48E0A4' : '#151F36',
                    color: saveData.settings.mouseSteering ? '#050816' : '#9AA8C7'
                  }}
                >
                  {saveData.settings.mouseSteering ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Mobile / Smartphone Touch-Drag Steering (Roblox / FPS Style) */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block text-cyan-300">
                      Touch-Drag Screen Steering (Roblox / FPS)
                    </span>
                    <span className="text-[10px]" style={{ color: '#9AA8C7' }}>
                      Swipe/drag anywhere on the 3D viewport to steer nose Pitch & Yaw
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      updateSaveData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          touchDragSteering: !(prev.settings.touchDragSteering !== false)
                        }
                      }))
                    }
                    className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                    style={{
                      backgroundColor: touchSteeringEnabled ? '#48E0A4' : '#151F36',
                      color: touchSteeringEnabled ? '#050816' : '#9AA8C7'
                    }}
                  >
                    {touchSteeringEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Touch-Drag Steering Sensitivity</span>
                    <span className="font-mono">{touchSensitivity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.1"
                    value={touchSensitivity}
                    onChange={(e) =>
                      updateSaveData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          touchDragSensitivity: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full accent-emerald-400"
                  />
                </div>
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
                { key: 'sfxVolume', label: 'Thruster & Telemetry SFX' }
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
                { id: 'camera', label: 'Cycle Camera' }
              ].map((act) => {
                const isListening = remappingAction === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => setRemappingAction(act.id)}
                    className="p-2.5 rounded-xl border text-left transition-all cursor-pointer"
                    style={{
                      backgroundColor: isListening ? 'rgba(73, 217, 255, 0.2)' : '#151F36',
                      borderColor: isListening ? '#49D9FF' : 'rgba(154,168,199,0.2)'
                    }}
                  >
                    <div className="text-[10px]" style={{ color: '#9AA8C7' }}>
                      {act.label}
                    </div>
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
  );
};

