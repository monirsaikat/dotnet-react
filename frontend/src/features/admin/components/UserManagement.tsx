import type { FormEvent } from "react";
import type { Course, UserSummary } from "@/types/domain";

interface UserManagementProps {
  users: UserSummary[];
  courses: Course[];
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onToggle: (user: UserSummary) => void;
}

export function UserManagement({
  users,
  courses,
  onCreate,
  onToggle,
}: UserManagementProps) {
  return (
    <section className="contentGrid">
      <div className="panel">
        <div className="panelTitle">
          <div>
            <span className="eyebrow">People</span>
            <h2>User directory</h2>
          </div>
          <span>{users.length} users</span>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.fullName}</strong>
                    <small>{user.email}</small>
                  </td>
                  <td>
                    <button
                      className="tableAction"
                      type="button"
                      onClick={() => onToggle(user)}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                  <td>{user.role}</td>
                  <td>
                    <span className={user.isActive ? "status green" : "status"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <form className="panel formPanel" onSubmit={onCreate}>
        <span className="eyebrow">Administration</span>
        <h2>Add user</h2>
        <label>
          Full name
          <input name="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Temporary password
          <input name="password" type="password" minLength={8} required />
        </label>
        <div className="fieldRow">
          <label>
            Role
            <select name="role">
              <option>Student</option>
              <option>Teacher</option>
              <option>Admin</option>
            </select>
          </label>
          <label>
            Student course
            <select name="courseId">
              <option value="">None</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="primary">Create user</button>
      </form>
    </section>
  );
}
