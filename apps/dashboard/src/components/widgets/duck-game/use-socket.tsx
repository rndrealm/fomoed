"use client";

import { useEffect, useRef, useCallback } from "react";
import socket from "./socket";

export const useSocket = () => {
  const listenersRef = useRef(new Map());

  // Cleanup on unmount
  useEffect(() => {
    const listenersSnapshot = listenersRef.current; // take snapshot
    return () => {
      listenersSnapshot.forEach((callback, event) => {
        socket.off(event, callback);
      });
      listenersSnapshot.clear();
    };
  }, []);

  const subscribe = useCallback((event: any, callback: any) => {
    const existingCallback = listenersRef.current.get(event);
    if (existingCallback) {
      socket.off(event, existingCallback);
    }
    socket.on(event, callback);
    listenersRef.current.set(event, callback);
  }, []);

  const unsubscribe = useCallback((event: any) => {
    const callback = listenersRef.current.get(event);
    if (callback) {
      socket.off(event, callback);
      listenersRef.current.delete(event);
    }
  }, []);

  const sendMessage = useCallback((event: any, data: any) => {
    socket.emit(event, data);
  }, []);

  return {
    socket,
    isConnected: socket.connected,
    subscribe,
    unsubscribe,
    sendMessage,
    emit: socket.emit.bind(socket),
  };
};

export const useSocketEvent = (event: any, callback: any) => {
  const { subscribe, unsubscribe } = useSocket();
  useEffect(() => {
    if (event && callback) {
      subscribe(event, callback);
      return () => unsubscribe(event);
    }
  }, [event, callback, subscribe, unsubscribe]);
};
