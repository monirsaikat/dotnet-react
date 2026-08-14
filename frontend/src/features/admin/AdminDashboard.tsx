"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { getString } from "@/lib/formData";
import { adminService } from "@/services/adminService";
import { submissionService } from "@/services/submissionService";
import type { Submission, UserSummary } from "@/types/domain";
import type { RoleDashboardProps } from "@/features/dashboard/types";
import { AssignmentOverview } from "./components/AssignmentOverview";
import { CourseManagement } from "./components/CourseManagement";
import { SubjectManagement } from "./components/SubjectManagement";
import { UserManagement } from "./components/UserManagement";
import { SubmissionOverview } from "./components/SubmissionOverview";

export function AdminDashboard(props: RoleDashboardProps) {
  const { session, refreshDashboard, notify } = props;
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const loadAdminData = useCallback(async () => {
    try {
      const [userData, submissionData] = await Promise.all([
        adminService.listUsers(session.token),
        submissionService.listAll(session.token),
      ]);
      setUsers(userData);
      setSubmissions(submissionData);
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not load administration data."));
    }
  }, [notify, session.token]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const role = String(values.get("role"));

    try {
      await adminService.createUser(session.token, {
        fullName: getString(values, "name"),
        email: getString(values, "email"),
        password: getString(values, "password"),
        role,
        courseId: role === "Student" ? getString(values, "courseId") : null,
      });
      form.reset();
      await loadAdminData();
      notify("User created.");
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not create the user."));
    }
  }

  async function toggleUser(user: UserSummary) {
    try {
      await adminService.updateUser(session.token, user.id, {
        fullName: user.fullName,
        role: user.role,
        courseId: user.courseId ?? null,
        isActive: !user.isActive,
      });
      await loadAdminData();
      notify(`${user.fullName} is now ${user.isActive ? "inactive" : "active"}.`);
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not update the user."));
    }
  }

  async function deleteCourse(courseId: string, courseName: string) {
    if (!window.confirm(`Delete course “${courseName}”?`)) return;
    try {
      await adminService.deleteCourse(session.token, courseId);
      await refreshDashboard();
      notify("Course deleted.");
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not delete the course."));
    }
  }

  async function deleteSubject(subjectId: string, subjectName: string) {
    if (!window.confirm(`Delete subject “${subjectName}”?`)) return;
    try {
      await adminService.deleteSubject(session.token, subjectId);
      await refreshDashboard();
      notify("Subject deleted.");
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not delete the subject."));
    }
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      await adminService.createCourse(session.token, {
        name: getString(values, "name"),
        code: getString(values, "code"),
        description: getString(values, "description"),
      });
      form.reset();
      await refreshDashboard();
      notify("Course created.");
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not create the course."));
    }
  }

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      await adminService.createSubject(session.token, {
        name: getString(values, "name"),
        code: getString(values, "code"),
        courseId: getString(values, "courseId"),
        teacherId: getString(values, "teacherId") || null,
      });
      form.reset();
      await refreshDashboard();
      notify("Subject created and assigned.");
    } catch (requestError) {
      notify(getErrorMessage(requestError, "Could not create the subject."));
    }
  }

  return (
    <>
      <div id="administration">
        <UserManagement
          users={users}
          courses={props.courses}
          onCreate={createUser}
          onToggle={toggleUser}
        />
      </div>
      <CourseManagement
        courses={props.courses}
        subjectCount={props.subjects.length}
        onCreate={createCourse}
        onDelete={deleteCourse}
      />
      <SubjectManagement
        subjects={props.subjects}
        courses={props.courses}
        teachers={users.filter((user) => user.role === "Teacher" && user.isActive)}
        onCreate={createSubject}
        onDelete={deleteSubject}
      />
      <div id="assignments">
        <AssignmentOverview assignments={props.assignments} />
      </div>
      <div id="submissions">
        <SubmissionOverview submissions={submissions} />
      </div>
    </>
  );
}
