"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function AntigravityField() {
  const count = 1500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5; // z
    }
    return pos;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        // Antigravity drift upwards
        pos[i * 3 + 1] += 0.015 + (Math.sin(i) * 0.005); 
        
        // Gentle sway
        pos[i * 3] += Math.sin(time * 0.5 + i) * 0.005;
        
        // Wrap around when floating too high
        if (pos[i * 3 + 1] > 20) {
          pos[i * 3 + 1] = -20;
          pos[i * 3] = (Math.random() - 0.5) * 40;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Extremely slow rotation of the entire field for depth
      pointsRef.current.rotation.y = time * 0.02;
      pointsRef.current.rotation.z = Math.sin(time * 0.05) * 0.05;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#CCD67F"
          transparent
          opacity={0.5}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function HeroNodeGraph() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 10, 35]} />
        <AntigravityField />
      </Canvas>
    </div>
  );
}
