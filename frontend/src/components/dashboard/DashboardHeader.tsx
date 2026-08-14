import type { SessionUser } from "@/types/domain";

interface DashboardHeaderProps {
  user: SessionUser;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header>
      <div>
        <span className="eyebrow">{dateLabel}</span>
        <h1>Good to see you, {user.fullName.split(" ")[0]}.</h1>
      </div>
      <span className="rolePill">{user.role} workspace</span>
    </header>
  );
}
