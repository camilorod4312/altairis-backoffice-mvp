namespace Altairis.Domain.Entities;

public sealed class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public int? HotelId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

    public Hotel? Hotel { get; set; }

    // Only used for HotelOwner multi-hotel assignments (many-to-many).
    public List<UserHotelAssignment> UserHotelAssignments { get; set; } = [];
}

