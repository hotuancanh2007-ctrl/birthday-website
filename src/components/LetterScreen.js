import gsap from 'gsap';
import * as THREE from 'three';
import { birthdayData } from '../data/birthdayData.js';
import { spawnMagicBurst } from '../utils/magicBurst.js';
import { BackButton } from './BackButton';
import '../styles/back-button.css';
import '../styles/letter.css';

/**
 * LetterScreen — Stage 2: The Birthday Letter (3D Pink Pastel 2026 Edition)
 * Fixed: Stagger delay on long paragraphs & text color visibility.
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

    // Pagination
    this.initPages();
    this.currentPageIndex = 0;

    // Swipe gesture tracking
    this.touchStartX = 0;
    this.touchStartY = 0;

    // Bound listeners for clean removal
    this._pointerMoveBound = null;
    this._pointerUpBound = null;
    this._pointerCancelBound = null;
    this._onResizeBound = null;
  }

  // ─── INITIALISE PAGES ──────────────────────────────────────────────────────

  initPages() {
    const letter = birthdayData?.letter || {};

    if (Array.isArray(letter.pages) && letter.pages.length > 0) {
      this.pages = letter.pages;
    } else {
      const paras = Array.isArray(letter.paragraphs) ? letter.paragraphs : [];
      if (paras.length > 2) {
        this.pages = [
          { pageNumber: 1, subtitle: 'Chúc Mừng Sinh Nhật Em Yêu', paragraphs: paras.slice(0, 2) },
          { pageNumber: 2, subtitle: 'Hành trình yêu thương phía trước', paragraphs: paras.slice(2) },
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
    this.element.style.position = 'relative';
    this.element.style.width = '100%';
    this.element.style.minHeight = '100vh';
    this.element.style.overflow = 'hidden';

    const peekingText = this.pages[0]?.paragraphs[0] || 'Chúc mừng sinh nhật em yêu...';

    this.element.innerHTML = `
      <!-- Three.js Canvas Background -->
      <canvas id="letter-three-bg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"></canvas>

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
      <header class="letter-header" id="letter-header" style="position: relative; z-index: 2;">
        <div class="letter-badge">✦ THE BIRTHDAY LETTER ✦</div>
        <h2 class="letter-title">${birthdayData?.letter?.title || 'Happy Birthday'}</h2>
        <p class="letter-subtitle">${birthdayData?.recipient?.nickname || 'Bé meo'} • ${birthdayData?.letter?.date || ''}</p>
      </header>

      <!-- ── ENVELOPE AREA ── -->
      <main class="envelope-area" id="envelope-area" style="position: relative; z-index: 2;">
        <div class="envelope-wrapper" id="envelope-wrapper">
          <div class="envelope-box">
            <div class="vintage-stamp" aria-hidden="true">
              <span class="stamp-inner">🌸</span>
              <span class="stamp-label">POST</span>
            </div>

            <div class="postmark-circle" aria-hidden="true">
              <span>SPECIAL</span>
            </div>

            <div class="draggable-letter-sheet" id="draggable-letter-sheet" role="button" aria-label="Kéo lá thư lên để mở">
              <div class="pull-tab">
                <span>▲</span>
                <span>Kéo lá thư lên ♡</span>
              </div>
              <div class="peeking-title">${birthdayData?.letter?.title || ''}</div>
              <div class="peeking-snippet">${peekingText}</div>
            </div>

            <div class="envelope-front-pocket" aria-hidden="true"></div>
            <div class="envelope-flap" id="envelope-flap" aria-hidden="true"></div>

            <button class="wax-seal" id="wax-seal" aria-label="Chạm để mở niêm phong sáp">
              <span class="wax-seal-heart" aria-hidden="true">♡</span>
            </button>
          </div>
        </div>

        <div class="envelope-hint" id="envelope-hint">
          <span class="envelope-hint-arrow" aria-hidden="true">💌</span>
          <span>Chạm vào con dấu sáp hoặc kéo lá thư lên để mở ♡</span>
        </div>
      </main>

      <!-- ── LETTER READING CARD ── -->
      <section class="letter-reading-card" id="letter-reading-card" aria-label="Nội dung bức thư sinh nhật" style="position: relative; z-index: 2;">
        <div class="reading-meta">
          <span class="reading-date">${birthdayData?.letter?.date || ''}</span>
          <div class="reading-page-indicator" id="reading-page-indicator"></div>
        </div>

        <div class="letter-scrollable-content" id="letter-scrollable-content">
          <div id="page-content-wrapper"></div>
        </div>

        <div class="letter-pagination-controls" id="letter-pagination-controls"></div>

        <footer class="letter-footer-action">
          <button class="btn-fold-back" id="btn-fold-back">
            <span>✉ Gập lại phong bì</span>
          </button>
        </footer>
      </section>

      <!-- ── CLOSING PANEL ── -->
      <aside class="stage5-panel" id="stage5-panel" role="complementary" aria-label="Kết thúc bức thư" style="position: relative; z-index: 2;">
        <span class="stage5-badge">💌 ♡ ✨</span>
        <h3 class="stage5-title">Em đã đọc đến cuối thư rồi...</h3>
        <p class="stage5-desc">
          Cảm ơn em vì đã dành thời gian đọc từng trang thư nhỏ này của anh.
          Mỗi chữ anh viết đều chứa đựng cả trái tim yêu thương dành riêng cho em ♡
        </p>
        <div class="stage5-actions">
          <button class="btn-stage5-action primary" id="btn-stage5-continue">
            <span>✦ Tiếp tục hành trình ♡</span>
          </button>
          <button class="btn-stage5-action" id="btn-stage5-reread">
            <span>Đọc lại từ trang 1</span>
          </button>
          <button class="btn-stage5-action" id="btn-stage5-replay-all">
            <span>Xem lại từ đầu</span>
          </button>
        </div>
      </aside>
    `;
    this.backBtn = new BackButton(this.element, {
      variant: 'glass',
      position: 'top-left',
      label: 'Hộp quà',
      onClick: () => {
        // Logic quay lại màn hình trước (ví dụ: Replay hoặc về Gift)
        if (this.onReplayAll) this.onReplayAll();
      }
    });
    this.backBtn.mount();
    this.parentElement.appendChild(this.element);

    this.initThreeBackground();
    this.setupInteractions();
    this.renderCurrentPageContent(false);

    gsap.fromTo(
      this.element,
      { opacity: 0 },
      { opacity: 1, duration: 0.85, ease: 'power2.out' }
    );

    const header = this.element.querySelector('#letter-header');
    const envelopeArea = this.element.querySelector('#envelope-area');
    gsap.fromTo(
      [header, envelopeArea],
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.95, stagger: 0.15, ease: 'power2.out', delay: 0.18 }
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

    // [Responsive] Tăng FOV để tránh làm trái tim to chiếm hết màn hình điện thoại
    this.threeCamera = new THREE.PerspectiveCamera(isMobile ? 75 : 60, width / height, 0.1, 1000);
    // [Responsive] Lùi Camera xa hơn (z=22) so với PC (z=15)
    this.threeCamera.position.z = isMobile ? 22 : 15;

    this.threeRenderer = new THREE.WebGLRenderer({
      canvas: this.threeCanvas,
      alpha: true,
      antialias: true,
    });
    this.threeRenderer.setSize(width, height);
    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.2);
    this.threeScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffb6c1, 1.5);
    dirLight.position.set(5, 10, 7);
    this.threeScene.add(dirLight);

    const heartGeometry = this.createHeartGeometry();
    const heartMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xffb3c6, roughness: 0.3, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: 0xffc2d1, roughness: 0.2, metalness: 0.2 }),
    ];

    this.floatingHearts = [];
    const heartCount = 18;
    for (let i = 0; i < heartCount; i++) {
      const mat = heartMaterials[i % heartMaterials.length];
      const mesh = new THREE.Mesh(heartGeometry, mat);

      mesh.position.set(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10 - 2
      );

      const scale = 0.35 + Math.random() * 0.55;
      mesh.scale.set(scale, scale, scale);
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      mesh.userData = {
        speedY: 0.003 + Math.random() * 0.005,
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
        floatOffset: Math.random() * Math.PI * 2,
        baseX: mesh.position.x,
      };

      this.threeScene.add(mesh);
      this.floatingHearts.push(mesh);
    }

    const particleCount = 110;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const pastelColors = [
      new THREE.Color('#ffb6c1'),
      new THREE.Color('#ffd1dc'),
      new THREE.Color('#fff0f5'),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const col = pastelColors[Math.floor(Math.random() * pastelColors.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.particleSystem = new THREE.Points(particleGeo, particleMat);
    this.threeScene.add(this.particleSystem);

    let clock = new THREE.Clock();
    const animate = () => {
      this.threeAnimId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      this.floatingHearts.forEach(heart => {
        heart.position.y += heart.userData.speedY;
        heart.position.x = heart.userData.baseX + Math.sin(elapsedTime + heart.userData.floatOffset) * 0.4;
        heart.rotation.x += heart.userData.rotSpeedX;
        heart.rotation.y += heart.userData.rotSpeedY;

        if (heart.position.y > 10) {
          heart.position.y = -10;
        }
      });

      if (this.particleSystem) {
        this.particleSystem.rotation.y = elapsedTime * 0.03;
      }

      this.threeRenderer.render(this.threeScene, this.threeCamera);
    };

    animate();

    this._onResizeBound = () => this.handleResize();
    window.addEventListener('resize', this._onResizeBound);
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

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
  }

  handleResize() {
    if (!this.threeCamera || !this.threeRenderer) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    this.threeCamera.aspect = width / height;
    // [Responsive] Cập nhật lại thuộc tính Camera
    this.threeCamera.fov = isMobile ? 75 : 60;
    this.threeCamera.position.z = isMobile ? 22 : 15;
    this.threeCamera.updateProjectionMatrix();

    this.threeRenderer.setSize(width, height);
    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // ─── TÁCH KÝ TỰ BẢO TOÀN HIỂN THỊ MÀU SẮC & CẤU TRÚC TỪ ───────────────────

  formatTextToSpans(text) {
    if (text === undefined || text === null) return '';
    const str = String(text);

    return str.split('\n').map(line => {
      const words = line.split(' ');
      return words.map(word => {
        if (!word) return '';
        const chars = Array.from(word).map(char =>
          `<span class="letter-char" style="display: inline-block; color: inherit;">${char}</span>`
        ).join('');
        return `<span class="letter-word" style="display: inline-block; white-space: nowrap; color: inherit;">${chars}</span>`;
      }).join('<span class="letter-space" style="display: inline-block; width: 0.28em;"> </span>');
    }).join('<br/>');
  }

  // ─── RENDER PAGE CONTENT ───────────────────────────────────────────────────

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
      html += `<div class="reading-salutation" style="color: #4a1c28; font-weight: 600;">${this.formatTextToSpans(birthdayData.letter.salutation)}</div>`;
    }

    if (page.subtitle) {
      html += `<div class="reading-page-subtitle" style="color: #b87333; font-style: italic;">✦ ${this.formatTextToSpans(page.subtitle)}</div>`;
    }

    // Ép kiểu màu chữ nổi bật trực tiếp (#4a1c28 - màu đỏ mận/rượu vang)
    html += '<div class="reading-body" style="color: #4a1c28; font-size: 1.02rem; line-height: 1.8;">';
    const paragraphs = page.paragraphs || [];
    paragraphs.forEach((p, idx) => {
      html += `<p class="reading-paragraph" data-idx="${idx}" style="margin-bottom: 1.2rem; color: #4a1c28; opacity: 1;">${this.formatTextToSpans(p)}</p>`;
    });
    html += '</div>';

    if (isLastPage) {
      html += '<div class="reading-closing-area" style="margin-top: 1.5rem; color: #4a1c28;">';
      if (birthdayData?.letter?.closing) {
        html += `<div class="reading-closing" style="font-weight: 600;">${this.formatTextToSpans(birthdayData.letter.closing)}</div>`;
      }
      if (birthdayData?.letter?.signature) {
        html += `<div class="reading-signature" style="font-style: italic; font-size: 1.1rem;">${this.formatTextToSpans(birthdayData.letter.signature)}</div>`;
      }
      html += '</div>';
    }

    wrapper.innerHTML = html;

    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    this.updatePageIndicator();
    this.updatePaginationControls();

    // Hiệu ứng chữ xuất hiện với tổng thời gian cố định 0.8s
    if (animate) {
      const charElements = wrapper.querySelectorAll('.letter-char');
      if (charElements.length > 0) {
        gsap.killTweensOf(charElements);
        gsap.fromTo(
          charElements,
          {
            opacity: 0,
            y: 8,
            filter: 'blur(3px)',
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.35,
            stagger: {
              amount: 3, // Toàn bộ chữ xuất hiện lần lượt mượt mà trong đúng 0.8s
              from: 'start'
            },
            ease: 'power2.out',
            onComplete: () => {
              gsap.set(charElements, { clearProps: 'transform,filter,opacity' });
            }
          }
        );
      }
    }
  }

  // ─── PAGE INDICATOR ────────────────────────────────────────────────────────

  updatePageIndicator() {
    const indicator = this.element?.querySelector('#reading-page-indicator');
    if (!indicator) return;

    if (this.pages.length <= 1) {
      indicator.innerHTML = `<span class="reading-badge-small">FOR MY SPECIAL ONE</span>`;
      return;
    }

    let dotsHtml = '';
    for (let i = 0; i < this.pages.length; i++) {
      dotsHtml += `<span class="page-dot ${i === this.currentPageIndex ? 'active' : ''}"></span>`;
    }

    indicator.innerHTML = `
      <span class="reading-page-badge">Trang ${this.currentPageIndex + 1} / ${this.pages.length}</span>
      <div class="page-dots" aria-hidden="true">${dotsHtml}</div>
    `;
  }

  // ─── PAGINATION CONTROLS ───────────────────────────────────────────────────

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
          <button class="btn-continue-journey" id="btn-continue-journey" aria-label="${continueText}">
            <span aria-hidden="true">✨</span>
            <span>${continueText}</span>
            <span aria-hidden="true">✨</span>
          </button>
        </div>
      `;
    } else {
      html += `
        <button class="btn-page-turn" id="btn-prev-page" ${isFirstPage ? 'disabled aria-disabled="true"' : ''} aria-label="Trang trước">
          <span>← Trang trước</span>
        </button>
      `;

      if (!isLastPage) {
        html += `
          <button class="btn-page-turn btn-next" id="btn-next-page" aria-label="Sang trang tiếp theo">
            <span>Sang trang →</span>
          </button>
        `;
      } else {
        html += `
          <button class="btn-continue-journey" id="btn-continue-journey" style="padding: 0.85rem 2rem; font-size: 0.85rem;" aria-label="${continueText}">
            <span aria-hidden="true">✨</span>
            <span>${continueText}</span>
            <span aria-hidden="true">✨</span>
          </button>
        `;
      }
    }

    controls.innerHTML = html;

    const prevBtn = controls.querySelector('#btn-prev-page');
    const nextBtn = controls.querySelector('#btn-next-page');
    const continueBtn = controls.querySelector('#btn-continue-journey');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.goToPage(this.currentPageIndex - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.goToPage(this.currentPageIndex + 1));
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.revealClosingPanel());
    }
  }

  // ─── GO TO PAGE ────────────────────────────────────────────────────────────

  goToPage(newIndex) {
    if (
      newIndex < 0 ||
      newIndex >= this.pages.length ||
      newIndex === this.currentPageIndex
    ) return;

    const wrapper = this.element?.querySelector('#page-content-wrapper');
    const isForward = newIndex > this.currentPageIndex;
    if (!wrapper) return;

    gsap.to(wrapper, {
      opacity: 0,
      x: isForward ? -22 : 22,
      duration: 0.22,
      ease: 'power1.in',
      onComplete: () => {
        this.currentPageIndex = newIndex;
        this.renderCurrentPageContent(true);

        gsap.fromTo(
          wrapper,
          { opacity: 0, x: isForward ? 22 : -22 },
          { opacity: 1, x: 0, duration: 0.38, ease: 'power2.out' }
        );
      },
    });
  }

  // ─── SETUP INTERACTIONS ────────────────────────────────────────────────────

  setupInteractions() {
    const envelopeWrapper = this.element.querySelector('#envelope-wrapper');
    const draggableSheet = this.element.querySelector('#draggable-letter-sheet');
    const waxSeal = this.element.querySelector('#wax-seal');
    const foldBackBtn = this.element.querySelector('#btn-fold-back');
    const stage5Panel = this.element.querySelector('#stage5-panel');
    const rereadBtn = this.element.querySelector('#btn-stage5-reread');
    const replayAllBtn = this.element.querySelector('#btn-stage5-replay-all');
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
    };

    const onPointerMove = (e) => {
      if (!this.isDraggingLetter || this.isOpen) return;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? this.startY;
      const deltaY = clientY - this.startY;
      if (deltaY < 0) {
        this.currentPullY = Math.max(-185, deltaY);
        if (draggableSheet) {
          draggableSheet.style.transform = `translateY(${this.currentPullY}px)`;
        }
        if (this.currentPullY <= -110) {
          this.isDraggingLetter = false;
          draggableSheet?.classList.remove('is-dragging');
          this.openLetterCompletely();
        }
      }
    };

    const onPointerUp = () => {
      if (!this.isDraggingLetter || this.isOpen) return;
      this.isDraggingLetter = false;
      draggableSheet?.classList.remove('is-dragging');

      if (this.currentPullY < -65) {
        this.openLetterCompletely();
      } else {
        gsap.to(draggableSheet, {
          y: 0,
          duration: 0.45,
          ease: 'elastic.out(1, 0.5)',
          onComplete: () => {
            if (draggableSheet) draggableSheet.style.transform = '';
            envelopeWrapper?.classList.remove('is-unsealed');
          },
        });
      }
    };

    this._pointerMoveBound = onPointerMove;
    this._pointerUpBound = onPointerUp;
    this._pointerCancelBound = onPointerUp;

    if (draggableSheet) {
      draggableSheet.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
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

    if (rereadBtn) {
      rereadBtn.addEventListener('click', () => {
        if (stage5Panel) stage5Panel.style.display = 'none';
        this.goToPage(0);
        requestAnimationFrame(() => {
          readingCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }

    if (replayAllBtn && this.onReplayAll) {
      replayAllBtn.addEventListener('click', () => {
        this.onReplayAll();
      });
    }

    if (continueJourney && this.onContinueToMemories) {
      continueJourney.addEventListener('click', () => this.onContinueToMemories());
    }
  }

  revealClosingPanel() {
    const stage5Panel = this.element?.querySelector('#stage5-panel');
    if (!stage5Panel) return;
    stage5Panel.style.display = 'block';
    spawnMagicBurst(stage5Panel, 12);
    requestAnimationFrame(() => {
      stage5Panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // ─── OPEN LETTER COMPLETELY ────────────────────────────────────────────────

  // ─── OPEN LETTER COMPLETELY (ĐÃ FIX LỖI GIẬT MÀN HÌNH) ──────────────────────

  // ─── OPEN LETTER COMPLETELY (ĐÃ SỬA TRIỆT ĐỂ LỖI GIẬT MÀN HÌNH) ─────────────

  openLetterCompletely() {
    if (this.isOpen) return;
    this.isOpen = true;

    const envelopeWrapper = this.element.querySelector('#envelope-wrapper');
    const envelopeArea = this.element.querySelector('#envelope-area');
    const draggableSheet = this.element.querySelector('#draggable-letter-sheet');
    const readingCard = this.element.querySelector('#letter-reading-card');

    envelopeWrapper?.classList.add('is-unsealed');
    spawnMagicBurst(this.element, 18);

    // Prepare content beforehand
    this.renderCurrentPageContent(true);

    const tl = gsap.timeline();

    // 1. Lá thư trượt nhẹ lên và mờ dần
    tl.to(draggableSheet, {
      y: -140,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    }, 0);

    // 2. Phong bì mờ dần và thu nhỏ nhẹ
    tl.to(envelopeArea, {
      opacity: 0,
      scale: 0.92,
      duration: 0.45,
      ease: 'power2.inOut',
    }, 0.15);

    // 3. Hoán đổi phần tử mượt mà (Cross-fade)
    tl.add(() => {
      if (envelopeArea) envelopeArea.style.display = 'none';
      if (readingCard) {
        readingCard.style.display = 'block';
        readingCard.style.opacity = '0';
      }
    }, 0.55);

    // 4. Thẻ đọc thư hiện lên êm ái từ vị trí tự nhiên
    tl.fromTo(readingCard,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
      0.55
    );

    // LƯU Ý: Đã loại bỏ hoàn toàn scrollIntoView() để không còn bị giật nảy màn hình
  }

  // ─── FOLD BACK ENVELOPE (GẬP THƯ MƯỢT MÀ) ────────────────────────────────

  foldBackEnvelope() {
    if (!this.isOpen) return;

    const envelopeArea = this.element.querySelector('#envelope-area');
    const envelopeWrapper = this.element.querySelector('#envelope-wrapper');
    const draggableSheet = this.element.querySelector('#draggable-letter-sheet');
    const readingCard = this.element.querySelector('#letter-reading-card');
    const stage5Panel = this.element.querySelector('#stage5-panel');

    if (stage5Panel) stage5Panel.style.display = 'none';

    const tl = gsap.timeline();

    // 1. Ẩn thẻ đọc thư
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

    // 2. Hiện lại phong bì êm ái
    tl.fromTo(envelopeArea,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' },
      0.4
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
  // ─── FOLD BACK ENVELOPE ────────────────────────────────────────────────────

  // ─── FOLD BACK ENVELOPE (GẬP THƯ MƯỢT MÀ) ────────────────────────────────

  foldBackEnvelope() {
    if (!this.isOpen) return;

    const envelopeArea = this.element.querySelector('#envelope-area');
    const envelopeWrapper = this.element.querySelector('#envelope-wrapper');
    const draggableSheet = this.element.querySelector('#draggable-letter-sheet');
    const readingCard = this.element.querySelector('#letter-reading-card');
    const stage5Panel = this.element.querySelector('#stage5-panel');

    if (stage5Panel) stage5Panel.style.display = 'none';

    gsap.to(readingCard, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        if (readingCard) readingCard.style.display = 'none';
        this.currentPageIndex = 0;

        if (envelopeArea) {
          envelopeArea.style.display = 'flex';
          gsap.fromTo(envelopeArea,
            { opacity: 0, scale: 0.92 },
            { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' }
          );
        }

        if (draggableSheet) {
          draggableSheet.style.transform = '';
          draggableSheet.style.opacity = '1';
        }
        envelopeWrapper?.classList.remove('is-unsealed');
        this.isOpen = false;
        this.currentPullY = 0;
      },
    });
  }

  // ─── DESTROY & CLEANUP ─────────────────────────────────────────────────────

  destroy(onComplete) {
    if (this._pointerMoveBound) window.removeEventListener('pointermove', this._pointerMoveBound);
    if (this._pointerUpBound) window.removeEventListener('pointerup', this._pointerUpBound);
    if (this._pointerCancelBound) window.removeEventListener('pointercancel', this._pointerCancelBound);
    if (this._onResizeBound) window.removeEventListener('resize', this._onResizeBound);
    if (this.backBtn) this.backBtn.destroy();
    if (this.threeAnimId) {
      cancelAnimationFrame(this.threeAnimId);
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