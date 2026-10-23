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

### 5. Replika Planet Tata Surya, Galaksi Milky Way & Benda Langit (16 Lokasi)
Terdapat **16 objek astronomi utama** (replika planet-planet Tata Surya, lubang hitam supermasif Galaksi Bima Sakti / *Milky Way*, singularitas Gargantua, serta stasiun dan anomali) yang dapat ditemukan dan dipindai menggunakan *Telemetry Scanner* (`[F]`):
1. **Mercury (Hermes-I)** (*Inner Solar Zone*) — Planet terdalam penuh kawah meteorit tua dan tebing kompresi *Caloris Basin*.
2. **Venus (Cytherea-II)** (*Thermal Hazard*) — Planet berselimut awan asam sulfat kuning-emas super-rotasi dengan efek rumah kaca ekstrem.
3. **Earth / Terra (Aurelia Prime)** (*Safe Zone*) — Replika Bumi dengan benua hijau-cokelat, samudra biru dalam, lapisan es kutub, dan awan siklon putih.
4. **The Moon / Luna (Selene-IV)** (*Safe Zone*) — Satelit alami Bumi dengan dataran *Lunar Maria* basaltik gelap dan kawah *Tycho*.
5. **Mars (Ares-IV)** (*Frontier Zone*) — Planet merah berkarat dengan ngarai raksasa *Valles Marineris*, gunung *Olympus Mons*, dan tudung es kutub.
6. **Jupiter (Jove-V)** (*Gravity Hazard*) — Raksasa gas terbesar di Tata Surya dengan pita awan amonia, badai **Great Red Spot**, dan bulan **Io** & **Europa** yang mengorbit secara *real-time*.
7. **Saturn (Cronus-VI)** (*Ringed Sector*) — Raksasa gas keemasan dengan sistem cincin es berlapis (**Cincin A, B, C & Celah Cassini Division**) serta bulan **Titan**.
8. **Uranus (Caelus-VII)** (*Cryo Sector*) — Raksasa es *cyan-aquamarine* yang berotasi miring ekstrem (`98°`) lengkap dengan cincin vertikal tipis.
9. **Neptune (Cryon-9)** (*Deep Space*) — Raksasa es biru kobalt terdalam dengan angin supersonik dan pusaran badai **Great Dark Spot**.
10. **Pluto & Charon** (*Kuiper Rim*) — Planet katai Sabuk Kuiper dengan gletser nitrogen berbentuk hati (**Tombaugh Regio**) dan bulan pendamping **Charon**.
11. **Sagittarius A\* (Milky Way Core)** (*Black Hole Singularity*) — Lubang hitam supermasif di pusat Galaksi Bima Sakti (*Milky Way*) lengkap dengan *Event Horizon*, *Photon Ring*, dan *Relativistic Accretion Disk* berputar serta gaya tarik gravitasi nyata.
12. **Gargantua Singularity (Deep Rift)** (*Gravitational Anomaly*) — Singularitas lubang hitam berotasi ekstrem dengan vorteks akresi ungu-kebiruan dan horizon peristiwa penarik materi.
13. **Krios Orbital Station** (*Safe Hub*) — Stasiun luar angkasa sentrifugal berputar yang menjadi markas utama pilot Vanguard.
14. **Pyros-7 Volcanic World** (*Hazard Sector*) — Exoplanet hiper-vulkanik dengan sungai magma tektonik.
15. **Kryos Asteroid Belt Core** (*Danger Zone*) — Sabuk asteroid logam berdensitas tinggi dan lokasi armada *Dreadnought Kronos*.
16. **Chronos Anomaly Relay** (*Restricted Anomaly*) — Stabilisator hiper-dimensi kuno di perbatasan Nebula Violet.

### 6. Bintang Bersinar, Ledakan Kosmik & Kawanan Komet Dinamis
- **Gaya Gravitasi Nyata Black Hole**: Mendekati lubang hitam (*Sagittarius A\** atau *Gargantua*) dalam radius `< 460m` memicu tarikan gravitasi eksponensial ke arah singularitas, getaran kamera (*camera shake*), serta kompresi singularitas jika melewati *Event Horizon*.
- **Bintang-Bintang Bersinar yang Dapat Dihancurkan (*Destructible Radiant Stars*)**:
  - *Solaris Flare Dwarf*, *Rigel Blue Hypergiant*, dan *Pyros Radiant Proto-Star* yang memiliki korona radiatif volumetrik, lidah api surya (*prominences*) berputar, dan HP bar (`480 - 750 HP`).
  - **Ledakan Kosmik (Supernova Blast) & Efek Knockback**: Ketika bintang bersinar hancur oleh tembakan pesawat, terjadi ledakan supernova kosmik raksasa (gelombang kejut bola berdiameter `180m+`, kilatan putih-emas menyilaukan, dan audio sub-bass gemuruh) yang **menghempaskan/melempar pesawat pemain menjauhi bintang dengan impuls knockback berkecepatan tinggi (`290 m/s`)**, getaran kamera intens, dan kilatan perisai (`+1.200 PTS`).
- **Kawanan Komet Bergerak Dinamis (*14+ Criss-Crossing Comets*)**:
  - 14 komet es aktif (*Halley-IX, Neowise-Prime, Hale-Bopp VII, Encke, Swift-Tuttle, Hyakutake*, dll.) yang meluncur di bidang orbit saling bersilangan dengan kecepatan relatif bervariasi (`18 - 36 m/s`) dan ekor ion bercahaya.
  - **Bisa Ditembak & Dihancurkan**: Pemain dapat mengunci komet dan menembaknya hingga meledak menjadi serpihan es kristal bertebaran dan debu kuantum (`+150 PTS`).
- **Ranjau Luar Angkasa EMP (`EMP Proximity Mines`)**: 36 ranjau berduri dengan lampu suar merah berkedip yang meledak otomatis dalam radius `18.5m` (`+120 PTS`).
- **Puing Satelit & Bangkai Kapal (`Derelict Ship & Satellite Debris`)**: 26 bangkai satelit dan rangka lambung kapal yang berputar di jalur orbit (`+90 PTS`).
- **Sabuk Asteroid (155 Asteroid)**: Sabuk asteroid silikat (`grey`), besi (`red`), dan kristal es Sabuk Kuiper (`ice`).

### 7. Daftar Misi Kampanye
1. `01 // Orbital Vector Calibration` (*Cadet*) — Terbang melewati 5 cincin vektor holografik di sekitar Bumi dan Bulan.
2. `02 // Inner Solar System Cartography` (*Navigator*) — Pindai telemetri Bumi, Bulan, Merkurius, Venus, dan Mars.
3. `03 // Kryos Belt Core Extraction` (*Specialist*) — Kumpulkan 5 *Quantum Energy Cores* di tengah sabuk asteroid Kryos.
4. `04 // Gas Giant Ring Trench Run` (*Veteran*) — Pacu *afterburner* melewati koridor berkecepatan tinggi melintasi Jupiter dan cincin Saturnus menuju Neptunus.
5. `05 // Outer Rim & Milky Way Core Expedition` (*Commander*) — Lintasi suar telemetri jarak jauh melewati Uranus dan Pluto menuju lubang hitam Sagittarius A*.
6. `06 // Operation Eclipse: Strike Dreadnought Kronos` (*Legendary*) — Hancurkan skuadron pengawal, rontokkan *Pulse Battery* & *Citadel Bridge* milik kapal induk *Dreadnought Kronos*, dan ekstraksi melalui *Warp Gate*.
7. `07 // Solar System Grand Tour (Voyager Protocol)` (*Grand Explorer*) — Pindai kedelapan planet Tata Surya dari Merkurius hingga Neptunus serta lubang hitam pusat Galaksi Bima Sakti (*Sagittarius A\**).

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

## 📂 Struktur Direktori (Arsitektur Modular)

```text
Game Space 3D/
├── src/
│   ├── assets3d/                # Komponen Aset 3D Prosedural & Shaders
│   │   ├── shipAssets.ts        # Mesh pesawat pemain, decal Corsair, hull greeble & thruster trails
│   │   ├── planetAssets.ts      # Tekstur planet 2K, awan, shader atmosfer Fresnel & skybox galaksi
│   │   ├── destructibleAssets.ts# Asteroid berkawah, proyektil 3D, muzzle flash, ledakan & warp portal
│   │   ├── enemyAssets.ts       # Pesawat tempur musuh (Wraith/Aegis) & kapal induk Dreadnought Kronos
│   │   └── spaceObjectsAssets.ts# Stasiun Krios, Chronos Anomaly, Orbital Launch Bay, sabuk asteroid & nebula
│   ├── data/
│   │   └── playerData.ts        # Katalog pesawat/planet/misi, data pemain, poin tempur, high score & persistensi
│   ├── audio/
│   │   └── soundEffects.ts      # Synthesizer efek suara real-time (Web Audio API)
│   ├── physics/
│   │   └── gamePhysics.ts       # Fisika terbang 6-DOF, kemudi geser layar (Touch-Drag), AI tempur & radar
│   ├── components/
│   │   ├── PreLaunchUI.tsx      # Antarmuka Pre-Launch Deck, Planetary Scanner, Hangar, Missions & Modals
│   │   ├── PlayerProfileUI.tsx  # Profil Pilot, Skor Tempur, High Score, Achievements & Exploration Codex
│   │   └── SettingsUI.tsx       # Pengaturan Grafis, Audio, Sensitivitas Geser Layar Mobile & Keybindings
│   ├── main.tsx                 # Entry point React DOM
│   └── index.css                # Konfigurasi Tailwind CSS & aturan responsif Mobile Landscape
├── space_explorer_3d.tsx        # Orkestrator utama: Scene WebGL, HUD Penerbangan & State Permainan
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
| **`H` / `Tab`** | Ganti Mode Visibilitas HUD (4 Mode: *Full* → *HUD: MIN* → *HUD: NO MAP* → *Full Hide*) |
| **`P` / `Esc`** | Jeda Permainan (*Pause Menu*) |
| **Geser Layar (Mobile Touch-Drag / Swipe)** | Mengarahkan moncong pesawat (*Pitch & Yaw* + *Roll Banking*) secara mulus ala Roblox / FPS Mobile (mendukung *multi-touch* bersamaan dengan tombol *FIRE/BOOST*) |
| **Drag Mouse di Kanvas** | Mengarahkan Pandangan & Reticle Bidikan (*Free-Look & Aim Steering*) |
