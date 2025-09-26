import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Trade } from '@/types';

// Next.js static export 설정
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const tradesFilePath = path.join(process.cwd(), 'src/data/trades.json');

async function readTradesData() {
  try {
    const fileContents = await fs.readFile(tradesFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading trades file:', error);
    throw error;
  }
}

async function writeTradesData(data: any) {
  try {
    await fs.writeFile(tradesFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing trades file:', error);
    throw error;
  }
}

// GET - 모든 거래 조회
export async function GET() {
  try {
    const data = await readTradesData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read trades' }, { status: 500 });
  }
}

// POST - 새로운 거래 추가
export async function POST(request: NextRequest) {
  try {
    const newTrade: Trade = await request.json();
    const data = await readTradesData();
    
    data.trades.push(newTrade);
    await writeTradesData(data);
    
    return NextResponse.json({ message: 'Trade added successfully', trade: newTrade });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add trade' }, { status: 500 });
  }
}

// PUT - 거래 수정
export async function PUT(request: NextRequest) {
  try {
    const updatedTrade: Trade = await request.json();
    const data = await readTradesData();
    
    const tradeIndex = data.trades.findIndex((trade: Trade) => trade.id === updatedTrade.id);
    if (tradeIndex === -1) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }
    
    data.trades[tradeIndex] = updatedTrade;
    await writeTradesData(data);
    
    return NextResponse.json({ message: 'Trade updated successfully', trade: updatedTrade });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}

// DELETE - 거래 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tradeId = searchParams.get('id');
    
    if (!tradeId) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }
    
    const data = await readTradesData();
    const tradeIndex = data.trades.findIndex((trade: Trade) => trade.id === tradeId);
    
    if (tradeIndex === -1) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }
    
    const deletedTrade = data.trades.splice(tradeIndex, 1)[0];
    await writeTradesData(data);
    
    return NextResponse.json({ message: 'Trade deleted successfully', trade: deletedTrade });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
  }
}