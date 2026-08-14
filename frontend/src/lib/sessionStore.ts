import type { Session } from "@/types/domain";

const STORAGE_KEY = "ams-session";
const listeners = new Set<() => void>();

let currentSession: Session | null = null;
let hasLoadedStorage = false;

function loadStoredSession(): Session | null {
  if (hasLoadedStorage || typeof window === "undefined") {
    return currentSession;
  }

  hasLoadedStorage = true;
  const value = window.localStorage.getItem(STORAGE_KEY);

  try {
    currentSession = value ? (JSON.parse(value) as Session) : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    currentSession = null;
  }

  return currentSession;
}

export const sessionStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: loadStoredSession,
  getServerSnapshot: () => null,
  set(session: Session | null) {
    currentSession = session;
    hasLoadedStorage = true;

    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    listeners.forEach((listener) => listener());
  },
};
