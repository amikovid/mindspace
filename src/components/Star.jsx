import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Star({ learning, isSelected, isRelated, isDimmed, ageColor, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const opacityRef = useRef(1)

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.3 : isSelected ? 1.5 : isRelated ? 1.2 : 1
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )

      // Smooth opacity lerp for search dimming
      const targetOpacity = isDimmed ? 0.08 : 1
      opacityRef.current += (targetOpacity - opacityRef.current) * 0.08
      meshRef.current.material.opacity = opacityRef.current

      if (isRelated) {
        const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 1
        meshRef.current.material.emissiveIntensity = pulse
      } else if (isSelected) {
        meshRef.current.material.emissiveIntensity = 1.5
      } else {
        meshRef.current.material.emissiveIntensity = isDimmed ? 0.1 : 0.8
      }
    }
  })

  // Selection states always win; age color only shows on neutral stars
  const color = isSelected ? '#88ccff' : isRelated ? '#ffaa88' : (ageColor || '#ffffff')

  return (
    <mesh
      ref={meshRef}
      position={[learning.position.x, learning.position.y, learning.position.z]}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => { e.stopPropagation(); onClick() }}
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
        transparent
        opacity={1}
      />
    </mesh>
  )
}
