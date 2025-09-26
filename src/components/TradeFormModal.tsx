"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import { Trade } from "@/types";
import { StockSearchInput } from "./StockSearchInput";
import { StockSearchResult } from "@/app/api/stocks/search/route";

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  onDelete?: (tradeId: string) => void;
  trade?: Trade | null;
  mode: "add" | "edit";
}

export function TradeFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  trade, 
  mode 
}: TradeFormModalProps) {
  const [formData, setFormData] = useState<Partial<Trade>>({
    tradeDate: "",
    symbol: "AAPL",
    companyName: "",
    position: "Long", // 기본값 유지하되 UI에서 숨김
    entryPrice: 0,
    exitPrice: 0,
    quantity: 0,
    pnl: 0,
    pnlPercentage: 0,
    result: "profit",
    analysis: "",
    strategy: "",
    notes: "",
    sector: "",
    marketCap: "Large", // 기본값 유지하되 UI에서 숨김
    tags: [],
    images: []
  });

  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "edit" && trade) {
      setFormData({
        ...trade,
        tradeDate: trade.tradeDate.split('T')[0] + 'T' + trade.tradeDate.split('T')[1].substring(0, 5)
      });
    } else {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        tradeDate: localDateTime,
        symbol: "AAPL",
        companyName: "",
        position: "Long", // 기본값 유지
        entryPrice: 0,
        exitPrice: 0,
        quantity: 0,
        pnl: 0,
        pnlPercentage: 0,
        result: "profit",
        analysis: "",
        strategy: "",
        notes: "",
        sector: "",
        marketCap: "Large", // 기본값 유지
        tags: [],
        images: []
      });
    }
  }, [mode, trade, isOpen]);

  // 손익 계산 함수 - 사용자가 직접 입력할 수 있도록 단순화
  const handlePnLChange = (pnl: number) => {
    const { entryPrice, quantity } = formData;
    let pnlPercentage = 0;
    
    if (entryPrice && quantity > 0) {
      // 총 투자금액 대비 수익률 계산
      const totalInvestment = entryPrice * quantity;
      pnlPercentage = (pnl / totalInvestment) * 100;
    }
    
    setFormData(prev => ({
      ...prev,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercentage: parseFloat(pnlPercentage.toFixed(2)),
      result: pnl >= 0 ? "profit" : "loss"
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // 이미지 파일을 base64로 변환
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 클립보드에서 이미지 붙여넣기
  const handlePaste = async (e: ClipboardEvent) => {
    console.log('Paste event detected!', e.clipboardData);
    const items = e.clipboardData?.items;
    if (!items) {
      console.log('No clipboard items found');
      return;
    }

    console.log('Clipboard items:', items.length);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Item ${i}: type=${item.type}, kind=${item.kind}`);
      
      if (item.type.indexOf('image') !== -1) {
        console.log('Image found in clipboard!');
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          console.log('File obtained:', file.name, file.type, file.size);
          try {
            const base64 = await convertToBase64(file);
            console.log('Base64 conversion successful, length:', base64.length);
            setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), base64]
            }));
          } catch (error) {
            console.error('이미지 변환 실패:', error);
          }
        }
      }
    }
  };

  // 파일 선택으로 이미지 추가
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const base64 = await convertToBase64(file);
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), base64]
          }));
        } catch (error) {
          console.error('이미지 변환 실패:', error);
        }
      }
    }
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 삭제
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  // 전역 paste 이벤트 리스너 (모달이 열려있을 때만)
  useEffect(() => {
    if (isOpen) {
      console.log('Adding paste event listener');
      document.addEventListener('paste', handlePaste);
      return () => {
        console.log('Removing paste event listener');
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [isOpen]);

  // 주식 검색 결과 선택 핸들러
  const handleStockSelect = (symbol: string, stockInfo?: StockSearchResult) => {
    setFormData(prev => ({
      ...prev,
      symbol,
      companyName: stockInfo?.shortname || stockInfo?.longname || "",
      sector: stockInfo?.sector || ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tradeData: Trade = {
      id: mode === "edit" && trade ? trade.id : `trade-${Date.now()}`,
      tradeDate: formData.tradeDate + ":00Z",
      symbol: formData.symbol || "AAPL",
      companyName: formData.companyName || "",
      position: formData.position || "Long",
      entryPrice: formData.entryPrice || 0,
      exitPrice: formData.exitPrice || formData.entryPrice || 0, // exitPrice가 없으면 entryPrice 사용
      quantity: formData.quantity || 0,
      pnl: formData.pnl || 0,
      pnlPercentage: formData.pnlPercentage || 0,
      result: formData.result || "profit",
      analysis: formData.analysis || "",
      strategy: formData.strategy || "",
      notes: formData.notes || "",
      sector: formData.sector || "",
      marketCap: formData.marketCap || "Large",
      tags: formData.tags || [],
      images: formData.images || []
    };

    onSave(tradeData);
    onClose();
  };

  const handleDelete = () => {
    if (trade && onDelete) {
      onDelete(trade.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={containerRef} className="glass max-w-2xl max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {mode === "add" ? "매매 기록 추가" : "매매 기록 수정"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tradeDate" className="text-gray-700">거래 일시</Label>
              <Input
                id="tradeDate"
                type="datetime-local"
                value={formData.tradeDate}
                onChange={(e) => setFormData(prev => ({ ...prev, tradeDate: e.target.value }))}
                className="glass-input"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="symbol" className="text-gray-700">주식 종목</Label>
              <StockSearchInput
                value={formData.symbol || ""}
                onChange={handleStockSelect}
                placeholder="AAPL, TSLA 등 주식 검색..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sector" className="text-gray-700">섹터</Label>
            <Input
              id="sector"
              value={formData.sector}
              onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
              className="glass-input"
              placeholder="Technology, Healthcare 등"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryPrice" className="text-gray-700">평균 단가</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                value={formData.entryPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                className="glass-input"
                placeholder="매수한 평균 가격"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="quantity" className="text-gray-700">보유 수량</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                className="glass-input"
                placeholder="주식/ETF 수량"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-700">손익 ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.pnl}
                onChange={(e) => handlePnLChange(parseFloat(e.target.value) || 0)}
                className={`glass-input font-semibold ${formData.pnl && formData.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                placeholder="실현 손익 입력"
              />
            </div>
            
            <div>
              <Label className="text-gray-700">수익률 (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.pnlPercentage}
                className={`glass-input font-semibold ${formData.pnlPercentage && formData.pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                placeholder="자동 계산됩니다"
                readOnly
              />
            </div>
            
            <div>
              <Label htmlFor="companyName" className="text-gray-700">회사명</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="glass-input"
                placeholder="자동으로 입력됩니다"
                readOnly
              />
            </div>
          </div>

          <div>
            <Label htmlFor="analysis" className="text-gray-700">기술적 분석</Label>
            <Input
              id="analysis"
              value={formData.analysis}
              onChange={(e) => setFormData(prev => ({ ...prev, analysis: e.target.value }))}
              className="glass-input"
              placeholder="지지선 돌파, RSI 과매도 등"
              required
            />
          </div>

          <div>
            <Label htmlFor="strategy" className="text-gray-700">전략</Label>
            <Input
              id="strategy"
              value={formData.strategy}
              onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
              className="glass-input"
              placeholder="스윙 매매, 데이 트레이딩 등"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-gray-700">메모</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="glass-input min-h-[100px]"
              placeholder="매매에 대한 자세한 분석과 학습 포인트를 작성하세요..."
            />
          </div>

          <div>
            <Label className="text-gray-700">태그</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="glass-input flex-1"
                placeholder="태그 입력 후 엔터 또는 추가 버튼"
              />
              <Button type="button" onClick={addTag} className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <Badge key={index} className="bg-gray-100 text-gray-700 border-gray-300">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-gray-700">차트 이미지</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  파일 선택
                </Button>
                <div className="flex items-center text-sm text-gray-600">
                  <Camera className="h-4 w-4 mr-1" />
                  또는 스크린샷을 Ctrl+V로 붙여넣기
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`주식 차트 이미지 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {(!formData.images || formData.images.length === 0) && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">주식 차트 스크린샷을 Ctrl+V로 붙여넣거나</p>
                  <p className="text-xs">파일 선택 버튼으로 이미지를 추가하세요</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {mode === "edit" && onDelete && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
                >
                  삭제
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-blue-100 hover:bg-blue-200 text-blue-700"
              >
                {mode === "add" ? "추가" : "수정"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}