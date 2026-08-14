import { api } from "@/lib/api";
import type { Submission } from "@/types/domain";

export interface ReviewPayload {
  marks: number;
  feedback: string;
  status: string;
}

export const submissionService = {
  listAll(token: string) {
    return api<Submission[]>("/submissions", token);
  },

  listMine(token: string) {
    return api<Submission[]>("/submissions/mine", token);
  },

  listForAssignment(token: string, assignmentId: string) {
    return api<Submission[]>(`/submissions/assignment/${assignmentId}`, token);
  },

  saveAnswer(token: string, assignmentId: string, answer: string) {
    return api(`/submissions/assignment/${assignmentId}`, token, {
      method: "PUT",
      body: JSON.stringify({ answer }),
    });
  },

  review(token: string, submissionId: string, payload: ReviewPayload) {
    return api(`/submissions/${submissionId}/review`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
