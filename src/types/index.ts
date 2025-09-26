export interface Trade {
  id: string;
  tradeDate: string;
  symbol: string; // 주식 심볼 (예: AAPL, TSLA)
  companyName?: string; // 회사명
  position: "Long" | "Short";
  entryPrice: number;
  exitPrice?: number; // 청산가는 선택사항
  quantity: number; // 주식 수량
  pnl: number;
  pnlPercentage: number;
  result: "profit" | "loss";
  analysis: string; // 기술적 분석 (기존 ictConcept)
  strategy: string;
  notes: string;
  sector?: string; // 섹터
  marketCap?: "Large" | "Mid" | "Small"; // 시가총액 구간
  tags: string[];
  images?: string[]; // base64 encoded images
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface TradeData {
  trades: Trade[];
  categories: Category[];
}

// Legacy types for backward compatibility
export interface Site {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  submittedBy: string;
  submittedAt: string;
  rating: number;
  ratingCount: number;
}

export interface Comment {
  id: string;
  siteId: string;
  author: string;
  content: string;
  createdAt: string;
  parentId: string | null;
}

export interface SiteData {
  sites: Site[];
  categories: Category[];
}

export interface CommentData {
  comments: Comment[];
}