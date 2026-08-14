using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class AssignmentRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(5000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public Guid SubjectId { get; set; }

    [Required]
    public DateTime Deadline { get; set; }

    [Range(0.01, 100000)]
    public decimal MaximumMarks { get; set; }

    public bool IsPublished { get; set; }
}
