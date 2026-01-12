"use client";
import { useState, useEffect, useCallback } from "react";

const GUEST_TIMER_KEY = "fomoed_guest_timer";
const TIMER_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

interface GuestTimerData {
  firstVisit: string;
  timerStarted: boolean;
}

interface UseGuestTimerReturn {
  hasExpired: boolean;
  clearTimer: () => void;
}

export function useGuestTimer(isGuest: boolean): UseGuestTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState<number>(TIMER_DURATION);
  const [hasExpired, setHasExpired] = useState<boolean>(false);

  // Initialize or get existing timer
  useEffect(() => {
    if (!isGuest) {
      // Not a guest, clear any existing timer
      setTimeRemaining(TIMER_DURATION);
      setHasExpired(false);
      return;
    }

    // Get or create timer data
    const storedData = localStorage.getItem(GUEST_TIMER_KEY);
    let timerData: GuestTimerData;

    if (storedData) {
      try {
        timerData = JSON.parse(storedData);
      } catch (error) {
        // Invalid data, create fresh timer
        console.warn('Invalid guest timer data, resetting:', error);
        timerData = {
          firstVisit: new Date().toISOString(),
          timerStarted: true,
        };
        localStorage.setItem(GUEST_TIMER_KEY, JSON.stringify(timerData));
      }
    } else {
      // First visit, create timer
      timerData = {
        firstVisit: new Date().toISOString(),
        timerStarted: true,
      };
      localStorage.setItem(GUEST_TIMER_KEY, JSON.stringify(timerData));
    }

    // Calculate elapsed time
    const firstVisitTime = new Date(timerData.firstVisit).getTime();
    const now = Date.now();
    const elapsed = now - firstVisitTime;

    if (elapsed >= TIMER_DURATION) {
      // Timer has expired
      setHasExpired(true);
      setTimeRemaining(0);
    } else {
      // Timer is still running
      setTimeRemaining(TIMER_DURATION - elapsed);
      setHasExpired(false);
    }
  }, [isGuest]);

  // Countdown effect - recalculate from timestamp each second for accuracy
  useEffect(() => {
    if (!isGuest || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      // Recalculate from localStorage timestamp (source of truth)
      const storedData = localStorage.getItem(GUEST_TIMER_KEY);
      if (!storedData) {
        setHasExpired(false);
        return;
      }

      let timerData: GuestTimerData;
      try {
        timerData = JSON.parse(storedData);
      } catch (error) {
        // Corrupted data, clear timer
        console.warn('Corrupted timer data:', error);
        setHasExpired(false);
        localStorage.removeItem(GUEST_TIMER_KEY);
        return;
      }

      const firstVisitTime = new Date(timerData.firstVisit).getTime();
      const now = Date.now();
      const elapsed = now - firstVisitTime;
      const remaining = Math.max(0, TIMER_DURATION - elapsed);

      setTimeRemaining(remaining);

      if (elapsed >= TIMER_DURATION) {
        setHasExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGuest, timeRemaining]);

  // Clear timer completely
  const clearTimer = useCallback(() => {
    localStorage.removeItem(GUEST_TIMER_KEY);
    localStorage.removeItem("fomoed_guest_dashboard"); // Also clear guest dashboard data
    setTimeRemaining(TIMER_DURATION);
    setHasExpired(false);
  }, []);

  return {
    hasExpired,
    clearTimer,
  };
}
