namespace backend.DTOs;

public class AuthResponse
{
    public required string Token { get; set; }

    public required DateTime ExpiresAt { get; set; }

    public required UserResponse User { get; set; }
}
