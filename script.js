import * as THREE from 'three';

// ============================================================================
// 1. THREE.JS SCENE, CAMERA & TRANSPARENT PEARL-WHITE OPTICAL STAGE
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Slightly closer focal perspective (44° FOV) heightens real 3D foreshortening as the horse turns
const camera = new THREE.PerspectiveCamera(
    44,
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
// 2. HORSE-CONNECTED MODES: POISE (PEARL WHITE) / PRANCE (GAIT) / PRISM (OPTICS)
// ============================================================================
const MODES = {
    poise: {
        prismA: '#fef9c3',
        prismB: '#e0f2fe',
        prismC: '#fce7f3',
        tintMix: 0.0,
        tintColor: '#ffffff',
        arcPrimary: '#cbd5e1',
        arcSecondary: '#e5b8cb',
        pranceStrength: 0.0,
        prismDispersion: 0.0,
        slipstreamOpacity: 0.0,
        coronaOpacity: 0.0,
        arcSpeed: 1.0
    },
    prance: {
        prismA: '#f5d0df',
        prismB: '#e0f2fe',
        prismC: '#fef3c7',
        tintMix: 0.04,
        tintColor: '#fffafc',
        arcPrimary: '#d88aa9',
        arcSecondary: '#cbd5e1',
        pranceStrength: 1.0,
        prismDispersion: 0.16,
        slipstreamOpacity: 0.55,
        coronaOpacity: 0.14,
        arcSpeed: 3.6
    },
    prism: {
        prismA: '#f9a8d4',
        prismB: '#7dd3fc',
        prismC: '#fde68a',
        tintMix: 0.04,
        tintColor: '#ffffff',
        arcPrimary: '#c97a9b',
        arcSecondary: '#7dd3fc',
        pranceStrength: 0.16,
        prismDispersion: 1.0,
        slipstreamOpacity: 0.0,
        coronaOpacity: 0.72,
        arcSpeed: 1.6
    }
};

// ============================================================================
// 3. VOLUMETRIC MULTI-SHELL OPTICAL-GLASS ARABIAN + DEEP 3D TURN ARCHITECTURE
// ============================================================================
const stageGroup = new THREE.Group();
const horsePivot = new THREE.Group();
stageGroup.add(horsePivot);

// Dedicated Levade / Rear pivot anchored at the standing hind hoof (-1.064, -1.475)
const HIND_HOOF_X = -1.064;
const HIND_HOOF_Y = -1.475;
const rearPivot = new THREE.Group();
rearPivot.position.set(HIND_HOOF_X, HIND_HOOF_Y, 0);
horsePivot.add(rearPivot);

// Soft Mother-of-Pearl Corona Halo behind the sculpture (blooms in 'Prism' mode & during 'Rear')
function createPrismCoronaTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const g = ctx.createRadialGradient(264, 240, 24, 256, 256, 248);
    g.addColorStop(0.0, 'rgba(255, 253, 245, 0.55)');
    g.addColorStop(0.32, 'rgba(224, 242, 254, 0.28)');
    g.addColorStop(0.58, 'rgba(252, 231, 243, 0.22)');
    g.addColorStop(0.80, 'rgba(237, 233, 254, 0.16)');
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
coronaMesh.position.set(0.05, 0.08, -0.34);
horsePivot.add(coronaMesh);

// Sleek Pearl-Silver & Rose-Nacre Slipstream Ribbons (glide past in 'Prance' mode)
const slipstreamGroup = new THREE.Group();
slipstreamGroup.position.z = -0.16;
const slipstreams = [];

const SLIPSTREAM_SPECS = [
    { y: 0.78, xBase: -0.35, len: 1.55, amp: 0.045, speed: 2.8, phase: 0.0, color: '#dfa0b8' },
    { y: 0.14, xBase: -0.55, len: 1.85, amp: 0.055, speed: 3.2, phase: 2.1, color: '#94a3b8' },
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
const colorTex = textureLoader.load('arabian_glassmorph.webp?v=11');
colorTex.minFilter = THREE.LinearMipmapLinearFilter;
colorTex.magFilter = THREE.LinearFilter;
colorTex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

const reliefTex = textureLoader.load('arabian_glass_relief.webp?v=11');
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

    // Separates near/far equine limbs, arched neck ribbon, torso & tail in real 3D Z-space
    // so turning the sculpture produces authentic multi-plane parallax between legs & body!
    float computeEquineDepth(vec2 uv, float relief) {
        float mask = smoothstep(0.01, 0.28, relief);

        // Near lifted right foreleg steps forward (+Z); far planted left foreleg sits back (-Z)
        float nearForeleg = smoothstep(0.68, 0.77, uv.x) * smoothstep(0.52, 0.28, uv.y);
        float farForeleg  = smoothstep(0.54, 0.61, uv.x) * smoothstep(0.69, 0.62, uv.x) * smoothstep(0.50, 0.22, uv.y);

        // Near planted right hind leg & sculpted hip (+Z); far lifted left hind leg recessed (-Z)
        float nearHind    = smoothstep(0.21, 0.28, uv.x) * smoothstep(0.39, 0.33, uv.x) * smoothstep(0.58, 0.16, uv.y);
        float farHind     = smoothstep(0.37, 0.43, uv.x) * smoothstep(0.52, 0.46, uv.x) * smoothstep(0.46, 0.18, uv.y);

        // Sweeping foreground shoulder-to-swan-neck glass ribbon & proud cheek (+Z)
        float neckRibbon  = smoothstep(0.50, 0.68, uv.x) * smoothstep(0.44, 0.78, uv.y) * smoothstep(0.92, 0.72, uv.x);
        float haunchDome  = smoothstep(0.26, 0.38, uv.x) * smoothstep(0.54, 0.40, uv.x) * smoothstep(0.38, 0.62, uv.y);

        // Flowing glass ribbon tail curves gracefully in Z
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
        // Volumetric slab offset + sculpted anatomical 3D relief
        pos.z += computeEquineDepth(uv, relief) + uLayerZ * smoothstep(0.01, 0.22, relief);

        // 1. Flowing glass ribbon tail motion (calm in Poise, spirited in Prance & Rear)
        float tailZone = smoothstep(0.30, 0.03, uv.x) * smoothstep(0.18, 0.42, uv.y);
        float tailWave = sin(uTime * (1.3 + uPrance * 2.8) + uv.y * 5.6);
        pos.z += tailWave * (0.018 + uPrance * 0.032) * tailZone * relief;
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

        // 3. 'Rear' (Levade) Action: Foreleg tuck & proud arched neck lift at peak of rear
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
    uniform float uBevelFocus;
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

        // Subtle internal parallax refraction shift as the sculpture turns in 3D
        vec2 turnRefract = vec2(sin(uTilt.x), -sin(uTilt.y)) * (0.0045 * (1.0 - thickness));
        vec2 sampleUv = clamp(vUv + turnRefract * uBevelFocus, 0.0, 1.0);

        vec2 dispOffset = N.xy * (0.0009 + uDispersion * 0.0065) * smoothstep(0.05, 0.55, thickness);
        vec4 baseG = texture2D(uColorMap, sampleUv);
        if (baseG.a < 0.008) discard;

        float rChan = texture2D(uColorMap, sampleUv + dispOffset).r;
        float bChan = texture2D(uColorMap, sampleUv - dispOffset).b;
        vec3 baseRgb = mix(baseG.rgb, vec3(rChan, baseG.g, bChan), clamp(0.10 + uDispersion * 0.88, 0.0, 1.0));

        // Precision gallery key & rim lights that sweep across glass bevels as the horse turns
        vec3 L1 = normalize(vec3(uMouse.x * 0.85 - 0.25 + sin(uTilt.x) * 0.55, -uMouse.y * 0.70 + 0.48, 1.0));
        vec3 L2 = normalize(vec3(-uMouse.x * 0.65 + 0.45 - sin(uTilt.x) * 0.45, uMouse.y * 0.50 - 0.22, 0.88));
        vec3 V = vec3(0.0, 0.0, 1.0);

        vec3 H1 = normalize(L1 + V);
        vec3 H2 = normalize(L2 + V);

        float specSharp = pow(max(dot(N, H1), 0.0), 48.0);
        float specSoft  = pow(max(dot(N, H2), 0.0), 16.0);
        float fresnel   = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 1.85);

        // Detect carved glass bevels & pale rose-pearl seams
        float maxC = max(baseG.r, max(baseG.g, baseG.b));
        float minC = min(baseG.r, min(baseG.g, baseG.b));
        float seamChroma = smoothstep(0.03, 0.16, maxC - minC);
        float rimWall = clamp(fresnel * 1.15 + seamChroma * 0.85 + (1.0 - smoothstep(0.05, 0.42, thickness)) * 0.75, 0.0, 1.0);

        float phase = dot(N.xy, vec2(3.6, 2.8)) + sampleUv.x * 4.4 - sampleUv.y * 2.6 + uTime * (0.42 + uDispersion * 0.65) + uTilt.x * 2.6;
        vec3 prismBand = 0.36 * uPrismA * (0.5 + 0.5 * sin(phase))
                       + 0.34 * uPrismB * (0.5 + 0.5 * sin(phase + 2.094))
                       + 0.30 * uPrismC * (0.5 + 0.5 * sin(phase + 4.188));

        vec3 col = baseRgb;
        col = mix(col, col * (0.90 + 0.18 * uTintColor), uTintMix);

        // Lift outer volumetric glass walls toward crisp, luminous Pearl White crystal
        col = mix(col, vec3(0.992, 0.990, 0.995), uBevelFocus * 0.42);

        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        float headroom = 1.0 - smoothstep(0.80, 0.99, lum);

        float causticBoost = 0.72 + uDispersion * 1.85;
        float causticMask = smoothstep(0.06, 0.62, thickness) * (0.28 + 0.72 * fresnel);
        col += prismBand * (specSoft * 0.14 + causticMask * 0.075 + seamChroma * 0.065) * causticBoost * (0.32 + 0.68 * headroom);
        col += vec3(1.0, 0.998, 1.0) * specSharp * (0.20 + seamChroma * 0.22 + uBevelFocus * 0.16) * smoothstep(0.03, 0.34, thickness);

        // Luminous pearl refraction wave sweeping from hindquarter to muzzle during 'Rear' or mode switch
        if (uPulse > 0.005) {
            float progress = 1.0 - uPulse;
            float distFromHind = length(sampleUv - vec2(0.24, 0.18));
            float waveRing = exp(-pow((distFromHind - progress * 1.15) * 8.5, 2.0));
            col += (prismBand * 0.55 + vec3(0.42)) * waveRing * uPulse * 0.58;
        }

        // Outer volumetric glass shells accentuate physical crystal slab edges as the sculpture rotates
        float alphaWeight = mix(1.0, rimWall, uBevelFocus);
        float outAlpha = baseG.a * uShellAlpha * alphaWeight;

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), outAlpha);
    }
`;

// Aspect ratio of abstract optical-glass Arabian = 890 / 837 = 1.0633
const arabianPlaneGeo = new THREE.PlaneGeometry(3.56, 3.35, 160, 160);

// 5-Layer Volumetric Optical-Glass Slab Stack (back crystal wall -> nacre core -> front specular face)
// Gives physical ~30cm glass slab depth when the Arabian turns in 3D!
const GLASS_SHELL_SPECS = [
    { layerZ: -0.15, shellAlpha: 0.44, bevelFocus: 0.72, order: 2 },
    { layerZ: -0.075, shellAlpha: 0.36, bevelFocus: 0.48, order: 3 },
    { layerZ:  0.00, shellAlpha: 0.97, bevelFocus: 0.00, order: 4 },
    { layerZ:  0.075, shellAlpha: 0.34, bevelFocus: 0.52, order: 5 },
    { layerZ:  0.15, shellAlpha: 0.46, bevelFocus: 0.76, order: 6 }
];

const shellMaterials = [];

GLASS_SHELL_SPECS.forEach((spec) => {
    const uniforms = {
        uColorMap: { value: colorTex },
        uReliefMap: { value: reliefTex },
        uTime: { value: 0.0 },
        uReliefDepth: { value: 0.46 },
        uLayerZ: { value: spec.layerZ },
        uShellAlpha: { value: spec.shellAlpha },
        uBevelFocus: { value: spec.bevelFocus },
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
// 4. MINIMALIST PEARL-WHITE OPTICAL LENS PLINTH
// ============================================================================
function createOpticalFloorGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const g = ctx.createRadialGradient(256, 256, 8, 256, 256, 248);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 0.94)');
    g.addColorStop(0.42, 'rgba(248, 250, 252, 0.42)');
    g.addColorStop(0.74, 'rgba(254, 249, 235, 0.22)');
    g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    return new THREE.CanvasTexture(c);
}

const plinthGroup = new THREE.Group();
plinthGroup.position.set(-0.02, -1.50, -0.12);

const floorDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.68, 84),
    new THREE.MeshBasicMaterial({
        map: createOpticalFloorGlowTexture(),
        transparent: true,
        opacity: 0.90,
        depthWrite: false
    })
);
floorDisc.rotation.x = -Math.PI / 2;
plinthGroup.add(floorDisc);

const primaryArcMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(MODES.poise.arcPrimary),
    transparent: true,
    opacity: 0.42,
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
    opacity: 0.34,
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
    color: new THREE.Color('#c97a9b'),
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
// 5. LIVE EQUINE GAIT, DEEP 3D TURN & INTERACTIVE TURNTABLE STATE
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
// 6. RESPONSIVE STAGE POSITIONING
// ============================================================================
let stageBaseX = -1.76;
let stageBaseY = 0.24;

function updateResponsiveLayout() {
    const w = window.innerWidth;
    if (w < 900) {
        stageGroup.scale.setScalar(0.82);
        camera.position.set(0, 0.12, 7.6);
        stageBaseX = 0.0;
        stageBaseY = 1.44;
    } else if (w < 1200) {
        stageGroup.scale.setScalar(0.98);
        camera.position.set(0, 0.10, 6.6);
        stageBaseX = -1.60;
        stageBaseY = 0.22;
    } else {
        stageGroup.scale.setScalar(1.08);
        camera.position.set(0, 0.10, 6.1);
        stageBaseX = -1.76;
        stageBaseY = 0.24;
    }
    stageGroup.position.set(stageBaseX, stageBaseY, 0);
}
updateResponsiveLayout();

// ============================================================================
// 7. INTERACTIVE CONTROLS: CURSOR 3D TURN, DRAG-TO-ROTATE & LEVADE REAR
// ============================================================================
let mouseNormX = 0;
let mouseNormY = 0;
let smoothMouseX = 0;
let smoothMouseY = 0;

// Interactive drag-to-turn state for inspecting deep 3D glass layers
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
    mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNormY = (e.clientY / window.innerHeight) * 2 - 1;

    if (isPointerDown) {
        const dist = Math.hypot(e.clientX - downClientX, e.clientY - downClientY);
        if (dist > 6) {
            pointerDragged = true;
        }
        const dx = e.clientX - prevDragX;
        prevDragX = e.clientX;
        dragYawOffset = Math.max(-0.55, Math.min(0.55, dragYawOffset + dx * 0.0045));
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

    // Gently relax manual drag offset when released so the sculpture settles gracefully
    if (!isPointerDown) {
        dragYawOffset *= 0.965;
    }

    // Smoothly interpolate horse mode parameters
    currentPrance += (activeMode.pranceStrength - currentPrance) * 0.07;
    currentDispersion += (activeMode.prismDispersion - currentDispersion) * 0.07;
    currentSlipstreamOpacity += (activeMode.slipstreamOpacity - currentSlipstreamOpacity) * 0.07;
    currentCoronaOpacity += (activeMode.coronaOpacity - currentCoronaOpacity) * 0.07;
    currentArcSpeed += (activeMode.arcSpeed - currentArcSpeed) * 0.06;

    // Classical Arabian 'Rear' (Levade) envelope
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

    // Calm Poise float + rhythmic Arabian Passage bounce ('Prance')
    const poiseFloat = Math.sin(t * 0.75) * 0.034 * (1.0 - currentPrance * 0.6);
    const pranceBounce = Math.abs(Math.sin(t * 3.8)) * 0.095 * currentPrance;
    const pranceRock = Math.sin(t * 3.8) * 0.028 * currentPrance;

    horsePivot.position.y = poiseFloat + pranceBounce;
    horsePivot.rotation.z = pranceRock;

    // Deep 3D Gallery Turn:
    // - Continuous organic showcase turn (±13.5°) even when hands-free
    // - Responsive cursor turn (±25°) + interactive drag-to-turn (clamped cleanly to ±39°)
    const autoYaw = Math.sin(t * 0.46) * 0.235;
    const autoPitch = Math.cos(t * 0.34) * 0.042;
    const rawTargetY = smoothMouseX * 0.43 + autoYaw + dragYawOffset;
    const targetRotY = Math.max(-0.68, Math.min(0.68, rawTargetY));
    const targetRotX = Math.max(-0.24, Math.min(0.24, smoothMouseY * 0.15 + autoPitch));

    horsePivot.rotation.y += (targetRotY - horsePivot.rotation.y) * 0.08;
    horsePivot.rotation.x += (targetRotX - horsePivot.rotation.x) * 0.08;

    // Cohesive 3D plinth perspective turn beneath the sculpture
    plinthGroup.rotation.y = horsePivot.rotation.y * 0.65;
    plinthGroup.rotation.x = horsePivot.rotation.x * 0.32;

    // Animate aerodynamic slipstream trails in 'Prance' mode
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

    // Animate Corona Halo behind sculpture ('Prism' mode + 'Rear' burst)
    coronaMat.opacity = Math.min(1.0, currentCoronaOpacity + rearEnvelope * 0.45);
    coronaMesh.scale.setScalar(1.0 + Math.sin(t * 1.4) * 0.03 + rearEnvelope * 0.08);

    // Update live GLSL optical-glass uniforms across all 5 volumetric glass shells
    const liveDispersion = Math.min(1.2, currentDispersion + rearEnvelope * 0.42);
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
        pulseRingMat.opacity = refractPulse * 0.48;
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
