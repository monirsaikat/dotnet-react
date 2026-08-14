using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController, Route("api/subjects"), Authorize]
public class SubjectsController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await db.Subjects.OrderBy(subject => subject.Name)
        .Select(subject => new { subject.Id, subject.Name, subject.Code, subject.CourseId, CourseName = subject.Course.Name, subject.TeacherId, TeacherName = subject.Teacher == null ? null : subject.Teacher.FullName })
        .ToListAsync());

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(SubjectRequest request)
    {
        var validation = await ValidateReferences(request); if (validation is not null) return validation;
        var subject = new Subject { Name = request.Name.Trim(), Code = request.Code.Trim().ToUpperInvariant(), CourseId = request.CourseId, TeacherId = request.TeacherId };
        db.Subjects.Add(subject); await db.SaveChangesAsync(); return CreatedAtAction(nameof(GetAll), new { subject.Id }, subject);
    }

    [HttpPut("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, SubjectRequest request)
    {
        var subject = await db.Subjects.FindAsync(id); if (subject is null) return NotFound();
        var validation = await ValidateReferences(request); if (validation is not null) return validation;
        subject.Name = request.Name.Trim(); subject.Code = request.Code.Trim().ToUpperInvariant(); subject.CourseId = request.CourseId; subject.TeacherId = request.TeacherId;
        await db.SaveChangesAsync(); return NoContent();
    }

    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var subject = await db.Subjects
            .Include(item => item.Assignments)
            .SingleOrDefaultAsync(item => item.Id == id);

        if (subject is null)
        {
            return NotFound();
        }

        if (subject.Assignments.Count > 0)
        {
            return Conflict(new
            {
                message = "A subject with assignments cannot be deleted."
            });
        }

        db.Subjects.Remove(subject);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<IActionResult?> ValidateReferences(SubjectRequest request)
    {
        if (!await db.Courses.AnyAsync(course => course.Id == request.CourseId)) return BadRequest(new { message = "Course not found." });
        if (request.TeacherId is not null && !await db.Users.AnyAsync(user => user.Id == request.TeacherId && user.Role == UserRole.Teacher && user.IsActive)) return BadRequest(new { message = "Active teacher not found." });
        return null;
    }
}
