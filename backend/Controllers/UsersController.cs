using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController, Route("api/users"), Authorize(Roles = "Admin")]
public class UsersController(ApplicationDbContext db, IPasswordHasher<User> hasher) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await db.Users.OrderBy(user => user.FullName)
        .Select(user => new { user.Id, user.FullName, user.Email, Role = user.Role.ToString(), user.IsActive, user.CourseId })
        .ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(user => user.Email == email)) return Conflict(new { message = "Email already exists." });
        if (request.Role == UserRole.Student && request.CourseId is null) return BadRequest(new { message = "Students must be assigned to a course." });
        if (request.CourseId is not null && !await db.Courses.AnyAsync(course => course.Id == request.CourseId)) return BadRequest(new { message = "Course not found." });

        var user = new User { FullName = request.FullName.Trim(), Email = email, PasswordHash = string.Empty, Role = request.Role, CourseId = request.Role == UserRole.Student ? request.CourseId : null };
        user.PasswordHash = hasher.HashPassword(user, request.Password);
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { user.Id }, new { user.Id, user.FullName, user.Email, Role = user.Role.ToString(), user.CourseId });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateUserRequest request)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        if (request.Role == UserRole.Student && request.CourseId is null) return BadRequest(new { message = "Students must be assigned to a course." });
        user.FullName = request.FullName.Trim(); user.Role = request.Role; user.CourseId = request.Role == UserRole.Student ? request.CourseId : null;
        user.IsActive = request.IsActive; user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
