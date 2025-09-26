"use client";

import { useRef, useEffect, useState } from "react";
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

  // 컨테이너 요소를 캔버스 이미지로 캡처
  const captureSnapshot = async (element: HTMLElement): Promise<ImageData | null> => {
    try {
      console.log('📸 Starting html2canvas capture for element:', element);
      console.log('📸 Element dimensions:', {
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        rect: element.getBoundingClientRect()
      });
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1, // 1:1 스케일로 변경하여 더 정확한 캡처
        logging: true, // 디버깅을 위해 로깅 활성화
        useCORS: true,
        allowTaint: true,
        height: element.offsetHeight,
        width: element.offsetWidth,
        ignoreElements: (element) => {
          const shouldIgnore = element.tagName === 'SCRIPT' || 
                               element.tagName === 'STYLE' ||
                               element.tagName === 'CANVAS' ||
                               element.classList.contains('debug-info');
          if (shouldIgnore) {
            console.log('🚫 Ignoring element:', element.tagName, element.className);
          }
          return shouldIgnore;
        },
        onclone: (clonedDoc, element) => {
          console.log('🔧 onclone called - cleaning up styles');
          
          // 모든 요소를 확인하고 스타일을 명확하게 만들기
          const allElements = clonedDoc.querySelectorAll('*');
          let processedCount = 0;
          
          allElements.forEach((el: any, index) => {
            const computedStyle = window.getComputedStyle(element.children[index] || element);
            
            // 배경색 강제 설정
            if (el.classList && (el.classList.contains('bg-card') || el.classList.contains('bg-background'))) {
              el.style.backgroundColor = '#ffffff';
            }
            
            // 텍스트 색상 강제 설정  
            if (el.classList && el.classList.contains('text-foreground')) {
              el.style.color = '#000000';
            }
            
            // 테두리 강제 설정
            if (el.classList && (el.classList.contains('border') || el.classList.contains('rounded'))) {
              el.style.border = '1px solid #e5e7eb';
            }
            
            processedCount++;
          });
          
          console.log(`🔧 Processed ${processedCount} elements in cloned document`);
          
          // CSS 변수 대체
          const rootStyle = clonedDoc.documentElement.style;
          rootStyle.setProperty('--background', '#ffffff');
          rootStyle.setProperty('--foreground', '#000000');
          rootStyle.setProperty('--card', '#ffffff');
          rootStyle.setProperty('--card-foreground', '#000000');
          rootStyle.setProperty('--border', '#e5e7eb');
          rootStyle.setProperty('--muted', '#f3f4f6');
          
          console.log('✅ CSS variables set on cloned document');
        }
      });
      
      console.log('✅ html2canvas completed, canvas created:', {
        width: canvas.width,
        height: canvas.height,
        dataURL: canvas.toDataURL().substring(0, 100) + '...' // 처음 100자만
      });
      
      // 캔버스의 실제 내용 분석
      const ctx = canvas.getContext('2d')!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // 픽셀 데이터 분석
      let transparentPixels = 0;
      let opaquePixels = 0;
      let semiTransparentPixels = 0;
      let coloredPixels = 0;
      let whitePixels = 0;
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        
        if (a === 0) {
          transparentPixels++;
        } else if (a === 255) {
          opaquePixels++;
          if (r === 255 && g === 255 && b === 255) {
            whitePixels++;
          } else if (r !== 255 || g !== 255 || b !== 255) {
            coloredPixels++;
          }
        } else {
          semiTransparentPixels++;
        }
      }
      
      const totalPixels = imageData.data.length / 4;
      console.log('🎨 Canvas pixel analysis:', {
        totalPixels,
        transparentPixels,
        opaquePixels,
        semiTransparentPixels,
        coloredPixels,
        whitePixels,
        transparentPercentage: Math.round((transparentPixels / totalPixels) * 100) + '%',
        opaquePercentage: Math.round((opaquePixels / totalPixels) * 100) + '%',
        coloredPercentage: Math.round((coloredPixels / totalPixels) * 100) + '%'
      });
      
      // 처음 몇 픽셀의 실제 값 확인
      const firstPixels = [];
      for (let i = 0; i < Math.min(20, imageData.data.length / 4); i++) {
        const index = i * 4;
        firstPixels.push({
          r: imageData.data[index],
          g: imageData.data[index + 1],
          b: imageData.data[index + 2],
          a: imageData.data[index + 3]
        });
      }
      console.log('🔍 First 20 pixels:', firstPixels);
      
      return imageData;
    } catch (error) {
      console.error('❌ Failed to capture snapshot:', error);
      // 폴백: 단순한 컬러 그라데이션으로 대체
      return createFallbackSnapshot(element);
    }
  };

  // 수동 DOM 캡처 시도 (디버그용)
  const manualDOMCapture = (element: HTMLElement): ImageData => {
    const canvas = document.createElement('canvas');
    const rect = element.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d')!;
    
    console.log('🖌️ Manual DOM capture started');
    
    // 배경 설정
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // DOM 요소들을 수동으로 그리기 시도
    const cardElements = element.querySelectorAll('[data-card-element]');
    console.log('🃏 Found card elements:', cardElements.length);
    
    cardElements.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // 상대 좌표 계산
      const relativeX = cardRect.left - elementRect.left;
      const relativeY = cardRect.top - elementRect.top;
      const cardWidth = cardRect.width;
      const cardHeight = cardRect.height;
      
      console.log(`🃏 Card ${index}:`, {
        relativeX, relativeY, cardWidth, cardHeight
      });
      
      // 카드 배경 그리기
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(relativeX, relativeY, cardWidth, cardHeight);
      
      // 카드 테두리
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(relativeX, relativeY, cardWidth, cardHeight);
      
      // 카드 제목 텍스트 추가 (더 크고 명확하게)
      const titleElement = card.querySelector('h3');
      if (titleElement) {
        const title = titleElement.textContent || `개발 사이트 ${index + 1}`;
        ctx.fillStyle = '#1f2937'; // 더 진한 텍스트 색상
        ctx.font = 'bold 20px Arial'; // 폰트 크기 증가
        ctx.fillText(title.substring(0, 25), relativeX + 20, relativeY + 35);
        
        // 부제목이나 URL도 추가 (더 크게)
        const urlElement = card.querySelector('a[href]');
        if (urlElement && urlElement.textContent) {
          ctx.fillStyle = '#6b7280';
          ctx.font = '14px Arial'; // 폰트 크기 증가
          ctx.fillText(urlElement.textContent.substring(0, 35), relativeX + 20, relativeY + 58);
        }
      }
      
      // 태그들 그리기 (더 선명하게)
      const badges = card.querySelectorAll('span, .badge, [class*="badge"], [class*="Badge"]');
      let tagCount = 0;
      badges.forEach((badge, badgeIndex) => {
        if (tagCount >= 3) return; // 최대 3개까지만
        
        const badgeText = badge.textContent?.trim();
        if (badgeText && badgeText.length > 1) {
          const badgeX = relativeX + 20 + (tagCount * 75); // 간격 증가
          const badgeY = relativeY + 75; // 위치 조정
          
          // 뱃지 배경 (더 크고 진한 색상)
          ctx.fillStyle = '#e5e7eb';
          ctx.fillRect(badgeX, badgeY, 70, 22); // 크기 증가
          
          // 뱃지 테두리
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 1;
          ctx.strokeRect(badgeX, badgeY, 70, 22); // 크기 증가
          
          // 뱃지 텍스트 (더 크고 진한 색상)
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 13px Arial'; // 폰트 크기 증가
          ctx.fillText(badgeText.substring(0, 8), badgeX + 7, badgeY + 15);
          
          tagCount++;
        }
      });
    });
    
    console.log('✅ Manual DOM capture completed');
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  // 폴백 스냅샷 생성
  const createFallbackSnapshot = (element: HTMLElement): ImageData => {
    console.log('🔄 Creating fallback snapshot');
    
    // 먼저 수동 캡처 시도
    try {
      return manualDOMCapture(element);
    } catch (error) {
      console.error('❌ Manual capture failed, using simple pattern:', error);
    }
    
    const canvas = document.createElement('canvas');
    const rect = element.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d')!;
    
    // 간단한 그라데이션 배경
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // 가짜 카드 모양들 그리기
    const cardHeight = rect.height / 5;
    for (let i = 0; i < 5; i++) {
      const y = i * cardHeight + 10;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, y, rect.width - 40, cardHeight - 20);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, y, rect.width - 40, cardHeight - 20);
    }
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  // 8x8 그리드 조각 생성 (더 큰 조각들)
  const createFragments = (imageData: ImageData, width: number, height: number) => {
    const gridSize = 8; // 12x12에서 8x8로 줄여서 더 큰 조각들
    const fragmentWidth = Math.floor(width / gridSize);
    const fragmentHeight = Math.floor(height / gridSize);
    const centerX = width / 2;
    const centerY = height / 2;
    const newFragments = [];
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col * fragmentWidth;
        const y = row * fragmentHeight;
        const fragmentCenterX = x + fragmentWidth / 2;
        const fragmentCenterY = y + fragmentHeight / 2;
        
        const fragment = {
          row,
          col,
          x,
          y,
          width: fragmentWidth,
          height: fragmentHeight,
          originalX: x,
          originalY: y,
          distanceFromCenter: Math.sqrt(
            Math.pow(fragmentCenterX - centerX, 2) + 
            Math.pow(fragmentCenterY - centerY, 2)
          ),
          delay: 0
        };
        newFragments.push(fragment);
      }
    }
    
    // 중앙부터 가장자리까지 거리에 따라 딜레이 설정
    const maxDistance = Math.max(...newFragments.map(f => f.distanceFromCenter));
    newFragments.forEach(fragment => {
      // 0~0.4 범위의 딜레이 (더 점진적인 파동 효과)
      fragment.delay = (fragment.distanceFromCenter / maxDistance) * 0.4;
    });
    
    return newFragments;
  };

  // 파동 애니메이션 실행
  const startRippleAnimation = async () => {
    console.log('🌊 [RippleTransition] startRippleAnimation called');
    
    if (!containerRef.current) {
      console.error('❌ containerRef.current is null');
      return;
    }
    
    if (!canvasRef.current) {
      console.error('❌ canvasRef.current is null');
      return;
    }

    const contentDiv = containerRef.current.querySelector('.content-container') as HTMLElement;
    if (!contentDiv) {
      console.error('❌ content-container not found');
      console.log('Available elements in container:', containerRef.current.children);
      return;
    }

    console.log('✅ Found content-container:', contentDiv);
    console.log('Content div dimensions:', {
      width: contentDiv.offsetWidth,
      height: contentDiv.offsetHeight,
      rect: contentDiv.getBoundingClientRect()
    });

    // 현재 상태 캡처
    console.log('📸 Starting snapshot capture...');
    
    // 임시 디버그: html2canvas 대신 수동 캡처 직접 사용
    const USE_MANUAL_CAPTURE = true;
    let currentImage: ImageData | null = null;
    
    if (USE_MANUAL_CAPTURE) {
      console.log('🔧 Using manual capture instead of html2canvas');
      currentImage = createFallbackSnapshot(contentDiv);
    } else {
      currentImage = await captureSnapshot(contentDiv);
    }
    
    if (!currentImage) {
      console.error('❌ Failed to capture snapshot');
      return;
    }

    console.log('✅ Snapshot captured:', {
      width: currentImage.width,
      height: currentImage.height,
      dataLength: currentImage.data.length
    });

    setCurrentSnapshot(currentImage);
    
    // 캔버스 크기 설정
    const rect = contentDiv.getBoundingClientRect();
    const canvas = canvasRef.current;
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // 캔버스 스타일도 명시적으로 설정
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    console.log('🎨 Canvas setup:', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      rectWidth: rect.width,
      rectHeight: rect.height,
      canvasStyleWidth: canvas.style.width,
      canvasStyleHeight: canvas.style.height
    });
    
    // 조각 생성
    const newFragments = createFragments(currentImage, rect.width, rect.height);
    console.log('🧩 Fragments created:', newFragments.length);
    console.log('First few fragments:', newFragments.slice(0, 3));
    
    setFragments(newFragments);

    // 애니메이션 시작
    const startTime = Date.now();
    const duration = 1500; // 1.5초로 조금 더 길게
    
    console.log('🎬 Starting animation, duration:', duration);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setAnimationProgress(progress);
      
      if (elapsed % 200 < 16) { // 매 200ms마다 로그 (대략)
        console.log(`🎭 Animation progress: ${Math.round(progress * 100)}%`);
      }
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        console.log('🎉 Animation completed');
        // 애니메이션 완료
        setFragments([]);
        setCurrentSnapshot(null);
        setNextSnapshot(null);
        setAnimationProgress(0);
      }
    };

    animate();
  };

  // 전환 트리거
  useEffect(() => {
    console.log('🔄 [RippleTransition] useEffect triggered:', {
      isTransitioning,
      viewMode,
      containerExists: !!containerRef.current,
      canvasExists: !!canvasRef.current
    });
    
    if (isTransitioning) {
      console.log('🚀 Starting ripple animation due to transition');
      startRippleAnimation();
    }
  }, [isTransitioning, viewMode]);

  // 캔버스 렌더링
  useEffect(() => {
    console.log('🎨 [Canvas Rendering] useEffect triggered:', {
      canvasExists: !!canvasRef.current,
      snapshotExists: !!currentSnapshot,
      fragmentsCount: fragments.length,
      animationProgress
    });
    
    if (!canvasRef.current || !currentSnapshot || fragments.length === 0) {
      console.log('⏸️ Skipping canvas render - missing requirements');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    console.log('🖼️ Starting to render fragments on canvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let renderedCount = 0;
    // 각 조각 그리기
    fragments.forEach((fragment, index) => {
      // 부드러운 파동 진행률 계산
      // 애니메이션 진행률이 딜레이보다 크면 시작
      const fragmentProgress = animationProgress > fragment.delay ? 
        Math.min(1, (animationProgress - fragment.delay) / 0.6) : 0;
      
      
      if (fragmentProgress > 0) {
        renderedCount++;
        
        ctx.save();
        
        // 파동 효과 계산 (더 부드럽고 자연스럽게, 더 큰 스케일)
        const wave = Math.sin(fragmentProgress * Math.PI) * 20 * (1 - fragmentProgress); // 파동 크기 증가
        const scale = 1.2 - fragmentProgress * 0.3; // 초기에 더 크게 시작
        const opacity = Math.cos(fragmentProgress * Math.PI / 2); // 부드럽게 사라짐
        const rotation = fragmentProgress * 0.08 * Math.sin(fragmentProgress * Math.PI * 3); // 회전도 약간 증가
        
        ctx.globalAlpha = opacity;
        
        // 조각 중심점 계산
        const centerX = fragment.x + fragment.width / 2;
        const centerY = fragment.y + fragment.height / 2;
        
        // 변형 적용
        ctx.translate(centerX + wave, centerY + wave);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        ctx.translate(-fragment.width / 2, -fragment.height / 2);
        
        // 실제 이미지 조각 그리기
        try {
          // 직접 ImageData를 사용하여 조각 그리기
          const fragmentImageData = ctx.createImageData(fragment.width, fragment.height);
          const data = fragmentImageData.data;
          let hasPixelData = false;
          
          for (let y = 0; y < fragment.height; y++) {
            for (let x = 0; x < fragment.width; x++) {
              const sourceX = fragment.x + x;
              const sourceY = fragment.y + y;
              const sourceIndex = (sourceY * currentSnapshot.width + sourceX) * 4;
              const targetIndex = (y * fragment.width + x) * 4;
              
              if (sourceIndex >= 0 && sourceIndex < currentSnapshot.data.length - 3) {
                data[targetIndex] = currentSnapshot.data[sourceIndex];     // R
                data[targetIndex + 1] = currentSnapshot.data[sourceIndex + 1]; // G
                data[targetIndex + 2] = currentSnapshot.data[sourceIndex + 2]; // B
                data[targetIndex + 3] = currentSnapshot.data[sourceIndex + 3]; // A
                
                // 투명하지 않은 픽셀이 있는지 확인
                if (currentSnapshot.data[sourceIndex + 3] > 0) {
                  hasPixelData = true;
                }
              } else {
                // 범위를 벗어난 경우 투명하게
                data[targetIndex] = 255;
                data[targetIndex + 1] = 255;
                data[targetIndex + 2] = 255;
                data[targetIndex + 3] = 0;
              }
            }
          }
          
          // 디버그: 첫 번째 조각에서 이미지 데이터 확인 (더 자주)
          if (index === 0 && Math.random() < 0.3) {
            // 실제 알파 값들 체크
            let alphaValues = [];
            for (let i = 3; i < Math.min(40, data.length); i += 4) {
              alphaValues.push(data[i]);
            }
            
            console.log('🖼️ Fragment image debug:', {
              fragmentIndex: index,
              hasPixelData,
              snapshotSize: currentSnapshot.data.length,
              fragmentSize: `${fragment.width}x${fragment.height}`,
              fragmentPosition: `${fragment.x},${fragment.y}`,
              samplePixels: [
                { r: data[0], g: data[1], b: data[2], a: data[3] },
                { r: data[4], g: data[5], b: data[6], a: data[7] },
                { r: data[8], g: data[9], b: data[10], a: data[11] },
                { r: data[12], g: data[13], b: data[14], a: data[15] },
                { r: data[16], g: data[17], b: data[18], a: data[19] }
              ],
              alphaValues: alphaValues,
              nonZeroAlphaCount: alphaValues.filter(a => a > 0).length,
              maxAlpha: Math.max(...alphaValues),
              minAlpha: Math.min(...alphaValues)
            });
          }
          
          if (hasPixelData) {
            // 실제 이미지 데이터 그리기 (알파 보정 전에 원본 확인)
            
            // 디버그: 원본 데이터 몇 개 확인
            if (index === 0) {
              let sampleOriginal = [];
              for (let i = 0; i < Math.min(20, fragmentImageData.data.length); i += 4) {
                sampleOriginal.push({
                  r: fragmentImageData.data[i],
                  g: fragmentImageData.data[i + 1], 
                  b: fragmentImageData.data[i + 2],
                  a: fragmentImageData.data[i + 3]
                });
              }
              console.log('🔍 Original fragment data:', sampleOriginal);
            }
            
            // 알파값 보정 (더 관대하게)
            let fixedPixels = 0;
            for (let i = 0; i < fragmentImageData.data.length; i += 4) {
              const r = fragmentImageData.data[i];
              const g = fragmentImageData.data[i + 1];
              const b = fragmentImageData.data[i + 2];
              let a = fragmentImageData.data[i + 3];
              
              // 원래 알파가 0이어도 색상이 있으면 불투명하게
              if (a === 0 && (r > 0 || g > 0 || b > 0)) {
                fragmentImageData.data[i + 3] = 255;
                fixedPixels++;
              }
              // 원래 불투명한 픽셀은 그대로 유지
              else if (a > 0) {
                fragmentImageData.data[i + 3] = 255;
              }
            }
            
            if (index === 0) {
              console.log(`🔧 Fixed ${fixedPixels} transparent pixels`);
            }
            
            ctx.putImageData(fragmentImageData, 0, 0);
            
            // 디버그: 다시 테두리 추가해서 조각이 보이는지 확인
            if (index < 20) {
              ctx.strokeStyle = `rgba(255, ${Math.floor(index * 12)}, 0, 0.8)`;
              ctx.lineWidth = 2;
              ctx.strokeRect(0, 0, fragment.width, fragment.height);
              
              // 조각 번호와 정보 표시
              ctx.fillStyle = `rgba(255, ${Math.floor(index * 12)}, 0, 0.9)`;
              ctx.font = 'bold 10px Arial';
              ctx.fillText(`${index}`, 3, 12);
              
              // 이미지 데이터 상태 표시
              ctx.fillStyle = hasPixelData ? 'lime' : 'red';
              ctx.fillRect(3, 15, 10, 10);
            }
          } else {
            // 이미지 데이터가 없으면 수동으로 그린 콘텐츠 재생성
            // 실제 DOM에서 다시 텍스트와 스타일 추출
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, fragment.width, fragment.height);
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, fragment.width, fragment.height);
            
            // 제목 텍스트 추가
            ctx.fillStyle = '#000000';
            ctx.font = '14px Arial';
            ctx.fillText(`사이트 ${fragment.row + 1}`, 5, 15);
            
            // 태그 시뮬레이션
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(5, 20, 40, 15);
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Arial';
            ctx.fillText('Tag', 8, 30);
          }
          
        } catch (error) {
          console.error('🚨 Error rendering fragment:', error);
          // 오류 시 폴백: 빨간 사각형으로 문제 표시
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.fillRect(0, 0, fragment.width, fragment.height);
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.fillText('Error', 2, 12);
        }
        
        ctx.restore();
      }
    });
    
    console.log(`🎭 Rendered ${renderedCount} fragments out of ${fragments.length}`);
  }, [currentSnapshot, fragments, animationProgress]);

  return (
    <div ref={containerRef} className="relative">
      {/* 실제 컨텐츠 */}
      <div className={`content-container ${isTransitioning ? 'invisible' : 'visible'}`}>
        {children}
      </div>
      
      {/* 애니메이션 캔버스 */}
      {isTransitioning && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 z-50"
          style={{ 
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />
      )}
      
    </div>
  );
};