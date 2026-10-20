import * as THREE from 'three';
import gsap from 'gsap';
import { BaseScene } from './BaseScene.js';

/**
 * Tạo hình chữ nhật bo góc 2D (Rounded Rectangle Shape)
 */
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return shape;
}

/**
 * 1. Texture thân hộp: Màu hồng dâu ngọt ngào với trái tim và chấm vàng
 */
function generateBoxPatternTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f5849e';
  ctx.fillRect(0, 0, 300, 300);

  // Trái tim hồng đậm rải rác
  const hearts = [
    { x: 70, y: 120, s: 18, rot: -0.2 },
    { x: 210, y: 80, s: 14, rot: 0.3 },
    { x: 380, y: 110, s: 20, rot: -0.15 },
    { x: 130, y: 260, s: 16, rot: 0.25 },
    { x: 320, y: 240, s: 22, rot: -0.3 },
    { x: 450, y: 290, s: 15, rot: 0.1 },
    { x: 80, y: 420, s: 20, rot: -0.2 },
    { x: 240, y: 390, s: 17, rot: 0.15 },
    { x: 400, y: 430, s: 19, rot: -0.1 },
  ];

  ctx.fillStyle = '#dc486f';
  hearts.forEach(h => {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rot);
    ctx.beginPath();
    const d = h.s;
    ctx.moveTo(0, d * 0.3);
    ctx.bezierCurveTo(-d * 0.5, -d * 0.5, -d, d * 0.2, 0, d);
    ctx.bezierCurveTo(d, d * 0.2, d * 0.5, -d * 0.5, 0, d * 0.3);
    ctx.fill();
    ctx.restore();
  });

  // Chấm bi vàng kem nhỏ xinh
  const dots = [
    { x: 140, y: 90, r: 4.5 },
    { x: 280, y: 140, r: 5 },
    { x: 60, y: 210, r: 4 },
    { x: 230, y: 280, r: 6 },
    { x: 390, y: 210, r: 4.5 },
    { x: 170, y: 360, r: 5.5 },
    { x: 340, y: 350, r: 4.5 },
    { x: 470, y: 400, r: 5 },
    { x: 120, y: 470, r: 4 },
    { x: 290, y: 460, r: 5.5 },
  ];
  ctx.fillStyle = '#fbe39e';
  dots.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 2. Texture nắp hộp: Hồng baby marshmallow với chấm bi hồng đậm
 */
function generateLidPatternTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fecdd6';
  ctx.fillRect(0, 0, 300, 300);

  ctx.fillStyle = '#e85c80';
  const dots = [
    { x: 60, y: 60, r: 8 },
    { x: 180, y: 90, r: 11 },
    { x: 320, y: 70, r: 9 },
    { x: 440, y: 110, r: 7.5 },
    { x: 110, y: 190, r: 10 },
    { x: 250, y: 210, r: 13 },
    { x: 390, y: 220, r: 8.5 },
    { x: 70, y: 330, r: 12 },
    { x: 200, y: 340, r: 9.5 },
    { x: 340, y: 360, r: 11 },
    { x: 460, y: 320, r: 10 },
    { x: 130, y: 440, r: 8.5 },
    { x: 270, y: 450, r: 12 },
    { x: 410, y: 440, r: 9.5 },
  ];
  dots.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 3. Texture ruy băng: Vân vải dệt caro gingham màu hồng mâm xôi
 */
function generateRibbonFabricTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f05b84';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
  ctx.lineWidth = 1.6;
  const step = 8;
  for (let x = 0; x <= 256; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export class GiftScene extends BaseScene {
  constructor(canvas) {
    super(canvas);

    this.floatingObjects = [];
    this.petals = [];
    this.hearts = [];
    this.blooms = [];
    this.sparkleBursts = [];
    this.bears = [];

    // Trạng thái tương tác xoay
    this.isDragging = false;
    this.previousPointerPos = { x: 0, y: 0 };
    this.targetRotation = { x: 0.12, y: -0.38 };
    this.currentRotation = { x: 0.12, y: -0.38 };
    this.autoRotate = true;
    this.autoRotateTimeout = null;
    this.hasLanded = false;
    this.isOpening = false;
    this.camTarget = new THREE.Vector3(0, 0.85, 0);

    this.createCinematicLights();
    this.createBackgroundUniverse();
    this.createPedestal();
    this.createPhotoAccurateGiftBox();
    this.createTeddyBears();
    this.createPlayfulClouds();
    this.createGardenBlooms();
    this.createFloatingHearts();
    this.createFloatingRosePetals();
    this.createSparkleStars();
    this.createFairyDustParticles();
    this.createLandingEffects();
    this.createSuctionVortex();

    this.setupDragControls();
    this.applyCameraFraming();
  }

  // 1. Ánh sáng điện ảnh mềm mại
  createCinematicLights() {
    this.ambientLight = new THREE.AmbientLight(0xfff6f0, 1.22);
    this.scene.add(this.ambientLight);

    this.spotLight = new THREE.SpotLight(0xfffaec, 2.7);
    this.spotLight.position.set(2.8, 9.0, 4.5);
    this.spotLight.angle = Math.PI / 3.6;
    this.spotLight.penumbra = 0.75;
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 2048;
    this.spotLight.shadow.mapSize.height = 2048;
    this.spotLight.shadow.bias = -0.0001;
    this.spotLight.shadow.radius = 3;
    this.scene.add(this.spotLight);

    this.dirLight = new THREE.DirectionalLight(0xf0e8ff, 1.0);
    this.dirLight.position.set(-4.5, 5.5, 3);
    this.scene.add(this.dirLight);

    this.rimLight = new THREE.DirectionalLight(0xffc8dd, 1.5);
    this.rimLight.position.set(0.5, 5, -5.5);
    this.scene.add(this.rimLight);

    this.underglow = new THREE.PointLight(0xffb0c8, 1.5, 9);
    this.underglow.position.set(0, -0.15, 0);
    this.scene.add(this.underglow);

    this.insideLight = new THREE.PointLight(0xffe8ba, 0.1, 4);
    this.insideLight.position.set(0, 0.55, 0);
    this.scene.add(this.insideLight);
  }

  // 2. Vòm vũ trụ pastel
  createBackgroundUniverse() {
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext('2d');

    const skyGrad = skyCtx.createRadialGradient(256, 180, 0, 256, 256, 380);
    skyGrad.addColorStop(0, '#fff8f0');
    skyGrad.addColorStop(0.28, '#fdeef5');
    skyGrad.addColorStop(0.55, '#f5e5f2');
    skyGrad.addColorStop(0.78, '#ede0f5');
    skyGrad.addColorStop(1, '#ddd5f0');
    skyCtx.fillStyle = skyGrad;
    skyCtx.fillRect(0, 0, 512, 512);

    const bokehs = [
      { x: 80, y: 80, r: 60, a: 0.06 },
      { x: 420, y: 100, r: 45, a: 0.05 },
      { x: 260, y: 50, r: 70, a: 0.07 },
      { x: 100, y: 380, r: 55, a: 0.04 },
      { x: 430, y: 390, r: 65, a: 0.05 },
    ];
    bokehs.forEach(b => {
      const g = skyCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `rgba(255, 220, 235, ${b.a})`);
      g.addColorStop(1, 'rgba(255,220,235,0)');
      skyCtx.fillStyle = g;
      skyCtx.fillRect(0, 0, 512, 512);
    });

    const skyTexture = new THREE.CanvasTexture(skyCanvas);

    const domeGeo = new THREE.SphereGeometry(30, 48, 48);
    const domeMat = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
    });
    this.skyDome = new THREE.Mesh(domeGeo, domeMat);
    this.scene.add(this.skyDome);

    const floorGlowGeo = new THREE.PlaneGeometry(28, 28);
    const floorGlowCtx = document.createElement('canvas');
    floorGlowCtx.width = 256;
    floorGlowCtx.height = 256;
    const fCtx = floorGlowCtx.getContext('2d');
    const fGrad = fCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    fGrad.addColorStop(0, 'rgba(255, 220, 235, 0.22)');
    fGrad.addColorStop(0.5, 'rgba(255, 200, 225, 0.08)');
    fGrad.addColorStop(1, 'rgba(255, 200, 225, 0)');
    fCtx.fillStyle = fGrad;
    fCtx.fillRect(0, 0, 256, 256);
    const floorTex = new THREE.CanvasTexture(floorGlowCtx);
    const floorGlowMat = new THREE.MeshBasicMaterial({
      map: floorTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const floorGlow = new THREE.Mesh(floorGlowGeo, floorGlowMat);
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = -0.19;
    this.scene.add(floorGlow);
  }

  // 3. Đĩa bệ ngọc mây
  createPedestal() {
    this.pedestalGroup = new THREE.Group();
    this.scene.add(this.pedestalGroup);

    const discGeo = new THREE.CylinderGeometry(2.35, 2.55, 0.16, 48);
    this.discMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.05,
      transmission: 0.5,
      transparent: true,
      opacity: 0.9,
      clearcoat: 0.9,
      emissive: 0xffe6eb,
      emissiveIntensity: 0.2,
    });
    this.disc = new THREE.Mesh(discGeo, this.discMat);
    this.disc.position.y = -0.08;
    this.disc.receiveShadow = true;
    this.pedestalGroup.add(this.disc);

    const rimGeo = new THREE.TorusGeometry(2.36, 0.038, 16, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf5d38a,
      roughness: 0.25,
      metalness: 0.7,
    });
    const rimMesh = new THREE.Mesh(rimGeo, goldMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0;
    this.pedestalGroup.add(rimMesh);

    const shadowGeo = new THREE.PlaneGeometry(16, 16);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.16;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);
  }

  // Mây kẹo bông nhấp nhô
  createPlayfulClouds() {
    this.playfulClouds = [];
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      roughness: 0.35,
      metalness: 0.02,
      emissive: 0xffe2ec,
      emissiveIntensity: 0.18,
    });

    const cloudPuffGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const cloudConfigs = [
      { x: -3.8, y: 0.2, z: -1.2, scale: 1.1, phase: 0 },
      { x: -2.3, y: 0.1, z: -2.5, scale: 0.9, phase: 1.2 },
      { x: 3.8, y: 0.25, z: -1.2, scale: 1.1, phase: 2.1 },
      { x: 2.3, y: 0.15, z: -2.5, scale: 0.95, phase: 3.3 },
      { x: 0, y: -0.05, z: -3.2, scale: 1.35, phase: 4.0 },
      { x: 1.7, y: -0.02, z: -3.0, scale: 1.0, phase: 5.1 },
      { x: -1.7, y: -0.02, z: -3.0, scale: 1.0, phase: 0.8 },
    ];

    cloudConfigs.forEach(cfg => {
      const cloudGroup = new THREE.Group();
      cloudGroup.position.set(cfg.x, cfg.y, cfg.z);

      const puffs = [
        { x: 0, y: 0, z: 0, s: 1.0 },
        { x: -0.32, y: -0.05, z: 0.1, s: 0.8 },
        { x: 0.32, y: -0.05, z: 0.1, s: 0.8 },
        { x: 0, y: -0.06, z: 0.28, s: 0.75 },
      ];
      puffs.forEach(p => {
        const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
        puff.position.set(p.x, p.y, p.z);
        puff.scale.set(p.s, p.s * 0.7, p.s);
        puff.castShadow = true;
        cloudGroup.add(puff);
      });

      cloudGroup.scale.set(cfg.scale, cfg.scale, cfg.scale);
      cloudGroup.userData = {
        baseY: cfg.y,
        phase: cfg.phase,
      };

      this.scene.add(cloudGroup);
      this.playfulClouds.push(cloudGroup);
    });
  }

  // 4. Dựng hộp quà
  createPhotoAccurateGiftBox() {
    this.giftGroup = new THREE.Group();
    this.scene.add(this.giftGroup);

    this.boxSize = 1.5;
    this.boxHeight = 1.25;
    this.boxRadius = 0.18;

    this.boxBodyTexture = generateBoxPatternTexture();
    this.boxLidTexture = generateLidPatternTexture();
    this.ribbonTexture = generateRibbonFabricTexture();

    this.boxBodyMaterial = new THREE.MeshPhysicalMaterial({
      map: this.boxBodyTexture,
      roughness: 0.38,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.45,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xffd0dc),
      side: THREE.DoubleSide,
    });

    this.boxLidMaterial = new THREE.MeshPhysicalMaterial({
      map: this.boxLidTexture,
      roughness: 0.36,
      metalness: 0.04,
      clearcoat: 0.4,
      clearcoatRoughness: 0.4,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xffe4ec),
    });

    this.ribbonMaterial = new THREE.MeshPhysicalMaterial({
      map: this.ribbonTexture,
      roughness: 0.42,
      metalness: 0.06,
      clearcoat: 0.2,
      side: THREE.DoubleSide,
    });

    // --- A. Thân hộp RỖNG ---
    const outerShape = createRoundedRectShape(this.boxSize, this.boxSize, this.boxRadius);
    const innerShape = createRoundedRectShape(this.boxSize - 0.16, this.boxSize - 0.16, this.boxRadius - 0.02);
    outerShape.holes.push(innerShape);

    const bodyExtrudeSettings = {
      depth: this.boxHeight,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    };
    const bodyGeo = new THREE.ExtrudeGeometry(outerShape, bodyExtrudeSettings);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.center();

    this.boxBody = new THREE.Mesh(bodyGeo, this.boxBodyMaterial);
    this.boxBody.position.y = this.boxHeight / 2;
    this.boxBody.castShadow = true;
    this.boxBody.receiveShadow = true;
    this.giftGroup.add(this.boxBody);

    const floorShape = createRoundedRectShape(this.boxSize - 0.08, this.boxSize - 0.08, this.boxRadius - 0.01);
    const floorGeo = new THREE.ExtrudeGeometry(floorShape, {
      depth: 0.08,
      bevelEnabled: false,
    });
    floorGeo.rotateX(Math.PI / 2);
    floorGeo.center();
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1f0e22,
      roughness: 0.8,
    });
    this.boxFloor = new THREE.Mesh(floorGeo, floorMat);
    this.boxFloor.position.y = 0.04;
    this.boxFloor.receiveShadow = true;
    this.giftGroup.add(this.boxFloor);

    // HIỆU ỨNG ÁNH SÁNG TRONG LÒNG HỘP
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const gctx = glowCanvas.getContext('2d');
    const rad = gctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    rad.addColorStop(0, 'rgba(255, 235, 185, 0.95)');
    rad.addColorStop(0.35, 'rgba(255, 205, 160, 0.55)');
    rad.addColorStop(0.7, 'rgba(235, 175, 215, 0.25)');
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    gctx.fillStyle = rad;
    gctx.fillRect(0, 0, 128, 128);

    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const discGeo = new THREE.PlaneGeometry(0.85, 0.85);
    const discMat = new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.bottomGlowDisc = new THREE.Mesh(discGeo, discMat);
    this.bottomGlowDisc.rotation.x = -Math.PI / 2;
    this.bottomGlowDisc.position.set(0, 0.12, 0);
    this.bottomGlowDisc.scale.set(0.01, 0.01, 0.01);
    this.giftGroup.add(this.bottomGlowDisc);

    const mistGeo = new THREE.RingGeometry(0.12, 0.42, 32);
    const mistMat = new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.etherealMist = new THREE.Mesh(mistGeo, mistMat);
    this.etherealMist.rotation.x = -Math.PI / 2;
    this.etherealMist.position.set(0, 0.45, 0);
    this.etherealMist.scale.set(0.01, 0.01, 0.01);
    this.giftGroup.add(this.etherealMist);

    const moteCount = 28;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    this.moteData = [];
    for (let i = 0; i < moteCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.08 + Math.random() * 0.35;
      const y = 0.15 + Math.random() * 0.95;
      motePos[i * 3] = Math.cos(angle) * radius;
      motePos[i * 3 + 1] = y;
      motePos[i * 3 + 2] = Math.sin(angle) * radius;
      this.moteData.push({
        angle,
        radius,
        speed: 0.6 + Math.random() * 0.8,
        upSpeed: 0.25 + Math.random() * 0.35,
        baseY: y,
      });
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    this.stardustMotesMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xffe8a3,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.stardustMotes = new THREE.Points(moteGeo, this.stardustMotesMat);
    this.giftGroup.add(this.stardustMotes);

    // Ruy băng
    const ribbonWidth = 0.32;
    const ribThickness = 0.018;
    const halfSize = this.boxSize / 2;

    const ribFrontGeo = new THREE.BoxGeometry(ribbonWidth, this.boxHeight, ribThickness);
    const ribFront = new THREE.Mesh(ribFrontGeo, this.ribbonMaterial);
    ribFront.position.set(0, this.boxHeight / 2, halfSize + ribThickness / 2 + 0.002);
    ribFront.castShadow = true;
    this.giftGroup.add(ribFront);

    const ribBackGeo = new THREE.BoxGeometry(ribbonWidth, this.boxHeight, ribThickness);
    const ribBack = new THREE.Mesh(ribBackGeo, this.ribbonMaterial);
    ribBack.position.set(0, this.boxHeight / 2, -(halfSize + ribThickness / 2 + 0.002));
    ribBack.castShadow = true;
    this.giftGroup.add(ribBack);

    const ribLeftGeo = new THREE.BoxGeometry(ribThickness, this.boxHeight, ribbonWidth);
    const ribLeft = new THREE.Mesh(ribLeftGeo, this.ribbonMaterial);
    ribLeft.position.set(-(halfSize + ribThickness / 2 + 0.002), this.boxHeight / 2, 0);
    ribLeft.castShadow = true;
    this.giftGroup.add(ribLeft);

    const ribRightGeo = new THREE.BoxGeometry(ribThickness, this.boxHeight, ribbonWidth);
    const ribRight = new THREE.Mesh(ribRightGeo, this.ribbonMaterial);
    ribRight.position.set(halfSize + ribThickness / 2 + 0.002, this.boxHeight / 2, 0);
    ribRight.castShadow = true;
    this.giftGroup.add(ribRight);

    const ribBottomZGeo = new THREE.BoxGeometry(ribbonWidth, ribThickness, this.boxSize);
    const ribBottomZ = new THREE.Mesh(ribBottomZGeo, this.ribbonMaterial);
    ribBottomZ.position.set(0, ribThickness / 2, 0);
    this.giftGroup.add(ribBottomZ);

    const ribBottomXGeo = new THREE.BoxGeometry(this.boxSize, ribThickness, ribbonWidth);
    const ribBottomX = new THREE.Mesh(ribBottomXGeo, this.ribbonMaterial);
    ribBottomX.position.set(0, ribThickness / 2 + 0.001, 0);
    this.giftGroup.add(ribBottomX);

    // --- B. Nắp hộp ---
    this.boxLidGroup = new THREE.Group();
    this.boxLidGroup.position.set(0, this.boxHeight, 0);
    this.giftGroup.add(this.boxLidGroup);
    this.lidHinge = this.boxLidGroup;

    this.lidSize = this.boxSize + 0.12;
    this.lidHeight = 0.28;

    const lidShape = createRoundedRectShape(this.lidSize, this.lidSize, this.boxRadius + 0.04);
    const lidExtrudeSettings = {
      depth: this.lidHeight,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };
    const lidGeo = new THREE.ExtrudeGeometry(lidShape, lidExtrudeSettings);
    lidGeo.rotateX(Math.PI / 2);
    lidGeo.center();

    this.boxLid = new THREE.Mesh(lidGeo, this.boxLidMaterial);
    this.boxLid.position.set(0, this.lidHeight / 2, 0);
    this.boxLid.castShadow = true;
    this.boxLid.receiveShadow = true;
    this.boxLidGroup.add(this.boxLid);

    const ribLidZGeo = new THREE.BoxGeometry(ribbonWidth, this.lidHeight + 0.01, this.lidSize + 0.05);
    const ribLidZ = new THREE.Mesh(ribLidZGeo, this.ribbonMaterial);
    ribLidZ.position.set(0, this.lidHeight / 2, 0);
    ribLidZ.castShadow = true;
    this.boxLidGroup.add(ribLidZ);

    const ribLidXGeo = new THREE.BoxGeometry(this.lidSize + 0.05, this.lidHeight + 0.015, ribbonWidth);
    const ribLidX = new THREE.Mesh(ribLidXGeo, this.ribbonMaterial);
    ribLidX.position.set(0, this.lidHeight / 2, 0);
    ribLidX.castShadow = true;
    this.boxLidGroup.add(ribLidX);

    this.createPuffyPillowBow();
  }

  createPuffyPillowBow() {
    this.bowGroup = new THREE.Group();
    this.bowGroup.position.set(0, this.lidHeight + 0.01, 0);
    this.boxLidGroup.add(this.bowGroup);

    const knotGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.32, 24);
    const knot = new THREE.Mesh(knotGeo, this.ribbonMaterial);
    knot.rotation.z = Math.PI / 2;
    knot.position.set(0, 0.15, 0);
    knot.scale.set(1.0, 1.25, 0.88);
    knot.castShadow = true;
    this.bowGroup.add(knot);

    const loopGeo = new THREE.TorusGeometry(0.32, 0.16, 24, 36);

    const loopLeft = new THREE.Mesh(loopGeo, this.ribbonMaterial);
    loopLeft.scale.set(1.35, 1.05, 0.82);
    loopLeft.rotation.set(0.12, 0.15, 0.38);
    loopLeft.position.set(-0.36, 0.22, 0);
    loopLeft.castShadow = true;
    this.bowGroup.add(loopLeft);

    const loopRight = new THREE.Mesh(loopGeo, this.ribbonMaterial);
    loopRight.scale.set(1.35, 1.05, 0.82);
    loopRight.rotation.set(0.12, -0.15, -0.38);
    loopRight.position.set(0.36, 0.22, 0);
    loopRight.castShadow = true;
    this.bowGroup.add(loopRight);
  }

  createGardenBlooms() {
    this.blooms = [];
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x8fbf9a, roughness: 0.7 });
    const petalMatA = new THREE.MeshStandardMaterial({
      color: 0xf7a8ba, roughness: 0.4, emissive: 0x6a2038, emissiveIntensity: 0.12,
    });
    const petalMatB = new THREE.MeshStandardMaterial({
      color: 0xf3d6ee, roughness: 0.42, emissive: 0x5a3068, emissiveIntensity: 0.1,
    });
    const centerMat = new THREE.MeshStandardMaterial({ color: 0xffe7a0, roughness: 0.35 });
    const petalGeo = new THREE.SphereGeometry(0.11, 12, 12);
    const stemGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.42, 8);
    const centerGeo = new THREE.SphereGeometry(0.055, 10, 10);

    const spots = [
      { x: -1.7, z: 1.15, s: 0.9, phase: 0.2 },
      { x: 1.85, z: 1.05, s: 1.0, phase: 1.1 },
      { x: -2.15, z: 0.2, s: 0.8, phase: 2.0 },
      { x: 2.2, z: 0.15, s: 0.85, phase: 2.7 },
    ];

    spots.forEach((spot, idx) => {
      const flower = new THREE.Group();
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.2;
      flower.add(stem);

      const head = new THREE.Group();
      head.position.y = 0.44;
      const mat = idx % 2 === 0 ? petalMatA : petalMatB;
      for (let i = 0; i < 5; i++) {
        const p = new THREE.Mesh(petalGeo, mat);
        const a = (i / 5) * Math.PI * 2;
        p.position.set(Math.cos(a) * 0.12, 0.02, Math.sin(a) * 0.12);
        p.scale.set(1, 0.45, 0.8);
        head.add(p);
      }
      head.add(new THREE.Mesh(centerGeo, centerMat));
      flower.add(head);
      flower.position.set(spot.x, 0.02, spot.z);
      flower.scale.setScalar(spot.s);
      flower.userData = { phase: spot.phase, head };
      this.scene.add(flower);
      this.blooms.push(flower);
    });
  }

  createFloatingHearts() {
    const heartShape = new THREE.Shape();
    const s = 0.16;
    heartShape.moveTo(0, s * 0.7);
    heartShape.bezierCurveTo(0, s * 1.0, -s * 0.8, s * 1.2, -s * 0.8, s * 0.6);
    heartShape.bezierCurveTo(-s * 0.8, s * 0.2, -s * 0.3, -s * 0.3, 0, -s * 0.8);
    heartShape.bezierCurveTo(s * 0.3, -s * 0.3, s * 0.8, s * 0.2, s * 0.8, s * 0.6);
    heartShape.bezierCurveTo(s * 0.8, s * 1.2, 0, s * 1.0, 0, s * 0.7);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.05, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.02, bevelThickness: 0.02,
    });
    heartGeo.center();
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff7a9a,
      roughness: 0.28,
      metalness: 0.08,
      emissive: 0x7a1830,
      emissiveIntensity: 0.28,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < 8; i++) {
      const heart = new THREE.Mesh(heartGeo, heartMat);
      const angle = (i / 8) * Math.PI * 2;
      const dist = 2.1 + (i % 3) * 0.45;
      const y = 0.9 + (i % 4) * 0.55;
      heart.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist * 0.7);
      const sc = 0.55 + (i % 3) * 0.12;
      heart.scale.setScalar(sc);
      heart.userData = { baseY: y, phase: i * 0.7, rot: 0.4 + i * 0.08 };
      this.hearts.push(heart);
      this.scene.add(heart);
    }
  }

  applyCameraFraming() {
    const compact = this.width < 720;
    this.camera.fov = compact ? 48 : 40;
    if (!this.isOpening) {
      this.camera.position.z = compact ? 7.15 : 5.8;
      if (!this.isDragging) this.camera.position.y = compact ? 2.62 : 2.4;
    }
    this.camera.updateProjectionMatrix();
  }

  // 5. Gấu bông 3D
  createTeddyBears() {
    this.bearLeft = this.buildTeddyBear({
      furColor: 0xdfa570,
      snoutColor: 0xfff6ed,
      innerEarColor: 0xfdaebb,
      heartColor: 0xff5e84,
      type: 'holding-heart',
    });
    this.bearLeft.position.set(-3.3, 0.55, -1.8);
    this.bearLeft.rotation.set(0.08, 0.45, -0.05);
    this.bearLeft.scale.set(0.95, 0.95, 0.95);
    this.scene.add(this.bearLeft);
    this.bears.push(this.bearLeft);

    this.bearRight = this.buildTeddyBear({
      furColor: 0xfff2e3,
      snoutColor: 0xffffff,
      innerEarColor: 0xfdaebb,
      type: 'waving',
    });
    this.bearRight.position.set(3.3, 0.75, -1.8);
    this.bearRight.rotation.set(0.08, -0.45, 0.05);
    this.bearRight.scale.set(0.95, 0.95, 0.95);
    this.scene.add(this.bearRight);
    this.bears.push(this.bearRight);
  }

  buildTeddyBear({ furColor, snoutColor, innerEarColor, heartColor, type }) {
    const bearGroup = new THREE.Group();

    const furMat = new THREE.MeshStandardMaterial({
      color: furColor,
      roughness: 0.65,
      metalness: 0.02,
    });

    const innerEarMat = new THREE.MeshStandardMaterial({
      color: innerEarColor,
      roughness: 0.55,
      metalness: 0.02,
    });

    const snoutMat = new THREE.MeshStandardMaterial({
      color: snoutColor,
      roughness: 0.5,
      metalness: 0.02,
    });

    const noseEyeMat = new THREE.MeshStandardMaterial({
      color: 0x221308,
      roughness: 0.2,
      metalness: 0.1,
    });

    const eyeSparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const cheekMat = new THREE.MeshBasicMaterial({
      color: 0xff8fa7,
      transparent: true,
      opacity: 0.65,
    });

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.85, 0);
    bearGroup.add(headGroup);
    bearGroup.headPart = headGroup;

    const headGeo = new THREE.SphereGeometry(0.48, 24, 24);
    const head = new THREE.Mesh(headGeo, furMat);
    head.scale.set(1.05, 0.96, 1.0);
    head.castShadow = true;
    headGroup.add(head);

    const earGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const leftEar = new THREE.Mesh(earGeo, furMat);
    leftEar.position.set(-0.38, 0.38, 0.05);
    leftEar.castShadow = true;
    headGroup.add(leftEar);

    const innerEarGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
    leftInnerEar.position.set(-0.38, 0.38, 0.09);
    headGroup.add(leftInnerEar);

    const rightEar = new THREE.Mesh(earGeo, furMat);
    rightEar.position.set(0.38, 0.38, 0.05);
    rightEar.castShadow = true;
    headGroup.add(rightEar);

    const rightInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
    rightInnerEar.position.set(0.38, 0.38, 0.09);
    headGroup.add(rightInnerEar);

    const snoutGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.scale.set(1.15, 0.8, 0.85);
    snout.position.set(0, -0.08, 0.38);
    headGroup.add(snout);

    const noseGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const nose = new THREE.Mesh(noseGeo, noseEyeMat);
    nose.scale.set(1.2, 0.8, 0.8);
    nose.position.set(0, -0.02, 0.54);
    headGroup.add(nose);

    const eyeGeo = new THREE.SphereGeometry(0.062, 14, 14);
    const leftEye = new THREE.Mesh(eyeGeo, noseEyeMat);
    leftEye.position.set(-0.17, 0.06, 0.43);
    headGroup.add(leftEye);

    const sparkleGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const leftSparkle = new THREE.Mesh(sparkleGeo, eyeSparkleMat);
    leftSparkle.position.set(-0.15, 0.08, 0.48);
    headGroup.add(leftSparkle);

    const rightEye = new THREE.Mesh(eyeGeo, noseEyeMat);
    rightEye.position.set(0.17, 0.06, 0.43);
    headGroup.add(rightEye);

    const rightSparkle = new THREE.Mesh(sparkleGeo, eyeSparkleMat);
    rightSparkle.position.set(0.19, 0.08, 0.48);
    headGroup.add(rightSparkle);

    const cheekGeo = new THREE.CircleGeometry(0.09, 16);
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.29, -0.07, 0.38);
    leftCheek.rotation.y = -0.35;
    headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.29, -0.07, 0.38);
    rightCheek.rotation.y = 0.35;
    headGroup.add(rightCheek);

    const bodyGeo = new THREE.SphereGeometry(0.58, 24, 24);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.scale.set(1.0, 1.15, 0.95);
    body.position.set(0, 0.05, 0);
    body.castShadow = true;
    bearGroup.add(body);

    const tummyGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const tummy = new THREE.Mesh(tummyGeo, snoutMat);
    tummy.scale.set(0.9, 1.05, 0.5);
    tummy.position.set(0, 0.08, 0.42);
    bearGroup.add(tummy);

    const footGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const leftFoot = new THREE.Mesh(footGeo, furMat);
    leftFoot.scale.set(0.9, 0.75, 1.2);
    leftFoot.position.set(-0.35, -0.38, 0.38);
    leftFoot.castShadow = true;
    bearGroup.add(leftFoot);

    const footPadGeo = new THREE.CircleGeometry(0.11, 16);
    const leftPad = new THREE.Mesh(footPadGeo, innerEarMat);
    leftPad.position.set(-0.35, -0.38, 0.64);
    bearGroup.add(leftPad);

    const rightFoot = new THREE.Mesh(footGeo, furMat);
    rightFoot.scale.set(0.9, 0.75, 1.2);
    rightFoot.position.set(0.35, -0.38, 0.38);
    rightFoot.castShadow = true;
    bearGroup.add(rightFoot);

    const rightPad = new THREE.Mesh(footPadGeo, innerEarMat);
    rightPad.position.set(0.35, -0.38, 0.64);
    bearGroup.add(rightPad);

    if (type === 'holding-heart') {
      const armGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const leftArm = new THREE.Mesh(armGeo, furMat);
      leftArm.scale.set(0.8, 1.4, 0.8);
      leftArm.position.set(-0.36, 0.18, 0.32);
      leftArm.rotation.set(0.8, 0.3, -0.4);
      leftArm.castShadow = true;
      bearGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, furMat);
      rightArm.scale.set(0.8, 1.4, 0.8);
      rightArm.position.set(0.36, 0.18, 0.32);
      rightArm.rotation.set(0.8, -0.3, 0.4);
      rightArm.castShadow = true;
      bearGroup.add(rightArm);

      const heartShape = new THREE.Shape();
      const s = 0.22;
      heartShape.moveTo(0, s * 0.7);
      heartShape.bezierCurveTo(0, s * 1.0, -s * 0.8, s * 1.2, -s * 0.8, s * 0.6);
      heartShape.bezierCurveTo(-s * 0.8, s * 0.2, -s * 0.3, -s * 0.3, 0, -s * 0.8);
      heartShape.bezierCurveTo(s * 0.3, -s * 0.3, s * 0.8, s * 0.2, s * 0.8, s * 0.6);
      heartShape.bezierCurveTo(s * 0.8, s * 1.2, 0, s * 1.0, 0, s * 0.7);

      const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.04,
      });
      heartGeo.center();

      const heartMat = new THREE.MeshStandardMaterial({
        color: heartColor,
        roughness: 0.25,
        metalness: 0.1,
        emissive: 0x801830,
        emissiveIntensity: 0.35,
      });
      const heart = new THREE.Mesh(heartGeo, heartMat);
      heart.position.set(0, 0.2, 0.52);
      heart.rotation.set(-0.2, 0, 0);
      bearGroup.add(heart);
      bearGroup.heartPart = heart;
    } else if (type === 'waving') {
      const armGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const leftArm = new THREE.Mesh(armGeo, furMat);
      leftArm.scale.set(0.8, 1.3, 0.8);
      leftArm.position.set(-0.46, 0.08, 0.2);
      leftArm.rotation.set(0.2, 0.2, 0.3);
      bearGroup.add(leftArm);

      const wavingArmGroup = new THREE.Group();
      wavingArmGroup.position.set(0.48, 0.35, 0.1);
      bearGroup.add(wavingArmGroup);
      bearGroup.wavingArm = wavingArmGroup;

      const rightArm = new THREE.Mesh(armGeo, furMat);
      rightArm.scale.set(0.8, 1.4, 0.8);
      rightArm.position.set(0.15, 0.25, 0);
      rightArm.rotation.z = -0.55;
      rightArm.castShadow = true;
      wavingArmGroup.add(rightArm);
    }

    const cloudGroup = new THREE.Group();
    cloudGroup.position.set(0, -0.58, 0);
    bearGroup.add(cloudGroup);

    const cloudPuffGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffe9f0,
      roughness: 0.4,
      metalness: 0.02,
    });
    const puffs = [
      { x: 0, y: 0, z: 0, s: 1.1 },
      { x: -0.35, y: -0.05, z: 0.1, s: 0.9 },
      { x: 0.35, y: -0.05, z: 0.1, s: 0.9 },
      { x: 0, y: -0.05, z: 0.35, s: 0.85 },
      { x: 0, y: -0.05, z: -0.3, s: 0.85 },
    ];
    puffs.forEach(p => {
      const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
      puff.position.set(p.x, p.y, p.z);
      puff.scale.set(p.s, p.s * 0.7, p.s);
      cloudGroup.add(puff);
    });

    return bearGroup;
  }

  // 6. Cánh hoa hồng
  createFloatingRosePetals() {
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.12, 0.15, 0.18, 0.35, 0, 0.5);
    petalShape.bezierCurveTo(-0.18, 0.35, -0.12, 0.15, 0, 0);

    const petalGeo = new THREE.ExtrudeGeometry(petalShape, {
      depth: 0.015,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    petalGeo.center();

    const petalMat1 = new THREE.MeshStandardMaterial({
      color: 0xfca5b7,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const petalMat2 = new THREE.MeshStandardMaterial({
      color: 0xfed8e1,
      roughness: 0.4,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const petalCount = 14;
    for (let i = 0; i < petalCount; i++) {
      const mat = i % 2 === 0 ? petalMat1 : petalMat2;
      const petal = new THREE.Mesh(petalGeo, mat);

      const angle = (i / petalCount) * Math.PI * 2;
      const dist = 1.6 + Math.random() * 2.5;
      const y = 0.4 + Math.random() * 3.2;

      petal.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
      petal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const scale = 0.6 + Math.random() * 0.6;
      petal.scale.set(scale, scale, scale);

      petal.userData = {
        baseScale: scale,
        baseX: petal.position.x,
        baseZ: petal.position.z,
        baseY: y,
        speedY: 0.5 + Math.random() * 0.7,
        rotSpeedX: (Math.random() - 0.5) * 1.2,
        rotSpeedY: (Math.random() - 0.5) * 1.5,
        rotSpeedZ: (Math.random() - 0.5) * 1.0,
        phase: Math.random() * Math.PI * 2,
      };

      this.petals.push(petal);
      this.scene.add(petal);
    }
  }

  // 7. Ngôi sao
  createSparkleStars() {
    const starShape = new THREE.Shape();
    const s = 0.16;
    starShape.moveTo(0, s);
    starShape.quadraticCurveTo(0, 0, s, 0);
    starShape.quadraticCurveTo(0, 0, 0, -s);
    starShape.quadraticCurveTo(0, 0, -s, 0);
    starShape.quadraticCurveTo(0, 0, 0, s);

    const starGeo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    starGeo.center();

    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfff0aa,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x9e7b26,
      emissiveIntensity: 0.4,
    });

    const starCount = 10;
    for (let i = 0; i < starCount; i++) {
      const star = new THREE.Mesh(starGeo, starMat);
      const angle = (i / starCount) * Math.PI * 2;
      const dist = 2.0 + Math.random() * 2.2;
      const y = 0.8 + Math.random() * 3.0;

      star.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
      star.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const scale = 0.5 + Math.random() * 0.6;
      star.scale.set(scale, scale, scale);

      star.userData = {
        baseScale: scale,
        baseX: star.position.x,
        baseZ: star.position.z,
        baseY: y,
        speedY: 0.8 + Math.random() * 0.9,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        phase: Math.random() * Math.PI * 2,
      };

      this.floatingObjects.push(star);
      this.scene.add(star);
    }
  }

  // 8. Bụi tiên
  createFairyDustParticles() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const palette = [
      new THREE.Color(0xffe599),
      new THREE.Color(0xfcb8d2),
      new THREE.Color(0xe1c8fd),
      new THREE.Color(0xffffff),
      new THREE.Color(0xffd1ba),
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.8 + Math.random() * 5.2;
      const theta = Math.random() * Math.PI * 2;
      const y = 0.1 + Math.random() * 4.5;

      positions[i * 3] = radius * Math.cos(theta);
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = radius * Math.sin(theta);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 0.14 + 0.04;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.35, 'rgba(255, 243, 196, 0.9)');
    gradient.addColorStop(0.7, 'rgba(252, 184, 210, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    this.initialParticlePositions = positions.slice();
  }

  // 9. Hiệu ứng đáp đất
  createLandingEffects() {
    const ringGeo = new THREE.RingGeometry(0.1, 0.25, 48);
    this.shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xffe6a3,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.shockwave = new THREE.Mesh(ringGeo, this.shockwaveMat);
    this.shockwave.rotation.x = -Math.PI / 2;
    this.shockwave.position.y = 0.02;
    this.scene.add(this.shockwave);

    const burstCount = 60;
    const burstGeo = new THREE.BufferGeometry();
    const burstPos = new Float32Array(burstCount * 3);
    this.burstVelocities = [];

    for (let i = 0; i < burstCount; i++) {
      burstPos[i * 3] = 0;
      burstPos[i * 3 + 1] = 0.05;
      burstPos[i * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.5;
      const upward = 0.6 + Math.random() * 1.5;
      this.burstVelocities.push({
        vx: Math.cos(angle) * speed,
        vy: upward,
        vz: Math.sin(angle) * speed,
      });
    }

    burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
    this.burstMat = new THREE.PointsMaterial({
      size: 0.14,
      color: 0xffd97d,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.sparkleBurstMesh = new THREE.Points(burstGeo, this.burstMat);
    this.scene.add(this.sparkleBurstMesh);
  }

  // 10. Xoáy lốc ma thuật hút vào lòng hộp
  createSuctionVortex() {
    const count = 240;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.vortexParticleData = [];

    const palette = [
      new THREE.Color(0xfff5cc),
      new THREE.Color(0xffd1dc),
      new THREE.Color(0xffffff),
      new THREE.Color(0xffbfa3),
      new THREE.Color(0xe8c1ff),
    ];

    const arms = 4;
    for (let i = 0; i < count; i++) {
      const armIndex = i % arms;
      const armAngle = (armIndex / arms) * Math.PI * 2;
      const distRatio = Math.pow(Math.random(), 0.65);
      const radius = 0.6 + distRatio * 4.6;
      const spiralOffset = radius * 1.6;
      const angle = armAngle + spiralOffset + (Math.random() - 0.5) * 0.35;
      const y = 0.45 + distRatio * 3.6 + (Math.random() - 0.5) * 0.5;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      this.vortexParticleData.push({
        baseRadius: radius,
        baseAngle: angle,
        baseY: y,
        spiralSpeed: 4.0 + Math.random() * 3.0,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 240, 180, 0.9)');
    grad.addColorStop(0.7, 'rgba(255, 180, 215, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    this.vortexMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.vortexMesh = new THREE.Points(geometry, this.vortexMaterial);
    this.scene.add(this.vortexMesh);

    this.suctionProgress = 0;
    this.isSuctionActive = false;
  }

  // 11. Animation thả hộp quà
  playEntranceAnimation(onComplete) {
    this.giftGroup.position.set(0, 7.5, 0);
    this.giftGroup.rotation.set(-0.3, Math.PI * 1.2, 0.2);
    this.giftGroup.scale.set(0.9, 1.15, 0.9);

    const tl = gsap.timeline({
      onComplete: () => {
        this.hasLanded = true;
        if (onComplete) onComplete();
      },
    });

    tl.to(this.giftGroup.position, {
      y: 0,
      duration: 1.6,
      ease: 'power2.in',
    }, 0);

    tl.to(this.giftGroup.rotation, {
      x: 0.12,
      y: -0.38,
      z: 0,
      duration: 1.6,
      ease: 'power1.out',
    }, 0);

    tl.add(() => {
      gsap.timeline()
        .to(this.giftGroup.scale, {
          x: 1.12,
          y: 0.85,
          z: 1.12,
          duration: 0.14,
          ease: 'power2.out',
        })
        .to(this.giftGroup.scale, {
          x: 0.96,
          y: 1.05,
          z: 0.96,
          duration: 0.22,
          ease: 'power1.out',
        })
        .to(this.giftGroup.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.4)',
        });

      this.shockwave.scale.set(0.5, 0.5, 0.5);
      this.shockwaveMat.opacity = 1;
      gsap.to(this.shockwave.scale, {
        x: 14,
        y: 14,
        z: 14,
        duration: 0.85,
        ease: 'power2.out',
      });
      gsap.to(this.shockwaveMat, {
        opacity: 0,
        duration: 0.85,
        ease: 'power2.out',
      });

      gsap.timeline()
        .to(this.discMat, {
          emissiveIntensity: 1.2,
          duration: 0.12,
        })
        .to(this.discMat, {
          emissiveIntensity: 0.2,
          duration: 0.7,
          ease: 'power2.out',
        });

      this.burstMat.opacity = 1;
      this.isBurstActive = true;
      this.burstStartTime = this.clock.getElapsedTime();

      gsap.timeline()
        .to(this.camera.position, {
          y: 2.22,
          duration: 0.1,
          ease: 'power1.in',
        })
        .to(this.camera.position, {
          y: 2.4,
          duration: 0.45,
          ease: 'elastic.out(1, 0.5)',
        });
    }, 1.6);
  }

  // Tương tác kéo xoay & click
  setupDragControls() {
    this.raycaster = new THREE.Raycaster();
    this.mouseVec = new THREE.Vector2();

    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;
    let totalMoved = 0;
    let lastClientPos = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      if (e.target.closest('.interactive-ui')) return;

      this.isDragging = true;
      this.autoRotate = false;
      if (this.autoRotateTimeout) clearTimeout(this.autoRotateTimeout);

      pointerDownPos = { x: e.clientX, y: e.clientY };
      lastClientPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = performance.now();
      totalMoved = 0;
      this.previousPointerPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : lastClientPos.x;
      const clientY = e.clientY !== undefined ? e.clientY : lastClientPos.y;
      lastClientPos = { x: clientX, y: clientY };

      if (!this.isDragging && this.hasLanded && !this.isOpening && this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouseVec, this.camera);
        const intersects = this.raycaster.intersectObjects(this.giftGroup.children, true);
        if (intersects.length > 0) {
          this.canvas.style.cursor = 'pointer';
        } else {
          this.canvas.style.cursor = 'grab';
        }
      }

      if (!this.isDragging || !this.hasLanded) return;

      const deltaX = clientX - this.previousPointerPos.x;
      const deltaY = clientY - this.previousPointerPos.y;
      totalMoved += Math.hypot(deltaX, deltaY);

      if (totalMoved > 6 && this.canvas) {
        this.canvas.classList.add('is-dragging');
        this.canvas.style.cursor = 'grabbing';
      }

      const sensitivity = 0.007;
      this.targetRotation.y += deltaX * sensitivity;
      this.targetRotation.x += deltaY * sensitivity * 0.7;
      this.targetRotation.x = Math.max(-0.4, Math.min(0.65, this.targetRotation.x));

      this.previousPointerPos = { x: clientX, y: clientY };
    };

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      if (this.canvas) {
        this.canvas.classList.remove('is-dragging');
        this.canvas.style.cursor = 'grab';
      }

      const clientX = (e && e.clientX !== undefined && e.clientX !== 0) ? e.clientX : lastClientPos.x;
      const clientY = (e && e.clientY !== undefined && e.clientY !== 0) ? e.clientY : lastClientPos.y;
      const elapsed = performance.now() - pointerDownTime;

      if (totalMoved < 10 && elapsed < 500 && this.hasLanded && !this.isOpening) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouseVec, this.camera);
        const intersects = this.raycaster.intersectObjects(this.giftGroup.children, true);

        if (intersects.length > 0) {
          gsap.timeline()
            .to(this.giftGroup.scale, {
              x: 1.08,
              y: 0.92,
              z: 1.08,
              duration: 0.1,
              ease: 'power2.out',
            })
            .to(this.giftGroup.scale, {
              x: 1.0,
              y: 1.0,
              z: 1.0,
              duration: 0.16,
              ease: 'elastic.out(1.2, 0.4)',
              onComplete: () => {
                if (this.onBoxClick) {
                  this.onBoxClick();
                }
              }
            });
          return;
        }

        const bearHits = this.raycaster.intersectObjects(this.bears, true);
        if (bearHits.length) {
          const bear = bearHits[0].object.parent;
          let target = bear;
          while (target && !this.bears.includes(target)) target = target.parent;
          if (target) {
            gsap.timeline()
              .to(target.scale, { x: 1.08, y: 0.94, z: 1.08, duration: 0.12, ease: 'power2.out' })
              .to(target.scale, { x: 0.95, y: 0.95, z: 0.95, duration: 0.28, ease: 'elastic.out(1.1, 0.4)' });
            if (target.headPart) {
              gsap.to(target.headPart.rotation, { z: 0.28, yoyo: true, repeat: 1, duration: 0.18 });
            }
          }
        }
      }

      this.autoRotateTimeout = setTimeout(() => {
        this.autoRotate = true;
      }, 2500);
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  // 12. Mở nắp, xoáy sáng hút vào tâm & chuyển cảnh
  openGiftBox(onTransitionReady) {
    if (this.isOpening) return;
    this.isOpening = true;
    this.isDragging = false;
    this.autoRotate = false;
    this.isSuctionActive = false;
    this.suctionProgress = 0;
    if (this.canvas) this.canvas.classList.remove('is-dragging');

    this.camTarget = new THREE.Vector3(0, 0.75, 0);

    const tl = gsap.timeline();

    const currentY = this.giftGroup.rotation.y;
    const nearestY = Math.round(currentY / (Math.PI * 2)) * (Math.PI * 2);

    tl.to(this.giftGroup.rotation, {
      x: 0,
      y: nearestY,
      z: 0,
      duration: 0.85,
      ease: 'power2.inOut',
      onComplete: () => {
        this.giftGroup.rotation.y = 0;
        this.currentRotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
      }
    }, 0);

    tl.to(this.camera.position, {
      x: 0,
      y: 1.8,
      z: 4.2,
      duration: 1.1,
      ease: 'power2.inOut',
    }, 0.3);

    tl.to(this.boxLidGroup.position, {
      y: this.boxHeight + 0.05,
      duration: 0.1,
      yoyo: true,
      repeat: 3,
      ease: 'power1.inOut',
    }, 1.0);

    tl.to(this.boxLidGroup.position, {
      y: 4.2,
      z: -1.6,
      duration: 2.2,
      ease: 'power2.out',
    }, 1.4);

    tl.to(this.boxLidGroup.rotation, {
      x: -0.42,
      y: 0.55,
      z: 0.18,
      duration: 2.2,
      ease: 'power2.out',
    }, 1.4);

    tl.to(this.bottomGlowDisc.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 1.8,
      ease: 'power2.out',
    }, 1.5);
    tl.to(this.bottomGlowDisc.material, {
      opacity: 0.85,
      duration: 1.8,
      ease: 'power2.out',
    }, 1.5);

    tl.to(this.etherealMist.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 1.8,
      ease: 'power2.out',
    }, 1.6);
    tl.to(this.etherealMist.material, {
      opacity: 0.72,
      duration: 1.8,
      ease: 'power2.out',
    }, 1.6);

    tl.to(this.stardustMotesMat, {
      opacity: 0.95,
      duration: 1.6,
      ease: 'power2.out',
    }, 1.5);

    tl.to(this.insideLight, {
      intensity: 2.2,
      duration: 1.8,
      ease: 'power2.out',
    }, 1.5);

    if (this.bearLeft && this.bearLeft.headPart) {
      tl.to(this.bearLeft.headPart.rotation, {
        z: 0.28,
        x: 0.18,
        duration: 1.2,
        ease: 'power1.out',
      }, 1.6);
    }
    if (this.bearRight && this.bearRight.headPart) {
      tl.to(this.bearRight.headPart.rotation, {
        z: -0.28,
        x: 0.18,
        duration: 1.2,
        ease: 'power1.out',
      }, 1.6);
    }

    tl.to(this.camera.position, {
      x: 0,
      y: 4.85,
      z: 0.8,
      duration: 1.8,
      ease: 'power2.inOut',
    }, 1.8);

    tl.to(this.camTarget, {
      x: 0,
      y: 0.45,
      z: 0,
      duration: 1.8,
      ease: 'power2.inOut',
    }, 1.8);

    tl.add(() => {
      this.isSuctionActive = true;
    }, 3.2);

    tl.to(this.vortexMaterial, {
      opacity: 0.95,
      duration: 0.4,
      ease: 'power1.out',
    }, 3.2);

    tl.to(this, {
      suctionProgress: 1.0,
      duration: 1.8,
      ease: 'power2.in',
    }, 3.2);

    tl.to(this.insideLight, {
      intensity: 7.5,
      duration: 1.8,
      ease: 'power2.in',
    }, 3.2);

    tl.to(this.bottomGlowDisc.scale, {
      x: 1.85,
      y: 1.85,
      z: 1.85,
      duration: 1.8,
      ease: 'power2.in',
    }, 3.2);

    tl.to(this.camera.position, {
      y: 3.8,
      z: 0.35,
      duration: 1.6,
      ease: 'power1.in',
    }, 3.4);

    tl.add(() => {
      const flash = document.getElementById('cinematic-flash');
      if (flash) {
        gsap.to(flash, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.in',
        });
      }
    }, 4.65);

    tl.add(() => {
      if (onTransitionReady) onTransitionReady();
    }, 5.15);
  }

  // Khôi phục trạng thái ban đầu
  resetGiftBox() {
    this.isOpening = false;
    this.autoRotate = true;
    this.isSuctionActive = false;
    this.suctionProgress = 0;

    this.boxLidGroup.position.set(0, this.boxHeight, 0);
    this.boxLidGroup.rotation.set(0, 0, 0);

    if (this.vortexMaterial) {
      this.vortexMaterial.opacity = 0;
    }
    if (this.bottomGlowDisc) {
      this.bottomGlowDisc.scale.set(0.01, 0.01, 0.01);
      this.bottomGlowDisc.material.opacity = 0;
    }
    if (this.etherealMist) {
      this.etherealMist.scale.set(0.01, 0.01, 0.01);
      this.etherealMist.material.opacity = 0;
    }
    if (this.stardustMotesMat) {
      this.stardustMotesMat.opacity = 0;
    }
    if (this.insideLight) {
      this.insideLight.intensity = 0.1;
    }

    if (this.particles && this.initialParticlePositions) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < this.initialParticlePositions.length; i++) {
        positions[i] = this.initialParticlePositions[i];
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.petals.forEach(petal => {
      const s = petal.userData.baseScale || 0.8;
      petal.scale.set(s, s, s);
      if (petal.userData.baseX !== undefined) {
        petal.position.x = petal.userData.baseX;
        petal.position.z = petal.userData.baseZ;
      }
    });
    this.floatingObjects.forEach(star => {
      const s = star.userData.baseScale || 0.7;
      star.scale.set(s, s, s);
      if (star.userData.baseX !== undefined) {
        star.position.x = star.userData.baseX;
        star.position.z = star.userData.baseZ;
      }
    });

    this.camera.position.set(0, 2.4, 5.8);
    this.camTarget.set(0, 0.85, 0);
    this.camera.lookAt(0, 0.85, 0);
    this.targetRotation = { x: 0.12, y: -0.38 };
    this.currentRotation = { x: 0.12, y: -0.38 };

    if (this.bearLeft && this.bearLeft.headPart) {
      gsap.to(this.bearLeft.headPart.rotation, { z: 0, x: 0, duration: 0.5 });
    }
    if (this.bearRight && this.bearRight.headPart) {
      gsap.to(this.bearRight.headPart.rotation, { z: 0, x: 0, duration: 0.5 });
    }

    const flash = document.getElementById('cinematic-flash');
    if (flash) flash.style.opacity = '0';
  }

  // 13. Loop update
  update(delta, elapsedTime) {
    if (this.hasLanded && this.giftGroup && !this.isOpening) {
      if (this.autoRotate) {
        this.targetRotation.y += delta * 0.22;
      }

      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;

      this.giftGroup.rotation.x = this.currentRotation.x;
      this.giftGroup.rotation.y = this.currentRotation.y;

      this.giftGroup.position.y = Math.sin(elapsedTime * 1.15) * 0.035;
      if (this.bowGroup) {
        this.bowGroup.rotation.z = Math.sin(elapsedTime * 1.35) * 0.045;
      }
    }

    if (this.playfulClouds) {
      const cloudSpeed = this.isSuctionActive ? 4.8 : 1.6;
      const cloudAmp = this.isSuctionActive ? 0.16 : 0.05;
      this.playfulClouds.forEach(cloud => {
        const { baseY, phase } = cloud.userData;
        cloud.position.y = baseY + Math.sin(elapsedTime * cloudSpeed + phase) * cloudAmp;
      });
    }

    if (this.isOpening) {
      if (this.bottomGlowDisc && this.bottomGlowDisc.material.opacity > 0.1 && !this.isSuctionActive) {
        const pulse = 1.0 + Math.sin(elapsedTime * 2.2) * 0.05;
        this.bottomGlowDisc.scale.set(pulse, pulse, pulse);
      }
      if (this.etherealMist && this.etherealMist.material.opacity > 0.1) {
        this.etherealMist.rotation.z = elapsedTime * 0.35;
      }
      if (this.stardustMotes && this.stardustMotesMat && this.stardustMotesMat.opacity > 0.1 && !this.isSuctionActive) {
        const positions = this.stardustMotes.geometry.attributes.position.array;
        for (let i = 0; i < this.moteData.length; i++) {
          const m = this.moteData[i];
          m.angle += m.speed * delta * 0.7;
          m.baseY += m.upSpeed * delta * 0.35;
          if (m.baseY > 1.2) {
            m.baseY = 0.15;
          }
          positions[i * 3] = Math.cos(m.angle) * m.radius;
          positions[i * 3 + 1] = m.baseY;
          positions[i * 3 + 2] = Math.sin(m.angle) * m.radius;
        }
        this.stardustMotes.geometry.attributes.position.needsUpdate = true;
      }
    }

    if (this.isSuctionActive) {
      const p = this.suctionProgress;

      if (this.vortexMesh && this.vortexParticleData) {
        const positions = this.vortexMesh.geometry.attributes.position.array;
        for (let i = 0; i < this.vortexParticleData.length; i++) {
          const d = this.vortexParticleData[i];
          const currentRadius = d.baseRadius * Math.pow(Math.max(0, 1 - p), 1.6);
          const currentAngle = d.baseAngle + (elapsedTime * 2.2) + (p * d.spiralSpeed * 3.8);
          const currentY = d.baseY * (1 - p) + 0.45 * p;

          positions[i * 3] = Math.cos(currentAngle) * currentRadius;
          positions[i * 3 + 1] = currentY;
          positions[i * 3 + 2] = Math.sin(currentAngle) * currentRadius;
        }
        this.vortexMesh.geometry.attributes.position.needsUpdate = true;
      }

      if (this.particles && this.initialParticlePositions) {
        const fairyPos = this.particles.geometry.attributes.position.array;
        const count = fairyPos.length / 3;
        for (let i = 0; i < count; i++) {
          const initX = this.initialParticlePositions[i * 3];
          const initY = this.initialParticlePositions[i * 3 + 1];
          const initZ = this.initialParticlePositions[i * 3 + 2];

          const swirl = p * 4.5;
          const cosA = Math.cos(swirl);
          const sinA = Math.sin(swirl);

          const rotX = initX * cosA - initZ * sinA;
          const rotZ = initX * sinA + initZ * cosA;

          fairyPos[i * 3] = rotX * (1 - p);
          fairyPos[i * 3 + 1] = initY * (1 - p) + 0.45 * p;
          fairyPos[i * 3 + 2] = rotZ * (1 - p);
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
      }

      this.petals.forEach(petal => {
        petal.scale.multiplyScalar(Math.max(0, 1 - p * 0.05));
      });
      this.floatingObjects.forEach(star => {
        star.scale.multiplyScalar(Math.max(0, 1 - p * 0.05));
      });
    }

    if (this.isOpening && this.boxLidGroup) {
      this.boxLidGroup.position.y += Math.sin(elapsedTime * 2.0) * 0.003;
      this.boxLidGroup.rotation.y += delta * 0.08;
    }

    if (this.bearLeft) {
      if (this.isSuctionActive) {
        const hopY = 0.55 + Math.abs(Math.sin(elapsedTime * 4.2)) * 0.16;
        this.bearLeft.position.y = hopY;
        this.bearLeft.rotation.z = Math.sin(elapsedTime * 6.0) * 0.12;
        this.bearLeft.rotation.y = 0.45 + Math.sin(elapsedTime * 3.5) * 0.15;
        if (this.bearLeft.headPart) {
          this.bearLeft.headPart.rotation.x = 0.25 + Math.sin(elapsedTime * 6.0) * 0.12;
          this.bearLeft.headPart.rotation.z = 0.25;
        }
        if (this.bearLeft.heartPart) {
          const heartPulse = 1.15 + Math.sin(elapsedTime * 9.0) * 0.22;
          this.bearLeft.heartPart.scale.set(heartPulse, heartPulse, heartPulse);
          this.bearLeft.heartPart.position.y = 0.28 + Math.sin(elapsedTime * 6.0) * 0.08;
          if (this.bearLeft.heartPart.material) {
            this.bearLeft.heartPart.material.emissiveIntensity = 0.7 + Math.sin(elapsedTime * 8.0) * 0.4;
          }
        }
      } else {
        this.bearLeft.position.y = 0.55 + Math.sin(elapsedTime * 1.8) * 0.04;
        if (this.bearLeft.headPart && !this.isOpening) {
          this.bearLeft.headPart.rotation.z = Math.sin(elapsedTime * 1.2) * 0.08;
          this.bearLeft.headPart.rotation.x = Math.cos(elapsedTime * 1.5) * 0.04;
        }
        if (this.bearLeft.heartPart) {
          const pulse = 1 + Math.sin(elapsedTime * 3.5) * 0.06;
          this.bearLeft.heartPart.scale.set(pulse, pulse, pulse);
        }
      }
    }

    if (this.bearRight) {
      if (this.isSuctionActive) {
        const hopY = 0.75 + Math.abs(Math.cos(elapsedTime * 4.0)) * 0.16;
        this.bearRight.position.y = hopY;
        this.bearRight.rotation.z = -Math.sin(elapsedTime * 5.5) * 0.12;
        this.bearRight.rotation.y = -0.45 + Math.cos(elapsedTime * 3.5) * 0.15;
        if (this.bearRight.headPart) {
          this.bearRight.headPart.rotation.x = 0.25 + Math.cos(elapsedTime * 5.5) * 0.12;
          this.bearRight.headPart.rotation.z = -0.25;
        }
        if (this.bearRight.wavingArm) {
          this.bearRight.wavingArm.rotation.z = Math.sin(elapsedTime * 12.0) * 0.65;
        }
      } else {
        this.bearRight.position.y = 0.75 + Math.cos(elapsedTime * 1.6) * 0.04;
        if (this.bearRight.headPart && !this.isOpening) {
          this.bearRight.headPart.rotation.z = -Math.sin(elapsedTime * 1.3) * 0.08;
        }
        if (this.bearRight.wavingArm) {
          this.bearRight.wavingArm.rotation.z = Math.sin(elapsedTime * 4.5) * 0.35;
        }
      }
    }

    if (this.isBurstActive && this.sparkleBurstMesh) {
      const positions = this.sparkleBurstMesh.geometry.attributes.position.array;
      const t = elapsedTime - this.burstStartTime;

      for (let i = 0; i < this.burstVelocities.length; i++) {
        const vel = this.burstVelocities[i];
        positions[i * 3] += vel.vx * delta;
        positions[i * 3 + 1] += (vel.vy - 3.5 * t) * delta;
        positions[i * 3 + 2] += vel.vz * delta;
      }
      this.sparkleBurstMesh.geometry.attributes.position.needsUpdate = true;

      this.burstMat.opacity = Math.max(0, 1 - t * 1.2);
      if (t > 1.0) {
        this.isBurstActive = false;
        this.burstMat.opacity = 0;
      }
    }

    if (this.blooms) {
      this.blooms.forEach((bloom) => {
        const sway = Math.sin(elapsedTime * 1.1 + bloom.userData.phase) * 0.08;
        bloom.rotation.z = sway;
        if (bloom.userData.head) bloom.userData.head.rotation.y = elapsedTime * 0.25 + bloom.userData.phase;
      });
    }

    this.hearts.forEach((heart) => {
      const { baseY, phase, rot } = heart.userData;
      heart.position.y = baseY + Math.sin(elapsedTime * 0.9 + phase) * 0.16;
      heart.rotation.y += rot * delta * 0.35;
      heart.rotation.z = Math.sin(elapsedTime * 0.8 + phase) * 0.15;
    });

    this.petals.forEach((petal) => {
      const { baseY, speedY, rotSpeedX, rotSpeedY, rotSpeedZ, phase } = petal.userData;
      petal.position.y = baseY + Math.sin(elapsedTime * speedY + phase) * 0.2;
      petal.rotation.x += rotSpeedX * delta;
      petal.rotation.y += rotSpeedY * delta;
      petal.rotation.z += rotSpeedZ * delta;
    });

    this.floatingObjects.forEach((star) => {
      const { baseY, speedY, rotSpeed, phase } = star.userData;
      star.position.y = baseY + Math.sin(elapsedTime * speedY + phase) * 0.15;
      star.rotation.z += rotSpeed * delta;
      star.rotation.y += rotSpeed * 0.5 * delta;
    });

    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.035;
    }

    if (!this.isDragging && !this.isReducedMotion && !this.isOpening) {
      const restY = this.width < 720 ? 2.62 : 2.4;
      const targetCamX = this.mouse.x * 0.38;
      const targetCamY = restY + this.mouse.y * 0.18;
      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05;
      this.camera.lookAt(0, 0.85, 0);
    } else if (this.isOpening) {
      this.camera.lookAt(this.camTarget.x, this.camTarget.y, this.camTarget.z);
    }
  }
}