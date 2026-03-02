import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { TrackballControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import StarField from './StarField'

// Inner component — runs inside Canvas so it can use useFrame
function ConstellationGroup({ learnings, selectedLearning, onStarClick, isEntering, searchQuery, showAge }) {
  const groupRef = useRef()
  const spinStart = useRef(null)
  const { camera } = useThree()

  const SPIN_DURATION = 1.4   // seconds — long enough to still be moving as glass clears
  const SPIN_X = 0.52         // obvious tilt, ~30° arc
  const CAM_START_Z = 30      // natural starting position — no jump
  const CAM_END_Z = 22        // pull viewer in close

  useFrame((state) => {
    if (!groupRef.current) return

    if (isEntering) {
      if (spinStart.current === null) {
        spinStart.current = state.clock.elapsedTime
      }
      const elapsed = state.clock.elapsedTime - spinStart.current
      const t = Math.min(elapsed / SPIN_DURATION, 1)

      // Ease out cubic — confident snap, soft landing
      const eased = 1 - Math.pow(1 - t, 3)

      // X tilt only — eases to final position and stays
      groupRef.current.rotation.x = eased * SPIN_X
      groupRef.current.rotation.y = 0

      // Zoom in — linear so it's still visibly moving when glass clears
      camera.position.z = CAM_START_Z + (CAM_END_Z - CAM_START_Z) * t
    } else {
      spinStart.current = null
    }
  })

  return (
    <group ref={groupRef}>
      <StarField
        learnings={learnings}
        selectedLearning={selectedLearning}
        onStarClick={onStarClick}
        searchQuery={searchQuery}
        showAge={showAge}
      />
    </group>
  )
}

export default function Scene({ learnings, selectedLearning, onStarClick, isEntering, searchQuery, showAge }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 60 }}
      style={{ background: '#000000' }}
    >
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <ConstellationGroup
        learnings={learnings}
        selectedLearning={selectedLearning}
        onStarClick={onStarClick}
        isEntering={isEntering}
        searchQuery={searchQuery}
        showAge={showAge}
      />

      <TrackballControls
        noPan={true}
        noZoom={false}
        noRotate={false}
        dynamicDampingFactor={0.1}
        minDistance={5}
        maxDistance={50}
        rotateSpeed={1.5}
        zoomSpeed={1.2}
        enableKeys={false}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
      />

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
