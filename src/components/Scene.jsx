import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import StarField from './StarField'

export default function Scene({ learnings, selectedLearning, onStarClick }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 60 }}
      style={{ background: '#000000' }}
    >
      {/* Background stars for atmosphere */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Star field of learnings */}
      <StarField
        learnings={learnings}
        selectedLearning={selectedLearning}
        onStarClick={onStarClick}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={15}
        maxDistance={50}
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />

      {/* Post-processing for glow effect */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          intensity={1.5}
        />
      </EffectComposer>
    </Canvas>
  )
}
