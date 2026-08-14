using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;

public class ReviewSubmissionRequest
{
    [Range(0, 100000)]
    public decimal Marks { get; set; }

    [MaxLength(3000)]
    public string? Feedback { get; set; }

    public SubmissionStatus Status { get; set; } = SubmissionStatus.Reviewed;
}
