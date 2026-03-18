namespace Altairis.Application.Dtos.Hotels;

public sealed record HotelListItemDto(
    int Id,
    string Name,
    string City,
    string Country,
    bool IsActive);

