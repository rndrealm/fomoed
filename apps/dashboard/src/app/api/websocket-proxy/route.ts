import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const streamType = searchParams.get('streamType') || 'orderbook'; // 'orderbook' or 'ticker'
  
  if (!token) {
    return new NextResponse('Token is required', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const tokenOption = `${token.toLowerCase()}usdt`;
      let ws: WebSocket;
      let wsUrl: string;

      const baseUrl =  "wss://stream.binance.us:9443/stream?streams=" 

      if (streamType === 'orderbook') {
        wsUrl = `${baseUrl}${tokenOption}@depth20@100ms/${tokenOption}@trade`;
      } else if (streamType === 'ticker') {
        wsUrl = `${baseUrl}${tokenOption}@trade/${tokenOption}@miniTicker`;
      } else {
        return new NextResponse('Invalid streamType. Use "orderbook" or "ticker"', { status: 400 });
      }

      // eslint-disable-next-line prefer-const
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected for ${streamType} - token: ${token}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = `data: ${event.data}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log(`WebSocket closed for ${streamType} - token: ${token}`);
        controller.close();
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${streamType}:`, error);
        controller.error(error);
      };

      request.signal.addEventListener('abort', () => {
        ws.close();
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}