import { NextRequest, NextResponse } from 'next/server';

// Next.js static export 설정
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface StockSearchResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  sector?: string;
  industry?: string;
  market?: string;
}

// 모의 주식 데이터
const mockStocks: Record<string, StockSearchResult[]> = {
  'A': [
    { symbol: 'AAPL', shortname: 'Apple Inc.', longname: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', market: 'NASDAQ' },
    { symbol: 'AMZN', shortname: 'Amazon.com Inc.', longname: 'Amazon.com, Inc.', sector: 'Consumer Discretionary', industry: 'Internet Retail', market: 'NASDAQ' },
    { symbol: 'AMD', shortname: 'Advanced Micro Devices', longname: 'Advanced Micro Devices, Inc.', sector: 'Technology', industry: 'Semiconductors', market: 'NASDAQ' },
  ],
  'AA': [
    { symbol: 'AAPL', shortname: 'Apple Inc.', longname: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', market: 'NASDAQ' },
  ],
  'AAPL': [
    { symbol: 'AAPL', shortname: 'Apple Inc.', longname: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', market: 'NASDAQ' },
  ],
  'TSLA': [
    { symbol: 'TSLA', shortname: 'Tesla Inc.', longname: 'Tesla, Inc.', sector: 'Consumer Discretionary', industry: 'Auto Manufacturers', market: 'NASDAQ' },
  ],
  'T': [
    { symbol: 'TSLA', shortname: 'Tesla Inc.', longname: 'Tesla, Inc.', sector: 'Consumer Discretionary', industry: 'Auto Manufacturers', market: 'NASDAQ' },
    { symbol: 'T', shortname: 'AT&T Inc.', longname: 'AT&T Inc.', sector: 'Communication Services', industry: 'Telecom Services', market: 'NYSE' },
  ],
  'MSFT': [
    { symbol: 'MSFT', shortname: 'Microsoft Corp.', longname: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', market: 'NASDAQ' },
  ],
  'M': [
    { symbol: 'MSFT', shortname: 'Microsoft Corp.', longname: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', market: 'NASDAQ' },
    { symbol: 'META', shortname: 'Meta Platforms Inc.', longname: 'Meta Platforms, Inc.', sector: 'Communication Services', industry: 'Internet Content & Information', market: 'NASDAQ' },
  ],
  'G': [
    { symbol: 'GOOGL', shortname: 'Alphabet Inc.', longname: 'Alphabet Inc. Class A', sector: 'Communication Services', industry: 'Internet Content & Information', market: 'NASDAQ' },
    { symbol: 'GOOG', shortname: 'Alphabet Inc.', longname: 'Alphabet Inc. Class C', sector: 'Communication Services', industry: 'Internet Content & Information', market: 'NASDAQ' },
  ],
  'S': [
    { symbol: 'SPY', shortname: 'SPDR S&P 500 ETF Trust', longname: 'SPDR S&P 500 ETF Trust', sector: 'ETF', industry: 'Large Cap', market: 'NYSE' },
    { symbol: 'SPX', shortname: 'S&P 500 Index', longname: 'S&P 500 Index', sector: 'Index', industry: 'Market Index', market: 'NYSE' },
  ],
  'SP': [
    { symbol: 'SPY', shortname: 'SPDR S&P 500 ETF Trust', longname: 'SPDR S&P 500 ETF Trust', sector: 'ETF', industry: 'Large Cap', market: 'NYSE' },
  ],
  'SPY': [
    { symbol: 'SPY', shortname: 'SPDR S&P 500 ETF Trust', longname: 'SPDR S&P 500 ETF Trust', sector: 'ETF', industry: 'Large Cap', market: 'NYSE' },
  ],
  'Q': [
    { symbol: 'QQQ', shortname: 'Invesco QQQ Trust', longname: 'Invesco QQQ Trust Series 1', sector: 'ETF', industry: 'Technology', market: 'NASDAQ' },
  ],
  'QQQ': [
    { symbol: 'QQQ', shortname: 'Invesco QQQ Trust', longname: 'Invesco QQQ Trust Series 1', sector: 'ETF', industry: 'Technology', market: 'NASDAQ' },
  ],
  'V': [
    { symbol: 'VTI', shortname: 'Vanguard Total Stock Market ETF', longname: 'Vanguard Total Stock Market ETF', sector: 'ETF', industry: 'Total Market', market: 'NYSE' },
    { symbol: 'VOO', shortname: 'Vanguard S&P 500 ETF', longname: 'Vanguard S&P 500 ETF', sector: 'ETF', industry: 'Large Cap', market: 'NYSE' },
    { symbol: 'V', shortname: 'Visa Inc.', longname: 'Visa Inc.', sector: 'Financial Services', industry: 'Credit Services', market: 'NYSE' },
  ],
  'VTI': [
    { symbol: 'VTI', shortname: 'Vanguard Total Stock Market ETF', longname: 'Vanguard Total Stock Market ETF', sector: 'ETF', industry: 'Total Market', market: 'NYSE' },
  ],
  'VOO': [
    { symbol: 'VOO', shortname: 'Vanguard S&P 500 ETF', longname: 'Vanguard S&P 500 ETF', sector: 'ETF', industry: 'Large Cap', market: 'NYSE' },
  ],
  'I': [
    { symbol: 'IWM', shortname: 'iShares Russell 2000 ETF', longname: 'iShares Russell 2000 ETF', sector: 'ETF', industry: 'Small Cap', market: 'NYSE' },
  ],
  'IWM': [
    { symbol: 'IWM', shortname: 'iShares Russell 2000 ETF', longname: 'iShares Russell 2000 ETF', sector: 'ETF', industry: 'Small Cap', market: 'NYSE' },
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log('Searching for:', query);

    // 먼저 Yahoo Finance API 시도
    try {
      const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`;
      console.log('Trying Yahoo URL:', yahooUrl);

      const response = await fetch(yahooUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      });

      if (response.ok) {
        const responseText = await response.text();
        console.log('Yahoo response success, length:', responseText.length);
        
        const data = JSON.parse(responseText);
        const stocks: StockSearchResult[] = data.quotes
          ?.filter((quote: any) => 
            (quote.typeDisp === 'Equity' || quote.typeDisp === 'ETF') && 
            quote.isYahooFinance
          )
          ?.slice(0, 10)
          ?.map((quote: any) => ({
            symbol: quote.symbol,
            shortname: quote.shortname || quote.longname,
            longname: quote.longname,
            sector: quote.sector,
            industry: quote.industry,
            market: quote.exchange
          })) || [];

        if (stocks.length > 0) {
          console.log('Yahoo API success, returning', stocks.length, 'stocks');
          return NextResponse.json({ stocks });
        }
      }
    } catch (yahooError) {
      console.log('Yahoo API failed, falling back to mock data:', yahooError instanceof Error ? yahooError.message : 'Unknown error');
    }

    // Yahoo Finance 실패시 모의 데이터 사용
    console.log('Using mock data for query:', query);
    
    // 쿼리에 맞는 모의 데이터 찾기
    const upperQuery = query.toUpperCase();
    let matchingStocks: StockSearchResult[] = [];

    // 정확한 매치 먼저 확인
    if (mockStocks[upperQuery]) {
      matchingStocks = mockStocks[upperQuery];
    } else {
      // 부분 매치 확인
      for (const [key, stocks] of Object.entries(mockStocks)) {
        if (key.startsWith(upperQuery) || stocks.some(stock => 
          stock.symbol.includes(upperQuery) || 
          stock.shortname?.toLowerCase().includes(query.toLowerCase()) ||
          stock.longname?.toLowerCase().includes(query.toLowerCase())
        )) {
          matchingStocks = [...matchingStocks, ...stocks];
        }
      }
    }

    // 중복 제거
    const uniqueStocks = matchingStocks.filter((stock, index, array) => 
      array.findIndex(s => s.symbol === stock.symbol) === index
    ).slice(0, 10);

    console.log('Mock data result:', uniqueStocks.length, 'stocks');

    return NextResponse.json({ stocks: uniqueStocks });
  } catch (error) {
    console.error('Stock search error:', error);
    return NextResponse.json({ 
      error: 'Failed to search stocks', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}