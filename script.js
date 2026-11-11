import * as THREE from 'three';

// ============================================================================
// 1. THREE.JS SCENE, CAMERA & TRANSPARENT OPTICAL-GLASS STAGE
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
// 2. OPTICAL DISPERSION PALETTES (PEARL / PINK PEARL / PRISM)
// ============================================================================
const SPECTRUMS = {
    pearl: {
        prismA: '#f9a8d4',
        prismB: '#bae6fd',
        prismC: '#ddd6fe',
        tintMix: 0.0,
        tintColor: '#ffffff',
        arcPrimary: '#f472b6',
        arcSecondary: '#c4b5fd'
    },
    rose: {
        prismA: '#ec4899',
        prismB: '#fbcfe8',
        prismC: '#fde68a',
        tintMix: 0.14,
        tintColor: '#fce7f3',
        arcPrimary: '#ec4899',
        arcSecondary: '#f9a8d4'
    },
    rainbow: {
        prismA: '#f472b6',
        prismB: '#38bdf8',
        prismC: '#c084fc',
        tintMix: 0.05,
        tintColor: '#fdf4ff',
        arcPrimary: '#db2777',
        arcSecondary: '#38bdf8'
    }
};

// ============================================================================
// 3. LAYERED OPTICAL-GLASS ARABIAN SCULPTURE + LIVE PRISM SEAM SHADER
// ============================================================================
const stageGroup = new THREE.Group();
const horsePivot = new THREE.Group();
stageGroup.add(horsePivot);

const textureLoader = new THREE.TextureLoader();
const colorTex = textureLoader.load('arabian_glassmorph.webp?v=9');
colorTex.minFilter = THREE.LinearMipmapLinearFilter;
colorTex.magFilter = THREE.LinearFilter;
colorTex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

const reliefTex = textureLoader.load('arabian_glass_relief.webp?v=9');
reliefTex.minFilter = THREE.LinearFilter;
reliefTex.magFilter = THREE.LinearFilter;

const glassArabianUniforms = {
    uColorMap: { value: colorTex },
    uReliefMap: { value: reliefTex },
    uTime: { value: 0.0 },
    uReliefDepth: { value: 0.22 },
    uMouse: { value: new THREE.Vector2(0.0, 0.0) },
    uTilt: { value: new THREE.Vector2(0.0, 0.0) },
    uPulse: { value: 0.0 },
    uPrismA: { value: new THREE.Color(SPECTRUMS.pearl.prismA) },
    uPrismB: { value: new THREE.Color(SPECTRUMS.pearl.prismB) },
    uPrismC: { value: new THREE.Color(SPECTRUMS.pearl.prismC) },
    uTintColor: { value: new THREE.Color(SPECTRUMS.pearl.tintColor) },
    uTintMix: { value: SPECTRUMS.pearl.tintMix }
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

        void main() {
            vUv = uv;
            float relief = texture2D(uReliefMap, uv).a;

            vec3 pos = position;
            pos.z += relief * uReliefDepth;

            // Subtle fluid-optical breathe on the cantilevered tail ribbon
            float tailZone = smoothstep(0.30, 0.04, uv.x);
            pos.z += sin(uTime * 1.25 + uv.y * 5.2) * 0.012 * tailZone * relief;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: /* glsl */ `
        uniform sampler2D uColorMap;
        uniform sampler2D uReliefMap;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uTilt;
        uniform float uPulse;
        uniform vec3 uPrismA;
        uniform vec3 uPrismB;
        uniform vec3 uPrismC;
        uniform vec3 uTintColor;
        uniform float uTintMix;

        varying vec2 vUv;

        vec3 rotateNormalXY(vec3 n, float rotY, float rotX) {
            float cy = cos(rotY);
            float sy = sin(rotY);
            vec3 ny = vec3(n.x * cy + n.z * sy, n.y, -n.x * sy + n.z * cy);

            float cx = cos(rotX);
            float sx = sin(rotX);
            return normalize(vec3(ny.x, ny.y * cx - ny.z * sx, ny.y * sx + ny.z * cx));
        }

        void main() {
            vec4 base = texture2D(uColorMap, vUv);
            if (base.a < 0.008) discard;

            vec4 nr = texture2D(uReliefMap, vUv);
            vec3 localNormal = normalize(nr.rgb * 2.0 - 1.0);
            vec3 N = rotateNormalXY(localNormal, uTilt.x, uTilt.y);
            float thickness = nr.a;

            // Cursor-steered precision optical key & counter-rim lights
            vec3 L1 = normalize(vec3(uMouse.x * 0.85 - 0.22, -uMouse.y * 0.75 + 0.45, 1.0));
            vec3 L2 = normalize(vec3(-uMouse.x * 0.65 + 0.42, uMouse.y * 0.55 - 0.25, 0.88));
            vec3 V = vec3(0.0, 0.0, 1.0);

            vec3 H1 = normalize(L1 + V);
            vec3 H2 = normalize(L2 + V);

            float specSharp = pow(max(dot(N, H1), 0.0), 48.0);
            float specSoft  = pow(max(dot(N, H2), 0.0), 18.0);
            float fresnel   = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.1);

            // Detect pink laser-cut optical glass seams so live glints travel along pane edges
            float maxC = max(base.r, max(base.g, base.b));
            float minC = min(base.r, min(base.g, base.b));
            float seamChroma = smoothstep(0.05, 0.22, maxC - minC);

            float phase = dot(N.xy, vec2(3.8, 2.9)) + vUv.x * 4.4 - vUv.y * 2.7 + uTime * 0.48 + uMouse.x * 1.5;
            vec3 prismBand = 0.36 * uPrismA * (0.5 + 0.5 * sin(phase))
                           + 0.32 * uPrismB * (0.5 + 0.5 * sin(phase + 2.094))
                           + 0.32 * uPrismC * (0.5 + 0.5 * sin(phase + 4.188));

            vec3 col = base.rgb;

            // Apply optional optical mode tint (Pink Pearl / Prism)
            col = mix(col, col * (0.86 + 0.26 * uTintColor), uTintMix);

            // Preserve creamy pearl highlights while illuminating internal glass panes & pink seams
            float lum = dot(col, vec3(0.299, 0.587, 0.114));
            float headroom = 1.0 - smoothstep(0.80, 0.98, lum);

            float causticMask = smoothstep(0.06, 0.62, thickness) * (0.32 + 0.68 * fresnel);
            col += prismBand * (specSoft * 0.16 + causticMask * 0.085 + seamChroma * 0.06) * (0.35 + 0.65 * headroom);
            col += vec3(1.0, 0.98, 1.0) * specSharp * (0.16 + seamChroma * 0.18) * smoothstep(0.04, 0.36, thickness);

            // Clean optical refraction wave when user clicks sculpture or 'Refract'
            if (uPulse > 0.005) {
                float progress = 1.0 - uPulse;
                float distFromCenter = length(vUv - vec2(0.56, 0.48));
                float waveRing = exp(-pow((distFromCenter - progress * 0.88) * 10.0, 2.0));
                col += (prismBand * 0.65 + vec3(0.35)) * waveRing * uPulse * 0.55;
            }

            gl_FragColor = vec4(clamp(col, 0.0, 1.0), base.a);
        }
    `
});

// Aspect ratio of abstract optical-glass Arabian = 890 / 837 = 1.0633
const arabianPlaneGeo = new THREE.PlaneGeometry(3.56, 3.35, 160, 160);
const arabianMesh = new THREE.Mesh(arabianPlaneGeo, glassArabianMaterial);
horsePivot.add(arabianMesh);

// ============================================================================
// 4. MINIMALIST PRECISION OPTICAL LENS PLINTH (CLEAN, ARCHITECTURAL, UNBUSY)
// ============================================================================
function createOpticalFloorGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const g = ctx.createRadialGradient(256, 256, 8, 256, 256, 248);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 0.86)');
    g.addColorStop(0.40, 'rgba(251, 207, 232, 0.24)');
    g.addColorStop(0.72, 'rgba(221, 214, 254, 0.14)');
    g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    return new THREE.CanvasTexture(c);
}

const plinthGroup = new THREE.Group();
plinthGroup.position.set(-0.02, -1.50, -0.15);

const floorDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.68, 84),
    new THREE.MeshBasicMaterial({
        map: createOpticalFloorGlowTexture(),
        transparent: true,
        opacity: 0.85,
        depthWrite: false
    })
);
floorDisc.rotation.x = -Math.PI / 2;
plinthGroup.add(floorDisc);

// Two razor-thin broken precision optical horizon arcs (zero horse-show frills)
const primaryArcMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(SPECTRUMS.pearl.arcPrimary),
    transparent: true,
    opacity: 0.36,
    side: THREE.DoubleSide,
    depthWrite: false
});
const primaryOpticArc = new THREE.Mesh(
    new THREE.RingGeometry(1.30, 1.311, 96, 1, 0, Math.PI * 1.28),
    primaryArcMat
);
primaryOpticArc.rotation.x = -Math.PI / 2;
primaryOpticArc.position.y = 0.004;
plinthGroup.add(primaryOpticArc);

const secondaryArcMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(SPECTRUMS.pearl.arcSecondary),
    transparent: true,
    opacity: 0.30,
    side: THREE.DoubleSide,
    depthWrite: false
});
const secondaryOpticArc = new THREE.Mesh(
    new THREE.RingGeometry(1.48, 1.489, 96, 1, Math.PI * 0.85, Math.PI * 1.05),
    secondaryArcMat
);
secondaryOpticArc.rotation.x = -Math.PI / 2;
secondaryOpticArc.position.y = 0.003;
plinthGroup.add(secondaryOpticArc);

// Expanding Refraction Pulse Ring when user clicks sculpture or 'Refract'
const pulseRingMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ec4899'),
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false
});
const pulseRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(1.06, 1.10, 96),
    pulseRingMat
);
pulseRingMesh.rotation.x = -Math.PI / 2;
pulseRingMesh.position.y = 0.008;
plinthGroup.add(pulseRingMesh);

stageGroup.add(plinthGroup);
scene.add(stageGroup);

plinthGroup.renderOrder = 1;
arabianMesh.renderOrder = 2;

// ============================================================================
// 5. TARGET COLOR INTERPOLATION STATE
// ============================================================================
let targetPrismA = new THREE.Color(SPECTRUMS.pearl.prismA);
let targetPrismB = new THREE.Color(SPECTRUMS.pearl.prismB);
let targetPrismC = new THREE.Color(SPECTRUMS.pearl.prismC);
let targetTintColor = new THREE.Color(SPECTRUMS.pearl.tintColor);
let targetTintMix = SPECTRUMS.pearl.tintMix;
let targetArcPrimary = new THREE.Color(SPECTRUMS.pearl.arcPrimary);
let targetArcSecondary = new THREE.Color(SPECTRUMS.pearl.arcSecondary);

// ============================================================================
// 6. RESPONSIVE STAGE POSITIONING (CENTERED cleanly IN THE OPTICAL LENS RING)
// ============================================================================
let stageBaseX = -1.78;
let stageBaseY = 0.28;

function updateResponsiveLayout() {
    const w = window.innerWidth;
    if (w < 900) {
        stageGroup.scale.setScalar(0.84);
        camera.position.set(0, 0.12, 8.2);
        stageBaseX = 0.0;
        stageBaseY = 1.52;
    } else if (w < 1200) {
        stageGroup.scale.setScalar(1.00);
        camera.position.set(0, 0.10, 7.1);
        stageBaseX = -1.62;
        stageBaseY = 0.26;
    } else {
        stageGroup.scale.setScalar(1.10);
        camera.position.set(0, 0.10, 6.6);
        stageBaseX = -1.78;
        stageBaseY = 0.28;
    }
    stageGroup.position.set(stageBaseX, stageBaseY, 0);
}
updateResponsiveLayout();

// ============================================================================
// 7. INTERACTIVE REFRACTION WAVE & SMOOTH 3D PARALLAX TILT
// ============================================================================
let mouseNormX = 0;
let mouseNormY = 0;
let smoothMouseX = 0;
let smoothMouseY = 0;
let refractPulse = 0;
let poseLift = 0;

function triggerOpticalRefraction() {
    refractPulse = 1.0;
    poseLift = 0.065;
}

window.addEventListener('pointermove', (e) => {
    mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNormY = (e.clientY / window.innerHeight) * 2 - 1;
});

if (container) {
    container.addEventListener('click', triggerOpticalRefraction);
}

const prismPulseBtn = document.getElementById('prism-pulse-btn');
if (prismPulseBtn) {
    prismPulseBtn.addEventListener('click', triggerOpticalRefraction);
}

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
        targetArcPrimary.set(spec.arcPrimary);
        targetArcSecondary.set(spec.arcSecondary);

        triggerOpticalRefraction();
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

function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    refractPulse = Math.max(0, refractPulse - 0.015);
    poseLift *= 0.93;

    smoothMouseX += (mouseNormX - smoothMouseX) * 0.065;
    smoothMouseY += (mouseNormY - smoothMouseY) * 0.065;

    // Calm weightless float + subtle refraction poise
    horsePivot.position.y = Math.sin(t * 0.72) * 0.036 + poseLift;

    // Precision 3D relief parallax tilt (±8° yaw / ±4° pitch)
    const targetRotY = smoothMouseX * 0.14 + Math.sin(t * 0.36) * 0.038 + poseLift * 0.4;
    const targetRotX = smoothMouseY * 0.07;

    horsePivot.rotation.y += (targetRotY - horsePivot.rotation.y) * 0.075;
    horsePivot.rotation.x += (targetRotX - horsePivot.rotation.x) * 0.075;

    // Update live GLSL optical-glass uniforms
    glassArabianUniforms.uTime.value = t;
    glassArabianUniforms.uMouse.value.set(smoothMouseX, smoothMouseY);
    glassArabianUniforms.uTilt.value.set(horsePivot.rotation.y, horsePivot.rotation.x);
    glassArabianUniforms.uPulse.value = refractPulse;
    glassArabianUniforms.uPrismA.value.lerp(targetPrismA, 0.06);
    glassArabianUniforms.uPrismB.value.lerp(targetPrismB, 0.06);
    glassArabianUniforms.uPrismC.value.lerp(targetPrismC, 0.06);
    glassArabianUniforms.uTintColor.value.lerp(targetTintColor, 0.06);
    glassArabianUniforms.uTintMix.value += (targetTintMix - glassArabianUniforms.uTintMix.value) * 0.06;

    primaryArcMat.color.lerp(targetArcPrimary, 0.06);
    secondaryArcMat.color.lerp(targetArcSecondary, 0.06);

    // Whisper-slow counter-rotation of the precision optical lens arcs
    primaryOpticArc.rotation.z = t * 0.07;
    secondaryOpticArc.rotation.z = -t * 0.05;

    if (refractPulse > 0.005) {
        const progress = 1 - refractPulse;
        pulseRingMesh.scale.setScalar(0.88 + progress * 0.78);
        pulseRingMat.opacity = refractPulse * 0.55;
    } else {
        pulseRingMat.opacity = 0;
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateResponsiveLayout();
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
