// Service to fetch available symbols from Binance

const BASE_URL = '/api/binance-heatmap';

export interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  volume24h: number;
  priceChange24h: number;
}

export interface SymbolGroup {
  name: string;
  symbols: string[];
}

interface BinanceTicker {
  symbol: string;
  priceChange?: string;
  priceChangePercent?: string;
  weightedAvgPrice?: string;
  lastPrice?: string;
  lastQty?: string;
  openPrice?: string;
  highPrice?: string;
  lowPrice?: string;
  volume?: string;
  quoteVolume?: string;
  openTime?: number;
  closeTime?: number;
  firstId?: number;
  lastId?: number;
  count?: number;
}

export async function fetchAvailableSymbols(): Promise<SymbolInfo[]> {
  try {
    const response = await fetch(`${BASE_URL}/fapi/v1/ticker/24hr`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch symbols');
    }

    const data: BinanceTicker[] = await response.json();

    const symbols: SymbolInfo[] = data
      .filter((ticker) => ticker.symbol.endsWith('USDT'))
      .map((ticker) => ({
        symbol: ticker.symbol,
        baseAsset: ticker.symbol.replace('USDT', ''),
        quoteAsset: 'USDT',
        volume24h: parseFloat(ticker.quoteVolume || '0'),
        priceChange24h: parseFloat(ticker.priceChangePercent || '0'),
      }))
      .sort((a, b) => b.volume24h - a.volume24h); 

    return symbols;
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return getFallbackSymbols();
  }
}

function getFallbackSymbols(): SymbolInfo[] {
  const fallback = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 
    'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'LINKUSDT', 'AVAXUSDT', 'UNIUSDT',
    'ATOMUSDT', 'LTCUSDT', 'TRXUSDT', 'APTUSDT', 'ARBUSDT', 'OPUSDT'
  ];

  return fallback.map(symbol => ({
    symbol,
    baseAsset: symbol.replace('USDT', ''),
    quoteAsset: 'USDT',
    volume24h: 0,
    priceChange24h: 0,
  }));
}

export function searchSymbols(symbols: SymbolInfo[], query: string): SymbolInfo[] {
  const q = query.toUpperCase();
  return symbols.filter(s => 
    s.symbol.includes(q) || s.baseAsset.includes(q)
  );
}