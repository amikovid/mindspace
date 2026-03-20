import { useRef, useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import Star from './Star'

// Compute 3D positions sorted by age: Y axis = age (young at bottom, old at top)
// Same-age stars spread along X; slight Z variation for depth
function computeAgePositions(learnings) {
  const withAges = learnings.map(l => {
    const match = l.context.match(/^(\d+)/)
    return { id: l.id, age: match ? parseInt(match[1]) : 30 }
  })

  const ages = withAges.map(w => w.age)
  const minAge = Math.min(...ages)
  const maxAge = Math.max(...ages)

  const byAge = {}
  withAges.forEach(({ id, age }) => {
    if (!byAge[age]) byAge[age] = []
    byAge[age].push(id)
  })

  const positions = {}
  withAges.forEach(({ id, age }) => {
    const t = (age - minAge) / (maxAge - minAge)
    const y = (t - 0.5) * 18

    const group = byAge[age]
    const idx = group.indexOf(id)
    const count = group.length
    const xSpread = Math.min(count * 2.5, 16)
    const x = count > 1 ? ((idx / (count - 1)) - 0.5) * xSpread : 0

    // Deterministic Z depth using id as seed
    const z = ((id * 7) % 10 - 5) * 0.4

    positions[id] = { x, y, z }
  })

  return positions
}

// Compute 3D positions split by gender: M → right hemisphere, F → left hemisphere
// Stars distributed using golden angle for even spread on each half-sphere
function computeGenderPositions(learnings) {
  const mIds = [], fIds = []
  learnings.forEach(l => {
    const gender = l.context.match(/^\d+([MF])/)?.[1]
    if (gender === 'F') fIds.push(l.id)
    else mIds.push(l.id)
  })

  const positions = {}
  const R = 8
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  const placeHemisphere = (ids, xSign) => {
    const n = ids.length
    ids.forEach((id, i) => {
      // θ: polar angle from X axis, 10° → 75° so no star sits at exact tip or equator
      const theta = (Math.PI / 18) + (i / Math.max(n - 1, 1)) * (Math.PI * 65 / 180)
      const phi = goldenAngle * i
      positions[id] = {
        x: xSign * R * Math.cos(theta),
        y: R * Math.sin(theta) * Math.cos(phi),
        z: R * Math.sin(theta) * Math.sin(phi),
      }
    })
  }

  placeHemisphere(mIds, 1)   // M → right
  placeHemisphere(fIds, -1)  // F → left
  return positions
}

export default function StarField({ learnings, selectedLearning, onStarClick, searchQuery, showAge, showGender }) {
  const { camera, controls } = useThree()
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const isAnimating = useRef(false)

  const agePositions = useMemo(() => computeAgePositions(learnings), [learnings])
  const genderPositions = useMemo(() => computeGenderPositions(learnings), [learnings])

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
        const starTargetPos = showGender
          ? genderPositions[learning.id]
          : showAge
            ? agePositions[learning.id]
            : learning.position

        return (
          <Star
            key={learning.id}
            learning={learning}
            isSelected={isSelected}
            isRelated={isRelated}
            isDimmed={isDimmed}
            targetPosition={starTargetPos}
            onClick={() => onStarClick(learning)}
          />
        )
      })}

      {/* Draw lines to related stars — hidden during rearrangement modes */}
      {selectedLearning && !showAge && !showGender && selectedLearning.related.map((relatedId) => {
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
