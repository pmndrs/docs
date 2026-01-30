import { CameraControls, Cloud } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

export default function App() {
  return (
    <Canvas camera={{ position: [0, -13, 0] }}>
      <Cloud speed={0.4} growth={6} />
      <ambientLight intensity={Math.PI} />
      <CameraControls />
    </Canvas>
  )
}
