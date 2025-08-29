import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const streamType = searchParams.get('streamType') || 'orderbook';
  const period = searchParams.get('period');
  
  if (!token) {
    return new NextResponse('Token is required', { status: 400 });
  }

  if (streamType === 'kline' && !period) {
    return new NextResponse('Period is required for kline streams', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const tokenOption = `${token.toLowerCase()}usdt`;
      let ws: WebSocket | null = null;
      let wsUrl: string;
      let heartbeatInterval: NodeJS.Timeout | null = null;
      let isConnected = false;
      let isConnecting = false;
      let shouldClose = false;

      if (streamType === 'orderbook') {
        wsUrl = `wss://stream.binance.us:9443/stream?streams=${tokenOption}@depth20@100ms/${tokenOption}@trade`;
      } else if (streamType === 'depth') {
        wsUrl = `wss://stream.binance.us:9443/ws/${tokenOption}@depth20@100ms`;
      } else if (streamType === 'trade') {
        wsUrl = `wss://stream.binance.us:9443/ws/${tokenOption}@trade`;
      } else if (streamType === 'miniTicker') {
        wsUrl = `wss://stream.binance.us:9443/ws/${tokenOption}@miniTicker`;
      } else if (streamType === 'ticker') {
        wsUrl = `wss://stream.binance.us:9443/stream?streams=${tokenOption}@trade/${tokenOption}@miniTicker`;
      } else if (streamType === 'kline') {
        wsUrl = `wss://stream.binance.us:9443/ws/${tokenOption}@kline_${period}`;
      } else {
        controller.error(new Error('Invalid streamType'));
        return;
      }

      const cleanupWebSocket = () => {
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        
        if (ws) {
          try {
            if (ws.readyState === WebSocket.OPEN) {
              ws.close(1000, 'Client disconnected');
            } else if (ws.readyState === WebSocket.CONNECTING) {
              ws.close();
            }
          } catch (error) {
            console.log('WebSocket cleanup error (non-critical):');
          }
          ws = null;
        }
        
        isConnected = false;
        isConnecting = false;
      };

      const connectWebSocket = () => {
        if (shouldClose || isConnecting) return;
        
        try {
          isConnecting = true;
          
          ws = new WebSocket(wsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; NodeWebSocket/1.0)'
            }
          });

          ws.on('open', () => {
            if (shouldClose) {
              cleanupWebSocket();
              return;
            }

            console.log(`WebSocket connected for ${streamType} - token: ${token}${period ? ` - period: ${period}` : ''}`);
            isConnected = true;
            isConnecting = false;
            
            heartbeatInterval = setInterval(() => {
              if (ws && ws.readyState === WebSocket.OPEN && !shouldClose) {
                try {
                  const heartbeat = `data: {"type":"heartbeat","timestamp":${Date.now()}}\n\n`;
                  controller.enqueue(encoder.encode(heartbeat));
                } catch (error) {
                  console.error('Heartbeat error:', error);
                }
              }
            }, 30000);
          });

          ws.on('message', (data) => {
            try {
              if (!isConnected || shouldClose) return;
              
              const message = data.toString();
              const parsedData = JSON.parse(message);
              
              const sseData = `data: ${message}\n\n`;
              controller.enqueue(encoder.encode(sseData));
              
            } catch (error) {
              console.error('Error processing WebSocket message:', error);
              try {
                const sseData = `data: ${data.toString()}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              } catch (sendError) {
                console.error('Error sending raw message:', sendError);
              }
            }
          });

          ws.on('close', (code, reason) => {
            console.log(`WebSocket closed for ${streamType} - token: ${token}`, code, reason?.toString());
            isConnected = false;
            isConnecting = false;
            
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
              heartbeatInterval = null;
            }

            if (!shouldClose && code !== 1000 && code !== 1001) {
              console.log('Attempting to reconnect in 5 seconds...');
              setTimeout(() => {
                if (!shouldClose && !request.signal.aborted) {
                  connectWebSocket();
                }
              }, 5000);
            } else {
              try {
                controller.close();
              } catch (error) {
                console.log('Controller already closed');
              }
            }
          });

          ws.on('error', (error) => {
            console.error(`WebSocket error for ${streamType}:`, error.message);
            isConnected = false;
            isConnecting = false;
            
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
              heartbeatInterval = null;
            }

            if (!shouldClose) {
              setTimeout(() => {
                if (!shouldClose && !request.signal.aborted) {
                  console.log(`Retrying connection after error for ${streamType}...`);
                  connectWebSocket();
                }
              }, 5000);
            }
          });

        } catch (error) {
          console.error('Failed to create WebSocket:', error);
          isConnecting = false;
          controller.error(error);
        }
      };

      connectWebSocket();

      request.signal.addEventListener('abort', () => {
        console.log('Client disconnected, cleaning up...');
        shouldClose = true;
        
        isConnected = false;
        isConnecting = false;
        
        cleanupWebSocket();
        
        try {
          controller.close();
        } catch (error) {
          console.log("Controller might already be closed - this is normal")
        }
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