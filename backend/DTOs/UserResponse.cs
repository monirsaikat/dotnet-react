namespace backend.DTOs;

public class UserResponse
{
    public Guid Id { get; set; }

    public required string FullName { get; set; }

    public required string Email { get; set; }

    public required string Role { get; set; }
}
