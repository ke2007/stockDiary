import { StockQuote, FinanceData } from '@/types/finance';

export async function getStockPrice(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(`/api/stocks/${symbol}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error(`Error from API: ${data.error}`);
      return null;
    }
    
    return {
      ...data,
      lastUpdated: new Date(data.lastUpdated)
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

export async function getMultipleStockPrices(symbols: string[]): Promise<StockQuote[]> {
  try {
    const response = await fetch('/api/stocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbols }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error(`Error from API: ${data.error}`);
      return [];
    }
    
    return data.stocks.map((stock: any) => ({
      ...stock,
      lastUpdated: new Date(stock.lastUpdated)
    }));
  } catch (error) {
    console.error('Error fetching multiple stock prices:', error);
    return [];
  }
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

export function formatChange(change: number, changePercent: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
}