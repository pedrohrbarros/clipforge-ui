"use client";

import { useSyncExternalStore } from "react";

export const CRED_KEY = "clipforge-google";

export type Profile = {
  email: string;
  name: string;
  picture?: string;
  exp: number;
};

export function decodeProfile(credential: string): Profile | null {
  try {
    const payload = JSON.parse(
      atob(credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return {
      email: payload.email,
      name: payload.name ?? "",
      picture: payload.picture,
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
      current = sessionStorage.getItem(CRED_KEY);
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

export function getCredential(): string | null {
  return getSnapshot();
}

export function setCredential(value: string | null) {
  current = value;
  try {
    if (value) sessionStorage.setItem(CRED_KEY, value);
    else sessionStorage.removeItem(CRED_KEY);
  } catch {
    // storage unavailable; the session just will not survive a reload
  }
  listeners.forEach((l) => l());
}

export function useCredential(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
