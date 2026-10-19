# ⏱️ AEON 60P — Haute Horlogerie 3D WebGL Showcase Template

An ultra-luxury, award-winning interactive 3D WebGL timepiece showcase website template crafted with **Three.js**, **GSAP ScrollTrigger**, and **Lenis Smooth Scroll**.

Designed with human-crafted Swiss/French haute horlogerie editorial aesthetics, featuring real-time mechanical animations, interactive 3D exploded disassembly view, physical PBR shaders, dynamic colorway customizer, horological Web Audio synthesis, and responsive viewport typography.

---

## 🌟 Key Features & Architecture

- **Interactive 3D WebGL Calibre Engine**:
  - Real-time 3D watch rendering with Three.js and custom physical PBR materials (sapphire crystal refractions, brushed stainless steel, DLC titanium, 18K yellow gold, 18K rose gold).
  - Authentic mechanical horology animations: continuous sweeping seconds hand, 4Hz (28,800 vph) oscillating balance wheel, pulsating hairspring, and kinetic oscillating rotor responding to scroll momentum and mouse physics.
- **Interactive 3D Disassembly / Exploded View**:
  - Explodes the timepiece into its individual mechanical layers in 3D space (_Tourbillon Escapement, Architectural Mainplate, Sunray Dial, Mainspring Barrel, Sapphire Caseback, Tungsten Rotor_).
  - 360° drag orbit controls with inertia + interactive component inspection modal card.
- **Scroll Choreography & Momentum (Lenis + GSAP)**:
  - Synchronized multi-section camera transitions through 13 distinct horology sections.
  - Split-text typography reveals, animated underline strokes, and parallax lookbook gallery.
- **Interactive Color Customizer**:
  - 4 luxury finishes (_Silver Steel, Deep Black DLC, 18K Pure Gold, 18K Rose Gold_) with real-time shader material swapping and synchronized CSS variable transitions.
- **Web Audio Horological Sound Engine**:
  - Procedural mechanical tick-tock, winding ratchet clicks, and cinematic sub-bass transition effects synthesized via the Web Audio API (100% offline, zero audio file dependencies).
- **Magnetic Custom Cursor**:
  - Fluid trailing physics with context-aware labels (_SWAP, HOLD TO EXPLORE, SELECT FINISH, DRAG, INSPECT_).
- **Multilingual Support**:
  - Built-in English & French translations with instant live switching.

---

## 📁 Project Structure

```
├── public/
│   ├── assets/
│   │   ├── fonts/           # Nekst & Inter typography (all weights)
│   │   ├── watch.glb        # 3D Watch CAD model
│   │   ├── envmap.exr       # Studio environment reflection map
│   │   ├── metal.exr        # Anisotropic metal roughness map
│   │   └── noise-solid.png  # Procedural noise texture
│   └── images/              # High-resolution lookbook & parts photography
├── src/
│   ├── animations/
│   │   └── ScrollController.js # GSAP ScrollTrigger + Lenis integration
│   ├── audio/
│   │   └── SoundEngine.js      # Web Audio API horological sound engine
│   ├── cursor/
│   │   └── CustomCursor.js     # Magnetic trailing custom cursor
│   ├── data/
│   │   └── content.js          # Multilingual data & specs dictionary
│   ├── styles/
│   │   └── main.css            # Complete luxury responsive stylesheet
│   ├── webgl/
│   │   └── WatchViewer.js      # Three.js 3D watch scene, shaders & ticker
│   └── main.js                 # Main application coordinator
├── index.html                  # Semantic HTML5 layout
├── vite.config.js              # Vite configuration
├── package.json                # Project dependencies and build scripts
└── .gitignore                  # Git ignore rules
```

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone or download the repository
git clone https://github.com/Muhammad112233-creator/aeon-watch.git
cd aeon-watch

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build static production release
npm run build
```

---

## 📄 License

MIT License. Free for personal, commercial, and educational use.
