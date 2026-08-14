namespace backend.Models;

public class Course
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Code { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<User> Students { get; set; } = [];
    public ICollection<Subject> Subjects { get; set; } = [];
}
