import gsap from 'gsap';
import { birthdayData } from './data/birthdayData.js';
import { GiftScene } from './scenes/GiftScene.js';
import { LetterScreen } from './components/LetterScreen.js';
import { GalaxyScreen } from './components/GalaxyScreen.js';
import { VideoAnniversary } from './components/VideoAnniversary.js';
import { CakeScreen } from './components/CakeScreen.js';
import { spawnMagicBurst } from './utils/magicBurst.js';
import './styles/gift.css';

const canvas = document.getElementById('webgl-canvas');
const uiContainer = document.getElementById('ui-container');
const loadingScreen = document.getElementById('loading-screen');
const appContainer = document.getElementById('app');
const burstLayer = document.getElementById('magic-burst');

let cakeScreen = null;
let giftScene = null;
let letterScreen = null;
let galaxyScreen = null;
// Thay TimelineScreen bằng VideoAnniversary
let videoScreen = null;

function setStage(name) {
  document.body.dataset.stage = name;
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
      <div class="gift-badge">✦ FOR MY BELOVED ✦</div>
      <h1 class="gift-subtitle">${birthdayData.giftScene.subtitle}</h1>
      <span class="gift-recipient-tag">${birthdayData.recipient.nickname}</span>
    </header>
    <footer class="gift-footer" id="gift-footer" style="opacity: 0;">
      <button class="btn-open-gift interactive-ui" id="btn-open-gift" aria-label="Chạm vào hộp quà để mở">
        <span class="btn-sparkle">✨</span>
        <span class="btn-text">${birthdayData.giftScene.openButtonText}</span>
      </button>
      <div class="gift-hint-text">Chạm vào hộp quà để mở • Giữ và kéo để xoay ♡</div>
    </footer>
  `;

  const openBtn = document.getElementById('btn-open-gift');
  if (openBtn) openBtn.addEventListener('click', handleOpenGift);
}

function handleOpenGift() {
  if (!giftScene || giftScene.isOpening) return;

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
      // Dọn dẹp videoScreen nếu người dùng quay lại
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

      setStage('video-cinema'); // Cập nhật stage thành tên mới cho phù hợp

      // Khởi tạo VideoAnniversary thay vì TimelineScreen
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
      // Phá hủy VideoAnniversary khi replay
      if (videoScreen) { videoScreen.destroy(); videoScreen = null; }

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
  if (e.detail && e.detail.screen === 'final-message') { // hoặc 'cake-screen' tùy bạn định nghĩa
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
      // Dọn dẹp videoScreen
      if (videoScreen) {
        videoScreen.destroy();
        videoScreen = null;
      }

      setStage('cake-ceremony');

      // Khởi tạo CakeScreen
      cakeScreen = new CakeScreen(appContainer, {
        onComplete: () => {
          console.log("Xong màn bánh kem, chuyển màn cuối...");
          // Gọi hàm chuyển màn hình cuối tại đây
        }
      });
      cakeScreen.mount();

      // Mở màn
      gsap.to(flash, { opacity: 0, duration: 0.8, ease: 'power2.out' });
    },
  });
}
window.addEventListener('DOMContentLoaded', () => {
  setStage('gift');
  initGiftScene();
  renderGiftUI();

  window.setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      window.setTimeout(() => { loadingScreen.style.display = 'none'; }, 700);
    }
    if (giftScene) giftScene.playEntranceAnimation(() => revealUIWithLanding());
  }, 520);
});