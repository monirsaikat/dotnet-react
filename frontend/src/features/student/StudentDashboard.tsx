"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { getString } from "@/lib/formData";
import { submissionService } from "@/services/submissionService";
import type { Submission } from "@/types/domain";
import type { RoleDashboardProps } from "@/features/dashboard/types";

export function StudentDashboard({ session, assignments, notify }: RoleDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [referenceTime] = useState(() => Date.now());
  const openAssignments = assignments.filter(
    (assignment) => new Date(assignment.deadline).getTime() > referenceTime,
  );

  const loadSubmissions = useCallback(async () => {
    try {
      setSubmissions(await submissionService.listMine(session.token));
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not load your submissions."));
    }
  }, [notify, session.token]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  async function submitAnswer(event: FormEvent<HTMLFormElement>, assignmentId: string) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);

    try {
      await submissionService.saveAnswer(
        session.token,
        assignmentId,
        getString(values, "answer"),
      );
      notify("Submission saved.");
      await loadSubmissions();
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not save your submission."));
    }
  }

  return (
    <section className="contentGrid studentGrid">
      <div className="panel" id="assignments">
        <div className="panelTitle">
          <div>
            <span className="eyebrow">Due next</span>
            <h2>Open assignments</h2>
          </div>
        </div>

        {openAssignments.map((assignment) => {
          const existingSubmission = submissions.find(
            (submission) => submission.assignmentId === assignment.id,
          );
          const hoursRemaining = Math.max(
            0,
            Math.ceil(
              (new Date(assignment.deadline).getTime() - referenceTime) / 3_600_000,
            ),
          );
          const deadlineLabel =
            hoursRemaining < 48
              ? `${hoursRemaining}h left`
              : `${Math.ceil(hoursRemaining / 24)}d left`;

          return (
            <article className="studentAssignment" key={assignment.id}>
              <div className="panelTitle">
                <div>
                  <strong>{assignment.title}</strong>
                  <small>
                    {assignment.subjectName} · due{" "}
                    {new Date(assignment.deadline).toLocaleString()}
                  </small>
                </div>
                <div className="studentMeta">
                  <span
                    className={hoursRemaining < 48 ? "status urgent" : "status green"}
                  >
                    {deadlineLabel}
                  </span>
                  <span>{assignment.maximumMarks} marks</span>
                </div>
              </div>
              <p>{assignment.description}</p>
              <form onSubmit={(event) => submitAnswer(event, assignment.id)}>
                <textarea
                  name="answer"
                  defaultValue={existingSubmission?.answer}
                  placeholder="Write your answer here..."
                  required
                  maxLength={10000}
                />
                <button className="primary">
                  {existingSubmission ? "Update submission" : "Submit answer"}
                </button>
              </form>
            </article>
          );
        })}
        {openAssignments.length === 0 && (
          <p className="empty">You are clear - no open assignments right now.</p>
        )}
      </div>

      <div className="panel" id="submissions">
        <span className="eyebrow">Your results</span>
        <h2>Submission status</h2>
        {submissions.length === 0 ? (
          <p className="empty">Nothing submitted yet.</p>
        ) : (
          submissions.map((submission) => (
            <article className="resultCard" key={submission.id}>
              <div>
                <strong>{submission.assignmentTitle}</strong>
                <span className="status green">{submission.status}</span>
              </div>
              <p>
                {submission.marks == null
                  ? "Awaiting review"
                  : `${submission.marks} marks`}
              </p>
              {submission.feedback && <small>“{submission.feedback}”</small>}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
