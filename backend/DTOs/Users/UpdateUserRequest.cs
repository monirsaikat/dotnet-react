using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;

public class UpdateUserRequest
{
    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }

    public Guid? CourseId { get; set; }

    public bool IsActive { get; set; } = true;
}
