import * as THREE from 'three';
import gsap from 'gsap';
import { birthdayData } from '../data/birthdayData.js';
import '../styles/galaxy.css';

export class GalaxyScreen {
  constructor(parentElement, options = {}) {
    this.parent = parentElement;
    this.onContinue = options.onContinue || null;
    this.onReplay = options.onReplay || null;

    this.element = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.animFrameId = null;
    this.clock = new THREE.Clock();

    this.memories = birthdayData.memories || [];
    this.polaroids = [];
    this.hoveredIdx = -1;
    this.disposables = [];

    // Hệ mặt trời thu nhỏ — lõi phát sáng + các hành tinh quay quỹ đạo
    this.solarSystem = null;
    this.planets = [];
    this.coreStar = null;

    // Hạ chi tiết trên thiết bị yếu / màn hình nhỏ để tối ưu hiệu năng
    this._perfScale = (typeof window !== 'undefined' && window.innerWidth < 760) ? 0.6 : 1;
    this._isLowPower = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || this._perfScale < 1;
    this.prefersReducedMotion = (typeof window !== 'undefined' && window.matchMedia)
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    this.currentMemoryIdx = -1;
    this.modalEl = null;
    this.overlayEl = null;

    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.cameraTarget = new THREE.Vector3(0, 0, 0);

    this._cometTimer = 3;
    this._cometTexture = null;

    this.cameraYaw = 0;
    this.cameraPitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.autoRotateSpeed = 0.05;

    this.cameraDistance = 18;
    this.targetDistance = 18;
    this.minDistance = 8;
    this.maxDistance = 35;
    this.minPitch = -0.6;
    this.maxPitch = 0.6;
    this.rotateSensitivity = 0.005;
    this.zoomSensitivity = 0.012;

    this.activePointers = new Map();
    this.lastPointerPosition = { x: 0, y: 0 };
    this.lastPinchDistance = 0;
    this.isDragging = false;
    this.hasDragged = false;
    this.suppressClick = false;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onContextMenu = (e) => e.preventDefault();

    this.raycaster = new THREE.Raycaster();
    this.ndcMouse = new THREE.Vector2();

    this._onCanvasClick = this._onCanvasClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  mount() {
    this.element = document.createElement('div');
    this.element.id = 'screen-galaxy';

    this.element.style.position = 'fixed';
    this.element.style.top = '0';
    this.element.style.left = '0';
    this.element.style.width = '100vw';
    this.element.style.height = '100vh';
    this.element.style.height = '100dvh';
    this.element.style.backgroundColor = '#160a2e';
    this.element.style.overflow = 'hidden';
    this.element.style.zIndex = '10';

    this.element.innerHTML = `
      <canvas id="galaxy-canvas" style="display:block; width:100%; height:100%;" aria-label="Thiên hà kỷ niệm 3D"></canvas>
      <div class="galaxy-dust" aria-hidden="true"></div>
      <div class="galaxy-hud">
        <h2 class="galaxy-title">Thiên Hà Kỷ Niệm♡♡♡</h2>
      </div>
      <div class="galaxy-hint">
        <button class="btn-galaxy-continue" id="btn-galaxy-continue" aria-label="Tiếp nò gieooo">
          <span aria-hidden="true">🌸</span>
          <span>Tiếp nò gieooo ♡</span>
        </button>
      </div>
      <div class="galaxy-modal-overlay" id="galaxy-modal-overlay" role="dialog" aria-modal="true" aria-label="Chi tiết kỷ niệm">
        <div class="galaxy-modal" id="galaxy-modal">
          <button class="modal-close-btn" id="modal-close-btn" aria-label="Đóng">✕</button>
          <div class="modal-date-tag" id="modal-date-tag"></div>
          <h3 class="modal-memory-title" id="modal-memory-title"></h3>
          <div class="modal-polaroid" id="modal-polaroid"></div>
          <p class="modal-memory-story" id="modal-memory-story"></p>
          <div class="modal-nav">
            <button class="btn-modal-nav" id="btn-modal-prev" aria-label="Kỷ niệm trước">← Trước</button>
            <span class="modal-counter" id="modal-counter">1 / 5</span>
            <button class="btn-modal-nav" id="btn-modal-next" aria-label="Kỷ niệm tiếp">Tiếp →</button>
          </div>
        </div>
      </div>
    `;

    this.parent.appendChild(this.element);
    this._setupModal();
    this._setupCTA();
    this._initThree();
    this._buildScene();
    this._addEventListeners();
    this._animate();

    gsap.fromTo(this.element, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: 'power2.inOut' });
    gsap.fromTo(
      this.element.querySelector('.galaxy-hud'),
      { y: -30, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power3.out', delay: 0.5 }
    );
    gsap.fromTo(
      this.element.querySelector('.galaxy-hint'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.8, ease: 'power3.out', delay: 0.8 }
    );
  }

  _initThree() {
    const canvas = this.element.querySelector('#galaxy-canvas');

    const w = this.element.clientWidth || window.innerWidth;
    const h = this.element.clientHeight || window.innerHeight;
    const aspect = w / h;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      precision: 'highp',
      powerPreference: "high-performance"
    });
    this.renderer.setSize(w, h);

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x160a2e, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1e1040, 0.012);

    const fov = aspect < 1 ? Math.min(80, 55 / Math.max(aspect, 0.5)) : 55;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 300);
    this.camera.position.set(0, 0, 18);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
  }

  _buildScene() {
    this._buildMultiLayerCosmos();
    this._buildSolarSystem();
    this._buildMagicalDecorations();
    this._buildPolaroids();
    this._buildCinematicLighting();
  }

  _buildMultiLayerCosmos() {
    const starPalette = [
      [1.0, 0.78, 0.9],
      [0.85, 0.75, 1.0],
      [0.7, 0.68, 1.0],
      [1.0, 0.9, 0.97],
      [1.0, 1.0, 1.0],
    ];
    const starLayerCount = 6;
    const starsPerLayer = Math.round(420 * this._perfScale);
    this.starLayers = [];
    for (let layer = 0; layer < starLayerCount; layer++) {
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(starsPerLayer * 3);
      const starColor = new Float32Array(starsPerLayer * 3);
      for (let i = 0; i < starsPerLayer; i++) {
        const r = 40 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i * 3 + 2] = r * Math.cos(phi);

        const [cr, cg, cb] = starPalette[Math.floor(Math.random() * starPalette.length)];
        const shimmer = 0.85 + Math.random() * 0.15;
        starColor[i * 3] = cr * shimmer;
        starColor[i * 3 + 1] = cg * shimmer;
        starColor[i * 3 + 2] = cb * shimmer;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColor, 3));

      const baseSize = 0.1 + layer * 0.035;
      const starMat = new THREE.PointsMaterial({
        size: baseSize, vertexColors: true, transparent: true, opacity: 0.6,
        sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
      });
      const points = new THREE.Points(starGeo, starMat);
      points.userData = {
        twinklePhase: layer * 1.05,
        twinkleSpeed: 0.6 + layer * 0.15,
        baseOpacity: 0.4 + Math.random() * 0.3,
      };
      this.scene.add(points);
      this.starLayers.push(points);
      this.disposables.push(starGeo, starMat);
    }
    this.deepStars = this.starLayers[0];

    const nebulaGeo = new THREE.PlaneGeometry(80, 80);
    const nebulaColors = [0x6b3fa0, 0xc13584, 0xffc1e0, 0x2c3e7a, 0xd9b8ff];
    this.nebulas = [];

    // Nâng cấp độ phân giải Canvas Nebula từ 256 lên 1024x1024 nét căng đét
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);

    // Chuyển màu mịn 6 nấc gradient - loại bỏ hoàn toàn xé dải màu / banding trên mobile
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.18, 'rgba(255,255,255,0.75)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.4)');
    grad.addColorStop(0.65, 'rgba(255,255,255,0.18)');
    grad.addColorStop(0.85, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    const nebulaTex = new THREE.CanvasTexture(canvas);
    nebulaTex.generateMipmaps = true;
    nebulaTex.minFilter = THREE.LinearMipmapLinearFilter;
    nebulaTex.magFilter = THREE.LinearFilter;
    this.disposables.push(nebulaTex, nebulaGeo);

    nebulaColors.forEach((color, i) => {
      const mat = new THREE.MeshBasicMaterial({
        color, map: nebulaTex, transparent: true, opacity: 0.18,
        depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        dithering: true
      });
      const mesh = new THREE.Mesh(nebulaGeo, mat);
      mesh.position.set((Math.random() - 0.5) * 44, (Math.random() - 0.5) * 32, -34 + i * 7);
      mesh.rotation.z = Math.random() * Math.PI;
      const scale = 0.8 + Math.random() * 0.6;
      mesh.scale.set(scale, scale, 1);
      this.scene.add(mesh);
      this.nebulas.push(mesh);
      this.disposables.push(mat);
    });
  }

  _buildSolarSystem() {
    this.solarSystem = new THREE.Group();
    this.solarSystem.position.set(0, -0.5, -2);
    this.scene.add(this.solarSystem);

    const segDetail = this._isLowPower ? 24 : 36;

    const coreGeo = new THREE.SphereGeometry(0.62, segDetail, segDetail);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffb3e0, emissive: 0xff6fb8, emissiveIntensity: 1.1,
      roughness: 0.35, metalness: 0.1
    });
    this.coreStar = new THREE.Mesh(coreGeo, coreMat);
    this.solarSystem.add(this.coreStar);
    this.disposables.push(coreGeo, coreMat);

    const coreGlowGeo = new THREE.SphereGeometry(1.0, segDetail, segDetail);
    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff9ed6, transparent: true, opacity: 0.28,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
      dithering: true
    });
    const coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    this.coreStar.add(coreGlow);
    this.disposables.push(coreGlowGeo, coreGlowMat);

    const coreLight = new THREE.PointLight(0xff9ed6, 3.2, 26, 2);
    this.coreStar.add(coreLight);
    this.coreLight = coreLight;

    const planetPalette = [
      { base: 0x6b3fa0, emissive: 0x3a1f5c, atmo: 0xc9a8f0 },
      { base: 0xc13584, emissive: 0x5c1f44, atmo: 0xffb3d9 },
      { base: 0x2c3e7a, emissive: 0x16203f, atmo: 0x8ea3ff },
      { base: 0xe897c4, emissive: 0x6b3350, atmo: 0xffd6ec },
      { base: 0x9f7fe0, emissive: 0x3f2d66, atmo: 0xd8c2ff },
    ];

    const planetConfigs = [
      { radius: 0.34, orbit: 3.4, tilt: 0.18, speed: 0.11, hasRing: false, ry: 0 },
      { radius: 0.5, orbit: 5.2, tilt: -0.28, speed: 0.08, hasRing: true, ry: Math.PI * 0.2 },
      { radius: 0.4, orbit: 7.0, tilt: 0.1, speed: 0.065, hasRing: false, ry: Math.PI * 0.6 },
      { radius: 0.62, orbit: 9.0, tilt: -0.14, speed: 0.05, hasRing: true, ry: Math.PI * 1.1 },
      { radius: 0.3, orbit: 10.8, tilt: 0.22, speed: 0.04, hasRing: false, ry: Math.PI * 1.7 },
    ];

    let ringTex = null;
    const getRingTexture = () => {
      if (ringTex) return ringTex;
      const cvs = document.createElement('canvas');
      cvs.width = 256; cvs.height = 32;
      const ctx = cvs.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 256, 0);
      grad.addColorStop(0, 'rgba(255,214,240,0)');
      grad.addColorStop(0.35, 'rgba(255,214,240,0.75)');
      grad.addColorStop(0.65, 'rgba(216,194,255,0.55)');
      grad.addColorStop(1, 'rgba(255,214,240,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 32);
      ringTex = new THREE.CanvasTexture(cvs);
      ringTex.generateMipmaps = true;
      ringTex.minFilter = THREE.LinearMipmapLinearFilter;
      this.disposables.push(ringTex);
      return ringTex;
    };

    planetConfigs.forEach((cfg, i) => {
      const palette = planetPalette[i % planetPalette.length];
      const pivot = new THREE.Group();
      pivot.rotation.x = cfg.tilt;
      pivot.rotation.y = Math.random() * Math.PI * 2;
      this.solarSystem.add(pivot);

      const planetGeo = new THREE.SphereGeometry(cfg.radius, segDetail, segDetail);
      const planetMat = new THREE.MeshStandardMaterial({
        color: palette.base, emissive: palette.emissive, emissiveIntensity: 0.55,
        roughness: 0.55, metalness: 0.25
      });
      const planet = new THREE.Mesh(planetGeo, planetMat);
      planet.position.x = cfg.orbit;
      planet.rotation.z = cfg.ry;
      pivot.add(planet);
      this.disposables.push(planetGeo, planetMat);

      const atmoGeo = new THREE.SphereGeometry(cfg.radius * 1.22, segDetail, segDetail);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: palette.atmo, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
        dithering: true
      });
      const atmo = new THREE.Mesh(atmoGeo, atmoMat);
      planet.add(atmo);
      this.disposables.push(atmoGeo, atmoMat);

      if (cfg.hasRing) {
        const ringGeo = new THREE.RingGeometry(cfg.radius * 1.6, cfg.radius * 2.5, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          map: getRingTexture(), color: palette.atmo, transparent: true, opacity: 0.6,
          side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
          dithering: true
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.3;
        planet.add(ring);
        this.disposables.push(ringGeo, ringMat);
      }

      const orbitPoints = [];
      const orbitSegs = this._isLowPower ? 64 : 96;
      for (let s = 0; s <= orbitSegs; s++) {
        const a = (s / orbitSegs) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(a) * cfg.orbit, 0, Math.sin(a) * cfg.orbit));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({ color: palette.atmo, transparent: true, opacity: 0.16 });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      orbitLine.rotation.x = cfg.tilt;
      this.solarSystem.add(orbitLine);
      this.disposables.push(orbitGeo, orbitMat);

      this.planets.push({ pivot, planet, speed: cfg.speed, spinSpeed: 0.15 + Math.random() * 0.2 });
    });
  }

  _buildMagicalDecorations() {
    const heartCvs = document.createElement('canvas');
    heartCvs.width = 128; heartCvs.height = 128;
    const hctx = heartCvs.getContext('2d');
    hctx.translate(64, 48);
    hctx.beginPath();
    hctx.moveTo(0, 16);
    hctx.bezierCurveTo(0, -24, -48, -24, -48, 16);
    hctx.bezierCurveTo(-48, 48, 0, 68, 0, 80);
    hctx.bezierCurveTo(0, 68, 48, 48, 48, 16);
    hctx.bezierCurveTo(48, -24, 0, -24, 0, 16);
    hctx.fillStyle = '#ffc6e2';
    hctx.shadowColor = '#ff9ecf';
    hctx.shadowBlur = 20;
    hctx.fill();
    const heartTex = new THREE.CanvasTexture(heartCvs);
    heartTex.generateMipmaps = true;

    const heartCount = Math.round(28 * this._perfScale);
    const heartGeo = new THREE.PlaneGeometry(0.8, 0.8);
    const heartMat = new THREE.MeshBasicMaterial({
      map: heartTex, transparent: true, opacity: 0.6,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
    });

    this.hearts = new THREE.InstancedMesh(heartGeo, heartMat, heartCount);
    const dummy = new THREE.Object3D();
    this.heartData = [];

    for (let i = 0; i < heartCount; i++) {
      const x = (Math.random() - 0.5) * 35;
      const y = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 20;
      const scale = 0.4 + Math.random() * 0.8;
      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.hearts.setMatrixAt(i, dummy.matrix);
      this.heartData.push({ x, y, z, phase: Math.random() * Math.PI * 2, speed: 0.2 + Math.random() * 0.5, scale });
    }
    this.scene.add(this.hearts);
    this.disposables.push(heartTex, heartGeo, heartMat, this.hearts);

    const petalPalette = [
      { fill: 'rgba(255, 190, 225, 0.85)', shadow: 'rgba(193, 53, 132, 0.5)' },
      { fill: 'rgba(216, 180, 255, 0.85)', shadow: 'rgba(107, 63, 160, 0.5)' },
    ];
    this.petalGroups = petalPalette.map((palette) => {
      const petalCvs = document.createElement('canvas');
      petalCvs.width = 64; petalCvs.height = 64;
      const pctx = petalCvs.getContext('2d');
      pctx.beginPath();
      pctx.ellipse(32, 32, 12, 24, Math.PI / 4, 0, Math.PI * 2);
      pctx.fillStyle = palette.fill;
      pctx.shadowColor = palette.shadow;
      pctx.shadowBlur = 10;
      pctx.fill();
      const petalTex = new THREE.CanvasTexture(petalCvs);
      petalTex.generateMipmaps = true;

      const petalCount = Math.round(36 * this._perfScale);
      const petalGeo = new THREE.PlaneGeometry(0.5, 0.5);
      const petalMat = new THREE.MeshStandardMaterial({
        map: petalTex, transparent: true, opacity: 0.85,
        roughness: 0.3, side: THREE.DoubleSide, depthWrite: false
      });

      const mesh = new THREE.InstancedMesh(petalGeo, petalMat, petalCount);
      const data = [];
      for (let i = 0; i < petalCount; i++) {
        const x = (Math.random() - 0.5) * 30;
        const y = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 25;
        const rotX = Math.random() * Math.PI;
        const rotY = Math.random() * Math.PI;
        const rotZ = Math.random() * Math.PI;
        dummy.position.set(x, y, z);
        dummy.rotation.set(rotX, rotY, rotZ);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        data.push({ x, y, z, rx: rotX, ry: rotY, rz: rotZ, speedX: (Math.random() - 0.5) * 0.02, speedY: -0.01 - Math.random() * 0.02 });
      }
      this.scene.add(mesh);
      this.disposables.push(petalTex, petalGeo, petalMat, mesh);
      return { mesh, data };
    });

    const sparkleCvs = document.createElement('canvas');
    sparkleCvs.width = 128; sparkleCvs.height = 128;
    const sctx = sparkleCvs.getContext('2d');
    sctx.translate(64, 64);
    const sparkleGrad = sctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    sparkleGrad.addColorStop(0, 'rgba(255,255,255,1)');
    sparkleGrad.addColorStop(0.3, 'rgba(255,214,240,0.9)');
    sparkleGrad.addColorStop(1, 'rgba(255,214,240,0)');
    sctx.fillStyle = sparkleGrad;
    sctx.beginPath();
    sctx.moveTo(0, -60);
    sctx.lineTo(14, -14);
    sctx.lineTo(60, 0);
    sctx.lineTo(14, 14);
    sctx.lineTo(0, 60);
    sctx.lineTo(-14, 14);
    sctx.lineTo(-60, 0);
    sctx.lineTo(-14, -14);
    sctx.closePath();
    sctx.fill();
    const sparkleTex = new THREE.CanvasTexture(sparkleCvs);
    sparkleTex.generateMipmaps = true;

    const sparkleCount = Math.round(45 * this._perfScale);
    const sparkleGeo = new THREE.PlaneGeometry(0.6, 0.6);
    const sparkleMat = new THREE.MeshBasicMaterial({
      map: sparkleTex, transparent: true, opacity: 0.9,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
    });
    this.sparkles = new THREE.InstancedMesh(sparkleGeo, sparkleMat, sparkleCount);
    this.sparkleData = [];
    for (let i = 0; i < sparkleCount; i++) {
      const x = (Math.random() - 0.5) * 32;
      const y = (Math.random() - 0.5) * 22;
      const z = (Math.random() - 0.5) * 22;
      const scale = 0.3 + Math.random() * 0.5;
      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.sparkles.setMatrixAt(i, dummy.matrix);
      this.sparkleData.push({ x, y, z, baseScale: scale, phase: Math.random() * Math.PI * 2, speed: 1.0 + Math.random() * 1.5, rot: Math.random() * Math.PI });
    }
    this.scene.add(this.sparkles);
    this.disposables.push(sparkleTex, sparkleGeo, sparkleMat, this.sparkles);
  }

  _buildPolaroids() {
    const CARD_W = 3.2;
    const CARD_H = 3.9;

    const positions = [
      { x: -7.5, y: 1.5, z: -4.0, ry: 0.35, rx: -0.05 },
      { x: -3.5, y: -2.0, z: 1.5, ry: 0.15, rx: 0.08 },
      { x: 0.5, y: 1.0, z: 4.5, ry: -0.05, rx: -0.02 },
      { x: 4.5, y: -1.5, z: 0.5, ry: -0.25, rx: 0.05 },
      { x: 8.0, y: 2.0, z: -3.5, ry: -0.45, rx: -0.08 },
    ];

    this.memories.forEach((mem, idx) => {
      const layout = positions[idx] || { x: idx * 4 - 8, y: 0, z: 0, ry: 0, rx: 0 };
      const cardGroup = new THREE.Group();

      const card = this._makePolaroidMesh(CARD_W, CARD_H, mem, idx);
      cardGroup.add(card);

      cardGroup.position.set(layout.x, layout.y, layout.z);
      cardGroup.rotation.set(layout.rx, layout.ry, 0);

      cardGroup.userData = {
        baseY: layout.y,
        baseX: layout.x,
        baseZ: layout.z,
        baseRy: layout.ry,
        floatPhase: idx * 1.37,
        floatSpeed: 0.5 + Math.random() * 0.3,
        memoryIdx: idx,
        glowMesh: card.userData.glowMesh,
        cardMesh: card
      };

      this.polaroids.push(cardGroup);
      this.scene.add(cardGroup);

      const origZ = cardGroup.position.z;
      cardGroup.position.z = origZ - 20;
      cardGroup.scale.set(0.01, 0.01, 0.01);

      gsap.to(cardGroup.position, { z: origZ, duration: 2.0, delay: 0.8 + idx * 0.2, ease: 'power3.out' });
      gsap.to(cardGroup.scale, { x: 1, y: 1, z: 1, duration: 1.8, delay: 0.8 + idx * 0.2, ease: 'back.out(1.2)' });
    });
  }

  _makePolaroidMesh(w, h, memory, idx) {
    const cvs = document.createElement('canvas');
    cvs.width = 1024;
    cvs.height = 1280;
    const ctx = cvs.getContext('2d');

    const rr = 24;
    ctx.fillStyle = '#fff6fa';
    this._roundRect(ctx, 0, 0, 1024, 1280, rr);
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    const photoH = 820;
    const margin = 48;
    const gradients = [
      ['#ffc2de', '#ffe3f0'],
      ['#e3c2ff', '#ffdcf2'],
      ['#ffb8d6', '#fcd9e8'],
      ['#f3c6ff', '#ffe6f6'],
      ['#ffcae5', '#e9d4ff'],
    ];
    const [c1, c2] = gradients[idx % gradients.length];
    const gr = ctx.createLinearGradient(margin, margin, 1024 - margin, photoH);
    gr.addColorStop(0, c1);
    gr.addColorStop(1, c2);
    ctx.fillStyle = gr;
    this._roundRect(ctx, margin, margin, 1024 - margin * 2, photoH, 12);
    ctx.fill();

    ctx.font = 'bold 160px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = ['🌸', '✨', '💖', '🦋', '💌'];
    ctx.fillText(icons[idx % icons.length], 512, margin + photoH / 2);

    ctx.fillStyle = '#4a2a52';
    ctx.font = 'bold 52px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const lines = this._wrapText(ctx, memory.title, 880, 60);
    lines.forEach((line, li) => {
      ctx.fillText(line, 512, photoH + margin + 60 + li * 68);
    });

    ctx.fillStyle = '#c285a8';
    ctx.font = 'italic 36px Georgia, serif';
    ctx.fillText(memory.date, 512, photoH + margin + 230);

    const tex = new THREE.CanvasTexture(cvs);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshStandardMaterial({
      map: tex, side: THREE.DoubleSide, roughness: 0.2, metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    this.disposables.push(tex, geo, mat);

    const glowGeo = new THREE.PlaneGeometry(w + 0.3, h + 0.3);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffb3d9, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.z = -0.01;
    mesh.add(glowMesh);
    mesh.userData.glowMesh = glowMesh;
    this.disposables.push(glowGeo, glowMat);

    return mesh;
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  _wrapText(ctx, text, maxW, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else { cur = test; }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  _buildCinematicLighting() {
    const ambient = new THREE.AmbientLight(0xcbb8ff, 0.55);
    this.scene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0xffc2e8, 1.25);
    dir1.position.set(12, 15, 18);
    this.scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x6b5ce0, 0.9);
    dir2.position.set(-15, -10, 10);
    this.scene.add(dir2);

    const rimLight = new THREE.DirectionalLight(0xc13584, 0.55);
    rimLight.position.set(0, -12, -14);
    this.scene.add(rimLight);

    const point = new THREE.PointLight(0xff9ed1, 1.8, 50);
    point.position.set(0, 0, 8);
    this.scene.add(point);
    this.centerLight = point;
  }

  _spawnComet() {
    if (!this.scene) return;

    if (!this._cometTexture) {
      const cvs = document.createElement('canvas');
      cvs.width = 256; cvs.height = 64;
      const ctx = cvs.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 256, 0);
      grad.addColorStop(0, 'rgba(193,53,132,0)');
      grad.addColorStop(0.55, 'rgba(216,180,255,0.75)');
      grad.addColorStop(0.85, 'rgba(255,214,235,0.9)');
      grad.addColorStop(1, 'rgba(255,255,255,1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 16, 256, 32);
      this._cometTexture = new THREE.CanvasTexture(cvs);
      this.disposables.push(this._cometTexture);
    }
    if (!this._cometHeadTexture) {
      const hcvs = document.createElement('canvas');
      hcvs.width = 64; hcvs.height = 64;
      const hctx = hcvs.getContext('2d');
      const hgrad = hctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      hgrad.addColorStop(0, 'rgba(255,255,255,1)');
      hgrad.addColorStop(0.4, 'rgba(255,214,240,0.9)');
      hgrad.addColorStop(1, 'rgba(255,214,240,0)');
      hctx.fillStyle = hgrad;
      hctx.fillRect(0, 0, 64, 64);
      this._cometHeadTexture = new THREE.CanvasTexture(hcvs);
      this.disposables.push(this._cometHeadTexture);
    }

    const tint = [0xffd6eb, 0xd8b4ff, 0xc13584, 0xffffff][Math.floor(Math.random() * 4)];

    const geo = new THREE.PlaneGeometry(5.2, 0.16);
    const mat = new THREE.MeshBasicMaterial({
      map: this._cometTexture, color: tint, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    const comet = new THREE.Mesh(geo, mat);

    const headGeo = new THREE.PlaneGeometry(0.5, 0.5);
    const headMat = new THREE.MeshBasicMaterial({
      map: this._cometHeadTexture, color: tint, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.x = 2.5;
    comet.add(head);

    const startX = -30 + Math.random() * 10;
    const startY = 10 + Math.random() * 10;
    const startZ = -15 + Math.random() * 20;
    const endX = startX + 35 + Math.random() * 10;
    const endY = startY - 18 - Math.random() * 8;

    comet.position.set(startX, startY, startZ);
    comet.rotation.z = Math.atan2(endY - startY, endX - startX);
    this.scene.add(comet);

    gsap.timeline({
      onComplete: () => {
        this.scene?.remove(comet);
        geo.dispose();
        mat.dispose();
        headGeo.dispose();
        headMat.dispose();
      }
    })
      .to([mat, headMat], { opacity: 0.9, duration: 0.15, ease: 'power1.in' }, 0)
      .to(comet.position, { x: endX, y: endY, duration: 1.1, ease: 'power1.in' }, 0)
      .to([mat, headMat], { opacity: 0, duration: 0.5, ease: 'power1.out' }, 0.6);
  }

  _animate() {
    this.animFrameId = requestAnimationFrame(() => this._animate());
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.elapsedTime;

    const cameraSmoothness = 1 - Math.exp(-4 * delta);
    this.targetYaw += this.autoRotateSpeed * delta;
    this.cameraYaw += (this.targetYaw - this.cameraYaw) * cameraSmoothness;
    this.cameraPitch += (this.targetPitch - this.cameraPitch) * cameraSmoothness;
    this.cameraDistance += (this.targetDistance - this.cameraDistance) * cameraSmoothness;

    this.cameraTarget.y = Math.sin(elapsed * 0.3) * 0.8;

    const cosPitch = Math.cos(this.cameraPitch);
    this.camera.position.set(
      this.cameraTarget.x + this.cameraDistance * cosPitch * Math.sin(this.cameraYaw),
      this.cameraTarget.y + this.cameraDistance * Math.sin(this.cameraPitch),
      this.cameraTarget.z + this.cameraDistance * cosPitch * Math.cos(this.cameraYaw)
    );
    this.camera.lookAt(this.cameraTarget);

    if (this.starLayers) {
      this.starLayers.forEach((layer) => {
        layer.rotation.y = elapsed * 0.01;
        const { twinklePhase, twinkleSpeed, baseOpacity } = layer.userData;
        layer.material.opacity = baseOpacity + Math.sin(elapsed * twinkleSpeed + twinklePhase) * 0.25;
      });
    }

    this.nebulas.forEach((neb, i) => {
      neb.rotation.z += 0.02 * delta * (i % 2 === 0 ? 1 : -1);
    });

    this._cometTimer -= delta;
    if (this._cometTimer <= 0) {
      this._spawnComet();
      this._cometTimer = 3.2 + Math.random() * 4;
    }

    if (this.planets.length) {
      this.planets.forEach((p) => {
        p.pivot.rotation.y += p.speed * delta;
        p.planet.rotation.y += p.spinSpeed * delta;
      });
    }
    if (this.coreStar) {
      const pulse = 1 + Math.sin(elapsed * 1.4) * 0.06;
      this.coreStar.scale.set(pulse, pulse, pulse);
      if (this.coreLight) this.coreLight.intensity = 3.0 + Math.sin(elapsed * 1.4) * 0.5;
    }
    if (this.solarSystem && !this.prefersReducedMotion) {
      this.solarSystem.rotation.y = elapsed * 0.015;
    }

    const dummy = new THREE.Object3D();
    if (this.hearts) {
      for (let i = 0; i < this.heartData.length; i++) {
        let hd = this.heartData[i];
        hd.y += hd.speed * delta;
        if (hd.y > 15) { hd.y = -15; hd.x = (Math.random() - 0.5) * 35; }
        dummy.position.set(hd.x + Math.sin(elapsed * 0.5 + hd.phase) * 1.5, hd.y, hd.z);
        const pulse = hd.scale * (1 + Math.sin(elapsed * 2 + hd.phase) * 0.15);
        dummy.scale.set(pulse, pulse, pulse);
        dummy.updateMatrix();
        this.hearts.setMatrixAt(i, dummy.matrix);
      }
      this.hearts.material.color.setHSL(0.92 + Math.sin(elapsed * 0.15) * 0.025, 0.7, 0.8);
      this.hearts.instanceMatrix.needsUpdate = true;
    }

    if (this.petalGroups) {
      this.petalGroups.forEach(({ mesh, data }) => {
        for (let i = 0; i < data.length; i++) {
          let pd = data[i];
          pd.x += pd.speedX;
          pd.y += pd.speedY;
          pd.rx += 0.01; pd.ry += 0.015; pd.rz += 0.005;
          if (pd.y < -15) { pd.y = 15; pd.x = (Math.random() - 0.5) * 30; }
          dummy.position.set(pd.x, pd.y, pd.z);
          dummy.rotation.set(pd.rx, pd.ry, pd.rz);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      });
    }

    if (this.sparkles) {
      for (let i = 0; i < this.sparkleData.length; i++) {
        const sd = this.sparkleData[i];
        const twinkle = Math.max(0, Math.sin(elapsed * sd.speed + sd.phase));
        const s = sd.baseScale * (0.15 + twinkle * 0.95);
        dummy.position.set(sd.x, sd.y, sd.z);
        dummy.rotation.set(0, 0, sd.rot + elapsed * 0.1);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        this.sparkles.setMatrixAt(i, dummy.matrix);
      }
      this.sparkles.instanceMatrix.needsUpdate = true;
    }

    this.polaroids.forEach((cardGroup) => {
      const { baseY, baseZ, floatPhase, floatSpeed } = cardGroup.userData;
      if (this.hoveredIdx !== cardGroup.userData.memoryIdx) {
        cardGroup.position.y = baseY + Math.sin(elapsed * floatSpeed + floatPhase) * 0.3;
        cardGroup.position.z = baseZ + Math.cos(elapsed * floatSpeed * 0.8 + floatPhase) * 0.15;
        cardGroup.rotation.z = Math.sin(elapsed * 0.4 + floatPhase) * 0.03;
      }
    });

    if (this.centerLight) {
      this.centerLight.intensity = 2.0 + Math.sin(elapsed * 1.2) * 0.3;
    }

    this._detectHover();
    this.renderer.render(this.scene, this.camera);
  }

  _detectHover() {
    this.raycaster.setFromCamera(this.ndcMouse, this.camera);
    const meshes = this.polaroids.map(p => p.userData.cardMesh);
    const hits = this.raycaster.intersectObjects(meshes, false);

    const hitIdx = hits.length ? hits[0].object.parent.userData.memoryIdx : -1;
    if (hitIdx === this.hoveredIdx) return;

    this.polaroids.forEach((cardGroup) => {
      const isHovered = cardGroup.userData.memoryIdx === hitIdx;
      const glow = cardGroup.userData.glowMesh;

      if (glow) {
        gsap.to(glow.material, {
          opacity: isHovered ? 0.8 : 0.0,
          duration: 0.4, ease: 'power2.out', overwrite: 'auto'
        });
      }
      gsap.to(cardGroup.scale, {
        x: isHovered ? 1.15 : 1, y: isHovered ? 1.15 : 1, z: isHovered ? 1.15 : 1,
        duration: 0.5, ease: 'power3.out', overwrite: 'auto'
      });
      if (isHovered) {
        gsap.to(cardGroup.rotation, {
          x: cardGroup.userData.baseRy * 0.2,
          duration: 0.5, ease: 'power3.out', overwrite: 'auto'
        });
      } else {
        gsap.to(cardGroup.rotation, {
          x: cardGroup.userData.baseRy,
          duration: 0.5, ease: 'power3.out', overwrite: 'auto'
        });
      }
    });

    document.body.style.cursor = hitIdx >= 0 ? 'pointer' : 'default';
    this.hoveredIdx = hitIdx;
  }

  _addEventListeners() {
    const canvas = this.element.querySelector('#galaxy-canvas');
    this._canvas = canvas;
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';

    this._onResizeBound = () => this._onResize();
    canvas.addEventListener('pointerdown', this._onPointerDown);
    canvas.addEventListener('pointermove', this._onPointerMove);
    canvas.addEventListener('pointerup', this._onPointerUp);
    canvas.addEventListener('pointercancel', this._onPointerUp);
    canvas.addEventListener('click', this._onCanvasClick);
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
    canvas.addEventListener('contextmenu', this._onContextMenu);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._onResizeBound);
  }

  _onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this._canvas.setPointerCapture?.(e.pointerId);

    if (this.activePointers.size === 1) {
      this.isDragging = true; this.hasDragged = false;
      this.lastPointerPosition = { x: e.clientX, y: e.clientY };
      this._canvas.style.cursor = 'grabbing';
    }
    if (this.activePointers.size === 2) {
      this.hasDragged = true;
      this.lastPinchDistance = this._getPinchDistance();
    }
  }

  _onPointerMove(e) {
    const rect = this._canvas.getBoundingClientRect();
    this.ndcMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndcMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.targetMouse.x = this.ndcMouse.x;
    this.targetMouse.y = this.ndcMouse.y;

    if (!this.activePointers.has(e.pointerId)) return;
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.activePointers.size >= 2) {
      const currentDist = this._getPinchDistance();
      if (this.lastPinchDistance > 0 && currentDist > 0) {
        const ratio = currentDist / this.lastPinchDistance;
        this.targetDistance = THREE.MathUtils.clamp(this.targetDistance / ratio, this.minDistance, this.maxDistance);
      }
      this.lastPinchDistance = currentDist;
      this.hasDragged = true;
      return;
    }

    const dx = e.clientX - this.lastPointerPosition.x;
    const dy = e.clientY - this.lastPointerPosition.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.hasDragged = true;

    if (this.hasDragged) {
      this.targetYaw -= dx * this.rotateSensitivity;
      this.targetPitch += dy * this.rotateSensitivity;
      this.targetPitch = THREE.MathUtils.clamp(this.targetPitch, this.minPitch, this.maxPitch);
    }
    this.lastPointerPosition = { x: e.clientX, y: e.clientY };
  }

  _onPointerUp(e) {
    if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
    if (this.hasDragged) {
      this.suppressClick = true;
      window.setTimeout(() => { this.suppressClick = false; }, 100);
    }
    if (this.activePointers.size === 0) {
      this.isDragging = false; this.lastPinchDistance = 0;
      this._canvas.style.cursor = 'grab';
    } else if (this.activePointers.size === 1) {
      const remaining = this.activePointers.values().next().value;
      this.lastPointerPosition = { x: remaining.x, y: remaining.y };
      this.lastPinchDistance = 0;
    }
    this.hasDragged = false;
  }

  _getPinchDistance() {
    const pts = [...this.activePointers.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  _onWheel(e) {
    e.preventDefault();
    this.targetDistance = THREE.MathUtils.clamp(this.targetDistance + e.deltaY * this.zoomSensitivity, this.minDistance, this.maxDistance);
  }

  _onCanvasClick(e) {
    if (this.suppressClick || this.overlayEl?.classList.contains('is-open')) return;
    const rect = this._canvas.getBoundingClientRect();
    this.ndcMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndcMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.ndcMouse, this.camera);
    const meshes = this.polaroids.map(p => p.userData.cardMesh);
    const hits = this.raycaster.intersectObjects(meshes, false);

    if (hits.length) {
      const idx = hits[0].object.parent.userData.memoryIdx;
      this._openModal(idx);
    }
  }

  _onKeyDown(e) {
    if (!this.overlayEl?.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this._modalNext();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') this._modalPrev();
    if (e.key === 'Escape') this._closeModal();
  }

  _onResize() {
    if (!this.renderer || !this.camera || !this.element) return;

    const w = this.element.clientWidth || window.innerWidth;
    const h = this.element.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;

    const aspect = w / h;
    this.camera.aspect = aspect;

    this.camera.fov = aspect < 1 ? Math.min(80, 55 / Math.max(aspect, 0.5)) : 55;
    this.camera.updateProjectionMatrix();

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
  }

  _setupModal() {
    this.overlayEl = this.element.querySelector('#galaxy-modal-overlay');
    this.modalEl = this.element.querySelector('#galaxy-modal');
    this.element.querySelector('#modal-close-btn').addEventListener('click', () => this._closeModal());
    this.element.querySelector('#btn-modal-prev').addEventListener('click', () => this._modalPrev());
    this.element.querySelector('#btn-modal-next').addEventListener('click', () => this._modalNext());
    this.overlayEl.addEventListener('click', (e) => { if (e.target === this.overlayEl) this._closeModal(); });
  }

  _openModal(idx) {
    if (idx < 0 || idx >= this.memories.length) return;
    this.currentMemoryIdx = idx;
    this._renderModalContent(idx);
    this.overlayEl.classList.add('is-open');

    const cardGroup = this.polaroids[idx];
    if (cardGroup) {
      gsap.to(cardGroup.scale, {
        x: 1.25, y: 1.25, z: 1.25,
        duration: 0.4, ease: 'back.out(2)', yoyo: true, repeat: 1,
      });
    }
  }

  _closeModal() {
    this.overlayEl.classList.remove('is-open');
    this.currentMemoryIdx = -1;
  }

  _modalPrev() { if (this.currentMemoryIdx > 0) this._openModal(this.currentMemoryIdx - 1); }
  _modalNext() { if (this.currentMemoryIdx < this.memories.length - 1) this._openModal(this.currentMemoryIdx + 1); }

  _renderModalContent(idx) {
    const mem = this.memories[idx];
    this.element.querySelector('#modal-date-tag').textContent = mem.date;
    this.element.querySelector('#modal-memory-title').textContent = mem.title;
    this.element.querySelector('#modal-memory-story').textContent = mem.story;
    this.element.querySelector('#modal-counter').textContent = `${idx + 1} / ${this.memories.length}`;

    this.element.querySelector('#btn-modal-prev').disabled = idx === 0;
    this.element.querySelector('#btn-modal-next').disabled = idx === this.memories.length - 1;

    const polaroidEl = this.element.querySelector('#modal-polaroid');
    if (mem.image) {
      const img = new Image();
      img.onload = () => { polaroidEl.innerHTML = `<img class="modal-photo" src="${mem.image}" alt="${mem.title}">`; };
      img.onerror = () => { polaroidEl.innerHTML = `<div class="modal-photo-placeholder"><span>🌸</span></div>`; };
      img.src = mem.image;
    }

    gsap.fromTo(
      this.modalEl.querySelectorAll('.modal-date-tag, .modal-memory-title, .modal-memory-story, #modal-polaroid'),
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
    );
  }

  _setupCTA() {
    setTimeout(() => {
      const btn = this.element.querySelector('#btn-galaxy-continue');
      if (btn && this.onContinue) btn.addEventListener('click', () => this.onContinue());
    }, 0);
  }

  destroy(onComplete) {
    document.body.style.cursor = 'default';
    cancelAnimationFrame(this.animFrameId);

    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onResizeBound);
    if (this._canvas) {
      this._canvas.removeEventListener('pointerdown', this._onPointerDown);
      this._canvas.removeEventListener('pointermove', this._onPointerMove);
      this._canvas.removeEventListener('pointerup', this._onPointerUp);
      this._canvas.removeEventListener('pointercancel', this._onPointerUp);
      this._canvas.removeEventListener('wheel', this._onWheel);
      this._canvas.removeEventListener('click', this._onCanvasClick);
      this._canvas.removeEventListener('contextmenu', this._onContextMenu);
    }

    this.disposables.forEach(item => {
      if (item.dispose) item.dispose();
    });

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    gsap.to(this.element, {
      opacity: 0, duration: 0.8, ease: 'power2.in',
      onComplete: () => {
        if (this.element?.parentNode) this.element.parentNode.removeChild(this.element);
        if (onComplete) onComplete();
      }
    });
  }
}