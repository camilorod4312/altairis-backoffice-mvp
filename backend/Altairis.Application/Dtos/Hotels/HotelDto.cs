namespace Altairis.Application.Dtos.Hotels;

public sealed record HotelDto(
    int Id,
    string Name,
    string City,
    string Country,
    string? AddressLine1,
    string? PostalCode,
    bool IsActive,
    DateTime CreatedUtc);

