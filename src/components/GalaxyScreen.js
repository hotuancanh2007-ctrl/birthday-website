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

    this.currentMemoryIdx = -1;
    this.modalEl = null;
    this.overlayEl = null;

    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.cameraTarget = new THREE.Vector3(0, 0, 0);

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

    // Đảm bảo tràn màn hình hoàn toàn trên Safari iOS
    this.element.style.position = 'fixed';
    this.element.style.top = '0';
    this.element.style.left = '0';
    this.element.style.width = '100vw';
    this.element.style.height = '100vh'; // Fallback trình duyệt cũ
    this.element.style.height = '100dvh'; // Chuẩn mới cho Safari iOS
    this.element.style.overflow = 'hidden';
    this.element.style.zIndex = '10';

    this.element.innerHTML = `
      <canvas id="galaxy-canvas" aria-label="Thiên hà kỷ niệm 3D"></canvas>
      <div class="galaxy-dust" aria-hidden="true"></div>
      <div class="galaxy-hud">
        <h2 class="galaxy-title">Thiên Hà Kỷ Niệm♡♡♡</h2>
      </div>
      <div class="galaxy-hint">
        <button class="btn-galaxy-continue" id="btn-galaxy-continue" aria-label="Tiếp tục hành trình">
          <span aria-hidden="true">🌌</span>
          <span>Tiếp tục hành trình ♡</span>
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

    // Lấy chiều rộng/cao thực tế từ container đã định dạng dvh
    const w = this.element.clientWidth || window.innerWidth;
    const h = this.element.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x05020a, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0514, 0.015);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 300);
    this.camera.position.set(0, 0, 18);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
  }

  _buildScene() {
    this._buildMultiLayerCosmos();
    this._buildMagicalDecorations();
    this._buildPolaroids();
    this._buildCinematicLighting();
  }

  _buildMultiLayerCosmos() {
    // Deep static stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 40 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6, sizeAttenuation: true });
    this.deepStars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.deepStars);
    this.disposables.push(starGeo, starMat);

    // Glowing Nebula Sprites
    const nebulaGeo = new THREE.PlaneGeometry(80, 80);
    const nebulaColors = [0x5c2a7a, 0x2a1b54, 0x8a3a70, 0x18244c];
    this.nebulas = [];

    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const nebulaTex = new THREE.CanvasTexture(canvas);
    this.disposables.push(nebulaTex, nebulaGeo);

    nebulaColors.forEach((color, i) => {
      const mat = new THREE.MeshBasicMaterial({
        color, map: nebulaTex, transparent: true, opacity: 0.12,
        depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(nebulaGeo, mat);
      mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, -30 + i * 8);
      mesh.rotation.z = Math.random() * Math.PI;
      this.scene.add(mesh);
      this.nebulas.push(mesh);
      this.disposables.push(mat);
    });
  }

  _buildMagicalDecorations() {
    // Floating Hearts
    const heartCvs = document.createElement('canvas');
    heartCvs.width = 64; heartCvs.height = 64;
    const hctx = heartCvs.getContext('2d');
    hctx.translate(32, 24);
    hctx.beginPath();
    hctx.moveTo(0, 8);
    hctx.bezierCurveTo(0, -12, -24, -12, -24, 8);
    hctx.bezierCurveTo(-24, 24, 0, 34, 0, 40);
    hctx.bezierCurveTo(0, 34, 24, 24, 24, 8);
    hctx.bezierCurveTo(24, -12, 0, -12, 0, 8);
    hctx.fillStyle = '#ffb3d9';
    hctx.shadowColor = '#ff66b2';
    hctx.shadowBlur = 12;
    hctx.fill();
    const heartTex = new THREE.CanvasTexture(heartCvs);

    const heartCount = 40;
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

    // Cherry Blossom Petals
    const petalCvs = document.createElement('canvas');
    petalCvs.width = 32; petalCvs.height = 32;
    const pctx = petalCvs.getContext('2d');
    pctx.beginPath();
    pctx.ellipse(16, 16, 6, 12, Math.PI / 4, 0, Math.PI * 2);
    pctx.fillStyle = 'rgba(255, 220, 235, 0.8)';
    pctx.shadowColor = 'rgba(255, 180, 210, 0.6)';
    pctx.shadowBlur = 4;
    pctx.fill();
    const petalTex = new THREE.CanvasTexture(petalCvs);

    const petalCount = 80;
    const petalGeo = new THREE.PlaneGeometry(0.5, 0.5);
    const petalMat = new THREE.MeshStandardMaterial({
      map: petalTex, transparent: true, opacity: 0.8,
      roughness: 0.3, side: THREE.DoubleSide, depthWrite: false
    });

    this.petals = new THREE.InstancedMesh(petalGeo, petalMat, petalCount);
    this.petalData = [];
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
      this.petals.setMatrixAt(i, dummy.matrix);
      this.petalData.push({ x, y, z, rx: rotX, ry: rotY, rz: rotZ, speedX: (Math.random() - 0.5) * 0.02, speedY: -0.01 - Math.random() * 0.02 });
    }
    this.scene.add(this.petals);
    this.disposables.push(petalTex, petalGeo, petalMat, this.petals);
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
    cvs.width = 512;
    cvs.height = 640;
    const ctx = cvs.getContext('2d');

    const rr = 12;
    ctx.fillStyle = '#fcfbfa';
    this._roundRect(ctx, 0, 0, 512, 640, rr);
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    const photoH = 410;
    const margin = 24;
    const gradients = [
      ['#2c1544', '#70305a'],
      ['#1a244c', '#522b6b'],
      ['#361b40', '#8b4b72'],
      ['#4a1c35', '#a45c7c'],
      ['#221644', '#603582'],
    ];
    const [c1, c2] = gradients[idx % gradients.length];
    const gr = ctx.createLinearGradient(margin, margin, 512 - margin, photoH);
    gr.addColorStop(0, c1);
    gr.addColorStop(1, c2);
    ctx.fillStyle = gr;
    this._roundRect(ctx, margin, margin, 512 - margin * 2, photoH, 6);
    ctx.fill();

    ctx.font = 'bold 80px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = ['🌸', '✨', '💖', '🦋', '💌'];
    ctx.fillText(icons[idx % icons.length], 256, margin + photoH / 2);

    ctx.fillStyle = '#1e112a';
    ctx.font = 'bold 26px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const lines = this._wrapText(ctx, memory.title, 440, 30);
    lines.forEach((line, li) => {
      ctx.fillText(line, 256, photoH + margin + 30 + li * 34);
    });

    ctx.fillStyle = '#a381b8';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText(memory.date, 256, photoH + margin + 115);

    const tex = new THREE.CanvasTexture(cvs);
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshStandardMaterial({
      map: tex, side: THREE.DoubleSide, roughness: 0.2, metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    this.disposables.push(tex, geo, mat);

    const glowGeo = new THREE.PlaneGeometry(w + 0.3, h + 0.3);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xedc4ff, transparent: true, opacity: 0.0,
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
    const ambient = new THREE.AmbientLight(0xecdcfc, 0.85);
    this.scene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0xffe8fd, 1.5);
    dir1.position.set(12, 15, 18);
    this.scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xb4d4ff, 1.0);
    dir2.position.set(-15, -10, 10);
    this.scene.add(dir2);

    const point = new THREE.PointLight(0xd49eff, 2.0, 50);
    point.position.set(0, 0, 8);
    this.scene.add(point);
    this.centerLight = point;
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

    if (this.deepStars) {
      this.deepStars.rotation.y = elapsed * 0.01;
    }

    this.nebulas.forEach((neb, i) => {
      neb.rotation.z += 0.02 * delta * (i % 2 === 0 ? 1 : -1);
    });

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
      this.hearts.instanceMatrix.needsUpdate = true;
    }

    if (this.petals) {
      for (let i = 0; i < this.petalData.length; i++) {
        let pd = this.petalData[i];
        pd.x += pd.speedX;
        pd.y += pd.speedY;
        pd.rx += 0.01; pd.ry += 0.015; pd.rz += 0.005;
        if (pd.y < -15) { pd.y = 15; pd.x = (Math.random() - 0.5) * 30; }
        dummy.position.set(pd.x, pd.y, pd.z);
        dummy.rotation.set(pd.rx, pd.ry, pd.rz);
        dummy.updateMatrix();
        this.petals.setMatrixAt(i, dummy.matrix);
      }
      this.petals.instanceMatrix.needsUpdate = true;
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

  // Tối ưu lại _onResize duy nhất và chính xác cho Safari
  _onResize() {
    if (!this.renderer || !this.camera || !this.element) return;

    const w = this.element.clientWidth || window.innerWidth;
    const h = this.element.clientHeight || window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
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