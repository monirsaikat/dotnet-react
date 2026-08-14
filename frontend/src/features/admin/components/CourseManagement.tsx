import type { FormEvent } from "react";
import type { Course } from "@/types/domain";

interface CourseManagementProps {
  courses: Course[];
  subjectCount: number;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (courseId: string, courseName: string) => void;
}

export function CourseManagement({
  courses,
  subjectCount,
  onCreate,
  onDelete,
}: CourseManagementProps) {
  return (
    <section className="contentGrid">
      <div className="panel">
        <div className="panelTitle">
          <div>
            <span className="eyebrow">Academic structure</span>
            <h2>Courses</h2>
          </div>
        </div>
        {courses.map((course) => (
          <article className="courseRow managedRow" key={course.id}>
            <div>
              <strong>{course.name}</strong>
              <small>
                {course.code} · {course.studentCount} students · {course.subjectCount}{" "}
                subjects
              </small>
            </div>
            <button
              className="tableAction"
              type="button"
              onClick={() => onDelete(course.id, course.name)}
            >
              Delete
            </button>
          </article>
        ))}
        <p className="muted">{subjectCount} subjects configured in total.</p>
      </div>

      <form className="panel formPanel" onSubmit={onCreate}>
        <span className="eyebrow">Quick create</span>
        <h2>New course</h2>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Code
          <input name="code" required maxLength={30} />
        </label>
        <label>
          Description
          <textarea name="description" />
        </label>
        <button className="primary">Create course</button>
      </form>
    </section>
  );
}
