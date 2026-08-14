using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Controllers;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

public class AuthorizationTests
{
    [Fact]
    public void JwtContainsRoleAndUserIdentifierClaims()
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "a-test-key-that-is-longer-than-thirty-two-characters",
            ["Jwt:Issuer"] = "tests",
            ["Jwt:Audience"] = "tests"
        }).Build();
        var user = new User { FullName = "Teacher", Email = "teacher@example.com", PasswordHash = "x", Role = UserRole.Teacher };

        var result = new JwtTokenService(configuration).GenerateToken(user);
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(result.Token).Claims.ToList();

        Assert.Contains(claims, claim => claim.Type == ClaimTypes.Role && claim.Value == "Teacher");
        Assert.Contains(claims, claim => claim.Type == ClaimTypes.NameIdentifier && claim.Value == user.Id.ToString());
    }

    [Fact]
    public void UserManagementIsAdminOnly()
    {
        var attribute = Assert.Single(typeof(UsersController).GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>());
        Assert.Equal("Admin", attribute.Roles);
    }

    [Fact]
    public void AssignmentCreationIsTeacherOnly()
    {
        var method = typeof(AssignmentsController).GetMethod(nameof(AssignmentsController.Create))!;
        var attribute = Assert.Single(method.GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>());
        Assert.Equal("Teacher", attribute.Roles);
    }

    [Fact]
    public void ViewingAllSubmissionsIsAdminOnly()
    {
        var method = typeof(SubmissionsController).GetMethod(nameof(SubmissionsController.GetAll))!;
        var attribute = Assert.Single(
            method.GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>()
        );

        Assert.Equal("Admin", attribute.Roles);
    }

    [Fact]
    public void SubjectDeletionIsAdminOnly()
    {
        var method = typeof(SubjectsController).GetMethod(nameof(SubjectsController.Delete))!;
        var attribute = Assert.Single(
            method.GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>()
        );

        Assert.Equal("Admin", attribute.Roles);
    }
}
