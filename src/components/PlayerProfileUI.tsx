import React from 'react';
import { Award, Globe, Trophy, Crosshair, Flame } from 'lucide-react';
import {
  MISSIONS_CATALOG,
  ACHIEVEMENTS_CATALOG,
  WORLD_OBJECTS,
  checkAchievementUnlocked
} from '../data/playerData';

// ============================================================================
// KOMPONEN DATA PEMAIN, POIN TEMPUR & HIGH SCORE UI (PILOT PROFILE & CODEX)
// ============================================================================

interface PlayerProfileUIProps {
  saveData: any;
  updateSaveData: (updater: (prev: any) => any) => void;
  claimAchievement: (ach: any) => void;
}

export const PlayerProfileUI: React.FC<PlayerProfileUIProps> = ({
  saveData,
  updateSaveData,
  claimAchievement
}) => {
  const currentScore = saveData.pilotProfile.score || 0;
  const highScore = Math.max(saveData.pilotProfile.highScore || 0, currentScore);
  const enemiesDestroyed = saveData.pilotProfile.enemiesDestroyed || 0;
  const asteroidsDestroyed = saveData.pilotProfile.asteroidsDestroyed || 0;

  return (
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
              <div className="text-xs font-mono" style={{ color: '#9AA8C7' }}>
                PILOT SERVICE RECORD // {saveData.pilotProfile.id}
              </div>
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
                <span className="text-xs" style={{ color: '#9AA8C7' }}>
                  (Editable Callsign)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: '#151F36', borderColor: 'rgba(154,168,199,0.15)' }}>
              <div className="text-[10px]" style={{ color: '#9AA8C7' }}>EXPERIENCE</div>
              <div className="text-sm font-bold font-mono" style={{ color: '#49D9FF' }}>
                {saveData.pilotProfile.experience} XP
              </div>
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
                {Object.values(saveData.missions).filter((m: any) => m.status === 'completed').length} / {MISSIONS_CATALOG.length}
              </div>
            </div>
          </div>
        </div>

        {/* Combat Score & High Score Telemetry Deck */}
        <div
          className="p-6 rounded-2xl border backdrop-blur-md"
          style={{ backgroundColor: 'rgba(13, 20, 40, 0.92)', borderColor: 'rgba(255, 180, 84, 0.35)' }}
        >
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: '#FFB454' }} />
            <span>TACTICAL COMBAT POINTS & HIGH SCORE RECORD</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-xl border flex items-center gap-3"
              style={{ backgroundColor: '#151F36', borderColor: 'rgba(255, 180, 84, 0.35)' }}
            >
              <Trophy className="w-7 h-7 shrink-0" style={{ color: '#FFB454' }} />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#9AA8C7' }}>
                  ALL-TIME HIGH SCORE
                </div>
                <div className="text-xl font-extrabold font-mono" style={{ color: '#FFB454' }}>
                  {highScore.toLocaleString()} PTS
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex items-center gap-3"
              style={{ backgroundColor: '#151F36', borderColor: 'rgba(73, 217, 255, 0.25)' }}
            >
              <Crosshair className="w-7 h-7 shrink-0" style={{ color: '#49D9FF' }} />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#9AA8C7' }}>
                  TOTAL COMBAT SCORE
                </div>
                <div className="text-xl font-extrabold font-mono" style={{ color: '#49D9FF' }}>
                  {currentScore.toLocaleString()} PTS
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex items-center gap-3"
              style={{ backgroundColor: '#151F36', borderColor: 'rgba(72, 224, 164, 0.25)' }}
            >
              <Flame className="w-7 h-7 shrink-0" style={{ color: '#48E0A4' }} />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#9AA8C7' }}>
                  HOSTILES DESTROYED
                </div>
                <div className="text-xl font-extrabold font-mono" style={{ color: '#48E0A4' }}>
                  {enemiesDestroyed} UNITS
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex items-center gap-3"
              style={{ backgroundColor: '#151F36', borderColor: 'rgba(124, 92, 255, 0.25)' }}
            >
              <Award className="w-7 h-7 shrink-0" style={{ color: '#7C5CFF' }} />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#9AA8C7' }}>
                  ASTEROIDS SHATTERED
                </div>
                <div className="text-xl font-extrabold font-mono" style={{ color: '#7C5CFF' }}>
                  {asteroidsDestroyed} ROCKS
                </div>
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
              const unlocked = checkAchievementUnlocked(ach.id, saveData);
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
                    <div className="text-xs mb-3" style={{ color: '#9AA8C7' }}>
                      {ach.desc}
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between pt-2 border-t"
                    style={{ borderColor: 'rgba(154,168,199,0.1)' }}
                  >
                    <span className="text-xs font-mono" style={{ color: '#48E0A4' }}>
                      +{ach.reward} CR
                    </span>
                    {claimed ? (
                      <span className="text-xs font-mono font-bold" style={{ color: '#48E0A4' }}>
                        ✓ CLAIMED
                      </span>
                    ) : unlocked ? (
                      <button
                        onClick={() => claimAchievement(ach)}
                        className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                        style={{ backgroundColor: '#FFB454', color: '#050816' }}
                      >
                        CLAIM REWARD
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono" style={{ color: '#9AA8C7' }}>
                        LOCKED
                      </span>
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
                    {discovered
                      ? obj.description
                      : 'Approach within orbital scanner range in Free Flight to record telemetry.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

