"use client";

import { useMemo, useState } from "react";
import type { Submission } from "@/types/domain";

interface SubmissionOverviewProps {
  submissions: Submission[];
}

export function SubmissionOverview({ submissions }: SubmissionOverviewProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const visibleSubmissions = useMemo(
    () =>
      submissions.filter((submission) => {
        const searchTarget = [
          submission.studentName,
          submission.assignmentTitle,
          submission.subjectName,
          submission.courseName,
        ]
          .join(" ")
          .toLowerCase();

        return (
          searchTarget.includes(query.toLowerCase()) &&
          (status === "All" || submission.status === status)
        );
      }),
    [query, status, submissions],
  );

  const reviewedCount = submissions.filter(
    (submission) => submission.status === "Reviewed",
  ).length;
  const reviewRate = submissions.length
    ? Math.round((reviewedCount / submissions.length) * 100)
    : 0;

  return (
    <section className="panel submissionOverview">
      <div className="panelTitle">
        <div>
          <span className="eyebrow">Evidence trail</span>
          <h2>All submissions</h2>
        </div>
        <div className="reviewRate">
          <strong>{reviewRate}%</strong>
          <small>reviewed</small>
        </div>
      </div>

      <div className="filterBar">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search learner, course, or assignment"
          aria-label="Search submissions"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter submissions by status"
        >
          <option>All</option>
          <option>Submitted</option>
          <option>Reviewed</option>
          <option>Returned</option>
        </select>
      </div>

      <div className="submissionCards">
        {visibleSubmissions.map((submission) => (
          <article key={submission.id} className="submissionCard">
            <div>
              <span className="eyebrow">{submission.courseName}</span>
              <strong>{submission.assignmentTitle}</strong>
              <small>
                {submission.studentName} · {submission.subjectName}
              </small>
            </div>
            <div className="submissionScore">
              <span
                className={`status ${submission.status === "Reviewed" ? "green" : ""}`}
              >
                {submission.status}
              </span>
              <strong>
                {submission.marks == null
                  ? "—"
                  : `${submission.marks}/${submission.maximumMarks}`}
              </strong>
            </div>
          </article>
        ))}
      </div>

      {visibleSubmissions.length === 0 && (
        <p className="empty">No submissions match this view.</p>
      )}
    </section>
  );
}
