"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Target, DollarSign, Percent } from "lucide-react";
import { Trade } from "@/types";

interface TradeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
  onImageClick?: (images: string[], index: number, title: string) => void;
}

export function TradeDetailModal({ 
  isOpen, 
  onClose, 
  trade, 
  onEdit, 
  onDelete,
  onImageClick
}: TradeDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!trade) return null;

  const nextImage = () => {
    if (trade.images && trade.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % trade.images!.length);
    }
  };

  const prevImage = () => {
    if (trade.images && trade.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + trade.images!.length) % trade.images!.length);
    }
  };

  const handleEdit = () => {
    onEdit(trade);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('정말로 이 주식 매매 기록을 삭제하시겠습니까?')) {
      onDelete(trade.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass max-w-4xl max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {trade.symbol} - 주식 매매 상세보기
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 기본 정보 카드 */}
          <div className="glass-card rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">거래일시</span>
                </div>
                <div className="font-semibold text-gray-800">
                  {new Date(trade.tradeDate).toLocaleDateString('ko-KR')}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(trade.tradeDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">손익</span>
                </div>
                <div className={`text-2xl font-bold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Percent className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">수익률</span>
                </div>
                <div className={`text-2xl font-bold ${trade.pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trade.pnlPercentage >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* 거래 세부정보 */}
          <div className="glass-card rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">거래 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">평균 단가:</span>
                  <span className="font-semibold">${trade.entryPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">보유 수량:</span>
                  <span className="font-semibold">{trade.quantity}주</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 투자금액:</span>
                  <span className="font-semibold">${(trade.entryPrice * trade.quantity).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">섹터:</span>
                  <span className="font-semibold">{trade.sector || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">회사명:</span>
                  <span className="font-semibold">{trade.companyName || trade.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결과:</span>
                  <Badge className={`${trade.result === 'profit' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                    {trade.result === 'profit' ? '익절' : '손절'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* ICT 분석 */}
          <div className="glass-card rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">기술적 분석</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">기술적 분석:</label>
                <p className="text-lg font-semibold text-gray-800 mt-1">{trade.analysis}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">전략:</label>
                <p className="text-gray-800 mt-1">{trade.strategy}</p>
              </div>
              {trade.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">매매 노트:</label>
                  <p className="text-gray-800 mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{trade.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* 태그 */}
          {trade.tags && trade.tags.length > 0 && (
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">태그</h3>
              <div className="flex flex-wrap gap-2">
                {trade.tags.map((tag, index) => (
                  <Badge key={index} className="bg-gray-100 text-gray-700 border-gray-300 px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 이미지 갤러리 */}
          {trade.images && trade.images.length > 0 && (
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">차트 이미지</h3>
              <div className="space-y-4">
                {/* 메인 이미지 */}
                <div className="relative">
                  <img
                    src={trade.images[currentImageIndex]}
                    alt={`차트 이미지 ${currentImageIndex + 1}`}
                    className="w-full max-h-96 object-contain rounded-lg border border-gray-200 bg-white"
                    onClick={() => onImageClick ? onImageClick(trade.images!, currentImageIndex, `${trade.symbol} 차트 이미지`) : window.open(trade.images![currentImageIndex], '_blank')}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* 이미지 네비게이션 */}
                  {trade.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      
                      {/* 이미지 인디케이터 */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                        {currentImageIndex + 1} / {trade.images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* 썸네일 */}
                {trade.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {trade.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`썸네일 ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded-md border-2 cursor-pointer flex-shrink-0 ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        onDoubleClick={() => onImageClick ? onImageClick(trade.images!, index, `${trade.symbol} 차트 이미지`) : window.open(trade.images![index], '_blank')}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-between pt-4">
            <Button
              onClick={handleDelete}
              className="bg-red-100 hover:bg-red-200 text-red-700"
            >
              삭제
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                닫기
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700"
              >
                수정
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}