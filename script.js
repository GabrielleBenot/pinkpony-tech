import * as THREE from 'three';

// ============================================================================
// 1. THREE.JS SCENE, CAMERA & TRANSPARENT LIQUID-GLASS STAGE
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

if (container) {
    container.appendChild(renderer.domElement);
}

// ============================================================================
// 2. RING-LIGHT GLASSMORPHISM PRISM PALETTES (ROSETTE / ROSE / PEARL)
// ============================================================================
const SPECTRUMS = {
    rainbow: {
        rosette: ['#ec4899', '#fb7185', '#f59e0b', '#10b981', '#38bdf8', '#a855f7'],
        prismA: '#f472b6',
        prismB: '#38bdf8',
        prismC: '#c084fc',
        tintMix: 0.0,
        tintColor: '#ffffff',
        ringAccent: '#ec4899'
    },
    rose: {
        rosette: ['#be185d', '#ec4899', '#f472b6', '#fda4af', '#f59e0b', '#d946ef'],
        prismA: '#ec4899',
        prismB: '#fda4af',
        prismC: '#fbbf24',
        tintMix: 0.14,
        tintColor: '#fbcfe8',
        ringAccent: '#db2777'
    },
    opal: {
        rosette: ['#f472b6', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#fb7185'],
        prismA: '#38bdf8',
        prismB: '#c084fc',
        prismC: '#5eead4',
        tintMix: 0.14,
        tintColor: '#e0e7ff',
        ringAccent: '#8b5cf6'
    }
};

// ============================================================================
// 3. 3D RELIEF GLASSMORPHED SHOW ARABIAN SCULPTURE + LIVE PRISM SHADER
// ============================================================================
const stageGroup = new THREE.Group();
const horsePivot = new THREE.Group();
stageGroup.add(horsePivot);

const textureLoader = new THREE.TextureLoader();
const colorTex = textureLoader.load('arabian_glassmorph.webp?v=6');
colorTex.minFilter = THREE.LinearMipmapLinearFilter;
colorTex.magFilter = THREE.LinearFilter;
colorTex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

const reliefTex = textureLoader.load('arabian_glass_relief.webp?v=6');
reliefTex.minFilter = THREE.LinearFilter;
reliefTex.magFilter = THREE.LinearFilter;

const glassArabianUniforms = {
    uColorMap: { value: colorTex },
    uReliefMap: { value: reliefTex },
    uTime: { value: 0.0 },
    uReliefDepth: { value: 0.24 },
    uMouse: { value: new THREE.Vector2(0.0, 0.0) },
    uPulse: { value: 0.0 },
    uPrismA: { value: new THREE.Color(SPECTRUMS.rainbow.prismA) },
    uPrismB: { value: new THREE.Color(SPECTRUMS.rainbow.prismB) },
    uPrismC: { value: new THREE.Color(SPECTRUMS.rainbow.prismC) },
    uTintColor: { value: new THREE.Color(SPECTRUMS.rainbow.tintColor) },
    uTintMix: { value: SPECTRUMS.rainbow.tintMix }
};

const glassArabianMaterial = new THREE.ShaderMaterial({
    uniforms: glassArabianUniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
        uniform sampler2D uReliefMap;
        uniform float uReliefDepth;
        uniform float uTime;

        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
            vUv = uv;
            float relief = texture2D(uReliefMap, uv).a;

            vec3 pos = position;
            // Smooth 3D sculptural glass volume relief (0 at silhouette edge -> zero seam)
            pos.z += relief * uReliefDepth;

            // Delicate living liquid-crystal shimmer on cascading tail & mane plumes
            float tailZone = smoothstep(0.32, 0.04, uv.x);
            pos.z += sin(uTime * 1.6 + uv.y * 7.0) * 0.016 * tailZone * relief;
            pos.x += cos(uTime * 1.3 + uv.y * 5.5) * 0.008 * tailZone * relief;

            vec4 worldPos = modelMatrix * vec4(pos, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: /* glsl */ `
        uniform sampler2D uColorMap;
        uniform sampler2D uReliefMap;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPulse;
        uniform vec3 uPrismA;
        uniform vec3 uPrismB;
        uniform vec3 uPrismC;
        uniform vec3 uTintColor;
        uniform float uTintMix;

        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
            vec4 base = texture2D(uColorMap, vUv);
            if (base.a < 0.008) discard;

            vec4 nr = texture2D(uReliefMap, vUv);
            vec3 localNormal = normalize(nr.rgb * 2.0 - 1.0);
            vec3 N = normalize(mat3(modelMatrix) * localNormal);
            float thickness = nr.a;

            // Cursor-steered studio key light + counter-prism rim light
            vec3 L1 = normalize(vec3(uMouse.x * 0.85 - 0.25, -uMouse.y * 0.75 + 0.48, 1.0));
            vec3 L2 = normalize(vec3(-uMouse.x * 0.65 + 0.45, uMouse.y * 0.55 - 0.25, 0.85));
            vec3 V = vec3(0.0, 0.0, 1.0);

            vec3 H1 = normalize(L1 + V);
            vec3 H2 = normalize(L2 + V);

            float specSharp = pow(max(dot(N, H1), 0.0), 42.0);
            float specSoft  = pow(max(dot(N, H2), 0.0), 16.0);
            float fresnel   = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);

            // Flowing pastel rainbow prism caustic dispersion across glass contours
            float phase = dot(N.xy, vec2(3.6, 2.8)) + vUv.x * 4.2 - vUv.y * 2.6 + uTime * 0.55 + uMouse.x * 1.4;
            vec3 prismBand = 0.34 * uPrismA * (0.5 + 0.5 * sin(phase))
                           + 0.33 * uPrismB * (0.5 + 0.5 * sin(phase + 2.094))
                           + 0.33 * uPrismC * (0.5 + 0.5 * sin(phase + 4.188));

            vec3 col = base.rgb;

            // Apply optional subtle Ring-Light crystal mode tint (Rose / Pearl)
            col = mix(col, col * (0.86 + 0.26 * uTintColor), uTintMix);

            // Add interactive cursor-tracked prism caustics & crisp liquid-glass glints
            float causticMask = smoothstep(0.08, 0.65, thickness) * (0.35 + 0.65 * fresnel);
            col += prismBand * (specSoft * 0.20 + causticMask * 0.085);
            col += vec3(1.0, 0.99, 1.0) * specSharp * 0.24 * smoothstep(0.05, 0.4, thickness);

            // Interactive Spotlight shockwave sweeping outward from sculpture heart
            if (uPulse > 0.005) {
                float progress = 1.0 - uPulse;
                float distFromChest = length(vUv - vec2(0.58, 0.48));
                float waveRing = exp(-pow((distFromChest - progress * 0.88) * 9.5, 2.0));
                col += (prismBand * 0.55 + vec3(0.45)) * waveRing * uPulse * 0.65;
            }

            gl_FragColor = vec4(clamp(col, 0.0, 1.0), base.a);
        }
    `
});

// Aspect ratio of cropped sculpture = 974 / 913 = 1.0668
const arabianPlaneGeo = new THREE.PlaneGeometry(3.62, 3.39, 160, 160);
const arabianMesh = new THREE.Mesh(arabianPlaneGeo, glassArabianMaterial);
horsePivot.add(arabianMesh);

// ============================================================================
// 4. DELICATE PEARLESCENT SHOW-RING HALO BENEATH HOOVES
// ============================================================================
function createShowFloorGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const g = ctx.createRadialGradient(256, 256, 12, 256, 256, 250);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 0.82)');
    g.addColorStop(0.42, 'rgba(251, 207, 232, 0.36)');
    g.addColorStop(0.75, 'rgba(233, 213, 255, 0.16)');
    g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    return new THREE.CanvasTexture(c);
}

// Standing hooves rest cleanly at y = -1.515 in sculpture coordinates
const showRingGroup = new THREE.Group();
showRingGroup.position.set(-0.02, -1.52, -0.15);

const floorDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.92, 84),
    new THREE.MeshBasicMaterial({
        map: createShowFloorGlowTexture(),
        transparent: true,
        opacity: 0.85,
        depthWrite: false
    })
);
floorDisc.rotation.x = -Math.PI / 2;
showRingGroup.add(floorDisc);

const innerRingMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ec4899'),
    transparent: true,
    opacity: 0.34
});
const innerArenaRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.36, 0.0075, 16, 128),
    innerRingMat
);
innerArenaRing.rotation.x = Math.PI / 2;
showRingGroup.add(innerArenaRing);

const outerArenaRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.74, 0.006, 16, 140),
    new THREE.MeshBasicMaterial({
        color: new THREE.Color('#a855f7'),
        transparent: true,
        opacity: 0.22
    })
);
outerArenaRing.rotation.x = Math.PI / 2;
showRingGroup.add(outerArenaRing);

// Scalloped Championship Rosette Ribbon Ring around the Show Plinth
function createScallopedRosetteRing() {
    const segments = 240;
    const pleats = 32;
    const pts = [];
    const colors = [];
    const palette = SPECTRUMS.rainbow.rosette.map((h) => new THREE.Color(h));

    for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const theta = u * Math.PI * 2;
        const r = 1.55 + Math.sin(theta * pleats) * 0.052;
        pts.push(new THREE.Vector3(Math.cos(theta) * r, 0.005, Math.sin(theta) * r));

        const cIdx = (u * palette.length) % palette.length;
        const i0 = Math.floor(cIdx) % palette.length;
        const i1 = (i0 + 1) % palette.length;
        const c = palette[i0].clone().lerp(palette[i1], cIdx - Math.floor(cIdx));
        colors.push(c.r, c.g, c.b);
    }

    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.56
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

// Ensure crystal horse always renders cleanly above floor rings
showRingGroup.renderOrder = 1;
arabianMesh.renderOrder = 2;

// ============================================================================
// 5. TARGET COLOR INTERPOLATION STATE
// ============================================================================
let targetPrismA = new THREE.Color(SPECTRUMS.rainbow.prismA);
let targetPrismB = new THREE.Color(SPECTRUMS.rainbow.prismB);
let targetPrismC = new THREE.Color(SPECTRUMS.rainbow.prismC);
let targetTintColor = new THREE.Color(SPECTRUMS.rainbow.tintColor);
let targetTintMix = SPECTRUMS.rainbow.tintMix;
let targetRingColor = new THREE.Color(SPECTRUMS.rainbow.ringAccent);

// ============================================================================
// 6. RESPONSIVE STAGE POSITIONING
// ============================================================================
let stageBaseX = -2.05;
let stageBaseY = 0.14;

function updateResponsiveLayout() {
    const w = window.innerWidth;
    if (w < 900) {
        stageGroup.scale.setScalar(0.84);
        camera.position.set(0, 0.12, 8.2);
        stageBaseX = 0.0;
        stageBaseY = 1.48;
    } else if (w < 1200) {
        stageGroup.scale.setScalar(1.04);
        camera.position.set(0, 0.10, 7.1);
        stageBaseX = -1.88;
        stageBaseY = 0.12;
    } else {
        stageGroup.scale.setScalar(1.18);
        camera.position.set(0, 0.10, 6.6);
        stageBaseX = -2.08;
        stageBaseY = 0.14;
    }
    stageGroup.position.set(stageBaseX, stageBaseY, 0);
}
updateResponsiveLayout();

// ============================================================================
// 7. INTERACTIVE SHOW SPOTLIGHT, 3D PARALLAX TILT & SPARKLES
// ============================================================================
let mouseNormX = 0;
let mouseNormY = 0;
let smoothMouseX = 0;
let smoothMouseY = 0;
let spotlightPulse = 0;
let poseLift = 0;

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
    poseLift = 0.09;
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
        targetPrismA.set(spec.prismA);
        targetPrismB.set(spec.prismB);
        targetPrismC.set(spec.prismC);
        targetTintColor.set(spec.tintColor);
        targetTintMix = spec.tintMix;
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
// 8. ANIMATION LOOP
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
    poseLift *= 0.93;

    smoothMouseX += (mouseNormX - smoothMouseX) * 0.07;
    smoothMouseY += (mouseNormY - smoothMouseY) * 0.07;

    // Update live GLSL glassmorphism shader uniforms
    glassArabianUniforms.uTime.value = t;
    glassArabianUniforms.uMouse.value.set(smoothMouseX, smoothMouseY);
    glassArabianUniforms.uPulse.value = spotlightPulse;
    glassArabianUniforms.uPrismA.value.lerp(targetPrismA, 0.06);
    glassArabianUniforms.uPrismB.value.lerp(targetPrismB, 0.06);
    glassArabianUniforms.uPrismC.value.lerp(targetPrismC, 0.06);
    glassArabianUniforms.uTintColor.value.lerp(targetTintColor, 0.06);
    glassArabianUniforms.uTintMix.value += (targetTintMix - glassArabianUniforms.uTintMix.value) * 0.06;
    innerRingMat.color.lerp(targetRingColor, 0.06);

    // Weightless poised breathing + subtle Spotlight prance lift
    horsePivot.position.y = Math.sin(t * 0.85) * 0.042 + poseLift;

    // Smooth 3D relief parallax tilt (controlled ±8.5° yaw / ±4.5° pitch for realistic glass depth)
    const targetRotY = smoothMouseX * 0.15 + Math.sin(t * 0.42) * 0.045 + poseLift * 0.5;
    const targetRotX = smoothMouseY * 0.075;

    horsePivot.rotation.y += (targetRotY - horsePivot.rotation.y) * 0.08;
    horsePivot.rotation.x += (targetRotX - horsePivot.rotation.x) * 0.08;

    // Gently rotate scalloped Championship Rosette Ring on the show floor
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
// 9. NAVIGATION, INDIVIDUAL GLASS CARDS & COPY EMAIL LOGIC
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
