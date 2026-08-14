using backend.Models;

namespace backend.Services;

public static class SubmissionWorkflow
{
    public static bool CanSubmit(Assignment assignment, User student, DateTime now) =>
        assignment.IsPublished &&
        assignment.Deadline > now &&
        student.Role == UserRole.Student &&
        student.CourseId == assignment.Subject.CourseId;

    public static bool MarksAreValid(Assignment assignment, decimal marks) =>
        marks >= 0 && marks <= assignment.MaximumMarks;
}
