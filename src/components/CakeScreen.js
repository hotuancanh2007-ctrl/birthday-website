import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// =============================================================================
// 1. CONSTANTS & HELPER BOTANICAL BOTANY FUNCTIONS (2D Canvas)
// =============================================================================
const COLOR_PALETTES = {
    sweetBlush: ['#fde8ef', '#f8bacd', '#e87d9a', '#c64b70', '#8c2443'],
    pastelPink: ['#fef0f5', '#f7c5d9', '#e38cb0', '#be5782', '#7d264f'],
    creamPeach: ['#fff5ed', '#fcdac2', '#f3a886', '#d66e52', '#8a3522'],
    pearlVintage: ['#fbf6f0', '#ebd8cb', '#ceaa97', '#a17462', '#633d31'],
    berryRomance: ['#fbe8f0', '#e8a2c0', '#c25885', '#96285a', '#540d2d'],
    paleGreen: ['#f4f8f3', '#d0e3cf', '#9cbfa0', '#638b69', '#37523c'],
    skyBlue: ['#f0f7fd', '#c3e0f7', '#81b4df', '#457cb4', '#204778'],
    pearlWhite: ['#ffffff', '#f5f3f0', '#ded9d2', '#b5aba0', '#6e655c']
};

function drawBotanicalLeaf(ctx, x, y, angle, length, width) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const grad = ctx.createLinearGradient(0, -width / 2, 0, width / 2);
    grad.addColorStop(0, '#8eb08a');
    grad.addColorStop(0.5, '#60825f');
    grad.addColorStop(1, '#3a5839');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.4, -width, length, 0);
    ctx.quadraticCurveTo(length * 0.4, width, 0, 0);
    ctx.fill();
    ctx.strokeStyle = '#a4c7a0';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length * 0.9, 0);
    ctx.stroke();
    ctx.restore();
}

function createRoseBudSprite({ paletteKey = 'sweetBlush' }) {
    const radius = 24;
    const logicalSize = radius * 2.4;
    const canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = logicalSize * dpr;
    canvas.height = logicalSize * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.translate(logicalSize / 2, logicalSize / 2);

    const colors = COLOR_PALETTES[paletteKey] || COLOR_PALETTES.sweetBlush;

    for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 3);
        drawBotanicalLeaf(ctx, 0, 5, -Math.PI / 2, radius * 0.9, 8);
        ctx.restore();
    }

    ctx.fillStyle = colors[2];
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(-2, -2, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    return { canvas, radius, logicalSize };
}

function createRealisticRoseSprite({ radius = 46, paletteKey = 'sweetBlush', seed = 2010 }) {
    const logicalSize = radius * 2.8;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const colors = COLOR_PALETTES[paletteKey] || COLOR_PALETTES.sweetBlush;

    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = logicalSize * dpr;
    baseCanvas.height = logicalSize * dpr;
    const baseCtx = baseCanvas.getContext('2d');
    baseCtx.scale(dpr, dpr);
    baseCtx.translate(logicalSize / 2, logicalSize / 2);

    for (let i = 0; i < 7; i++) {
        const angle = (i * Math.PI * 2) / 7 + (seed % 10) * 0.05;
        baseCtx.save();
        baseCtx.rotate(angle);
        const petalGrad = baseCtx.createRadialGradient(0, 0, 2, 0, -radius * 0.6, radius * 0.8);
        petalGrad.addColorStop(0, colors[1]);
        petalGrad.addColorStop(0.7, colors[0]);
        petalGrad.addColorStop(1, colors[2]);
        baseCtx.fillStyle = petalGrad;
        baseCtx.beginPath();
        baseCtx.ellipse(0, -radius * 0.45, radius * 0.42, radius * 0.55, 0, 0, Math.PI * 2);
        baseCtx.fill();
        baseCtx.restore();
    }

    const whorlCanvases = [0.8, 0.6, 0.4, 0.25].map((scaleFactor, layerIdx) => {
        const wCanvas = document.createElement('canvas');
        wCanvas.width = logicalSize * dpr;
        wCanvas.height = logicalSize * dpr;
        const wCtx = wCanvas.getContext('2d');
        wCtx.scale(dpr, dpr);
        wCtx.translate(logicalSize / 2, logicalSize / 2);

        const count = 5 - layerIdx;
        const cIndex = Math.min(colors.length - 1, layerIdx + 1);

        for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count + layerIdx * 0.5;
            wCtx.save();
            wCtx.rotate(angle);
            const petalGrad = wCtx.createRadialGradient(0, 0, 1, 0, -radius * scaleFactor * 0.4, radius * scaleFactor);
            petalGrad.addColorStop(0, colors[cIndex]);
            petalGrad.addColorStop(1, colors[Math.min(colors.length - 1, cIndex + 1)]);
            wCtx.fillStyle = petalGrad;
            wCtx.beginPath();
            wCtx.ellipse(0, -radius * scaleFactor * 0.35, radius * scaleFactor * 0.35, radius * scaleFactor * 0.45, 0, 0, Math.PI * 2);
            wCtx.fill();
            wCtx.restore();
        }
        return wCanvas;
    });

    return { baseCanvas, whorlCanvases, radius, logicalSize };
}

function softenPetals(source, logicalSize, radius) {
    const image = document.createElement('canvas');
    image.width = source.width;
    image.height = source.height;
    const c = image.getContext('2d');
    const pixelRatio = source.width / logicalSize;

    // Safari Compatibility Check for Canvas Filter
    if ('filter' in c) {
        c.globalAlpha = 0.3;
        c.filter = `blur(${radius * 0.13 * pixelRatio}px) brightness(1.35)`;
        c.drawImage(source, 0, 0);
        c.globalAlpha = 1;
        c.filter = `blur(${radius * 0.009 * pixelRatio}px) brightness(1.06)`;
        c.drawImage(source, 0, 0);
    } else {
        // Fallback for older Safari iOS without 2D Context Filter
        c.globalAlpha = 0.85;
        c.drawImage(source, 0, 0);
        c.globalAlpha = 1.0;
        c.drawImage(source, 0, 0);
    }
    return image;
}

function prepareRose(config) {
    const rose = createRealisticRoseSprite(config);
    rose.whorlCanvases = rose.whorlCanvases.map(layer => softenPetals(layer, rose.logicalSize, rose.radius));
    const openCanvas = document.createElement('canvas');
    openCanvas.width = rose.baseCanvas.width;
    openCanvas.height = rose.baseCanvas.height;
    const c = openCanvas.getContext('2d');
    c.drawImage(rose.baseCanvas, 0, 0);
    rose.whorlCanvases.forEach(layer => c.drawImage(layer, 0, 0));
    return { ...rose, openCanvas };
}

// =============================================================================
// 2. SHARED HELPERS
// =============================================================================
const clamp01 = n => Math.max(0, Math.min(1, n));
const easeOutCubic = n => 1 - Math.pow(1 - clamp01(n), 3);
const easeOutBack = n => {
    const c1 = 2.5, c3 = c1 + 1, x = clamp01(n) - 1;
    return 1 + c3 * Math.pow(x, 3) + c1 * Math.pow(x, 2);
};
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

const FLOOR_Y = -1.8;
const GROW_SECONDS = 7.6;
const WISH_SECONDS = 5;
const GROW_STAGES = [
    [0, 'Từ một bông hoa, cả khu vườn đang thức giấc…'],
    [0.3, 'Từng nụ hồng đang hé nở…'],
    [0.65, 'Gió mang cánh hoa bay lên trời xanh…']
];

function toSRGB(texture) {
    if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function radialTexture(stops, size = 128) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => grad.addColorStop(o, col));
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return toSRGB(new THREE.CanvasTexture(c));
}

function skyTexture() {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 512;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#c5b0ee');
    grad.addColorStop(0.5, '#f2b5d0');
    grad.addColorStop(1, '#ffd8c6');
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 512);
    return toSRGB(new THREE.CanvasTexture(c));
}

function heartPath(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s * 1.1, -s * 0.3, -s * 0.5, -s * 1.1, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.5, -s * 1.1, s * 1.1, -s * 0.3, 0, s * 0.35);
    ctx.closePath();
}

// =============================================================================
// 3. STYLES (ENHANCED FOR SAFARI & MOBILE RESPONSIVENESS)
// =============================================================================
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=Quicksand:wght@500;600;700&display=swap';

const STYLES = `
#cake-screen-wrapper {
    --ink: #6b2f48; --muted: #9a6a7e; --rose: #e0658c; --rose-deep: #b83e68;
    --glass: rgba(255,255,255,.5); --glass-line: rgba(255,255,255,.78);
    --ease: cubic-bezier(.22,1,.36,1);
    --font-ui: "Quicksand", "Nunito", system-ui, sans-serif;
    --font-letter: "Playfair Display", "Noto Serif", serif;
    --font-script: "Great Vibes", "Vibes", cursive;
    position: fixed; inset: 0; width: 100vw; 
    height: 100vh; height: 100dvh; height: -webkit-fill-available;
    overflow: hidden; z-index: 10;
    font-family: var(--font-ui); color: var(--ink);
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
    touch-action: none;
    -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent;
}
#cake-screen-wrapper *, #cake-screen-wrapper *::before, #cake-screen-wrapper *::after { box-sizing: border-box; }
#cake-screen-wrapper [hidden] { display: none !important; }

/* ---------- Glass & buttons ---------- */
#cake-screen-wrapper .cs-glass {
    background: var(--glass);
    border: 1px solid var(--glass-line);
    -webkit-backdrop-filter: blur(16px) saturate(1.5);
    backdrop-filter: blur(16px) saturate(1.5);
    box-shadow: 0 18px 44px -20px rgba(184,62,104,.4), inset 0 1px 0 rgba(255,255,255,.7);
    -webkit-transform: translateZ(0); transform: translateZ(0);
}
#cake-screen-wrapper .cs-btn {
    position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    border: 0; cursor: pointer; overflow: hidden; padding: 14px 28px; border-radius: 999px;
    font: 700 clamp(13px, 1.8vw, 16px)/1 var(--font-ui); letter-spacing: .02em; color: #fff;
    background: linear-gradient(135deg, #ff8fb1 0%, #e0658c 55%, #c64b70 100%);
    box-shadow: 0 12px 28px -10px rgba(198,75,112,.7), inset 0 1px 0 rgba(255,255,255,.55);
    transition: transform .4s var(--ease), box-shadow .4s var(--ease);
    -webkit-transform: translateZ(0); transform: translateZ(0);
}
#cake-screen-wrapper .cs-btn::after {
    content: ""; position: absolute; inset: 0; translate: -130% 0;
    background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.6) 50%, transparent 70%);
    transition: translate .9s var(--ease);
}
#cake-screen-wrapper .cs-btn:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 18px 34px -10px rgba(198,75,112,.75), inset 0 1px 0 rgba(255,255,255,.6); }
#cake-screen-wrapper .cs-btn:hover::after { translate: 130% 0; }
#cake-screen-wrapper .cs-btn:active { transform: scale(.96); }
#cake-screen-wrapper .cs-btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; box-shadow: 0 0 0 7px rgba(224,101,140,.45); }
#cake-screen-wrapper .cs-btn--pulse { animation: cs-pulse 2.6s ease-in-out infinite; }
#cake-screen-wrapper .cs-btn--soft { background: rgba(255,255,255,.7); color: var(--rose-deep); box-shadow: 0 10px 24px -12px rgba(184,62,104,.5), inset 0 1px 0 #fff; }
#cake-screen-wrapper .cs-btn--ghost { background: rgba(255,255,255,.12); border: 1.5px solid rgba(255,255,255,.7); box-shadow: none; color: #ffe9f1; }
#cake-screen-wrapper .cs-btn--ghost:hover { background: rgba(255,255,255,.24); }

/* ---------- Garden (screen 1) ---------- */
#cake-screen-wrapper .cs-garden {
    position: absolute; inset: 0; z-index: 20; overflow: hidden; isolation: isolate;
    background:
        radial-gradient(60vmax 60vmax at 88% -6%, #fff7da 0%, rgba(255,247,218,0) 55%),
        radial-gradient(80vmax 50vmax at 8% 100%, rgba(255,214,230,.55), transparent 60%),
        linear-gradient(180deg, #a8d5f2 0%, #c8e5f7 30%, #eaf3f8 58%, #f7eaf0 78%, #eef6e6 100%);
}
#cake-screen-wrapper .cs-garden::after {
    content: ""; position: absolute; inset: 0; z-index: -2; pointer-events: none; opacity: 0; transition: opacity 4s;
    background: radial-gradient(ellipse at 50% 112%, rgba(215,232,202,.75), transparent 58%);
}
#cake-screen-wrapper .cs-garden.is-growing::after { opacity: 1; }
#cake-screen-wrapper .cs-rays {
    position: absolute; top: -45vmax; right: -45vmax; width: 100vmax; height: 100vmax; z-index: -3; pointer-events: none; opacity: .55;
    background: repeating-conic-gradient(rgba(255,255,255,.32) 0 5deg, transparent 5deg 17deg);
    -webkit-mask-image: radial-gradient(circle, #000 0%, transparent 62%); mask-image: radial-gradient(circle, #000 0%, transparent 62%);
    animation: cs-spin 140s linear infinite;
}
#cake-screen-wrapper #flowers { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; }

#cake-screen-wrapper .cs-header {
    position: absolute; top: max(16px, env(safe-area-inset-top)); left: clamp(12px, 4vw, 64px); right: clamp(12px, 4vw, 64px);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; pointer-events: none; z-index: 5;
}
#cake-screen-wrapper .cs-dedication {
    margin: 0; padding: 10px 18px; border-radius: 999px; font: italic 500 clamp(12px, 1.6vw, 18px)/1.4 var(--font-letter);
    animation: cs-rise .9s var(--ease) .15s both;
}
#cake-screen-wrapper .cs-date { display: flex; align-items: center; gap: 10px; margin: 0; padding: 6px 16px 6px 6px; border-radius: 22px; animation: cs-rise .9s var(--ease) .3s both; }
#cake-screen-wrapper .cs-date b {
    display: grid; place-items: center; min-width: 48px; height: 42px; padding: 0 6px; border-radius: 14px; color: #fff;
    font: 600 15px/1 var(--font-letter); background: linear-gradient(145deg, #ff9fbd, #e0658c); box-shadow: 0 8px 18px -8px rgba(198,75,112,.8);
}
#cake-screen-wrapper .cs-date span { font-size: 11px; font-weight: 700; line-height: 1.35; color: var(--muted); text-align: left; }

#cake-screen-wrapper .cs-intro {
    position: absolute; left: 20px; right: 20px; top: clamp(80px, 16vh, 168px); text-align: center; pointer-events: none;
    transition: opacity .8s var(--ease), transform .8s var(--ease), filter .8s var(--ease); z-index: 5;
}
#cake-screen-wrapper .cs-eyebrow {
    display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .16em;
    text-transform: uppercase; color: var(--rose-deep); animation: cs-rise .9s var(--ease) .45s both;
}
#cake-screen-wrapper .cs-intro h1 {
    margin: 12px 0 0; font: 500 clamp(26px, 5vw, 56px)/1.25 var(--font-letter); animation: cs-rise 1s var(--ease) .6s both;
    background: linear-gradient(120deg, #8c2f55, #d6527c 45%, #f08aa6);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
}
#cake-screen-wrapper .cs-intro p { margin: 10px 0 0; font-size: clamp(12px, 1.5vw, 16px); font-weight: 600; color: var(--muted); animation: cs-rise 1s var(--ease) .78s both; }
#cake-screen-wrapper .cs-garden.is-growing .cs-intro { opacity: 0; transform: translateY(-16px); filter: blur(6px); }

#cake-screen-wrapper .cs-bloom {
    position: absolute; left: 50%; top: 48%; translate: -50% -50%; width: clamp(130px, 22vmin, 220px); aspect-ratio: 1;
    border: 0; border-radius: 50%; background: transparent; cursor: pointer; outline: none; z-index: 10;
    transition: opacity .6s var(--ease), scale .6s var(--ease);
}
#cake-screen-wrapper .cs-bloom::before, #cake-screen-wrapper .cs-bloom::after {
    content: ""; position: absolute; inset: 8%; border-radius: 50%; border: 1.5px solid rgba(224,101,140,.55);
    animation: cs-ripple 2.8s var(--ease) infinite;
}
#cake-screen-wrapper .cs-bloom::after { animation-delay: 1.4s; }
#cake-screen-wrapper .cs-bloom:focus-visible { box-shadow: 0 0 0 4px rgba(224,101,140,.55); }
#cake-screen-wrapper .cs-bloom.is-gone { opacity: 0; scale: 1.25; pointer-events: none; }
#cake-screen-wrapper .cs-tap {
    position: absolute; left: 50%; bottom: -6px; translate: -50% 0; white-space: nowrap; padding: 8px 15px; border-radius: 999px;
    font-size: 11.5px; font-weight: 700; color: var(--rose-deep); animation: cs-float 3.2s ease-in-out infinite;
}

#cake-screen-wrapper .cs-dock {
    position: absolute; 
    left: 0; right: 0; margin: 0 auto; /* Căn giữa chuẩn Safari */
    bottom: max(18px, env(safe-area-inset-bottom)); 
    width: min(92vw, 440px); 
    padding: 16px 18px; border-radius: 28px; text-align: center; opacity: 0; pointer-events: none; z-index: 15;
    transform: translateY(28px);
    transition: opacity .8s var(--ease), transform .8s var(--ease);
}
#cake-screen-wrapper .cs-garden.is-growing .cs-dock { 
    opacity: 1; 
    transform: translateY(0); 
}
#cake-screen-wrapper .cs-garden.is-ready .cs-dock { pointer-events: auto; }
#cake-screen-wrapper .cs-status { margin: 0; min-height: 1.5em; font: italic 500 clamp(13px, 1.8vw, 17px)/1.5 var(--font-letter); }
#cake-screen-wrapper .cs-status.is-swap { animation: cs-rise .6s var(--ease) both; }
#cake-screen-wrapper .cs-bar { height: 6px; margin-top: 12px; border-radius: 99px; overflow: hidden; background: rgba(224,101,140,.18); transition: opacity .5s, height .5s, margin .5s; }
#cake-screen-wrapper .cs-bar i {
    display: block; height: 100%; border-radius: inherit; transform-origin: left; transform: scaleX(var(--p, 0));
    background: linear-gradient(90deg, #ffb3c8, #e0658c, #ffb3c8); background-size: 200% 100%; animation: cs-sheen 2s linear infinite;
}
#cake-screen-wrapper .cs-garden.is-ready .cs-bar { opacity: 0; height: 0; margin: 0; }
#cake-screen-wrapper .cs-next-wrap { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows .7s var(--ease), opacity .6s; }
#cake-screen-wrapper .cs-next-wrap > div { min-height: 0; overflow: hidden; visibility: hidden; padding: 0 8px; }
#cake-screen-wrapper .cs-garden.is-ready .cs-next-wrap { grid-template-rows: 1fr; opacity: 1; }
#cake-screen-wrapper .cs-garden.is-ready .cs-next-wrap > div { visibility: visible; padding: 14px 8px 10px; }

/* ---------- Cake (screen 2) ---------- */
#cake-screen-wrapper .cs-cake { position: absolute; inset: 0; z-index: 10; }
#cake-screen-wrapper .cs-three { position: absolute; inset: 0; }
#cake-screen-wrapper .cs-vignette {
    position: absolute; inset: 0; opacity: 0; pointer-events: none;
    background: radial-gradient(ellipse at 50% 52%, rgba(30,8,40,0) 22%, rgba(30,8,40,.82) 100%);
}
#cake-screen-wrapper .cs-stepper {
    position: absolute; top: max(16px, env(safe-area-inset-top)); left: 50%; translate: -50% 0; padding: 8px 16px; border-radius: 999px;
    font-size: 12px; font-weight: 700; color: var(--rose-deep); white-space: nowrap; pointer-events: none; z-index: 15;
}
#cake-screen-wrapper .cs-panel {
    position: absolute; 
    left: 0; right: 0; margin: 0 auto; /* Căn giữa chuẩn Safari */
    bottom: max(18px, env(safe-area-inset-bottom)); 
    width: min(92vw, 420px);
    padding: 20px 20px 22px; border-radius: 28px; text-align: center; z-index: 15;
}
#cake-screen-wrapper .cs-panel-title { margin: 0; font: 600 clamp(18px, 2.4vw, 22px)/1.35 var(--font-letter); }
#cake-screen-wrapper .cs-panel-sub { margin: 6px 0 14px; font-size: 13px; font-weight: 600; color: var(--muted); }
#cake-screen-wrapper .cs-wish-title { margin: 4px 0 0; font: 400 clamp(32px, 6.5vw, 48px)/1.1 var(--font-script); color: var(--rose-deep); }
#cake-screen-wrapper .cs-ring { position: relative; width: 68px; height: 68px; margin: 0 auto; display: grid; place-items: center; font-size: 24px; }
#cake-screen-wrapper .cs-ring svg { position: absolute; inset: 0; transform: rotate(-90deg); }
#cake-screen-wrapper .cs-ring circle { fill: none; stroke-width: 5; stroke-linecap: round; }
#cake-screen-wrapper .cs-ring .track { stroke: rgba(224,101,140,.2); }
#cake-screen-wrapper .cs-ring .fill { stroke: var(--rose); stroke-dasharray: 213.6; stroke-dashoffset: 213.6; filter: drop-shadow(0 0 6px rgba(224,101,140,.6)); }

#cake-screen-wrapper .cs-finale {
    position: absolute; inset: 0; z-index: 30; display: grid; place-items: center; padding: 16px; opacity: 0; pointer-events: none; overflow: hidden;
    background: radial-gradient(ellipse at 50% 38%, rgba(255,176,205,.5), rgba(120,30,75,.9) 78%);
    -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); transition: opacity 1.2s var(--ease);
}
#cake-screen-wrapper .cs-finale.is-on { opacity: 1; pointer-events: auto; }
#cake-screen-wrapper .cs-finale-card {
    position: relative; width: min(100%, 560px); padding: clamp(24px, 5vw, 46px) clamp(18px, 4vw, 40px); border-radius: 34px; text-align: center; color: #ffe9f1;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.38); box-shadow: 0 34px 80px -24px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.4);
    -webkit-transform: translateZ(0); transform: translateZ(0);
}
#cake-screen-wrapper .cs-finale h2 {
    margin: 0 0 10px; font: 400 clamp(42px, 10vw, 92px)/1.05 var(--font-script); color: transparent;
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
    background-image: linear-gradient(100deg, #fff 0%, #ffd1e1 35%, #fff3c4 55%, #ffd1e1 75%, #fff 100%); background-size: 200% 100%;
    animation: cs-sheen 5s linear infinite; filter: drop-shadow(0 0 18px rgba(255,170,200,.7));
}
#cake-screen-wrapper .cs-finale-sub { margin: 0 0 24px; font: italic 400 clamp(12px, 1.7vw, 16px)/1.6 var(--font-letter); letter-spacing: .12em; color: #ffd9e6; }
#cake-screen-wrapper .cs-fh { position: absolute; bottom: -12%; color: #ff9fbd; opacity: 0; pointer-events: none; animation: cs-heart-up linear infinite; }
#cake-screen-wrapper .cs-confetti { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 50; pointer-events: none; }
#cake-screen-wrapper .cs-flash { position: absolute; inset: 0; z-index: 70; opacity: 0; pointer-events: none; background: radial-gradient(circle, #fff, #ffd6e6); }
#cake-screen-wrapper .cs-iris {
    position: absolute; inset: 0; z-index: 60; display: none; place-items: center;
    -webkit-clip-path: circle(0% at 50% 62%); clip-path: circle(0% at 50% 62%);
    background: radial-gradient(circle at 50% 42%, #ffe9f1, #ffb9d0 55%, #f08aae);
    -webkit-transform: translateZ(0); transform: translateZ(0);
}
#cake-screen-wrapper .cs-iris span { font-size: 64px; animation: cs-spin 6s linear infinite; filter: drop-shadow(0 6px 14px rgba(184,62,104,.4)); }

@keyframes cs-rise { from { opacity: 0; transform: translateY(16px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes cs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes cs-ripple { 0% { transform: scale(.7); opacity: .9; } 100% { transform: scale(1.35); opacity: 0; } }
@keyframes cs-spin { to { transform: rotate(360deg); } }
@keyframes cs-sheen { to { background-position: -200% 0; } }
@keyframes cs-pulse { 0%,100% { box-shadow: 0 12px 28px -10px rgba(198,75,112,.7), 0 0 0 0 rgba(224,101,140,.45), inset 0 1px 0 rgba(255,255,255,.55); } 50% { box-shadow: 0 12px 28px -10px rgba(198,75,112,.7), 0 0 0 14px rgba(224,101,140,0), inset 0 1px 0 rgba(255,255,255,.55); } }
@keyframes cs-heart-up { 0% { transform: translateY(0) scale(.6) rotate(0); opacity: 0; } 12% { opacity: .85; } 100% { transform: translateY(-125vh) scale(1.1) rotate(24deg); opacity: 0; } }

/* =============================================================================
   RESPONSIVE MEDIA QUERIES FOR SMALL/SHORT SCREENS
   ============================================================================= */
@media (max-width: 520px) {
    #cake-screen-wrapper .cs-date span { display: none; }
    #cake-screen-wrapper .cs-date { padding: 5px; }
}

@media (max-height: 680px) {
    #cake-screen-wrapper .cs-intro { top: clamp(65px, 12vh, 110px); }
    #cake-screen-wrapper .cs-intro h1 { font-size: clamp(22px, 4vw, 36px); margin-top: 6px; }
    #cake-screen-wrapper .cs-intro p { display: none; }
    #cake-screen-wrapper .cs-bloom { top: 50%; width: clamp(110px, 18vmin, 160px); }
    #cake-screen-wrapper .cs-dock,
    #cake-screen-wrapper .cs-panel { padding: 12px 16px; bottom: max(10px, env(safe-area-inset-bottom)); }
    #cake-screen-wrapper .cs-panel-title { font-size: 16px; }
    #cake-screen-wrapper .cs-panel-sub { margin: 4px 0 10px; font-size: 12px; }
    #cake-screen-wrapper .cs-wish-title { font-size: clamp(26px, 5vw, 36px); }
    #cake-screen-wrapper .cs-ring { width: 54px; height: 54px; font-size: 20px; }
    #cake-screen-wrapper .cs-btn { padding: 10px 20px; font-size: 13px; }
    #cake-screen-wrapper .cs-finale-card { padding: 20px 16px; }
    #cake-screen-wrapper .cs-finale h2 { font-size: clamp(36px, 8vw, 64px); }
}

@media (max-height: 520px) {
    #cake-screen-wrapper .cs-header { top: 8px; }
    #cake-screen-wrapper .cs-dedication, #cake-screen-wrapper .cs-date { padding: 4px 12px; font-size: 12px; }
    #cake-screen-wrapper .cs-intro { display: none; }
    #cake-screen-wrapper .cs-stepper { top: 8px; font-size: 11px; padding: 4px 12px; }
    #cake-screen-wrapper .cs-dock, #cake-screen-wrapper .cs-panel {
        width: min(92vw, 360px);
        padding: 10px 14px;
    }
}

@media (max-width: 380px) {
    #cake-screen-wrapper .cs-header { left: 8px; right: 8px; gap: 6px; }
    #cake-screen-wrapper .cs-dedication { padding: 8px 12px; font-size: 12px; }
    #cake-screen-wrapper .cs-date b { min-width: 42px; height: 36px; font-size: 13px; }
    #cake-screen-wrapper .cs-btn { padding: 12px 20px; font-size: 13px; }
}

#cake-screen-wrapper.cs-reduced *, #cake-screen-wrapper.cs-reduced *::before, #cake-screen-wrapper.cs-reduced *::after { animation-duration: .001s !important; animation-iteration-count: 1 !important; transition-duration: .001s !important; }
`;

const TEMPLATE = `
    <main class="cs-garden" id="garden">
        <div class="cs-rays" aria-hidden="true"></div>
        <header class="cs-header">
            <p class="cs-dedication cs-glass">Lèeeeee</p>
            <p class="cs-date cs-glass"><b>02/11</b><span>Happy<br>Nhó Bé</span></p>
        </header>
        <canvas id="flowers" aria-hidden="true"></canvas>
        <button class="cs-bloom" id="bloom" type="button" aria-label="Chạm để cả vườn hoa nở" aria-describedby="introHint">
            <span class="cs-tap cs-glass">Chạm nhẹ nè 🌸</span>
        </button>
        <div class="cs-intro" id="intro">
            <span class="cs-eyebrow cs-glass">✿ Em Bé Meooo ✿</span>
            <h1>Yêu Thương = 1🌸</h1>
        </div>
        <section class="cs-dock cs-glass">
            <p class="cs-status" id="status" role="status" aria-live="polite" aria-atomic="true"></p>
            <div class="cs-bar" aria-hidden="true"><i></i></div>
            <div class="cs-next-wrap"><div>
                <button class="cs-btn cs-btn--pulse" id="next-screen-btn" type="button">Nhập Tiệc Nò Gieooo</button>
            </div></div>
        </section>
    </main>

    <div class="cs-cake" id="cake-container" hidden>
        <div class="cs-three" id="cake-three-canvas"></div>
        <div class="cs-vignette" id="cs-vignette" aria-hidden="true"></div>
        <div class="cs-stepper cs-glass" id="cs-stepper">02/11/2009🎂</div>
        <section class="cs-panel cs-glass" id="cake-action-box" aria-label="Điều khiển bánh sinh nhật">
            <div id="cs-ready">
                <p class="cs-panel-title">Ước Xịn Lên Nho Bé</p>
                <p class="cs-panel-sub">1 2 3 hehe</p>
                <button class="cs-btn cs-btn--pulse" id="btn-light-candle" type="button">Thắp Nến Nha Meo 🕯️</button>
            </div>
            <div id="cake-wish" hidden>
                <div class="cs-ring" aria-hidden="true">
                    <svg viewBox="0 0 80 80"><circle class="track" cx="40" cy="40" r="34"/><circle class="fill" id="cs-ring-fill" cx="40" cy="40" r="34"/></svg>
                    <span>🕯️</span>
                </div>
                <p class="cs-wish-title">Bé Cầu Nguyện i</p>
                <p class="cs-panel-sub">Nhắm mắt lại, thì thầm điều ước của bạn…</p>
                <button class="cs-btn cs-btn--soft" id="btn-blow" type="button">Thổi nến 💨</button>
            </div>
        </section>
        <div class="cs-finale" id="finale-overlay" aria-hidden="true">
            <div class="cs-finale-card" id="finale-content">
                <p class="cs-finale-eyebrow">20 · 10</p>
                <h2 id="finale-message">Điều Ước Của Em Sẽ Thành Hiện Thật♡♡♡</h2>
                <p class="cs-finale-sub">Lèeeeeeee</p>
                <button class="cs-btn cs-btn--ghost" id="btn-replay" type="button">Coi Lại Nò ♡</button>
            </div>
        </div>
    </div>
    <canvas class="cs-confetti" id="cs-confetti" aria-hidden="true"></canvas>
    <div class="cs-iris" id="cs-iris" aria-hidden="true"><span>🌸</span></div>
    <div class="cs-flash" id="cs-flash" aria-hidden="true"></div>
`;

// =============================================================================
// 4. MAIN CAKESCREEN COMPONENT
// =============================================================================
export class CakeScreen {
    constructor(parentContainer, callbacks = {}, options = {}) {
        this.parentContainer = parentContainer;
        this.callbacks = callbacks;
        this.container = null;
        this.tweens = [];
        this.prefersReducedMotion = options.respectReducedMotion === true && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // 3D state
        this.isCandleLit = false;
        this.isBlowingOut = false;
        this.flameReady = false;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.bloomPass = null;
        this.animationFrameId = null;
        this.clock = new THREE.Clock();
        this.mouseX = 0;
        this.mouseY = 0;
        this.shake = { x: 0, y: 0 };
        this.cake = { lift: 0 };

        const isMobile = window.innerWidth < 768;
        this.cameraBasePos = new THREE.Vector3(0, isMobile ? 10 : 7, isMobile ? 48 : 35);
        this.camPos = { x: 0, y: 0 };

        this.lights = {};
        this.cakeGroup = new THREE.Group();
        this.candleGroup = new THREE.Group();
        this.gardenGroup = new THREE.Group();
        this.flame = null;
        this.flameGlow = null;

        this.hearts = [];
        this.cats = [];
        this.flowers = [];
        this.butterflies = [];
        this.floatingCats = [];
        this.floatingFlowers = [];
        this.ambientParticles = null;

        // 2D garden state
        this.gardenState = 'idle'; // idle | growing | ready
        this.gardenStartedTime = 0;
        this.gardenPausedAt = 0;
        this.gardenSceneTime = 0;
        this.gardenLastFrame = 0;
        this.gardenAnimationFrameId = null;
        this.gardenPointer = { x: -1000, y: -1000 };
        this.gardenStage = -1;
        this.lastProgress = -1;
        this.bursts = [];
        this.isTransitioning = false;

        this.handleResize = this.onWindowResize.bind(this);
        this.handlePointerMove = this.onPointerMove.bind(this);
        this.handleRender3D = this.render3D.bind(this);
        this.handleRender2D = this.render2D.bind(this);
        this.handleGardenPointerMove = this.onGardenPointerMove.bind(this);
        this.handleGardenPointerLeave = this.onGardenPointerLeave.bind(this);
        this.handleGardenPointerDown = this.onGardenPointerDown.bind(this);
        this.handleGardenPointerUp = e => { if (e.pointerType !== 'mouse') this.onGardenPointerLeave(e); };
        this.handleVisibilityChange = this.onVisibilityChange.bind(this);
    }

    track(t) { this.tweens.push(t); return t; }

    mount() {
        if (!document.getElementById('cake-screen-fonts')) {
            const link = document.createElement('link');
            link.id = 'cake-screen-fonts';
            link.rel = 'stylesheet';
            link.href = FONT_URL;
            document.head.appendChild(link);
        }
        let styleEl = document.getElementById('cake-screen-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'cake-screen-styles';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = STYLES;

        this.container = document.createElement('div');
        this.container.id = 'cake-screen-wrapper';
        this.container.innerHTML = TEMPLATE;
        if (this.prefersReducedMotion) this.container.classList.add('cs-reduced');
        this.parentContainer.appendChild(this.container);

        this.initDOM();
        this.init2DGarden();
        this.bindEvents();
    }

    initDOM() {
        const $ = s => this.container.querySelector(s);
        this.gardenEl = $('#garden');
        this.gardenCanvas = $('#flowers');
        this.gardenCtx = this.gardenCanvas.getContext('2d');
        this.bloomBtn = $('#bloom');
        this.gardenStatus = $('#status');
        this.nextBtn = $('#next-screen-btn');
        this.barFill = $('.cs-bar i');

        this.cakeContainer = $('#cake-container');
        this.threeCanvas = $('#cake-three-canvas');
        this.vignette = $('#cs-vignette');
        this.stepper = $('#cs-stepper');
        this.actionBox = $('#cake-action-box');
        this.readyBlock = $('#cs-ready');
        this.wishBlock = $('#cake-wish');
        this.ringFill = $('#cs-ring-fill');
        this.btnLight = $('#btn-light-candle');
        this.btnBlow = $('#btn-blow');
        this.finaleOverlay = $('#finale-overlay');
        this.finaleCard = $('#finale-content');
        this.btnReplay = $('#btn-replay');
        this.irisEl = $('#cs-iris');
        this.flashEl = $('#cs-flash');
        this.confettiCanvas = $('#cs-confetti');

        gsap.set(this.actionBox, { opacity: 0, y: 28 });
        gsap.set(this.stepper, { opacity: 0 });
    }

    // =========================================================================
    // 5. 2D GARDEN
    // =========================================================================
    init2DGarden() {
        const paletteKeys = Object.keys(COLOR_PALETTES);
        let seed = 2010;
        const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

        this.sprites = paletteKeys.flatMap((paletteKey, i) =>
            [0, 1, 2].map(j => prepareRose({ radius: 46, paletteKey, seed: 2010 + i * 107 + j * 41 }))
        );
        this.heroSprite = prepareRose({ radius: 86, paletteKey: 'sweetBlush', seed: 2010 });
        this.budSprites = paletteKeys.map(paletteKey => {
            const bud = createRoseBudSprite({ paletteKey });
            return { ...bud, canvas: softenPetals(bud.canvas, bud.logicalSize, bud.radius) };
        });

        this.leafCanvas = document.createElement('canvas');
        this.leafCanvas.width = 300;
        this.leafCanvas.height = 200;
        const leafCtx = this.leafCanvas.getContext('2d');
        leafCtx.scale(2, 2);
        drawBotanicalLeaf(leafCtx, 20, 50, 0, 100, 31);

        this.cloudCanvas = document.createElement('canvas');
        this.cloudCanvas.width = 720;
        this.cloudCanvas.height = 360;
        const cloudCtx = this.cloudCanvas.getContext('2d');
        [[125, 164, 92, 0.52], [225, 143, 119, 0.67], [333, 112, 104, 0.81], [420, 141, 111, 0.75],
        [519, 163, 108, 0.61], [600, 174, 75, 0.43], [340, 183, 219, 0.3]].forEach(([x, y, radius, opacity]) => {
            cloudCtx.save();
            cloudCtx.translate(x, y);
            cloudCtx.scale(1, 0.64);
            const puff = cloudCtx.createRadialGradient(0, -radius * 0.12, radius * 0.16, 0, 0, radius);
            puff.addColorStop(0, `rgba(255,255,255,${opacity})`);
            puff.addColorStop(0.48, `rgba(255,255,255,${opacity * 0.87})`);
            puff.addColorStop(0.8, `rgba(255,255,255,${opacity * 0.3})`);
            puff.addColorStop(1, 'rgba(255,255,255,0)');
            cloudCtx.fillStyle = puff;
            cloudCtx.beginPath();
            cloudCtx.arc(0, 0, radius, 0, Math.PI * 2);
            cloudCtx.fill();
            cloudCtx.restore();
        });

        this.clouds = [
            { x: 0.04, y: 0.17, size: 0.42, opacity: 0.82, speed: 2.7 },
            { x: 0.4, y: 0.09, size: 0.32, opacity: 0.67, speed: 3.8 },
            { x: 0.77, y: 0.22, size: 0.43, opacity: 0.78, speed: 2.2 },
            { x: 0.27, y: 0.34, size: 0.29, opacity: 0.52, speed: 4.1 },
            { x: 0.98, y: 0.07, size: 0.25, opacity: 0.59, speed: 3.1 }
        ];

        this.whorlDelays = [0, 0.12, 0.24, 0.34];
        this.closedScales = [0.44, 0.36, 0.28, 0.38];
        this.twistAngles = [0.52, -0.78, 1.05, -1.35];
        this.flowers2D = [];

        for (let row = 0; row < 5; row++) {
            const count = 24 + row * 2;
            for (let i = 0; i < count; i++) {
                const x = (i + random()) / count;
                this.flowers2D.push({
                    x, y: 0.49 + row * 0.092 + (random() - 0.5) * 0.22, depth: row,
                    radius: 17 + row * 5 + random() * 15, stem: 0.18 + random() * 0.22, bend: (random() - 0.5) * 65,
                    phase: random() * Math.PI * 2, rotation: (random() - 0.5) * 0.9,
                    sprite: Math.floor(random() * this.sprites.length),
                    delay: 0.3 + Math.abs(x - 0.5) * 4.2 + row * 0.36 + random() * 0.9,
                    alpha: 0.6 + row * 0.1, tilt: 0.8 + random() * 0.2, offsetX: 0, offsetY: 0, hover: 0
                });
            }
        }
        for (let i = 0; i < 20; i++) {
            const row = Math.floor(i / 4);
            this.flowers2D.push({
                x: (i % 4 + 0.25 + random() * 0.5) / 4, y: 0.45 + row * 0.087 + (random() - 0.5) * 0.065,
                depth: row, radius: 13 + row * 2.5 + random() * 4, stem: 0.2 + random() * 0.15, bend: (random() - 0.5) * 45,
                phase: random() * Math.PI * 2, rotation: (random() - 0.5) * 0.5, bud: true, sprite: (i * 3) % this.budSprites.length,
                delay: 0.6 + random() * 2.4 + row * 0.4, alpha: 0.75 + row * 0.06, tilt: 1, offsetX: 0, offsetY: 0, hover: 0
            });
        }
        this.flowers2D.sort((a, b) => a.depth - b.depth);

        this.petals = Array.from({ length: 18 }, () => ({
            x: random(), y: random(), phase: random() * Math.PI * 2, size: 3 + random() * 4, speed: 9 + random() * 12
        }));
        this.sparkles = Array.from({ length: 30 }, () => ({
            x: random(), y: 0.04 + random() * 0.56, size: 3 + random() * 6, phase: random() * Math.PI * 2, speed: 0.6 + random() * 1.2,
            tint: random() > 0.5 ? '255,255,255' : '255,226,160'
        }));
        this.grass = Array.from({ length: 150 }, () => {
            const x = random();
            return { x, h: 30 + random() * 55, w: 2.5 + random() * 3.5, phase: random() * 6.28, delay: 0.2 + Math.abs(x - 0.5) * 2.6 + random() * 0.8 };
        });
        this.wisps = Array.from({ length: 6 }, (_, i) => ({ y: 0.14 + i * 0.075 + random() * 0.03, speed: 0.00016 + random() * 0.00012, off: random(), len: 150 + random() * 120 }));
        this.hero = { x: 0.5, y: 0.46, radius: 76, stem: 0.25, bend: 5, phase: 0, rotation: -0.15, tilt: 0.95, offsetX: 0, offsetY: 0, hover: 0 };

        this.resize2DCanvas();
    }

    resize2DCanvas() {
        if (!this.gardenEl || !this.gardenCanvas) return;
        const rect = this.gardenEl.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        this.gardenWidth = rect.width;
        this.gardenHeight = rect.height;
        this.gardenScale = Math.min(1.22, Math.max(0.55, Math.min(this.gardenWidth / 1000, this.gardenHeight / 700)));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.gardenCanvas.width = Math.round(this.gardenWidth * dpr);
        this.gardenCanvas.height = Math.round(this.gardenHeight * dpr);
        this.gardenCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.render2DFrame();
    }

    startGarden() {
        if (this.gardenState !== 'idle') return;
        this.gardenState = 'growing';
        this.gardenStartedTime = performance.now();
        this.gardenEl.classList.add('is-growing');
        this.bloomBtn.classList.add('is-gone');
        this.bloomBtn.tabIndex = -1;
        this.container.querySelector('#intro').setAttribute('aria-hidden', 'true');
        this.setStatus(GROW_STAGES[0][1]);
        this.gardenStage = 0;
        this.spawnBurst(this.hero.x * this.gardenWidth, this.hero.y * this.gardenHeight, 34);
        this.hero.vel = 0.1;
        this.render2DFrame();
    }

    finishGarden() {
        this.gardenState = 'ready';
        this.gardenEl.classList.add('is-ready');
        this.setStatus('Umm Moaaa ♡');
        this.barFill.parentElement.style.setProperty('--p', 1);
        [0.1, 0.3, 0.5, 0.7, 0.9].forEach((fx, i) => setTimeout(() => {
            if (this.gardenState === 'ready') this.pushFlowers(this.gardenWidth * fx, this.gardenHeight * 0.7, 0.08, 360);
        }, i * 140));
        [0.25, 0.5, 0.75].forEach((fx, i) => setTimeout(() => {
            if (this.gardenState === 'ready') this.spawnBurst(this.gardenWidth * fx, this.gardenHeight * 0.4, 16);
        }, i * 160));
        setTimeout(() => { if (this.nextBtn && !this.isTransitioning) this.nextBtn.focus({ preventScroll: true }); }, 900);
    }

    setStatus(text) {
        this.gardenStatus.textContent = text;
        this.gardenStatus.classList.remove('is-swap');
        void this.gardenStatus.offsetWidth;
        this.gardenStatus.classList.add('is-swap');
    }

    updateProgress(prog) {
        if (Math.abs(prog - this.lastProgress) < 0.004) return;
        this.lastProgress = prog;
        this.barFill.parentElement.style.setProperty('--p', prog.toFixed(3));
        if (this.gardenState !== 'growing') return;
        let stage = 0;
        GROW_STAGES.forEach(([t], i) => { if (prog >= t) stage = i; });
        if (stage !== this.gardenStage) {
            this.gardenStage = stage;
            this.setStatus(GROW_STAGES[stage][1]);
        }
    }

    pushFlowers(cx, cy, strength = 0.15, radius = 280) {
        if (this.prefersReducedMotion) return;
        const R = radius * this.gardenScale;
        [...this.flowers2D, this.hero].forEach(f => {
            const fx = f.x * this.gardenWidth, fy = f.y * this.gardenHeight;
            const d = Math.hypot(fx - cx, fy - cy);
            if (d < R) f.vel = (f.vel || 0) + Math.sign(fx - cx || 1) * (1 - d / R) * strength;
        });
    }

    spawnBurst(x, y, count = 18) {
        if (this.prefersReducedMotion) return;
        const colors = ['#ffd0df', '#ff9fbd', '#ffffff', '#ffe29a', '#f7c5d9'];
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2, sp = rand(60, 260);
            this.bursts.push({
                x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 140, age: 0, max: rand(1.1, 2),
                size: rand(4, 9), rot: Math.random() * 6, vr: rand(-6, 6), heart: Math.random() < 0.35,
                color: colors[i % colors.length]
            });
        }
    }

    drawBursts2D(delta) {
        if (!this.bursts.length) return;
        const dt = delta / 1000, ctx = this.gardenCtx;
        ctx.save();
        this.bursts = this.bursts.filter(b => (b.age += dt) < b.max);
        this.bursts.forEach(b => {
            b.vy += 300 * dt; b.vx *= 0.99;
            b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - Math.pow(b.age / b.max, 2));
            ctx.translate(b.x, b.y);
            ctx.rotate(b.rot);
            ctx.fillStyle = b.color;
            if (b.heart) { heartPath(ctx, b.size); ctx.fill(); }
            else { ctx.beginPath(); ctx.ellipse(0, 0, b.size * 0.6, b.size, 0, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
        });
        ctx.restore();
    }

    drawGlow2D(time, elapsed) {
        const ctx = this.gardenCtx;
        const hx = this.hero.x * this.gardenWidth, hy = this.hero.y * this.gardenHeight;
        const boost = this.gardenState === 'idle' ? 0.55 : 0.55 + 0.45 * clamp01(elapsed / 2);
        const pulse = this.prefersReducedMotion ? 1 : 1 + Math.sin(time * 0.002) * 0.06;
        const r = 150 * this.gardenScale * (1 + boost * 1.1) * pulse;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, r);
        g.addColorStop(0, `rgba(255,236,244,${0.75 * boost})`);
        g.addColorStop(0.5, `rgba(255,200,222,${0.28 * boost})`);
        g.addColorStop(1, 'rgba(255,200,222,0)');
        ctx.fillStyle = g;
        ctx.fillRect(hx - r, hy - r, r * 2, r * 2);
    }

    drawSparkles2D(time) {
        const ctx = this.gardenCtx;
        ctx.save();
        this.sparkles.forEach(s => {
            const twinkle = this.prefersReducedMotion ? 0.7 : 0.2 + 0.8 * Math.max(0, Math.sin(time * 0.002 * s.speed + s.phase));
            if (twinkle < 0.05) return;
            const px = s.x * this.gardenWidth, py = s.y * this.gardenHeight, r = s.size * twinkle;
            ctx.fillStyle = `rgba(${s.tint},${0.85 * twinkle})`;
            ctx.beginPath();
            ctx.moveTo(px, py - r);
            ctx.quadraticCurveTo(px + r * 0.12, py - r * 0.12, px + r, py);
            ctx.quadraticCurveTo(px + r * 0.12, py + r * 0.12, px, py + r);
            ctx.quadraticCurveTo(px - r * 0.12, py + r * 0.12, px - r, py);
            ctx.quadraticCurveTo(px - r * 0.12, py - r * 0.12, px, py - r);
            ctx.fill();
        });
        ctx.restore();
    }

    drawBotanicalLeaf2D(ctx, x, y, direction, size, flutter) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(direction, 1);
        ctx.rotate(-0.58 + flutter);
        ctx.drawImage(this.leafCanvas, -size * 0.2, -size * 0.5, size * 1.5, size);
        ctx.restore();
    }

    gustAt(time) {
        if (this.prefersReducedMotion) return 0;
        return 0.2 + 0.15 * Math.sin(time * 0.0003) * Math.sin(time * 0.0005 + 1.3);
    }

    updateSway(f, time, dt, riseT) {
        if (this.prefersReducedMotion) { f.ang = 0; f.vel = 0; return 0; }
        const gust = this.gustAt(time);
        const wave = Math.sin(time * 0.0012 - f.x * 4 + (f.depth || 0) * 0.2);
        const flutter = Math.sin(time * 0.0025 + f.phase);

        let target = (wave * 0.035 + flutter * 0.015) * (0.8 + gust) + 0.015 * gust;
        target += (1 - riseT) * Math.sin(time * 0.005 + f.phase) * 0.02;

        const h = Math.min(dt, 50) / 1000;
        f.ang = f.ang || 0;
        f.vel = f.vel || 0;

        f.vel += ((target - f.ang) * 12 - f.vel * 5.5) * h;
        f.ang += f.vel * h;
        return f.ang;
    }

    drawFlower2D(f, growth, time, smoothing, isHero = false, dt = 16.7) {
        if (growth <= 0) return;
        const W = this.gardenWidth, H = this.gardenHeight;
        const riseT = clamp01(growth / 0.72);
        const openT = clamp01((growth - 0.5) / 0.5);
        const rise = easeOutBack(riseT);
        const p = easeOutCubic(riseT);

        const x = f.x * W;
        const targetY = f.y * H;
        const root = H + 140 + f.stem * 60;
        const y = root - (root - targetY) * rise;

        if (riseT >= 1 && !f.arrived) {
            f.arrived = true;
            f.vel = (f.vel || 0) + (Math.sin(f.phase * 7) > 0 ? 1 : -1) * (isHero ? 0.05 : 0.03);
        }
        const ang = this.updateSway(f, time, dt, riseT);

        const r = f.radius * this.gardenScale;
        const len = Math.max(0, H + 40 - y);
        const sway = Math.sin(ang) * len;
        const dx = x - this.gardenPointer.x, dy = y - this.gardenPointer.y;
        const distance = Math.hypot(dx, dy);
        const proximity = !this.prefersReducedMotion ? clamp01(1 - distance / (r * 2.3)) : 0;
        f.offsetX += ((dx / (distance || 1)) * proximity * r * 0.13 - f.offsetX) * smoothing;
        f.offsetY += ((dy / (distance || 1)) * proximity * r * 0.08 - f.offsetY) * smoothing;
        f.hover += (proximity - f.hover) * smoothing;

        const headX = x + sway + f.offsetX;
        const headY = y + (1 - Math.cos(ang)) * len + f.offsetY;
        const baseX = x + f.bend * this.gardenScale;
        const controlX1 = x - f.bend * this.gardenScale + sway * 0.2;
        const controlY1 = root - (root - headY) * 0.4;
        const controlX2 = headX + 8 * this.gardenScale + sway * 0.1;
        const controlY2 = headY + (root - headY) * 0.22;

        const ctx = this.gardenCtx;
        ctx.save();
        ctx.globalAlpha = isHero ? 1 : Math.min(1, f.alpha) * clamp01(riseT * 3);
        const stemColor = ctx.createLinearGradient(baseX - 2, root, headX + 2, headY);
        stemColor.addColorStop(0, '#46664c');
        stemColor.addColorStop(0.5, '#789265');
        stemColor.addColorStop(1, '#587b53');
        ctx.strokeStyle = stemColor;
        ctx.lineWidth = isHero ? 2.8 * this.gardenScale : Math.max(1, r * 0.05);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(baseX, root);
        ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, headX, headY);
        ctx.stroke();

        if (riseT > 0.2) {
            const leafGrow = easeOutCubic((riseT - 0.2) / 0.8);
            (isHero ? [0.58, 0.8] : [0.62, 0.84]).forEach((t, i) => {
                const u = 1 - t;
                const lx = u ** 3 * baseX + 3 * u * u * t * controlX1 + 3 * u * t * t * controlX2 + t ** 3 * headX;
                const ly = u ** 3 * root + 3 * u * u * t * controlY1 + 3 * u * t * t * controlY2 + t ** 3 * headY;
                const length = r * (isHero ? 0.85 : 0.95) * leafGrow;
                const flutter = ang * 1.5 + Math.sin(time * 0.002 + f.phase + i) * (this.prefersReducedMotion ? 0 : 0.02);
                this.drawBotanicalLeaf2D(ctx, lx, ly, i ? -1 : 1, length, flutter);
                if (isHero) this.drawBotanicalLeaf2D(ctx, lx + (i ? -10 : 10) * this.gardenScale, ly - 5 * this.gardenScale, i ? -1 : 1, length * 0.6, -0.5 + flutter * 0.5);
            });
        }
        ctx.translate(headX, headY);
        ctx.rotate(f.rotation + ang * 0.3 + f.offsetX * 0.003);

        const breath = this.prefersReducedMotion ? 1 : 1 + Math.sin(time * 0.0014 + f.phase) * 0.005;
        const s = (0.35 + 0.65 * p) * breath * (1 + f.hover * 0.05);
        ctx.scale(s, f.tilt * s);

        if (f.bud) {
            const bud = this.budSprites[f.sprite];
            const size = (bud.logicalSize * r) / bud.radius;
            ctx.drawImage(bud.canvas, -size / 2, -size / 2, size, size);
            ctx.restore();
            return;
        }

        const rose = isHero ? this.heroSprite : this.sprites[f.sprite];
        const size = (rose.logicalSize * r) / rose.radius;
        if (growth >= 1) {
            ctx.drawImage(rose.openCanvas, -size / 2, -size / 2, size, size);
        } else {
            const o = easeOutCubic(openT);
            ctx.save();
            ctx.scale(0.5 + o * 0.5, 0.5 + o * 0.5);
            ctx.drawImage(rose.baseCanvas, -size / 2, -size / 2, size, size);
            ctx.restore();
            rose.whorlCanvases.forEach((layer, i) => {
                const open = easeOutCubic((openT - this.whorlDelays[i]) / (1 - this.whorlDelays[i]));
                const unfurl = this.closedScales[i] + (1 - this.closedScales[i]) * open;
                ctx.save();
                ctx.rotate((1 - open) * this.twistAngles[i]);
                ctx.scale(unfurl, unfurl * (0.78 + open * 0.22));
                ctx.drawImage(layer, -size / 2, -size / 2, size, size);
                ctx.restore();
            });
        }
        ctx.restore();
    }

    drawGrass2D(elapsed, time) {
        const ctx = this.gardenCtx, W = this.gardenWidth, H = this.gardenHeight, gust = this.gustAt(time);
        const colors = ['#5f8f5a', '#78a86b', '#4a7a4f', '#8fbf7d'];
        this.grass.forEach((b, i) => {
            const grow = this.gardenState === 'idle' ? 0.28 : easeOutBack(clamp01((elapsed - b.delay) / 1.4));
            const h = b.h * this.gardenScale * grow;
            if (h < 1) return;
            const x = b.x * W;
            const lean = this.prefersReducedMotion ? 0 : Math.sin(time * 0.0015 - b.x * 4 + b.phase) * 0.2 + 0.1 * gust;
            const tipX = x + lean * h * 0.9, tipY = H + 4 - h;
            ctx.fillStyle = colors[i % 4];
            ctx.beginPath();
            ctx.moveTo(x - b.w, H + 6);
            ctx.quadraticCurveTo(x - b.w * 0.4 + lean * h * 0.25, H - h * 0.55, tipX, tipY);
            ctx.quadraticCurveTo(x + b.w * 0.6 + lean * h * 0.3, H - h * 0.5, x + b.w, H + 6);
            ctx.fill();
        });
    }

    drawWindWisps2D(time) {
        const gust = this.gustAt(time);
        if (gust < 0.2) return;
        const ctx = this.gardenCtx, W = this.gardenWidth, H = this.gardenHeight;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineWidth = 2.2;
        this.wisps.forEach(w => {
            const prog = (time * w.speed * 3 + w.off) % 1.4 - 0.2;
            const x = prog * (W + w.len), y = w.y * H + Math.sin(time * 0.002 + w.off * 9) * 10;
            const fade = Math.sin(clamp01(prog / 1.2) * Math.PI);
            ctx.strokeStyle = `rgba(255,255,255,${(gust - 0.2) * 0.5 * fade})`;
            ctx.beginPath();
            ctx.moveTo(x - w.len, y);
            ctx.bezierCurveTo(x - w.len * 0.65, y - 16, x - w.len * 0.35, y + 16, x, y - 4);
            ctx.stroke();
        });
        ctx.restore();
    }

    drawPetals2D(elapsed, time) {
        const ctx = this.gardenCtx;
        ctx.save();
        this.petals.forEach(petal => {
            const x = ((petal.x * this.gardenWidth + time * 0.009 + Math.sin(time * 0.0006 + petal.phase) * 35) % (this.gardenWidth + 60)) - 30;
            const y = ((petal.y * this.gardenHeight + time * petal.speed * 0.001) % (this.gardenHeight + 60)) - 30;
            ctx.save();
            ctx.globalAlpha = Math.min(elapsed / 3, 1) * 0.55;
            ctx.translate(x, y);
            ctx.rotate(petal.phase + time * 0.0007);
            ctx.scale(0.55 + Math.abs(Math.sin(time * 0.001 + petal.phase)) * 0.45, 1);
            const color = ctx.createLinearGradient(0, -petal.size, 0, petal.size);
            color.addColorStop(0, '#fff3f7');
            color.addColorStop(1, '#d887a6');
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, -petal.size);
            ctx.bezierCurveTo(petal.size * 1.3, -petal.size, petal.size * 0.8, petal.size * 0.8, 0, petal.size);
            ctx.bezierCurveTo(-petal.size, petal.size * 0.2, -petal.size * 0.6, -petal.size * 0.9, 0, -petal.size);
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();
    }

    drawClouds2D(time) {
        const ctx = this.gardenCtx;
        ctx.save();
        this.clouds.forEach(cloud => {
            const cloudWidth = Math.max(240, this.gardenWidth * cloud.size);
            const travel = this.gardenWidth + cloudWidth * 2;
            const x = ((cloud.x * this.gardenWidth + time * cloud.speed * 0.001 + cloudWidth) % travel) - cloudWidth;
            const y = this.gardenHeight * cloud.y;
            ctx.globalAlpha = cloud.opacity;
            ctx.drawImage(this.cloudCanvas, x - cloudWidth * 0.5, y - cloudWidth * 0.18, cloudWidth, cloudWidth * (this.cloudCanvas.height / this.cloudCanvas.width));
        });
        ctx.restore();
    }

    render2D(time) {
        this.gardenAnimationFrameId = 0;
        const delta = this.gardenLastFrame ? Math.min(50, time - this.gardenLastFrame) : 16.67;
        this.gardenLastFrame = time;
        if (!this.prefersReducedMotion) this.gardenSceneTime += delta;
        const smoothing = this.prefersReducedMotion ? 1 : 1 - Math.exp(-delta / 140);
        const t = this.gardenSceneTime;

        this.gardenCtx.clearRect(0, 0, this.gardenWidth, this.gardenHeight);
        this.drawClouds2D(t);

        const growing = this.gardenState !== 'idle';
        const elapsed = growing ? (time - this.gardenStartedTime) / 1000 : 0;
        const instant = this.prefersReducedMotion && growing;

        this.drawWindWisps2D(t);
        this.drawGlow2D(t, elapsed);
        this.drawSparkles2D(t);

        if (growing) {
            this.flowers2D.forEach(f => this.drawFlower2D(f, this.gardenState === 'ready' || instant ? 1 : clamp01((elapsed - f.delay) / 2.4), t, smoothing, false, delta));
        }
        this.drawFlower2D(
            this.hero,
            !growing ? 0.72 : this.gardenState === 'ready' || instant ? 1 : 0.72 + 0.28 * clamp01(elapsed / 1.8),
            t, smoothing, true, delta
        );

        this.drawGrass2D(elapsed, t);
        if (growing && !this.prefersReducedMotion) this.drawPetals2D(elapsed, t);
        this.drawBursts2D(delta);

        this.updateProgress(this.gardenState === 'ready' ? 1 : growing ? clamp01(elapsed / GROW_SECONDS) : 0);
        if (this.gardenState === 'growing' && (instant || elapsed >= GROW_SECONDS)) this.finishGarden();

        if ((!this.prefersReducedMotion || this.bursts.length) && !document.hidden && this.gardenEl && this.gardenEl.style.display !== 'none') {
            this.gardenAnimationFrameId = requestAnimationFrame(this.handleRender2D);
        }
    }

    render2DFrame() {
        if (this.gardenAnimationFrameId) cancelAnimationFrame(this.gardenAnimationFrameId);
        if (!document.hidden && this.gardenEl && this.gardenEl.style.display !== 'none') {
            this.gardenAnimationFrameId = requestAnimationFrame(this.handleRender2D);
        }
    }

    onGardenPointerMove(event) {
        if (this.prefersReducedMotion) return;
        const rect = this.gardenEl.getBoundingClientRect();
        this.gardenPointer.x = event.clientX - rect.left;
        this.gardenPointer.y = event.clientY - rect.top;
    }

    onGardenPointerLeave(event) {
        if (event && event.pointerType && event.pointerType !== 'mouse') {
            setTimeout(() => { this.gardenPointer.x = -1000; this.gardenPointer.y = -1000; }, 350);
            return;
        }
        this.gardenPointer.x = -1000;
        this.gardenPointer.y = -1000;
    }

    onGardenPointerDown(event) {
        if (this.gardenState === 'idle' || event.target.closest('button')) return;
        const rect = this.gardenEl.getBoundingClientRect();
        this.onGardenPointerMove(event);
        this.spawnBurst(event.clientX - rect.left, event.clientY - rect.top, 14);
        this.pushFlowers(event.clientX - rect.left, event.clientY - rect.top);
        if (this.prefersReducedMotion) this.render2DFrame();
    }

    // =========================================================================
    // 6. TRANSITION: GARDEN -> CAKE
    // =========================================================================
    transitionTo3DCake() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.nextBtn.disabled = true;

        const k = this.prefersReducedMotion ? 0.35 : 1;
        const iris = this.irisEl;
        const tl = this.track(gsap.timeline({ defaults: { ease: 'power2.inOut' } }));
        tl.set(iris, { display: 'grid', pointerEvents: 'auto' }, 0)
            .to(this.gardenEl, { scale: 1.06, duration: 1.2 * k }, 0)
            .fromTo(iris, { webkitClipPath: 'circle(0% at 50% 62%)', clipPath: 'circle(0% at 50% 62%)' }, { webkitClipPath: 'circle(150% at 50% 62%)', clipPath: 'circle(150% at 50% 62%)', duration: 1.1 * k }, 0)
            .call(() => {
                this.gardenEl.style.display = 'none';
                if (this.gardenAnimationFrameId) cancelAnimationFrame(this.gardenAnimationFrameId);
                this.cakeContainer.hidden = false;
                this.initThreeJS();
            }, null, 1.2 * k)
            .to(iris, { webkitClipPath: 'circle(0% at 50% 40%)', clipPath: 'circle(0% at 50% 40%)', duration: 1.0 * k }, 1.5 * k)
            .call(() => this.playEntranceSequence(), null, 1.75 * k)
            .set(iris, { display: 'none', pointerEvents: 'none' });
    }

    // =========================================================================
    // 7. 3D SCENE
    // =========================================================================
    initThreeJS() {
        if (this.renderer) return;
        const w = this.cakeContainer.clientWidth || window.innerWidth;
        const h = this.cakeContainer.clientHeight || window.innerHeight;
        const aspect = w / h;
        const isMobile = w < 768;

        this.scene = new THREE.Scene();
        this.scene.background = skyTexture();
        this.scene.fog = new THREE.FogExp2(0xf0bdd3, 0.0075);
        this.fogBase = this.scene.fog.color.clone();

        let camZ = isMobile ? 48 : 35;
        let camY = isMobile ? 10 : 7;
        let fov = isMobile ? 65 : 45;

        if (aspect < 0.6) {
            camZ = 52;
            camY = 11;
            fov = 70;
        } else if (h < 550) {
            camZ = 32;
            camY = 6;
            fov = 40;
        }

        this.cameraBasePos.set(0, camY, camZ);
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
        this.camPos = { x: this.cameraBasePos.x, y: this.cameraBasePos.y + (this.prefersReducedMotion ? 0 : 4) };
        this.camera.position.set(this.camPos.x, this.camPos.y, this.cameraBasePos.z + (this.prefersReducedMotion ? 0 : 16));

        this.globalCanvas = document.getElementById('webgl-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.globalCanvas || undefined, alpha: true, antialias: true, powerPreference: 'high-performance'
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.95;

        // Safari Context Loss Handler
        this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        }, false);

        if (!this.globalCanvas) this.threeCanvas.appendChild(this.renderer.domElement);
        else this.globalCanvas.style.display = 'block';

        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.25, 0.4, 0.8);
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(this.bloomPass);

        this.setupLighting();
        this.buildFloor();
        this.buildCake();
        this.buildGarden3D();

        if (!this.prefersReducedMotion) {
            this.createMagicalButterflies();
            this.createFairyDust();
        }
        this.scene.add(this.gardenGroup);
        this.handleRender3D();
    }

    setupLighting() {
        const isMobile = window.innerWidth < 768;
        this.lights.ambient = new THREE.AmbientLight(0xfff0f5, 0.8);
        this.lights.hemi = new THREE.HemisphereLight(0xffeeb1, 0xffc0cb, 0.4);
        this.lights.dirLight = new THREE.DirectionalLight(0xffc4d0, 1.2);
        this.lights.dirLight.position.set(6, 12, 8);
        this.lights.dirLight.castShadow = true;
        const sh = this.lights.dirLight.shadow;

        // Tuned shadow map resolution for mobile WebKit memory limits
        const shadowRes = isMobile ? 512 : 1024;
        sh.mapSize.set(shadowRes, shadowRes);
        sh.camera.left = -12; sh.camera.right = 12; sh.camera.top = 16; sh.camera.bottom = -6;
        sh.camera.near = 1; sh.camera.far = 50;
        sh.bias = -0.0005; sh.radius = 4;
        this.lights.rim = new THREE.PointLight(0xff9ccf, 0.9, 60);
        this.lights.rim.position.set(-10, 8, -12);
        this.lights.candleLight = new THREE.PointLight(0xffb700, 0, 18);
        this.scene.add(this.lights.ambient, this.lights.hemi, this.lights.dirLight, this.lights.rim);
    }

    buildFloor() {
        const glow = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.MeshBasicMaterial({
                map: radialTexture([[0, 'rgba(255,244,248,.95)'], [0.5, 'rgba(255,214,230,.45)'], [1, 'rgba(255,214,230,0)']], 256),
                transparent: true, depthWrite: false
            })
        );
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = FLOOR_Y;
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.2 }));
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = FLOOR_Y + 0.01;
        shadow.receiveShadow = true;
        this.scene.add(glow, shadow);
    }

    buildCake() {
        this.scene.add(this.cakeGroup);
        this.cakeGroup.position.y = FLOOR_Y + 0.3;

        const gold = new THREE.MeshStandardMaterial({ color: 0xf5cf6b, roughness: 0.18, metalness: 0.9 });
        const standBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 0.6, 48), gold);
        const standPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.5, 32), gold);
        standPillar.position.y = 1;
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.7, 0.4, 48), gold);
        plate.position.y = 1.9;
        plate.receiveShadow = true;
        standBase.castShadow = standPillar.castShadow = plate.castShadow = true;
        this.cakeGroup.add(standBase, standPillar, plate);

        const frosting = (color, rough = 0.32) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.6, sheenColor: new THREE.Color(0xffffff) });
        const pink = frosting(0xffb6c1), cream = frosting(0xfffaf0, 0.4), rose = frosting(0xff8fb1, 0.3);
        const pearlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.4 });

        this.tiers = [
            this.createTier(5.5, 2.8, pink, cream, pearlMat, 4.2),
            this.createTier(4.2, 2.4, cream, rose, pearlMat, 2.8),
            this.createTier(2.8, 2.2, pink, cream, pearlMat, 0)
        ];
        this.addRibbon(this.tiers[1], 4.2, 2.4);
        this.addBerries(this.tiers[2], 2.2);

        let currentY = 2.1;
        this.tiers.forEach(tier => {
            tier.position.y = currentY + tier.userData.height / 2;
            currentY += tier.userData.height;
            tier.scale.set(0, 0, 0);
            this.cakeGroup.add(tier);
        });

        // Candle
        this.candleGroup.position.y = currentY;
        const candleBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 1.8, 16),
            new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.2 })
        );
        candleBody.position.y = 0.9;
        candleBody.castShadow = true;
        this.candleGroup.add(candleBody);
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xff8fb1, roughness: 0.3 });
        [0.35, 0.75, 1.15, 1.55].forEach(y => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.04, 8, 20), stripeMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = y;
            this.candleGroup.add(ring);
        });
        const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), new THREE.MeshBasicMaterial({ color: 0x333333 }));
        wick.position.y = 1.9;

        this.flame = new THREE.Group();
        const outer = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffb400, transparent: true, opacity: 0.88 }));
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfff6c8 }));
        core.position.y = -0.05;
        core.scale.set(0.8, 1.3, 0.8);
        this.flame.add(outer, core);
        this.flame.position.y = 2.15;
        this.flame.scale.set(0.01, 0.01, 0.01);
        this.flame.visible = false;

        this.flameGlow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: radialTexture([[0, 'rgba(255,205,100,.95)'], [0.4, 'rgba(255,170,70,.35)'], [1, 'rgba(255,150,40,0)']]),
            transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
        }));
        this.flameGlow.scale.set(3.2, 3.2, 1);
        this.flameGlow.position.y = 2.2;
        this.flameGlow.visible = false;

        this.lights.candleLight.position.y = 2.15;
        this.candleGroup.add(wick, this.flame, this.flameGlow, this.lights.candleLight);
        this.candleGroup.scale.set(0, 0, 0);
        this.cakeGroup.add(this.candleGroup);
    }

    createTier(radius, height, bodyMat, capMat, pearlMat, nextRadius) {
        const group = new THREE.Group();
        group.userData = { height };
        const d = new THREE.Object3D();

        const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 64), bodyMat);
        body.castShadow = body.receiveShadow = true;
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.04, radius + 0.04, 0.16, 64), capMat);
        cap.position.y = height / 2 - 0.02;
        cap.castShadow = true;
        group.add(body, cap);

        const pearlCount = Math.floor(radius * 12);
        const pearls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 10, 10), pearlMat, pearlCount);
        for (let i = 0; i < pearlCount; i++) {
            const a = (i / pearlCount) * Math.PI * 2;
            d.position.set(Math.cos(a) * radius, -height / 2 + 0.18, Math.sin(a) * radius);
            d.scale.setScalar(1); d.rotation.set(0, 0, 0); d.updateMatrix();
            pearls.setMatrixAt(i, d.matrix);
        }
        group.add(pearls);

        const dripCount = Math.floor(radius * 5.5);
        const drips = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 12, 12), capMat, dripCount);
        for (let i = 0; i < dripCount; i++) {
            const a = (i / dripCount) * Math.PI * 2 + rand(-0.05, 0.05);
            const sy = rand(1.2, 3.4);
            d.position.set(Math.cos(a) * (radius - 0.02), height / 2 + 0.06 - 0.3 * sy, Math.sin(a) * (radius - 0.02));
            d.scale.set(1, sy, 1); d.rotation.set(0, 0, 0); d.updateMatrix();
            drips.setMatrixAt(i, d.matrix);
        }
        drips.castShadow = true;
        group.add(drips);

        const rosetteCount = Math.floor(radius * 5);
        const rosettes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }), rosetteCount);
        for (let i = 0; i < rosetteCount; i++) {
            const a = (i / rosetteCount) * Math.PI * 2;
            d.position.set(Math.cos(a) * (radius - 0.3), height / 2 + 0.16, Math.sin(a) * (radius - 0.3));
            d.scale.set(1, 0.85, 1); d.rotation.set(0, 0, 0); d.updateMatrix();
            rosettes.setMatrixAt(i, d.matrix);
        }
        group.add(rosettes);

        const inner = (nextRadius || 0.4) + 0.3, outer = radius - 0.6;
        if (outer > inner) {
            const count = Math.floor((outer * outer - inner * inner) * 4);
            const sprinkles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.3, 6), new THREE.MeshStandardMaterial({ roughness: 0.5 }), count);
            const palette = ['#ff8fb1', '#8fd3ff', '#ffd36e', '#b79cff', '#9be3b2'].map(c => new THREE.Color(c));
            for (let i = 0; i < count; i++) {
                const a = Math.random() * Math.PI * 2, r = Math.sqrt(rand(inner * inner, outer * outer));
                d.position.set(Math.cos(a) * r, height / 2 + 0.1, Math.sin(a) * r);
                d.scale.setScalar(1); d.rotation.set(0, Math.random() * Math.PI, Math.PI / 2); d.updateMatrix();
                sprinkles.setMatrixAt(i, d.matrix);
                sprinkles.setColorAt(i, palette[i % palette.length]);
            }
            sprinkles.instanceColor.needsUpdate = true;
            group.add(sprinkles);
        }
        return group;
    }

    addRibbon(tier, radius, height) {
        const satin = new THREE.MeshStandardMaterial({ color: 0xe8789a, roughness: 0.25, metalness: 0.1 });
        const band = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.03, radius + 0.03, 0.42, 64), satin);
        band.position.y = -height * 0.12;
        const bow = new THREE.Group();
        [-1, 1].forEach(s => {
            const loop = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), satin);
            loop.scale.set(1.5, 0.9, 0.5);
            loop.position.x = s * 0.55;
            loop.rotation.z = s * 0.45;
            bow.add(loop);
        });
        bow.add(new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), satin));
        bow.position.set(0, -height * 0.12, radius + 0.18);
        tier.add(band, bow);
    }

    addBerries(tier, height) {
        const berryMat = new THREE.MeshStandardMaterial({ color: 0xff4d6d, roughness: 0.35 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x6bbf7a, roughness: 0.6 });
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + 0.6;
            const berry = new THREE.Group();
            const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), berryMat);
            fruit.scale.set(1, 1.15, 1);
            const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.18, 6), leafMat);
            leaf.position.y = 0.4;
            berry.add(fruit, leaf);
            berry.position.set(Math.cos(a) * 1.75, height / 2 + 0.4, Math.sin(a) * 1.75);
            berry.castShadow = true;
            tier.add(berry);
        }
    }

    catMaterials() {
        if (!this.catMats) {
            this.catMats = {
                dark: new THREE.MeshStandardMaterial({ color: 0x2a1f2d, roughness: 0.35 }),
                white: new THREE.MeshBasicMaterial({ color: 0xffffff }),
                pink: new THREE.MeshStandardMaterial({ color: 0xff9aab, roughness: 0.5 }),
                blush: new THREE.MeshBasicMaterial({ color: 0xff8fa8, transparent: true, opacity: 0.55 })
            };
        }
        return this.catMats;
    }

    buildCatFace(R, fur) {
        const m = this.catMaterials();
        const g = new THREE.Group();
        [-1, 1].forEach(s => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(R * 0.1, 12, 12), m.dark);
            eye.position.set(s * R * 0.36, R * 0.14, R * 0.9);
            eye.scale.set(1, 1.25, 0.6);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(R * 0.035, 8, 8), m.white);
            shine.position.set(s * R * 0.36 + R * 0.03, R * 0.2, R * 0.96);
            const cheek = new THREE.Mesh(new THREE.SphereGeometry(R * 0.14, 12, 12), m.blush);
            cheek.position.set(s * R * 0.6, -R * 0.1, R * 0.78);
            cheek.scale.set(1, 0.65, 0.35);
            g.add(eye, shine, cheek);

            [-1, 1].forEach(k => {
                const whisker = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.008, R * 0.008, R * 0.5, 4), m.dark);
                whisker.position.set(s * R * 0.95, -R * 0.06 + k * R * 0.07, R * 0.5);
                whisker.rotation.set(0, s * 0.7, Math.PI / 2 + k * 0.2);
                g.add(whisker);
            });

            const ear = new THREE.Mesh(new THREE.ConeGeometry(R * 0.3, R * 0.55, 8), fur);
            ear.position.set(s * R * 0.5, R * 0.83, R * 0.33);
            ear.rotation.set(-0.2, 0, -s * 0.4);
            const inner = new THREE.Mesh(new THREE.ConeGeometry(R * 0.17, R * 0.38, 8), m.pink);
            inner.position.set(s * R * 0.5, R * 0.8, R * 0.38);
            inner.rotation.copy(ear.rotation);
            g.add(ear, inner);

            const smile = new THREE.Mesh(new THREE.TorusGeometry(R * 0.05, R * 0.012, 6, 12, Math.PI), m.dark);
            smile.position.set(s * R * 0.05, -R * 0.12, R * 0.97);
            smile.rotation.z = Math.PI;
            g.add(smile);
        });
        const nose = new THREE.Mesh(new THREE.SphereGeometry(R * 0.06, 8, 8), m.pink);
        nose.position.set(0, -R * 0.02, R * 0.99);
        nose.scale.set(1, 0.7, 0.6);
        g.add(nose);
        return g;
    }

    createCats() {
        const hatColors = [0xff8fb1, 0x8fd3ff, 0xffd36e, 0xb79cff];
        const make = (color, x, z, rotY, i) => {
            const cat = new THREE.Group();
            const fur = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
            const body = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), fur);
            body.position.y = 1.2;
            body.castShadow = true;
            const face = this.buildCatFace(1.2, fur);
            face.position.y = 1.2;

            [-1, 1].forEach(s => {
                const paw = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), fur);
                paw.position.set(s * 0.45, 0.2, 1.0);
                paw.scale.set(1, 0.8, 1.15);
                cat.add(paw);
            });

            const hat = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.95, 16), new THREE.MeshStandardMaterial({ color: hatColors[i % hatColors.length], roughness: 0.5 }));
            hat.position.set(0.15, 2.6, 0.1);
            hat.rotation.z = -0.22;
            const pom = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffe08a, roughness: 0.5 }));
            pom.position.y = 0.5;
            hat.add(pom);

            const tail = new THREE.Group();
            const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.5, 10), fur);
            tailMesh.position.y = 0.75;
            const tip = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), fur);
            tip.position.y = 1.5;
            tail.add(tailMesh, tip);
            tail.position.set(0, 0.5, -1);
            tail.rotation.x = -Math.PI / 2;

            cat.add(body, face, hat, tail);
            cat.position.set(x, FLOOR_Y, z);
            cat.rotation.y = rotY;
            cat.userData = { tail, offset: Math.random() * Math.PI * 2 };
            this.gardenGroup.add(cat);
            this.cats.push(cat);
        };
        make(0xffffff, -8, 2, 0.6, 0);
        make(0xffe4b5, 8, 1, -0.7, 1);
        make(0xffdab9, -4, -6, 0.3, 2);
    }

    createFloatingCats() {
        const colors = [0xffffff, 0xffe4b5, 0xffdab9, 0xffb6c1];
        for (let i = 0; i < 8; i++) {
            const fur = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.9 });
            const cat = new THREE.Group();
            cat.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 24), fur), this.buildCatFace(0.8, fur));
            cat.position.set((Math.random() - 0.5) * 35, Math.random() * 15 + 2, (Math.random() - 0.5) * 25 - 5);
            cat.scale.setScalar(0.5 + Math.random() * 0.3);
            cat.userData = {
                speedY: Math.random() * 0.005 + 0.002, speedX: (Math.random() - 0.5) * 0.005,
                wobbleSpeed: Math.random() * 0.02 + 0.01, wobbleOffset: Math.random() * Math.PI * 2
            };
            this.gardenGroup.add(cat);
            this.floatingCats.push(cat);
        }
    }

    buildGarden3D() {
        this.createCats();
        this.createFloatingHearts();
        this.createFloralArrangements();
        this.createFloatingFlowers();
        this.createFloatingCats();
    }

    buildBlossom(mat, petals = 6) {
        const flower = new THREE.Group();
        const petalGeo = new THREE.SphereGeometry(0.15, 10, 10);
        for (let p = 0; p < petals; p++) {
            const petal = new THREE.Mesh(petalGeo, mat);
            const a = (p / petals) * Math.PI * 2;
            petal.position.set(Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17);
            petal.scale.set(1.1, 0.3, 1.1);
            flower.add(petal);
        }
        flower.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.5 })));
        return flower;
    }

    createFloatingFlowers() {
        const mats = [0xff69b4, 0xffb6c1, 0xffffff].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }));
        for (let i = 0; i < 15; i++) {
            const flower = this.buildBlossom(mats[i % mats.length], 5);
            flower.position.set((Math.random() - 0.5) * 40, Math.random() * 20 - 5, (Math.random() - 0.5) * 30 - 10);
            flower.scale.setScalar(0.5 + Math.random() * 0.8);
            flower.userData = {
                speedY: Math.random() * 0.008 + 0.002,
                rotSpeedX: (Math.random() - 0.5) * 0.008, rotSpeedY: (Math.random() - 0.5) * 0.008, rotSpeedZ: (Math.random() - 0.5) * 0.008
            };
            this.gardenGroup.add(flower);
            this.floatingFlowers.push(flower);
        }
    }

    createFloatingHearts() {
        const shape = new THREE.Shape();
        shape.moveTo(0.25, 0.25);
        shape.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
        shape.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
        shape.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 1.0);
        shape.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
        shape.bezierCurveTo(0.8, 0, 0.5, 0, 0.5, 0);
        shape.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);
        const heartGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.03, bevelThickness: 0.03 });
        heartGeo.center();
        const mats = [0xffb3c6, 0xffc2d1, 0xffa6c1].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.1, emissive: 0xff7fa5, emissiveIntensity: 0.22 }));
        for (let i = 0; i < 16; i++) {
            const heart = new THREE.Mesh(heartGeo, mats[i % mats.length]);
            heart.position.set((Math.random() - 0.5) * 30, Math.random() * 15, (Math.random() - 0.5) * 20 - 5);
            heart.scale.setScalar(0.35 + Math.random() * 0.55);
            heart.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            heart.userData = { speedY: Math.random() * 0.01 + 0.005, rotSpeedX: (Math.random() - 0.5) * 0.008, rotSpeedY: (Math.random() - 0.5) * 0.008 };
            this.gardenGroup.add(heart);
            this.hearts.push(heart);
        }
    }

    createFloralArrangements() {
        const mats = [0xff69b4, 0xff9ec4, 0xffd1e1].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }));
        const count = 20;
        for (let i = 0; i < count; i++) {
            const flower = this.buildBlossom(mats[i % mats.length], 7);
            const radius = 12 + Math.random() * 5, angle = (i / count) * Math.PI * 2;
            flower.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 5, Math.sin(angle) * radius - 5);
            flower.scale.setScalar(Math.random() * 2 + 2);
            flower.userData = { offset: Math.random() * 10, tilt: 0.9 + Math.random() * 0.5 };
            this.gardenGroup.add(flower);
            this.flowers.push(flower);
        }
    }

    createFairyDust() {
        const count = window.innerWidth < 768 ? 60 : 120;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
        const palette = ['#ffb6c1', '#ffd1dc', '#fff0f5', '#fff3c4'].map(c => new THREE.Color(c));
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30 + 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
            const c = palette[i % palette.length];
            colors.set([c.r, c.g, c.b], i * 3);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.ambientParticles = new THREE.Points(geo, new THREE.PointsMaterial({
            size: 0.55, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending,
            map: radialTexture([[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,.5)'], [1, 'rgba(255,255,255,0)']], 64)
        }));
        this.scene.add(this.ambientParticles);
    }

    createMagicalButterflies() {
        const wingGeo = new THREE.PlaneGeometry(0.55, 0.45);
        wingGeo.translate(0.275, 0, 0);
        const colors = [0xffb6d5, 0xd9c2ff, 0xfff0a8, 0xb8e6ff];
        for (let i = 0; i < 8; i++) {
            const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.92, side: THREE.DoubleSide });
            const b = new THREE.Group();
            const wingR = new THREE.Mesh(wingGeo, mat);
            const wingL = new THREE.Mesh(wingGeo, mat);
            wingL.scale.x = -1;
            const bodyGeo = THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.04, 0.25, 4, 6) : new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6);
            const body = new THREE.Mesh(bodyGeo, new THREE.MeshBasicMaterial({ color: 0x5a3350 }));
            body.rotation.x = Math.PI / 2;
            b.add(wingR, wingL, body);
            b.scale.setScalar(1.4);
            b.userData = { wingR, wingL, phase: Math.random() * Math.PI * 2, radius: rand(6, 13), speed: rand(0.15, 0.3), height: rand(3, 11), flap: rand(8, 12) };
            this.gardenGroup.add(b);
            this.butterflies.push(b);
        }
    }

    spawnSmoke() {
        if (this.prefersReducedMotion) return;
        const map = radialTexture([[0, 'rgba(255,255,255,.7)'], [1, 'rgba(255,255,255,0)']], 64);
        for (let i = 0; i < 6; i++) {
            const puff = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: 0.6, depthWrite: false }));
            puff.position.set(rand(-0.1, 0.1), 2.2, rand(-0.1, 0.1));
            puff.scale.setScalar(0.5);
            this.candleGroup.add(puff);
            this.track(gsap.to(puff.position, { y: 4.8 + rand(0, 1), x: rand(-0.8, 0.8), duration: 2.2, delay: i * 0.1, ease: 'power1.out' }));
            this.track(gsap.to(puff.scale, { x: 2.2, y: 2.2, duration: 2.2, delay: i * 0.1 }));
            this.track(gsap.to(puff.material, {
                opacity: 0, duration: 2.2, delay: i * 0.1, ease: 'power1.in',
                onComplete: () => { this.candleGroup.remove(puff); puff.material.dispose(); }
            }));
        }
        this.track(gsap.delayedCall(3.2, () => map.dispose()));
    }

    // =========================================================================
    // 8. SEQUENCES
    // =========================================================================
    playEntranceSequence() {
        const tl = this.track(gsap.timeline());
        tl.to(this.stepper, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.3);
        this.tiers.forEach((tier, i) => tl.to(tier.scale, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'elastic.out(1, 0.6)' }, 0.1 + i * 0.3));
        tl.to(this.candleGroup.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'back.out(1.5)' }, '>-0.6');
        if (!this.prefersReducedMotion) tl.to(this.camera.position, { z: this.cameraBasePos.z, duration: 2.8, ease: 'power3.out' }, 0);
        tl.to(this.actionBox, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '>-0.5');
        tl.call(() => this.btnLight.focus({ preventScroll: true }));
    }

    igniteCandle() {
        const dimTo = 2.6;
        const tl = this.track(gsap.timeline());
        tl.to(this.readyBlock, { opacity: 0, y: -10, duration: 0.35, ease: 'power2.in' })
            .call(() => { this.readyBlock.hidden = true; this.wishBlock.hidden = false; })
            .fromTo(this.wishBlock, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
            .addLabel('dim', 0.1)
            .to(this.vignette, { opacity: 1, duration: dimTo, ease: 'power2.inOut' }, 'dim')
            .to(this.lights.ambient, { intensity: 0.12, duration: dimTo }, 'dim')
            .to(this.lights.hemi, { intensity: 0.12, duration: dimTo }, 'dim')
            .to(this.lights.dirLight, { intensity: 0.08, duration: dimTo }, 'dim')
            .to(this.lights.rim, { intensity: 0.15, duration: dimTo }, 'dim')
            .to(this.scene.fog.color, { r: 0.2, g: 0.1, b: 0.25, duration: dimTo }, 'dim');
        if (typeof this.scene.backgroundIntensity === 'number') {
            tl.to(this.scene, { backgroundIntensity: 0.3, duration: dimTo }, 'dim');
        }
        tl.call(() => { this.flame.visible = true; this.flameGlow.visible = true; }, null, 'dim+=1.2')
            .to(this.flame.scale, { x: 1, y: 1.6, z: 1, duration: 1.5, ease: 'elastic.out(1, 0.3)' }, 'dim+=1.2')
            .to(this.flameGlow.material, { opacity: 1, duration: 1.4 }, 'dim+=1.2')
            .to(this.lights.candleLight, { intensity: 10, distance: 35, duration: 2 }, 'dim+=1.2')
            .call(() => { this.flameReady = true; this.startWishCountdown(); });
    }

    startWishCountdown() {
        const C = 213.6, o = { t: 0 };
        this.wishTween = this.track(gsap.to(o, {
            t: 1, duration: WISH_SECONDS, ease: 'none',
            onUpdate: () => { this.ringFill.style.strokeDashoffset = C * (1 - o.t); },
            onComplete: () => this.blowOutCandle()
        }));
        this.btnBlow.focus({ preventScroll: true });
    }

    blowOutCandle() {
        if (this.isBlowingOut) return;
        this.isBlowingOut = true;
        this.flameReady = false;
        if (this.wishTween) this.wishTween.kill();

        const tl = this.track(gsap.timeline());
        tl.to(this.wishBlock, { opacity: 0, y: 10, duration: 0.5 }, 0);
        if (!this.prefersReducedMotion) tl.to(this.shake, { x: 0.12, y: 0.06, duration: 0.05, yoyo: true, repeat: 5 }, 0);
        tl.to(this.flame.rotation, { z: 0.8, duration: 0.08, yoyo: true, repeat: 7 }, 0)
            .to(this.flame.scale, { x: 0.3, y: 0.5, z: 0.3, duration: 0.5 }, 0)
            .to(this.lights.candleLight, { intensity: 2, duration: 0.5 }, 0)
            .to(this.flame.scale, { x: 0, y: 0, z: 0, duration: 0.1 })
            .to(this.lights.candleLight, { intensity: 0, duration: 0.1 }, '<')
            .to(this.flameGlow.material, { opacity: 0, duration: 0.2 }, '<')
            .call(() => { this.flame.visible = false; this.flameGlow.visible = false; this.spawnSmoke(); })
            .call(() => this.triggerFinale(), null, '+=1.4');
    }

    triggerFinale() {
        const restore = 1.4;
        const tl = this.track(gsap.timeline());
        if (!this.prefersReducedMotion) tl.to(this.shake, { x: 0.4, y: 0.25, duration: 0.07, yoyo: true, repeat: 5 }, 0);
        tl.to(this.flashEl, { opacity: 0.85, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }, 0)
            .to(this.bloomPass, { strength: 1.1, duration: 0.35, yoyo: true, repeat: 1 }, 0)
            .call(() => this.fireConfetti(), null, 0.1)
            .to(this.vignette, { opacity: 0, duration: restore }, 0.2)
            .to(this.lights.ambient, { intensity: 0.8, duration: restore }, 0.2)
            .to(this.lights.hemi, { intensity: 0.4, duration: restore }, 0.2)
            .to(this.lights.dirLight, { intensity: 1.2, duration: restore }, 0.2)
            .to(this.lights.rim, { intensity: 0.9, duration: restore }, 0.2)
            .to(this.scene.fog.color, { r: this.fogBase.r, g: this.fogBase.g, b: this.fogBase.b, duration: restore }, 0.2)
            .to(this.stepper, { opacity: 0, duration: 0.6 }, 0.2);
        if (typeof this.scene.backgroundIntensity === 'number') tl.to(this.scene, { backgroundIntensity: 1, duration: restore }, 0.2);
        tl.to(this.cake, { lift: 5, duration: 2.4, ease: 'power2.in' }, 0.6)
            .to(this.cakeGroup.rotation, { y: Math.PI * 2, duration: 2.4, ease: 'power2.in' }, 0.6)
            .to(this.cakeGroup.scale, { x: 0, y: 0, z: 0, duration: 2.4, ease: 'power2.in' }, 0.6)
            .call(() => this.showFinale(), null, 2.1);
    }

    showFinale() {
        this.finaleOverlay.classList.add('is-on');
        this.finaleOverlay.setAttribute('aria-hidden', 'false');
        if (!this.finaleOverlay.querySelector('.cs-fh') && !this.prefersReducedMotion) {
            for (let i = 0; i < 16; i++) {
                const h = document.createElement('span');
                h.className = 'cs-fh';
                h.textContent = i % 3 === 0 ? '♡' : '♥';
                h.style.cssText = `left:${rand(2, 96)}%;font-size:${rand(14, 34)}px;animation-duration:${rand(7, 13)}s;animation-delay:${rand(0, 6)}s;`;
                this.finaleOverlay.appendChild(h);
            }
        }
        this.track(gsap.fromTo(this.finaleCard.children,
            { y: 28, opacity: 0, filter: 'blur(8px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: 0.18, ease: 'power3.out', delay: 0.3, clearProps: 'filter' }));
        this.track(gsap.fromTo(this.finaleCard, { scale: 0.92 }, { scale: 1, duration: 1.4, ease: 'power3.out' }));
        this.track(gsap.delayedCall(1.4, () => this.btnReplay.focus({ preventScroll: true })));
    }

    fireConfetti() {
        const colors = ['#FFB6C1', '#FF69B4', '#FFD700', '#FFFFFF', '#B79CFF'];
        if (typeof window.confetti !== 'undefined') {
            const end = Date.now() + 4500;
            const frame = () => {
                window.confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0, y: 0.6 }, colors });
                window.confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1, y: 0.6 }, colors });
                if (Date.now() < end && !this.destroyed) requestAnimationFrame(frame);
            };
            frame();
            return;
        }
        const cv = this.confettiCanvas, ctx = cv.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = window.innerWidth * dpr;
        cv.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const W = window.innerWidth, H = window.innerHeight;
        const pieces = [];
        const spawn = () => {
            for (let i = 0; i < 4; i++) {
                const left = i % 2 === 0;
                pieces.push({
                    x: left ? -10 : W + 10, y: H * 0.65, vx: (left ? 1 : -1) * rand(5, 13), vy: -rand(9, 18),
                    size: rand(6, 11), rot: Math.random() * 6, vr: rand(-0.3, 0.3), color: colors[(Math.random() * colors.length) | 0],
                    shape: Math.random() < 0.3 ? 'heart' : Math.random() < 0.5 ? 'circle' : 'rect'
                });
            }
        };
        const start = performance.now();
        const loop = now => {
            if (this.destroyed) return;
            ctx.clearRect(0, 0, W, H);
            if (now - start < 3800) spawn();
            for (let i = pieces.length - 1; i >= 0; i--) {
                const p = pieces[i];
                p.vy += 0.32; p.vx *= 0.992; p.vy *= 0.992;
                p.x += p.vx; p.y += p.vy; p.rot += p.vr;
                if (p.y > H + 30) { pieces.splice(i, 1); continue; }
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                if (p.shape === 'heart') { heartPath(ctx, p.size * 0.8); ctx.fill(); }
                else if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2); ctx.fill(); }
                else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            }
            if (pieces.length || now - start < 3800) requestAnimationFrame(loop);
            else ctx.clearRect(0, 0, W, H);
        };
        requestAnimationFrame(loop);
    }

    // =========================================================================
    // 9. RENDER LOOP (3D)
    // =========================================================================
    render3D() {
        this.animationFrameId = requestAnimationFrame(this.handleRender3D);
        const time = this.clock.getElapsedTime();

        this.camPos.x += (this.cameraBasePos.x + this.mouseX * 2.5 - this.camPos.x) * 0.05;
        this.camPos.y += (this.cameraBasePos.y + this.mouseY * 2.5 - this.camPos.y) * 0.05;
        this.camera.position.x = this.camPos.x + this.shake.x;
        this.camera.position.y = this.camPos.y + this.shake.y;
        this.camera.lookAt(0, 3, 0);

        this.cakeGroup.position.y = FLOOR_Y + 0.3 + Math.sin(time * 1.5) * 0.04 + this.cake.lift;
        if (!this.isBlowingOut) this.cakeGroup.rotation.y = Math.sin(time * 0.3) * 0.08;

        if (this.flame && this.flame.visible && this.flameReady) {
            this.flame.scale.x = 0.9 + Math.sin(time * 25) * 0.1;
            this.flame.scale.z = 0.9 + Math.cos(time * 20) * 0.1;
            this.flameGlow.scale.setScalar(3.1 + Math.sin(time * 14) * 0.25);
            this.lights.candleLight.intensity = 10 + Math.sin(time * 15) * 1.5;
        }

        this.cats.forEach(cat => {
            cat.position.y = FLOOR_Y + Math.abs(Math.sin(time * 1.5 + cat.userData.offset)) * 0.03;
            cat.userData.tail.rotation.z = Math.sin(time * 2 + cat.userData.offset) * 0.2;
        });

        this.hearts.forEach(h => {
            h.position.y += h.userData.speedY;
            h.rotation.x += h.userData.rotSpeedX;
            h.rotation.y += h.userData.rotSpeedY;
            if (h.position.y > 15) h.position.y = -5;
        });

        this.floatingFlowers.forEach(f => {
            f.position.y += f.userData.speedY;
            f.rotation.x += f.userData.rotSpeedX;
            f.rotation.y += f.userData.rotSpeedY;
            f.rotation.z += f.userData.rotSpeedZ;
            if (f.position.y > 20) f.position.y = -5;
        });

        this.floatingCats.forEach(cat => {
            const u = cat.userData;
            cat.position.y += u.speedY + Math.sin(time * u.wobbleSpeed + u.wobbleOffset) * 0.005;
            cat.position.x += u.speedX;
            cat.rotation.y = Math.sin(time * u.wobbleSpeed + u.wobbleOffset) * 0.1;
            cat.rotation.z = Math.cos(time * u.wobbleSpeed + u.wobbleOffset) * 0.05;
            if (cat.position.y > 20) {
                cat.position.y = -5;
                cat.position.x = (Math.random() - 0.5) * 35;
            }
        });

        this.flowers.forEach(f => {
            f.rotation.x = f.userData.tilt + Math.sin(time * 0.8 + f.userData.offset) * 0.025;
            f.rotation.z = Math.cos(time * 0.7 + f.userData.offset) * 0.025;
        });

        this.butterflies.forEach(b => {
            const u = b.userData, a = time * u.speed + u.phase;
            b.position.set(Math.cos(a) * u.radius, u.height + Math.sin(a * 1.7) * 1.2, Math.sin(a) * u.radius * 0.6 + 2);
            b.rotation.y = -a + Math.PI;
            const flap = Math.sin(time * u.flap + u.phase) * 0.9;
            u.wingR.rotation.y = flap;
            u.wingL.rotation.y = -flap;
        });

        if (this.ambientParticles) {
            this.ambientParticles.rotation.y = time * 0.02;
            const pos = this.ambientParticles.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) pos[i + 1] += Math.sin(time + pos[i]) * 0.005;
            this.ambientParticles.geometry.attributes.position.needsUpdate = true;
        }

        this.composer.render();
    }

    // =========================================================================
    // 10. EVENTS & LIFECYCLE
    // =========================================================================
    bindEvents() {
        this.bloomBtn.addEventListener('click', () => this.startGarden());
        this.nextBtn.addEventListener('click', () => this.transitionTo3DCake());
        this.gardenEl.addEventListener('pointermove', this.handleGardenPointerMove, { passive: true });
        this.gardenEl.addEventListener('pointerdown', this.handleGardenPointerDown, { passive: true });
        this.gardenEl.addEventListener('pointerleave', this.handleGardenPointerLeave, { passive: true });
        this.gardenEl.addEventListener('pointerup', this.handleGardenPointerUp, { passive: true });

        this.btnLight.addEventListener('click', () => {
            if (this.isCandleLit) return;
            this.isCandleLit = true;
            this.btnLight.disabled = true;
            this.igniteCandle();
        });
        this.btnBlow.addEventListener('click', () => this.blowOutCandle());
        this.btnReplay.addEventListener('click', () => {
            if (this.callbacks.onComplete) this.callbacks.onComplete();
            else window.location.reload();
        });

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleResize);
        window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        if (typeof ResizeObserver !== 'undefined' && this.gardenEl) {
            this.resizeObserver = new ResizeObserver(() => this.resize2DCanvas());
            this.resizeObserver.observe(this.gardenEl);
        }
    }

    onPointerMove(e) {
        this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onWindowResize() {
        this.resize2DCanvas();
        if (!this.camera || !this.renderer || !this.cakeContainer) return;
        const w = this.cakeContainer.clientWidth || window.innerWidth;
        const h = this.cakeContainer.clientHeight || window.innerHeight;
        const aspect = w / h;
        const isMobile = w < 768;

        let camZ = isMobile ? 48 : 35;
        let camY = isMobile ? 10 : 7;
        let fov = isMobile ? 65 : 45;

        if (aspect < 0.6) {
            camZ = 52;
            camY = 11;
            fov = 70;
        } else if (h < 550) {
            camZ = 32;
            camY = 6;
            fov = 40;
        }

        this.cameraBasePos.set(0, camY, camZ);
        this.camera.aspect = aspect;
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();

        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(dpr);
        if (this.composer) {
            this.composer.setPixelRatio(dpr);
            this.composer.setSize(w, h);
        }
    }

    onVisibilityChange() {
        if (document.hidden) {
            this.gardenPausedAt = performance.now();
            if (this.gardenAnimationFrameId) cancelAnimationFrame(this.gardenAnimationFrameId);
            if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
            this.gardenAnimationFrameId = 0;
            this.animationFrameId = 0;
            this.gardenLastFrame = 0;
        } else {
            if (this.gardenPausedAt && this.gardenState === 'growing') {
                this.gardenStartedTime += performance.now() - this.gardenPausedAt;
            }
            this.gardenPausedAt = 0;
            if (this.gardenEl && this.gardenEl.style.display !== 'none') this.render2DFrame();
            else if (this.renderer) this.handleRender3D();
        }
    }

    destroy() {
        this.destroyed = true;
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleResize);
        window.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        if (this.resizeObserver) this.resizeObserver.disconnect();

        if (this.gardenEl) {
            this.gardenEl.removeEventListener('pointermove', this.handleGardenPointerMove);
            this.gardenEl.removeEventListener('pointerdown', this.handleGardenPointerDown);
            this.gardenEl.removeEventListener('pointerleave', this.handleGardenPointerLeave);
            this.gardenEl.removeEventListener('pointerup', this.handleGardenPointerUp);
        }

        this.tweens.forEach(t => t && t.kill && t.kill());
        this.tweens = [];
        if (this.gardenAnimationFrameId) cancelAnimationFrame(this.gardenAnimationFrameId);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        if (this.scene) {
            this.scene.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                const mats = child.material ? (Array.isArray(child.material) ? child.material : [child.material]) : [];
                mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
            });
            if (this.scene.background && this.scene.background.dispose) this.scene.background.dispose();
        }
        if (this.composer && this.composer.dispose) this.composer.dispose();
        if (this.renderer) {
            this.renderer.dispose();
            if (!this.globalCanvas) this.renderer.forceContextLoss();
            else this.globalCanvas.style.display = 'none';
        }
        if (this.container && this.container.parentNode) this.container.parentNode.removeChild(this.container);
    }
}