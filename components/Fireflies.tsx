import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import * as meshline from 'threejs-meshline'

extend(meshline)

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLine: any
      meshLineMaterial: any
      layerMaterial: any
    }
  }
}
const r = () => Math.max(0.2, Math.random())

function Fatline({ curve, width, color }) {
  const material = useRef()
  useFrame((_, delta) => {
    // @ts-ignore
    material.current.uniforms.dashOffset.value -= delta / 100
  })
  return (
    <mesh>
      <meshLine attach="geometry" vertices={curve} />
      <meshLineMaterial
        attach="material"
        ref={material}
        transparent
        lineWidth={width}
        color={color}
        dashArray={0.1}
        dashRatio={0.99}
      />
    </mesh>
  )
}

export default function Fireflies({ count, radius = 10 }) {
  const lines = useMemo(
    () =>
      new Array(count).fill(undefined).map((_, index) => {
        const pos = new THREE.Vector3(Math.sin(0) * radius * r(), Math.cos(0) * radius * r(), 0)
        const points = new Array(30).fill(undefined).map((_, index) => {
          const angle = (index / 20) * Math.PI * 2
          return pos
            .add(
              new THREE.Vector3(Math.sin(angle) * radius * r(), Math.cos(angle) * radius * r(), 0)
            )
            .clone()
        })
        const curve = new THREE.CatmullRomCurve3(points).getPoints(100)
        return {
          color: 'orange',
          width: Math.max(1.6, (2 * index) / 10),
          curve,
        }
      }),
    [count, radius]
  )
  return (
    <group position={[-radius * 2, -radius, 0]}>
      {lines.map((props, index) => (
        <Fatline key={index} {...props} />
      ))}
    </group>
  )
}
