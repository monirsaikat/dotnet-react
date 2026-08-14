import type { SessionUser } from "@/types/domain";

interface SidebarProps {
  user: SessionUser;
  onSignOut: () => void;
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span>A</span>
        <strong>Assignly</strong>
      </div>

      <nav aria-label="Primary navigation">
        <a className="active" href="#overview">
          Overview
        </a>
        <a href="#assignments">Assignments</a>
        <a href="#submissions">
          {user.role === "Student" ? "My submissions" : "Submissions"}
        </a>
        {user.role === "Admin" && <a href="#administration">Administration</a>}
      </nav>

      <div className="profile">
        <div className="avatar">{user.fullName.charAt(0)}</div>
        <div>
          <strong>{user.fullName}</strong>
          <span>{user.role}</span>
        </div>
        <button onClick={onSignOut} aria-label="Sign out" title="Sign out">
          Exit
        </button>
      </div>
    </aside>
  );
}
