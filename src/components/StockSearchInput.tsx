"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { StockSearchResult } from "@/app/api/stocks/search/route";

interface StockSearchInputProps {
  value: string;
  onChange: (value: string, stockInfo?: StockSearchResult) => void;
  placeholder?: string;
}

export function StockSearchInput({ value, onChange, placeholder = "주식 티커 검색..." }: StockSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // 디바운스된 검색
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.length >= 1) {
      debounceRef.current = setTimeout(() => {
        searchStocks(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchStocks = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.stocks) {
        setSearchResults(data.stocks);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('주식 검색 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStock = (stock: StockSearchResult) => {
    setSearchTerm(stock.symbol);
    onChange(stock.symbol, stock);
    setIsOpen(false);
    setSearchResults([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setSearchTerm(newValue);
    onChange(newValue);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="glass-input pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 animate-spin" />
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((stock, index) => (
            <button
              key={`${stock.symbol}-${index}`}
              onClick={() => handleSelectStock(stock)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{stock.symbol}</div>
                  <div className="text-sm text-gray-600 truncate max-w-64">
                    {stock.shortname || stock.longname}
                  </div>
                  {stock.sector && (
                    <div className="text-xs text-gray-500">{stock.sector}</div>
                  )}
                </div>
                {stock.market && (
                  <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {stock.market}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchResults.length === 0 && !isLoading && searchTerm.length >= 1 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}