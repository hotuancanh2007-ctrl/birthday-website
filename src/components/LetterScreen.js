import gsap from 'gsap';
import * as THREE from 'three';
import { birthdayData } from '../data/birthdayData.js';
import { spawnMagicBurst } from '../utils/magicBurst.js';
import { BackButton } from './BackButton';
import '../styles/back-button.css';
import '../styles/letter.css';

/**
 * LetterScreen — Stage 2: The Birthday Letter (Clean Text Render & Ultra Reliable Edition)
 */
export class LetterScreen {
  constructor(parentElement, options = {}) {
    this.parentElement = parentElement;
    this.onReplayAll = options.onReplay || null;
    this.onContinueToMemories = options.onContinue || null;
    this.element = null;
    this.isOpen = false;
    this.isDraggingLetter = false;
    this.startY = 0;
    this.currentPullY = 0;

    // Three.js background properties
    this.threeCanvas = null;
    this.threeRenderer = null;
    this.threeScene = null;
    this.threeCamera = null;
    this.threeAnimId = null;
    this.floatingHearts = [];
    this.particleSystem = null;

    // Gestures & Pagination
    this.initPages();
    this.currentPageIndex = 0;
    this.touchStartX = 0;
    this.touchStartY = 0;

    // Bound listeners for clean cleanup
    this._pointerMoveBound = null;
    this._pointerUpBound = null;
    this._pointerCancelBound = null;
    this._onResizeBound = null;

    this.prefersReducedMotion = false;
  }

  dur(seconds) {
    return seconds;
  }

  // ─── INIT PAGES (TỰ ĐỘNG KHÔI PHỤC NẾU DỮ LIỆU RỖNG) ───────────────────────

  initPages() {
    const defaultParagraphs = [
      'Chúc mừng sinh nhật em yêu! Cảm ơn em đã đến bên anh, mang theo vô vàn niềm vui, sự ấm áp và vô số khoảnh khắc hạnh phúc tuyệt vời.',
      'Anh mong rằng tuổi mới sẽ mang đến cho em thật nhiều may mắn, luôn mỉm cười rạng rỡ và đạt được tất cả những điều em ước mơ.',
      'Hành trình phía trước dù có ra sao, anh vẫn luôn ở đây đồng hành, chăm sóc và yêu thương em thật nhiều. Chúc em một ngày sinh nhật thật trọn vẹn và ý nghĩa ♡'
    ];

    const letter = birthdayData?.letter || {};
    const paras = Array.isArray(letter.paragraphs) && letter.paragraphs.length > 0
      ? letter.paragraphs
      : defaultParagraphs;

    if (Array.isArray(letter.pages) && letter.pages.length > 0) {
      this.pages = letter.pages;
    } else {
      if (paras.length > 2) {
        this.pages = [
          { pageNumber: 1, subtitle: 'Chúc Mừng Sinh Nhật Em Yêu ✨', paragraphs: paras.slice(0, 2) },
          { pageNumber: 2, subtitle: 'Hành trình yêu thương phía trước 🌸', paragraphs: paras.slice(2) },
        ];
      } else {
        this.pages = [{ pageNumber: 1, subtitle: '', paragraphs: paras }];
      }
    }
  }

  // ─── MOUNT ─────────────────────────────────────────────────────────────────

  mount() {
    this.initPages();

    this.element = document.createElement('div');
    this.element.id = 'screen-letter';

    Object.assign(this.element.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      minHeight: '100dvh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      WebkitFontSmoothing: 'antialiased',
      background: 'transparent'
    });

    const recipientName = birthdayData?.recipient?.nickname || birthdayData?.recipient?.name || 'Bé meo';
    const letterTitle = birthdayData?.letter?.title || 'Happy Birthday vợ eooo ♡';
    const letterDate = birthdayData?.letter?.date || 'Ngày 02 tháng 11 năm 2026';
    const peekingText = this.pages[0]?.paragraphs[0] || 'Chúc mừng sinh nhật em yêu...';

    this.element.innerHTML = `
      <!-- Three.js Canvas Background -->
      <canvas id="letter-three-bg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"></canvas>

      <!-- Ambient floating decorations -->
      <div class="letter-ambient-layer" aria-hidden="true" style="position: relative; z-index: 1; pointer-events: none;">
        <span class="ambient-heart" aria-hidden="true">♡</span>
        <span class="ambient-heart" aria-hidden="true">♡</span>
        <span class="ambient-petal" aria-hidden="true">🌸</span>
        <span class="ambient-petal" aria-hidden="true">🌷</span>
        <span class="ambient-star"  aria-hidden="true">✦</span>
        <span class="ambient-star"  aria-hidden="true">✧</span>
      </div>

      <!-- ── HEADER ── -->
      <header class="letter-header modern-header" id="letter-header" style="position: relative; z-index: 2; text-align: center; padding-top: 4vh;">
        <div class="letter-badge glass-badge" style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(255,255,255,0.75); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.9); font-size: 0.8rem; font-weight: 600; color: #d6336c; margin-bottom: 10px; box-shadow: 0 4px 15px rgba(214, 51, 108, 0.15);"> THE BIRTHDAY BÉ IU 🌸 </div>
        <h2 class="letter-title" style="font-size: 2.2rem; font-weight: 800; color: #343a40; letter-spacing: -0.5px; margin: 0;">${letterTitle}</h2>
        <p class="letter-subtitle" style="color: #6c757d; font-weight: 500; margin-top: 6px;">${recipientName} • ${letterDate}</p>
      </header>

      <!-- ── ENVELOPE AREA ── -->
      <main class="envelope-area" id="envelope-area" style="position: relative; z-index: 2; flex: 1; display: flex; align-items: center; justify-content: center; perspective: 1000px;">
        <div class="envelope-wrapper" id="envelope-wrapper" style="transform-style: preserve-3d;">
          <div class="envelope-box shadow-xl" style="box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
            
            <div class="vintage-stamp" aria-hidden="true">
              <span class="stamp-inner">🌸</span><span class="stamp-label">POST</span>
            </div>
            <div class="postmark-circle" aria-hidden="true"><span>SPECIAL</span></div>

            <div class="draggable-letter-sheet glass-sheet" id="draggable-letter-sheet" role="button" aria-label="Kéo lá thư lên để mở" style="touch-action: none; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
              <div class="pull-tab">
                <span>▲</span><span>Kéo lá thư lên ♡</span>
              </div>
              <div class="peeking-title">${letterTitle}</div>
              <div class="peeking-snippet" style="opacity: 0.8; color: #495057;">${peekingText}</div>
            </div>

            <div class="envelope-front-pocket" aria-hidden="true"></div>
            <div class="envelope-flap" id="envelope-flap" aria-hidden="true"></div>

            <button class="wax-seal hover-scale" id="wax-seal" aria-label="Chạm để mở niêm phong sáp">
              <span class="wax-seal-heart" aria-hidden="true">♡</span>
            </button>
          </div>
        </div>
      </main>

      <!-- ── LETTER READING CARD (KHUNG ĐỌC THƯ THIẾT KẾ MỚI VÀ HIỂN THỊ VIẾT BẰNG CHỮ HIỆN ĐẠI) ── -->
      <section class="letter-reading-card glass-card" id="letter-reading-card" aria-label="Nội dung bức thư" style="display: none; position: relative; z-index: 10; background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.18); margin: auto; max-width: 650px; width: 90%; padding: 28px; flex-direction: column; max-height: 75dvh;">
        <div class="reading-meta" style="border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <span class="reading-date" style="color: #868e96; font-size: 0.9rem; font-weight: 500;">${letterDate}</span>
          <div class="reading-page-indicator" id="reading-page-indicator"></div>
        </div>

        <div class="letter-scrollable-content" id="letter-scrollable-content" style="overflow-y: auto; flex: 1; padding-right: 8px;">
          <div id="page-content-wrapper" style="color: #2b2b2b; min-height: 150px;"></div>
        </div>

        <div class="letter-pagination-controls" id="letter-pagination-controls" style="margin-top: 16px; display: flex; justify-content: space-between; gap: 10px;"></div>

        <footer class="letter-footer-action" style="margin-top: 12px; text-align: center;">
          <button class="btn-fold-back glass-btn" id="btn-fold-back" style="background: rgba(0,0,0,0.05); border: none; padding: 10px 22px; border-radius: 30px; font-weight: 600; color: #495057; cursor: pointer; transition: all 0.3s ease;">
            <span>✉ Gập lại phong bì</span>
          </button>
        </footer>
      </section>

      <!-- ── CLOSING PANEL ── -->
      <aside class="stage5-panel glass-card" id="stage5-panel" style="display: none; position: relative; z-index: 12; text-align: center; padding: 35px 25px; background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); border-radius: 28px; box-shadow: 0 30px 60px rgba(0,0,0,0.15); margin: auto; max-width: 500px; width: 90%; transform: translateY(20px); opacity: 0;">
        <span class="stage5-badge" style="font-size: 3rem; display: block; margin-bottom: 10px;">💌</span>
        <h3 class="stage5-title" style="font-size: 1.7rem; font-weight: 700; color: #212529; margin: 0;">Đã đọc đến cuối thư...</h3>
        <p class="stage5-desc" style="color: #495057; margin: 12px 0 24px; line-height: 1.6;">Cảm ơn em vì đã dành thời gian đọc từng trang thư nhỏ này của anh ♡</p>
        <div class="stage5-actions">
          <button class="btn-stage5-action primary modern-btn" id="btn-stage5-continue" style="background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%); color: white; border: none; padding: 14px 32px; border-radius: 30px; font-size: 1.05rem; font-weight: 600; cursor: pointer; box-shadow: 0 10px 20px rgba(255, 117, 140, 0.3);">
            <span> Tiếp tục hoiiii meo ♡</span>
          </button>
        </div>
      </aside>
    `;

    this.backBtn = new BackButton(this.element, {
      variant: 'glass',
      position: 'top-left',
      label: 'Hộp quà',
      onClick: () => {
        if (this.onReplayAll) this.onReplayAll();
      }
    });
    this.backBtn.mount();
    this.parentElement.appendChild(this.element);

    this.initThreeBackground();
    this.setupInteractions();
    this.renderCurrentPageContent(false);

    gsap.fromTo(this.element, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    const header = this.element.querySelector('#letter-header');
    const envelopeArea = this.element.querySelector('#envelope-area');

    gsap.fromTo([header, envelopeArea],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.1 }
    );
  }

  // ─── THREE.JS PASTEL BACKGROUND ──────────────────────────────────────────

  initThreeBackground() {
    this.threeCanvas = this.element.querySelector('#letter-three-bg');
    if (!this.threeCanvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    this.threeScene = new THREE.Scene();

    this.threeCamera = new THREE.PerspectiveCamera(isMobile ? 70 : 55, width / height, 0.1, 1000);
    this.threeCamera.position.z = isMobile ? 24 : 18;

    this.threeRenderer = new THREE.WebGLRenderer({
      canvas: this.threeCanvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.threeRenderer.setSize(width, height);
    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    const hemiLight = new THREE.HemisphereLight(0xffe6f2, 0xe6f2ff, 1.5);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(10, 20, 15);
    this.threeScene.add(ambientLight, hemiLight, dirLight);

    const heartGeometry = this.createHeartGeometry();
    const heartMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xff8fa3, roughness: 0.2, metalness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0xffb3c6, roughness: 0.15, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6 })
    ];

    this.floatingHearts = [];
    const heartCount = isMobile ? 14 : 28;
    for (let i = 0; i < heartCount; i++) {
      const mat = (i % 6 === 0) ? heartMaterials[2] : (i % 2 === 0 ? heartMaterials[0] : heartMaterials[1]);
      const mesh = new THREE.Mesh(heartGeometry, mat);

      mesh.position.set(
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 15 - 4
      );

      const scale = 0.35 + Math.random() * 0.55;
      mesh.scale.set(scale, scale, scale);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      mesh.userData = {
        speedY: 0.008 + Math.random() * 0.012,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
      };

      this.threeScene.add(mesh);
      this.floatingHearts.push(mesh);
    }

    const particleCount = isMobile ? 100 : 250;
    const particleGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) pos[i] = (Math.random() - 0.5) * 35;
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffa3b1, size: 0.2, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false
    });
    this.particleSystem = new THREE.Points(particleGeo, particleMat);
    this.threeScene.add(this.particleSystem);

    const animate = () => {
      this.threeAnimId = requestAnimationFrame(animate);
      if (!this.threeScene || !this.threeRenderer) return;

      this.floatingHearts.forEach(heart => {
        heart.position.y += heart.userData.speedY;
        heart.rotation.x += heart.userData.rotSpeedX;
        heart.rotation.y += heart.userData.rotSpeedY;
        if (heart.position.y > 15) heart.position.y = -15;
      });

      if (this.particleSystem) {
        this.particleSystem.rotation.y += 0.0008;
        this.particleSystem.position.y = Math.sin(performance.now() * 0.0008) * 1.5;
      }

      this.threeRenderer.render(this.threeScene, this.threeCamera);
    };

    animate();

    this._onResizeBound = () => this.handleResize();
    window.addEventListener('resize', this._onResizeBound, { passive: true });
    window.addEventListener('orientationchange', this._onResizeBound, { passive: true });
  }

  createHeartGeometry() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y);
    shape.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35);
    shape.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 1.0);
    shape.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35);
    shape.bezierCurveTo(x + 0.80, y, x + 0.50, y, x + 0.50, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04
    }).center();
  }

  handleResize() {
    if (!this.threeCamera || !this.threeRenderer) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    this.threeCamera.aspect = width / height;
    this.threeCamera.fov = isMobile ? 70 : 55;
    this.threeCamera.position.z = isMobile ? 24 : 18;
    this.threeCamera.updateProjectionMatrix();

    this.threeRenderer.setSize(width, height);
    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  // ─── RENDER NỘI DUNG THƯ (CHUẨN XÁC VÀ KHÔNG BAO GIỜ MẤT CHỮ) ──────────────────────────

  renderCurrentPageContent(animate = true) {
    const wrapper = this.element?.querySelector('#page-content-wrapper');
    const scrollContainer = this.element?.querySelector('#letter-scrollable-content');
    if (!wrapper) return;

    if (!this.pages || this.pages.length === 0) {
      this.initPages();
    }

    const page = this.pages[this.currentPageIndex] || this.pages[0];
    const isFirstPage = this.currentPageIndex === 0;
    const isLastPage = this.currentPageIndex === this.pages.length - 1;

    let html = '';

    if (isFirstPage && birthdayData?.letter?.salutation) {
      html += `<div class="reading-salutation" style="color: #d6336c; font-weight: 700; font-size: 1.15rem; margin-bottom: 1.2rem; opacity: 1;">${birthdayData.letter.salutation}</div>`;
    }

    if (page.subtitle) {
      html += `<div class="reading-page-subtitle" style="color: #b87333; font-style: italic; font-weight: 600; margin-bottom: 1rem; opacity: 1;">${page.subtitle}</div>`;
    }

    html += '<div class="reading-body" style="color: #2b2b2b; font-size: 1.05rem; line-height: 1.8; opacity: 1;">';
    const paragraphs = page.paragraphs || [];
    paragraphs.forEach((p, idx) => {
      html += `<p class="reading-paragraph" data-idx="${idx}" style="margin-bottom: 1.2rem; color: #2b2b2b; opacity: 1; display: block;">${p}</p>`;
    });
    html += '</div>';

    if (isLastPage) {
      html += '<div class="reading-closing-area" style="margin-top: 2rem; color: #2b2b2b; text-align: right; opacity: 1;">';
      if (birthdayData?.letter?.closing) {
        html += `<div class="reading-closing" style="font-weight: 600; color: #d6336c;">${birthdayData.letter.closing}</div>`;
      }
      if (birthdayData?.letter?.signature) {
        html += `<div class="reading-signature" style="font-style: italic; font-size: 1.2rem; margin-top: 0.5rem; color: #333;">${birthdayData.letter.signature}</div>`;
      }
      html += '</div>';
    }

    wrapper.innerHTML = html;

    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    this.updatePageIndicator();
    this.updatePaginationControls();

    if (animate) {
      gsap.fromTo(
        wrapper,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }

  updatePageIndicator() {
    const indicator = this.element?.querySelector('#reading-page-indicator');
    if (!indicator) return;

    if (this.pages.length <= 1) {
      indicator.innerHTML = `<span class="reading-badge-small" style="color: #d6336c; font-weight: 600; font-size: 0.85rem;">FOR MY SPECIAL ONE ♡</span>`;
      return;
    }

    let dotsHtml = '';
    for (let i = 0; i < this.pages.length; i++) {
      dotsHtml += `<span class="page-dot ${i === this.currentPageIndex ? 'active' : ''}"></span>`;
    }

    indicator.innerHTML = `
      <span class="reading-page-badge" style="color: #6c757d; font-size: 0.85rem; font-weight: 600;">Trang ${this.currentPageIndex + 1} / ${this.pages.length}</span>
      <div class="page-dots" aria-hidden="true">${dotsHtml}</div>
    `;
  }

  updatePaginationControls() {
    const controls = this.element?.querySelector('#letter-pagination-controls');
    if (!controls) return;

    const isFirstPage = this.currentPageIndex === 0;
    const isLastPage = this.currentPageIndex === this.pages.length - 1;
    const continueText = birthdayData?.letter?.continueButtonText || 'Đọc xong rồi, tiếp tục nhé ♡';

    let html = '';

    if (this.pages.length <= 1) {
      html = `
        <div style="width: 100%; display: flex; justify-content: center;">
          <button class="btn-continue-journey modern-btn" id="btn-continue-journey" aria-label="${continueText}" style="background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%); color: white; border: none; padding: 12px 28px; border-radius: 25px; font-weight: 600; cursor: pointer;">
            <span>${continueText}</span>
          </button>
        </div>
      `;
    } else {
      html += `
        <button class="btn-page-turn" id="btn-prev-page" ${isFirstPage ? 'disabled aria-disabled="true"' : ''} aria-label="Trang trước" style="padding: 10px 18px; border-radius: 20px; cursor: pointer; opacity: ${isFirstPage ? 0.4 : 1};">
          <span>← Trang trước</span>
        </button>
      `;

      if (!isLastPage) {
        html += `
          <button class="btn-page-turn btn-next" id="btn-next-page" aria-label="Sang trang tiếp theo" style="padding: 10px 18px; border-radius: 20px; cursor: pointer;">
            <span>Sang trang →</span>
          </button>
        `;
      } else {
        html += `
          <button class="btn-continue-journey modern-btn" id="btn-continue-journey" style="background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%); color: white; border: none; padding: 10px 20px; border-radius: 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer;" aria-label="${continueText}">
            <span>${continueText}</span>
          </button>
        `;
      }
    }

    controls.innerHTML = html;

    const prevBtn = controls.querySelector('#btn-prev-page');
    const nextBtn = controls.querySelector('#btn-next-page');
    const continueBtn = controls.querySelector('#btn-continue-journey');

    if (prevBtn) prevBtn.addEventListener('click', () => this.goToPage(this.currentPageIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.goToPage(this.currentPageIndex + 1));
    if (continueBtn) continueBtn.addEventListener('click', () => this.revealClosingPanel());
  }

  goToPage(newIndex) {
    if (newIndex < 0 || newIndex >= this.pages.length || newIndex === this.currentPageIndex) return;

    const wrapper = this.element?.querySelector('#page-content-wrapper');
    const isForward = newIndex > this.currentPageIndex;
    if (!wrapper) return;

    gsap.to(wrapper, {
      opacity: 0,
      x: isForward ? -25 : 25,
      duration: 0.22,
      ease: 'power1.in',
      onComplete: () => {
        this.currentPageIndex = newIndex;
        this.renderCurrentPageContent(true);

        gsap.fromTo(
          wrapper,
          { opacity: 0, x: isForward ? 25 : -25 },
          { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
        );
      },
    });
  }

  // ─── TƯƠNG TÁC KÉO / MỞ PHONG BÌ ────────────────────────────────────────

  setupInteractions() {
    const envelopeWrapper = this.element.querySelector('#envelope-wrapper');
    const draggableSheet = this.element.querySelector('#draggable-letter-sheet');
    const waxSeal = this.element.querySelector('#wax-seal');
    const foldBackBtn = this.element.querySelector('#btn-fold-back');
    const continueJourney = this.element.querySelector('#btn-stage5-continue');
    const readingCard = this.element.querySelector('#letter-reading-card');

    if (waxSeal) {
      waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.isOpen) this.openLetterCompletely();
      });
    }

    if (envelopeWrapper) {
      envelopeWrapper.addEventListener('click', (e) => {
        if (!this.isOpen && !this.isDraggingLetter && e.target !== draggableSheet && !draggableSheet?.contains(e.target)) {
          this.openLetterCompletely();
        }
      });
    }

    const onPointerDown = (e) => {
      if (this.isOpen) return;
      this.isDraggingLetter = true;
      this.startY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      this.currentPullY = 0;
      draggableSheet?.classList.add('is-dragging');
      envelopeWrapper?.classList.add('is-unsealed');
      if (draggableSheet) draggableSheet.style.transition = 'none';

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true });
    };

    const onPointerMove = (e) => {
      if (!this.isDraggingLetter || this.isOpen) return;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? this.startY;
      const deltaY = clientY - this.startY;

      if (deltaY < 0) {
        this.currentPullY = Math.max(-160, deltaY * 0.85);
        if (draggableSheet) {
          draggableSheet.style.transform = `translateY(${this.currentPullY}px)`;
        }

        if (this.currentPullY <= -100) {
          this.isDraggingLetter = false;
          draggableSheet?.classList.remove('is-dragging');
          onPointerUp();
          this.openLetterCompletely();
        }
      }
    };

    const onPointerUp = () => {
      this.isDraggingLetter = false;
      draggableSheet?.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (!this.isOpen && draggableSheet && this.currentPullY > -100) {
        gsap.to(draggableSheet, {
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
          onComplete: () => {
            envelopeWrapper?.classList.remove('is-unsealed');
          }
        });
      }
    };

    this._pointerMoveBound = onPointerMove;
    this._pointerUpBound = onPointerUp;
    this._pointerCancelBound = onPointerUp;

    if (draggableSheet) {
      draggableSheet.addEventListener('pointerdown', onPointerDown, { passive: true });
    }

    if (readingCard) {
      readingCard.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      readingCard.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - this.touchStartX;
          const deltaY = e.changedTouches[0].clientY - this.touchStartY;
          if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            if (deltaX < 0) {
              this.goToPage(this.currentPageIndex + 1);
            } else {
              this.goToPage(this.currentPageIndex - 1);
            }
          }
        }
      }, { passive: true });
    }

    if (foldBackBtn) {
      foldBackBtn.addEventListener('click', () => this.foldBackEnvelope());
    }

    if (continueJourney && this.onContinueToMemories) {
      continueJourney.addEventListener('click', () => this.onContinueToMemories());
    }
  }

  revealClosingPanel() {
    const stage5Panel = this.element?.querySelector('#stage5-panel');
    if (!stage5Panel) return;
    stage5Panel.style.display = 'block';

    gsap.fromTo(stage5Panel,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.7)', onComplete: () => {
          spawnMagicBurst(stage5Panel, 15);
          stage5Panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    );
  }

  openLetterCompletely() {
    if (this.isOpen) return;
    this.isOpen = true;

    const envelopeWrapper = this.element.querySelector('#envelope-wrapper');
    const envelopeArea = this.element.querySelector('#envelope-area');
    const draggableSheet = this.element.querySelector('#draggable-letter-sheet');
    const readingCard = this.element.querySelector('#letter-reading-card');

    envelopeWrapper?.classList.add('is-unsealed');
    spawnMagicBurst(this.element, 24);

    this.renderCurrentPageContent(true);

    const tl = gsap.timeline();

    tl.to(draggableSheet, {
      y: -200,
      opacity: 0,
      duration: 0.6,
      ease: 'back.in(1.2)',
      force3D: true,
    }, 0);

    tl.to(envelopeArea, {
      opacity: 0,
      scale: 0.85,
      duration: 0.5,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.15);

    tl.add(() => {
      if (envelopeArea) envelopeArea.style.display = 'none';
      if (readingCard) {
        readingCard.style.display = 'flex';
        readingCard.style.opacity = '0';
      }
    }, 0.55);

    tl.fromTo(readingCard,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out', clearProps: 'transform' },
      0.55
    );
  }

  foldBackEnvelope() {
    if (!this.isOpen) return;

    const envelopeArea = this.element.querySelector('#envelope-area');
    const envelopeWrapper = this.element.querySelector('#envelope-wrapper');
    const draggableSheet = this.element.querySelector('#draggable-letter-sheet');
    const readingCard = this.element.querySelector('#letter-reading-card');
    const stage5Panel = this.element.querySelector('#stage5-panel');

    if (stage5Panel) stage5Panel.style.display = 'none';

    const tl = gsap.timeline();

    tl.to(readingCard, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        if (readingCard) readingCard.style.display = 'none';
        this.currentPageIndex = 0;
        if (envelopeArea) envelopeArea.style.display = 'flex';
      }
    });

    tl.fromTo(envelopeArea,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' },
      0.35
    );

    tl.add(() => {
      if (draggableSheet) {
        draggableSheet.style.transform = '';
        draggableSheet.style.opacity = '1';
      }
      envelopeWrapper?.classList.remove('is-unsealed');
      this.isOpen = false;
      this.currentPullY = 0;
    });
  }

  disposeThreeResources() {
    if (this.threeAnimId) {
      cancelAnimationFrame(this.threeAnimId);
      this.threeAnimId = null;
    }

    if (this.threeScene) {
      this.threeScene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    if (this.threeRenderer) {
      this.threeRenderer.dispose();
      this.threeRenderer.forceContextLoss();
    }

    this.threeScene = null;
    this.threeCamera = null;
    this.particleSystem = null;
    this.floatingHearts = [];
    this.threeRenderer = null;
  }

  destroy(onComplete) {
    if (this._pointerMoveBound) window.removeEventListener('pointermove', this._pointerMoveBound);
    if (this._pointerUpBound) window.removeEventListener('pointerup', this._pointerUpBound);
    if (this._pointerCancelBound) window.removeEventListener('pointercancel', this._pointerCancelBound);
    if (this._onResizeBound) {
      window.removeEventListener('resize', this._onResizeBound);
      window.removeEventListener('orientationchange', this._onResizeBound);
    }
    if (this.backBtn) this.backBtn.destroy();

    this.disposeThreeResources();

    if (!this.element) {
      if (onComplete) onComplete();
      return;
    }

    gsap.to(this.element, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        if (this.element?.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        if (onComplete) onComplete();
      },
    });
  }
}