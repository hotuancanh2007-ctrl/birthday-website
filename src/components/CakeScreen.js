import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BackButton } from './BackButton';
import '../styles/back-button.css';

export class CakeScreen {
    constructor(parentContainer, callbacks = {}) {
        this.parentContainer = parentContainer;
        this.callbacks = callbacks;
        this.container = null;
        this.isCandleLit = false;
        this.isBlowingOut = false;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.handleResize = this.onWindowResize.bind(this);
        this.handleMouseMove = this.onMouseMove.bind(this);
        this.handleRender = this.render.bind(this);

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationFrameId = null;
        this.clock = new THREE.Clock();

        this.mouseX = 0;
        this.mouseY = 0;

        // [Responsive] Thiết lập khoảng cách Camera xa hơn trên mobile
        const isMobile = window.innerWidth < 768;
        this.cameraBasePos = new THREE.Vector3(0, isMobile ? 10 : 7, isMobile ? 48 : 35);

        this.lights = {};
        this.cakeGroup = new THREE.Group();
        this.candleGroup = new THREE.Group();
        this.flame = null;
        this.gardenGroup = new THREE.Group();

        this.hearts = [];
        this.cats = [];
        this.flowers = [];
        this.butterflies = [];

        // Mảng chứa các phần tử bay mới
        this.floatingCats = [];
        this.floatingFlowers = [];

        this.ambientParticles = null;
    }

    mount() {
        this.container = document.createElement('div');
        this.container.id = 'cake-screen-container';

        // Chuẩn responsive 100dvh tràn màn hình tương tự LetterScreen
        this.container.className = 'fixed inset-0 w-screen h-screen overflow-hidden opacity-0 z-10';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100vw';
        this.container.style.height = '100vh';
        this.container.style.height = '100dvh';

        this.backBtn = new BackButton(this.container, {
            variant: 'pastel',
            position: 'top-left',
            label: 'Phim kỷ niệm',
            onClick: () => { this.destroy(); }
        });
        this.backBtn.mount();

        this.container.innerHTML = `
            <div id="cake-three-canvas" class="absolute inset-0 z-0"></div>
            <div class="absolute inset-0 z-10 flex flex-col justify-end items-center pb-16 md:pb-24 pointer-events-none px-4">
                <div class="flex flex-col items-center pointer-events-auto opacity-0 translate-y-5 transition-all duration-1000" id="cake-action-box">
                    <button class="btn btn-secondary glass btn-md md:btn-lg px-6 md:px-8 rounded-full shadow-2xl font-playfair hover:scale-110 hover:shadow-[0_0_25px_rgba(255,182,193,0.8)] transition-all duration-300 bg-white/50 text-rose-800 border-pink-200" id="btn-light-candle">
                        Thổi Nến Nha Meo 🕯️
                    </button>
                    <div class="font-vibes text-4xl md:text-6xl text-center text-rose-900 drop-shadow-[0_2px_4px_rgba(0,0,0,0)] mt-6 hidden opacity-0 transition-opacity duration-1000 px-2" id="cake-wish">
                        Bé Cầu Nguyện i 🕯️
                    </div>
                </div>
            </div>
            <div class="hero absolute inset-0 z-20 bg-pink-900/80 backdrop-blur-lg opacity-0 pointer-events-none transition-opacity duration-1000 p-4" id="finale-overlay">
                <div class="hero-content text-center text-neutral-content w-full">
                    <div class="max-w-md w-full scale-75 transition-transform duration-1000 ease-out" id="finale-content">
                        <h1 class="font-vibes text-6xl md:text-8xl text-pink-200 drop-shadow-[0_0_20px_rgba(255,182,193,0.9)] mb-4 md:mb-2 leading-tight" id="finale-message">
                            Happy Birthday,<br class="md:hidden"/> My Princess ♡
                        </h1>
                        <p class="font-playfair italic text-sm md:text-base tracking-widest text-pink-100 mb-8 drop-shadow-md">
                            You are my favorite wish come true.
                        </p>
                        <button class="btn btn-outline btn-md rounded-full hover:scale-105 transition-transform border-pink-300 text-pink-200 hover:bg-pink-300/20" id="btn-replay">
                            Replay Our Memories ♡
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.parentContainer.appendChild(this.container);
        gsap.to(this.container, { opacity: 1, duration: 1.5, ease: 'power2.inOut' });

        this.initDOM();
        this.initThreeJS();
        this.bindEvents();

        setTimeout(() => this.playEntranceSequence(), 500);
    }

    initDOM() {
        this.threeCanvas = this.container.querySelector('#cake-three-canvas');
        this.actionBox = this.container.querySelector('#cake-action-box');
        this.btnLight = this.container.querySelector('#btn-light-candle');
        this.wishText = this.container.querySelector('#cake-wish');
        this.finaleOverlay = this.container.querySelector('#finale-overlay');
        this.btnReplay = this.container.querySelector('#btn-replay');
    }

    initThreeJS() {
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;
        const isMobile = w < 768;

        this.scene = new THREE.Scene();
        // Background pastel nhưng trầm hơn (#d8a7b1) để tôn bật ánh sáng bánh kem
        this.scene.background = new THREE.Color('#d8a7b1');
        this.scene.fog = new THREE.FogExp2('#d8a7b1', 0.015);

        this.camera = new THREE.PerspectiveCamera(isMobile ? 65 : 45, w / h, 0.1, 100);
        this.camera.position.copy(this.cameraBasePos);

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.95;
        this.threeCanvas.appendChild(this.renderer.domElement);

        const renderScene = new RenderPass(this.scene, this.camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.2, 0.4, 0.85);
        bloomPass.threshold = 0.8;
        bloomPass.strength = 0.25;

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        this.setupLighting();
        this.buildCake();
        this.buildGarden();

        if (!this.prefersReducedMotion) {
            this.createMagicalButterflies();
            this.createFairyDust();
        }

        this.scene.add(this.gardenGroup);

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleResize);
        window.addEventListener('mousemove', this.handleMouseMove);

        this.handleRender();
    }

    createFairyDust() {
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 60 : 120;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const pastelColors = [
            new THREE.Color('#ffb6c1'),
            new THREE.Color('#ffd1dc'),
            new THREE.Color('#fff0f5'),
        ];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30 + 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;

            const col = pastelColors[Math.floor(Math.random() * pastelColors.length)];
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const pMat = new THREE.PointsMaterial({
            size: 0.25,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        this.ambientParticles = new THREE.Points(pGeo, pMat);
        this.scene.add(this.ambientParticles);
    }

    createMagicalButterflies() {
        const butterflyGeo = new THREE.PlaneGeometry(0.4, 0.4);
        const butterflyMat = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        const bCount = 8;
        for (let i = 0; i < bCount; i++) {
            const butterfly = new THREE.Mesh(butterflyGeo, butterflyMat);
            butterfly.position.set((Math.random() - 0.5) * 15, Math.random() * 5, (Math.random() - 0.5) * 10);
            butterfly.userData = {
                speed: Math.random() * 0.02 + 0.015,
                angle: Math.random() * Math.PI * 2,
                yOffset: Math.random() * 10
            };
            this.gardenGroup.add(butterfly);
            this.butterflies.push(butterfly);
        }
    }

    setupLighting() {
        // Giảm nhẹ cường độ đèn nền để làm sáng bánh kem hơn
        this.lights.ambient = new THREE.AmbientLight(0xfff0f5, 0.8);
        this.scene.add(this.lights.ambient);

        this.lights.hemi = new THREE.HemisphereLight(0xffeeb1, 0xFFC0CB, 0.4);
        this.scene.add(this.lights.hemi);

        this.lights.dirLight = new THREE.DirectionalLight(0xffb6c1, 1.2);
        this.lights.dirLight.position.set(5, 10, 7);
        this.lights.dirLight.castShadow = true;
        this.lights.dirLight.shadow.mapSize.width = 1024;
        this.lights.dirLight.shadow.mapSize.height = 1024;
        this.lights.dirLight.shadow.bias = -0.0005;
        this.scene.add(this.lights.dirLight);

        this.lights.candleLight = new THREE.PointLight(0xffb700, 0, 18);
        this.scene.add(this.lights.candleLight);
    }

    buildCake() {
        this.scene.add(this.cakeGroup);
        this.cakeGroup.position.y = -1.5;

        const standMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.15, metalness: 0.9 });
        const standBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 0.6, 48), standMat);
        const standPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.5, 32), standMat);
        standPillar.position.y = 1;
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.7, 0.4, 48), standMat);
        plate.position.y = 1.9;
        plate.receiveShadow = true;

        this.cakeGroup.add(standBase, standPillar, plate);

        const frostingMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.3 });
        const creamMat = new THREE.MeshStandardMaterial({ color: 0xFFFAF0, roughness: 0.4 });
        const pearlMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.1, metalness: 0.4 });

        this.tiers = [
            this.createTier(5.5, 2.8, frostingMat, pearlMat),
            this.createTier(4.2, 2.4, creamMat, pearlMat),
            this.createTier(2.8, 2.2, frostingMat, pearlMat)
        ];

        let currentY = 2.1;
        this.tiers.forEach((tier) => {
            tier.position.y = currentY + tier.userData.height / 2;
            currentY += tier.userData.height;
            tier.scale.set(0, 0, 0);
            this.cakeGroup.add(tier);
        });

        this.candleGroup.position.y = currentY;
        const candleBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 1.8, 16),
            new THREE.MeshStandardMaterial({ color: 0xFFF0F5, roughness: 0.2 })
        );
        candleBody.position.y = 0.9;
        candleBody.castShadow = true;

        const wick = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8),
            new THREE.MeshBasicMaterial({ color: 0x333333 })
        );
        wick.position.y = 1.9;

        this.flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.9 })
        );
        this.flame.scale.set(0.6, 1.6, 0.6);
        this.flame.position.y = 2.15;
        this.flame.visible = false;

        this.candleGroup.add(candleBody, wick, this.flame);
        this.lights.candleLight.position.copy(this.candleGroup.position);
        this.lights.candleLight.position.y += 2.15;

        this.candleGroup.scale.set(0, 0, 0);
        this.cakeGroup.add(this.candleGroup);
    }

    createTier(radius, height, material, detailMat) {
        const group = new THREE.Group();
        group.userData = { height };

        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 64), material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        const pearlCount = Math.floor(radius * 12);
        const pearlGeo = new THREE.SphereGeometry(0.18, 8, 8);
        for (let i = 0; i < pearlCount; i++) {
            const angle = (i / pearlCount) * Math.PI * 2;
            const pearl = new THREE.Mesh(pearlGeo, detailMat);
            pearl.position.set(Math.cos(angle) * radius, -height / 2 + 0.18, Math.sin(angle) * radius);
            group.add(pearl);
        }
        return group;
    }

    buildGarden() {
        this.createCats(); // Mèo dưới sàn
        this.createFloatingHearts(); // Trái tim bay
        this.createFloralArrangements(); // Hoa dưới sàn

        // Thêm hiệu ứng bay mới
        this.createFloatingFlowers();
        this.createFloatingCats();
    }

    // Tạo hoa bay bồng bềnh
    createFloatingFlowers() {
        const petalGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const centerGeo = new THREE.SphereGeometry(0.1, 8, 8);

        const flowerMaterials = [
            new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.4 }),
            new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.4 }),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
        ];
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.5 });

        const fCount = 15;
        for (let i = 0; i < fCount; i++) {
            const flower = new THREE.Group();
            const mat = flowerMaterials[i % flowerMaterials.length];

            // Xếp 5 cánh hoa
            for (let p = 0; p < 5; p++) {
                const petal = new THREE.Mesh(petalGeo, mat);
                const angle = (p / 5) * Math.PI * 2;
                petal.position.set(Math.cos(angle) * 0.15, 0, Math.sin(angle) * 0.15);
                petal.scale.set(1, 0.3, 1);
                flower.add(petal);
            }
            const center = new THREE.Mesh(centerGeo, centerMat);
            flower.add(center);

            flower.position.set((Math.random() - 0.5) * 40, Math.random() * 20 - 5, (Math.random() - 0.5) * 30 - 10);
            const scale = 0.5 + Math.random() * 0.8;
            flower.scale.setScalar(scale);

            flower.userData = {
                speedY: Math.random() * 0.015 + 0.005,
                rotSpeedX: (Math.random() - 0.5) * 0.02,
                rotSpeedY: (Math.random() - 0.5) * 0.02,
                rotSpeedZ: (Math.random() - 0.5) * 0.02
            };

            this.gardenGroup.add(flower);
            this.floatingFlowers.push(flower);
        }
    }

    // Tạo mèo con bay lơ lửng
    createFloatingCats() {
        const createFloatCat = (color) => {
            const cat = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
            const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
            const pinkMat = new THREE.MeshStandardMaterial({ color: 0xFF9AAB, roughness: 0.4 });

            // Đầu mèo
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), mat);
            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), darkMat);
            eyeL.position.set(-0.3, 0.1, 0.75);
            const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), darkMat);
            eyeR.position.set(0.3, 0.1, 0.75);
            const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pinkMat);
            nose.position.set(0, -0.05, 0.8);

            const earGeo = new THREE.ConeGeometry(0.25, 0.5, 8);
            const earL = new THREE.Mesh(earGeo, mat);
            earL.position.set(-0.4, 0.7, 0.2);
            earL.rotation.set(-0.2, 0, 0.4);
            const earR = new THREE.Mesh(earGeo, mat);
            earR.position.set(0.4, 0.7, 0.2);
            earR.rotation.set(-0.2, 0, -0.4);

            cat.add(head, eyeL, eyeR, nose, earL, earR);

            cat.position.set((Math.random() - 0.5) * 35, Math.random() * 15 + 2, (Math.random() - 0.5) * 25 - 5);
            cat.scale.setScalar(0.5 + Math.random() * 0.3);

            cat.userData = {
                speedY: Math.random() * 0.01 + 0.005,
                speedX: (Math.random() - 0.5) * 0.01,
                wobbleSpeed: Math.random() * 0.05 + 0.02,
                wobbleOffset: Math.random() * Math.PI * 2
            };

            this.gardenGroup.add(cat);
            this.floatingCats.push(cat);
        };

        const colors = [0xFFFFFF, 0xFFE4B5, 0xFFDAB9, 0xFFB6C1];
        for (let i = 0; i < 8; i++) {
            createFloatCat(colors[i % colors.length]);
        }
    }

    createCats() {
        const createCat = (color, x, z, rotY) => {
            const cat = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
            const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
            const pinkMat = new THREE.MeshStandardMaterial({ color: 0xFF9AAB, roughness: 0.4 });

            const body = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), mat);
            body.position.y = 1.2;
            body.castShadow = true;

            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), darkMat);
            eyeL.position.set(-0.4, 1.4, 1.05);
            const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), darkMat);
            eyeR.position.set(0.4, 1.4, 1.05);

            const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), pinkMat);
            nose.position.set(0, 1.25, 1.15);

            const earGeo = new THREE.ConeGeometry(0.35, 0.7, 8);
            const earL = new THREE.Mesh(earGeo, mat);
            earL.position.set(-0.6, 2.2, 0.4);
            earL.rotation.set(-0.2, 0, 0.4);
            const earR = new THREE.Mesh(earGeo, mat);
            earR.position.set(0.6, 2.2, 0.4);
            earR.rotation.set(-0.2, 0, -0.4);

            const tail = new THREE.Group();
            const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8), mat);
            tailMesh.position.y = 0.75;
            tail.add(tailMesh);
            tail.position.set(0, 0.5, -1);
            tail.rotation.x = Math.PI / 2;

            cat.add(body, eyeL, eyeR, nose, earL, earR, tail);
            cat.position.set(x, -1.5, z);
            cat.rotation.y = rotY;

            cat.userData = { tail, offset: Math.random() * Math.PI * 2 };
            this.gardenGroup.add(cat);
            this.cats.push(cat);
        };

        createCat(0xFFFFFF, -8, 2, 0.6);
        createCat(0xFFE4B5, 8, 1, -0.7);
        createCat(0xFFDAB9, -4, -6, 0.3);
    }

    createFloatingHearts() {
        const shape = new THREE.Shape();
        const x = 0, y = 0;
        shape.moveTo(x + 0.25, y + 0.25);
        shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y);
        shape.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35);
        shape.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 1.0);
        shape.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35);
        shape.bezierCurveTo(x + 0.80, y, x + 0.50, y, x + 0.50, y);
        shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

        const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.03, bevelThickness: 0.03 };
        const heartGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        heartGeo.center();

        const heartMaterials = [
            new THREE.MeshStandardMaterial({ color: 0xffb3c6, roughness: 0.3, metalness: 0.1 }),
            new THREE.MeshStandardMaterial({ color: 0xffc2d1, roughness: 0.2, metalness: 0.2 }),
        ];

        const hCount = 16;
        for (let i = 0; i < hCount; i++) {
            const mat = heartMaterials[i % heartMaterials.length];
            const heart = new THREE.Mesh(heartGeo, mat);

            heart.position.set((Math.random() - 0.5) * 30, Math.random() * 15, (Math.random() - 0.5) * 20 - 5);
            const scale = 0.35 + Math.random() * 0.55;
            heart.scale.setScalar(scale);
            heart.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

            heart.userData = {
                speedY: Math.random() * 0.02 + 0.01,
                rotSpeedX: (Math.random() - 0.5) * 0.02,
                rotSpeedY: (Math.random() - 0.5) * 0.02
            };
            this.gardenGroup.add(heart);
            this.hearts.push(heart);
        }
    }

    createFloralArrangements() {
        const roseMat = new THREE.MeshStandardMaterial({ color: 0xFF69B4, roughness: 0.7 });
        const flowerCount = 20;
        for (let i = 0; i < flowerCount; i++) {
            const rose = new THREE.Group();
            const center = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), roseMat);
            rose.add(center);

            const radius = 12 + Math.random() * 5;
            const angle = (i / flowerCount) * Math.PI * 2;
            rose.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 5, Math.sin(angle) * radius - 5);
            rose.scale.setScalar(Math.random() * 1.5 + 1);
            rose.rotation.set(Math.random(), Math.random(), Math.random());
            rose.userData = { offset: Math.random() * 10 };

            this.gardenGroup.add(rose);
            this.flowers.push(rose);
        }
    }

    playEntranceSequence() {
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(this.actionBox, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' });
            }
        });

        this.tiers.forEach((tier, i) => {
            tl.to(tier.scale, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'elastic.out(1, 0.6)' }, i * 0.3);
        });

        tl.to(this.candleGroup.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'back.out(1.5)' }, "-=0.6");
    }

    bindEvents() {
        this.btnLight.addEventListener('click', () => {
            if (this.isCandleLit) return;
            this.isCandleLit = true;
            this.igniteCandle();
        });
        this.btnReplay.addEventListener('click', () => {
            if (this.callbacks.onComplete) this.callbacks.onComplete();
        });
    }

    onMouseMove(e) {
        this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    igniteCandle() {
        const tl = gsap.timeline();
        tl.to(this.btnLight, { opacity: 0, scale: 0.8, duration: 0.4, display: 'none' });

        tl.to(this.scene.background, { r: 0.15, g: 0.08, b: 0.18, duration: 3 })
            .to(this.scene.fog.color, { r: 0.15, g: 0.08, b: 0.18, duration: 3 }, "<")
            .to(this.lights.ambient, { intensity: 0.1, duration: 3 }, "<")
            .to(this.lights.hemi, { intensity: 0.1, duration: 3 }, "<")
            .to(this.lights.dirLight, { intensity: 0.05, duration: 3 }, "<");

        tl.call(() => { this.flame.visible = true; }, null, "-=1.5")
            .to(this.flame.scale, { x: 1, y: 1.6, z: 1, duration: 1.5, ease: 'elastic.out(1, 0.3)' }, "-=1.5")
            .to(this.lights.candleLight, { intensity: 10, distance: 35, duration: 2 }, "-=1.5");

        tl.call(() => {
            this.wishText.classList.remove('hidden');
            gsap.to(this.wishText, { opacity: 1, duration: 2 });
            setTimeout(() => this.blowOutCandle(), 4000);
        });
    }

    blowOutCandle() {
        this.isBlowingOut = true;
        const tl = gsap.timeline();

        if (!this.prefersReducedMotion) {
            tl.to(this.camera.position, {
                x: "+=0.1", y: "+=0.05", duration: 0.05, yoyo: true, repeat: 6
            });
        }

        tl.to(this.flame.rotation, { z: 0.8, duration: 0.08, yoyo: true, repeat: 7 }, "<")
            .to(this.flame.scale, { x: 0.3, y: 0.5, z: 0.3, duration: 0.5 }, "<")
            .to(this.lights.candleLight, { intensity: 2, duration: 0.5 }, "<");

        tl.to(this.flame.scale, { x: 0, y: 0, z: 0, duration: 0.1 })
            .to(this.lights.candleLight, { intensity: 0, duration: 0.1 }, "<")
            .call(() => { this.flame.visible = false; });

        tl.to(this.wishText, { opacity: 0, duration: 1 }, "+=0.2");

        tl.call(() => {
            this.triggerFinale();
        }, null, "+=1.5");
    }

    triggerFinale() {
        const tl = gsap.timeline();

        tl.to(this.camera.position, {
            x: "+=0.5", y: "-=0.3", duration: 0.08, yoyo: true, repeat: 5
        });

        tl.to(this.lights.candleLight, { intensity: 250, distance: 300, color: new THREE.Color(0xFF8096), duration: 0.8, ease: 'power4.in' }, "<")
            .to(this.scene.background, { r: 0.1, g: 0.02, b: 0.05, duration: 0.8 }, "<");

        tl.call(() => {
            document.getElementById('cake-wish').classList.add('hidden');
            this.fireConfetti();
        });

        tl.to(this.cakeGroup.position, { y: -10, duration: 2.5, ease: 'power2.in' }, "+=0.2")
            .to(this.cakeGroup.scale, { x: 0, y: 0, z: 0, duration: 2.5, ease: 'power2.in' }, "<");

        tl.call(() => {
            const overlay = document.getElementById('finale-overlay');
            const content = document.getElementById('finale-content');
            overlay.classList.remove('pointer-events-none', 'opacity-0');
            overlay.classList.add('opacity-100');

            setTimeout(() => {
                content.classList.remove('scale-75');
                content.classList.add('scale-100');
            }, 100);
        });
    }

    fireConfetti() {
        const duration = 4500;
        const end = Date.now() + duration;

        const frame = () => {
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 65,
                    origin: { x: 0, y: 0.6 },
                    colors: ['#FFB6C1', '#FF69B4', '#FFD700', '#FFFFFF']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 65,
                    origin: { x: 1, y: 0.6 },
                    colors: ['#FFB6C1', '#FF69B4', '#FFD700', '#FFFFFF']
                });
            }
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
    }

    render() {
        this.animationFrameId = requestAnimationFrame(this.handleRender);
        const time = this.clock.getElapsedTime();

        const targetX = this.cameraBasePos.x + this.mouseX * 2.5;
        const targetY = this.cameraBasePos.y + this.mouseY * 2.5;
        this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, 3, 0);

        if (this.cakeGroup) {
            this.cakeGroup.position.y = -1.5 + Math.sin(time * 1.5) * 0.04;
        }

        if (this.flame && this.flame.visible && !this.isBlowingOut) {
            this.flame.scale.x = 0.9 + Math.sin(time * 25) * 0.1;
            this.flame.scale.z = 0.9 + Math.cos(time * 20) * 0.1;
            this.lights.candleLight.intensity = 10 + Math.sin(time * 15) * 1.5;
        }

        // Animate mèo nằm đất
        this.cats.forEach(cat => {
            cat.position.y = -1.5 + Math.sin(time * 2 + cat.userData.offset) * 0.04;
            cat.userData.tail.rotation.z = Math.sin(time * 3 + cat.userData.offset) * 0.2;
        });

        // Animate tim bay
        this.hearts.forEach(heart => {
            heart.position.y += heart.userData.speedY;
            heart.rotation.x += heart.userData.rotSpeedX;
            heart.rotation.y += heart.userData.rotSpeedY;
            if (heart.position.y > 15) heart.position.y = -5;
        });

        // Animate hoa bay
        this.floatingFlowers.forEach(flower => {
            flower.position.y += flower.userData.speedY;
            flower.rotation.x += flower.userData.rotSpeedX;
            flower.rotation.y += flower.userData.rotSpeedY;
            flower.rotation.z += flower.userData.rotSpeedZ;
            if (flower.position.y > 20) flower.position.y = -5;
        });

        // Animate mèo con lơ lửng
        this.floatingCats.forEach(cat => {
            cat.position.y += cat.userData.speedY + Math.sin(time * cat.userData.wobbleSpeed + cat.userData.wobbleOffset) * 0.01;
            cat.position.x += cat.userData.speedX;
            cat.rotation.y = Math.sin(time * cat.userData.wobbleSpeed + cat.userData.wobbleOffset) * 0.2;
            cat.rotation.z = Math.cos(time * cat.userData.wobbleSpeed + cat.userData.wobbleOffset) * 0.1;
            if (cat.position.y > 20) {
                cat.position.y = -5;
                cat.position.x = (Math.random() - 0.5) * 35;
            }
        });

        // Animate hoa nằm đất
        this.flowers.forEach(flower => {
            flower.rotation.x = Math.sin(time * 1.2 + flower.userData.offset) * 0.05;
            flower.rotation.z = Math.cos(time * 1.1 + flower.userData.offset) * 0.05;
        });

        if (this.butterflies) {
            this.butterflies.forEach(b => {
                b.position.x += Math.sin(time * 2 + b.userData.angle) * 0.05;
                b.position.y += Math.cos(time * 3 + b.userData.yOffset) * 0.02;
                b.position.z += Math.cos(time * 1.5 + b.userData.angle) * 0.05;
                b.rotation.y = time * 5 * b.userData.speed;
            });
        }

        if (this.ambientParticles) {
            this.ambientParticles.rotation.y = time * 0.02;
            const pos = this.ambientParticles.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) pos[i + 1] += Math.sin(time + pos[i]) * 0.005;
            this.ambientParticles.geometry.attributes.position.needsUpdate = true;
        }

        this.composer.render();
    }

    onWindowResize() {
        if (!this.camera || !this.renderer || !this.container) return;
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;
        const isMobile = w < 768;

        this.cameraBasePos.set(0, isMobile ? 10 : 7, isMobile ? 48 : 35);
        this.camera.aspect = w / h;
        this.camera.fov = isMobile ? 65 : 45;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        if (this.composer) {
            this.composer.setSize(w, h);
        }
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);
        if (this.backBtn) this.backBtn.destroy();
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

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
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}