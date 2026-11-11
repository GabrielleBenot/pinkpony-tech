import * as THREE from 'three';

// ============================================================================
// 1. THREE.JS SCENE, CAMERA & TRANSPARENT OPTICAL-GLASS STAGE
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    43,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

if (container) {
    container.appendChild(renderer.domElement);
}

// ============================================================================
// 2. HORSE-CONNECTED MODES: POISE (DEFAULT) / PRANCE (GAIT) / PRISM (DISPERSION)
//    Restored vibrant Mother-of-Pearl, Rainbow-Pearl & Pink Accent palette
// ============================================================================
const MODES = {
    poise: {
        prismA: '#f9a8d4',
        prismB: '#bae6fd',
        prismC: '#ddd6fe',
        tintMix: 0.0,
        tintColor: '#ffffff',
        arcPrimary: '#f472b6',
        arcSecondary: '#c4b5fd',
        pranceStrength: 0.0,
        prismDispersion: 0.0,
        slipstreamOpacity: 0.0,
        coronaOpacity: 0.0,
        arcSpeed: 1.0
    },
    prance: {
        prismA: '#ec4899',
        prismB: '#fbcfe8',
        prismC: '#bae6fd',
        tintMix: 0.08,
        tintColor: '#fce7f3',
        arcPrimary: '#ec4899',
        arcSecondary: '#f9a8d4',
        pranceStrength: 1.0,
        prismDispersion: 0.18,
        slipstreamOpacity: 0.62,
        coronaOpacity: 0.18,
        arcSpeed: 3.6
    },
    prism: {
        prismA: '#f43f8e',
        prismB: '#38bdf8',
        prismC: '#a855f7',
        tintMix: 0.06,
        tintColor: '#fdf4ff',
        arcPrimary: '#db2777',
        arcSecondary: '#38bdf8',
        pranceStrength: 0.18,
        prismDispersion: 1.0,
        slipstreamOpacity: 0.0,
        coronaOpacity: 0.88,
        arcSpeed: 1.6
    }
};

// ============================================================================
// 3. LAYERED OPTICAL-GLASS ARABIAN + DEEP 3D TURN + HIND-HOOF LEVADE PIVOT
// ============================================================================
const stageGroup = new THREE.Group();
const horsePivot = new THREE.Group();
stageGroup.add(horsePivot);

const HIND_HOOF_X = -1.064;
const HIND_HOOF_Y = -1.475;
const rearPivot = new THREE.Group();
rearPivot.position.set(HIND_HOOF_X, HIND_HOOF_Y, 0);
horsePivot.add(rearPivot);

function createPrismCoronaTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const g = ctx.createRadialGradient(264, 240, 24, 256, 256, 248);
    g.addColorStop(0.0, 'rgba(244, 114, 182, 0.34)');
    g.addColorStop(0.32, 'rgba(192, 132, 252, 0.26)');
    g.addColorStop(0.58, 'rgba(125, 211, 252, 0.22)');
    g.addColorStop(0.80, 'rgba(253, 230, 138, 0.14)');
    g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    return new THREE.CanvasTexture(c);
}

const coronaMat = new THREE.MeshBasicMaterial({
    map: createPrismCoronaTexture(),
    transparent: true,
    opacity: 0.0,
    depthWrite: false
});
const coronaMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.35, 4.05), coronaMat);
coronaMesh.position.set(0.05, 0.08, -0.32);
horsePivot.add(coronaMesh);

const slipstreamGroup = new THREE.Group();
slipstreamGroup.position.z = -0.15;
const slipstreams = [];

const SLIPSTREAM_SPECS = [
    { y: 0.78, xBase: -0.35, len: 1.55, amp: 0.045, speed: 2.8, phase: 0.0, color: '#f472b6' },
    { y: 0.14, xBase: -0.55, len: 1.85, amp: 0.055, speed: 3.2, phase: 2.1, color: '#c084fc' },
    { y: -0.46, xBase: -0.40, len: 1.40, amp: 0.038, speed: 2.5, phase: 4.2, color: '#7dd3fc' }
];

SLIPSTREAM_SPECS.forEach((spec) => {
    const segs = 48;
    const pts = [];
    for (let i = 0; i <= segs; i++) {
        pts.push(new THREE.Vector3((i / segs - 0.5) * spec.len, 0, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(spec.color),
        transparent: true,
        opacity: 0.0
    });
    const line = new THREE.Line(geo, mat);
    line.position.set(spec.xBase, spec.y, 0);
    slipstreamGroup.add(line);
    slipstreams.push({ line, geo, mat, spec, segs });
});
horsePivot.add(slipstreamGroup);

const textureLoader = new THREE.TextureLoader();
const colorTex = textureLoader.load('arabian_glassmorph.webp?v=12');
colorTex.minFilter = THREE.LinearMipmapLinearFilter;
colorTex.magFilter = THREE.LinearFilter;
colorTex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

const reliefTex = textureLoader.load('arabian_glass_relief.webp?v=12');
reliefTex.minFilter = THREE.LinearFilter;
reliefTex.magFilter = THREE.LinearFilter;

const VERTEX_SHADER = /* glsl */ `
    uniform sampler2D uReliefMap;
    uniform float uReliefDepth;
    uniform float uLayerZ;
    uniform float uTime;
    uniform float uPrance;
    uniform float uRear;

    varying vec2 vUv;

    // Separates near/far limbs, swan-neck ribbon, torso & tail in real 3D Z-space
    // so rotating the sculpture produces genuine 3D parallax without washing out colors!
    float computeEquineDepth(vec2 uv, float relief) {
        float mask = smoothstep(0.01, 0.28, relief);

        float nearForeleg = smoothstep(0.68, 0.77, uv.x) * smoothstep(0.52, 0.28, uv.y);
        float farForeleg  = smoothstep(0.54, 0.61, uv.x) * smoothstep(0.69, 0.62, uv.x) * smoothstep(0.50, 0.22, uv.y);

        float nearHind    = smoothstep(0.21, 0.28, uv.x) * smoothstep(0.39, 0.33, uv.x) * smoothstep(0.58, 0.16, uv.y);
        float farHind     = smoothstep(0.37, 0.43, uv.x) * smoothstep(0.52, 0.46, uv.x) * smoothstep(0.46, 0.18, uv.y);

        float neckRibbon  = smoothstep(0.50, 0.68, uv.x) * smoothstep(0.44, 0.78, uv.y) * smoothstep(0.92, 0.72, uv.x);
        float haunchDome  = smoothstep(0.26, 0.38, uv.x) * smoothstep(0.54, 0.40, uv.x) * smoothstep(0.38, 0.62, uv.y);
        float tailCurve   = smoothstep(0.30, 0.05, uv.x) * smoothstep(0.18, 0.66, uv.y) * sin(uv.y * 4.2 - 0.6);

        float zAnat = nearForeleg * 0.24
                    - farForeleg  * 0.22
                    + nearHind    * 0.17
                    - farHind     * 0.20
                    + neckRibbon  * 0.18
                    + haunchDome  * 0.12
                    + tailCurve   * 0.12;

        return (relief * uReliefDepth + zAnat) * mask;
    }

    void main() {
        vUv = uv;
        float relief = texture2D(uReliefMap, uv).a;

        vec3 pos = position;
        pos.z += computeEquineDepth(uv, relief) + uLayerZ * smoothstep(0.01, 0.22, relief);

        // 1. Flowing glass ribbon tail motion
        float tailZone = smoothstep(0.30, 0.03, uv.x) * smoothstep(0.18, 0.42, uv.y);
        float tailWave = sin(uTime * (1.3 + uPrance * 2.8) + uv.y * 5.6);
        pos.z += tailWave * (0.016 + uPrance * 0.030) * tailZone * relief;
        pos.y += sin(uTime * 3.6 - uv.x * 6.0) * 0.038 * uPrance * tailZone;

        // 2. 'Prance' Mode: Articulated Arabian Passage foreleg reach, hind-step & arched neck nod
        if (uPrance > 0.005) {
            float gaitPhase = uTime * 3.8;
            float liftedForeleg = smoothstep(0.69, 0.77, uv.x) * smoothstep(0.50, 0.34, uv.y);
            float kneeReach = sin(gaitPhase);
            pos.y += (0.045 + 0.055 * kneeReach) * liftedForeleg * uPrance;
            pos.x += (0.025 + 0.035 * cos(gaitPhase)) * liftedForeleg * uPrance;

            float liftedHind = smoothstep(0.24, 0.32, uv.x) * smoothstep(0.50, 0.40, uv.x) * smoothstep(0.45, 0.28, uv.y);
            pos.y += (0.035 - 0.040 * kneeReach) * liftedHind * uPrance;

            float headNeck = smoothstep(0.56, 0.74, uv.x) * smoothstep(0.54, 0.76, uv.y);
            pos.y += sin(gaitPhase + 0.8) * 0.032 * headNeck * uPrance;
            pos.x -= cos(gaitPhase + 0.8) * 0.018 * headNeck * uPrance;
        }

        // 3. 'Rear' (Levade) Action
        if (uRear > 0.005) {
            float foreTuck = smoothstep(0.68, 0.78, uv.x) * smoothstep(0.52, 0.30, uv.y);
            pos.y += 0.09 * foreTuck * uRear;
            pos.x -= 0.03 * foreTuck * uRear;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const FRAGMENT_SHADER = /* glsl */ `
    uniform sampler2D uColorMap;
    uniform sampler2D uReliefMap;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uTilt;
    uniform float uDispersion;
    uniform float uPulse;
    uniform float uShellAlpha;
    uniform float uRimMode;
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
        vec4 nr = texture2D(uReliefMap, vUv);
        vec3 localNormal = normalize(nr.rgb * 2.0 - 1.0);
        vec3 N = rotateNormalXY(localNormal, uTilt.x, uTilt.y);
        float thickness = nr.a;

        vec2 dispOffset = N.xy * (0.0012 + uDispersion * 0.0068) * smoothstep(0.05, 0.55, thickness);
        vec4 baseG = texture2D(uColorMap, vUv);
        if (baseG.a < 0.008) discard;

        float rChan = texture2D(uColorMap, vUv + dispOffset).r;
        float bChan = texture2D(uColorMap, vUv - dispOffset).b;
        vec3 baseRgb = mix(baseG.rgb, vec3(rChan, baseG.g, bChan), clamp(0.15 + uDispersion * 0.85, 0.0, 1.0));

        vec3 L1 = normalize(vec3(uMouse.x * 0.85 - 0.22 + sin(uTilt.x) * 0.50, -uMouse.y * 0.75 + 0.45, 1.0));
        vec3 L2 = normalize(vec3(-uMouse.x * 0.65 + 0.42 - sin(uTilt.x) * 0.40, uMouse.y * 0.55 - 0.25, 0.88));
        vec3 V = vec3(0.0, 0.0, 1.0);

        vec3 H1 = normalize(L1 + V);
        vec3 H2 = normalize(L2 + V);

        float specSharp = pow(max(dot(N, H1), 0.0), 46.0);
        float specSoft  = pow(max(dot(N, H2), 0.0), 16.0);
        float fresnel   = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.0);

        // Detect pink laser-cut optical glass seams
        float maxC = max(baseG.r, max(baseG.g, baseG.b));
        float minC = min(baseG.r, min(baseG.g, baseG.b));
        float seamChroma = smoothstep(0.05, 0.22, maxC - minC);

        float phase = dot(N.xy, vec2(3.8, 2.9)) + vUv.x * 4.6 - vUv.y * 2.8 + uTime * (0.48 + uDispersion * 0.65) + uTilt.x * 2.2 + uMouse.x * 1.5;
        vec3 prismBand = 0.36 * uPrismA * (0.5 + 0.5 * sin(phase))
                       + 0.32 * uPrismB * (0.5 + 0.5 * sin(phase + 2.094))
                       + 0.32 * uPrismC * (0.5 + 0.5 * sin(phase + 4.188));

        vec3 col = baseRgb;
        col = mix(col, col * (0.86 + 0.26 * uTintColor), uTintMix);

        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        float headroom = 1.0 - smoothstep(0.78, 0.98, lum);

        float causticBoost = 1.0 + uDispersion * 1.65;
        float causticMask = smoothstep(0.06, 0.62, thickness) * (0.32 + 0.68 * fresnel);
        col += prismBand * (specSoft * 0.16 + causticMask * 0.085 + seamChroma * 0.075) * causticBoost * (0.35 + 0.65 * headroom);
        col += vec3(1.0, 0.98, 1.0) * specSharp * (0.16 + seamChroma * 0.20 + uDispersion * 0.10) * smoothstep(0.04, 0.36, thickness);

        if (uPulse > 0.005) {
            float progress = 1.0 - uPulse;
            float distFromHind = length(vUv - vec2(0.24, 0.18));
            float waveRing = exp(-pow((distFromHind - progress * 1.15) * 8.5, 2.0));
            col += (prismBand * 0.68 + vec3(0.34)) * waveRing * uPulse * 0.62;
        }

        // Rear crystal bevel shell reveals colorful rainbow-pink glass thickness as the horse turns
        float edgeMask = clamp(seamChroma * 1.25 + fresnel * 0.85 + (1.0 - smoothstep(0.04, 0.38, thickness)) * 0.70, 0.0, 1.0);
        float outAlpha = baseG.a * uShellAlpha * mix(1.0, edgeMask, uRimMode);

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), outAlpha);
    }
`;

// Aspect ratio of abstract optical-glass Arabian = 890 / 837 = 1.0633
const arabianPlaneGeo = new THREE.PlaneGeometry(3.56, 3.35, 160, 160);

// Crisp rear optical-bevel shell (z = -0.15) + full vibrant foreground Arabian sculpture (z = 0.0)
// Preserves 100% of v=10's rich pink & rainbow-pearl colors with zero white haze while adding real 3D slab depth!
const GLASS_SHELL_SPECS = [
    { layerZ: -0.15, shellAlpha: 0.62, rimMode: 1.0, order: 2 },
    { layerZ:  0.00, shellAlpha: 1.00, rimMode: 0.0, order: 3 }
];

const shellMaterials = [];

GLASS_SHELL_SPECS.forEach((spec) => {
    const uniforms = {
        uColorMap: { value: colorTex },
        uReliefMap: { value: reliefTex },
        uTime: { value: 0.0 },
        uReliefDepth: { value: 0.44 },
        uLayerZ: { value: spec.layerZ },
        uShellAlpha: { value: spec.shellAlpha },
        uRimMode: { value: spec.rimMode },
        uMouse: { value: new THREE.Vector2(0.0, 0.0) },
        uTilt: { value: new THREE.Vector2(0.0, 0.0) },
        uPrance: { value: 0.0 },
        uRear: { value: 0.0 },
        uDispersion: { value: 0.0 },
        uPulse: { value: 0.0 },
        uPrismA: { value: new THREE.Color(MODES.poise.prismA) },
        uPrismB: { value: new THREE.Color(MODES.poise.prismB) },
        uPrismC: { value: new THREE.Color(MODES.poise.prismC) },
        uTintColor: { value: new THREE.Color(MODES.poise.tintColor) },
        uTintMix: { value: MODES.poise.tintMix }
    };

    const mat = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER
    });

    const mesh = new THREE.Mesh(arabianPlaneGeo, mat);
    mesh.position.set(-HIND_HOOF_X, -HIND_HOOF_Y, 0);
    mesh.renderOrder = spec.order;
    rearPivot.add(mesh);
    shellMaterials.push(mat);
});

// ============================================================================
// 4. MINIMALIST PRECISION OPTICAL LENS PLINTH (Restored v=10 rose & lilac glow)
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

const primaryArcMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(MODES.poise.arcPrimary),
    transparent: true,
    opacity: 0.36,
    side: THREE.DoubleSide,
    depthWrite: false
});
const primaryOpticArc = new THREE.Mesh(
    new THREE.RingGeometry(1.30, 1.312, 96, 1, 0, Math.PI * 1.28),
    primaryArcMat
);
primaryOpticArc.rotation.x = -Math.PI / 2;
primaryOpticArc.position.y = 0.004;
plinthGroup.add(primaryOpticArc);

const secondaryArcMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(MODES.poise.arcSecondary),
    transparent: true,
    opacity: 0.30,
    side: THREE.DoubleSide,
    depthWrite: false
});
const secondaryOpticArc = new THREE.Mesh(
    new THREE.RingGeometry(1.48, 1.490, 96, 1, Math.PI * 0.85, Math.PI * 1.05),
    secondaryArcMat
);
secondaryOpticArc.rotation.x = -Math.PI / 2;
secondaryOpticArc.position.y = 0.003;
plinthGroup.add(secondaryOpticArc);

const pulseRingMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ec4899'),
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false
});
const pulseRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(1.04, 1.09, 96),
    pulseRingMat
);
pulseRingMesh.rotation.x = -Math.PI / 2;
pulseRingMesh.position.y = 0.008;
plinthGroup.add(pulseRingMesh);

stageGroup.add(plinthGroup);
scene.add(stageGroup);

coronaMesh.renderOrder = 0;
plinthGroup.renderOrder = 1;
slipstreamGroup.renderOrder = 1;

// ============================================================================
// 5. LIVE EQUINE GAIT, DEEP 3D TURN & INTERPOLATION STATE
// ============================================================================
let activeMode = MODES.poise;
let targetPrismA = new THREE.Color(MODES.poise.prismA);
let targetPrismB = new THREE.Color(MODES.poise.prismB);
let targetPrismC = new THREE.Color(MODES.poise.prismC);
let targetTintColor = new THREE.Color(MODES.poise.tintColor);
let targetTintMix = MODES.poise.tintMix;
let targetArcPrimary = new THREE.Color(MODES.poise.arcPrimary);
let targetArcSecondary = new THREE.Color(MODES.poise.arcSecondary);

let currentPrance = 0.0;
let currentDispersion = 0.0;
let currentSlipstreamOpacity = 0.0;
let currentCoronaOpacity = 0.0;
let currentArcSpeed = 1.0;
let arcAngleAccum = 0.0;

let rearPhase = 0.0;
let isRearing = false;
let refractPulse = 0.0;

// ============================================================================
// 6. RESPONSIVE STAGE POSITIONING (Desktop Split vs Phone Pinned Upper Stage)
// ============================================================================
let stageBaseX = -1.76;
let stageBaseY = 0.24;

function updateResponsiveLayout() {
    const w = window.innerWidth;
    if (w <= 900) {
        // On phone/tablet, #canvas-container is pinned to the fixed upper stage above the Gait ribbon
        const cw = (container && container.clientWidth) || w;
        const ch = (container && container.clientHeight) || Math.round(window.innerHeight * 0.35);
        renderer.setSize(cw, ch);
        camera.aspect = cw / Math.max(ch, 1);
        camera.updateProjectionMatrix();

        stageGroup.scale.setScalar(0.95);
        camera.position.set(0, 0.05, 5.85);
        stageBaseX = 0.0;
        stageBaseY = 0.08;
    } else if (w < 1200) {
        renderer.setSize(w, window.innerHeight);
        camera.aspect = w / Math.max(window.innerHeight, 1);
        camera.updateProjectionMatrix();

        stageGroup.scale.setScalar(0.98);
        camera.position.set(0, 0.10, 6.7);
        stageBaseX = -1.60;
        stageBaseY = 0.22;
    } else {
        renderer.setSize(w, window.innerHeight);
        camera.aspect = w / Math.max(window.innerHeight, 1);
        camera.updateProjectionMatrix();

        stageGroup.scale.setScalar(1.08);
        camera.position.set(0, 0.10, 6.2);
        stageBaseX = -1.76;
        stageBaseY = 0.24;
    }
    stageGroup.position.set(stageBaseX, stageBaseY, 0);
}
updateResponsiveLayout();

// ============================================================================
// 7. INTERACTIVE CONTROLS: DEEP 3D TURN, DRAG-TO-ROTATE, GAITS & REAR
// ============================================================================
let mouseNormX = 0;
let mouseNormY = 0;
let smoothMouseX = 0;
let smoothMouseY = 0;

let isPointerDown = false;
let pointerDragged = false;
let downClientX = 0;
let downClientY = 0;
let prevDragX = 0;
let dragYawOffset = 0;

function triggerArabianRear() {
    isRearing = true;
    rearPhase = 0.001;
    refractPulse = 1.0;
}

window.addEventListener('pointermove', (e) => {
    const cw = (container && container.clientWidth) || window.innerWidth;
    const ch = (container && container.clientHeight) || window.innerHeight;
    mouseNormX = Math.max(-1, Math.min(1, (e.clientX / Math.max(cw, 1)) * 2 - 1));
    mouseNormY = Math.max(-1, Math.min(1, (e.clientY / Math.max(ch, 1)) * 2 - 1));

    if (isPointerDown) {
        const dist = Math.hypot(e.clientX - downClientX, e.clientY - downClientY);
        if (dist > 6) {
            pointerDragged = true;
        }
        const dx = e.clientX - prevDragX;
        prevDragX = e.clientX;
        dragYawOffset = Math.max(-0.55, Math.min(0.55, dragYawOffset + dx * 0.0048));
    }
});

if (container) {
    container.addEventListener('pointerdown', (e) => {
        isPointerDown = true;
        pointerDragged = false;
        downClientX = e.clientX;
        downClientY = e.clientY;
        prevDragX = e.clientX;
    });

    window.addEventListener('pointerup', () => {
        if (isPointerDown && !pointerDragged) {
            triggerArabianRear();
        }
        isPointerDown = false;
    });
}

const prismPulseBtn = document.getElementById('prism-pulse-btn');
if (prismPulseBtn) {
    prismPulseBtn.addEventListener('click', triggerArabianRear);
}

const modeBtns = document.querySelectorAll('.spectrum-btn');
modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-mode');
        if (!key || !MODES[key]) return;

        modeBtns.forEach((b) => b.classList.toggle('active', b === btn));

        activeMode = MODES[key];
        targetPrismA.set(activeMode.prismA);
        targetPrismB.set(activeMode.prismB);
        targetPrismC.set(activeMode.prismC);
        targetTintColor.set(activeMode.tintColor);
        targetTintMix = activeMode.tintMix;
        targetArcPrimary.set(activeMode.arcPrimary);
        targetArcSecondary.set(activeMode.arcSecondary);

        refractPulse = 1.0;
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
let prevTime = 0;

function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    const dt = Math.min(t - prevTime, 0.05);
    prevTime = t;

    refractPulse = Math.max(0, refractPulse - dt * 0.95);

    smoothMouseX += (mouseNormX - smoothMouseX) * 0.065;
    smoothMouseY += (mouseNormY - smoothMouseY) * 0.065;

    if (!isPointerDown) {
        dragYawOffset *= 0.965;
    }

    currentPrance += (activeMode.pranceStrength - currentPrance) * 0.07;
    currentDispersion += (activeMode.prismDispersion - currentDispersion) * 0.07;
    currentSlipstreamOpacity += (activeMode.slipstreamOpacity - currentSlipstreamOpacity) * 0.07;
    currentCoronaOpacity += (activeMode.coronaOpacity - currentCoronaOpacity) * 0.07;
    currentArcSpeed += (activeMode.arcSpeed - currentArcSpeed) * 0.06;

    let rearEnvelope = 0.0;
    if (isRearing) {
        rearPhase += dt * 0.72;
        if (rearPhase >= 1.0) {
            rearPhase = 0.0;
            isRearing = false;
        } else {
            rearEnvelope = Math.pow(Math.sin(rearPhase * Math.PI), 1.35);
        }
    }

    rearPivot.rotation.z = rearEnvelope * 0.288;

    const poiseFloat = Math.sin(t * 0.75) * 0.034 * (1.0 - currentPrance * 0.6);
    const pranceBounce = Math.abs(Math.sin(t * 3.8)) * 0.095 * currentPrance;
    const pranceRock = Math.sin(t * 3.8) * 0.028 * currentPrance;

    horsePivot.position.y = poiseFloat + pranceBounce;
    horsePivot.rotation.z = pranceRock;

    // Deep 3D Showcase Turn (±13.5° organic turn + ±25° cursor turn + ±39° drag)
    const autoYaw = Math.sin(t * 0.46) * 0.235;
    const autoPitch = Math.cos(t * 0.34) * 0.042;
    const rawTargetY = smoothMouseX * 0.43 + autoYaw + dragYawOffset;
    const targetRotY = Math.max(-0.68, Math.min(0.68, rawTargetY));
    const targetRotX = Math.max(-0.24, Math.min(0.24, smoothMouseY * 0.15 + autoPitch));

    horsePivot.rotation.y += (targetRotY - horsePivot.rotation.y) * 0.08;
    horsePivot.rotation.x += (targetRotX - horsePivot.rotation.x) * 0.08;

    plinthGroup.rotation.y = horsePivot.rotation.y * 0.65;
    plinthGroup.rotation.x = horsePivot.rotation.x * 0.32;

    if (currentSlipstreamOpacity > 0.005) {
        slipstreams.forEach(({ geo, mat, spec, segs }) => {
            const posAttr = geo.attributes.position;
            const travel = ((t * spec.speed + spec.phase) % (Math.PI * 2)) / (Math.PI * 2);
            for (let i = 0; i <= segs; i++) {
                const u = i / segs;
                const x = (0.5 - u) * spec.len - travel * 0.55;
                const y = Math.sin(u * 5.2 - t * spec.speed * 2.2 + spec.phase) * spec.amp;
                posAttr.setXYZ(i, x, y, 0);
            }
            posAttr.needsUpdate = true;
            const fade = Math.sin(travel * Math.PI);
            mat.opacity = currentSlipstreamOpacity * (0.35 + 0.65 * fade);
        });
    } else {
        slipstreams.forEach(({ mat }) => {
            mat.opacity = 0;
        });
    }

    coronaMat.opacity = Math.min(1.0, currentCoronaOpacity + rearEnvelope * 0.55);
    coronaMesh.scale.setScalar(1.0 + Math.sin(t * 1.4) * 0.03 + rearEnvelope * 0.08);

    const liveDispersion = Math.min(1.2, currentDispersion + rearEnvelope * 0.45);
    for (let i = 0; i < shellMaterials.length; i++) {
        const u = shellMaterials[i].uniforms;
        u.uTime.value = t;
        u.uMouse.value.set(smoothMouseX, smoothMouseY);
        u.uTilt.value.set(horsePivot.rotation.y, horsePivot.rotation.x);
        u.uPrance.value = currentPrance;
        u.uRear.value = rearEnvelope;
        u.uDispersion.value = liveDispersion;
        u.uPulse.value = refractPulse;
        u.uPrismA.value.lerp(targetPrismA, 0.06);
        u.uPrismB.value.lerp(targetPrismB, 0.06);
        u.uPrismC.value.lerp(targetPrismC, 0.06);
        u.uTintColor.value.lerp(targetTintColor, 0.06);
        u.uTintMix.value += (targetTintMix - u.uTintMix.value) * 0.06;
    }

    primaryArcMat.color.lerp(targetArcPrimary, 0.06);
    secondaryArcMat.color.lerp(targetArcSecondary, 0.06);

    arcAngleAccum += dt * currentArcSpeed;
    primaryOpticArc.rotation.z = arcAngleAccum * 0.08;
    secondaryOpticArc.rotation.z = -arcAngleAccum * 0.06;

    if (refractPulse > 0.005) {
        const progress = 1 - refractPulse;
        pulseRingMesh.scale.setScalar(0.85 + progress * 0.88);
        pulseRingMat.opacity = refractPulse * 0.58;
    } else {
        pulseRingMat.opacity = 0;
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', updateResponsiveLayout);

// ============================================================================
// 9. NAVIGATION, SIDE HAMBURGER DRAWER, SCROLL REGION & COPY EMAIL LOGIC
// ============================================================================
const navHome = document.getElementById('nav-home');
const navAbout = document.getElementById('nav-about');
const aboutSubtabs = document.getElementById('about-subtabs');
const heroCard = document.getElementById('hero-card');
const aboutStage = document.getElementById('about-stage');
const contentScrollRegion = document.getElementById('content-scroll-region');
const exploreAboutBtn = document.getElementById('explore-about-btn');
const tabPills = document.querySelectorAll('.tab-pill');
const detailCards = document.querySelectorAll('.glass-detail-card');
const closeCardBtns = document.querySelectorAll('.card-close-btn');
const stepBtns = document.querySelectorAll('.card-step-btn');
const footerCardLinks = document.querySelectorAll('.footer-card-link');

// Side Hamburger Drawer Elements
const hamburgerBtn = document.getElementById('hamburger-btn');
const sideDrawer = document.getElementById('side-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerCloseBtn = document.getElementById('drawer-close-btn');
const drawerHomeBtn = document.getElementById('drawer-home');
const drawerAboutBtn = document.getElementById('drawer-about');
const drawerSublinks = document.querySelectorAll('.drawer-sublink');
const drawerLegalBtns = document.querySelectorAll('.drawer-legal-btn');
const drawerTargets = document.querySelectorAll('[data-drawer-target]');

function setDrawerOpen(open) {
    if (!sideDrawer || !hamburgerBtn || !drawerBackdrop) return;
    sideDrawer.classList.toggle('is-open', open);
    sideDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    hamburgerBtn.classList.toggle('is-open', open);
    hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawerBackdrop.hidden = !open;
}

function resetMobileScrollTop() {
    if (contentScrollRegion && window.innerWidth <= 900) {
        contentScrollRegion.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function syncDrawerActiveState(activeTarget) {
    const isHome = !activeTarget || activeTarget === 'home';
    const isLegal = activeTarget === 'card-privacy' || activeTarget === 'card-terms';
    const isAboutCard = !isHome && !isLegal;

    if (drawerHomeBtn) drawerHomeBtn.classList.toggle('active', isHome);
    if (drawerAboutBtn) drawerAboutBtn.classList.toggle('active', isAboutCard);

    drawerSublinks.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-drawer-target') === activeTarget);
    });

    drawerLegalBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-drawer-target') === activeTarget);
    });
}

function showHomeView() {
    detailCards.forEach((card) => {
        card.hidden = true;
    });
    tabPills.forEach((pill) => {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
    });
    if (aboutSubtabs) aboutSubtabs.hidden = true;
    if (aboutStage) aboutStage.hidden = true;
    if (heroCard) heroCard.hidden = false;

    if (navHome) {
        navHome.classList.add('active');
        navHome.setAttribute('aria-current', 'page');
    }
    if (navAbout) {
        navAbout.classList.remove('active');
        navAbout.setAttribute('aria-expanded', 'false');
    }

    syncDrawerActiveState('home');
    resetMobileScrollTop();
}

function showAboutCard(cardId) {
    if (!cardId || cardId === 'home') {
        showHomeView();
        return;
    }

    const isLegalCard = cardId === 'card-privacy' || cardId === 'card-terms';

    if (heroCard) heroCard.hidden = true;
    if (aboutStage) aboutStage.hidden = false;
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

    syncDrawerActiveState(cardId);
    resetMobileScrollTop();
}

// Hamburger Drawer Triggers
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        const isOpen = sideDrawer && sideDrawer.classList.contains('is-open');
        setDrawerOpen(!isOpen);
    });
}

if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => setDrawerOpen(false));
}

if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', () => setDrawerOpen(false));
}

drawerTargets.forEach((btn) => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-drawer-target');
        showAboutCard(target);
        setDrawerOpen(false);
    });
});

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
    if (btn.id === 'drawer-close-btn') return;
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
        if (sideDrawer && sideDrawer.classList.contains('is-open')) {
            setDrawerOpen(false);
        } else {
            showHomeView();
        }
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
