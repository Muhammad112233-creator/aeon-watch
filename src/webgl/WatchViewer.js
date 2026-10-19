import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

export class WatchViewer {
  constructor(containerId, onLoadedCallback) {
    this.container = document.getElementById(containerId);
    this.onLoaded = onLoadedCallback;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.watchGroup = new THREE.Group();
    this.watchParts = {
      crystalFront: null,
      crystalBack: null,
      bezel: null,
      dial: null,
      hands: [],
      secondsHand: null,
      minutesHand: null,
      hoursHand: null,
      mainplate: null,
      barrel: null,
      tourbillon: null,
      balanceWheel: null,
      hairSpring: null,
      palletFork: null,
      rotor: null,
      bracelet: null,
      screws: [],
      rubies: [],
      allMeshes: []
    };

    this.materials = {
      metalGlossy: null,
      metalBrushed: null,
      metalDark: null,
      gold: null,
      roseGold: null,
      dialMat: null,
      glassMat: null,
      rubyMat: null,
      rotorMat: null,
      currentTheme: 'first'
    };

    this.scrollProgress = 0;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isExploded = false;
    this.selectedPartIndex = null;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.dragRotation = { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.hotspotElements = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.clock = new THREE.Clock();
    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 7.2);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.setupLights();

    // 5. Environment Map / Materials
    this.setupMaterials();

    // 6. Watch Model
    this.scene.add(this.watchGroup);
    this.loadWatchModel();

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.setupInteractions();

    // 8. Ticker
    this.animate();
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 7);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe8f0ff, 2.2);
    rimLight.position.set(-6, -4, 4);
    this.scene.add(rimLight);

    const topRimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    topRimLight.position.set(0, 10, -5);
    this.scene.add(topRimLight);

    const pointLight = new THREE.PointLight(0xfff5e6, 2.0, 15);
    pointLight.position.set(0, 1, 3);
    this.scene.add(pointLight);
  }

  setupMaterials() {
    // Generate an HDR-like procedural studio environment reflection map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(10, 32, 16);
    const envMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide
    });
    const envMesh = new THREE.Mesh(envGeo, envMat);
    envScene.add(envMesh);

    // Add bright studio light strips to the reflection sphere
    const lightStripGeo = new THREE.PlaneGeometry(12, 4);
    const lightStripMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const strip1 = new THREE.Mesh(lightStripGeo, lightStripMat);
    strip1.position.set(0, 6, 4);
    strip1.lookAt(0, 0, 0);
    envScene.add(strip1);

    const strip2 = new THREE.Mesh(lightStripGeo, lightStripMat);
    strip2.position.set(-6, -2, -3);
    strip2.lookAt(0, 0, 0);
    envScene.add(strip2);

    const envRenderTarget = pmremGenerator.fromScene(envScene);
    this.scene.environment = envRenderTarget.texture;

    // PBR Materials
    this.materials.metalBrushed = new THREE.MeshStandardMaterial({
      color: 0xd8d8dc,
      metalness: 0.95,
      roughness: 0.28,
      envMapIntensity: 1.6
    });

    this.materials.metalGlossy = new THREE.MeshPhysicalMaterial({
      color: 0xe8e8ec,
      metalness: 0.98,
      roughness: 0.12,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.0
    });

    this.materials.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.02,
      transmission: 0.95,
      thickness: 1.2,
      transparent: true,
      opacity: 0.35,
      ior: 1.77, // Sapphire glass IOR
      reflectivity: 0.9,
      envMapIntensity: 1.8
    });

    this.materials.rubyMat = new THREE.MeshPhysicalMaterial({
      color: 0xc40038,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.7,
      transparent: true,
      opacity: 0.9,
      ior: 1.76,
      emissive: 0x550015,
      emissiveIntensity: 0.3
    });

    this.materials.dialMat = new THREE.MeshStandardMaterial({
      color: 0x222226,
      metalness: 0.8,
      roughness: 0.35,
      envMapIntensity: 1.2
    });

    this.materials.rotorMat = new THREE.MeshStandardMaterial({
      color: 0xc8c8cd,
      metalness: 0.95,
      roughness: 0.22,
      envMapIntensity: 1.8
    });
  }

  loadWatchModel() {
    const loader = new GLTFLoader();

    loader.load(
      'assets/watch.glb',
      (gltf) => {
        const root = gltf.scene;
        root.scale.set(1.4, 1.4, 1.4);
        root.rotation.set(0, 0, 0);

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            this.watchParts.allMeshes.push(child);
            this.classifyAndSkinMesh(child);
          }
        });

        this.watchGroup.add(root);

        // Fallback procedural hairspring & balance wheel if missing in nodes
        this.ensureMechanicalComponents();

        if (this.onLoaded) this.onLoaded();
      },
      undefined,
      (err) => {
        console.warn('GLTF loading fallback to procedural geometry:', err);
        this.buildProceduralWatch();
        if (this.onLoaded) this.onLoaded();
      }
    );
  }

  classifyAndSkinMesh(mesh) {
    const name = (mesh.name || '').toLowerCase();
    const parentName = (mesh.parent?.name || '').toLowerCase();

    // Store original Z position for explosion
    mesh.userData.initialPos = mesh.position.clone();
    mesh.userData.initialRot = mesh.rotation.clone();

    if (name.includes('crystal') || name.includes('glass')) {
      mesh.material = this.materials.glassMat;
      if (name.includes('front')) this.watchParts.crystalFront = mesh;
      if (name.includes('back')) this.watchParts.crystalBack = mesh;
    } else if (name.includes('ruby')) {
      mesh.material = this.materials.rubyMat;
      this.watchParts.rubies.push(mesh);
    } else if (name.includes('dial')) {
      mesh.material = this.materials.dialMat;
      this.watchParts.dial = mesh;
    } else if (name.includes('weight') || name.includes('rotor')) {
      mesh.material = this.materials.rotorMat;
      this.watchParts.rotor = mesh;
    } else if (name.includes('seconds') || name.includes('hand-seconds')) {
      mesh.material = this.materials.metalGlossy;
      this.watchParts.secondsHand = mesh;
    } else if (name.includes('hand-minutes') || name.includes('minutes')) {
      mesh.material = this.materials.metalGlossy;
      this.watchParts.minutesHand = mesh;
    } else if (name.includes('hand-hours') || name.includes('hours')) {
      mesh.material = this.materials.metalGlossy;
      this.watchParts.hoursHand = mesh;
    } else if (name.includes('tourbillon') || name.includes('balance')) {
      mesh.material = this.materials.metalGlossy;
      this.watchParts.tourbillon = mesh;
    } else if (name.includes('mainplate')) {
      mesh.material = this.materials.metalBrushed;
      this.watchParts.mainplate = mesh;
    } else if (name.includes('barrel')) {
      mesh.material = this.materials.metalBrushed;
      this.watchParts.barrel = mesh;
    } else if (name.includes('bracelet') || name.includes('strap') || name.includes('clasp')) {
      mesh.material = this.materials.metalBrushed;
      this.watchParts.bracelet = mesh;
    } else if (name.includes('screw')) {
      mesh.material = this.materials.metalGlossy;
      this.watchParts.screws.push(mesh);
    } else {
      mesh.material = this.materials.metalBrushed;
    }
  }

  ensureMechanicalComponents() {
    // If hairspring or balance wheel was not isolated in GLTF nodes, build real-time animated hairspring & balance wheel
    if (!this.watchParts.balanceWheel) {
      const balanceGroup = new THREE.Group();
      balanceGroup.position.set(0, -0.4, 0.1);

      // Gold/Rhodium balance rim with 4 spokes and regulating screws
      const rimGeo = new THREE.TorusGeometry(0.35, 0.022, 16, 48);
      const rimMesh = new THREE.Mesh(rimGeo, this.materials.metalGlossy);
      balanceGroup.add(rimMesh);

      const spokeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.7, 12);
      const spoke1 = new THREE.Mesh(spokeGeo, this.materials.metalGlossy);
      const spoke2 = new THREE.Mesh(spokeGeo, this.materials.metalGlossy);
      spoke2.rotation.z = Math.PI / 2;
      balanceGroup.add(spoke1);
      balanceGroup.add(spoke2);

      // Hairspring (coiled spiral)
      const curve = new THREE.Curve();
      curve.getPoint = (t) => {
        const angle = t * Math.PI * 12;
        const radius = 0.04 + t * 0.26;
        return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      };
      const hairspringGeo = new THREE.TubeGeometry(curve, 120, 0.005, 8, false);
      const hairspringMat = new THREE.MeshStandardMaterial({
        color: 0x3a7bd5, // Blued steel hairspring
        metalness: 0.9,
        roughness: 0.2
      });
      const hairspringMesh = new THREE.Mesh(hairspringGeo, hairspringMat);
      hairspringMesh.position.z = 0.03;
      balanceGroup.add(hairspringMesh);

      this.watchGroup.add(balanceGroup);
      this.watchParts.balanceWheel = balanceGroup;
      this.watchParts.hairSpring = hairspringMesh;
    }

    // Ensure seconds hand sweep
    if (!this.watchParts.secondsHand) {
      const secGroup = new THREE.Group();
      secGroup.position.set(0, 0, 0.25);

      const needleGeo = new THREE.CylinderGeometry(0.005, 0.012, 1.4, 12);
      const needleMesh = new THREE.Mesh(needleGeo, this.materials.metalGlossy);
      needleMesh.position.y = 0.45;
      secGroup.add(needleMesh);

      const capGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16);
      const capMesh = new THREE.Mesh(capGeo, this.materials.metalGlossy);
      capMesh.rotation.x = Math.PI / 2;
      secGroup.add(capMesh);

      this.watchGroup.add(secGroup);
      this.watchParts.secondsHand = secGroup;
    }
  }

  buildProceduralWatch() {
    const watch = new THREE.Group();

    // 1. Case & Bezel (60mm proportion)
    const caseGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.4, 64);
    const caseMesh = new THREE.Mesh(caseGeo, this.materials.metalBrushed);
    caseMesh.rotation.x = Math.PI / 2;
    watch.add(caseMesh);

    const bezelGeo = new THREE.TorusGeometry(1.58, 0.08, 24, 64);
    const bezelMesh = new THREE.Mesh(bezelGeo, this.materials.metalGlossy);
    bezelMesh.position.z = 0.2;
    watch.add(bezelMesh);
    this.watchParts.bezel = bezelMesh;

    // 2. Sapphire Crystal Dome Front
    const crystalGeo = new THREE.SphereGeometry(1.55, 48, 24, 0, Math.PI * 2, 0, 0.5);
    const crystalMesh = new THREE.Mesh(crystalGeo, this.materials.glassMat);
    crystalMesh.position.z = 0.15;
    watch.add(crystalMesh);
    this.watchParts.crystalFront = crystalMesh;

    // 3. Multi-tier Sunray Dial
    const dialGeo = new THREE.CylinderGeometry(1.48, 1.48, 0.04, 64);
    const dialMesh = new THREE.Mesh(dialGeo, this.materials.dialMat);
    dialMesh.rotation.x = Math.PI / 2;
    dialMesh.position.z = 0.1;
    watch.add(dialMesh);
    this.watchParts.dial = dialMesh;

    // Dial Indices (12 Applied faceted markers)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const isQuarter = i % 3 === 0;
      const markerGeo = new THREE.BoxGeometry(isQuarter ? 0.05 : 0.03, isQuarter ? 0.22 : 0.14, 0.04);
      const markerMesh = new THREE.Mesh(markerGeo, this.materials.metalGlossy);
      markerMesh.position.set(Math.cos(angle) * 1.25, Math.sin(angle) * 1.25, 0.14);
      markerMesh.rotation.z = angle + Math.PI / 2;
      watch.add(markerMesh);
    }

    // 4. Hands
    const hoursHandGeo = new THREE.ConeGeometry(0.06, 0.8, 16);
    const hoursHand = new THREE.Mesh(hoursHandGeo, this.materials.metalGlossy);
    hoursHand.position.set(0, 0.35, 0.18);
    const hoursGroup = new THREE.Group();
    hoursGroup.add(hoursHand);
    watch.add(hoursGroup);
    this.watchParts.hoursHand = hoursGroup;

    const minutesHandGeo = new THREE.ConeGeometry(0.045, 1.2, 16);
    const minutesHand = new THREE.Mesh(minutesHandGeo, this.materials.metalGlossy);
    minutesHand.position.set(0, 0.55, 0.21);
    const minutesGroup = new THREE.Group();
    minutesGroup.add(minutesHand);
    watch.add(minutesGroup);
    this.watchParts.minutesHand = minutesGroup;

    // 5. Exhibition Caseback with Openworked Rotor
    const rotorGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.03, 32, 1, false, 0, Math.PI);
    const rotorMesh = new THREE.Mesh(rotorGeo, this.materials.rotorMat);
    rotorMesh.rotation.x = Math.PI / 2;
    rotorMesh.position.z = -0.18;
    watch.add(rotorMesh);
    this.watchParts.rotor = rotorMesh;

    this.watchGroup.add(watch);
    this.ensureMechanicalComponents();
  }

  setColorTheme(themeKey) {
    this.materials.currentTheme = themeKey;

    let targetMetalColor, targetDialColor, roughness, metalness;

    switch (themeKey) {
      case 'second': // Deep Black DLC Titanium
        targetMetalColor = new THREE.Color(0x18181b);
        targetDialColor = new THREE.Color(0x0f0f11);
        roughness = 0.32;
        metalness = 0.9;
        break;
      case 'third': // 18K Pure Yellow Gold
        targetMetalColor = new THREE.Color(0xf3c868);
        targetDialColor = new THREE.Color(0x28200f);
        roughness = 0.18;
        metalness = 0.95;
        break;
      case 'fourth': // 18K 5N Rose Gold
        targetMetalColor = new THREE.Color(0xe8a88f);
        targetDialColor = new THREE.Color(0x221310);
        roughness = 0.19;
        metalness = 0.95;
        break;
      case 'first': // Silver Steel
      default:
        targetMetalColor = new THREE.Color(0xd8d8dc);
        targetDialColor = new THREE.Color(0x222226);
        roughness = 0.25;
        metalness = 0.95;
        break;
    }

    gsap.to(this.materials.metalBrushed.color, {
      r: targetMetalColor.r,
      g: targetMetalColor.g,
      b: targetMetalColor.b,
      duration: 1.0,
      ease: 'power2.inOut'
    });

    gsap.to(this.materials.metalGlossy.color, {
      r: targetMetalColor.r,
      g: targetMetalColor.g,
      b: targetMetalColor.b,
      duration: 1.0,
      ease: 'power2.inOut'
    });

    gsap.to(this.materials.rotorMat.color, {
      r: targetMetalColor.r,
      g: targetMetalColor.g,
      b: targetMetalColor.b,
      duration: 1.0,
      ease: 'power2.inOut'
    });

    gsap.to(this.materials.dialMat.color, {
      r: targetDialColor.r,
      g: targetDialColor.g,
      b: targetDialColor.b,
      duration: 1.0,
      ease: 'power2.inOut'
    });

    this.materials.metalBrushed.roughness = roughness;
    this.materials.metalBrushed.metalness = metalness;
  }

  setExplodedMode(exploded) {
    this.isExploded = exploded;

    const multiplier = exploded ? 1 : 0;
    const duration = 1.4;
    const ease = 'power3.inOut';

    // Disassembly layered offsets along Z axis
    const layers = [
      { part: this.watchParts.crystalFront, z: 2.6, rot: 0 },
      { part: this.watchParts.bezel, z: 1.8, rot: 0.1 },
      { part: this.watchParts.dial, z: 1.0, rot: -0.1 },
      { part: this.watchParts.secondsHand, z: 1.4, rot: 0 },
      { part: this.watchParts.minutesHand, z: 1.25, rot: 0 },
      { part: this.watchParts.hoursHand, z: 1.15, rot: 0 },
      { part: this.watchParts.tourbillon, z: 0.5, rot: 0.15 },
      { part: this.watchParts.balanceWheel, z: 0.45, rot: 0.2 },
      { part: this.watchParts.mainplate, z: 0.0, rot: 0 },
      { part: this.watchParts.barrel, z: -0.7, rot: -0.1 },
      { part: this.watchParts.crystalBack, z: -1.6, rot: 0 },
      { part: this.watchParts.rotor, z: -2.4, rot: 0.2 }
    ];

    layers.forEach(({ part, z, rot }) => {
      if (!part) return;
      const initialZ = part.userData?.initialPos?.z || 0;
      const initialRotZ = part.userData?.initialRot?.z || 0;

      gsap.to(part.position, {
        z: initialZ + z * multiplier,
        duration: duration,
        ease: ease
      });

      gsap.to(part.rotation, {
        z: initialRotZ + rot * multiplier,
        duration: duration,
        ease: ease
      });
    });

    if (exploded) {
      // Tilt watch for full 3D exploded inspection
      gsap.to(this.watchGroup.rotation, {
        x: 0.65,
        y: -0.75,
        z: 0.2,
        duration: 1.6,
        ease: ease
      });
      gsap.to(this.camera.position, {
        z: 8.5,
        duration: 1.6,
        ease: ease
      });
    } else {
      this.selectedPartIndex = null;
    }
  }

  focusOnExplodedPart(partId) {
    if (!this.isExploded) return;

    let targetZ = 0;
    let rotX = 0.5;
    let rotY = -0.6;

    switch (partId) {
      case 'tourbillon':
        targetZ = 0.5;
        rotX = 0.3;
        rotY = -0.4;
        break;
      case 'mainplate':
        targetZ = 0.0;
        rotX = 0.4;
        rotY = -0.5;
        break;
      case 'dial':
        targetZ = 1.0;
        rotX = 0.2;
        rotY = -0.2;
        break;
      case 'barrel':
        targetZ = -0.7;
        rotX = 0.6;
        rotY = -0.7;
        break;
      case 'backplate':
        targetZ = -1.6;
        rotX = 0.8;
        rotY = -1.2;
        break;
      case 'weight':
        targetZ = -2.4;
        rotX = 1.1;
        rotY = -1.5;
        break;
      default:
        targetZ = 0;
    }

    gsap.to(this.watchGroup.rotation, {
      x: rotX,
      y: rotY,
      duration: 1.2,
      ease: 'power3.out'
    });

    gsap.to(this.camera.position, {
      x: 0,
      y: 0,
      z: 6.2 + targetZ * 0.4,
      duration: 1.2,
      ease: 'power3.out'
    });
  }

  setupInteractions() {
    // 360 Drag rotation during exploded / inspection mode
    const canvas = this.renderer.domElement;

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.prevMousePos.x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.prevMousePos.y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - this.prevMousePos.x;
      const deltaY = clientY - this.prevMousePos.y;

      this.prevMousePos.x = clientX;
      this.prevMousePos.y = clientY;

      this.dragRotation.targetY += deltaX * 0.005;
      this.dragRotation.targetX += deltaY * 0.005;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  updateScroll(progress, sectionName) {
    this.scrollProgress = progress;
    if (this.isExploded) return; // Don't override camera if user is in manual exploded inspection

    // Exact section camera & watch coordinate map matching reference website
    let targetCamPos = { x: 0, y: 0, z: 7.2 };
    let targetWatchPos = { x: 0, y: 0, z: 0 };
    let targetWatchRot = { x: 0, y: 0, z: 0 };

    if (progress < 0.08) {
      // Intro: Floating frontal view
      targetCamPos = { x: 0, y: 0, z: 7.2 };
      targetWatchPos = { x: 0, y: 0, z: 0 };
      targetWatchRot = { x: 0, y: 0, z: 0 };
    } else if (progress < 0.20) {
      // Timeless: 3/4 perspective elevation
      const p = (progress - 0.08) / 0.12;
      targetCamPos = { x: 1.2 * p, y: 0.3 * p, z: 7.2 - 1.2 * p };
      targetWatchPos = { x: -0.8 * p, y: 0, z: 0 };
      targetWatchRot = { x: 0.35 * p, y: 0.65 * p, z: -0.1 * p };
    } else if (progress < 0.32) {
      // VerticalText: Side profile macro elevation
      const p = (progress - 0.20) / 0.12;
      targetCamPos = { x: 1.2 - 2.8 * p, y: 0.3 - 0.5 * p, z: 6.0 - 0.8 * p };
      targetWatchPos = { x: -0.8 + 1.6 * p, y: -0.2 * p, z: 0 };
      targetWatchRot = { x: 0.35 - 0.65 * p, y: 0.65 - 1.35 * p, z: -0.1 + 0.3 * p };
    } else if (progress < 0.42) {
      // Curves (34/62): Dial curve macro close-up
      const p = (progress - 0.32) / 0.10;
      targetCamPos = { x: -1.6 + 2.2 * p, y: -0.2 + 0.6 * p, z: 5.2 - 1.6 * p };
      targetWatchPos = { x: 0.8 - 0.4 * p, y: -0.2, z: 0 };
      targetWatchRot = { x: -0.3 + 0.6 * p, y: -0.7 + 0.4 * p, z: 0.2 };
    } else if (progress < 0.54) {
      // Movement: Flipped 180 deg to open exhibition sapphire caseback & rotor
      const p = (progress - 0.42) / 0.12;
      targetCamPos = { x: 0.6 - 0.6 * p, y: 0.4 - 0.2 * p, z: 3.6 + 2.6 * p };
      targetWatchPos = { x: 0.4 - 0.4 * p, y: 0, z: 0 };
      targetWatchRot = { x: 0.3 - 0.1 * p, y: -0.3 + (Math.PI + 0.3) * p, z: 0 };
    } else if (progress < 0.66) {
      // MovementWatchRight: Macro on balance wheel and hairspring
      const p = (progress - 0.54) / 0.12;
      targetCamPos = { x: -1.0 * p, y: 0.2 - 0.4 * p, z: 6.2 - 2.4 * p };
      targetWatchPos = { x: 1.0 * p, y: 0.1 * p, z: 0 };
      targetWatchRot = { x: 0.2, y: Math.PI + 0.2 * p, z: 0 };
    } else if (progress < 0.76) {
      // Mechanism: Frontal dial with ticking seconds counter
      const p = (progress - 0.66) / 0.10;
      targetCamPos = { x: -1.0 + 1.0 * p, y: -0.2 + 0.2 * p, z: 3.8 + 2.0 * p };
      targetWatchPos = { x: 1.0 - 1.0 * p, y: 0, z: 0 };
      targetWatchRot = { x: 0.2 - 0.2 * p, y: (Math.PI + 0.2) * (1 - p), z: 0 };
    } else if (progress < 0.84) {
      // Hands (35/62): Slim horizontal silhouette
      const p = (progress - 0.76) / 0.08;
      targetCamPos = { x: 3.2 * p, y: 0, z: 5.8 - 1.8 * p };
      targetWatchPos = { x: -0.4 * p, y: 0, z: 0 };
      targetWatchRot = { x: 0, y: (Math.PI / 2) * p, z: 0 };
    } else if (progress < 0.92) {
      // Images lookbook: Centered drifting watch
      const p = (progress - 0.84) / 0.08;
      targetCamPos = { x: 3.2 * (1 - p), y: 0, z: 4.0 + 2.8 * p };
      targetWatchPos = { x: 0, y: 0, z: 0 };
      targetWatchRot = { x: 0.2 * p, y: (Math.PI / 2) * (1 - p) + 0.3 * p, z: 0 };
    } else if (progress < 0.96) {
      // Straps (36/62): Macro on bracelet and clasp
      const p = (progress - 0.92) / 0.04;
      targetCamPos = { x: 0, y: -1.6 * p, z: 6.8 - 2.2 * p };
      targetWatchPos = { x: 0, y: 0.8 * p, z: 0 };
      targetWatchRot = { x: -0.4 * p, y: 0.3, z: 0 };
    } else {
      // Parts & Footer: Restful elevation
      targetCamPos = { x: -1.2, y: 0, z: 6.8 };
      targetWatchPos = { x: 1.0, y: 0, z: 0 };
      targetWatchRot = { x: 0.25, y: -0.45, z: 0.05 };
    }

    gsap.to(this.camera.position, {
      x: targetCamPos.x,
      y: targetCamPos.y,
      z: targetCamPos.z,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    gsap.to(this.watchGroup.position, {
      x: targetWatchPos.x,
      y: targetWatchPos.y,
      z: targetWatchPos.z,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    gsap.to(this.watchGroup.rotation, {
      x: targetWatchRot.x,
      y: targetWatchRot.y,
      z: targetWatchRot.z,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();
    const delta = this.clock.getDelta();

    // 1. Mouse Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    // 2. Drag Rotation Lerp
    this.dragRotation.x += (this.dragRotation.targetX - this.dragRotation.x) * 0.1;
    this.dragRotation.y += (this.dragRotation.targetY - this.dragRotation.y) * 0.1;

    // 3. Real-Time Mechanical Horology Animation
    // Sweeping Seconds Hand (60s continuous sweep)
    if (this.watchParts.secondsHand) {
      this.watchParts.secondsHand.rotation.z = -elapsedTime * (Math.PI * 2 / 60);
    }

    // Minutes and Hours Hand
    if (this.watchParts.minutesHand) {
      this.watchParts.minutesHand.rotation.z = -elapsedTime * (Math.PI * 2 / 3600);
    }
    if (this.watchParts.hoursHand) {
      this.watchParts.hoursHand.rotation.z = -elapsedTime * (Math.PI * 2 / 43200);
    }

    // Balance Wheel Rapid Oscillation (4Hz / 28,800 vph)
    if (this.watchParts.balanceWheel) {
      this.watchParts.balanceWheel.rotation.z = Math.sin(elapsedTime * 20) * 0.85;
    }

    // Hairspring Breathing Scale
    if (this.watchParts.hairSpring) {
      const scale = 1.0 + Math.sin(elapsedTime * 20) * 0.08;
      this.watchParts.hairSpring.scale.set(scale, scale, 1.0);
    }

    // Oscillating Rotor Kinetic Physics
    if (this.watchParts.rotor) {
      const rotorSway = Math.sin(elapsedTime * 1.5) * 0.35 + (this.mouse.x * 0.5);
      this.watchParts.rotor.rotation.z = rotorSway;
    }

    // Subtle floating mouse parallax when not dragging
    if (!this.isExploded && !this.isDragging) {
      this.watchGroup.position.x += (this.mouse.x * 0.15 - this.watchGroup.position.x) * 0.02;
      this.watchGroup.position.y += (this.mouse.y * 0.15 - this.watchGroup.position.y) * 0.02;
    } else if (this.isExploded) {
      this.watchGroup.rotation.y = this.dragRotation.y - 0.75;
      this.watchGroup.rotation.x = this.dragRotation.x + 0.65;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
