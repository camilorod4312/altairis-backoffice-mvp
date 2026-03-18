namespace Altairis.Application.Dtos.RoomTypes;

public sealed record RoomTypeDto(
    int Id,
    int HotelId,
    string Code,
    string Name,
    int MaxOccupancy);

