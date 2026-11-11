import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================================================
// 1. THREE.JS SCENE, CAMERA & HIGH-PRECISION PHYSICAL GLASS RENDERER
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;

if (container) {
    container.appendChild(renderer.domElement);
}

// ============================================================================
// 2. SEAMLESS PEARL-BLUSH STUDIO BACKGROUND (FOR TRUE GLASS REFRACTION)
// ============================================================================
// Three.js physical transmission (`transmission: 1.0`) refracts `scene.background`
// and opaque scene geometry. Having a rich, soft couture studio canvas in
// `scene.background` ensures real lens magnification & refraction inside the horse.
function createCoutureStudioBackground() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext('2d');

    // Base soft pearl-blush couture gradient matching style.css
    const baseGrad = ctx.createRadialGradient(310, 380, 40, 512, 512, 760);
    baseGrad.addColorStop(0.0, '#fffcfe');
    baseGrad.addColorStop(0.45, '#fdf4f9');
    baseGrad.addColorStop(1.0, '#f7e6f0');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle luminous pastel aura behind the left-side sculpture stage
    // Gives the curved clear crystal body delicate rose/sky/lilac caustics to bend
    const stageWash = ctx.createRadialGradient(320, 490, 20, 320, 490, 340);
    stageWash.addColorStop(0.0, 'rgba(232, 185, 215, 0.34)');
    stageWash.addColorStop(0.38, 'rgba(196, 181, 253, 0.20)');
    stageWash.addColorStop(0.68, 'rgba(186, 230, 253, 0.14)');
    stageWash.addColorStop(1.0, 'rgba(253, 244, 249, 0.0)');
    ctx.fillStyle = stageWash;
    ctx.fillRect(0, 0, 1024, 1024);

    // Upper-right whisper of lilac-rose mist
    const cornerWash = ctx.createRadialGradient(840, 240, 30, 840, 240, 380);
    cornerWash.addColorStop(0.0, 'rgba(244, 198, 226, 0.24)');
    cornerWash.addColorStop(1.0, 'rgba(253, 244, 249, 0.0)');
    ctx.fillStyle = cornerWash;
    ctx.fillRect(0, 0, 1024, 1024);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

scene.background = createCoutureStudioBackground();

// ============================================================================
// 3. BACCARAT / SWAROVSKI BRIGHT-FIELD & DARK-LINE CRYSTAL STUDIO PMREM
// ============================================================================
// Real clear blown crystal gets its signature liquid transparency, bright white
// hip/rib contour loops, and dark-line glass edges from high-contrast studio
// softboxes paired with deep negative-fill studio cards.
function buildCrystalStudioEnvironment(glRenderer) {
    const envScene = new THREE.Scene();
    // Deep plum-graphite negative-fill dome -> gives clear crystal crisp dark-line edges!
    envScene.background = new THREE.Color('#221728');

    const addPanel = (w, h, color, pos, lookAtPos) => {
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
        );
        mesh.position.set(...pos);
        mesh.lookAt(...lookAtPos);
        envScene.add(mesh);
    };

    // Overhead main bright white softbox (creates crisp top crest, back & croup highlights)
    addPanel(14, 8, new THREE.Color(11.0, 11.0, 11.4), [0, 9.5, 1.5], [0, 0, 0]);

    // Front-left key studio softbox (creates signature oval specular loops on hip, ribs & shoulder)
    addPanel(6.5, 11, new THREE.Color(10.5, 10.2, 10.6), [-8.5, 3.2, 7.5], [0, 0, 0]);

    // Front-right narrow catchlight strip (illuminates arched neck, dished head & teacup muzzle)
    addPanel(4.2, 10, new THREE.Color(9.5, 9.4, 9.8), [8.5, 2.8, 6.8], [0, 0, 0]);

    // Back-rim crystal halo softboxes (lights up blown-glass tail, ears & legs from behind)
    addPanel(11, 6, new THREE.Color(8.0, 7.6, 8.4), [-4.0, 4.0, -9.5], [0, 0, 0]);
    addPanel(9, 6, new THREE.Color(7.2, 7.4, 8.2), [5.0, 2.5, -9.5], [0, 0, 0]);

    // Luminous white studio tabletop bounce beneath hooves
    addPanel(18, 18, new THREE.Color(3.4, 3.2, 3.5), [0, -8.5, 0], [0, 0, 0]);

    // Delicate couture pastel prism accent strips (subtle rose-quartz, sky & lilac fire)
    addPanel(3.2, 9, new THREE.Color(4.6, 1.7, 3.1), [-9.5, -1.0, 1.5], [0, 0, 0]);
    addPanel(3.2, 9, new THREE.Color(1.7, 3.3, 4.8), [9.5, 0.5, 1.0], [0, 0, 0]);
    addPanel(8.0, 2.5, new THREE.Color(3.2, 1.9, 4.6), [0, -3.5, 9.5], [0, 0, 0]);

    const pmrem = new THREE.PMREMGenerator(glRenderer);
    const envTex = pmrem.fromScene(envScene, 0.028).texture;
    pmrem.dispose();
    return envTex;
}

scene.environment = buildCrystalStudioEnvironment(renderer);

// ============================================================================
// 4. SHOW-RING LIGHTING PALETTES (WATER-CLEAR / BLUSH QUARTZ / OPAL PRISM)
// ============================================================================
const SPECTRUMS = {
    rainbow: {
        rosette: ['#ec4899', '#fb7185', '#f59e0b', '#10b981', '#38bdf8', '#a855f7'],
        attenuation: '#fdf4f9', // 98% water-clear Baccarat crystal with whisper blush
        dispersion: 2.2,
        lightA: '#f472b6',
        lightB: '#38bdf8',
        lightC: '#a855f7',
        ringAccent: '#f3a6ce'
    },
    rose: {
        rosette: ['#be185d', '#ec4899', '#f472b6', '#fda4af', '#f59e0b', '#d946ef'],
        attenuation: '#fce7f3', // Delicate clear blush rose-quartz crystal
        dispersion: 1.8,
        lightA: '#ec4899',
        lightB: '#fda4af',
        lightC: '#f59e0b',
        ringAccent: '#f472b6'
    },
    opal: {
        rosette: ['#f472b6', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#fb7185'],
        attenuation: '#f3e8ff', // Clear icy diamond-opal crystal
        dispersion: 2.8,
        lightA: '#38bdf8',
        lightB: '#c084fc',
        lightC: '#2dd4bf',
        ringAccent: '#c4b5fd'
    }
};

// ============================================================================
// 5. WATER-CLEAR BLOWN-CRYSTAL ARABIAN SCULPTURE (3D ANATOMICAL GLB)
// ============================================================================
const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffffff'),
    attenuationColor: new THREE.Color(SPECTRUMS.rainbow.attenuation),
    attenuationDistance: 3.8,
    metalness: 0.0,
    roughness: 0.016,
    transmission: 1.0,
    ior: 1.545,
    thickness: 0.88,
    dispersion: SPECTRUMS.rainbow.dispersion,
    iridescence: 0.32,
    iridescenceIOR: 1.34,
    iridescenceThicknessRange: [150, 520],
    specularIntensity: 1.0,
    specularColor: new THREE.Color('#ffffff'),
    clearcoat: 1.0,
    clearcoatRoughness: 0.015,
    envMapIntensity: 1.42
});

const stageGroup = new THREE.Group();
const horsePivot = new THREE.Group();
// Slight 3/4 presentation angle so all 4 crystal legs, both 3D ears & curved barrel shine
const BASE_YAW = -0.19;
horsePivot.rotation.y = BASE_YAW;
stageGroup.add(horsePivot);

const gltfLoader = new GLTFLoader();
gltfLoader.load(
    'arabian_crystal.glb?v=5',
    (gltf) => {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeVertexNormals();
                child.material = crystalMaterial;
            }
        });
        horsePivot.add(gltf.scene);
    },
    undefined,
    (err) => {
        console.error('Failed to load arabian_crystal.glb:', err);
    }
);

// ============================================================================
// 6. SUBTLE REFRACTIVE STUDIO BACKDROP DISC & CHAMPIONSHIP SHOW-RING PLINTH
// ============================================================================
// Opaque (`transparent: false`) soft-edged cameo disc behind the horse so
// Three.js's transmission pass bends delicate pastel rings through the glass belly & legs!
function createShowFloorGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const g = ctx.createRadialGradient(256, 256, 12, 256, 256, 250);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 0.85)');
    g.addColorStop(0.42, 'rgba(251, 207, 232, 0.38)');
    g.addColorStop(0.75, 'rgba(233, 213, 255, 0.16)');
    g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

const showRingY = -1.39;
const showRingGroup = new THREE.Group();
showRingGroup.position.set(0, showRingY, 0);

// Soft seamless pearlescent spotlight pool beneath crystal hooves
const floorDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.95, 96),
    new THREE.MeshBasicMaterial({
        map: createShowFloorGlowTexture(),
        transparent: true,
        opacity: 0.88,
        depthWrite: false
    })
);
floorDisc.rotation.x = -Math.PI / 2;
showRingGroup.add(floorDisc);

const innerRingMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#f3a6ce')
});
const innerArenaRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.38, 0.0075, 16, 128),
    innerRingMat
);
innerArenaRing.rotation.x = Math.PI / 2;
innerArenaRing.position.y = 0.004;
showRingGroup.add(innerArenaRing);

const outerArenaRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.76, 0.006, 16, 140),
    new THREE.MeshBasicMaterial({
        color: new THREE.Color('#d8b4fe')
    })
);
outerArenaRing.rotation.x = Math.PI / 2;
outerArenaRing.position.y = 0.004;
showRingGroup.add(outerArenaRing);

// Scalloped Championship Rosette Ribbon Ring around the Show Plinth (opaque for crisp refraction)
function createScallopedRosetteRing() {
    const segments = 240;
    const pleats = 32;
    const pts = [];
    const colors = [];
    const pastelRosette = ['#f472b6', '#fda4af', '#fcd34d', '#6ee7b7', '#7dd3fc', '#c4b5fd'];
    const palette = pastelRosette.map((h) => new THREE.Color(h));

    for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const theta = u * Math.PI * 2;
        const r = 1.57 + Math.sin(theta * pleats) * 0.052;
        pts.push(new THREE.Vector3(Math.cos(theta) * r, 0.006, Math.sin(theta) * r));

        const cIdx = (u * palette.length) % palette.length;
        const i0 = Math.floor(cIdx) % palette.length;
        const i1 = (i0 + 1) % palette.length;
        const c = palette[i0].clone().lerp(palette[i1], cIdx - Math.floor(cIdx));
        colors.push(c.r, c.g, c.b);
    }

    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.LineBasicMaterial({
        vertexColors: true
    });
    return new THREE.Line(geo, mat);
}

const rosetteRibbonRing = createScallopedRosetteRing();
showRingGroup.add(rosetteRibbonRing);

// Expanding Spotlight Pulse Ring when user triggers Spotlight
const pulseRingMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ec4899'),
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false
});
const pulseRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(1.18, 1.25, 96),
    pulseRingMat
);
pulseRingMesh.rotation.x = -Math.PI / 2;
pulseRingMesh.position.y = 0.012;
showRingGroup.add(pulseRingMesh);

stageGroup.add(showRingGroup);
scene.add(stageGroup);

// ============================================================================
// 7. STUDIO KEY & RIM SPOTLIGHTS (CRISP CRYSTAL SPECULAR HIGHLIGHTS)
// ============================================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(-3.5, 6.8, 5.5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xfff5fa, 1.6);
rimLight.position.set(3.2, 4.5, -5.0);
scene.add(rimLight);

const lightRose = new THREE.PointLight(0xf472b6, 1.8, 28);
lightRose.position.set(-4.8, 3.6, 4.0);
scene.add(lightRose);

const lightPrism = new THREE.PointLight(0x38bdf8, 1.5, 28);
lightPrism.position.set(4.2, 3.2, 3.8);
scene.add(lightPrism);

const lightLilac = new THREE.PointLight(0xa855f7, 1.6, 28);
lightLilac.position.set(1.2, -3.5, 3.4);
scene.add(lightLilac);

let targetAttenuationColor = new THREE.Color(SPECTRUMS.rainbow.attenuation);
let targetDispersion = SPECTRUMS.rainbow.dispersion;
let targetLightAColor = new THREE.Color(SPECTRUMS.rainbow.lightA);
let targetLightBColor = new THREE.Color(SPECTRUMS.rainbow.lightB);
let targetLightCColor = new THREE.Color(SPECTRUMS.rainbow.lightC);
let targetRingColor = new THREE.Color(SPECTRUMS.rainbow.ringAccent);

// ============================================================================
// 8. RESPONSIVE STAGE POSITIONING
// ============================================================================
let stageBaseX = -2.15;
let stageBaseY = 0.16;

function updateResponsiveLayout() {
    const w = window.innerWidth;
    if (w < 900) {
        stageGroup.scale.setScalar(0.86);
        camera.position.set(0, 0.25, 7.8);
        stageBaseX = 0.0;
        stageBaseY = 1.48;
    } else if (w < 1200) {
        stageGroup.scale.setScalar(1.08);
        camera.position.set(0, 0.18, 6.8);
        stageBaseX = -1.95;
        stageBaseY = 0.15;
    } else {
        stageGroup.scale.setScalar(1.24);
        camera.position.set(0, 0.16, 6.35);
        stageBaseX = -2.18;
        stageBaseY = 0.16;
    }
    stageGroup.position.set(stageBaseX, stageBaseY, 0);
}
updateResponsiveLayout();

// ============================================================================
// 9. INTERACTIVE SHOW SPOTLIGHT, CURSOR TURNTABLE & SPARKLES
// ============================================================================
let mouseNormX = 0;
let mouseNormY = 0;
let spotlightPulse = 0;
let showPoseTurn = 0;

const sparkleCanvas = document.getElementById('sparkle-canvas');
const sCtx = sparkleCanvas ? sparkleCanvas.getContext('2d') : null;
const sparkles = [];
const SPARKLE_HUES = ['#ec4899', '#fb7185', '#f59e0b', '#34d399', '#38bdf8', '#a855f7'];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeSparkleCanvas() {
    if (!sparkleCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    sparkleCanvas.width = window.innerWidth * dpr;
    sparkleCanvas.height = window.innerHeight * dpr;
    if (sCtx) sCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeSparkleCanvas();

function spawnSparkle(x, y, burst = false) {
    if (prefersReducedMotion || sparkles.length > 90) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? (1.2 + Math.random() * 2.6) : (0.22 + Math.random() * 0.65);
    sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (burst ? 0.35 : 0.3),
        size: burst ? (2.4 + Math.random() * 3.4) : (1.5 + Math.random() * 2.0),
        life: 1.0,
        decay: burst ? (0.016 + Math.random() * 0.014) : (0.025 + Math.random() * 0.018),
        color: SPARKLE_HUES[Math.floor(Math.random() * SPARKLE_HUES.length)]
    });
}

function triggerShowSpotlight(originX, originY) {
    spotlightPulse = 1.0;
    showPoseTurn = 0.34;
    const cx = originX ?? window.innerWidth * 0.32;
    const cy = originY ?? window.innerHeight * 0.48;
    for (let i = 0; i < 24; i++) {
        spawnSparkle(cx, cy, true);
    }
}

let lastSparkleTime = 0;
window.addEventListener('pointermove', (e) => {
    mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNormY = (e.clientY / window.innerHeight) * 2 - 1;

    const now = performance.now();
    if (now - lastSparkleTime > 55) {
        spawnSparkle(e.clientX, e.clientY, false);
        lastSparkleTime = now;
    }
});

if (container) {
    container.addEventListener('click', (e) => {
        triggerShowSpotlight(e.clientX, e.clientY);
    });
}

const prismPulseBtn = document.getElementById('prism-pulse-btn');
if (prismPulseBtn) {
    prismPulseBtn.addEventListener('click', () => {
        const rect = prismPulseBtn.getBoundingClientRect();
        triggerShowSpotlight(rect.left + rect.width / 2, rect.top);
    });
}

const heroEmblem = document.getElementById('hero-emblem');
if (heroEmblem) {
    heroEmblem.addEventListener('click', () => {
        const rect = heroEmblem.getBoundingClientRect();
        triggerShowSpotlight(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
}

// Ring Light Spectrum Switcher
const spectrumBtns = document.querySelectorAll('.spectrum-btn');
spectrumBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-spectrum');
        if (!key || !SPECTRUMS[key]) return;

        spectrumBtns.forEach((b) => b.classList.toggle('active', b === btn));

        const spec = SPECTRUMS[key];
        targetAttenuationColor.set(spec.attenuation);
        targetDispersion = spec.dispersion;
        targetLightAColor.set(spec.lightA);
        targetLightBColor.set(spec.lightB);
        targetLightCColor.set(spec.lightC);
        targetRingColor.set(spec.ringAccent);

        const rect = btn.getBoundingClientRect();
        triggerShowSpotlight(rect.left + rect.width / 2, rect.top);
    });
});

document.querySelectorAll('.spotlight-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
});

// ============================================================================
// 10. ANIMATION LOOP
// ============================================================================
const clock = new THREE.Clock();

function renderSparkles() {
    if (!sCtx || !sparkleCanvas) return;
    sCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
            sparkles.splice(i, 1);
            continue;
        }

        sCtx.save();
        sCtx.globalAlpha = p.life * 0.78;
        sCtx.fillStyle = p.color;
        sCtx.translate(p.x, p.y);
        sCtx.rotate((1 - p.life) * 2.2);

        const r = p.size * (0.5 + p.life * 0.5);
        sCtx.beginPath();
        sCtx.moveTo(0, -r * 1.4);
        sCtx.quadraticCurveTo(0, 0, r * 1.4, 0);
        sCtx.quadraticCurveTo(0, 0, 0, r * 1.4);
        sCtx.quadraticCurveTo(0, 0, -r * 1.4, 0);
        sCtx.quadraticCurveTo(0, 0, 0, -r * 1.4);
        sCtx.closePath();
        sCtx.fill();
        sCtx.restore();
    }
}

function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    spotlightPulse = Math.max(0, spotlightPulse - 0.016);
    showPoseTurn *= 0.94;

    // Smoothly transition crystal clarity, dispersion & spotlight hues
    crystalMaterial.attenuationColor.lerp(targetAttenuationColor, 0.05);
    crystalMaterial.dispersion += (targetDispersion - crystalMaterial.dispersion) * 0.05;
    lightRose.color.lerp(targetLightAColor, 0.05);
    lightPrism.color.lerp(targetLightBColor, 0.05);
    lightLilac.color.lerp(targetLightCColor, 0.05);
    innerRingMat.color.lerp(targetRingColor, 0.05);

    // Gentle floating poise
    stageGroup.position.y = stageBaseY + Math.sin(t * 0.65) * 0.04;

    // Interactive 3D crystal turntable (reveals full 3D depth, all 4 legs & both ears)
    const targetRotY = BASE_YAW + mouseNormX * 0.52 + Math.sin(t * 0.30) * 0.15 + showPoseTurn;
    const targetRotX = mouseNormY * 0.10;

    horsePivot.rotation.y += (targetRotY - horsePivot.rotation.y) * 0.06;
    horsePivot.rotation.x += (targetRotX - horsePivot.rotation.x) * 0.06;

    // Slowly rotate scalloped Championship Rosette Ring on the show plinth
    rosetteRibbonRing.rotation.y = t * 0.12;

    // Animate Championship Spotlight Ripple Ring
    if (spotlightPulse > 0.005) {
        const progress = 1 - spotlightPulse;
        const scale = 0.85 + progress * 0.85;
        pulseRingMesh.scale.setScalar(scale);
        pulseRingMat.opacity = spotlightPulse * 0.65;
    } else {
        pulseRingMat.opacity = 0;
    }

    renderer.render(scene, camera);
    renderSparkles();
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateResponsiveLayout();
    resizeSparkleCanvas();
});

// ============================================================================
// 11. NAVIGATION, INDIVIDUAL GLASS CARDS & COPY EMAIL LOGIC
// ============================================================================
const navHome = document.getElementById('nav-home');
const navAbout = document.getElementById('nav-about');
const aboutSubtabs = document.getElementById('about-subtabs');
const heroCard = document.getElementById('hero-card');
const exploreAboutBtn = document.getElementById('explore-about-btn');
const tabPills = document.querySelectorAll('.tab-pill');
const detailCards = document.querySelectorAll('.glass-detail-card');
const closeCardBtns = document.querySelectorAll('.card-close-btn');
const stepBtns = document.querySelectorAll('.card-step-btn');
const footerCardLinks = document.querySelectorAll('.footer-card-link');

function showHomeView() {
    detailCards.forEach((card) => {
        card.hidden = true;
    });
    tabPills.forEach((pill) => {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
    });
    if (aboutSubtabs) aboutSubtabs.hidden = true;
    if (heroCard) heroCard.hidden = false;

    if (navHome) {
        navHome.classList.add('active');
        navHome.setAttribute('aria-current', 'page');
    }
    if (navAbout) {
        navAbout.classList.remove('active');
        navAbout.setAttribute('aria-expanded', 'false');
    }
}

function showAboutCard(cardId) {
    if (!cardId || cardId === 'home') {
        showHomeView();
        return;
    }

    const isLegalCard = cardId === 'card-privacy' || cardId === 'card-terms';

    if (heroCard) heroCard.hidden = true;
    if (aboutSubtabs) aboutSubtabs.hidden = isLegalCard;

    if (navHome) {
        navHome.classList.remove('active');
        navHome.removeAttribute('aria-current');
    }
    if (navAbout) {
        navAbout.classList.toggle('active', !isLegalCard);
        navAbout.setAttribute('aria-expanded', isLegalCard ? 'false' : 'true');
    }

    detailCards.forEach((card) => {
        card.hidden = card.id !== cardId;
    });

    tabPills.forEach((pill) => {
        const isMatch = pill.getAttribute('data-card') === cardId;
        pill.classList.toggle('active', isMatch);
        pill.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
}

if (navHome) {
    navHome.addEventListener('click', showHomeView);
}

if (navAbout) {
    navAbout.addEventListener('click', () => {
        const isAboutActive = navAbout.classList.contains('active');
        if (isAboutActive) {
            showHomeView();
        } else {
            showAboutCard('card-1');
        }
    });
}

if (exploreAboutBtn) {
    exploreAboutBtn.addEventListener('click', () => {
        showAboutCard('card-1');
    });
}

tabPills.forEach((pill) => {
    pill.addEventListener('click', () => {
        showAboutCard(pill.getAttribute('data-card'));
    });
});

closeCardBtns.forEach((btn) => {
    btn.addEventListener('click', showHomeView);
});

stepBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        showAboutCard(btn.getAttribute('data-target'));
    });
});

footerCardLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showAboutCard(link.getAttribute('data-card'));
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        showHomeView();
    }
});

const copyToast = document.getElementById('copy-toast');
let toastTimer = null;

document.querySelectorAll('.copy-pill').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const email = btn.getAttribute('data-copy');
        if (!email) return;
        try {
            await navigator.clipboard.writeText(email);
            btn.textContent = 'Copied';
            setTimeout(() => {
                btn.textContent = 'Copy';
            }, 1600);

            if (copyToast) {
                copyToast.textContent = `Copied ${email}`;
                copyToast.hidden = false;
                clearTimeout(toastTimer);
                toastTimer = setTimeout(() => {
                    copyToast.hidden = true;
                }, 2000);
            }
        } catch {
            window.location.href = `mailto:${email}`;
        }
    });
});
