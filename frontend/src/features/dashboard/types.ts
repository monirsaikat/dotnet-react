import type { Assignment, Course, Session, Subject } from "@/types/domain";

export interface RoleDashboardProps {
  session: Session;
  assignments: Assignment[];
  subjects: Subject[];
  courses: Course[];
  refreshDashboard: () => Promise<void>;
  notify: (message: string) => void;
}
