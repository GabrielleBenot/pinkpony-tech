import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ============================================================================
// 1. THREE.JS SCENE, CAMERA, RENDERER & PEARLESCENT STUDIO ENVIRONMENT
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    52,
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
renderer.toneMappingExposure = 1.08;

if (container) {
    container.appendChild(renderer.domElement);
}

// Studio environment map for crisp Baccarat-crystal specular reflections
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const roomEnv = new RoomEnvironment(renderer);
scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
roomEnv.dispose();
pmremGenerator.dispose();

// ============================================================================
// 2. PRISMATIC RAINBOW SILK WAVE RIBBONS (REFRACTED THROUGH CRYSTAL PONY)
// ============================================================================
const SPECTRUMS = {
    rainbow: {
        ribbons: ['#ec4899', '#fb7185', '#f59e0b', '#10b981', '#38bdf8', '#a855f7'],
        lightA: '#ec4899',
        lightB: '#38bdf8',
        lightC: '#a855f7',
        attenuation: '#f472b6'
    },
    rose: {
        ribbons: ['#be185d', '#ec4899', '#f472b6', '#fda4af', '#f59e0b', '#d946ef'],
        lightA: '#ec4899',
        lightB: '#fda4af',
        lightC: '#f59e0b',
        attenuation: '#ec4899'
    },
    opal: {
        ribbons: ['#f472b6', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#fb7185'],
        lightA: '#38bdf8',
        lightB: '#c084fc',
        lightC: '#2dd4bf',
        attenuation: '#c084fc'
    }
};

let activeSpectrumKey = 'rainbow';
const numWaveSamples = 180;
const waveSpanWidth = 24;

function createSilkRibbon(hexColor, zDepth, yOffset, thickness, speed, phaseOffset) {
    const vertexCount = numWaveSamples * 2;
    const positions = new Float32Array(vertexCount * 3);
    const indices = [];

    for (let i = 0; i < numWaveSamples - 1; i++) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        indices.push(a, b, c, b, d, c);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(indices);

    const baseColor = new THREE.Color(hexColor);
    const material = new THREE.MeshBasicMaterial({
        color: baseColor.clone(),
        transparent: true,
        opacity: 0.62,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = zDepth;
    mesh.userData = {
        yOffset,
        thickness,
        speed,
        phaseOffset,
        targetColor: baseColor.clone()
    };
    return mesh;
}

const ribbonsGroup = new THREE.Group();
const ribbonConfigs = [
    { z: -1.55, y:  0.42, w: 0.052, speed: 0.95, phase: 0.0 },
    { z: -1.80, y:  0.22, w: 0.044, speed: 0.82, phase: 0.9 },
    { z: -2.05, y:  0.02, w: 0.042, speed: 1.05, phase: 1.8 },
    { z: -2.30, y: -0.18, w: 0.040, speed: 0.88, phase: 2.7 },
    { z: -2.55, y: -0.36, w: 0.044, speed: 1.12, phase: 3.6 },
    { z: -2.80, y: -0.54, w: 0.050, speed: 0.78, phase: 4.5 }
];

const ribbons = ribbonConfigs.map((cfg, idx) => {
    const r = createSilkRibbon(
        SPECTRUMS.rainbow.ribbons[idx],
        cfg.z,
        cfg.y,
        cfg.w,
        cfg.speed,
        cfg.phase
    );
    ribbonsGroup.add(r);
    return r;
});
scene.add(ribbonsGroup);

// ============================================================================
// 3. SCULPTURAL 3D CRYSTAL PONY SILHOUETTE + PRISMATIC HALO
// ============================================================================
function buildCouturePonyShape() {
    const s = new THREE.Shape();
    // Verified zero-self-intersection Couture Pony Bezier profile
    s.moveTo(0.56, 1.48);
    // Back ear
    s.bezierCurveTo(0.58, 1.60, 0.63, 1.69, 0.67, 1.71);
    s.bezierCurveTo(0.70, 1.63, 0.70, 1.55, 0.73, 1.52);
    // Front ear
    s.bezierCurveTo(0.78, 1.65, 0.86, 1.76, 0.92, 1.78);
    s.bezierCurveTo(0.94, 1.65, 0.90, 1.53, 0.87, 1.46);
    // Forehead & delicate nose
    s.bezierCurveTo(0.97, 1.40, 1.05, 1.27, 1.15, 1.16);
    s.bezierCurveTo(1.25, 1.05, 1.34, 1.00, 1.35, 0.92);
    // Muzzle & chin
    s.bezierCurveTo(1.35, 0.84, 1.27, 0.80, 1.18, 0.83);
    // Cheek & throatlatch tuck
    s.bezierCurveTo(1.07, 0.87, 0.98, 0.83, 0.85, 0.89);
    s.bezierCurveTo(0.79, 0.92, 0.74, 0.92, 0.72, 0.85);
    // Swan-arched front neck & dressage chest
    s.bezierCurveTo(0.72, 0.62, 0.92, 0.35, 0.93, 0.06);
    s.bezierCurveTo(0.93, -0.10, 0.86, -0.22, 0.78, -0.30);
    // Lifted dressage right foreleg & dainty hoof
    s.bezierCurveTo(0.95, -0.31, 1.16, -0.35, 1.23, -0.49);
    s.bezierCurveTo(1.27, -0.58, 1.19, -0.78, 1.08, -0.94);
    s.bezierCurveTo(1.05, -0.99, 1.05, -1.04, 1.01, -1.07);
    s.lineTo(0.90, -1.01);
    s.bezierCurveTo(0.91, -0.95, 0.96, -0.88, 1.04, -0.73);
    s.bezierCurveTo(1.10, -0.61, 1.08, -0.52, 0.93, -0.45);
    s.bezierCurveTo(0.83, -0.41, 0.75, -0.40, 0.70, -0.42);
    // Standing left foreleg
    s.bezierCurveTo(0.68, -0.70, 0.65, -1.12, 0.66, -1.46);
    s.bezierCurveTo(0.67, -1.53, 0.72, -1.58, 0.71, -1.62);
    s.lineTo(0.56, -1.62);
    s.bezierCurveTo(0.55, -1.54, 0.56, -1.40, 0.56, -1.10);
    s.bezierCurveTo(0.56, -0.80, 0.53, -0.56, 0.47, -0.40);
    // Underline / tucked waist
    s.bezierCurveTo(0.20, -0.45, -0.15, -0.41, -0.42, -0.30);
    // Inner hind leg
    s.bezierCurveTo(-0.43, -0.58, -0.46, -0.86, -0.42, -1.18);
    s.bezierCurveTo(-0.39, -1.38, -0.35, -1.52, -0.34, -1.62);
    s.lineTo(-0.49, -1.62);
    s.bezierCurveTo(-0.50, -1.50, -0.54, -1.30, -0.57, -1.06);
    s.bezierCurveTo(-0.60, -0.84, -0.59, -0.62, -0.58, -0.42);
    // Outer hind leg & hock
    s.bezierCurveTo(-0.68, -0.55, -0.82, -0.74, -0.88, -0.92);
    s.bezierCurveTo(-0.90, -1.14, -0.85, -1.42, -0.83, -1.62);
    s.lineTo(-0.98, -1.62);
    s.bezierCurveTo(-0.99, -1.44, -1.04, -1.14, -1.04, -0.88);
    s.bezierCurveTo(-1.04, -0.73, -0.91, -0.55, -0.88, -0.32);
    // Quarter to tail dock
    s.bezierCurveTo(-0.95, -0.12, -0.98, 0.08, -0.93, 0.25);
    // High-fashion S-curve Ponytail
    s.bezierCurveTo(-1.08, 0.28, -1.22, 0.16, -1.27, -0.10);
    s.bezierCurveTo(-1.31, -0.34, -1.28, -0.62, -1.40, -0.84);
    s.bezierCurveTo(-1.52, -0.68, -1.62, -0.40, -1.64, -0.06);
    s.bezierCurveTo(-1.66, 0.28, -1.52, 0.62, -1.24, 0.66);
    s.bezierCurveTo(-1.08, 0.68, -0.98, 0.56, -0.87, 0.44);
    // Croup & topline
    s.bezierCurveTo(-0.73, 0.54, -0.50, 0.52, -0.30, 0.39);
    s.bezierCurveTo(-0.10, 0.27, 0.08, 0.30, 0.18, 0.48);
    // Swan mane crest
    s.bezierCurveTo(0.10, 0.68, 0.14, 0.96, 0.26, 1.18);
    s.bezierCurveTo(0.35, 1.34, 0.45, 1.43, 0.56, 1.48);
    return s;
}

const ponyGeometry = new THREE.ExtrudeGeometry(buildCouturePonyShape(), {
    depth: 0.34,
    bevelEnabled: true,
    bevelSegments: 16,
    steps: 2,
    bevelSize: 0.052,
    bevelThickness: 0.058,
    curveSegments: 32
});
ponyGeometry.center();
ponyGeometry.computeVertexNormals();

// Rose-Quartz & Prismatic Liquid-Crystal Material
const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#fff5fa'),
    attenuationColor: new THREE.Color('#f472b6'),
    attenuationDistance: 1.55,
    metalness: 0.03,
    roughness: 0.045,
    transmission: 1.0,
    ior: 1.55,
    thickness: 1.65,
    iridescence: 1.0,
    iridescenceIOR: 1.34,
    iridescenceThicknessRange: [120, 760],
    specularIntensity: 1.0,
    specularColor: new THREE.Color('#ffffff'),
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.25
});

const ponyGroup = new THREE.Group();
const ponyMesh = new THREE.Mesh(ponyGeometry, crystalMaterial);
ponyGroup.add(ponyMesh);

// Subtle Rose-Iridescent Rim Halo Ring around the Pony
const haloGeometry = new THREE.TorusGeometry(2.08, 0.015, 24, 160);
const haloMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#fbcfe8'),
    emissive: new THREE.Color('#ec4899'),
    emissiveIntensity: 0.18,
    metalness: 0.35,
    roughness: 0.12,
    iridescence: 1.0,
    iridescenceIOR: 1.4,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.78
});
const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
haloMesh.rotation.x = Math.PI * 0.38;
haloMesh.rotation.y = -Math.PI * 0.14;
ponyGroup.add(haloMesh);

// Floating Crystal Dust Motes Orbiting the Pony
function createSoftGlowSprite() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(0.35, 'rgba(244, 114, 182, 0.75)');
    g.addColorStop(0.75, 'rgba(168, 85, 247, 0.2)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
}

const moteCount = 42;
const motePositions = new Float32Array(moteCount * 3);
const moteColors = new Float32Array(moteCount * 3);
const paletteColors = SPECTRUMS.rainbow.ribbons.map((h) => new THREE.Color(h));

for (let i = 0; i < moteCount; i++) {
    const angle = (i / moteCount) * Math.PI * 2;
    const radius = 1.65 + Math.random() * 1.15;
    motePositions[i * 3] = Math.cos(angle) * radius;
    motePositions[i * 3 + 1] = (Math.random() - 0.5) * 2.7;
    motePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;

    const c = paletteColors[i % paletteColors.length];
    moteColors[i * 3] = c.r;
    moteColors[i * 3 + 1] = c.g;
    moteColors[i * 3 + 2] = c.b;
}

const moteGeo = new THREE.BufferGeometry();
moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
moteGeo.setAttribute('color', new THREE.BufferAttribute(moteColors, 3));

const moteMat = new THREE.PointsMaterial({
    size: 0.14,
    map: createSoftGlowSprite(),
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    depthWrite: false
});
const motesPoints = new THREE.Points(moteGeo, moteMat);
ponyGroup.add(motesPoints);

scene.add(ponyGroup);

// ============================================================================
// 4. LIGHTING (ROSE QUARTZ, SKY PRISM & LILAC HIGHLIGHTS)
// ============================================================================
const ambientLight = new THREE.AmbientLight(0xfff7fb, 0.85);
scene.add(ambientLight);

const lightRose = new THREE.PointLight(0xec4899, 3.2, 30);
lightRose.position.set(-5, 4.5, 4);
scene.add(lightRose);

const lightPrism = new THREE.PointLight(0x38bdf8, 2.4, 30);
lightPrism.position.set(4, 3.5, 3.5);
scene.add(lightPrism);

const lightLilac = new THREE.PointLight(0xa855f7, 2.6, 30);
lightLilac.position.set(2, -4.5, 3);
scene.add(lightLilac);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(-2, 6, 6);
scene.add(dirLight);

let targetLightAColor = new THREE.Color(SPECTRUMS.rainbow.lightA);
let targetLightBColor = new THREE.Color(SPECTRUMS.rainbow.lightB);
let targetLightCColor = new THREE.Color(SPECTRUMS.rainbow.lightC);
let targetAttenuationColor = new THREE.Color(SPECTRUMS.rainbow.attenuation);

// ============================================================================
// 5. RESPONSIVE STAGE POSITIONING
// ============================================================================
let ponyBaseX = -2.55;
let ponyBaseY = 0.2;

function updateResponsiveLayout() {
    const w = window.innerWidth;
    if (w < 900) {
        ponyGroup.scale.setScalar(0.84);
        camera.position.set(0, 0, 7.6);
        ponyBaseX = 0.0;
        ponyBaseY = 1.62;
        ribbonsGroup.position.y = 1.45;
    } else if (w < 1200) {
        ponyGroup.scale.setScalar(1.06);
        camera.position.set(0, 0, 6.6);
        ponyBaseX = -2.25;
        ponyBaseY = 0.22;
        ribbonsGroup.position.y = 0.1;
    } else {
        ponyGroup.scale.setScalar(1.22);
        camera.position.set(0, 0, 6.2);
        ponyBaseX = -2.55;
        ponyBaseY = 0.22;
        ribbonsGroup.position.y = 0.08;
    }
    ponyGroup.position.x = ponyBaseX;
}
updateResponsiveLayout();

// ============================================================================
// 6. INTERACTIVE CURSOR TRACKING, PRISM PULSE & SPARKLE OVERLAY
// ============================================================================
let mouseNormX = 0;
let mouseNormY = 0;
let pulseAmplitude = 0;
let ponySpinBoost = 0;

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
    const speed = burst ? (1.2 + Math.random() * 2.8) : (0.25 + Math.random() * 0.75);
    sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (burst ? 0.3 : 0.35),
        size: burst ? (2.5 + Math.random() * 3.5) : (1.6 + Math.random() * 2.2),
        life: 1.0,
        decay: burst ? (0.016 + Math.random() * 0.014) : (0.024 + Math.random() * 0.018),
        color: SPARKLE_HUES[Math.floor(Math.random() * SPARKLE_HUES.length)]
    });
}

function triggerPrismPulse(originX, originY) {
    pulseAmplitude = 1.0;
    ponySpinBoost = 0.28;
    const cx = originX ?? window.innerWidth * 0.32;
    const cy = originY ?? window.innerHeight * 0.48;
    for (let i = 0; i < 22; i++) {
        spawnSparkle(cx, cy, true);
    }
}

let lastSparkleTime = 0;
window.addEventListener('pointermove', (e) => {
    mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNormY = (e.clientY / window.innerHeight) * 2 - 1;

    const now = performance.now();
    if (now - lastSparkleTime > 42) {
        spawnSparkle(e.clientX, e.clientY, false);
        lastSparkleTime = now;
    }
});

// Clicking on the open 3D background triggers a harmonic rainbow wave shimmer
if (container) {
    container.addEventListener('click', (e) => {
        triggerPrismPulse(e.clientX, e.clientY);
    });
}

const prismPulseBtn = document.getElementById('prism-pulse-btn');
if (prismPulseBtn) {
    prismPulseBtn.addEventListener('click', () => {
        const rect = prismPulseBtn.getBoundingClientRect();
        triggerPrismPulse(rect.left + rect.width / 2, rect.top);
    });
}

const heroEmblem = document.getElementById('hero-emblem');
if (heroEmblem) {
    heroEmblem.addEventListener('click', () => {
        const rect = heroEmblem.getBoundingClientRect();
        triggerPrismPulse(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
}

// Spectrum Switcher Buttons
const spectrumBtns = document.querySelectorAll('.spectrum-btn');
spectrumBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-spectrum');
        if (!key || !SPECTRUMS[key]) return;
        activeSpectrumKey = key;

        spectrumBtns.forEach((b) => b.classList.toggle('active', b === btn));

        const spec = SPECTRUMS[key];
        ribbons.forEach((ribbon, idx) => {
            ribbon.userData.targetColor.set(spec.ribbons[idx % spec.ribbons.length]);
        });
        targetLightAColor.set(spec.lightA);
        targetLightBColor.set(spec.lightB);
        targetLightCColor.set(spec.lightC);
        targetAttenuationColor.set(spec.attenuation);

        const rect = btn.getBoundingClientRect();
        triggerPrismPulse(rect.left + rect.width / 2, rect.top);
    });
});

// Card Spotlight CSS Custom Properties
document.querySelectorAll('.spotlight-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
});

// ============================================================================
// 7. ANIMATION LOOP (3D REFRACTION + SILK WAVES + SPARKLE OVERLAY)
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

        // Draw dainty 4-point couture diamond star
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
    pulseAmplitude *= 0.965;
    ponySpinBoost *= 0.94;

    // Smoothly transition light & crystal tint colors
    lightRose.color.lerp(targetLightAColor, 0.05);
    lightPrism.color.lerp(targetLightBColor, 0.05);
    lightLilac.color.lerp(targetLightCColor, 0.05);
    crystalMaterial.attenuationColor.lerp(targetAttenuationColor, 0.05);

    // Update 6 Prismatic Silk Ribbons
    ribbons.forEach((ribbon) => {
        ribbon.material.color.lerp(ribbon.userData.targetColor, 0.06);

        const posAttr = ribbon.geometry.attributes.position;
        const { yOffset, thickness, speed, phaseOffset } = ribbon.userData;

        for (let i = 0; i < numWaveSamples; i++) {
            const u = i / (numWaveSamples - 1);
            const x = u * waveSpanWidth - waveSpanWidth / 2;

            // Taper ribbon gently toward screen edges
            const edgeTaper = Math.sin(u * Math.PI);
            const halfW = thickness * (0.35 + 0.65 * edgeTaper) * (1 + pulseAmplitude * 0.65);

            const baseWave =
                Math.sin(x * 0.44 + t * speed + phaseOffset) * 0.72 +
                Math.cos(x * 0.95 - t * speed * 0.72 + phaseOffset * 0.6) * 0.42 +
                Math.sin(x * 0.2 + t * 0.35) * 0.85;

            const shimmerRipple =
                pulseAmplitude * Math.sin(x * 1.8 - t * 6.5 + phaseOffset) * 0.48;

            const centerY = yOffset + baseWave + shimmerRipple;

            const vIdx = i * 2;
            posAttr.setXYZ(vIdx, x, centerY + halfW, 0);
            posAttr.setXYZ(vIdx + 1, x, centerY - halfW, 0);
        }
        posAttr.needsUpdate = true;
    });

    // Sculptural Pony gentle breathing float + responsive cursor tilt
    ponyGroup.position.y = ponyBaseY + Math.sin(t * 0.75) * 0.14;

    const targetRotY = mouseNormX * 0.38 + Math.sin(t * 0.35) * 0.14 + ponySpinBoost;
    const targetRotX = mouseNormY * 0.18 + Math.cos(t * 0.45) * 0.04;

    ponyMesh.rotation.y += (targetRotY - ponyMesh.rotation.y) * 0.06;
    ponyMesh.rotation.x += (targetRotX - ponyMesh.rotation.x) * 0.06;
    ponyMesh.rotation.z = Math.sin(t * 0.3) * 0.025;

    // Gentle orbital motion on halo & crystal motes
    haloMesh.rotation.z = t * 0.18;
    haloMesh.rotation.x = Math.PI * 0.38 + Math.sin(t * 0.4) * 0.06;
    motesPoints.rotation.y = t * 0.12;
    motesPoints.rotation.z = Math.sin(t * 0.25) * 0.08;

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
// 8. NAVIGATION, INDIVIDUAL GLASS CARDS & COPY EMAIL LOGIC (STOXOS-STYLE)
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

// One-Click Copy Email Buttons
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
