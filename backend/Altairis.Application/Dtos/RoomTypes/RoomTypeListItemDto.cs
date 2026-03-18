namespace Altairis.Application.Dtos.RoomTypes;

public sealed record RoomTypeListItemDto(
    int Id,
    int HotelId,
    string Code,
    string Name,
    int MaxOccupancy);

