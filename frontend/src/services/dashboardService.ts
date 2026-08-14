import { api } from "@/lib/api";
import type { Assignment, Course, Subject } from "@/types/domain";

export interface DashboardData {
  assignments: Assignment[];
  subjects: Subject[];
  courses: Course[];
}

export const dashboardService = {
  async getData(token: string): Promise<DashboardData> {
    const [assignments, subjects, courses] = await Promise.all([
      api<Assignment[]>("/assignments", token),
      api<Subject[]>("/subjects", token),
      api<Course[]>("/courses", token),
    ]);

    return { assignments, subjects, courses };
  },
};
