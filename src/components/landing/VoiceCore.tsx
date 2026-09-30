
import { useEffect, useRef } from "react";
import * as THREE from "three";

export type CorePhase = "listening" | "speaking";

/**
 * The hero's 3D "voice core": a noise-displaced sphere with a fresnel rim, an additive glow and three
 * orbiting particle rings. It pulses in speech-like bursts and reports each phase change so the HTML
 * command bubbles can stay in sync.
 *
 * Performance rules (ui-ux-pro-max threejs stack): one renderer, DPR capped (1.25 on small screens,
 * 1.75 otherwise), alpha canvas, setAnimationLoop paused when the tab is hidden or the canvas is
 * offscreen, delta time read once per frame, shared geometry, <3k points, everything disposed on
 * unmount. Under prefers-reduced-motion it keeps a calm variant: slow drift, no pulses or parallax.
 */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const CORE_VERT = /* glsl */ `
uniform float uTime; uniform float uAmp;
varying vec3 vNormal; varying vec3 vView; varying float vNoise;
${NOISE}
void main(){
  float n = snoise(position * 1.4 + vec3(0.0, uTime * 0.35, uTime * 0.2));
  float n2 = snoise(position * 3.2 + uTime * 0.8) * 0.3;
  float d = (n + n2) * (0.05 + uAmp * 0.7);
  vec3 p = position + normal * d;
  vNoise = n;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = -mv.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}`;

const CORE_FRAG = /* glsl */ `
uniform vec3 uDeep; uniform vec3 uHot; uniform float uAmp;
varying vec3 vNormal; varying vec3 vView; varying float vNoise;
void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  vec3 L = normalize(vec3(-0.45, 0.65, 0.75));
  float fres = pow(1.0 - max(dot(V, N), 0.0), 2.4);
  float diff = max(dot(N, L), 0.0) * 0.75 + 0.18;
  float spec = pow(max(dot(N, normalize(L + V)), 0.0), 48.0);
  float bands = smoothstep(-0.3, 0.9, vNoise);
  vec3 body = mix(uDeep, uHot * 0.85, bands * 0.5) * diff;
  vec3 col = body + uHot * fres * (0.55 + uAmp * 2.2) + vec3(0.85, 0.9, 1.0) * spec * 0.55;
  gl_FragColor = vec4(col, 1.0);
}`;

const GLOW_FRAG = /* glsl */ `
uniform vec3 uHot; uniform float uAmp; uniform float uGain; varying vec2 vUv;
void main(){
  float d = distance(vUv, vec2(0.5));
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uHot, a * a * (0.35 + uAmp * 1.4) * uGain);
}`;

const POINTS_VERT = /* glsl */ `
uniform float uPx; attribute float aSize; varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPx * (3.0 / -mv.z);
  vA = clamp(1.4 - (-mv.z - 3.0) * 0.35, 0.25, 1.0);
  gl_Position = projectionMatrix * mv;
}`;

const POINTS_FRAG = /* glsl */ `
uniform vec3 uColor; varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.1, d) * vA;
  gl_FragColor = vec4(uColor, a);
}`;

/** Speech-like amplitude: short bursts of syllables, then a listening pause. Returns [amp, phase]. */
function envelope(t: number): [number, CorePhase] {
  const cycle = 5.2;
  const speakFor = 2.1;
  const local = t % cycle;
  if (local > speakFor) return [0.05, "listening"];
  const fadeIn = Math.min(1, local / 0.25);
  const fadeOut = Math.min(1, (speakFor - local) / 0.35);
  const syllables = Math.abs(Math.sin(t * 9.0) * Math.sin(t * 3.7 + 1.3));
  return [0.05 + 0.22 * syllables * fadeIn * fadeOut, "speaking"];
}

export default function VoiceCore({
  className = "",
  onPhase,
  onUnsupported,
}: {
  className?: string;
  onPhase?: (phase: CorePhase, cycle: number) => void;
  onUnsupported?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onPhaseRef = useRef(onPhase);
  useEffect(() => {
    onPhaseRef.current = onPhase;
  }, [onPhase]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      onUnsupported?.();
      return;
    }

    const small = window.matchMedia("(max-width: 768px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Animated 3D voice core that pulses while the assistant speaks");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 5.2);
    camera.lookAt(0, 0, 0);

    const deep = new THREE.Color("#2b0f7a");
    const hot = new THREE.Color("#8b5cff");

    const rig = new THREE.Group();
    scene.add(rig);

    // Core
    const coreGeo = new THREE.IcosahedronGeometry(1.15, small ? 7 : 11);
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: CORE_VERT,
      fragmentShader: CORE_FRAG,
      uniforms: { uTime: { value: 0 }, uAmp: { value: 0.05 }, uDeep: { value: deep }, uHot: { value: hot } },
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    rig.add(core);

    // Wire shell
    const shellGeo = new THREE.IcosahedronGeometry(1.55, 2);
    const shellMat = new THREE.MeshBasicMaterial({ color: hot, wireframe: true, transparent: true, opacity: 0.08 });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    rig.add(shell);

    // Glow (camera-facing plane, additive — cheaper than a bloom pass)
    const glowGeo = new THREE.PlaneGeometry(6, 6);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: GLOW_FRAG,
      uniforms: { uHot: { value: hot }, uAmp: { value: 0.05 }, uGain: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -0.6;
    scene.add(glow);

    // Orbit rings of points
    const COUNT = small ? 500 : 1100;
    const pos = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const rings = [
      { r: 1.95, tilt: new THREE.Euler(1.2, 0.2, 0) },
      { r: 2.35, tilt: new THREE.Euler(-0.9, 0.6, 0.3) },
      { r: 2.75, tilt: new THREE.Euler(0.3, -0.4, 1.1) },
    ];
    const v = new THREE.Vector3();
    for (let i = 0; i < COUNT; i++) {
      const ring = rings[i % 3];
      const a = Math.random() * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.12;
      v.set(Math.cos(a) * (ring.r + jitter), (Math.random() - 0.5) * 0.06, Math.sin(a) * (ring.r + jitter)).applyEuler(ring.tilt);
      pos.set([v.x, v.y, v.z], i * 3);
      sizes[i] = 0.6 + Math.random() * 1.6;
    }
    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    ptsGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const ptsMat = new THREE.ShaderMaterial({
      vertexShader: POINTS_VERT,
      fragmentShader: POINTS_FRAG,
      uniforms: { uPx: { value: dpr * 3.2 }, uColor: { value: new THREE.Color("#9be7ff") } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(ptsGeo, ptsMat);
    rig.add(points);

    // Sizing
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Pointer parallax target (window-level so it works across the whole hero)
    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Additive light only shows on a dark page. On the light theme switch to normal blending and deeper colours.
    const ptsColor = ptsMat.uniforms.uColor.value as THREE.Color;
    const applyTheme = () => {
      const dark = document.documentElement.classList.contains("dark");
      deep.set(dark ? "#2b0f7a" : "#5b34e0");
      hot.set(dark ? "#8b5cff" : "#7c3aed");
      ptsColor.set(dark ? "#9be7ff" : "#4f46e5");
      shellMat.color.set(dark ? "#8b5cff" : "#7c3aed");
      shellMat.opacity = dark ? 0.08 : 0.22;
      glowMat.uniforms.uGain.value = dark ? 1 : 0.5;
      const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      glowMat.blending = blend;
      ptsMat.blending = blend;
      glowMat.needsUpdate = true;
      ptsMat.needsUpdate = true;
    };
    applyTheme();
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let noMotion = false; // home page keeps the orb fully animated; see hooks/useLandingMotion.ts

    let lastTs = 0;
    let t = 0;
    let amp = 0.05;
    let lastPhase: CorePhase | null = null;
    let cycle = 0;

    const frame = (ts: number) => {
      // Delta read once per frame; clamped after a stall so nothing jumps.
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0.016;
      lastTs = ts;
      t += dt;
      // Calm mode (reduced motion): no speech pulses or pointer parallax, slow drift only.
      const [envAmp, envPhase] = envelope(t);
      const targetAmp = noMotion ? 0.07 : envAmp;
      const phase = envPhase;
      amp += (targetAmp - amp) * Math.min(1, dt * 14);
      if (phase !== lastPhase) {
        if (phase === "speaking") cycle++;
        lastPhase = phase;
        onPhaseRef.current?.(phase, cycle);
      }

      coreMat.uniforms.uTime.value = t;
      coreMat.uniforms.uAmp.value = amp;
      glowMat.uniforms.uAmp.value = amp;

      const speed = noMotion ? 0.35 : 1;
      core.rotation.y += dt * 0.18 * speed;
      shell.rotation.y -= dt * 0.06 * speed;
      shell.rotation.x += dt * 0.03 * speed;
      points.rotation.y += dt * 0.12 * speed;
      const s = 1 + amp * 0.35;
      core.scale.setScalar(s);

      const px = noMotion ? 0 : target.x;
      const py = noMotion ? 0 : target.y;
      rig.rotation.x += (py * 0.35 - rig.rotation.x) * Math.min(1, dt * 3);
      rig.rotation.z += (-px * 0.12 - rig.rotation.z) * Math.min(1, dt * 3);
      rig.position.x += (px * 0.18 - rig.position.x) * Math.min(1, dt * 3);

      renderer.render(scene, camera);
    };

    let visible = true;
    let running = false;
    const sync = () => {
      // Runs in both modes; reduced motion only switches to the calm variant inside frame().
      const shouldRun = visible && !document.hidden;
      if (shouldRun && !running) {
        lastTs = 0; // drop the paused interval so time doesn't leap
        renderer.setAnimationLoop(frame);
        running = true;
      } else if (!shouldRun && running) {
        renderer.setAnimationLoop(null);
        running = false;
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(host);
    const onVis = () => sync();
    document.addEventListener("visibilitychange", onVis);
    const onMotion = (e: MediaQueryListEvent) => {
      sync();
    };
    mq.addEventListener("change", onMotion);
    sync();

    return () => {
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener("change", onMotion);
      window.removeEventListener("pointermove", onPointer);
      [coreGeo, shellGeo, glowGeo, ptsGeo].forEach((g) => g.dispose());
      [coreMat, shellMat, glowMat, ptsMat].forEach((m) => m.dispose());
      renderer.dispose();
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className={className} />;
}
