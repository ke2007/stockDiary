"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Plus, Search, List, Grid3X3, LayoutGrid, Edit, Trash2, Eye, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { TradingDashboard } from "@/components/TradingDashboard";
import { TradeFormModal } from "@/components/TradeFormModal";
import { TradeDetailModal } from "@/components/TradeDetailModal";
import { ImagePopupModal } from "@/components/ImagePopupModal";
import { Trade, Category } from "@/types";
import { useStockPrice } from "@/hooks/useStockPrice";
import { CurrentPrice } from "@/components/CurrentPrice";

export default function Home() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "card" | "grid">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState<string[]>([]);
  const [popupImageIndex, setPopupImageIndex] = useState(0);
  const [popupTitle, setPopupTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // API에서 데이터 로드
  const loadTrades = async () => {
    try {
      const response = await fetch('/api/trades');
      const data = await response.json();
      // 최신 거래부터 정렬
      const sortedTrades = data.trades.sort((a: Trade, b: Trade) => 
        new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
      );
      setTrades(sortedTrades);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const filteredTrades = useMemo(() => {
    let filtered = trades;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.companyName && trade.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        trade.analysis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.sector && trade.sector.toLowerCase().includes(searchTerm.toLowerCase())) ||
        trade.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 카테고리 필터
    if (selectedCategory === "all") return filtered;
    if (selectedCategory === "profit") return filtered.filter(trade => trade.result === "profit");
    if (selectedCategory === "loss") return filtered.filter(trade => trade.result === "loss");
    if (selectedCategory === "recent") return filtered.slice().sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()).slice(0, 5);
    if (selectedCategory === "dashboard") return [];
    return filtered.filter(trade => trade.result === selectedCategory);
  }, [trades, selectedCategory, searchTerm]);

  const handleViewModeChange = (newViewMode: "list" | "card" | "grid") => {
    setViewMode(newViewMode);
  };

  const handleAddTrade = () => {
    setModalMode("add");
    setEditingTrade(null);
    setIsModalOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setModalMode("edit");
    setEditingTrade(trade);
    setIsModalOpen(true);
  };

  const handleSaveTrade = async (trade: Trade) => {
    try {
      if (modalMode === "add") {
        const response = await fetch('/api/trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trade)
        });
        
        if (response.ok) {
          setTrades(prev => [trade, ...prev].sort((a, b) => 
            new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
          ));
        } else {
          console.error('Failed to add trade');
        }
      } else {
        const response = await fetch('/api/trades', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trade)
        });
        
        if (response.ok) {
          setTrades(prev => prev.map(t => t.id === trade.id ? trade : t).sort((a, b) => 
            new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
          ));
        } else {
          console.error('Failed to update trade');
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving trade:', error);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    try {
      const response = await fetch(`/api/trades?id=${tradeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTrades(prev => prev.filter(t => t.id !== tradeId));
        setIsModalOpen(false);
        setIsDetailModalOpen(false);
      } else {
        console.error('Failed to delete trade');
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrade(null);
  };

  const handleViewTrade = (trade: Trade) => {
    setViewingTrade(trade);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingTrade(null);
  };

  const handleEditFromDetail = (trade: Trade) => {
    setModalMode("edit");
    setEditingTrade(trade);
    setIsModalOpen(true);
  };

  const handleImageClick = (images: string[], index: number, title: string) => {
    setPopupImages(images);
    setPopupImageIndex(index);
    setPopupTitle(title);
    setIsImagePopupOpen(true);
  };

  const handleCloseImagePopup = () => {
    setIsImagePopupOpen(false);
    setPopupImages([]);
    setPopupImageIndex(0);
    setPopupTitle("");
  };

  const renderTradeContent = (viewType: "list" | "card" | "grid") => {
    if (viewType === "list") {
      return (
        <div className="space-y-3">
          {filteredTrades.map((trade) => (
            <div key={trade.id} className="glass-card rounded-lg p-4 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer" data-card-element onClick={() => handleViewTrade(trade)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-medium text-gray-800">{trade.symbol}</h3>
                    <span className="text-sm text-gray-600">{trade.companyName || trade.symbol}</span>
                    <span className="text-xs text-gray-500">{new Date(trade.tradeDate).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {trade.sector && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs px-2 py-1">
                        {trade.sector}
                      </Badge>
                    )}
                    {trade.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} className="bg-gray-100 text-gray-600 border-gray-300 text-xs px-2 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`font-semibold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </div>
                      <div className={`text-sm ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTrade(trade);
                        }}
                        className="bg-green-100 hover:bg-green-200 text-green-700 p-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTrade(trade);
                        }}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrade(trade.id);
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (viewType === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrades.map((trade) => (
            <div 
              key={trade.id} 
              className="group relative bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:bg-white/70 transition-all duration-500 hover:scale-[1.02] cursor-pointer overflow-hidden"
              data-card-element 
              onClick={() => handleViewTrade(trade)}
            >
              {/* 배경 그라데이션 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* 헤더 섹션 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-2xl text-gray-900 tracking-tight">{trade.symbol}</h3>
                      {trade.sector && (
                        <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200/50 px-3 py-1 text-xs font-medium rounded-full">
                          {trade.sector}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">{trade.companyName || trade.symbol}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      {new Date(trade.tradeDate).toLocaleDateString('ko-KR')} {new Date(trade.tradeDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <CurrentPrice symbol={trade.symbol} />
                  </div>
                  
                  {/* 액션 버튼들 */}
                  <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTrade(trade);
                      }}
                      className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200 h-8 w-8 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTrade(trade);
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 h-8 w-8 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrade(trade.id);
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 h-8 w-8 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                {/* 투자 정보 섹션 */}
                <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-2xl p-6 mb-6 border border-gray-100/50">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">평균 단가</span>
                      <p className="font-bold text-gray-900 text-lg">${trade.entryPrice.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">보유 수량</span>
                      <p className="font-bold text-gray-900 text-lg">{trade.quantity}주</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">총 투자금액</span>
                      <p className="font-bold text-gray-900 text-xl">${(trade.entryPrice * trade.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* 수익률 섹션 */}
                <div className={`rounded-2xl p-6 mb-6 ${trade.pnl >= 0 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50' 
                  : 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/50'
                }`}>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${trade.pnl >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {trade.pnl >= 0 ? '수익' : '손실'}
                      </span>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </div>
                    <div className={`text-lg font-semibold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                {/* 분석 정보 */}
                <div className="bg-white/50 rounded-2xl p-5 mb-4 border border-gray-100/50">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">기술적 분석</p>
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{trade.analysis}</p>
                    </div>
                  </div>
                </div>
                
                {/* 태그들 */}
                {trade.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {trade.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border-gray-200 text-xs px-3 py-1.5 rounded-full font-medium">
                        #{tag}
                      </Badge>
                    ))}
                    {trade.tags.length > 3 && (
                      <Badge className="bg-gray-50 text-gray-400 border-gray-200 text-xs px-3 py-1.5 rounded-full">
                        +{trade.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          {filteredTrades.map((trade) => (
            <div key={trade.id} className="glass-card rounded-xl p-6 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer" data-card-element onClick={() => handleViewTrade(trade)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">{trade.symbol}</h3>
                      <p className="text-sm text-gray-600">{trade.companyName || trade.symbol}</p>
                      <p className="text-xs text-gray-500">{new Date(trade.tradeDate).toLocaleDateString('ko-KR')} {new Date(trade.tradeDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {trade.sector && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-300 px-2 py-1">
                          {trade.sector}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">평균 단가:</span>
                      <p className="font-medium text-gray-800">${trade.entryPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">보유 수량:</span>
                      <p className="font-medium text-gray-800">{trade.quantity}주</p>
                    </div>
                    <div>
                      <span className="text-gray-500">수익률:</span>
                      <p className={`font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">기술적 분석: <strong>{trade.analysis}</strong></span>
                      <div className={`px-3 py-1 rounded text-sm font-medium ${trade.pnl >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{trade.strategy}</p>
                  </div>
                  
                  {trade.images && trade.images.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">차트 이미지</div>
                      <div className="grid grid-cols-2 gap-2">
                        {trade.images.slice(0, 2).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`차트 이미지 ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(trade.images!, index, `${trade.symbol} 차트 이미지`);
                            }}
                          />
                        ))}
                        {trade.images.length > 2 && (
                          <div 
                            className="flex items-center justify-center bg-gray-100 rounded-md border border-gray-200 h-20 text-xs text-gray-600 cursor-pointer hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(trade.images!, 2, `${trade.symbol} 차트 이미지`);
                            }}
                          >
                            +{trade.images.length - 2}개 더
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {trade.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} className="bg-gray-100 text-gray-600 border-gray-300 text-xs py-1 px-3">
                          {tag}
                        </Badge>
                      ))}
                      {trade.tags.length > 3 && (
                        <Badge className="bg-gray-50 text-gray-500 border-gray-200 text-xs py-1 px-3">
                          +{trade.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>📊 {trade.quantity}주</span>
                        {trade.sector && (
                          <span>🏢 {trade.sector}</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTrade(trade);
                          }}
                          className="bg-green-100 hover:bg-green-200 text-green-700 p-1"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTrade(trade);
                          }}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTrade(trade.id);
                          }}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">매매 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="glass-header">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="md:hidden">
                <Sidebar 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 drop-shadow-sm">📈 Stock Journal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  placeholder="주식 매매 기록 검색..." 
                  className="glass-input pl-10 w-64 border-gray-200 text-gray-800 placeholder:text-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAddTrade}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400 transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">주식 매매 추가</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="glass-sidebar">
          <Sidebar 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
        
        <main className="flex-1 p-4 md:p-8">
          <div className="space-y-6">
            {selectedCategory === "dashboard" ? (
              /* 통계 대시보드 */
              <TradingDashboard trades={trades} />
            ) : (
              <>
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-800 drop-shadow-sm">
                        📊 {selectedCategory === "all" ? "모든 매매" : 
                             selectedCategory === "profit" ? "익절 매매" :
                             selectedCategory === "loss" ? "손절 매매" :
                             selectedCategory === "recent" ? "최근 매매" :
                             categories.find(c => c.id === selectedCategory)?.name}
                      </h2>
                      {selectedCategory !== "all" && (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-300 px-3 py-1">
                          {filteredTrades.length}개
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 glass-button rounded-lg p-1">
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleViewModeChange("list")}
                        className={`p-2 ${viewMode === "list" ? "bg-gray-200 text-gray-800" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}`}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "card" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleViewModeChange("card")}
                        className={`p-2 ${viewMode === "card" ? "bg-gray-200 text-gray-800" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleViewModeChange("grid")}
                        className={`p-2 ${viewMode === "grid" ? "bg-gray-200 text-gray-800" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}`}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="glass rounded-xl p-6">
                  {renderTradeContent(viewMode)}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      
      <TradeFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTrade}
        onDelete={handleDeleteTrade}
        trade={editingTrade}
        mode={modalMode}
      />
      
      <TradeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        trade={viewingTrade}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteTrade}
        onImageClick={handleImageClick}
      />
      
      <ImagePopupModal
        isOpen={isImagePopupOpen}
        onClose={handleCloseImagePopup}
        images={popupImages}
        initialIndex={popupImageIndex}
        title={popupTitle}
      />
    </div>
  );
}
