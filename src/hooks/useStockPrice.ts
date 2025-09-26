'use client';

import { useState, useEffect } from 'react';

interface StockPrice {
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export function useStockPrice(symbol: string) {
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;

    const fetchPrice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stocks/${symbol}`);
        if (response.ok) {
          const data = await response.json();
          setStockPrice({
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            currency: data.currency
          });
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [symbol]);

  return { stockPrice, loading };
}