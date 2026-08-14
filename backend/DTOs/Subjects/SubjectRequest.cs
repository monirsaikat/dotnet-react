using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class SubjectRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Code { get; set; } = string.Empty;

    [Required]
    public Guid CourseId { get; set; }

    public Guid? TeacherId { get; set; }
}
