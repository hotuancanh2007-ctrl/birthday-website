import gsap from 'gsap';
import { birthdayData } from './data/birthdayData.js';
import { GiftScene } from './scenes/GiftScene.js';
import { LetterScreen } from './components/LetterScreen.js';
import { GalaxyScreen } from './components/GalaxyScreen.js';
import { VideoAnniversary } from './components/VideoAnniversary.js';
import { CakeScreen } from './components/CakeScreen.js';
import { spawnMagicBurst } from './utils/magicBurst.js';
import './styles/gift.css';

// ----------------------------------------------------
// 1. Cấu hình Audio & Nhạc nền
// ----------------------------------------------------
// Đổi đường dẫn '/bgm.mp3' thành đường dẫn file nhạc của bạn
const bgm = new Audio('./assets/audio/No One Noticed.mp3');
bgm.loop = true;      // Lặp lại bài hát
bgm.volume = 0.5;     // Âm lượng từ 0.0 đến 1.0

let isMusicPlaying = false;

// Hàm bật / tắt nhạc
function toggleMusic() {
  const btn = document.getElementById('music-toggle-btn');
  if (bgm.paused) {
    bgm.play().then(() => {
      isMusicPlaying = true;
      if (btn) btn.classList.add('playing');
    }).catch((err) => console.log('Chưa thể phát nhạc:', err));
  } else {
    bgm.pause();
    isMusicPlaying = false;
    if (btn) btn.classList.remove('playing');
  }
}

// Tự động phát nhạc ở lượt chạm / click đầu tiên của người dùng
function setupAutoPlayOnInteraction() {
  const startAudio = () => {
    if (bgm.paused && !isMusicPlaying) {
      bgm.play().then(() => {
        isMusicPlaying = true;
        const btn = document.getElementById('music-toggle-btn');
        if (btn) btn.classList.add('playing');
      }).catch(() => { });
    }
    // Gỡ bỏ sự kiện sau lần tương tác đầu tiên
    window.removeEventListener('click', startAudio);
    window.removeEventListener('touchstart', startAudio);
  };

  window.addEventListener('click', startAudio);
  window.addEventListener('touchstart', startAudio);
}

// Tạo nút điều khiển nhạc dạng đĩa quay / icon nổi góc màn hình
function createMusicButton() {
  if (document.getElementById('music-toggle-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'music-toggle-btn';
  btn.className = 'music-toggle-btn';
  btn.setAttribute('aria-label', 'Bật / Tắt nhạc');
  btn.innerHTML = '🎵';

  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Tránh kích hoạt các sự kiện click khác trên màn hình
    toggleMusic();
  });

  document.body.appendChild(btn);
}
// ----------------------------------------------------

const canvas = document.getElementById('webgl-canvas');
const uiContainer = document.getElementById('ui-container');
const loadingScreen = document.getElementById('loading-screen');
const appContainer = document.getElementById('app');
const burstLayer = document.getElementById('magic-burst');

let cakeScreen = null;
let giftScene = null;
let letterScreen = null;
let galaxyScreen = null;
let videoScreen = null;

function setStage(name) {
  document.body.dataset.stage = name;
}

function handleGlobalResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (canvas && giftScene && document.body.dataset.stage === 'gift') {
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    if (giftScene.onWindowResize) {
      giftScene.onWindowResize();
    }
  }
}

function initGiftScene() {
  try {
    giftScene = new GiftScene(canvas);
    giftScene.onBoxClick = () => handleOpenGift();
  } catch (err) {
    console.error('Lỗi khi khởi tạo GiftScene:', err);
  }
}

function renderGiftUI() {
  if (!uiContainer) return;

  uiContainer.innerHTML = `
    <div class="gift-atmosphere" aria-hidden="true">
      <span class="haze haze-a"></span>
      <span class="haze haze-b"></span>
      <span class="haze haze-c"></span>
      <span class="css-cloud c1"></span>
      <span class="css-cloud c2"></span>
      <span class="css-cloud c3"></span>
      <span class="twinkle t1">✦</span>
      <span class="twinkle t2">✧</span>
      <span class="twinkle t3">♡</span>
    </div>
    <header class="gift-header" id="gift-header" style="opacity: 0;">
      <div class="gift-badge"> Meoooooooo </div>
      <h1 class="gift-subtitle">${birthdayData.giftScene.subtitle}</h1>
      <span class="gift-recipient-tag">${birthdayData.recipient.nickname}</span>
    </header>
    <footer class="gift-footer" id="gift-footer" style="opacity: 0;">
      <button class="btn-open-gift interactive-ui" id="btn-open-gift" aria-label="Chạm vào hộp quà để mở♡♡♡">
        <span class="btn-sparkle"></span>
        <span class="btn-text">${birthdayData.giftScene.openButtonText}</span>
      </button>
    </footer>
  `;

  const openBtn = document.getElementById('btn-open-gift');
  if (openBtn) openBtn.addEventListener('click', handleOpenGift);
}

function handleOpenGift() {
  if (!giftScene || giftScene.isOpening) return;

  // Đảm bảo phát nhạc khi người dùng bấm nút mở quà
  if (bgm.paused) {
    bgm.play().then(() => {
      isMusicPlaying = true;
      const btn = document.getElementById('music-toggle-btn');
      if (btn) btn.classList.add('playing');
    }).catch(() => { });
  }

  spawnMagicBurst(burstLayer, 20);

  const header = document.getElementById('gift-header');
  const footer = document.getElementById('gift-footer');

  gsap.to([header, footer], {
    opacity: 0,
    y: -16,
    duration: 0.55,
    ease: 'power2.in',
    onComplete: () => {
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
    },
  });

  giftScene.openGiftBox(() => {
    transitionToLetterScreen();
  });
}

function transitionToLetterScreen() {
  if (canvas) canvas.style.display = 'none';
  if (giftScene) giftScene.pause();
  if (uiContainer) uiContainer.innerHTML = '';

  setStage('letter');
  letterScreen = new LetterScreen(appContainer, {
    onReplay: handleReplayAll,
    onContinue: transitionToGalaxyScreen,
  });
  letterScreen.mount();

  const flash = document.getElementById('cinematic-flash');
  if (flash) gsap.to(flash, { opacity: 0, duration: 0.85, ease: 'power2.out' });
}

function transitionToGalaxyScreen() {
  const flash = document.getElementById('cinematic-flash');

  gsap.to(flash, {
    opacity: 1,
    duration: 0.42,
    ease: 'power2.in',
    onComplete: () => {
      if (letterScreen) {
        letterScreen.destroy();
        letterScreen = null;
      }
      if (videoScreen) {
        videoScreen.destroy();
        videoScreen = null;
      }

      setStage('galaxy');
      galaxyScreen = new GalaxyScreen(appContainer, {
        onContinue: handleGalaxyContinue,
        onReplay: handleReplayAll,
      });
      galaxyScreen.mount();
      gsap.to(flash, { opacity: 0, duration: 0.9, ease: 'power2.out' });
    },
  });
}

function handleGalaxyContinue() {
  const flash = document.getElementById('cinematic-flash');
  gsap.to(flash, {
    opacity: 1,
    duration: 0.45,
    ease: 'power2.in',
    onComplete: () => {
      if (galaxyScreen) {
        galaxyScreen.destroy();
        galaxyScreen = null;
      }

      setStage('video-cinema');

      // Tùy chọn: Tạm dừng nhạc nền khi trình chiếu video kỷ niệm nếu video có âm thanh riêng
      // bgm.pause();

      videoScreen = new VideoAnniversary();
      videoScreen.mount(appContainer);

      gsap.to(flash, { opacity: 0, duration: 0.8, ease: 'power2.out' });
    },
  });
}

function handleReplayAll() {
  const flash = document.getElementById('cinematic-flash');

  gsap.to(flash, {
    opacity: 1,
    duration: 0.42,
    ease: 'power2.in',
    onComplete: () => {
      if (letterScreen) { letterScreen.destroy(); letterScreen = null; }
      if (galaxyScreen) { galaxyScreen.destroy(); galaxyScreen = null; }
      if (videoScreen) { videoScreen.destroy(); videoScreen = null; }
      if (cakeScreen) { cakeScreen.destroy(); cakeScreen = null; }

      setStage('gift');
      if (canvas) canvas.style.display = 'block';
      if (giftScene) {
        giftScene.resume();
        giftScene.resetGiftBox();
      }
      renderGiftUI();

      gsap.to(flash, {
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out',
        delay: 0.1,
        onComplete: () => {
          if (giftScene) giftScene.playEntranceAnimation(() => revealUIWithLanding());
        },
      });
    },
  });
}

function revealUIWithLanding() {
  const header = document.getElementById('gift-header');
  const footer = document.getElementById('gift-footer');
  if (header && footer) {
    header.style.display = 'block';
    footer.style.display = 'flex';
    footer.style.flexDirection = 'column';
    footer.style.alignItems = 'center';
    gsap.to([header, footer], {
      opacity: 1,
      y: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: 'power2.out',
    });
  }
}

window.addEventListener('change-screen', (e) => {
  if (e.detail && e.detail.screen === 'final-message') {
    transitionToCakeScreen();
  }
});

function transitionToCakeScreen() {
  const flash = document.getElementById('cinematic-flash');

  gsap.to(flash, {
    opacity: 1,
    duration: 0.45,
    ease: 'power2.in',
    onComplete: () => {
      if (videoScreen) {
        videoScreen.destroy();
        videoScreen = null;
      }

      setStage('cake-ceremony');

      cakeScreen = new CakeScreen(appContainer, {
        onComplete: () => {
          handleReplayAll();
        }
      });
      cakeScreen.mount();

      gsap.to(flash, { opacity: 0, duration: 0.8, ease: 'power2.out' });
    },
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setStage('gift');
  initGiftScene();
  renderGiftUI();

  // Khởi tạo nút nhạc và đăng ký tự động phát nhạc khi chạm màn hình
  createMusicButton();
  setupAutoPlayOnInteraction();

  window.addEventListener('resize', handleGlobalResize);
  window.addEventListener('orientationchange', handleGlobalResize);

  window.setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      window.setTimeout(() => { loadingScreen.style.display = 'none'; }, 700);
    }
    if (giftScene) giftScene.playEntranceAnimation(() => revealUIWithLanding());
  }, 520);
});