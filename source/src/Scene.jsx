import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Noise, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'
import { scroll, useUI } from './store'
import { useMats, Rings, Product, Plinth } from './models'
import { PHOTOS, ENTRANCE_PHOTO, GIFTS } from './config'
import { placeholderPhoto } from './paint'

const SECTIONS = ['hero', 'entrance', 'life', 'film', 'day', 'gifts', 'register']
const BG = { hero: '#f3efe7', entrance: '#f3efe7', life: '#16110e', film: '#16110e', day: '#f3efe7', gifts: '#4a141c', register: '#f3efe7' }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const smooth = t => t * t * (3 - 2 * t)
const tmpC = new THREE.Color(), accC = new THREE.Color()
const BGC = Object.fromEntries(Object.entries(BG).map(([k, v]) => [k, new THREE.Color(v)]))

// Measure the DOM once per frame; everything 3D reads from here.
function Measure() {
  const { scene } = useThree()
  useEffect(() => { scene.background = new THREE.Color(BG.hero) }, [scene])
  useFrame(() => {
    const vh = innerHeight
    accC.setRGB(0, 0, 0); let wsum = 0
    for (const id of SECTIONS) {
      const el = document.getElementById(id); if (!el) continue
      const r = el.getBoundingClientRect()
      const vis = clamp((Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh)
      const p = r.height > vh ? clamp(-r.top / (r.height - vh)) : clamp((vh - r.top) / (vh + r.height))
      const c = (vh / 2 - (r.top + r.height / 2)) / vh
      scroll.sections[id] = { vis, p, c }
      if (vis > 0) { const w = vis * vis * vis * vis; tmpC.copy(BGC[id]).multiplyScalar(w); accC.add(tmpC); wsum += w }
    }
    if (wsum > 0) scene.background.lerp(accC.multiplyScalar(1 / wsum), .2)
  })
  return null
}

function StudioLight() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2} color="#fff4e6" position={[0, 5, -2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[-6, 1, 2]} scale={[2, 8, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.1} color="#ffe2c4" position={[6, 1, 2]} scale={[2, 8, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[0, 1, 6]} scale={3} />
      <Lightformer form="rect" intensity={.6} color="#c9a46a" position={[0, -4, 0]} scale={[10, 10, 1]} rotation-x={-Math.PI / 2} />
    </Environment>
  )
}

function RingsGroup({ m }) {
  const ref = useRef(), spin = useRef()
  const { viewport } = useThree()
  useFrame((st, dt) => {
    const h = scroll.sections.hero || { vis: 1, c: 0 }, r = scroll.sections.register || { vis: 0, c: 0 }
    const useReg = r.vis > h.vis, s = useReg ? r : h
    const g = ref.current; g.visible = s.vis > .02 && !useReg
    if (!g.visible) return
    const portrait = viewport.aspect < .9
    const baseY = portrait ? .75 : .15
    g.position.y = THREE.MathUtils.damp(g.position.y, baseY + s.c * viewport.height, 8, dt)
    g.position.x = THREE.MathUtils.damp(g.position.x, (portrait ? 0 : (useReg ? -2.2 : 2.1)) + scroll.pointer.x * .3, 4, dt)
    const sc = (portrait ? .85 : 1.15) * (.85 + .15 * s.vis)
    g.scale.setScalar(sc)
    spin.current.rotation.y += dt * .25 + scroll.velocity * .0009
    spin.current.rotation.x = THREE.MathUtils.damp(spin.current.rotation.x, .35 + scroll.pointer.y * .3 + s.c * .8, 4, dt)
  })
  return <group ref={ref}><group ref={spin}><Rings m={m} /></group></group>
}

// A photograph as a soft, living surface: bends with scroll speed, reveals from the bottom.
const photoVert = `
uniform float uBend; varying vec2 vUv;
void main(){ vUv = uv; vec3 p = position; p.z += sin(uv.x * 3.14159) * uBend; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`
const photoFrag = `
uniform sampler2D uTex; uniform float uReveal; uniform float uFade; uniform float uShift; varying vec2 vUv;
void main(){
  float edge = smoothstep(uReveal - .08, uReveal, 1.0 - vUv.y + (sin(vUv.x * 9.0) * .015));
  vec2 uv = vec2(vUv.x, mix(vUv.y, .5, (1.0 - uReveal) * .12));
  vec3 col = vec3(texture2D(uTex, uv + vec2(uShift, 0.)).r, texture2D(uTex, uv).g, texture2D(uTex, uv - vec2(uShift, 0.)).b);
  gl_FragColor = vec4(col, (1.0 - edge) * uFade);
  #include <colorspace_fragment>
}`
function usePhotoTexture(src, i, w, h, label) {
  return useMemo(() => {
    const t = src ? new THREE.TextureLoader().load(src) : new THREE.CanvasTexture(placeholderPhoto(i, w, h, label))
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t
  }, [src, i, w, h, label])
}
function Photo({ tex, width, height, matRef }) {
  const uniforms = useMemo(() => ({ uTex: { value: tex }, uBend: { value: 0 }, uReveal: { value: 0 }, uFade: { value: 1 }, uShift: { value: 0 } }), [tex])
  return <mesh><planeGeometry args={[width, height, 32, 1]} /><shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={photoVert} fragmentShader={photoFrag} transparent toneMapped={false} /></mesh>
}

function EntrancePhoto() {
  const ref = useRef(), mat = useRef(); const { viewport } = useThree()
  const tex = usePhotoTexture(ENTRANCE_PHOTO, 2, 1500, 1000, ENTRANCE_PHOTO ? '' : 'Entrance photo arrives soon')
  const w = Math.min(viewport.width * .88, 6.4)
  useFrame((st, dt) => {
    const s = scroll.sections.entrance || { vis: 0, c: 0, p: 0 }
    ref.current.visible = s.vis > .01; if (!ref.current.visible) return
    ref.current.position.y = -s.c * viewport.height * .82
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, scroll.pointer.x * .18, 4, dt)
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, -scroll.pointer.y * .1 - s.c * .25, 4, dt)
    const u = mat.current.uniforms
    u.uReveal.value = THREE.MathUtils.damp(u.uReveal.value, clamp(s.vis * 1.7 - .2), 5, dt)
    u.uBend.value = THREE.MathUtils.damp(u.uBend.value, clamp(scroll.velocity * .01, -.6, .6), 6, dt)
    u.uShift.value = Math.abs(u.uBend.value) * .006
  })
  return <group ref={ref}><Photo tex={tex} width={w} height={w / 1.5} matRef={mat} /></group>
}

function LifePhoto({ i, photo, mats }) {
  const tex = usePhotoTexture(photo.src, i, 800, 1000, photo.src ? '' : `Photo ${String(i + 1).padStart(2, '0')} arrives soon`)
  const mat = useRef(); mats.current[i] = mat
  return <Photo tex={tex} width={2.4} height={3} matRef={mat} />
}
function LifeGallery() {
  const ref = useRef(), items = useRef([]), mats = useRef([]); const { viewport } = useThree()
  const setLifeIndex = useUI(s => s.setLifeIndex)
  const GAP = 5
  useFrame((st, dt) => {
    const s = scroll.sections.life || { vis: 0, p: 0 }
    ref.current.visible = s.vis > .01; if (!ref.current.visible) return
    const portrait = viewport.aspect < .9, n = PHOTOS.length
    const seg = s.p * (n - 1), i = Math.min(Math.floor(seg), n - 2), t = seg - i
    const travel = (i + smooth(clamp((t - .2) / .6))) * GAP
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, travel, 6, dt)
    ref.current.position.y = portrait ? .55 : 0
    const idx = Math.round(seg); if (useUI.getState().lifeIndex !== idx) setLifeIndex(idx)
    items.current.forEach((g, k) => {
      if (!g) return
      const side = k % 2 ? 1 : -1
      g.position.set(portrait ? side * .35 : side * 1.7, Math.sin(k * 2.1) * .25, -k * GAP)
      g.rotation.y = side * (portrait ? -.08 : -.22)
      const d = Math.abs(k * GAP - ref.current.position.z)
      const m = mats.current[k]?.current; if (!m) return
      m.uniforms.uFade.value = clamp(1 - (d - GAP * .2) / (GAP * .45))
      m.uniforms.uReveal.value = THREE.MathUtils.damp(m.uniforms.uReveal.value, d < GAP * 1.2 ? 1 : 0, 3, dt)
      m.uniforms.uBend.value = THREE.MathUtils.damp(m.uniforms.uBend.value, clamp(scroll.velocity * .012, -.7, .7), 6, dt)
      m.uniforms.uShift.value = Math.abs(m.uniforms.uBend.value) * .005
    })
  })
  return (
    <group ref={ref}>
      {PHOTOS.map((ph, k) => <group key={k} ref={el => (items.current[k] = el)}><LifePhoto i={k} photo={ph} mats={mats} /></group>)}
    </group>
  )
}

function Showroom({ m }) {
  const ref = useRef(), turns = useRef([]); const { viewport } = useThree()
  const setGiftIndex = useUI(s => s.setGiftIndex)
  const GAP = 7
  useFrame((st, dt) => {
    const s = scroll.sections.gifts || { vis: 0, p: 0 }, rg = scroll.sections.register || { vis: 0 }
    ref.current.visible = s.vis > .01 && rg.vis < .5; if (!ref.current.visible) return
    const portrait = viewport.aspect < .9, n = GIFTS.length
    const seg = s.p * (n - 1), i = Math.min(Math.floor(seg), n - 2), t = seg - i
    const at = i + smooth(clamp((t - .25) / .5))
    const sc = portrait ? Math.min(.74, viewport.width / 5.2) : .9
    ref.current.scale.setScalar(sc)
    // children sit at k * GAP inside a scaled group, so the slide must be scaled too or the 3D runs ahead of the text
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, -at * GAP * sc + (portrait ? 0 : 2.2), 6, dt)
    ref.current.position.y = portrait ? -.05 : -1.6
    ref.current.rotation.x = .12
    const idx = Math.round(at); if (useUI.getState().giftIndex !== idx) setGiftIndex(idx)
    turns.current.forEach((g, k) => { if (g) g.rotation.y = THREE.MathUtils.damp(g.rotation.y, (k === idx ? .35 : -.25) + Math.sin(st.clock.elapsedTime * .4 + k) * .12 + scroll.pointer.x * .25, 2.5, dt) })
  })
  return (
    <group ref={ref}>
      {GIFTS.map((gift, k) => (
        <group key={gift.id} position={[k * GAP, 0, 0]}>
          <Plinth m={m} />
          <group ref={el => (turns.current[k] = el)}><Product model={gift.model} m={m} /></group>
        </group>
      ))}
      <ContactShadows position={[GAP * (GIFTS.length - 1) / 2, 0.005, 0]} scale={[GAP * (GIFTS.length + 1), 6]} resolution={1024} blur={2.4} opacity={.55} far={4} frames={1} color="#1a0507" />
    </group>
  )
}

function ToneFallback() {
  const { gl } = useThree(); const lowPower = useUI(s => s.lowPower)
  useEffect(() => { gl.toneMapping = lowPower ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping }, [gl, lowPower])
  return null
}
function Rig() {
  const { camera } = useThree()
  useFrame((st, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, scroll.pointer.x * .35, 3, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -scroll.pointer.y * .25, 3, dt)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Scene() {
  const m = useMats()
  const lowPower = useUI(s => s.lowPower), setLowPower = useUI(s => s.setLowPower), setReady = useUI(s => s.setReady)
  return (
    <Canvas dpr={lowPower ? 1 : [1, 2]} camera={{ fov: 35, position: [0, 0, 10] }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
      onCreated={({ gl, scene, camera }) => { gl.compile(scene, camera); requestAnimationFrame(() => setReady(true)) }}>
      <PerformanceMonitor onDecline={() => setLowPower(true)} />
      <Measure />
      <StudioLight />
      <Rig />
      <ToneFallback />
      <RingsGroup m={m} />
      <EntrancePhoto />
      <LifeGallery />
      <Showroom m={m} />
      <EffectComposer multisampling={lowPower ? 0 : 4} enabled={!lowPower}>
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={.35} />
        <Vignette offset={.28} darkness={.42} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  )
}
