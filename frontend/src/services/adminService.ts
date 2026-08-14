import { api } from "@/lib/api";
import type { UserRole, UserSummary } from "@/types/domain";

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: string;
  courseId: string | null;
}

export interface UpdateUserPayload {
  fullName: string;
  role: UserRole;
  courseId: string | null;
  isActive: boolean;
}

export interface CoursePayload {
  name: string;
  code: string;
  description: string;
}

export interface SubjectPayload {
  name: string;
  code: string;
  courseId: string;
  teacherId: string | null;
}

export const adminService = {
  listUsers(token: string) {
    return api<UserSummary[]>("/users", token);
  },

  createUser(token: string, payload: CreateUserPayload) {
    return api("/users", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUser(token: string, userId: string, payload: UpdateUserPayload) {
    return api(`/users/${userId}`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  createCourse(token: string, payload: CoursePayload) {
    return api("/courses", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteCourse(token: string, courseId: string) {
    return api(`/courses/${courseId}`, token, { method: "DELETE" });
  },

  createSubject(token: string, payload: SubjectPayload) {
    return api("/subjects", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteSubject(token: string, subjectId: string) {
    return api(`/subjects/${subjectId}`, token, { method: "DELETE" });
  },
};
