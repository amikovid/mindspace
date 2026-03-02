import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import Star from './Star'

// Indigo #818cf8 (young, ≤18) → Amber #fbbf24 (old, ≥72)
function getAgeColor(context) {
  const match = context.match(/^(\d+)/)
  if (!match) return null
  const age = parseInt(match[1])
  const t = Math.min(Math.max((age - 18) / 54, 0), 1) // 0 at 18, 1 at 72
  const r = Math.round(129 + (251 - 129) * t)  // 129 → 251
  const g = Math.round(140 + (191 - 140) * t)  // 140 → 191
  const b = Math.round(248 + (36  - 248) * t)  // 248 → 36
  return `rgb(${r},${g},${b})`
}

export default function StarField({ learnings, selectedLearning, onStarClick, searchQuery, showAge }) {
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
        const isDimmed = searchQuery
          ? !learning.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !learning.context.toLowerCase().includes(searchQuery.toLowerCase())
          : false
        const ageColor = showAge ? getAgeColor(learning.context) : null

        return (
          <Star
            key={learning.id}
            learning={learning}
            isSelected={isSelected}
            isRelated={isRelated}
            isDimmed={isDimmed}
            ageColor={ageColor}
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
