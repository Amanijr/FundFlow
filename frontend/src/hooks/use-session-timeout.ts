"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLogout } from "@/hooks/use-logout";

const IDLE_TIMEOUT_MS = 25 * 60 * 1000;
const WARNING_DURATION_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

export function useSessionTimeout(enabled = true) {
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const idleTimerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
  }, []);

  const startWarningCountdown = useCallback(() => {
    setOpen(true);
    setSecondsRemaining(WARNING_DURATION_MS / 1000);
    countdownRef.current = window.setInterval(() => {
      setSecondsRemaining((value) => {
        if (value <= 1) {
          if (countdownRef.current) window.clearInterval(countdownRef.current);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    warningTimerRef.current = window.setTimeout(() => {
      void logout("/login?reason=session_expired");
    }, WARNING_DURATION_MS);
  }, [logout]);

  const resetIdleTimer = useCallback(() => {
    if (!enabled) return;
    clearTimers();
    setOpen(false);
    idleTimerRef.current = window.setTimeout(startWarningCountdown, IDLE_TIMEOUT_MS);
  }, [clearTimers, enabled, startWarningCountdown]);

  const staySignedIn = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  useEffect(() => {
    if (!enabled) return;

    resetIdleTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    }

    return () => {
      clearTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetIdleTimer);
      }
    };
  }, [clearTimers, enabled, resetIdleTimer]);

  return { open, secondsRemaining, staySignedIn, signOutNow: () => void logout("/login?reason=session_expired") };
}
