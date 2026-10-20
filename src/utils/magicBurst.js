const CHARS = ['♡', '✦', '✧', '🌸'];

export function spawnMagicBurst(root, count = 16) {
  if (!root) return;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'burst-bit';
    el.textContent = CHARS[i % CHARS.length];
    const angle = ((Math.PI * 2) * i) / count + Math.random() * 0.25;
    const dist = 70 + Math.random() * 130;
    el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * dist - 36}px`);
    el.style.animationDelay = `${i * 0.018}s`;
    el.style.fontSize = `${0.8 + Math.random() * 0.55}rem`;
    root.appendChild(el);
    window.setTimeout(() => el.remove(), 1300);
  }
}
