namespace Altairis.Application.Dtos.Users;

using Altairis.Domain.Entities;

public sealed record UserDto(
    int Id,
    string Email,
    UserRole Role,
    IReadOnlyList<int> HotelIds,
    bool IsActive,
    DateTime CreatedUtc);

