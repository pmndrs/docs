import * as React from 'react'
import { Canvas } from 'react-three-fiber'

function Scene() {

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [5, 5, 5]}}>
        <mesh>
        <boxBufferGeometry />
          <meshNormalMaterial />
        </mesh>
      </Canvas>
    </div>
  )
  
}

export default Scene
