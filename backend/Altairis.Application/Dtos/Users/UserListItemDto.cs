namespace Altairis.Application.Dtos.Users;

using Altairis.Domain.Entities;

public sealed record UserListItemDto(
    int Id,
    string Email,
    UserRole Role,
    IReadOnlyList<int> HotelIds,
    bool IsActive,
    DateTime CreatedUtc);

