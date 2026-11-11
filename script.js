import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ============================================================================
// 1. THREE.JS SCENE, CAMERA, RENDERER & STUDIO CRYSTAL ENVIRONMENT
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    48,
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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

if (container) {
    container.appendChild(renderer.domElement);
}

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const roomEnv = new RoomEnvironment(renderer);
scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
roomEnv.dispose();
pmremGenerator.dispose();

// ============================================================================
// 2. SHOW-RING LIGHTING PALETTES (ROSETTE RAINBOW / ROSE QUARTZ / PEARL OPAL)
// ============================================================================
const SPECTRUMS = {
    rainbow: {
        rosette: ['#ec4899', '#fb7185', '#f59e0b', '#10b981', '#38bdf8', '#a855f7'],
        lightA: '#ec4899',
        lightB: '#38bdf8',
        lightC: '#a855f7',
        attenuation: '#f472b6',
        ringAccent: '#ec4899'
    },
    rose: {
        rosette: ['#be185d', '#ec4899', '#f472b6', '#fda4af', '#f59e0b', '#d946ef'],
        lightA: '#ec4899',
        lightB: '#fda4af',
        lightC: '#f59e0b',
        attenuation: '#ec4899',
        ringAccent: '#db2777'
    },
    opal: {
        rosette: ['#f472b6', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#fb7185'],
        lightA: '#38bdf8',
        lightB: '#c084fc',
        lightC: '#2dd4bf',
        attenuation: '#c084fc',
        ringAccent: '#8b5cf6'
    }
};

// ============================================================================
// 3. CHAMPION SHOW ARABIAN CRYSTAL SCULPTURE (CLEAN UNADORNED HEAD)
// ============================================================================
function buildShowArabianShape() {
    const s = new THREE.Shape();

    // Poll right behind ears
    s.moveTo(0.76, 1.64);
    // Back tippy inward-curving ear
    s.bezierCurveTo(0.75, 1.75, 0.80, 1.85, 0.86, 1.88);
    s.bezierCurveTo(0.87, 1.80, 0.85, 1.71, 0.86, 1.66);
    // Front tippy Arabian ear
    s.bezierCurveTo(0.90, 1.78, 0.98, 1.89, 1.06, 1.90);
    s.bezierCurveTo(1.06, 1.80, 1.01, 1.69, 0.98, 1.62);
    // Prominent rounded Jibbah forehead
    s.bezierCurveTo(1.09, 1.60, 1.15, 1.52, 1.14, 1.43);
    // Signature deep concave Arabian dish into flared teacup nostril
    s.bezierCurveTo(1.13, 1.32, 1.24, 1.25, 1.37, 1.19);
    s.bezierCurveTo(1.44, 1.16, 1.49, 1.12, 1.48, 1.06);
    // Teacup muzzle & refined lower lip
    s.bezierCurveTo(1.46, 0.99, 1.38, 0.97, 1.31, 1.01);
    // Deep circular Arabian jowl (cheekbone)
    s.bezierCurveTo(1.23, 1.04, 1.18, 0.97, 1.07, 0.97);
    s.bezierCurveTo(0.97, 0.97, 0.92, 1.04, 0.88, 1.12);
    // High, airy arched Mitbah (throatlatch hook)
    s.bezierCurveTo(0.84, 1.18, 0.78, 1.17, 0.76, 1.07);
    // Tall slender swan-arched neck into proud deep chest
    s.bezierCurveTo(0.72, 0.78, 0.88, 0.42, 0.92, 0.08);
    s.bezierCurveTo(0.94, -0.10, 0.86, -0.25, 0.75, -0.34);

    // Foreleg 1 (poised slightly forward — slender bone, sloped pastern, crisp hoof)
    s.bezierCurveTo(0.78, -0.58, 0.80, -0.96, 0.82, -1.32);
    s.bezierCurveTo(0.82, -1.40, 0.85, -1.46, 0.90, -1.55);
    s.lineTo(0.91, -1.60);
    s.lineTo(0.77, -1.60);
    s.bezierCurveTo(0.76, -1.53, 0.72, -1.44, 0.71, -1.34);
    s.bezierCurveTo(0.70, -1.02, 0.66, -0.68, 0.63, -0.42);

    // Foreleg 2 (standing square beneath point of shoulder)
    s.bezierCurveTo(0.60, -0.70, 0.57, -1.08, 0.57, -1.35);
    s.bezierCurveTo(0.57, -1.43, 0.60, -1.49, 0.64, -1.56);
    s.lineTo(0.65, -1.60);
    s.lineTo(0.51, -1.60);
    s.bezierCurveTo(0.50, -1.52, 0.47, -1.42, 0.47, -1.30);
    s.bezierCurveTo(0.47, -0.98, 0.45, -0.62, 0.40, -0.38);

    // Deep heart-girth & tucked athletic Arabian flank
    s.bezierCurveTo(0.14, -0.42, -0.18, -0.32, -0.44, -0.20);

    // Inner stretched hind leg (classic Arabian Halter "stand-up" show pose)
    s.bezierCurveTo(-0.54, -0.44, -0.68, -0.70, -0.75, -0.92);
    s.bezierCurveTo(-0.77, -1.14, -0.75, -1.35, -0.73, -1.44);
    s.bezierCurveTo(-0.71, -1.50, -0.68, -1.55, -0.67, -1.60);
    s.lineTo(-0.81, -1.60);
    s.bezierCurveTo(-0.82, -1.52, -0.85, -1.43, -0.85, -1.32);
    s.bezierCurveTo(-0.85, -1.12, -0.86, -0.98, -0.87, -0.88);
    s.bezierCurveTo(-0.86, -0.76, -0.77, -0.58, -0.68, -0.38);

    // Outer stretched show hind leg
    s.bezierCurveTo(-0.82, -0.55, -1.00, -0.75, -1.10, -0.92);
    s.bezierCurveTo(-1.11, -1.14, -1.09, -1.35, -1.07, -1.44);
    s.bezierCurveTo(-1.05, -1.50, -1.02, -1.55, -1.01, -1.60);
    s.lineTo(-1.15, -1.60);
    s.bezierCurveTo(-1.16, -1.52, -1.19, -1.42, -1.20, -1.30);
    s.bezierCurveTo(-1.21, -1.10, -1.22, -0.96, -1.23, -0.86);

    // Clean hock sweeping up sculpted gaskin to high buttock
    s.bezierCurveTo(-1.21, -0.72, -1.04, -0.52, -0.98, -0.24);
    s.bezierCurveTo(-1.02, 0.00, -1.03, 0.24, -0.95, 0.42);

    // High-flagged Champion Arabian show tail cascading past hocks
    s.bezierCurveTo(-1.10, 0.50, -1.26, 0.38, -1.34, 0.08);
    s.bezierCurveTo(-1.40, -0.22, -1.34, -0.70, -1.58, -1.04);
    s.bezierCurveTo(-1.68, -0.78, -1.78, -0.34, -1.76, 0.14);
    s.bezierCurveTo(-1.74, 0.60, -1.50, 0.94, -1.16, 0.90);
    s.bezierCurveTo(-1.01, 0.88, -0.92, 0.72, -0.84, 0.56);

    // Flat/level Arabian croup -> short strong back -> high withers -> arched swan crest
    s.bezierCurveTo(-0.68, 0.58, -0.48, 0.56, -0.30, 0.47);
    s.bezierCurveTo(-0.12, 0.38, 0.04, 0.42, 0.14, 0.62);
    s.bezierCurveTo(0.24, 0.86, 0.30, 1.18, 0.45, 1.41);
    s.bezierCurveTo(0.54, 1.53, 0.65, 1.60, 0.76, 1.64);

    return s;
}

const extrudeDepth = 0.34;
const bevelThick = 0.058;

const arabianGeometry = new THREE.ExtrudeGeometry(buildShowArabianShape(), {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelSegments: 18,
    steps: 2,
    bevelSize: 0.052,
    bevelThickness: bevelThick,
    curveSegments: 36
});

arabianGeometry.computeBoundingBox();
const bbox = arabianGeometry.boundingBox;
const centerOffsetX = 0.5 * (bbox.min.x + bbox.max.x);
const centerOffsetY = 0.5 * (bbox.min.y + bbox.max.y);
const centerOffsetZ = 0.5 * (bbox.min.z + bbox.max.z);
arabianGeometry.translate(-centerOffsetX, -centerOffsetY, -centerOffsetZ);
arabianGeometry.computeVertexNormals();

// Luminous Glossy Rose-Pink Crystal Material (clean sculptural head without halter wires)
const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#fff5fa'),
    attenuationColor: new THREE.Color('#f472b6'),
    attenuationDistance: 1.5,
    metalness: 0.03,
    roughness: 0.04,
    transmission: 1.0,
    ior: 1.56,
    thickness: 1.7,
    iridescence: 1.0,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [120, 780],
    specularIntensity: 1.0,
    specularColor: new THREE.Color('#ffffff'),
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.3
});

const stageGroup = new THREE.Group();
const horsePivot = new THREE.Group();
const arabianMesh = new THREE.Mesh(arabianGeometry, crystalMaterial);
horsePivot.add(arabianMesh);
stageGroup.add(horsePivot);

// ============================================================================
// 4. CHAMPIONSHIP SHOW-RING PLINTH & SCALLOPED ROSETTE FLOOR (UNDER HOOVES)
// ============================================================================
const showRingY = -1.605 - centerOffsetY;
const showRingGroup = new THREE.Group();
showRingGroup.position.set(0, showRingY, 0);

function createShowFloorTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(256, 256, 12, 256, 256, 250);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 0.85)');
    g.addColorStop(0.42, 'rgba(251, 207, 232, 0.42)');
    g.addColorStop(0.72, 'rgba(233, 213, 255, 0.22)');
    g.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
}

const floorDisc = new THREE.Mesh(
    new THREE.CircleGeometry(2.15, 72),
    new THREE.MeshBasicMaterial({
        map: createShowFloorTexture(),
        transparent: true,
        opacity: 0.9,
        depthWrite: false
    })
);
floorDisc.rotation.x = -Math.PI / 2;
showRingGroup.add(floorDisc);

const innerRingMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ec4899'),
    transparent: true,
    opacity: 0.42
});
const innerArenaRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.48, 0.011, 16, 128),
    innerRingMat
);
innerArenaRing.rotation.x = Math.PI / 2;
showRingGroup.add(innerArenaRing);

const outerArenaRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.88, 0.008, 16, 140),
    new THREE.MeshBasicMaterial({
        color: new THREE.Color('#a855f7'),
        transparent: true,
        opacity: 0.28
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
        const r = 1.68 + Math.sin(theta * pleats) * 0.065;
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
        vertexColors: true,
        transparent: true,
        opacity: 0.65
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
    new THREE.RingGeometry(1.25, 1.33, 96),
    pulseRingMat
);
pulseRingMesh.rotation.x = -Math.PI / 2;
pulseRingMesh.position.y = 0.012;
showRingGroup.add(pulseRingMesh);

stageGroup.add(showRingGroup);

// ============================================================================
// 5. PRISMATIC ROSETTE BACKLIGHT BEHIND HORSE (FOR CRYSTAL REFRACTION)
// ============================================================================
function createPrismBackdropTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const g = ctx.createRadialGradient(256, 256, 10, 256, 256, 245);
    g.addColorStop(0.0, 'rgba(244, 114, 182, 0.42)');
    g.addColorStop(0.28, 'rgba(253, 186, 116, 0.24)');
    g.addColorStop(0.50, 'rgba(125, 211, 252, 0.24)');
    g.addColorStop(0.72, 'rgba(196, 181, 253, 0.22)');
    g.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
}

const backdropAura = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.2),
    new THREE.MeshBasicMaterial({
        map: createPrismBackdropTexture(),
        transparent: true,
        opacity: 0.85,
        depthWrite: false
    })
);
backdropAura.position.set(0, 0.1, -0.95);
stageGroup.add(backdropAura);

scene.add(stageGroup);

// ============================================================================
// 6. SHOW-RING SPOTLIGHTS
// ============================================================================
const ambientLight = new THREE.AmbientLight(0xfff7fb, 0.88);
scene.add(ambientLight);

const lightRose = new THREE.PointLight(0xec4899, 3.4, 30);
lightRose.position.set(-4.5, 4.8, 4.2);
scene.add(lightRose);

const lightPrism = new THREE.PointLight(0x38bdf8, 2.5, 30);
lightPrism.position.set(4.0, 3.8, 3.8);
scene.add(lightPrism);

const lightLilac = new THREE.PointLight(0xa855f7, 2.7, 30);
lightLilac.position.set(1.5, -4.0, 3.2);
scene.add(lightLilac);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(-2, 6.5, 6);
scene.add(dirLight);

let targetAttenuationColor = new THREE.Color(SPECTRUMS.rainbow.attenuation);
let targetLightAColor = new THREE.Color(SPECTRUMS.rainbow.lightA);
let targetLightBColor = new THREE.Color(SPECTRUMS.rainbow.lightB);
let targetLightCColor = new THREE.Color(SPECTRUMS.rainbow.lightC);
let targetRingColor = new THREE.Color(SPECTRUMS.rainbow.ringAccent);

// ============================================================================
// 8. RESPONSIVE STAGE POSITIONING
// ============================================================================
let stageBaseX = -2.35;
let stageBaseY = 0.22;

function updateResponsiveLayout() {
    const w = window.innerWidth;
    if (w < 900) {
        stageGroup.scale.setScalar(0.82);
        camera.position.set(0, 0.15, 7.6);
        stageBaseX = 0.0;
        stageBaseY = 1.58;
    } else if (w < 1200) {
        stageGroup.scale.setScalar(1.02);
        camera.position.set(0, 0.05, 6.6);
        stageBaseX = -2.1;
        stageBaseY = 0.2;
    } else {
        stageGroup.scale.setScalar(1.16);
        camera.position.set(0, 0.05, 6.2);
        stageBaseX = -2.35;
        stageBaseY = 0.22;
    }
    stageGroup.position.set(stageBaseX, stageBaseY, 0);
}
updateResponsiveLayout();

// ============================================================================
// 9. INTERACTIVE SHOW SPOTLIGHT, CURSOR TILT & SPARKLES
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
    showPoseTurn = 0.3;
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

    // Smoothly transition crystal attenuation & show-ring spotlight colors
    crystalMaterial.attenuationColor.lerp(targetAttenuationColor, 0.05);
    lightRose.color.lerp(targetLightAColor, 0.05);
    lightPrism.color.lerp(targetLightBColor, 0.05);
    lightLilac.color.lerp(targetLightCColor, 0.05);
    innerRingMat.color.lerp(targetRingColor, 0.05);

    // Subtle poised breathing above show plinth
    stageGroup.position.y = stageBaseY + Math.sin(t * 0.7) * 0.05;

    // Poised Show Arabian turntable / cursor presentation
    const targetRotY = mouseNormX * 0.42 + Math.sin(t * 0.32) * 0.16 + showPoseTurn;
    const targetRotX = mouseNormY * 0.11;

    horsePivot.rotation.y += (targetRotY - horsePivot.rotation.y) * 0.06;
    horsePivot.rotation.x += (targetRotX - horsePivot.rotation.x) * 0.06;

    // Slowly rotate the scalloped Championship Rosette Ring on the show floor
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
