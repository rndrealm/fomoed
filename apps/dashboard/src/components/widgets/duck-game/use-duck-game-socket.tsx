"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useDuckGameSocket = (widgetId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef(new Map());

  // Create socket instance on mount
  useEffect(() => {
    // Create a new socket instance
    const newSocket = io("wss://duckracegp.com", {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      query: { EIO: 4, widgetId }, // Add widgetId to make each connection unique
    });

    // Store a reference to the current listeners map at the time this effect runs
    const currentListeners = listenersRef.current;

    socketRef.current = newSocket;

    // Setup connection handlers
    const handleConnect = () => {
      console.log(
        `Widget ${widgetId} socket connected with SID:`,
        newSocket.id,
      );
      newSocket.emit("join_race_room", {});
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log(`Widget ${widgetId} socket disconnected`);
      setIsConnected(false);
    };

    const handleError = (error: Error) => {
      console.error(`Widget ${widgetId} socket error:`, error);
    };

    // Register event handlers
    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("error", handleError);

    // Clean up on unmount
    return () => {
      console.log(`Widget ${widgetId} cleaning up socket connection`);

      // Unregister all event listeners using the captured reference
      currentListeners.forEach((callback, event) => {
        newSocket.off(event, callback);
      });

      // Disconnect and clean up socket
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("error", handleError);

      // Disconnect the socket
      if (newSocket.connected) {
        newSocket.disconnect();
      }

      // Clear the ref
      socketRef.current = null;

      // Disconnect and clean up socket
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("error", handleError);

      // Disconnect the socket
      if (newSocket.connected) {
        newSocket.disconnect();
      }

      // Clear the ref
      socketRef.current = null;
    };
  }, [widgetId]); // Only recreate socket when widgetId changes

  // Subscribe to socket events
  const subscribe = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (!socketRef.current) return;

      const existingCallback = listenersRef.current.get(event);
      if (existingCallback) {
        socketRef.current.off(event, existingCallback);
      }

      socketRef.current.on(event, callback);
      listenersRef.current.set(event, callback);
    },
    [],
  );

  // Unsubscribe from socket events
  const unsubscribe = useCallback((event: string) => {
    if (!socketRef.current) return;

    const callback = listenersRef.current.get(event);
    if (callback) {
      socketRef.current.off(event, callback);
      listenersRef.current.delete(event);
    }
  }, []);

  // Send a message through the socket
  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    subscribe,
    unsubscribe,
    sendMessage,
  };
};

// Custom hook to use socket events
export const useSocketEvent = (
  widgetId: string,
  event: string,
  callback: (...args: any[]) => void,
) => {
  const { subscribe, unsubscribe } = useDuckGameSocket(widgetId);

  useEffect(() => {
    if (event && callback) {
      subscribe(event, callback);
      return () => unsubscribe(event);
    }
  }, [event, callback, subscribe, unsubscribe]);
};
