"use client";

import { useRef, useEffect, useState, cloneElement, Children } from "react";
import html2canvas from "html2canvas";

interface RippleTransitionProps {
  children: React.ReactNode;
  isTransitioning: boolean;
  viewMode: "list" | "card" | "grid";
}

export const RippleTransition = ({ children, isTransitioning, viewMode }: RippleTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fragments, setFragments] = useState<any[]>([]);
  const [currentSnapshot, setCurrentSnapshot] = useState<ImageData | null>(null);
  const [nextSnapshot, setNextSnapshot] = useState<ImageData | null>(null);
  const animationFrameRef = useRef<number>();
  const [animationProgress, setAnimationProgress] = useState(0);

  // 카드 정보를 이용해 직접 텍스처 생성
  const createTextureFromCardData = (site: any): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    
    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 200);
    
    // 테두리
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 400, 200);
    
    // 제목
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(site.title || 'Title', 20, 40);
    
    // URL
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText(site.url || 'URL', 20, 65);
    
    // 설명
    ctx.fillStyle = '#374151';
    ctx.font = '16px Arial';
    const description = site.description || 'Description';
    const words = description.split(' ');
    let line = '';
    let y = 95;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 360 && line !== '') {
        ctx.fillText(line, 20, y);
        line = words[i] + ' ';
        y += 20;
        if (y > 180) break; // 높이 제한
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 20, y);
    
    // 태그들
    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px Arial';
    const tags = site.tags || [];
    let tagX = 20;
    let tagY = Math.min(y + 30, 180);
    
    tags.slice(0, 3).forEach((tag: string) => {
      ctx.fillText(`#${tag}`, tagX, tagY);
      tagX += ctx.measureText(`#${tag} `).width + 10;
    });
    
    console.log('Created text-based texture for:', site.title);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    return texture;
  };

  // DOM 요소를 텍스처로 변환 (백업용)
  const createTextureFromDOM = async (element: HTMLElement): Promise<THREE.CanvasTexture> => {
    try {
      // 요소가 보이도록 임시로 설정
      const originalStyle = {
        position: element.style.position,
        visibility: element.style.visibility,
        opacity: element.style.opacity
      };
      
      element.style.position = 'fixed';
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      element.style.left = '-9999px'; // 화면 밖으로
      element.style.top = '0px';
      
      console.log('Capturing DOM element:', element);
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1,
        logging: false, // 로깅 비활성화
        useCORS: true,
        allowTaint: true,
        width: 400,
        height: 200,
        ignoreElements: (element) => {
          // 문제가 될 수 있는 요소들 무시
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
        onclone: (clonedDoc) => {
          // 클론된 문서에서 CSS 변수나 최신 컬러 함수 제거
          const styles = clonedDoc.querySelectorAll('*');
          styles.forEach((el: any) => {
            const style = el.style;
            // lab, oklch 등 최신 컬러 함수가 포함된 스타일 제거
            for (let i = style.length - 1; i >= 0; i--) {
              const property = style[i];
              const value = style.getPropertyValue(property);
              if (value && (value.includes('lab(') || value.includes('oklch(') || value.includes('color('))) {
                style.removeProperty(property);
              }
            }
          });
        }
      });
      
      // 스타일 복원
      element.style.position = originalStyle.position;
      element.style.visibility = originalStyle.visibility;
      element.style.opacity = originalStyle.opacity;
      element.style.left = '';
      element.style.top = '';
      
      console.log('Canvas created:', canvas.width, canvas.height);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      texture.flipY = false; // Three.js 좌표계 맞춤
      
      return texture;
    } catch (error) {
      console.error('Failed to create texture:', error);
      
      // 실패 시 텍스트가 있는 캔버스 생성
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;
      
      // 배경
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, 400, 200);
      
      // 텍스트
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('카드 텍스처', 200, 100);
      ctx.fillText('생성 실패', 200, 130);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = false;
      return texture;
    }
  };

  // 3D 씬 초기화
  useEffect(() => {
    if (!mountRef.current) return;

    // 씬 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // 더 어두운 배경으로 큐브를 잘 보이게
    sceneRef.current = scene;

    // 카메라 설정 (Simple3DTest와 동일하게)
    const camera = new THREE.PerspectiveCamera(
      75,
      800 / 500,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5); // 더 가깝게
    cameraRef.current = camera;
    
    console.log('Camera setup:', camera.position, camera.fov);

    // 렌더러 설정
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(800, 500); // 고정 크기로 설정
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x222222, 1); // 배경색 명시적 설정
    rendererRef.current = renderer;

    console.log('Renderer size:', renderer.domElement.width, renderer.domElement.height);
    mountRef.current.appendChild(renderer.domElement);

    // 조명 설정 (더 밝게)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // 더 밝은 환경광
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // 더 밝은 방향광
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 초기 큐브들 생성
    create3DCubes();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 실제 DOM 요소들을 텍스처로 변환해서 큐브 생성
  const create3DCubes = async () => {
    if (!sceneRef.current) return;

    // 기존 큐브들 제거
    cubesRef.current.forEach(cube => {
      sceneRef.current!.remove(cube);
    });
    cubesRef.current = [];

    // DOM 카드 요소들 찾기
    const cardElements = document.querySelectorAll('[data-card-element]') as NodeListOf<HTMLElement>;
    console.log('Found card elements:', cardElements.length);

    if (cardElements.length === 0) {
      // DOM 요소가 없으면 테스트 큐브만 생성
      const testGeometry = new THREE.BoxGeometry(1, 1, 1);
      const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const testCube = new THREE.Mesh(testGeometry, testMaterial);
      testCube.position.set(0, 0, 0);
      testCube.userData = {
        originalPosition: testCube.position.clone(),
        cardIndex: -1,
        row: 0,
        col: 0
      };
      sceneRef.current.add(testCube);
      cubesRef.current.push(testCube);
      console.log('No DOM elements found, created test cube only');
      setCubesReady(true);
      animate();
      return;
    }

    // 실제 사이트 데이터를 사용해서 큐브 생성
    const { sites } = siteData as { sites: any[] };
    
    for (let cardIndex = 0; cardIndex < Math.min(sites.length, 5); cardIndex++) {
      const site = sites[cardIndex];
      
      try {
        // DOM 대신 사이트 데이터로 직접 텍스처 생성
        const texture = createTextureFromCardData(site);
        
        // 일단 카드당 1개 큐브로 시작 (테스트용)
        const cubeGeometry = new THREE.BoxGeometry(2, 1.5, 0.3);
        
        // 텍스처가 적용된 재질 사용
        const cubeMaterial = new THREE.MeshBasicMaterial({ 
          map: texture
        });
        
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        
        // 카드별로 세로로 배치
        cube.position.set(
          0,                    // 가로 중앙
          1 - cardIndex * 2,    // 세로로 간격
          0
        );
        
        cube.userData = {
          originalPosition: cube.position.clone(),
          cardIndex: cardIndex,
          row: 0,
          col: 0
        };
        
        sceneRef.current.add(cube);
        cubesRef.current.push(cube);
        
        // 나중에 3x3으로 분해할 수도 있음
        /* for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            // 3x3 큐브 코드...
          }
        } */
        
        console.log(`Created textured cubes for card ${cardIndex}`);
      } catch (error) {
        console.error(`Failed to create cubes for card ${cardIndex}:`, error);
        
        // 실패 시 단색 큐브 생성
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const cubeGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.2);
            const cubeMaterial = new THREE.MeshBasicMaterial({ 
              color: new THREE.Color().setHSL((cardIndex * 0.3) % 1, 0.8, 0.6)
            });
            
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set(
              (col - 1) * 1,
              1 - cardIndex * 2 + (1 - row) * 0.8,
              0
            );
            
            cube.userData = {
              originalPosition: cube.position.clone(),
              cardIndex: cardIndex,
              row: row,
              col: col
            };
            
            sceneRef.current.add(cube);
            cubesRef.current.push(cube);
          }
        }
      }
    }

    console.log(`Created ${cubesRef.current.length} cubes total`);
    setCubesReady(true);
    
    // 렌더링 시작
    animate();
  };

  // 분해 애니메이션
  const animateDisassembly = () => {
    cubesRef.current.forEach((cube, index) => {
      const { row, col, cardIndex } = cube.userData;
      
      // 각 방향으로 흩어짐
      const targetX = cube.position.x + (col - 1) * 3 + (Math.random() - 0.5) * 2;
      const targetY = cube.position.y + (row - 1) * 3 + (Math.random() - 0.5) * 2;
      const targetZ = (Math.random() - 0.5) * 4;
      
      const targetRotationX = Math.random() * Math.PI * 2;
      const targetRotationY = Math.random() * Math.PI * 2;
      const targetRotationZ = Math.random() * Math.PI * 2;

      // 애니메이션 함수
      const startTime = Date.now();
      const duration = 800;

      const animateStep = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        // 위치 애니메이션
        cube.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);
        
        // 회전 애니메이션  
        cube.rotation.x += 0.05;
        cube.rotation.y += 0.08;
        cube.rotation.z += 0.03;

        if (progress < 1) {
          requestAnimationFrame(animateStep);
        } else {
          // 분해 완료 후 재조립 시작
          setTimeout(() => reassemble(cube), 200);
        }
      };

      // 각 큐브마다 약간의 딜레이
      setTimeout(animateStep, index * 20);
    });
  };

  // 재조립 애니메이션
  const reassemble = (cube: THREE.Mesh) => {
    if (!cube.userData || !cube.userData.originalPosition) {
      console.warn('Cube missing originalPosition:', cube.userData);
      return;
    }
    
    const originalPos = cube.userData.originalPosition;
    const startTime = Date.now();
    const duration = 1000;

    const animateStep = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 부드럽게 원래 위치로 이동
      cube.position.lerp(originalPos, 0.08);
      
      // 회전을 점진적으로 0으로
      cube.rotation.x *= 0.92;
      cube.rotation.y *= 0.92;
      cube.rotation.z *= 0.92;
      
      if (progress < 1 && cube.position.distanceTo(originalPos) > 0.05) {
        requestAnimationFrame(animateStep);
      }
    };
    
    animateStep();
  };

  // 렌더링 루프
  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      // console.log('Rendering frame'); // 렌더링 확인용
    }
  };

  // 전환 애니메이션 트리거
  useEffect(() => {
    console.log('isTransitioning:', isTransitioning, 'cubesReady:', cubesReady, 'cubes:', cubesRef.current.length);
    if (isTransitioning && cubesReady && cubesRef.current.length > 0) {
      console.log('Starting disassembly animation');
      animateDisassembly();
    }
  }, [isTransitioning, cubesReady]);

  return (
    <div className="relative">
      {/* 3D Canvas (항상 렌더링) */}
      <div 
        ref={mountRef} 
        className={`w-full ${isTransitioning ? 'block' : 'hidden'}`}
        style={{ height: '500px' }}
      />
      
      {/* 일반 컨텐츠 */}
      <div className={isTransitioning ? 'hidden' : 'block'}>
        {children}
      </div>
      
      {/* 디버그 정보 */}
      {isTransitioning && (
        <div className="absolute top-0 left-0 bg-black text-white p-2 text-sm">
          큐브: {cubesRef.current.length}개 | 준비됨: {cubesReady ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
};