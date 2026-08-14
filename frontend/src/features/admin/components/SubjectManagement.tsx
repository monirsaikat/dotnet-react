import type { FormEvent } from "react";
import type { Course, Subject, UserSummary } from "@/types/domain";

interface SubjectManagementProps {
  subjects: Subject[];
  courses: Course[];
  teachers: UserSummary[];
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (subjectId: string, subjectName: string) => void;
}

export function SubjectManagement({
  subjects,
  courses,
  teachers,
  onCreate,
  onDelete,
}: SubjectManagementProps) {
  return (
    <section className="contentGrid">
      <div className="panel">
        <div className="panelTitle">
          <div>
            <span className="eyebrow">Teaching map</span>
            <h2>Subject directory</h2>
          </div>
          <span>{subjects.length} subjects</span>
        </div>
        {subjects.map((subject) => (
          <article className="courseRow managedRow" key={subject.id}>
            <div>
              <strong>
                {subject.name} · {subject.code}
              </strong>
              <small>
                {subject.courseName} · {subject.teacherName ?? "Teacher unassigned"}
              </small>
            </div>
            <button
              className="tableAction"
              type="button"
              onClick={() => onDelete(subject.id, subject.name)}
            >
              Delete
            </button>
          </article>
        ))}
      </div>

      <form className="panel formPanel" onSubmit={onCreate}>
        <span className="eyebrow">Academic structure</span>
        <h2>New subject</h2>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Code
          <input name="code" required maxLength={30} />
        </label>
        <label>
          Course
          <select name="courseId" required>
            <option value="">Choose course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Teacher
          <select name="teacherId">
            <option value="">Unassigned</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName}
              </option>
            ))}
          </select>
        </label>
        <button className="primary">Create subject</button>
      </form>
    </section>
  );
}
