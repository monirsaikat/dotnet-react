import { api } from "@/lib/api";

export interface AssignmentPayload {
  title: string;
  description: string;
  subjectId: string;
  deadline: string;
  maximumMarks: number;
  isPublished: boolean;
}

export const assignmentService = {
  create(token: string, payload: AssignmentPayload) {
    return api("/assignments", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(token: string, assignmentId: string, payload: AssignmentPayload) {
    return api(`/assignments/${assignmentId}`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove(token: string, assignmentId: string) {
    return api(`/assignments/${assignmentId}`, token, { method: "DELETE" });
  },
};
