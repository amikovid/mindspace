import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import Star from './Star'

export default function StarField({ learnings, selectedLearning, onStarClick }) {
  const { camera, controls } = useThree()
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const isAnimating = useRef(false)

  // Animate camera to selected star
  useEffect(() => {
    if (selectedLearning) {
      const star = learnings.find(l => l.id === selectedLearning.id)
      if (star) {
        targetPosition.current.set(
          star.position.x,
          star.position.y,
          star.position.z + 8
        )
        targetLookAt.current.set(
          star.position.x,
          star.position.y,
          star.position.z
        )
        isAnimating.current = true
      }
    }
  }, [selectedLearning, learnings])

  // Smooth camera animation that works with OrbitControls
  useFrame(() => {
    if (isAnimating.current && controls) {
      // Animate camera position
      camera.position.lerp(targetPosition.current, 0.05)

      // Animate OrbitControls target
      controls.target.lerp(targetLookAt.current, 0.05)
      controls.update()

      // Stop animating when close enough
      if (camera.position.distanceTo(targetPosition.current) < 0.1) {
        isAnimating.current = false
      }
    }
  })

  return (
    <group>
      {/* Render all stars */}
      {learnings.map((learning) => {
        const isSelected = selectedLearning?.id === learning.id
        const isRelated = selectedLearning?.related.includes(learning.id)

        return (
          <Star
            key={learning.id}
            learning={learning}
            isSelected={isSelected}
            isRelated={isRelated}
            onClick={() => onStarClick(learning)}
          />
        )
      })}

      {/* Draw lines to related stars */}
      {selectedLearning && selectedLearning.related.map((relatedId) => {
        const selectedStar = learnings.find(l => l.id === selectedLearning.id)
        const relatedStar = learnings.find(l => l.id === relatedId)

        if (selectedStar && relatedStar) {
          return (
            <Line
              key={`line-${selectedLearning.id}-${relatedId}`}
              points={[
                [selectedStar.position.x, selectedStar.position.y, selectedStar.position.z],
                [relatedStar.position.x, relatedStar.position.y, relatedStar.position.z]
              ]}
              color="#ffffff"
              lineWidth={1}
              opacity={0.3}
              transparent
            />
          )
        }
        return null
      })}
    </group>
  )
}
