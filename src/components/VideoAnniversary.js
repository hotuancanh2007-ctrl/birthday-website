import * as THREE from 'three';
import gsap from 'gsap';
import { birthdayData } from '../data/birthdayData.js';
import { spawnMagicBurst } from '../utils/magicBurst.js';
import '../styles/video-anniversary.css';
import { BackButton } from './BackButton';
import '../styles/back-button.css';

export class VideoAnniversary {
    constructor() {
        this.container = null;
        this.videos = birthdayData.videos || [];
        this.currentIndex = 0;
        this.isOpen = false;
        this.boundKeyHandler = this.handleKeyPress.bind(this);
        this.boundResizeHandler = this.onWindowResize.bind(this);
        this.animationFrameId = null;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lights = {};
        this.galaxyParticles = null;

        this.curtainLeft = null;
        this.curtainRight = null;
        this.clock = new THREE.Clock();

        this.curtainProgress = { value: 0 };
        this.focusMode = false;
    }

    mount(parentContainer) {
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

        const svgCatSleeping = `
      <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M 80 40 Q 95 40 95 25 Q 95 15 85 20" fill="none" stroke="#FFF5FC" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="50" cy="35" rx="35" ry="15" fill="#FFF5FC"/>
        <circle cx="25" cy="25" r="15" fill="#FFF5FC"/>
        <polygon points="12,15 20,5 25,12" fill="#FFF5FC"/>
        <polygon points="25,12 30,5 38,15" fill="#FFF5FC"/>
        <path d="M 15 25 Q 20 28 25 25" fill="none" stroke="#FF63B8" stroke-width="2" stroke-linecap="round"/>
        <path d="M 30 25 Q 35 28 40 25" fill="none" stroke="#FF63B8" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

        const svgCatPeeking = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="60" r="35" fill="#FFF5FC"/>
        <polygon points="20,40 25,15 40,30" fill="#FFF5FC"/>
        <polygon points="60,30 75,15 80,40" fill="#FFF5FC"/>
        <circle cx="30" cy="65" r="6" fill="#FFD6EB"/>
        <circle cx="70" cy="65" r="6" fill="#FFD6EB"/>
        <circle cx="35" cy="55" r="5" fill="#17091F"/>
        <circle cx="65" cy="55" r="5" fill="#17091F"/>
        <path d="M 45 65 Q 50 70 55 65" fill="none" stroke="#17091F" stroke-width="2"/>
        <path d="M 15 90 Q 25 70 40 85" fill="none" stroke="#FFF5FC" stroke-width="12" stroke-linecap="round"/>
      </svg>
    `;

        this.container.innerHTML = `
      <div id="three-canvas-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
      <div class="cinema-dim-overlay"></div>
      
      <div class="cinema-intro-overlay">
        <div class="cinema-badge">OUR LITTLE CINEMA</div>
        <h1 class="cinema-intro-title">A Galaxy of Memories</h1>
        <p class="cinema-intro-subtitle">Tonight, this little cinema is just for us. Every moment with you feels like magic. ♡</p>
        <button class="btn-open-cinema" id="btn-open-cinema">Enter Our Cinema ✨</button>
      </div>

      <div class="cinema-wrapper" id="cinema-wrapper">
        <div class="cinema-screen-container">
          <div class="screen-ambilight"></div>
          <div class="cat-sleeping">${svgCatSleeping}</div>
          <video id="cinema-main-video" controls playsinline preload="auto">Trình duyệt không hỗ trợ.</video>
        </div>

        <div class="cinema-ui-layer">
          <div class="cat-peeking">${svgCatPeeking}</div>
          <div class="cinema-details-bar">
            <div class="video-text-info">
              <h2 id="video-title">Tên Video</h2>
              <p id="video-date">Ngày kỷ niệm</p>
            </div>
            <div class="cinema-nav-controls">
              <button class="cinema-nav-btn" id="btn-prev-video" aria-label="Video trước">❮</button>
              <button class="cinema-nav-btn" id="btn-next-video" aria-label="Video tiếp">❯</button>
            </div>
          </div>
          <div class="video-gallery-wrapper">
            <div class="video-gallery-track" id="gallery-track"></div>
          </div>
          <div class="next-page-container">
             <button class="btn-next-page" id="btn-next-page">Tới Phần Tiếp Theo ✨</button>
          </div>
        </div>
      </div>
    `;

        parentContainer.appendChild(this.container);
        this.initDOM();
        this.initThreeJS();
        this.bindEvents();
        this.renderGallery();

        if (this.videos.length > 0) this.loadVideo(0);
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
        this.introOverlay = this.container.querySelector('.cinema-intro-overlay');
        this.btnOpen = this.container.querySelector('#btn-open-cinema');
        this.cinemaWrapper = this.container.querySelector('#cinema-wrapper');
        this.mainVideo = this.container.querySelector('#cinema-main-video');
        this.videoTitle = this.container.querySelector('#video-title');
        this.videoDate = this.container.querySelector('#video-date');
        this.galleryTrack = this.container.querySelector('#gallery-track');
        this.btnPrev = this.container.querySelector('#btn-prev-video');
        this.btnNext = this.container.querySelector('#btn-next-video');
        this.threeContainer = this.container.querySelector('#three-canvas-container');
        this.btnNextPage = this.container.querySelector('#btn-next-page');
    }

    initThreeJS() {
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2a1625);
        this.scene.fog = new THREE.FogExp2(0x2a1625, 0.015);

        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        this.camera.position.z = 35;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.threeContainer.appendChild(this.renderer.domElement);

        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(this.lights.ambient);

        this.lights.mainSpot = new THREE.SpotLight(0xffe6f2, 2.0);
        this.lights.mainSpot.position.set(0, 30, 25);
        this.scene.add(this.lights.mainSpot);

        this.lights.sidePink = new THREE.PointLight(0xFF63B8, 2, 50);
        this.lights.sidePink.position.set(-20, 0, 15);
        this.scene.add(this.lights.sidePink);

        // GALAXY PARTICLES
        const particleCount = 2500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorPalette = [
            new THREE.Color(0xFF63B8),
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
            opacity: 0.8,
            sizeAttenuation: true
        });

        this.galaxyParticles = new THREE.Points(geometry, material);
        this.scene.add(this.galaxyParticles);

        // VELVET CURTAINS
        const silkMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xb04a73,
            emissive: 0x3d1b2d,
            roughness: 0.5,
            metalness: 0.2,
            clearcoat: 0.15,
            clearcoatRoughness: 0.4,
            side: THREE.DoubleSide
        });

        const geometryLeft = new THREE.PlaneGeometry(35, 55, 60, 30);
        const geometryRight = new THREE.PlaneGeometry(35, 55, 60, 30);

        this.basePosLeft = new Float32Array(geometryLeft.attributes.position.array);
        this.basePosRight = new Float32Array(geometryRight.attributes.position.array);

        this.curtainLeft = new THREE.Mesh(geometryLeft, silkMaterial);
        this.curtainLeft.position.set(-17.5, 0, 10);

        this.curtainRight = new THREE.Mesh(geometryRight, silkMaterial);
        this.curtainRight.position.set(17.5, 0, 10);

        this.scene.add(this.curtainLeft);
        this.scene.add(this.curtainRight);

        this.renderThreeJS();
    }

    renderThreeJS() {
        this.animationFrameId = requestAnimationFrame(this.renderThreeJS.bind(this));
        const time = this.clock.getElapsedTime() * (this.prefersReducedMotion ? 0.05 : 1);
        const progress = this.curtainProgress.value;

        if (this.galaxyParticles && !this.prefersReducedMotion) {
            this.galaxyParticles.rotation.y = time * 0.02;
            this.galaxyParticles.rotation.z = time * 0.01;
        }

        if (this.curtainLeft && this.curtainRight) {
            this.updateCurtainGeometry(this.curtainLeft.geometry, this.basePosLeft, time, progress, -1);
            this.updateCurtainGeometry(this.curtainRight.geometry, this.basePosRight, time, progress, 1);
        }

        if (!this.prefersReducedMotion && this.lights.mainSpot) {
            this.lights.mainSpot.position.x = Math.sin(time * 0.5) * 5;
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
        if (!this.isOpen) return;
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
        if (this.btnOpen) this.btnOpen.addEventListener('click', () => this.playOpeningSequence());
        if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.navigateVideo(-1));
        if (this.btnNext) this.btnNext.addEventListener('click', () => this.navigateVideo(1));
        if (this.btnNextPage) this.btnNextPage.addEventListener('click', () => this.goToNextScreen());

        window.addEventListener('keydown', this.boundKeyHandler);
        window.addEventListener('resize', this.boundResizeHandler);
        window.addEventListener('orientationchange', this.boundResizeHandler);

        if (this.mainVideo) {
            this.mainVideo.addEventListener('play', () => this.toggleCinemaFocus(true));
            this.mainVideo.addEventListener('pause', () => this.toggleCinemaFocus(false));
            this.mainVideo.addEventListener('ended', () => {
                this.toggleCinemaFocus(false);
                this.handleVideoEnded();
            });
        }
    }

    toggleCinemaFocus(isFocused) {
        if (this.focusMode === isFocused) return;
        this.focusMode = isFocused;
        document.body.setAttribute('data-cinema-focus', isFocused);

        gsap.to(this.lights.ambient, { intensity: isFocused ? 0.2 : 0.8, duration: 1.5 });
        gsap.to(this.lights.mainSpot, { intensity: isFocused ? 0.2 : 2.0, duration: 1.5 });
        gsap.to(this.lights.sidePink, { intensity: isFocused ? 0.5 : 2.0, duration: 1.5 });

        if (this.galaxyParticles) {
            gsap.to(this.galaxyParticles.material, { opacity: isFocused ? 0.2 : 0.8, duration: 1.5 });
        }
    }

    handleKeyPress(e) {
        if (!this.isOpen) return;
        if (e.key === 'ArrowLeft') this.navigateVideo(-1);
        if (e.key === 'ArrowRight') this.navigateVideo(1);
    }

    playOpeningSequence() {
        if (this.isOpen) return;
        this.isOpen = true;

        const burstLayer = document.getElementById('magic-burst');
        if (burstLayer && !this.prefersReducedMotion) spawnMagicBurst(burstLayer, 40);

        const tl = gsap.timeline();

        tl.to(this.introOverlay, {
            opacity: 0,
            scale: this.prefersReducedMotion ? 1 : 1.1,
            filter: this.prefersReducedMotion ? 'blur(0px)' : 'blur(20px)',
            duration: 1.0,
            ease: 'power2.inOut',
            onComplete: () => { this.introOverlay.style.display = 'none'; }
        });

        tl.to(this.curtainProgress, {
            value: 1,
            duration: this.prefersReducedMotion ? 1.0 : 4.5,
            ease: 'expo.inOut'
        }, "-=0.2");

        tl.fromTo(this.cinemaWrapper,
            { opacity: 0, scale: this.prefersReducedMotion ? 1 : 0.8, z: this.prefersReducedMotion ? 0 : -100 },
            {
                opacity: 1,
                scale: 1,
                z: 0,
                duration: this.prefersReducedMotion ? 0.8 : 2.5,
                ease: 'expo.out',
                onStart: () => { this.cinemaWrapper.classList.add('active'); }
            }, this.prefersReducedMotion ? "-=0.5" : "-=2.5");

        tl.from('.gallery-item', {
            y: this.prefersReducedMotion ? 0 : 40,
            opacity: 0,
            duration: 0.8,
            stagger: this.prefersReducedMotion ? 0 : 0.1,
            ease: 'back.out(1.2)'
        }, this.prefersReducedMotion ? "-=0.5" : "-=1.5");
    }

    renderGallery() {
        if (!this.galleryTrack) return;
        this.galleryTrack.innerHTML = '';
        if (this.videos.length <= 1) return;

        this.videos.forEach((vid, index) => {
            const item = document.createElement('div');
            item.className = `gallery-item ${index === 0 ? 'active' : ''}`;
            item.innerHTML = `
        <img src="${vid.poster || ''}" alt="${vid.title || ''}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100%\\' height=\\'100%\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%2324112F\\'/></svg>'"/>
        <div class="gallery-item-info">${vid.title || 'Kỷ niệm ' + (index + 1)}</div>
      `;
            item.addEventListener('click', () => this.loadVideo(index));
            this.galleryTrack.appendChild(item);
        });
    }

    loadVideo(index) {
        if (!this.videos[index]) return;
        this.currentIndex = index;
        const vid = this.videos[index];

        this.toggleCinemaFocus(false);

        gsap.to(this.mainVideo, {
            opacity: 0, scale: 0.95, duration: 0.3,
            onComplete: () => {
                this.mainVideo.src = vid.src;
                if (vid.poster) this.mainVideo.poster = vid.poster;
                this.mainVideo.load();

                if (this.videoTitle) this.videoTitle.textContent = vid.title || 'Khung Hình Tình Yêu';
                if (this.videoDate) this.videoDate.textContent = vid.date || '';

                gsap.to(this.mainVideo, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
            }
        });

        const items = this.container.querySelectorAll('.gallery-item');
        items.forEach((item, i) => {
            if (i === index) item.classList.add('active');
            else item.classList.remove('active');
        });
    }

    navigateVideo(direction) {
        if (this.videos.length <= 1) return;
        let newIndex = this.currentIndex + direction;
        if (newIndex < 0) newIndex = this.videos.length - 1;
        if (newIndex >= this.videos.length) newIndex = 0;
        this.loadVideo(newIndex);
    }

    destroy() {
        window.removeEventListener('keydown', this.boundKeyHandler);
        window.removeEventListener('resize', this.boundResizeHandler);
        window.removeEventListener('orientationchange', this.boundResizeHandler);

        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        document.body.removeAttribute('data-cinema-focus');
        if (this.backBtn) this.backBtn.destroy();

        if (this.scene) {
            this.scene.traverse((child) => {
                if (child.isMesh || child.isPoints) {
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