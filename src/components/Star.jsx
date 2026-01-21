import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Star({ learning, isSelected, isRelated, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Animation for hover, selection, and related states
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.3 : isSelected ? 1.5 : isRelated ? 1.2 : 1
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )

      // Pulse effect for related stars
      if (isRelated) {
        const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 1
        meshRef.current.material.emissiveIntensity = pulse
      } else if (isSelected) {
        meshRef.current.material.emissiveIntensity = 1.5
      } else {
        meshRef.current.material.emissiveIntensity = 0.8
      }
    }
  })

  const color = isSelected ? '#88ccff' : isRelated ? '#ffaa88' : '#ffffff'

  return (
    <mesh
      ref={meshRef}
      position={[learning.position.x, learning.position.y, learning.position.z]}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  )
}
