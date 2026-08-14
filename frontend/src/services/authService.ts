import { api } from "@/lib/api";
import type { Session } from "@/types/domain";

export const authService = {
  login(email: string, password: string) {
    return api<Session>("/auth/login", undefined, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};
