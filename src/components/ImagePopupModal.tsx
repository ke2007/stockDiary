"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

interface ImagePopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  title?: string;
}

export function ImagePopupModal({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex, 
  title 
}: ImagePopupModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
    setRotation(0);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `chart-image-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/90 border-gray-600 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-200">
        <DialogTitle className="sr-only">{title || "이미지 뷰어"}</DialogTitle>
        {/* 헤더 컨트롤 */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {title && (
              <h3 className="text-lg font-medium">{title}</h3>
            )}
            <div className="text-sm opacity-75">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 확대/축소 컨트롤 */}
            <Button
              onClick={handleZoomOut}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              onClick={handleZoomIn}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            {/* 회전 */}
            <Button
              onClick={handleRotate}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            
            {/* 다운로드 */}
            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {/* 리셋 */}
            <Button
              onClick={resetTransform}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20 text-xs px-3"
            >
              리셋
            </Button>
            
            {/* 닫기 */}
            <Button
              onClick={onClose}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 메인 이미지 영역 */}
        <div className="relative w-full h-[95vh] flex items-center justify-center overflow-hidden">
          <img
            src={images[currentIndex]}
            alt={`이미지 ${currentIndex + 1}`}
            className="max-w-none transition-transform duration-200 cursor-grab active:cursor-grabbing"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              maxHeight: '85vh',
              maxWidth: '90vw',
              objectFit: 'contain'
            }}
            draggable={false}
            onClick={resetTransform}
          />
          
          {/* 네비게이션 버튼 */}
          {images.length > 1 && (
            <>
              <Button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* 하단 썸네일 */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
            <div className="flex justify-center gap-2 overflow-x-auto max-w-full">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`썸네일 ${index + 1}`}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2 flex-shrink-0 transition-all ${
                    index === currentIndex 
                      ? 'border-blue-400 opacity-100' 
                      : 'border-white/20 opacity-60 hover:opacity-80'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setZoom(1);
                    setRotation(0);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}