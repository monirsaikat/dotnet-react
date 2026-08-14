using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController, Route("api/submissions"), Authorize]
public class SubmissionsController(
    ApplicationDbContext db,
    ILogger<SubmissionsController> logger
) : ControllerBase
{
    [HttpGet, Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var submissions = await Project(
                db.Submissions.OrderByDescending(item => item.SubmittedAt)
            )
            .ToListAsync();

        return Ok(submissions);
    }

    [HttpGet("mine"), Authorize(Roles = "Student")]
    public async Task<IActionResult> Mine()
    {
        var studentId = User.CurrentUserId();
        var query = db.Submissions
            .Where(item => item.StudentId == studentId)
            .OrderByDescending(item => item.SubmittedAt);

        return Ok(await Project(query).ToListAsync());
    }

    [HttpGet("assignment/{assignmentId:guid}"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> ForAssignment(Guid assignmentId)
    {
        if (User.IsInRole(nameof(UserRole.Teacher)) && !await db.Assignments.AnyAsync(item => item.Id == assignmentId && item.TeacherId == User.CurrentUserId())) return Forbid();
        var query = db.Submissions
            .Where(item => item.AssignmentId == assignmentId)
            .OrderBy(item => item.Student.FullName);

        return Ok(await Project(query).ToListAsync());
    }

    [HttpPut("assignment/{assignmentId:guid}"), Authorize(Roles = "Student")]
    public async Task<IActionResult> Submit(Guid assignmentId, SubmitAssignmentRequest request)
    {
        var studentId = User.CurrentUserId();
        var student = await db.Users.SingleAsync(user => user.Id == studentId);
        var assignment = await db.Assignments.Include(item => item.Subject).SingleOrDefaultAsync(item => item.Id == assignmentId);
        if (assignment is null) return NotFound();
        if (!SubmissionWorkflow.CanSubmit(assignment, student, DateTime.UtcNow)) return BadRequest(new { message = "This assignment is unavailable or its deadline has passed." });

        var submission = await db.Submissions.SingleOrDefaultAsync(item => item.AssignmentId == assignmentId && item.StudentId == studentId);
        if (submission is null)
        {
            submission = new Submission { AssignmentId = assignmentId, StudentId = studentId, Answer = request.Answer.Trim() };
            db.Submissions.Add(submission);
        }
        else
        {
            submission.Answer = request.Answer.Trim(); submission.Status = SubmissionStatus.Submitted; submission.UpdatedAt = DateTime.UtcNow;
            submission.Marks = null; submission.Feedback = null; submission.ReviewedAt = null;
        }
        await db.SaveChangesAsync();
        logger.LogInformation(
            "Student {StudentId} saved submission {SubmissionId} for assignment {AssignmentId}",
            studentId,
            submission.Id,
            assignmentId
        );
        return Ok(new { submission.Id, Status = submission.Status.ToString() });
    }

    [HttpPut("{id:guid}/review"), Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Review(Guid id, ReviewSubmissionRequest request)
    {
        var submission = await db.Submissions.Include(item => item.Assignment).SingleOrDefaultAsync(item => item.Id == id);
        if (submission is null) return NotFound();
        if (User.IsInRole(nameof(UserRole.Teacher)) && submission.Assignment.TeacherId != User.CurrentUserId()) return Forbid();
        if (!SubmissionWorkflow.MarksAreValid(submission.Assignment, request.Marks)) return BadRequest(new { message = $"Marks must be between 0 and {submission.Assignment.MaximumMarks}." });
        submission.Marks = request.Marks; submission.Feedback = request.Feedback?.Trim(); submission.Status = request.Status;
        submission.ReviewedAt = DateTime.UtcNow; submission.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        logger.LogInformation(
            "Submission {SubmissionId} reviewed with status {Status} by user {ReviewerId}",
            submission.Id,
            submission.Status,
            User.CurrentUserId()
        );
        return NoContent();
    }

    private static IQueryable<SubmissionView> Project(IQueryable<Submission> query) => query.Select(item => new SubmissionView(
        item.Id, item.AssignmentId, item.Assignment.Title, item.Assignment.Subject.Name,
        item.Assignment.Subject.Course.Name, item.Assignment.MaximumMarks, item.StudentId,
        item.Student.FullName, item.Answer, item.Status.ToString(), item.Marks, item.Feedback,
        item.SubmittedAt, item.UpdatedAt, item.ReviewedAt));

    public record SubmissionView(
        Guid Id,
        Guid AssignmentId,
        string AssignmentTitle,
        string SubjectName,
        string CourseName,
        decimal MaximumMarks,
        Guid StudentId,
        string StudentName,
        string Answer,
        string Status,
        decimal? Marks,
        string? Feedback,
        DateTime SubmittedAt,
        DateTime? UpdatedAt,
        DateTime? ReviewedAt
    );
}
