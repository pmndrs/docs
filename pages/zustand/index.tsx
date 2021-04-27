// @ts-nocheck

import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import React, { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { Plane, useAspect, useTexture } from '@react-three/drei'
import { EffectComposer, DepthOfField, Vignette } from '@react-three/postprocessing'
import create from 'zustand'
import PrismCode from 'react-prism'
import 'prismjs'
import 'prismjs/components/prism-jsx.min'
import Fireflies from '../../components/Fireflies'
import Link from 'next/link'

const useStore = create<{
  count: number
  inc: () => void
}>((set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))

function Counter() {
  const { count, inc } = useStore()
  return (
    <div
      className="absolute top-[-100px] right-[-40px] text-white z-[2000] p-6 rounded-xl w-[124px] h-[124px] text-xl z-[20000]"
      style={{ background: '#394a52', boxShadow: '0 16px 40px -5px rgba(0, 0, 0, 0.5)' }}
    >
      <span
        className="absolute text-4xl left-[50%] top-[40px] "
        style={{ transform: 'translate3d(-50%, -50%, 0)' }}
      >
        {count}
      </span>
      <button
        className="m-3 p-1 absolute outline-none rounded w-[100px] bottom-0 left-0 border-2 border-color-white"
        onClick={inc}
      >
        one up
      </button>
    </div>
  )
}

function Scene({ dof }) {
  const scaleN = useAspect(1600, 1000, 1)
  const scaleW = useAspect(2200, 1000, 1)
  const textures = useTexture([
    '/zustand-resources/bg.jpg',
    '/zustand-resources/stars.png',
    '/zustand-resources/ground.png',
    '/zustand-resources/bear.png',
    '/zustand-resources/leaves1.png',
    '/zustand-resources/leaves2.png',
  ])
  const subject = useRef()
  const group = useRef()
  const layersRef = useRef([])
  const [movementVector] = useState(() => new THREE.Vector3())
  const [tempVector] = useState(() => new THREE.Vector3())
  const [focusVector] = useState(() => new THREE.Vector3())
  const layers = [
    { texture: textures[0], z: 0, factor: 0.005, scale: scaleW },
    { texture: textures[1], z: 10, factor: 0.005, scale: scaleW },
    { texture: textures[2], z: 20, scale: scaleW },
    { texture: textures[3], z: 30, ref: subject, scaleFactor: 0.83, scale: scaleN },
    { texture: textures[4], factor: 0.03, scaleFactor: 1, z: 40, wiggle: 0.24, scale: scaleW },
    { texture: textures[5], factor: 0.04, scaleFactor: 1.3, z: 49, wiggle: 0.3, scale: scaleW },
  ]

  useFrame((state, delta) => {
    // @ts-ignore
    dof.current.target = focusVector.lerp(subject.current.position, 0.05)
    movementVector.lerp(tempVector.set(state.mouse.x, state.mouse.y * 0.2, 0), 0.2)
    // @ts-ignore
    group.current.position.x = THREE.MathUtils.lerp(
      // @ts-ignore
      group.current.position.x,
      state.mouse.x * 20,
      0.2
    )
    // @ts-ignore
    group.current.rotation.x = THREE.MathUtils.lerp(
      // @ts-ignore
      group.current.rotation.x,
      state.mouse.y / 10,
      0.2
    )
    // @ts-ignore
    group.current.rotation.y = THREE.MathUtils.lerp(
      // @ts-ignore
      group.current.rotation.y,
      -state.mouse.x / 2,
      0.2
    )
    layersRef.current[4].uniforms.time.value = layersRef.current[5].uniforms.time.value += delta
  }, 1)

  return (
    <group ref={group}>
      {/* <Fireflies count={10} radius={80} colors={["orange"]} /> */}
      {layers.map(({ scale, texture, ref, factor = 0, scaleFactor = 1, wiggle = 0, z }, i) => (
        <Plane
          scale={scale}
          args={[1, 1, wiggle ? 10 : 1, wiggle ? 10 : 1]}
          position-z={z}
          key={i}
          ref={ref}
        >
          <layerMaterial
            attach="material"
            movementVector={movementVector}
            textr={texture}
            factor={factor}
            ref={(el) => (layersRef.current[i] = el)}
            wiggle={wiggle}
            scaleFactor={scaleFactor}
          />
        </Plane>
      ))}
    </group>
  )
}

const Effects = React.forwardRef((props, ref) => {
  const {
    viewport: { width, height },
  } = useThree()
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField
        ref={ref}
        bokehScale={4}
        focalLength={0.1}
        width={width / 2}
        height={height / 2}
      />
      <Vignette />
    </EffectComposer>
  )
})

export default function App() {
  const dof = useRef()
  return (
    <div className="overflow-hidden h-screen w-screen">
      <Canvas
        orthographic
        gl={{
          powerPreference: 'high-performance',
          antialias: false,
          stencil: false,
          alpha: false,
          depth: false,
        }}
        camera={{ zoom: 5, position: [0, 0, 200], far: 300, near: 0 }}
      >
        <Suspense fallback={null}>
          <Scene dof={dof} />
        </Suspense>
        <Effects ref={dof} />
      </Canvas>

      <div className="absolute w-full h-full top-0 left-0 text-white zustand-home">
        <div className="absolute width-[50%] h-full flex ml-[50%] left-[25%] justify-center items-center">
          <div className="absolute">
            <PrismCode className="language-jsx !whitespace-pre">{code}</PrismCode>
            <Counter />
          </div>
        </div>

        <a
          href="https://github.com/pmndrs/zustand"
          className=" top-[40px]  right-[40px] absolute"
          children="Github"
        />
        <Link href="/zustand/introduction">
          <a className="bottom-right bottom-[40px]  right-[40px] absolute">Docs</a>
        </Link>
        <a
          href="https://www.instagram.com/tina.henschel/"
          className="bottom-[40px]  left-[40px] absolute"
          children="Illustrations @ Tina Henschel"
        />
        <span className="font-bold absolute uppercase top-[40px] left-[40px] text-5xl inline-block">
          Zustand
        </span>
      </div>
    </div>
  )
}

const code = `import create from 'zustand'

const useStore = create(set => ({
  count: 1,
  inc: () => set(state => ({ count: state.count + 1 })),
}))

function Controls() {
  const inc = useStore(state => state.inc)
  return <button onClick={inc}>one up</button>
}

function Counter() {
  const count = useStore(state => state.count)
  return <h1>{count}</h1>  
}`

const LayerMaterial = shaderMaterial(
  { textr: null, movementVector: [0, 0, 0], scaleFactor: 1, factor: 0, wiggle: 0, time: 0 },
  ` uniform float time;
    uniform vec2 resolution;
    uniform float wiggle;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main()	{
      vUv = uv;
      vec3 transformed = vec3(position);
      if (wiggle > 0.) {
        float theta = sin(time + position.y) / 2.0 * wiggle;
        float c = cos(theta);
        float s = sin(theta);
        mat3 m = mat3(c, 0, s, 0, 1, 0, -s, 0, c);
        transformed = transformed * m;
        vNormal = vNormal * m;
      }      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
    }`,
  ` uniform float time;
    uniform vec2 resolution;
    uniform float factor;
    uniform float scaleFactor;
    uniform vec3 movementVector;
    uniform sampler2D textr;
    varying vec2 vUv;
    void main()	{
      vec2 uv = vUv / scaleFactor + movementVector.xy * factor;
      vec4 color = texture2D(textr, uv);
      if (color.a < 0.1) discard;
      gl_FragColor = vec4(color.rgb, .1);
    }`
)

extend({ LayerMaterial })
