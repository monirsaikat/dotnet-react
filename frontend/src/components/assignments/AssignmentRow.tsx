import type { Assignment } from "@/types/domain";

interface AssignmentRowProps {
  assignment: Assignment;
  detail: string;
  onClick?: () => void;
}

export function AssignmentRow({ assignment, detail, onClick }: AssignmentRowProps) {
  const deadline = new Date(assignment.deadline);
  const content = (
    <>
      <span className="dateBox">
        {deadline.getDate()}
        <small>{deadline.toLocaleString("en", { month: "short" })}</small>
      </span>
      <span>
        <strong>{assignment.title}</strong>
        <small>
          {assignment.subjectName} · {assignment.courseName}
        </small>
      </span>
      <span className="status green">{detail}</span>
    </>
  );

  if (onClick) {
    return (
      <button className="assignmentRow" onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className="assignmentRow static">{content}</div>;
}
