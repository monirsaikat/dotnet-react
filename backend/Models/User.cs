namespace backend.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string FullName { get; set; }

    public required string Email { get; set; }

    public required string PasswordHash { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public UserRole Role { get; set; }

    public Guid? CourseId { get; set; }

    public Course? Course { get; set; }

    public ICollection<Subject> TaughtSubjects { get; set; } = [];

    public ICollection<Assignment> CreatedAssignments { get; set; } = [];

    public ICollection<Submission> Submissions { get; set; } = [];
}
