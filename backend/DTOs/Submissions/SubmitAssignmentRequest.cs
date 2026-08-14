using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class SubmitAssignmentRequest
{
    [Required]
    [MaxLength(10000)]
    public string Answer { get; set; } = string.Empty;
}
