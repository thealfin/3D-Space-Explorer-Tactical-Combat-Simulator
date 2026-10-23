import * as THREE from 'three';

// ============================================================================
// KOMPONEN ASET 3D: PLANET TATA SURYA, CINCIN SATURNUS, BLACK HOLE & MILKY WAY
// ============================================================================

export function createProceduralPlanetTexture(
  baseColorHex: number,
  secondaryHex: number,
  hasBands = false,
  preset = 'default'
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
  if (preset === 'earth') {
    grad.addColorStop(0.0, '#092347');
    grad.addColorStop(0.2, '#124982');
    grad.addColorStop(0.5, '#1964ad');
    grad.addColorStop(0.8, '#124982');
    grad.addColorStop(1.0, '#092347');
  } else if (preset === 'jupiter') {
    grad.addColorStop(0.0, '#6e553b');
    grad.addColorStop(0.18, '#c79c6d');
    grad.addColorStop(0.35, '#e6d8be');
    grad.addColorStop(0.5, '#b8683c');
    grad.addColorStop(0.68, '#ead7bd');
    grad.addColorStop(0.85, '#9d6b47');
    grad.addColorStop(1.0, '#5e4732');
  } else if (preset === 'saturn') {
    grad.addColorStop(0.0, '#78684e');
    grad.addColorStop(0.22, '#cbb48b');
    grad.addColorStop(0.5, '#f0dec0');
    grad.addColorStop(0.78, '#cbb48b');
    grad.addColorStop(1.0, '#78684e');
  } else {
    grad.addColorStop(0.0, `#${cDark.getHexString()}`);
    grad.addColorStop(0.18, `#${c2.getHexString()}`);
    grad.addColorStop(0.5, `#${c1.getHexString()}`);
    grad.addColorStop(0.82, `#${c2.getHexString()}`);
    grad.addColorStop(1.0, `#${cDark.getHexString()}`);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Neutral grey base for synthetic bump/normal heightmap
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, width, height);

  // Layer 1: Multi-frequency atmospheric bands & sinusoidal turbulent jetstreams
  const isBandedGiant = hasBands || preset === 'jupiter' || preset === 'saturn' || preset === 'venus';
  const bandCount = isBandedGiant ? 150 : 65;
  for (let i = 0; i < bandCount; i++) {
    const baseY = (i / bandCount) * height;
    const bandH = (isBandedGiant ? 5 : 9) + (i % 7) * 3.5;
    const alpha = isBandedGiant ? 0.08 + (i % 4) * 0.045 : 0.02 + (i % 3) * 0.015;

    if (preset === 'jupiter') {
      const jColors = [
        `rgba(248, 236, 214, ${alpha * 1.4})`,
        `rgba(181, 92, 48, ${alpha * 1.5})`,
        `rgba(214, 165, 114, ${alpha * 1.3})`,
        `rgba(105, 68, 44, ${alpha * 1.3})`
      ];
      ctx.fillStyle = jColors[i % jColors.length];
    } else if (preset === 'saturn') {
      ctx.fillStyle = i % 2 === 0 ? `rgba(255, 245, 220, ${alpha * 1.2})` : `rgba(148, 120, 82, ${alpha})`;
    } else {
      ctx.fillStyle = i % 2 === 0 ? `rgba(255, 250, 240, ${alpha})` : `rgba(8, 14, 30, ${alpha * 1.25})`;
    }

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= width; x += 32) {
      const wave =
        Math.sin((x / width) * Math.PI * 4 + i * 0.7) * (isBandedGiant ? 10 : 22) +
        Math.cos((x / width) * Math.PI * 10 - i * 1.3) * 4;
      ctx.lineTo(x, baseY + wave);
    }
    ctx.lineTo(width, baseY + bandH + 20);
    ctx.lineTo(0, baseY + bandH + 20);
    ctx.closePath();
    ctx.fill();

    bCtx.fillStyle = i % 2 === 0 ? 'rgba(210,210,210,0.08)' : 'rgba(45,45,45,0.08)';
    bCtx.fillRect(0, baseY, width, bandH);
  }

  // Layer 2: Preset-Specific Landmasses, Craters, Storms & Iconic Features
  if (preset === 'earth') {
    // Procedural Green & Golden-Tan Continents for Earth
    for (let i = 0; i < 240; i++) {
      const seed = i * 97.3;
      const x = (Math.sin(seed * 0.61) * 0.5 + 0.5) * width;
      const y = (Math.cos(seed * 0.37) * 0.5 + 0.5) * (height * 0.72) + height * 0.14;
      const rx = 38 + (i % 15) * 16;
      const ry = 24 + (i % 11) * 13;
      const rot = Math.sin(seed) * Math.PI;

      const landGrad = ctx.createRadialGradient(x, y, rx * 0.12, x, y, rx);
      if (i % 4 === 0) {
        // Golden Sahara / Australian desert interior
        landGrad.addColorStop(0, 'rgba(194, 162, 98, 0.72)');
        landGrad.addColorStop(0.65, 'rgba(54, 125, 68, 0.62)');
        landGrad.addColorStop(1, 'rgba(22, 101, 52, 0)');
      } else {
        // Lush Forest & Continental Green
        landGrad.addColorStop(0, 'rgba(46, 138, 72, 0.78)');
        landGrad.addColorStop(0.7, 'rgba(32, 98, 54, 0.55)');
        landGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(1, ry / Math.max(1, rx));
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fillStyle = landGrad;
      ctx.fill();
      ctx.restore();

      // Continental elevation on bump map
      bCtx.save();
      bCtx.translate(x, y);
      bCtx.rotate(rot);
      bCtx.scale(1, ry / Math.max(1, rx));
      bCtx.beginPath();
      bCtx.arc(0, 0, rx * 0.85, 0, Math.PI * 2);
      bCtx.fillStyle = 'rgba(225, 225, 225, 0.25)';
      bCtx.fill();
      bCtx.restore();
    }

    // North & South Polar Ice Caps (Arctic & Antarctica)
    ctx.fillStyle = 'rgba(244, 250, 255, 0.92)';
    ctx.fillRect(0, 0, width, height * 0.065);
    ctx.fillRect(0, height * 0.935, width, height * 0.065);
  } else if (preset === 'jupiter') {
    // Iconic Great Red Spot (Bintik Merah Besar Yupiter) in Southern Hemisphere
    const grsX = width * 0.62;
    const grsY = height * 0.66;
    ctx.save();
    ctx.translate(grsX, grsY);
    ctx.scale(1.85, 1.0);
    const grsGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 95);
    grsGrad.addColorStop(0, '#ff4d29');
    grsGrad.addColorStop(0.45, '#c93818');
    grsGrad.addColorStop(0.78, '#8f2912');
    grsGrad.addColorStop(0.92, 'rgba(245, 228, 200, 0.65)');
    grsGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grsGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (preset === 'neptune') {
    // Great Dark Spot on Neptune + High-altitude white methane scooter clouds
    const gdsX = width * 0.45;
    const gdsY = height * 0.58;
    ctx.save();
    ctx.translate(gdsX, gdsY);
    ctx.scale(1.7, 1.0);
    const gdsGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 75);
    gdsGrad.addColorStop(0, 'rgba(10, 22, 58, 0.92)');
    gdsGrad.addColorStop(0.7, 'rgba(20, 44, 105, 0.65)');
    gdsGrad.addColorStop(0.9, 'rgba(224, 242, 254, 0.55)');
    gdsGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gdsGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (preset === 'pluto') {
    // Tombaugh Regio (Bright Heart-shaped Nitrogen Glacier on Pluto)
    const hx = width * 0.52;
    const hy = height * 0.52;
    ctx.save();
    ctx.translate(hx, hy);
    const heartGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, 160);
    heartGrad.addColorStop(0, 'rgba(255, 250, 240, 0.85)');
    heartGrad.addColorStop(0.65, 'rgba(235, 220, 200, 0.5)');
    heartGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = heartGrad;
    ctx.beginPath();
    ctx.arc(-45, -20, 85, 0, Math.PI * 2);
    ctx.arc(45, -20, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (preset === 'mars') {
    // Valles Marineris Equatorial Canyon & Polar Ice Caps on Mars
    ctx.strokeStyle = 'rgba(68, 18, 6, 0.75)';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(width * 0.32, height * 0.52);
    ctx.bezierCurveTo(width * 0.42, height * 0.49, width * 0.54, height * 0.55, width * 0.66, height * 0.51);
    ctx.stroke();

    // Martian Polar Ice Caps
    ctx.fillStyle = 'rgba(255, 250, 245, 0.88)';
    ctx.fillRect(0, 0, width, height * 0.045);
    ctx.fillRect(0, height * 0.955, width, height * 0.045);
  }

  // General Multi-octave procedural landmass / tectonic / crater / storm vortex features
  const featureCount = isBandedGiant ? 180 : 320;
  for (let i = 0; i < featureCount; i++) {
    const seed = i * 137.5;
    const x = (Math.sin(seed * 0.73) * 0.5 + 0.5) * width;
    const y = (Math.cos(seed * 0.41) * 0.5 + 0.5) * (height * 0.84) + height * 0.08;
    const rx = (isBandedGiant ? 28 : 18) + (i % 13) * (isBandedGiant ? 14 : 11);
    const ry = (isBandedGiant ? 8 : 14) + (i % 9) * (isBandedGiant ? 4 : 9);
    const rot = isBandedGiant ? Math.sin(seed) * 0.12 : Math.sin(seed) * Math.PI;

    const featGrad = ctx.createRadialGradient(x, y, rx * 0.1, x, y, rx);
    if (preset === 'pyros') {
      featGrad.addColorStop(0, i % 3 === 0 ? 'rgba(255, 195, 0, 0.75)' : 'rgba(40, 12, 6, 0.65)');
      featGrad.addColorStop(1, 'rgba(0,0,0,0)');
    } else if (i % 3 === 0) {
      featGrad.addColorStop(
        0,
        `rgba(${Math.round(cLight.r * 255)}, ${Math.round(cLight.g * 255)}, ${Math.round(cLight.b * 255)}, 0.24)`
      );
      featGrad.addColorStop(1, 'rgba(255,255,255,0)');
    } else if (i % 3 === 1) {
      featGrad.addColorStop(
        0,
        `rgba(${Math.round(c2.r * 255)}, ${Math.round(c2.g * 255)}, ${Math.round(c2.b * 255)}, 0.28)`
      );
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
    bCtx.lineWidth = preset === 'mercury' || preset === 'moon' ? 4.0 : 2.5;
    bCtx.strokeStyle = 'rgba(245,245,245,0.28)';
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

let cachedSaturnRingTex: THREE.CanvasTexture | null = null;
export function createSaturnRingTexture(): THREE.CanvasTexture {
  if (cachedSaturnRingTex) return cachedSaturnRingTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 512);

  const cx = 256;
  const cy = 256;

  // Draw concentric ring bands with Cassini Division gap
  const ringStops = [
    { r: 118, w: 8, color: 'rgba(180, 160, 130, 0.25)' },  // C Ring inner
    { r: 132, w: 18, color: 'rgba(235, 212, 175, 0.78)' }, // B Ring inner
    { r: 154, w: 24, color: 'rgba(250, 232, 198, 0.92)' }, // B Ring main bright
    { r: 175, w: 8, color: 'rgba(12, 16, 28, 0.08)' },     // Cassini Division dark gap!
    { r: 192, w: 22, color: 'rgba(222, 198, 162, 0.74)' }, // A Ring main
    { r: 212, w: 4, color: 'rgba(15, 20, 35, 0.12)' },     // Encke Gap
    { r: 222, w: 10, color: 'rgba(210, 188, 152, 0.62)' }, // A Ring outer
    { r: 238, w: 4, color: 'rgba(245, 230, 200, 0.45)' }   // F Ring shepherd
  ];

  ringStops.forEach((band) => {
    ctx.beginPath();
    ctx.arc(cx, cy, band.r, 0, Math.PI * 2);
    ctx.strokeStyle = band.color;
    ctx.lineWidth = band.w;
    ctx.stroke();
  });

  // Fine concentric ice ringlets
  for (let r = 115; r <= 242; r += 2.5) {
    if (r > 170 && r < 180) continue; // Keep Cassini gap clear
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle =
      Math.sin(r * 1.7) > 0 ? 'rgba(255, 248, 235, 0.18)' : 'rgba(60, 48, 35, 0.15)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  cachedSaturnRingTex = new THREE.CanvasTexture(canvas);
  cachedSaturnRingTex.colorSpace = THREE.SRGBColorSpace;
  cachedSaturnRingTex.anisotropy = 8;
  return cachedSaturnRingTex;
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

  // Base Deep Cosmic Midnight Black & Galactic Indigo
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#010409');
  bgGrad.addColorStop(0.28, '#040d1a');
  bgGrad.addColorStop(0.5, '#071829');
  bgGrad.addColorStop(0.72, '#040c18');
  bgGrad.addColorStop(1, '#010308');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ==========================================================================
  // MILKY WAY (GALAKSI BIMA SAKTI) LUMINOUS BAND & GALACTIC CORE BULGE
  // ==========================================================================
  // 1. Diagonal Milky Way Stellar Band across the celestial sphere
  ctx.save();
  ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
  ctx.rotate(-0.18);

  const mwBandGrad = ctx.createLinearGradient(0, -240, 0, 240);
  mwBandGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
  mwBandGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.14)');
  mwBandGrad.addColorStop(0.45, 'rgba(254, 243, 199, 0.28)');
  mwBandGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.36)');
  mwBandGrad.addColorStop(0.55, 'rgba(244, 114, 182, 0.24)');
  mwBandGrad.addColorStop(0.75, 'rgba(14, 165, 233, 0.14)');
  mwBandGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = mwBandGrad;
  ctx.fillRect(-canvas.width, -240, canvas.width * 2, 480);

  // 2. Brilliant Milky Way Galactic Core Bulge (Sagittarius Region)
  const coreGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, 480);
  coreGrad.addColorStop(0, 'rgba(255, 251, 235, 0.82)');
  coreGrad.addColorStop(0.22, 'rgba(251, 191, 36, 0.52)');
  coreGrad.addColorStop(0.48, 'rgba(192, 132, 252, 0.28)');
  coreGrad.addColorStop(0.75, 'rgba(14, 165, 233, 0.12)');
  coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.save();
  ctx.scale(1.65, 0.55);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 480, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();

  // 3. Swirling H-II Magenta, Emerald-Teal & Cyan Nebula Streams
  const nebulaStreams = [
    { cx: 650, cy: 480, rx: 620, ry: 280, rot: -0.22, color1: 'rgba(13, 148, 136, 0.34)', color2: 'rgba(4, 47, 46, 0)' },
    { cx: 1380, cy: 520, rx: 720, ry: 340, rot: 0.28, color1: 'rgba(168, 85, 247, 0.30)', color2: 'rgba(59, 7, 100, 0)' },
    { cx: 1024, cy: 490, rx: 540, ry: 220, rot: -0.18, color1: 'rgba(245, 158, 11, 0.32)', color2: 'rgba(120, 53, 15, 0)' },
    { cx: 350, cy: 680, rx: 420, ry: 190, rot: -0.35, color1: 'rgba(6, 182, 212, 0.28)', color2: 'rgba(8, 51, 68, 0)' },
    { cx: 1750, cy: 360, rx: 460, ry: 210, rot: 0.2, color1: 'rgba(236, 72, 153, 0.22)', color2: 'rgba(80, 7, 36, 0)' }
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

  // 4. Great Rift Dark Interstellar Dust Lanes bisecting the Milky Way plane
  for (let i = 0; i < 42; i++) {
    ctx.save();
    const x = (i / 42) * canvas.width + Math.sin(i * 3.4) * 65;
    const y = canvas.height * 0.5 + (x - canvas.width * 0.5) * -0.18 + Math.cos(i * 2.1) * 55;
    const rx = 65 + (i % 7) * 18;
    const ry = 16 + (i % 5) * 6;
    ctx.translate(x, y);
    ctx.rotate(-0.18 + Math.sin(i * 1.7) * 0.25);
    ctx.scale(1, ry / rx);
    const dGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, rx);
    dGrad.addColorStop(0, 'rgba(2, 6, 14, 0.78)');
    dGrad.addColorStop(1, 'rgba(2, 6, 14, 0)');
    ctx.fillStyle = dGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. Dense Milky Way Star Clusters & Micro Stellar Dust (2,800 stars)
  for (let i = 0; i < 2800; i++) {
    const sx = Math.random() * canvas.width;
    // Concentrate 60% of stars along the Milky Way band
    const inBand = i < 1680;
    const bandCenterY = canvas.height * 0.5 + (sx - canvas.width * 0.5) * -0.18;
    const sy = inBand
      ? THREE.MathUtils.clamp(bandCenterY + (Math.random() - 0.5) * 280, 0, canvas.height)
      : Math.random() * canvas.height;
    const sr = Math.random() < 0.08 ? 1.8 + Math.random() * 1.5 : 0.5 + Math.random() * 0.85;
    const alpha = 0.35 + Math.random() * 0.65;
    const starPalette = [
      `rgba(254, 243, 199, ${alpha})`,
      `rgba(165, 243, 252, ${alpha})`,
      `rgba(244, 114, 182, ${alpha * 0.85})`,
      `rgba(255, 255, 255, ${alpha})`
    ];
    ctx.fillStyle = starPalette[i % starPalette.length];
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
  const sunGeo = new THREE.SphereGeometry(72, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe49e });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.copy(sunPos);

  const innerCoronaGeo = new THREE.SphereGeometry(96, 32, 32);
  const innerCoronaMat = createFresnelAtmosphereMaterial(0xff9500, 2.1);
  sunMesh.add(new THREE.Mesh(innerCoronaGeo, innerCoronaMat));

  const outerCoronaGeo = new THREE.SphereGeometry(128, 32, 32);
  const outerCoronaMat = createFresnelAtmosphereMaterial(0xff4500, 1.25);
  sunMesh.add(new THREE.Mesh(outerCoronaGeo, outerCoronaMat));

  return sunMesh;
}

export function buildBlackHoleMesh(obj: any): THREE.Group {
  const group = new THREE.Group();
  group.position.set(obj.position[0], obj.position[1], obj.position[2]);

  // 1. Pitch-Black Event Horizon Singularity Sphere
  const horizonGeo = new THREE.SphereGeometry(obj.radius * 0.58, 48, 36);
  const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
  group.add(horizonMesh);

  // 2. Relativistic Photon Ring & Gravitational Lensing Halo
  const photonGeo = new THREE.SphereGeometry(obj.radius * 0.65, 48, 36);
  const photonMat = createFresnelAtmosphereMaterial(0xffa500, 2.6);
  group.add(new THREE.Mesh(photonGeo, photonMat));

  const outerLensGeo = new THREE.SphereGeometry(obj.radius * 0.92, 48, 36);
  const outerLensMat = createFresnelAtmosphereMaterial(0x00f0ff, 1.45);
  group.add(new THREE.Mesh(outerLensGeo, outerLensMat));

  // 3. Swirling Relativistic Plasma Accretion Disk (Gargantua / Sgr A* style)
  const diskTex = createSaturnRingTexture();
  const diskGeo = new THREE.RingGeometry(obj.radius * 0.72, obj.radius * 2.4, 96);
  const diskMat = new THREE.MeshBasicMaterial({
    map: diskTex,
    color: 0xff7b00,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const diskMesh = new THREE.Mesh(diskGeo, diskMat);
  diskMesh.rotation.x = Math.PI / 2.25;
  diskMesh.userData.isCloudLayer = true;
  group.add(diskMesh);

  // Secondary vertical lensed arc (gravitational light bending over the top/bottom of the black hole)
  const lensedArcGeo = new THREE.RingGeometry(obj.radius * 0.68, obj.radius * 1.35, 96);
  const lensedArcMat = new THREE.MeshBasicMaterial({
    map: diskTex,
    color: 0xffb703,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.58,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const lensedArc = new THREE.Mesh(lensedArcGeo, lensedArcMat);
  lensedArc.rotation.x = 0.18;
  group.add(lensedArc);

  return group;
}

export function buildPlanetMesh(obj: any, cloudLayerTex: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  group.position.set(obj.position[0], obj.position[1], obj.position[2]);

  const preset = obj.planetPreset || 'default';
  const tex = createProceduralPlanetTexture(
    obj.color,
    obj.atmosphereColor,
    obj.hasRings || preset === 'jupiter' || preset === 'saturn',
    preset
  );
  const sphereGeo = new THREE.SphereGeometry(obj.radius, 64, 48);
  const sphereMat = new THREE.MeshStandardMaterial({
    map: tex,
    bumpMap: tex.userData?.bumpMap || null,
    bumpScale: preset === 'mercury' || preset === 'moon' ? 2.1 : 1.45,
    emissive: obj.emissiveColor,
    emissiveIntensity: preset === 'pyros' ? 0.55 : 0.25,
    roughness: preset === 'earth' ? 0.52 : 0.68,
    metalness: 0.14
  });
  const planetMesh = new THREE.Mesh(sphereGeo, sphereMat);
  planetMesh.castShadow = true;
  planetMesh.receiveShadow = true;
  if (obj.axialTilt) {
    planetMesh.rotation.z = obj.axialTilt;
  }
  group.add(planetMesh);

  if (obj.hasClouds) {
    const cloudGeo = new THREE.SphereGeometry(obj.radius * 1.018, 48, 36);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudLayerTex,
      transparent: true,
      opacity: preset === 'venus' ? 0.68 : 0.42,
      color: preset === 'venus' ? 0xffe4a0 : 0xffffff,
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

  // Planetary Rings (Saturn Multi-Band Cassini Rings, Uranus Vertical Rings, Jupiter/Neptune Rings)
  if (obj.hasRings) {
    const innerScale = obj.ringInnerScale || 1.32;
    const outerScale = obj.ringOuterScale || 2.15;
    const ringGeo = new THREE.RingGeometry(obj.radius * innerScale, obj.radius * outerScale, 96);
    const isSaturn = preset === 'saturn';
    const ringMat = new THREE.MeshStandardMaterial({
      map: isSaturn ? createSaturnRingTexture() : null,
      color: obj.ringColor || 0x8da4f7,
      emissive: obj.ringColor || 0x8da4f7,
      emissiveIntensity: isSaturn ? 0.28 : 0.18,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isSaturn ? 0.88 : 0.65,
      roughness: 0.35
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    if (preset === 'uranus') {
      // Uranus ~98 deg vertical rings!
      ringMesh.rotation.y = Math.PI / 3;
      ringMesh.rotation.x = 0.15;
    } else {
      ringMesh.rotation.x = Math.PI / 2.25;
      ringMesh.rotation.y = obj.axialTilt || 0.25;
    }
    group.add(ringMesh);
  }

  // Optional Orbiting Major Moons (e.g. Jupiter's Io & Europa, Saturn's Titan)
  if (Array.isArray(obj.moons)) {
    obj.moons.forEach((mSpec: any, idx: number) => {
      const moonPivot = new THREE.Group();
      moonPivot.rotation.y = idx * 2.1;
      moonPivot.userData.isCloudLayer = true; // Rotated automatically in the main loop
      const mGeo = new THREE.SphereGeometry(mSpec.radius, 24, 24);
      const mMat = new THREE.MeshStandardMaterial({
        color: mSpec.color,
        emissive: mSpec.color,
        emissiveIntensity: 0.18,
        roughness: 0.75
      });
      const mMesh = new THREE.Mesh(mGeo, mMat);
      mMesh.position.set(mSpec.distance, (idx - 0.5) * 12, 0);
      moonPivot.add(mMesh);
      group.add(moonPivot);
    });
  }

  return group;
}
