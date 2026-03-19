namespace Altairis.Application.Dtos.Users;

using Altairis.Domain.Entities;

public sealed record UpsertUserDto(
    string Email,
    UserRole Role,
    IReadOnlyList<int>? HotelIds,
    string? Password,
    bool? IsActive);

