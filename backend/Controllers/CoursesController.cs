using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController, Route("api/courses"), Authorize]
public class CoursesController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await db.Courses.OrderBy(course => course.Name)
        .Select(course => new { course.Id, course.Name, course.Code, course.Description, StudentCount = course.Students.Count, SubjectCount = course.Subjects.Count })
        .ToListAsync());

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CourseRequest request)
    {
        var course = new Course { Name = request.Name.Trim(), Code = request.Code.Trim().ToUpperInvariant(), Description = request.Description?.Trim() };
        db.Courses.Add(course); await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { course.Id }, course);
    }

    [HttpPut("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, CourseRequest request)
    {
        var course = await db.Courses.FindAsync(id); if (course is null) return NotFound();
        course.Name = request.Name.Trim(); course.Code = request.Code.Trim().ToUpperInvariant(); course.Description = request.Description?.Trim();
        await db.SaveChangesAsync(); return NoContent();
    }

    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var course = await db.Courses.Include(item => item.Subjects).Include(item => item.Students).SingleOrDefaultAsync(item => item.Id == id);
        if (course is null) return NotFound();
        if (course.Subjects.Count > 0 || course.Students.Count > 0) return Conflict(new { message = "A course with subjects or students cannot be deleted." });
        db.Courses.Remove(course); await db.SaveChangesAsync(); return NoContent();
    }
}
