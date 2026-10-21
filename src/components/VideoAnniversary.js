import * as THREE from 'three';
import gsap from 'gsap';
import { birthdayData } from '../data/birthdayData.js';
import { spawnMagicBurst } from '../utils/magicBurst.js';
import '../styles/video-anniversary.css';
import { BackButton } from './BackButton';
import '../styles/back-button.css';


const VA_ENHANCED_STYLE_ID = 'va-enhanced-styles';
const VA_ENHANCED_STYLE = `
#video-anniversary-container {
  --va-pink: #FF4FA3;
  --va-pink-soft: #FFD6EB;
  --va-lavender: #BCA7FF;
  --va-ink: #1A0E24;
  --va-text: #FFF5FC;
  --va-text-dim: #E8C9DC;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ---------- Vignette sân khấu: tối ở rìa, sáng ở giữa nơi video toạ lạc ---------- */
#video-anniversary-container .cinema-dim-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, rgba(26, 14, 36, 0) 32%, rgba(12, 6, 18, 0.62) 100%);
  z-index: 1;
}

/* ---------- Khối trung tâm ---------- */
#video-anniversary-container .hero-stage {
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(14px, 2.4vh, 26px);
  padding: 24px 16px;
  opacity: 0;
}

#video-anniversary-container .hero-video-frame {
  position: relative;
  width: min(92vw, 860px);
  aspect-ratio: 16 / 9;
  border-radius: 22px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
  transform: scale(0.92);
}

#video-anniversary-container .hero-glow-ring {
  position: absolute;
  inset: -4px;
  border-radius: 26px;
  pointer-events: none;
  background: linear-gradient(135deg, var(--va-pink), var(--va-lavender), var(--va-pink-soft), var(--va-pink));
  background-size: 300% 300%;
  opacity: 0.55;
  filter: blur(16px);
  z-index: -1;
  animation: va-ring-breathe 3.2s ease-in-out infinite, va-shimmer 9s linear infinite;
}

#video-anniversary-container .hero-video-frame video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #000;
}

#video-anniversary-container .hero-video-frame video.va-kenburns {
  animation: va-ken-burns 11s ease-in-out infinite alternate;
}

#video-anniversary-container .hero-frame-gradient {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 55%;
  background: linear-gradient(to top, rgba(10, 5, 14, 0.85), rgba(10, 5, 14, 0));
  pointer-events: none;
  transition: opacity 0.5s ease;
}

#video-anniversary-container .hero-video-frame.is-playing .hero-frame-gradient {
  opacity: 0;
}

#video-anniversary-container .hero-play-btn {
  position: absolute;
  top: 50%; left: 50%;
  width: clamp(64px, 11vw, 86px);
  height: clamp(64px, 11vw, 86px);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  font-size: 1.6rem;
  padding-left: 4px;
  transition: transform 0.25s ease, background 0.25s ease;
  animation: va-pulse-glow 2.3s ease-out infinite;
  z-index: 2;
}
#video-anniversary-container .hero-play-btn:hover {
  transform: translate(-50%, -50%) scale(1.08);
  background: rgba(255, 79, 163, 0.35);
}

#video-anniversary-container .hero-caption {
  position: absolute;
  left: 0; right: 0;
  bottom: 14%;
  text-align: center;
  padding: 0 24px;
  font-style: italic;
  font-size: clamp(0.85rem, 2vw, 1.05rem);
  color: var(--va-text);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  opacity: 0;
  animation: va-caption-reveal 5s ease-in-out 1s both;
  pointer-events: none;
}

#video-anniversary-container .hero-info {
  text-align: center;
  max-width: 640px;
}

#video-anniversary-container .hero-badge {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--va-text-dim);
  margin-bottom: 8px;
  opacity: 0.85;
}

#video-anniversary-container .hero-title {
  font-family: Georgia, 'Playfair Display', serif;
  font-size: clamp(1.6rem, 4.2vw, 2.6rem);
  margin: 0 0 6px 0;
  line-height: 1.15;
}

#video-anniversary-container .hero-desc {
  font-size: clamp(0.85rem, 2vw, 1rem);
  color: var(--va-text-dim);
  letter-spacing: 0.02em;
  margin: 0;
}

#video-anniversary-container .va-gradient-text {
  background: linear-gradient(90deg, var(--va-pink), var(--va-pink-soft), var(--va-lavender), var(--va-pink));
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: va-shimmer 6s ease-in-out infinite;
}

#video-anniversary-container .hero-controls-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

#video-anniversary-container .va-control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 214, 235, 0.4);
  color: var(--va-text);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  backdrop-filter: blur(6px);
  transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}
#video-anniversary-container .va-control-btn:hover,
#video-anniversary-container .va-control-btn:focus-visible {
  background: rgba(255, 143, 199, 0.32);
  transform: scale(1.1);
  box-shadow: 0 0 14px rgba(255, 99, 184, 0.65);
}

#video-anniversary-container .va-progress-wrap {
  position: relative;
  width: min(92vw, 860px);
  height: 5px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.4s ease;
}
#video-anniversary-container .va-progress-wrap.is-visible { opacity: 1; }
#video-anniversary-container .va-progress-buffered,
#video-anniversary-container .va-progress-fill {
  position: absolute;
  top: 0; left: 0; height: 100%;
  width: 0%;
  border-radius: 10px;
}
#video-anniversary-container .va-progress-buffered {
  background: rgba(255, 255, 255, 0.25);
  transition: width 0.2s ease;
}
#video-anniversary-container .va-progress-fill {
  background: linear-gradient(90deg, var(--va-pink), var(--va-pink-soft));
  box-shadow: 0 0 10px rgba(255, 79, 163, 0.85);
  transition: width 0.1s linear;
}

#video-anniversary-container .va-loading-spinner {
  position: absolute;
  top: 50%; left: 50%;
  width: 46px; height: 46px;
  margin: -23px 0 0 -23px;
  border-radius: 50%;
  border: 3px solid rgba(255, 214, 235, 0.25);
  border-top-color: var(--va-pink);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
  z-index: 2;
}
#video-anniversary-container .va-loading-spinner.is-visible {
  opacity: 1;
  animation: va-spin 0.85s linear infinite;
}

#video-anniversary-container .hero-skip-btn {
  position: absolute;
  bottom: max(18px, env(safe-area-inset-bottom, 0px));
  right: 18px;
  z-index: 3;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--va-text-dim);
  font-size: 0.78rem;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: all 0.25s ease;
  opacity: 0;
}
#video-anniversary-container .hero-skip-btn.is-visible { opacity: 0.85; }
#video-anniversary-container .hero-skip-btn:hover {
  opacity: 1;
  background: rgba(255, 79, 163, 0.25);
  color: #fff;
}

#video-anniversary-container .va-sparkle-deco {
  position: absolute;
  font-size: 1.3rem;
  opacity: 0.8;
  pointer-events: none;
  animation: va-float-sparkle 4.5s ease-in-out infinite;
  filter: drop-shadow(0 0 6px rgba(255, 143, 199, 0.65));
  z-index: 2;
}

@keyframes va-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes va-float-sparkle {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
  50% { transform: translateY(-14px) rotate(12deg); opacity: 0.95; }
}
@keyframes va-ken-burns {
  0% { transform: scale(1); }
  100% { transform: scale(1.08); }
}
@keyframes va-ring-breathe {
  0%, 100% { opacity: 0.38; transform: scale(1); }
  50% { opacity: 0.72; transform: scale(1.015); }
}
@keyframes va-caption-reveal {
  0% { opacity: 0; transform: translateY(8px); }
  18% { opacity: 1; transform: translateY(0); }
  72% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-6px); }
}
@keyframes va-pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(255, 79, 163, 0.55); }
  70% { box-shadow: 0 0 0 18px rgba(255, 79, 163, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 79, 163, 0); }
}
@keyframes va-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 560px) {
  #video-anniversary-container .hero-video-frame { width: 94vw; border-radius: 16px; }
  #video-anniversary-container .va-progress-wrap { width: 94vw; }
}
`;

function ensureEnhancedStylesInjected() {
    if (document.getElementById(VA_ENHANCED_STYLE_ID)) return;
    const styleTag = document.createElement('style');
    styleTag.id = VA_ENHANCED_STYLE_ID;
    styleTag.textContent = VA_ENHANCED_STYLE;
    document.head.appendChild(styleTag);
}

export class VideoAnniversary {
    constructor() {
        this.container = null;
        // Concept mới chỉ dùng đúng 1 video — ưu tiên birthdayData.video
        // (nếu có cấu hình riêng), fallback về video đầu tiên trong mảng.
        const videos = birthdayData.videos || [];
        this.video = birthdayData.video || videos[0] || null;

        this.isOpen = false;
        this.boundKeyHandler = this.handleKeyPress.bind(this);
        this.boundResizeHandler = this.onWindowResize.bind(this);
        this.boundMouseMoveHandler = this.onMouseMove.bind(this);
        this.animationFrameId = null;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lights = {};
        this.galaxyParticles = null;
        this.twinkleStars = null;
        this.nebula = null;
        this.heartGroup = null;
        this.heartSprites = [];

        this.curtainLeft = null;
        this.curtainRight = null;
        this.clock = new THREE.Clock();

        this.curtainProgress = { value: 0 };
        this.focusMode = false;

        this.mouse = { x: 0, y: 0 };
        this.cameraBase = { x: 0, y: 0, z: 35 };
    }

    mount(parentContainer) {
        ensureEnhancedStylesInjected();

        this.container = document.createElement('div');
        this.container.id = 'video-anniversary-container';

        // Tối ưu Responsive Fullscreen cho Safari iOS & Mobile Browsers
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100vw';
        this.container.style.height = '100vh';  // Fallback cho trình duyệt cũ
        this.container.style.height = '100dvh'; // Dynamic Viewport Height chuẩn Safari
        this.container.style.overflow = 'hidden';
        this.container.style.zIndex = '10';

        this.backBtn = new BackButton(this.container, {
            variant: 'cinema',
            position: 'top-left',
            label: 'Thiên hà',
            onClick: () => {
                this.destroy();
            }
        });
        this.backBtn.mount();

        const vid = this.video || {};

        this.container.innerHTML = `
      <div id="three-canvas-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
      <div class="cinema-dim-overlay"></div>

      <div class="hero-stage" id="hero-stage">
        <span class="va-sparkle-deco" style="top: 80%; right: 1%; animation-delay: 1.2s;">💖</span>
        <span class="va-sparkle-deco" style="top: 14%; right: 9%; animation-delay: 1.2s;">💖</span>

        <div class="hero-badge">OUR LITTLE CINEMA</div>

        <div class="hero-video-frame" id="hero-video-frame">
          <div class="hero-glow-ring"></div>
          <video id="hero-video" playsinline preload="auto" poster="${vid.poster || ''}">Trình duyệt không hỗ trợ.</video>
          <div class="hero-frame-gradient"></div>
          <div class="va-loading-spinner" id="va-loading-spinner"></div>
          <button class="hero-play-btn" id="hero-play-btn" aria-label="Phát video">▶</button>
          <div class="hero-caption" id="hero-caption">Khoảnh khắc này... mình chỉ muốn em xem ♡</div>
        </div>

        <div class="va-progress-wrap" id="va-progress-wrap">
          <div class="va-progress-buffered" id="va-progress-buffered"></div>
          <div class="va-progress-fill" id="va-progress-fill"></div>
        </div>

        <div class="hero-info">
          <h1 id="hero-title" class="hero-title va-gradient-text">${vid.title || 'Khung Hình Tình Yêu'}</h1>
          <p id="hero-desc" class="hero-desc">${vid.date || ''}</p>
        </div>

        <div class="hero-controls-row">
          <button class="va-control-btn" id="btn-mute-video" aria-label="Tắt/Bật tiếng">🔇</button>
          <button class="va-control-btn" id="btn-fullscreen-video" aria-label="Toàn màn hình">⛶</button>
        </div>
      </div>

      <button class="hero-skip-btn" id="btn-next-page">Phần Cuối Òi nè bé ❯</button>
    `;

        parentContainer.appendChild(this.container);
        this.initDOM();
        this.initThreeJS();
        this.bindEvents();
        this.setupProgressBar();

        this.playOpeningSequence();
    }

    handleVideoEnded() {
        this.isOpen = false;
        gsap.to(this.container, {
            opacity: 0,
            duration: 1.5,
            ease: 'power2.inOut',
            onComplete: () => {
                window.dispatchEvent(new CustomEvent('change-screen', {
                    detail: { screen: 'final-message' }
                }));
                this.destroy();
            }
        });
    }

    initDOM() {
        this.heroStage = this.container.querySelector('#hero-stage');
        this.heroFrame = this.container.querySelector('#hero-video-frame');
        this.mainVideo = this.container.querySelector('#hero-video');
        this.btnPlay = this.container.querySelector('#hero-play-btn');
        this.heroCaption = this.container.querySelector('#hero-caption');
        this.videoTitle = this.container.querySelector('#hero-title');
        this.videoDate = this.container.querySelector('#hero-desc');
        this.threeContainer = this.container.querySelector('#three-canvas-container');
        this.btnNextPage = this.container.querySelector('#btn-next-page');
        this.btnMute = this.container.querySelector('#btn-mute-video');
        this.btnFullscreen = this.container.querySelector('#btn-fullscreen-video');
        this.loadingSpinner = this.container.querySelector('#va-loading-spinner');
        this.progressWrap = this.container.querySelector('#va-progress-wrap');
        this.progressFill = this.container.querySelector('#va-progress-fill');
        this.progressBuffered = this.container.querySelector('#va-progress-buffered');

        if (this.mainVideo && this.video && this.video.src) {
            this.mainVideo.src = this.video.src;
        }
        if (this.mainVideo && !this.prefersReducedMotion) {
            this.mainVideo.classList.add('va-kenburns');
        }
        // Video bắt đầu ở trạng thái muted để trình duyệt cho phép
        // người dùng bấm Play chủ động mở tiếng ngay sau đó.
        if (this.mainVideo) this.mainVideo.muted = true;
    }

    initThreeJS() {
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a0e24);
        this.scene.fog = new THREE.FogExp2(0x1a0e24, 0.015);

        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        this.camera.position.set(this.cameraBase.x, this.cameraBase.y, this.cameraBase.z);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.threeContainer.appendChild(this.renderer.domElement);

        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(this.lights.ambient);

        this.lights.mainSpot = new THREE.SpotLight(0xffe6f2, 1.8);
        this.lights.mainSpot.position.set(0, 30, 25);
        this.scene.add(this.lights.mainSpot);

        this.lights.sidePink = new THREE.PointLight(0xFF4FA3, 1.8, 50);
        this.lights.sidePink.position.set(-20, 0, 15);
        this.scene.add(this.lights.sidePink);

        this.lights.rimLavender = new THREE.PointLight(0xBCA7FF, 1.2, 60);
        this.lights.rimLavender.position.set(20, 10, -10);
        this.scene.add(this.lights.rimLavender);

        this.nebula = this.createNebula();
        this.scene.add(this.nebula);

        const particleCount = 1800;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorPalette = [
            new THREE.Color(0xFF4FA3),
            new THREE.Color(0xBCA7FF),
            new THREE.Color(0xFFD6EB),
            new THREE.Color(0xFFF5FC)
        ];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        this.galaxyParticles = new THREE.Points(geometry, material);
        this.scene.add(this.galaxyParticles);

        this.twinkleStars = this.createTwinkleStars(550);
        this.scene.add(this.twinkleStars);

        this.heartGroup = this.createFloatingHearts(10);
        this.scene.add(this.heartGroup);

        // VELVET CURTAINS — hiệu ứng mở màn tự động, rút ngắn so với bản cũ
        const silkMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            emissive: 0x3d1b2d,
            roughness: 0.45,
            metalness: 0.2,
            clearcoat: 0.25,
            clearcoatRoughness: 0.35,
            vertexColors: true,
            side: THREE.DoubleSide
        });

        const geometryLeft = new THREE.PlaneGeometry(35, 55, 60, 30);
        const geometryRight = new THREE.PlaneGeometry(35, 55, 60, 30);
        this.applyCurtainGradient(geometryLeft);
        this.applyCurtainGradient(geometryRight);

        this.basePosLeft = new Float32Array(geometryLeft.attributes.position.array);
        this.basePosRight = new Float32Array(geometryRight.attributes.position.array);

        this.curtainLeft = new THREE.Mesh(geometryLeft, silkMaterial);
        this.curtainLeft.position.set(-17.5, 0, 10);

        this.curtainRight = new THREE.Mesh(geometryRight, silkMaterial);
        this.curtainRight.position.set(17.5, 0, 10);

        this.scene.add(this.curtainLeft);
        this.scene.add(this.curtainRight);

        if (!this.prefersReducedMotion) {
            this.threeContainer.addEventListener('mousemove', this.boundMouseMoveHandler);
        }

        this.renderThreeJS();
    }

    createGlowTexture(colorInner, colorOuter) {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, colorInner);
        gradient.addColorStop(1, colorOuter);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(canvas);
    }

    createNebula() {
        const group = new THREE.Group();
        const specs = [
            { c1: 'rgba(255, 79, 163, 0.32)', c2: 'rgba(255, 79, 163, 0)', pos: [-38, 10, -60], scale: 75 },
            { c1: 'rgba(188, 167, 255, 0.28)', c2: 'rgba(188, 167, 255, 0)', pos: [40, -8, -70], scale: 85 },
            { c1: 'rgba(255, 214, 235, 0.24)', c2: 'rgba(255, 214, 235, 0)', pos: [0, 28, -85], scale: 95 },
        ];
        specs.forEach((s) => {
            const texture = this.createGlowTexture(s.c1, s.c2);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.set(...s.pos);
            sprite.scale.set(s.scale, s.scale, 1);
            group.add(sprite);
        });
        return group;
    }

    createHeartTexture() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.translate(size / 2, size * 0.1);
        ctx.scale(1, -1);
        ctx.beginPath();
        const top = size * 0.3;
        ctx.moveTo(0, top);
        ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, top);
        ctx.bezierCurveTo(-size / 2, size * 0.6, 0, size * 0.7, 0, size);
        ctx.bezierCurveTo(0, size * 0.7, size / 2, size * 0.6, size / 2, top);
        ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, top);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#FFD6EB');
        gradient.addColorStop(1, '#FF4FA3');
        ctx.fillStyle = gradient;
        ctx.fill();
        return new THREE.CanvasTexture(canvas);
    }

    createFloatingHearts(count = 10) {
        const texture = this.createHeartTexture();
        const group = new THREE.Group();
        this.heartSprites = [];

        for (let i = 0; i < count; i++) {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            const scale = THREE.MathUtils.randFloat(0.6, 1.7);
            sprite.scale.set(scale, scale, 1);

            // Giữ trái tim bay ở rìa ngoài, tránh che khuất khung video trung tâm
            const side = Math.random() < 0.5 ? -1 : 1;
            const startX = side * THREE.MathUtils.randFloat(22, 45);
            const startY = THREE.MathUtils.randFloat(-28, -6);
            const startZ = THREE.MathUtils.randFloat(-18, 14);
            sprite.position.set(startX, startY, startZ);
            group.add(sprite);
            this.heartSprites.push(sprite);

            if (!this.prefersReducedMotion) {
                gsap.to(sprite.position, {
                    y: startY + THREE.MathUtils.randFloat(35, 52),
                    x: startX + THREE.MathUtils.randFloat(-6, 6),
                    duration: THREE.MathUtils.randFloat(16, 26),
                    delay: Math.random() * 10,
                    repeat: -1,
                    ease: 'none',
                    onRepeat: () => { sprite.position.y = startY; }
                });
                gsap.to(sprite.material, {
                    opacity: THREE.MathUtils.randFloat(0.25, 0.5),
                    duration: 2.4,
                    delay: Math.random() * 3,
                    yoyo: true,
                    repeat: -1,
                    ease: 'sine.inOut'
                });
            } else {
                sprite.material.opacity = 0.2;
            }
        }
        return group;
    }

    createTwinkleStars(count) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const randoms = new Float32Array(count);
        const sizes = new Float32Array(count);

        const palette = [
            new THREE.Color(0xFFF5FC),
            new THREE.Color(0xFFD6EB),
            new THREE.Color(0xFF8FC7)
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 180;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 180;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120 - 30;

            const color = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            randoms[i] = Math.random() * Math.PI * 2;
            sizes[i] = THREE.MathUtils.randFloat(0.6, 2.2);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float aRandom;
                attribute float aSize;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vAlpha;
                uniform float uTime;
                uniform float uPixelRatio;
                void main() {
                    vColor = color;
                    vAlpha = 0.3 + 0.6 * sin(uTime * 1.4 + aRandom * 6.2831);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = aSize * uPixelRatio * (140.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    float d = length(gl_PointCoord - vec2(0.5));
                    float alpha = smoothstep(0.5, 0.0, d) * max(vAlpha, 0.0);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        return new THREE.Points(geometry, material);
    }

    applyCurtainGradient(geometry) {
        const position = geometry.attributes.position;
        const colors = new Float32Array(position.count * 3);
        const edgeColor = new THREE.Color(0x3a1830);
        const centerColor = new THREE.Color(0xff8fc7);

        let minX = Infinity, maxX = -Infinity;
        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
        }
        const range = Math.max(maxX - minX, 0.0001);

        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const t = 1 - Math.abs(((x - minX) / range) * 2 - 1);
            const mixed = edgeColor.clone().lerp(centerColor, t * 0.6);
            colors[i * 3] = mixed.r;
            colors[i * 3 + 1] = mixed.g;
            colors[i * 3 + 2] = mixed.b;
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    onMouseMove(e) {
        if (this.prefersReducedMotion || !this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        this.mouse.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    renderThreeJS() {
        this.animationFrameId = requestAnimationFrame(this.renderThreeJS.bind(this));
        const time = this.clock.getElapsedTime() * (this.prefersReducedMotion ? 0.05 : 1);
        const progress = this.curtainProgress.value;

        if (this.galaxyParticles && !this.prefersReducedMotion) {
            this.galaxyParticles.rotation.y = time * 0.02;
            this.galaxyParticles.rotation.z = time * 0.01;
        }

        if (this.twinkleStars) {
            this.twinkleStars.material.uniforms.uTime.value = time;
            if (!this.prefersReducedMotion) {
                this.twinkleStars.rotation.y = time * 0.01;
            }
        }

        if (this.nebula && !this.prefersReducedMotion) {
            this.nebula.rotation.z = time * 0.004;
        }

        if (this.curtainLeft && this.curtainRight) {
            this.updateCurtainGeometry(this.curtainLeft.geometry, this.basePosLeft, time, progress, -1);
            this.updateCurtainGeometry(this.curtainRight.geometry, this.basePosRight, time, progress, 1);
        }

        if (!this.prefersReducedMotion && this.lights.mainSpot) {
            this.lights.mainSpot.position.x = Math.sin(time * 0.5) * 5;
        }

        if (!this.prefersReducedMotion && this.camera) {
            const targetX = this.cameraBase.x + this.mouse.x * 2.2;
            const targetY = this.cameraBase.y - this.mouse.y * 1.3;
            this.camera.position.x += (targetX - this.camera.position.x) * 0.04;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.04;
            this.camera.lookAt(0, 0, 0);
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateCurtainGeometry(geometry, baseArray, time, progress, direction) {
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const idx = i * 3;
            const bx = baseArray[idx];

            const windZ = Math.sin(bx * 0.6 + time) * 0.5;
            const foldFrequency = 0.6 + (progress * 2);
            const foldDepth = progress * 6.0;
            const gatherZ = Math.sin(bx * foldFrequency) * foldDepth;

            const shrinkX = bx * (1 - progress * 0.9);
            const slideX = direction * progress * 25;

            positions.setX(i, shrinkX + slideX);
            positions.setZ(i, windZ + gatherZ);
        }
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    onWindowResize() {
        if (!this.camera || !this.renderer || !this.container) return;
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    goToNextScreen() {
        this.isOpen = false;
        if (this.mainVideo) this.mainVideo.pause();

        gsap.to(this.container, {
            opacity: 0,
            duration: 1.2,
            ease: 'power2.inOut',
            onComplete: () => {
                window.dispatchEvent(new CustomEvent('change-screen', {
                    detail: { screen: 'final-message' }
                }));
                this.destroy();
            }
        });
    }

    bindEvents() {
        if (this.btnPlay) this.btnPlay.addEventListener('click', () => this.playVideo());
        if (this.heroFrame) this.heroFrame.addEventListener('click', (e) => {
            if (!this.isOpen && e.target !== this.btnPlay) this.playVideo();
        });
        if (this.btnNextPage) this.btnNextPage.addEventListener('click', () => this.goToNextScreen());
        if (this.btnMute) this.btnMute.addEventListener('click', () => this.toggleMute());
        if (this.btnFullscreen) this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

        window.addEventListener('keydown', this.boundKeyHandler);
        window.addEventListener('resize', this.boundResizeHandler);
        window.addEventListener('orientationchange', this.boundResizeHandler);

        if (this.mainVideo) {
            this.mainVideo.addEventListener('play', () => this.toggleCinemaFocus(true));
            this.mainVideo.addEventListener('pause', () => this.toggleCinemaFocus(false));
            this.mainVideo.addEventListener('waiting', () => this.showLoading());
            this.mainVideo.addEventListener('playing', () => this.hideLoading());
            this.mainVideo.addEventListener('canplay', () => this.hideLoading());
            this.mainVideo.addEventListener('ended', () => {
                this.toggleCinemaFocus(false);
                this.handleVideoEnded();
            });
        }
    }

    setupProgressBar() {
        if (!this.mainVideo) return;

        this.mainVideo.addEventListener('timeupdate', () => {
            if (!this.mainVideo.duration || !this.progressFill) return;
            const pct = (this.mainVideo.currentTime / this.mainVideo.duration) * 100;
            this.progressFill.style.width = `${pct}%`;
        });

        this.mainVideo.addEventListener('progress', () => {
            if (!this.progressBuffered || !this.mainVideo.duration || !this.mainVideo.buffered.length) return;
            const bufferedEnd = this.mainVideo.buffered.end(this.mainVideo.buffered.length - 1);
            const pct = (bufferedEnd / this.mainVideo.duration) * 100;
            this.progressBuffered.style.width = `${pct}%`;
        });

        if (this.progressWrap) {
            this.progressWrap.addEventListener('click', (e) => {
                if (!this.mainVideo.duration) return;
                const rect = this.progressWrap.getBoundingClientRect();
                const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                this.mainVideo.currentTime = pct * this.mainVideo.duration;
            });
        }
    }

    toggleMute() {
        if (!this.mainVideo || !this.btnMute) return;
        this.mainVideo.muted = !this.mainVideo.muted;
        this.btnMute.textContent = this.mainVideo.muted ? '🔇' : '🔊';
    }

    toggleFullscreen() {
        const target = this.heroFrame || this.container;
        if (!target) return;
        if (!document.fullscreenElement) {
            target.requestFullscreen?.().catch(() => { });
        } else {
            document.exitFullscreen?.();
        }
    }

    showLoading() {
        this.loadingSpinner?.classList.add('is-visible');
    }

    hideLoading() {
        this.loadingSpinner?.classList.remove('is-visible');
    }

    toggleCinemaFocus(isFocused) {
        if (this.focusMode === isFocused) return;
        this.focusMode = isFocused;
        document.body.setAttribute('data-cinema-focus', isFocused);

        gsap.to(this.lights.ambient, { intensity: isFocused ? 0.2 : 0.7, duration: 1.5 });
        gsap.to(this.lights.mainSpot, { intensity: isFocused ? 0.2 : 1.8, duration: 1.5 });
        gsap.to(this.lights.sidePink, { intensity: isFocused ? 0.5 : 1.8, duration: 1.5 });
        if (this.lights.rimLavender) {
            gsap.to(this.lights.rimLavender, { intensity: isFocused ? 0.4 : 1.2, duration: 1.5 });
        }

        if (this.galaxyParticles) {
            gsap.to(this.galaxyParticles.material, { opacity: isFocused ? 0.15 : 0.6, duration: 1.5 });
        }
        if (this.nebula) {
            this.nebula.children.forEach((sprite) => {
                gsap.to(sprite.material, { opacity: isFocused ? 0.25 : 1, duration: 1.5 });
            });
        }
    }

    handleKeyPress(e) {
        if (e.key === ' ' && !this.isOpen) {
            e.preventDefault();
            this.playVideo();
        }
        if (e.key === 'm' || e.key === 'M') this.toggleMute();
        if (e.key === 'f' || e.key === 'F') this.toggleFullscreen();
    }

    // Tự động chạy ngay khi mount: màn nhung mở ra lộ chủ thể trung tâm,
    // kèm Ken Burns + caption gây tò mò trong ~3 giây đầu — không cần
    // người dùng bấm bất kỳ nút "mở rạp" nào trước đó.
    playOpeningSequence() {
        const tl = gsap.timeline();

        tl.to(this.curtainProgress, {
            value: 1,
            duration: this.prefersReducedMotion ? 0.8 : 2.4,
            ease: 'expo.inOut'
        });

        tl.fromTo(this.heroStage,
            { opacity: 0, scale: this.prefersReducedMotion ? 1 : 0.9 },
            {
                opacity: 1,
                scale: 1,
                duration: this.prefersReducedMotion ? 0.6 : 1.4,
                ease: 'power3.out'
            }, this.prefersReducedMotion ? 0 : "-=1.6");

        tl.to(this.heroFrame, {
            scale: 1,
            duration: 1.1,
            ease: 'back.out(1.4)'
        }, "-=0.9");

        tl.to(this.progressWrap, {
            duration: 0.01,
            onComplete: () => this.progressWrap?.classList.add('is-visible')
        }, "-=0.4");

        tl.to(this.btnNextPage, {
            duration: 0.01,
            onComplete: () => this.btnNextPage?.classList.add('is-visible')
        }, "-=0.4");
    }

    // Người dùng bấm vào nút Play (hoặc trực tiếp vào khung video) → vào
    // chế độ xem tập trung: ẩn hook/poster chrome, phát video + âm thanh.
    playVideo() {
        if (this.isOpen || !this.mainVideo) return;
        this.isOpen = true;

        const burstLayer = document.getElementById('magic-burst');
        if (burstLayer && !this.prefersReducedMotion) spawnMagicBurst(burstLayer, 30);

        this.mainVideo.classList.remove('va-kenburns');
        this.mainVideo.muted = false;
        if (this.btnMute) this.btnMute.textContent = '🔊';

        gsap.to(this.btnPlay, {
            opacity: 0,
            scale: 0.7,
            duration: 0.35,
            ease: 'power2.in',
            onComplete: () => { this.btnPlay.style.display = 'none'; }
        });
        gsap.to(this.heroCaption, { opacity: 0, duration: 0.3 });

        this.heroFrame?.classList.add('is-playing');

        this.mainVideo.play().catch(() => {
            // Autoplay với âm thanh có thể bị chặn trên vài trình duyệt —
            // hiển thị lại nút Play để người dùng bấm thêm lần nữa.
            if (this.btnPlay) {
                this.btnPlay.style.display = 'flex';
                gsap.to(this.btnPlay, { opacity: 1, scale: 1, duration: 0.3 });
            }
            this.isOpen = false;
        });
    }

    destroy() {
        window.removeEventListener('keydown', this.boundKeyHandler);
        window.removeEventListener('resize', this.boundResizeHandler);
        window.removeEventListener('orientationchange', this.boundResizeHandler);
        if (this.threeContainer) {
            this.threeContainer.removeEventListener('mousemove', this.boundMouseMoveHandler);
        }

        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        if (this.heartSprites && this.heartSprites.length) {
            this.heartSprites.forEach((sprite) => {
                gsap.killTweensOf(sprite.position);
                gsap.killTweensOf(sprite.material);
            });
        }

        document.body.removeAttribute('data-cinema-focus');
        if (this.backBtn) this.backBtn.destroy();

        if (this.scene) {
            this.scene.traverse((child) => {
                if (child.isMesh || child.isPoints || child.isSprite) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (child.material.map) child.material.map.dispose();
                        child.material.dispose();
                    }
                }
            });
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
        }

        if (this.mainVideo) {
            this.mainVideo.pause();
            this.mainVideo.src = '';
            this.mainVideo.load();
        }

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}