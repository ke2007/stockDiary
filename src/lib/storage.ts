import { invoke } from '@tauri-apps/api/core';
import { Trade, Category } from '@/types';

// Tauri 환경 감지
const isTauri = typeof window !== 'undefined' && window.__TAURI__;

// 기본 데이터
const defaultData = {
  trades: [] as Trade[],
  categories: [
    { id: "all", name: "전체", description: "모든 매매 기록" },
    { id: "profit", name: "익절", description: "수익 발생 매매" },
    { id: "loss", name: "손절", description: "손실 발생 매매" },
    { id: "recent", name: "최근", description: "최근 5개 매매" },
    { id: "dashboard", name: "대시보드", description: "통계 대시보드" }
  ]
};

class StorageManager {
  private data = defaultData;

  async loadData() {
    try {
      if (isTauri) {
        // Tauri 환경: 파일 시스템 사용
        const fileData = await invoke('read_trades_file');
        this.data = fileData ? JSON.parse(fileData as string) : defaultData;
      } else {
        // 웹 환경: API 사용
        const response = await fetch('/api/trades');
        if (response.ok) {
          this.data = await response.json();
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this.data = defaultData;
    }
    
    return this.data;
  }

  async saveData() {
    try {
      if (isTauri) {
        // Tauri 환경: 파일 시스템 사용
        await invoke('write_trades_file', { data: JSON.stringify(this.data, null, 2) });
      } else {
        // 웹 환경에서는 API 사용 (기존 방식 유지)
        // API 호출은 각 CRUD 작업에서 개별적으로 처리
      }
    } catch (error) {
      console.error('Failed to save data:', error);
      throw error;
    }
  }

  getData() {
    return this.data;
  }

  async addTrade(trade: Trade) {
    this.data.trades.unshift(trade); // 최신 순으로 추가
    if (isTauri) {
      await this.saveData();
    }
    return trade;
  }

  async updateTrade(trade: Trade) {
    const index = this.data.trades.findIndex(t => t.id === trade.id);
    if (index !== -1) {
      this.data.trades[index] = trade;
      // 날짜순으로 재정렬
      this.data.trades.sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime());
      if (isTauri) {
        await this.saveData();
      }
    }
    return trade;
  }

  async deleteTrade(tradeId: string) {
    const index = this.data.trades.findIndex(t => t.id === tradeId);
    if (index !== -1) {
      const deletedTrade = this.data.trades.splice(index, 1)[0];
      if (isTauri) {
        await this.saveData();
      }
      return deletedTrade;
    }
    throw new Error('Trade not found');
  }
}

export const storage = new StorageManager();