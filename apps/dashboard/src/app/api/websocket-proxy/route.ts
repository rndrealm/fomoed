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
      try {
        const tokenOption = `${token.toLowerCase()}usdt`;
        let ws: WebSocket | null = null;
        let wsUrl: string;
        let heartbeatInterval: NodeJS.Timeout | null = null;
        let connectionTimeout: NodeJS.Timeout | null = null;
        let isConnected = false;
        let isConnecting = false;
        let shouldClose = false;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;

      const getWebSocketUrls = (streamType: string): string[] => {
        const baseUrls = [
          'wss://stream.binance.us:9443',  // Original
          'wss://stream.binance.us:443',   // Alternative port
        ];

        return baseUrls.map(baseUrl => {
          if (streamType === 'orderbook') {
            return `${baseUrl}/stream?streams=${tokenOption}@depth20@100ms/${tokenOption}@trade`;
          } else if (streamType === 'depth') {
            return `${baseUrl}/ws/${tokenOption}@depth20@100ms`;
          } else if (streamType === 'trade') {
            return `${baseUrl}/ws/${tokenOption}@trade`;
          } else if (streamType === 'miniTicker') {
            return `${baseUrl}/ws/${tokenOption}@miniTicker`;
          } else if (streamType === 'ticker') {
            return `${baseUrl}/stream?streams=${tokenOption}@trade/${tokenOption}@miniTicker`;
          } else if (streamType === 'kline') {
            return `${baseUrl}/ws/${tokenOption}@kline_${period}`;
          }
          return '';
        }).filter(url => url !== '');
      };

      const webSocketUrls = getWebSocketUrls(streamType);
      let currentUrlIndex = 0;

      if (webSocketUrls.length === 0) {
        controller.error(new Error('Invalid streamType'));
        return;
      }

      const cleanupWebSocket = () => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        
        if (ws) {
          const currentWs = ws;
          ws = null; 
          
          isConnected = false;
          isConnecting = false;
          
          process.nextTick(() => {
            try {
              currentWs.removeAllListeners();
              
              const state = currentWs.readyState;
              if (state === WebSocket.OPEN) {
                currentWs.close(1000, 'Client disconnected');
              } else if (state === WebSocket.CONNECTING) {
                currentWs.terminate();
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              if (errorMessage.includes('WebSocket was closed before the connection was established')) {
                return;
              }
              // Only log unexpected errors
              console.log('WebSocket cleanup warning (non-critical):', errorMessage);
            }
          });
        } else {
          isConnected = false;
          isConnecting = false;
        }
      };

      const connectWebSocket = () => {
        if (shouldClose) return;
        
        if (isConnecting) {
          console.log('Connection already in progress, skipping...');
          return;
        }
        
        if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          controller.error(new Error('Failed to establish WebSocket connection after multiple attempts'));
          return;
        }

        try {
          isConnecting = true;
          wsUrl = webSocketUrls[currentUrlIndex];
          
          console.log(`Attempting WebSocket connection (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}):`, wsUrl);
          
          connectionTimeout = setTimeout(() => {
            if (isConnecting && ws && ws.readyState === WebSocket.CONNECTING) {
              console.log('Connection timeout - trying next endpoint');
              
              const timeoutWs = ws;
              ws = null;
              isConnecting = false;
              
              try {
                timeoutWs.removeAllListeners();
                timeoutWs.terminate();
              } catch (error) {
                // Ignore timeout cleanup errors
              }
              
              currentUrlIndex = (currentUrlIndex + 1) % webSocketUrls.length;
              reconnectAttempts++;
              
              if (!shouldClose) {
                setTimeout(() => connectWebSocket(), 1000);
              }
            }
          }, 10000); 

          ws = new WebSocket(wsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; NodeWebSocket/1.0)',
              'Origin': 'https://www.binance.us'
            },
            handshakeTimeout: 10000, 
            perMessageDeflate: false  
          });

          ws.on('open', () => {
            if (ws !== currentWs || shouldClose) {
              try {
                currentWs.removeAllListeners();
                currentWs.close();
              } catch (error) {
                // Ignore cleanup errors for stale connections
              }
              return;
            }

            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }

            console.log(`✅ WebSocket connected successfully for ${streamType} - token: ${token}${period ? ` - period: ${period}` : ''}`);
            console.log(`Using endpoint: ${wsUrl}`);
            
            isConnected = true;
            isConnecting = false;
            reconnectAttempts = 0; 
            
            try {
              const successMsg = `data: {"type":"connection","status":"connected","timestamp":${Date.now()}}\n\n`;
              controller.enqueue(encoder.encode(successMsg));
            } catch (error) {
              console.error('Error sending connection message:', error);
            }
            
            heartbeatInterval = setInterval(() => {
              if (ws === currentWs && ws.readyState === WebSocket.OPEN && !shouldClose) {
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
              if (ws !== currentWs || !isConnected || shouldClose) return;
              
              const message = data.toString();
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
            if (ws !== currentWs) return;
            
            console.log(`WebSocket closed for ${streamType} - token: ${token}, code: ${code}, reason: ${reason?.toString()}`);
            
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            
            isConnected = false;
            isConnecting = false;
            
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
              heartbeatInterval = null;
            }

            if (!shouldClose && code !== 1000 && code !== 1001 && reconnectAttempts < maxReconnectAttempts) {
              currentUrlIndex = (currentUrlIndex + 1) % webSocketUrls.length;
              reconnectAttempts++;
              
              console.log(`Trying next endpoint in 5 seconds (${currentUrlIndex + 1}/${webSocketUrls.length})`);
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
            if (ws !== currentWs) return;
            
            console.error(`❌ WebSocket error for ${streamType} on ${wsUrl}:`, error.message);
            
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            
            isConnected = false;
            isConnecting = false;
            
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
              heartbeatInterval = null;
            }

            if (!shouldClose && reconnectAttempts < maxReconnectAttempts) {
              currentUrlIndex = (currentUrlIndex + 1) % webSocketUrls.length;
              reconnectAttempts++;
              
              setTimeout(() => {
                if (!shouldClose && !request.signal.aborted) {
                  console.log(`Retrying with next endpoint after error...`);
                  connectWebSocket();
                }
              }, 3000);
            }
          });

          const currentWs = ws;

        } catch (error) {
          console.error('Failed to create WebSocket:', error);
          isConnecting = false;
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(() => {
              if (!shouldClose) {
                connectWebSocket();
              }
            }, 5000);
          } else {
            controller.error(error);
          }
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
          // Expected - controller might already be closed
        }
      });
      
      } catch (error) {
        console.error('Stream setup error:', error);
        try {
          controller.error(error);
        } catch (controllerError) {
          // Controller might be in a bad state, ignore
        }
      }
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
      'X-Accel-Buffering': 'no', 
    },
  });
}