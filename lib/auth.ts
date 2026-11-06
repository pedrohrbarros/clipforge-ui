"use client";

import { useSyncExternalStore } from "react";

export const SESSION_KEY = "clipforge-session";

export type Profile = {
  email: string;
  name: string;
  picture?: string;
  exp: number;
};

/** Claims of the ClipForge session token (a JWT issued by the API after Google sign-in). */
export function decodeProfile(token: string): Profile | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return {
      email: payload.email,
      name: payload.name ?? "",
      picture: payload.picture || undefined,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

// Tiny external store so the whole page re-renders on sign-in and sign-out.
let current: string | null | undefined;
const listeners = new Set<() => void>();

function getSnapshot(): string | null {
  if (current === undefined) {
    try {
      current = localStorage.getItem(SESSION_KEY);
    } catch {
      current = null;
    }
    const profile = current ? decodeProfile(current) : null;
    if (!profile || profile.exp * 1000 < Date.now()) current = null;
  }
  return current;
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSession(): string | null {
  return getSnapshot();
}

export function setSession(value: string | null) {
  current = value;
  try {
    if (value) localStorage.setItem(SESSION_KEY, value);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // storage unavailable; the session just will not survive a reload
  }
  listeners.forEach((l) => l());
}

export function useSession(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
