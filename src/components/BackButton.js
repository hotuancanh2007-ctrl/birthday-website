import gsap from 'gsap';

export class BackButton {
    constructor(parentElement, options = {}) {
        this.parentElement = parentElement;
        this.onClick = options.onClick || (() => { });
        this.variant = options.variant || 'glass';
        this.position = options.position || 'top-left';
        this.label = options.label || 'Quay lại';
        this.element = null;
        this.mm = gsap.matchMedia();
    }

    mount() {
        this.element = document.createElement('button');
        // Added pastel pink ring/glow utilities assuming Tailwind is present
        this.element.className = `custom-back-btn ${this.variant} pos-${this.position} hover:shadow-[0_0_15px_rgba(255,182,193,0.6)] transition-shadow duration-300`;
        this.element.setAttribute('aria-label', 'Quay lại trang trước');

        this.element.innerHTML = `
            <span class="back-icon" aria-hidden="true">❮</span>
            <span class="back-text">${this.label}</span>
        `;

        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.mm.add("(prefers-reduced-motion: no-preference)", () => {
                gsap.to(this.element, {
                    scale: 0.92,
                    duration: 0.15,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.out",
                    onComplete: () => this.onClick()
                });
            });
            this.mm.add("(prefers-reduced-motion: reduce)", () => {
                this.onClick();
            });
        });

        this.parentElement.appendChild(this.element);

        this.mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.fromTo(this.element,
                { opacity: 0, y: -15, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out', delay: 0.2 }
            );
        });
        this.mm.add("(prefers-reduced-motion: reduce)", () => {
            gsap.set(this.element, { opacity: 1, y: 0, scale: 1 });
        });
    }

    destroy() {
        if (!this.element) return;
        this.mm.revert(); // Cleanup matchMedia
        gsap.to(this.element, {
            opacity: 0,
            y: -10,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                if (this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.element = null;
            }
        });
    }
}