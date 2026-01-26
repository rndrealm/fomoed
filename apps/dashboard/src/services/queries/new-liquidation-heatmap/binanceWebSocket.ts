import { MergedBar } from './types';

type KlineCallback = (bar: MergedBar, isClosed: boolean) => void;
type ConnectionCallback = (connected: boolean) => void;

export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private symbol: string;
  private interval: string;
  private onKline: KlineCallback;
  private onConnection: ConnectionCallback;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  constructor(
    symbol: string,
    interval: string,
    onKline: KlineCallback,
    onConnection: ConnectionCallback
  ) {
    this.symbol = symbol.toLowerCase();
    this.interval = interval;
    this.onKline = onKline;
    this.onConnection = onConnection;
  }

  connect() {
    const streamName = `${this.symbol}@kline_${this.interval}`;
    const url = `wss://fstream.binance.com/ws/${streamName}`;

    console.log(`Connecting to Binance WebSocket: ${streamName}`);

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.onConnection(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.e === 'kline') {
          const k = data.k;


          const volume = parseFloat(k.v);
          const oiDelta = volume * 0.1; 
          const bar: MergedBar = {
            timestamp: k.t,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            volume: volume,
            oiDelta: oiDelta,
          };

          this.onKline(bar, k.x);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onConnection(false);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.onConnection(false);
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  updateConfig(symbol: string, interval: string) {
    this.symbol = symbol.toLowerCase();
    this.interval = interval;
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
}
