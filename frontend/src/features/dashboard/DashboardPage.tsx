"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FocusBanner } from "@/components/dashboard/FocusBanner";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { Sidebar } from "@/components/layout/Sidebar";
import { getErrorMessage } from "@/lib/errors";
import { dashboardService } from "@/services/dashboardService";
import type { Assignment, Course, Session, Subject } from "@/types/domain";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { StudentDashboard } from "@/features/student/StudentDashboard";
import { TeacherDashboard } from "@/features/teacher/TeacherDashboard";

interface DashboardPageProps {
  session: Session;
  onSignOut: () => void;
}

export function DashboardPage({ session, onSignOut }: DashboardPageProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await dashboardService.getData(session.token);
      setAssignments(data.assignments);
      setSubjects(data.subjects);
      setCourses(data.courses);
    } catch (requestError) {
      setMessage(getErrorMessage(requestError, "Unable to load the dashboard."));
    }
  }, [session.token]);

  useEffect(() => {
    void refreshDashboard();
  }, [refreshDashboard]);

  const upcomingCount = assignments.filter(
    (assignment) => new Date(assignment.deadline) > new Date(),
  ).length;

  const roleProps = {
    session,
    assignments,
    subjects,
    courses,
    refreshDashboard,
    notify: setMessage,
  };

  return (
    <div className="appShell">
      <Sidebar user={session.user} onSignOut={onSignOut} />
      <main className="workspace">
        <div id="overview">
          <DashboardHeader user={session.user} />
        </div>
        {message && <div className="alert">{message}</div>}
        <FocusBanner role={session.user.role} assignments={assignments} />
        <StatsGrid
          assignmentCount={assignments.length}
          upcomingCount={upcomingCount}
          courseCount={courses.length}
        />

        {session.user.role === "Teacher" && <TeacherDashboard {...roleProps} />}
        {session.user.role === "Student" && <StudentDashboard {...roleProps} />}
        {session.user.role === "Admin" && <AdminDashboard {...roleProps} />}
      </main>
    </div>
  );
}
