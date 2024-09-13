"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

// Define the type of ref for the mesh
const Cyl: React.FC = () => {
  const tex = useTexture('/images/edited.png') as THREE.Texture;
  const cyl = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    const speedFactor = 0.5; // Adjust to control rotation speed
    if (cyl.current) {
      cyl.current.rotation.y += delta * speedFactor;
    }
  });

  // Configure texture wrapping
  tex.wrapS = THREE.RepeatWrapping; // Repeat the texture horizontally
  tex.wrapT = THREE.ClampToEdgeWrapping; // Clamp the texture vertically
  tex.repeat.set(1, 1); // No repeat to match a single side

  return (
    <group rotation={[0, 1.5, 0.3]}>
      <mesh ref={cyl}>
        <cylinderGeometry args={[5, 5, 15, 36, 1, true]} />  {/* Adjusted size */}
        <meshStandardMaterial
          map={tex}
          side={THREE.DoubleSide}
          transparent={true}
          alphaTest={0.5}
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
};

const Cylinder_shape: React.FC = () => {
  return (
    <Canvas 
      dpr={[1, 2]} 
      gl={{ antialias: true }} 
      camera={{ position: [0, 0, 10], near: 0.1, far: 100 }} // Adjust camera settings
    >
      <OrbitControls />
      <ambientLight intensity={4} />
      <Cyl />
    </Canvas>
  );
};

export default Cylinder_shape;

