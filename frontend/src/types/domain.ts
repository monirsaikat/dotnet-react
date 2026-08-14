export type UserRole = "Admin" | "Teacher" | "Student";

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface Session {
  token: string;
  expiresAt: string;
  user: SessionUser;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  maximumMarks: number;
  isPublished: boolean;
  subjectId: string;
  subjectName: string;
  courseName: string;
  submissionCount: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  subjectName: string;
  courseName: string;
  maximumMarks: number;
  studentName: string;
  answer: string;
  status: string;
  marks?: number;
  feedback?: string;
  submittedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  courseId: string;
  courseName: string;
  teacherId?: string;
  teacherName?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  studentCount: number;
  subjectCount: number;
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  courseId?: string;
}
