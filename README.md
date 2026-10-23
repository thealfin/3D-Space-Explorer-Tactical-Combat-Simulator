# 🚀 ASTRAL VANGUARD — 3D Space Explorer & Tactical Combat Simulator

**Astral Vanguard (Game Space 3D)** adalah game simulasi eksplorasi luar angkasa dan pertempuran armada taktis berbasis web 3D yang dibangun menggunakan **React 18**, **Three.js (WebGL 2.0)**, **TypeScript**, dan **Tailwind CSS**. Proyek ini menghadirkan pengalaman terbang 6-DOF yang responsif, visual galaksi prosedural beresolusi tinggi dengan efek *Post-Processing Unreal Bloom*, sistem persenjataan plasma & torpedo 3D, serta antarmuka *Pre-Launch Command Nexus* bergaya *sci-fi* modern.

---

## ✨ Fitur Utama

### 1. Antarmuka Pre-Launch & Helios Sector Command Nexus
- **Stage 1 — Hero 3D Spacecraft Deck (`ASTRAL VANGUARD`)**: Menampilkan pratinjau langsung pesawat 3D di atas latar galaksi interaktif, lengkap dengan matriks telemetri pesawat (*Fusion Core*, *Deflector*, *Throttle Thrust*, *Coordinates*), serta tombol aksi cepat (**LAUNCH FREE FLIGHT** dan **COMBAT MISSION: DREADNOUGHT KRONOS**).
- **Stage 2 — Planetary Scanner (`HELIOS SECTOR // COMMAND NEXUS`)**: Menampilkan bola dunia 3D bertekstur resolusi tinggi dengan pemindai spektrometer interaktif, diagnostik atmosferik (`N₂`, `O₂`, `Argon & CO₂`), konstanta fisik planet, log terminal komando, serta pemilihan sektor ekspedisi (**Sector Alpha, Beta, Gamma, Delta**).

### 2. Visual 3D Resolusi Tinggi & Post-Processing (WebGL 2.0)
- **Pipeline Rendering Modern**: Menggunakan `THREE.WebGLRenderer` dengan *ACES Filmic Tone Mapping* (`exposure: 1.35`), *PCFSoftShadowMap*, dan *Dynamic Pixel Ratio* (`Math.min(window.devicePixelRatio, 2)`).
- **Unreal Bloom Post-Processing**: Terintegrasi dengan `EffectComposer`, `RenderPass`, `UnrealBloomPass`, dan `OutputPass` untuk menghasilkan pendaran cahaya neon cyan dan *hazard orange* yang tajam pada mesin pendorong, proyektil senjata, dan bintang.
- **Lingkungan Galaksi & Benda Langit Prosedural**:
  - *Equirectangular Galaxy Skybox* (`4096×2048`) dengan pita galaksi spiral *emerald-cyan* dan *deep indigo*.
  - Tekstur planet prosedural (`2048×1024`) dengan *multi-frequency noise*, *synthetic bump mapping*, lapisan awan berputar, serta *Fresnel Atmospheric Rim Glow Shader*.
  - Multi-layer *starfield* dengan variasi magnitudo bintang, nebula volumetrik, dan partikel *space dust* dinamis yang bereaksi terhadap kecepatan pesawat.

### 3. Rekonstruksi Armada Pesawat 3D Modular
Tersedia **3 pesawat luar angkasa** yang dapat dibuka dan dikustomisasi di **Orbital Hangar**:
| ID | Nama Pesawat | Peran | Kecepatan | Akselerasi | Handling | Boost | Shield | Biaya Unlock |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `vanguard_vx1` | **VX-01 Corsair Vanguard** | *Tactical Strike Interceptor* | 135 | 68 | 1.85 | 100 | 120 | Gratis (Lv. 1) |
| `phantom_nx7` | **NX-07 Phantom** | *High-Velocity Interceptor* | 185 | 95 | 2.35 | 140 | 100 | 1.200 CR (Lv. 2) |
| `titan_at99` | **AT-99 Titan** | *Heavy Deep-Core Cruiser* | 155 | 76 | 1.65 | 165 | 220 | 2.400 CR (Lv. 3) |

- **Detail Arsitektur Mesh (`VX-01 Corsair Vanguard`)**:
  - *Fuselage* multi-faceted berwarna *matte charcoal* metalik.
  - Kanopi kokpit kaca *amber/golden* reflektif.
  - *Forward canards* & *wingtips* beraksen *hazard orange* lengkap dengan decal prosedural (lambang tengkorak surya & garis peringatan hazard).
  - *Twin Dorsal Engine Nacelles* dengan cincin pembuangan panas oranye menyala dan *cone* plasma cyan.
  - Sepasang *Underwing Heavy Autocannon Pods* berlapis laras ganda.
  - Jejak partikel pendorong kembar (*Twin Sparkling Emerald-Cyan Thruster Trails*) dan gelembung perisai energi heksagonal (*Energy Shield Bubble*).

### 4. Sistem Persenjataan 3D & Pertempuran Armada
Pesawat dilengkapi dengan **3 mode senjata** yang memiliki proyektil 3D volumetrik, *muzzle flash* di ujung laras sayap, serta konvergensi bidikan otomatis (*aim convergence*) ke arah reticle bidik:
1. **`[1] CANNON` — Rapid Plasma Autocannon**: Tembakan beruntun ganda berkecepatan tinggi dengan inti plasma putih-panas, selubung neon cyan/hijau, dan ekor energi memanjang.
2. **`[2] PLASMA` — Dual Plasma Orb Launcher**: Tembakan bola plasma kembar berdaya hancur tinggi untuk meruntuhkan perisai dan struktur berat.
3. **`[3] TORP` — Heavy Homing Proton Torpedo**: Torpedo pelacak berdaya ledak masif dengan hulu ledak oranye-emas dan cincin pendorong energi.

#### Perbedaan Mode Terbang:
- **Free Flight (Eksplorasi Bebas)**: Kapal induk musuh dan skuadron di sektor Tartarus berada dalam mode pasif (tidak menembak), memungkinkan pemain menjelajahi seluruh sistem Helios, memindai objek langit, atau berlatih menembak asteroid dan target dengan leluasa.
- **Combat Mission (`06 // Operation Eclipse: Strike Dreadnought Kronos`)**: Kapal induk tempur **DREADNOUGHT KRONOS** dan skuadron pengawal (**WRAITH INTERCEPTOR** & **AEGIS SENTINEL**) aktif melakukan manuver dan menembakkan meriam ke arah pemain. Pemain dapat menghancurkan:
  - Asteroid berkawah (*Destructible Cratered Asteroids*) di sabuk Tartarus.
  - Pesawat tempur pengawal (`WRAITH INTERCEPTOR` & `AEGIS SENTINEL`).
  - **4 Turret Pertahanan** (`PULSE BATTERY`) dan **Anjungan Komando** (`CITADEL BRIDGE`) di atas kapal induk.
  - Perisai dan lambung utama **DREADNOUGHT KRONOS** hingga meledak dan membuka **Extraction Warp Gate**.

### 5. Sistem Benda Langit (Helios System)
Terdapat **7 lokasi utama** yang dapat ditemukan dan dipindai menggunakan *Telemetry Scanner* (`[F]`):
1. **Aurelia Prime** (*Safe Zone*) — Planet samudra *super-terran* dengan terumbu bioluminesensi.
2. **Selene-IV Moon** (*Safe Zone*) — Bulan silikat terkunci pasang surut dengan menara relai otomatis.
3. **Krios Orbital Station** (*Safe Hub*) — Stasiun luar angkasa sentrifugal berputar yang menjadi markas utama pilot Vanguard.
4. **Pyros V** (*Hazard Sector*) — Proto-planet hiper-vulkanik dengan sungai magma tektonik.
5. **Cryon-9 Ringed Giant** (*Deep Space*) — Raksasa es megah dengan cincin reflektif glasial.
6. **Tartarus Asteroid Core** (*Danger Zone*) — Sabuk asteroid logam berdensitas tinggi dan lokasi armada *Dreadnought Kronos*.
7. **Chronos Anomaly Relay** (*Restricted Anomaly*) — Stabilisator hiper-dimensi kuno di perbatasan Nebula Violet.

### 6. Daftar Misi Kampanye
1. `01 // Orbital Vector Calibration` (*Cadet*) — Terbang melewati 5 cincin vektor holografik menuju Aurelia Prime.
2. `02 // Helios Sector Cartography` (*Navigator*) — Pindai telemetri Aurelia Prime, Selene-IV Moon, dan Krios Orbital Station.
3. `03 // Tartarus Core Extraction` (*Specialist*) — Kumpulkan 5 *Quantum Energy Cores* di tengah sabuk asteroid Tartarus.
4. `04 // Krios High-Speed Trench Run` (*Veteran*) — Pacu *afterburner* melewati koridor berkecepatan tinggi menuju Cryon-9.
5. `05 // Chronos Anomaly Expedition` (*Commander*) — Lintasi suar telemetri jarak jauh melewati Pyros V menuju Chronos Anomaly Relay.
6. `06 // Operation Eclipse: Strike Dreadnought Kronos` (*Legendary*) — Hancurkan skuadron pengawal, rontokkan *Pulse Battery* & *Citadel Bridge* milik kapal induk *Dreadnought Kronos*, dan ekstraksi melalui *Warp Gate*.

### 7. Sistem Upgrade, Progression & Web Audio Synthesizer
- **4 Subsistem Upgrade (Level 1–5)**: *Ion Thruster Drive* (Top Speed), *Gyro Attitude Thrusters* (Handling), *Warp Plasma Capacitor* (Boost Capacity), dan *Deflector Shield Matrix* (Shield HP).
- **Penyimpanan Otomatis (`IndexedDB` & `localStorage`)**: Menyimpan kredit, XP, level pilot, pesawat yang dibuka, level upgrade, *achievements* (termasuk *Dreadnought Bane*), serta pengaturan grafis & keybinding.
- **Procedural Web Audio Engine**: Seluruh efek suara (tembakan meriam plasma, peluncuran torpedo, *afterburner*, benturan perisai, ledakan besar, *scanner*, dan interaksi UI) disintesis secara *real-time* menggunakan **Web Audio API** (`AudioContext`) tanpa memerlukan aset file audio eksternal.

---

## 🛠️ Teknologi yang Digunakan

- **Framework UI**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Engine 3D & Shaders**: [Three.js r160](https://threejs.org/) (`WebGLRenderer`, `EffectComposer`, `UnrealBloomPass`, Custom GLSL Shaders)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Ikonografi**: [Lucide React](https://lucide.dev/)
- **Build Tool & Bundler**: [Vite 5](https://vitejs.dev/)

---

## 📂 Struktur Direktori

```text
Game Space 3D/
├── src/
│   ├── main.tsx                 # Entry point React DOM
│   └── index.css                # Konfigurasi Tailwind CSS & custom styling
├── space_explorer_3d.tsx        # Komponen utama: Engine 3D, Shaders, Fisika, Combat, Audio & UI
├── index.html                   # Template HTML utama
├── package.json                 # Daftar dependensi dan script proyek
├── tsconfig.json                # Konfigurasi TypeScript
├── vite.config.ts               # Konfigurasi bundler Vite
├── tailwind.config.js           # Konfigurasi tema Tailwind CSS
└── postcss.config.js            # Konfigurasi PostCSS
```

---

## 🚀 Cara Instalasi & Menjalankan Proyek

Pastikan **Node.js** (v18+) dan **pnpm** sudah terpasang di perangkat Anda.

1. **Instal seluruh dependensi:**
   ```bash
   pnpm install
   ```

2. **Jalankan server pengembangan (Development Mode dengan HMR):**
   ```bash
   pnpm dev
   ```
   Buka browser dan akses `http://localhost:3000/` (atau port yang ditampilkan pada terminal).

3. **Build untuk produksi (Production Build):**
   ```bash
   pnpm build
   ```

4. **Pratinjau hasil build produksi:**
   ```bash
   pnpm preview
   ```

---

## 🎮 Panduan Kontrol Permainan

| Tombol / Input | Fungsi |
| :--- | :--- |
| **`W` / `S`** | Tukik Bawah / Atas (*Pitch Nose Down / Up*) |
| **`A` / `D`** | Belok Kiri / Kanan (*Yaw Left / Right*) |
| **`Q` / `E`** | Miringkan Pesawat Kiri / Kanan (*Roll Left / Right*) |
| **`Shift`** | Aktifkan *Warp Plasma Boost* |
| **`Ctrl`** | Rem Pendorong (*Thruster Brake*) |
| **`Space` / `Klik Kiri Mouse (LMB)`** | Tembakkan Senjata Aktif (Tahan untuk tembakan beruntun) |
| **`G` / `Klik Kanan Mouse (RMB)`** | Luncurkan *Quantum Energy Torpedo* |
| **`1` / `2` / `3`** | Ganti Senjata (`[1] CANNON`, `[2] PLASMA`, `[3] TORP`) |
| **`F` (Tahan)** | Pindai Benda Langit / Stasiun (*Telemetry Scan*) saat berada dalam jarak sensor |
| **`C`** | Ganti Mode Kamera (*Chase Cam* / *Cockpit Cam* / *Cinematic Orbit Cam* / *Free Look*) |
| **`H` / `Tab`** | Ganti Mode Visibilitas HUD (4 Mode: *Full* → *Hide Stats & Header* → *Hide Map* → *Full Hide*) |
| **`P` / `Esc`** | Jeda Permainan (*Pause Menu*) |
| **Drag Mouse di Kanvas** | Mengarahkan Pandangan & Reticle Bidikan (*Free-Look & Aim Steering*) |
