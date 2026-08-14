using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class DatabaseSeeder(ApplicationDbContext db, IPasswordHasher<User> hasher)
{
    public async Task SeedAsync()
    {
        var course = await db.Courses.SingleOrDefaultAsync(item => item.Code == "CSE-2026");
        if (course is null)
        {
            course = new Course
            {
                Name = "Computer Science - 2026",
                Code = "CSE-2026",
                Description = "Demo course"
            };
            db.Courses.Add(course);
        }

        var admin = await EnsureUserAsync(
            "Demo Admin",
            "admin@example.com",
            "Admin123!",
            UserRole.Admin
        );
        var teacher = await EnsureUserAsync(
            "Demo Teacher",
            "teacher@example.com",
            "Teacher123!",
            UserRole.Teacher
        );
        var student = await EnsureUserAsync(
            "Demo Student",
            "student@example.com",
            "Student123!",
            UserRole.Student,
            course
        );

        await db.SaveChangesAsync();

        var subject = await db.Subjects.SingleOrDefaultAsync(item =>
            item.CourseId == course.Id && item.Code == "CSE101"
        );
        if (subject is null)
        {
            subject = new Subject
            {
                Name = "Introduction to Programming",
                Code = "CSE101",
                Course = course,
                Teacher = teacher
            };
            db.Subjects.Add(subject);
        }
        else
        {
            subject.Teacher = teacher;
        }

        await db.SaveChangesAsync();

        var consoleAssignment = await EnsureAssignmentAsync(
            subject,
            teacher,
            "Build a small console application",
            "Create a documented console application and explain your design choices.",
            14,
            100
        );
        var apiAssignment = await EnsureAssignmentAsync(
            subject,
            teacher,
            "Design a REST API contract",
            "Model a small academic API, document its resources, and explain authorization decisions.",
            5,
            50
        );

        await db.SaveChangesAsync();

        await EnsureSubmissionAsync(
            consoleAssignment,
            student,
            "I built a layered console application with separate domain, service, and presentation concerns.",
            SubmissionStatus.Reviewed,
            86,
            "Strong separation of concerns. Add one more edge-case test."
        );
        await EnsureSubmissionAsync(
            apiAssignment,
            student,
            "The contract uses course-scoped resources, explicit DTOs, and role policies at every write endpoint.",
            SubmissionStatus.Submitted
        );

        await db.SaveChangesAsync();
    }

    private async Task<User> EnsureUserAsync(
        string fullName,
        string email,
        string password,
        UserRole role,
        Course? course = null
    )
    {
        var user = await db.Users.SingleOrDefaultAsync(item => item.Email == email);
        if (user is null)
        {
            user = new User
            {
                FullName = fullName,
                Email = email,
                PasswordHash = string.Empty,
                Role = role
            };
            db.Users.Add(user);
        }

        user.FullName = fullName;
        user.Role = role;
        user.IsActive = true;
        user.Course = role == UserRole.Student ? course : null;
        user.PasswordHash = hasher.HashPassword(user, password);
        return user;
    }

    private async Task<Assignment> EnsureAssignmentAsync(
        Subject subject,
        User teacher,
        string title,
        string description,
        int deadlineDays,
        decimal maximumMarks
    )
    {
        var assignment = await db.Assignments.SingleOrDefaultAsync(item =>
            item.SubjectId == subject.Id && item.Title == title
        );
        if (assignment is null)
        {
            assignment = new Assignment
            {
                Title = title,
                Description = description,
                Deadline = DateTime.UtcNow.AddDays(deadlineDays),
                MaximumMarks = maximumMarks,
                IsPublished = true,
                Subject = subject,
                Teacher = teacher
            };
            db.Assignments.Add(assignment);
        }

        return assignment;
    }

    private async Task EnsureSubmissionAsync(
        Assignment assignment,
        User student,
        string answer,
        SubmissionStatus status,
        decimal? marks = null,
        string? feedback = null
    )
    {
        var exists = await db.Submissions.AnyAsync(item =>
            item.AssignmentId == assignment.Id && item.StudentId == student.Id
        );
        if (exists)
        {
            return;
        }

        db.Submissions.Add(new Submission
        {
            Assignment = assignment,
            Student = student,
            Answer = answer,
            Status = status,
            Marks = marks,
            Feedback = feedback,
            ReviewedAt = status == SubmissionStatus.Reviewed ? DateTime.UtcNow : null
        });
    }
}
