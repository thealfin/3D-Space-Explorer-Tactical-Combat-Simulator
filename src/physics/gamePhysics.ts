import * as THREE from 'three';
import { WORLD_OBJECTS } from '../data/playerData';
import { audioSystem } from '../audio/soundEffects';
import {
  createTorpedoProjectileMesh,
  createPlasmaPulseProjectileMesh,
  createAutocannonBoltMesh,
  spawnExplosionVFX,
  spawnMuzzleFlashVFX
} from '../assets3d/destructibleAssets';

// ============================================================================
// KOMPONEN LOGIC & FISIKA GAME (6-DOF FLIGHT, TOUCH-DRAG STEERING, AI & RADAR)
// ============================================================================

export function fireShipWeapon(
  s: any,
  isSecondary: boolean,
  projectilesGroup: THREE.Group,
  playerProjectiles: any[],
  fxGroup: THREE.Group,
  vfxEntities: any[]
) {
  audioSystem.resume();
  const nowSec = performance.now() / 1000;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(s.quaternion).normalize();
  const bankQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), s.bankAngle || 0);
  const shipVisualQuat = s.quaternion.clone().multiply(bankQuat);

  const aimPoint = s.targetLockedEntity?.pos
    ? s.targetLockedEntity.pos.clone()
    : s.position.clone().addScaledVector(fwd, 160);

  if (isSecondary || s.activeWeapon === 3) {
    if (nowSec - s.lastSecondaryFireTime < 0.72) return;
    s.lastSecondaryFireTime = nowSec;
    audioSystem.playTorpedoLaunch();

    const torpGroup = createTorpedoProjectileMesh();
    const muzzleOffset = new THREE.Vector3(0, -0.42, -3.2).applyQuaternion(shipVisualQuat);
    const spawnPos = s.position.clone().add(muzzleOffset);
    torpGroup.position.copy(spawnPos);
    torpGroup.quaternion.copy(shipVisualQuat);
    projectilesGroup.add(torpGroup);

    spawnMuzzleFlashVFX(fxGroup, vfxEntities, spawnPos, 0xc084fc, 1.8);

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
    if (nowSec - s.lastFireTime < 0.20) return;
    s.lastFireTime = nowSec;
    audioSystem.playPlasmaShot();

    [-2.18, 2.18].forEach((sideX) => {
      const plasmaGroup = createPlasmaPulseProjectileMesh();
      const muzzleOffset = new THREE.Vector3(sideX, -0.46, -2.35).applyQuaternion(shipVisualQuat);
      const spawnPos = s.position.clone().add(muzzleOffset);
      plasmaGroup.position.copy(spawnPos);

      const shotDir = aimPoint.clone().sub(spawnPos).normalize();
      plasmaGroup.lookAt(spawnPos.clone().add(shotDir));
      projectilesGroup.add(plasmaGroup);

      spawnMuzzleFlashVFX(fxGroup, vfxEntities, spawnPos, 0x00f0ff, 1.25);

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
    if (nowSec - s.lastFireTime < 0.10) return;
    s.lastFireTime = nowSec;
    s.autocannonAlt = !s.autocannonAlt;
    audioSystem.playLaserShot(s.autocannonAlt);

    const boltGroup = createAutocannonBoltMesh();
    const sideX = s.autocannonAlt ? -2.18 : 2.18;
    const muzzleOffset = new THREE.Vector3(sideX, -0.46, -2.35).applyQuaternion(shipVisualQuat);
    const spawnPos = s.position.clone().add(muzzleOffset);
    boltGroup.position.copy(spawnPos);

    const shotDir = aimPoint.clone().sub(spawnPos).normalize();
    boltGroup.lookAt(spawnPos.clone().add(shotDir));
    projectilesGroup.add(boltGroup);

    spawnMuzzleFlashVFX(fxGroup, vfxEntities, spawnPos, 0xff5500, 0.95);

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
}

export function updateFlightPhysicsStep(
  s: any,
  dt: number,
  now: number,
  shipAnchor: THREE.Group,
  currentShipMesh: THREE.Group | null,
  leftThruster: any,
  rightThruster: any,
  forwardVec: THREE.Vector3
) {
  const b = s.settings.bindings;
  const invertSign = s.settings.invertY ? -1 : 1;

  // Decay Mobile/Roblox Touch-Drag Steering Velocity smoothly
  s.touchDragYaw = THREE.MathUtils.lerp(s.touchDragYaw || 0, 0, Math.min(1, dt * 11));
  s.touchDragPitch = THREE.MathUtils.lerp(s.touchDragPitch || 0, 0, Math.min(1, dt * 11));

  let pitchInput =
    ((s.keys.has(b.pitchUp) || s.keys.has('ArrowDown') ? 1 : 0) -
      (s.keys.has(b.pitchDown) || s.keys.has('ArrowUp') ? 1 : 0)) *
      invertSign +
    s.touchInput.pitch * invertSign +
    (s.touchDragPitch || 0) * invertSign;

  let yawInput =
    (s.keys.has(b.yawLeft) || s.keys.has('ArrowLeft') ? 1 : 0) -
    (s.keys.has(b.yawRight) || s.keys.has('ArrowRight') ? 1 : 0) -
    s.touchInput.yaw +
    (s.touchDragYaw || 0);

  let rollInput =
    (s.keys.has(b.rollLeft) ? 1 : 0) -
    (s.keys.has(b.rollRight) ? 1 : 0) +
    s.touchInput.roll -
    (s.touchDragYaw || 0) * 0.45;

  // Optional Desktop Mouse Pointer Offset Steering
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
    if (s.keys.has('KeyR')) s.throttle = Math.min(1.0, s.throttle + 0.5 * dt);
    if (s.keys.has('KeyV')) s.throttle = Math.max(0.0, s.throttle - 0.5 * dt);
    if (s.throttle < 0.25 && !wantsBrake) s.throttle = THREE.MathUtils.lerp(s.throttle, 0.42, dt * 0.8);
  }

  const maxSpd = s.effectiveStats.topSpeed * (s.isBoosting ? 1.72 : 1.0);
  const targetSpeed = wantsBrake ? 8 : s.throttle * maxSpd;
  s.speed = THREE.MathUtils.lerp(s.speed, targetSpeed, dt * (s.isBoosting ? 4.5 : 2.6));

  forwardVec.set(0, 0, -1).applyQuaternion(s.quaternion);
  s.velocity.copy(forwardVec).multiplyScalar(s.speed);

  // Apply Supernova Cosmic Explosion Knockback Impulse
  if (s.knockbackVelocity && s.knockbackVelocity.lengthSq() > 0.05) {
    s.position.addScaledVector(s.knockbackVelocity, dt);
    s.knockbackVelocity.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, dt * 3.6));
  }

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
    thrusterFlames.forEach((fl: THREE.Mesh) => {
      fl.scale.set(1, flameScale + Math.sin(now * 0.04) * 0.12, 1);
    });
    if (s.shieldFlash > 0) {
      s.shieldFlash = Math.max(0, s.shieldFlash - dt * 2.5);
      shieldMat.opacity = s.shieldFlash * 0.65;
    } else {
      shieldMat.opacity = 0;
    }
  }

  // Regenerate shield slowly
  s.shieldCurrent = Math.min(s.effectiveStats.shield, s.shieldCurrent + 2.5 * dt);

  // Update Thruster Streams
  const updateThrusterStream = (stream: any, offsetLocal: THREE.Vector3) => {
    stream.hist.pop();
    const nozzleWorld = offsetLocal.clone().applyQuaternion(s.quaternion).add(s.position);
    stream.hist.unshift(nozzleWorld);
    const pAttr = stream.geo.attributes.position;
    for (let i = 0; i < stream.count; i++) {
      const pt = stream.hist[i];
      pAttr.setXYZ(i, pt.x, pt.y, pt.z);
    }
    pAttr.needsUpdate = true;
    stream.mat.size = s.isBoosting ? 4.8 : 3.2;
    stream.points.visible = s.settings.particleDensity !== 'Low';
  };

  updateThrusterStream(leftThruster, new THREE.Vector3(-0.76, 0.36, 3.2));
  updateThrusterStream(rightThruster, new THREE.Vector3(0.76, 0.36, 3.2));

  audioSystem.updateEngine(s.speed / s.effectiveStats.topSpeed, s.isBoosting, true);
}

export function renderTacticalRadar(
  rCanvas: HTMLCanvasElement | null,
  s: any,
  forwardVec: THREE.Vector3,
  missionMeshes: THREE.Object3D[],
  spaceMines?: any[],
  activeComets?: any[],
  destructibleStars?: any[]
) {
  if (!rCanvas) return;
  const rCtx = rCanvas.getContext('2d');
  if (!rCtx) return;

  const w = rCanvas.width;
  const hSize = rCanvas.height;
  const cx = w / 2;
  const cy = hSize / 2;
  const radarRange = 1450;

  rCtx.clearRect(0, 0, w, hSize);
  rCtx.strokeStyle = 'rgba(73, 217, 255, 0.22)';
  rCtx.lineWidth = 1;
  [0.33, 0.66, 0.95].forEach((rScale) => {
    rCtx.beginPath();
    rCtx.arc(cx, cy, (w / 2) * rScale, 0, Math.PI * 2);
    rCtx.stroke();
  });

  rCtx.beginPath();
  rCtx.moveTo(cx, 6);
  rCtx.lineTo(cx, hSize - 6);
  rCtx.moveTo(6, cy);
  rCtx.lineTo(w - 6, cy);
  rCtx.stroke();

  const yawAngle = Math.atan2(forwardVec.x, -forwardVec.z);

  WORLD_OBJECTS.forEach((wo) => {
    const dx = wo.position[0] - s.position.x;
    const dz = wo.position[2] - s.position.z;
    const rx = dx * Math.cos(-yawAngle) - dz * Math.sin(-yawAngle);
    const rz = dx * Math.sin(-yawAngle) + dz * Math.cos(-yawAngle);

    const px = cx + (rx / radarRange) * (w * 0.45);
    const py = cy + (rz / radarRange) * (hSize * 0.45);
    if (Math.hypot(px - cx, py - cy) < w * 0.46) {
      rCtx.fillStyle =
        wo.category === 'black_hole'
          ? '#C084FC'
          : wo.category === 'station'
          ? '#48E0A4'
          : wo.zoneType.includes('HAZARD')
          ? '#FF5D73'
          : '#49D9FF';
      rCtx.beginPath();
      rCtx.arc(px, py, wo.category === 'black_hole' ? 5.2 : wo.category === 'planet' ? 4.0 : 3, 0, Math.PI * 2);
      rCtx.fill();
    }
  });

  if (spaceMines) {
    rCtx.fillStyle = 'rgba(255, 65, 95, 0.85)';
    spaceMines.forEach((m) => {
      if (!m.alive) return;
      const dx = m.mesh.position.x - s.position.x;
      const dz = m.mesh.position.z - s.position.z;
      const rx = dx * Math.cos(-yawAngle) - dz * Math.sin(-yawAngle);
      const rz = dx * Math.sin(-yawAngle) + dz * Math.cos(-yawAngle);
      const px = cx + (rx / radarRange) * (w * 0.45);
      const py = cy + (rz / radarRange) * (hSize * 0.45);
      if (Math.hypot(px - cx, py - cy) < w * 0.45) {
        rCtx.fillRect(px - 1.2, py - 1.2, 2.4, 2.4);
      }
    });
  }

  if (activeComets) {
    rCtx.fillStyle = '#38BDF8';
    activeComets.forEach((c) => {
      if (!c.alive) return;
      const dx = c.mesh.position.x - s.position.x;
      const dz = c.mesh.position.z - s.position.z;
      const rx = dx * Math.cos(-yawAngle) - dz * Math.sin(-yawAngle);
      const rz = dx * Math.sin(-yawAngle) + dz * Math.cos(-yawAngle);
      const px = cx + (rx / radarRange) * (w * 0.45);
      const py = cy + (rz / radarRange) * (hSize * 0.45);
      if (Math.hypot(px - cx, py - cy) < w * 0.45) {
        rCtx.beginPath();
        rCtx.arc(px, py, 2.5, 0, Math.PI * 2);
        rCtx.fill();
      }
    });
  }

  if (destructibleStars) {
    destructibleStars.forEach((star) => {
      if (!star.alive) return;
      const dx = star.position.x - s.position.x;
      const dz = star.position.z - s.position.z;
      const rx = dx * Math.cos(-yawAngle) - dz * Math.sin(-yawAngle);
      const rz = dx * Math.sin(-yawAngle) + dz * Math.cos(-yawAngle);
      const px = cx + (rx / radarRange) * (w * 0.45);
      const py = cy + (rz / radarRange) * (hSize * 0.45);
      if (Math.hypot(px - cx, py - cy) < w * 0.45) {
        rCtx.fillStyle = '#FDE047';
        rCtx.beginPath();
        rCtx.arc(px, py, 4.2, 0, Math.PI * 2);
        rCtx.fill();
        rCtx.strokeStyle = '#F59E0B';
        rCtx.lineWidth = 1.2;
        rCtx.stroke();
      }
    });
  }

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

  rCtx.fillStyle = '#F4F7FF';
  rCtx.beginPath();
  rCtx.moveTo(cx, cy - 5);
  rCtx.lineTo(cx - 4, cy + 4);
  rCtx.lineTo(cx + 4, cy + 4);
  rCtx.closePath();
  rCtx.fill();
}

