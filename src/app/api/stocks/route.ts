import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    const quotes = await Promise.allSettled(
      symbols.map(async (symbol: string) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          
          if (!quote) return null;
          
          return {
            symbol: quote.symbol || symbol,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            currency: quote.currency || 'USD',
            marketState: quote.marketState || 'UNKNOWN',
            lastUpdated: quote.regularMarketTime ? new Date(quote.regularMarketTime) : new Date()
          };
        } catch (error) {
          console.error(`Error fetching stock data for ${symbol}:`, error);
          return null;
        }
      })
    );

    const stocksData = quotes
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    return NextResponse.json({ stocks: stocksData });
  } catch (error) {
    console.error('Error fetching multiple stocks data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks data' },
      { status: 500 }
    );
  }
}