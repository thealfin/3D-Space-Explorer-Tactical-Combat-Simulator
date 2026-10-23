import * as THREE from 'three';

// ============================================================================
// KOMPONEN ASET 3D: PLANET, BULAN, MATAHARI, ATMOSFER FRESNEL & GALAXY DOME
// ============================================================================

export function createProceduralPlanetTexture(
  baseColorHex: number,
  secondaryHex: number,
  hasBands = false
): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d')!;

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

export function createProceduralCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
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

export function createFresnelAtmosphereMaterial(
  atmosphereColorHex: number,
  intensity = 1.35
): THREE.ShaderMaterial {
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

let cachedGalaxySkyTex: THREE.CanvasTexture | null = null;
export function getGalaxySkyboxTexture(): THREE.CanvasTexture {
  if (cachedGalaxySkyTex) return cachedGalaxySkyTex;
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base Deep Cosmic Midnight Black/Emerald
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#02070e');
  bgGrad.addColorStop(0.3, '#04161a');
  bgGrad.addColorStop(0.5, '#071f24');
  bgGrad.addColorStop(0.75, '#031217');
  bgGrad.addColorStop(1, '#02060b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Swirling Emerald-Teal & Jade Cosmic Nebula Streams
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

  // Dark Cosmic Dust Rifts
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

export function createSolarStarMesh(sunPos: THREE.Vector3): THREE.Mesh {
  const sunGeo = new THREE.SphereGeometry(62, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd782 });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.copy(sunPos);

  const sunCoronaGeo = new THREE.SphereGeometry(86, 32, 32);
  const sunCoronaMat = createFresnelAtmosphereMaterial(0xff8800, 1.8);
  const sunCorona = new THREE.Mesh(sunCoronaGeo, sunCoronaMat);
  sunMesh.add(sunCorona);

  return sunMesh;
}

export function buildPlanetMesh(obj: any, cloudLayerTex: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  group.position.set(obj.position[0], obj.position[1], obj.position[2]);

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

  return group;
}

