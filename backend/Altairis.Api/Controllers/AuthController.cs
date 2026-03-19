using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Altairis.Api.Auth;
using Altairis.Domain.Entities;
using Altairis.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly AltairisDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AltairisDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and Password are required." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email && u.IsActive, ct);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var signingKey = _config["Auth:JwtSigningKey"];
        if (string.IsNullOrWhiteSpace(signingKey) || signingKey.Length < 16)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "JWT signing key is not configured." });
        }

        var issuer = _config["Auth:JwtIssuer"] ?? "Altairis.Backoffice";
        var audience = _config["Auth:JwtAudience"] ?? "Altairis.Backoffice";

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
        };

        // Tenant scope is derived from UserHotelAssignments.
        if (user.Role is UserRole.HotelOwner or UserRole.Ops)
        {
            var allowedHotelIds = await _db.UserHotelAssignments
                .AsNoTracking()
                .Where(a => a.UserId == user.Id)
                .Select(a => a.HotelId)
                .ToListAsync(ct);

            if (allowedHotelIds.Count > 0)
            {
                claims.Add(new Claim("hotelIds", string.Join(',', allowedHotelIds)));
            }
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                SecurityAlgorithms.HmacSha256));

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return Ok(new
        {
            accessToken = tokenString,
            // Keep backward compatibility with the frontend shape; hotelId is optional.
            user = new
            {
                user.Id,
                user.Email,
                role = user.Role.ToString(),
                hotelId = user.HotelId
            }
        });
    }
}

public sealed record LoginRequest(string Email, string Password);

