"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

export const Simple3DTest = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene 생성
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x404040); // 회색 배경

    // Camera 생성
    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      800 / 600, // Aspect ratio
      0.1, // Near plane
      1000 // Far plane
    );
    camera.position.z = 5; // 카메라를 뒤로 이동

    // Renderer 생성
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 600);
    mountRef.current.appendChild(renderer.domElement);

    // 간단한 큐브 생성
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // 초록색
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    console.log('Scene setup complete');
    console.log('Camera position:', camera.position);
    console.log('Cube position:', cube.position);

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 큐브 회전
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      
      // 렌더링
      renderer.render(scene, camera);
    };

    animate();

    // 정리
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Simple 3D Test</h2>
      <div className="border border-gray-400 inline-block">
        <div ref={mountRef} />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        회전하는 초록색 큐브가 보여야 합니다
      </p>
    </div>
  );
};