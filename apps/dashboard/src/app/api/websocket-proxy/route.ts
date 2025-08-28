// pages/api/websocket-proxy.ts or app/api/websocket-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const streamType = searchParams.get('streamType') || 'orderbook';
  const period = searchParams.get('period'); // For kline data
  
  if (!token) {
    return new NextResponse('Token is required', { status: 400 });
  }

  // Validate period for kline streams
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

      // Build WebSocket URL based on stream type
      if (streamType === 'orderbook') {
        // Combined streams for orderbook (keeping original)
        wsUrl = `wss://stream.binance.us:9443/stream?streams=${tokenOption}@depth20@100ms/${tokenOption}@trade`;
      } else if (streamType === 'depth') {
        // Separate depth stream
        wsUrl = `wss://stream.binance.us:9443/ws/${tokenOption}@depth20@100ms`;
      } else if (streamType === 'trade') {
        // Separate trade stream
        wsUrl = `wss://stream.binance.us:9443/ws/${tokenOption}@trade`;
      } else if (streamType === 'miniTicker') {
        // Mini ticker for more frequent price updates
        wsUrl = `wss://stream.binance.us:9443/ws/${tokenOption}@miniTicker`;
      } else if (streamType === 'ticker') {
        wsUrl = `wss://stream.binance.us:9443/stream?streams=${tokenOption}@trade/${tokenOption}@miniTicker`;
      } else if (streamType === 'kline') {
        wsUrl = `wss://stream.binance.us:9443/ws/${tokenOption}@kline_${period}`;
      } else {
        controller.error(new Error('Invalid streamType. Use "orderbook", "ticker", "trade", "depth", "miniTicker", or "kline"'));
        return;
      }

      const cleanupWebSocket = () => {
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        
        if (ws && ws.readyState !== WebSocket.CLOSED) {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close(1000, 'Client disconnected');
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
          ws = new WebSocket(wsUrl);

          ws.onopen = () => {
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
          };

          ws.onmessage = (event) => {
            try {
              if (!isConnected || shouldClose) return;
              
              // Parse the message to check if it's valid JSON
              const parsedData = JSON.parse(event.data);
              
              // For multi-stream connections, the data structure is different
              if (streamType === 'orderbook' && parsedData.stream) {
                // This is a multi-stream message, send as is
                const data = `data: ${event.data}\n\n`;
                controller.enqueue(encoder.encode(data));
              } else if (streamType === 'kline') {
                // For single kline stream
                const data = `data: ${event.data}\n\n`;
                controller.enqueue(encoder.encode(data));
              } else {
                // For other stream types
                const data = `data: ${event.data}\n\n`;
                controller.enqueue(encoder.encode(data));
              }
              
            } catch (error) {
              console.error('Error processing WebSocket message:', error);
              // Still try to send the raw data in case it's a parsing issue
              try {
                const data = `data: ${event.data}\n\n`;
                controller.enqueue(encoder.encode(data));
              } catch (sendError) {
                console.error('Error sending raw message:', sendError);
              }
            }
          };

          ws.onclose = (event) => {
            console.log(`WebSocket closed for ${streamType} - token: ${token}`, event.code, event.reason);
            isConnected = false;
            isConnecting = false;
            
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
              heartbeatInterval = null;
            }

            if (!shouldClose && event.code !== 1000 && event.code !== 1001) {
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
                // Controller might already be closed
              }
            }
          };

          ws.onerror = (error) => {
            console.error(`WebSocket error for ${streamType}:`, error);
            isConnected = false;
            isConnecting = false;
            
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
              heartbeatInterval = null;
            }
          };

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
        cleanupWebSocket();
        
        try {
          controller.close();
        } catch (error) {
          // Controller might already be closed
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