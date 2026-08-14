using backend.Models;
using backend.Services;

namespace backend.Tests;

public class SubmissionWorkflowTests
{
    private static (Assignment Assignment, User Student) Scenario()
    {
        var course = new Course { Name = "Course", Code = "C1" };
        var subject = new Subject { Name = "Subject", Code = "S1", Course = course, CourseId = course.Id };
        var teacher = new User { FullName = "Teacher", Email = "t@example.com", PasswordHash = "x", Role = UserRole.Teacher };
        var assignment = new Assignment { Title = "A", Description = "D", Deadline = DateTime.UtcNow.AddHours(1), MaximumMarks = 100, IsPublished = true, Subject = subject, Teacher = teacher };
        var student = new User { FullName = "Student", Email = "s@example.com", PasswordHash = "x", Role = UserRole.Student, CourseId = course.Id };
        return (assignment, student);
    }

    [Fact]
    public void StudentInCourseCanSubmitPublishedAssignmentBeforeDeadline()
    {
        var (assignment, student) = Scenario();
        Assert.True(SubmissionWorkflow.CanSubmit(assignment, student, DateTime.UtcNow));
    }

    [Fact]
    public void SubmissionIsRejectedAfterDeadline()
    {
        var (assignment, student) = Scenario();
        Assert.False(SubmissionWorkflow.CanSubmit(assignment, student, assignment.Deadline.AddSeconds(1)));
    }

    [Fact]
    public void DraftAssignmentCannotReceiveSubmissions()
    {
        var (assignment, student) = Scenario();
        assignment.IsPublished = false;

        Assert.False(SubmissionWorkflow.CanSubmit(assignment, student, DateTime.UtcNow));
    }

    [Fact]
    public void StudentFromAnotherCourseCannotSubmit()
    {
        var (assignment, student) = Scenario(); student.CourseId = Guid.NewGuid();
        Assert.False(SubmissionWorkflow.CanSubmit(assignment, student, DateTime.UtcNow));
    }

    [Theory]
    [InlineData(0, true)]
    [InlineData(100, true)]
    [InlineData(-1, false)]
    [InlineData(101, false)]
    public void MarksMustBeWithinAssignmentMaximum(decimal marks, bool expected)
    {
        var (assignment, _) = Scenario();
        Assert.Equal(expected, SubmissionWorkflow.MarksAreValid(assignment, marks));
    }
}
