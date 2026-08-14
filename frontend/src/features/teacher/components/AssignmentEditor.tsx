import type { FormEvent } from "react";
import type { Assignment, Subject } from "@/types/domain";

interface AssignmentEditorProps {
  assignment: Assignment;
  subjects: Subject[];
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
}

function toLocalInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function AssignmentEditor({
  assignment,
  subjects,
  onSave,
  onDelete,
}: AssignmentEditorProps) {
  return (
    <form className="panel formPanel editorPanel" onSubmit={onSave}>
      <div className="panelTitle">
        <div>
          <span className="eyebrow">Assignment studio</span>
          <h2>Edit & publish</h2>
        </div>
        <span className={assignment.isPublished ? "status green" : "status"}>
          {assignment.isPublished ? "Published" : "Draft"}
        </span>
      </div>
      <label>
        Title
        <input name="title" defaultValue={assignment.title} required maxLength={200} />
      </label>
      <label>
        Subject
        <select name="subjectId" defaultValue={assignment.subjectId} required>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>
      <div className="fieldRow">
        <label>
          Deadline
          <input
            name="deadline"
            type="datetime-local"
            defaultValue={toLocalInputValue(assignment.deadline)}
            required
          />
        </label>
        <label>
          Maximum marks
          <input
            name="marks"
            type="number"
            min="1"
            defaultValue={assignment.maximumMarks}
            required
          />
        </label>
      </div>
      <label>
        Description
        <textarea
          name="description"
          defaultValue={assignment.description}
          required
          maxLength={5000}
        />
      </label>
      <label className="check">
        <input name="published" type="checkbox" defaultChecked={assignment.isPublished} />{" "}
        Published and visible to students
      </label>
      <div className="formActions">
        <button className="primary">Save changes</button>
        <button className="dangerButton" type="button" onClick={onDelete}>
          Delete assignment
        </button>
      </div>
    </form>
  );
}
