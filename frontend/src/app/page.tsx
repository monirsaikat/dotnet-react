"use client";

import { LoginPage } from "@/components/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { useSession } from "@/hooks/useSession";

export default function HomePage() {
  const { session, signIn, signOut } = useSession();

  if (!session) {
    return <LoginPage onSignIn={signIn} />;
  }

  return <DashboardPage session={session} onSignOut={signOut} />;
}
