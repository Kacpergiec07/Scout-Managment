"use client";

import React, { useRef, Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Float, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface FootballGlobeConfig {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  zoomSpeed?: number;
}

interface FootballGlobeProps {
  config?: FootballGlobeConfig;
  className?: string;
}

const DEFAULT_CONFIG: FootballGlobeConfig = {
  autoRotate: true,
  autoRotateSpeed: 4,
  enableZoom: false,
  zoomSpeed: 1,
};

function ClassicBall() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        colorWhite: { value: new THREE.Color("#ffffff") },
        colorBlack: { value: new THREE.Color("#050505") },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform vec3 colorWhite;
        uniform vec3 colorBlack;

        void main() {
          vec3 p = normalize(vPosition);
          float phi = (1.0 + sqrt(5.0)) / 2.0;

          // 12 Pentagon Centers (Icosahedron Vertices)
          vec3 centers[32];
          centers[0] = normalize(vec3(-1,  phi,  0)); centers[1] = normalize(vec3( 1,  phi,  0));
          centers[2] = normalize(vec3(-1, -phi,  0)); centers[3] = normalize(vec3( 1, -phi,  0));
          centers[4] = normalize(vec3( 0, -1,  phi)); centers[5] = normalize(vec3( 0,  1,  phi));
          centers[6] = normalize(vec3( 0, -1, -phi)); centers[7] = normalize(vec3( 0,  1, -phi));
          centers[8] = normalize(vec3( phi,  0, -1)); centers[9] = normalize(vec3( phi,  0,  1));
          centers[10] = normalize(vec3(-phi,  0, -1)); centers[11] = normalize(vec3(-phi,  0,  1));

          // 20 Hexagon Centers (Icosahedron Face Centers)
          // Face centers are just the average of 3 vertices of each ico face
          int faces[60];
          int f[60] = int[](
            0,11,5, 0,5,1, 0,1,7, 0,7,10, 0,10,11,
            1,5,9, 5,11,4, 11,10,2, 10,7,6, 7,1,8,
            3,9,4, 3,4,2, 3,2,6, 3,6,8, 3,8,9,
            4,9,5, 2,4,11, 6,2,10, 8,6,7, 9,8,1
          );

          for(int i=0; i<20; i++) {
            centers[12+i] = normalize(centers[f[i*3]] + centers[f[i*3+1]] + centers[f[i*3+2]]);
          }

          // Voronoi: Find the closest center
          int closestIdx = 0;
          float maxDot = -1.0;
          float secondMaxDot = -1.0;

          for(int i=0; i<32; i++) {
            float d = dot(p, centers[i]);
            if(d > maxDot) {
              secondMaxDot = maxDot;
              maxDot = d;
              closestIdx = i;
            } else if(d > secondMaxDot) {
              secondMaxDot = d;
            }
          }

          // Surface logic
          bool isPentagon = (closestIdx < 12);
          vec3 surfaceColor = isPentagon ? colorBlack : colorWhite;
          
          // Seams: Black lines at the Voronoi boundaries
          float seamDetail = smoothstep(0.0, 0.005, maxDot - secondMaxDot);
          vec3 finalColor = mix(vec3(0.0), surfaceColor, seamDetail);

          // Lighting
          float light = max(0.2, dot(vNormal, normalize(vec3(1, 1, 1))));
          gl_FragColor = vec4(finalColor * light, 1.0);
        }
      `
    });
  }, []);

  return (
    <group>
      <Sphere args={[100, 128, 128]} ref={meshRef}>
        <primitive object={shaderMaterial} attach="material" />
      </Sphere>
      <pointLight intensity={15} color="white" />
    </group>
  );
}

function BallPlaceholder() {
  return (
    <Sphere args={[100, 32, 32]}>
      <meshBasicMaterial color="#1e3a8a" wireframe transparent opacity={0.3} />
    </Sphere>
  );
}

export function FootballGlobe({ config, className }: FootballGlobeProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  return (
    <div className={cn("relative w-full h-full p-0 m-0 overflow-hidden flex items-center justify-center", className)}>
      <Canvas 
        camera={{ position: [0, 0, 280], fov: 45 }}
        gl={{ 
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 2.0
        }}
        className="absolute inset-0 pointer-events-auto"
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1.5} />
        <spotLight position={[300, 300, 300]} angle={0.3} penumbra={1} intensity={25} color="white" />
        <pointLight position={[-300, -300, -300]} color="#ffffff" intensity={20} />
        
        <Suspense fallback={<BallPlaceholder />}>
          <Float speed={4} rotationIntensity={0.6} floatIntensity={0.6}>
            <ClassicBall />
          </Float>
        </Suspense>
        
        <OrbitControls
          enablePan={false}
          enableZoom={mergedConfig.enableZoom}
          autoRotate={mergedConfig.autoRotate}
          autoRotateSpeed={mergedConfig.autoRotateSpeed}
          minDistance={150}
          maxDistance={400}
        />
      </Canvas>
      
      {/* Background radial glow - ensure this is perfectly centered too */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
      </div>
    </div>
  );
}
