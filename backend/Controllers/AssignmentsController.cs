using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController, Route("api/assignments"), Authorize]
public class AssignmentsController(
    ApplicationDbContext db,
    ILogger<AssignmentsController> logger
) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.CurrentUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var query = db.Assignments.AsNoTracking();
        if (role == nameof(UserRole.Teacher)) query = query.Where(item => item.TeacherId == userId);
        if (role == nameof(UserRole.Student))
        {
            var courseId = await db.Users.Where(user => user.Id == userId).Select(user => user.CourseId).SingleAsync();
            query = query.Where(item => item.IsPublished && item.Subject.CourseId == courseId);
        }
        return Ok(await Project(query.OrderBy(item => item.Deadline)).ToListAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var userId = User.CurrentUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var query = db.Assignments.Where(item => item.Id == id);
        if (role == nameof(UserRole.Teacher)) query = query.Where(item => item.TeacherId == userId);
        if (role == nameof(UserRole.Student))
        {
            var courseId = await db.Users.Where(user => user.Id == userId).Select(user => user.CourseId).SingleAsync();
            query = query.Where(item => item.IsPublished && item.Subject.CourseId == courseId);
        }
        var assignment = await Project(query).SingleOrDefaultAsync();
        return assignment is null ? NotFound() : Ok(assignment);
    }

    [HttpPost, Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Create(AssignmentRequest request)
    {
        var teacherId = User.CurrentUserId();
        var subject = await db.Subjects.SingleOrDefaultAsync(item => item.Id == request.SubjectId && item.TeacherId == teacherId);
        if (subject is null) return BadRequest(new { message = "You are not assigned to this subject." });
        if (request.Deadline <= DateTime.UtcNow) return BadRequest(new { message = "Deadline must be in the future." });
        var assignment = new Assignment { Title = request.Title.Trim(), Description = request.Description.Trim(), SubjectId = request.SubjectId, TeacherId = teacherId, Deadline = request.Deadline.ToUniversalTime(), MaximumMarks = request.MaximumMarks, IsPublished = request.IsPublished };
        db.Assignments.Add(assignment);
        await db.SaveChangesAsync();
        logger.LogInformation(
            "Teacher {TeacherId} created assignment {AssignmentId} with published={IsPublished}",
            teacherId,
            assignment.Id,
            assignment.IsPublished
        );
        return CreatedAtAction(nameof(Get), new { id = assignment.Id }, new { assignment.Id });
    }

    [HttpPut("{id:guid}"), Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Update(Guid id, AssignmentRequest request)
    {
        var teacherId = User.CurrentUserId();
        var assignment = await db.Assignments.SingleOrDefaultAsync(item => item.Id == id && item.TeacherId == teacherId);
        if (assignment is null) return NotFound();
        if (!await db.Subjects.AnyAsync(item => item.Id == request.SubjectId && item.TeacherId == teacherId)) return BadRequest(new { message = "You are not assigned to this subject." });
        if (request.Deadline <= DateTime.UtcNow) return BadRequest(new { message = "Deadline must be in the future." });
        assignment.Title = request.Title.Trim(); assignment.Description = request.Description.Trim(); assignment.SubjectId = request.SubjectId;
        assignment.Deadline = request.Deadline.ToUniversalTime(); assignment.MaximumMarks = request.MaximumMarks; assignment.IsPublished = request.IsPublished; assignment.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        logger.LogInformation(
            "Teacher {TeacherId} updated assignment {AssignmentId}",
            teacherId,
            assignment.Id
        );
        return NoContent();
    }

    [HttpDelete("{id:guid}"), Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var teacherId = User.CurrentUserId();
        var assignment = await db.Assignments.Include(item => item.Submissions).SingleOrDefaultAsync(item => item.Id == id && item.TeacherId == teacherId);
        if (assignment is null) return NotFound();
        if (assignment.Submissions.Count > 0) return Conflict(new { message = "Assignments with submissions cannot be deleted." });
        db.Assignments.Remove(assignment);
        await db.SaveChangesAsync();
        logger.LogInformation(
            "Teacher {TeacherId} deleted assignment {AssignmentId}",
            teacherId,
            assignment.Id
        );
        return NoContent();
    }

    private static IQueryable<AssignmentView> Project(IQueryable<Assignment> query) => query.Select(item => new AssignmentView(
        item.Id, item.Title, item.Description, item.Deadline, item.MaximumMarks, item.IsPublished,
        item.SubjectId, item.Subject.Name, item.Subject.CourseId, item.Subject.Course.Name,
        item.TeacherId, item.Teacher.FullName, item.Submissions.Count));

    public record AssignmentView(Guid Id, string Title, string Description, DateTime Deadline, decimal MaximumMarks,
        bool IsPublished, Guid SubjectId, string SubjectName, Guid CourseId, string CourseName,
        Guid TeacherId, string TeacherName, int SubmissionCount);
}
