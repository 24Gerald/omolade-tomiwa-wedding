import * as THREE from 'three'
import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'

// Shared PBR materials. Matte where it should be, polished where it matters. Nothing emits light.
export function useMats() {
  return useMemo(() => ({
    gold: new THREE.MeshPhysicalMaterial({ color: '#e2bf7e', metalness: 1, roughness: .16, clearcoat: .5, clearcoatRoughness: .1, envMapIntensity: 1.25 }),
    rose: new THREE.MeshPhysicalMaterial({ color: '#e7b49a', metalness: 1, roughness: .2, clearcoat: .4, envMapIntensity: 1.2 }),
    stone: new THREE.MeshPhysicalMaterial({ color: '#fffdf8', metalness: 0, roughness: 0, ior: 2.4, clearcoat: 1, envMapIntensity: 3.2, specularIntensity: 1 }),
    steel: new THREE.MeshPhysicalMaterial({ color: '#c3c5c7', metalness: 1, roughness: .3, anisotropy: .6, envMapIntensity: 1.1 }),
    darkSteel: new THREE.MeshPhysicalMaterial({ color: '#3a3c40', metalness: .9, roughness: .35, envMapIntensity: 1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#0b0c0e', metalness: .1, roughness: .05, clearcoat: 1, clearcoatRoughness: .03, envMapIntensity: 1.6 }),
    black: new THREE.MeshPhysicalMaterial({ color: '#1c1c1f', metalness: .5, roughness: .32, clearcoat: .6, envMapIntensity: 1.5 }),
    satin: new THREE.MeshPhysicalMaterial({ color: '#f7f4ee', metalness: 0, roughness: .38, clearcoat: .4, envMapIntensity: 1.6 }),
    champagne: new THREE.MeshPhysicalMaterial({ color: '#c9a46a', metalness: .85, roughness: .32, envMapIntensity: 1.1 }),
    enamel: new THREE.MeshPhysicalMaterial({ color: '#6b1e28', metalness: 0, roughness: .22, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.2 }),
    plinth: new THREE.MeshPhysicalMaterial({ color: '#e9dfcf', metalness: 0, roughness: .62, envMapIntensity: .8 }),
    led: new THREE.MeshBasicMaterial({ color: '#7fb98e' })
  }), [])
}

export function Rings({ m }) {
  const g = useMemo(() => new THREE.TorusGeometry(1, .11, 64, 220), [])
  return (
    <group>
      <mesh geometry={g} material={m.gold} rotation={[0.25, 0.5, 0]} position={[-.45, 0, 0]} />
      <group rotation={[-0.2, -0.65, 0.35]} position={[.5, -.05, -.1]} scale={.92}>
        <mesh geometry={g} material={m.rose} />
        <mesh material={m.gold} position={[0, 1.07, 0]}><cylinderGeometry args={[.13, .09, .12, 24]} /></mesh>
        <mesh material={m.stone} position={[0, 1.2, 0]} scale={[1, .78, 1]}><octahedronGeometry args={[.17, 0]} /></mesh>
      </group>
    </group>
  )
}

function Fridge({ m }) {
  return (
    <group position={[0, 1.4, 0]}>
      <RoundedBox args={[1.6, 2.8, 1.1]} radius={.05} smoothness={3} material={m.darkSteel} />
      <RoundedBox args={[.78, 2.72, .06]} radius={.02} position={[-.4, 0, .56]} material={m.steel} />
      <RoundedBox args={[.78, 2.72, .06]} radius={.02} position={[.4, 0, .56]} material={m.steel} />
      <mesh material={m.champagne} position={[-.07, .1, .64]}><cylinderGeometry args={[.025, .025, 1.3, 16]} /></mesh>
      <mesh material={m.champagne} position={[.07, .1, .64]}><cylinderGeometry args={[.025, .025, 1.3, 16]} /></mesh>
      <mesh material={m.glass} position={[-.4, .55, .595]}><boxGeometry args={[.34, .2, .01]} /></mesh>
    </group>
  )
}
function Tv({ m }) {
  const screen = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 288; const x = c.getContext('2d')
    const g = x.createLinearGradient(0, 0, 512, 288); g.addColorStop(0, '#20140f'); g.addColorStop(.6, '#5a2a1e'); g.addColorStop(1, '#c9895a'); x.fillStyle = g; x.fillRect(0, 0, 512, 288)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  }, [])
  return (
    <group position={[0, 1.55, 0]}>
      <RoundedBox args={[3.4, 1.98, .07]} radius={.02} material={m.black} />
      <mesh position={[0, 0, .037]}><planeGeometry args={[3.3, 1.88]} /><meshPhysicalMaterial map={screen} roughness={.08} clearcoat={1} metalness={0} emissive="#ffffff" emissiveMap={screen} emissiveIntensity={.35} /></mesh>
      <mesh material={m.darkSteel} position={[-1.2, -1.2, 0]} rotation={[0, 0, .25]}><boxGeometry args={[.05, .5, .3]} /></mesh>
      <mesh material={m.darkSteel} position={[1.2, -1.2, 0]} rotation={[0, 0, -.25]}><boxGeometry args={[.05, .5, .3]} /></mesh>
    </group>
  )
}
function Oven({ m }) {
  return (
    <group position={[0, .8, 0]}>
      <RoundedBox args={[1.7, 1.6, 1.1]} radius={.04} material={m.steel} />
      <mesh material={m.glass} position={[0, -.12, .555]}><boxGeometry args={[1.3, .8, .02]} /></mesh>
      <mesh material={m.champagne} position={[0, .4, .62]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.03, .03, 1.2, 16]} /></mesh>
      {[-.6, -.3, 0, .3, .6].map(x => <mesh key={x} material={m.black} position={[x, .66, .57]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.06, .06, .07, 24]} /></mesh>)}
      <mesh material={m.glass} position={[0, .805, 0]}><boxGeometry args={[1.66, .01, 1.06]} /></mesh>
      {[[-.4, -.25], [.4, -.25], [-.4, .25], [.4, .25]].map(([x, z]) => <mesh key={x + ',' + z} material={m.darkSteel} position={[x, .815, z]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.16, .015, 8, 40]} /></mesh>)}
    </group>
  )
}
function Microwave({ m }) {
  return (
    <group position={[0, .5, 0]}>
      <RoundedBox args={[1.8, 1.0, 1.1]} radius={.05} material={m.black} />
      <mesh material={m.glass} position={[-.25, 0, .556]}><boxGeometry args={[1.15, .78, .01]} /></mesh>
      <mesh material={m.steel} position={[.62, 0, .556]}><boxGeometry args={[.42, .86, .012]} /></mesh>
      {[0, 1, 2, 3].map(i => <mesh key={i} material={m.darkSteel} position={[.62, .25 - i * .14, .566]}><boxGeometry args={[.28, .07, .01]} /></mesh>)}
      <mesh material={m.champagne} position={[.36, 0, .6]}><boxGeometry args={[.04, .7, .05]} /></mesh>
    </group>
  )
}
function Pot({ m, r, h, x, z, lid = true }) {
  return (
    <group position={[x, h / 2, z]}>
      <mesh material={m.enamel}><cylinderGeometry args={[r, r * .94, h, 48, 1, false]} /></mesh>
      {lid && <mesh material={m.enamel} position={[0, h / 2, 0]} scale={[1, .28, 1]}><sphereGeometry args={[r * 1.02, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>}
      {lid && <mesh material={m.champagne} position={[0, h / 2 + r * .32, 0]}><sphereGeometry args={[r * .14, 24, 12]} /></mesh>}
      {[-1, 1].map(s => <mesh key={s} material={m.champagne} position={[s * (r + .06), h * .25, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[.08, .022, 10, 24, Math.PI]} /></mesh>)}
    </group>
  )
}
function Cookware({ m }) {
  return (
    <group>
      <Pot m={m} r={.62} h={.7} x={-.55} z={-.2} />
      <Pot m={m} r={.46} h={.5} x={.75} z={-.05} />
      <Pot m={m} r={.36} h={.32} x={.05} z={.6} />
    </group>
  )
}
function Inverter({ m }) {
  return (
    <group position={[0, 1.2, 0]}>
      <RoundedBox args={[1.3, 2.4, .55]} radius={.08} smoothness={4} material={m.satin} />
      <mesh material={m.champagne} position={[0, .7, .28]}><boxGeometry args={[1.3, .05, .01]} /></mesh>
      <mesh material={m.glass} position={[0, .95, .28]}><boxGeometry args={[.5, .22, .01]} /></mesh>
      {[0, 1, 2, 3].map(i => <mesh key={i} material={m.led} position={[-.18 + i * .12, .55, .281]}><circleGeometry args={[.018, 16]} /></mesh>)}
      {[...Array(7)].map((_, i) => <mesh key={i} material={m.darkSteel} position={[0, -.3 - i * .1, .281]}><boxGeometry args={[.8, .018, .005]} /></mesh>)}
    </group>
  )
}
function Case({ m, w, h, d, x, z, ry = 0, mat, handle = true }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <group position={[0, h / 2 + .09, 0]}>
        <RoundedBox args={[w, h, d]} radius={.09} smoothness={4} material={mat} />
        {[-.3, 0, .3].map(k => <RoundedBox key={k} args={[w * .08, h * .92, .03]} radius={.012} position={[k * w, 0, d / 2]} material={mat} />)}
        <mesh material={m.champagne} position={[0, 0, 0]}><boxGeometry args={[w + .012, h * .96, .03]} /></mesh>
        <mesh material={m.champagne} position={[0, h / 2 - .14, d / 2 + .02]}><boxGeometry args={[.22, .1, .04]} /></mesh>
        {handle && <group position={[0, h / 2, -d * .25]}>
          {[-.18, .18].map(k => <mesh key={k} material={m.steel} position={[k * w * 1.4, .32, 0]}><cylinderGeometry args={[.025, .025, .64, 16]} /></mesh>)}
          <RoundedBox args={[w * .58, .07, .09]} radius={.03} position={[0, .66, 0]} material={m.black} />
        </group>}
      </group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => <mesh key={i} material={m.black} position={[a * (w / 2 - .1), .05, b * (d / 2 - .1)]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.05, .05, .05, 20]} /></mesh>)}
    </group>
  )
}
function Honeymoon({ m }) {
  return (
    <group>
      <Case m={m} w={1.25} h={1.9} d={.62} x={-.35} z={0} ry={.12} mat={m.enamel} />
      <Case m={m} w={.95} h={1.3} d={.5} x={.85} z={.35} ry={-.35} mat={m.satin} handle={false} />
      <group position={[.62, .12, 1.05]} rotation={[-Math.PI / 2 + .18, 0, .5]}>
        <RoundedBox args={[.5, .7, .04]} radius={.015} material={m.enamel} />
        <mesh material={m.champagne} position={[0, .05, .025]}><circleGeometry args={[.1, 32]} /></mesh>
      </group>
    </group>
  )
}
const BY_MODEL = { honeymoon: Honeymoon, fridge: Fridge, tv: Tv, oven: Oven, microwave: Microwave, cookware: Cookware, inverter: Inverter }
export function Product({ model, m }) { const C = BY_MODEL[model]; return C ? <C m={m} /> : null }
export function Plinth({ m }) {
  return <mesh material={m.plinth} position={[0, -.15, 0]} receiveShadow><cylinderGeometry args={[1.9, 1.95, .3, 96]} /></mesh>
}
