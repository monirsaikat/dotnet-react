"use client";

import { FormEvent, useState } from "react";
import { AssignmentRow } from "@/components/assignments/AssignmentRow";
import { getErrorMessage } from "@/lib/errors";
import { getNumber, getString, isChecked } from "@/lib/formData";
import { assignmentService, type AssignmentPayload } from "@/services/assignmentService";
import { submissionService } from "@/services/submissionService";
import type { Assignment, Submission } from "@/types/domain";
import type { RoleDashboardProps } from "@/features/dashboard/types";
import { AssignmentEditor } from "./components/AssignmentEditor";

function buildAssignmentPayload(values: FormData): AssignmentPayload {
  return {
    title: getString(values, "title"),
    description: getString(values, "description"),
    subjectId: getString(values, "subjectId"),
    deadline: new Date(getString(values, "deadline")).toISOString(),
    maximumMarks: getNumber(values, "marks"),
    isPublished: isChecked(values, "published"),
  };
}

export function TeacherDashboard({
  session,
  assignments,
  subjects,
  refreshDashboard,
  notify,
}: RoleDashboardProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<"All" | "Published" | "Draft">("All");

  const teacherSubjects = subjects.filter(
    (subject) => subject.teacherId === session.user.id,
  );
  const visibleAssignments = assignments.filter((assignment) => {
    const matchesSearch = `${assignment.title} ${assignment.subjectName}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesVisibility =
      visibility === "All" ||
      (visibility === "Published" && assignment.isPublished) ||
      (visibility === "Draft" && !assignment.isPublished);
    return matchesSearch && matchesVisibility;
  });

  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      await assignmentService.create(session.token, buildAssignmentPayload(values));

      form.reset();
      notify("Assignment created.");
      await refreshDashboard();
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not create the assignment."));
    }
  }

  async function openReviewQueue(assignment: Assignment) {
    try {
      const data = await submissionService.listForAssignment(
        session.token,
        assignment.id,
      );
      setSelectedAssignment(assignment);
      setSubmissions(data);
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not load submissions."));
    }
  }

  async function saveReview(event: FormEvent<HTMLFormElement>, submissionId: string) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);

    try {
      await submissionService.review(session.token, submissionId, {
        marks: getNumber(values, "marks"),
        feedback: getString(values, "feedback"),
        status: getString(values, "status"),
      });

      if (selectedAssignment) {
        await openReviewQueue(selectedAssignment);
      }
      notify("Review saved.");
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not save the review."));
    }
  }

  async function updateAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAssignment) return;

    const values = new FormData(event.currentTarget);
    try {
      await assignmentService.update(
        session.token,
        selectedAssignment.id,
        buildAssignmentPayload(values),
      );
      notify("Assignment updated.");
      setSelectedAssignment(null);
      setSubmissions([]);
      await refreshDashboard();
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not update the assignment."));
    }
  }

  async function deleteAssignment() {
    if (!selectedAssignment) return;
    if (!window.confirm(`Delete “${selectedAssignment.title}”?`)) return;

    try {
      await assignmentService.remove(session.token, selectedAssignment.id);
      notify("Assignment deleted.");
      setSelectedAssignment(null);
      setSubmissions([]);
      await refreshDashboard();
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not delete the assignment."));
    }
  }

  return (
    <>
      <section className="contentGrid" id="assignments">
        <div className="panel">
          <div className="panelTitle">
            <div>
              <span className="eyebrow">Your work</span>
              <h2>Assignments</h2>
            </div>
          </div>
          <div className="filterBar">
            <input
              type="search"
              placeholder="Search assignments"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search assignments"
            />
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as typeof visibility)}
              aria-label="Filter by publication status"
            >
              <option>All</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
          </div>
          <div className="assignmentList">
            {visibleAssignments.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                detail={assignment.isPublished ? "Published" : "Draft"}
                onClick={() => openReviewQueue(assignment)}
              />
            ))}
          </div>
        </div>

        <form className="panel formPanel" onSubmit={createAssignment}>
          <span className="eyebrow">Quick create</span>
          <h2>New assignment</h2>
          <label>
            Title
            <input name="title" required maxLength={200} />
          </label>
          <label>
            Subject
            <select name="subjectId" required>
              <option value="">Choose subject</option>
              {teacherSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <div className="fieldRow">
            <label>
              Deadline
              <input name="deadline" type="datetime-local" required />
            </label>
            <label>
              Maximum marks
              <input name="marks" type="number" min="1" defaultValue="100" required />
            </label>
          </div>
          <label>
            Description
            <textarea name="description" required maxLength={5000} />
          </label>
          <label className="check">
            <input name="published" type="checkbox" /> Publish immediately
          </label>
          <button className="primary">Create assignment</button>
        </form>
      </section>

      {selectedAssignment && (
        <section className="selectedWorkspace">
          <AssignmentEditor
            key={selectedAssignment.id}
            assignment={selectedAssignment}
            subjects={teacherSubjects}
            onSave={updateAssignment}
            onDelete={deleteAssignment}
          />
          <div className="panel reviewPanel" id="submissions">
            <div className="panelTitle">
              <div>
                <span className="eyebrow">Review queue</span>
                <h2>{selectedAssignment.title}</h2>
              </div>
              <span>{submissions.length} submissions</span>
            </div>

            {submissions.length === 0 ? (
              <p className="empty">No submissions yet.</p>
            ) : (
              submissions.map((submission) => (
                <article className="submission" key={submission.id}>
                  <div>
                    <strong>{submission.studentName}</strong>
                    <small>{new Date(submission.submittedAt).toLocaleString()}</small>
                    <p>{submission.answer}</p>
                  </div>
                  <form onSubmit={(event) => saveReview(event, submission.id)}>
                    <input
                      name="marks"
                      type="number"
                      min="0"
                      max={selectedAssignment.maximumMarks}
                      defaultValue={submission.marks}
                      placeholder={`Marks / ${selectedAssignment.maximumMarks}`}
                      required
                    />
                    <select name="status" defaultValue={submission.status}>
                      <option value="Submitted">Submitted</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Returned">Returned for revision</option>
                    </select>
                    <input
                      name="feedback"
                      defaultValue={submission.feedback}
                      placeholder="Feedback"
                    />
                    <button className="secondary">Save review</button>
                  </form>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </>
  );
}
