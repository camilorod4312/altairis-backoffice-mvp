namespace Altairis.Application.Dtos.Hotels;

public sealed record CreateHotelDto(
    string Name,
    string City,
    string Country,
    string? AddressLine1,
    string? PostalCode,
    bool? IsActive,
    IReadOnlyList<int>? OwnerUserIds);

