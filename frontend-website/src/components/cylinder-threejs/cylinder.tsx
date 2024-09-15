"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { motion } from "framer-motion-3d"; // Correct import for 3D elements
import * as THREE from "three";
import { container } from "../../../public/motion"; // Ensure you update this path

const Cyl: React.FC = () => {
  const tex = useTexture('/images/edited.png') as THREE.Texture;
  const cylRef = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    const speedFactor = 0.3; // Adjust to control rotation speed
    if (cylRef.current) {
      cylRef.current.rotation.y += delta * speedFactor;
    }
  });

  // Configure texture wrapping
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1, 1);

  return (
    <motion.group
      rotation={[0, 0, 0]}
      position={[0, 0, 0]}
      variants={container(0.5)} // Apply motion.js animation to the cylinder
      initial="hidden"
      animate="visible"
    >
      <mesh ref={cylRef}>
        <cylinderGeometry args={[10, 10, 20, 35, 1, true]} />
        <meshStandardMaterial
          map={tex}
          side={THREE.DoubleSide}
          transparent={true}
          alphaTest={0.5}
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>
    </motion.group>
  );
};

const Cylinder_shape: React.FC = () => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 15], near: 0.1, far: 100 }}
      style={{ width: '100%', height: '100%', margin: '0', padding: '0' }}
    >
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        enableRotate={false}
      />
      
      <ambientLight intensity={4} />
      
      <Cyl />
    
    </Canvas>
  );
};

export default Cylinder_shape;
