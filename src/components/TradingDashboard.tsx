"use client";

import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, DollarSign, Target, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trade } from "@/types";

interface TradingDashboardProps {
  trades: Trade[];
}

export function TradingDashboard({ trades }: TradingDashboardProps) {
  const [startDate, setStartDate] = useState("2024-03-01");
  const [endDate, setEndDate] = useState("2024-03-31");

  // 날짜 범위에 따른 매매 필터링
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.tradeDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return tradeDate >= start && tradeDate <= end;
    }).sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime());
  }, [trades, startDate, endDate]);

  // 누적 수익률 데이터 계산
  const cumulativeData = useMemo(() => {
    let cumulativePnl = 0;
    let initialBalance = 10000; // 초기 자산 $10,000
    
    return filteredTrades.map(trade => {
      cumulativePnl += trade.pnl;
      const currentBalance = initialBalance + cumulativePnl;
      const growthRate = ((currentBalance - initialBalance) / initialBalance) * 100;
      
      return {
        date: new Date(trade.tradeDate).toLocaleDateString('ko-KR', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: trade.tradeDate,
        pnl: cumulativePnl,
        balance: currentBalance,
        growthRate: growthRate,
        symbol: trade.symbol,
        position: trade.position
      };
    });
  }, [filteredTrades]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    const profitTrades = filteredTrades.filter(t => t.result === "profit").length;
    const lossTrades = filteredTrades.filter(t => t.result === "loss").length;
    const winRate = totalTrades > 0 ? (profitTrades / totalTrades) * 100 : 0;
    const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0;
    const maxProfit = filteredTrades.length > 0 ? Math.max(...filteredTrades.map(t => t.pnl)) : 0;
    const maxLoss = filteredTrades.length > 0 ? Math.min(...filteredTrades.map(t => t.pnl)) : 0;
    
    return {
      totalTrades,
      profitTrades,
      lossTrades,
      winRate,
      totalPnl,
      avgPnl,
      maxProfit,
      maxLoss
    };
  }, [filteredTrades]);

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          주식 트레이딩 통계
        </h2>
        
        {/* 날짜 범위 선택 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input w-auto text-sm"
            />
            <span className="text-gray-500">~</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input w-auto text-sm"
            />
          </div>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.totalTrades}</div>
          <div className="text-sm text-gray-600">총 매매</div>
        </div>
        
        <div className="glass-card rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${stats.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">승률</div>
        </div>
        
        <div className="glass-card rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${stats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${stats.totalPnl.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">총 손익</div>
        </div>
        
        <div className="glass-card rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${stats.avgPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${stats.avgPnl.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">평균 손익</div>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">익절 매매</div>
              <div className="text-lg font-semibold text-green-600">{stats.profitTrades}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">최대 수익</div>
              <div className="text-lg font-semibold text-green-600">+${stats.maxProfit.toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">손절 매매</div>
              <div className="text-lg font-semibold text-red-600">{stats.lossTrades}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">최대 손실</div>
              <div className="text-lg font-semibold text-red-600">${stats.maxLoss.toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">자산 증가율</div>
            <div className={`text-xl font-bold ${cumulativeData.length > 0 && cumulativeData[cumulativeData.length - 1]?.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {cumulativeData.length > 0 ? 
                `${cumulativeData[cumulativeData.length - 1]?.growthRate >= 0 ? '+' : ''}${cumulativeData[cumulativeData.length - 1]?.growthRate.toFixed(2)}%` 
                : '0.00%'}
            </div>
          </div>
        </div>
      </div>

      {/* 자산 증가율 차트 */}
      <div className="glass-card rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Percent className="h-4 w-4 mr-2" />
          자산 증가율 추이
        </h3>
        
        {cumulativeData.length > 0 ? (
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '자산 증가율']}
                  labelFormatter={(label) => `날짜: ${label}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="growthRate" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            선택한 날짜 범위에 매매 기록이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}