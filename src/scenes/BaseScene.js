import * as THREE from 'three';

/**
 * BaseScene: Lớp nền Three.js quản lý Renderer, Camera, Resize và Animation Loop.
 */
export class BaseScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Con trỏ chuột với tọa độ chuẩn hóa (-1 đến 1)
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
    this.setupEvents();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfcf0f5); // Soft pastel base (overridden by sky dome)

    // 2. Camera — cinematic 40° FOV for a premium close-up feel
    this.camera = new THREE.PerspectiveCamera(
      40,
      this.width / this.height,
      0.1,
      100
    );
    // Position: slightly elevated to see top of box and bow clearly
    this.camera.position.set(0, 2.4, 5.8);
    this.cameraTarget = new THREE.Vector3(0, 0.5, 0);
    this.camera.lookAt(this.cameraTarget);

    // 3. Renderer — premium quality settings
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;


    // Clock
    this.clock = new THREE.Clock();
    this.isRunning = true;
  }


  setupEvents() {
    // Xử lý thay đổi kích thước cửa sổ responsive
    this.onResizeHandler = this.onResize.bind(this);
    window.addEventListener('resize', this.onResizeHandler);

    // Bắt chuyển động chuột & cảm ứng di động để tạo parallax
    this.onPointerMoveHandler = this.onPointerMove.bind(this);
    window.addEventListener('pointermove', this.onPointerMoveHandler);

    // Chạy loop
    this.renderLoop = this.renderLoop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (typeof this.applyCameraFraming === 'function') this.applyCameraFraming();
  }

  onPointerMove(event) {
    if (this.isReducedMotion) return;
    // Chuẩn hóa tọa độ chuột (-1 đến 1)
    this.mouse.targetX = (event.clientX / this.width) * 2 - 1;
    this.mouse.targetY = -(event.clientY / this.height) * 2 + 1;
  }

  renderLoop() {
    if (!this.isRunning) return;

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Làm mượt chuyển động chuột (Smooth Lerp)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Cập nhật logic của scene con
    this.update(delta, elapsedTime);

    // Render
    this.renderer.render(this.scene, this.camera);

    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }

  update(delta, elapsedTime) {
    // Được override bởi scene con
  }

  pause() {
    this.isRunning = false;
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.clock.start();
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
    }
  }

  destroy() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResizeHandler);
    window.removeEventListener('pointermove', this.onPointerMoveHandler);

    // Giải phóng bộ nhớ Three.js
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
