"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/authService";
import type { Session, UserRole } from "@/types/domain";

interface LoginPageProps {
  onSignIn: (session: Session) => void;
}

const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string }> = {
  Admin: { email: "admin@example.com", password: "Admin123!" },
  Teacher: { email: "teacher@example.com", password: "Teacher123!" },
  Student: { email: "student@example.com", password: "Student123!" },
};

export function LoginPage({ onSignIn }: LoginPageProps) {
  const [email, setEmail] = useState(DEMO_ACCOUNTS.Teacher.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.Teacher.password);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function selectDemoAccount(role: UserRole) {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCOUNTS[role].password);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const session = await authService.login(email, password);
      onSignIn(session);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to sign in."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="loginShell">
      <section className="brandPanel">
        <div className="brandMark">A</div>
        <div>
          <span className="eyebrow">Academic workspace</span>
          <h1>Turn assignments into progress.</h1>
          <p>
            Create, submit, review, and improve - all in one focused space for your
            institution.
          </p>
        </div>
        <div className="featureLine">
          <span>01</span>
          <p>Role-aware workflows for administrators, teachers, and students.</p>
        </div>
      </section>

      <section className="loginPanel">
        <form className="loginCard" onSubmit={handleSubmit}>
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to your workspace</h2>
          <p className="muted">
            Use one of the seeded demo accounts to explore each role.
          </p>

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>

          {error && <div className="alert">{error}</div>}

          <button className="primary" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <div className="demoAccounts" aria-label="Demo account shortcuts">
            {(Object.keys(DEMO_ACCOUNTS) as UserRole[]).map((role) => (
              <button key={role} type="button" onClick={() => selectDemoAccount(role)}>
                {role}
              </button>
            ))}
          </div>
        </form>
      </section>
    </main>
  );
}
