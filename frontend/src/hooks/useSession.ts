"use client";

import { useSyncExternalStore } from "react";
import { sessionStore } from "@/lib/sessionStore";
import type { Session } from "@/types/domain";

export function useSession() {
  const session = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  );

  return {
    session,
    signIn: (value: Session) => sessionStore.set(value),
    signOut: () => sessionStore.set(null),
  };
}
