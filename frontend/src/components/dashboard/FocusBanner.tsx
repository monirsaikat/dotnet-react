"use client";

import { useState } from "react";
import type { Assignment, UserRole } from "@/types/domain";

interface FocusBannerProps {
  role: UserRole;
  assignments: Assignment[];
}

const ROLE_COPY: Record<UserRole, { eyebrow: string; title: string; body: string }> = {
  Admin: {
    eyebrow: "Institution pulse",
    title: "Keep learning operations moving.",
    body: "See the academic structure, people, and submission activity from one command center.",
  },
  Teacher: {
    eyebrow: "Teaching pulse",
    title: "Turn feedback into forward motion.",
    body: "Publish with clarity, spot review pressure early, and close the loop for every learner.",
  },
  Student: {
    eyebrow: "Your learning pulse",
    title: "Know what matters next.",
    body: "Prioritize the nearest deadline, submit with confidence, and track every result in one place.",
  },
};

export function FocusBanner({ role, assignments }: FocusBannerProps) {
  const [now] = useState(() => Date.now());
  const upcoming = assignments
    .filter((assignment) => new Date(assignment.deadline).getTime() > now)
    .sort(
      (left, right) =>
        new Date(left.deadline).getTime() - new Date(right.deadline).getTime(),
    );
  const nextAssignment = upcoming[0];
  const daysUntilNext = nextAssignment
    ? Math.max(
        0,
        Math.ceil((new Date(nextAssignment.deadline).getTime() - now) / 86_400_000),
      )
    : null;
  const copy = ROLE_COPY[role];

  return (
    <section className="focusBanner" aria-label={`${role} focus summary`}>
      <div>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </div>
      <div className="focusMetric">
        <span>Next milestone</span>
        <strong>{daysUntilNext == null ? "Clear" : `${daysUntilNext}d`}</strong>
        <small>{nextAssignment?.title ?? "No upcoming deadline"}</small>
      </div>
      <div className="focusOrbit" aria-hidden="true" />
    </section>
  );
}
