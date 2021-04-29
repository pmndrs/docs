import * as THREE from 'three'
import React, { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Plane, useAspect, useTexture } from '@react-three/drei'
import { EffectComposer, DepthOfField, Vignette } from '@react-three/postprocessing'
import create from 'zustand'
import PrismCode from 'react-prism'
import 'prismjs'
import 'prismjs/components/prism-jsx.min'
import Fireflies from '../../components/Fireflies'
import Link from 'next/link'
import SEO from 'components/Seo'
import 'components/LayerMaterial'

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
      className="absolute md:top-[-100px] md:right-[-40px] text-white z-[2000] p-6 rounded-xl md:w-[124px] md:h-[124px] md:text-xl text-base z-[20000]  w-[80px] h-[80px] top-[-80px] right-[-20px]"
      style={{ background: '#394a52', boxShadow: '0 16px 40px -5px rgba(0, 0, 0, 0.5)' }}
    >
      <span
        className="absolute text-base md:text-4xl left-[50%] md:top-[40px] top-5 "
        style={{ transform: 'translate3d(-50%, -50%, 0)' }}
      >
        {count}
      </span>
      <button
        className="m-3 p-1 absolute outline-none rounded md:w-[100px] bottom-0 left-0 border-2 border-color-white"
        onClick={inc}
      >
        one up
      </button>
    </div>
  )
}

function Scene({ dof }) {
  const scaleN = useAspect(1600, 1000, 1.05)
  const scaleW = useAspect(2200, 1000, 1.05)
  const textures = useTexture([
    '/zustand-resources/bg.jpg',
    '/zustand-resources/stars.png',
    '/zustand-resources/ground.png',
    '/zustand-resources/bear.png',
    '/zustand-resources/leaves1.png',
    '/zustand-resources/leaves2.png',
  ])
  const subject = useRef<any>()
  const group = useRef<any>()
  const layersRef = useRef([])
  const [movement] = useState(() => new THREE.Vector3())
  const [temp] = useState(() => new THREE.Vector3())
  const [focus] = useState(() => new THREE.Vector3())
  const layers = [
    { texture: textures[0], z: 0, factor: 0.005, scale: scaleW },
    { texture: textures[1], z: 10, factor: 0.005, scale: scaleW },
    { texture: textures[2], z: 20, scale: scaleW },
    { texture: textures[3], z: 30, ref: subject, scaleFactor: 0.83, scale: scaleN },
    { texture: textures[4], factor: 0.03, scaleFactor: 1, z: 40, wiggle: 0.6, scale: scaleW },
    { texture: textures[5], factor: 0.04, scaleFactor: 1.3, z: 49, wiggle: 1, scale: scaleW },
  ]

  useFrame((state, delta) => {
    dof.current.target = focus.lerp(subject.current.position, 0.05)
    movement.lerp(temp.set(state.mouse.x, state.mouse.y * 0.2, 0), 0.2)
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      state.mouse.x * 20,
      0.2
    )
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.mouse.y / 10,
      0.2
    )
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      -state.mouse.x / 2,
      0.2
    )
    layersRef.current[4].uniforms.time.value = layersRef.current[5].uniforms.time.value += delta
  }, 1)

  return (
    <group ref={group}>
      <Fireflies count={20} radius={80} />
      {layers.map(({ scale, texture, ref, factor = 0, scaleFactor = 1, wiggle = 0, z }, i) => (
        // @ts-ignore
        <Plane
          scale={scale}
          args={[1, 1, wiggle ? 10 : 1, wiggle ? 10 : 1]}
          position-z={z}
          key={i}
          ref={ref}
        >
          <layerMaterial
            movement={movement}
            textr={texture}
            factor={factor}
            ref={(el) => (layersRef.current[i] = el)}
            wiggle={wiggle}
            scale={scaleFactor}
          />
        </Plane>
      ))}
    </group>
  )
}

const Effects = React.forwardRef((props, ref) => {
  const { viewport: { width, height } } = useThree() // prettier-ignore
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField
        ref={ref}
        bokehScale={4}
        focalLength={0.1}
        width={(width * 5) / 2}
        height={(height * 5) / 2}
      />
      <Vignette />
    </EffectComposer>
  )
})

export default function App() {
  const dof = useRef()
  return (
    <div className="overflow-hidden h-screen w-screen zustand-home">
      <SEO name="zustand" />
      <Canvas
        linear
        orthographic
        gl={{ antialias: false, stencil: false, alpha: false, depth: false }}
        camera={{ zoom: 5, position: [0, 0, 200], far: 300, near: 0 }}
      >
        <Suspense fallback={null}>
          <Scene dof={dof} />
        </Suspense>
        <Effects ref={dof} />
      </Canvas>

      <div className="absolute w-full h-full top-0 left-0 text-white overflow-hidden md:overflow-auto pointer-events-none">
        <div className="absolute md:width-[50%] h-full flex md:ml-[50%] md:left-[25%] md:mt-0 justify-center items-center code ml-[50%] mt-40 max-h-screen">
          <div className="absolute">
            <PrismCode className="language-jsx !whitespace-pre">{code}</PrismCode>
            <Counter />
          </div>
        </div>

        <a
          href="https://github.com/pmndrs/zustand"
          className="md:top-10 md:right-10 top-7 right-5  absolute"
          target="_blank"
          rel="noreferer"
          children="Github"
        />
        <Link href="/zustand/introduction">
          <a className="md:bottom-10 md:right-10 bottom-5 right-5 absolute">Docs</a>
        </Link>
        <a
          href="https://www.instagram.com/tina.henschel/"
          className="md:bottom-10 md:left-10 bottom-5 left-5 absolute"
          target="_blank"
          rel="noreferer"
          children="Illustrations @ Tina Henschel"
        />
        <span className="font-bold absolute uppercase md:top-10 md:left-10 top-5 left-5 text-5xl inline-block">
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
