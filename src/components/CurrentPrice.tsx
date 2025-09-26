'use client';

import { useStockPrice } from '@/hooks/useStockPrice';

interface CurrentPriceProps {
  symbol: string;
}

export function CurrentPrice({ symbol }: CurrentPriceProps) {
  const { stockPrice, loading } = useStockPrice(symbol);

  if (loading) {
    return (
      <div className="text-xs text-gray-500">
        현재가: 로딩중...
      </div>
    );
  }

  if (!stockPrice) {
    return null;
  }

  const isPositive = stockPrice.change >= 0;
  
  return (
    <div className="text-xs">
      <span className="text-gray-500">현재가: </span>
      <span className={`font-medium ${isPositive ? 'text-green-600' : stockPrice.change < 0 ? 'text-red-600' : 'text-gray-700'}`}>
        ${stockPrice.price.toFixed(2)} ({isPositive ? '+' : ''}{stockPrice.changePercent.toFixed(2)}%)
      </span>
    </div>
  );
}